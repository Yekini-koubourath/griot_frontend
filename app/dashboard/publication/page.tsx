"use client";

import axios from "@/lib/axios";

import React, {
  useEffect,
  useRef,
  useState,
} from "react";

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
   ICONES RÉSEAUX
========================================================= */

function FacebookIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M14.5 8H17V4.5c-.43-.06-1.91-.17-3.63-.17-3.6 0-6.07 2.2-6.07 6.24V14H3.5v3.91H7.3V24h4.66v-6.09h3.87l.61-3.91h-4.48v-3.1c0-1.13.31-1.9 2.54-1.9Z" />
    </svg>
  );
}

function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle
        cx="12"
        cy="12"
        r="4"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
    </svg>
  );
}

function LinkedinIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M5.16 3.5A2.66 2.66 0 1 1 5.16 8.82a2.66 2.66 0 0 1 0-5.32ZM2.75 10.7h4.82V24H2.75V10.7Zm7.82 0h4.62v1.82h.07c.64-1.2 2.21-2.47 4.55-2.47 4.87 0 5.77 3.2 5.77 7.37V24h-4.82v-5.83c0-1.39-.03-3.18-1.94-3.18-1.94 0-2.24 1.51-2.24 3.08V24h-4.82V10.7Z" />
    </svg>
  );
}

function TikTokIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M15.8 2h3.06c.22 1.44 1.03 2.72 2.25 3.56a6.44 6.44 0 0 0 2.89 1.03v3.12a9.62 9.62 0 0 1-2.89-.67v6.34c0 4.05-3.28 6.62-7.13 6.62-3.47 0-6.48-2.22-6.48-5.87 0-3.73 3.05-6.04 6.42-6.04.4 0 .8.03 1.18.1v3.17a4.4 4.4 0 0 0-1.12-.14c-1.45 0-3.18.91-3.18 2.86 0 1.7 1.35 2.79 3.08 2.79 2.11 0 3.92-1.27 3.92-4.2V2Z" />
    </svg>
  );
}

function GoogleBusinessIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M21.35 12.27c0-.73-.06-1.26-.2-1.81H12v3.43h5.38c-.11.85-.7 2.13-2 2.99l-.02.11 2.91 2.25.2.02c1.89-1.74 2.88-4.3 2.88-6.99Z"
        fill="#4285F4"
      />
      <path
        d="M12 21.99c2.7 0 4.97-.89 6.63-2.43l-3.16-2.45c-.85.59-1.99 1.01-3.47 1.01-2.65 0-4.9-1.74-5.7-4.16l-.1.01-3.02 2.34-.04.09C4.79 19.75 8.1 21.99 12 21.99Z"
        fill="#34A853"
      />
      <path
        d="M6.3 13.96A6.03 6.03 0 0 1 5.98 12c0-.68.12-1.34.32-1.96l-.01-.13-3.06-2.38-.1.05A9.99 9.99 0 0 0 2 12c0 1.59.38 3.1 1.06 4.42l3.24-2.46Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.88c1.88 0 3.17.81 3.9 1.49l2.84-2.77C16.96 2.97 14.7 2 12 2 8.1 2 4.79 4.24 3.16 7.43l3.15 2.45C7.1 7.62 9.35 5.88 12 5.88Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function XIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2H21.5l-7.11 8.13L22.75 22h-6.56l-5.14-6.71L5.18 22H1.92l7.6-8.69L1.5 2h6.73l4.65 6.15L18.244 2Zm-1.15 17.83h1.81L7.23 4.06H5.29L17.094 19.83Z" />
    </svg>
  );
}

/* =========================================================
   VALEURS PAR DÉFAUT
========================================================= */

const defaultPostText = `🚀 Nouvelle publication !

Décrivez ici votre idée ou générez le contenu automatiquement.

👉 Personnalisez ce texte pour chaque réseau.`;

const emptyPost: PostContent = {
  text: defaultPostText,
  image: null,
};

/* =========================================================
   HELPERS DATE
========================================================= */

function formatDateForInput(date: string) {
  if (!date) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }

  const parts = date.split("/");

  if (parts.length !== 3) {
    return "";
  }

  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

