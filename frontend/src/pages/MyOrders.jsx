import { useEffect, useState } from "react";
import "./MyOrders.css";
import API_BASE_URL from "../apiConfig";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);

  // ✅ Get logged-in user
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {}

  const userId = user?._id;

  /* ================= FETCH ORDERS ================= */
  useEffect(() => {
    if (!userId) return;

    fetch(`${API_BASE_URL}/api/orders/user/${userId}`)
      .then((res) => res.json())
      .then((data) => setOrders(data || []))
      .catch((err) => console.error(err));
  }, [userId]);

  return (
    <div className="orders-page">
      <h2>📦 My Orders</h2>

      {orders.length === 0 ? (
        <p className="empty">No orders yet 😢</p>
      ) : (
        <div className="orders-container">
          {orders.map((order) => (
            <div key={order._id} className="order-card">

              {/* HEADER */}
              <div className="order-header">
                <span>Order ID: {order._id.slice(-6)}</span>
                <span className={`status ${order.status}`}>
                  {order.status}
                </span>
              </div>

              {/* PRODUCTS */}
              <div className="order-items">
                {order.items.map((item, i) => (
                  <div key={i} className="order-item">
                    <img
                      src={item.image || "/default.png"}
                      alt={item.name}
                    />

                    <div>
                      <h4>{item.name}</h4>
                      <p>Qty: {item.quantity}</p>
                      <p>₹{item.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* TOTAL */}
              <div className="order-footer">
                <h3>Total: ₹{order.total}</h3>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;