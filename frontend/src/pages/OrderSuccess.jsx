import "./OrderSuccess.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const OrderSuccess = () => {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  useEffect(() => {
    setTimeout(() => setShow(true), 200);
  }, []);

  return (
    <div className="success-page">

      {/* 🌿 Floating Leaves */}
      <div className="leaf leaf1"></div>
      <div className="leaf leaf2"></div>
      <div className="leaf leaf3"></div>

      <div className={`success-card ${show ? "show" : ""}`}>
        
        {/* ✅ Animated Check */}
        <div className="checkmark">
          <div className="circle"></div>
          <div className="tick"></div>
        </div>

        <h2>Order Placed Successfully!</h2>
        <p>Your fresh farm products are on the way 🚜</p>

        <button onClick={() => navigate("/marketplace")}>
          🌾 Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default OrderSuccess;