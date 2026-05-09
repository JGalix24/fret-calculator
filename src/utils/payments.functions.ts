import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import crypto from "node:crypto";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  PLAN_AMOUNTS,
  createPayment,
  checkPaymentStatus,
  type MoneyFusionPlan,
} from "./moneyfusion.server";

function getClientIp(): string | null {
  try {
    const req = getRequest();
    const h = req.headers;
    const candidates = [
      h.get("cf-connecting-ip"),
      h.get("x-real-ip"),
      h.get("x-forwarded-for")?.split(",")[0]?.trim(),
      h.get("true-client-ip"),
    ];
    for (const c of candidates) {
      if (c && c.length > 0) return c;
    }
    return null;
  } catch {
    return null;
  }
}

function sha256(input: string): string {
  const salt = process.env.MONEYFUSION_API_URL ?? "fc-demo-salt";
  return crypto.createHash("sha256").update(`${salt}:${input}`).digest("hex");
}

const PlanSchema = z.object({
  plan: z.enum(["MENSUEL", "TRIMESTRIEL", "ANNUEL"]),
});

function getOrigin(): string {
  try {
    const req = getRequest();
    const url = new URL(req.url);
    return `${url.protocol}//${url.host}`;
  } catch {
    return "https://fret-calculator.lovable.app";
  }
}

export const createCheckoutSession = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => PlanSchema.parse(input))
  .handler(async ({ data }) => {
    const plan = data.plan as MoneyFusionPlan;
    const amount = PLAN_AMOUNTS[plan];

    const { data: paymentId, error: insErr } = await supabaseAdmin.rpc(
      "system_create_pending_payment",
      { _plan: plan, _amount: amount },
    );
    if (insErr || !paymentId) {
      console.error("create pending payment failed", insErr);
      throw new Error("Could not create payment");
    }

    const origin = getOrigin();
    try {
      const tx = await createPayment({
        plan,
        paymentId: paymentId as string,
        callbackUrl: `${origin}/payment-success?ref=${paymentId}`,
        webhookUrl: `${origin}/api/public/moneyfusion-webhook`,
      });

      // Store MoneyFusion token as provider_token for later lookup
      await supabaseAdmin.rpc("system_attach_provider_token", {
        _payment_id: paymentId as string,
        _token: tx.token,
      });

      return {
        ok: true as const,
        paymentId: paymentId as string,
        checkoutUrl: tx.checkoutUrl,
      };
    } catch (e) {
      console.error("moneyfusion payment failed", e);
      await supabaseAdmin.rpc("system_mark_payment_status", {
        _payment_id: paymentId as string,
        _status: "failed",
      });
      const raw = e instanceof Error ? e.message : String(e);
      // Strip our wrapper prefix to keep only MoneyFusion's message
      const cleaned = raw.replace(/^MoneyFusion payment creation failed:\s*/i, "").trim();
      const lower = cleaned.toLowerCase();
      let friendly = cleaned || "Le service de paiement est indisponible.";
      if (lower.includes("non approuvée") || lower.includes("not approved")) {
        friendly = "Notre application de paiement est en cours d'approbation par MoneyFusion. Réessayez d'ici quelques heures, ou contactez-nous sur WhatsApp pour activer votre code manuellement.";
      } else if (lower.includes("unauthorized ip") || lower.includes("ip non autorisée")) {
        friendly = "Le service de paiement bloque temporairement l'accès. Contactez-nous sur WhatsApp pour activer votre code manuellement.";
      }
      return { ok: false as const, error: friendly };
    }
  });

const DemoInputSchema = z.object({
  signal: z.string().min(8).max(256),
}).optional();

export const createDemoCode = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => DemoInputSchema.parse(input))
  .handler(async ({ data }) => {
    const ip = getClientIp();
    if (!ip) {
      return { ok: false as const, reason: "no_ip" as const, error: "Impossible d'identifier la requête." };
    }
    const ipHash = sha256(ip);

    let userAgent = "";
    let acceptLang = "";
    try {
      const req = getRequest();
      userAgent = req.headers.get("user-agent") ?? "";
      acceptLang = req.headers.get("accept-language") ?? "";
    } catch { /* ignore */ }

    const clientSignal = data?.signal ?? "no-signal";
    const fingerprintHash = sha256(`${clientSignal}|${userAgent}|${acceptLang}|${ip}`);
    const userAgentHash = sha256(userAgent);

    const { data: rows, error } = await supabaseAdmin.rpc("system_create_demo_code_v2", {
      _ip_hash: ipHash,
      _fingerprint_hash: fingerprintHash,
      _user_agent_hash: userAgentHash,
      _accept_language: acceptLang.slice(0, 64),
    });
    if (error || !rows || rows.length === 0) {
      console.error("create demo code v2 failed", error);
      return { ok: false as const, reason: "server_error" as const, error: "Could not create demo code" };
    }
    const row = rows[0];
    if (!row.ok) {
      if (row.reason === "rate_limited") {
        return {
          ok: false as const,
          reason: "rate_limited" as const,
          shortRef: row.short_ref ?? null,
          error: "Cet appareil a déjà reçu un code démo récemment. Si c'est une erreur, contactez-nous sur WhatsApp avec votre référence ci-dessous pour obtenir un code gratuit.",
        };
      }
      return { ok: false as const, reason: "server_error" as const, error: "Could not create demo code" };
    }
    return { ok: true as const, code: row.code as string, shortRef: row.short_ref as string };
  });

const RefSchema = z.object({ ref: z.string().uuid() });

export const getPaymentStatus = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => RefSchema.parse(input))
  .handler(async ({ data }) => {
    const { data: rows, error } = await supabaseAdmin.rpc("system_get_payment", {
      _payment_id: data.ref,
    });
    if (error || !rows || rows.length === 0) {
      return { ok: false as const, status: "unknown" as const };
    }
    const row = rows[0];

    // If still pending, poll MoneyFusion directly (in case webhook is slow)
    if (row.status === "pending") {
      const { data: full } = await supabaseAdmin
        .from("payments")
        .select("provider_token")
        .eq("id", data.ref)
        .single();
      const token = full?.provider_token;
      if (token) {
        try {
          const confirm = await checkPaymentStatus(token);
          if (confirm.status === "paid") {
            const { data: codeRows } = await supabaseAdmin.rpc(
              "system_create_paid_code",
              { _payment_id: data.ref },
            );
            const generated = codeRows?.[0]?.code ?? null;
            return {
              ok: true as const,
              status: "paid" as const,
              code: generated,
              plan: row.plan,
            };
          }
          if (confirm.status === "cancelled" || confirm.status === "failed") {
            await supabaseAdmin.rpc("system_mark_payment_status", {
              _payment_id: data.ref,
              _status: confirm.status,
            });
            return { ok: true as const, status: confirm.status };
          }
        } catch (e) {
          console.error("checkPaymentStatus failed", e);
        }
      }
    }

    return {
      ok: true as const,
      status: row.status as "pending" | "paid" | "failed" | "cancelled",
      code: row.generated_code,
      plan: row.plan,
    };
  });
