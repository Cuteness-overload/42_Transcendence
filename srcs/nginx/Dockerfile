# FROM nginx:alpine

# # Copier les fichiers de configuration Nginx
# COPY ./nginx.conf /etc/nginx/nginx.conf

# # Exposer le port
# EXPOSE 80

# # Démarrer Nginx
# CMD ["nginx", "-g", "daemon off;"]




FROM nginx:alpine

RUN apk add --no-cache openssl

# Create a directory for SSL certificates
RUN mkdir /etc/nginx/ssl

# Generate a self-signed SSL certificate
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/selfsigned.key \
    -out /etc/nginx/ssl/selfsigned.crt \
    -subj "/C=FR/ST=Paris/L=Paris/O=42/OU=42/CN=localhost"

# Copy the Nginx configuration file
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]
