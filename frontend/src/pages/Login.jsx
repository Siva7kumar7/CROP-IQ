import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API_BASE_URL from "../apiConfig";
import logo from "../assets/logo_new.png";
import "./Auth.css";

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "Farmer",
  });

  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ================= LOGIN ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        // Store both user data AND token for ProtectedRoute
        localStorage.setItem(
          "user",
          JSON.stringify({
            name: data.name,
            role: data.role,
            email: data.email,
          })
        );
        localStorage.setItem("token", data.token);

        navigate("/home");
      } else {
        alert(data.message || "Login failed");
      }
    } catch (error) {
      alert("Server error - please check if backend is running");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  /* ================= FORGOT PASSWORD ================= */
  const handleResetPassword = async () => {
    if (!forgotEmail || !newPassword) {
      alert("Fill all fields");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: forgotEmail,
          newPassword: newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Password reset successful");
        setShowForgot(false);
      } else {
        alert(data.message || "Failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <img src={logo} alt="AgriVerse Logo" className="auth-logo" />
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Sign in to AgriVerse 4.0</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              name="password"
              type="password"
              placeholder="Enter your password"
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="login-role">Role</label>
            <select id="login-role" name="role" onChange={handleChange}>
              <option>Farmer</option>
              <option>Buyer</option>
              <option>Admin</option>
            </select>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="forgot-link" onClick={() => setShowForgot(true)}>
            Forgot Password?
          </p>

          <p className="auth-switch">
            Don't have an account?{" "}
            <Link to="/register">Create one</Link>
          </p>
        </form>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgot && (
        <div className="modal-overlay" onClick={() => setShowForgot(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Reset Password</h3>

            <input
              placeholder="Enter your email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <div className="modal-actions">
              <button className="auth-btn" onClick={handleResetPassword}>
                Reset Password
              </button>
              <button
                className="cancel-btn"
                onClick={() => setShowForgot(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;