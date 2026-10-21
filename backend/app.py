from flask import Flask, jsonify
from flask_cors import CORS
from flask import send_from_directory
from dotenv import load_dotenv
import os

from config import config

# Load environment variables
load_dotenv()

# Create Flask application
app = Flask(__name__)

# Basic configuration
app.config["SECRET_KEY"] = os.getenv(
    "SECRET_KEY",
    "skinsense-secret-key"
)

app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024

# Enable CORS for React frontend
CORS(
    app,
    resources={
        r"/api/*": {
            "origins": "*"
        }
    }
)


# --------------------------------------------------
# Register Routes
# --------------------------------------------------

from routes.auth_routes import auth_bp
from routes.analysis_routes import analysis_bp
from routes.recommendation_routes import recommendation_bp
from routes.product_routes import product_bp
from routes.history_routes import history_bp
from routes.profile_routes import profile_bp


app.register_blueprint(
    auth_bp,
    url_prefix="/api/auth"
)

app.register_blueprint(
    analysis_bp,
    url_prefix="/api/analysis"
)

app.register_blueprint(
    recommendation_bp,
    url_prefix="/api/recommendations"
)

app.register_blueprint(
    product_bp,
    url_prefix="/api/products"
)

app.register_blueprint(
    history_bp,
    url_prefix="/api/history"
)

app.register_blueprint(
    profile_bp,
    url_prefix="/api/profile"
)


# --------------------------------------------------
# Basic Routes
# --------------------------------------------------

@app.route("/")
def home():
    return jsonify({
        "success": True,
        "message": "SkinSense Backend API is running."
    })


@app.route("/api/health")
def health_check():
    return jsonify({
        "success": True,
        "status": "healthy",
        "service": "SkinSense API"
    })


@app.route("/api/analysis/images/<path:filename>")
def analysis_image(filename):
    return send_from_directory(
        config.UPLOAD_FOLDER,
        filename
    )


# --------------------------------------------------
# Error Handlers
# --------------------------------------------------

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "success": False,
        "message": "API endpoint not found."
    }), 404


@app.errorhandler(413)
def file_too_large(error):
    return jsonify({
        "success": False,
        "message": "Uploaded file is too large. Maximum size is 5 MB."
    }), 413


@app.errorhandler(500)
def internal_server_error(error):
    return jsonify({
        "success": False,
        "message": "Internal server error."
    }), 500


# --------------------------------------------------
# Run Application
# --------------------------------------------------

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(
            os.getenv("PORT", 5000)
        ),
        debug=True
    )