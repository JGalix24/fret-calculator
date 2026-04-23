// PayDunya API wrapper. Server-only.
import crypto from "node:crypto";

export type PaydunyaPlan = "MENSUEL" | "TRIMESTRIEL";

export const PLAN_AMOUNTS: Record<PaydunyaPlan, number> = {
  MENSUEL: 2000,
  TRIMESTRIEL: 5000,
};

export const PLAN_LABELS: Record<PaydunyaPlan, string> = {
  MENSUEL: "Abonnement Mensuel — Freight Calculator",
  TRIMESTRIEL: "Abonnement Trimestriel — Freight Calculator",
};

function getMode(): "test" | "live" {
  const m = (process.env.PAYDUNYA_MODE ?? "test").toLowerCase();
  return m === "live" ? "live" : "test";
}

function getBaseUrl(): string {
  return getMode() === "live"
    ? "https://app.paydunya.com/api/v1"
    : "https://app.paydunya.com/sandbox-api/v1";
}

function getHeaders(): Record<string, string> {
  const masterKey = process.env.PAYDUNYA_MASTER_KEY;
  const privateKey = process.env.PAYDUNYA_PRIVATE_KEY;
  const token = process.env.PAYDUNYA_TOKEN;
  if (!masterKey || !privateKey || !token) {
    throw new Error("PayDunya credentials missing");
  }
  return {
    "Content-Type": "application/json",
    "PAYDUNYA-MASTER-KEY": masterKey,
    "PAYDUNYA-PRIVATE-KEY": privateKey,
    "PAYDUNYA-TOKEN": token,
    "PAYDUNYA-MODE": getMode(),
  };
}

export type CreateInvoiceInput = {
  plan: PaydunyaPlan;
  paymentId: string;
  returnUrl: string;
  cancelUrl: string;
  callbackUrl: string;
  customerName?: string;
  customerPhone?: string;
};

export type CreateInvoiceOutput = {
  token: string;
  checkout_url: string;
};

export async function createInvoice(input: CreateInvoiceInput): Promise<CreateInvoiceOutput> {
  const amount = PLAN_AMOUNTS[input.plan];
  const body = {
    invoice: {
      total_amount: amount,
      description: PLAN_LABELS[input.plan],
      items: {
        item_0: {
          name: PLAN_LABELS[input.plan],
          quantity: 1,
          unit_price: amount,
          total_price: amount,
          description: PLAN_LABELS[input.plan],
        },
      },
    },
    store: { name: "Freight Calculator" },
    custom_data: { payment_id: input.paymentId, plan: input.plan },
    actions: {
      cancel_url: input.cancelUrl,
      return_url: input.returnUrl,
      callback_url: input.callbackUrl,
    },
  };

  const res = await fetch(`${getBaseUrl()}/checkout-invoice/create`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as {
    response_code?: string;
    response_text?: string;
    token?: string;
  };
  if (json.response_code !== "00" || !json.token) {
    throw new Error(`PayDunya invoice creation failed: ${json.response_text ?? "unknown"}`);
  }
  const checkoutUrl =
    getMode() === "live"
      ? `https://paydunya.com/checkout/invoice/${json.token}`
      : `https://paydunya.com/sandbox-checkout/invoice/${json.token}`;
  return { token: json.token, checkout_url: checkoutUrl };
}

export type ConfirmInvoiceOutput = {
  status: "completed" | "pending" | "cancelled" | "failed";
  customer?: { name?: string; phone?: string; email?: string };
  receipt_url?: string;
};

export async function confirmInvoice(token: string): Promise<ConfirmInvoiceOutput> {
  const res = await fetch(`${getBaseUrl()}/checkout-invoice/confirm/${token}`, {
    method: "GET",
    headers: getHeaders(),
  });
  const json = (await res.json()) as {
    status?: string;
    customer?: { name?: string; phone?: string; email?: string };
    receipt_url?: string;
  };
  const raw = (json.status ?? "pending").toLowerCase();
  let status: ConfirmInvoiceOutput["status"] = "pending";
  if (raw === "completed") status = "completed";
  else if (raw === "cancelled" || raw === "canceled") status = "cancelled";
  else if (raw === "failed") status = "failed";
  return { status, customer: json.customer, receipt_url: json.receipt_url };
}

// PayDunya IPN sends `data.hash` = SHA-512 hex of MASTER_KEY.
export function verifyIpnHash(receivedHash: string): boolean {
  const masterKey = process.env.PAYDUNYA_MASTER_KEY;
  if (!masterKey || !receivedHash) return false;
  const expected = crypto.createHash("sha512").update(masterKey).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(receivedHash, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
