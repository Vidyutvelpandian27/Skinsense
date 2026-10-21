import os
from dotenv import load_dotenv

load_dotenv()


class Config:

    # --------------------------------------------------
    # Flask
    # --------------------------------------------------

    SECRET_KEY = os.getenv(
        "SECRET_KEY",
        "skinsense-secret-key"
    )

    DEBUG = os.getenv(
        "FLASK_DEBUG",
        "True"
    ).lower() == "true"


    # --------------------------------------------------
    # Server
    # --------------------------------------------------

    HOST = os.getenv(
        "HOST",
        "0.0.0.0"
    )

    PORT = int(
        os.getenv(
            "PORT",
            5000
        )
    )


    # --------------------------------------------------
    # MongoDB
    # --------------------------------------------------

    MONGODB_URI = os.getenv(
        "MONGODB_URI",
        "mongodb://localhost:27017"
    )

    MONGODB_DATABASE = os.getenv(
        "MONGODB_DATABASE",
        "skinsense"
    )

    ADMIN_EMAIL = os.getenv(
        "ADMIN_EMAIL",
        ""
    ).strip().lower()


    # --------------------------------------------------
    # Upload Configuration
    # --------------------------------------------------

    MAX_CONTENT_LENGTH = 5 * 1024 * 1024

    UPLOAD_FOLDER = os.getenv(
        "UPLOAD_FOLDER",
        "uploads"
    )

    ALLOWED_EXTENSIONS = {
        "jpg",
        "jpeg",
        "png",
        "webp"
    }


    # --------------------------------------------------
    # Image Analysis
    # --------------------------------------------------

    MIN_IMAGE_WIDTH = 224
    MIN_IMAGE_HEIGHT = 224

    IMAGE_ANALYSIS_TIMEOUT = 120


    # --------------------------------------------------
    # CORS
    # --------------------------------------------------

    FRONTEND_URL = os.getenv(
        "FRONTEND_URL",
        "http://localhost:5173"
    )


config = Config()