"use client";

import React, {Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Plus,
  CheckCircle2,
  AlertCircle,
  Settings2,
  MoreHorizontal,
  Users,
  Eye,
  ArrowUpRight,
  RefreshCw,
  ShieldCheck,
  Link2,
  ChevronRight,
  Search,
} from "lucide-react";

import {
  siFacebook,
  siInstagram,
  siTiktok,
  siX,
  siGoogle,
} from "simple-icons";

import axios from "@/lib/axios";

/* =========================================================
   TYPES
========================================================= */

type NetworkStatus = "connected" | "attention" | "disconnected";

type SocialNetwork = {
  id: string;
  name: string;
  description: string;
  username: string;
  status: NetworkStatus;
  followers: string;
  posts: number;
  views: string;
  icon: React.ReactNode;
};

type CompteSocial = {
  id: number;
  reseau: string;
  compte_id: string;
  nom_affichage: string | null;
  nom_utilisateur: string | null;
  avatar_url: string | null;
  statut: "actif" | "expire" | "revoque";
  token_expires_at: string | null;
  created_at: string;
};

/* =========================================================
   RÉSEAUX GÉRÉS PAR OAUTH CÔTÉ BACKEND
   -> ajoute un id ici dès que la route
      /auth/{id}/redirect/{projectId} existe côté Laravel
========================================================= */

const oauthNetworks = ["facebook", "tiktok"];

function getOAuthUrl(networkId: string, projectId: string) {
  return `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/${networkId}/redirect/${projectId}`;
}

/* =========================================================
   LOGO SIMPLE ICON
========================================================= */

function SocialLogo({
  icon,
  className = "h-6 w-6",
}: {
  icon: {
    path: string;
  };
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d={icon.path} />
    </svg>
  );
}

/* =========================================================
   FACEBOOK
========================================================= */

function FacebookIcon() {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1877F2]/10">
      <SocialLogo icon={siFacebook} className="h-6 w-6 text-[#1877F2]" />
    </div>
  );
}

/* =========================================================
   INSTAGRAM
========================================================= */

function InstagramIcon() {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#F58529]/10 via-[#DD2A7B]/10 to-[#8134AF]/10">
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
        <defs>
          <linearGradient
            id="instagramGradient"
            x1="0%"
            y1="100%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#F58529" />
            <stop offset="45%" stopColor="#DD2A7B" />
            <stop offset="75%" stopColor="#8134AF" />
            <stop offset="100%" stopColor="#515BD4" />
          </linearGradient>
        </defs>

        <path fill="url(#instagramGradient)" d={siInstagram.path} />
      </svg>
    </div>
  );
}

/* =========================================================
   LINKEDIN
========================================================= */

function LinkedinIcon() {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0A66C2]/10">
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6 text-[#0A66C2]"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.44-2.13 2.94v5.67H9.35V8.99h3.41v1.56h.05c.47-.9 1.63-1.85 3.35-1.85 3.59 0 4.25 2.36 4.25 5.43v6.32z" />
        <path d="M5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14z" />
        <path d="M3.56 8.99h3.56v11.46H3.56V8.99z" />
      </svg>
    </div>
  );
}

/* =========================================================
   TIKTOK
========================================================= */

function TikTokIcon() {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
      <SocialLogo icon={siTiktok} className="h-6 w-6 text-black" />
    </div>
  );
}

/* =========================================================
   X
========================================================= */

function XIcon() {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
      <SocialLogo icon={siX} className="h-6 w-6 text-black" />
    </div>
  );
}

/* =========================================================
   GOOGLE BUSINESS
========================================================= */

function GoogleIcon() {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
      <SocialLogo icon={siGoogle} className="h-6 w-6 text-[#4285F4]" />
    </div>
  );
}

/* =========================================================
   RÉSEAUX DISPONIBLES
========================================================= */

