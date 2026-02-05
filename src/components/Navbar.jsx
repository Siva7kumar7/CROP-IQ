import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser && storedUser !== "undefined") {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Invalid user data in localStorage");
      localStorage.removeItem("user");
    }
  }, []);

  // ✅ Define logout function
  const logout = () => {
    localStorage.removeItem("user");   // clear localStorage
    setUser(null);                     // reset state
    navigate("/login");                // redirect to login page
  };

  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="nav-left">
        <h1 className="logo" onClick={() => navigate("/home")}>
          🌾 CROP IQ
        </h1>
      </div>

      {/* Nav Links */}
      <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
        <li><NavLink to="/home">Home</NavLink></li>
        <li><NavLink to="/plant-detection">Disease Detection</NavLink></li>
        <li><NavLink to="/weather">Weather</NavLink></li>
        <li><NavLink to="/marketplace">Marketplace</NavLink></li>
        <li><NavLink to="/farmer-dashboard">👨‍🌾 Farmer</NavLink></li>
      </ul>

      {/* Right Section */}
      <div className="nav-right">
        {user ? (
          <div className="profile">
            <div className="profile-icon" onClick={() => setMenuOpen(!menuOpen)}>
              👤 <span>{user.name}</span>
            </div>

            {menuOpen && (
              <div className="profile-dropdown">
                <button onClick={() => navigate("/farmer-dashboard")}>
                  Dashboard
                </button>
                <button onClick={logout}>Logout</button>
              </div>
            )}
          </div>
        ) : (
          <>
            <button className="auth-btn" onClick={() => navigate("/login")}>
              Login
            </button>
            <button className="auth-btn register" onClick={() => navigate("/register")}>
              Register
            </button>
          </>
        )}

        <span className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </span>
      </div>
    </nav>
  );
};

export default Navbar;
