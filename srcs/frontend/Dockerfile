FROM alpine:latest

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de l'application
COPY ./app /app

# Ajuster les permissions
RUN chmod -R 755 /app

# Exposer le port (facultatif)
EXPOSE 80

# La commande de démarrage est définie dans le docker-compose.yml
