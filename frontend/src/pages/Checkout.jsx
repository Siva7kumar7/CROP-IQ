  import "./Checkout.css";
import { useCart } from "../context/CartContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import API_BASE_URL from "../apiConfig";

const Checkout = () => {
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  // Direct-buy passes a single product via navigate("/checkout", { state: { product } })
  const directProduct = location.state?.product;

  // If direct buy, wrap as single-item list; otherwise use cart
  const checkoutItems = directProduct
    ? [{ ...directProduct, productId: directProduct._id, quantity: 1 }]
    : cartItems;

  const [payment, setPayment] = useState("cod");
  const [loading, setLoading] = useState(false);

  const [address, setAddress] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    pincode: "",
  });

  const total = checkoutItems.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const placeOrder = async () => {
    if (!address.name || !address.phone || !address.street) {
      alert("Please fill all required fields (Name, Phone, Address)");
      return;
    }
    if (!address.phone.match(/^[0-9]{10}$/)) {
      alert("Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      const orderData = {
        userId: user?.email || user?.name,
        items: checkoutItems,
        total,
        address,
        payment,
        status: "Placed",
      };

      const res = await fetch(`${API_BASE_URL}/api/orders/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!res.ok) throw new Error("Order failed");
      navigate("/order-success");
    } catch (err) {
      alert("Order failed - please try again");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getImageSrc = (image) => {
    if (!image) return null;
    if (image.startsWith("data:")) return image;
    return `data:image/jpeg;base64,${image}`;
  };

  return (
    <div className="checkout-page">
      <div className="checkout-hero">
        <h2>🛒 Secure Checkout</h2>
        <p>Review your order and complete your purchase safely</p>
      </div>

      <div className="checkout-container">

        {/* ADDRESS */}
        <div className="checkout-card">
          <h3>📍 Delivery Address</h3>
          <div className="form-grid">
            <div className="input-group">
              <label>Full Name *</label>
              <input name="name" placeholder="e.g. Ramesh Kumar" onChange={handleChange} />
            </div>
            <div className="input-group">
              <label>Phone Number *</label>
              <input name="phone" placeholder="10-digit mobile number" maxLength={10} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label>City</label>
              <input name="city" placeholder="e.g. Coimbatore" onChange={handleChange} />
            </div>
            <div className="input-group">
              <label>Pincode</label>
              <input name="pincode" placeholder="e.g. 641001" maxLength={6} onChange={handleChange} />
            </div>
            <div className="input-group full-span">
              <label>Street Address *</label>
              <textarea name="street" placeholder="Door No, Street, Area..." onChange={handleChange}></textarea>
            </div>
          </div>
        </div>

        {/* ORDER SUMMARY */}
        <div className="checkout-card summary-card">
          <h3>📋 Order Summary</h3>

          <div className="summary-list">
            {checkoutItems.map((item, idx) => (
              <div key={item.productId || item._id || idx} className="summary-item">
                <div className="summary-item-left">
                  {getImageSrc(item.image) && (
                    <img src={getImageSrc(item.image)} alt={item.name} className="summary-thumb" />
                  )}
                  <div>
                    <p className="summary-name">{item.name}</p>
                    <small className="summary-meta">
                      Qty: {item.quantity || 1} · {item.category || ""} · {item.location || "Tamil Nadu"}
                    </small>
                    <small className="summary-seller">👨‍🌾 {item.farmer || "Local Farmer"}</small>
                  </div>
                </div>
                <span className="summary-price">₹{item.price * (item.quantity || 1)}</span>
              </div>
            ))}
          </div>

          <div className="summary-total">
            <span>Grand Total</span>
            <h3>₹{total}</h3>
          </div>
        </div>

        {/* PAYMENT */}
        <div className="checkout-card payment-card">
          <h3>💳 Payment Method</h3>

          <div className="payment-options">
            {[
              { id: "cod", label: "💵 Cash on Delivery", desc: "Pay when delivered" },
              { id: "upi", label: "📱 UPI Payment", desc: "GPay, PhonePe, Paytm" },
              { id: "card", label: "💳 Debit / Credit Card", desc: "Visa, Mastercard, RuPay" },
            ].map((opt) => (
              <div
                key={opt.id}
                className={`payment-option ${payment === opt.id ? "active" : ""}`}
                onClick={() => setPayment(opt.id)}
              >
                <div className="payment-label">{opt.label}</div>
                <div className="payment-desc">{opt.desc}</div>
              </div>
            ))}
          </div>

          <button
            className="place-order-btn"
            onClick={placeOrder}
            disabled={loading}
          >
            {loading ? "⏳ Placing Order..." : "✅ Place Order"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Checkout;