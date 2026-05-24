let API_BASE_URL = import.meta.env.VITE_API_URL || "https://agriverse-backend-e9vh.onrender.com";
if (API_BASE_URL.includes("localhost") || API_BASE_URL.includes("127.0.0.1")) {
  API_BASE_URL = "https://agriverse-backend-e9vh.onrender.com";
}

export default API_BASE_URL;
