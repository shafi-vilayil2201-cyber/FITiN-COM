import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaShoppingCart, FaHeart, FaUser, FaSearch, FaBars, FaTimes } from "react-icons/fa";
import { AuthContext } from "../../contexts/AuthContext";
import { CartContext } from "../../contexts/CartContext";
import { WishlistContext } from "../../contexts/wishListContext";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const { wishList } = useContext(WishlistContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const handleLogout = () => {
    try {
      logout && logout();
    } catch (err) {
      console.error("Logout error:", err);
    }

    setMenuOpen(false);
    navigate("/login");
  };

  return (
    <div className="sticky top-4 flex justify-center z-50 font-mono ">
      <header className={`bg-white ${scrolled ? "backdrop-blur-md bg-white/70 shadow-lg" : "shadow-xl"} w-3/4 rounded-2xl transition-all duration-300`}>
        <nav
          className="container mx-auto px-4 py-3 flex items-center justify-between"
          role="navigation"
          aria-label="Main Navigation"
        >

          <Link to="/" className="flex flex-row items-center" onClick={() => setMenuOpen(false)}>
            <h1 className="text-2xl font-bold text-green-600">FIT</h1>
            <h1 className="text-2xl font-bold text-blue-600">iN</h1>
          </Link>


          <ul className="hidden md:flex space-x-6 text-gray-700 font-medium">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/products">Products</Link></li>
            <li><Link to="/Categories">Categories</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>


          <div className="hidden md:flex items-center space-x-4 text-gray-700">
            <Link to='/Search'><button aria-label="Search" className="cursor-pointer focus:outline-none"><FaSearch /></button></Link>
            <Link to='/cart' className="relative">
              <button aria-label="Cart" className="cursor-pointer focus:outline-none"><FaShoppingCart /></button>
              {cart?.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </Link>
            <Link to='/wishlist' className="relative">
              <button aria-label="Wishlist" className="cursor-pointer focus:outline-none">
                <FaHeart />
              </button>
              {wishList?.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {wishList.length}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center space-x-3">

                <span className="font-semibold">{user?.name ?? "User"}</span>
                <Link to="/Profile" aria-label="Profile"><FaUser className="cursor-pointer" /></Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-600 hover:text-red-800 font-semibold"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="font-semibold text-green-600 hover:text-green-700">
                Login
              </Link>
            )}
          </div>


          <button
            className="md:hidden text-gray-700 focus:outline-none"
            onClick={toggleMenu}
            aria-controls="mobile-menu"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </nav>


        {menuOpen && (
          <div id="mobile-menu" className="md:hidden bg-gray-100">
            <ul className="flex flex-col items-center py-4 space-y-4 text-gray-700 font-medium">
              <li><Link onClick={() => setMenuOpen(false)} to="/">Home</Link></li>
              <li><Link onClick={() => setMenuOpen(false)} to="/products">Products</Link></li>
              <li><Link onClick={() => setMenuOpen(false)} to="/categories">Categories</Link></li>
              <li><Link onClick={() => setMenuOpen(false)} to="/About">About</Link></li>
              <li><Link onClick={() => setMenuOpen(false)} to="/Contact">Contact</Link></li>
              <li><Link onClick={() => setMenuOpen(false)} to="/wishlist">Wishlist</Link></li>
              {user ? (
                <>
                  <li>
                    <Link onClick={() => setMenuOpen(false)} to="/profile">Profile</Link>
                  </li>
                  <li>
                    <button onClick={handleLogout} className="text-red-600">Logout</button>
                  </li>
                </>
              ) : (
                <li>
                  <Link onClick={() => setMenuOpen(false)} to="/login">Login</Link>
                </li>
              )}
            </ul>
          </div>
        )}
      </header>
    </div>
  );
};

export default Navbar;