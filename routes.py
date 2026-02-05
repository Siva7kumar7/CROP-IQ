from flask import Blueprint, request, jsonify
from weather.predict import predict_rainfall
import logging

weather_bp = Blueprint("weather", __name__)
logger = logging.getLogger(__name__)

@weather_bp.route("/api/weather/predict", methods=["POST"])
def weather_predict():
    try:
        data = request.get_json(silent=True)
        if not data:
            return jsonify({
                "success": False,
                "error": "Request body missing"
            }), 400

        lat = data.get("lat")
        lon = data.get("lon")

        if lat is None or lon is None:
            return jsonify({
                "success": False,
                "error": "Latitude and longitude required"
            }), 400

        result = predict_rainfall(float(lat), float(lon))

        # ✅ result is a dict → safe
        return jsonify(result), 200

    except Exception as e:
        logger.exception("Weather route error")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 200
