"use client";

import axios, { setAuthToken } from "@/lib/axios";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, AlertTriangle } from "lucide-react";

function SocialCallbackContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setError("Connexion Google impossible : jeton manquant.");
      return;
    }

    // Le compte a été créé/authentifié côté Google indépendamment de
    // tout champ du formulaire d'inscription classique. On stocke
    // simplement le token reçu, puis on route l'utilisateur exactement
    // comme après un login classique (même logique rôle/abonnement).
    setAuthToken(token);

    const redirect = async () => {
      try {
        const me = await axios.get("/api/user");
        const isAdmin = me.data?.role === "admin";

        if (isAdmin) {
          window.location.href = "/admin/dashboard";
          return;
        }

        const check = await axios.get("/api/souscriptions/current");
        const souscription = check.data?.souscription;

        const estActive =
          souscription?.statut === "actif" &&
          (!souscription.date_fin ||
            new Date(souscription.date_fin) > new Date());

        if (estActive) {
          window.location.href = "/dashboard";
        } else if (souscription?.statut === "en_attente") {
          window.location.href = "/auth/attente";
        } else {
          window.location.href = "/auth/abonnement";
        }
      } catch (err) {
        console.error("Erreur callback social :", err);
        setError(
          "Impossible de finaliser la connexion. Merci de réessayer.",
        );
      }
    };

    redirect();
  }, [searchParams]);

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-9 h-9 text-red-600" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-slate-900">Oups.</h1>

          <p className="text-slate-500 mt-3">{error}</p>

          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center mt-6 px-6 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition"
          >
            Retour à la connexion
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-3 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        <p className="text-sm font-medium">Connexion en cours...</p>
      </div>
    </main>
  );
}

function LoadingFallback() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <Loader2 className="w-8 h-8 animate-spin text-red-600" />
    </main>
  );
}

export default function SocialCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SocialCallbackContent />
    </Suspense>
  );
}