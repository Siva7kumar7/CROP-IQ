// ===============================
// src/pages/Weather.jsx
// ===============================
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./Weather.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// ✅ Add Navbar & Footer
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const LocationMarker = ({ setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });
  return null;
};

const getWindDirection = (deg) => {
  if (deg == null) return "--";
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
};

const ForecastCards = ({ forecast }) => {
  if (!Array.isArray(forecast)) return null;
  return (
    <div className="forecast-strip">
      {forecast.map((day, i) => (
        <div key={i} className="forecast-card">
          <h4>{day.day || "Day"}</h4>
          <img src={day.icon || ""} alt="weather" />
          <p>{day.temp ?? "--"}°C</p>
          <small>💧 {day.humidity ?? "--"}%</small>
        </div>
      ))}
    </div>
  );
};

const Weather = () => {
  const [position, setPosition] = useState(null);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchWeather = async (lat, lon) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:5000/api/weather/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lon }),
      });
      if (!response.ok) throw new Error("Weather API error");
      const data = await response.json();
      setWeather(data);

      const forecastRes = await fetch("http://127.0.0.1:5000/api/weather/forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lon }),
      });
      if (!forecastRes.ok) throw new Error("Forecast API error");
      const forecastData = await forecastRes.json();

      const forecastArray = Array.isArray(forecastData.forecast)
        ? forecastData.forecast
        : [forecastData.forecast];

      setForecast(forecastArray);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch weather or forecast data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(coords);
        fetchWeather(coords.lat, coords.lng);
      },
      () => setError("Location permission denied")
    );
  }, []);

  const chartLabels = forecast.map((f) => f.date ?? f.day ?? "Day");
  const tempData = forecast.map((f) => f.temp ?? 0);
  const humidityData = forecast.map((f) => f.humidity ?? 0);
  const rainData = forecast.map((f) => f.rain ?? 0);

  const temperatureChart = {
    labels: chartLabels,
    datasets: [
      {
        label: "Temperature (°C)",
        data: tempData,
        borderColor: "#ff9800",
        backgroundColor: "#ffcc80",
        tension: 0.4,
      },
    ],
  };

  const humidityChart = {
    labels: chartLabels,
    datasets: [{ label: "Humidity (%)", data: humidityData, backgroundColor: "#4fc3f7" }],
  };

  const rainfallChart = {
    labels: chartLabels,
    datasets: [{ label: "Rainfall (mm)", data: rainData, backgroundColor: "#81d4fa" }],
  };

  const getHarvestSuggestion = (w) => {
    if (!w) return "Select a location to get advice";

    if (w.rain_probability > 60) return "❌ Not suitable for harvesting – rain likely";
    if (w.humidity > 80) return "⚠ High humidity – risk of fungal damage";
    if (w.wind_speed > 6) return "⚠ Strong wind – harvesting not advised";
    if (w.temperature >= 20 && w.temperature <= 32)
      return "✅ Good harvesting conditions for most crops";

    return "⚠ Moderate conditions – proceed with caution";
  };

  return (
    <>
      {/* Navbar at the top */}
      <Navbar />

      <div className="weather-page">
        <div className="weather-card">
          <h1>🌦 Smart Weather Prediction</h1>
          <p className="subtitle">Click on map to select exact farm location</p>

          <div className="map-box">
            <MapContainer center={position || [10.7905, 79.1378]} zoom={7} scrollWheelZoom>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {position && <Marker position={position} />}
              <LocationMarker setPosition={setPosition} />
            </MapContainer>
          </div>

          <button
            className="fetch-btn"
            onClick={() => position && fetchWeather(position.lat, position.lng)}
          >
            📍 Get Weather for Selected Location
          </button>

          {loading && <p className="loading">Fetching weather...</p>}
          {error && <p className="error">{error}</p>}

          {weather && (
            <>
              <div className="weather-summary">
                <h2>{weather.city || "Selected Area"}</h2>
                <p>
                  {weather.date} • {weather.time}
                </p>
              </div>

              <div className="weather-grid">
                <div className="weather-box">
                  🌡 Temperature
                  <strong>{weather.temperature ?? "--"} °C</strong>
                </div>

                <div className="weather-box">
                  💧 Humidity
                  <strong>{weather.humidity ?? "--"} %</strong>
                </div>

                <div className="weather-box">
                  🌬 Wind Speed
                  <strong>{weather.wind_speed ?? "--"} m/s</strong>
                </div>

                <div className="weather-box">
                  🧭 Wind Direction
                  <strong>{getWindDirection(weather.wind_direction)}</strong>
                </div>

                <div className="weather-box">
                  🌧 Rain Probability
                  <strong>{weather.rain_probability ?? "--"} %</strong>
                </div>
              </div>

              <div
                className={`alert-box ${
                  weather.alert?.includes("Normal") ? "normal" : "warning"
                }`}
              >
                ⚠ {weather.alert || "No alert available"}
              </div>

              <div className="harvest-box">
                🌾 <strong>Harvesting Advice:</strong>
                <p>{getHarvestSuggestion(weather)}</p>
              </div>

              {forecast.length > 0 && (
                <>
                  <h2>📅 Next 7 Days Forecast</h2>
                  <ForecastCards forecast={forecast} />
                </>
              )}

              <div className="analysis-section">
                <h2>📊 Weekly Weather Forecast</h2>
                <div className="chart-box">
                  <Line data={temperatureChart} />
                </div>
                <div className="chart-box">
                  <Bar data={humidityChart} />
                </div>
                <div className="chart-box">
                  <Bar data={rainfallChart} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer at the bottom */}
      <Footer />
    </>
  );
};

export default Weather;
