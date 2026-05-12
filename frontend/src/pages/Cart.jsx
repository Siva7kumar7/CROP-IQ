import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Cart.css";

const Cart = () => {
  const { cartItems, removeFromCart, increaseQty, decreaseQty } = useCart();
  const navigate = useNavigate();
  const [animate, setAnimate] = useState(false);

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalItems = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const getImageSrc = (image) => {
    if (!image) return "/default.png";
    if (image.startsWith("data:")) return image;
    return `data:image/jpeg;base64,${image}`;
  };

  const handleCheckout = () => {
    setAnimate(true);
    setTimeout(() => {
      navigate("/checkout", { state: { cartItems, total } });
    }, 500);
  };

  return (
    <div className={`cart-page ${animate ? "slide-out" : ""}`}>

      {/* HEADER */}
      <div className="cart-header">
        <h2>🛒 Your Cart</h2>
        <div className="cart-count">Items: {totalItems}</div>
      </div>

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty 😢</p>
          <button onClick={() => navigate("/marketplace")}>
            🛍 Continue Shopping
          </button>
        </div>
      ) : (
        <div className="cart-layout">

          {/* LEFT: ITEMS */}
          <div className="cart-list">
            {cartItems.map((item) => (
              <div key={item.productId} className="cart-item">

                <img
                  src={getImageSrc(item.image)}
                  alt={item.name}
                  onError={(e) => { e.target.src = "/default.png"; }}
                />

                <div className="cart-info">
                  <h3>{item.name}</h3>
                  <p className="location">📍 {item.location || "Mayiladuthurai"}</p>
                  <p className="price">₹{item.price}</p>

                  <div className="qty-box">
                    <button onClick={() => decreaseQty(item.productId)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => increaseQty(item.productId)}>+</button>
                  </div>

                  <p className="item-total">
                    Total: ₹{item.price * item.quantity}
                  </p>
                </div>

                <button
                  className="remove-btn"
                  onClick={() => removeFromCart(item.productId)}
                >
                  ❌
                </button>
              </div>
            ))}
          </div>

          {/* RIGHT: SUMMARY */}
          <div className="cart-summary">
            <h3>🧾 Summary</h3>
            <p>Total Items: {totalItems}</p>
            <h2>₹{total}</h2>

            <button className="checkout-btn" onClick={handleCheckout}>
              Proceed to Checkout →
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default Cart;