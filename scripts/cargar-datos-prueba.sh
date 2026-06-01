#!/bin/bash
# ============================================================
# Carga los datos de prueba en la base de datos del sistema
# Uso: bash scripts/cargar-datos-prueba.sh
# Requisito: docker compose up debe estar corriendo
# ============================================================

CONTAINER="sistema-citas-medicas-db-1"
SQL_FILE="backend/db/test_data.sql"

echo ""
echo "=================================================="
echo " Cargando datos de prueba..."
echo "=================================================="
echo ""

if ! docker ps --filter "name=$CONTAINER" --filter "status=running" -q | grep -q .; then
  echo "ERROR: El contenedor '$CONTAINER' no está corriendo."
  echo "       Ejecuta primero: docker compose up -d"
  exit 1
fi

if [ ! -f "$SQL_FILE" ]; then
  echo "ERROR: No se encontró el archivo '$SQL_FILE'."
  exit 1
fi

echo "Conectando a PostgreSQL..."
docker exec -i "$CONTAINER" psql -U meduser -d medical_system < "$SQL_FILE"

if [ $? -eq 0 ]; then
  echo ""
  echo "=================================================="
  echo " Datos de prueba cargados exitosamente."
  echo " Abre http://localhost para ver el sistema."
  echo "=================================================="
else
  echo "ERROR: Hubo un problema al cargar los datos."
  exit 1
fi
