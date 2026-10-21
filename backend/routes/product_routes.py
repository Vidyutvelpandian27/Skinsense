from flask import Blueprint, request, jsonify

from middleware.auth import require_auth

from services.product_service import (
    get_products,
    get_product,
    search_products,
    get_products_by_concern,
    get_products_by_skin_type,
    create_product,
    update_product_image
)

product_bp = Blueprint(
    "products",
    __name__
)


@product_bp.route("", methods=["POST"])
@require_auth(admin_only=True)
def add_product():
    try:
        data = request.get_json() or {}
        product = create_product(data)
        return jsonify({
            "success": True,
            "message": "Product added successfully.",
            "product": product
        }), 201
    except ValueError as error:
        return jsonify({"success": False, "message": str(error)}), 400
    except Exception as error:
        print(f"Product creation error: {error}")
        return jsonify({
            "success": False,
            "message": "Unable to add product."
        }), 500


@product_bp.route(
    "",
    methods=["GET"]
)
def products():
    try:
        result = get_products(
            request.args
        )

        return jsonify({
            "success": True,
            "products": result
        }), 200

    except Exception as error:
        print(
            f"Product error: {error}"
        )

        return jsonify({
            "success": False,
            "message":
                "Unable to retrieve products."
        }), 500


@product_bp.route(
    "/search",
    methods=["GET"]
)
def search():
    try:
        query = request.args.get(
            "q",
            ""
        )

        if not query:
            return jsonify({
                "success": False,
                "message":
                    "Search query is required."
            }), 400

        result = search_products(
            query
        )

        return jsonify({
            "success": True,
            "products": result
        }), 200

    except Exception as error:
        print(
            f"Product search error: {error}"
        )

        return jsonify({
            "success": False,
            "message":
                "Unable to search products."
        }), 500


@product_bp.route(
    "/concern",
    methods=["GET"]
)
def products_by_concern():
    try:
        concern = request.args.get(
            "concern"
        )

        if not concern:
            return jsonify({
                "success": False,
                "message":
                    "Concern is required."
            }), 400

        result = get_products_by_concern(
            concern
        )

        return jsonify({
            "success": True,
            "products": result
        }), 200

    except Exception as error:
        print(
            f"Concern product error: {error}"
        )

        return jsonify({
            "success": False,
            "message":
                "Unable to retrieve products."
        }), 500


@product_bp.route(
    "/skin-type",
    methods=["GET"]
)
def products_by_skin_type():
    try:
        skin_type = request.args.get(
            "skin_type"
        )

        if not skin_type:
            return jsonify({
                "success": False,
                "message":
                    "Skin type is required."
            }), 400

        result = get_products_by_skin_type(
            skin_type
        )

        return jsonify({
            "success": True,
            "products": result
        }), 200

    except Exception as error:
        print(
            f"Skin type product error: {error}"
        )

        return jsonify({
            "success": False,
            "message":
                "Unable to retrieve products."
        }), 500


@product_bp.route(
    "/<product_id>",
    methods=["PUT"]
)
@require_auth(admin_only=True)
def edit_product_image(product_id):
    try:
        data = request.get_json() or {}
        product = update_product_image(product_id, data.get("image_url"))
        return jsonify({"success": True, "product": product}), 200
    except ValueError as error:
        return jsonify({"success": False, "message": str(error)}), 400
    except Exception as error:
        print(f"Product image update error: {error}")
        return jsonify({"success": False, "message": "Unable to update product image."}), 500


@product_bp.route(
    "/<product_id>",
    methods=["GET"]
)
def single_product(product_id):
    try:
        result = get_product(
            product_id
        )

        if not result:
            return jsonify({
                "success": False,
                "message":
                    "Product not found."
            }), 404

        return jsonify({
            "success": True,
            "product": result
        }), 200

    except Exception as error:
        print(
            f"Single product error: {error}"
        )

        return jsonify({
            "success": False,
            "message":
                "Unable to retrieve product."
        }), 500