// FedaPay API wrapper. Server-only.
import crypto from "node:crypto";

export type FedaPayPlan = "MENSUEL" | "TRIMESTRIEL";

export const PLAN_AMOUNTS: Record<FedaPayPlan, number> = {
  MENSUEL: 2000,
  TRIMESTRIEL: 5000,
};

export const PLAN_LABELS: Record<FedaPayPlan, string> = {
  MENSUEL: "Abonnement Mensuel — Freight Calculator",
  TRIMESTRIEL: "Abonnement Trimestriel — Freight Calculator",
};

function getMode(): "sandbox" | "live" {
  const m = (process.env.FEDAPAY_MODE ?? "sandbox").toLowerCase();
  return m === "live" ? "live" : "sandbox";
}

function getBaseUrl(): string {
  return getMode() === "live"
    ? "https://api.fedapay.com/v1"
    : "https://sandbox-api.fedapay.com/v1";
}

function getHeaders(): Record<string, string> {
  const secretKey = process.env.FEDAPAY_SECRET_KEY;
  if (!secretKey) {
    throw new Error("FEDAPAY_SECRET_KEY missing");
  }
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${secretKey}`,
  };
}

export type CreateTransactionInput = {
  plan: FedaPayPlan;
  paymentId: string;
  callbackUrl: string;
  customerFirstname?: string;
  customerLastname?: string;
  customerEmail?: string;
};

export type CreateTransactionOutput = {
  transactionId: number;
  token: string;
  checkoutUrl: string;
};

type FedaTransactionResp = {
  "v1/transaction"?: { id?: number; reference?: string };
  transaction?: { id?: number; reference?: string };
  message?: string;
  errors?: unknown;
};

type FedaTokenResp = {
  token?: string;
  url?: string;
  message?: string;
};

export async function createTransaction(
  input: CreateTransactionInput,
): Promise<CreateTransactionOutput> {
  const amount = PLAN_AMOUNTS[input.plan];

  // 1) Create the transaction
  const txBody: Record<string, unknown> = {
    description: PLAN_LABELS[input.plan],
    amount,
    currency: { iso: "XOF" },
    callback_url: input.callbackUrl,
    custom_metadata: { payment_id: input.paymentId, plan: input.plan },
  };
  if (input.customerEmail || input.customerFirstname || input.customerLastname) {
    txBody.customer = {
      firstname: input.customerFirstname ?? "Client",
      lastname: input.customerLastname ?? "FreightCalc",
      email: input.customerEmail ?? `noreply+${input.paymentId}@freight-calc.local`,
    };
  }

  const txRes = await fetch(`${getBaseUrl()}/transactions`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(txBody),
  });
  const txJson = (await txRes.json()) as FedaTransactionResp;
  const tx = txJson["v1/transaction"] ?? txJson.transaction;
  if (!txRes.ok || !tx?.id) {
    console.error("FedaPay create transaction failed", txJson);
    throw new Error(`FedaPay transaction creation failed: ${txJson.message ?? "unknown"}`);
  }

  // 2) Generate a payment token / checkout URL
  const tokenRes = await fetch(`${getBaseUrl()}/transactions/${tx.id}/token`, {
    method: "POST",
    headers: getHeaders(),
  });
  const tokenJson = (await tokenRes.json()) as FedaTokenResp;
  if (!tokenRes.ok || !tokenJson.token || !tokenJson.url) {
    console.error("FedaPay token generation failed", tokenJson);
    throw new Error(`FedaPay token generation failed: ${tokenJson.message ?? "unknown"}`);
  }

  return {
    transactionId: tx.id,
    token: tokenJson.token,
    checkoutUrl: tokenJson.url,
  };
}

export type FetchTransactionOutput = {
  status: "completed" | "pending" | "cancelled" | "failed";
  customer?: { firstname?: string; lastname?: string; email?: string; phone?: string };
};

type FedaFetchResp = {
  "v1/transaction"?: {
    status?: string;
    customer?: { firstname?: string; lastname?: string; email?: string };
  };
  transaction?: {
    status?: string;
    customer?: { firstname?: string; lastname?: string; email?: string };
  };
};

export async function fetchTransaction(transactionId: number): Promise<FetchTransactionOutput> {
  const res = await fetch(`${getBaseUrl()}/transactions/${transactionId}`, {
    method: "GET",
    headers: getHeaders(),
  });
  const json = (await res.json()) as FedaFetchResp;
  const tx = json["v1/transaction"] ?? json.transaction;
  const raw = (tx?.status ?? "pending").toLowerCase();
  let status: FetchTransactionOutput["status"] = "pending";
  if (raw === "approved" || raw === "transferred") status = "completed";
  else if (raw === "canceled" || raw === "cancelled") status = "cancelled";
  else if (raw === "declined" || raw === "failed") status = "failed";
  return { status, customer: tx?.customer };
}

// FedaPay sends X-FEDAPAY-SIGNATURE = "t=<timestamp>,s=<signature>"
// signature = HMAC_SHA256(secret, `${timestamp}.${rawBody}`)
export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  toleranceSeconds = 300,
): { ok: boolean; reason?: string } {
  const secret = process.env.FEDAPAY_WEBHOOK_SECRET;
  if (!secret) return { ok: false, reason: "missing_secret" };
  if (!signatureHeader) return { ok: false, reason: "missing_header" };

  const parts = signatureHeader.split(",").map((p) => p.trim());
  let timestamp: string | null = null;
  const signatures: string[] = [];
  for (const p of parts) {
    const [k, v] = p.split("=");
    if (k === "t") timestamp = v;
    else if (k === "s" || k === "v1") signatures.push(v);
  }
  if (!timestamp || signatures.length === 0) {
    return { ok: false, reason: "malformed_header" };
  }

  const ts = parseInt(timestamp, 10);
  if (Number.isNaN(ts)) return { ok: false, reason: "invalid_timestamp" };
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > toleranceSeconds) {
    return { ok: false, reason: "timestamp_too_old" };
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");

  const expectedBuf = Buffer.from(expected, "utf8");
  for (const sig of signatures) {
    const sigBuf = Buffer.from(sig, "utf8");
    if (sigBuf.length === expectedBuf.length && crypto.timingSafeEqual(expectedBuf, sigBuf)) {
      return { ok: true };
    }
  }
  return { ok: false, reason: "signature_mismatch" };
}
