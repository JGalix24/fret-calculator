import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type Lang = "fr" | "en";

type Dict = Record<string, string>;

const fr: Dict = {
  "nav.try": "Essayer gratuitement",
  "hero.title": "Stop aux mauvaises surprises sur vos frais de fret.",
  "hero.subtitle":
    "Calculez le coût exact de votre colis depuis la Chine vers Lomé en 30 secondes. CBM, kg, délai d'arrivée — tout est là.",
  "hero.cta": "Essayer gratuitement",
  "hero.badge": "5 calculs offerts · Sans inscription · Sans carte bancaire",

  "problem.title": "Vous vous reconnaissez ?",
  "problem.1": "Vous calculez encore votre fret à la main ou sur Excel ?",
  "problem.2": "Vous appelez votre transitaire pour chaque devis ?",
  "problem.3": "Vous perdez des clients parce que vous répondez trop lentement ?",

  "solution.title": "Freight-Calculator règle tout ça en 30 secondes",
  "solution.boat.title": "Fret maritime",
  "solution.boat.desc": "Calculez votre fret maritime au CBM instantanément",
  "solution.plane.title": "Fret aérien",
  "solution.plane.desc": "Obtenez votre coût aérien au kilogramme en un clic",
  "solution.compare.title": "Comparaison",
  "solution.compare.desc": "Comparez bateau et avion et choisissez le plus rentable",
  "solution.multi.title": "Multi-colis",
  "solution.multi.desc": "Calculez plusieurs colis différents en même temps",

  "argument.title":
    "Sachez exactement quand votre marchandise posera le pied au Togo avant même de passer commande",
  "argument.subtitle":
    "Fini les mauvaises surprises. Planifiez vos stocks, rassurez vos clients, gérez votre business comme un professionnel.",
  "argument.counter": "calculs effectués cette semaine",

  "pricing.title": "Un investissement qui se rentabilise dès le premier calcul",
  "pricing.month.name": "Mensuel",
  "pricing.month.price": "1 500",
  "pricing.month.unit": "FCFA / mois",
  "pricing.month.feat1": "Accès illimité 30 jours",
  "pricing.month.feat2": "Tous les modes de calcul",
  "pricing.month.feat3": "Export PDF",
  "pricing.quarter.name": "Trimestriel",
  "pricing.quarter.price": "4 000",
  "pricing.quarter.unit": "FCFA / 3 mois",
  "pricing.quarter.feat1": "Accès illimité 90 jours",
  "pricing.quarter.feat2": "Tous les modes de calcul",
  "pricing.quarter.feat3": "Export PDF",
  "pricing.quarter.badge": "Le plus avantageux",
  "pricing.quarter.save": "Économie de 500 FCFA",
  "pricing.note": "Paiement via Moov Money ou Mixx by Yas · Activation immédiate via WhatsApp",
  "pricing.cta": "Contacter sur WhatsApp",

  "testi.title": "Ils ont adopté Freight-Calculator",
  "testi.1.text":
    "Je calcule mes frais en 30 secondes maintenant. J'ai l'air d'un vrai professionnel devant mes clients.",
  "testi.1.name": "Kwame A.",
  "testi.1.role": "Importateur au Togo",
  "testi.2.text":
    "Mon formateur nous a recommandé cet outil. Je comprends enfin comment fonctionne le calcul CBM.",
  "testi.2.name": "Aminata S.",
  "testi.2.role": "Étudiante en sourcing",
  "testi.3.text":
    "La comparaison bateau contre avion m'a permis de faire de vraies économies sur ma dernière commande.",
  "testi.3.name": "Jean-Marc D.",
  "testi.3.role": "Revendeur en ligne",

  "faq.title": "Questions fréquentes",
  "faq.q1": "Comment ça marche ?",
  "faq.a1":
    "Tu reçois un code sur WhatsApp après paiement. Tu l'entres dans l'app et c'est parti.",
  "faq.q2": "Comment je paie ?",
  "faq.a2":
    "Via Moov Money ou Mixx by Yas au +228 99584808. Tu envoies ton reçu sur WhatsApp et tu reçois ton code immédiatement.",
  "faq.q3": "Est-ce que je dois créer un compte ?",
  "faq.a3": "Non. Aucune inscription. Aucun mot de passe. Juste un code d'activation.",
  "faq.q4": "Et si j'efface mon historique ?",
  "faq.a4":
    "Aucun problème. Tu rentres simplement ton code à nouveau et tu retrouves ton accès instantanément.",
  "faq.q5": "C'est disponible sur mobile ?",
  "faq.a5":
    "Oui. Freight-Calculator fonctionne parfaitement sur téléphone, tablette et ordinateur.",

  "final.title": "Prêt à calculer comme un professionnel ?",
  "final.subtitle":
    "Rejoins les importateurs et étudiants sourcing qui utilisent déjà Freight-Calculator",
  "final.cta": "Commencer gratuitement",
  "final.badge": "5 calculs offerts sans engagement",

  "footer.by": "By Mr.G",
  "footer.rights": "Tous droits réservés.",

  "activate.title": "Active ton accès Freight-Calculator",
  "activate.placeholder": "MRG-XX-XXXX",
  "activate.validate": "Valider mon code",
  "activate.no_code": "Tu n'as pas encore de code ? Contacte-nous sur WhatsApp",
  "activate.whatsapp": "Ouvrir WhatsApp",
  "activate.pricing": "1 500 FCFA / mois · 4 000 FCFA / 3 mois",
  "activate.payments": "Moyens de paiement : Moov Money · Mixx by Yas",
  "activate.back": "Retour à l'accueil",
  "activate.checking": "Vérification…",
  "activate.err.invalid": "Code incorrect. Vérifie ton code ou contacte-nous sur WhatsApp.",
  "activate.err.inactive": "Ce code a été désactivé. Contacte-nous sur WhatsApp.",
  "activate.err.expired": "Ton accès a expiré. Renouvelle sur WhatsApp : +228 99584808",
  "activate.err.exhausted": "Tu as utilisé tes 5 calculs gratuits. Passe au plan mensuel sur WhatsApp.",
  "activate.err.unknown": "Une erreur est survenue. Réessaie ou contacte-nous sur WhatsApp.",
  "app.exhausted.title": "Tu as utilisé tes 5 calculs gratuits",
  "app.exhausted.body": "Passe au plan mensuel pour continuer à calculer sans limite.",
  "app.expired.title": "Ton accès a expiré",
  "app.expired.body": "Renouvelle ton abonnement sur WhatsApp pour reprendre.",
  "app.error.calc": "Impossible de valider ce calcul. Réessaie.",
  "app.computing": "Calcul en cours…",
  "app.calculate": "Calculer",
  "app.remaining": "calculs restants",
};

