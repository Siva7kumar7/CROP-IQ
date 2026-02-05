import "./OrderSuccess.css";
import { useNavigate } from "react-router-dom";

const OrderSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="success-page">
      <h2>✅ Order Placed Successfully!</h2>
      <p>Your order will be delivered soon 🚜</p>
      <button onClick={() => navigate("/market")}>
        Continue Shopping
      </button>
    </div>
  );
};

export default OrderSuccess;
