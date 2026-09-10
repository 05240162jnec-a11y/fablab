#!/bin/bash

echo "=== CHECKING ENVIRONMENT VARIABLES ==="
echo "APP_ENV: $APP_ENV"
echo "APP_DEBUG: $APP_DEBUG"
echo "APP_KEY: ${APP_KEY:0:25}..."
echo "DB_HOST: $DB_HOST"
echo "=== END CHECK ==="

echo "Clearing stubborn caches to ensure fresh settings..."
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear

echo "Waiting for database to be ready..."
sleep 10

echo "Running migrations..."
php artisan migrate --force

echo "Starting Apache..."
exec apache2-foreground