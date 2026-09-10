#!/bin/bash

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