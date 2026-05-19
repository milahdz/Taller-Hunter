-- ============================================================
-- MIGRACIÓN: Sistema de Progreso del Vehículo
--
-- INSTRUCCIONES:
--   1. Abre Supabase → SQL Editor
--   2. Pega TODO este archivo y ejecuta (Run)
--   3. Espera el mensaje "Success" en cada bloque
-- ============================================================


-- ─────────────────────────────────────────────────────────────
-- BLOQUE 1: Columna "progreso" en registro_servicio_vehiculo
-- ─────────────────────────────────────────────────────────────
ALTER TABLE registro_servicio_vehiculo
ADD COLUMN IF NOT EXISTS progreso TEXT
    CHECK (progreso IN (
        'recepcion',
        'diagnostico',
        'reparacion',
        'calidad',
        'entrega'
    ));

-- ─────────────────────────────────────────────────────────────
-- BLOQUE 2: Tabla historial_progreso
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS historial_progreso (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    servicio_id   UUID        NOT NULL
                              REFERENCES registro_servicio_vehiculo(id)
                              ON DELETE CASCADE,
    progreso      TEXT        NOT NULL
                              CHECK (progreso IN (
                                  'recepcion','diagnostico',
                                  'reparacion','calidad','entrega'
                              )),
    observaciones TEXT,
    usuario       TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índice para búsquedas por servicio
CREATE INDEX IF NOT EXISTS idx_historial_progreso_servicio
    ON historial_progreso (servicio_id);

-- ─────────────────────────────────────────────────────────────
-- BLOQUE 3: Permisos (RLS)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE historial_progreso ENABLE ROW LEVEL SECURITY;

-- Eliminar política anterior si existe y recrear
DROP POLICY IF EXISTS "allow_all_historial" ON historial_progreso;

CREATE POLICY "allow_all_historial"
    ON historial_progreso
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────
-- BLOQUE 4: Refresco del schema cache de PostgREST
-- (OBLIGATORIO — sin esto Supabase sigue mostrando el error)
-- ─────────────────────────────────────────────────────────────
NOTIFY pgrst, 'reload schema';

-- ─────────────────────────────────────────────────────────────
-- BLOQUE 5: Fix del constraint vehiculos_estado_check
-- ─────────────────────────────────────────────────────────────
ALTER TABLE vehiculos
    DROP CONSTRAINT IF EXISTS vehiculos_estado_check;

ALTER TABLE vehiculos
    ADD CONSTRAINT vehiculos_estado_check
    CHECK (estado IN ('Activo', 'Inactivo', 'En Servicio', 'Vendido'));

-- Normalizar filas existentes con minúsculas
UPDATE vehiculos SET estado = 'Activo'   WHERE lower(estado) = 'activo';
UPDATE vehiculos SET estado = 'Inactivo' WHERE lower(estado) = 'inactivo';
UPDATE vehiculos SET estado = 'Vendido'  WHERE lower(estado) = 'vendido';

-- ─────────────────────────────────────────────────────────────
-- VERIFICACIÓN: ejecuta esto para confirmar que todo quedó bien
-- ─────────────────────────────────────────────────────────────
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'registro_servicio_vehiculo'
--   AND column_name = 'progreso';
--
-- SELECT * FROM historial_progreso LIMIT 1;
