from flask import Blueprint, jsonify, request
from . import User_data as user_data
from .workable_data import workable_dataset
from .Existing_User_home_page import user_home_page_recommendations
from .Existing_User_search import search_based_recommendation
from .Existing_User_cart import _to_jsonable, cart_alternatives
from .score_calculation import calculate_sustainability_metrics
from .user_profile_update import update_user_weights, update_price_tolerance

bp = Blueprint("recommendations", __name__)
@bp.route("/api/user/profile-debug", methods=["GET"])
def profile_debug():
    # Ensure profile is loaded from the request header
    resp = user_data.get_current_user()
    status_code = getattr(resp, "status_code", None)
    if status_code and status_code != 200:
        return resp

    # Return JSON-safe profile (json_safe_profile is defined later in this module)
    return jsonify(json_safe_profile(user_data.profile or {})), 200
@bp.route("/api/recommendations/home", methods=["GET"])
def get_home_page_recommendations():
    try:
        # ---- STEP 1: Extract user_id safely ----
        user_id = request.headers.get("X-User-Id") or request.args.get("X-User-Id")
        if not user_id:
            return jsonify({"error": "Missing X-User-Id header"}), 400

        # ---- STEP 2: Get current user ----
        resp = user_data.get_current_user(user_id)
        status = 200
        user_json = None

        # ---- STEP 3: Handle different return formats from get_current_user() ----
        if isinstance(resp, tuple):  # e.g. (Response, status)
            resp_obj, status = resp
            if hasattr(resp_obj, "get_json"):
                user_json = resp_obj.get_json(silent=True)
            elif isinstance(resp_obj, dict):
                user_json = resp_obj
            else:
                user_json = None

        elif hasattr(resp, "get_json"):  # e.g. Flask Response
            user_json = resp.get_json(silent=True)
            status = getattr(resp, "status_code", 200)

        elif isinstance(resp, dict):  # e.g. plain dict
            user_json = resp

        else:
            user_json = None

        # ---- DEBUG: To see what’s being returned ----
        print("DEBUG → resp type:", type(resp))
        print("DEBUG → user_json:", user_json)
        print("DEBUG → status:", status)

        # ---- STEP 4: Validate user_json ----
        if not user_json or not isinstance(user_json, dict) or status != 200:
            print("ERROR → invalid or missing user data:", user_json)
            return jsonify({"error": "User not found or invalid"}), status

        # ---- STEP 5: Extract profile from user_data module if available ----
        profile = getattr(user_data, "profile", None) or user_json

        # ---- STEP 6: Generate recommendations ----
        data = user_home_page_recommendations(profile, workable_dataset)

        # ---- STEP 7: Normalize output ----
        if data is None:
            data = []

        try:
            data = data.tolist()
        except Exception:
            pass

        if isinstance(data, dict):
            data = {k: (v.tolist() if hasattr(v, "tolist") else v) for k, v in data.items()}

        # ---- STEP 8: Return final response ----
        return jsonify(data), 200

    except Exception as e:
        print("ERROR in get_home_page_recommendations:", traceback.format_exc())
        return jsonify({"error": "internal", "message": str(e)}), 500


# ...existing code...
# ...existing code...
# ...existing code...

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

# @bp.route("/api/score/<product_id>/<group_delivery>", methods=["GET"])
# def get_product_score(product_id, group_delivery):
#     try:
#         resp = user_data.get_current_user()
#         if hasattr(resp, "status_code") and resp.status_code != 200:
#             return resp

#         # Call the function to calculate the score
#         result = calculate_sustainability_metrics(product_id, workable_dataset, group_delivery)
#         user_data[eco_score] += 
#         return jsonify(result), 200
#     except Exception as e:
#         return jsonify({"error": "internal", "message": str(e)}), 500
    
