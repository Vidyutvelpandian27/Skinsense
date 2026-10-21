# MongoDB setup

The backend now uses MongoDB through PyMongo. It does not need MySQL.

## Connect a database

Choose one option:

- Install MongoDB Community Server and run the MongoDB service locally. Keep `MONGODB_URI=mongodb://localhost:27017` in `.env`.
- Create a MongoDB Atlas cluster, create a database user, allow the backend machine's IP in Network Access, and use the Atlas connection string for `MONGODB_URI`. URL-encode special characters in the database user's password.

Set these backend `.env` values:

```dotenv
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=skinsense
ADMIN_EMAIL=admin@example.com
```

Use the Atlas-provided `mongodb+srv://...` URI instead of the local URI when using Atlas. `ADMIN_EMAIL` is optional; if set, registering with that email creates an administrator account.

## Install and run

From the backend directory, install dependencies and verify connectivity:

```powershell
pip install -r requirements.txt
python database/ensure_reports_columns.py
python app.py
```

The verification command pings MongoDB and creates the email, report-history, and product indexes. It exits with an error if the connection cannot be reached.

## Data migration note

Changing the backend does not copy existing MySQL records. MongoDB starts with empty `users`, `reports`, and `products` collections. Existing users must register again, and old analyses/products must be exported and imported separately if they need to be retained. MongoDB IDs are ObjectIds represented as strings in API responses and URLs.