function formatDateForDisplay(date: string) {
  if (!date) return "";

  const parts = date.split("-");

  if (parts.length !== 3) {
    return date;
  }

  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function formatDateForApi(date: string): string | null {
  if (!date) return null;

  const parts = date.split("/");

  if (parts.length !== 3) {
    return null;
  }

  return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(
    2,
    "0"
  )}`;
}

/* =========================================================
   HELPERS RÉSEAUX
========================================================= */

function getPublicationNetworkName(
  networkId: string
): PublicationNetwork {
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

function getNetworkIdFromPublication(
  network: PublicationNetwork
) {
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

function normalizeNetworkType(raw: string): string {
  const value = raw.toLowerCase().trim();

  const allowed = [
    "tiktok",
    "facebook",
    "instagram",
    "linkedin",
    "x",
    "google",
    "google business",
  ];

  if (allowed.includes(value)) {
    if (value === "google business") {
      return "google";
    }

    return value;
  }

  return "facebook";
}

/* =========================================================
   PROJETS
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
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "?";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return (
    words[0][0] + words[1][0]
  ).toUpperCase();
}

/* =========================================================
   PAGE
========================================================= */

export default function CreatePublicationPage() {
  /* =======================================================
     IA
  ======================================================= */

  const [generatingContent, setGeneratingContent] =
    useState(false);

  /* =======================================================
     PROJETS
  ======================================================= */

  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] =
    useState(true);

  const [activeProjectId, setActiveProjectId] =
    useState<number | null>(null);

  const [showProjectMenu, setShowProjectMenu] =
    useState(false);

  const activeProject =
    projects.find(
      (project) => project.id === activeProjectId
    ) ??
    projects[0] ??
    null;

  /* =======================================================
     RÉSEAUX
  ======================================================= */

  const [selectedNetworks, setSelectedNetworks] =
    useState<string[]>([]);

  /* =======================================================
     PUBLICATION
  ======================================================= */

  const [publishMode, setPublishMode] = useState<
    "now" | "schedule" | "draft"
  >("now");

  const [publicationTitle, setPublicationTitle] =
    useState("Nouvelle publication");

  const [idea, setIdea] = useState(
    "Décrivez ici l'idée ou le sujet de votre publication."
  );

  const [tone, setTone] = useState(
    "Professionnel & motivant"
  );

  const [language, setLanguage] =
    useState("Français");

  const [scheduledDate, setScheduledDate] =
    useState("17/07/2026");

  const [scheduledTime, setScheduledTime] =
    useState("18:00");

  /* =======================================================
     POSTS
  ======================================================= */

  const [posts, setPosts] = useState<
    Record<string, PostContent>
  >({});

  /* =======================================================
     MÉDIAS
  ======================================================= */

  const [selectedMediaIds, setSelectedMediaIds] =
    useState<number[]>([]);

  const [selectedMedia, setSelectedMedia] =
    useState<PublicationMedia[]>([]);

  /* =======================================================
     TEMPLATES
  ======================================================= */

  const [usedTemplate, setUsedTemplate] =
    useState<StoredTemplate | null>(null);

  /* =======================================================
     ÉDITION
  ======================================================= */

  const [editingPublicationId, setEditingPublicationId] =
    useState<number | null>(null);

  const [loadingPublication, setLoadingPublication] =
    useState(false);

  const [saving, setSaving] = useState(false);

  /* =======================================================
     BACKEND
  ======================================================= */

  const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "http://localhost:8000";

  const getMediaUrl = (path?: string) => {
    if (!path) {
      return "";
    }

    if (
      path.startsWith("http://") ||
      path.startsWith("https://") ||
      path.startsWith("data:")
    ) {
      return path;
    }

    return `${BACKEND_URL}/storage/${path.replace(
      /^\/+/,
      ""
    )}`;
  };

  /* =======================================================
     MÉDIA
  ======================================================= */

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
      window.location.pathname +
      window.location.search;

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
      current.filter(
        (media) => media.id !== mediaId
      )
    );
  };

  /* =======================================================
     CHARGEMENT PROJETS
  ======================================================= */

  useEffect(() => {
    const loadProjects = async () => {
      setLoadingProjects(true);

      try {
        const response =
          await axios.get("/api/projects");

        const data = response.data;

        const rawProjects: any[] =
          Array.isArray(data)
            ? data
            : Array.isArray(data.projects)
            ? data.projects
            : Array.isArray(data.projects?.data)
            ? data.projects.data
            : [];

        const mappedProjects: Project[] =
          rawProjects.map((project: any) => {
            const id = Number(project.id);

            return {
              id,
              name:
                project.name ??
                "Projet sans nom",

              description:
                project.description ?? "",

              color: getProjectColor(id),

              initials:
                getProjectInitials(
                  project.name ?? "?"
                ),

              networks: [],

              networksLoaded: false,
            };
          });

        setProjects(mappedProjects);

        if (mappedProjects.length > 0) {
          setActiveProjectId(
            (current) =>
              current ??
              mappedProjects[0].id
          );
        }
      } catch (error) {
        console.error(
          "Erreur lors du chargement des projets :",
          error
        );

        setProjects([]);
      } finally {
        setLoadingProjects(false);
      }
    };

    loadProjects();
  }, []);

  /* =======================================================
     CHARGEMENT RÉSEAUX
  ======================================================= */

  useEffect(() => {
    if (!activeProjectId) {
      return;
    }

    const current = projects.find(
      (project) =>
        project.id === activeProjectId
    );

    if (current?.networksLoaded) {
      return;
    }

    const loadNetworks = async () => {
      try {
        const response =
          await axios.get(
            `/api/projects/${activeProjectId}/comptes-sociaux`
          );

        const rawAccounts: any[] =
          Array.isArray(
            response.data?.comptes
          )
            ? response.data.comptes
            : Array.isArray(
                response.data?.data
              )
              ? response.data.data
              : Array.isArray(
                  response.data
                )
                ? response.data
                : [];

        const networks: SocialNetwork[] =
          rawAccounts
            .filter((account) => {
              const status = String(
                account?.statut ?? ""
              )
                .toLowerCase()
                .trim();

              return (
                !status ||
                [
                  "actif",
                  "active",
                  "connecte",
                  "connecté",
                  "connected",
                ].includes(status)
              );
            })
            .map((account: any) => {
              const networkId =
                normalizeNetworkType(
                  String(
                    account.reseau ?? ""
                  )
                );

              return {
                id: networkId,

                name:
                  getPublicationNetworkName(
                    networkId
                  ),

                username:
                  account.nom_utilisateur ||
                  account.nom_affichage ||
                  "Compte connecté",

                icon:
                  getNetworkIcon(networkId),
              };
            });

        setProjects(
          (currentProjects) =>
            currentProjects.map(
              (project) =>
                project.id ===
                activeProjectId
                  ? {
                      ...project,
                      networks,
                      networksLoaded: true,
                    }
                  : project
            )
        );

        setSelectedNetworks(
          (currentSelected) =>
            currentSelected.length === 0
              ? networks.map(
                  (network) => network.id
                )
              : currentSelected
        );
      } catch (error) {
        console.error(
          "Erreur lors du chargement des comptes sociaux :",
          error
        );

        setProjects(
          (currentProjects) =>
            currentProjects.map(
              (project) =>
                project.id ===
                activeProjectId
                  ? {
                      ...project,
                      networks: [],
                      networksLoaded: true,
                    }
                  : project
            )
        );
      }
    };

    loadNetworks();
  }, [activeProjectId, projects]);

  /* =======================================================
     CHARGEMENT PUBLICATION / TEMPLATE
  ======================================================= */

  useEffect(() => {
    const loadFromUrl = async () => {
      if (typeof window === "undefined") {
        return;
      }

      const params =
        new URLSearchParams(
          window.location.search
        );

      const publicationId =
        params.get("publication");

      const templateId =
        params.get("template");

      const projectId =
        params.get("project");

      const returnedNetwork =
        params.get("network");

      const returnedNetworks =
        params.get("networks");

      const fromNetworks =
        params.get("fromNetworks") === "1";

      if (fromNetworks) {
        const rawReturnState =
          sessionStorage.getItem(
            "griot_publication_network_return"
          );

        if (rawReturnState) {
          try {
            const returnState = JSON.parse(
              rawReturnState
            );

            if (typeof returnState.publicationTitle === "string") {
              setPublicationTitle(returnState.publicationTitle);
            }

            if (typeof returnState.idea === "string") {
              setIdea(returnState.idea);
            }

            if (typeof returnState.tone === "string") {
              setTone(returnState.tone);
            }

            if (typeof returnState.language === "string") {
              setLanguage(returnState.language);
            }

            if (typeof returnState.scheduledDate === "string") {
              setScheduledDate(returnState.scheduledDate);
            }

            if (typeof returnState.scheduledTime === "string") {
              setScheduledTime(returnState.scheduledTime);
            }

            if (
              returnState.publishMode === "now" ||
              returnState.publishMode === "schedule" ||
              returnState.publishMode === "draft"
            ) {
              setPublishMode(returnState.publishMode);
            }

            if (
              returnState.posts &&
              typeof returnState.posts === "object"
            ) {
              setPosts(returnState.posts);
            }

            if (Array.isArray(returnState.selectedMediaIds)) {
              setSelectedMediaIds(
                returnState.selectedMediaIds.map((id: any) => Number(id))
              );
            }

            if (Array.isArray(returnState.selectedMedia)) {
              setSelectedMedia(returnState.selectedMedia);
            }

            if (returnState.editingPublicationId) {
              setEditingPublicationId(
                Number(returnState.editingPublicationId)
              );
            }

            if (returnState.usedTemplate) {
              setUsedTemplate(returnState.usedTemplate);
            }

            if (returnState.activeProjectId) {
              setActiveProjectId(Number(returnState.activeProjectId));
            }

            if (Array.isArray(returnState.selectedNetworks)) {
              setSelectedNetworks(returnState.selectedNetworks);
            }
          } catch (error) {
            console.error(
              "Erreur lors de la restauration de la création de publication :",
              error
            );
          }
        }

        if (returnedNetworks) {
          const networksToSelect = returnedNetworks
            .split(",")
            .map((network) => normalizeNetworkType(network))
            .filter(Boolean);

          if (networksToSelect.length > 0) {
            setSelectedNetworks(Array.from(new Set(networksToSelect)));
          }
        } else if (returnedNetwork) {
          setSelectedNetworks([normalizeNetworkType(returnedNetwork)]);
        }

        sessionStorage.removeItem(
          "griot_publication_network_return"
        );

        params.delete("fromNetworks");
        params.delete("network");
        params.delete("networks");

        const cleanedQuery = params.toString();
        window.history.replaceState(
          {},
          "",
          `${window.location.pathname}${
            cleanedQuery ? `?${cleanedQuery}` : ""
          }`
        );
      }

      if (
        projectId &&
        !publicationId
      ) {
        const parsedProjectId =
          Number(projectId);

        if (
          Number.isFinite(
            parsedProjectId
          ) &&
          parsedProjectId > 0
        ) {
          setActiveProjectId(
            parsedProjectId
          );
        }
      }

      if (publicationId) {
        setLoadingPublication(true);

        try {
          const response =
            await axios.get(
              `/api/publications/${publicationId}`
            );

          const item =
            response.data?.publication ??
            response.data;

          if (!item) {
            return;
          }

          setEditingPublicationId(
            Number(
              item.id ?? publicationId
            )
          );

          setPublicationTitle(
            item.title ||
              "Nouvelle publication"
          );

          setIdea(
            item.content || ""
          );

          if (item.date) {
            setScheduledDate(
              formatDateForDisplay(
                item.date
              )
            );
          }

          if (item.time) {
            setScheduledTime(
              item.time
            );
          }

          if (item.project_id) {
            setActiveProjectId(
              Number(item.project_id)
            );
          }

          const networkId =
            getNetworkIdFromPublication(
              item.network
            );

          setSelectedNetworks([
            networkId,
          ]);

          if (
            item.status === "Programmée"
          ) {
            setPublishMode("schedule");
          } else if (
            item.status === "Brouillon"
          ) {
            setPublishMode("draft");
          } else {
            setPublishMode("now");
          }

          setPosts((current) => ({
            ...current,
            [networkId]: {
              text: item.content || "",
              image: item.image ?? null,
            },
          }));

          if (
            Array.isArray(item.medias)
          ) {
            const medias: PublicationMedia[] =
              item.medias.map(
                (media: any) => ({
                  id: Number(media.id),
                  name:
                    media.name ||
                    media.original_name ||
                    `Media ${media.id}`,
                  original_name:
                    media.original_name,
                  type:
                    media.type ||
                    "image",
                  mime_type:
                    media.mime_type,
                  size: media.size,
                  path: media.path,
                  src:
                    media.src ||
                    getMediaUrl(
                      media.path
                    ),
                  folder:
                    media.folder ?? null,
                })
              );

            setSelectedMedia(
              medias
            );

            setSelectedMediaIds(
              medias.map(
                (media) => media.id
              )
            );
          }
        } catch (error) {
          console.error(
            "Erreur lors du chargement de la publication :",
            error
          );
        } finally {
          setLoadingPublication(false);
        }

        return;
      }

      if (templateId) {
        try {
          const stored =
            localStorage.getItem(
              "griot_templates"
            );

          if (!stored) {
            return;
          }

          const templates: StoredTemplate[] =
            JSON.parse(stored);

          const template =
            templates.find(
              (item) =>
                String(item.id) ===
                String(templateId)
            );

          if (!template) {
            return;
          }

          setUsedTemplate(
            template
          );

          setPublicationTitle(
            template.title ||
              "Nouvelle publication"
          );

          setIdea(
            template.content ||
              template.description ||
              ""
          );

          const platform =
            String(
              template.platform || ""
            ).toLowerCase();

          let networkId = "facebook";

          if (
            platform.includes(
              "instagram"
            )
          ) {
            networkId =
              "instagram";
          } else if (
            platform.includes(
              "linkedin"
            )
          ) {
            networkId =
              "linkedin";
          } else if (
            platform.includes(
              "tiktok"
            )
          ) {
            networkId =
              "tiktok";
          } else if (
            platform.includes(
              "google"
            )
          ) {
            networkId =
              "google";
          } else if (
            platform === "x" ||
            platform.includes("twitter")
          ) {
            networkId = "x";
          }

          setSelectedNetworks([
            networkId,
          ]);

          setPosts((current) => ({
            ...current,
            [networkId]: {
              text:
                template.content ||
                template.description ||
                "",
              image:
                template.image ??
                null,
            },
          }));
        } catch (error) {
          console.error(
            "Erreur lors du chargement du template :",
            error
          );
        }
      }
    };

    loadFromUrl();
  }, []);

  /* =======================================================
     RETOUR MÉDIAS
  ======================================================= */

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params =
      new URLSearchParams(
        window.location.search
      );

    if (
      params.get("mediaSelection") !==
      "1"
    ) {
      return;
    }

    const raw =
      sessionStorage.getItem(
        "griot_publication_media_selection"
      );

    if (raw) {
      try {
        const selection =
          JSON.parse(raw);

        if (
          Array.isArray(
            selection.ids
          )
        ) {
          setSelectedMediaIds(
            selection.ids.map(
              (id: any) => Number(id)
            )
          );
        }

        if (
          Array.isArray(
            selection.medias
          )
        ) {
          setSelectedMedia(
            selection.medias
          );
        }
      } catch (error) {
        console.error(
          "Erreur de lecture de la sélection média :",
          error
        );
      }

      sessionStorage.removeItem(
        "griot_publication_media_selection"
      );
    }

    params.delete(
      "mediaSelection"
    );

    const query =
      params.toString();

    const newUrl =
      `${window.location.pathname}${
        query ? `?${query}` : ""
      }`;

    window.history.replaceState(
      {},
      "",
      newUrl
    );
  }, []);

  /* =======================================================
     RETOUR VERS LA CRÉATION APRÈS SÉLECTION D'UN RÉSEAU
  ======================================================= */

  const openSocialNetworksForPublication = () => {
    if (!activeProject) {
      return;
    }

    try {
      sessionStorage.setItem(
        "griot_publication_network_return",
        JSON.stringify({
          publicationTitle,
          idea,
          tone,
          language,
          scheduledDate,
          scheduledTime,
          publishMode,
          posts,
          selectedMediaIds,
          selectedMedia,
          editingPublicationId,
          usedTemplate,
          activeProjectId: activeProject.id,
          selectedNetworks,
        })
      );
    } catch (error) {
      console.error(
        "Erreur lors de la sauvegarde de la création de publication :",
        error
      );
    }

    const returnTo =
      window.location.pathname +
      window.location.search;

    window.location.href =
      `/dashboard/reseaux_sociaux?project=${activeProject.id}&returnTo=${encodeURIComponent(
        returnTo
      )}`;
  };

  /* =======================================================
     PROJET
  ======================================================= */

  const handleProjectChange = (
    project: Project
  ) => {
    setActiveProjectId(
      project.id
    );

    setShowProjectMenu(false);

    if (project.networksLoaded) {
      setSelectedNetworks(
        project.networks.map(
          (network) => network.id
        )
      );
    } else {
      setSelectedNetworks([]);
    }
  };

  /* =======================================================
     RÉSEAUX
  ======================================================= */

  const toggleNetwork = (
    id: string
  ) => {
    setSelectedNetworks(
      (current) =>
        current.includes(id)
          ? current.filter(
              (item) =>
                item !== id
            )
          : [
              ...current,
              id,
            ]
    );
  };

  /* =======================================================
     POSTS
  ======================================================= */

  const updatePostText = (
    networkId: string,
    text: string
  ) => {
    setPosts((current) => ({
      ...current,
      [networkId]: {
        ...(current[networkId] ??
          emptyPost),
        text,
      },
    }));
  };

  const updatePostImage = (
    networkId: string,
    image: string | null
  ) => {
    setPosts((current) => ({
      ...current,
      [networkId]: {
        ...(current[networkId] ?? {
          text: idea,
          image: null,
        }),
        image,
      },
    }));
  };

  const getPost = (
    networkId: string
  ): PostContent => {
    return (
      posts[networkId] ?? {
        text:
          idea ||
          defaultPostText,
        image: null,
      }
    );
  };

  /* =======================================================
     IMAGE DU PREMIER MÉDIA
  ======================================================= */

  const getSelectedMediaPreview =
    () => {
      const media =
        selectedMedia[0];

      if (!media) {
        return null;
      }

      if (media.src) {
        return media.src;
      }

      if (media.path) {
        return getMediaUrl(
          media.path
        );
      }

      return null;
    };

  /* =======================================================
     GÉNÉRATION IA
  ======================================================= */

  const handleGenerateContent =
    async () => {
      if (generatingContent) {
        return;
      }

      if (!idea.trim()) {
        window.alert(
          "Écrivez d'abord une idée ou un sujet."
        );
        return;
      }

      if (
        selectedNetworks.length ===
        0
      ) {
        window.alert(
          "Sélectionnez au moins un réseau social."
        );
        return;
      }

      setGeneratingContent(true);

      try {
        const response =
          await axios.post(
            "/api/ai/generate-publication",
            {
              idea: idea.trim(),

              title:
                publicationTitle.trim(),

              tone,

              language,

              networks:
                selectedNetworks,
            }
          );

        const contents =
          response.data?.contents;

        if (
          !contents ||
          typeof contents !==
            "object"
        ) {
          throw new Error(
            "La réponse de l'IA est invalide."
          );
        }

        const mediaPreview =
          getSelectedMediaPreview();

        setPosts((current) => {
          const updated = {
            ...current,
          };

          selectedNetworks.forEach(
            (networkId) => {
              const generated =
                contents[
                  networkId
                ];

              if (
                typeof generated ===
                  "string" &&
                generated.trim()
              ) {
                updated[networkId] =
                  {
                    ...(current[
                      networkId
                    ] ?? emptyPost),

                    text:
                      generated.trim(),

                    image:
                      current[
                        networkId
                      ]?.image ??
                      mediaPreview ??
                      null,
                  };
              }
            }
          );

          return updated;
        });

        window.setTimeout(
          () => {
            const preview =
              document.getElementById(
                "publication-previews"
              );

            preview?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          },
          100
        );
      } catch (error: any) {
        console.error(
          "Erreur lors de la génération IA :",
          error
        );

        window.alert(
          error?.response?.data
            ?.message ||
            "Griot AI n'a pas pu générer le contenu. Veuillez réessayer."
        );
      } finally {
        setGeneratingContent(
          false
        );
      }
    };

  /* =======================================================
     SAUVEGARDE
  ======================================================= */

  const handleSavePublication =
    async (
      forcedMode?: "now" | "schedule" | "draft"
    ) => {
      if (saving) {
        return;
      }

      if (!activeProject) {
        window.alert(
          "Aucun projet sélectionné."
        );
        return;
      }

      if (
        selectedNetworks.length ===
        0
      ) {
        window.alert(
          "Sélectionnez au moins un réseau social."
        );
        return;
      }

      const effectiveMode =
        forcedMode ?? publishMode;

      const statusMap: Record<
        "now" | "schedule" | "draft",
        PublicationStatus
      > = {
        now: "Publiée",
        schedule: "Programmée",
        draft: "Brouillon",
      };

      const status =
        statusMap[
          effectiveMode
        ];

      const firstNetworkId =
        selectedNetworks[0];

      const firstPost =
        getPost(
          firstNetworkId
        );

      const fallbackContent =
        idea.trim();

      if (
        !firstPost.text?.trim() &&
        !fallbackContent
      ) {
        window.alert(
          "Le contenu de la publication est vide."
        );
        return;
      }

      if (
        effectiveMode ===
          "schedule" &&
        !scheduledDate
      ) {
        window.alert(
          "Veuillez choisir une date de programmation."
        );
        return;
      }

      setSaving(true);

      const apiDate =
        scheduledDate
          ? formatDateForApi(
              scheduledDate
            )
          : null;

      try {
        if (
          editingPublicationId !==
          null
        ) {
          const networkId =
            selectedNetworks[0];

          const post =
            getPost(
              networkId
            );

          await axios.put(
            `/api/publications/${editingPublicationId}`,
            {
              project_id:
                activeProject.id,

              title:
                publicationTitle.trim() ||
                "Nouvelle publication",

              content:
                post.text?.trim() ||
                fallbackContent,

              network:
                getPublicationNetworkName(
                  networkId
                ),

              status,

              date: apiDate,

              time: scheduledTime,

              image:
                post.image ?? null,

              media_ids:
                selectedMediaIds,
            }
          );

          window.location.href =
            "/dashboard/publications";

          return;
        }

        for (const networkId of selectedNetworks) {
          const post =
            getPost(
              networkId
            );

          const content =
            post.text?.trim() ||
            fallbackContent;

          await axios.post(
            "/api/publications",
            {
              project_id:
                activeProject.id,

              title:
                publicationTitle.trim() ||
                "Nouvelle publication",

              content,

              networks: [
                getPublicationNetworkName(
                  networkId
                ),
              ],

              status,

              date: apiDate,

              time: scheduledTime,

              image:
                post.image ?? null,

              media_ids:
                selectedMediaIds,
            }
          );
        }

        window.location.href =
          "/dashboard/publications";
      } catch (error: any) {
        console.error(
          "Impossible de sauvegarder la publication :",
          error
        );

        const validationErrors =
          error?.response?.data
            ?.errors;

        if (validationErrors) {
          const firstError =
            Object.values(
              validationErrors
            )
              .flat()
              .find(
                (message) =>
                  typeof message ===
                  "string"
              );

          window.alert(
            typeof firstError ===
              "string"
              ? firstError
              : "Veuillez vérifier les informations saisies."
          );
        } else {
          window.alert(
            error?.response?.data
              ?.message ||
              "Une erreur est survenue lors de l'enregistrement."
          );
        }

        setSaving(false);
        return;
      }

      setSaving(false);
    };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loadingProjects) {
    return (
      <main className="min-h-screen w-full bg-[#f7f8fc]">
        <div className="flex min-h-screen w-full items-center justify-center">
          <Loader2
            size={28}
            className="animate-spin text-red-dark"
          />
        </div>
      </main>
    );
  }

  /* =======================================================
     AUCUN PROJET
  ======================================================= */

  if (!activeProject) {
    return (
      <main className="min-h-screen w-full bg-[#f7f8fc]">
        <div className="flex min-h-screen w-full items-center justify-center px-6">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-light/10 text-red-dark">
              <BriefcaseBusiness
                size={24}
              />
            </div>

            <h1 className="mt-4 text-base font-black text-slate-800">
              Aucun projet disponible
            </h1>

            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Créez d'abord un projet
              afin de pouvoir créer une
              publication.
            </p>

            <a
              href="/dashboard/projets"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-dark px-5 py-3 text-[11px] font-black text-white transition hover:bg-red-dark/90"
            >
              <Plus size={14} />
              Créer un projet
            </a>
          </div>
        </div>
      </main>
    );
  }

  const activeNetworks =
    activeProject.networks.filter(
      (network) =>
        selectedNetworks.includes(
          network.id
        )
    );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="min-h-screen w-full bg-[#f7f8fc] text-slate-800">
      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="flex min-h-[68px] w-full items-center justify-between gap-4 px-5 py-3 lg:px-7">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <a
                href="/dashboard/publications"
                className="text-[10px] font-semibold text-slate-400 transition hover:text-slate-700"
              >
                Publications
              </a>

              <span className="text-slate-300">
                /
              </span>

              <span className="truncate text-[10px] font-bold text-slate-700">
                {editingPublicationId
                  ? "Modifier"
                  : "Créer une publication"}
              </span>
            </div>

            <h1 className="mt-1 text-lg font-black tracking-tight text-slate-900 sm:text-xl">
              {editingPublicationId
                ? "Modifier la publication"
                : "Créer une publication"}
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {/* Projet */}

            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setShowProjectMenu(
                    (current) =>
                      !current
                  )
                }
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-lg ${activeProject.color} text-[9px] font-black text-white`}
                >
                  {
                    activeProject.initials
                  }
                </div>

                <div className="hidden min-w-0 text-left sm:block">
                  <p className="max-w-[150px] truncate text-[10px] font-black text-slate-800">
                    {
                      activeProject.name
                    }
                  </p>

                  <p className="text-[8px] text-slate-400">
                    Projet actif
                  </p>
                </div>

                <ChevronDown
                  size={14}
                  className="text-slate-400"
                />
              </button>

              {showProjectMenu && (
                <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl">
                  {projects.map(
                    (project) => (
                      <button
                        type="button"
                        key={
                          project.id
                        }
                        onClick={() =>
                          handleProjectChange(
                            project
                          )
                        }
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left transition hover:bg-slate-50"
                      >
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${project.color} text-[9px] font-black text-white`}
                        >
                          {
                            project.initials
                          }
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[10px] font-black text-slate-800">
                            {
                              project.name
                            }
                          </p>

                          <p className="truncate text-[8px] text-slate-400">
                            {
                              project.description ||
                              "Projet"
                            }
                          </p>
                        </div>

                        {project.id ===
                          activeProjectId && (
                          <Check
                            size={14}
                            className="shrink-0 text-red-dark"
                          />
                        )}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
              aria-label="Notifications"
            >
              <Bell size={16} />
            </button>

            <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-[10px] font-black text-white sm:flex">
              KA
            </div>
          </div>
        </div>
      </header>

      {/* ===================================================
          CONTENU PRINCIPAL
      =================================================== */}

      <div className="w-full px-5 py-5 lg:px-7 xl:px-8">
        {/* =================================================
            TEMPLATE
        ================================================= */}

        {usedTemplate && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-dark text-white">
              <CheckCircle2
                size={16}
              />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-black text-red-900">
                Modèle utilisé
              </p>

              <p className="mt-0.5 text-[9px] text-red-700">
                {
                  usedTemplate.title
                }
              </p>
            </div>
          </div>
        )}

        {/* =================================================
            PROJET
        ================================================= */}

        <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.025)] sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${activeProject.color} text-xs font-black text-white shadow-sm`}
              >
                {
                  activeProject.initials
                }
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-sm font-black text-slate-900">
                    {
                      activeProject.name
                    }
                  </h2>

                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[8px] font-black text-emerald-600">
                    Actif
                  </span>
                </div>

                <p className="mt-0.5 max-w-2xl truncate text-[9px] text-slate-400">
                  {
                    activeProject.description ||
                    "Préparez et publiez votre contenu sur vos réseaux sociaux."
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-2 text-[9px] font-bold text-slate-500">
                <Users
                  size={12}
                />
                {
                  activeProject.networks
                    .length
                }{" "}
                réseaux connectés
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            GRID PRINCIPAL
        ================================================= */}

        <div className="grid w-full grid-cols-1 gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
          {/* =================================================
              COLONNE CONFIGURATION
          ================================================= */}

          <div className="space-y-5">
            {/* =================================================
                SECTION 1
            ================================================= */}

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.025)]">
              <SectionTitle
                number="1"
                title="Configuration du contenu"
              />

              <div className="mt-4 space-y-4">
                {/* Titre */}

                <div>
                  <label className="mb-1.5 block text-[9px] font-black uppercase tracking-wide text-slate-500">
                    Titre de la publication
                  </label>

                  <input
                    type="text"
                    value={
                      publicationTitle
                    }
                    onChange={(event) =>
                      setPublicationTitle(
                        event.target.value
                      )
                    }
                    placeholder="Ex : Nouvelle offre de rentrée"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[10px] font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-red-dark focus:bg-white focus:ring-4 focus:ring-red-light/20"
                  />
                </div>

                {/* Idée */}

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="block text-[9px] font-black uppercase tracking-wide text-slate-500">
                      Idée / sujet
                    </label>

                    <span className="text-[8px] text-slate-400">
                      {idea.length}
                      /5000
                    </span>
                  </div>

                  <textarea
                    value={idea}
                    onChange={(event) =>
                      setIdea(
                        event.target.value
                      )
                    }
                    rows={6}
                    maxLength={5000}
                    placeholder="Décrivez l'idée ou le sujet de votre publication..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[10px] leading-relaxed text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-red-dark focus:bg-white focus:ring-4 focus:ring-red-light/20"
                  />
                </div>

                {/* Ton */}

                <div>
                  <label className="mb-1.5 block text-[9px] font-black uppercase tracking-wide text-slate-500">
                    Ton
                  </label>

                  <select
                    value={tone}
                    onChange={(event) =>
                      setTone(
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[10px] font-semibold text-slate-700 outline-none transition focus:border-red-dark focus:bg-white focus:ring-4 focus:ring-red-light/20"
                  >
                    <option>
                      Professionnel & motivant
                    </option>
                    <option>
                      Décontracté
                    </option>
                    <option>
                      Inspirant
                    </option>
                    <option>
                      Commercial
                    </option>
                    <option>
                      Éducatif
                    </option>
                  </select>
                </div>

                {/* Langue */}

                <div>
                  <label className="mb-1.5 block text-[9px] font-black uppercase tracking-wide text-slate-500">
                    Langue
                  </label>

                  <select
                    value={language}
                    onChange={(event) =>
                      setLanguage(
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[10px] font-semibold text-slate-700 outline-none transition focus:border-red-dark focus:bg-white focus:ring-4 focus:ring-red-light/20"
                  >
                    <option>
                      Français
                    </option>
                    <option>
                      English
                    </option>
                  </select>
                </div>
              </div>
            </section>

            {/* =================================================
                SECTION 2 MÉDIAS
            ================================================= */}

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.025)]">
              <SectionTitle
                number="2"
                title="Médias"
              />

              <div className="mt-4">
                {selectedMedia.length >
                0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {selectedMedia.map(
                      (media) => {
                        const src =
                          media.src ||
                          getMediaUrl(
                            media.path
                          );

                        return (
                          <div
                            key={
                              media.id
                            }
                            className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                          >
                            {media.type ===
                              "image" &&
                            src ? (
                              <img
                                src={src}
                                alt={
                                  media.original_name ||
                                  media.name
                                }
                                className="aspect-square w-full object-cover"
                              />
                            ) : media.type ===
                              "video" ? (
                              <div className="flex aspect-square flex-col items-center justify-center bg-slate-900 text-white">
                                <Play
                                  size={22}
                                />
                                <span className="mt-1 text-[8px] font-bold">
                                  Vidéo
                                </span>
                              </div>
                            ) : (
                              <div className="flex aspect-square flex-col items-center justify-center text-slate-400">
                                <ImageIcon
                                  size={22}
                                />
                                <span className="mt-1 max-w-[80%] truncate text-[8px] font-bold">
                                  {
                                    media.name
                                  }
                                </span>
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                removeSelectedMedia(
                                  media.id
                                )
                              }
                              className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-white/95 text-red-600 opacity-0 shadow-md transition group-hover:opacity-100"
                              aria-label="Supprimer le média"
                            >
                              <X
                                size={13}
                              />
                            </button>
                          </div>
                        );
                      }
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center">
                    <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
                      <ImageIcon
                        size={17}
                      />
                    </div>

                    <p className="mt-2 text-[9px] font-bold text-slate-600">
                      Aucun média
                      sélectionné
                    </p>

                    <p className="mt-1 text-[8px] leading-relaxed text-slate-400">
                      Ajoutez une image
                      ou une vidéo depuis
                      votre bibliothèque.
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={
                    openMediaLibrary
                  }
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[9px] font-black text-slate-600 transition hover:border-red-dark hover:text-red-dark"
                >
                  <Plus size={13} />
                  {selectedMedia.length >
                  0
                    ? "Modifier les médias"
                    : "Choisir dans les médias"}
                </button>
              </div>
            </section>

            {/* =================================================
                SECTION 3 RÉSEAUX
            ================================================= */}

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.025)]">
              <SectionTitle
                number="3"
                title="Réseaux sociaux"
              />

              <div className="mt-4 space-y-2">
                {activeProject.networks
                  .length > 0 ? (
                  activeProject.networks.map(
                    (network) => {
                      const active =
                        selectedNetworks.includes(
                          network.id
                        );

                      return (
                        <button
                          key={`${network.id}-${network.username}`}
                          type="button"
                          onClick={() =>
                            toggleNetwork(
                              network.id
                            )
                          }
                          className={`flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition ${
                            active
                              ? "border-red-200 bg-red-50/60"
                              : "border-slate-200 bg-white hover:bg-slate-50"
                          }`}
                        >
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                              active
                                ? "bg-white"
                                : "bg-slate-50"
                            } text-slate-700`}
                          >
                            {
                              network.icon
                            }
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-[9px] font-black text-slate-800">
                              {
                                network.name
                              }
                            </p>

                            <p className="truncate text-[8px] text-slate-400">
                              {
                                network.username
                              }
                            </p>
                          </div>

                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                              active
                                ? "border-red-dark bg-red-dark text-white"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {active && (
                              <Check
                                size={12}
                              />
                            )}
                          </span>
                        </button>
                      );
                    }
                  )
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center">
                    <Globe2
                      size={20}
                      className="mx-auto text-slate-400"
                    />

                    <p className="mt-2 text-[9px] font-bold text-slate-600">
                      Aucun réseau connecté
                    </p>

                    <button
                      type="button"
                      onClick={openSocialNetworksForPublication}
                      className="mt-2 inline-flex text-[9px] font-black text-red-dark hover:underline"
                    >
                      Connecter un réseau
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={openSocialNetworksForPublication}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50/60 px-4 py-2.5 text-[9px] font-black text-red-dark transition hover:bg-red-50"
                >
                  <Plus size={13} />
                  Connecter ou ajouter un réseau
                </button>

                {/* =================================================
                    BOUTON IA
                ================================================= */}

                <button
                  type="button"
                  disabled={
                    generatingContent
                  }
                  onClick={
                    handleGenerateContent
                  }
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-red-dark px-4 py-3 text-[10px] font-black text-white shadow-sm transition hover:bg-red-dark/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {generatingContent ? (
                    <>
                      <Loader2
                        size={14}
                        className="animate-spin"
                      />
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <Sparkles
                        size={14}
                      />
                      Générer le contenu
                    </>
                  )}
                </button>

                <p className="px-1 text-center text-[8px] leading-relaxed text-slate-400">
                  Gemini créera un contenu
                  différent et adapté à
                  chaque réseau sélectionné.
                </p>
              </div>
            </section>
          </div>

          {/* =================================================
              COLONNE DROITE
          ================================================= */}

          <div
            id="publication-previews"
            className="min-w-0 space-y-5"
          >
            {/* =================================================
                PRÉVISUALISATION
            ================================================= */}

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.025)] sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <SectionTitle
                    number="4"
                    title="Prévisualisation des publications"
                  />

                  <p className="mt-1 pl-9 text-[9px] text-slate-400">
                    Chaque réseau possède
                    son propre contenu généré
                    par l'IA.
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 px-3 py-2 text-[9px] font-bold text-slate-500">
                  {
                    selectedNetworks.length
                  }{" "}
                  réseau
                  {selectedNetworks.length >
                  1
                    ? "x"
                    : ""}{" "}
                  sélectionné
                  {selectedNetworks.length >
                  1
                    ? "s"
                    : ""}
                </div>
              </div>

              {activeNetworks.length >
              0 ? (
                <div className="mt-5 grid w-full grid-cols-1 gap-4 2xl:grid-cols-2">
                  {activeNetworks.map(
                    (network) => (
                      <NetworkPreview
                        key={`${network.id}-${network.username}`}
                        network={
                          network
                        }
                        post={getPost(
                          network.id
                        )}
                        onTextChange={(
                          text
                        ) =>
                          updatePostText(
                            network.id,
                            text
                          )
                        }
                        onImageChange={(
                          image
                        ) =>
                          updatePostImage(
                            network.id,
                            image
                          )
                        }
                      />
                    )
                  )}
                </div>
              ) : (
                <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
                  <Globe2
                    size={25}
                    className="mx-auto text-slate-400"
                  />

                  <p className="mt-3 text-[10px] font-black text-slate-700">
                    Sélectionnez un réseau
                  </p>

                  <p className="mt-1 text-[9px] text-slate-400">
                    Les aperçus apparaîtront
                    ici.
                  </p>
                </div>
              )}
            </section>

            {/* =================================================
                PLANIFICATION
            ================================================= */}

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.025)] sm:p-5">
              <SectionTitle
                number="5"
                title="Planification et publication"
              />

              <div className="mt-5">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <PublishOption
                    active={
                      publishMode ===
                      "now"
                    }
                    onClick={() =>
                      setPublishMode(
                        "now"
                      )
                    }
                    label="Publier maintenant"
                  />

                  <PublishOption
                    active={
                      publishMode ===
                      "schedule"
                    }
                    onClick={() =>
                      setPublishMode(
                        "schedule"
                      )
                    }
                    label="Programmer"
                  />

                  <PublishOption
                    active={
                      publishMode ===
                      "draft"
                    }
                    onClick={() =>
                      setPublishMode(
                        "draft"
                      )
                    }
                    label="Enregistrer comme brouillon"
                  />
                </div>

                {publishMode ===
                  "schedule" && (
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-[9px] font-black uppercase tracking-wide text-slate-500">
                        Date
                      </label>

                      <div className="relative">
                        <CalendarDays
                          size={14}
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type="date"
                          value={formatDateForInput(
                            scheduledDate
                          )}
                          onChange={(
                            event
                          ) =>
                            setScheduledDate(
                              formatDateForDisplay(
                                event
                                  .target
                                  .value
                              )
                            )
                          }
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-[10px] font-semibold text-slate-700 outline-none transition focus:border-red-dark focus:bg-white focus:ring-4 focus:ring-red-light/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[9px] font-black uppercase tracking-wide text-slate-500">
                        Heure
                      </label>

                      <div className="relative">
                        <Clock3
                          size={14}
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type="time"
                          value={
                            scheduledTime
                          }
                          onChange={(
                            event
                          ) =>
                            setScheduledTime(
                              event
                                .target
                                .value
                            )
                          }
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-[10px] font-semibold text-slate-700 outline-none transition focus:border-red-dark focus:bg-white focus:ring-4 focus:ring-red-light/20"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-[8px] text-slate-500">
                  <Clock3
                    size={12}
                    className="shrink-0"
                  />

                  <span>
                    Fuseau horaire :
                    <strong className="ml-1 font-black text-slate-700">
                      GMT+1
                    </strong>
                  </span>
                </div>

                {/* =================================================
                    RÉSUMÉ
                ================================================= */}

                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[10px] font-black text-slate-800">
                      Résumé
                    </p>

                    <Settings2
                      size={14}
                      className="text-slate-400"
                    />
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <SummaryItem
                      icon={
                        <Globe2
                          size={13}
                        />
                      }
                      label="Réseaux"
                      value={
                        selectedNetworks
                          .map(
                            (
                              networkId
                            ) =>
                              getPublicationNetworkName(
                                networkId
                              )
                          )
                          .join(
                            ", "
                          ) ||
                        "Aucun"
                      }
                    />

                    <SummaryItem
                      icon={
                        <ImageIcon
                          size={13}
                        />
                      }
                      label="Médias"
                      value={`${selectedMedia.length} média${
                        selectedMedia.length >
                        1
                          ? "s"
                          : ""
                      }`}
                    />

                    <SummaryItem
                      icon={
                        <Sparkles
                          size={13}
                        />
                      }
                      label="Ton"
                      value={tone}
                    />

                    <SummaryItem
                      icon={
                        <Globe2
                          size={13}
                        />
                      }
                      label="Langue"
                      value={language}
                    />
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <SummaryItem
                      icon={
                        <BriefcaseBusiness
                          size={13}
                        />
                      }
                      label="Projet"
                      value={
                        activeProject.name
                      }
                    />

                    <SummaryItem
                      icon={
                        <ImageIcon
                          size={13}
                        />
                      }
                      label="Images personnalisables"
                      value="Oui"
                    />
                  </div>
                </div>

                {/* =================================================
                    ACTIONS
                ================================================= */}

                <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() =>
                      handleSavePublication(
                        "draft"
                      )
                    }
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[9px] font-black text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <Loader2
                        size={13}
                        className="animate-spin"
                      />
                    ) : (
                      <Save
                        size={13}
                      />
                    )}
                    Enregistrer le brouillon
                  </button>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={() =>
                      handleSavePublication()
                    }
                    className="flex items-center justify-center gap-2 rounded-xl bg-red-dark px-5 py-3 text-[9px] font-black text-white shadow-sm transition hover:bg-red-dark/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <Loader2
                        size={13}
                        className="animate-spin"
                      />
                    ) : publishMode ===
                      "schedule" ? (
                      <CalendarDays
                        size={13}
                      />
                    ) : (
                      <Send
                        size={13}
                      />
                    )}

                    {publishMode ===
                    "schedule"
                      ? "Programmer la publication"
                      : editingPublicationId
                      ? "Mettre à jour"
                      : "Publier maintenant"}
                  </button>
                </div>

                <div className="mt-4 flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-3">
                  <HelpCircle
                    size={14}
                    className="mt-0.5 shrink-0 text-blue-500"
                  />

                  <p className="text-[8px] leading-relaxed text-blue-700">
                    Vous pouvez modifier
                    individuellement le texte
                    ou l'image de chaque
                    aperçu avant de publier ou
                    programmer.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   TITRE DE SECTION
========================================================= */

function SectionTitle({
  number,
  title,
}: {
  number: string;
  title: string;
}) {
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
   RÉSUMÉ
========================================================= */

function SummaryItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-wide text-slate-400">
        {icon}
        {label}
      </div>

      <p className="mt-1 truncate text-[9px] font-black text-slate-700">
        {value}
      </p>
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

    case "x":
      return (
        <XPreview
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
  const [menuOpen, setMenuOpen] =
    useState(false);

  const [editing, setEditing] =
    useState(false);

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.type.startsWith("image/")
    ) {
      window.alert(
        "Veuillez sélectionner une image."
      );
      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      if (
        typeof reader.result ===
        "string"
      ) {
        onImageChange(
          reader.result
        );
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
          onClick={() =>
            setMenuOpen(
              (current) =>
                !current
            )
          }
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white/95 text-slate-500 shadow-sm backdrop-blur transition hover:bg-slate-50 hover:text-slate-800"
          aria-label="Modifier la publication"
        >
          <MoreHorizontal
            size={16}
          />
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
                onClick={
                  removeImage
                }
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[10px] font-semibold text-red-600 transition hover:bg-red-50"
              >
                <Trash2
                  size={14}
                />
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
        onChange={
          handleImageUpload
        }
      />

      {editing && (
        <div className="absolute inset-x-3 top-14 z-40 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[10px] font-black text-slate-800">
              Modifier le texte
            </p>

            <button
              type="button"
              onClick={() =>
                setEditing(false)
              }
              className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
            >
              <X size={13} />
            </button>
          </div>

          <textarea
            value={text}
            onChange={(event) =>
              onTextChange(
                event.target.value
              )
            }
            rows={7}
            className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-[10px] leading-relaxed text-slate-700 outline-none focus:border-red-dark focus:bg-white focus:ring-4 focus:ring-red-light/20"
          />

          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={() =>
                setEditing(false)
              }
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

      <PreviewHeader
        icon={<FacebookIcon />}
        platform="Facebook"
      />

      <div className="flex items-center gap-2 px-3.5 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-[9px] font-black">
          {network.username.charAt(
            0
          )}
        </div>

        <div className="min-w-0">
          <p className="text-[9px] font-black text-slate-800">
            {network.username}
          </p>

          <p className="text-[8px] text-slate-400">
            À l'instant · 🌎
          </p>
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
        onChange={
          onImageChange
        }
      />

      <div className="px-3.5 py-2.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2 text-[8px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-white">
              <ThumbsUp size={8} />
            </span>
            128
          </span>

          <span>
            12 commentaires ·
            8 partages
          </span>
        </div>

        <div className="grid grid-cols-3 pt-2 text-[8px] font-semibold text-slate-500">
          <span className="flex items-center justify-center gap-1">
            <ThumbsUp size={11} />
            J'aime
          </span>

          <span className="flex items-center justify-center gap-1">
            <MessageCircle
              size={11}
            />
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

      <PreviewHeader
        icon={<InstagramIcon />}
        platform="Instagram"
      />

      <div className="flex items-center gap-2 px-3.5 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 via-pink-500 to-purple-600 p-[2px]">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-[8px] font-black">
            {network.username.charAt(
              1
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-black text-slate-800">
            {network.username}
          </p>
        </div>

        <MoreHorizontal
          size={15}
          className="text-slate-400"
        />
      </div>

      <PreviewImage
        image={post.image}
        alt="Publication Instagram"
        aspect="aspect-square"
        onChange={
          onImageChange
        }
      />

      <div className="px-3.5 pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart size={16} />
            <MessageCircle
              size={16}
            />
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
          Voir les 12
          commentaires
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

      <PreviewHeader
        icon={<LinkedinIcon />}
        platform="LinkedIn"
      />

      <div className="flex items-start gap-2 px-3.5 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[9px] font-black">
          {network.username.charAt(
            0
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-black text-slate-800">
            {network.username}
          </p>

          <p className="text-[8px] text-slate-400">
            Développement &
            Formation · 1 h
          </p>
        </div>

        <button
          type="button"
          className="text-[9px] font-bold text-blue-600"
        >
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
        onChange={
          onImageChange
        }
      />

      <div className="px-3.5 py-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2 text-[8px] text-slate-400">
          <span className="flex items-center gap-1">
            👍 ❤️ 💡
            <span>128</span>
          </span>

          <span>
            14 commentaires ·
            5 reposts
          </span>
        </div>

        <div className="grid grid-cols-3 pt-2 text-[8px] font-semibold text-slate-500">
          <span className="flex items-center justify-center gap-1">
            <ThumbsUp size={11} />
            J'aime
          </span>

          <span className="flex items-center justify-center gap-1">
            <MessageCircle
              size={11}
            />
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
          {network.username.charAt(
            1
          )}
        </div>

        <div className="min-w-0">
          <p className="text-[9px] font-black text-white">
            {network.username}
          </p>

          <p className="text-[7px] text-white/70">
            Original sound
          </p>
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
              Ajoutez une vidéo
              ou une image
            </p>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

        <div className="absolute bottom-24 right-3 z-20 flex flex-col items-center gap-4 text-white">
          <div className="flex flex-col items-center gap-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 backdrop-blur">
              <Heart
                size={19}
                fill="white"
              />
            </div>

            <span className="text-[8px] font-bold">
              128
            </span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <MessageCircle
              size={20}
            />

            <span className="text-[8px] font-bold">
              12
            </span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <Bookmark size={19} />

            <span className="text-[8px] font-bold">
              24
            </span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <Share2 size={19} />

            <span className="text-[8px] font-bold">
              Partager
            </span>
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

      <PreviewHeader
        icon={<GoogleBusinessIcon />}
        platform="Google Business"
      />

      <div className="px-3.5 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-[9px] font-black">
            {network.username.charAt(
              0
            )}
          </div>

          <div className="min-w-0">
            <p className="text-[9px] font-black text-slate-800">
              {network.username}
            </p>

            <div className="flex items-center gap-1 text-[8px] text-slate-400">
              <span>
                Google
              </span>

              <span>·</span>

              <span>
                Il y a 1 h
              </span>
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
        onChange={
          onImageChange
        }
      />

      <div className="p-3.5">
        <div className="flex items-center gap-1 text-[8px] text-slate-500">
          <MapPin size={11} />
          <span>
            Cotonou · Ouvert
          </span>
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
   X
========================================================= */

function XPreview({
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

      <PreviewHeader
        icon={<XIcon />}
        platform="X"
      />

      <div className="px-3.5 py-3">
        <div className="flex items-start gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[9px] font-black text-white">
            {network.username.charAt(
              0
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <p className="truncate text-[9px] font-black text-slate-800">
                {network.username}
              </p>

              <span className="text-[8px] text-slate-400">
                ·
              </span>

              <span className="text-[8px] text-slate-400">
                1 h
              </span>
            </div>

            <p className="mt-2 whitespace-pre-line text-[9px] leading-[1.65] text-slate-700">
              {post.text}
            </p>
          </div>
        </div>
      </div>

      <PreviewImage
        image={post.image}
        alt="Publication X"
        aspect="aspect-[1.91/1]"
        onChange={
          onImageChange
        }
      />

      <div className="px-5 py-3">
        <div className="flex items-center justify-between text-slate-400">
          <MessageCircle size={13} />
          <Repeat2 size={13} />
          <Heart size={13} />
          <Bookmark size={13} />
          <Share2 size={13} />
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
          <p className="text-[10px] font-black text-slate-800">
            {platform}
          </p>

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
  onChange: (
    image: string | null
  ) => void;
}) {
  const inputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const handleFile = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.type.startsWith("image/")
    ) {
      window.alert(
        "Veuillez sélectionner une image."
      );
      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      if (
        typeof reader.result ===
        "string"
      ) {
        onChange(
          reader.result
        );
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
            onClick={() =>
              inputRef.current?.click()
            }
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
            onClick={() =>
              inputRef.current?.click()
            }
            className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-[8px] font-black text-slate-700 shadow-lg transition hover:bg-slate-50"
          >
            <Upload size={12} />
            Modifier
          </button>

          <button
            type="button"
            onClick={() =>
              onChange(null)
            }
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
          active
            ? "border-red-dark"
            : "border-slate-300"
        }`}
      >
        {active && (
          <span className="h-2 w-2 rounded-full bg-red-light" />
        )}
      </span>

      {label}
    </button>
  );
}