// ========== SERVICE MANAGER ==========
const ServiceManager = {
    // Crear nueva cita
    async createService(serviceData) {
        try {
            // Buscar cliente por nombre
            const cliente = DataStore.clientes.find(c => c.nombre === serviceData.owner);
            const empleado = DataStore.empleados.find(e => e.nombre === serviceData.employee);
            
            // Preparar datos para Supabase
            const supabaseServiceData = {
                id: DataUtils.generateId('A'),
                vehiculo_id: '', // Se puede dejar vacío si no tenemos el ID
                cliente_id: cliente?.id || '',
                fecha: serviceData.date,
                hora: serviceData.time,
                tipo_servicio: serviceData.service,
                empleado_id: empleado?.id || '',
                estado: 'pending',
                notas: serviceData.notes || ''
            };
            
            console.log('Creando servicio en Supabase:', supabaseServiceData);
            const result = await DB.createServicio(supabaseServiceData);
            
            // Actualizar DataStore local
            const newService = {
                id: result.id,
                vehicle: serviceData.vehicle,
                owner: serviceData.owner,
                date: serviceData.date,
                service: serviceData.service,
                phone: serviceData.phone || 'No especificado',
                time: serviceData.time,
                employee: serviceData.employee,
                status: 'pending',
                notes: serviceData.notes || ''
            };
            
            DataStore.services.push(newService);
            return newService;
            
        } catch (error) {
            console.error('Error creando servicio:', error);
            mostrarNotificacion('Error creando servicio: ' + error.message, 'error');
            throw error;
        }
    },
    
    // Actualizar cita existente
    async updateService(serviceId, updates) {
        try {
            console.log('Actualizando servicio:', serviceId, updates);
            const result = await DB.updateServicio(serviceId, updates);
            
            // Actualizar DataStore local
            const index = DataStore.services.findIndex(s => s.id === serviceId);
            if (index !== -1) {
                DataStore.services[index] = { ...DataStore.services[index], ...updates };
            }
            
            return DataStore.services[index];
            
        } catch (error) {
            console.error('Error actualizando servicio:', error);
            mostrarNotificacion('Error actualizando servicio: ' + error.message, 'error');
            throw error;
        }
    },
    
    // Eliminar cita
    async deleteService(serviceId) {
        try {
            await DB.deleteServicio(serviceId);
            
            // Eliminar de DataStore local
            const index = DataStore.services.findIndex(s => s.id === serviceId);
            if (index !== -1) {
                DataStore.services.splice(index, 1);
                return true;
            }
            return false;
            
        } catch (error) {
            console.error('Error eliminando servicio:', error);
            mostrarNotificacion('Error eliminando servicio: ' + error.message, 'error');
            throw error;
        }
    },
    
    // Cambiar estado de cita
    async changeServiceStatus(serviceId, newStatus) {
        return await this.updateService(serviceId, { status: newStatus });
    },
    
    // Completar cita
    async completeService(serviceId) {
        return await this.changeServiceStatus(serviceId, 'completed');
    },
    
    // Poner en proceso
    async startService(serviceId) {
        return await this.changeServiceStatus(serviceId, 'process');
    }
};

// ========== VEHICULO MANAGER ==========
const VehiculoManager = {
    async createVehiculo(vehiculoData) {
        try {
            const supabaseData = {
                id: DataUtils.generateId('V'),
                placa: vehiculoData.placa,
                marca: vehiculoData.marca,
                modelo: vehiculoData.modelo,
                año: vehiculoData.año || '',
                color: vehiculoData.color || '',
                cliente_id: vehiculoData.clienteId,
                kilometraje: vehiculoData.kilometraje || '',
                notas: vehiculoData.notas || ''
            };
            
            console.log('Creando vehículo en Supabase:', supabaseData);
            const result = await DB.createVehiculo(supabaseData);
            
            // Actualizar DataStore local
            const newVehiculo = {
                id: result.id,
                placa: result.placa,
                marca: result.marca,
                modelo: result.modelo,
                año: result.año,
                color: result.color,
                clienteId: result.cliente_id,
                kilometraje: result.kilometraje,
                notas: result.notas
            };
            
            DataStore.vehiculos.push(newVehiculo);
            return newVehiculo;
            
        } catch (error) {
            console.error('Error creando vehículo:', error);
            mostrarNotificacion('Error creando vehículo: ' + error.message, 'error');
            throw error;
        }
    },
    
    async updateVehiculo(vehiculoId, updates) {
        try {
            const supabaseUpdates = {
                placa: updates.placa,
                marca: updates.marca,
                modelo: updates.modelo,
                año: updates.año,
                color: updates.color,
                cliente_id: updates.clienteId,
                kilometraje: updates.kilometraje,
                notas: updates.notas
            };
            
            console.log('Actualizando vehículo:', vehiculoId, supabaseUpdates);
            const result = await DB.updateVehiculo(vehiculoId, supabaseUpdates);
            
            // Actualizar DataStore local
            const index = DataStore.vehiculos.findIndex(v => v.id === vehiculoId);
            if (index !== -1) {
                DataStore.vehiculos[index] = { ...DataStore.vehiculos[index], ...updates };
            }
            
            return DataStore.vehiculos[index];
            
        } catch (error) {
            console.error('Error actualizando vehículo:', error);
            mostrarNotificacion('Error actualizando vehículo: ' + error.message, 'error');
            throw error;
        }
    },
    
    async deleteVehiculo(vehiculoId) {
        try {
            await DB.deleteVehiculo(vehiculoId);
            
            // Eliminar de DataStore local
            const index = DataStore.vehiculos.findIndex(v => v.id === vehiculoId);
            if (index !== -1) {
                DataStore.vehiculos.splice(index, 1);
                return true;
            }
            return false;
            
        } catch (error) {
            console.error('Error eliminando vehículo:', error);
            mostrarNotificacion('Error eliminando vehículo: ' + error.message, 'error');
            throw error;
        }
    }
};

