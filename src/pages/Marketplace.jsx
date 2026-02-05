import "./Marketplace.css";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

// ---------- COMPONENT ----------
const Marketplace = () => {
  const { addToCart, cartItems } = useCart();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("");

  // ---------- FETCH PRODUCTS ----------
  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error(err));
  }, []);

  // ---------- FILTER LOGIC ----------
  const filteredProducts = products
    .filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase())
    )
    .filter(p =>
      category === "All" || p.category === category
    )
    .sort((a, b) => {
      if (sort === "low") return a.price - b.price;
      if (sort === "high") return b.price - a.price;
      return 0;
    });

  return (
    <div className="marketplace-page">
      {/* HEADER */}
      <div className="marketplace-header">
        <h2>🛒 Farmer Marketplace</h2>
        <div className="cart-icon" onClick={() => navigate("/cart")}>
          🛍 <span className="cart-count">{cartItems.length}</span>
        </div>
      </div>

      {/* FILTERS */}
      <div className="marketplace-filters">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="All">All Categories</option>
          <option value="Fruits">Fruits</option>
          <option value="Vegetables">Vegetables</option>
          <option value="Grains">Grains</option>
          <option value="Fungi">Fungi</option>
        </select>

        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="">Sort by Price</option>
          <option value="low">Low → High</option>
          <option value="high">High → Low</option>
        </select>
      </div>

      {/* PRODUCT GRID */}
      <div className="product-grid">
        {filteredProducts.map(item => (
          <div key={item._id} className="product-card">
            <img src={item.image} alt={item.name} />
            <div className="product-info">
              <h3>{item.name}</h3>
              <p className="price">₹{item.price} / {item.unit}</p>

              <div className="product-actions">
                <button onClick={() => addToCart(item)}>
                  ➕ Add to Cart
                </button>
                <button
                  className="buy-now"
                  onClick={() =>
                    navigate("/checkout", { state: { product: item } })
                  }
                >
                  💳 Buy Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marketplace;
