from flask import Blueprint, jsonify, request
from . import User_data as user_data
from .workable_data import workable_dataset
from .Existing_User_home_page import user_home_page_recommendations
from .Existing_User_search import search_based_recommendation
from .Existing_User_cart import cart_alternatives

bp = Blueprint("recommendations", __name__)
@bp.route("/api/user/profile-debug", methods=["GET"])
def profile_debug():
    # Returns the in-memory profile dict to verify it’s set
    return jsonify(user_data.profile)
@bp.route("/api/recommendations/home", methods=["GET"])
def get_home_page_recommendations():
    try:
        # Ensure profile is loaded; if header missing, this will 400 from get_current_user
        resp = user_data.get_current_user()
        status_code = getattr(resp, "status_code", None)
        if status_code and status_code != 200:
            return resp

        data = user_home_page_recommendations(user_data.profile, workable_dataset)
        try:
            data = data.tolist()
        except AttributeError:
            pass
        if isinstance(data, dict):
            data = {k: (v.tolist() if hasattr(v, "tolist") else v) for k, v in data.items()}
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": "internal", "message": str(e)}), 500

@bp.route("/api/recommendations/search", methods=["GET"])
def get_search_query_recommendations():
    try:
        resp = user_data.get_current_user()
        status_code = getattr(resp, "status_code", None)
        if status_code and status_code != 200:
            return resp

        query = request.args.get("query", "")
        if not query:
            return jsonify({"error": "missing query"}), 400

        # Call the search-based recommendation function
        res = search_based_recommendation(user_data.profile, query, workable_dataset)

        if not res:  # error throw if no results
            return jsonify({"error": "no recommendations found for given query"}), 404

        return jsonify(res), 200
    except Exception as e:
        return jsonify({"error": "internal", "message": str(e)}), 500
    
# ...existing code...
# ...existing code...
from bson import ObjectId

def _sample_product_id():
    df = workable_dataset
    if getattr(df, "empty", True):
        return None
    for col in ["product_id", "_id", "id"]:
        if col in df.columns:
            val = df[col].iloc[0]
            return str(val) if isinstance(val, ObjectId) else str(val)
    return None


@bp.route("/api/recommendations/cart/<product_id>", methods=["GET"])
def get_cart_recommendations_path(product_id):
    # Reuse the same logic by injecting product_id from path
    request.args = request.args.copy()
    # ensure downstream reads it
    request.args = request.args.to_dict()
    request.args["product_id"] = product_id
    return get_cart_recommendations()

@bp.route("/api/recommendations/cart", methods=["GET", "POST"])
def get_cart_recommendations():
    try:
        resp = user_data.get_current_user()
        if hasattr(resp, "status_code") and resp.status_code != 200:
            return resp

        payload = request.get_json(silent=True) or {}
        # accept both query string and JSON body
        product_id = payload.get("product_id") or request.args.get("product_id")
        if not product_id:
            return jsonify({"error": "bad_request", "message": "product_id is required"}), 400

        res = cart_alternatives(user_data.profile, product_id, workable_dataset, top_k=10)
        return jsonify(res or []), 200
    except Exception as e:
        return jsonify({"error": "internal", "message": str(e)}), 500
# ...existing code...