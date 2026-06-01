-- ============================================================
-- DATOS DE PRUEBA
-- Sistema de Control de Agendas de Citas Médicas
--
-- Ejecutar DESPUÉS de que el sistema esté corriendo:
--   Windows: .\scripts\cargar-datos-prueba.ps1
--   Linux/Mac: bash scripts/cargar-datos-prueba.sh
--
-- Se puede ejecutar múltiples veces (ON CONFLICT DO NOTHING).
-- ============================================================

-- -------------------------
-- PACIENTES DE PRUEBA (10)
-- -------------------------
INSERT INTO patients (full_name, member_id, dob, sex, state, city, address, zip_code, phone, email, created_by) VALUES
  ('Maria Gonzalez',     'MED-T001', '1985-03-12', 'F', 'Florida', 'Miami',           '1200 Brickell Ave Apt 4B',   '33131', '305-555-1001', 'maria.gonzalez@email.com',    1),
  ('Carlos Rodriguez',   'MED-T002', '1978-07-25', 'M', 'Florida', 'Orlando',         '450 Orange Ave Suite 200',   '32801', '407-555-2002', 'c.rodriguez@gmail.com',       2),
  ('Ana Martinez',       'MED-T003', '1992-11-08', 'F', 'Florida', 'Tampa',           '3800 Henderson Blvd',        '33629', '813-555-3003', 'ana.martinez@outlook.com',    1),
  ('Luis Hernandez',     'MED-T004', '1965-01-30', 'M', 'Florida', 'Jacksonville',    '9000 Regency Square Blvd',   '32225', '904-555-4004', null,                          3),
  ('Sofia Lopez',        'MED-T005', '1990-09-15', 'F', 'Florida', 'Miami',           '8600 NW 36th St',            '33166', '305-555-5005', 'sofia.lopez@yahoo.com',       2),
  ('Roberto Perez',      'MED-T006', '1955-04-22', 'M', 'Florida', 'Fort Lauderdale', '1 Financial Plaza Ste 2500', '33394', '954-555-6006', 'roberto.perez@email.com',     1),
  ('Carmen Diaz',        'MED-T007', '1982-12-03', 'F', 'Florida', 'Hialeah',         '699 E 49th St',              '33013', '305-555-7007', 'carmen.diaz@gmail.com',       3),
  ('Miguel Torres',      'MED-T008', '1970-06-18', 'M', 'Florida', 'Miami',           '100 SE 2nd St Floor 32',     '33131', '305-555-8008', 'm.torres@business.net',       2),
  ('Isabella Ramirez',   'MED-T009', '1998-02-28', 'F', 'Florida', 'Orlando',         '6277 Sea Harbor Dr',         '32821', '407-555-9009', 'isabella.r@hotmail.com',      1),
  ('David Morales',      'MED-T010', '1945-08-10', 'M', 'Florida', 'Tampa',           '4830 W Kennedy Blvd',        '33609', '813-555-0010', null,                          3)
ON CONFLICT (member_id) DO NOTHING;

-- -------------------------
-- CITAS PASADAS (Mayo 2026) — aparecen en reportes históricos
-- -------------------------
INSERT INTO appointments (patient_id, doctor_name, specialty, npi, insurance, appointment_date, appointment_time, clinic_name, clinic_state, clinic_city, clinic_address, clinic_ref_number, created_by)
SELECT
  p.id,
  a.doctor_name, a.specialty, a.npi, a.insurance,
  a.appointment_date::date, a.appointment_time::time,
  a.clinic_name, a.clinic_state, a.clinic_city, a.clinic_address, a.clinic_ref_number,
  a.created_by::int
FROM (VALUES
  ('MED-T001', 'Dr. Elena Vasquez',   'Cardiología',      '1122334455', 'Blue Cross Blue Shield', '2026-05-05', '09:00', 'Brickell Medical Center',   'Florida', 'Miami',    '1150 SW 8th St',           'REF-B001', 1),
  ('MED-T004', 'Dr. James Wilson',    'Medicina General', '2233445566', 'Aetna',                  '2026-05-12', '10:30', 'Jacksonville Family Care',  'Florida', 'Jacksonville', '3628 St Johns Ave',     'REF-J001', 2),
  ('MED-T006', 'Dr. Patricia Chen',   'Neurología',       '3344556677', 'United Healthcare',      '2026-05-19', '14:00', 'Broward Neurology Center',  'Florida', 'Fort Lauderdale', '2850 N Commerce Pkwy','REF-FL01', 3),
  ('MED-T003', 'Dr. Antonio Reyes',   'Ortopedia',        '4455667788', 'Cigna',                  '2026-05-26', '08:30', 'Tampa Orthopedic Group',    'Florida', 'Tampa',    '4600 N Habana Ave',        'REF-T001', 1),
  ('MED-T008', 'Dr. Sarah Johnson',   'Medicina General', '2233445566', 'Humana',                 '2026-05-28', '11:00', 'Brickell Medical Center',   'Florida', 'Miami',    '1150 SW 8th St',           'REF-B002', 2)
) AS a(member_id, doctor_name, specialty, npi, insurance, appointment_date, appointment_time, clinic_name, clinic_state, clinic_city, clinic_address, clinic_ref_number, created_by)
JOIN patients p ON p.member_id = a.member_id
WHERE NOT EXISTS (
  SELECT 1 FROM appointments x
  WHERE x.patient_id = p.id AND x.appointment_date = a.appointment_date::date AND x.doctor_name = a.doctor_name
);

