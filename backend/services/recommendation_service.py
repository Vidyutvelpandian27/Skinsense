from database.db import as_id, get_collection, serialize
from services.product_service import get_products_by_concern


PARAMETER_CONCERNS = {
    "dryness_score": "Dryness",
    "oiliness_score": "Oiliness",
    "dark_spots_score": "Dark Spots",
    "redness_score": "Redness",
    "wrinkles_score": "Wrinkles",
    "texture_score": "Texture",
    "pimple_score": "Pimples",
    "skin_tone_score": "Skin Tone",
    "tone_uniformity_score": "Tone Uniformity",
}


def get_recommendations_for_parameters(parameters):
    """Find products tagged for parameter scores below the recommendation threshold."""
    recommendations = []
    for parameter, concern in PARAMETER_CONCERNS.items():
        try:
            score = float(parameters.get(parameter, 100) or 0)
        except (TypeError, ValueError):
            continue
        if score >= 60:
            continue
        severity = "High" if score < 40 else "Medium"
        matching_products = get_products_by_concern(concern)
        shown = 0
        for product in matching_products:
            ingredients = product.get("ingredients")
            if not ingredients or not str(ingredients).strip():
                continue
            recommendations.append({
                **product,
                "product_id": product["id"],
                "product_name": product["name"],
                "title": f"Support your {concern.lower()} care",
                "priority": severity,
            })
            shown += 1
            if shown == 5:
                break
    return recommendations


def get_recommendations(analysis_id):
    report = get_collection("reports").find_one({"_id": as_id(analysis_id)})
    if not report:
        return []
    return get_recommendations_for_parameters(report.get("parameters", {}))


def get_recommendation(recommendation_id):
    product = get_collection("products").find_one({"_id": as_id(recommendation_id)})
    if not product:
        return None
    result = serialize(product)
    result.update({
        "product_id": result["id"],
        "product_name": result.get("name"),
        "title": result.get("name"),
        "priority": "Recommended",
    })
    return result


def get_recommendations_by_concern(concern):
    return get_products_by_concern(concern)