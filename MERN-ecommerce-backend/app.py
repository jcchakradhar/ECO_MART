from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SESSION_KEY", "change-me")
CORS(app, supports_credentials=True)

# Register recommendations blueprint
from recommendation.allRecommendations import bp as recommendations_bp
app.register_blueprint(recommendations_bp)

@app.get("/health")
def health():
    return jsonify(status="ok"), 200