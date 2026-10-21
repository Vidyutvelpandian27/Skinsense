from flask import Blueprint, request, jsonify

from services.history_service import (
    get_history,
    get_history_item,
    delete_history,
    clear_history,
    get_latest_history
)
from middleware.auth import require_auth
from flask import g

history_bp = Blueprint(
    "history",
    __name__
)


@history_bp.route(
    "",
    methods=["GET"]
)
@require_auth()
def history():
    try:
        result = get_history(
            g.auth_user["user_id"]
        )

        return jsonify({
            "success": True,
            "history": result
        }), 200

    except Exception as error:
        print(
            f"History error: {error}"
        )

        return jsonify({
            "success": False,
            "message":
                "Unable to retrieve history."
        }), 500


@history_bp.route(
    "/latest",
    methods=["GET"]
)
@require_auth()
def latest_history():
    try:
        result = get_latest_history(
            g.auth_user["user_id"]
        )

        if not result:
            return jsonify({
                "success": True,
                "history": None
            }), 200

        return jsonify({
            "success": True,
            "history": result
        }), 200

    except Exception as error:
        print(
            f"Latest history error: {error}"
        )

        return jsonify({
            "success": False,
            "message":
                "Unable to retrieve latest analysis."
        }), 500


@history_bp.route(
    "/<history_id>",
    methods=["GET"]
)
@require_auth()
def history_item(history_id):
    try:
        result = get_history_item(history_id)

        if result and result.get("user_id") != g.auth_user["user_id"]:
            result = None

        if not result:
            return jsonify({
                "success": False,
                "message":
                    "History record not found."
            }), 404

        return jsonify({
            "success": True,
            "history": result
        }), 200

    except Exception as error:
        print(
            f"History item error: {error}"
        )

        return jsonify({
            "success": False,
            "message":
                "Unable to retrieve history."
        }), 500


@history_bp.route(
    "/<history_id>",
    methods=["DELETE"]
)
@require_auth()
def remove_history(history_id):
    try:
        result = get_history_item(history_id)
        if not result or result.get("user_id") != g.auth_user["user_id"]:
            return jsonify({"success": False, "message": "Analysis not found."}), 404
        delete_history(history_id)

        return jsonify({
            "success": True,
            "message":
                "Analysis deleted successfully."
        }), 200

    except Exception as error:
        print(
            f"Delete history error: {error}"
        )

        return jsonify({
            "success": False,
            "message":
                "Unable to delete analysis."
        }), 500


@history_bp.route(
    "",
    methods=["DELETE"]
)
@require_auth()
def remove_all_history():
    try:
        clear_history(
            g.auth_user["user_id"]
        )

        return jsonify({
            "success": True,
            "message":
                "Analysis history cleared."
        }), 200

    except Exception as error:
        print(
            f"Clear history error: {error}"
        )

        return jsonify({
            "success": False,
            "message":
                "Unable to clear history."
        }), 500