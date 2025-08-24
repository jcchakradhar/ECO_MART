from pymongo import MongoClient
from dotenv import load_dotenv
from bson import ObjectId
from flask import Flask, request, jsonify
import os
import time

app = Flask(__name__)

load_dotenv()

profile = {}

mongo_uri = os.getenv("Mongo_URI")
client = MongoClient(mongo_uri)
db2 = client["test"]
collection = db2["users"]

# def get_user_data(user_id):
#     try:
#         user = collection.find_one({"_id": ObjectId(user_id)})
#     except Exception as e:
#         print("Invalid user_id:", e)
#         return None
#     if user is None:
#         print("User not found!")
#         return None
#     user["_id"] = str(user["_id"])  # Convert ObjectId to string for JSON
#     return user

user_cache = {}
user_cache_time = {}

CACHE_TTL = 30  # seconds

def get_user_data(user_id):
    now = time.time()
    # Check if user is cached and not expired
    if user_id in user_cache and now - user_cache_time[user_id] < CACHE_TTL:
        return user_cache[user_id]
    # Otherwise, fetch from DB
    try:
        user = collection.find_one({"_id": ObjectId(user_id)})
    except Exception as e:
        print("Invalid user_id:", e)
        return None
    if user is None:
        print("User not found!")
        return None
    user["_id"] = str(user["_id"])
    # Cache the result
    user_cache[user_id] = user
    user_cache_time[user_id] = now
    return user

@app.route('/api/user/me', methods=['GET'])
def get_current_user():
    # Example: get user_id from request header (adjust as needed for your auth)
    user_id = request.headers.get("X-User-Id")
    if not user_id:
        return jsonify({"error": "No user_id provided"}), 400
    user = get_user_data(user_id)
    profile = user
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user)

# Example usage (for testing, not for production)
if __name__ == "__main__":
    # Run the Flask app
    app.run(debug=True)