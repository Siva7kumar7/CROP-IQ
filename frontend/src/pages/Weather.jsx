// ===============================
// src/pages/Weather.jsx
// ===============================
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./Weather.css";
import API_BASE_URL from "../apiConfig";
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, BarElement, Tooltip, Legend, Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler);

/* ── FIX LEAFLET MARKER ── */
import markerIconPng    from "leaflet/dist/images/marker-icon.png";
import markerIconRetina from "leaflet/dist/images/marker-icon-2x.png";
import markerShadowPng  from "leaflet/dist/images/marker-shadow.png";

const fixedIcon = new L.Icon({
  iconUrl: markerIconPng, iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadowPng, iconSize:[25,41], iconAnchor:[12,41],
  popupAnchor:[1,-34], shadowSize:[41,41],
});

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({ click(e) { setPosition(e.latlng); } });
  return position ? (
    <Marker position={position} icon={fixedIcon}>
      <Popup>📍 Selected Location</Popup>
    </Marker>
  ) : null;
};

const getWindDir = (deg) => {
  if (deg == null) return "--";
  return ["N","NE","E","SE","S","SW","W","NW"][Math.round(deg/45)%8];
};

const getHarvest = (w) => {
  if (!w) return { text:"Select a location to get advisory", cls:"neutral", icon:"🌾" };
  if (w.rain_probability > 60) return { text:"Avoid harvesting — Heavy rain expected", cls:"danger", icon:"❌" };
  if (w.humidity > 80)         return { text:"High humidity — Monitor crops closely",   cls:"warn",   icon:"⚠️" };
  if (w.wind_speed > 6)        return { text:"Strong winds — Secure your crops",        cls:"warn",   icon:"⚠️" };
  if (w.temperature >= 20 && w.temperature <= 32)
    return { text:"Ideal conditions for harvesting!", cls:"good", icon:"✅" };
  return { text:"Moderate conditions — Proceed carefully", cls:"warn", icon:"⚠️" };
};

const chartOpts = (color) => ({
  responsive: true,
  plugins: {
    legend: { labels: { color:"#374151", font:{ family:"Poppins", size:12 } } },
    tooltip: { backgroundColor:"#1f2937", titleFont:{ family:"Poppins" }, bodyFont:{ family:"Poppins" } },
  },
  scales: {
    x: { ticks:{ color:"#6b7280" }, grid:{ color:"rgba(0,0,0,0.05)" } },
    y: { ticks:{ color:"#6b7280" }, grid:{ color:"rgba(0,0,0,0.05)" } },
  },
});

/* ── STAT CARD ── */
const Stat = ({ icon, label, value, color, bg }) => (
  <div className="wx-stat" style={{ background: bg, borderLeft:`4px solid ${color}` }}>
    <div className="wx-stat-icon">{icon}</div>
    <div className="wx-stat-val" style={{ color }}>{value}</div>
    <div className="wx-stat-lbl">{label}</div>
  </div>
);

/* ── TIP CARD ── */
const tips = [
  { icon:"💧", title:"Irrigation", text:"Water crops early morning to reduce evaporation by up to 30%." },
  { icon:"🌱", title:"Soil Health", text:"Add organic compost after harvest to restore nitrogen levels." },
  { icon:"☀️", title:"Sunlight",   text:"Ensure 6–8 hrs of direct sunlight for fruiting vegetables." },
  { icon:"🐛", title:"Pest Check", text:"Inspect leaves weekly; early detection prevents crop loss." },
  { icon:"🌾", title:"Harvesting", text:"Harvest in cooler morning hours to preserve quality." },
  { icon:"🌦", title:"Rain Watch", text:"Use mulch during rainy season to prevent soil erosion." },
];

