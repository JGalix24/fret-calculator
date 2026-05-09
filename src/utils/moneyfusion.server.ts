// MoneyFusion API wrapper. Server-only.
// Docs: https://docs.moneyfusion.net/

export type MoneyFusionPlan = "MENSUEL" | "TRIMESTRIEL";

export const PLAN_AMOUNTS: Record<MoneyFusionPlan, number> = {
  MENSUEL: 1499,
  TRIMESTRIEL: 3500,
};

export const PLAN_LABELS: Record<MoneyFusionPlan, string> = {
  MENSUEL: "Abonnement Mensuel — Freight Calculator",
  TRIMESTRIEL: "Abonnement Trimestriel — Freight Calculator",
};

function getApiUrl(): string {
  const url = process.env.MONEYFUSION_API_URL;
  if (!url) throw new Error("MONEYFUSION_API_URL missing");
  return url;
}

export type CreatePaymentInput = {
  plan: MoneyFusionPlan;
  paymentId: string;
  callbackUrl: string;
  webhookUrl: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
};

export type CreatePaymentOutput = {
  token: string;
  checkoutUrl: string;
};

type MoneyFusionCreateResp = {
  statut?: boolean;
  token?: string;
  url?: string;
  message?: string;
};

export async function createPayment(input: CreatePaymentInput): Promise<CreatePaymentOutput> {
  const amount = PLAN_AMOUNTS[input.plan];
  const body = {
    totalPrice: amount,
    article: [{ [PLAN_LABELS[input.plan]]: amount }],
    personal_Info: [
      {
        userId: input.paymentId,
        payment_id: input.paymentId,
        plan: input.plan,
      },
    ],
    numeroSend: input.customerPhone ?? "",
    nomclient: input.customerName ?? "Client",
    return_url: input.callbackUrl,
    webhook_url: input.webhookUrl,
  };

  const res = await fetch(getApiUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as MoneyFusionCreateResp;
  if (!res.ok || !json.statut || !json.token || !json.url) {
    console.error("MoneyFusion create payment failed", { status: res.status, json });
    throw new Error(`MoneyFusion payment creation failed: ${json.message ?? "unknown"}`);
  }
  return { token: json.token, checkoutUrl: json.url };
}

export type PaymentStatusOutput = {
  status: "paid" | "pending" | "failed" | "cancelled";
  customer?: { name?: string; email?: string; phone?: string };
  paymentId?: string;
  plan?: string;
};

type MoneyFusionStatusResp = {
  statut?: boolean;
  message?: string;
  data?: {
    statut?: string; // "paid" | "pending" | "failure" | "no paid" | ...
    personal_Info?: Array<Record<string, unknown>>;
    nomclient?: string;
    numeroSend?: string;
    moyen?: string;
    Montant?: number;
    numeroTransaction?: string;
  };
};

export async function checkPaymentStatus(token: string): Promise<PaymentStatusOutput> {
  const res = await fetch(`https://www.pay.moneyfusion.net/paiementNotif/${token}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  const json = (await res.json().catch(() => ({}))) as MoneyFusionStatusResp;
  const raw = (json.data?.statut ?? "pending").toLowerCase();
  let status: PaymentStatusOutput["status"] = "pending";
  if (raw === "paid" || raw === "success" || raw === "successful") status = "paid";
  else if (raw === "failure" || raw === "failed" || raw === "no paid" || raw === "echec")
    status = "failed";
  else if (raw === "cancelled" || raw === "canceled" || raw === "annule") status = "cancelled";

  const info = json.data?.personal_Info?.[0] ?? {};
  const paymentId =
    (info.payment_id as string | undefined) ?? (info.userId as string | undefined);
  const plan = info.plan as string | undefined;

  return {
    status,
    paymentId,
    plan,
    customer: {
      name: json.data?.nomclient,
      phone: json.data?.numeroSend,
    },
  };
}
