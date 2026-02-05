import os
import sys
import logging
import cv2
import numpy as np
import tensorflow as tf
import joblib
import json
from flask_cors import cross_origin
from flask_bcrypt import Bcrypt
from pymongo import MongoClient
from flask import Flask, request, jsonify
from flask_cors import CORS
from cart_routes import cart_bp
from products_routes import products_bp
from weather.routes import weather_bp
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

# =====================================================
# PATH SETUP
# =====================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# =====================================================
# LOGGING SETUP
# =====================================================
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# =====================================================
# FLASK APP
# =====================================================
app = Flask(__name__)
CORS(app)
bcrypt = Bcrypt(app)

app.register_blueprint(weather_bp, url_prefix="/api")
app.register_blueprint(cart_bp, url_prefix="/api")
app.register_blueprint(products_bp, url_prefix="/api")

#database 
client = MongoClient("mongodb://localhost:27017/")
db = client["agriverse_db"]
users = db["users"]
products = db["products"]
cart_collection = db["carts"]


# =====================================================
# IMPORT WEATHER MODULE
# =====================================================

@app.route('/api/weather/forecast', methods=['POST'])
@cross_origin()
def forecast_weather():
    data = request.json
    # Process forecast data here
    return jsonify({"forecast": "sunny"})

@app.route("/api/products/update/<id>", methods=["PUT"])
def update_product(id):
    data = request.json

    products.update_one(
        {"_id": ObjectId(id)},
        {"$set": {
            "price": data["price"],
            "quantity": data["quantity"],
            "category": data["category"],
            "location": data["location"]
        }}
    )

    return jsonify({"message": "Product updated successfully"})


@app.route("/api/register", methods=["POST"])
def register():
    data = request.json

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role")

    # Check existing user
    if users.find_one({"email": email}):
        return jsonify({"message": "User already exists"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

    users.insert_one({
        "name": name,
        "email": email,
        "password": hashed_password,
        "role": role
    })

    return jsonify({"message": "Registration successful"})

@app.route("/api/login", methods=["POST"])
def login():
    data = request.json

    email = data.get("email")
    password = data.get("password")
    role = data.get("role")

    user = users.find_one({"email": email, "role": role})

    if user and bcrypt.check_password_hash(user["password"], password):
        return jsonify({
            "message": "Login successful",
            "name": user["name"],
            "role": user["role"]
        })
    else:
        return jsonify({"message": "Invalid credentials"}), 401
    
@app.route("/api/products/add", methods=["POST"])
def add_product():
    data = request.json

    product = {
        "name": data["name"],
        "price": data["price"],
        "quantity": data["quantity"],
        "location": data["location"],
        "image": data["image"],  # base64
        "farmer": data["farmer"]
    }

    products.insert_one(product)
    return jsonify({"message": "Product added successfully"})

@app.route("/api/products", methods=["GET"])
def get_products():
    product_list = []

    for p in products.find():
        p["_id"] = str(p["_id"])  # Mongo ObjectId fix
        product_list.append(p)

    return jsonify(product_list)


# =====================================================
# PLANT DISEASE MODEL PATHS
# =====================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "plant_disease")

CNN_MODEL_PATH = os.path.join(MODEL_DIR, "plant_disease_classifier.h5")
SVM_MODEL_PATH = os.path.join(MODEL_DIR, "svm_classifier.pkl")
SCALER_PATH = os.path.join(MODEL_DIR, "svm_scaler.pkl")
SEVERITY_MODEL_PATH = os.path.join(MODEL_DIR, "severity_regressor.pkl")

AGRI_KNOWLEDGE_PATH = os.path.join(MODEL_DIR,"agri_knowledge.json")
CLASS_INDICES_PATH = os.path.join(MODEL_DIR,"class_indices.json")

IMG_SIZE = (224, 224)
CONF_THRESHOLD = 0.5

# =====================================================
# LOAD PLANT DISEASE MODELS
# =====================================================
logger.info("🌿 Loading plant disease models...")

cnn_model = tf.keras.models.load_model(CNN_MODEL_PATH, compile=False)
svm = joblib.load(SVM_MODEL_PATH)
scaler = joblib.load(SCALER_PATH)

print("🔍 Checking model path:", CNN_MODEL_PATH)
print("📁 Exists:", os.path.exists(CNN_MODEL_PATH))


severity_model = None
if os.path.exists(SEVERITY_MODEL_PATH):
    severity_model = joblib.load(SEVERITY_MODEL_PATH)

feature_extractor = tf.keras.Model(
    inputs=cnn_model.input,
    outputs=cnn_model.get_layer("feature_layer").output
)

logger.info("✅ Plant disease models loaded")

# =====================================================
# LOAD JSON DATA
# =====================================================
with open(AGRI_KNOWLEDGE_PATH) as f:
    agri_knowledge = json.load(f)

with open(CLASS_INDICES_PATH) as f:
    class_indices = json.load(f)

index_to_class = {v: k for k, v in class_indices.items()}

# =====================================================
# UTIL FUNCTIONS
# =====================================================
def preprocess_image(img):
    img = cv2.resize(img, IMG_SIZE)
    img = preprocess_input(img)
    img = np.expand_dims(img, axis=0)
    return img

def severity_label(percent):
    if percent >= 80:
        return "High"
    elif percent >= 60:
        return "Moderate"
    return "Low"

# =====================================================
# HEALTH CHECK
# =====================================================
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "OK",
        "message": "Backend running successfully"
    })

# =====================================================
# WEATHER PREDICTION API
# =====================================================
@app.route('/api/weather/predict', methods=['POST'])
def predict_weather():
    data = request.json
    # process data
    return jsonify({"prediction": "rain"})
# =====================================================
# PLANT DISEASE DETECTION API
# =====================================================
@app.route("/api/plant/detect", methods=["POST"])
def detect_plant_disease():
    try:
        if "image" not in request.files:
            return jsonify({"error": "No image uploaded"}), 400

        file = request.files["image"]
        path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(path)

        img = cv2.imread(path)
        if img is None:
            return jsonify({"error": "Invalid image"}), 400

        img_input = preprocess_image(img)

        # Feature extraction
        features = feature_extractor.predict(img_input, verbose=0)
        features_scaled = scaler.transform(features)

        # SVM prediction
        probs = svm.predict_proba(features_scaled)[0]
        class_id = int(np.argmax(probs))
        confidence = float(probs[class_id])

        if confidence < CONF_THRESHOLD:
            return jsonify({"error": "Leaf not detected clearly"}), 400

        disease = index_to_class[class_id]
        remedy = agri_knowledge[disease]["remedy"]
        fertilizer = agri_knowledge[disease]["fertilizer"]

        severity_percent = confidence * 100
        if severity_model:
            severity_percent = float(severity_model.predict(features)[0])

        response = {
            "disease": disease.replace("___", " - "),
            "severity": round(severity_percent, 1),
            "severity_level": severity_label(severity_percent),
            "fertilizer": fertilizer,
            "remedy": remedy,
            "confidence": round(confidence * 100, 2)
        }

        return jsonify(response)

    except Exception as e:
        logger.exception("Plant disease detection error")
        return jsonify({"error": str(e)}), 500

# =====================================================
# START SERVER
# =====================================================
if __name__ == "__main__":
    logger.info("🚀 Starting Flask Server on port 5000")
    app.run(host="0.0.0.0", port=5000, debug=True)
