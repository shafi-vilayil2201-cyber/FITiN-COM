import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import router from "./router";
import './index.css';
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { CartProvider } from "./contexts/CartContext.jsx";
import { WishlistProvider } from "./contexts/wishListContext.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>

  <AuthProvider>
    <CartProvider>
      <WishlistProvider>
        <RouterProvider router={router} />
        <ToastContainer
          position="top-center"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
        />

      </WishlistProvider>
    </CartProvider>
  </AuthProvider>

  // </React.StrictMode>

);