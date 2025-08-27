from flask import Blueprint, jsonify, request
from . import User_data as user_data
from .workable_data import workable_dataset
from .Existing_User_home_page import user_home_page_recommendations

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