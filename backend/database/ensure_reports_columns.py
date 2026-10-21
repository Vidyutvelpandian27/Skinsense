from database.db import test_connection


if not test_connection():
    raise SystemExit("MongoDB is unavailable. Check MONGODB_URI and the database service.")

print("MongoDB is connected and report indexes are ready.")