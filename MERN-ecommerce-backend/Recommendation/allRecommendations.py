from flask import Blueprint, jsonify
from recommendation.User_data import get_current_user, profile
from recommendation.workable_data import workable_dataset
from recommendation.Existing_User_home_page import user_home_page_recommendations

bp = Blueprint("recommendations", __name__)

@bp.route("/api/recommendations/home", methods=["GET"])
def get_home_page_recommendations():
    get_current_user()
    data = user_home_page_recommendations(profile, workable_dataset)
    try:
        data = data.tolist()
    except AttributeError:
        pass
    if isinstance(data, dict):
        data = {k: (v.tolist() if hasattr(v, "tolist") else v) for k, v in data.items()}
    return jsonify(data)