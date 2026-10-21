from bson import ObjectId
from pymongo import MongoClient
from pymongo.errors import PyMongoError

from config import config

_client = None
_database = None


def get_database():
    """Return the lazily initialized MongoDB database."""
    global _client, _database
    if _database is None:
        _client = MongoClient(config.MONGODB_URI, serverSelectionTimeoutMS=5000)
        _database = _client[config.MONGODB_DATABASE]
    return _database


def get_collection(name):
    return get_database()[name]


def new_id():
    return str(ObjectId())


def as_id(value):
    """Convert a string identifier to ObjectId, returning None if invalid."""
    if isinstance(value, ObjectId):
        return value
    if not isinstance(value, str) or not ObjectId.is_valid(value):
        return None
    return ObjectId(value)


def serialize(document):
    if document is None:
        return None
    result = dict(document)
    identifier = result.pop("_id", None)
    if identifier is not None:
        result["id"] = str(identifier)
    return result


def test_connection():
    """Test MongoDB reachability and ensure common indexes."""
    try:
        database = get_database()
        _client.admin.command("ping")
        database.users.create_index("email", unique=True)
        database.reports.create_index([("user_id", 1), ("created_at", -1)])
        database.products.create_index([("name", 1)])
        return True
    except PyMongoError as error:
        print(f"MongoDB connection failed: {error}")
        return False