"use client";

import React, {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  Search,
  Plus,
  Image as ImageIcon,
  Video,
  FileText,
  Folder,
  MoreHorizontal,
  Grid3X3,
  List,
  Upload,
  ChevronDown,
  Check,
  X,
  FolderOpen,
  Download,
  Loader2,
  RefreshCw,
  Eye,
  Trash2,
  AlertTriangle,
} from "lucide-react";

/* =========================================================
   CONFIGURATION
========================================================= */

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:8000";

const getAuthHeaders = (): Record<string, string> => {
  if (typeof window === "undefined") {
    return {
      Accept: "application/json",
    };
  }

  const token = localStorage.getItem("griot_token");

  return {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};
  
/* =========================================================
   TYPES
========================================================= */

type MediaType =
  | "image"
  | "video"
  | "document";

type BackendFolder = {
  id: number;
  user_id: number;
  name: string;
  medias_count: number;
  created_at: string;
  updated_at: string;
};

type BackendMedia = {
  id: number;
  user_id: number;
  folder_id: number | null;
  name: string;
  original_name: string;
  type: MediaType;
  mime_type: string;
  size: number;
  path: string;
  created_at: string;
  updated_at: string;
  folder?: BackendFolder | null;
};

type Media = {
  id: number;
  name: string;
  type: MediaType;
  size: string;
  sizeBytes: number;
  date: string;
  dateValue: number;
  folder: string;
  folderId: number | null;
  src?: string;
  downloadUrl: string;
  mimeType?: string;
};

type SortOption =
  | "recent"
  | "oldest"
  | "name"
  | "size";

/* =========================================================
   OUTILS
========================================================= */

function formatFileSize(
  bytes: number
): string {
  if (bytes < 1024) {
    return `${bytes} o`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024)
      .toFixed(1)
      .replace(".", ",")} Ko`;
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024))
      .toFixed(1)
      .replace(".", ",")} Mo`;
  }

  return `${(bytes / (1024 * 1024 * 1024))
    .toFixed(1)
    .replace(".", ",")} Go`;
}

function formatDate(
  date: string
): string {
  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  ).format(new Date(date));
}

function getMediaUrl(
  path: string
): string {
  return `${BACKEND_URL}/storage/${path}`;
}

/* =========================================================
   DÉTERMINER LE TYPE
========================================================= */

function normalizeMediaType(
  type: string | undefined,
  mimeType: string | undefined
): MediaType {
  const mime =
    (mimeType || "").toLowerCase();

  const backendType =
    (type || "").toLowerCase();

  if (
    backendType === "image" ||
    mime.startsWith("image/")
  ) {
    return "image";
  }

  if (
    backendType === "video" ||
    mime.startsWith("video/")
  ) {
    return "video";
  }

  return "document";
}

/* =========================================================
   CSRF
========================================================= */

async function ensureCsrfToken() {
  const response =
    await fetch(
      `${BACKEND_URL}/sanctum/csrf-cookie`,
      {
        method: "GET",
        credentials: "include",
      }
    );

  if (!response.ok) {
    throw new Error(
      "Impossible de récupérer le token CSRF."
    );
  }
}

function getXsrfToken(): string | null {
  if (
    typeof document ===
    "undefined"
  ) {
    return null;
  }

  const cookies =
    document.cookie.split("; ");

  const xsrfCookie =
    cookies.find((cookie) =>
      cookie.startsWith(
        "XSRF-TOKEN="
      )
    );

  if (!xsrfCookie) {
    return null;
  }

  return decodeURIComponent(
    xsrfCookie.substring(
      "XSRF-TOKEN=".length
    )
  );
}

/* =========================================================
   LIRE UNE RÉPONSE API
========================================================= */

async function readApiResponse(
  response: Response
): Promise<any> {
  const contentType =
    response.headers.get(
      "content-type"
    ) || "";

  const text =
    await response.text();

  if (
    contentType.includes(
      "application/json"
    )
  ) {
    try {
      return text
        ? JSON.parse(text)
        : {};
    } catch {
      throw new Error(
        "Le serveur a envoyé une réponse JSON invalide."
      );
    }
  }

  if (response.status === 413) {
    throw new Error(
      "Le fichier est trop volumineux. La limite actuelle du serveur est dépassée."
    );
  }

  if (response.status === 401) {
    throw new Error(
      "Votre session a expiré. Veuillez vous reconnecter."
    );
  }

  if (response.status === 403) {
    throw new Error(
      "Vous n'êtes pas autorisé à effectuer cette action."
    );
  }

  if (response.status === 419) {
    throw new Error(
      "La session CSRF a expiré. Rechargez la page puis réessayez."
    );
  }

  if (response.status === 422) {
    throw new Error(
      "Les informations envoyées ne sont pas valides."
    );
  }

  if (response.status === 404) {
    throw new Error(
      "Le média demandé est introuvable."
    );
  }

  if (response.status >= 500) {
    throw new Error(
      "Une erreur est survenue sur le serveur."
    );
  }

  if (
    text.includes("<html") ||
    text.includes("<br")
  ) {
    throw new Error(
      `Le serveur a renvoyé une erreur HTTP ${response.status}.`
    );
  }

  return {};
}

/* =========================================================
   TRANSFORMATION
========================================================= */

function transformMedia(
  media: BackendMedia
): Media {
  /*
   * URL permettant d'afficher le fichier.
   *
   * IMPORTANT :
   * cette URL est différente de l'URL de téléchargement.
   */
  const srcUrl =
    getMediaUrl(media.path);

  /*
   * Cette URL passe par Laravel.
   * Laravel utilise Storage::download()
   * pour forcer le téléchargement.
   */
  const downloadUrl =
    `${BACKEND_URL}/api/medias/${media.id}/download`;

  const type =
    normalizeMediaType(
      media.type,
      media.mime_type
    );

  return {
    id: media.id,

    name:
      media.original_name ||
      media.name,

    type,

    size: formatFileSize(
      media.size
    ),

    sizeBytes: media.size,

    date: formatDate(
      media.created_at
    ),

    dateValue: new Date(
      media.created_at
    ).getTime(),

    folder:
      media.folder?.name ||
      "Sans dossier",

    folderId:
      media.folder_id,

    /*
     * Les images ET les vidéos ont
     * une URL d'affichage.
     */
    src:
      type === "image" ||
      type === "video"
        ? srcUrl
        : undefined,

    downloadUrl,

    mimeType:
      media.mime_type,
  };
}

/* =========================================================
   PAGE
========================================================= */

function MediasPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectionMode = searchParams.get("select") === "publication";
  const returnTo = searchParams.get("returnTo") || "/dashboard/publications";

  /* =======================================================
     VUE
  ======================================================= */

  const [view, setView] =
    useState<
      "grid" | "list"
    >("grid");

  /* =======================================================
     FILTRES
  ======================================================= */

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState<
      | "all"
      | "image"
      | "video"
      | "document"
    >("all");

  const [
    selectedFolder,
    setSelectedFolder,
  ] = useState<number | null>(
    null
  );

  const [sort, setSort] =
    useState<SortOption>(
      "recent"
    );

  const [
    showFilter,
    setShowFilter,
  ] = useState(false);

  const [
    showSort,
    setShowSort,
  ] = useState(false);

  /* =======================================================
     DONNÉES
  ======================================================= */

  const [medias, setMedias] =
    useState<Media[]>([]);

  const [folders, setFolders] =
    useState<BackendFolder[]>(
      []
    );

  /* =======================================================
     CHARGEMENT
  ======================================================= */

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  /* =======================================================
     SÉLECTION
  ======================================================= */

  const [
    selectedMedia,
    setSelectedMedia,
  ] = useState<number | null>(
    null
  );

  const [selectedMediaIds, setSelectedMediaIds] =
    useState<number[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMediaCount, setTotalMediaCount] = useState(0);

  const [
    openMediaMenu,
    setOpenMediaMenu,
  ] = useState<number | null>(
    null
  );

  /* =======================================================
     APERÇU
  ======================================================= */

  const [
    previewMedia,
    setPreviewMedia,
  ] = useState<Media | null>(
    null
  );

  /* =======================================================
     SUPPRESSION
  ======================================================= */

  const [
    deletingMedia,
    setDeletingMedia,
  ] = useState<number | null>(
    null
  );

  const [
    deleteConfirmMedia,
    setDeleteConfirmMedia,
  ] = useState<Media | null>(
    null
  );

  /* =======================================================
     IMPORT
  ======================================================= */

  const [
    showUpload,
    setShowUpload,
  ] = useState(false);

  const [
    uploading,
    setUploading,
  ] = useState(false);

  const [
    uploadFiles,
    setUploadFiles,
  ] = useState<File[]>([]);

  const [
    uploadFolderId,
    setUploadFolderId,
  ] = useState<number | null>(
    null
  );

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const folderInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  /* =======================================================
     DOSSIER
  ======================================================= */

  const [
    showNewFolder,
    setShowNewFolder,
  ] = useState(false);

  const [
    newFolderName,
    setNewFolderName,
  ] = useState("");

  const [
    creatingFolder,
    setCreatingFolder,
  ] = useState(false);

  /* =======================================================
     MESSAGES
  ======================================================= */

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  /* =======================================================
     CHARGER DONNÉES
  ======================================================= */

  const loadData = async (
    showRefresh = false,
    page = currentPage
  ) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("per_page", "24");

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (filter !== "all") {
        params.set("type", filter);
      }

      if (selectedFolder !== null) {
        params.set("folder_id", String(selectedFolder));
      }

      params.set("sort", sort);

      const [mediasResponse, foldersResponse] = await Promise.all([
      fetch(`${BACKEND_URL}/api/medias?${params.toString()}`, {
  method: "GET",
  credentials: "include",
  headers: getAuthHeaders(),
}),
      fetch(`${BACKEND_URL}/api/media-folders`, {
  method: "GET",
  credentials: "include",
  headers: getAuthHeaders(),
}),
      ]);

      if (
        mediasResponse.status === 401 ||
        foldersResponse.status === 401
      ) {
        throw new Error(
          "Votre session a expiré. Veuillez vous reconnecter."
        );
      }

      const mediasData = await readApiResponse(mediasResponse);
      const foldersData = await readApiResponse(foldersResponse);

      if (!mediasResponse.ok) {
        throw new Error(
          mediasData.message ||
            "Impossible de récupérer les médias."
        );
      }

      if (!foldersResponse.ok) {
        throw new Error(
          foldersData.message ||
            "Impossible de récupérer les dossiers."
        );
      }

      const backendMedias: BackendMedia[] = mediasData.medias || [];
      const backendFolders: BackendFolder[] = foldersData.folders || [];

      setMedias(backendMedias.map(transformMedia));
      setFolders(backendFolders);

      const pagination = mediasData.pagination || {};
      setCurrentPage(Number(pagination.current_page || page));
      setTotalPages(Math.max(1, Number(pagination.last_page || 1)));
      setTotalMediaCount(Number(pagination.total || backendMedias.length));
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /*
   * Pré-remplissage de la sélection quand on arrive
   * depuis la page de création de publication : on relit
   * ce qui a été mis dans sessionStorage juste avant la
   * redirection vers cette page.
   */
  useEffect(() => {
    if (!selectionMode) return;

    try {
      const stored = sessionStorage.getItem(
        "griot_publication_media_selection"
      );

      if (!stored) return;

      const parsed = JSON.parse(stored);

      const ids = Array.isArray(parsed?.ids)
        ? parsed.ids
            .map((id: unknown) => Number(id))
            .filter(
              (id: number) => Number.isInteger(id) && id > 0
            )
        : [];

      setSelectedMediaIds(ids);
    } catch (error) {
      console.error(
        "Impossible de lire la présélection de médias :",
        error
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionMode]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter, selectedFolder, sort]);

  useEffect(() => {
    loadData(false, currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, search, filter, selectedFolder, sort]);

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timer =
      setTimeout(() => {
        setSuccessMessage("");
      }, 3500);

    return () =>
      clearTimeout(timer);
  }, [successMessage]);

  /* =======================================================
     STATISTIQUES
  ======================================================= */

  const imageCount = useMemo(() => {
    return medias.filter((media) => media.type === "image").length;
  }, [medias]);

  const videoCount = useMemo(() => {
    return medias.filter((media) => media.type === "video").length;
  }, [medias]);

  const documentCount = useMemo(() => {
    return medias.filter((media) => media.type === "document").length;
  }, [medias]);

  /* =======================================================
     MÉDIAS AFFICHÉS
  ======================================================= */

  const filteredMedias = useMemo(() => {
    return medias;
  }, [medias]);

  const selectedMediaCount = selectedMediaIds.length;

  /* =======================================================
     DOSSIER ACTUEL
  ======================================================= */

  const selectedFolderName =
    selectedFolder === null
      ? "Tous les médias"
      : folders.find(
          (folder) =>
            folder.id ===
            selectedFolder
        )?.name ||
        "Dossier";

  const filterLabel =
    filter === "all"
      ? "Tous les fichiers"
      : filter === "image"
      ? "Images"
      : filter === "video"
      ? "Vidéos"
      : "Documents";

  const sortLabel =
    sort === "recent"
      ? "Plus récent"
      : sort === "oldest"
      ? "Plus ancien"
      : sort === "name"
      ? "Nom"
      : "Taille";

  /* =======================================================
     OUVRIR IMPORT
  ======================================================= */

  const openUploadModal = () => {
    setUploadFiles([]);

    setUploadFolderId(
      selectedFolder
    );

    setShowUpload(true);
  };

  /* =======================================================
     CHOISIR DES FICHIERS
  ======================================================= */

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(
      event.target.files || []
    );

    setUploadFiles(files);
  };

  /* =======================================================
     CHOISIR UN DOSSIER
  ======================================================= */

  const handleFolderChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(
      event.target.files || []
    );

    setUploadFiles(files);

    if (files.length > 0) {
      setShowUpload(true);
    }
  };

  /* =======================================================
     IMPORTER
  ======================================================= */

  const handleUpload = async () => {
    if (
      uploadFiles.length === 0
    ) {
      setError(
        "Veuillez sélectionner au moins un fichier."
      );

      return;
    }

    try {
      setUploading(true);
      setError("");

      await ensureCsrfToken();

      const xsrfToken =
        getXsrfToken();

      let imported = 0;

      for (const file of uploadFiles) {
        const formData =
          new FormData();

        formData.append(
          "file",
          file
        );

        if (
          uploadFolderId !== null
        ) {
          formData.append(
            "folder_id",
            String(uploadFolderId)
          );
        }

        const response =
          await fetch(
            `${BACKEND_URL}/api/medias`,
            {
              method: "POST",
              credentials: "include",
            headers: {
  ...getAuthHeaders(),

  ...(xsrfToken
    ? {
        "X-XSRF-TOKEN":
          xsrfToken,
      }
    : {}),
},
              body: formData,
            }
          );

        const data =
          await readApiResponse(
            response
          );

        if (!response.ok) {
          if (data.errors) {
            const firstError =
              Object.values(
                data.errors
              )
                .flat()
                .find(
                  (message) =>
                    typeof message ===
                    "string"
                );

            throw new Error(
              typeof firstError ===
                "string"
                ? firstError
                : data.message ||
                    `Impossible d'importer ${file.name}.`
            );
          }

          throw new Error(
            data.message ||
              `Impossible d'importer ${file.name}.`
          );
        }

        imported++;
      }

      setShowUpload(false);
      setUploadFiles([]);

      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          "";
      }

      if (
        folderInputRef.current
      ) {
        folderInputRef.current.value =
          "";
      }

      setSuccessMessage(
        imported === 1
          ? "Média importé avec succès."
          : `${imported} médias importés avec succès.`
      );

      await loadData(true);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Impossible d'importer les fichiers."
      );
    } finally {
      setUploading(false);
    }
  };

  /* =======================================================
     CRÉER DOSSIER
  ======================================================= */

  const handleCreateFolder =
    async () => {
      const name =
        newFolderName.trim();

      if (!name) {
        return;
      }

      try {
        setCreatingFolder(true);
        setError("");

        await ensureCsrfToken();

        const xsrfToken =
          getXsrfToken();

        const response =
          await fetch(
            `${BACKEND_URL}/api/media-folders`,
            {
              method: "POST",
              credentials: "include",
       headers: {
  ...getAuthHeaders(),

  "Content-Type":
    "application/json",

  ...(xsrfToken
    ? {
        "X-XSRF-TOKEN":
          xsrfToken,
      }
    : {}),
},

              body: JSON.stringify({
                name,
              }),
            }
          );

        const data =
          await readApiResponse(
            response
          );

        if (!response.ok) {
          if (data.errors) {
            const firstError =
              Object.values(
                data.errors
              )
                .flat()
                .find(
                  (message) =>
                    typeof message ===
                    "string"
                );

            throw new Error(
              typeof firstError ===
                "string"
                ? firstError
                : data.message ||
                    "Impossible de créer le dossier."
            );
          }

          throw new Error(
            data.message ||
              "Impossible de créer le dossier."
          );
        }

        const createdFolder:
          BackendFolder =
          data.folder;

        setNewFolderName("");
        setShowNewFolder(false);

        if (createdFolder?.id) {
          setSelectedFolder(
            createdFolder.id
          );

          setUploadFolderId(
            createdFolder.id
          );
        }

        setSuccessMessage(
          `Dossier "${name}" créé avec succès.`
        );

        await loadData(true);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Impossible de créer le dossier."
        );
      } finally {
        setCreatingFolder(false);
      }
    };

  /* =======================================================
     CHANGEMENT DOSSIER IMPORT
  ======================================================= */

  const handleUploadFolderChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value =
      event.target.value;

    if (
      value === "__create__"
    ) {
      setShowNewFolder(true);
      return;
    }

    setUploadFolderId(
      value
        ? Number(value)
        : null
    );
  };

  /* =======================================================
     TÉLÉCHARGER
  ======================================================= */

  const handleDownload = (
    media: Media
  ) => {
    /*
     * IMPORTANT :
     * on utilise l'URL Laravel /download
     * et non /storage/...
     *
     * Laravel répond avec Content-Disposition: attachment
     * grâce à Storage::download().
     */
    const link =
      document.createElement(
        "a"
      );

    link.href =
      media.downloadUrl;

    link.download =
      media.name;

    document.body.appendChild(
      link
    );

    link.click();

    link.remove();

    setOpenMediaMenu(null);
  };

  /* =======================================================
     SUPPRIMER
  ======================================================= */

  const handleDelete = async (
    media: Media
  ) => {
    try {
      setDeletingMedia(
        media.id
      );

      setError("");

      await ensureCsrfToken();

      const xsrfToken =
        getXsrfToken();

      const response =
        await fetch(
          `${BACKEND_URL}/api/medias/${media.id}`,
          {
            method: "DELETE",
            credentials: "include",
        headers: {
  ...getAuthHeaders(),

  ...(xsrfToken
    ? {
        "X-XSRF-TOKEN":
          xsrfToken,
      }
    : {}),
},
          }
        );

      const data =
        await readApiResponse(
          response
        );

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Impossible de supprimer le média."
        );
      }

      /*
       * On retire immédiatement le média
       * de l'affichage.
       */
      setMedias((current) =>
        current.filter(
          (item) =>
            item.id !== media.id
        )
      );

      setDeleteConfirmMedia(
        null
      );

      setSelectedMedia(
        (current) =>
          current === media.id
            ? null
            : current
      );

      setSelectedMediaIds((current) =>
        current.filter((id) => id !== media.id)
      );

      setPreviewMedia(
        (current) =>
          current?.id === media.id
            ? null
            : current
      );

      setOpenMediaMenu(null);

      setSuccessMessage(
        `Le média "${media.name}" a été supprimé.`
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Impossible de supprimer le média."
      );
    } finally {
      setDeletingMedia(null);
    }
  };

  /* =======================================================
     RESET
  ======================================================= */

  const resetFilters = () => {
    setSearch("");
    setFilter("all");
    setSelectedFolder(null);
    setSort("recent");
    setCurrentPage(1);
  };

  /* =======================================================
     MODE SÉLECTION
  ======================================================= */

  const toggleMediaSelection = (mediaId: number) => {
    setSelectedMediaIds((current) =>
      current.includes(mediaId)
        ? current.filter((id) => id !== mediaId)
        : [...current, mediaId]
    );
  };

  const cancelSelection = () => {
    router.push(returnTo);
  };

  const useSelectedMedias = () => {
    /*
     * On renvoie les médias complets (pas juste les ids) pour que
     * la page de publication puisse afficher l'aperçu sans avoir
     * à refaire un appel réseau.
     */
    const selectedFullMedias = medias
      .filter((media) => selectedMediaIds.includes(media.id))
      .map((media) => ({
        id: media.id,
        name: media.name,
        type: media.type,
        mime_type: media.mimeType,
        size: media.sizeBytes,
        src: media.src,
        folder:
          media.folderId !== null
            ? { id: media.folderId, name: media.folder }
            : null,
      }));

    try {
      sessionStorage.setItem(
        "griot_publication_media_selection",
        JSON.stringify({
          ids: selectedMediaIds,
          medias: selectedFullMedias,
        })
      );
    } catch (error) {
      console.error(
        "Impossible d'enregistrer la sélection de médias :",
        error
      );
    }

    const separator = returnTo.includes("?") ? "&" : "?";

    router.push(`${returnTo}${separator}mediaSelection=1`);
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className="min-h-screen bg-[#f8fafc] text-slate-900"
      onClick={() => {
        setOpenMediaMenu(null);
        setShowFilter(false);
        setShowSort(false);
      }}
    >
      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href={selectionMode ? returnTo : "/dashboard"}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <ArrowLeft size={17} />
            </Link>

            <div className="min-w-0">
              <p className="hidden text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 sm:block">
                Bibliothèque
              </p>

              <h1 className="truncate text-sm font-black sm:text-base">
                {selectionMode ? "Sélectionner des médias" : "Médias"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-50 hover:text-slate-900"
              aria-label="Notifications"
            >
              <Bell size={18} />

              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
            </button>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-xs font-black text-white">
              Y
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1700px] p-4 pb-28 sm:p-6 lg:p-8">
        {/* =================================================
            TITRE
        ================================================= */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">
              Gérez et organisez tous
              vos fichiers utilisés dans
              vos contenus.
            </p>

            <h2 className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">
              {selectionMode
                ? "Choisir dans la bibliothèque"
                : "Votre bibliothèque média"}
            </h2>
          </div>

          <div className="flex gap-2">
            <button
              onClick={(event) => {
                event.stopPropagation();

                loadData(true);
              }}
              disabled={refreshing}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-red-600 disabled:opacity-50"
              aria-label="Actualiser"
            >
              <RefreshCw
                size={15}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />
            </button>

            <button
              onClick={(event) => {
                event.stopPropagation();

                openUploadModal();
              }}
              className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-xs font-black text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700"
            >
              <Upload size={15} />
              {selectionMode ? "Importer un média" : "Importer un média"}
            </button>
          </div>
        </div>

        {/* =================================================
            MESSAGES
        ================================================= */}

        {error && (
          <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
            <span>{error}</span>

            <button
              onClick={() =>
                setError("")
              }
              className="shrink-0 text-red-400 hover:text-red-700"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-xs font-semibold text-green-700">
            <Check size={15} />

            {successMessage}
          </div>
        )}

        {selectionMode && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
            <ImageIcon size={15} />
            Cliquez sur un ou plusieurs médias pour les sélectionner, puis
            validez en bas de page.
          </div>
        )}

        {/* =================================================
            STATISTIQUES
        ================================================= */}

        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MediaStat
            icon={
              <ImageIcon size={17} />
            }
            label="Images"
            value={String(
              imageCount
            )}
          />

          <MediaStat
            icon={
              <Video size={17} />
            }
            label="Vidéos"
            value={String(
              videoCount
            )}
          />

          <MediaStat
            icon={
              <FileText size={17} />
            }
            label="Documents"
            value={String(
              documentCount
            )}
          />

          <MediaStat
            icon={
              <Folder size={17} />
            }
            label="Dossiers"
            value={String(
              folders.length
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
          {/* =================================================
              DOSSIERS
          ================================================= */}

          <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-800">
                Dossiers
              </h3>

              <button
                onClick={(event) => {
                  event.stopPropagation();

                  setNewFolderName("");

                  setShowNewFolder(
                    true
                  );
                }}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-red-600"
                aria-label="Créer un dossier"
              >
                <Plus size={15} />
              </button>
            </div>

            <div className="space-y-1">
              <button
                onClick={(event) => {
                  event.stopPropagation();

                  setSelectedFolder(
                    null
                  );
                }}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left transition ${
                  selectedFolder ===
                  null
                    ? "bg-red-50 text-red-600"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <FolderOpen
                  size={16}
                />

                <span className="min-w-0 flex-1 truncate text-[11px] font-bold">
                  Tous les médias
                </span>

                <span className="text-[9px] font-bold text-slate-400">
                  {totalMediaCount}
                </span>
              </button>

              {folders.map(
                (folder) => {
                  const active =
                    selectedFolder ===
                    folder.id;

                  const folderMediaCount = folder.medias_count ?? 0;

                  return (
                    <button
                      key={
                        folder.id
                      }
                      onClick={(
                        event
                      ) => {
                        event.stopPropagation();

                        setSelectedFolder(
                          folder.id
                        );

                        setFilter(
                          "all"
                        );
                      }}
                      className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left transition ${
                        active
                          ? "bg-red-50 text-red-600"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <Folder
                        size={16}
                      />

                      <span className="min-w-0 flex-1 truncate text-[11px] font-bold">
                        {
                          folder.name
                        }
                      </span>

                      <span className="text-[9px] font-bold text-slate-400">
                        {
                          folderMediaCount
                        }
                      </span>
                    </button>
                  );
                }
              )}
            </div>

            {/* TYPES */}

            <div className="mt-5 border-t border-slate-100 pt-4">
              <p className="mb-2 px-2 text-[9px] font-black uppercase tracking-wider text-slate-400">
                Type de fichier
              </p>

              <button
                onClick={(event) => {
                  event.stopPropagation();

                  setFilter(
                    "image"
                  );
                }}
                className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-[10px] font-semibold ${
                  filter === "image"
                    ? "bg-red-50 text-red-600"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <ImageIcon size={14} />

                Images

                <span className="ml-auto text-[9px] text-slate-400">
                  {imageCount}
                </span>
              </button>

              <button
                onClick={(event) => {
                  event.stopPropagation();

                  setFilter(
                    "video"
                  );
                }}
                className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-[10px] font-semibold ${
                  filter === "video"
                    ? "bg-red-50 text-red-600"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Video size={14} />

                Vidéos

                <span className="ml-auto text-[9px] text-slate-400">
                  {videoCount}
                </span>
              </button>

              <button
                onClick={(event) => {
                  event.stopPropagation();

                  setFilter(
                    "document"
                  );
                }}
                className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-[10px] font-semibold ${
                  filter === "document"
                    ? "bg-red-50 text-red-600"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <FileText size={14} />

                Documents

                <span className="ml-auto text-[9px] text-slate-400">
                  {documentCount}
                </span>
              </button>

              <button
                onClick={(event) => {
                  event.stopPropagation();

                  setFilter("all");
                }}
                className="mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-[10px] font-semibold text-red-600 hover:bg-red-50"
              >
                Tous les types
              </button>
            </div>
          </aside>

          {/* =================================================
              BIBLIOTHÈQUE
          ================================================= */}

          <section className="min-w-0">
            {/* TOOLBAR */}

            <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="relative min-w-0 flex-1">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Rechercher un média..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs font-medium outline-none transition focus:border-red-400 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2">
                {/* FILTRE */}

                <div className="relative">
                  <button
                    onClick={(event) => {
                      event.stopPropagation();

                      setShowFilter(
                        !showFilter
                      );

                      setShowSort(
                        false
                      );
                    }}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-[10px] font-bold text-slate-600 hover:bg-slate-50"
                  >
                    {filterLabel}

                    <ChevronDown
                      size={13}
                    />
                  </button>

                  {showFilter && (
                    <div
                      onClick={(
                        event
                      ) =>
                        event.stopPropagation()
                      }
                      className="absolute right-0 top-full z-30 mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xl"
                    >
                      {[
                        {
                          value:
                            "all",
                          label:
                            "Tous les fichiers",
                        },
                        {
                          value:
                            "image",
                          label:
                            "Images",
                        },
                        {
                          value:
                            "video",
                          label:
                            "Vidéos",
                        },
                        {
                          value:
                            "document",
                          label:
                            "Documents",
                        },
                      ].map(
                        (item) => (
                          <button
                            key={
                              item.value
                            }
                            onClick={() => {
                              setFilter(
                                item.value as
                                  | "all"
                                  | "image"
                                  | "video"
                                  | "document"
                              );

                              setShowFilter(
                                false
                              );
                            }}
                            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[10px] font-semibold text-slate-600 hover:bg-slate-50"
                          >
                            {
                              item.label
                            }

                            {filter ===
                              item.value && (
                              <Check
                                size={
                                  13
                                }
                                className="text-red-600"
                              />
                            )}
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>

                {/* VUE */}

                <div className="flex rounded-xl border border-slate-200 p-1">
                  <button
                    onClick={(event) => {
                      event.stopPropagation();

                      setView(
                        "grid"
                      );
                    }}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      view === "grid"
                        ? "bg-red-50 text-red-600"
                        : "text-slate-400"
                    }`}
                  >
                    <Grid3X3
                      size={15}
                    />
                  </button>

                  <button
                    onClick={(event) => {
                      event.stopPropagation();

                      setView(
                        "list"
                      );
                    }}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      view === "list"
                        ? "bg-red-50 text-red-600"
                        : "text-slate-400"
                    }`}
                  >
                    <List size={15} />
                  </button>
                </div>
              </div>
            </div>

            {/* INFO */}

            <div className="mb-3 flex items-center justify-between">
              <p className="text-[10px] font-semibold text-slate-400">
                {totalMediaCount}{" "}
                média
                {filteredMedias.length >
                1
                  ? "s"
                  : ""}{" "}
                trouvé
                {filteredMedias.length >
                1
                  ? "s"
                  : ""}

                {selectedFolder !==
                  null && (
                  <>
                    {" "}
                    dans{" "}
                    <span className="font-black text-slate-500">
                      {
                        selectedFolderName
                      }
                    </span>
                  </>
                )}
              </p>

              {/* TRI */}

              <div className="relative">
                <button
                  onClick={(event) => {
                    event.stopPropagation();

                    setShowSort(
                      !showSort
                    );

                    setShowFilter(
                      false
                    );
                  }}
                  className="flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-red-600"
                >
                  {sortLabel}

                  <ChevronDown
                    size={12}
                  />
                </button>

                {showSort && (
                  <div
                    onClick={(
                      event
                    ) =>
                      event.stopPropagation()
                    }
                    className="absolute right-0 top-full z-30 mt-2 w-36 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xl"
                  >
                    {[
                      {
                        value:
                          "recent",
                        label:
                          "Plus récent",
                      },
                      {
                        value:
                          "oldest",
                        label:
                          "Plus ancien",
                      },
                      {
                        value:
                          "name",
                        label:
                          "Nom",
                      },
                      {
                        value:
                          "size",
                        label:
                          "Taille",
                      },
                    ].map(
                      (item) => (
                        <button
                          key={
                            item.value
                          }
                          onClick={() => {
                            setSort(
                              item.value as SortOption
                            );

                            setShowSort(
                              false
                            );
                          }}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[10px] font-semibold text-slate-600 hover:bg-slate-50"
                        >
                          {
                            item.label
                          }

                          {sort ===
                            item.value && (
                            <Check
                              size={13}
                              className="text-red-600"
                            />
                          )}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* CHARGEMENT */}

            {loading && (
              <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                <Loader2
                  size={28}
                  className="mx-auto animate-spin text-red-600"
                />

                <p className="mt-4 text-xs font-bold text-slate-500">
                  Chargement de votre
                  bibliothèque...
                </p>
              </div>
            )}

            {/* GRILLE */}

            {!loading &&
              filteredMedias.length >
                0 &&
              view === "grid" && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {filteredMedias.map(
                    (media) => (
                      <MediaCard
                        key={media.id}
                        media={media}
                        selected={
                          selectionMode
                            ? selectedMediaIds.includes(media.id)
                            : selectedMedia === media.id
                        }
                        selectionMode={selectionMode}
                        menuOpen={
                          openMediaMenu ===
                          media.id
                        }
                        deleting={
                          deletingMedia ===
                          media.id
                        }
                        onSelect={() => {
                          if (selectionMode) {
                            toggleMediaSelection(media.id);
                            return;
                          }

                          setSelectedMedia(
                            selectedMedia === media.id
                              ? null
                              : media.id
                          );
                        }}
                        onToggleMenu={() =>
                          setOpenMediaMenu(
                            openMediaMenu ===
                              media.id
                              ? null
                              : media.id
                          )
                        }
                        onPreview={() =>
                          setPreviewMedia(
                            media
                          )
                        }
                        onDownload={() =>
                          handleDownload(
                            media
                          )
                        }
                        onDelete={() =>
                          setDeleteConfirmMedia(
                            media
                          )
                        }
                      />
                    )
                  )}
                </div>
              )}

            {/* LISTE */}

            {!loading &&
              filteredMedias.length >
                0 &&
              view === "list" && (
                <div className="overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="hidden grid-cols-[1fr_120px_110px_100px_40px] gap-4 border-b border-slate-100 px-4 py-3 text-[9px] font-black uppercase tracking-wider text-slate-400 sm:grid">
                    <span>Nom</span>

                    <span>Type</span>

                    <span>Taille</span>

                    <span>Date</span>

                    <span />
                  </div>

                  {filteredMedias.map(
                    (media) => (
                      <MediaListItem
                        key={media.id}
                        media={media}
                        selectionMode={selectionMode}
                        selected={selectedMediaIds.includes(media.id)}
                        onSelect={() => toggleMediaSelection(media.id)}
                        menuOpen={
                          openMediaMenu ===
                          media.id
                        }
                        deleting={
                          deletingMedia ===
                          media.id
                        }
                        onToggleMenu={() =>
                          setOpenMediaMenu(
                            openMediaMenu ===
                              media.id
                              ? null
                              : media.id
                          )
                        }
                        onPreview={() =>
                          setPreviewMedia(
                            media
                          )
                        }
                        onDownload={() =>
                          handleDownload(
                            media
                          )
                        }
                        onDelete={() =>
                          setDeleteConfirmMedia(
                            media
                          )
                        }
                      />
                    )
                  )}
                </div>
              )}

            {/* VIDE */}

            {!loading &&
              filteredMedias.length ===
                0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <Search size={20} />
                  </div>

                  <h3 className="mt-4 text-sm font-black text-slate-800">
                    {medias.length ===
                    0
                      ? "Votre bibliothèque est vide"
                      : "Aucun média trouvé"}
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    {medias.length ===
                    0
                      ? "Importez votre premier média pour commencer."
                      : "Essayez une autre recherche ou modifiez vos filtres."}
                  </p>

                  {medias.length ===
                  0 ? (
                    <button
                      onClick={
                        openUploadModal
                      }
                      className="mt-5 rounded-xl bg-red-600 px-4 py-2.5 text-[10px] font-black text-white hover:bg-red-700"
                    >
                      Importer un média
                    </button>
                  ) : (
                    <button
                      onClick={
                        resetFilters
                      }
                      className="mt-5 rounded-xl border border-slate-200 px-4 py-2.5 text-[10px] font-black text-slate-600 hover:bg-slate-50"
                    >
                      Réinitialiser
                      les filtres
                    </button>
                  )}
                </div>
              )}
          </section>
        </div>
      </main>

      {selectionMode && (
        <div className="fixed bottom-0 left-0 right-0 z-[70] border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur sm:px-6">
          <div className="mx-auto flex max-w-[1700px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black text-slate-800">
                {selectedMediaCount} média{selectedMediaCount > 1 ? "s" : ""} sélectionné{selectedMediaCount > 1 ? "s" : ""}
              </p>
              <p className="text-[9px] text-slate-400">
                Vous pouvez sélectionner des médias sur plusieurs pages.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={cancelSelection}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-[10px] font-black text-slate-600 hover:bg-slate-50"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={useSelectedMedias}
                disabled={selectedMediaCount === 0}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-[10px] font-black text-white shadow-lg shadow-red-600/20 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Utiliser {selectedMediaCount > 0 ? selectedMediaCount : "ces"} média{selectedMediaCount > 1 ? "s" : ""}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          MODAL IMPORT
      ===================================================== */}

      {showUpload && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4"
          onClick={() => {
            if (!uploading) {
              setShowUpload(false);
            }
          }}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-900">
                  Importer des médias
                </h2>

                <p className="mt-1 text-[10px] text-slate-400">
                  Ajoutez un ou plusieurs
                  fichiers dans votre
                  bibliothèque.
                </p>
              </div>

              <button
                onClick={() =>
                  setShowUpload(false)
                }
                disabled={
                  uploading
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-50"
              >
                <X size={17} />
              </button>
            </div>

            {/* INPUT FICHIERS */}

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.gif,.webp,.mp4,.mov,.avi,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              className="hidden"
              onChange={
                handleFileChange
              }
            />

            {/* INPUT DOSSIER */}

            <input
              ref={folderInputRef}
              type="file"
              multiple
              className="hidden"
              {...({
                webkitdirectory: "",
                directory: "",
              } as any)}
              onChange={
                handleFolderChange
              }
            />

            {/* ZONE */}

            <div className="mt-5 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <Upload size={21} />
              </div>

              {uploadFiles.length >
              0 ? (
                <>
                  <h3 className="mt-4 text-sm font-black text-slate-800">
                    {
                      uploadFiles.length
                    }{" "}
                    fichier
                    {uploadFiles.length >
                    1
                      ? "s"
                      : ""}{" "}
                    sélectionné
                    {uploadFiles.length >
                    1
                      ? "s"
                      : ""}
                  </h3>

                  <div className="mt-3 max-h-28 overflow-y-auto text-left">
                    {uploadFiles.map(
                      (
                        file,
                        index
                      ) => (
                        <div
                          key={`${file.name}-${index}`}
                          className="flex items-center justify-between border-b border-slate-200 py-1.5 last:border-0"
                        >
                          <span className="max-w-[75%] truncate text-[10px] font-semibold text-slate-600">
                            {
                              file.name
                            }
                          </span>

                          <span className="text-[9px] text-slate-400">
                            {formatFileSize(
                              file.size
                            )}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </>
              ) : (
                <>
                  <h3 className="mt-4 text-sm font-black text-slate-800">
                    Sélectionnez vos
                    fichiers
                  </h3>

                  <p className="mt-1 text-[10px] text-slate-400">
                    Images, vidéos ou
                    documents
                  </p>
                </>
              )}

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  disabled={
                    uploading
                  }
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[10px] font-black text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  {uploadFiles.length
                    ? "Changer les fichiers"
                    : "Choisir des fichiers"}
                </button>

                <button
                  onClick={() =>
                    folderInputRef.current?.click()
                  }
                  disabled={
                    uploading
                  }
                  className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-[10px] font-black text-red-600 hover:bg-red-100 disabled:opacity-50"
                >
                  <Folder size={13} />

                  Choisir un dossier
                </button>
              </div>
            </div>

            {/* DOSSIER GRIOT */}

            <div className="mt-4">
              <label className="mb-2 block text-[10px] font-black uppercase tracking-wider text-slate-400">
                Dossier Griot AI
              </label>

              <select
                value={
                  uploadFolderId ===
                  null
                    ? ""
                    : String(
                        uploadFolderId
                      )
                }
                onChange={
                  handleUploadFolderChange
                }
                disabled={
                  uploading
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs font-semibold text-slate-700 outline-none focus:border-red-400"
              >
                <option value="">
                  Sans dossier
                </option>

                {folders.map(
                  (folder) => (
                    <option
                      key={
                        folder.id
                      }
                      value={String(
                        folder.id
                      )}
                    >
                      {
                        folder.name
                      }
                    </option>
                  )
                )}

                <option value="__create__">
                  ＋ Créer un nouveau
                  dossier…
                </option>
              </select>

              {uploadFolderId !==
                null && (
                <p className="mt-2 text-[9px] font-semibold text-green-600">
                  Les fichiers sélectionnés
                  seront placés dans ce
                  dossier.
                </p>
              )}
            </div>

            {/* ACTIONS */}

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() =>
                  setShowUpload(false)
                }
                disabled={
                  uploading
                }
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-[10px] font-black text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Annuler
              </button>

              <button
                onClick={
                  handleUpload
                }
                disabled={
                  uploading ||
                  uploadFiles.length ===
                    0
                }
                className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-[10px] font-black text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploading && (
                  <Loader2
                    size={13}
                    className="animate-spin"
                  />
                )}

                {uploading
                  ? "Importation..."
                  : `Importer ${
                      uploadFiles.length ||
                      ""
                    } fichier${
                      uploadFiles.length >
                      1
                        ? "s"
                        : ""
                    }`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          NOUVEAU DOSSIER
      ===================================================== */}

      {showNewFolder && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4"
          onClick={() => {
            if (!creatingFolder) {
              setShowNewFolder(
                false
              );
            }
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-900">
                  Nouveau dossier
                </h2>

                <p className="mt-1 text-[10px] text-slate-400">
                  Organisez vos médias dans
                  un dossier.
                </p>
              </div>

              <button
                onClick={() =>
                  setShowNewFolder(
                    false
                  )
                }
                disabled={
                  creatingFolder
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X size={17} />
              </button>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-[10px] font-black uppercase tracking-wider text-slate-400">
                Nom du dossier
              </label>

              <input
                autoFocus
                value={
                  newFolderName
                }
                onChange={(event) =>
                  setNewFolderName(
                    event.target.value
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key ===
                      "Enter" &&
                    !creatingFolder
                  ) {
                    handleCreateFolder();
                  }
                }}
                placeholder="Ex : Campagnes"
                maxLength={100}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs font-semibold text-slate-800 outline-none transition focus:border-red-400 focus:bg-white"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() =>
                  setShowNewFolder(
                    false
                  )
                }
                disabled={
                  creatingFolder
                }
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-[10px] font-black text-slate-600 hover:bg-slate-50"
              >
                Annuler
              </button>

              <button
                onClick={
                  handleCreateFolder
                }
                disabled={
                  creatingFolder ||
                  !newFolderName.trim()
                }
                className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-[10px] font-black text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creatingFolder && (
                  <Loader2
                    size={13}
                    className="animate-spin"
                  />
                )}

                {creatingFolder
                  ? "Création..."
                  : "Créer le dossier"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          MODAL APERÇU
      ===================================================== */}

      {previewMedia && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
          onClick={() =>
            setPreviewMedia(null)
          }
        >
          <div
            className="relative flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* HEADER APERÇU */}

            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-slate-900">
                  {
                    previewMedia.name
                  }
                </p>

                <p className="mt-0.5 text-[9px] text-slate-400">
                  {
                    previewMedia.folder
                  }{" "}
                  ·{" "}
                  {
                    previewMedia.size
                  }
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    handleDownload(
                      previewMedia
                    )
                  }
                  className="flex h-9 items-center gap-2 rounded-xl border border-slate-200 px-3 text-[10px] font-black text-slate-600 hover:bg-slate-50"
                >
                  <Download
                    size={14}
                  />

                  <span className="hidden sm:inline">
                    Télécharger
                  </span>
                </button>

                <button
                  onClick={() =>
                    setPreviewMedia(
                      null
                    )
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-900"
                  aria-label="Fermer l'aperçu"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* CONTENU */}

            <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-slate-950 p-4 sm:p-8">
              {previewMedia.type ===
                "image" &&
              previewMedia.src ? (
                <img
                  src={
                    previewMedia.src
                  }
                  alt={
                    previewMedia.name
                  }
                  className="max-h-[75vh] max-w-full object-contain"
                />
              ) : previewMedia.type ===
                  "video" &&
                previewMedia.src ? (
                <video
                  src={
                    previewMedia.src
                  }
                  controls
                  autoPlay
                  playsInline
                  className="max-h-[75vh] max-w-full rounded-xl object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center text-white">
                  <FileText
                    size={48}
                    className="text-red-500"
                  />

                  <p className="mt-4 text-sm font-black">
                    Aperçu non disponible
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Téléchargez le document
                    pour l'ouvrir.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          CONFIRMATION SUPPRESSION
      ===================================================== */}

      {deleteConfirmMedia && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4"
          onClick={() => {
            if (
              deletingMedia ===
              null
            ) {
              setDeleteConfirmMedia(
                null
              );
            }
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <AlertTriangle
                  size={21}
                />
              </div>

              <div className="min-w-0">
                <h2 className="text-base font-black text-slate-900">
                  Supprimer ce média ?
                </h2>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Vous êtes sur le point
                  de supprimer définitivement
                  <span className="font-black text-slate-800">
                    {" "}
                    "
                    {
                      deleteConfirmMedia.name
                    }
                    "
                  </span>
                  .
                </p>

                <p className="mt-2 text-[10px] font-semibold text-red-500">
                  Le fichier sera également
                  supprimé du stockage.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() =>
                  setDeleteConfirmMedia(
                    null
                  )
                }
                disabled={
                  deletingMedia !==
                  null
                }
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-[10px] font-black text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Annuler
              </button>

              <button
                onClick={() =>
                  handleDelete(
                    deleteConfirmMedia
                  )
                }
                disabled={
                  deletingMedia !==
                  null
                }
                className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-[10px] font-black text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deletingMedia !==
                  null && (
                  <Loader2
                    size={13}
                    className="animate-spin"
                  />
                )}

                {deletingMedia !==
                null
                  ? "Suppression..."
                  : "Supprimer définitivement"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   STATISTIQUE
========================================================= */

function MediaStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
        {icon}
      </div>

      <div>
        <p className="text-lg font-black text-slate-900">
          {value}
        </p>

        <p className="text-[9px] font-semibold text-slate-400">
          {label}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   MEDIA CARD
========================================================= */

function MediaCard({
  media,
  selected,
  selectionMode,
  menuOpen,
  deleting,
  onSelect,
  onToggleMenu,
  onPreview,
  onDownload,
  onDelete,
}: {
  media: Media;
  selected: boolean;
  selectionMode: boolean;
  menuOpen: boolean;
  deleting: boolean;
  onSelect: () => void;
  onToggleMenu: () => void;
  onPreview: () => void;
  onDownload: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`group relative overflow-visible rounded-2xl border bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md ${
        selected
          ? "border-red-500 ring-2 ring-red-500/10"
          : "border-slate-200"
      }`}
    >
      {/* APERÇU MEDIA */}

      <div
        onClick={onSelect}
        role="button"
        aria-pressed={selected}
        className="relative aspect-[4/3] cursor-pointer overflow-hidden rounded-t-2xl bg-slate-50"
      >
        {media.type ===
          "image" &&
        media.src ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50 p-3">
            <img
              src={media.src}
              alt={media.name}
              className="h-full w-full object-contain object-center transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </div>
        ) : media.type ===
            "video" &&
          media.src ? (
          <div className="relative h-full w-full bg-black">
            <video
              src={media.src}
              className="h-full w-full object-cover"
              muted
              playsInline
              preload="metadata"
            />

            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-red-600 shadow-lg">
                <Video
                  size={22}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-red-500 shadow-sm">
              <FileText
                size={25}
              />
            </div>
          </div>
        )}

        {/* TYPE */}

        <div className="absolute left-3 top-3 z-10 rounded-lg bg-black/50 px-2 py-1 text-[8px] font-bold text-white backdrop-blur">
          {media.type ===
          "image"
            ? "IMAGE"
            : media.type ===
              "video"
            ? "VIDÉO"
            : "DOCUMENT"}
        </div>

        {/* SÉLECTION */}

        {selected && (
          <div className="absolute right-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white">
            <Check size={13} />
          </div>
        )}

        {selectionMode && !selected && (
          <div className="absolute right-3 top-3 z-10 h-6 w-6 rounded-full border-2 border-white bg-black/20 backdrop-blur" />
        )}

        {/* BOUTON APERÇU */}

        <button
          onClick={(event) => {
            event.stopPropagation();

            onPreview();
          }}
          className="absolute bottom-3 left-3 z-20 flex h-8 items-center gap-2 rounded-lg bg-white/95 px-3 text-[9px] font-black text-slate-700 opacity-0 shadow-lg transition group-hover:opacity-100 hover:bg-white"
        >
          <Eye size={13} />

          Aperçu
        </button>
      </div>

      {/* INFORMATIONS */}

      <div className="p-3">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-black text-slate-800">
              {media.name}
            </p>

            <p className="mt-1 truncate text-[9px] text-slate-400">
              {media.folder} ·{" "}
              {media.size}
            </p>
          </div>

          {/* MENU */}

          <div className="relative shrink-0">
            <button
              onClick={(event) => {
                event.stopPropagation();

                onToggleMenu();
              }}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-900"
            >
              <MoreHorizontal
                size={15}
              />
            </button>

            {menuOpen && (
              <div
                onClick={(event) =>
                  event.stopPropagation()
                }
                className="absolute bottom-full right-0 z-[60] mb-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xl"
              >
                {/* APERÇU */}

                <button
                  onClick={() => {
                    onPreview();
                    onToggleMenu();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[10px] font-semibold text-slate-600 hover:bg-slate-50"
                >
                  <Eye size={13} />

                  Aperçu
                </button>

                {/* TÉLÉCHARGER */}

                <button
                  onClick={
                    onDownload
                  }
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[10px] font-semibold text-slate-600 hover:bg-slate-50"
                >
                  <Download
                    size={13}
                  />

                  Télécharger
                </button>

                {/* SUPPRIMER */}

                <button
                  onClick={onDelete}
                  disabled={deleting}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[10px] font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {deleting ? (
                    <Loader2
                      size={13}
                      className="animate-spin"
                    />
                  ) : (
                    <Trash2
                      size={13}
                    />
                  )}

                  Supprimer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   LIST ITEM
========================================================= */

function MediaListItem({
  media,
  selectionMode,
  selected,
  onSelect,
  menuOpen,
  deleting,
  onToggleMenu,
  onPreview,
  onDownload,
  onDelete,
}: {
  media: Media;
  selectionMode: boolean;
  selected: boolean;
  onSelect: () => void;
  menuOpen: boolean;
  deleting: boolean;
  onToggleMenu: () => void;
  onPreview: () => void;
  onDownload: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      onClick={selectionMode ? onSelect : undefined}
      className={`relative grid grid-cols-1 gap-3 border-b border-slate-100 px-4 py-3 last:border-0 sm:grid-cols-[1fr_120px_110px_100px_40px] sm:items-center sm:gap-4 ${selectionMode ? "cursor-pointer hover:bg-slate-50" : ""} ${selected ? "bg-red-50/50" : ""}`}
    >
      {/* NOM */}

      <div className="flex min-w-0 items-center gap-3">
        {selectionMode && (
          <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${selected ? "border-red-600 bg-red-600 text-white" : "border-slate-300 bg-white text-transparent"}`}>
            <Check size={12} />
          </span>
        )}

        <button
          onClick={(event) => {
            event.stopPropagation();
            onPreview();
          }}
          className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-50 p-1"
        >
          {media.type ===
            "image" &&
          media.src ? (
            <img
              src={media.src}
              alt={media.name}
              className="h-full w-full object-contain object-center"
            />
          ) : media.type ===
              "video" &&
            media.src ? (
            <video
              src={media.src}
              muted
              playsInline
              preload="metadata"
              className="h-full w-full object-cover"
            />
          ) : (
            <FileText
              size={17}
              className="text-red-500"
            />
          )}
        </button>

        <div className="min-w-0">
          <p className="truncate text-[11px] font-black text-slate-800">
            {media.name}
          </p>

          <p className="truncate text-[9px] text-slate-400">
            {media.folder}
          </p>
        </div>
      </div>

      {/* TYPE */}

      <span className="text-[10px] font-semibold text-slate-500">
        {media.type ===
        "image"
          ? "Image"
          : media.type ===
            "video"
          ? "Vidéo"
          : "Document"}
      </span>

      {/* TAILLE */}

      <span className="text-[10px] text-slate-500">
        {media.size}
      </span>

      {/* DATE */}

      <span className="text-[10px] text-slate-500">
        {media.date}
      </span>

      {/* MENU */}

      <div className="relative">
        <button
          onClick={(event) => {
            event.stopPropagation();

            onToggleMenu();
          }}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-900"
        >
          <MoreHorizontal
            size={15}
          />
        </button>

        {menuOpen && (
          <div
            onClick={(event) =>
              event.stopPropagation()
            }
            className="absolute bottom-full right-0 z-[60] mb-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xl"
          >
            {/* APERÇU */}

            <button
              onClick={() => {
                onPreview();
                onToggleMenu();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[10px] font-semibold text-slate-600 hover:bg-slate-50"
            >
              <Eye size={13} />

              Aperçu
            </button>

            {/* TÉLÉCHARGER */}

            <button
              onClick={onDownload}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[10px] font-semibold text-slate-600 hover:bg-slate-50"
            >
              <Download size={13} />

              Télécharger
            </button>

            {/* SUPPRIMER */}

            <button
              onClick={onDelete}
              disabled={deleting}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[10px] font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {deleting ? (
                <Loader2
                  size={13}
                  className="animate-spin"
                />
              ) : (
                <Trash2
                  size={13}
                />
              )}

              Supprimer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   PAGE MÉDIAS AVEC SUSPENSE
========================================================= */

function LoadingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
        <Loader2
          size={20}
          className="animate-spin"
        />

        Chargement...
      </div>
    </div>
  );
}

export default function MediasPage() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <MediasPageContent />
    </Suspense>
  );
}