from datetime import datetime, timezone

from database.db import as_id, get_collection, serialize


def get_profile(user_id):
    """Get user profile."""

    profile = serialize(get_collection("users").find_one({"_id": as_id(user_id)}))
    if profile:
        profile["name"] = profile.pop("full_name", "")
        profile.pop("password", None)
    return profile


def update_profile(
    user_id,
    data
):
    """Update profile information."""

    name = data.get(
        "name"
    )

    email = data.get(
        "email"
    )

    profile_image = data.get(
        "profile_image"
    )

    current_user = get_profile(
        user_id
    )

    if not current_user:
        raise ValueError(
            "User not found."
        )

    if name is not None:
        name = str(name).strip()

        if not name:
            raise ValueError(
                "Name cannot be empty."
            )

    if email is not None:
        email = str(email).strip().lower()

        existing = get_collection("users").find_one({
            "email": email,
            "_id": {"$ne": as_id(user_id)},
        })

        if existing:
            raise ValueError(
                "Email is already in use."
            )

    new_name = (
        name
        if name is not None
        else current_user["name"]
    )

    new_email = (
        email
        if email is not None
        else current_user["email"]
    )

    new_image = (
        profile_image
        if profile_image is not None
        else current_user["profile_image"]
    )

    get_collection("users").update_one(
        {"_id": as_id(user_id)},
        {"$set": {
            "full_name": new_name,
            "email": new_email,
            "profile_image": new_image,
            "updated_at": datetime.now(timezone.utc),
        }}
    )

    return get_profile(
        user_id
    )


def update_name(
    user_id,
    name
):
    """Update user's name."""

    name = str(name).strip()

    if not name:
        raise ValueError(
            "Name cannot be empty."
        )

    get_collection("users").update_one(
        {"_id": as_id(user_id)},
        {"$set": {"full_name": name, "updated_at": datetime.now(timezone.utc)}}
    )

    return get_profile(
        user_id
    )


def update_email(
    user_id,
    email
):
    """Update user's email."""

    email = str(email).strip().lower()

    if not email:
        raise ValueError(
            "Email cannot be empty."
        )

    existing = get_collection("users").find_one({
        "email": email,
        "_id": {"$ne": as_id(user_id)},
    })

    if existing:
        raise ValueError(
            "Email is already in use."
        )

    get_collection("users").update_one(
        {"_id": as_id(user_id)},
        {"$set": {"email": email, "updated_at": datetime.now(timezone.utc)}}
    )

    return get_profile(
        user_id
    )


def get_profile_stats(user_id):
    """Get basic analysis statistics for a user."""

    reports = get_collection("reports")
    user_filter = {"user_id": str(user_id)}
    total = reports.count_documents(user_filter)
    completed_filter = {**user_filter, "overall_status": {"$ne": None}}
    completed = reports.count_documents(completed_filter)
    average_result = list(reports.aggregate([
        {"$match": completed_filter},
        {"$group": {"_id": None, "average_score": {"$avg": "$overall_score"}}},
    ]))
    average_score = average_result[0].get("average_score") if average_result else None

    return {
        "total_analyses": (
            total
        ),

        "completed_analyses": (
            completed
        ),

        "average_score": (
            round(
                float(
                    average_score
                ),
                2
            )
            if average_score is not None
            else 0
        )
    }