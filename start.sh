#!/bin/bash

# Run migrations on startup
echo "Running migrations..."
php artisan migrate --force

# Start Apache
echo "Starting Apache..."
apache2-foreground