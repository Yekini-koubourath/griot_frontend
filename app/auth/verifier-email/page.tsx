"use client";

import axios from "@/lib/axios";
import Link from "next/link";
import { useState } from "react";
import { Mail, RefreshCw } from "lucide-react";

export default function VerifierEmailPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleResend = async () => {
    setLoading(true);
    setMessage("");
    setErrorMessage("");

    try {
      const response = await axios.post("/api/email/resend");
      setMessage(response.data?.message || "Email renvoyé avec succès.");
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message ||
          "Impossible de renvoyer l'email pour le moment.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <Mail className="w-9 h-9 text-red-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-slate-900">
          Vérifiez votre adresse email
        </h1>

        <p className="text-slate-500 mt-3">
          Nous avons envoyé un email de vérification à votre adresse.
          Consultez votre boîte de réception et cliquez sur le lien pour
          activer votre compte.
        </p>

        <p className="text-sm text-slate-400 mt-4">
          Pensez également à vérifier votre dossier spam ou courrier
          indésirable.
        </p>

        {errorMessage && (
          <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm font-medium text-red-600 mt-4">
            {errorMessage}
          </div>
        )}

        {message && (
          <div className="rounded-xl bg-green-50 border border-green-100 px-4 py-3 text-sm font-medium text-green-600 mt-4">
            {message}
          </div>
        )}

        <button
          type="button"
          onClick={handleResend}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 mt-6 px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed w-full"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          {loading ? "Envoi..." : "Renvoyer l'email"}
        </button>

        <Link
          href="/auth/login"
          className="inline-flex items-center justify-center mt-3 px-6 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition w-full"
        >
          Aller à la connexion
        </Link>
      </div>
    </main>
  );
}