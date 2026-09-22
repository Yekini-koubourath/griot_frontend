"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";

export type CurrentUser = {
  id: number;
  name: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email: string;
  avatar: string | null;
  role: string | null;
};

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

function resolveAvatarUrl(avatar: string | null): string | null {
  if (!avatar) return null;

  if (avatar.startsWith("http://") || avatar.startsWith("https://")) {
    return avatar;
  }

  return `${BACKEND_URL}${avatar.startsWith("/") ? "" : "/"}${avatar}`;
}

/**
 * Récupère l'utilisateur connecté (/api/user) pour afficher sa vraie
 * photo de profil et ses initiales dans les en-têtes de page, au lieu
 * d'un "Y" codé en dur qui ne reflétait jamais les modifications faites
 * depuis la page Paramètres.
 */
export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [initials, setInitials] = useState("?");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await axios.get("/api/user");

        if (cancelled) return;

        const loadedUser: CurrentUser = response.data;

        setUser(loadedUser);
        setAvatarUrl(resolveAvatarUrl(loadedUser.avatar));

        const source =
          `${loadedUser.first_name ?? ""} ${loadedUser.last_name ?? ""}`.trim() ||
          loadedUser.name ||
          loadedUser.email ||
          "?";

        const parts = source.trim().split(/\s+/).filter(Boolean);

        const computedInitials =
          parts.length >= 2
            ? (parts[0][0] + parts[1][0]).toUpperCase()
            : source.slice(0, 2).toUpperCase();

        setInitials(computedInitials || "?");
      } catch (error) {
        console.error(
          "Impossible de charger l'utilisateur connecté :",
          error
        );
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { user, avatarUrl, initials };
}