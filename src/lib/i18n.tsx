import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type Lang = "fr" | "en";

type Dict = Record<string, string>;

const fr: Dict = {
  "nav.try": "Essayer gratuitement",
  "hero.title": "L'outil de calcul de fret qu'utilisent les importateurs sérieux en Afrique de l'Ouest",
  "hero.subtitle":
    "Calculez vos frais de transport, comparez vos options et sachez exactement quand votre marchandise posera le pied au Togo — avant même de passer commande.",
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
  "pricing.month.price": "2 000",
  "pricing.month.unit": "FCFA / mois",
  "pricing.month.feat1": "Accès illimité 30 jours",
  "pricing.month.feat2": "Tous les modes de calcul",
  "pricing.month.feat3": "Export PDF",
  "pricing.quarter.name": "Trimestriel",
  "pricing.quarter.price": "5 000",
  "pricing.quarter.unit": "FCFA / 3 mois",
  "pricing.quarter.feat1": "Accès illimité 90 jours",
  "pricing.quarter.feat2": "Tous les modes de calcul",
  "pricing.quarter.feat3": "Export PDF",
  "pricing.quarter.badge": "Le plus avantageux",
  "pricing.quarter.save": "Économie de 1 000 FCFA",
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
  "activate.pricing": "2 000 FCFA / mois · 5 000 FCFA / 3 mois",
  "activate.payments": "Moyens de paiement : Moov Money · Mixx by Yas",
  "activate.back": "Retour à l'accueil",
  "activate.soon":
    "La validation des codes sera activée prochainement. Pour l'instant, contacte-nous sur WhatsApp pour démarrer.",
  "activate.invalid":
    "Code incorrect. Vérifie ton code ou contacte-nous sur WhatsApp.",
  "activate.hint":
    "Format attendu : MRG-DEMO-XXXX, MRG-30-XXXX ou MRG-90-XXXX (en attendant la validation serveur).",
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
