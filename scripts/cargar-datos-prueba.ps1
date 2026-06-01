# ============================================================
# Carga los datos de prueba en la base de datos del sistema
# Uso: .\scripts\cargar-datos-prueba.ps1
# Requisito: docker compose up debe estar corriendo
# ============================================================

$ErrorActionPreference = "Stop"

$container = "sistema-citas-medicas-db-1"
$sqlFile   = "backend/db/test_data.sql"

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host " Cargando datos de prueba..." -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que el contenedor esté corriendo
$running = docker ps --filter "name=$container" --filter "status=running" -q 2>&1
if (-not $running) {
    Write-Host "ERROR: El contenedor '$container' no está corriendo." -ForegroundColor Red
    Write-Host "       Ejecuta primero: docker compose up -d" -ForegroundColor Yellow
    exit 1
}

# Verificar que el archivo SQL existe
if (-not (Test-Path $sqlFile)) {
    Write-Host "ERROR: No se encontró el archivo '$sqlFile'." -ForegroundColor Red
    exit 1
}

# Ejecutar el SQL en el contenedor
Write-Host "Conectando a PostgreSQL..." -ForegroundColor Gray
Get-Content $sqlFile | docker exec -i $container psql -U meduser -d medical_system

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "==================================================" -ForegroundColor Green
    Write-Host " Datos de prueba cargados exitosamente." -ForegroundColor Green
    Write-Host " Abre http://localhost para ver el sistema." -ForegroundColor Green
    Write-Host "==================================================" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "ERROR: Hubo un problema al cargar los datos." -ForegroundColor Red
    exit 1
}
