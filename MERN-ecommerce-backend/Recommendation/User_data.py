import logging
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
logger = logging.getLogger(__name__)

mongo_uri = os.getenv("MONGO_URI") or os.getenv("Mongo_URI")
client = MongoClient(mongo_uri)
db2 = client["test"]
collection = db2["users"]

user_cache = {}
user_cache_time = {}
CACHE_TTL = 30  # seconds

def get_user_data(user_id):
    now = time.time()
    if user_id in user_cache and now - user_cache_time[user_id] < CACHE_TTL:
        return user_cache[user_id]

    try:
        user = collection.find_one({"_id": ObjectId(user_id)})
    except Exception:
        return None

    if not user:
        return None

    user["_id"] = str(user["_id"])
    user_cache[user_id] = user
    user_cache_time[user_id] = now
    return user


def _to_jsonable(value):
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


bp = Blueprint("user", __name__)

 
@bp.route('/api/user/me', methods=['GET'])
def get_current_user(user_id=None):
    """Fetch current user data from header or explicit user_id."""
    global profile

    if user_id is None:
        user_id = request.headers.get("X-User-Id")

    if not user_id:
        return jsonify({"error": "Missing X-User-Id header"}), 400

    try:
        logger.debug("get_current_user called with user_id=%s type=%s", user_id, type(user_id))

        user = None

        # Try ObjectId conversion
        try:
            obj_id = ObjectId(user_id)
            logger.debug("Converted user_id to ObjectId: %s", obj_id)
            user = collection.find_one({"_id": obj_id})
            logger.debug("Query result by ObjectId: %s", user)
        except Exception as e:
            logger.debug("ObjectId conversion failed: %s", e)

        # Try string or email fallback
        if not user:
            user = collection.find_one({"_id": user_id})
            if not user:
                user = collection.find_one({"email": user_id})

        # Final decision
        if not user:
            logger.debug("User not found for identifier: %s", user_id)
            return jsonify({"error": "User not found"}), 404

        # Convert for JSON response
        user["_id"] = str(user["_id"])
        profile = _to_jsonable(dict(user))
        if "is_new_user" not in profile:
            profile["is_new_user"] = True

        logger.debug("User found: %s", profile.get("_id"))
        return jsonify(profile), 200

    except Exception as e:
        logger.exception("get_current_user error")
        return jsonify({"error": "Internal error", "message": str(e)}), 500



@bp.route('/api/user/ping', methods=['GET'])
def user_ping():
    return jsonify({"ok": True, "header_user_id": request.headers.get("X-User-Id")})


@bp.route('/api/user/profile-debug', methods=['GET'])
def profile_debug():
    user_id = request.headers.get("X-User-Id")
    if not user_id:
        return jsonify({"error": "Missing X-User-Id header"}), 400

    resp, status_code = get_current_user(user_id)
    if status_code != 200:
        return resp

    return resp


@bp.route('/api/user/sample-id', methods=['GET'])
def sample_user_id():
    try:
        doc = collection.find_one({}, {"_id": 1})
        if not doc:
            return jsonify({"error": "no_users"}), 404
        return jsonify({"_id": str(doc["_id"])})
    except Exception as e:
        return jsonify({"error": "internal", "message": str(e)}), 500


if __name__ == "__main__":
    app.register_blueprint(bp)
    app.run(debug=True)
