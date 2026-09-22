import Axios from "axios";

const TOKEN_KEY = "griot_token";

const axios = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,

  withCredentials: true,
  withXSRFToken: true,

  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",

  headers: {
    "X-Requested-With": "XMLHttpRequest",
    Accept: "application/json",
  },
});

/**
 * Ajouter automatiquement le token Sanctum
 * à toutes les requêtes API.
 */
axios.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem(TOKEN_KEY);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  /*
   * =========================================================
   * GESTION DE FORMDATA
   * =========================================================
   *
   * Lorsqu'on envoie une image avec FormData,
   * il ne faut PAS envoyer :
   *
   * Content-Type: application/json
   *
   * On laisse le navigateur définir automatiquement :
   *
   * multipart/form-data; boundary=...
   *
   * Laravel pourra ainsi récupérer correctement
   * le fichier avec $request->file('avatar').
   */
  if (
    typeof FormData !== "undefined" &&
    config.data instanceof FormData
  ) {
    delete config.headers["Content-Type"];
  } else {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

/**
 * Enregistrer le token après connexion/inscription.
 */
export const setAuthToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

/**
 * Supprimer le token lors de la déconnexion.
 */
export const clearAuthToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
  }
};

/**
 * Récupérer le token actuel.
 */
export const getAuthToken = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(TOKEN_KEY);
};

export default axios;

