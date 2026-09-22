"use client";

import axios from "@/lib/axios";
import React, {
  useEffect,
  useRef,
  useState,
} from "react";
import GriotAiChat from "../component/ai/GriotAiChat";
import {
  Bell,
  ChevronDown,
  Plus,
  CalendarDays,
  Clock3,
  Sparkles,
  Image as ImageIcon,
  Check,
  Send,
  Save,
  Settings2,
  MoreHorizontal,
  HelpCircle,
  X,
  Pencil,
  Trash2,
  Upload,
  Heart,
  MessageCircle,
  Share2,
  Repeat2,
  Bookmark,
  ThumbsUp,
  MapPin,
  Play,
  Eye,
  CheckCircle2,
  BriefcaseBusiness,
  Users,
  Globe2,
  Loader2,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type Project = {
  id: number;
  name: string;
  description: string;
  color: string;
  initials: string;
  networks: SocialNetwork[];
  networksLoaded: boolean;
};

type SocialNetwork = {
  id: string;
  name: string;
  username: string;
  icon: React.ReactNode;
};

type PostContent = {
  text: string;
  image: string | null;
};

type PublicationMedia = {
  id: number;
  name: string;
  original_name?: string;
  type: "image" | "video" | "document";
  mime_type?: string;
  size?: number;
  path?: string;
  folder?: {
    id: number;
    name: string;
  } | null;
  src?: string;
};

type StoredTemplate = {
  id: number;
  title: string;
  description: string;
  category: string;
  platform: string;
  image: string | null;
  color: string;
  favorite: boolean;
  archived: boolean;
  content: string;
};

type PublicationStatus =
  | "Publiée"
  | "Programmée"
  | "Brouillon"
  | "Échec";

type PublicationNetwork =
  | "Facebook"
  | "Instagram"
  | "LinkedIn"
  | "TikTok"
  | "Google Business"
  | "X";

/* =========================================================
   ICÔNES RÉSEAUX SOCIAUX
========================================================= */

const FacebookIcon = ({ size = 20 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
    <path
      fill="#1877F2"
      d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.019 4.388 11.006 10.125 11.927v-8.432H7.078v-3.495h3.047V9.413c0-3.022 1.791-4.693 4.533-4.693 1.312 0 2.686.236 2.686.236v2.973h-1.514c-1.491 0-1.956.931-1.956 1.887v2.257h3.328l-.532 3.495h-2.796V24C19.612 23.079 24 18.092 24 12.073z"
    />
  </svg>
);

const InstagramIcon = ({ size = 20 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
    <defs>
      <linearGradient id="instagramGradient" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FFDC80" />
        <stop offset="25%" stopColor="#FCAF45" />
        <stop offset="50%" stopColor="#F77737" />
        <stop offset="75%" stopColor="#E1306C" />
        <stop offset="100%" stopColor="#833AB4" />
      </linearGradient>
    </defs>
    <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="url(#instagramGradient)" strokeWidth="2" />
    <circle cx="12" cy="12" r="4" fill="none" stroke="url(#instagramGradient)" strokeWidth="2" />
    <circle cx="17.5" cy="6.5" r="1.2" fill="#E1306C" />
  </svg>
);

const LinkedinIcon = ({ size = 20 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
    <path
      fill="#0A66C2"
      d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.44-2.13 2.94v5.67H9.35V8.99h3.41v1.56h.05c.47-.9 1.63-1.85 3.35-1.85 3.59 0 4.25 2.36 4.25 5.43v6.32zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM3.56 8.99h3.56v11.46H3.56V8.99z"
    />
  </svg>
);

const TikTokIcon = ({ size = 20 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
    <path
      fill="#000000"
      d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.33V2h-3.63v13.67a2.91 2.91 0 1 1-2-2.76V9.23a6.53 6.53 0 1 0 5.63 6.44V8.41a8.43 8.43 0 0 0 4.93 1.58V6.36a4.84 4.84 0 0 1-1.16-.17z"
    />
  </svg>
);

const GoogleBusinessIcon = ({ size = 20 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
    <path fill="#4285F4" d="M21.35 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h5.22a4.46 4.46 0 0 1-1.94 2.93v2.43h3.14c1.84-1.69 2.93-4.18 2.93-7.39z" />
    <path fill="#34A853" d="M12 21.99c2.63 0 4.84-.87 6.45-2.36l-3.14-2.43c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.5A9.75 9.75 0 0 0 12 21.99z" />
    <path fill="#FBBC05" d="M6.54 14.09A5.86 5.86 0 0 1 6.23 12c0-.72.12-1.42.31-2.09V7.41H3.3A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.05 4.59l3.24-2.5z" />
    <path fill="#EA4335" d="M12 5.88c1.43 0 2.72.49 3.73 1.46l2.79-2.79C16.84 2.98 14.63 2.01 12 2.01a9.75 9.75 0 0 0-8.7 5.4l3.24 2.5C7.31 7.6 9.46 5.88 12 5.88z" />
  </svg>
);

const XIcon = ({ size = 20 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
    <path
      fill="#000000"
      d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817-5.963 6.817H1.684l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Z"
    />
  </svg>
);

/* =========================================================
   CONTENU PAR DÉFAUT
========================================================= */

const defaultPostText = `🚀 Nouvelle publication !

Décrivez ici votre idée ou générez le contenu automatiquement.

👉 Personnalisez ce texte pour chaque réseau.`;

const emptyPost: PostContent = {
  text: defaultPostText,
  image: null,
};

/* =========================================================
   UTILITAIRES DATE
========================================================= */

function formatDateForInput(date: string) {
  if (!date) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  const parts = date.split("/");
  if (parts.length !== 3) return "";
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

function formatDateForDisplay(date: string) {
  if (!date) return "";
  const parts = date.split("-");
  if (parts.length !== 3) return date;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function formatDateForApi(date: string): string | null {
  if (!date) return null;
  const parts = date.split("/");
  if (parts.length !== 3) return null;
  return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
}

/* =========================================================
   UTILITAIRES RÉSEAUX
========================================================= */

function getPublicationNetworkName(networkId: string): PublicationNetwork {
  switch (networkId) {
    case "facebook":
      return "Facebook";
    case "instagram":
      return "Instagram";
    case "linkedin":
      return "LinkedIn";
    case "tiktok":
      return "TikTok";
    case "google":
      return "Google Business";
    case "x":
      return "X";
    default:
      return "Facebook";
  }
}

function getNetworkIdFromPublication(network: PublicationNetwork) {
  switch (network) {
    case "Facebook":
      return "facebook";
    case "Instagram":
      return "instagram";
    case "LinkedIn":
      return "linkedin";
    case "TikTok":
      return "tiktok";
    case "Google Business":
      return "google";
    case "X":
      return "x";
    default:
      return "facebook";
  }
}

function getNetworkIcon(networkId: string, size = 16) {
  switch (networkId) {
    case "facebook":
      return <FacebookIcon size={size} />;
    case "instagram":
      return <InstagramIcon size={size} />;
    case "linkedin":
      return <LinkedinIcon size={size} />;
    case "tiktok":
      return <TikTokIcon size={size} />;
    case "google":
      return <GoogleBusinessIcon size={size} />;
    case "x":
      return <XIcon size={size} />;
    default:
      return <Globe2 size={size} />;
  }
}

/**
 * Le champ "reseau" en base (table comptes_sociaux) est déjà une
 * valeur propre issue de l'enum : "tiktok" | "facebook" | "instagram"
 * | "linkedin" | "x". "google" n'existe pas encore dans l'enum.
 * On la fait transiter telle quelle, avec un fallback de sécurité.
 */
function normalizeNetworkType(raw: string): string {
  const value = raw.toLowerCase().trim();

  const allowed = ["tiktok", "facebook", "instagram", "linkedin", "x"];

  return allowed.includes(value) ? value : "facebook";
}

/* =========================================================
   PROJETS — COULEURS / INITIALES
========================================================= */

const PROJECT_COLORS = [
  "bg-red-dark",
  "bg-slate-800",
  "bg-emerald-600",
  "bg-blue-600",
  "bg-purple-600",
  "bg-orange-500",
  "bg-indigo-600",
  "bg-pink-600",
];

function getProjectColor(id: number) {
  return PROJECT_COLORS[id % PROJECT_COLORS.length];
}

function getProjectInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

  return (words[0][0] + words[1][0]).toUpperCase();
}

/* =========================================================
   PAGE
========================================================= */

export default function CreatePublicationPage() {

  const [showAiChat, setShowAiChat] = useState(false);
  const handleUseAiContent = (content: string) => {
  setIdea(content);

  setPosts((current) => {
    const updated = { ...current };

    selectedNetworks.forEach((networkId) => {
      updated[networkId] = {
        text: content,
        image: current[networkId]?.image ?? null,
      };
    });

    return updated;
  });

  setShowAiChat(false);
};
  /* =======================================================
     PROJETS (depuis Laravel)
  ======================================================= */

  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null);
  const [showProjectMenu, setShowProjectMenu] = useState(false);

  const activeProject =
    projects.find((project) => project.id === activeProjectId) ??
    projects[0] ??
    null;

  /* =======================================================
     RÉSEAUX SÉLECTIONNÉS
  ======================================================= */

  const [selectedNetworks, setSelectedNetworks] = useState<string[]>([]);

  /* =======================================================
     MODE DE PUBLICATION
  ======================================================= */

  const [publishMode, setPublishMode] = useState<"now" | "schedule" | "draft">("now");

  /* =======================================================
     IDÉE
  ======================================================= */

  const [idea, setIdea] = useState(
    "Décrivez ici l'idée ou le sujet de votre publication."
  );

  /* =======================================================
     MODÈLE UTILISÉ (reste en localStorage pour l'instant)
  ======================================================= */

  const [usedTemplate, setUsedTemplate] = useState<StoredTemplate | null>(null);

  /* =======================================================
     PUBLICATION EN COURS D'ÉDITION
  ======================================================= */

  const [editingPublicationId, setEditingPublicationId] = useState<number | null>(null);
  const [loadingPublication, setLoadingPublication] = useState(false);

  /* =======================================================
     TITRE / DATE / HEURE
  ======================================================= */

  const [publicationTitle, setPublicationTitle] = useState("Nouvelle publication");
  const [scheduledDate, setScheduledDate] = useState("17/07/2026");
  const [scheduledTime, setScheduledTime] = useState("18:00");

  /* =======================================================
     SAUVEGARDE
  ======================================================= */

  const [saving, setSaving] = useState(false);

  /* =======================================================
     CONTENU PAR RÉSEAU
  ======================================================= */

  const [posts, setPosts] = useState<Record<string, PostContent>>({});

  /* =======================================================
     MÉDIAS DE LA PUBLICATION
  ======================================================= */

  const [selectedMediaIds, setSelectedMediaIds] = useState<number[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<PublicationMedia[]>([]);

  const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

  const getMediaUrl = (path?: string) => {
    if (!path) return "";

    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }

    return `${BACKEND_URL}/storage/${path.replace(/^\/+/, "")}`;
  };

  const openMediaLibrary = () => {
    const currentSelection = {
      ids: selectedMediaIds,
      medias: selectedMedia,
    };

    sessionStorage.setItem(
      "griot_publication_media_selection",
      JSON.stringify(currentSelection)
    );

    const returnTo =
      window.location.pathname + window.location.search;

    window.location.href =
      `/dashboard/medias?select=publication&returnTo=${encodeURIComponent(
        returnTo
      )}`;
  };

  const removeSelectedMedia = (mediaId: number) => {
    setSelectedMediaIds((current) =>
      current.filter((id) => id !== mediaId)
    );

    setSelectedMedia((current) =>
      current.filter((media) => media.id !== mediaId)
    );
  };

  /* =======================================================
     1. CHARGER LES PROJETS DEPUIS LARAVEL
  ======================================================= */

  useEffect(() => {
    const loadProjects = async () => {
      setLoadingProjects(true);

      try {
        const response = await axios.get("/api/projects");

        const data = response.data;

        const rawProjects: any[] = Array.isArray(data)
          ? data
          : Array.isArray(data.projects)
          ? data.projects
          : Array.isArray(data.projects?.data)
          ? data.projects.data
          : [];

        const mappedProjects: Project[] = rawProjects.map((project: any) => {
          const id = Number(project.id);

          return {
            id,
            name: project.name ?? "Projet sans nom",
            description: project.description ?? "",
            color: getProjectColor(id),
            initials: getProjectInitials(project.name ?? "?"),
            networks: [],
            networksLoaded: false,
          };
        });

        setProjects(mappedProjects);

        if (mappedProjects.length > 0) {
          setActiveProjectId((current) => current ?? mappedProjects[0].id);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des projets :", error);
        setProjects([]);
      } finally {
        setLoadingProjects(false);
      }
    };

    loadProjects();
  }, []);

  /* =======================================================
     2. CHARGER LES RÉSEAUX CONNECTÉS DU PROJET ACTIF
        (via /api/projects/{id}/comptes-sociaux)
        Format réel confirmé : { comptes: [{ reseau, nom_utilisateur,
        nom_affichage, statut, ... }] }
  ======================================================= */

  useEffect(() => {
    if (!activeProjectId) return;

    const current = projects.find((p) => p.id === activeProjectId);

    if (current?.networksLoaded) return;

    const loadNetworks = async () => {
      try {
        const response = await axios.get(
          `/api/projects/${activeProjectId}/comptes-sociaux`
        );

        const rawAccounts: any[] = Array.isArray(response.data?.comptes)
          ? response.data.comptes
          : [];

        const networks: SocialNetwork[] = rawAccounts
          // On ne propose à la publication que les comptes encore valides
          .filter((account) => account.statut === "actif")
          .map((account: any) => {
            const networkId = normalizeNetworkType(String(account.reseau));

            return {
              id: networkId,
              name: getPublicationNetworkName(networkId),
              username:
                account.nom_utilisateur ||
                account.nom_affichage ||
                "Compte connecté",
              icon: getNetworkIcon(networkId),
            };
          });

        setProjects((currentProjects) =>
          currentProjects.map((project) =>
            project.id === activeProjectId
              ? { ...project, networks, networksLoaded: true }
              : project
          )
        );

        setSelectedNetworks((currentSelected) =>
          currentSelected.length === 0
            ? networks.map((n) => n.id)
            : currentSelected
        );
      } catch (error) {
        console.error(
          "Erreur lors du chargement des comptes sociaux :",
          error
        );

        setProjects((currentProjects) =>
          currentProjects.map((project) =>
            project.id === activeProjectId
              ? { ...project, networks: [], networksLoaded: true }
              : project
          )
        );
      }
    };

    loadNetworks();
  }, [activeProjectId, projects]);

  /* =======================================================
     3. CHARGER UNE PUBLICATION EXISTANTE OU UN MODÈLE
  ======================================================= */

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const templateId = params.get("template");
    const publicationId = params.get("publication");

    /* =====================================================
       PUBLICATION EXISTANTE — GET /api/publications/{id}
    ===================================================== */

    if (publicationId) {
      const loadPublication = async () => {
        setLoadingPublication(true);

        try {
          const response = await axios.get(
            `/api/publications/${publicationId}`
          );

          const item = response.data;

          setEditingPublicationId(item.id);
          setPublicationTitle(item.title || "Nouvelle publication");

          setScheduledDate(
            item.date ? formatDateForDisplay(item.date) : "17/07/2026"
          );

          setScheduledTime(
            item.time ? String(item.time).slice(0, 5) : "18:00"
          );

          if (item.project_id) {
            setActiveProjectId(Number(item.project_id));
          }

          if (item.status === "Programmée") {
            setPublishMode("schedule");
          } else if (item.status === "Brouillon") {
            setPublishMode("draft");
          } else {
            setPublishMode("now");
          }

          const networkId = getNetworkIdFromPublication(item.network);

          setSelectedNetworks([networkId]);
          setIdea(item.content || "");

          const returnedFromMedia =
            params.get("mediaSelection") === "1";

          if (!returnedFromMedia) {
            const publicationMedias: PublicationMedia[] =
              Array.isArray(item.medias)
                ? item.medias.map((media: any) => ({
                    id: Number(media.id),
                    name:
                      media.name ||
                      media.original_name ||
                      "Média",
                    original_name: media.original_name,
                    type:
                      media.type === "video"
                        ? "video"
                        : media.type === "document"
                        ? "document"
                        : "image",
                    mime_type: media.mime_type,
                    size: Number(media.size ?? 0),
                    path: media.path,
                    folder: media.folder
                      ? {
                          id: Number(media.folder.id),
                          name: media.folder.name,
                        }
                      : null,
                    src: getMediaUrl(media.path),
                  }))
                : [];

            setSelectedMediaIds(
              publicationMedias.map((media) => media.id)
            );
            setSelectedMedia(publicationMedias);
          }

          setPosts((current) => ({
            ...current,
            [networkId]: {
              text: item.content || "",
              image: item.image ?? null,
            },
          }));
        } catch (error) {
          console.error(
            "Erreur lors du chargement de la publication :",
            error
          );

          window.alert("Impossible de charger cette publication.");
        } finally {
          setLoadingPublication(false);
        }
      };

      loadPublication();
      return;
    }

    /* =====================================================
       MODÈLE (reste en localStorage pour l'instant)
    ===================================================== */

    if (templateId) {
      const stored = window.localStorage.getItem("griot_templates");

      if (!stored) return;

      try {
        const templates = JSON.parse(stored) as StoredTemplate[];

        const template = templates.find(
          (item) => String(item.id) === String(templateId)
        );

        if (!template) return;

        setUsedTemplate(template);
        setPublicationTitle(template.title || "Nouvelle publication");
        setIdea(template.content);

        const platformMap: Record<string, string> = {
          Facebook: "facebook",
          Instagram: "instagram",
          LinkedIn: "linkedin",
          TikTok: "tiktok",
          X: "x",
        };

        const availableNetworks = activeProject?.networks ?? [];

        if (template.platform === "Tous les réseaux") {
          setSelectedNetworks(availableNetworks.map((n) => n.id));
        } else {
          const networkId = platformMap[template.platform];

          const networkExists =
            networkId &&
            availableNetworks.some((n) => n.id === networkId);

          setSelectedNetworks(
            networkExists
              ? [networkId]
              : availableNetworks.map((n) => n.id)
          );
        }

        setPosts((current) => {
          const updated = { ...current };

          availableNetworks.forEach((network) => {
            updated[network.id] = {
              text: template.content,
              image: template.image,
            };
          });

          return updated;
        });
      } catch (error) {
        console.error("Erreur lors du chargement du modèle :", error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProject?.networks?.length]);

  /* =======================================================
     RETOUR DE LA BIBLIOTHÈQUE MÉDIA
  ======================================================= */

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("mediaSelection") !== "1") {
      return;
    }

    const stored = sessionStorage.getItem(
      "griot_publication_media_selection"
    );

    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);

      const ids = Array.isArray(parsed?.ids)
        ? parsed.ids
            .map((id: unknown) => Number(id))
            .filter((id: number) => Number.isFinite(id))
        : [];

      const medias: PublicationMedia[] = Array.isArray(parsed?.medias)
        ? parsed.medias
        : [];

      setSelectedMediaIds(ids);
      setSelectedMedia(medias);

      sessionStorage.removeItem(
        "griot_publication_media_selection"
      );

      const cleanParams = new URLSearchParams(window.location.search);
      cleanParams.delete("mediaSelection");

      const cleanUrl =
        window.location.pathname +
        (cleanParams.toString()
          ? `?${cleanParams.toString()}`
          : "");

      window.history.replaceState({}, "", cleanUrl);
    } catch (error) {
      console.error(
        "Impossible de récupérer la sélection de médias :",
        error
      );
    }
  }, []);

  /* =======================================================
     CHANGEMENT DE PROJET
  ======================================================= */

  const handleProjectChange = (project: Project) => {
    setActiveProjectId(project.id);
    setShowProjectMenu(false);

    if (project.networksLoaded) {
      setSelectedNetworks(project.networks.map((n) => n.id));
    } else {
      setSelectedNetworks([]);
    }
  };

  /* =======================================================
     TOGGLE RÉSEAU
  ======================================================= */

  const toggleNetwork = (id: string) => {
    setSelectedNetworks((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  /* =======================================================
     TEXTE / IMAGE PAR RÉSEAU
  ======================================================= */

  const updatePostText = (networkId: string, text: string) => {
    setPosts((current) => ({
      ...current,
      [networkId]: {
        ...(current[networkId] ?? emptyPost),
        text,
      },
    }));

    setIdea(text);
  };

  const updatePostImage = (networkId: string, image: string | null) => {
    setPosts((current) => ({
      ...current,
      [networkId]: {
        ...(current[networkId] ?? { text: idea, image: null }),
        image,
      },
    }));
  };

  const getPost = (networkId: string): PostContent =>
    posts[networkId] ?? { text: idea || defaultPostText, image: null };

  /* =======================================================
     SAUVEGARDER (Laravel)
  ======================================================= */

  const handleSavePublication = async (
    forcedMode?: "now" | "schedule" | "draft"
  ) => {
    if (saving) return;

    if (!activeProject) {
      window.alert("Aucun projet sélectionné.");
      return;
    }

    if (selectedNetworks.length === 0) {
      window.alert("Sélectionnez au moins un réseau social.");
      return;
    }

    const effectiveMode = forcedMode ?? publishMode;

    const statusMap: Record<"now" | "schedule" | "draft", PublicationStatus> = {
      now: "Publiée",
      schedule: "Programmée",
      draft: "Brouillon",
    };

    const status = statusMap[effectiveMode];

    const firstNetworkId = selectedNetworks[0];
    const firstPost = getPost(firstNetworkId);
    const fallbackContent = idea.trim();

    if (!firstPost.text?.trim() && !fallbackContent) {
      window.alert("Le contenu de la publication est vide.");
      return;
    }

    setSaving(true);

    const apiDate = scheduledDate ? formatDateForApi(scheduledDate) : null;

    try {
      /* =============================================
         MODIFICATION — PUT /api/publications/{id}
      ============================================= */

      if (editingPublicationId !== null) {
        const networkId = selectedNetworks[0];
        const post = getPost(networkId);

        await axios.put(`/api/publications/${editingPublicationId}`, {
          project_id: activeProject.id,
          title: publicationTitle.trim() || "Nouvelle publication",
          content: post.text?.trim() || fallbackContent,
          network: getPublicationNetworkName(networkId),
          status,
          date: apiDate,
          time: scheduledTime,
          image: post.image ?? null,
          media_ids: selectedMediaIds,
        });

        window.location.href = "/dashboard/publications";
        return;
      }

      /* =============================================
         CRÉATION — POST /api/publications
         Un appel par réseau sélectionné.
      ============================================= */

      for (const networkId of selectedNetworks) {
        const post = getPost(networkId);
        const content = post.text?.trim() || fallbackContent;

        await axios.post("/api/publications", {
          project_id: activeProject.id,
          title: publicationTitle.trim() || "Nouvelle publication",
          content,
          networks: [getPublicationNetworkName(networkId)],
          status,
          date: apiDate,
          time: scheduledTime,
          image: post.image ?? null,
          media_ids: selectedMediaIds,
        });
      }

      window.location.href = "/dashboard/publications";
    } catch (error: any) {
      console.error("Impossible de sauvegarder la publication :", error);

      const validationErrors = error?.response?.data?.errors;

      if (validationErrors) {
        const firstError = Object.values(validationErrors)
          .flat()
          .find((message) => typeof message === "string");

        window.alert(
          typeof firstError === "string"
            ? firstError
            : "Veuillez vérifier les informations saisies."
        );
      } else {
        window.alert(
          error?.response?.data?.message ||
            "Une erreur est survenue lors de l'enregistrement."
        );
      }

      setSaving(false);
      return;
    }

    setSaving(false);
  };

  /* =======================================================
     RENDU — CHARGEMENT INITIAL DES PROJETS
  ======================================================= */

  if (loadingProjects) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8fc]">
        <Loader2 className="animate-spin text-red-dark" size={28} />
      </div>
    );
  }

  if (!activeProject) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#f7f8fc] px-5 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <BriefcaseBusiness size={24} />
        </div>

        <h2 className="text-sm font-black text-slate-700">
          Aucun projet disponible
        </h2>

        <p className="max-w-sm text-xs text-slate-400">
          Créez d'abord un projet pour pouvoir publier du contenu sur vos
          réseaux sociaux.
        </p>

        
        <a
  href="/dashboard/projets"
          className="mt-2 flex items-center gap-2 rounded-xl bg-red-dark px-4 py-2.5 text-[10px] font-black uppercase tracking-wide text-white hover:bg-red-dark/90"
        >
          <Plus size={14} />
          Créer un projet
        </a>
      </div>
    );
  }

  /* =======================================================
     RENDU PRINCIPAL
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-900">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">

        <div className="mx-auto flex min-h-[72px] w-full max-w-[1800px] items-center px-3 sm:px-5 lg:px-8">

          <div className="min-w-0 flex-1">
            <div className="min-w-0 pl-14 md:pl-12 lg:pl-0">
              <p className="mb-0.5 hidden text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400 md:block">
                Création de contenu
              </p>

              <h1 className="truncate text-[14px] font-extrabold tracking-tight text-slate-900 sm:text-[16px] lg:text-[19px]">
                {editingPublicationId !== null
                  ? "Modifier la publication"
                  : "Créer une publication"}
              </h1>
            </div>
          </div>

          {/* PROJET */}

          <div className="flex flex-none items-center justify-center md:flex-1">
            <div className="relative">
              <button
                onClick={() => setShowProjectMenu((current) => !current)}
                aria-expanded={showProjectMenu}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold shadow-sm transition hover:bg-slate-50"
              >
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-lg text-[9px] font-black text-white ${activeProject.color}`}
                >
                  {activeProject.initials}
                </div>

                <span className="hidden max-w-[120px] truncate sm:block">
                  {activeProject.name}
                </span>

                <ChevronDown
                  size={14}
                  className={`transition-transform ${
                    showProjectMenu ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showProjectMenu && (
                <div className="absolute right-0 top-12 z-50 w-[320px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                      Mes projets
                    </p>
                    <p className="mt-1 text-[10px] text-slate-500">
                      Sélectionnez le projet sur lequel vous travaillez.
                    </p>
                  </div>

                  <div className="max-h-[360px] overflow-y-auto">
                    {projects.map((project) => {
                      const isActive = activeProjectId === project.id;

                      return (
                        <button
                          key={project.id}
                          onClick={() => handleProjectChange(project)}
                          className={`group flex w-full items-start gap-3 border-b border-slate-50 px-4 py-3 text-left transition ${
                            isActive ? "bg-red-50/70" : "hover:bg-slate-50"
                          }`}
                        >
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[9px] font-black text-white shadow-sm ${project.color}`}
                          >
                            {project.initials}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p
                                className={`truncate text-[11px] font-black ${
                                  isActive ? "text-red-dark" : "text-slate-800"
                                }`}
                              >
                                {project.name}
                              </p>

                              {isActive && (
                                <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[7px] font-black uppercase text-red-dark">
                                  Actif
                                </span>
                              )}
                            </div>

                            <div className="mt-2 flex items-center gap-3">
                              <span className="flex items-center gap-1 text-[8px] font-semibold text-slate-400">
                                <Globe2 size={10} />
                                {project.networksLoaded
                                  ? `${project.networks.length} réseaux`
                                  : "Chargement..."}
                              </span>
                            </div>
                          </div>

                          <div className="flex h-7 w-7 shrink-0 items-center justify-center">
                            {isActive ? (
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-dark text-white">
                                <Check size={12} strokeWidth={3} />
                              </span>
                            ) : (
                              <span className="h-5 w-5 rounded-full border border-slate-200 opacity-0 transition group-hover:opacity-100" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <a

                    href="/dashboard/projets"
                    className="flex w-full items-center gap-2 border-t border-slate-100 px-4 py-3 text-xs font-bold text-red-600 transition hover:bg-red-50"
                  >
                    <Plus size={15} />
                    Créer un projet
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* DROITE */}

          <div className="hidden flex-1 items-center justify-end gap-2 md:flex lg:gap-3">

            <button
              className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-black text-white">
                3
              </span>
            </button>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-dark text-xs font-black text-white">
              Y
            </div>
          </div>
        </div>
      </header>

      {/* =====================================================
          CONTENU
      ===================================================== */}

      <main className="mx-auto max-w-[1800px] px-3 py-5 sm:px-5 sm:py-6 lg:px-7 lg:py-7">

        {loadingPublication && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-500">
            <Loader2 className="animate-spin" size={14} />
            Chargement de la publication...
          </div>
        )}

        {/* MODÈLE UTILISÉ */}

        {usedTemplate && (
          <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-red-100 bg-red-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white text-red-dark shadow-sm">
                {usedTemplate.image ? (
                  <img
                    src={usedTemplate.image}
                    alt={usedTemplate.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Sparkles size={17} />
                )}
              </div>

              <div className="min-w-0">
                <p className="text-[8px] font-black uppercase tracking-wider text-red-dark">
                  Modèle utilisé
                </p>
                <p className="truncate text-[11px] font-black text-slate-800">
                  {usedTemplate.title}
                </p>
                <p className="text-[8px] text-slate-500">
                  {usedTemplate.platform}
                </p>
              </div>
            </div>

            <span className="text-[8px] font-semibold text-slate-500">
              Vous pouvez modifier le contenu avant publication.
            </span>
          </div>
        )}

        {/* PROJET */}

        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.03)] sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xs font-black text-white shadow-sm ${activeProject.color}`}
              >
                {activeProject.initials}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-sm font-black text-slate-800">
                    {activeProject.name}
                  </h2>

                  <span className="flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-[8px] font-black text-red-dark">
                    <CheckCircle2 size={10} />
                    Projet actif
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
                <Users size={13} className="text-slate-400" />
                <div>
                  <p className="text-[8px] text-slate-400">
                    Réseaux connectés
                  </p>
                  <p className="text-[9px] font-bold text-slate-700">
                    {activeProject.networksLoaded
                      ? activeProject.networks.length
                      : "..."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-5">
          <p className="text-[11px] font-medium text-slate-400 sm:text-xs">
            Générez, personnalisez et publiez sur les réseaux sociaux de{" "}
            <strong className="font-bold text-slate-600">
              {activeProject.name}
            </strong>
          </p>
        </div>

        {/* GRILLE */}

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[300px_minmax(0,1fr)] 2xl:grid-cols-[320px_minmax(0,1fr)]">

          {/* CONFIGURATION */}

          <div className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.03)] sm:p-5">
              <SectionTitle number="1" title="Configurer votre publication" />

              <div className="mt-5">
                <label className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.08em] text-slate-500">
                  Titre de la publication
                </label>

                <input
                  type="text"
                  value={publicationTitle}
                  onChange={(event) => setPublicationTitle(event.target.value)}
                  maxLength={150}
                  placeholder="Ex : Nouvelle formation Flutter"
                  className="w-full rounded-xl border border-slate-200 bg-[#fafbfc] px-3.5 py-3 text-[11px] font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-red-dark focus:bg-white focus:ring-4 focus:ring-red-dark/10"
                />
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.08em] text-slate-500">
                  Idée / Sujet de votre publication
                  <span className="text-red-500"> *</span>
                </label>

<div className="mb-2 flex items-center justify-between gap-2">
  <span className="text-[9px] font-medium text-slate-400">
    Décrivez simplement ce que vous voulez publier.
  </span>

  <button
    type="button"
    onClick={() => setShowAiChat(true)}
    className="flex shrink-0 items-center gap-1.5 rounded-lg bg-red-dark px-2.5 py-2 text-[8px] font-black text-white shadow-sm transition hover:bg-red-dark/90"
  >
    <Sparkles size={11} />
    Créer avec Griot AI
  </button>
</div>
                <div className="relative">
                  <textarea
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    maxLength={10000}
                    rows={5}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-[#fafbfc] p-3.5 pb-7 text-[11px] font-medium leading-[1.6] text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-red-dark focus:bg-white focus:ring-4 focus:ring-red-dark/10"
                  />

                  <span className="absolute bottom-2.5 right-3 text-[9px] font-medium text-slate-500">
                    {idea.length}/10000
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.08em] text-slate-500">
                  Ton souhaité
                </label>

                <div className="relative">
                  <select className="w-full appearance-none rounded-xl border border-slate-200 bg-[#fafbfc] px-3 py-3 text-[11px] font-semibold text-slate-700 outline-none transition focus:border-red-dark focus:bg-white focus:ring-4 focus:ring-red-light/20">
                    <option>Professionnel & motivant</option>
                    <option>Décontracté</option>
                    <option>Inspirant</option>
                    <option>Commercial</option>
                    <option>Éducatif</option>
                  </select>

                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.08em] text-slate-500">
                  Langue
                </label>

                <div className="relative">
                  <select className="w-full appearance-none rounded-xl border border-slate-200 bg-[#fafbfc] px-3 py-3 text-[11px] font-semibold text-slate-700 outline-none transition focus:border-red-dark focus:bg-white focus:ring-4 focus:ring-red-light/20">
                    <option>Français</option>
                    <option>English</option>
                  </select>

                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>
            </section>

            {/* MÉDIAS */}

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.03)] sm:p-5">
              <SectionTitle number="2" title="Choisir les médias" />

              <p className="mt-1.5 text-[10px] leading-[1.6] text-slate-400">
                Sélectionnez vos images et vidéos depuis votre bibliothèque média.
                Vous pouvez réutiliser les mêmes médias dans plusieurs publications.
              </p>

              {selectedMedia.length > 0 ? (
                <div className="mt-4 space-y-2">
                  {selectedMedia.slice(0, 4).map((media) => (
                    <div
                      key={media.id}
                      className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 p-2"
                    >
                      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-slate-200">
                        {media.type === "image" && media.src ? (
                          <img
                            src={media.src}
                            alt={media.name}
                            className="h-full w-full object-cover"
                          />
                        ) : media.type === "video" && media.src ? (
                          <video
                            src={media.src}
                            muted
                            playsInline
                            preload="metadata"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[8px] font-black text-slate-400">
                            DOC
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[9px] font-black text-slate-700">
                          {media.name}
                        </p>
                        <p className="mt-0.5 truncate text-[8px] text-slate-400">
                          {media.folder?.name || "Sans dossier"}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeSelectedMedia(media.id)}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                        aria-label={`Retirer ${media.name}`}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}

                  {selectedMedia.length > 4 && (
                    <p className="text-[9px] font-bold text-slate-400">
                      + {selectedMedia.length - 4} autre(s) média(s)
                    </p>
                  )}
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center">
                  <ImageIcon
                    size={19}
                    className="mx-auto text-slate-400"
                  />
                  <p className="mt-2 text-[10px] font-bold text-slate-500">
                    Aucun média sélectionné
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={openMediaLibrary}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-red-dark bg-white py-3 text-[10px] font-black uppercase tracking-[0.05em] text-red-dark transition hover:bg-red-50"
              >
                <ImageIcon size={14} />
                {selectedMedia.length > 0
                  ? "Modifier la sélection"
                  : "Choisir dans la bibliothèque"}
              </button>
            </section>

            {/* RÉSEAUX */}

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.03)] sm:p-5">
              <SectionTitle number="3" title="Choisir les réseaux" />

              <p className="mt-1.5 text-[10px] leading-[1.6] text-slate-400">
                Sélectionnez les réseaux sur lesquels vous souhaitez publier pour le projet{" "}
                <strong className="text-slate-600">{activeProject.name}</strong>.
              </p>

              {!activeProject.networksLoaded ? (
                <div className="mt-4 flex items-center justify-center py-6 text-slate-400">
                  <Loader2 className="animate-spin" size={18} />
                </div>
              ) : activeProject.networks.length === 0 ? (
                <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center">
                  <p className="text-[10px] font-bold text-slate-500">
                    Aucun réseau connecté pour ce projet.
                  </p>

                  
                  <a  href={`/dashboard/reseaux_sociaux?project=${activeProject.id}`}
                    className="mt-2 inline-block text-[10px] font-black text-red-dark hover:underline"
                  >
                    Connecter un réseau
                  </a>
                </div>
              ) : (
                <div className="mt-3 divide-y divide-slate-100">
                  {activeProject.networks.map((network) => {
                    const selected = selectedNetworks.includes(network.id);

                    return (
                      <button
                        key={network.id}
                        onClick={() => toggleNetwork(network.id)}
                        aria-pressed={selected}
                        className="group flex w-full items-center gap-3 py-2.5 text-left transition"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 transition group-hover:bg-slate-100">
                          {network.icon}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[11px] font-bold text-slate-800">
                            {network.name}
                          </p>
                          <p className="truncate text-[9px] text-slate-400">
                            {network.username}
                          </p>
                        </div>

                        <div
                          className={`flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-[5px] border transition ${
                            selected
                              ? "border-red-dark bg-red-dark text-white"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {selected && <Check size={12} strokeWidth={3} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  if (!idea.trim()) {
                    window.alert("Écrivez d'abord une idée ou un sujet.");
                    return;
                  }

                  setPosts((current) => {
                    const updated = { ...current };

                    activeProject.networks.forEach((network) => {
                      updated[network.id] = {
                        text: idea,
                        image: current[network.id]?.image ?? null,
                      };
                    });

                    return updated;
                  });
                }}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-red-dark py-3 text-[10px] font-black uppercase tracking-[0.06em] text-white shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition hover:bg-red-dark/90 active:scale-[0.99]"
              >
                <Sparkles size={14} />
                Générer le contenu
              </button>
            </section>
          </div>

          {/* PRÉVISUALISATION */}

          <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.03)]">
            <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-light/10 text-red-dark">
                  <span className="text-[11px] font-black">
                    {selectedNetworks.length}
                  </span>
                </span>

                <div className="min-w-0">
                  <h2 className="truncate text-[13px] font-black text-slate-800 sm:text-sm">
                    Prévisualisation des publications
                  </h2>
                  <p className="mt-0.5 text-[9px] text-slate-400">
                    Aperçu adapté à chaque réseau
                  </p>
                </div>
              </div>

              <span className="flex items-center gap-1 text-[9px] font-semibold text-slate-400">
                <Eye size={12} />
                {editingPublicationId !== null
                  ? "Mode modification"
                  : "Nouvelle publication"}
              </span>
            </div>

            {selectedNetworks.length > 0 && (
              <div className="flex overflow-x-auto border-b border-slate-100 scrollbar-none">
                {selectedNetworks.map((networkId) => {
                  const network = activeProject.networks.find(
                    (item) => item.id === networkId
                  );

                  if (!network) return null;

                  return (
                    <div
                      key={network.id}
                      className="flex shrink-0 items-center gap-2 border-b-2 border-red-dark px-4 py-3 text-[10px] font-bold text-red-dark sm:px-5"
                    >
                      {network.icon}
                      {network.name.split(" ")[0]}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="bg-[#fafbfc] p-3 sm:p-4 lg:p-5">
              {selectedNetworks.length === 0 ? (
                <div className="flex min-h-[350px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-5 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <Share2 size={22} />
                  </div>

                  <h3 className="mt-4 text-sm font-black text-slate-700">
                    Aucun réseau sélectionné
                  </h3>

                  <p className="mt-1 max-w-sm text-[10px] leading-relaxed text-slate-400">
                    Sélectionnez au moins un réseau social pour afficher l'aperçu de votre publication.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
                  {selectedNetworks.map((networkId) => {
                    const network = activeProject.networks.find(
                      (item) => item.id === networkId
                    );

                    if (!network) return null;

                    return (
                      <NetworkPreview
                        key={networkId}
                        network={network}
                        post={getPost(networkId)}
                        onTextChange={(text) => updatePostText(networkId, text)}
                        onImageChange={(image) =>
                          updatePostImage(networkId, image)
                        }
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* PLANIFICATION */}

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.03)] sm:p-5">
          <SectionTitle number="4" title="Planification et publication" />

          <div className="mt-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <PublishOption
                active={publishMode === "now"}
                onClick={() => setPublishMode("now")}
                label="Publier maintenant"
              />
              <PublishOption
                active={publishMode === "schedule"}
                onClick={() => setPublishMode("schedule")}
                label="Programmer pour plus tard"
              />
              <PublishOption
                active={publishMode === "draft"}
                onClick={() => setPublishMode("draft")}
                label="Enregistrer comme brouillon"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[10px] font-bold text-slate-600 transition hover:bg-slate-50">
                <CalendarDays size={14} />
                <input
                  type="date"
                  value={formatDateForInput(scheduledDate)}
                  onChange={(event) =>
                    setScheduledDate(
                      formatDateForDisplay(event.target.value)
                    )
                  }
                  className="bg-transparent outline-none"
                />
              </label>

              <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[10px] font-bold text-slate-600 transition hover:bg-slate-50">
                <Clock3 size={14} />
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(event) => setScheduledTime(event.target.value)}
                  className="bg-transparent outline-none"
                />
              </label>

              <span className="flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[10px] font-bold text-slate-600">
                GMT +1
              </span>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[10px] font-bold text-slate-600 transition hover:bg-slate-50"
              >
                <Settings2 size={14} />
                Personnaliser par réseau
              </button>

              <button
                type="button"
                onClick={() => handleSavePublication("draft")}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[10px] font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={14} />
                {saving ? "Enregistrement..." : "Brouillon"}
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleSavePublication()}
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-xl bg-red-dark px-6 py-3 text-[10px] font-black uppercase tracking-[0.05em] text-white shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition hover:bg-red-dark/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? <Save size={14} /> : <Send size={14} />}

              {saving
                ? "Enregistrement..."
                : publishMode === "schedule"
                ? "Programmer"
                : publishMode === "draft"
                ? "Enregistrer"
                : editingPublicationId !== null
                ? "Mettre à jour"
                : "Publier maintenant"}

              {!saving && <ChevronDown size={13} />}
            </button>
          </div>
        </section>

        {/* RÉSUMÉ */}

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[10px] text-slate-400">
          <span>
            <strong className="text-slate-700">
              {selectedNetworks.length}
            </strong>{" "}
            réseaux sélectionnés
          </span>

          <span className="hidden h-3 w-px bg-slate-200 sm:block" />

          <span>
            <strong className="text-slate-700">
              {selectedMediaIds.length}
            </strong>{" "}
            média{selectedMediaIds.length > 1 ? "s" : ""} sélectionné
            {selectedMediaIds.length > 1 ? "s" : ""}
          </span>

          <span className="hidden h-3 w-px bg-slate-200 sm:block" />

          <span className="flex items-center gap-1">
            <ImageIcon size={12} />
            Images personnalisables
          </span>

          <span className="hidden h-3 w-px bg-slate-200 sm:block" />

          <span>
            Projet :{" "}
            <strong className="text-slate-600">{activeProject.name}</strong>
          </span>

          <span className="hidden h-3 w-px bg-slate-200 sm:block" />

          <span>
            Ton :{" "}
            <strong className="text-slate-600">
              Professionnel & motivant
            </strong>
          </span>

          <span className="hidden h-3 w-px bg-slate-200 sm:block" />

          <span>
            Langue : <strong className="text-slate-600">Français</strong>
          </span>
        </div>

        {/* ASTUCE */}

        <div className="mt-3 flex items-start gap-3 rounded-xl border border-[#eee7c8] bg-[#fffdf3] px-4 py-3">
          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#fff4c7] text-[#b98a00]">
            ✦
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black text-slate-700">Astuce IA</p>
            <p className="mt-0.5 text-[9px] leading-relaxed text-slate-500">
              Les publications avec image génèrent généralement davantage d'engagement sur les réseaux sociaux.
            </p>
          </div>

          <button
            type="button"
            aria-label="Fermer"
            className="text-slate-400 transition hover:text-slate-600"
          >
            <X size={14} />
          </button>
        </div>
      </main>
      <GriotAiChat
  open={showAiChat}
  onClose={() => setShowAiChat(false)}
  idea={idea}
  onUseContent={handleUseAiContent}
/>
    </div>
  );
}

/* =========================================================
   TITRE SECTION
========================================================= */

function SectionTitle({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-red-dark text-[10px] font-black text-white shadow-sm">
        {number}
      </div>
      <h2 className="text-[12px] font-black text-slate-800 sm:text-[13px]">
        {title}
      </h2>
    </div>
  );
}

/* =========================================================
   APERÇU RÉSEAU
========================================================= */

function NetworkPreview({
  network,
  post,
  onTextChange,
  onImageChange,
}: {
  network: SocialNetwork;
  post: PostContent;
  onTextChange: (text: string) => void;
  onImageChange: (image: string | null) => void;
}) {
  switch (network.id) {
    case "facebook":
      return (
        <FacebookPreview
          network={network}
          post={post}
          onTextChange={onTextChange}
          onImageChange={onImageChange}
        />
      );
    case "instagram":
      return (
        <InstagramPreview
          network={network}
          post={post}
          onTextChange={onTextChange}
          onImageChange={onImageChange}
        />
      );
    case "linkedin":
      return (
        <LinkedinPreview
          network={network}
          post={post}
          onTextChange={onTextChange}
          onImageChange={onImageChange}
        />
      );
    case "tiktok":
      return (
        <TikTokPreview
          network={network}
          post={post}
          onTextChange={onTextChange}
          onImageChange={onImageChange}
        />
      );
    case "google":
      return (
        <GooglePreview
          network={network}
          post={post}
          onTextChange={onTextChange}
          onImageChange={onImageChange}
        />
      );
    default:
      return null;
  }
}

/* =========================================================
   TOOLBAR
========================================================= */

function PostEditorToolbar({
  networkId,
  text,
  image,
  onTextChange,
  onImageChange,
}: {
  networkId: string;
  text: string;
  image: string | null;
  onTextChange: (text: string) => void;
  onImageChange: (image: string | null) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      window.alert("Veuillez sélectionner une image.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        onImageChange(reader.result);
      }
    };

    reader.readAsDataURL(file);
    setMenuOpen(false);
    event.target.value = "";
  };

  const removeImage = () => {
    onImageChange(null);
    setMenuOpen(false);
  };

  return (
    <>
      <div className="absolute right-3 top-3 z-30">
        <button
          type="button"
          onClick={() => setMenuOpen((current) => !current)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white/95 text-slate-500 shadow-sm backdrop-blur transition hover:bg-slate-50 hover:text-slate-800"
          aria-label="Modifier la publication"
        >
          <MoreHorizontal size={16} />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-10 z-50 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1.5 shadow-2xl">
            <button
              type="button"
              onClick={() => {
                setEditing(true);
                setMenuOpen(false);
              }}
              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[10px] font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Pencil size={14} />
              Modifier le texte
            </button>

            <button
              type="button"
              onClick={() => {
                fileInputRef.current?.click();
                setMenuOpen(false);
              }}
              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[10px] font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Upload size={14} />
              Modifier l'image
            </button>

            {image && (
              <button
                type="button"
                onClick={removeImage}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[10px] font-semibold text-red-600 transition hover:bg-red-50"
              >
                <Trash2 size={14} />
                Supprimer l'image
              </button>
            )}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

      {editing && (
        <div className="absolute inset-x-3 top-14 z-40 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[10px] font-black text-slate-800">
              Modifier le texte
            </p>

            <button
              type="button"
              onClick={() => setEditing(false)}
              className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
            >
              <X size={13} />
            </button>
          </div>

          <textarea
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            rows={7}
            className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-[10px] leading-relaxed text-slate-700 outline-none focus:border-red-dark focus:bg-white focus:ring-4 focus:ring-red-light/20"
          />

          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-lg bg-red-dark px-3 py-2 text-[9px] font-black text-white transition hover:bg-red-dark/90"
            >
              Terminer
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* =========================================================
   FACEBOOK
========================================================= */

function FacebookPreview({
  network,
  post,
  onTextChange,
  onImageChange,
}: {
  network: SocialNetwork;
  post: PostContent;
  onTextChange: (text: string) => void;
  onImageChange: (image: string | null) => void;
}) {
  return (
    <article className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.035)]">
      <PostEditorToolbar
        networkId={network.id}
        text={post.text}
        image={post.image}
        onTextChange={onTextChange}
        onImageChange={onImageChange}
      />

      <PreviewHeader icon={<FacebookIcon />} platform="Facebook" />

      <div className="flex items-center gap-2 px-3.5 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-[9px] font-black">
          {network.username.charAt(0)}
        </div>

        <div className="min-w-0">
          <p className="text-[9px] font-black text-slate-800">
            {network.username}
          </p>
          <p className="text-[8px] text-slate-400">À l'instant · 🌎</p>
        </div>
      </div>

      <div className="px-3.5 pb-3">
        <p className="whitespace-pre-line text-[9px] leading-[1.65] text-slate-600">
          {post.text}
        </p>
      </div>

      <PreviewImage
        image={post.image}
        alt="Publication Facebook"
        aspect="aspect-[1.91/1]"
        onChange={onImageChange}
      />

      <div className="px-3.5 py-2.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2 text-[8px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-white">
              <ThumbsUp size={8} />
            </span>
            128
          </span>
          <span>12 commentaires · 8 partages</span>
        </div>

        <div className="grid grid-cols-3 pt-2 text-[8px] font-semibold text-slate-500">
          <span className="flex items-center justify-center gap-1">
            <ThumbsUp size={11} />
            J'aime
          </span>
          <span className="flex items-center justify-center gap-1">
            <MessageCircle size={11} />
            Commenter
          </span>
          <span className="flex items-center justify-center gap-1">
            <Share2 size={11} />
            Partager
          </span>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   INSTAGRAM
========================================================= */

function InstagramPreview({
  network,
  post,
  onTextChange,
  onImageChange,
}: {
  network: SocialNetwork;
  post: PostContent;
  onTextChange: (text: string) => void;
  onImageChange: (image: string | null) => void;
}) {
  return (
    <article className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.035)]">
      <PostEditorToolbar
        networkId={network.id}
        text={post.text}
        image={post.image}
        onTextChange={onTextChange}
        onImageChange={onImageChange}
      />

      <PreviewHeader icon={<InstagramIcon />} platform="Instagram" />

      <div className="flex items-center gap-2 px-3.5 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 via-pink-500 to-purple-600 p-[2px]">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-[8px] font-black">
            {network.username.charAt(1)}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-black text-slate-800">
            {network.username}
          </p>
        </div>

        <MoreHorizontal size={15} className="text-slate-400" />
      </div>

      <PreviewImage
        image={post.image}
        alt="Publication Instagram"
        aspect="aspect-square"
        onChange={onImageChange}
      />

      <div className="px-3.5 pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart size={16} />
            <MessageCircle size={16} />
            <Share2 size={16} />
          </div>
          <Bookmark size={16} />
        </div>

        <p className="mt-2 text-[9px] font-black text-slate-800">
          128 J'aime
        </p>
      </div>

      <div className="px-3.5 pb-4 pt-2">
        <p className="line-clamp-7 whitespace-pre-line text-[9px] leading-[1.6] text-slate-600">
          <strong className="font-black text-slate-800">
            {network.username}
          </strong>{" "}
          {post.text}
        </p>

        <p className="mt-2 text-[8px] text-slate-400">
          Voir les 12 commentaires
        </p>
      </div>
    </article>
  );
}

/* =========================================================
   LINKEDIN
========================================================= */

function LinkedinPreview({
  network,
  post,
  onTextChange,
  onImageChange,
}: {
  network: SocialNetwork;
  post: PostContent;
  onTextChange: (text: string) => void;
  onImageChange: (image: string | null) => void;
}) {
  return (
    <article className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.035)]">
      <PostEditorToolbar
        networkId={network.id}
        text={post.text}
        image={post.image}
        onTextChange={onTextChange}
        onImageChange={onImageChange}
      />

      <PreviewHeader icon={<LinkedinIcon />} platform="LinkedIn" />

      <div className="flex items-start gap-2 px-3.5 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[9px] font-black">
          {network.username.charAt(0)}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-black text-slate-800">
            {network.username}
          </p>
          <p className="text-[8px] text-slate-400">
            Développement & Formation · 1 h
          </p>
        </div>

        <button type="button" className="text-[9px] font-bold text-blue-600">
          + Suivre
        </button>
      </div>

      <div className="px-3.5 pb-3">
        <p className="whitespace-pre-line text-[9px] leading-[1.65] text-slate-600">
          {post.text}
        </p>
      </div>

      <PreviewImage
        image={post.image}
        alt="Publication LinkedIn"
        aspect="aspect-[1.91/1]"
        onChange={onImageChange}
      />

      <div className="px-3.5 py-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2 text-[8px] text-slate-400">
          <span className="flex items-center gap-1">
            👍 ❤️ 💡
            <span>128</span>
          </span>
          <span>14 commentaires · 5 reposts</span>
        </div>

        <div className="grid grid-cols-3 pt-2 text-[8px] font-semibold text-slate-500">
          <span className="flex items-center justify-center gap-1">
            <ThumbsUp size={11} />
            J'aime
          </span>
          <span className="flex items-center justify-center gap-1">
            <MessageCircle size={11} />
            Commenter
          </span>
          <span className="flex items-center justify-center gap-1">
            <Repeat2 size={11} />
            Republier
          </span>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   TIKTOK
========================================================= */

function TikTokPreview({
  network,
  post,
  onTextChange,
  onImageChange,
}: {
  network: SocialNetwork;
  post: PostContent;
  onTextChange: (text: string) => void;
  onImageChange: (image: string | null) => void;
}) {
  return (
    <article className="relative overflow-hidden rounded-xl border border-slate-200 bg-black shadow-[0_2px_8px_rgba(15,23,42,0.08)]">
      <PostEditorToolbar
        networkId={network.id}
        text={post.text}
        image={post.image}
        onTextChange={onTextChange}
        onImageChange={onImageChange}
      />

      <div className="absolute left-3 right-12 top-3 z-20 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[8px] font-black">
          {network.username.charAt(1)}
        </div>

        <div className="min-w-0">
          <p className="text-[9px] font-black text-white">
            {network.username}
          </p>
          <p className="text-[7px] text-white/70">Original sound</p>
        </div>
      </div>

      <div className="relative aspect-[9/16] w-full overflow-hidden bg-slate-900">
        {post.image ? (
          <img
            src={post.image}
            alt="Publication TikTok"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-slate-900 text-white">
            <Play size={28} />
            <p className="mt-2 text-[9px] font-bold">
              Ajoutez une vidéo ou une image
            </p>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

        <div className="absolute bottom-24 right-3 z-20 flex flex-col items-center gap-4 text-white">
          <div className="flex flex-col items-center gap-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 backdrop-blur">
              <Heart size={19} fill="white" />
            </div>
            <span className="text-[8px] font-bold">128</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <MessageCircle size={20} />
            <span className="text-[8px] font-bold">12</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <Bookmark size={19} />
            <span className="text-[8px] font-bold">24</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <Share2 size={19} />
            <span className="text-[8px] font-bold">Partager</span>
          </div>
        </div>

        <div className="absolute bottom-4 left-3 right-14 z-20">
          <p className="whitespace-pre-line text-[9px] font-medium leading-[1.55] text-white">
            {post.text}
          </p>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   GOOGLE BUSINESS
========================================================= */

function GooglePreview({
  network,
  post,
  onTextChange,
  onImageChange,
}: {
  network: SocialNetwork;
  post: PostContent;
  onTextChange: (text: string) => void;
  onImageChange: (image: string | null) => void;
}) {
  return (
    <article className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.035)]">
      <PostEditorToolbar
        networkId={network.id}
        text={post.text}
        image={post.image}
        onTextChange={onTextChange}
        onImageChange={onImageChange}
      />

      <PreviewHeader icon={<GoogleBusinessIcon />} platform="Google Business" />

      <div className="px-3.5 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-[9px] font-black">
            {network.username.charAt(0)}
          </div>

          <div className="min-w-0">
            <p className="text-[9px] font-black text-slate-800">
              {network.username}
            </p>

            <div className="flex items-center gap-1 text-[8px] text-slate-400">
              <span>Google</span>
              <span>·</span>
              <span>Il y a 1 h</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-3.5 pb-3">
        <p className="whitespace-pre-line text-[9px] leading-[1.65] text-slate-600">
          {post.text}
        </p>
      </div>

      <PreviewImage
        image={post.image}
        alt="Publication Google Business"
        aspect="aspect-[1.91/1]"
        onChange={onImageChange}
      />

      <div className="p-3.5">
        <div className="flex items-center gap-1 text-[8px] text-slate-500">
          <MapPin size={11} />
          <span>Cotonou · Ouvert</span>
        </div>

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-[8px] font-bold text-slate-600"
          >
            <Eye size={11} />
            Voir
          </button>

          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 py-2 text-[8px] font-bold text-white"
          >
            En savoir plus
          </button>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   HEADER APERÇU
========================================================= */

function PreviewHeader({
  icon,
  platform,
}: {
  icon: React.ReactNode;
  platform: string;
}) {
  return (
    <div className="border-b border-slate-100 px-3.5 py-3">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50">
          {icon}
        </div>

        <div>
          <p className="text-[10px] font-black text-slate-800">{platform}</p>
          <p className="text-[8px] text-slate-400">
            Aperçu de la publication
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   IMAGE
========================================================= */

function PreviewImage({
  image,
  alt,
  aspect,
  onChange,
}: {
  image: string | null;
  alt: string;
  aspect: string;
  onChange: (image: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      window.alert("Veuillez sélectionner une image.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        onChange(reader.result);
      }
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  };

  if (!image) {
    return (
      <div className="relative mx-3.5 overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50">
        <div className="flex aspect-[1.5/1] flex-col items-center justify-center px-5 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
            <ImageIcon size={19} />
          </div>

          <p className="mt-2 text-[9px] font-bold text-slate-600">
            Aucune image
          </p>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-2 flex items-center gap-1.5 rounded-lg bg-red-dark px-3 py-2 text-[8px] font-black text-white"
          >
            <Upload size={11} />
            Ajouter une image
          </button>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
      </div>
    );
  }

  return (
    <div className="group/image relative mx-3.5 overflow-hidden rounded-xl bg-slate-100">
      <img
        src={image}
        alt={alt}
        className={`${aspect} w-full object-cover transition duration-500 group-hover/image:scale-[1.01]`}
      />

      <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover/image:bg-black/30 group-hover/image:opacity-100">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-[8px] font-black text-slate-700 shadow-lg transition hover:bg-slate-50"
          >
            <Upload size={12} />
            Modifier
          </button>

          <button
            type="button"
            onClick={() => onChange(null)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-red-600 shadow-lg transition hover:bg-red-50"
            aria-label="Supprimer l'image"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}

/* =========================================================
   OPTION PUBLICATION
========================================================= */

function PublishOption({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 text-[10px] font-semibold text-slate-600 transition hover:text-slate-900"
    >
      <span
        className={`flex h-4 w-4 items-center justify-center rounded-full border transition ${
          active ? "border-red-dark" : "border-slate-300"
        }`}
      >
        {active && <span className="h-2 w-2 rounded-full bg-red-light" />}
      </span>
      {label}
    </button>
  );
}