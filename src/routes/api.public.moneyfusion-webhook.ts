import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { checkPaymentStatus } from "@/utils/moneyfusion.server";

type MoneyFusionWebhookPayload = {
  event?: string;
  tokenPay?: string;
  personal_Info?: Array<Record<string, unknown>>;
  nomclient?: string;
  numeroSend?: string;
  Montant?: number;
  numeroTransaction?: string;
};

export const Route = createFileRoute("/api/public/moneyfusion-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawBody = await request.text();
        let payload: MoneyFusionWebhookPayload;
        try {
          payload = JSON.parse(rawBody) as MoneyFusionWebhookPayload;
        } catch (e) {
          console.error("moneyfusion webhook: bad json", e);
          return new Response("Bad request", { status: 400 });
        }

        const token = payload.tokenPay;
        const info = payload.personal_Info?.[0] ?? {};
        let paymentId =
          (info.payment_id as string | undefined) ??
          (info.userId as string | undefined);

        if (!token && !paymentId) {
          return new Response("Missing reference", { status: 400 });
        }

        // Resolve paymentId via stored token if not provided in payload
        if (!paymentId && token) {
          const { data: row } = await supabaseAdmin
            .from("payments")
            .select("id")
            .eq("provider_token", token)
            .maybeSingle();
          paymentId = row?.id;
        }
        if (!paymentId) {
          return new Response("Payment not found", { status: 404 });
        }

        // SECURITY: MoneyFusion does NOT sign webhooks.
        // Always re-verify the status via the API before trusting the payload.
        if (!token) {
          // Without a token we cannot verify; refuse.
          return new Response("Missing token", { status: 400 });
        }

        let confirm;
        try {
          confirm = await checkPaymentStatus(token);
        } catch (e) {
          console.error("moneyfusion webhook: status check failed", e);
          return new Response("Confirm failed", { status: 500 });
        }

        // Idempotency: skip if already finalized
        const { data: existing } = await supabaseAdmin
          .from("payments")
          .select("status")
          .eq("id", paymentId)
          .maybeSingle();
        if (existing?.status === "paid" || existing?.status === "cancelled") {
          return new Response("ok");
        }

        if (confirm.status === "paid") {
          await supabaseAdmin
            .from("payments")
            .update({
              customer_name: confirm.customer?.name ?? payload.nomclient ?? null,
              customer_phone: confirm.customer?.phone ?? payload.numeroSend ?? null,
              provider_ref: payload.numeroTransaction ?? null,
            })
            .eq("id", paymentId);

          const { error } = await supabaseAdmin.rpc("system_create_paid_code", {
            _payment_id: paymentId,
          });
          if (error) {
            console.error("system_create_paid_code failed", error);
            return new Response("Code generation failed", { status: 500 });
          }
          return new Response("ok");
        }

        if (confirm.status === "cancelled" || confirm.status === "failed") {
          await supabaseAdmin.rpc("system_mark_payment_status", {
            _payment_id: paymentId,
            _status: confirm.status,
            _provider_ref: payload.numeroTransaction ?? undefined,
          });
          return new Response("ok");
        }

        return new Response("ignored");
      },
    },
  },
});
