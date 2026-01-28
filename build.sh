#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "=== Installing Python dependencies ==="
pip install -r requirements.txt

echo "=== Building React frontend ==="
cd frontend-new
npm install
npm run build
echo "=== Frontend build complete, listing dist folder ==="
ls -la dist/
cd ..

echo "=== Collecting static files ==="
python manage.py collectstatic --no-input

echo "=== Listing staticfiles folder ==="
ls -la staticfiles/

echo "=== Running database migrations ==="
python manage.py migrate

echo "=== Build complete ==="
