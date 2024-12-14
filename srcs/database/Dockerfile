# srcs/database/Dockerfile

FROM postgres:13

# Définir les variables d'environnement pour PostgreSQL
ENV POSTGRES_USER=${POSTGRES_USER}
ENV POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
ENV POSTGRES_DB=${POSTGRES_DB}

# Copier le script d'initialisation, si vous en avez un
COPY init.sql /docker-entrypoint-initdb.d/

# Exposer le port 5432 pour PostgreSQL
EXPOSE 5432
