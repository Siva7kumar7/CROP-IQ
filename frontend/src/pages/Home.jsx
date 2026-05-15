import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home">

      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-eyebrow">🌿 Powered by Deep Learning</div>
          <h1>Empowering the <span className="hero-accent">Future of Farming</span> with AI</h1>
          <p>Real-time plant disease diagnosis, intelligent weather forecasting, direct-to-buyer marketplace — all in one powerful platform built for the modern farmer.</p>
          <div className="hero-buttons">
            <button onClick={() => navigate("/marketplace")}>🛒 Explore Marketplace</button>
            <button className="secondary" onClick={() => navigate("/plant-detection")}>🌱 Detect Disease</button>
          </div>
          <div className="hero-stats">
            <div className="hero-stat"><strong>95%</strong><span>AI Accuracy</span></div>
            <div className="hero-stat-sep"></div>
            <div className="hero-stat"><strong>500+</strong><span>Farmers</span></div>
            <div className="hero-stat-sep"></div>
            <div className="hero-stat"><strong>24/7</strong><span>Monitoring</span></div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="home-features">
        <div className="home-features-wrapper">   {/* NEW */}

          <div className="home-features-header">
            <h2>What We Offer</h2>
          </div>

          <div className="home-features-grid">
            <div className="home-card" onClick={() => navigate("/plant-detection")}>
              <div className="home-card-icon">🌿</div>
              <h3>ML Disease Detection</h3>
              <p>Upload a leaf photo and get instant diagnosis with treatment plans powered by Computer Vision.</p>
              <div className="home-card-cta">Analyze Now →</div>
            </div>
            <div className="home-card" onClick={() => navigate("/weather")}>
              <div className="home-card-icon">🌦️</div>
              <h3>Weather Forecast</h3>
              <p>Hyper-local, real-time weather data with crop-specific farming advisories updated daily.</p>
              <div className="home-card-cta">Check Weather →</div>
            </div>
            <div className="home-card">
              <div className="home-card-icon">🚨</div>
              <h3>Early Warning System</h3>
              <p>Get proactive alerts for frost, pest outbreaks, and drought conditions before they strike.</p>
              <div className="home-card-cta">Coming Soon</div>
            </div>
            <div className="home-card" onClick={() => navigate("/plant-detection")}>
              <div className="home-card-icon">🧪</div>
              <h3>Fertilizer Advisor</h3>
              <p>Soil-based fertilizer recommendations that maximize yield while minimizing chemical waste.</p>
              <div className="home-card-cta">Get Started →</div>
            </div>
            <div className="home-card" onClick={() => navigate("/marketplace")}>
              <div className="home-card-icon">🛒</div>
              <h3>Farmer Marketplace</h3>
              <p>Sell your harvest directly to buyers. No middlemen, better prices, faster payments.</p>
              <div className="home-card-cta">Shop Now →</div>
            </div>
          </div>

        </div>
      </section>
      {/* ===== WHY CROP IQ ===== */}
      <section className="pillars">
        <h3 className="pillars-eyebrow">✨ Why AgriVerse 4.0</h3>
        <h2>Built for the <span className="gradient-text">Modern Farmer</span></h2>
        <div className="pillars-grid">
          <div className="pillar">
            <div className="pillar-icon">✅</div>
            <h4>Easy to Use</h4>
            <p>Designed for every farmer, no tech skills needed</p>
          </div>
          <div className="pillar">
            <div className="pillar-icon">📊</div>
            <h4>Real-time Data</h4>
            <p>Live weather, soil, and market insights daily</p>
          </div>
          <div className="pillar">
            <div className="pillar-icon">🌱</div>
            <h4>Higher Yield</h4>
            <p>ML-driven advice to maximize your harvest</p>
          </div>
          <div className="pillar">
            <div className="pillar-icon">💰</div>
            <h4>Direct Profit</h4>
            <p>Sell directly — no middlemen, better margins</p>
          </div>
        </div>

        <div className="accuracy-badge">
          <span className="acc-num">95%</span>
          <div className="acc-divider"></div>
          <div className="acc-text">
            <strong>Detection Accuracy</strong>
            <p>Industry-leading ML model for plant disease identification</p>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="cta">
        <h2>Start Smart Farming Today 🌱</h2>
        <button onClick={() => navigate("/register")}>Get Started</button>
      </section>

    </div>
  );
};

export default Home;