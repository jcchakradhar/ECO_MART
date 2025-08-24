from User_data import get_current_user, profile
from workable_data import workable_dataset
from Existing_User_home_page import user_home_page_recommendations
from flask import jsonify,Blueprint 

bp = Blueprint("recommendations", __name__)

get_current_user()
user_profile = profile 

# @bp.route("/api/recommendations/home", methods=["GET"]
def get_home_page_recommendations():
    data = user_home_page_recommendations(user_profile, workable_dataset)
    return jsonify(data)
    

