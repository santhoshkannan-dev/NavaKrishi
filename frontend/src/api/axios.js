import axios from "axios";

const getBaseUrl = () => {
  if (typeof window !== "undefined" && window.location.hostname) {
    return `http://${window.location.hostname}:8000/api`;
  }
  return "http://172.22.1.107:8000/api";
};

const API = axios.create({
  baseURL: getBaseUrl(),
});


const normalizeToken = (rawToken) => {
  if (!rawToken || typeof rawToken !== "string") {
    return "";
  }

  const trimmed = rawToken.trim().replace(/^"|"$/g, "");
  const tokenOnly = trimmed.replace(/^Bearer\s+/i, "").trim();
  if (tokenOnly === "undefined" || tokenOnly === "null") {
    return "";
  }
  return tokenOnly;
};

const isJwtExpired = (token) => {
  const normalized = normalizeToken(token);

  if (!normalized || normalized.split(".").length !== 3) {
    return true;
  }

  try {
    const payload = JSON.parse(
      atob(normalized.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    return !payload?.exp || Date.now() >= payload.exp * 1000;
  } catch (error) {
    return true;
  }
};

const clearStaleAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
  delete API.defaults.headers.common["Authorization"];
};

const refreshAccessToken = async () => {
  const refreshToken = normalizeToken(localStorage.getItem("refresh_token"));

  if (!refreshToken) {
    clearStaleAuth();
    return "";
  }

  try {
    const response = await axios.post(`${API.defaults.baseURL}/auth/token/refresh/`, {
      refresh: refreshToken,
    });

    const nextAccessToken = normalizeToken(response?.data?.access);

    if (nextAccessToken) {
      localStorage.setItem("token", nextAccessToken);
      API.defaults.headers.common["Authorization"] = `Bearer ${nextAccessToken}`;
      return nextAccessToken;
    }
  } catch (error) {
    clearStaleAuth();
    throw error;
  }

  clearStaleAuth();
  return "";
};

// Attach token from localStorage if present
const token = normalizeToken(localStorage.getItem("token"));
if (token && !isJwtExpired(token)) {
  API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
} else if (token) {
  clearStaleAuth();
}

// Ensure each request picks up the latest token from localStorage
API.interceptors.request.use(async (config) => {
  let t = normalizeToken(localStorage.getItem("token"));

  if (!t || isJwtExpired(t)) {
    try {
      t = await refreshAccessToken();
    } catch (error) {
      clearStaleAuth();
      t = "";
    }
  }

  if (t) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${t}`;
  } else {
    if (config.headers) {
      delete config.headers.Authorization;
      if (config.headers.common) {
        delete config.headers.common.Authorization;
      }
    }
  }

  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const originalRequest = error?.config;

    if (status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const nextAccessToken = await refreshAccessToken();
        if (nextAccessToken) {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
          return API(originalRequest);
        }
      } catch (refreshError) {
        clearStaleAuth();
      }
    }

    if (status === 401) {
      const tokenToCheck = localStorage.getItem("token");
      if (!tokenToCheck || isJwtExpired(tokenToCheck)) {
        clearStaleAuth();
      }
    }

    return Promise.reject(error);
  }
);

export default API;