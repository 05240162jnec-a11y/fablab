# Start with a base image that has PHP 8.2 and Apache web server built-in
FROM php:8.2-apache

# Install necessary system dependencies AND the PostgreSQL libraries
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    libpq-dev \
    zip \
    unzip

# Install PHP extensions for Laravel and databases
RUN docker-php-ext-install pdo_mysql pdo_pgsql mbstring exif pcntl bcmath gd zip

# Enable Apache's rewrite module (CRITICAL for Laravel routing to work)
RUN a2enmod rewrite

# Install Composer (the PHP package manager)
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set the working directory inside the container
WORKDIR /var/www/html

# Copy all your local Laravel files into the container
COPY . .

# Install Laravel dependencies using Composer
RUN composer install --no-dev --optimize-autoloader

# Set correct permissions for Laravel's storage and cache folders
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Tell the container to listen on port 80 (Standard web port)
EXPOSE 80