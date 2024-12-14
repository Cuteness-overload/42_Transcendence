# srcs/backend/Dockerfile

FROM python:3.11-slim

# Définir les variables d'environnement pour éviter l'écriture des fichiers pyc et le buffering
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Définir le répertoire de travail
WORKDIR /app

# Installer les dépendances système et le client PostgreSQL
RUN apt-get update && apt-get install -y --no-install-recommends \
    bash \
    curl \
    netcat-openbsd \
    postgresql-client \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Installer les dépendances Python
COPY requirements.txt /app/
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Copier les scripts nécessaires
COPY scripts/wait-for.sh /wait-for.sh
COPY scripts/entrypoint.sh /entrypoint.sh
RUN chmod +x /wait-for.sh /entrypoint.sh

# Copier le code source de l'application
COPY . /app/

# Créer le répertoire des médias et définir les permissions
RUN mkdir -p /app/media && \
    chmod -R 755 /app/media

# Exposer le port de l'application
EXPOSE 8000

# Définir l'entrypoint et le CMD pour utiliser Gunicorn
ENTRYPOINT ["/bin/bash", "/entrypoint.sh"]
CMD ["gunicorn", "app.wsgi:application", "--bind", "0.0.0.0:8000"]