-- -------------------------
-- CITAS DE ESTA SEMANA (Junio 2026) — aparecen en reportes del día
-- -------------------------
INSERT INTO appointments (patient_id, doctor_name, specialty, npi, insurance, appointment_date, appointment_time, clinic_name, clinic_state, clinic_city, clinic_address, clinic_ref_number, created_by)
SELECT
  p.id,
  a.doctor_name, a.specialty, a.npi, a.insurance,
  a.appointment_date::date, a.appointment_time::time,
  a.clinic_name, a.clinic_state, a.clinic_city, a.clinic_address, a.clinic_ref_number,
  a.created_by::int
FROM (VALUES
  ('MED-T002', 'Dr. Elena Vasquez',   'Cardiología',      '1122334455', 'Blue Cross Blue Shield', '2026-06-01', '08:00', 'Orlando Heart Institute',   'Florida', 'Orlando',  '1414 Kuhl Ave',            'REF-O001', 1),
  ('MED-T005', 'Dr. James Wilson',    'Medicina General', '2233445566', 'Aetna',                  '2026-06-01', '09:30', 'Hialeah Medical Group',     'Florida', 'Hialeah',  '170 E 49th St',            'REF-H001', 2),
  ('MED-T007', 'Dr. Patricia Chen',   'Neurología',       '3344556677', 'Cigna',                  '2026-06-02', '10:00', 'Miami Neurology Associates','Florida', 'Miami',    '8940 N Kendall Dr Ste 300','REF-M001', 3),
  ('MED-T010', 'Dr. Antonio Reyes',   'Ortopedia',        '4455667788', 'Humana',                 '2026-06-03', '11:30', 'Tampa Orthopedic Group',    'Florida', 'Tampa',    '4600 N Habana Ave',        'REF-T002', 1)
) AS a(member_id, doctor_name, specialty, npi, insurance, appointment_date, appointment_time, clinic_name, clinic_state, clinic_city, clinic_address, clinic_ref_number, created_by)
JOIN patients p ON p.member_id = a.member_id
WHERE NOT EXISTS (
  SELECT 1 FROM appointments x
  WHERE x.patient_id = p.id AND x.appointment_date = a.appointment_date::date AND x.doctor_name = a.doctor_name
);

-- -------------------------
-- CITAS FUTURAS (Junio-Julio 2026) — agenda próxima
-- -------------------------
INSERT INTO appointments (patient_id, doctor_name, specialty, npi, insurance, appointment_date, appointment_time, clinic_name, clinic_state, clinic_city, clinic_address, clinic_ref_number, created_by)
SELECT
  p.id,
  a.doctor_name, a.specialty, a.npi, a.insurance,
  a.appointment_date::date, a.appointment_time::time,
  a.clinic_name, a.clinic_state, a.clinic_city, a.clinic_address, a.clinic_ref_number,
  a.created_by::int
FROM (VALUES
  ('MED-T001', 'Dr. Antonio Reyes',   'Ortopedia',        '4455667788', 'Blue Cross Blue Shield', '2026-06-10', '09:00', 'Brickell Medical Center',   'Florida', 'Miami',    '1150 SW 8th St',           'REF-B003', 2),
  ('MED-T009', 'Dr. Elena Vasquez',   'Cardiología',      '1122334455', 'United Healthcare',      '2026-06-10', '14:30', 'Orlando Heart Institute',   'Florida', 'Orlando',  '1414 Kuhl Ave',            'REF-O002', 1),
  ('MED-T003', 'Dr. James Wilson',    'Medicina General', '2233445566', 'Cigna',                  '2026-06-17', '08:00', 'Tampa Bay Medical Group',   'Florida', 'Tampa',    '2901 W Swann Ave',         'REF-T003', 3),
  ('MED-T006', 'Dr. Sarah Johnson',   'Medicina General', '5566778899', 'Aetna',                  '2026-06-17', '10:00', 'Broward Family Health',     'Florida', 'Fort Lauderdale', '1625 SE 3rd Ave',   'REF-FL02', 2),
  ('MED-T002', 'Dr. Patricia Chen',   'Neurología',       '3344556677', 'Aetna',                  '2026-06-24', '11:00', 'Orlando Neurology Clinic',  'Florida', 'Orlando',  '55 W Gore St',             'REF-O003', 1),
  ('MED-T008', 'Dr. Elena Vasquez',   'Cardiología',      '1122334455', 'Humana',                 '2026-07-07', '09:30', 'Brickell Medical Center',   'Florida', 'Miami',    '1150 SW 8th St',           'REF-B004', 3)
) AS a(member_id, doctor_name, specialty, npi, insurance, appointment_date, appointment_time, clinic_name, clinic_state, clinic_city, clinic_address, clinic_ref_number, created_by)
JOIN patients p ON p.member_id = a.member_id
WHERE NOT EXISTS (
  SELECT 1 FROM appointments x
  WHERE x.patient_id = p.id AND x.appointment_date = a.appointment_date::date AND x.doctor_name = a.doctor_name
);

-- -------------------------
-- RESUMEN
-- -------------------------
DO $$
DECLARE
  total_patients    INT;
  total_appointments INT;
BEGIN
  SELECT COUNT(*) INTO total_patients    FROM patients    WHERE member_id LIKE 'MED-T%';
  SELECT COUNT(*) INTO total_appointments FROM appointments;
  RAISE NOTICE '======================================';
  RAISE NOTICE 'Datos de prueba cargados:';
  RAISE NOTICE '  Pacientes de prueba : %', total_patients;
  RAISE NOTICE '  Total de citas      : %', total_appointments;
  RAISE NOTICE '======================================';
END $$;
