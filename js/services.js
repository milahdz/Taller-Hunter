// services.js — sincronizado con esquema real de Supabase

// ========== SERVICE MANAGER (registro_servicio_vehiculo) ==========
const ServiceManager = {
    async createService(serviceData) {
        try {
            const cliente  = DataStore.clientes.find(c => c.nombre === serviceData.owner);
            const empleado = DataStore.empleados.find(e => e.nombre === serviceData.employee);

            const codigoSeg = DataUtils.generateTrackingCode();
            const datos = {
                id:                 DataUtils.generateUUID(),
                codigo_seguimiento: codigoSeg,
                vehiculo_id:        null,
                cliente_id:         cliente?.id || null,
                tipo_servicio_id:   null,
                empleado_id:        String(empleado?.id || ''),
                placa:            serviceData.vehicle || null,
                propietario:      serviceData.owner   || null,
                tipo_servicio:    serviceData.service || null,
                empleado:         serviceData.employee || null,
                fecha:            serviceData.date,
                hora:             serviceData.time    || '08:00:00',
                telefono:         serviceData.phone   || null,
                notas:            serviceData.notes   || null,
                estado:           'Pendiente'
            };

            const result = await DB.createServicio(datos);
            const newService = {
                id:                 result.id,
                codigo_seguimiento: result.codigo_seguimiento || codigoSeg,
                cliente_id:         result.cliente_id || '',
                vehicle:    result.placa       || serviceData.vehicle || 'N/A',
                owner:      result.propietario || serviceData.owner   || 'N/A',
                date:       result.fecha,
                service:    result.tipo_servicio || serviceData.service || 'N/A',
                phone:      result.telefono      || serviceData.phone  || '',
                time:       result.hora          || serviceData.time   || '08:00',
                employee:   result.empleado      || serviceData.employee || 'Sin asignar',
                status:     'pending',
                notes:      result.notas || ''
            };
            DataStore.services.push(newService);
            return newService;
        } catch (e) {
            mostrarNotificacion('Error creando servicio: ' + e.message, 'error');
            throw e;
        }
    },

    async updateService(serviceId, updates) {
        try {
            await DB.updateServicio(serviceId, updates);
            const idx = DataStore.services.findIndex(s => s.id === serviceId);
            if (idx !== -1) DataStore.services[idx] = { ...DataStore.services[idx], ...updates };
            return DataStore.services[idx];
        } catch (e) {
            mostrarNotificacion('Error actualizando servicio: ' + e.message, 'error');
            throw e;
        }
    },

    async deleteService(serviceId) {
        try {
            await DB.deleteServicio(serviceId);
            const idx = DataStore.services.findIndex(s => s.id === serviceId);
            if (idx !== -1) { DataStore.services.splice(idx, 1); return true; }
            return false;
        } catch (e) {
            mostrarNotificacion('Error eliminando servicio: ' + e.message, 'error');
            throw e;
        }
    },

    async changeServiceStatus(serviceId, newStatus) {
        return this.updateService(serviceId, { estado: newStatus });
    },
    async completeService(id) { return this.changeServiceStatus(id, 'Completado'); },
    async startService(id)    { return this.changeServiceStatus(id, 'En Proceso'); },

    async updateProgreso(servicioId, progreso, observaciones) {
        try {
            const userData = JSON.parse(localStorage.getItem('tallerhunter_user') || '{}');
            const usuario  = userData.nombre || 'Sistema';
            await DB.updateProgreso(servicioId, progreso, observaciones, usuario);
            const idx = DataStore.services.findIndex(s => s.id === servicioId);
            if (idx !== -1) DataStore.services[idx].progreso = progreso;

            // Sincronizar estado del servicio según progreso
            const estadoMap = {
                recepcion:   'En Proceso',
                diagnostico: 'En Proceso',
                reparacion:  'En Proceso',
                calidad:     'En Proceso',
                entrega:     'Completado'
            };
            const nuevoEstado = estadoMap[progreso];
            if (nuevoEstado) {
                await DB.updateServicio(servicioId, { estado: nuevoEstado });
                if (idx !== -1) DataStore.services[idx].status = nuevoEstado === 'Completado' ? 'completed' : 'process';
            }
            return DataStore.services[idx];
        } catch (e) {
            mostrarNotificacion('Error actualizando progreso: ' + e.message, 'error');
            throw e;
        }
    }
};

