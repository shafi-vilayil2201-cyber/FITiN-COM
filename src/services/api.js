import axios from "axios";

const DEFAULT_TIMEOUT = 10_000;

export const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:5252/api/";

export const IMAGE_BASE_URL = API_BASE.replace("/api/", "");

const api = axios.create({
  baseURL: API_BASE,
  timeout: DEFAULT_TIMEOUT,
  withCredentials: true,
});

async function handleRequest(promise) {
  try {
    const res = await promise;
    // Normalized check for data wrapper
    return res?.data?.data ?? res?.data ?? null;
  } catch (err) {
    if (err?.response) {
      const data = err.response.data;

      // 1. Try to get specific validation errors (e.g. from .NET Model State)
      let message = data?.message || data?.Message || data?.title;

      if (data?.errors) {
        // Flatten the errors object into a string
        const errorList = Object.values(data.errors).flat();
        if (errorList.length > 0) message = errorList[0]; // Take the first error
      }

      if (!message) {
        message = `Request failed with status ${err.response.status}`;
      }

      const e = new Error(message);
      e.status = err.response.status;
      e.response = err.response;
      throw e;
    }

    if (err?.request) {
      throw new Error("No response from server. Check backend or network.");
    }

    throw err;
  }
}

export const registerUser = async (name, email, password) => {
  const formData = new FormData();
  formData.append("Name", name);
  formData.append("Email", email);
  formData.append("Password", password);

  return await handleRequest(api.post("auth/register", formData));
};

export const loginUser = async (email, password) => {
  const formData = new FormData();
  formData.append("Email", email);
  formData.append("Password", password);

  return await handleRequest(api.post("auth/login", formData));
};

export const getProfile = () => handleRequest(api.get("auth/profile"));

export const logoutUser = () => handleRequest(api.post("auth/logout"));

export const getAllProducts = async () => handleRequest(api.get("products"));

export const adminGetProducts = async () => handleRequest(api.get("admin/products"));

export const adminCreateProduct = async (formData) => handleRequest(api.post("admin/products", formData));

export const adminUpdateProduct = async (id, formData) => handleRequest(api.put(`admin/products/${encodeURIComponent(id)}`, formData));

export const adminDeleteProduct = async (id) => handleRequest(api.delete(`admin/products/${encodeURIComponent(id)}`));

export const getAllCategories = async () => handleRequest(api.get("categories"));

export const getProductById = async (id) => {
  if (id === undefined || id === null) {
    throw new Error("getProductById: id is required");
  }
  return handleRequest(api.get(`/products/${encodeURIComponent(id)}`));
};

//wishlist
export const getWishlist = async () => {
  return handleRequest(api.get("wishlist"));
};
export const addToWishlistAPI = async (productId) => {
  return handleRequest(api.post(`wishlist/${encodeURIComponent(productId)}`));
};
export const removeFromWishlistAPI = async (productId) => {
  return handleRequest(api.delete(`wishlist/${encodeURIComponent(productId)}`));
};

//cart
export const getCart = async () => {
  return handleRequest(api.get("cart"));
};
export const addToCartAPI = async (productId) => {
  return handleRequest(api.post(`cart/${encodeURIComponent(productId)}`));
};
export const removeFromCartAPI = async (productId) => {
  return handleRequest(api.delete(`cart/${encodeURIComponent(productId)}`));
};
export const increaseCartQtyAPI = async (productId) => {
  return handleRequest(api.patch(`cart/increase/${encodeURIComponent(productId)}`));
};
export const decreaseCartQtyAPI = async (productId) => {
  return handleRequest(api.patch(`cart/decrease/${encodeURIComponent(productId)}`));
};

export const createOrder = async (shippingDetails) => {
  return handleRequest(api.post("orders", shippingDetails));
};
export const getUserOrders = async () => {
  return handleRequest(api.get("orders"));
}
export const getOrderById = async (orderId) => {
  return handleRequest(api.get(`orders/${encodeURIComponent(orderId)}`));
};

export const getAllOrders = async () => {
  return handleRequest(api.get("orders/all"));
};

export const updateOrderStatus = async (orderId, status) => {
  return handleRequest(api.patch(`orders/${encodeURIComponent(orderId)}/status`, { status }));
};



export const adminGetUsers = async () => handleRequest(api.get("users"));
export const adminGetUserDetails = async (id) => handleRequest(api.get(`users/${encodeURIComponent(id)}`));
export const adminBlockUser = async (id) => handleRequest(api.patch(`users/${encodeURIComponent(id)}/block`));
export const adminUnblockUser = async (id) => handleRequest(api.patch(`users/${encodeURIComponent(id)}/unblock`));

// Admin Category Management
export const adminCreateCategory = async (formData) => handleRequest(api.post("categories", formData));
export const adminUpdateCategory = async (id, formData) => handleRequest(api.put(`categories/${encodeURIComponent(id)}`, formData));
export const adminDeleteCategory = async (id) => {
  const response = await api.delete(`/categories/${id}`);
  return response.data.data;
};

// Payment Verification
export const confirmPayment = async (paymentData) => {
  const response = await api.post('/orders/confirm-payment', paymentData);
  return response.data;
};

export const chatWithAi = async ({ message, conversationId, pageContext }) => {
  return handleRequest(
    api.post("ai/chat", {
      message,
      conversationId,
      pageContext,
    })
  );
};

export default api;