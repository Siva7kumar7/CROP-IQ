import "./Landing.css";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="landing">

      {/* 🌿 Animated Background Layer */}
      <div className="bg-slideshow">
        <div className="slide slide1"></div>
        <div className="slide slide2"></div>
        <div className="slide slide3"></div>
      </div>

      {/* Dark overlay for readability */}
      <div className="overlay">

        <div className="content">
          <h1 className="title"> AgriVerse <span>4.0</span></h1>

          <p className="subtitle">
            Smart Agriculture • AI Insights • Direct Farm-to-Market Platform
          </p>

          <p className="desc">
            Empowering farmers with technology, real-time weather insights,
            crop intelligence, and a direct marketplace without middlemen.
          </p>

          <div className="btn-group">
            <Link to="/login" className="btn primary">Login</Link>
            <Link to="/register" className="btn secondary">Create Account</Link>
          </div>

          <div className="landing-features">
            <div>🌦 Weather Intelligence</div>
            <div>🌿 Plant Disease Detection</div>
            <div>🛒 Direct Marketplace</div>
            <div>📊 Smart Farming Dashboard</div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Landing;