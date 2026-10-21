from flask import Blueprint, request, jsonify

from services.profile_service import (
    get_profile,
    update_profile,
    update_name,
    update_email,
    get_profile_stats
)
from middleware.auth import require_auth
from flask import g

profile_bp = Blueprint(
    "profile",
    __name__
)


@profile_bp.route(
    "",
    methods=["GET"]
)
@require_auth()
def profile():
    try:
        result = get_profile(g.auth_user["user_id"])

        if not result:
            return jsonify({
                "success": False,
                "message":
                    "Profile not found."
            }), 404

        return jsonify({
            "success": True,
            "profile": result
        }), 200

    except Exception as error:
        print(
            f"Profile error: {error}"
        )

        return jsonify({
            "success": False,
            "message":
                "Unable to retrieve profile."
        }), 500


@profile_bp.route(
    "",
    methods=["PUT"]
)
@require_auth()
def update():
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message":
                    "Profile data is required."
            }), 400

        result = update_profile(
            g.auth_user["user_id"],
            data
        )

        return jsonify({
            "success": True,
            "message":
                "Profile updated successfully.",
            "profile": result
        }), 200

    except ValueError as error:
        return jsonify({
            "success": False,
            "message": str(error)
        }), 400

    except Exception as error:
        print(
            f"Update profile error: {error}"
        )

        return jsonify({
            "success": False,
            "message":
                "Unable to update profile."
        }), 500


@profile_bp.route(
    "/name",
    methods=["PUT"]
)
@require_auth()
def change_name():
    try:
        data = request.get_json()

        name = data.get(
            "name"
        )

        if not name:
            return jsonify({
                "success": False,
                "message":
                    "User ID and name are required."
            }), 400

        result = update_name(
            g.auth_user["user_id"],
            name
        )

        return jsonify({
            "success": True,
            "message":
                "Name updated successfully.",
            "profile": result
        }), 200

    except ValueError as error:
        return jsonify({
            "success": False,
            "message": str(error)
        }), 400

    except Exception as error:
        print(
            f"Name update error: {error}"
        )

        return jsonify({
            "success": False,
            "message":
                "Unable to update name."
        }), 500


@profile_bp.route(
    "/email",
    methods=["PUT"]
)
@require_auth()
def change_email():
    try:
        data = request.get_json()

        email = data.get(
            "email"
        )

        if not email:
            return jsonify({
                "success": False,
                "message":
                    "User ID and email are required."
            }), 400

        result = update_email(
            g.auth_user["user_id"],
            email
        )

        return jsonify({
            "success": True,
            "message":
                "Email updated successfully.",
            "profile": result
        }), 200

    except ValueError as error:
        return jsonify({
            "success": False,
            "message": str(error)
        }), 400

    except Exception as error:
        print(
            f"Email update error: {error}"
        )

        return jsonify({
            "success": False,
            "message":
                "Unable to update email."
        }), 500


@profile_bp.route(
    "/stats",
    methods=["GET"]
)
@require_auth()
def stats():
    try:
        result = get_profile_stats(
            g.auth_user["user_id"]
        )

        return jsonify({
            "success": True,
            "stats": result
        }), 200

    except Exception as error:
        print(
            f"Profile stats error: {error}"
        )

        return jsonify({
            "success": False,
            "message":
                "Unable to retrieve profile statistics."
        }), 500