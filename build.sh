#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "=== Installing Python dependencies ==="
pip install -r requirements.txt

echo "=== Building React frontend ==="
cd frontend-new
npm ci --legacy-peer-deps
npm run build
cd ..
echo "React frontend built successfully!"

echo "=== Collecting static files ==="
python manage.py collectstatic --no-input

echo "=== Running database migrations ==="
python manage.py migrate

echo "=== Build complete ==="
