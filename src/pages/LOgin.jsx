import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "Farmer",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ Optional: store login info
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("role", form.role);

        alert("Login successful ✅");

        localStorage.setItem(
              "user",
              JSON.stringify({
                name: data.name,
                role: data.role
              })
            );

        navigate("/home");

      } else {
        alert(data.message || "Login failed ❌");
      }
    } catch (error) {
      alert("Server error ❌");
      console.error(error);
    }
  };

  return (
    <div className="auth-container">
      <h2>Login to AgriVerse</h2>

      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />

        <select name="role" onChange={handleChange}>
          <option>Farmer</option>
          <option>Buyer</option>
          <option>Admin</option>
        </select>

        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
