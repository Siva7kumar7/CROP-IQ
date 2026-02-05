import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Weather from "./pages/Weather";
import Marketplace from "./pages/Marketplace";
import FarmerDashboard from "./pages/FarmerDashboard";
import { CartProvider } from "./pages/Cart";

import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import PlantDisease from "./pages/PlantDisease";
import Landing from "./pages/Landing";

/* ✅ Layout Component */
function Layout() {
  return (
    <>
      

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/home" element={<Home />} />
        <Route path="/weather" element={<Weather />} />
        <Route path="/plant-detection" element={<PlantDisease />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
        <Route path="/cart" element={<CartProvider />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success" element={<OrderSuccess />} />
      </Routes>

      
    </>
  );
}

/* ✅ App Component */
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
