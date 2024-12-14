FROM grafana/grafana:latest

# Copier le fichier de configuration Grafana
COPY grafana.ini /etc/grafana/grafana.ini

# Copier les fichiers de provisioning
COPY provisioning/datasources/ /etc/grafana/provisioning/datasources/
COPY provisioning/dashboards.yaml /etc/grafana/provisioning/dashboards/

# Copier les tableaux de bord JSON dans /etc/grafana/dashboards/
COPY dashboards/ /etc/grafana/dashboards/

# Ajuster les permissions pour que Grafana puisse lire les fichiers
USER root
RUN chown -R 472:472 /etc/grafana/dashboards
USER grafana
