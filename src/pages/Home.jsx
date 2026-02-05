// ===============================
// src/pages/Home.jsx
// ===============================
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './Home.css'

const Home = () => {
  return (
    <>
      {/* Navbar always at the top */}
      <Navbar />

      {/* Page content */}
      <div className="home">
        <section className="hero">
          <h2>Smart Agriculture Powered by AI</h2>
          <p>Plant Disease Detection • Weather Prediction • Early Warnings • Marketplace</p>
          <button>Get Started</button>
        </section>

        <section className="features">
          <div className="card">🌿 Plant Disease Detection</div>
          <div className="card">🌦 Weather Forecast</div>
          <div className="card">🚨 Early Warning System</div>
          <div className="card">🧪 Fertilizer Recommendation</div>
          <div className="card">🛒 Farmer Marketplace</div>
        </section>
      </div>

      {/* Footer always at the bottom */}
      <Footer />
    </>
  )
}

export default Home
