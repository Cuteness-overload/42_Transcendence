FROM postgres:13

ENV POSTGRES_USER ${POSTGRES_USER}
ENV POSTGRES_PASSWORD ${POSTGRES_PASSWORD}
ENV POSTGRES_DB ${POSTGRES_DB}

COPY init.sql /docker-entrypoint-initdb.d/

ALTER SYSTEM SET ssl TO 'on'; -- desactiver en prod j'imagine / pour eviter les logs postgres_exporter


EXPOSE 5432
