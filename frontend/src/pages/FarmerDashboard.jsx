import React, { useEffect, useState } from "react";
import "./FarmerDashboard.css";
import API_BASE_URL from "../apiConfig";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend
} from "recharts";

const FarmerDashboard = () => {

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [product, setProduct] = useState({
    name: "",
    price: "",
    category: "",
    location: "",
    image: null,
    preview: null,
  });

  /* ================= LOAD DATA ================= */
  const loadData = async () => {
    const p = await fetch(`${API_BASE_URL}/api/products`);
    const o = await fetch(`${API_BASE_URL}/api/orders`);

    setProducts(await p.json());
    setOrders(await o.json());
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ================= INPUT ================= */
  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  /* ================= IMAGE ================= */
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setProduct({
      ...product,
      image: file,
      preview: URL.createObjectURL(file),
    });
  };

  /* ================= ADD PRODUCT ================= */
  const addProduct = async () => {
    if (!product.name || !product.price || !product.category) {
      alert("Fill all fields");
      return;
    }

    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("price", product.price);
    formData.append("category", product.category);
    formData.append("location", product.location);
    formData.append("image", product.image);

    await fetch(`${API_BASE_URL}/api/products/add`, {
      method: "POST",
      body: formData, // ✅ IMPORTANT FIX
    });

    setProduct({
      name: "",
      price: "",
      category: "",
      location: "",
      image: null,
      preview: null,
    });

    loadData();
  };

  /* ================= DELETE ================= */
  const deleteProduct = async (id) => {
    await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: "DELETE",
    });

    loadData();
  };

  /* ================= UPDATE ORDER ================= */
  const updateStatus = async (id, status) => {
    await fetch(`${API_BASE_URL}/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    loadData();
  };

  /* ================= ANALYTICS ================= */
  const salesData = products.map((p) => ({
    name: p.name,
    sales: p.price
  }));

  const categoryData = [
    { name: "Fruits", value: products.filter(p => p.category === "Fruits").length },
    { name: "Vegetables", value: products.filter(p => p.category === "Vegetables").length },
    { name: "Grains", value: products.filter(p => p.category === "Grains").length },
  ];

  const COLORS = ["#2e7d32", "#66bb6a", "#a5d6a7"];

  const orderStatusData = [
    { name: "Pending", count: orders.filter(o => o.status === "Pending").length },
    { name: "Placed", count: orders.filter(o => o.status === "Placed").length },
    { name: "Packed", count: orders.filter(o => o.status === "Packed").length },
    { name: "Shipped", count: orders.filter(o => o.status === "Shipped").length },
    { name: "Delivered", count: orders.filter(o => o.status === "Delivered").length },
  ];

  /* ================= FINANCIAL METRICS ================= */
  const totalRevenue = orders
    .filter((o) => o.status === "Delivered")
    .reduce((sum, o) => sum + (o.total || 0), 0);
  const profit = totalRevenue * 0.3; // Simulated 30% margin
  const isGain = profit > 0;

  return (
    <div className="farmer-dashboard">

      {/* HEADER */}
      <div className="dash-header">
        <h1 className="gradient-text">🚜 Farmer Agri-Dashboard</h1>
        <p>Manage your inventory, track personal revenue, and fulfill your customer orders.</p>
      </div>

      {/* FINANCIAL ANALYTICS */}
      <div className="farmer-card">
        <h2>💰 Financial Analytics</h2>
        <div className="fin-stats-grid">
          <div className="fin-stat-card">
            <div className="fin-stat-label">📊 Total Revenue</div>
            <div className="fin-stat-value">₹{totalRevenue.toFixed(2)}</div>
            <div className="fin-stat-badge">📦 From Delivered Orders</div>
          </div>
          <div className="fin-stat-card">
            <div className="fin-stat-label">💵 Est. Profit (30%)</div>
            <div className="fin-stat-value">₹{profit.toFixed(2)}</div>
            <div className="fin-stat-badge">✅ Net Earnings</div>
          </div>
          <div className="fin-stat-card">
            <div className="fin-stat-label">📈 Gain / Loss</div>
            <div className={`fin-stat-value ${isGain ? 'gain' : 'loss'}`}>
              {isGain ? '▲' : '▼'} ₹{profit.toFixed(2)}
            </div>
            <div className="fin-stat-badge">{isGain ? '🟢 Profitable' : '🔴 At Loss'}</div>
          </div>
        </div>
      </div>

      {/* PRODUCTS (MOVED TO TOP) */}
      <div className="farmer-card">
        <h2>🛒 Active Inventory</h2>

        <div className="farmer-grid">
          {products.map((p) => (
            <div key={p._id} className="farmer-product-card">
              <img
                src={
                  p.image
                    ? p.image.startsWith("data:")
                      ? p.image
                      : `data:image/jpeg;base64,${p.image}`
                    : "https://via.placeholder.com/300x200?text=No+Image"
                }
                alt={p.name}
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/300x200?text=Image+Error";
                }}
              />
              <h3>{p.name}</h3>
              <p>₹{p.price}</p>

              <button onClick={() => deleteProduct(p._id)}>❌ Remove</button>
            </div>
          ))}
        </div>
      </div>

      {/* ADD PRODUCT */}
      <div className="farmer-card">
        <h2>📦 Add New Product</h2>
        <div className="add-product-form">
          <div className="form-group">
            <label>Product Name</label>
            <input name="name" value={product.name} onChange={handleChange} placeholder="e.g. Organic Tomatoes" />
          </div>
          <div className="form-group">
            <label>Price (₹)</label>
            <input name="price" value={product.price} onChange={handleChange} placeholder="Price per kg" />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select name="category" value={product.category} onChange={handleChange}>
              <option value="">Select Category</option>
              <option>Fruits</option>
              <option>Vegetables</option>
              <option>Grains</option>
              <option>Fungi</option>
            </select>
          </div>
          <div className="form-group">
            <label>Location</label>
            <input name="location" value={product.location} onChange={handleChange} placeholder="e.g. Coimbatore" />
          </div>
          <div className="form-group full-width">
            <label>Product Image</label>
            <div className="file-upload-box">
              <input type="file" onChange={handleImage} accept="image/*" id="product-img" hidden />
              <label htmlFor="product-img" className="file-label">
                {product.preview ? "📸 Change Photo" : "📁 Select Product Image"}
              </label>
            </div>
          </div>
          
          {product.preview && (
            <div className="form-preview">
              <img src={product.preview} alt="Preview" />
            </div>
          )}

          <button className="add-btn-premium" onClick={addProduct}>
            ➕ List Product in Market
          </button>
        </div>
      </div>



      {/* ANALYTICS */}
      <div className="farmer-card">
        <h2>📈 Performance Analytics</h2>
        <div className="analytics">
          <div className="chart">
            <h3 style={{ fontSize: '14px', marginBottom: '15px', color: 'var(--text-muted)' }}>Sales Revenue Trends</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={salesData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sales" stroke="#2e7d32" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart">
            <h3 style={{ fontSize: '14px', marginBottom: '15px', color: 'var(--text-muted)' }}>Product Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart">
            <h3 style={{ fontSize: '14px', marginBottom: '15px', color: 'var(--text-muted)' }}>Order Fulfillment Status</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={orderStatusData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#43a047" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI INSIGHTS */}
      <div className="farmer-card" style={{ background: 'linear-gradient(135deg, #f1f8e9 0%, #ffffff 100%)', border: '1.5px solid #a5d6a7' }}>
        <h2 style={{ color: '#1b5e20' }}>🤖 AI Smart Insights</h2>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '10px' }}>
          <div style={{ fontSize: '40px' }}>💡</div>
          <div>
            <p style={{ fontWeight: '700', color: '#2e7d32', marginBottom: '5px' }}>Optimization Tip:</p>
            <p style={{ fontSize: '14px', color: '#333', lineHeight: '1.6' }}>
              Based on your sales data, <strong>{categoryData[0]?.name || "your products"}</strong> are performing exceptionally well this month. 
              Consider increasing your inventory for <strong>{salesData[salesData.length-1]?.name || "these items"}</strong> to maximize profit. 
              Your delivery success rate is high—great job!
            </p>
          </div>
        </div>
      </div>

      <div className="farmer-card">
        <h2>📦 Fulfillment Center</h2>

        <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Buyer Info</th>
              <th>Delivery Address</th>
              <th>Items Ordered</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((o) => (
              <tr key={o._id}>
                {/* BUYER NAME & PHONE */}
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontWeight: '700', fontSize: '14px', color: '#1b5e20' }}>
                      👤 {o.address?.name || o.userId || 'N/A'}
                    </span>
                    {o.address?.phone && (
                      <span style={{ fontSize: '13px', color: '#555' }}>
                        📞 {o.address.phone}
                      </span>
                    )}
                  </div>
                </td>

                {/* DELIVERY ADDRESS */}
                <td>
                  <div style={{ fontSize: '13px', color: '#444', lineHeight: '1.6' }}>
                    {o.address?.street && <div>{o.address.street}</div>}
                    {(o.address?.city || o.address?.pincode) && (
                      <div style={{ color: '#888' }}>
                        {o.address?.city}{o.address?.city && o.address?.pincode ? ' - ' : ''}{o.address?.pincode}
                      </div>
                    )}
                    {!o.address?.street && <span style={{ color: '#bbb' }}>No address provided</span>}
                  </div>
                </td>

                {/* ITEMS */}
                <td>
                  <ul style={{ paddingLeft: '16px', margin: 0, textAlign: 'left', fontSize: '13px' }}>
                    {o.items?.map((item, idx) => (
                      <li key={idx}>
                        <strong>{item.name}</strong> × {item.quantity}
                        <span style={{ color: '#888', marginLeft: '6px' }}>₹{item.price}</span>
                      </li>
                    ))}
                  </ul>
                </td>

                <td style={{ fontWeight: 'bold', color: '#2e7d32', fontSize: '15px' }}>₹{o.total}</td>

                <td>
                  <span style={{
                    background: o.payment === 'cod' ? '#fff3e0' : '#e3f2fd',
                    color: o.payment === 'cod' ? '#e65100' : '#1565c0',
                    padding: '4px 10px', borderRadius: '50px', fontSize: '12px', fontWeight: '700'
                  }}>
                    {o.payment === 'cod' ? '💵 COD' : o.payment === 'upi' ? '📱 UPI' : '💳 Card'}
                  </span>
                </td>

                <td><span className={`status ${o.status?.toLowerCase()}`}>{o.status}</span></td>

                <td>
                  <button onClick={() => updateStatus(o._id, 'Packed')}>Pack</button>
                  <button onClick={() => updateStatus(o._id, 'Shipped')}>Ship</button>
                  <button onClick={() => updateStatus(o._id, 'Delivered')}>Done</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

      </div>

    </div>
  );
};

export default FarmerDashboard;