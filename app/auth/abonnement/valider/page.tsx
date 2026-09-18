"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  CreditCard,
  Smartphone,
  Landmark,
  Loader2,
} from "lucide-react";
import axios from "@/lib/axios";

type Plan = {
  id: number;
  nom: string;
  description: string;
  prix: number;
  devise: string;
  duree_unite: "jour" | "mois" | "annee";
  trial: boolean;
  trial_duration: number | null;
  features: string[];
  est_gratuit: boolean;
};

const QUANTITE_LIMITS: Record<string, { min: number; max: number }> = {
  jour: { min: 1, max: 90 },
  mois: { min: 1, max: 36 },
  annee: { min: 1, max: 5 },
};

const MODES_PAIEMENT = [
  { code: "carte", label: "Carte bancaire", icon: CreditCard },
  { code: "mobile_money", label: "Mobile Money", icon: Smartphone },
  { code: "virement", label: "Virement", icon: Landmark },
];

const OPERATEURS_MOBILE_MONEY = [
  "MTN Mobile Money",
  "Moov Money",
  "Orange Money",
  "Wave",
];

function ValiderAbonnementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const planId = searchParams.get("plan");
  const devise = searchParams.get("devise") || "XOF";

  const dureeUnite = (searchParams.get("duree_unite") ||
    "mois") as "jour" | "mois" | "annee";

  const [plan, setPlan] = useState<Plan | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [quantite, setQuantite] = useState(
    QUANTITE_LIMITS[dureeUnite].min,
  );

  const [modePaiement, setModePaiement] = useState("");
  const [referencePaiement, setReferencePaiement] = useState("");

  const [carte, setCarte] = useState({
    titulaire: "",
    numero: "",
    expiration: "",
  });

  const [mobileMoney, setMobileMoney] = useState({
    operateur: "",
    telephone: "",
  });

  const [virement, setVirement] = useState({
    banque: "",
    titulaire: "",
    iban: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!planId) {
      setNotFound(true);
      setLoadingPlan(false);
      return;
    }

    const loadPlan = async () => {
      setLoadingPlan(true);

      try {
        const response = await axios.get(
          `/api/plans/${planId}?devise=${devise}&duree_unite=${dureeUnite}`,
        );

        setPlan(response.data.plan ?? null);
      } catch (error) {
        console.error("Erreur chargement du plan :", error);
        setNotFound(true);
      } finally {
        setLoadingPlan(false);
      }
    };

    loadPlan();
  }, [planId, devise, dureeUnite]);

  useEffect(() => {
    setQuantite((q) => {
      const { min, max } = QUANTITE_LIMITS[dureeUnite];

      if (Number.isNaN(q)) {
        return min;
      }

      return Math.min(Math.max(q, min), max);
    });
  }, [dureeUnite]);

  const uniteLabelCourt = (u: string) =>
    u === "jour" ? "j" : u === "annee" ? "an" : "mois";

  const clampQuantite = (value: number) => {
    const { min, max } = QUANTITE_LIMITS[dureeUnite];

    if (Number.isNaN(value)) {
      return min;
    }

    return Math.min(Math.max(value, min), max);
  };

  const buildDetailsPaiement = () => {
    if (modePaiement === "carte") {
      const digitsOnly = carte.numero.replace(/\D/g, "");

      return {
        titulaire: carte.titulaire,
        numero_masque: digitsOnly
          ? `**** **** **** ${digitsOnly.slice(-4)}`
          : "",
        expiration: carte.expiration,
      };
    }

    if (modePaiement === "mobile_money") {
      return {
        operateur: mobileMoney.operateur,
        telephone: mobileMoney.telephone,
      };
    }

    if (modePaiement === "virement") {
      return {
        banque: virement.banque,
        titulaire: virement.titulaire,
        iban: virement.iban,
      };
    }

    return {};
  };

  const isPaymentFormValid = () => {
    if (modePaiement === "carte") {
      return (
        carte.titulaire.trim().length > 0 &&
        carte.numero.replace(/\D/g, "").length >= 12 &&
        /^\d{2}\/\d{2}$/.test(carte.expiration)
      );
    }

    if (modePaiement === "mobile_money") {
      return (
        mobileMoney.operateur.length > 0 &&
        mobileMoney.telephone.trim().length >= 8
      );
    }

    if (modePaiement === "virement") {
      return (
        virement.banque.trim().length > 0 &&
        virement.iban.trim().length > 0
      );
    }

    return false;
  };

  const handleSubscribe = async () => {
    if (!plan) {
      return;
    }

    if (!plan.est_gratuit) {
      if (!modePaiement) {
        setErrorMessage("Veuillez choisir un mode de paiement.");
        return;
      }

      if (!isPaymentFormValid()) {
        setErrorMessage(
          "Veuillez compléter tous les champs de paiement requis.",
        );
        return;
      }
    }

    setErrorMessage("");
    setSubmitting(true);

    try {
      await axios.get("/sanctum/csrf-cookie");

      await axios.post("/api/souscriptions", {
        plan_id: plan.id,
        duree_unite: dureeUnite,
        quantite,
        devise,
        mode_paiement: plan.est_gratuit ? null : modePaiement,
        reference_paiement: referencePaiement || null,
        details_paiement: plan.est_gratuit
          ? null
          : buildDetailsPaiement(),
      });

      // Phase de test : on redirige directement vers le dashboard,
      // quel que soit le statut réel de la souscription (actif / en_attente).
      router.push("/dashboard");
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const flattened = Object.values(error.response.data.errors)
          .flat()
          .join(" ");

        setErrorMessage(flattened);
      } else {
        setErrorMessage(
          error.response?.data?.message || "Une erreur est survenue.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingPlan) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <Loader2 className="animate-spin text-red-light" size={28} />
      </div>
    );
  }

  if (notFound || !plan) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center">
          <h1 className="text-lg font-black text-slate-900 mb-2">
            Plan introuvable
          </h1>

          <p className="text-sm text-slate-500 mb-6">
            Le plan demandé n&apos;existe pas ou n&apos;est plus disponible.
          </p>

          <Link
            href="/auth/abonnement"
            className="inline-block py-3 px-6 rounded-xl bg-red-light text-white font-bold text-xs uppercase tracking-widest hover:bg-red-700 transition"
          >
            Voir les plans disponibles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4">
      <div className="max-w-lg mx-auto">
        <Link
          href="/auth/abonnement"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-xs uppercase tracking-widest mb-6"
        >
          <ChevronLeft size={16} />
          Changer de plan
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-xl font-black text-slate-900">
              {plan.nom}
            </h1>

            <span className="text-lg font-black text-slate-900">
              {plan.est_gratuit
                ? "Gratuit"
                : `${(plan.prix * quantite).toFixed(2)} ${devise}`}
            </span>
          </div>

          <p className="text-xs text-slate-500 mb-6">
            {plan.description}
          </p>

          {!plan.est_gratuit && (
            <>
              <div className="mb-5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
                  Durée ({QUANTITE_LIMITS[dureeUnite].min} à{" "}
                  {QUANTITE_LIMITS[dureeUnite].max}{" "}
                  {dureeUnite === "jour"
                    ? "jours"
                    : dureeUnite === "annee"
                      ? "années"
                      : "mois"}
                  )
                </label>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setQuantite((q) => clampQuantite(q - 1))
                    }
                    disabled={
                      quantite <= QUANTITE_LIMITS[dureeUnite].min
                    }
                    className="h-11 w-11 shrink-0 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 font-black text-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    −
                  </button>

                  <input
                    type="number"
                    min={QUANTITE_LIMITS[dureeUnite].min}
                    max={QUANTITE_LIMITS[dureeUnite].max}
                    value={quantite}
                    onChange={(e) =>
                      setQuantite(clampQuantite(Number(e.target.value)))
                    }
                    className="flex-1 h-11 text-center rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold outline-none focus:border-red-light"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setQuantite((q) => clampQuantite(q + 1))
                    }
                    disabled={
                      quantite >= QUANTITE_LIMITS[dureeUnite].max
                    }
                    className="h-11 w-11 shrink-0 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 font-black text-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    +
                  </button>

                  <span className="shrink-0 text-xs font-bold text-slate-500">
                    {uniteLabelCourt(dureeUnite)}
                    {quantite > 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              <div className="mb-5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
                  Mode de paiement
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {MODES_PAIEMENT.map((m) => (
                    <button
                      key={m.code}
                      onClick={() => setModePaiement(m.code)}
                      className={`flex flex-col items-center gap-1.5 py-3 rounded-xl text-[10px] font-bold border transition ${
                        modePaiement === m.code
                          ? "bg-red-light text-white border-red-light"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <m.icon size={16} />
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {modePaiement === "carte" && (
                <div className="space-y-3 mb-5">
                  <input
                    type="text"
                    value={carte.titulaire}
                    onChange={(e) =>
                      setCarte({
                        ...carte,
                        titulaire: e.target.value,
                      })
                    }
                    placeholder="Nom du titulaire"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm outline-none focus:border-red-light"
                  />

                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={19}
                    value={carte.numero}
                    onChange={(e) =>
                      setCarte({
                        ...carte,
                        numero: e.target.value,
                      })
                    }
                    placeholder="Numéro de carte"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm outline-none focus:border-red-light"
                  />

                  <input
                    type="text"
                    maxLength={5}
                    value={carte.expiration}
                    onChange={(e) =>
                      setCarte({
                        ...carte,
                        expiration: e.target.value,
                      })
                    }
                    placeholder="MM/AA"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm outline-none focus:border-red-light"
                  />

                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Pour votre sécurité, le cryptogramme visuel (CVV)
                    n&apos;est jamais demandé ni stocké ici.
                  </p>
                </div>
              )}

              {modePaiement === "mobile_money" && (
                <div className="space-y-3 mb-5">
                  <select
                    value={mobileMoney.operateur}
                    onChange={(e) =>
                      setMobileMoney({
                        ...mobileMoney,
                        operateur: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm outline-none focus:border-red-light"
                  >
                    <option value="">Choisir un opérateur</option>

                    {OPERATEURS_MOBILE_MONEY.map((op) => (
                      <option key={op} value={op}>
                        {op}
                      </option>
                    ))}
                  </select>

                  <input
                    type="tel"
                    value={mobileMoney.telephone}
                    onChange={(e) =>
                      setMobileMoney({
                        ...mobileMoney,
                        telephone: e.target.value,
                      })
                    }
                    placeholder="Numéro de téléphone"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm outline-none focus:border-red-light"
                  />
                </div>
              )}

              {modePaiement === "virement" && (
                <div className="space-y-3 mb-5">
                  <input
                    type="text"
                    value={virement.banque}
                    onChange={(e) =>
                      setVirement({
                        ...virement,
                        banque: e.target.value,
                      })
                    }
                    placeholder="Nom de la banque"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm outline-none focus:border-red-light"
                  />

                  <input
                    type="text"
                    value={virement.titulaire}
                    onChange={(e) =>
                      setVirement({
                        ...virement,
                        titulaire: e.target.value,
                      })
                    }
                    placeholder="Titulaire du compte"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm outline-none focus:border-red-light"
                  />

                  <input
                    type="text"
                    value={virement.iban}
                    onChange={(e) =>
                      setVirement({
                        ...virement,
                        iban: e.target.value,
                      })
                    }
                    placeholder="IBAN / RIB"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm outline-none focus:border-red-light"
                  />
                </div>
              )}

              {modePaiement && (
                <div className="mb-5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
                    Référence de la transaction (optionnel)
                  </label>

                  <input
                    type="text"
                    value={referencePaiement}
                    onChange={(e) =>
                      setReferencePaiement(e.target.value)
                    }
                    placeholder="Ex : ID transaction"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm outline-none focus:border-red-light"
                  />
                </div>
              )}
            </>
          )}

          {errorMessage && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-xs font-medium text-red-600">
              {errorMessage}
            </div>
          )}

          <button
            onClick={handleSubscribe}
            disabled={submitting}
            className="w-full py-4 bg-red-light text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all disabled:opacity-50"
          >
            {submitting
              ? "Traitement..."
              : plan.est_gratuit
                ? "Passer à l'étape suivante"
                : "Confirmer ma souscription"}
          </button>
        </div>
      </div>
    </div>
  );
}

function LoadingPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
      <Loader2 className="animate-spin text-red-light" size={28} />
    </div>
  );
}

export default function ValiderAbonnementPage() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <ValiderAbonnementContent />
    </Suspense>
  );
}
