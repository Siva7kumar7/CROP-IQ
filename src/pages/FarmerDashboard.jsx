import React, { useState } from "react";
import "./FarmerDashboard.css";

/* ================= MOCK FARMER AUTH ================= */
const isFarmer = true;

/* ================= DASHBOARD ================= */
const FarmerDashboard = () => {
  if (!isFarmer) {
    return <h2 style={{ textAlign: "center" }}>❌ Access Denied</h2>;
  }

  /* ================= PRODUCT STATE ================= */
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState({
    name: "",
    price: "",
    quantity: "",
    category: "",
    location: "",
    image: null,
    preview: null,
  });

  /* ================= ORDERS (MOCK) ================= */
  const [orders] = useState([
    {
      id: "ORD101",
      product: "Fresh Tomatoes",
      quantity: 3,
      buyer: "Siva Kumar",
      phone: "9876543210",
      address: "Mayiladuthurai",
      status: "Booked",
    },
  ]);

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    setProduct({
      ...product,
      image: file,
      preview: URL.createObjectURL(file),
    });
  };

  const convertToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

  /* ================= ADD PRODUCT ================= */
  const addProduct = async () => {
    if (
      !product.name ||
      !product.price ||
      !product.category ||
      !product.location ||
      !product.image
    ) {
      alert("Please fill all fields");
      return;
    }

    const base64Image = await convertToBase64(product.image);

    const productData = {
      id: Date.now(), // UI id
      name: product.name,
      price: product.price,
      quantity: product.quantity,
      category: product.category,
      location: product.location,
      image: base64Image,
      farmer: "Siva Kumar",
    };

    try {
      await fetch("http://localhost:5000/api/products/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      // ✅ SHOW IN MY PRODUCTS
      setProducts((prev) => [...prev, productData]);

      // reset form
      setProduct({
        name: "",
        price: "",
        quantity: "",
        category: "",
        location: "",
        image: null,
        preview: null,
      });

    } catch (err) {
      alert("Server error");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="farmer-dashboard">
      <h1>👨‍🌾 Farmer Dashboard</h1>

      {/* UPLOAD PRODUCT */}
      <div className="dashboard-section">
        <h2>📦 Upload Product</h2>

        <input name="name" placeholder="Product Name" value={product.name} onChange={handleChange} />
        <input name="price" placeholder="Price (₹)" value={product.price} onChange={handleChange} />
        <input name="quantity" placeholder="Quantity (kg)" value={product.quantity} onChange={handleChange} />
        <input name="category" placeholder="Category" value={product.category} onChange={handleChange} />
        <input name="location" placeholder="Location" value={product.location} onChange={handleChange} />
        <input type="file" accept="image/*" onChange={handleImage} />

        {product.preview && <img src={product.preview} className="preview-img" />}

        <button onClick={addProduct}>➕ Add Product</button>
      </div>

      {/* MY PRODUCTS */}
      <div className="dashboard-section">
        <h2>🛒 My Products</h2>

        {products.length === 0 ? (
          <p>No products uploaded yet</p>
        ) : (
          <div className="product-grid">
            {products.map((p) => (
              <div key={p.id} className="product-card">
                <img src={p.image} alt={p.name} />
                <h4>{p.name}</h4>
                <p>₹{p.price}</p>
                <p>📦 {p.quantity} kg</p>
                <p>📍 {p.location}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ORDERS */}
      <div className="dashboard-section">
        <h2>📑 Orders Received</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Buyer</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.product}</td>
                <td>{o.quantity}</td>
                <td>{o.buyer}</td>
                <td>{o.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FarmerDashboard;
