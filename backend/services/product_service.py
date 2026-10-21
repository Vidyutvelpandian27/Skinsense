import re
from datetime import datetime, timezone

from database.db import as_id, get_collection, new_id, serialize


def create_product(data):
    """Create a product document from validated administrator input."""
    name = str(data.get("name", "")).strip()
    if not name:
        raise ValueError("Product name is required.")

    price = data.get("price") or None
    try:
        if price is not None:
            price = float(price)
            if price < 0:
                raise ValueError
    except (TypeError, ValueError):
        raise ValueError("Price must be a non-negative number.")

    now = datetime.now(timezone.utc)
    product = {
        "_id": as_id(new_id()),
        "name": name,
        "brand": str(data.get("brand", "")).strip() or "SkinSense",
        "category": str(data.get("category", "")).strip() or "Skincare",
        "description": str(data.get("description", "")).strip() or None,
        "ingredients": str(data.get("ingredients", "")).strip() or None,
        "skin_type": str(data.get("skin_type", "")).strip() or None,
        "price": price,
        "product_url": str(data.get("product_url", "")).strip() or None,
        "image_url": str(data.get("image_url", "")).strip() or None,
        "concern": str(data.get("concern", "")).strip() or None,
        "is_active": True,
        "created_at": now,
        "updated_at": now,
    }
    get_collection("products").insert_one(product)
    return serialize(product)


def update_product_image(product_id, image_url):
    products = get_collection("products")
    if not products.find_one({"_id": as_id(product_id)}):
        raise ValueError("Product not found.")
    products.update_one(
        {"_id": as_id(product_id)},
        {"$set": {
            "image_url": str(image_url or "").strip() or None,
            "updated_at": datetime.now(timezone.utc),
        }}
    )
    return get_product(product_id)


def _format_product(document, concern_name=None):
    product = serialize(document)
    if product and concern_name is not None:
        product["concern_name"] = concern_name
    return product


def get_products(params=None):
    params = params or {}
    query = {"is_active": {"$ne": False}}
    if params.get("category"):
        query["category"] = {"$regex": f"^{re.escape(str(params['category']))}$", "$options": "i"}
    if params.get("skin_type"):
        query["skin_type"] = {"$regex": re.escape(str(params["skin_type"])), "$options": "i"}
    products = get_collection("products").find(query).sort("name", 1)
    return [_format_product(product) for product in products]


def get_product(product_id):
    document = get_collection("products").find_one({"_id": as_id(product_id)})
    return _format_product(document) if document else None


def search_products(query):
    expression = re.escape(str(query).strip())
    if not expression:
        return []
    search_filter = {"$or": [
        {field: {"$regex": expression, "$options": "i"}}
        for field in ("name", "brand", "category", "description")
    ]}
    search_filter["is_active"] = {"$ne": False}
    products = get_collection("products").find(search_filter).sort("name", 1)
    return [_format_product(product) for product in products]


def get_products_by_concern(concern):
    query = {"concern": {"$regex": f"^{re.escape(str(concern))}$", "$options": "i"}, "is_active": {"$ne": False}}
    products = get_collection("products").find(query).sort("name", 1)
    return [_format_product(product, concern) for product in products]


def get_products_by_skin_type(skin_type):
    return get_products({"skin_type": skin_type})