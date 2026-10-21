from database.db import as_id, get_collection, serialize


def get_history(user_id):
    """Get a user's analysis reports, newest first."""
    reports = get_collection("reports").find(
        {"user_id": str(user_id)}
    ).sort("created_at", -1)
    return [serialize(report) for report in reports]


def get_latest_history(user_id):
    report = get_collection("reports").find_one(
        {"user_id": str(user_id)}, sort=[("created_at", -1)]
    )
    return serialize(report)


def get_history_item(history_id):
    return serialize(get_collection("reports").find_one({"_id": as_id(history_id)}))


def delete_history(history_id):
    return get_collection("reports").delete_one({"_id": as_id(history_id)}).deleted_count > 0


def clear_history(user_id):
    return get_collection("reports").delete_many({"user_id": str(user_id)}).deleted_count