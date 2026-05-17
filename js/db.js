// db.js - COMPLETO CON TODOS LOS MÉTODOS CRUD
const DB = {

    // ==================== SERVICIOS ====================
    async getServicios() {
        try {
            const { data, error } = await supabase
                .from('registro_servicio_vehiculo')
                .select('*')
                .order('fecha', { ascending: false });
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('❌ Error getServicios:', error);
            return [];
        }
    },

    async crearServicio(datos) {
        try {
            if (!datos.id) datos.id = `SVC_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
            const { data, error } = await supabase
                .from('registro_servicio_vehiculo')
                .insert([datos])
                .select()
                .single();
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Error crearServicio:', error);
            throw error;
        }
    },

    // alias usado por services.js
    async createServicio(datos) { return this.crearServicio(datos); },

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
        } catch (error) {
            console.error('❌ Error actualizarServicio:', error);
            throw error;
        }
    },

    // alias usado por services.js
    async updateServicio(id, datos) { return this.actualizarServicio(id, datos); },

    async eliminarServicio(id) {
        try {
            const { error } = await supabase
                .from('registro_servicio_vehiculo')
                .delete()
                .eq('id', id);
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('❌ Error eliminarServicio:', error);
            throw error;
        }
    },

    // alias
    async deleteServicio(id) { return this.eliminarServicio(id); },

    // ==================== CLIENTES ====================
    async getClientes() {
        try {
            const { data, error } = await supabase
                .from('clientes')
                .select('*')
                .order('nombre', { ascending: true });
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('❌ Error getClientes:', error);
            return [];
        }
    },

    async createCliente(datos) {
        try {
            if (!datos.id) datos.id = `CLI_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
            const { data, error } = await supabase
                .from('clientes')
                .insert([datos])
                .select()
                .single();
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Error createCliente:', error);
            throw error;
        }
    },

    async updateCliente(id, datos) {
        try {
            const { data, error } = await supabase
                .from('clientes')
                .update(datos)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Error updateCliente:', error);
            throw error;
        }
    },

    async deleteCliente(id) {
        try {
            const { error } = await supabase
                .from('clientes')
                .delete()
                .eq('id', id);
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('❌ Error deleteCliente:', error);
            throw error;
        }
    },

    // ==================== VEHÍCULOS ====================
    async getVehiculos() {
        try {
            const { data, error } = await supabase
                .from('vehiculos')
                .select('*')
                .order('marca', { ascending: true });
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('❌ Error getVehiculos:', error);
            return [];
        }
    },

    async createVehiculo(datos) {
        try {
            if (!datos.id) datos.id = `VEH_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
            const { data, error } = await supabase
                .from('vehiculos')
                .insert([datos])
                .select()
                .single();
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Error createVehiculo:', error);
            throw error;
        }
    },

    async updateVehiculo(id, datos) {
        try {
            const { data, error } = await supabase
                .from('vehiculos')
                .update(datos)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Error updateVehiculo:', error);
            throw error;
        }
    },

    async deleteVehiculo(id) {
        try {
            const { error } = await supabase
                .from('vehiculos')
                .delete()
                .eq('id', id);
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('❌ Error deleteVehiculo:', error);
            throw error;
        }
    },

    // ==================== TIPOS DE SERVICIO ====================
    async getTiposServicio() {
        try {
            const { data, error } = await supabase
                .from('tipos_servicio')
                .select('*')
                .order('nombre', { ascending: true });
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('❌ Error getTiposServicio:', error);
            return [];
        }
    },

    async createTipoServicio(datos) {
        try {
            if (!datos.id) datos.id = `TS_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
            const { data, error } = await supabase
                .from('tipos_servicio')
                .insert([datos])
                .select()
                .single();
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Error createTipoServicio:', error);
            throw error;
        }
    },

    async updateTipoServicio(id, datos) {
        try {
            const { data, error } = await supabase
                .from('tipos_servicio')
                .update(datos)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Error updateTipoServicio:', error);
            throw error;
        }
    },

    async deleteTipoServicio(id) {
        try {
            const { error } = await supabase
                .from('tipos_servicio')
                .delete()
                .eq('id', id);
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('❌ Error deleteTipoServicio:', error);
            throw error;
        }
    },

    // ==================== EMPLEADOS ====================
    async getEmpleados() {
        try {
            const { data, error } = await supabase
                .from('empleados')
                .select('*')
                .order('nombre', { ascending: true });
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('❌ Error getEmpleados:', error);
            return [];
        }
    },

    async createEmpleado(datos) {
        try {
            if (!datos.id) datos.id = `EMP_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
            const { data, error } = await supabase
                .from('empleados')
                .insert([datos])
                .select()
                .single();
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Error createEmpleado:', error);
            throw error;
        }
    },

    async updateEmpleado(id, datos) {
        try {
            const { data, error } = await supabase
                .from('empleados')
                .update(datos)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Error updateEmpleado:', error);
            throw error;
        }
    },

    async deleteEmpleado(id) {
        try {
            const { error } = await supabase
                .from('empleados')
                .delete()
                .eq('id', id);
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('❌ Error deleteEmpleado:', error);
            throw error;
        }
    },

    // ==================== HELPERS / COMPATIBILIDAD ====================
    async getTodosClientes() { return this.getClientes(); },
    async getTodosVehiculos() { return this.getVehiculos(); },
    async getTodosTiposServicio() { return this.getTiposServicio(); },
    async getTodosEmpleados() { return this.getEmpleados(); },

    async getDatosParaFormularios() {
        const [clientes, vehiculos, tipos, empleados] = await Promise.all([
            this.getClientes(),
            this.getVehiculos(),
            this.getTiposServicio(),
            this.getEmpleados()
        ]);
        return { clientes, vehiculos, tipos, empleados };
    },

    async testConexion() {
        const tablas = ['clientes', 'vehiculos', 'tipos_servicio', 'empleados', 'registro_servicio_vehiculo'];
        const resultados = {};
        for (const tabla of tablas) {
            const { data, error } = await supabase.from(tabla).select('*').limit(1);
            resultados[tabla] = error ? { error: error.message } : { ok: true, count: data.length };
            console.log(error ? `❌ ${tabla}: ${error.message}` : `✅ ${tabla}`);
        }
        return resultados;
    }
};

window.DB = DB;
