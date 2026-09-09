# Start with PHP 8.2 and Apache
FROM php:8.2-apache

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git curl libpng-dev libonig-dev libxml2-dev libzip-dev libpq-dev zip unzip

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql pdo_pgsql mbstring exif pcntl bcmath gd zip

# Enable Apache rewrite module
RUN a2enmod rewrite

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy all local files
COPY . .

# CRITICAL: DELETE the local .env file so it doesn't override Render's variables!
RUN rm -f .env

# BULLETPROOF: Overwrite default Apache config with our custom one
COPY apache.conf /etc/apache2/sites-available/000-default.conf

# Move start.sh to the correct location and make it executable
RUN mv /var/www/html/start.sh /usr/local/bin/start.sh \
    && chmod +x /usr/local/bin/start.sh

# Install dependencies
RUN composer install --no-dev --optimize-autoloader

# Set correct permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 80

# Use our startup script
CMD ["/usr/local/bin/start.sh"]