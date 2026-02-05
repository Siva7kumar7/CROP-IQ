import "./Checkout.css";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Checkout = () => {
  const { cartItems } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    pincode: "",
  });

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const placeOrder = () => {
    if (!address.name || !address.phone || !address.street) {
      alert("Please fill all required fields");
      return;
    }
    navigate("/order-success");
  };

  return (
    <div className="checkout-page">
      <h2>🧾 Checkout</h2>

      <div className="checkout-container">
        {/* Address Section */}
        <div className="checkout-section">
          <h3>📍 Delivery Address</h3>
          <input name="name" placeholder="Full Name" onChange={handleChange} />
          <input name="phone" placeholder="Phone Number" onChange={handleChange} />
          <input name="street" placeholder="Street Address" onChange={handleChange} />
          <input name="city" placeholder="City" onChange={handleChange} />
          <input name="pincode" placeholder="Pincode" onChange={handleChange} />
        </div>

        {/* Order Summary */}
        <div className="checkout-section">
          <h3>🛒 Order Summary</h3>

          {cartItems.map((item) => (
            <div key={item.id} className="summary-item">
              <span>{item.name} × {item.quantity}</span>
              <span>₹{item.price * item.quantity}</span>
            </div>
          ))}

          <hr />
          <h4>Total Amount: ₹{total}</h4>
        </div>

        {/* Payment */}
        <div className="checkout-section">
          <h3>💳 Payment Method</h3>
          <label><input type="radio" name="payment" defaultChecked /> Cash on Delivery</label>
          <label><input type="radio" name="payment" /> UPI</label>
          <label><input type="radio" name="payment" /> Card</label>

          <button className="place-order-btn" onClick={placeOrder}>
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
