#!/bin/bash

# Attendre que la base de données soit prête
echo "Waiting for database..."
/wait-for.sh database:5432 -- echo "Database is ready!"

# Vérification active pour PostgreSQL
echo "Checking PostgreSQL availability..."
until PGPASSWORD=$POSTGRES_PASSWORD psql -h database -U $POSTGRES_USER -d $POSTGRES_DB -c '\q'; do
  >&2 echo "Postgres is unavailable - retrying..."
  sleep 1
done

# Fusionner les migrations si nécessaire
echo "Checking for migration conflicts..."
python manage.py makemigrations --merge --noinput || true

# Appliquer les migrations
echo "Applying database migrations..."
python manage.py makemigrations || exit 1
python manage.py migrate --noinput || exit 1
if [ $? -ne 0 ]; then
  echo "Migration failed!"
  exit 1
fi

# Démarrer le serveur Django
echo "Starting Django server..."
exec "$@"  # Important pour remplacer le processus et garder le conteneur actif
