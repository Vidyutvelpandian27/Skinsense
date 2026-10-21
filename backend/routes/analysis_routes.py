from flask import Blueprint, request, jsonify

from services.analysis_service import (
    analyze_skin,
    get_analysis
)
from middleware.auth import require_auth
from flask import g

analysis_bp = Blueprint(
    "analysis",
    __name__
)


@analysis_bp.route(
    "",
    methods=["POST"]
)
@require_auth()
def create_analysis():
    try:
        if "image" not in request.files:
            return jsonify({
                "success": False,
                "message": "No image uploaded."
            }), 400

        image = request.files["image"]

        if image.filename == "":
            return jsonify({
                "success": False,
                "message": "Please select an image."
            }), 400

        result = analyze_skin(
            image,
            g.auth_user["user_id"]
        )

        return jsonify({
            "success": True,
            "message": "Skin analysis completed.",
            "analysis": result
        }), 200

    except ValueError as error:
        return jsonify({
            "success": False,
            "message": str(error)
        }), 400

    except Exception as error:
        print(f"Analysis error: {error}")

        return jsonify({
            "success": False,
            "message": "Unable to analyze the image."
        }), 500


@analysis_bp.route(
    "/<analysis_id>",
    methods=["GET"]
)
@require_auth()
def fetch_analysis(analysis_id):
    try:
        result = get_analysis(
            analysis_id,
            g.auth_user["user_id"]
        )

        if not result:
            return jsonify({
                "success": False,
                "message": "Analysis not found."
            }), 404

        return jsonify({
            "success": True,
            "analysis": result
        }), 200

    except Exception as error:
        print(
            f"Get analysis error: {error}"
        )

        return jsonify({
            "success": False,
            "message": "Unable to retrieve analysis."
        }), 500