import re
import jwt
from datetime import datetime, timedelta, timezone
from werkzeug.security import generate_password_hash, check_password_hash

from database.db import as_id, get_collection, new_id, serialize
from config import config


def validate_email(email):
    """Validate email format."""

    if not email:
        return False

    pattern = r"^[^\s@]+@[^\s@]+\.[^\s@]+$"

    return re.match(pattern, email) is not None


def register_user(data):
    """Register a new SkinSense user."""

    name = str(data.get("full_name", data.get("name", ""))).strip()
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))

    if not name:
        raise ValueError("Name is required.")

    if not validate_email(email):
        raise ValueError("A valid email is required.")

    if len(password) < 6:
        raise ValueError(
            "Password must contain at least 6 characters."
        )

    users = get_collection("users")
    users.create_index("email", unique=True)
    existing_user = users.find_one({"email": email})

    if existing_user:
        raise ValueError(
            "An account with this email already exists."
        )

    password_hash = generate_password_hash(password)

    user_id = new_id()
    users.insert_one({
        "_id": as_id(user_id),
        "full_name": name,
        "email": email,
        "password": password_hash,
        "profile_image": None,
        "role": "admin" if email == config.ADMIN_EMAIL else "user",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    })

    return {
        "id": user_id,
        "name": name,
        "email": email,
        "role": "admin" if email == config.ADMIN_EMAIL else "user"
    }


def login_user(email, password):
    """Authenticate a user and generate JWT token."""

    email = str(email or "").strip().lower()
    password = str(password or "")

    if not validate_email(email):
        raise ValueError("Invalid email.")

    if not password:
        raise ValueError("Password is required.")

    stored_user = get_collection("users").find_one({"email": email})
    user = serialize(stored_user)
    if user:
        user["name"] = user.pop("full_name", "")
        user["password_hash"] = user.pop("password", "")

    if not user:
        raise ValueError(
            "Invalid email or password."
        )

    if not check_password_hash(
        user["password_hash"],
        password
    ):
        raise ValueError(
            "Invalid email or password."
        )

    payload = {
        "user_id": user["id"],
        "email": user["email"],
        "role": user.get("role", "user"),
        "exp": datetime.now(
            timezone.utc
        ) + timedelta(hours=24)
    }

    token = jwt.encode(
        payload,
        config.SECRET_KEY,
        algorithm="HS256"
    )

    return {
        "token": token,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "profile_image": user["profile_image"],
            "role": user.get("role", "user")
        }
    }