// ========== CLIENTE MANAGER ==========
const ClienteManager = {
    async createCliente(clienteData) {
        try {
            const supabaseData = {
                id: DataUtils.generateId('C'),
                nombre: clienteData.nombre,
                telefono: clienteData.telefono,
                email: clienteData.email || '',
                direccion: clienteData.direccion || '',
                notas: clienteData.notas || ''
            };
            
            console.log('Creando cliente en Supabase:', supabaseData);
            const result = await DB.createCliente(supabaseData);
            
            // Actualizar DataStore local
            const newCliente = {
                id: result.id,
                nombre: result.nombre,
                telefono: result.telefono,
                email: result.email,
                direccion: result.direccion,
                notas: result.notas
            };
            
            DataStore.clientes.push(newCliente);
            return newCliente;
            
        } catch (error) {
            console.error('Error creando cliente:', error);
            mostrarNotificacion('Error creando cliente: ' + error.message, 'error');
            throw error;
        }
    },
    
    async updateCliente(clienteId, updates) {
        try {
            console.log('Actualizando cliente:', clienteId, updates);
            const result = await DB.updateCliente(clienteId, updates);
            
            // Actualizar DataStore local
            const index = DataStore.clientes.findIndex(c => c.id === clienteId);
            if (index !== -1) {
                DataStore.clientes[index] = { ...DataStore.clientes[index], ...updates };
            }
            
            return DataStore.clientes[index];
            
        } catch (error) {
            console.error('Error actualizando cliente:', error);
            mostrarNotificacion('Error actualizando cliente: ' + error.message, 'error');
            throw error;
        }
    },
    
    async deleteCliente(clienteId) {
        try {
            await DB.deleteCliente(clienteId);
            
            // Eliminar de DataStore local
            const index = DataStore.clientes.findIndex(c => c.id === clienteId);
            if (index !== -1) {
                DataStore.clientes.splice(index, 1);
                return true;
            }
            return false;
            
        } catch (error) {
            console.error('Error eliminando cliente:', error);
            mostrarNotificacion('Error eliminando cliente: ' + error.message, 'error');
            throw error;
        }
    }
};

