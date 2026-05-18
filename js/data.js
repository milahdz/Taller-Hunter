// Estado global de la aplicación
const AppState = {
    currentPage: 'agenda',
    currentTab: 'all',
    currentView: 'list',
    currentReport: 'diario',
    currentConfig: 'perfil',
    editingServiceId: null,
    editingVehiculoId: null,
    editingClienteId: null,
    editingServicioId: null,
    editingEmpleadoId: null,
    searchAgenda: '',
    searchVehiculos: '',
    searchClientes: '',
    searchServicios: ''
};

// Datos de la aplicación
const DataStore = {
    services: [],
    
    vehiculos: [],
    
    clientes: [],
    
    tiposServicio: [],
    
    empleados: [],
    
    configuracion: {
        horarioApertura: "08:00",
        horarioCierre: "18:00",
        intervaloCitas: "30",
        notificacionesEmail: true,
        notificacionesSMS: false,
        iva: 18
    }
};

// Funciones de utilidad para datos
const DataUtils = {
    generateId: (prefix = '') => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let id = prefix;
        for (let i = 0; i < 8; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    },

    generateUUID: () => {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    },

    // Genera código de seguimiento legible: TH-YYMMDD-XXXX
    generateTrackingCode: () => {
        const now = new Date();
        const y = String(now.getFullYear()).slice(2);
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let suffix = '';
        for (let i = 0; i < 4; i++) {
            suffix += chars[Math.floor(Math.random() * chars.length)];
        }
        return `TH-${y}${m}${d}-${suffix}`;
    },
    
    formatDate: (dateStr) => {
        if (!dateStr) return 'N/A';
        try {
            // Parse as local noon to avoid UTC offset shifting the day
            const date = new Date(dateStr + 'T12:00:00');
            return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
        } catch (e) {
            return dateStr;
        }
    },
    
    formatTime: (timeStr) => {
        if (!timeStr) return '';
        try {
            const [hours, minutes] = timeStr.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'p.m.' : 'a.m.';
            const hour12 = hour % 12 || 12;
            return `${hour12}:${minutes} ${ampm}`;
        } catch (e) {
            return timeStr;
        }
    },
    
    getTabName: (tab) => {
        const names = {
            'all': 'todos',
            'pending': 'pendientes',
            'process': 'en proceso',
            'completed': 'completados'
        };
        return names[tab] || '';
    },
    
    // Funciones para obtener estadísticas
    getStats: () => {
        const services = DataStore.services;
        return {
            total: services.length,
            pending: services.filter(s => s.status === "pending").length,
            process: services.filter(s => s.status === "process").length,
            completed: services.filter(s => s.status === "completed").length
        };
    },
    
    // Filtrar servicios por estado
    filterServices: (tab) => {
        const services = DataStore.services;
        switch(tab) {
            case 'pending': return services.filter(s => s.status === "pending");
            case 'process': return services.filter(s => s.status === "process");
            case 'completed': return services.filter(s => s.status === "completed");
            default: return services;
        }
    },
    
    // Buscar por ID — String comparison handles mixed int/string IDs from DOM attributes
    findServiceById:  (id) => DataStore.services.find(s => String(s.id) === String(id)),
    findVehiculoById: (id) => DataStore.vehiculos.find(v => String(v.id) === String(id)),
    findClienteById:  (id) => DataStore.clientes.find(c => String(c.id) === String(id)),
    findServicioById: (id) => DataStore.tiposServicio.find(s => String(s.id) === String(id)),
    findEmpleadoById: (id) => DataStore.empleados.find(e => String(e.id) === String(id)),
    
    // Obtener servicios por fecha
    getServicesByDate: (date) => {
        // Compare as ISO date strings to avoid timezone shifting
        const target = typeof date === 'string' ? date.split('T')[0] : date.toISOString().split('T')[0];
        return DataStore.services.filter(service => {
            return (service.date || '').split('T')[0] === target;
        });
    },
    
    // Obtener servicios por empleado
    getServicesByEmployee: (employeeName) => {
        return DataStore.services.filter(service => service.employee === employeeName);
    },
    
    // Obtener vehículos por cliente
    getVehiculosByCliente: (clienteId) => {
        return DataStore.vehiculos.filter(vehiculo => vehiculo.clienteId === clienteId);
    },
    
    // Formatear precio
    formatPrecio: (precio) => {
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP'
        }).format(precio);
    },
    
    // Acortar texto
    truncateText: (text, maxLength = 50) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
};

// Exportar para uso global
window.DataUtils = DataUtils;
window.DataStore = DataStore;
window.AppState = AppState;