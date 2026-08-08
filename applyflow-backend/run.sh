#!/usr/bin/env bash
# Arranca el backend cargando las variables de entorno desde .env (ignorado por git).
set -a
source .env
set +a
./mvnw spring-boot:run
