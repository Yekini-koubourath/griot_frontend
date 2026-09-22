"use client";

import axios from "@/lib/axios";
import { useState } from "react";
import Link from "next/link";
import { Mail, ChevronLeft, Send } from "lucide-react";

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setErrorMessage("");
    setLoading(true);

    try {
      const response = await axios.post("/api/forgot-password", { email });
      setMessage(
        response.data?.message ||
          "Si un compte existe avec cette adresse, un email de réinitialisation a été envoyé.",
      );
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message ||
          "Une erreur est survenue. Merci de réessayer.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-red-100/40 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-slate-200/50 blur-[120px] rounded-full" />
      </div>

      <Link
        href="/auth/login"
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-red-light transition-colors font-black text-[10px] uppercase tracking-[0.2em] z-50"
      >
        <ChevronLeft size={16} /> Retour à la connexion
      </Link>

      <div className="relative w-full max-w-md bg-white/80 backdrop-blur-xl border border-white shadow-2xl rounded-[2.5rem] p-8 sm:p-12 z-10">
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">
          Mot de passe oublié.
        </h1>

        <p className="text-slate-500 font-medium text-sm mb-8">
          Entrez votre email, nous vous enverrons un lien pour réinitialiser
          votre mot de passe.
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
              Email
            </label>

            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />

              <input
                type="email"
                required
                placeholder="nom@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-red-light focus:ring-4 focus:ring-red-500/5 outline-none transition-all font-medium"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm font-medium text-red-600">
              {errorMessage}
            </div>
          )}

          {message && (
            <div className="rounded-2xl bg-green-50 border border-green-100 px-4 py-3 text-sm font-medium text-green-600">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-red-light text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Envoi..." : "Envoyer le lien"}
            {!loading && <Send size={16} />}
          </button>
        </form>
      </div>
    </div>
  );
}