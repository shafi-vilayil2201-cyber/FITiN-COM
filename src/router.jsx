// router.jsx
import React from "react";
import { createHashRouter, Navigate } from "react-router-dom";
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
import Contact from "./pages/Contact";
import Profile from "./pages/profile";
import Wishlist from "./components/products/Wishlist";
import Supplements from "./pages/Supplements";

import { AdminAuthProvider, useAdminAuth } from "./admin/context/AdminAuthContext";
import AdminLayout from "./admin/Layout/adminLayout";
import Dashboard from "./admin/dashboard/dashboard";
import Orders from "./admin/orders/orders";
import ProductsAdmin from "./admin/products/products";
import SupplementsAdmin from "./admin/supplements/supplements";
import Users from "./admin/users/users";
import AdminCategories from "./admin/categories/categories";

function AdminGuard({ children }) {
  const { isAdmin } = useAdminAuth();
  if (isAdmin) return children ?? null;
  return <Navigate to="/login" replace />;
}

const router = createHashRouter([
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
      { path: "/supplements/:id", element: <ProductDetails isSupplement={true} /> },
      { path: "/Supplements/:id", element: <Navigate to="/supplements/:id" replace /> },
      { path: "/categories", element: <Categories /> },
      { path: "/Categories", element: <Navigate to="/categories" replace /> },
      { path: "/cart", element: <CartItem /> },
      { path: "/maincart", element: <Cart /> },
      { path: "/checkout", element: <Checkout /> },
      { path: "/Checkout", element: <Navigate to="/checkout" replace /> },
      { path: "/search", element: <Search /> },
      { path: "/Search", element: <Navigate to="/search" replace /> },
      { path: "/supplements", element: <Supplements /> },
      { path: "/Supplements", element: <Navigate to="/supplements" replace /> },
      { path: "/about", element: <About /> },
      { path: "/About", element: <Navigate to="/about" replace /> },
      { path: "/contact", element: <Contact /> },
      { path: "/Contact", element: <Navigate to="/contact" replace /> },
      { path: "/profile", element: <Profile /> },
      { path: "/Profile", element: <Navigate to="/profile" replace /> },
      { path: "/wishlist", element: <Wishlist /> },
      { path: "/Wishlist", element: <Navigate to="/wishlist" replace /> },
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
          { path: "supplements", element: <SupplementsAdmin /> },
          { path: "categories", element: <AdminCategories /> },
          { path: "users", element: <Users /> }
        ]
      }
    ]
  }
]);

export default router;