// ========== VEHICULO MANAGER ==========
// Columnas reales: id, placa, modelo, marca, anio, color, cliente, ultimo_servicio, estado, cliente_id
const VehiculoManager = {
    async createVehiculo(vehiculoData) {
        try {
            // id is INTEGER SERIAL auto-generated by Supabase
            const clienteObj = DataStore.clientes.find(c => String(c.id) === String(vehiculoData.clienteId));

            const payload = {
                placa:      vehiculoData.placa,
                marca:      vehiculoData.marca   || null,
                modelo:     vehiculoData.modelo  || null,
                anio:       vehiculoData.anio ? parseInt(vehiculoData.anio) : null,
                color:      vehiculoData.color   || null,
                cliente_id: vehiculoData.clienteId || null,
                cliente:    clienteObj?.nombre   || null,
                estado:     'Activo'
            };

            const result = await DB.createVehiculo(payload);
            const newVehiculo = {
                id:        result.id,
                placa:     result.placa       || '',
                marca:     result.marca       || '',
                modelo:    result.modelo      || '',
                anio:      result.anio        || '',
                color:     result.color       || '',
                clienteId: result.cliente_id  || '',
                cliente:   result.cliente     || clienteObj?.nombre || '',
                estado:    result.estado      || 'Activo'
            };
            DataStore.vehiculos.push(newVehiculo);
            return newVehiculo;
        } catch (e) {
            mostrarNotificacion('Error creando vehículo: ' + e.message, 'error');
            throw e;
        }
    },

    async updateVehiculo(vehiculoId, updates) {
        try {
            const clienteObj = updates.clienteId
                ? DataStore.clientes.find(c => String(c.id) === String(updates.clienteId))
                : null;

            const payload = {
                placa:      updates.placa,
                marca:      updates.marca     || null,
                modelo:     updates.modelo    || null,
                anio:       updates.anio ? parseInt(updates.anio) : null,
                color:      updates.color     || null,
                cliente_id: updates.clienteId || null,
                cliente:    clienteObj?.nombre || null
            };
            await DB.updateVehiculo(vehiculoId, payload);
            const idx = DataStore.vehiculos.findIndex(v => String(v.id) === String(vehiculoId));
            if (idx !== -1) DataStore.vehiculos[idx] = { ...DataStore.vehiculos[idx], ...updates };
            return DataStore.vehiculos[idx];
        } catch (e) {
            mostrarNotificacion('Error actualizando vehículo: ' + e.message, 'error');
            throw e;
        }
    },

    async deleteVehiculo(vehiculoId) {
        try {
            await DB.deleteVehiculo(vehiculoId);
            const idx = DataStore.vehiculos.findIndex(v => String(v.id) === String(vehiculoId));
            if (idx !== -1) { DataStore.vehiculos.splice(idx, 1); return true; }
            return false;
        } catch (e) {
            mostrarNotificacion('Error eliminando vehículo: ' + e.message, 'error');
            throw e;
        }
    }
};

// ========== CLIENTE MANAGER ==========
// Columnas reales: id, nombre, email, telefono  (vehiculos/total_servicios/desde/estado son computed)
const ClienteManager = {
    async createCliente(clienteData) {
        try {
            // clientes table has no DB default — generate UUID here
            const payload = {
                id:       DataUtils.generateUUID(),
                nombre:   clienteData.nombre,
                email:    clienteData.email    || null,
                telefono: clienteData.telefono || null
            };
            const result = await DB.createCliente(payload);
            const newCliente = {
                id:       result.id,
                nombre:   result.nombre   || '',
                telefono: result.telefono || '',
                email:    result.email    || '',
                desde:    result.desde    || '',
                estado:   result.estado   || ''
            };
            DataStore.clientes.push(newCliente);
            return newCliente;
        } catch (e) {
            mostrarNotificacion('Error creando cliente: ' + e.message, 'error');
            throw e;
        }
    },

    async updateCliente(clienteId, updates) {
        try {
            const payload = {
                nombre:   updates.nombre,
                email:    updates.email    || null,
                telefono: updates.telefono || null
            };
            await DB.updateCliente(clienteId, payload);
            const idx = DataStore.clientes.findIndex(c => c.id === clienteId);
            if (idx !== -1) DataStore.clientes[idx] = { ...DataStore.clientes[idx], ...payload };
            return DataStore.clientes[idx];
        } catch (e) {
            mostrarNotificacion('Error actualizando cliente: ' + e.message, 'error');
            throw e;
        }
    },

    async deleteCliente(clienteId) {
        try {
            await DB.deleteCliente(clienteId);
            const idx = DataStore.clientes.findIndex(c => c.id === clienteId);
            if (idx !== -1) { DataStore.clientes.splice(idx, 1); return true; }
            return false;
        } catch (e) {
            mostrarNotificacion('Error eliminando cliente: ' + e.message, 'error');
            throw e;
        }
    }
};

