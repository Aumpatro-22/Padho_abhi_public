# Padho Abhi

A Django-based educational platform for generating study materials (notes, mindmaps, flashcards, MCQs) using AI.

## Quick Start (Windows / PowerShell)

Prerequisites:
- Python 3.10+ (recommend using a virtual environment)
- Git

Setup steps:

```powershell
# from project root
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Environment:
- The project expects certain environment settings (e.g. `GEMINI_API_KEY`) used by the AI service in `core/ai_service.py`.
  Set these as environment variables before running the server:

```powershell
$env:GEMINI_API_KEY = "your_api_key_here"
```

### Database Setup (Neon PostgreSQL)

This project supports PostgreSQL (recommended for production, e.g., Neon free tier) and SQLite (default for local dev).

To use Neon:
1.  Create a project on [Neon.tech](https://neon.tech).
2.  Copy the connection string (e.g., `postgres://user:password@ep-xyz.aws.neon.tech/dbname?sslmode=require`).
3.  Set it as an environment variable or in a `.env` file:

```powershell
$env:DATABASE_URL = "postgres://..."
```

Django will automatically use this if found; otherwise, it falls back to `db.sqlite3`.

### Neon Auth (JWT) Integration

This project can accept Neon Auth JWTs for API requests. Configure these environment variables:

```powershell
$env:NEON_AUTH_JWKS_URL = "https://<your-neon-auth-domain>/.well-known/jwks.json"
$env:NEON_AUTH_ISSUER = "https://<your-neon-auth-domain>/"  # optional
$env:NEON_AUTH_AUDIENCE = "<your-audience>"                  # optional
```

When a Neon Auth access token is present in the browser, the frontend sends it as a `Bearer` token. The API will create a Django user on first request using the token claims.

### Deploy to Render

1.  Push this repo to GitHub.
2.  Create a new **Web Service** on [Render](https://render.com).
3.  Connect your repository.
4.  Settings:
    *   **Runtime**: Python 3
    *   **Build Command**: `./build.sh`
    *   **Start Command**: `gunicorn smartstudy.wsgi:application`
5.  **Environment Variables**:
    *   `DATABASE_URL`: Your Neon (or Render config) PostgreSQL connection string.
    *   `GEMINI_API_KEY`: Your Gemini API key.
    *   `PYTHON_VERSION`: `3.11.9` (optional, to match your env).

Notes for Render:
- `build.sh` handles dependency installation, static files collection, and migrations automatically.
- Ensure `ALLOWED_HOSTS` in `settings.py` includes your Render URL (currently set to `*`).

Database & Django commands:

```powershell
python manage.py migrate
python manage.py createsuperuser   # optional
python manage.py runserver 0.0.0.0:8000
```

Running tests:

```powershell
python manage.py test
```

Notes:
- This repository includes an SQLite database file `db.sqlite3` for local testing. Remove or reset it before production use.
- Consider adding a `.env` or using a secrets manager for API keys instead of storing them in code.

Recommended .gitignore (if not already present):
- `__pycache__/`, `.venv/`, `db.sqlite3`, `.vscode/`, `*.pyc`

Contributing:
- Open an issue or submit a PR. Follow standard GitHub workflows.

License: Add your chosen license file if desired.

----
Created for quick onboarding. If you want, I can also create a `.gitignore`, commit this README, and push the commit to the remote.
