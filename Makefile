# Makefile pour gestion de l'environnement Docker

# Cible par défaut
.DEFAULT_GOAL := help

# Variables
COMPOSE_FILE := docker-compose.yml
DOCKER_COMPOSE := docker-compose -f $(COMPOSE_FILE)

# Evite les conflits avec des fichiers du même nom
.PHONY: help build up down restart logs \
        backend-up backend-down backend-restart backend-logs \
        frontend-up frontend-down frontend-restart frontend-logs \
        database-up database-down database-restart database-logs \
        nginx-up nginx-down nginx-restart nginx-logs \
        test clean prune re \
        monitoring-up monitoring-down monitoring-restart \
        build-backend build-frontend build-nginx build-tests build-prometheus build-grafana \
        recreate-backend recreate-frontend

# Aide
help:
	@echo "Commandes disponibles :"
	@echo ""
	@echo "Commandes générales :"
	@echo "  make build             Construire toutes les images Docker"
	@echo "  make up                Démarrer tous les services"
	@echo "  make down              Arrêter et supprimer tous les services"
	@echo "  make restart           Redémarrer tous les services"
	@echo "  make logs              Afficher les logs de tous les services"
	@echo "  make clean             Arrêter et supprimer tous les services et volumes"
	@echo "  make prune             Nettoyer l'environnement Docker (ATTENTION : suppression globale)"
	@echo "  make re                Nettoyer et reconstruire l'environnement Docker"
	@echo "  make du                Recréer l'environnement Docker (down up build)"
	@echo ""
	@echo "Service Backend :"
	@echo "  make backend-up        Démarrer le service backend"
	@echo "  make backend-down      Arrêter le service backend"
	@echo "  make backend-restart   Redémarrer le service backend"
	@echo "  make backend-logs      Afficher les logs du service backend"
	@echo "  make build-backend     Construire l'image du backend"
	@echo "  make recreate-backend  Recréer le conteneur backend"
	@echo ""
	@echo "Service Frontend :"
	@echo "  make frontend-up       Démarrer le service frontend"
	@echo "  make frontend-down     Arrêter le service frontend"
	@echo "  make frontend-restart  Redémarrer le service frontend"
	@echo "  make frontend-logs     Afficher les logs du service frontend"
	@echo "  make build-frontend    Construire l'image du frontend"
	@echo "  make recreate-frontend Recréer le conteneur frontend"
	@echo ""
	@echo "Service Database :"
	@echo "  make database-up       Démarrer le service database"
	@echo "  make database-down     Arrêter le service database"
	@echo "  make database-restart  Redémarrer le service database"
	@echo "  make database-logs     Afficher les logs du service database"
	@echo ""
	@echo "Service Nginx :"
	@echo "  make nginx-up          Démarrer le service nginx"
	@echo "  make nginx-down        Arrêter le service nginx"
	@echo "  make nginx-restart     Redémarrer le service nginx"
	@echo "  make nginx-logs        Afficher les logs du service nginx"
	@echo "  make build-nginx       Construire l'image de nginx"
	@echo ""
	@echo "Tests :"
	@echo "  make test              Exécuter les tests"
	@echo "  make build-tests       Construire l'image des tests"
	@echo ""
	@echo "Services de Monitoring :"
	@echo "  make monitoring-up     Démarrer les services de monitoring"
	@echo "  make monitoring-down   Arrêter les services de monitoring"
	@echo "  make monitoring-restart Redémarrer les services de monitoring"
	@echo "  make build-prometheus  Construire l'image de Prometheus"
	@echo "  make build-grafana     Construire l'image de Grafana"
	@echo ""

# Commandes générales
build:
	$(DOCKER_COMPOSE) build

up:
	$(DOCKER_COMPOSE) up -d

down:
	$(DOCKER_COMPOSE) down

restart:
	$(DOCKER_COMPOSE) restart

logs:
	$(DOCKER_COMPOSE) logs -f

clean:
	$(DOCKER_COMPOSE) down -v

# Nettoyer l'environnement Docker
prune:
	@echo "Nettoyage complet de l'environnement Docker..."
	$(DOCKER_COMPOSE) down --rmi all --volumes --remove-orphans
	docker system prune -f
	docker volume prune -f

# Nettoyer et reconstruire l'environnement
re: prune build up

# Recréer l'environnement Docker
du:
	$(DOCKER_COMPOSE) down && $(DOCKER_COMPOSE) up -d --build

# Service Backend
backend-up:
	$(DOCKER_COMPOSE) up -d backend

backend-down:
	$(DOCKER_COMPOSE) stop backend

backend-restart:
	$(DOCKER_COMPOSE) restart backend

backend-logs:
	$(DOCKER_COMPOSE) logs -f backend

build-backend:
	$(DOCKER_COMPOSE) build backend

recreate-backend:
	$(DOCKER_COMPOSE) up -d --force-recreate backend

# Service Frontend
frontend-up:
	$(DOCKER_COMPOSE) up -d frontend

frontend-down:
	$(DOCKER_COMPOSE) stop frontend

frontend-restart:
	$(DOCKER_COMPOSE) restart frontend

frontend-logs:
	$(DOCKER_COMPOSE) logs -f frontend

build-frontend:
	$(DOCKER_COMPOSE) build frontend

recreate-frontend:
	$(DOCKER_COMPOSE) up -d --force-recreate frontend

# Service Database
database-up:
	$(DOCKER_COMPOSE) up -d database

database-down:
	$(DOCKER_COMPOSE) stop database

database-restart:
	$(DOCKER_COMPOSE) restart database

database-logs:
	$(DOCKER_COMPOSE) logs -f database

# Service Nginx
nginx-up:
	$(DOCKER_COMPOSE) up -d nginx

nginx-down:
	$(DOCKER_COMPOSE) stop nginx

nginx-restart:
	$(DOCKER_COMPOSE) restart nginx

nginx-logs:
	$(DOCKER_COMPOSE) logs -f nginx

build-nginx:
	$(DOCKER_COMPOSE) build nginx

# Tests
test:
	$(DOCKER_COMPOSE) run --rm tests

build-tests:
	$(DOCKER_COMPOSE) build tests

# Services de Monitoring
monitoring-up:
	$(DOCKER_COMPOSE) up -d prometheus grafana node_exporter postgres_exporter

monitoring-down:
	$(DOCKER_COMPOSE) stop prometheus grafana node_exporter postgres_exporter

monitoring-restart:
	$(DOCKER_COMPOSE) restart prometheus grafana node_exporter postgres_exporter

build-prometheus:
	$(DOCKER_COMPOSE) build prometheus

build-grafana:
	$(DOCKER_COMPOSE) build grafana
