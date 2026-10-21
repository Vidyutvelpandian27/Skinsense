import os
import sys

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

def test_backend_bootstrap():
    try:
        import app
    except Exception as exc:  # pragma: no cover - this is the failure we want to guard
        raise AssertionError(f"Backend bootstrap failed: {exc}")

    assert hasattr(app, "app")
    assert app.app.test_client().get("/api/health").status_code == 200


def test_mongodb_identifier_serialization():
    from database.db import as_id, new_id, serialize

    identifier = new_id()
    assert str(as_id(identifier)) == identifier
    assert serialize({"_id": as_id(identifier), "name": "test"}) == {
        "id": identifier,
        "name": "test",
    }


def test_recommendations_only_include_products_with_ingredient_details(monkeypatch):
    from services import recommendation_service

    products = [
        {"id": "missing", "name": "No ingredient details", "ingredients": ""},
        *[
            {
                "id": f"product-{index}",
                "name": f"Product {index}",
                "ingredients": "Niacinamide",
                "concern": "Redness",
            }
            for index in range(6)
        ],
    ]
    monkeypatch.setattr(
        recommendation_service,
        "get_products_by_concern",
        lambda concern: products if concern == "Redness" else [],
    )

    recommendations = recommendation_service.get_recommendations_for_parameters(
        {"redness_score": 35}
    )

    assert len(recommendations) == 5
    assert all(item["ingredients"] == "Niacinamide" for item in recommendations)
    assert all(item["concern"] == "Redness" for item in recommendations)
