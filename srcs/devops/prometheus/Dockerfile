FROM prom/prometheus:latest

# Passer à l'utilisateur root pour les opérations nécessitant des permissions élevées
USER root

# Créer un répertoire personnalisé dans /etc
RUN mkdir -p /etc/prometheus-custom && \
    chmod -R 755 /etc/prometheus-custom

# Copier les fichiers de configuration
COPY prometheus.yml /etc/prometheus-custom/prometheus.yml
COPY alert.rules /etc/prometheus-custom/alert.rules

# Ajuster les permissions pour que l'utilisateur non privilégié puisse lire les fichiers
RUN chown -R nobody:nobody /etc/prometheus-custom

# Revenir à l'utilisateur non privilégié
USER nobody

# Définir Prometheus pour utiliser le chemin de configuration personnalisé
CMD ["--config.file=/etc/prometheus-custom/prometheus.yml", "--web.enable-lifecycle"]