// ========== SERVICIO MANAGER (tipos_servicio) ==========
// Columnas reales: id, codigo, nombre, categoria, duracion, precio_base, descripcion, estado
const ServicioManager = {
    async createServicio(servicioData) {
        try {
            const precio    = parseFloat(servicioData.precio || servicioData.precio_base) || 0;
            const codigoGen = DataUtils.generateId('S');
            const payload = {
                id:          DataUtils.generateUUID(),   // in case table lacks DEFAULT
                codigo:      codigoGen,
                nombre:      servicioData.nombre,
                descripcion: servicioData.descripcion || null,
                precio_base: precio,
                duracion:    servicioData.duracion    || null,
                categoria:   servicioData.categoria   || null,
                estado:      'activo'
            };
            const result = await DB.createTipoServicio(payload);
            const newServicio = {
                id:          result.id,               // UUID from DB
                codigo:      result.codigo      || codigoGen,
                nombre:      result.nombre      || '',
                descripcion: result.descripcion || '',
                precio:      result.precio_base ?? 0,
                duracion:    result.duracion    || '',
                categoria:   result.categoria   || ''
            };
            DataStore.tiposServicio.push(newServicio);
            return newServicio;
        } catch (e) {
            mostrarNotificacion('Error creando tipo de servicio: ' + e.message, 'error');
            throw e;
        }
    },

    async updateServicio(servicioId, updates) {
        try {
            const payload = {
                nombre:      updates.nombre,
                descripcion: updates.descripcion || null,
                precio_base: parseFloat(updates.precio || updates.precio_base) || 0,
                duracion:    updates.duracion    || null,
                categoria:   updates.categoria   || null
            };
            await DB.updateTipoServicio(servicioId, payload);
            const idx = DataStore.tiposServicio.findIndex(s => s.id === servicioId);
            if (idx !== -1) {
                DataStore.tiposServicio[idx] = {
                    ...DataStore.tiposServicio[idx],
                    ...updates,
                    precio: payload.precio_base
                };
            }
            return DataStore.tiposServicio[idx];
        } catch (e) {
            mostrarNotificacion('Error actualizando tipo de servicio: ' + e.message, 'error');
            throw e;
        }
    },

    async deleteServicio(servicioId) {
        try {
            await DB.deleteTipoServicio(servicioId);
            const idx = DataStore.tiposServicio.findIndex(s => s.id === servicioId);
            if (idx !== -1) { DataStore.tiposServicio.splice(idx, 1); return true; }
            return false;
        } catch (e) {
            mostrarNotificacion('Error eliminando tipo de servicio: ' + e.message, 'error');
            throw e;
        }
    }
};

// ========== EMPLEADO MANAGER ==========
const EmpleadoManager = {
    async createEmpleado(empleadoData) {
        try {
            // empleados.id is TEXT — must be provided (no auto-generate in DB)
            const payload = {
                id:           DataUtils.generateUUID(),
                nombre:       empleadoData.nombre,
                especialidad: empleadoData.especialidad || null,
                telefono:     empleadoData.telefono     || null,
                email:        empleadoData.email        || null,
                horario:      empleadoData.horario      || null
            };
            const result = await DB.createEmpleado(payload);
            const newEmpleado = {
                id:           result.id,
                nombre:       result.nombre       || '',
                especialidad: result.especialidad || '',
                telefono:     result.telefono     || '',
                email:        result.email        || '',
                horario:      result.horario      || ''
            };
            DataStore.empleados.push(newEmpleado);
            return newEmpleado;
        } catch (e) {
            mostrarNotificacion('Error creando empleado: ' + e.message, 'error');
            throw e;
        }
    },

    async updateEmpleado(empleadoId, updates) {
        try {
            await DB.updateEmpleado(empleadoId, updates);
            const idx = DataStore.empleados.findIndex(e => e.id === empleadoId);
            if (idx !== -1) DataStore.empleados[idx] = { ...DataStore.empleados[idx], ...updates };
            return DataStore.empleados[idx];
        } catch (e) {
            mostrarNotificacion('Error actualizando empleado: ' + e.message, 'error');
            throw e;
        }
    },

    async deleteEmpleado(empleadoId) {
        try {
            await DB.deleteEmpleado(empleadoId);
            const idx = DataStore.empleados.findIndex(e => e.id === empleadoId);
            if (idx !== -1) { DataStore.empleados.splice(idx, 1); return true; }
            return false;
        } catch (e) {
            mostrarNotificacion('Error eliminando empleado: ' + e.message, 'error');
            throw e;
        }
    }
};

// ========== CONFIGURACION MANAGER ==========
const ConfiguracionManager = {
    updateConfiguracion: (updates) => {
        DataStore.configuracion = { ...DataStore.configuracion, ...updates };
        return DataStore.configuracion;
    },
    getConfiguracion: () => DataStore.configuracion
};

// ========== HELPER ==========
function mostrarNotificacion(mensaje, tipo = 'info') {
    if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
        UIManager.showNotification(mensaje, tipo);
    } else {
        console.error(mensaje);
    }
}

window.ServiceManager   = ServiceManager;
window.VehiculoManager  = VehiculoManager;
window.ClienteManager   = ClienteManager;
window.ServicioManager  = ServicioManager;
window.EmpleadoManager  = EmpleadoManager;
window.ConfiguracionManager = ConfiguracionManager;
