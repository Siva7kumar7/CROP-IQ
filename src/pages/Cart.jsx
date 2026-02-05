import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

/* ================= PROVIDER ================= */
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  /* 🔐 SAFE USER PARSING */
  let user = null;
  try {
    const storedUser = localStorage.getItem("user");
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch (err) {
    console.error("Invalid user JSON in localStorage");
    localStorage.removeItem("user");
  }

  const userId = user?._id;

  /* ================= LOAD CART ================= */
  useEffect(() => {
    if (!userId) {
      setCartItems([]);
      return;
    }

    const loadCart = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/cart/${userId}`
        );
        const data = await res.json();
        setCartItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load cart", err);
        setCartItems([]);
      }
    };

    loadCart();
  }, [userId]);

  /* ================= ADD ================= */
  const addToCart = async (product) => {
    const existing = cartItems.find(
      (item) => item.productId === product._id
    );

    if (existing) {
      increaseQty(product._id);
      return;
    }

    const newItem = {
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    };

    setCartItems((prev) => [...prev, newItem]);

    await fetch("http://localhost:5000/api/cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...newItem }),
    });
  };

  /* ================= REMOVE ================= */
  const removeFromCart = async (productId) => {
    await fetch(
      `http://localhost:5000/api/cart/remove/${userId}/${productId}`,
      { method: "DELETE" }
    );

    setCartItems((prev) =>
      prev.filter((item) => item.productId !== productId)
    );
  };

  /* ================= INCREASE ================= */
  const increaseQty = async (productId) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );

    await fetch("http://localhost:5000/api/cart/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, productId, action: "increase" }),
    });
  };

  /* ================= DECREASE ================= */
  const decreaseQty = async (productId) => {
    const item = cartItems.find((i) => i.productId === productId);
    if (!item || item.quantity === 1) return;

    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );

    await fetch("http://localhost:5000/api/cart/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, productId, action: "decrease" }),
    });
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        increaseQty,
        decreaseQty,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

/* ================= HOOK ================= */
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
};
