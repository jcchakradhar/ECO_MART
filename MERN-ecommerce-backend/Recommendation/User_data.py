from pymongo import MongoClient
from dotenv import load_dotenv
from bson import ObjectId, Binary
from flask import Flask, request, jsonify, Blueprint
from datetime import datetime
import base64
import traceback
import os
import time

app = Flask(__name__)

load_dotenv()

profile = {}

mongo_uri = os.getenv("MONGO_URI") or os.getenv("Mongo_URI")
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

def _to_jsonable(value):
    """Recursively convert Mongo/BSON types to JSON-serializable values."""
    if isinstance(value, dict):
        return {k: _to_jsonable(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [_to_jsonable(v) for v in value]
    if isinstance(value, ObjectId):
        return str(value)
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, Binary):
        value = bytes(value)
    if isinstance(value, (bytes, bytearray)):
        try:
            return value.decode("utf-8")
        except Exception:
            return base64.b64encode(value).decode("ascii")
    return value
bp=Blueprint("user", __name__)
@bp.route('/api/user/me', methods=['GET'])
def get_current_user():
    # Example: get user_id from request header (adjust as needed for your auth)
    # user_id = request.headers.get("X-User-Id")
    # if not user_id:
    #     return jsonify({"error": "No user_id provided"}), 400
    # user = get_user_data(user_id)
    # # update module-level profile for use by other modules
    # global profile
    # profile = user or {}
    # if not user:
    #     return jsonify({"error": "User not found"}), 404
    # return jsonify(user)
    try:
        # Example: get user_id from request header (adjust as needed for your auth)
        user_id = request.headers.get("X-User-Id")
        if not user_id:
            return jsonify({"error": "No user_id provided"}), 400
        user = get_user_data(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        # update module-level profile with sanitized data and return
        global profile
        profile = _to_jsonable(user)
        return jsonify(profile)
    except Exception as e:
        # Surface details in development to diagnose 500s
        return jsonify({"error": "internal", "message": str(e)}), 500

@bp.route('/api/user/ping', methods=['GET'])
def user_ping():
    return jsonify({"ok": True, "header_user_id": request.headers.get("X-User-Id")})

@bp.route('/api/user/profile-debug', methods=['GET'])
def profile_debug():
    return jsonify(_to_jsonable(profile))

@bp.route('/api/user/sample-id', methods=['GET'])
def sample_user_id():
    try:
        doc = collection.find_one({}, {"_id": 1})
        if not doc:
            return jsonify({"error": "no_users"}), 404
        return jsonify({"_id": str(doc["_id"])})
    except Exception as e:
        return jsonify({"error": "internal", "message": str(e)}), 500
# Example usage (for testing, not for production)
if __name__ == "__main__":
    # Register the blueprint first

    # Print all routes
    print(app.url_map)

    # Run the Flask app
    app.run(debug=True)
