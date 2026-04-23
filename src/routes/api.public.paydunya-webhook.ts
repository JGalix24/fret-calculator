import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { verifyIpnHash } from "@/utils/paydunya.server";

export const Route = createFileRoute("/api/public/paydunya-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: Record<string, unknown> = {};
        try {
          const ct = request.headers.get("content-type") ?? "";
          if (ct.includes("application/json")) {
            payload = (await request.json()) as Record<string, unknown>;
          } else {
            const fd = await request.formData();
            const dataField = fd.get("data");
            if (typeof dataField === "string") {
              payload = { data: JSON.parse(dataField) };
            } else {
              const obj: Record<string, unknown> = {};
              fd.forEach((v, k) => {
                obj[k] = v;
              });
              payload = obj;
            }
          }
        } catch (e) {
          console.error("paydunya webhook: bad body", e);
          return new Response("Bad request", { status: 400 });
        }

        const data = (payload.data ?? payload) as Record<string, unknown>;
        const hash = (data.hash as string | undefined) ?? "";
        if (!verifyIpnHash(hash)) {
          console.warn("paydunya webhook: invalid hash");
          return new Response("Invalid signature", { status: 401 });
        }

        const status = String(data.status ?? "").toLowerCase();
        const invoice = (data.invoice ?? {}) as Record<string, unknown>;
        const token = (data.token as string | undefined) ?? (invoice.token as string | undefined);
        const customData = (data.custom_data ?? {}) as Record<string, unknown>;
        const paymentId = customData.payment_id as string | undefined;

        if (!paymentId && !token) {
          return new Response("Missing reference", { status: 400 });
        }

        // Resolve payment id by token if not supplied
        let resolvedId = paymentId;
        if (!resolvedId && token) {
          const { data: row } = await supabaseAdmin
            .from("payments")
            .select("id")
            .eq("provider_token", token)
            .maybeSingle();
          resolvedId = row?.id;
        }
        if (!resolvedId) {
          return new Response("Payment not found", { status: 404 });
        }

        if (status === "completed") {
          const customer = (data.customer ?? {}) as Record<string, unknown>;
          await supabaseAdmin
            .from("payments")
            .update({
              customer_phone: (customer.phone as string | undefined) ?? null,
              customer_name: (customer.name as string | undefined) ?? null,
              customer_email: (customer.email as string | undefined) ?? null,
              provider_ref: token ?? null,
            })
            .eq("id", resolvedId);

          const { error } = await supabaseAdmin.rpc("system_create_paid_code", {
            _payment_id: resolvedId,
          });
          if (error) {
            console.error("system_create_paid_code failed", error);
            return new Response("Code generation failed", { status: 500 });
          }
          return new Response("ok");
        }

        if (status === "cancelled" || status === "canceled") {
          await supabaseAdmin.rpc("system_mark_payment_status", {
            _payment_id: resolvedId,
            _status: "cancelled",
            _provider_ref: token ?? undefined,
          });
          return new Response("ok");
        }

        if (status === "failed") {
          await supabaseAdmin.rpc("system_mark_payment_status", {
            _payment_id: resolvedId,
            _status: "failed",
            _provider_ref: token ?? undefined,
          });
          return new Response("ok");
        }

        return new Response("ignored");
      },
    },
  },
});
