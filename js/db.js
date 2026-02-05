// db.js - COMPLETO Y ACTUALIZADO
const DB = {
    // ===== OBTENER SERVICIOS =====
    async getServicios() {
        try {
            console.log('📡 Obteniendo servicios de Supabase...');
            
            const { data: servicios, error } = await supabase
                .from('registro_servicio_vehiculo')
                .select('*')
                .order('fecha', { ascending: false })
                .order('hora', { ascending: false });
            
            if (error) {
                console.error('❌ Error obteniendo servicios:', error);
                return [];
            }
            
            console.log(`📊 Servicios obtenidos: ${servicios?.length || 0} registros`);
            return servicios || [];
            
        } catch (error) {
            console.error('❌ Error cargando servicios:', error);
            return [];
        }
    },
    
    // ===== CREAR SERVICIO =====
    async crearServicio(datos) {
        try {
            console.log('➕ Creando servicio en DB...', datos);
            
            // Asegurar que todos los campos tengan valor
            const datosLimpios = {};
            for (const key in datos) {
                datosLimpios[key] = datos[key] === null ? '' : datos[key];
            }
            
            // Verificar que tenga ID
            if (!datosLimpios.id) {
                datosLimpios.id = `SVC_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
                console.log('⚠️ Generando ID automático:', datosLimpios.id);
            }
            
            const { data, error } = await supabase
                .from('registro_servicio_vehiculo')
                .insert([datosLimpios])
                .select()
                .single();
            
            if (error) {
                console.error('❌ Error de Supabase:', error);
                throw error;
            }
            
            console.log('✅ Servicio creado en DB:', data);
            return data;
            
        } catch (error) {
            console.error('❌ Error creando servicio:', error);
            throw error;
        }
    },
    
    // ===== OBTENER DATOS PARA FORMULARIOS =====
    async getDatosParaFormularios() {
        try {
            const [clientes, vehiculos, tipos, empleados] = await Promise.all([
                this.getTodosClientes(),
                this.getTodosVehiculos(),
                this.getTodosTiposServicio(),
                this.getTodosEmpleados()
            ]);
            
            console.log('📋 Datos para formularios:', {
                clientes: clientes.length,
                vehiculos: vehiculos.length,
                tipos: tipos.length,
                empleados: empleados.length
            });
            
            return {
                clientes: clientes || [],
                vehiculos: vehiculos || [],
                tipos: tipos || [],
                empleados: empleados || []
            };
            
        } catch (error) {
            console.error('Error obteniendo datos:', error);
            return { clientes: [], vehiculos: [], tipos: [], empleados: [] };
        }
    },
    
    async getTodosClientes() {
        try {
            const { data, error } = await supabase
                .from('clientes')
                .select('id, telefono')
                .order('id', { ascending: true })
                .limit(100);
            
            if (error) {
                console.error('Error clientes:', error);
                return [];
            }
            return data || [];
        } catch (e) {
            console.error('Excepción clientes:', e);
            return [];
        }
    },
    
    async getTodosVehiculos() {
        try {
            const { data, error } = await supabase
                .from('vehiculos')
                .select('id, color, cliente_id')
                .order('id', { ascending: true })
                .limit(100);
            
            if (error) {
                console.error('Error vehiculos:', error);
                return [];
            }
            return data || [];
        } catch (e) {
            console.error('Excepción vehiculos:', e);
            return [];
        }
    },
    
    async getTodosTiposServicio() {
        try {
            const { data, error } = await supabase
                .from('tipos_servicio')
                .select('id, descripcion, precio_base')
                .order('descripcion', { ascending: true })
                .limit(100);
            
            if (error) {
                console.error('Error tipos servicio:', error);
                return [];
            }
            return data || [];
        } catch (e) {
            console.error('Excepción tipos servicio:', e);
            return [];
        }
    },
    
    async getTodosEmpleados() {
        try {
            const { data, error } = await supabase
                .from('empleados')
                .select('id, especialidad, telefono')
                .order('id', { ascending: true })
                .limit(100);
            
            if (error) {
                console.error('Error empleados:', error);
                return [];
            }
            return data || [];
        } catch (e) {
            console.error('Excepción empleados:', e);
            return [];
        }
    },
    
    // ===== ACTUALIZAR SERVICIO =====
    async actualizarServicio(id, datos) {
        try {
            console.log('✏️ Actualizando servicio:', id, datos);
            
            const { data, error } = await supabase
                .from('registro_servicio_vehiculo')
                .update(datos)
                .eq('id', id)
                .select()
                .single();
            
            if (error) {
                console.error('❌ Error actualizando:', error);
                throw error;
            }
            
            console.log('✅ Servicio actualizado:', data);
            return data;
            
        } catch (error) {
            console.error('❌ Error en actualizarServicio:', error);
            throw error;
        }
    },
    
    // ===== ELIMINAR SERVICIO =====
    async eliminarServicio(id) {
        try {
            console.log('🗑️ Eliminando servicio:', id);
            
            const { error } = await supabase
                .from('registro_servicio_vehiculo')
                .delete()
                .eq('id', id);
            
            if (error) {
                console.error('❌ Error eliminando:', error);
                throw error;
            }
            
            console.log('✅ Servicio eliminado:', id);
            return true;
            
        } catch (error) {
            console.error('❌ Error en eliminarServicio:', error);
            throw error;
        }
    },
    
    // ===== TEST DE CONEXIÓN =====
    async testConexion() {
        console.log('🧪 Test de conexión...');
        
        try {
            const tablas = ['clientes', 'vehiculos', 'tipos_servicio', 'empleados', 'registro_servicio_vehiculo'];
            const resultados = {};
            
            for (let tabla of tablas) {
                const { data, error } = await supabase
                    .from(tabla)
                    .select('*')
                    .limit(1);
                
                if (error) {
                    resultados[tabla] = { error: error.message };
                    console.log(`❌ ${tabla}: ${error.message}`);
                } else {
                    resultados[tabla] = { count: data.length };
                    console.log(`✅ ${tabla}: ${data.length} registros`);
                }
            }
            
            return { success: true, resultados };
            
        } catch (error) {
            console.error('Error test:', error);
            return { success: false, error: error.message };
        }
    }
};

// Exportar para uso global
window.DB = DB;