-- ============================================================
-- SCHEMA: Sistema de Control de Agendas de Citas Médicas
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    username      VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name     VARCHAR(100) NOT NULL,
    role          VARCHAR(20) DEFAULT 'assistant' CHECK (role IN ('boss', 'assistant')),
    created_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patients (
    id          SERIAL PRIMARY KEY,
    full_name   VARCHAR(150) NOT NULL,
    member_id   VARCHAR(50)  UNIQUE NOT NULL,
    dob         DATE NOT NULL,
    sex         CHAR(1) NOT NULL CHECK (sex IN ('M', 'F')),
    state       VARCHAR(100) NOT NULL,
    city        VARCHAR(100) NOT NULL,
    address     VARCHAR(255) NOT NULL,
    zip_code    VARCHAR(10)  NOT NULL,
    phone       VARCHAR(20)  NOT NULL,
    email       VARCHAR(100),
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW(),
    created_by  INTEGER REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS appointments (
    id                SERIAL PRIMARY KEY,
    patient_id        INTEGER NOT NULL REFERENCES patients(id),
    doctor_name       VARCHAR(150) NOT NULL,
    specialty         VARCHAR(100) NOT NULL,
    npi               VARCHAR(20)  NOT NULL,
    insurance         VARCHAR(100) NOT NULL,
    appointment_date  DATE NOT NULL,
    appointment_time  TIME NOT NULL,
    clinic_name       VARCHAR(150) NOT NULL,
    clinic_state      VARCHAR(100) NOT NULL,
    clinic_city       VARCHAR(100) NOT NULL,
    clinic_address    VARCHAR(255) NOT NULL,
    clinic_ref_number VARCHAR(50),
    created_at        TIMESTAMP DEFAULT NOW(),
    created_by        INTEGER REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS audit_log (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER REFERENCES users(id),
    username    VARCHAR(50) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    detail      JSONB,
    timestamp   TIMESTAMP DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_patients_member_id        ON patients(member_id);
CREATE INDEX IF NOT EXISTS idx_patients_full_name        ON patients(LOWER(full_name));
CREATE INDEX IF NOT EXISTS idx_patients_phone            ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_patients_email            ON patients(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_appointments_date         ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_conflict     ON appointments(doctor_name, appointment_date, appointment_time);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp       ON audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_log_date            ON audit_log(DATE(timestamp));
