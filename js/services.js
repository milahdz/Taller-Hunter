// Servicios CRUD para citas/agendamientos
const ServiceManager = {
    // Crear nueva cita
    createService: (serviceData) => {
        const newService = {
            id: DataUtils.generateId('A'),
            ...serviceData,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        DataStore.services.push(newService);
        return newService;
    },
    
    // Actualizar cita existente
    updateService: (serviceId, updates) => {
        const index = DataStore.services.findIndex(s => s.id === serviceId);
        if (index !== -1) {
            DataStore.services[index] = { ...DataStore.services[index], ...updates };
            return DataStore.services[index];
        }
        return null;
    },
    
    // Eliminar cita
    deleteService: (serviceId) => {
        const index = DataStore.services.findIndex(s => s.id === serviceId);
        if (index !== -1) {
            return DataStore.services.splice(index, 1)[0];
        }
        return null;
    },
    
    // Cambiar estado de cita
    changeServiceStatus: (serviceId, newStatus) => {
        return ServiceManager.updateService(serviceId, { status: newStatus });
    },
    
    // Completar cita
    completeService: (serviceId) => {
        return ServiceManager.changeServiceStatus(serviceId, 'completed');
    },
    
    // Poner en proceso
    startService: (serviceId) => {
        return ServiceManager.changeServiceStatus(serviceId, 'process');
    }
};

// Gestión de vehículos
const VehiculoManager = {
    createVehiculo: (vehiculoData) => {
        const newVehiculo = {
            id: DataUtils.generateId('V'),
            ...vehiculoData
        };
        
        DataStore.vehiculos.push(newVehiculo);
        return newVehiculo;
    },
    
    updateVehiculo: (vehiculoId, updates) => {
        const index = DataStore.vehiculos.findIndex(v => v.id === vehiculoId);
        if (index !== -1) {
            DataStore.vehiculos[index] = { ...DataStore.vehiculos[index], ...updates };
            return DataStore.vehiculos[index];
        }
        return null;
    },
    
    deleteVehiculo: (vehiculoId) => {
        const index = DataStore.vehiculos.findIndex(v => v.id === vehiculoId);
        if (index !== -1) {
            return DataStore.vehiculos.splice(index, 1)[0];
        }
        return null;
    }
};

// Gestión de clientes
const ClienteManager = {
    createCliente: (clienteData) => {
        const newCliente = {
            id: DataUtils.generateId('C'),
            ...clienteData
        };
        
        DataStore.clientes.push(newCliente);
        return newCliente;
    },
    
    updateCliente: (clienteId, updates) => {
        const index = DataStore.clientes.findIndex(c => c.id === clienteId);
        if (index !== -1) {
            DataStore.clientes[index] = { ...DataStore.clientes[index], ...updates };
            return DataStore.clientes[index];
        }
        return null;
    },
    
    deleteCliente: (clienteId) => {
        const index = DataStore.clientes.findIndex(c => c.id === clienteId);
        if (index !== -1) {
            return DataStore.clientes.splice(index, 1)[0];
        }
        return null;
    }
};

// Gestión de tipos de servicio
const ServicioManager = {
    createServicio: (servicioData) => {
        const newServicio = {
            id: DataUtils.generateId('TS'),
            ...servicioData
        };
        
        DataStore.tiposServicio.push(newServicio);
        return newServicio;
    },
    
    updateServicio: (servicioId, updates) => {
        const index = DataStore.tiposServicio.findIndex(s => s.id === servicioId);
        if (index !== -1) {
            DataStore.tiposServicio[index] = { ...DataStore.tiposServicio[index], ...updates };
            return DataStore.tiposServicio[index];
        }
        return null;
    },
    
    deleteServicio: (servicioId) => {
        const index = DataStore.tiposServicio.findIndex(s => s.id === servicioId);
        if (index !== -1) {
            return DataStore.tiposServicio.splice(index, 1)[0];
        }
        return null;
    }
};

// Gestión de empleados
const EmpleadoManager = {
    createEmpleado: (empleadoData) => {
        const newEmpleado = {
            id: DataUtils.generateId('E'),
            ...empleadoData
        };
        
        DataStore.empleados.push(newEmpleado);
        return newEmpleado;
    },
    
    updateEmpleado: (empleadoId, updates) => {
        const index = DataStore.empleados.findIndex(e => e.id === empleadoId);
        if (index !== -1) {
            DataStore.empleados[index] = { ...DataStore.empleados[index], ...updates };
            return DataStore.empleados[index];
        }
        return null;
    },
    
    deleteEmpleado: (empleadoId) => {
        const index = DataStore.empleados.findIndex(e => e.id === empleadoId);
        if (index !== -1) {
            return DataStore.empleados.splice(index, 1)[0];
        }
        return null;
    }
};

// Gestión de configuración
const ConfiguracionManager = {
    updateConfiguracion: (updates) => {
        DataStore.configuracion = { ...DataStore.configuracion, ...updates };
        return DataStore.configuracion;
    },
    
    getConfiguracion: () => {
        return DataStore.configuracion;
    }
};// services.js (al final)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ServiceManager, VehiculoManager, ClienteManager, ServicioManager, EmpleadoManager, ConfiguracionManager };
} else {
    window.ServiceManager = ServiceManager;
    window.VehiculoManager = VehiculoManager;
    window.ClienteManager = ClienteManager;
    window.ServicioManager = ServicioManager;
    window.EmpleadoManager = EmpleadoManager;
    window.ConfiguracionManager = ConfiguracionManager;
}