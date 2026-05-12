import { createContext, useContext, useEffect, useState } from "react";
import API_BASE_URL from "../apiConfig";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  /* ================= USER ================= */
  let user = null;
  try {
    const storedUser = localStorage.getItem("user");
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    localStorage.removeItem("user");
  }

  const userId =
    user?._id || user?.id || user?.email || user?.name;

  /* ================= LOAD CART ================= */
  useEffect(() => {
    if (!userId) return;

    const loadCart = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/cart/${userId}`
        );
        const data = await res.json();
        setCartItems(data.items || []);
      } catch (err) {
        console.error("Cart load error:", err);
      }
    };

    loadCart();
  }, [userId]);

  /* ================= ADD ================= */
  const addToCart = async (product) => {
    const newItem = {
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
    };

    setCartItems((prev) => [...prev, { ...newItem, quantity: 1 }]);

    await fetch("http://localhost:5000/api/cart/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, ...newItem }),
    });
  };

  /* ================= REMOVE ================= */
  const removeFromCart = async (productId) => {
    setCartItems((prev) =>
      prev.filter((item) => item.productId !== productId)
    );

    await fetch(
      `${API_BASE_URL}/api/cart/remove/${userId}/${productId}`,
      { method: "DELETE" }
    );
  };

  /* ================= INCREASE ================= */
  const increaseQty = async (productId) => {
    await fetch("http://localhost:5000/api/cart/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        productId,
        action: "increase",
      }),
    });

    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  /* ================= DECREASE ================= */
  const decreaseQty = async (productId) => {
    await fetch("http://localhost:5000/api/cart/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        productId,
        action: "decrease",
      }),
    });

    setCartItems((prev) =>
      prev
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
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

export const useCart = () => useContext(CartContext);