from flask import Blueprint, request, jsonify

from services.auth_services import (
    register_user,
    login_user
)

auth_bp = Blueprint(
    "auth",
    __name__
)


@auth_bp.route(
    "/register",
    methods=["POST"]
)
def register():
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "Request data is required."
            }), 400

        result = register_user(data)

        return jsonify({
            "success": True,
            "message": "User registered successfully.",
            "user": result
        }), 201

    except ValueError as error:
        return jsonify({
            "success": False,
            "message": str(error)
        }), 400

    except Exception as error:
        print(f"Registration error: {error}")

        return jsonify({
            "success": False,
            "message": f"Unable to register user: {error}"
        }), 500


@auth_bp.route(
    "/login",
    methods=["POST"]
)
def login():
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "Request data is required."
            }), 400

        result = login_user(
            data.get("email"),
            data.get("password")
        )

        return jsonify({
            "success": True,
            "message": "Login successful.",
            "token": result["token"],
            "user": result["user"]
        }), 200

    except ValueError as error:
        return jsonify({
            "success": False,
            "message": str(error)
        }), 401

    except Exception as error:
        print(f"Login error: {error}")

        return jsonify({
            "success": False,
            "message": "Unable to login."
        }), 500


@auth_bp.route(
    "/logout",
    methods=["POST"]
)
def logout():
    return jsonify({
        "success": True,
        "message": "Logout successful."
    }), 200