const availableNetworks: SocialNetwork[] = [
  {
    id: "facebook",
    name: "Facebook",
    description: "Publiez sur votre page Facebook",
    username: "—",
    status: "disconnected",
    followers: "—",
    posts: 0,
    views: "—",
    icon: <FacebookIcon />,
  },
  {
    id: "instagram",
    name: "Instagram",
    description: "Partagez vos contenus Instagram",
    username: "—",
    status: "disconnected",
    followers: "—",
    posts: 0,
    views: "—",
    icon: <InstagramIcon />,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    description: "Développez votre présence professionnelle",
    username: "—",
    status: "disconnected",
    followers: "—",
    posts: 0,
    views: "—",
    icon: <LinkedinIcon />,
  },
  {
    id: "tiktok",
    name: "TikTok",
    description: "Publiez vos vidéos courtes",
    username: "—",
    status: "disconnected",
    followers: "—",
    posts: 0,
    views: "—",
    icon: <TikTokIcon />,
  },
  {
    id: "google",
    name: "Google Business",
    description: "Gérez votre présence Google",
    username: "—",
    status: "disconnected",
    followers: "—",
    posts: 0,
    views: "—",
    icon: <GoogleIcon />,
  },
  {
    id: "x",
    name: "X",
    description: "Partagez vos actualités sur X",
    username: "—",
    status: "disconnected",
    followers: "—",
    posts: 0,
    views: "—",
    icon: <XIcon />,
  },
];

/* =========================================================
   PAGE
========================================================= */

