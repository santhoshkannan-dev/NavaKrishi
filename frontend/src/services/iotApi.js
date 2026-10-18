import API from "../api/axios";

/**
 * Centralized API Service for NavaKrishi Field Intelligence IoT Module
 */

export const getLatestSensorData = async () => {
  try {
    const response = await API.get("/iot/latest/");
    return { data: response.data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error?.response?.data || { detail: error.message || "Failed to reach sensor API" },
      status: error?.response?.status 
    };
  }
};

export const getSensorHistory = async (params = {}) => {
  try {
    const response = await API.get("/iot/history/", { params });
    return { data: response.data, error: null };
  } catch (error) {
    return { 
      data: [], 
      error: error?.response?.data || { detail: error.message || "Failed to load sensor history" },
      status: error?.response?.status 
    };
  }
};

export const getDeviceStatus = async () => {
  try {
    const response = await API.get("/iot/device-status/");
    return { data: response.data, error: null };
  } catch (error) {
    return { 
      data: { status: 'offline', message: 'Backend unreachable', seconds_ago: null }, 
      error: error?.response?.data || { detail: error.message } 
    };
  }
};

export const postSensorReading = async (payload) => {
  try {
    const response = await API.post("/iot/data/", payload);
    return { data: response.data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error?.response?.data || { detail: error.message },
      status: error?.response?.status 
    };
  }
};

export const getAlerts = async () => {
  try {
    const response = await API.get("/iot/alerts/");
    return { data: response.data, error: null };
  } catch (error) {
    return { data: [], error: error?.response?.data };
  }
};

export const markAlertAsRead = async (id) => {
  try {
    const response = await API.post(`/iot/alerts/${id}/read/`);
    return { data: response.data, error: null };
  } catch (error) {
    return { error: error?.response?.data };
  }
};

export const markAllAlertsAsRead = async () => {
  try {
    const response = await API.post("/iot/alerts/read-all/");
    return { data: response.data, error: null };
  } catch (error) {
    return { error: error?.response?.data };
  }
};

export const getFieldSummary = async () => {
  try {
    const response = await API.get("/iot/summary/");
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: error?.response?.data };
  }
};

export const queryAgroAssistant = async (message) => {
  try {
    const response = await API.post("/iot/assistant/", { message });
    return { data: response.data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error?.response?.data || { detail: "NLP assistant service error" } 
    };
  }
};

/**
 * Format relative time (e.g. "12 seconds ago", "3 minutes ago")
 */
export const formatRelativeTime = (isoDateString) => {
  if (!isoDateString) return "Never";
  const date = new Date(isoDateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 5) return "Just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};
