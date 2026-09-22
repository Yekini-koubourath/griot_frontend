"use client";

import axios, { setAuthToken } from "@/lib/axios";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Mail,
  Lock,
  ArrowRight,
  ChevronLeft,
  Sparkles,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";

// Composant icône Google Simple
const GoogleIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18a11.99 11.99 0 000 9.88l3.66-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);

export default function LoginPage() {
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrorMessage("");
    setLoading(true);

    try {
      // Connexion avec email et mot de passe
      const response = await axios.post("/api/login", {
        email,
        password,
      });

      console.log("Connexion réussie :", response.data);

      // Sauvegarder le token Sanctum
      if (response.data?.token) {
        setAuthToken(response.data.token);
      }

      const isAdmin = response.data?.user?.role === "admin";

      if (isAdmin) {
        window.location.href = "/admin/dashboard";
      } else {
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
      }
    } catch (error: any) {
      console.error("Erreur de connexion :", error);

      setErrorMessage(
        error?.response?.data?.message ||
          "Adresse e-mail ou mot de passe incorrect.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-red-100/50 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-slate-200/50 blur-[120px] rounded-full" />
      </div>

      <Link
        href="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-red-light transition-colors font-black text-[10px] uppercase tracking-[0.2em] z-50"
      >
        <ChevronLeft size={16} /> Retour
      </Link>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-[1000px] bg-white/80 backdrop-blur-xl border border-white shadow-2xl rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row z-10"
      >
        <div className="w-full md:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
          <div className="mb-10">
            <img
              src="/logo_rouge.png"
              alt="Griot AI"
              className="w-20 h-auto mb-6"
            />

            <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">
              Bon retour.
            </h1>

            <p className="text-slate-500 font-medium text-sm">
              Le Griot est prêt à rédiger vos prochains succès.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
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
                  placeholder="nom@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-red-light focus:ring-4 focus:ring-red-500/5 outline-none transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between px-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Mot de passe
                </label>

                {/* Fix : c'était un bouton mort sans lien ni handler */}
                <Link
                  href="/auth/mot-de-passe-oublie"
                  className="text-[10px] font-bold text-red-light uppercase tracking-widest hover:underline"
                >
                  Oublié ?
                </Link>
              </div>

              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
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

            {errorMessage && (
              <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm font-medium text-red-600">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-red-light text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Connexion..." : "Se Connecter"}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <div className="relative my-8 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>

            <span className="relative px-4 bg-white text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Ou
            </span>
          </div>

          <div className="w-full py-2 rounded-2xl shadow-lg transition-all border border-slate-100 hover:bg-slate-50 flex items-center justify-center gap-2 mt-4">
            <button
              type="button"
              onClick={() => {
                window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google`;
              }}
              className="flex items-center justify-center gap-3 py-3 transition-colors font-bold text-sm text-slate-700"
            >
              <GoogleIcon /> Google
            </button>
          </div>

          <p className="mt-10 text-center text-sm font-medium text-slate-500">
            Nouveau sur Griot AI ?{" "}
            <Link
              href="/auth/register"
              className="text-red-light font-black hover:underline"
            >
              Créer un compte
            </Link>
          </p>
        </div>

        <div className="hidden md:flex w-1/2 bg-slate-900 relative items-center justify-center p-12 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-light/20 blur-[100px] rounded-full" />

          <div className="relative z-10 text-center">
            <Sparkles className="text-red-light w-12 h-12 mx-auto mb-6 animate-pulse" />

            <h2 className="text-4xl font-black text-white tracking-tighter leading-tight mb-4">
              L&apos;IA qui écrit <br />
              pour vous.
            </h2>

            <p className="text-slate-400 font-medium">
              Gagnez 15h par semaine en automatisant vos scripts et vos
              publications.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}