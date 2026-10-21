from flask import Blueprint, request, jsonify

from services.recommendation_service import (
    get_recommendations,
    get_recommendation,
    get_recommendations_by_concern
)

recommendation_bp = Blueprint(
    "recommendations",
    __name__
)


@recommendation_bp.route(
    "/analysis/<analysis_id>",
    methods=["GET"]
)
def analysis_recommendations(
    analysis_id
):
    try:
        recommendations = (
            get_recommendations(
                analysis_id
            )
        )

        return jsonify({
            "success": True,
            "recommendations": recommendations
        }), 200

    except Exception as error:
        print(
            f"Recommendation error: {error}"
        )

        return jsonify({
            "success": False,
            "message":
                "Unable to retrieve recommendations."
        }), 500


@recommendation_bp.route(
    "/concern",
    methods=["GET"]
)
def concern_recommendations():
    try:
        concern = request.args.get(
            "concern"
        )

        if not concern:
            return jsonify({
                "success": False,
                "message": "Concern is required."
            }), 400

        recommendations = (
            get_recommendations_by_concern(
                concern
            )
        )

        return jsonify({
            "success": True,
            "recommendations": recommendations
        }), 200

    except Exception as error:
        print(
            f"Concern recommendation error: {error}"
        )

        return jsonify({
            "success": False,
            "message":
                "Unable to retrieve recommendations."
        }), 500


@recommendation_bp.route(
    "/<recommendation_id>",
    methods=["GET"]
)
def single_recommendation(
    recommendation_id
):
    try:
        recommendation = (
            get_recommendation(
                recommendation_id
            )
        )

        if not recommendation:
            return jsonify({
                "success": False,
                "message":
                    "Recommendation not found."
            }), 404

        return jsonify({
            "success": True,
            "recommendation":
                recommendation
        }), 200

    except Exception as error:
        print(
            f"Recommendation error: {error}"
        )

        return jsonify({
            "success": False,
            "message":
                "Unable to retrieve recommendation."
        }), 500