/* ══════════ MAIN ══════════ */
const Weather = () => {
  const [position, setPosition] = useState(null);
  const [weather,  setWeather]  = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const API = API_BASE_URL;

  const fetchWeather = async (lat, lon) => {
    setLoading(true); setError("");
    try {
      const [wRes, fRes] = await Promise.all([
        fetch(`${API}/api/weather/predict`,  { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({lat,lon}) }),
        fetch(`${API}/api/weather/forecast`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({lat,lon}) }),
      ]);
      if (!wRes.ok || !fRes.ok) throw new Error("API error");
      const wData = await wRes.json();
      const fData = await fRes.json();

      if (wData.success) {
        setWeather(wData);
      } else {
        setError(wData.error || "Failed to predict weather");
      }

      setForecast(Array.isArray(fData.forecast) ? fData.forecast : fData.forecast ? [fData.forecast] : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load weather data. Please check your backend.");
    } finally { setLoading(false); }
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const c = { lat:p.coords.latitude, lng:p.coords.longitude };
        setPosition(c); fetchWeather(c.lat, c.lng);
      },
      () => setError("Location access denied. Click the map to select a point.")
    );
  }, []);

  const labels   = forecast.map((f,i) => f.date || f.day || `Day ${i+1}`);
  const tempData = { labels, datasets:[{ label:"Temp (°C)", data:forecast.map(f=>f.temp??0), borderColor:"#f97316", backgroundColor:"rgba(249,115,22,0.12)", tension:0.4, fill:true, pointBackgroundColor:"#f97316", pointRadius:5 }] };
  const humData  = { labels, datasets:[{ label:"Humidity (%)", data:forecast.map(f=>f.humidity??0), backgroundColor:"rgba(14,165,233,0.7)", borderRadius:6 }] };
  const rainData = { labels, datasets:[{ label:"Rainfall (mm)", data:forecast.map(f=>f.rain??0), backgroundColor:"rgba(99,102,241,0.7)", borderRadius:6 }] };
  const harvest  = getHarvest(weather);

  const today = new Date().toLocaleDateString("en-IN",{ weekday:"long", year:"numeric", month:"long", day:"numeric" });

  return (
    <div className="wx-page">

      {/* ══ HERO ══ */}
      <div className="wx-hero">
        <div className="wx-hero-content">
          <div>
            <h1 className="wx-hero-title">🌦 Smart Weather Dashboard</h1>
            <p className="wx-hero-sub">Real-time insights for smarter farming decisions across Tamil Nadu</p>
          </div>
          <div className="wx-hero-date">{today}</div>
        </div>
        {/* HERO STATS STRIP */}
        {weather && (
          <div className="wx-hero-strip">
            <div className="wx-hstrip-item"><span>🌡</span><strong>{weather.temperature}°C</strong><small>Temp</small></div>
            <div className="wx-hstrip-sep" />
            <div className="wx-hstrip-item"><span>💧</span><strong>{weather.humidity}%</strong><small>Humidity</small></div>
            <div className="wx-hstrip-sep" />
            <div className="wx-hstrip-item"><span>🌬</span><strong>{weather.wind_speed} m/s</strong><small>Wind</small></div>
            <div className="wx-hstrip-sep" />
            <div className="wx-hstrip-item"><span>🌧</span><strong>{weather.rain_probability}%</strong><small>Rain Chance</small></div>
            <div className="wx-hstrip-sep" />
            <div className="wx-hstrip-item"><span>📌</span><strong>{weather.city || "Location"}</strong><small>City</small></div>
          </div>
        )}
      </div>

      {/* ══ BODY ══ */}
      <div className="wx-body">

        {/* ── LEFT SIDEBAR ── */}
        <aside className="wx-sidebar">

          {/* MAP */}
          <div className="wx-card">
            <div className="wx-card-title">📍 Select Location</div>
            <div className="wx-map">
              <MapContainer center={position || [10.79,79.13]} zoom={8} style={{ height:"100%", width:"100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationMarker position={position} setPosition={setPosition} />
              </MapContainer>
            </div>
            {position && (
              <div className="wx-coords">
                🌐 {position.lat?.toFixed(4)}°N &nbsp;·&nbsp; {position.lng?.toFixed(4)}°E
              </div>
            )}
            <button
              className="wx-btn"
              onClick={() => position && fetchWeather(position.lat, position.lng)}
              disabled={loading || !position}
            >
              {loading ? "⏳ Fetching..." : "📡 Get Weather Data"}
            </button>
            {error && <div className="wx-error">⚠️ {error}</div>}
          </div>

          {/* HARVEST ADVISORY */}
          <div className={`wx-card wx-harvest wx-harvest-${harvest.cls}`}>
            <div className="wx-card-title">🌾 Harvest Advisory</div>
            <div className="wx-harvest-body">
              <div className="wx-harvest-icon">{harvest.icon}</div>
              <p className="wx-harvest-text">{harvest.text}</p>
            </div>
          </div>

          {/* FARMING TIPS */}
          <div className="wx-card">
            <div className="wx-card-title">💡 Farming Tips</div>
            <div className="wx-tips">
              {tips.map((t) => (
                <div key={t.title} className="wx-tip">
                  <span className="wx-tip-icon">{t.icon}</span>
                  <div>
                    <div className="wx-tip-title">{t.title}</div>
                    <div className="wx-tip-text">{t.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </aside>

        {/* ── MAIN ── */}
        <main className="wx-main">

          {/* EARLY WARNING SYSTEM */}
          <div className="wx-card wx-warning-card">
            <div className="wx-card-title">🚨 Early Warning System</div>
            <div className="wx-warning-grid">
              {weather ? (
                <>
                  {weather.temperature > 35 && (
                    <div className="wx-warning-item heat">
                      <div className="wx-warning-icon">🔥</div>
                      <div className="wx-warning-text">
                        <strong>Heatwave Alert! / வெப்ப அலை எச்சரிக்கை!</strong>
                        <p>Temp is {weather.temperature}°C. Use mulching and increase irrigation to prevent crop wilting.</p>
                        <p className="tamil-text">வெப்பநிலை {weather.temperature}°C. பயிர் வாடுவதைத் தடுக்க தழைச்சத்து மற்றும் நீர்ப்பாசனத்தை அதிகரிக்கவும்.</p>
                      </div>
                    </div>
                  )}
                  {weather.rain_probability > 70 && (
                    <div className="wx-warning-item rain">
                      <div className="wx-warning-icon">🌊</div>
                      <div className="wx-warning-text">
                        <strong>Heavy Rain Alert! / கனமழை எச்சரிக்கை!</strong>
                        <p>{weather.rain_probability}% chance of rain. Ensure proper drainage in fields to avoid waterlogging.</p>
                        <p className="tamil-text">{weather.rain_probability}% மழை வாய்ப்பு. நீர்த்தேக்கத்தைத் தவிர்க்க வயல்களில் சரியான வடிகால் வசதியை உறுதி செய்யவும்.</p>
                      </div>
                    </div>
                  )}
                  {weather.wind_speed > 10 && (
                    <div className="wx-warning-item wind">
                      <div className="wx-warning-icon">🌪️</div>
                      <div className="wx-warning-text">
                        <strong>High Wind Alert! / பலத்த காற்று எச்சரிக்கை!</strong>
                        <p>Wind speed {weather.wind_speed} m/s. Support tall crops like Banana or Sugarcane with stakes.</p>
                        <p className="tamil-text">காற்றின் வேகம் {weather.wind_speed} m/s. வாழை அல்லது கரும்பு போன்ற உயரமான பயிர்களுக்கு முட்டு கொடுக்கவும்.</p>
                      </div>
                    </div>
                  )}
                  {weather.temperature < 15 && (
                    <div className="wx-warning-item cold">
                      <div className="wx-warning-icon">❄️</div>
                      <div className="wx-warning-text">
                        <strong>Cold Alert! / குளிர் எச்சரிக்கை!</strong>
                        <p>Low temp detected ({weather.temperature}°C). Protect sensitive seedlings from frost damage.</p>
                        <p className="tamil-text">குறைந்த வெப்பநிலை ({weather.temperature}°C). உறைபனி பாதிப்பிலிருந்து உணர்திறன் கொண்ட நாற்றுகளைப் பாதுகாக்கவும்.</p>
                      </div>
                    </div>
                  )}
                  {! (weather.temperature > 35 || weather.rain_probability > 70 || weather.wind_speed > 10 || weather.temperature < 15) && (
                    <div className="wx-warning-item safe">
                      <div className="wx-warning-icon">✅</div>
                      <div className="wx-warning-text">
                        <strong>All Systems Normal / அனைத்தும் இயல்பு</strong>
                        <p>No extreme weather warnings for your current location. Continue regular farming operations.</p>
                        <p className="tamil-text">உங்கள் தற்போதைய இடத்திற்கு தீவிர வானிலை எச்சரிக்கைகள் எதுவும் இல்லை. வழக்கமான விவசாயப் பணிகளைத் தொடரவும்.</p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="wx-placeholder">Get weather data to see active alerts.</div>
              )}
            </div>
          </div>

          {/* STAT GRID — always visible */}
          <div className="wx-card">
            <div className="wx-card-title">🌡 Current Conditions</div>
            {weather ? (
              <div className="wx-stats">
                <Stat icon="🌡" label="Temperature"  value={`${weather.temperature}°C`}          color="#f97316" bg="#fff7ed" />
                <Stat icon="💧" label="Humidity"     value={`${weather.humidity}%`}              color="#0ea5e9" bg="#f0f9ff" />
                <Stat icon="🌬" label="Wind Speed"   value={`${weather.wind_speed} m/s`}         color="#8b5cf6" bg="#f5f3ff" />
                <Stat icon="🧭" label="Direction"    value={getWindDir(weather.wind_direction)}  color="#10b981" bg="#ecfdf5" />
                <Stat icon="🌧" label="Rain Chance"  value={`${weather.rain_probability}%`}      color="#3b82f6" bg="#eff6ff" />
                {weather.feels_like != null &&
                  <Stat icon="🤔" label="Feels Like" value={`${weather.feels_like}°C`}           color="#ec4899" bg="#fdf2f8" />}
              </div>
            ) : (
              <div className="wx-placeholder">
                <div className="wx-ph-grid">
                  {["🌡 Temperature","💧 Humidity","🌬 Wind","🧭 Direction","🌧 Rain","🤔 Feels Like"].map(l => (
                    <div key={l} className="wx-ph-box">
                      <div className="wx-ph-bar" />
                      <div className="wx-ph-label">{l}</div>
                    </div>
                  ))}
                </div>
                <p className="wx-ph-msg">📍 Click the map & press <strong>Get Weather Data</strong></p>
              </div>
            )}
          </div>

          {/* FORECAST */}
          <div className="wx-card">
            <div className="wx-card-title">📅 7-Day Forecast</div>
            {forecast.length > 0 ? (
              <div className="wx-forecast">
                {forecast.map((day,i) => (
                  <div key={i} className="wx-fcard">
                    <div className="wx-fday">{day.day || `Day ${i+1}`}</div>
                    {day.icon && <img src={day.icon} alt="icon" className="wx-ficon" />}
                    <div className="wx-ftemp">{day.temp ?? "--"}°</div>
                    <div className="wx-fhum">💧 {day.humidity ?? "--"}%</div>
                    {day.rain != null && <div className="wx-frain">🌧 {day.rain}mm</div>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="wx-forecast">
                {[...Array(7)].map((_,i) => (
                  <div key={i} className="wx-fcard wx-fcard-ph">
                    <div className="wx-ph-day" />
                    <div className="wx-ph-circle" />
                    <div className="wx-ph-temp" />
                    <div className="wx-ph-hum" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CHARTS */}
          <div className="wx-card">
            <div className="wx-card-title">📈 Temperature Trend</div>
            {forecast.length > 0 ? (
              <Line data={tempData} options={chartOpts("#f97316")} />
            ) : (
              <div className="wx-chart-ph">
                <div className="wx-chart-ph-inner">📊 Chart will appear after fetching data</div>
              </div>
            )}
          </div>

          <div className="wx-chart-row">
            <div className="wx-card">
              <div className="wx-card-title">💧 Humidity</div>
              {forecast.length > 0 ? (
                <Bar data={humData} options={chartOpts("#0ea5e9")} />
              ) : (
                <div className="wx-chart-ph"><div className="wx-chart-ph-inner">💧 Humidity chart</div></div>
              )}
            </div>
            <div className="wx-card">
              <div className="wx-card-title">🌧 Rainfall</div>
              {forecast.length > 0 ? (
                <Bar data={rainData} options={chartOpts("#6366f1")} />
              ) : (
                <div className="wx-chart-ph"><div className="wx-chart-ph-inner">🌧 Rainfall chart</div></div>
              )}
            </div>
          </div>

          {/* AGRI CALENDAR */}
          <div className="wx-card">
            <div className="wx-card-title">📆 Seasonal Crop Calendar — Tamil Nadu</div>
            <div className="wx-calendar">
              {[
                { crop:"🌾 Paddy (Samba)",    season:"Aug – Jan",  status:"active",  tip:"Major season. Ensure consistent water supply." },
                { crop:"🌽 Maize",            season:"Jun – Sep",  status:"active",  tip:"Thrives in monsoon. Watch for stem borers." },
                { crop:"🍅 Tomato",           season:"Oct – Feb",  status:"upcoming",tip:"Cool weather improves fruit set." },
                { crop:"🧅 Onion",            season:"Nov – Mar",  status:"upcoming",tip:"Well-drained sandy loam is ideal." },
                { crop:"🌻 Sunflower",        season:"Sep – Dec",  status:"active",  tip:"Low water crop. Good for Cauvery delta." },
                { crop:"🫘 Groundnut",        season:"Jun – Oct",  status:"active",  tip:"Requires red loamy soil. Watch leaf spot." },
              ].map((c) => (
                <div key={c.crop} className="wx-cal-row">
                  <div className="wx-cal-crop">{c.crop}</div>
                  <div className={`wx-cal-badge wx-cal-${c.status}`}>{c.season}</div>
                  <div className="wx-cal-tip">{c.tip}</div>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default Weather;