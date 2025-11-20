import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home";
import Products from "./pages/Products";
import LoginForm from "./components/auth/LoginForm";
import SignUp from "./components/auth/RegisterForm";
import ProductDetails from "./components/products/ProductDetails";
import Categories from "./components/Home/Categories";
import CartItem from "./components/cart/CartItem";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import ScrollToTop from "./components/common/ScrollToTop";
import Search from "./components/products/Search";
import About from "./pages/About";
import Contact from "./pages/contact";
import Profile from "./pages/profile";
import Wishlist from "./components/products/Wishlist";

import { AdminAuthProvider, useAdminAuth } from "./admin/context/AdminAuthContext";
import AdminLayout from "./admin/Layout/adminLayout";
import Dashboard from "./admin/dashboard/dashboard";
import Orders from "./admin/orders/orders";
import ProductsAdmin from "./admin/products/products";
import Users from "./admin/users/users";


function AdminGuard({ children }) {
  const { isAdmin } = useAdminAuth();
  if (isAdmin) return children || null;
  return <Navigate to="/login" replace />;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AdminAuthProvider>
        <ScrollToTop />
        <App />
      </AdminAuthProvider>
    ),
    children: [
      { path: "/", element: <Home /> },
      { path: "/products", element: <Products /> },
      { path: "/login", element: <LoginForm /> },
      { path: "/signup", element: <SignUp /> },
      { path: "/products/:id", element: <ProductDetails /> },
      { path: "/Categories", element: <Categories /> },
      { path: "/cart", element: <CartItem /> },
      { path: "/maincart", element: <Cart /> },
      { path: "/Checkout", element: <Checkout /> },
      { path: "/Search", element: <Search /> },
      { path: "/About", element: <About /> },
      { path: "/Contact", element: <Contact /> },
      { path: "/Profile", element: <Profile /> },
      { path: "/Wishlist", element: <Wishlist /> },
      {
        path: "/admin",
        element: (
          <AdminGuard>
            <AdminLayout />
          </AdminGuard>
        ),
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: <Dashboard /> },
          { path: "orders", element: <Orders /> },
          { path: "products", element: <ProductsAdmin /> },
          {path:"users",element:<Users/>}
        ],
      },
    ],
  },
]);

export default router;