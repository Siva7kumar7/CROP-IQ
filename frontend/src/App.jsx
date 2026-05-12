import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Weather from "./pages/Weather";
import Marketplace from "./pages/Marketplace";
import FarmerDashboard from "./pages/FarmerDashboard";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import PlantDisease from "./pages/PlantDisease";
import Landing from "./pages/Landing";
import Cart from "./pages/Cart";
import MyOrders from "./pages/MyOrders";
import { CartProvider } from "./context/CartContext";
import AgriAssistant from "./components/AgriAssistant";
import "./App.css";


/* ================= PROTECTED ROUTE ================= */
const ProtectedRoute = ({ children }) => {
  const isLoggedIn = Boolean(localStorage.getItem("token"));
  return isLoggedIn ? children : <Navigate to="/login" />;
};

/* ================= FARMER ONLY ROUTE ================= */
const FarmerRoute = ({ children }) => {
  const isLoggedIn = Boolean(localStorage.getItem("token"));
  const userStr = localStorage.getItem("user");
  const user = userStr && userStr !== "undefined" ? JSON.parse(userStr) : null;
  
  if (!isLoggedIn) return <Navigate to="/login" />;
  if (user && user.role === "Buyer") return <Navigate to="/marketplace" />;
  
  return children;
};

/* ================= LAYOUT ================= */
function Layout() {
  const location = useLocation();
  const isLoggedIn = Boolean(localStorage.getItem("token"));

  // Hide navbar only on auth pages
  const hideNavbarRoutes = ["/", "/login", "/register"];
  const shouldShowNavbar =
    !hideNavbarRoutes.includes(location.pathname) && isLoggedIn;

  return (
    <>
      {shouldShowNavbar && <Navbar />}

      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected (All Users) */}
        <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
        <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />

        {/* Protected (Farmer Only) */}
        <Route path="/home" element={<FarmerRoute><Home /></FarmerRoute>} />
        <Route path="/weather" element={<FarmerRoute><Weather /></FarmerRoute>} />
        <Route path="/plant-detection" element={<FarmerRoute><PlantDisease /></FarmerRoute>} />
        <Route path="/farmer-dashboard" element={<FarmerRoute><FarmerDashboard /></FarmerRoute>} />
      </Routes>

      {shouldShowNavbar && <Footer />}

      <AgriAssistant />
    </>
  );
}

/* ================= APP ================= */
function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Layout />
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;