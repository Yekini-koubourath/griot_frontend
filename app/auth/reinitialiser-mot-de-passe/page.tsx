"use client";

import axios from "@/lib/axios";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Link from "next/link";
import { Lock, Eye, EyeOff, ChevronLeft, CheckCircle2 } from "lucide-react";

function ReinitialiserMotDePasseContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    if (!token || !email) {
      setErrorMessage("Lien de réinitialisation invalide.");
      return;
    }

    if (password !== passwordConfirmation) {
      setErrorMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    try {
      await axios.post("/api/reset-password", {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      setSuccess(true);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message ||
          "Ce lien de réinitialisation est invalide ou a expiré.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="relative w-full max-w-md bg-white/80 backdrop-blur-xl border border-white shadow-2xl rounded-[2.5rem] p-8 sm:p-12 text-center z-10">
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-9 h-9 text-green-600" />
          </div>
        </div>

        <h1 className="text-2xl font-black text-slate-900">
          Mot de passe réinitialisé !
        </h1>

        <p className="text-slate-500 mt-3">
          Vous pouvez maintenant vous connecter avec votre nouveau mot de
          passe.
        </p>

        <Link
          href="/auth/login"
          className="inline-flex items-center justify-center mt-6 px-6 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-md bg-white/80 backdrop-blur-xl border border-white shadow-2xl rounded-[2.5rem] p-8 sm:p-12 z-10">
      <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">
        Nouveau mot de passe.
      </h1>

      <p className="text-slate-500 font-medium text-sm mb-8">
        Choisissez un nouveau mot de passe pour {email || "votre compte"}.
      </p>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
            Nouveau mot de passe
          </label>

          <div className="relative">
            <Lock
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />

            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              placeholder="Min. 8 caractères"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-14 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-red-light focus:ring-4 focus:ring-red-500/5 outline-none transition-all font-medium"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label={
                showPassword
                  ? "Masquer le mot de passe"
                  : "Afficher le mot de passe"
              }
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
            Confirmer le mot de passe
          </label>

          <div className="relative">
            <Lock
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />

            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              placeholder="Répétez le mot de passe"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-red-light focus:ring-4 focus:ring-red-500/5 outline-none transition-all font-medium"
            />
          </div>
        </div>

        {errorMessage && (
          <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm font-medium text-red-600">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-red-light text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
        </button>
      </form>
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="relative w-full max-w-md bg-white/80 backdrop-blur-xl border border-white shadow-2xl rounded-[2.5rem] p-12 text-center text-sm font-medium text-slate-500 z-10">
      Chargement...
    </div>
  );
}

export default function ReinitialiserMotDePassePage() {
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

      <Suspense fallback={<LoadingCard />}>
        <ReinitialiserMotDePasseContent />
      </Suspense>
    </div>
  );
}