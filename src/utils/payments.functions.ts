import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import crypto from "node:crypto";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  PLAN_AMOUNTS,
  createInvoice,
  confirmInvoice,
  type PaydunyaPlan,
} from "./paydunya.server";

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

function hashIp(ip: string): string {
  const salt = process.env.PAYDUNYA_MASTER_KEY ?? "fc-demo-salt";
  return crypto.createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

const PlanSchema = z.object({
  plan: z.enum(["MENSUEL", "TRIMESTRIEL"]),
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
    const plan = data.plan as PaydunyaPlan;
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
      const invoice = await createInvoice({
        plan,
        paymentId: paymentId as string,
        returnUrl: `${origin}/payment-success?ref=${paymentId}`,
        cancelUrl: `${origin}/payment-cancel?ref=${paymentId}`,
        callbackUrl: `${origin}/api/public/paydunya-webhook`,
      });

      await supabaseAdmin.rpc("system_attach_provider_token", {
        _payment_id: paymentId as string,
        _token: invoice.token,
      });

      return {
        ok: true as const,
        paymentId: paymentId as string,
        checkoutUrl: invoice.checkout_url,
      };
    } catch (e) {
      console.error("paydunya invoice failed", e);
      await supabaseAdmin.rpc("system_mark_payment_status", {
        _payment_id: paymentId as string,
        _status: "failed",
      });
      return { ok: false as const, error: "Payment provider error" };
    }
  });

export const createDemoCode = createServerFn({ method: "POST" }).handler(async () => {
  const ip = getClientIp();
  if (!ip) {
    return { ok: false as const, reason: "no_ip" as const, error: "Impossible d'identifier la requête." };
  }
  const ipHash = hashIp(ip);
  const { data, error } = await supabaseAdmin.rpc("system_create_demo_code_for_ip", {
    _ip_hash: ipHash,
  });
  if (error || !data || data.length === 0) {
    console.error("create demo code failed", error);
    return { ok: false as const, reason: "server_error" as const, error: "Could not create demo code" };
  }
  const row = data[0];
  if (!row.ok) {
    if (row.reason === "rate_limited") {
      return {
        ok: false as const,
        reason: "rate_limited" as const,
        error: "Vous avez déjà profité de votre essai gratuit. Choisissez un plan payant pour continuer.",
      };
    }
    return { ok: false as const, reason: "server_error" as const, error: "Could not create demo code" };
  }
  return { ok: true as const, code: row.code as string };
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

    // If still pending, ask PayDunya directly (in case webhook is slow)
    if (row.status === "pending") {
      const { data: full } = await supabaseAdmin
        .from("payments")
        .select("provider_token")
        .eq("id", data.ref)
        .single();
      if (full?.provider_token) {
        try {
          const confirm = await confirmInvoice(full.provider_token);
          if (confirm.status === "completed") {
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
          console.error("confirmInvoice failed", e);
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
