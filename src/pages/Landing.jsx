import "./Landing.css";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="landing">
      <div className="overlay">
        <h1 className="title">AgriVerse</h1>
        <p className="subtitle">
          Connecting Farmers Directly to Consumers
        </p>

        <div className="btn-group">
          <Link to="/login" className="btn">Login</Link>
          <Link to="/register" className="btn outline">Register</Link>
        </div>
      </div>
    </div>
  );
};

export default Landing;
