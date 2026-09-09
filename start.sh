#!/bin/bash

echo "Waiting for database to be ready..."
sleep 10

echo "Running migrations..."
php artisan migrate --force

echo "Starting Apache..."
exec apache2-foreground