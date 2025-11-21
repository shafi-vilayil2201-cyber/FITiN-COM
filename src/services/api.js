// src/apiClient.js
import axios from "axios";

const DEFAULT_TIMEOUT = 10_000; // 10s

// Use environment variable in production, otherwise fall back to localhost for dev.
export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  timeout: DEFAULT_TIMEOUT,
});

// Developer-only interceptors for easier debugging during development
if (import.meta.env.DEV) {
  api.interceptors.request.use((cfg) => {
    // you can uncomment the next line while debugging to inspect requests
    // console.debug("[API request]", cfg.method, cfg.url, cfg.data || "");
    return cfg;
  });

  api.interceptors.response.use(
    (res) => {
      // console.debug("[API response]", res.status, res.config.url);
      return res;
    },
    (err) => {
      // Normalize the error a bit for easier handling downstream
      // console.error("[API error]", err?.response?.status, err?.config?.url);
      return Promise.reject(err);
    }
  );
}

/**
 * Wrap axios promises to return .data and throw clearer errors
 * @param {Promise} promise axios promise
 * @returns {Promise<any>}
 */
async function handleRequest(promise) {
  try {
    const res = await promise;
    return res.data;
  } catch (err) {
    if (err && err.response) {
      const status = err.response.status;
      const data = err.response.data;
      const message =
        (data && (data.message || data.error || data.msg)) ||
        `Request failed with status ${status}`;
      const e = new Error(message);
      e.status = status;
      e.response = err.response;
      throw e;
    } else if (err && err.request) {
      const e = new Error("No response from server. Check network or server status.");
      e.request = err.request;
      throw e;
    } else {
      // unknown error (e.g., setup issue)
      throw err;
    }
  }
}

/* -------------- API helpers -------------- */

export const getAllProducts = async () => {
  return await handleRequest(api.get("/products"));
};

export const getProductById = async (id) => {
  if (id === undefined || id === null)
    throw new Error("getProductById: id is required");
  return await handleRequest(api.get(`/products/${encodeURIComponent(id)}`));
};

export const getAllUsers = async () => {
  return await handleRequest(api.get("/users"));
};

export const getUserByEmail = async (email) => {
  if (!email) return null;
  const res = await handleRequest(
    api.get(`/users?email=${encodeURIComponent(email)}`)
  );
  return Array.isArray(res) && res.length > 0 ? res[0] : null;
};

export const registerUser = async (userData) => {
  if (!userData || typeof userData !== "object")
    throw new Error("registerUser: userData is required");
  return await handleRequest(api.post("/users", userData));
};

export const loginUser = async (email, password) => {
  if (!email || !password) return null;
  const res = await handleRequest(
    api.get(
      `/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(
        password
      )}`
    )
  );
  return Array.isArray(res) && res.length > 0 ? res[0] : null;
};

export const addToWishlistAPI = async (userId, product) => {
  if (!userId || !product || product.id === undefined)
    throw new Error("addToWishlistAPI: userId and product required");

  const user = await handleRequest(api.get(`/users/${encodeURIComponent(userId)}`));
  const wishlist = Array.isArray(user.wishlist) ? user.wishlist : [];
  const exists = wishlist.some((item) => String(item.id) === String(product.id));
  if (exists) {
    return user;
  }

  const updatedWishlist = [...wishlist, product];
  await handleRequest(
    api.patch(`/users/${encodeURIComponent(userId)}`, { wishlist: updatedWishlist })
  );

  return await handleRequest(api.get(`/users/${encodeURIComponent(userId)}`));
};

export const getWishlist = async (userId) => {
  if (!userId) return [];
  const user = await handleRequest(api.get(`/users/${encodeURIComponent(userId)}`));
  return Array.isArray(user.wishlist) ? user.wishlist : [];
};

export const removeFromWishlistAPI = async (userId, productId) => {
  if (!userId || productId === undefined)
    throw new Error("removeFromWishlistAPI: userId and productId required");

  const user = await handleRequest(api.get(`/users/${encodeURIComponent(userId)}`));
  const wishlist = Array.isArray(user.wishlist) ? user.wishlist : [];
  const updatedWishlist = wishlist.filter((item) => String(item.id) !== String(productId));

  await handleRequest(
    api.patch(`/users/${encodeURIComponent(userId)}`, { wishlist: updatedWishlist })
  );
  return await handleRequest(api.get(`/users/${encodeURIComponent(userId)}`));
};

export default api;