// db.js — sincronizado con esquema real de Supabase
const DB = {

    // ===== SERVICIOS (registro_servicio_vehiculo) =====
    async getServicios() {
        try {
            const { data, error } = await supabase
                .from('registro_servicio_vehiculo')
                .select('*')
                .order('fecha', { ascending: false });
            if (error) { console.error('Error servicios:', error); return []; }
            return data || [];
        } catch (e) { console.error(e); return []; }
    },

    async crearServicio(datos) {
        try {
            const { data, error } = await supabase
                .from('registro_servicio_vehiculo')
                .insert([datos])
                .select()
                .single();
            if (error) throw error;
            return data;
        } catch (e) { console.error('Error creando servicio:', e); throw e; }
    },

    async actualizarServicio(id, datos) {
        try {
            const { data, error } = await supabase
                .from('registro_servicio_vehiculo')
                .update(datos)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        } catch (e) { console.error('Error actualizando servicio:', e); throw e; }
    },

    async eliminarServicio(id) {
        try {
            const { error } = await supabase
                .from('registro_servicio_vehiculo')
                .delete()
                .eq('id', id);
            if (error) throw error;
            return true;
        } catch (e) { console.error('Error eliminando servicio:', e); throw e; }
    },

    // Aliases en inglés
    async createServicio(d) { return this.crearServicio(d); },
    async updateServicio(id, d) { return this.actualizarServicio(id, d); },
    async deleteServicio(id) { return this.eliminarServicio(id); },

    // ===== BÚSQUEDA POR CÓDIGO DE SEGUIMIENTO =====
    async buscarServicioPorCodigo(codigo) {
        try {
            const c = String(codigo).trim().toUpperCase();

            // 1. Buscar en codigo_seguimiento (columna nueva)
            const { data: d1, error: e1 } = await supabase
                .from('registro_servicio_vehiculo')
                .select('*')
                .eq('codigo_seguimiento', c)
                .maybeSingle();
            if (!e1 && d1) return d1;

            // 2. Fallback: buscar en id (registros anteriores a la migración)
            const { data: d2, error: e2 } = await supabase
                .from('registro_servicio_vehiculo')
                .select('*')
                .eq('id', c)
                .maybeSingle();
            if (!e2 && d2) return d2;

            return null;
        } catch (e) { console.error('Error buscando código:', e); return null; }
    },

    // ===== CLIENTES =====
    // Columnas reales: id, nombre, email, telefono, vehiculos, total_servicios, desde, estado
    async getTodosClientes() {
        try {
            const { data, error } = await supabase
                .from('clientes')
                .select('id, nombre, email, telefono, vehiculos, total_servicios, desde, estado')
                .order('nombre', { ascending: true })
                .limit(200);
            if (error) { console.error('Error clientes:', error); return []; }
            return data || [];
        } catch (e) { console.error(e); return []; }
    },

    async createCliente(datos) {
        try {
            // clientes table has no DEFAULT on id — always provide a UUID from the caller
            const payload = {
                id:       datos.id,
                nombre:   datos.nombre,
                email:    datos.email    || null,
                telefono: datos.telefono || null
            };
            const { data, error } = await supabase
                .from('clientes')
                .insert([payload])
                .select()
                .single();
            if (error) throw error;
            return data;
        } catch (e) { console.error('Error creando cliente:', e); throw e; }
    },

    async updateCliente(id, datos) {
        try {
            const payload = {};
            if (datos.nombre   !== undefined) payload.nombre   = datos.nombre;
            if (datos.email    !== undefined) payload.email    = datos.email    || null;
            if (datos.telefono !== undefined) payload.telefono = datos.telefono || null;
            const { data, error } = await supabase
                .from('clientes')
                .update(payload)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        } catch (e) { console.error('Error actualizando cliente:', e); throw e; }
    },

    async deleteCliente(id) {
        try {
            const { error } = await supabase.from('clientes').delete().eq('id', id);
            if (error) throw error;
            return true;
        } catch (e) { console.error('Error eliminando cliente:', e); throw e; }
    },

    // ===== VEHÍCULOS =====
    // Columnas reales: id, placa, modelo, marca, anio, color, cliente, ultimo_servicio, estado, cliente_id
    async getTodosVehiculos() {
        try {
            const { data, error } = await supabase
                .from('vehiculos')
                .select('id, placa, modelo, marca, anio, color, cliente, ultimo_servicio, estado, cliente_id')
                .order('placa', { ascending: true })
                .limit(200);
            if (error) { console.error('Error vehiculos:', error); return []; }
            return data || [];
        } catch (e) { console.error(e); return []; }
    },

    async createVehiculo(datos) {
        try {
            // id is INTEGER SERIAL auto-generated — do NOT send it
            // anio must be integer or null (not empty string)
            const payload = {
                placa:      datos.placa,
                marca:      datos.marca       || null,
                modelo:     datos.modelo      || null,
                anio:       datos.anio ? parseInt(datos.anio) : null,
                color:      datos.color       || null,
                cliente_id: datos.cliente_id  || null,
                cliente:    datos.cliente     || null,
                estado:     datos.estado      || 'Activo'
            };
            const { data, error } = await supabase
                .from('vehiculos')
                .insert([payload])
                .select()
                .single();
            if (error) throw error;
            return data;
        } catch (e) { console.error('Error creando vehículo:', e); throw e; }
    },

    async updateVehiculo(id, datos) {
        try {
            const payload = {};
            if (datos.placa      !== undefined) payload.placa      = datos.placa;
            if (datos.marca      !== undefined) payload.marca      = datos.marca;
            if (datos.modelo     !== undefined) payload.modelo     = datos.modelo;
            if (datos.anio       !== undefined) payload.anio       = datos.anio ? parseInt(datos.anio) : null;
            if (datos.color      !== undefined) payload.color      = datos.color;
            if (datos.cliente_id !== undefined) payload.cliente_id = datos.cliente_id;
            if (datos.cliente    !== undefined) payload.cliente    = datos.cliente;
            if (datos.estado     !== undefined) payload.estado     = datos.estado;
            const { data, error } = await supabase
                .from('vehiculos')
                .update(payload)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        } catch (e) { console.error('Error actualizando vehículo:', e); throw e; }
    },

    async deleteVehiculo(id) {
        try {
            const { error } = await supabase.from('vehiculos').delete().eq('id', id);
            if (error) throw error;
            return true;
        } catch (e) { console.error('Error eliminando vehículo:', e); throw e; }
    },

    // ===== TIPOS DE SERVICIO =====
    // Columnas reales: id, codigo, nombre, categoria, duracion, precio_base, descripcion, estado
    async getTodosTiposServicio() {
        try {
            const { data, error } = await supabase
                .from('tipos_servicio')
                .select('id, codigo, nombre, categoria, duracion, precio_base, descripcion, estado')
                .order('nombre', { ascending: true })
                .limit(200);
            if (error) { console.error('Error tipos_servicio:', error); return []; }
            return data || [];
        } catch (e) { console.error(e); return []; }
    },

    async createTipoServicio(datos) {
        try {
            // tipos_servicio may also have no DEFAULT on id — provide UUID from caller
            const payload = {
                ...(datos.id ? { id: datos.id } : {}),
                codigo:      datos.codigo      || null,
                nombre:      datos.nombre,
                descripcion: datos.descripcion || null,
                precio_base: datos.precio_base ?? datos.precio ?? 0,
                duracion:    datos.duracion    || null,
                categoria:   datos.categoria   || null,
                estado:      datos.estado      || 'activo'
            };
            const { data, error } = await supabase
                .from('tipos_servicio')
                .insert([payload])
                .select()
                .single();
            if (error) throw error;
            return data;
        } catch (e) { console.error('Error creando tipo servicio:', e); throw e; }
    },

    async updateTipoServicio(id, datos) {
        try {
            const payload = {};
            if (datos.nombre      !== undefined) payload.nombre      = datos.nombre;
            if (datos.descripcion !== undefined) payload.descripcion = datos.descripcion;
            if (datos.precio_base !== undefined) payload.precio_base = datos.precio_base;
            if (datos.precio      !== undefined) payload.precio_base = datos.precio; // alias
            if (datos.duracion    !== undefined) payload.duracion    = datos.duracion;
            if (datos.categoria   !== undefined) payload.categoria   = datos.categoria;
            if (datos.estado      !== undefined) payload.estado      = datos.estado;
            const { data, error } = await supabase
                .from('tipos_servicio')
                .update(payload)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        } catch (e) { console.error('Error actualizando tipo servicio:', e); throw e; }
    },

    async deleteTipoServicio(id) {
        try {
            const { error } = await supabase.from('tipos_servicio').delete().eq('id', id);
            if (error) throw error;
            return true;
        } catch (e) { console.error('Error eliminando tipo servicio:', e); throw e; }
    },

    // ===== EMPLEADOS =====
    // Columnas: id, nombre, especialidad, telefono, email, horario  ← ya coincide
    async getTodosEmpleados() {
        try {
            const { data, error } = await supabase
                .from('empleados')
                .select('id, nombre, especialidad, telefono, email, horario')
                .order('nombre', { ascending: true })
                .limit(200);
            if (error) { console.error('Error empleados:', error); return []; }
            return data || [];
        } catch (e) { console.error(e); return []; }
    },

    async createEmpleado(datos) {
        try {
            const payload = {
                id:           datos.id,
                nombre:       datos.nombre,
                especialidad: datos.especialidad || null,
                telefono:     datos.telefono     || null,
                email:        datos.email        || null,
                horario:      datos.horario      || null
            };
            const { data, error } = await supabase
                .from('empleados')
                .insert([payload])
                .select()
                .single();
            if (error) throw error;
            return data;
        } catch (e) { console.error('Error creando empleado:', e); throw e; }
    },

    async updateEmpleado(id, datos) {
        try {
            const payload = {};
            if (datos.nombre       !== undefined) payload.nombre       = datos.nombre;
            if (datos.especialidad !== undefined) payload.especialidad = datos.especialidad;
            if (datos.telefono     !== undefined) payload.telefono     = datos.telefono;
            if (datos.email        !== undefined) payload.email        = datos.email;
            if (datos.horario      !== undefined) payload.horario      = datos.horario;
            const { data, error } = await supabase
                .from('empleados')
                .update(payload)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        } catch (e) { console.error('Error actualizando empleado:', e); throw e; }
    },

    async deleteEmpleado(id) {
        try {
            const { error } = await supabase.from('empleados').delete().eq('id', id);
            if (error) throw error;
            return true;
        } catch (e) { console.error('Error eliminando empleado:', e); throw e; }
    },

    // ===== DATOS PARA FORMULARIOS =====
    async getDatosParaFormularios() {
        const [clientes, vehiculos, tipos, empleados] = await Promise.all([
            this.getTodosClientes(),
            this.getTodosVehiculos(),
            this.getTodosTiposServicio(),
            this.getTodosEmpleados()
        ]);
        return { clientes: clientes || [], vehiculos: vehiculos || [], tipos: tipos || [], empleados: empleados || [] };
    },

    // ===== PROGRESO DEL VEHÍCULO =====
    async updateProgreso(servicioId, estadoVehiculo, observaciones, usuario) {
        const _esErrorDeEsquema = (e) =>
            e?.message?.includes('schema cache') ||
            e?.message?.includes('column') ||
            e?.code === 'PGRST204' ||
            String(e?.message).includes('estadoVehiculo') ||
            String(e?.message).includes('progreso');

        // 1. Guardar estadoVehiculo y observaciones en el servicio
        try {
            const { error } = await supabase
                .from('registro_servicio_vehiculo')
                .update({ estadoVehiculo, observaciones: observaciones || null })
                .eq('id', servicioId);

            if (error) {
                if (_esErrorDeEsquema(error)) {
                    console.warn(
                        '⚠️ La columna "estadoVehiculo" aún no existe en la BD.\n' +
                        '   Ejecuta migrations/agregar_progreso.sql en Supabase SQL Editor.'
                    );
                } else {
                    throw error;
                }
            }
        } catch (e) {
            if (!_esErrorDeEsquema(e)) throw e;
        }

        // 2. Guardar en historial_progreso
        try {
            await supabase
                .from('historial_progreso')
                .insert([{
                    servicio_id:    servicioId,
                    estadoVehiculo,
                    observaciones:  observaciones || null,
                    usuario:        usuario || 'Sistema'
                }]);
        } catch (e2) {
            console.warn('⚠️ Tabla historial_progreso no existe aún.', e2?.message);
        }

        return { id: servicioId, estadoVehiculo };
    },

    async getHistorialProgreso(servicioId) {
        try {
            const { data, error } = await supabase
                .from('historial_progreso')
                .select('*')
                .eq('servicio_id', servicioId)
                .order('created_at', { ascending: true });
            if (error) return [];
            return data || [];
        } catch (e) { return []; }
    },

    // ===== TEST DE CONEXIÓN =====
    async testConexion() {
        const tablas = ['clientes', 'vehiculos', 'tipos_servicio', 'empleados', 'registro_servicio_vehiculo'];
        const resultados = {};
        for (const tabla of tablas) {
            const { data, error } = await supabase.from(tabla).select('*').limit(1);
            resultados[tabla] = error ? { error: error.message } : { ok: true, rows: data?.length };
            console.log(error ? `❌ ${tabla}: ${error.message}` : `✅ ${tabla}: ok`);
        }
        return resultados;
    }
};

window.DB = DB;
