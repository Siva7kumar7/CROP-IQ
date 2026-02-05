from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from bson.objectid import ObjectId

# ================= DB CONNECTION =================
client = MongoClient("mongodb://localhost:27017/")
db = client["agriverse"]
products_col = db["products"]

# ================= BLUEPRINT =================
products_bp = Blueprint("products", __name__)

# =================================================
# ➕ ADD PRODUCT (Farmer uploads product)
# =================================================
@products_bp.route("/api/products/add", methods=["POST"])
def add_product():
    data = request.json

    product = {
        "name": data.get("name"),
        "price": data.get("price"),
        "quantity": data.get("quantity"),
        "category": data.get("category"),
        "location": data.get("location"),
        "image": data.get("image"),
        "farmerId": ObjectId(data.get("farmerId"))  # 🔑 LOGIN BASED
    }

    products_col.insert_one(product)
    return jsonify({"message": "Product added successfully"}), 201


# =================================================
# 🛒 GET ALL PRODUCTS (Marketplace – buyers)
# =================================================
@products_bp.route("/api/products", methods=["GET"])
def get_all_products():
    products = []

    for p in products_col.find():
        p["_id"] = str(p["_id"])
        p["farmerId"] = str(p["farmerId"])
        products.append(p)

    return jsonify(products), 200


# =================================================
# 👨‍🌾 GET PRODUCTS BY FARMER ID (Dashboard)
# =================================================
@products_bp.route("/api/products/farmer/<farmer_id>", methods=["GET"])
def get_farmer_products(farmer_id):
    products = list(
        products_col.find(
            {"farmerId": ObjectId(farmer_id)}
        )
    )

    for p in products:
        p["_id"] = str(p["_id"])
        p["farmerId"] = str(p["farmerId"])

    return jsonify(products), 200


# =================================================
# ✏️ UPDATE PRODUCT (Edit)
# =================================================
@products_bp.route("/api/products/update/<product_id>", methods=["PUT"])
def update_product(product_id):
    data = request.json

    products_col.update_one(
        {"_id": ObjectId(product_id)},
        {"$set": {
            "name": data.get("name"),
            "price": data.get("price"),
            "quantity": data.get("quantity"),
            "category": data.get("category"),
            "location": data.get("location"),
        }}
    )

    return jsonify({"message": "Product updated successfully"}), 200


# =================================================
# ❌ DELETE PRODUCT
# =================================================
@products_bp.route("/api/products/delete/<product_id>", methods=["DELETE"])
def delete_product(product_id):
    products_col.delete_one({"_id": ObjectId(product_id)})
    return jsonify({"message": "Product deleted successfully"}), 200
