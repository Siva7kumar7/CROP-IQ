import "./Marketplace.css";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API_BASE_URL from "../apiConfig";

const Marketplace = () => {
  const { addToCart, cartItems } = useCart();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("");
  const [loading, setLoading] = useState(true);

  const [wishlist, setWishlist] = useState(() => {
    return JSON.parse(localStorage.getItem("wishlist")) || [];
  });

  const [showToast, setShowToast] = useState(false);

  /* ================= ADD HANDLER ================= */
  const handleAdd = (item) => {
    addToCart(item);

    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  /* ================= WISHLIST ================= */
  const toggleWishlist = (id) => {
    const updated = wishlist.includes(id)
      ? wishlist.filter((i) => i !== id)
      : [...wishlist, id];

    setWishlist(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));
  };

  /* ================= FETCH ================= */
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  /* ================= IMAGE HELPER ================= */
  const getImageSrc = (image) => {
    if (!image) return "/default.png";
    if (image.startsWith("data:")) return image;
    return `data:image/jpeg;base64,${image}`;
  };

  /* ================= FILTER ================= */
  const filteredProducts = [...products]
    .filter((p) =>
      p.name?.toLowerCase().includes(search.toLowerCase())
    )
    .filter((p) => category === "All" || p.category === category)
    .sort((a, b) => {
      if (sort === "low") return a.price - b.price;
      if (sort === "high") return b.price - a.price;
      return 0;
    });

  return (
    <div className="marketplace-page">

      {/* HEADER */}
      <div className="marketplace-header" style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <h2 className="gradient-text" style={{ fontSize: '32px', margin: 0 }}>🛒 Fresh Harvest Marketplace</h2>
          <p style={{ color: 'var(--text-light)', fontSize: '15px', margin: 0 }}>Discover fresh, organic produce sourced directly from trusted local farmers.</p>
        </div>
        <div className="cart-icon" onClick={() => navigate("/cart")}>
          🛍 <span className="cart-count">{cartItems.length}</span>
        </div>
      </div>

      {/* FILTERS */}
      <div className="marketplace-filters">
        <input
          type="text"
          placeholder="Search fresh harvests..."
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

      {/* LOADING */}
      {loading ? (
        <div className="loader"></div>
      ) : (
        <div className="product-grid">
          {filteredProducts.length === 0 ? (
            <div className="empty-state" style={{ textAlign: 'center', padding: '40px', width: '100%', gridColumn: '1 / -1' }}>
              <p style={{ fontSize: '18px', color: '#666' }}>No harvests match your criteria 🌱</p>
            </div>
          ) : (
            filteredProducts.map((item) => (
              <div key={item._id} className="product-card">

                <div className="badge">Fresh</div>

                {/* Wishlist */}
                <div
                  className={`wishlist ${
                    wishlist.includes(item._id) ? "active" : ""
                  }`}
                  onClick={() => toggleWishlist(item._id)}
                >
                  ♥
                </div>

                {/* Image */}
                <div className="image-container">
                  <img
                    src={getImageSrc(item.image)}
                    alt={item.name}
                    loading="lazy"
                    onError={(e) => (e.target.src = "/default.png")}
                  />
                </div>

                <div className="product-info">
                  <h3>{item.name}</h3>

                  <p className="seller">
                    👨‍🌾 {item.seller || "Local Farmer"}
                  </p>

                  <p className="location">
                    📍 {item.location || "Tamil Nadu"}
                  </p>

                  <p className="price">
                    ₹{item.price} / {item.unit}
                  </p>

                  <div className="product-actions">
                    <button onClick={() => handleAdd(item)}>
                      ➕ Add
                    </button>

                    <button
                      className="buy-now"
                      onClick={() =>
                        navigate("/checkout", {
                          state: { product: item },
                        })
                      }
                    >
                      Buy
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ✅ GLOBAL TOAST (ONLY ONCE) */}
      {showToast && (
        <div className="toast">
          🛒 Added to cart
        </div>
      )}
    </div>
  );
};

export default Marketplace;