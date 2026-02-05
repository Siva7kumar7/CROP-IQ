import os
import numpy as np
import joblib
import requests
from datetime import datetime
from flask import Blueprint, request, jsonify

# ==================================================
# 📁 PATH CONFIG
# ==================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")

RF_MODEL_PATH = os.path.join(MODEL_DIR, "rain_rf.pkl")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler.pkl")
CITY_ENCODER_PATH = os.path.join(MODEL_DIR, "city_encoder.pkl")

# ==================================================
# 🔑 API KEY
# ==================================================
API_KEY = "1b09d0bfc92c612b9635e2482831ddc9"

# ==================================================
# 🌐 BLUEPRINT
# ==================================================
weather_bp = Blueprint("weather", __name__)

# ==================================================
# 🤖 LOAD ML MODELS
# ==================================================
rf_model = None
scaler = None
city_encoder = None

try:
    rf_model = joblib.load(RF_MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    city_encoder = joblib.load(CITY_ENCODER_PATH)
    print("✅ Rainfall ML models loaded successfully")
except Exception as e:
    print("❌ Failed to load ML models:", e)

# ==================================================
# 🌧 WEATHER PREDICTION API
# ==================================================
@weather_bp.route("/api/weather/predict", methods=["POST"])
def predict_rainfall(lat, lon):
    try:
        # --- weather API call ---
        weather_data = get_current_weather(lat=lat, lon=lon)
        if not weather_data:
            return {
                "success": False,
                "error": "Weather API failed"
            }

        # --- build feature vector ---
        X = build_features(weather_data)   # your feature logic here
        X_scaled = scaler.transform(X)

        prob = model.predict(X_scaled)[0][0] * 100

        alert = (
            "🌧 Heavy Rain Expected" if prob > 70 else
            "🌦 Moderate Rain Possible" if prob > 40 else
            "🌤 No Rain Expected"
        )

        return {
            "success": True,
            "city": weather_data["city"],
            "rain_probability": round(prob, 1),
            "alert": alert
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

# ==================================================
# 📅 7-DAY FORECAST API
# ==================================================
@weather_bp.route("/api/weather/forecast", methods=["POST"])
def forecast_weather():
    try:
        data = request.json
        lat = data.get("lat")
        lon = data.get("lon")

        forecast_url = (
            f"https://api.openweathermap.org/data/2.5/forecast"
            f"?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"
        )

        res = requests.get(forecast_url, timeout=5).json()
        forecast_list = res["list"]

        daily = {}

        for item in forecast_list:
            date = item["dt_txt"].split(" ")[0]

            if date not in daily:
                daily[date] = {
                    "temp": [],
                    "humidity": [],
                    "icon": item["weather"][0]["icon"]
                }

            daily[date]["temp"].append(item["main"]["temp"])
            daily[date]["humidity"].append(item["main"]["humidity"])

        forecast = []
        for date, values in list(daily.items())[:7]:
            forecast.append({
                "day": datetime.strptime(date, "%Y-%m-%d").strftime("%A"),
                "temp": round(sum(values["temp"]) / len(values["temp"]), 1),
                "humidity": int(sum(values["humidity"]) / len(values["humidity"])),
                "icon": f"https://openweathermap.org/img/wn/{values['icon']}@2x.png"
            })

        return jsonify(forecast)

    except Exception as e:
        print("❌ Forecast error:", e)
        return jsonify({"error": "Forecast failed"}), 500
