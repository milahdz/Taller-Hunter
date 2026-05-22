-- ============================================================
-- FIX: Constraint de estado en registro_servicio_vehiculo
-- Permite los valores: Pendiente, En Proceso, Completado, Cancelado
--
-- INSTRUCCIONES:
--   1. Abre Supabase → SQL Editor
--   2. Pega todo este archivo y ejecuta (Run)
-- ============================================================

-- Eliminar el constraint actual
ALTER TABLE registro_servicio_vehiculo
    DROP CONSTRAINT IF EXISTS registro_servicio_vehiculo_estado_check;

-- Recrearlo con todos los valores necesarios
ALTER TABLE registro_servicio_vehiculo
    ADD CONSTRAINT registro_servicio_vehiculo_estado_check
    CHECK (estado IN ('Pendiente', 'En Proceso', 'Completado', 'Cancelado'));

-- Refrescar schema cache de PostgREST (obligatorio)
NOTIFY pgrst, 'reload schema';
