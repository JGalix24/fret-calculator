import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { fetchTransaction, verifyWebhookSignature } from "@/utils/fedapay.server";

type FedaWebhookEvent = {
  name?: string;
  entity?: {
    id?: number;
    reference?: string;
    status?: string;
    custom_metadata?: { payment_id?: string; plan?: string };
    customer?: { firstname?: string; lastname?: string; email?: string };
  };
};

export const Route = createFileRoute("/api/public/fedapay-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawBody = await request.text();
        const sigHeader =
          request.headers.get("x-fedapay-signature") ??
          request.headers.get("X-FEDAPAY-SIGNATURE");

        const verify = verifyWebhookSignature(rawBody, sigHeader);
        if (!verify.ok) {
          console.warn("fedapay webhook: invalid signature", verify.reason);
          return new Response("Invalid signature", { status: 401 });
        }

        let event: FedaWebhookEvent;
        try {
          event = JSON.parse(rawBody) as FedaWebhookEvent;
        } catch (e) {
          console.error("fedapay webhook: bad json", e);
          return new Response("Bad request", { status: 400 });
        }

        const name = (event.name ?? "").toLowerCase();
        const entity = event.entity ?? {};
        const txId = entity.id;
        const paymentId = entity.custom_metadata?.payment_id;

        if (!paymentId && !txId) {
          return new Response("Missing reference", { status: 400 });
        }

        // Resolve payment id by transaction id if not supplied via metadata
        let resolvedId = paymentId;
        if (!resolvedId && txId) {
          const { data: row } = await supabaseAdmin
            .from("payments")
            .select("id")
            .eq("provider_token", String(txId))
            .maybeSingle();
          resolvedId = row?.id;
        }
        if (!resolvedId) {
          return new Response("Payment not found", { status: 404 });
        }

        // Determine effective status: prefer event name, fallback to entity.status
        let status: "completed" | "cancelled" | "failed" | "pending" = "pending";
        if (name.includes("approved") || name.includes("transferred")) status = "completed";
        else if (name.includes("canceled") || name.includes("cancelled")) status = "cancelled";
        else if (name.includes("declined") || name.includes("failed")) status = "failed";
        else {
          const raw = (entity.status ?? "").toLowerCase();
          if (raw === "approved" || raw === "transferred") status = "completed";
          else if (raw === "canceled" || raw === "cancelled") status = "cancelled";
          else if (raw === "declined" || raw === "failed") status = "failed";
        }

        // Defensive: re-confirm with FedaPay API for completed events
        if (status === "completed" && txId) {
          try {
            const confirm = await fetchTransaction(txId);
            if (confirm.status !== "completed") {
              console.warn("fedapay webhook: status mismatch, ignoring", {
                eventStatus: status,
                apiStatus: confirm.status,
              });
              return new Response("ignored");
            }
          } catch (e) {
            console.error("fedapay webhook: confirm failed", e);
            return new Response("Confirm failed", { status: 500 });
          }
        }

        if (status === "completed") {
          const customer = entity.customer ?? {};
          const fullName = [customer.firstname, customer.lastname]
            .filter(Boolean)
            .join(" ")
            .trim();
          await supabaseAdmin
            .from("payments")
            .update({
              customer_name: fullName || null,
              customer_email: customer.email ?? null,
              provider_ref: txId ? String(txId) : null,
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

        if (status === "cancelled" || status === "failed") {
          await supabaseAdmin.rpc("system_mark_payment_status", {
            _payment_id: resolvedId,
            _status: status,
            _provider_ref: txId ? String(txId) : undefined,
          });
          return new Response("ok");
        }

        return new Response("ignored");
      },
    },
  },
});
