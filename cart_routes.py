from flask import Blueprint, request, jsonify
from db import cart_collection

cart_bp = Blueprint("cart", __name__)

# TEMP user (replace with real auth later)
USER_ID = "user123"


# 🟢 Get Cart
@cart_bp.route("/cart", methods=["GET"])
def get_cart():
    cart = cart_collection.find_one({"userId": USER_ID}, {"_id": 0})
    return jsonify(cart or {"userId": USER_ID, "items": []})


# 🟢 Add to Cart
@cart_bp.route("/cart/add", methods=["POST"])
def add_to_cart():
    data = request.json
    product = data["product"]

    cart = cart_collection.find_one({"userId": USER_ID})

    if not cart:
        cart_collection.insert_one({
            "userId": USER_ID,
            "items": [{**product, "quantity": 1}]
        })
        return jsonify({"message": "Added to cart"})

    for item in cart["items"]:
        if item["productId"] == product["productId"]:
            cart_collection.update_one(
                {"userId": USER_ID, "items.productId": product["productId"]},
                {"$inc": {"items.$.quantity": 1}}
            )
            return jsonify({"message": "Quantity increased"})

    cart_collection.update_one(
        {"userId": USER_ID},
        {"$push": {"items": {**product, "quantity": 1}}}
    )

    return jsonify({"message": "Added to cart"})


# 🔴 Remove Item
@cart_bp.route("/cart/remove/<product_id>", methods=["DELETE"])
def remove_item(product_id):
    cart_collection.update_one(
        {"userId": USER_ID},
        {"$pull": {"items": {"productId": product_id}}}
    )
    return jsonify({"message": "Item removed"})


# 🔄 Update Quantity
@cart_bp.route("/cart/update", methods=["PUT"])
def update_qty():
    data = request.json
    cart_collection.update_one(
        {"userId": USER_ID, "items.productId": data["productId"]},
        {"$set": {"items.$.quantity": data["quantity"]}}
    )
    return jsonify({"message": "Quantity updated"})


# 🧹 Clear Cart (after checkout)
@cart_bp.route("/cart/clear", methods=["DELETE"])
def clear_cart():
    cart_collection.update_one(
        {"userId": USER_ID},
        {"$set": {"items": []}}
    )
    return jsonify({"message": "Cart cleared"})