function ReseauxSociauxPageContent() {
  const searchParams = useSearchParams();

  const [search, setSearch] = useState("");
  const [comptesSociaux, setComptesSociaux] = useState<CompteSocial[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddNetwork, setShowAddNetwork] = useState(false);

  const projectId = searchParams.get("project");

  /* =========================================================
     CHARGER LES COMPTES DU PROJET
  ========================================================= */

  useEffect(() => {
    if (!projectId) {
      setComptesSociaux([]);
      return;
    }

    const chargerComptesSociaux = async () => {
      try {
        setLoading(true);

        const response = await axios.get(
          `/api/projects/${projectId}/comptes-sociaux`,
          {
            withCredentials: true,
          }
        );

        setComptesSociaux(response.data.comptes ?? []);
      } catch (error) {
        console.error(
          "Erreur lors du chargement des comptes sociaux :",
          error
        );

        setComptesSociaux([]);
      } finally {
        setLoading(false);
      }
    };

    chargerComptesSociaux();
  }, [projectId]);

  /* =========================================================
     TRANSFORMER LES DONNÉES BACKEND EN CARTES
  ========================================================= */

  const networks: SocialNetwork[] = availableNetworks.map((network) => {
    const compte = comptesSociaux.find((item) => item.reseau === network.id);

    if (!compte) {
      return network;
    }

    return {
      ...network,
      username:
        compte.nom_utilisateur || compte.nom_affichage || "Compte connecté",
      status: compte.statut === "actif" ? "connected" : "attention",
    };
  });

  /* =========================================================
     FILTRE RECHERCHE
  ========================================================= */

  const filteredNetworks = networks.filter((network) =>
    network.name.toLowerCase().includes(search.toLowerCase())
  );

  /* =========================================================
     STATISTIQUES
  ========================================================= */

  const connectedCount = networks.filter(
    (network) => network.status === "connected"
  ).length;

  const attentionCount = networks.filter(
    (network) => network.status === "attention"
  ).length;

  const totalFollowers = "—";

  /* =========================================================
     CONNEXION D'UN RÉSEAU (depuis la modale ou la carte)
  ========================================================= */

  const handleConnect = (networkId: string) => {
    if (!projectId) return;

    if (oauthNetworks.includes(networkId)) {
      window.location.href = getOAuthUrl(networkId, projectId);
      return;
    }

    const network = availableNetworks.find((n) => n.id === networkId);

    window.alert(
      `La connexion ${network?.name ?? networkId} sera bientôt disponible.`
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="min-w-0 pl-14 md:pl-12 lg:pl-0">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
              Gestion des comptes
            </p>

            <h1 className="truncate text-base font-black text-slate-900 sm:text-lg">
              Réseaux sociaux
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/publication"
              className="hidden items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-[10px] font-black uppercase tracking-wide text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 sm:flex"
            >
              <Plus size={15} />
              Créer une publication
            </Link>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-xs font-black text-white">
              Y
            </div>
          </div>
        </div>
      </header>

      {/* =====================================================
          CONTENU
      ===================================================== */}

      <main className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
        {/* =====================================================
            INTRO
        ===================================================== */}

        <section className="mb-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                Vos réseaux sociaux
              </h2>

              <p className="mt-2 max-w-2xl text-xs leading-relaxed text-slate-500 sm:text-sm">
                Connectez et gérez vos comptes sociaux depuis un seul espace.
                Programmez vos publications et suivez vos performances sans
                quitter Griot AI.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddNetwork(true)}
              className="flex w-fit items-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-[10px] font-black uppercase tracking-wide text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700"
            >
              <Plus size={15} />
              Ajouter un réseau
            </button>
          </div>
        </section>

        {/* =====================================================
            STATISTIQUES
        ===================================================== */}

        <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={<Link2 size={18} />}
            label="Réseaux connectés"
            value={`${connectedCount}/6`}
            description="Comptes actifs"
          />

          <StatCard
            icon={<Users size={18} />}
            label="Audience totale"
            value={totalFollowers}
            description={
              projectId ? "Données du projet" : "Sélectionnez un projet"
            }
          />

          <StatCard
            icon={<Eye size={18} />}
            label="Vues ce mois"
            value="—"
            description="Données à venir"
          />

          <StatCard
            icon={<AlertCircle size={18} />}
            label="Action requise"
            value={attentionCount.toString()}
            description="Compte à vérifier"
            warning
          />
        </section>

        {/* =====================================================
            BARRE OUTILS
        ===================================================== */}

        <section className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900">
              Comptes connectés
            </h3>

            <p className="mt-1 text-[10px] text-slate-400">
              Gérez les comptes utilisés pour vos publications.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Rechercher un réseau..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs font-medium outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-500/5"
            />
          </div>
        </section>

        {/* =====================================================
            CHARGEMENT
        ===================================================== */}

        {loading && projectId && (
          <div className="mb-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-500">
            Chargement des réseaux du projet...
          </div>
        )}

        {/* =====================================================
            PAS DE PROJET SÉLECTIONNÉ
        ===================================================== */}

        {!projectId && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-700">
            Sélectionnez un projet (depuis la page Projets) pour pouvoir
            connecter vos réseaux sociaux.
          </div>
        )}

        {/* =====================================================
            RÉSEAUX
        ===================================================== */}

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {filteredNetworks.map((network) => (
            <NetworkCard
              key={network.id}
              network={network}
              projectId={projectId}
              onConnect={handleConnect}
            />
          ))}
        </section>

        {/* =====================================================
            AJOUTER UN RÉSEAU
        ===================================================== */}

        <section className="mt-6 overflow-hidden rounded-2xl border border-red-100 bg-gradient-to-br from-red-50 via-white to-white">
          <div className="flex flex-col gap-6 p-5 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-600 text-white shadow-lg shadow-red-600/20">
                <Plus size={22} />
              </div>

              <div>
                <h3 className="text-sm font-black text-slate-900 sm:text-base">
                  Connectez un nouveau réseau
                </h3>

                <p className="mt-1 max-w-xl text-[10px] leading-relaxed text-slate-500 sm:text-xs">
                  Ajoutez vos comptes sociaux à Griot AI pour centraliser vos
                  publications, votre calendrier et vos statistiques.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAddNetwork(true)}
              className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-[10px] font-black uppercase tracking-wide text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700"
            >
              <Plus size={15} />
              Ajouter un réseau
            </button>
          </div>
        </section>

        {/* =====================================================
            SÉCURITÉ
        ===================================================== */}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck size={21} />
            </div>

            <div className="flex-1">
              <h3 className="text-sm font-black text-slate-900">
                Vos comptes sont protégés
              </h3>

              <p className="mt-1 text-[10px] leading-relaxed text-slate-500 sm:text-xs">
                Griot AI utilise des connexions sécurisées pour accéder à vos
                comptes. Vos identifiants ne sont jamais stockés directement
                dans l'application.
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
            MODALE AJOUTER UN RÉSEAU
        ===================================================== */}

        {showAddNetwork && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
            onClick={() => setShowAddNetwork(false)}
          >
            <div
              className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* HEADER */}

              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Ajouter un réseau
                  </h3>

                  <p className="mt-1 text-[10px] text-slate-400">
                    Choisissez le réseau social que vous souhaitez connecter.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddNetwork(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-lg font-bold text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Fermer"
                >
                  ×
                </button>
              </div>

              {/* RÉSEAUX */}

              <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2">
                {availableNetworks.map((network) => (
                  <button
                    key={network.id}
                    type="button"
                    disabled={!projectId}
                    onClick={() => {
                      setShowAddNetwork(false);
                      handleConnect(network.id);
                    }}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-red-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {network.icon}

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black text-slate-900">
                        {network.name}
                      </p>

                      <p className="mt-0.5 truncate text-[9px] text-slate-400">
                        {network.description}
                      </p>
                    </div>

                    <ChevronRight
                      size={15}
                      className="shrink-0 text-slate-400"
                    />
                  </button>
                ))}
              </div>

              {/* PAS DE PROJET */}

              {!projectId && (
                <div className="border-t border-slate-100 bg-amber-50 px-5 py-3">
                  <p className="text-[10px] font-semibold text-amber-700">
                    Vous devez d'abord sélectionner un projet avant de
                    connecter un réseau social.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  label,
  value,
  description,
  warning = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
  warning?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${
            warning ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
          }`}
        >
          {icon}
        </div>

        {!warning && (
          <ArrowUpRight size={15} className="text-emerald-500" />
        )}
      </div>

      <p className="mt-4 text-[10px] font-bold text-slate-400">{label}</p>

      <p className="mt-1 text-xl font-black text-slate-900">{value}</p>

      <p
        className={`mt-1 text-[9px] font-semibold ${
          warning ? "text-amber-600" : "text-emerald-600"
        }`}
      >
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   NETWORK CARD
========================================================= */

function NetworkCard({
  network,
  projectId,
  onConnect,
}: {
  network: SocialNetwork;
  projectId: string | null;
  onConnect: (networkId: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const isConnected = network.status === "connected";
  const needsAttention = network.status === "attention";

  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {/* HEADER */}

      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {network.icon}

          <div className="min-w-0">
            <h3 className="truncate text-sm font-black text-slate-900">
              {network.name}
            </h3>

            <p className="mt-0.5 truncate text-[9px] text-slate-400">
              {network.description}
            </p>
          </div>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Options"
          >
            <MoreHorizontal size={17} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-9 z-20 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
              <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-[10px] font-semibold text-slate-600 hover:bg-slate-50"
              >
                <Settings2 size={13} />
                Paramètres
              </button>

              <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-[10px] font-semibold text-slate-600 hover:bg-slate-50"
              >
                <RefreshCw size={13} />
                Actualiser
              </button>
            </div>
          )}
        </div>
      </div>

      {/* STATUS */}

      <div className="mt-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <CheckCircle2 size={15} className="text-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-600">
                Connecté
              </span>
            </>
          ) : needsAttention ? (
            <>
              <AlertCircle size={15} className="text-amber-500" />
              <span className="text-[10px] font-bold text-amber-600">
                Connexion à vérifier
              </span>
            </>
          ) : (
            <>
              <AlertCircle size={15} className="text-slate-400" />
              <span className="text-[10px] font-bold text-slate-500">
                Non connecté
              </span>
            </>
          )}
        </div>

        <span className="max-w-[140px] truncate text-[9px] font-semibold text-slate-500">
          {network.username}
        </span>
      </div>

      {/* STATISTIQUES */}

      <div className="mt-5 grid grid-cols-3 divide-x divide-slate-100 rounded-xl bg-slate-50 py-3">
        <MiniStat label="Abonnés" value={network.followers} />
        <MiniStat label="Publications" value={network.posts.toString()} />
        <MiniStat label="Vues" value={network.views} />
      </div>

      {/* ACTION */}

      <div className="mt-4 flex gap-2">
        {isConnected ? (
          <>
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-[10px] font-bold text-slate-600 transition hover:bg-slate-50"
            >
              <Settings2 size={14} />
              Gérer le compte
            </button>

            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <RefreshCw size={14} />
            </button>
          </>
        ) : needsAttention ? (
          <button
            type="button"
            onClick={() => projectId && onConnect(network.id)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-2.5 text-[10px] font-black text-white transition hover:bg-amber-600"
          >
            <RefreshCw size={14} />
            Reconnecter le compte
          </button>
        ) : (
          <button
            type="button"
            disabled={!projectId}
            onClick={() => onConnect(network.id)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-[10px] font-black text-white shadow-md shadow-red-600/15 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Link2 size={14} />
            {projectId ? `Connecter ${network.name}` : "Sélectionnez un projet"}
          </button>
        )}
      </div>
    </article>
  );
}

/* =========================================================
   MINI STAT
========================================================= */

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-[8px] font-semibold text-slate-400">{label}</p>
      <p className="mt-1 text-[11px] font-black text-slate-800">{value}</p>
    </div>
  );
}

function LoadingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-sm font-medium text-slate-500">
        Chargement...
      </div>
    </div>
  );
}

export default function ReseauxSociauxPage() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <ReseauxSociauxPageContent />
    </Suspense>
  );
}