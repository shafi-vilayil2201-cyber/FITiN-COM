import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import AiChatWidget from "./components/common/AiChatWidget";

const App = () => {
  const location = useLocation();
  const path = location.pathname;
  const hideLayoutRoutes = ["/login", "/signup"];
  const isAdminRoute = path.startsWith("/admin");
  const shouldHideLayout = hideLayoutRoutes.includes(path) || isAdminRoute;

  return (
    <div className="app-shell">
      {!shouldHideLayout && <Navbar />}
      <Outlet />
      {!shouldHideLayout && <Footer />}
      {!shouldHideLayout && <AiChatWidget />}
    </div>
  );
};

export default App;
