from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")
db = client["agriverse"]

cart_collection = db["cart"]
product_collection = db["products"]
user_collection = db["users"]
