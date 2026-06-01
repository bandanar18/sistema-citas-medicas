# Sistema de Control de Agendas de Citas Médicas

Sistema web para centralizar el registro de pacientes, la asignación de citas médicas, la generación de reportes y el historial de acciones del equipo de servicio al cliente.

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite + React Router 6 |
| Backend | Node.js 20 + Express.js |
| Base de datos | PostgreSQL 16 |
| Autenticación | JWT (jsonwebtoken + bcryptjs) |
| Contenedores | Docker + Docker Compose |
| Servidor estático | Nginx Alpine |

---

## Requisitos Previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo
- Git

---

## Instalación y Ejecución

```bash
# 1. Clonar el repositorio
git clone https://github.com/bandanar18/sistema-citas-medicas.git
cd sistema-citas-medicas

# 2. Levantar el sistema (primera vez construye las imágenes automáticamente)
docker compose up --build

# 3. Abrir en el navegador
# http://localhost
```

El sistema estará listo cuando veas en la terminal:
```
backend-1 | Conexión a la base de datos establecida.
backend-1 | Servidor corriendo en el puerto 3001
```

> Para detener el sistema: `docker compose down`  
> Los datos de la base de datos persisten aunque el sistema se detenga.

---

## Credenciales Iniciales

| Usuario | Contraseña | Rol |
|---|---|---|
| `jefa` | `Jefa@2024` | Jefa del Sistema |
| `asistente1` | `Asistente1@2024` | Asistente Virtual 1 |
| `asistente2` | `Asistente2@2024` | Asistente Virtual 2 |

> Los tres usuarios tienen el mismo nivel de acceso operativo.

---

## Datos de Prueba

Para cargar 10 pacientes y 17 citas de prueba en el sistema:

**Windows (PowerShell):**
```powershell
.\scripts\cargar-datos-prueba.ps1
```

**Linux / Mac:**
```bash
bash scripts/cargar-datos-prueba.sh
```

> El sistema debe estar corriendo antes de ejecutar el script.  
> El script es idempotente: puede ejecutarse múltiples veces sin duplicar datos.

### Datos incluidos

| Categoría | Detalle |
|---|---|
| 10 pacientes | Pacientes en Miami, Orlando, Tampa, Jacksonville y Fort Lauderdale |
| 5 citas pasadas | Mayo 2026 — visibles en reportes históricos |
| 4 citas esta semana | Junio 1-3, 2026 — visibles en reportes del día |
| 6 citas futuras | Junio-Julio 2026 — agenda próxima |
| 5 médicos | Cardiología, Medicina General, Neurología, Ortopedia |
| 6 clínicas | Distribuidas en distintas ciudades de Florida |

---

## Módulos del Sistema

### Motor de Búsqueda
Búsqueda en tiempo real por nombre, Member ID, teléfono o correo. Si el paciente no existe, ofrece registrarlo directamente.

### Registro de Pacientes
Formulario para crear y editar perfiles de pacientes. Incluye validación de campos obligatorios y detección de duplicados por Member ID y por combinación nombre + fecha de nacimiento.

### Control de Citas Médicas
Agendamiento de citas asociadas a un paciente. Detecta y bloquea choques de horario: si un médico ya tiene una cita a la misma fecha y hora con otro paciente, el sistema muestra una alerta antes de permitir el registro.

### Reportes Diarios
Reporte de todas las citas de un día seleccionado, ordenadas por hora. Incluye paciente, médico, especialidad, seguro y clínica. Muestra estado informativo cuando no hay citas en la fecha.

### Historial de Acciones
Registro completo de cada acción realizada por cada usuario (login, registro de pacientes, modificaciones, citas agendadas), filtrable por fecha.

---

## Arquitectura

```
┌──────────────────────────────────────────────┐
│              Docker Compose                   │
│                                              │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐ │
│  │ frontend │ → │ backend  │ → │    db    │ │
│  │  :80     │   │  :3001   │   │  :5432   │ │
│  │  React   │   │ Express  │   │Postgres  │ │
│  │  +Nginx  │   │   API    │   │   16     │ │
│  └──────────┘   └──────────┘   └──────────┘ │
│                                              │
│  Volume: postgres_data (datos persistentes)  │
└──────────────────────────────────────────────┘
```

**Flujo de autenticación:** El frontend obtiene un JWT al hacer login y lo adjunta en cada petición al backend. Las rutas protegidas validan el token antes de responder. Si el token expira (8 horas), el sistema redirige automáticamente al login.

---

## Estructura del Proyecto

```
sistema-citas-medicas/
├── docker-compose.yml
├── .env.example
├── scripts/
│   ├── cargar-datos-prueba.ps1   ← Windows
│   └── cargar-datos-prueba.sh    ← Linux/Mac
│
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── db/
│   │   ├── schema.sql            ← Tablas e índices
│   │   ├── seed.sql              ← 3 usuarios iniciales
│   │   └── test_data.sql         ← Datos de prueba
│   └── src/
│       ├── index.js
│       ├── config/db.js          ← Pool PostgreSQL
│       ├── middleware/
│       │   ├── auth.js           ← Verificación JWT
│       │   └── auditLogger.js    ← Registro de acciones
│       ├── routes/               ← auth, patients, appointments, reports, history
│       └── controllers/          ← Lógica de negocio por módulo
│
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx               ← Rutas principales
        ├── api/client.js         ← Axios con interceptores JWT
        ├── context/AuthContext.jsx
        ├── components/
        │   ├── Layout/           ← Sidebar, TopHeader
        │   ├── UI/               ← Alert, EmptyState, Spinner
        │   └── ProtectedRoute.jsx
        └── pages/
            ├── Login.jsx
            ├── Search.jsx
            ├── Patients/         ← PatientForm, PatientDetail
            ├── Appointments/     ← AppointmentForm
            ├── Reports.jsx
            └── History.jsx
```

---

## API REST

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/auth/logout` | Cerrar sesión |
| GET | `/api/auth/me` | Usuario activo |
| GET | `/api/patients/search?q=` | Búsqueda de pacientes |
| POST | `/api/patients` | Crear paciente |
| GET | `/api/patients/:id` | Detalle del paciente |
| PUT | `/api/patients/:id` | Actualizar paciente |
| POST | `/api/appointments` | Agendar cita |
| GET | `/api/reports/daily?date=` | Reporte diario |
| GET | `/api/history?date=` | Historial de acciones |

> Todas las rutas excepto `/api/auth/login` requieren `Authorization: Bearer <token>`.

---

## Desarrollo Local (sin Docker)

Para trabajar en el código sin reconstruir imágenes Docker:

**Backend:**
```bash
cd backend
cp ../.env.example .env
# Editar .env con los datos de tu PostgreSQL local
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# Disponible en http://localhost:5173
```

> El `vite.config.js` ya tiene configurado el proxy de `/api` hacia `localhost:3001`.
