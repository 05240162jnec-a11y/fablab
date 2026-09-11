# Start with PHP 8.2 and Apache
FROM php:8.2-apache

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git curl libpng-dev libonig-dev libxml2-dev libzip-dev libpq-dev zip unzip

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql pdo_pgsql mbstring exif pcntl bcmath gd zip

# Disable default MPM and enable prefork (required for PHP)
RUN a2dismod mpm_event && a2enmod mpm_prefork rewrite

# Install Composer properly
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

WORKDIR /var/www/html

# Copy all local files
COPY . .

# CRITICAL: DELETE the local .env file so it doesn't override Railway's variables!
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