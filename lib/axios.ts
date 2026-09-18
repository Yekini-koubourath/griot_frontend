import Axios from "axios";

const clearStaleSessionCookies = () => {
  if (typeof document === "undefined") return;

  const cookieNames = ["laravel_session", "XSRF-TOKEN", "session", "sanctum"];

  cookieNames.forEach((name) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=localhost; SameSite=Lax`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=127.0.0.1; SameSite=Lax`;
  });
};

const axios = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,

  headers: {
    "X-Requested-With": "XMLHttpRequest",
    Accept: "application/json",
  },

  withCredentials: true,

  withXSRFToken: true,

  xsrfCookieName: "XSRF-TOKEN",

  xsrfHeaderName: "X-XSRF-TOKEN",
});

axios.interceptors.request.use(async (config) => {
  const method = config.method?.toLowerCase() ?? "";

  if (["post", "put", "patch", "delete"].includes(method)) {
    try {
      await axios.get("/sanctum/csrf-cookie", {
        withCredentials: true,
      });
    } catch (error) {
      console.error("Erreur récupération CSRF :", error);
    }
  }

  return config;
});

axios.interceptors.response.use(
  (response) => response,

  async (error) => {
    const shouldRetryCsrf =
      error.response?.status === 419 &&
      !error.config?.__isRetry;

    if (shouldRetryCsrf) {
      error.config.__isRetry = true;

      try {
        await axios.get("/sanctum/csrf-cookie", {
          withCredentials: true,
        });

        return axios(error.config);
      } catch {
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export { clearStaleSessionCookies };

export default axios;