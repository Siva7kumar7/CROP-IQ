import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/logo1.png";
import "./navbar.css";


const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser && storedUser !== "undefined") {
        setUser(JSON.parse(storedUser));
      }
    } catch {
      localStorage.removeItem("user");
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="navbar">
      {/* LEFT */}
      <div className="nav-left" onClick={() => navigate("/home")}>
        <img src={logo} alt="logo" className="logo-img" />
        <h1 className="logo-text"></h1>
      </div>

      {/* CENTER LINKS */}
      <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
        {user?.role === "Farmer" ? (
          <>
            <li><NavLink to="/home">Home</NavLink></li>
            <li><NavLink to="/plant-detection">Diagnosis</NavLink></li>
            <li><NavLink to="/weather">Weather</NavLink></li>
            <li><NavLink to="/marketplace">Market</NavLink></li>
            <li><NavLink to="/farmer-dashboard">Farmer</NavLink></li>
          </>
        ) : user?.role === "Buyer" ? (
          <>
            <li><NavLink to="/marketplace">Marketplace</NavLink></li>
            <li><NavLink to="/my-orders">My Orders</NavLink></li>
          </>
        ) : (
          <>
            <li><NavLink to="/home">Home</NavLink></li>
            <li><NavLink to="/marketplace">Market</NavLink></li>
          </>
        )}
      </ul>

      {/* RIGHT */}
      <div className="nav-right">
        {user ? (
          <div className="profile">
            <div
              className="profile-box"
              onClick={() => setProfileOpen(!profileOpen)}
            >
              👤 <span>{user.name}</span>
            </div>

            {profileOpen && (
              <div className="profile-dropdown">
                {user.role !== "Buyer" && (
                  <button onClick={() => navigate("/farmer-dashboard")}>
                    Dashboard
                  </button>
                )}
                <button onClick={() => navigate("/my-orders")}>
                  My Orders
                </button>
                <button onClick={logout}>Logout</button>
              </div>
            )}
          </div>
        ) : (
          <div className="auth-buttons">
            <button onClick={() => navigate("/login")}>Login</button>
            <button className="register" onClick={() => navigate("/register")}>
              Register
            </button>
          </div>
        )}

        <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </div>
      </div>
    </nav>
  );
};

export default Navbar;