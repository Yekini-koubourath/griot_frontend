"use client";

import React, { Suspense ,useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import axios from "@/lib/axios";
import {
  Plus,
  Search,
  MoreHorizontal,
  FolderOpen,
  CalendarDays,
  FileText,
  Image as ImageIcon,
  Users,
  Edit3,
  Trash2,
  Eye,
  ChevronDown,
  CheckCircle2,
  Clock3,
  Archive,
  LayoutGrid,
  List,
  ArchiveRestore,
  ExternalLink,
  X,
  Save,
  Loader2,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type ProjectStatus = "Actif" | "En pause" | "Archivé";

type Project = {
  id: number;
  name: string;
  description: string;
  status: ProjectStatus;
  publications: number;
  scheduled: number;
  media: number;
  members: number;
  createdAt: string;
  image: string;
};

type ProjectForm = {
  name: string;
  description: string;
  status: ProjectStatus;
  members: number;
  image: File | null;
};

/* =========================================================
   PAGE
========================================================= */

function ProjetsPageContent() {
  const searchParams = useSearchParams();

  const [projects, setProjects] = useState<Project[]>([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tous");
  const [view, setView] = useState<"grid" | "list">("grid");

  const [sessionMessage, setSessionMessage] = useState("");

  const [openMenu, setOpenMenu] = useState<number | null>(null);

  /* =======================================================
     ÉTATS DES ACTIONS
  ======================================================= */

  const [loadingAction, setLoadingAction] = useState<{
    id: number;
    action: "delete" | "archive" | "restore";
  } | null>(null);

  /* =======================================================
     MODALE VOIR
  ======================================================= */

  const [selectedProject, setSelectedProject] =
    useState<Project | null>(null);

  const [showViewModal, setShowViewModal] = useState(false);

  /* =======================================================
     MODALE MODIFICATION
  ======================================================= */

  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [showEditModal, setShowEditModal] = useState(false);

  const [editForm, setEditForm] = useState<ProjectForm>({
    name: "",
    description: "",
    status: "Actif",
    members: 1,
    image: null,
  });

  const [savingEdit, setSavingEdit] = useState(false);

  const [editError, setEditError] = useState("");

  /* =======================================================
     CHARGEMENT DES PROJETS
  ======================================================= */

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setSessionMessage("");

        const response = await axios.get("/api/projects");

        const data = response.data;

        const baseProjects: Project[] = Array.isArray(data.projects)
          ? data.projects.map((project: any) => ({
              id: Number(project.id),
              name: project.name ?? "Projet sans nom",
              description: project.description ?? "",
              status: ["Actif", "En pause", "Archivé"].includes(project.status)
                ? project.status
                : "Actif",
              publications: Number(project.publications ?? 0),
              scheduled: Number(project.scheduled ?? 0),
              media: Number(project.media ?? 0),
              members: Number(project.members ?? 1),
              createdAt: project.created_at
                ? new Date(project.created_at).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                : "aujourd'hui",
              image:
                project.image &&
                (project.image.startsWith("http") ||
                  project.image.startsWith("data:"))
                  ? project.image
                  : project.image
                    ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${project.image}`
                    : "/placeholder-project.png",
            }))
          : [];

        setProjects(baseProjects);
      } catch (error: any) {
        console.error("Erreur lors du chargement des projets", error);

        if (error?.response?.status === 401) {
          setSessionMessage(
            "Votre session est absente ou invalide. Veuillez vous reconnecter.",
          );
        } else if (error?.response?.status === 403) {
          setSessionMessage(
            "Vous devez avoir une souscription active pour accéder à vos projets.",
          );
        } else {
          setSessionMessage("Impossible de charger vos projets.");
        }

        setProjects([]);
      }
    };

    loadProjects();
  }, [searchParams]);

  /* =======================================================
     FILTRAGE
  ======================================================= */

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        project.name.toLowerCase().includes(searchValue) ||
        project.description.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "Tous" || project.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, search, statusFilter]);

  /* =======================================================
     STATISTIQUES
  ======================================================= */

  const totalProjects = projects.length;

  const activeProjects = projects.filter(
    (project) => project.status === "Actif",
  ).length;

  const totalPublications = projects.reduce(
    (total, project) => total + project.publications,
    0,
  );

  const totalMedia = projects.reduce(
    (total, project) => total + project.media,
    0,
  );

  /* =======================================================
     VOIR UN PROJET
  ======================================================= */

  const viewProject = async (project: Project) => {
    try {
      setOpenMenu(null);

      const response = await axios.get(`/api/projects/${project.id}`);

      const backendProject = response.data?.project;

      if (backendProject) {
        const mappedProject: Project = {
          id: Number(backendProject.id),
          name: backendProject.name ?? project.name,
          description: backendProject.description ?? "",
          status: ["Actif", "En pause", "Archivé"].includes(
            backendProject.status,
          )
            ? backendProject.status
            : "Actif",
          publications: Number(backendProject.publications ?? 0),
          scheduled: Number(backendProject.scheduled ?? 0),
          media: Number(backendProject.media ?? 0),
          members: Number(backendProject.members ?? 1),
          createdAt: backendProject.created_at
            ? new Date(backendProject.created_at).toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })
            : project.createdAt,
          image:
            backendProject.image &&
            (backendProject.image.startsWith("http") ||
              backendProject.image.startsWith("data:"))
              ? backendProject.image
              : backendProject.image
                ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${backendProject.image}`
                : "/placeholder-project.png",
        };

        setSelectedProject(mappedProject);
      } else {
        setSelectedProject(project);
      }

      setShowViewModal(true);
    } catch (error) {
      console.error("Erreur lors de la récupération du projet", error);

      setSelectedProject(project);
      setShowViewModal(true);
    }
  };

  /* =======================================================
     OUVRIR MODIFICATION
  ======================================================= */

  const openEditProject = (project: Project) => {
    setOpenMenu(null);
    setEditingProject(project);

    setEditForm({
      name: project.name,
      description: project.description,
      status: project.status,
      members: project.members,
      image: null,
    });

    setEditError("");
    setShowEditModal(true);
  };

  /* =======================================================
     MODIFIER UN PROJET
  ======================================================= */

  const updateProject = async () => {
    if (!editingProject) return;

    if (!editForm.name.trim()) {
      setEditError("Le nom du projet est obligatoire.");
      return;
    }

    if (editForm.members < 1) {
      setEditError("Le nombre de membres doit être supérieur ou égal à 1.");
      return;
    }

    try {
      setSavingEdit(true);
      setEditError("");

      const formData = new FormData();

      formData.append("name", editForm.name.trim());
      formData.append("description", editForm.description);
      formData.append("status", editForm.status);
      formData.append("members", String(editForm.members));

      if (editForm.image) {
        formData.append("image", editForm.image);
      }

      /*
       * Laravel accepte PUT avec les données classiques.
       * Pour FormData avec Laravel, on utilise POST + _method=PUT.
       */
      formData.append("_method", "PUT");

      const response = await axios.post(
        `/api/projects/${editingProject.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      const updatedBackendProject = response.data?.project;

      if (updatedBackendProject) {
        const updatedProject: Project = {
          id: Number(updatedBackendProject.id),
          name: updatedBackendProject.name ?? editForm.name,
          description: updatedBackendProject.description ?? "",
          status: ["Actif", "En pause", "Archivé"].includes(
            updatedBackendProject.status,
          )
            ? updatedBackendProject.status
            : editForm.status,
          publications: Number(
            updatedBackendProject.publications ??
              editingProject.publications ??
              0,
          ),
          scheduled: Number(
            updatedBackendProject.scheduled ?? editingProject.scheduled ?? 0,
          ),
          media: Number(
            updatedBackendProject.media ?? editingProject.media ?? 0,
          ),
          members: Number(
            updatedBackendProject.members ?? editForm.members,
          ),
          createdAt: updatedBackendProject.created_at
            ? new Date(
                updatedBackendProject.created_at,
              ).toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })
            : editingProject.createdAt,
          image:
            updatedBackendProject.image &&
            (updatedBackendProject.image.startsWith("http") ||
              updatedBackendProject.image.startsWith("data:"))
              ? updatedBackendProject.image
              : updatedBackendProject.image
                ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${updatedBackendProject.image}`
                : editingProject.image,
        };

        setProjects((current) =>
          current.map((project) =>
            project.id === updatedProject.id ? updatedProject : project,
          ),
        );

        setSelectedProject((current) =>
          current?.id === updatedProject.id ? updatedProject : current,
        );
      } else {
        /*
         * Si Laravel ne renvoie pas le projet,
         * on met quand même à jour les informations connues.
         */
        setProjects((current) =>
          current.map((project) =>
            project.id === editingProject.id
              ? {
                  ...project,
                  name: editForm.name.trim(),
                  description: editForm.description,
                  status: editForm.status,
                  members: editForm.members,
                }
              : project,
          ),
        );
      }

      setShowEditModal(false);
      setEditingProject(null);
      setEditError("");
    } catch (error: any) {
      console.error("Erreur lors de la modification du projet", error);

      const validationErrors = error?.response?.data?.errors;

      if (validationErrors) {
        const firstError = Object.values(validationErrors)
          .flat()
          .find((message) => typeof message === "string");

        setEditError(
          typeof firstError === "string"
            ? firstError
            : "Veuillez vérifier les informations saisies.",
        );
      } else {
        setEditError(
          error?.response?.data?.message ||
            "Impossible de modifier le projet.",
        );
      }
    } finally {
      setSavingEdit(false);
    }
  };

  /* =======================================================
     SUPPRIMER
  ======================================================= */

  const deleteProject = async (project: Project) => {
    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer le projet "${project.name}" ?\n\nCette action est définitive.`,
    );

    if (!confirmed) {
      setOpenMenu(null);
      return;
    }

    try {
      setLoadingAction({
        id: project.id,
        action: "delete",
      });

      setOpenMenu(null);

      await axios.delete(`/api/projects/${project.id}`);

      setProjects((current) =>
        current.filter((item) => item.id !== project.id),
      );

      if (selectedProject?.id === project.id) {
        setSelectedProject(null);
        setShowViewModal(false);
      }
    } catch (error: any) {
      console.error("Erreur lors de la suppression du projet", error);

      alert(
        error?.response?.data?.message ||
          "Impossible de supprimer le projet.",
      );
    } finally {
      setLoadingAction(null);
    }
  };

  /* =======================================================
     ARCHIVER / RESTAURER
  ======================================================= */

  const toggleArchive = async (project: Project) => {
    const isArchived = project.status === "Archivé";

    try {
      setLoadingAction({
        id: project.id,
        action: isArchived ? "restore" : "archive",
      });

      setOpenMenu(null);

      const endpoint = isArchived
        ? `/api/projects/${project.id}/restore`
        : `/api/projects/${project.id}/archive`;

      const response = await axios.put(endpoint);

      const backendProject = response.data?.project;

      const newStatus: ProjectStatus = backendProject?.status
        ? backendProject.status
        : isArchived
          ? "Actif"
          : "Archivé";

      setProjects((current) =>
        current.map((item) =>
          item.id === project.id
            ? {
                ...item,
                status: newStatus,
              }
            : item,
        ),
      );

      setSelectedProject((current) =>
        current?.id === project.id
          ? {
              ...current,
              status: newStatus,
            }
          : current,
      );
    } catch (error: any) {
      console.error(
        isArchived
          ? "Erreur lors de la restauration du projet"
          : "Erreur lors de l'archivage du projet",
        error,
      );

      alert(
        error?.response?.data?.message ||
          (isArchived
            ? "Impossible de restaurer le projet."
            : "Impossible d'archiver le projet."),
      );
    } finally {
      setLoadingAction(null);
    }
  };

  /* =======================================================
     RENDU
  ======================================================= */

  return (
    <div
      className="min-h-screen bg-[#f8fafc] text-slate-900"
      onClick={() => setOpenMenu(null)}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div
          className="
            flex min-h-16
            items-center justify-between
            gap-4
            px-4 sm:px-6 lg:px-8
          "
        >
          {/* GAUCHE */}

          <div className="min-w-0 pl-14 md:pl-12 lg:pl-0">
            <p className="hidden text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 sm:block">
              Organisation
            </p>

            <h1 className="text-lg font-black sm:text-xl">Projets</h1>
          </div>

          {/* DROITE */}

          <Link
            href="/dashboard/projets/nouveau_projet"
            onClick={(e) => e.stopPropagation()}
            className="
              flex shrink-0 items-center gap-2
              rounded-xl bg-red-600
              px-4 py-2.5
              text-[10px] font-black uppercase tracking-wide
              text-white
              shadow-lg shadow-red-600/20
              transition
              hover:bg-red-700
            "
          >
            <Plus size={15} />

            <span className="hidden sm:inline">Nouveau projet</span>

            <span className="sm:hidden">Nouveau</span>
          </Link>
        </div>
      </header>

      {/* =====================================================
          CONTENU
      ===================================================== */}

      <main className="mx-auto max-w-[1700px] p-4 sm:p-6 lg:p-8">
        {sessionMessage && (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-700">
            {sessionMessage}
          </div>
        )}

        {/* INTRO */}

        <div className="mb-6">
          <h2 className="text-xl font-black sm:text-2xl">Mes projets</h2>

          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-400">
            Organisez vos contenus, publications, médias et réseaux sociaux par
            projet pour garder une communication claire et bien structurée.
          </p>
        </div>

        {/* ===================================================
            STATISTIQUES
        =================================================== */}

        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            icon={<FolderOpen size={17} />}
            label="Projets"
            value={totalProjects.toString()}
          />

          <StatCard
            icon={<CheckCircle2 size={17} />}
            label="Projets actifs"
            value={activeProjects.toString()}
          />

          <StatCard
            icon={<FileText size={17} />}
            label="Publications"
            value={totalPublications.toString()}
          />

          <StatCard
            icon={<ImageIcon size={17} />}
            label="Médias"
            value={totalMedia.toString()}
          />
        </div>

        {/* ===================================================
            RECHERCHE + FILTRES
        =================================================== */}

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            {/* RECHERCHE */}

            <div className="relative w-full xl:max-w-md">
              <Search
                size={16}
                className="
                  absolute left-3 top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un projet..."
                className="
                  w-full rounded-xl
                  border border-slate-200
                  bg-slate-50
                  py-2.5 pl-9 pr-3
                  text-xs font-medium
                  outline-none transition
                  focus:border-red-400
                  focus:bg-white
                  focus:ring-4
                  focus:ring-red-500/5
                "
              />
            </div>

            {/* FILTRES */}

            <div className="flex flex-wrap gap-2">
              {/* STATUS */}

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="
                    appearance-none
                    rounded-xl
                    border border-slate-200
                    bg-white
                    px-3 py-2.5 pr-8
                    text-[10px] font-bold
                    text-slate-600
                    outline-none
                    focus:border-red-400
                  "
                >
                  <option>Tous</option>
                  <option>Actif</option>
                  <option>En pause</option>
                  <option>Archivé</option>
                </select>

                <ChevronDown
                  size={13}
                  className="
                    pointer-events-none
                    absolute right-2
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />
              </div>

              {/* VUE */}

              <div className="flex rounded-xl border border-slate-200 bg-white p-1">
                <button
                  type="button"
                  onClick={() => setView("grid")}
                  className={`
                    flex h-8 w-8
                    items-center justify-center
                    rounded-lg
                    ${
                      view === "grid"
                        ? "bg-red-50 text-red-600"
                        : "text-slate-400 hover:bg-slate-50"
                    }
                  `}
                >
                  <LayoutGrid size={15} />
                </button>

                <button
                  type="button"
                  onClick={() => setView("list")}
                  className={`
                    flex h-8 w-8
                    items-center justify-center
                    rounded-lg
                    ${
                      view === "list"
                        ? "bg-red-50 text-red-600"
                        : "text-slate-400 hover:bg-slate-50"
                    }
                  `}
                >
                  <List size={15} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            RÉSULTATS
        =================================================== */}

        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-500">
            {filteredProjects.length} projet
            {filteredProjects.length > 1 ? "s" : ""}
          </p>

          <p className="text-[10px] text-slate-400">
            Dernière mise à jour : aujourd'hui
          </p>
        </div>

        {/* ===================================================
            GRID
        =================================================== */}

        {view === "grid" && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                openMenu={openMenu}
                setOpenMenu={setOpenMenu}
                onView={viewProject}
                onEdit={openEditProject}
                onDelete={deleteProject}
                onArchive={toggleArchive}
                loadingAction={loadingAction}
              />
            ))}
          </div>
        )}

        {/* ===================================================
            LISTE
        =================================================== */}

        {view === "list" && (
          <div className="space-y-3">
            {filteredProjects.map((project) => (
              <ProjectListItem
                key={project.id}
                project={project}
                openMenu={openMenu}
                setOpenMenu={setOpenMenu}
                onView={viewProject}
                onEdit={openEditProject}
                onDelete={deleteProject}
                onArchive={toggleArchive}
                loadingAction={loadingAction}
              />
            ))}
          </div>
        )}

        {/* ===================================================
            AUCUN PROJET
        =================================================== */}

        {filteredProjects.length === 0 && (
          <div
            className="
              rounded-2xl
              border border-dashed border-slate-300
              bg-white
              px-5 py-16
              text-center
            "
          >
            <div
              className="
                mx-auto flex h-12 w-12
                items-center justify-center
                rounded-2xl bg-slate-100
              "
            >
              <FolderOpen size={24} className="text-slate-400" />
            </div>

            <h3 className="mt-4 text-sm font-black">Aucun projet trouvé</h3>

            <p className="mx-auto mt-1 max-w-sm text-xs text-slate-400">
              Aucun projet ne correspond à votre recherche ou aux filtres
              sélectionnés.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("Tous");
              }}
              className="
                mt-5 rounded-xl
                border border-slate-200
                px-4 py-2.5
                text-[10px] font-bold
                text-slate-600
                hover:bg-slate-50
              "
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}

        {/* ===================================================
            CONSEIL
        =================================================== */}

        <div
          className="
            mt-6 flex flex-col gap-4
            rounded-2xl
            border border-red-100
            bg-red-50 p-5
            sm:flex-row sm:items-center
            sm:justify-between
          "
        >
          <div className="flex items-start gap-3">
            <div
              className="
                flex h-9 w-9 shrink-0
                items-center justify-center
                rounded-xl bg-white
                text-red-600
              "
            >
              <FolderOpen size={17} />
            </div>

            <div>
              <h3 className="text-xs font-black text-slate-800">
                Gardez vos contenus bien organisés
              </h3>

              <p className="mt-1 max-w-xl text-[10px] leading-relaxed text-slate-500">
                Créez un projet pour chaque activité, marque ou client afin de
                gérer facilement vos publications, médias et campagnes.
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/projets/nouveau_projet"
            className="
              shrink-0 rounded-xl
              bg-red-600 px-4 py-2.5
              text-center text-[10px]
              font-black text-white
              transition
              hover:bg-red-700
            "
          >
            Créer un projet
          </Link>
        </div>
      </main>

      {/* =====================================================
          MODALE VOIR PROJET
      ===================================================== */}

      {showViewModal && selectedProject && (
        <ViewProjectModal
          project={selectedProject}
          onClose={() => {
            setShowViewModal(false);
            setSelectedProject(null);
          }}
          onEdit={() => {
            setShowViewModal(false);
            openEditProject(selectedProject);
          }}
        />
      )}

      {/* =====================================================
          MODALE MODIFIER PROJET
      ===================================================== */}

      {showEditModal && editingProject && (
        <EditProjectModal
          project={editingProject}
          form={editForm}
          setForm={setEditForm}
          error={editError}
          saving={savingEdit}
          onClose={() => {
            if (savingEdit) return;

            setShowEditModal(false);
            setEditingProject(null);
            setEditError("");
          }}
          onSave={updateProject}
        />
      )}
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
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      className="
        rounded-2xl
        border border-slate-200
        bg-white p-4
        shadow-sm
      "
    >
      <div className="flex items-center justify-between">
        <div
          className="
            flex h-9 w-9
            items-center justify-center
            rounded-xl bg-red-50
            text-red-600
          "
        >
          {icon}
        </div>

        <span className="text-xl font-black text-slate-800">{value}</span>
      </div>

      <p
        className="
          mt-3
          text-[10px] font-bold
          uppercase tracking-wider
          text-slate-400
        "
      >
        {label}
      </p>
    </div>
  );
}

/* =========================================================
   PROJECT CARD
========================================================= */

function ProjectCard({
  project,
  openMenu,
  setOpenMenu,
  onView,
  onEdit,
  onDelete,
  onArchive,
  loadingAction,
}: {
  project: Project;
  openMenu: number | null;
  setOpenMenu: React.Dispatch<React.SetStateAction<number | null>>;
  onView: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onArchive: (project: Project) => void;
  loadingAction: {
    id: number;
    action: "delete" | "archive" | "restore";
  } | null;
}) {
  const isMenuOpen = openMenu === project.id;

  const isLoading =
    loadingAction?.id === project.id;

  return (
    <article
      className="
          overflow-hidden
        rounded-2xl
        border border-slate-200
        bg-white
        shadow-sm
        transition
        hover:-translate-y-0.5
        hover:shadow-md
      "
      onClick={(e) => e.stopPropagation()}
    >
      {/* =====================================================
          IMAGE
      ===================================================== */}

      <div
        className="
          relative
          h-40
          w-full
          bg-slate-100
        "
      >
        <img
          src={project.image}
          alt={`Image du projet ${project.name}`}
          className="
            h-full w-full
            object-contain
            object-center
            p-0
            transition
            duration-500
            hover:scale-[1.03]
          "
        />

        {/* Dégradé léger en bas */}

        <div
          className="
            pointer-events-none
            absolute inset-x-0 bottom-0
            h-20
            bg-gradient-to-t
            from-black/50
            to-transparent
          "
        />

        {/* ===================================================
            BOUTON ACTIONS
        =================================================== */}

        <div className="absolute right-3 top-3">
          <button
            type="button"
            aria-label={`Actions du projet ${project.name}`}
            disabled={isLoading}
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenu(isMenuOpen ? null : project.id);
            }}
            className="
              flex h-9 w-9
              items-center justify-center
              rounded-xl
              bg-white
              text-slate-700
              shadow-md
              transition
              hover:bg-slate-50
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {isLoading ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <MoreHorizontal size={18} />
            )}
          </button>

          {/* MENU */}

          {isMenuOpen && !isLoading && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="
                absolute right-0 top-11
                z-50 w-44
                overflow-hidden
                rounded-xl
                border border-slate-200
                bg-white
                p-1.5
                shadow-xl
              "
            >
              <button
                type="button"
                onClick={() => onEdit(project)}
                className="
                  flex w-full items-center gap-2
                  rounded-lg px-3 py-2.5
                  text-[10px] font-bold
                  text-slate-600
                  hover:bg-slate-50
                "
              >
                <Edit3 size={14} />
                Modifier
              </button>

              <button
                type="button"
                onClick={() => onArchive(project)}
                className="
                  flex w-full items-center gap-2
                  rounded-lg px-3 py-2.5
                  text-[10px] font-bold
                  text-slate-600
                  hover:bg-slate-50
                "
              >
                {project.status === "Archivé" ? (
                  <>
                    <ArchiveRestore size={14} />
                    Restaurer
                  </>
                ) : (
                  <>
                    <Archive size={14} />
                    Archiver
                  </>
                )}
              </button>

              <div className="my-1 border-t border-slate-100" />

              <button
                type="button"
                onClick={() => onDelete(project)}
                className="
                  flex w-full items-center gap-2
                  rounded-lg px-3 py-2.5
                  text-[10px] font-bold
                  text-red-600
                  hover:bg-red-50
                "
              >
                <Trash2 size={14} />
                Supprimer
              </button>
            </div>
          )}
        </div>

        {/* NOM */}

        <div className="absolute bottom-4 left-4">
          <h3 className="max-w-[220px] truncate text-base font-black text-white">
            {project.name}
          </h3>
        </div>

        {/* STATUT */}

        <div className="absolute bottom-4 right-4">
          <StatusBadge status={project.status} />
        </div>
      </div>

      {/* =====================================================
          CONTENU
      ===================================================== */}

      <div className="p-5">
        <p
          className="
            min-h-[32px]
            line-clamp-2
            text-[10px]
            leading-relaxed
            text-slate-400
          "
        >
          {project.description || "Aucune description pour ce projet."}
        </p>

        {/* STATS */}

        <div
          className="
            mt-5
            grid grid-cols-3
            divide-x divide-slate-100
            rounded-xl
            bg-slate-50
            py-3
          "
        >
          <ProjectStat value={project.publications} label="Posts" />

          <ProjectStat value={project.scheduled} label="Programmés" />

          <ProjectStat value={project.media} label="Médias" />
        </div>

        {/* INFOS */}

        <div
          className="
            mt-4 flex items-center
            justify-between
            text-[9px]
            text-slate-400
          "
        >
          <span className="flex items-center gap-1.5">
            <CalendarDays size={12} />
            Créé le {project.createdAt}
          </span>

          <span className="flex items-center gap-1.5">
            <Users size={12} />
            {project.members}
          </span>
        </div>

        {/* ===================================================
            ACTIONS PRINCIPALES
            Une seule zone d'actions.
            Les actions Modifier/Supprimer/Archiver sont
            uniquement dans le menu "..."
        =================================================== */}

        <div
          className="
            mt-4
            flex gap-2
            border-t border-slate-100
            pt-4
          "
        >
          <button
            type="button"
            onClick={() => onView(project)}
            className="
              flex flex-1
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-slate-50
              py-2.5
              text-[10px]
              font-bold
              text-slate-600
              transition
              hover:bg-slate-100
            "
          >
            <Eye size={13} />
            Voir le projet
          </button>

          <Link
            href={`/dashboard/reseaux_sociaux?project=${project.id}`}
            aria-label={`Connecter les réseaux de ${project.name}`}
            className="
              flex flex-1
              items-center
              justify-center
              gap-2
              rounded-xl
              border border-red-200
              bg-red-50
              px-3
              py-2.5
              text-[10px]
              font-bold
              text-red-600
              transition
              hover:bg-red-100
              hover:border-red-300
            "
          >
            <ExternalLink size={13} />
            Réseaux
          </Link>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   PROJECT LIST
========================================================= */

function ProjectListItem({
  project,
  openMenu,
  setOpenMenu,
  onView,
  onEdit,
  onDelete,
  onArchive,
  loadingAction,
}: {
  project: Project;
  openMenu: number | null;
  setOpenMenu: React.Dispatch<React.SetStateAction<number | null>>;
  onView: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onArchive: (project: Project) => void;
  loadingAction: {
    id: number;
    action: "delete" | "archive" | "restore";
  } | null;
}) {
  const isMenuOpen = openMenu === project.id;

  const isLoading =
    loadingAction?.id === project.id;

  return (
    <div
      className="
        flex flex-col gap-4
        rounded-2xl
        border border-slate-200
        bg-white p-4
        shadow-sm
        lg:flex-row
        lg:items-center
      "
      onClick={(e) => e.stopPropagation()}
    >
      {/* IDENTITÉ */}

      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div
          className="
            relative
            h-14 w-14
            shrink-0
            overflow-hidden
            rounded-xl
            bg-slate-100
          "
        >
          <img
            src={project.image}
            alt={`Image du projet ${project.name}`}
            className="h-full w-full object-contain"
          />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-black">
              {project.name}
            </h3>

            <StatusBadge status={project.status} />
          </div>

          <p className="mt-1 truncate text-[10px] text-slate-400">
            {project.description}
          </p>
        </div>
      </div>

      {/* POSTS */}

      <div className="flex items-center gap-2 text-[10px] text-slate-500">
        <FileText size={14} />

        <span>
          <strong className="text-slate-700">
            {project.publications}
          </strong>{" "}
          publications
        </span>
      </div>

      {/* MEDIA */}

      <div className="flex items-center gap-2 text-[10px] text-slate-500">
        <ImageIcon size={14} />

        <span>
          <strong className="text-slate-700">
            {project.media}
          </strong>{" "}
          médias
        </span>
      </div>

      {/* MEMBRES */}

      <div className="flex items-center gap-2 text-[10px] text-slate-500">
        <Users size={14} />

        <span>
          {project.members} membre
          {project.members > 1 ? "s" : ""}
        </span>
      </div>

      {/* VOIR */}

      <button
        type="button"
        onClick={() => onView(project)}
        className="
          flex items-center justify-center
          gap-2
          rounded-xl
          bg-slate-50
          px-3 py-2.5
          text-[10px]
          font-bold
          text-slate-600
          transition
          hover:bg-slate-100
        "
      >
        <Eye size={13} />
        Voir
      </button>

      {/* RÉSEAUX */}

      <Link
        href={`/dashboard/reseaux_sociaux?project=${project.id}`}
        className="
          flex items-center justify-center
          gap-2
          rounded-xl
          border border-red-200
          bg-red-50
          px-3 py-2.5
          text-[10px]
          font-bold
          text-red-600
          transition
          hover:bg-red-100
        "
      >
        <ExternalLink size={13} />
        Réseaux
      </Link>

      {/* ACTIONS */}

      <div className="relative">
        <button
          type="button"
          disabled={isLoading}
          onClick={() =>
            setOpenMenu(isMenuOpen ? null : project.id)
          }
          className="
            flex h-9 w-9
            items-center justify-center
            rounded-lg
            text-slate-400
            hover:bg-slate-50
            hover:text-slate-800
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          {isLoading ? (
            <Loader2 size={17} className="animate-spin" />
          ) : (
            <MoreHorizontal size={17} />
          )}
        </button>

        {isMenuOpen && !isLoading && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="
              absolute right-0 top-10
              z-50 w-40
              overflow-hidden
              rounded-xl
              border border-slate-200
              bg-white p-1.5
              shadow-xl
            "
          >
            <button
              type="button"
              onClick={() => onEdit(project)}
              className="
                flex w-full items-center gap-2
                rounded-lg px-3 py-2
                text-[10px] font-bold
                text-slate-600
                hover:bg-slate-50
              "
            >
              <Edit3 size={13} />
              Modifier
            </button>

            <button
              type="button"
              onClick={() => onArchive(project)}
              className="
                flex w-full items-center gap-2
                rounded-lg px-3 py-2
                text-[10px] font-bold
                text-slate-600
                hover:bg-slate-50
              "
            >
              {project.status === "Archivé" ? (
                <>
                  <ArchiveRestore size={13} />
                  Restaurer
                </>
              ) : (
                <>
                  <Archive size={13} />
                  Archiver
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => onDelete(project)}
              className="
                flex w-full items-center gap-2
                rounded-lg px-3 py-2
                text-[10px] font-bold
                text-red-600
                hover:bg-red-50
              "
            >
              <Trash2 size={13} />
              Supprimer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   MODALE VOIR PROJET
========================================================= */

function ViewProjectModal({
  project,
  onClose,
  onEdit,
}: {
  project: Project;
  onClose: () => void;
  onEdit: () => void;
}) {
  return (
    <div
      className="
        fixed inset-0 z-[100]
        flex items-center justify-center
        bg-slate-950/50
        p-4
        backdrop-blur-sm
      "
      onClick={onClose}
    >
      <div
        className="
          w-full max-w-xl
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-2xl
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
              Projet
            </p>

            <h2 className="mt-1 truncate text-lg font-black text-slate-900">
              {project.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex h-9 w-9
              shrink-0
              items-center justify-center
              rounded-xl
              text-slate-400
              hover:bg-slate-50
              hover:text-slate-700
            "
          >
            <X size={18} />
          </button>
        </div>

        {/* CONTENU */}

        <div className="max-h-[75vh] overflow-y-auto p-5">
          <div
            className="
              overflow-hidden
              rounded-2xl
              bg-slate-100
            "
          >
            <img
              src={project.image}
              alt={`Image du projet ${project.name}`}
              className="
                h-56
                w-full
                object-contain
              "
            />
          </div>

          <div className="mt-5 flex items-center justify-between">
            <StatusBadge status={project.status} />

            <span className="text-[10px] text-slate-400">
              Créé le {project.createdAt}
            </span>
          </div>

          <div className="mt-5">
            <h3 className="text-xs font-black text-slate-800">
              Description
            </h3>

            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              {project.description || "Aucune description pour ce projet."}
            </p>
          </div>

          <div className="mt-5 grid grid-cols-3 divide-x divide-slate-100 rounded-xl bg-slate-50 py-4">
            <ProjectStat
              value={project.publications}
              label="Publications"
            />

            <ProjectStat
              value={project.scheduled}
              label="Programmés"
            />

            <ProjectStat
              value={project.media}
              label="Médias"
            />
          </div>

          <div className="mt-4 rounded-xl border border-slate-100 bg-white p-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Users size={15} className="text-slate-400" />

              <span>
                <strong className="text-slate-800">
                  {project.members}
                </strong>{" "}
                membre
                {project.members > 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* FOOTER */}

        <div className="flex gap-2 border-t border-slate-100 p-4">
          <button
            type="button"
            onClick={onEdit}
            className="
              flex flex-1
              items-center justify-center
              gap-2
              rounded-xl
              bg-red-600
              px-4 py-2.5
              text-[10px]
              font-black
              text-white
              transition
              hover:bg-red-700
            "
          >
            <Edit3 size={14} />
            Modifier
          </button>

          <button
            type="button"
            onClick={onClose}
            className="
              rounded-xl
              border border-slate-200
              px-4 py-2.5
              text-[10px]
              font-bold
              text-slate-600
              hover:bg-slate-50
            "
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MODALE MODIFIER PROJET
========================================================= */

function EditProjectModal({
  project,
  form,
  setForm,
  error,
  saving,
  onClose,
  onSave,
}: {
  project: Project;
  form: ProjectForm;
  setForm: React.Dispatch<React.SetStateAction<ProjectForm>>;
  error: string;
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <div
      className="
        fixed inset-0 z-[100]
        flex items-center justify-center
        bg-slate-950/50
        p-4
        backdrop-blur-sm
      "
      onClick={onClose}
    >
      <div
        className="
          w-full max-w-lg
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-2xl
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
              Gestion du projet
            </p>

            <h2 className="mt-1 text-lg font-black text-slate-900">
              Modifier le projet
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="
              flex h-9 w-9
              items-center justify-center
              rounded-xl
              text-slate-400
              hover:bg-slate-50
              hover:text-slate-700
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <X size={18} />
          </button>
        </div>

        {/* FORMULAIRE */}

        <div className="max-h-[75vh] overflow-y-auto p-5">
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[10px] font-medium text-red-600">
              {error}
            </div>
          )}

          {/* NOM */}

          <div>
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wide text-slate-500">
              Nom du projet
            </label>

            <input
              type="text"
              value={form.name}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  name: e.target.value,
                }))
              }
              disabled={saving}
              className="
                w-full
                rounded-xl
                border border-slate-200
                bg-white
                px-3 py-2.5
                text-xs
                outline-none
                transition
                focus:border-red-400
                focus:ring-4
                focus:ring-red-500/5
                disabled:bg-slate-50
              "
              placeholder="Nom du projet"
            />
          </div>

          {/* DESCRIPTION */}

          <div className="mt-4">
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wide text-slate-500">
              Description
            </label>

            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  description: e.target.value,
                }))
              }
              disabled={saving}
              rows={4}
              className="
                w-full
                resize-none
                rounded-xl
                border border-slate-200
                bg-white
                px-3 py-2.5
                text-xs
                outline-none
                transition
                focus:border-red-400
                focus:ring-4
                focus:ring-red-500/5
                disabled:bg-slate-50
              "
              placeholder="Description du projet"
            />
          </div>

          {/* STATUT + MEMBRES */}

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wide text-slate-500">
                Statut
              </label>

              <select
                value={form.status}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    status: e.target.value as ProjectStatus,
                  }))
                }
                disabled={saving}
                className="
                  w-full
                  rounded-xl
                  border border-slate-200
                  bg-white
                  px-3 py-2.5
                  text-xs
                  outline-none
                  focus:border-red-400
                  disabled:bg-slate-50
                "
              >
                <option value="Actif">Actif</option>
                <option value="En pause">En pause</option>
                <option value="Archivé">Archivé</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wide text-slate-500">
                Membres
              </label>

              <input
                type="number"
                min={1}
                value={form.members}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    members: Number(e.target.value),
                  }))
                }
                disabled={saving}
                className="
                  w-full
                  rounded-xl
                  border border-slate-200
                  bg-white
                  px-3 py-2.5
                  text-xs
                  outline-none
                  focus:border-red-400
                  disabled:bg-slate-50
                "
              />
            </div>
          </div>

          {/* IMAGE */}

          <div className="mt-4">
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wide text-slate-500">
              Nouvelle image
            </label>

            <input
              type="file"
              accept="image/*"
              disabled={saving}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  image: e.target.files?.[0] ?? null,
                }))
              }
              className="
                w-full
                rounded-xl
                border border-slate-200
                bg-slate-50
                px-3 py-2
                text-[10px]
                text-slate-500
                file:mr-3
                file:rounded-lg
                file:border-0
                file:bg-white
                file:px-3
                file:py-1.5
                file:text-[10px]
                file:font-bold
                file:text-slate-600
              "
            />

            <p className="mt-1.5 text-[9px] text-slate-400">
              Laissez vide pour conserver l'image actuelle.
            </p>
          </div>

          {/* APERÇU IMAGE ACTUELLE */}

          <div className="mt-4 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
            <img
              src={project.image}
              alt={`Image actuelle de ${project.name}`}
              className="h-32 w-full object-contain"
            />
          </div>
        </div>

        {/* FOOTER */}

        <div className="flex gap-2 border-t border-slate-100 p-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="
              flex-1
              rounded-xl
              border border-slate-200
              px-4 py-2.5
              text-[10px]
              font-bold
              text-slate-600
              hover:bg-slate-50
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="
              flex-1
              flex items-center
              justify-center
              gap-2
              rounded-xl
              bg-red-600
              px-4 py-2.5
              text-[10px]
              font-black
              text-white
              transition
              hover:bg-red-700
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save size={14} />
                Enregistrer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PROJECT STAT
========================================================= */

function ProjectStat({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="text-center">
      <p className="text-sm font-black text-slate-800">{value}</p>

      <p className="mt-0.5 text-[8px] font-medium text-slate-400">
        {label}
      </p>
    </div>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }: { status: ProjectStatus }) {
  const config = {
    Actif: {
      icon: <CheckCircle2 size={11} />,
      className: "bg-emerald-50 text-emerald-600",
    },

    "En pause": {
      icon: <Clock3 size={11} />,
      className: "bg-orange-50 text-orange-600",
    },

    Archivé: {
      icon: <Archive size={11} />,
      className: "bg-slate-100 text-slate-500",
    },
  };

  const item = config[status];

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        rounded-lg
        px-2
        py-1
        text-[9px]
        font-bold
        ${item.className}
      `}
    >
      {item.icon}
      {status}
    </span>
  );
}function LoadingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
        Chargement...
      </div>
    </div>
  );
}

export default function ProjetsPage() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <ProjetsPageContent />
    </Suspense>
  );
}