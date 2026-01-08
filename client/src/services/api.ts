import axios from "axios";

// Helper to safely serialize data, handling dates properly
const serializeData = (data: any): any => {
  if (data === null || data === undefined) return data;
  if (data instanceof Date) return data.toISOString();
  if (Array.isArray(data)) return data.map(serializeData);
  if (typeof data === 'object') {
    const result: any = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = data[key];
        // Skip functions and handle dates
        if (typeof value === 'function') continue;
        if (value instanceof Date) {
          result[key] = value.toISOString();
        } else if (value && typeof value === 'object' && !Array.isArray(value)) {
          result[key] = serializeData(value);
        } else if (Array.isArray(value)) {
          result[key] = value.map(serializeData);
        } else {
          result[key] = value;
        }
      }
    }
    return result;
  }
  return data;
};

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  transformRequest: [
    (data, headers) => {
      if (data instanceof FormData) return data;
      if (data) {
        const serialized = serializeData(data);
        return JSON.stringify(serialized);
      }
      return data;
    },
  ],
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token automatically
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 Unauthorized globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Unauthorized access - clearing session.");
      localStorage.clear();
      // Optional: Redirect to login or trigger an auth state update
      // window.location.href = "/login"; 
    }
    return Promise.reject(error);
  }
);

export default API;
