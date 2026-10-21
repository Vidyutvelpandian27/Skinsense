from functools import wraps

import jwt
from flask import request, jsonify, g

from config import config


def require_auth(admin_only=False):
    """Require a valid JWT and optionally an admin role."""
    def decorator(view):
        @wraps(view)
        def wrapped(*args, **kwargs):
            header = request.headers.get("Authorization", "")
            token = header.removeprefix("Bearer ").strip()

            if not token:
                return jsonify({
                    "success": False,
                    "message": "Authentication is required."
                }), 401

            try:
                claims = jwt.decode(
                    token,
                    config.SECRET_KEY,
                    algorithms=["HS256"]
                )
            except jwt.PyJWTError:
                return jsonify({
                    "success": False,
                    "message": "Invalid or expired authentication token."
                }), 401

            if admin_only and claims.get("role") != "admin":
                return jsonify({
                    "success": False,
                    "message": "Administrator access is required."
                }), 403

            g.auth_user = claims
            return view(*args, **kwargs)

        return wrapped
    return decorator
