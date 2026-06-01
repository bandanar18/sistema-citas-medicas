-- ============================================================
-- SEED: Usuarios iniciales del sistema
-- Contraseñas iniciales (deben cambiarse después del primer uso):
--   jefa        → Jefa@2024
--   asistente1  → Asistente1@2024
--   asistente2  → Asistente2@2024
-- ============================================================

INSERT INTO users (username, password_hash, full_name, role) VALUES
  (
    'jefa',
    '$2a$12$qJVkcfXnPV2bX9m/oAnxFeYCNFwVLqKix1XmetaCyNaHpLTvlipZO',
    'Jefa del Sistema',
    'boss'
  ),
  (
    'asistente1',
    '$2a$12$a64Z3CRkr0l5Lbfr79v7n.e3yCP8miLi0CimIgiYL40Hb9SDFr1Im',
    'Asistente Virtual 1',
    'assistant'
  ),
  (
    'asistente2',
    '$2a$12$WATDqBFP9Vzwv/Q0y7.jhePZVYna49O.IJ6.eJbTQGpxcfFFvgAoi',
    'Asistente Virtual 2',
    'assistant'
  )
ON CONFLICT (username) DO NOTHING;