// ========== SERVICIO MANAGER (Tipos de servicio) ==========
const ServicioManager = {
    async createServicio(servicioData) {
        try {
            const supabaseData = {
                id: DataUtils.generateId('TS'),
                nombre: servicioData.nombre,
                descripcion: servicioData.descripcion || '',
                precio: servicioData.precio,
                duracion: servicioData.duracion || '',
                categoria: servicioData.categoria || ''
            };
            
            console.log('Creando tipo de servicio en Supabase:', supabaseData);
            const result = await DB.createTipoServicio(supabaseData);
            
            // Actualizar DataStore local
            const newServicio = {
                id: result.id,
                nombre: result.nombre,
                descripcion: result.descripcion,
                precio: result.precio,
                duracion: result.duracion,
                categoria: result.categoria
            };
            
            DataStore.tiposServicio.push(newServicio);
            return newServicio;
            
        } catch (error) {
            console.error('Error creando tipo de servicio:', error);
            mostrarNotificacion('Error creando tipo de servicio: ' + error.message, 'error');
            throw error;
        }
    },
    
    async updateServicio(servicioId, updates) {
        try {
            console.log('Actualizando tipo de servicio:', servicioId, updates);
            const result = await DB.updateTipoServicio(servicioId, updates);
            
            // Actualizar DataStore local
            const index = DataStore.tiposServicio.findIndex(s => s.id === servicioId);
            if (index !== -1) {
                DataStore.tiposServicio[index] = { ...DataStore.tiposServicio[index], ...updates };
            }
            
            return DataStore.tiposServicio[index];
            
        } catch (error) {
            console.error('Error actualizando tipo de servicio:', error);
            mostrarNotificacion('Error actualizando tipo de servicio: ' + error.message, 'error');
            throw error;
        }
    },
    
    async deleteServicio(servicioId) {
        try {
            await DB.deleteTipoServicio(servicioId);
            
            // Eliminar de DataStore local
            const index = DataStore.tiposServicio.findIndex(s => s.id === servicioId);
            if (index !== -1) {
                DataStore.tiposServicio.splice(index, 1);
                return true;
            }
            return false;
            
        } catch (error) {
            console.error('Error eliminando tipo de servicio:', error);
            mostrarNotificacion('Error eliminando tipo de servicio: ' + error.message, 'error');
            throw error;
        }
    }
};

// ========== EMPLEADO MANAGER ==========
const EmpleadoManager = {
    async createEmpleado(empleadoData) {
        try {
            const supabaseData = {
                id: DataUtils.generateId('E'),
                nombre: empleadoData.nombre,
                especialidad: empleadoData.especialidad || '',
                telefono: empleadoData.telefono || '',
                email: empleadoData.email || '',
                horario: empleadoData.horario || ''
            };
            
            console.log('Creando empleado en Supabase:', supabaseData);
            const result = await DB.createEmpleado(supabaseData);
            
            // Actualizar DataStore local
            const newEmpleado = {
                id: result.id,
                nombre: result.nombre,
                especialidad: result.especialidad,
                telefono: result.telefono,
                email: result.email,
                horario: result.horario
            };
            
            DataStore.empleados.push(newEmpleado);
            return newEmpleado;
            
        } catch (error) {
            console.error('Error creando empleado:', error);
            mostrarNotificacion('Error creando empleado: ' + error.message, 'error');
            throw error;
        }
    },
    
    async updateEmpleado(empleadoId, updates) {
        try {
            console.log('Actualizando empleado:', empleadoId, updates);
            const result = await DB.updateEmpleado(empleadoId, updates);
            
            // Actualizar DataStore local
            const index = DataStore.empleados.findIndex(e => e.id === empleadoId);
            if (index !== -1) {
                DataStore.empleados[index] = { ...DataStore.empleados[index], ...updates };
            }
            
            return DataStore.empleados[index];
            
        } catch (error) {
            console.error('Error actualizando empleado:', error);
            mostrarNotificacion('Error actualizando empleado: ' + error.message, 'error');
            throw error;
        }
    },
    
    async deleteEmpleado(empleadoId) {
        try {
            await DB.deleteEmpleado(empleadoId);
            
            // Eliminar de DataStore local
            const index = DataStore.empleados.findIndex(e => e.id === empleadoId);
            if (index !== -1) {
                DataStore.empleados.splice(index, 1);
                return true;
            }
            return false;
            
        } catch (error) {
            console.error('Error eliminando empleado:', error);
            mostrarNotificacion('Error eliminando empleado: ' + error.message, 'error');
            throw error;
        }
    }
};

// ========== CONFIGURACION MANAGER ==========
const ConfiguracionManager = {
    updateConfiguracion: (updates) => {
        DataStore.configuracion = { ...DataStore.configuracion, ...updates };
        return DataStore.configuracion;
    },
    
    getConfiguracion: () => {
        return DataStore.configuracion;
    }
};

// ========== HELPER FUNCTION ==========
function mostrarNotificacion(mensaje, tipo = 'info') {
    if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
        UIManager.showNotification(mensaje, tipo);
    } else {
        alert(mensaje);
    }
}

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        ServiceManager, 
        VehiculoManager, 
        ClienteManager, 
        ServicioManager, 
        EmpleadoManager, 
        ConfiguracionManager 
    };
} else {
    window.ServiceManager = ServiceManager;
    window.VehiculoManager = VehiculoManager;
    window.ClienteManager = ClienteManager;
    window.ServicioManager = ServicioManager;
    window.EmpleadoManager = EmpleadoManager;
    window.ConfiguracionManager = ConfiguracionManager;
}