# ...existing code...
@bp.route("/api/score/<product_id>/<group_delivery>", methods=["GET"])
def get_product_score(product_id, group_delivery):
    try:
        # Ensure user is authenticated/profile loaded
        resp = user_data.get_current_user()
        if hasattr(resp, "status_code") and resp.status_code != 200:
            return resp
        # return jsonify(user_data.profile), 200  # early return for debugging
        # Find the product in workable_dataset
        df = workable_dataset
        if getattr(df, "empty", True):
            return jsonify({"error": "no products available"}), 404

        # Try both 'product_id' and '_id' columns
        product_row = None
        for col in ["product_id", "_id", "id"]:
            if col in df.columns:
                # Cast both sides to string for matching
                match = df[df[col].astype(str) == str(product_id)]
                if not match.empty:
                    product_row = match.iloc[0].to_dict()
                    break

        if not product_row:
            return jsonify({"error": "not_found", "message": "Product not found"}), 404

        # Parse group_delivery as bool
        group_delivery_bool = str(group_delivery).lower() in ["1", "true", "yes"]

        # Calculate sustainability metrics
        result = calculate_sustainability_metrics(product_row, df, group_delivery_bool)
        user_data.profile["eco_score"] = user_data.profile.get("eco_score", 0) + result.get("eco_score", 0)
        user_data.profile["water_score"] = user_data.profile.get("water_score", 0) + result.get("water_score", 0)
        user_data.profile["carbon_saved"] = user_data.profile.get("carbon_saved", 0) + result.get("carbon_saved", 0)
        user_data.profile["water_saved"] = user_data.profile.get("water_saved", 0) + result.get("water_saved", 0)
        # # Update module-level variables if they exist
        # user_data[eco_score] += result["eco_score"]
        # user_data[water_score] += result["water_score"]
        # user_data[carbon_saved] += result["carbon_saved"]
        # user_data[water_saved] += result["water_saved"]
        return jsonify(user_data.profile or []), 200

    except Exception as e:
        return jsonify({"error": "internal", "message": str(e)}), 500
# ...existing code...


def json_safe_profile(profile):
    import base64
    from bson import ObjectId, Binary
    from datetime import datetime

    def _to_jsonable(v):
        if isinstance(v, ObjectId):
            return str(v)
        if isinstance(v, (bytes, bytearray)):
            return base64.b64encode(v).decode("ascii")
        if isinstance(v, Binary):
            return base64.b64encode(bytes(v)).decode("ascii")
        if isinstance(v, datetime):
            return v.isoformat()
        return v

    # Recursively sanitize dicts and lists
    def sanitize(obj):
        if isinstance(obj, dict):
            return {k: sanitize(v) for k, v in obj.items()}
        if isinstance(obj, list):
            return [sanitize(v) for v in obj]
        return _to_jsonable(obj)

    return sanitize(profile)

@bp.route("/api/user/update-profile/<product_id>", methods=["GET","POST"])
def update_profile(product_id):
    """
    Updates the user's profile weights and price tolerance based on an action.
    Expects JSON body with:
      - product_id: ID of the product interacted with
      - action_type: "view", "add to cart", or "purchase"
    """
    try:
        resp = user_data.get_current_user()
        if hasattr(resp, "status_code") and resp.status_code != 200:
            return resp
        # payload = request.get_json(silent=True) or {}
        # product_id = payload.get("product_id")
        # action_type = payload.get("action_type", "purchase")
        if not product_id:
            return jsonify({"error": "bad_request", "message": "product_id is required"}), 400

        df = workable_dataset
        if getattr(df, "empty", True):
            return jsonify({"error": "no products available"}), 404

        # Find the product row
        product_row = None
        for col in ["product_id", "_id", "id"]:
            if col in df.columns:
                match = df[df[col].astype(str) == str(product_id)]
                if not match.empty:
                    product_row = match.iloc[0].to_dict()
                    break
        if not product_row:
            return jsonify({"error": "not_found", "message": "Product not found"}), 404

        # Calculate average price of user's purchased products
        purchased = user_data.profile.get("purchase_history", [])
        import pandas as pd
        purchased_df = pd.DataFrame(purchased, columns=["product_id"]) if purchased else pd.DataFrame()
        from .common_code import get_user_avg_price
        avg_price = get_user_avg_price(purchased_df, df)
        if avg_price is None:
        # Fallback: use mean price of all products
            if "price" in df.columns and not df["price"].empty:
                avg_price = float(df["price"].mean())
            else:
                avg_price = 1000.0
        def clean_profile(profile):
            import types
            return {k: v for k, v in profile.items() if not isinstance(v, types.ModuleType)}

        # Then use:
        # return jsonify(json_safe_profile(user_data.profile)), 200
        # temp = _to_jsonable(user_data.profile)
        # return jsonify(temp), 200  # early return for debugging
        # Update weights and price tolerance
        updated_profile = update_user_weights(user_data.profile, avg_price, product_row)
        # updated_profile = update_price_tolerance(updated_profile, product_row.get("price", 0), avg_price, action_type)

        # Save back to in-memory profile
        user_data.profile.update(updated_profile)

        return jsonify(user_data.profile), 200

    except Exception as e:
        return jsonify({"error": "internal", "message": str(e)}), 500