// EN scaffolding — to be completed later. Falls back to FR for missing keys.
const en: Dict = {
  "nav.try": "Try for free",
  "hero.cta": "Try for free",
  "final.cta": "Get started free",
};

const dictionaries: Record<Lang, Dict> = { fr, en };

type I18nCtx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nCtx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("fr");

  const value = useMemo<I18nCtx>(
    () => ({
      lang,
      setLang,
      t: (key: string) => dictionaries[lang][key] ?? fr[key] ?? key,
    }),
    [lang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export const WHATSAPP_NUMBER = "+228 99584808";
export const WHATSAPP_LINK = "https://wa.me/22899584808";

export type WhatsappContext =
  | "demo"
  | "mensuel"
  | "trimestriel"
  | "renew"
  | "exhausted"
  | "general";

const WA_MESSAGES_FR: Record<WhatsappContext, string> = {
  demo:
    "Bonjour Mr.G, je viens de tester Freight-Calculator (5 calculs offerts). J'aimerais en savoir plus avant de m'abonner.",
  mensuel:
    "Bonjour Mr.G, je souhaite activer l'offre Mensuelle (2 000 FCFA / 30 jours) de Freight-Calculator. Voici mon reçu de paiement :",
  trimestriel:
    "Bonjour Mr.G, je souhaite activer l'offre Trimestrielle (5 000 FCFA / 90 jours) de Freight-Calculator. Voici mon reçu de paiement :",
  renew:
    "Bonjour Mr.G, mon accès Freight-Calculator a expiré, je souhaite le renouveler.",
  exhausted:
    "Bonjour Mr.G, j'ai épuisé mes 5 calculs gratuits sur Freight-Calculator et je veux passer à un plan payant.",
  general:
    "Bonjour Mr.G, je suis intéressé(e) par Freight-Calculator. J'aimerais avoir plus d'informations.",
};

const WA_MESSAGES_EN: Record<WhatsappContext, string> = {
  demo:
    "Hello Mr.G, I just tried Freight-Calculator (5 free calculations). I'd like to know more before subscribing.",
  mensuel:
    "Hello Mr.G, I want to activate the Monthly plan (2,000 FCFA / 30 days) of Freight-Calculator. Here is my payment receipt:",
  trimestriel:
    "Hello Mr.G, I want to activate the Quarterly plan (5,000 FCFA / 90 days) of Freight-Calculator. Here is my payment receipt:",
  renew:
    "Hello Mr.G, my Freight-Calculator access has expired, I'd like to renew it.",
  exhausted:
    "Hello Mr.G, I've used my 5 free calculations on Freight-Calculator and want to upgrade to a paid plan.",
  general:
    "Hello Mr.G, I'm interested in Freight-Calculator. I'd like more information.",
};

export type WhatsappDetails = {
  plan?: string;
  code?: string; // last 4 chars only
  expiresAt?: string; // pre-formatted
  daysLeft?: number;
  remaining?: number; // DEMO calcs left
  page?: string;
};

function shortCode(code?: string): string | null {
  if (!code) return null;
  const clean = code.trim();
  if (clean.length <= 4) return clean;
  return `****-${clean.slice(-4)}`;
}

function buildDetailsBlock(lang: Lang, d?: WhatsappDetails): string {
  if (!d) return "";
  const isFr = lang !== "en";
  const lines: string[] = [];
  if (d.plan) lines.push(isFr ? `Plan : ${d.plan}` : `Plan: ${d.plan}`);
  const sc = shortCode(d.code);
  if (sc) lines.push(isFr ? `Code : ${sc}` : `Code: ${sc}`);
  if (d.expiresAt) lines.push(isFr ? `Expiration : ${d.expiresAt}` : `Expires: ${d.expiresAt}`);
  if (typeof d.daysLeft === "number")
    lines.push(isFr ? `Jours restants : ${d.daysLeft}` : `Days left: ${d.daysLeft}`);
  if (typeof d.remaining === "number")
    lines.push(isFr ? `Calculs restants : ${d.remaining} / 5` : `Calculations left: ${d.remaining} / 5`);
  if (d.page) lines.push(isFr ? `Page : ${d.page}` : `Page: ${d.page}`);
  return lines.length ? `\n\n${lines.join("\n")}` : "";
}

export function buildWhatsappLink(
  lang: Lang,
  context: WhatsappContext = "general",
  details?: WhatsappDetails,
): string {
  const dict = lang === "en" ? WA_MESSAGES_EN : WA_MESSAGES_FR;
  const msg = (dict[context] ?? WA_MESSAGES_FR.general) + buildDetailsBlock(lang, details);
  return `https://wa.me/22899584808?text=${encodeURIComponent(msg)}`;
}
