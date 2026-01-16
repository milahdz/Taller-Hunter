// Estado global de la aplicación
const AppState = {
    currentPage: 'agenda',
    currentTab: 'all',
    currentView: 'list',
    editingServiceId: null,
    editingVehiculoId: null,
    editingClienteId: null,
    editingServicioId: null,
    editingEmpleadoId: null
};

// Datos de la aplicación
const DataStore = {
    services: [
        {
            id: "A198272",
            vehicle: "Honda Accord 2020",
            owner: "Jose Jimenez",
            date: "2026-07-31",
            service: "Alineación y Balanceo",
            phone: "8298521218",
            time: "08:34",
            employee: "Juan Pérez",
            status: "completed",
            notes: "Entrega hoy"
        }
    ],
    
    vehiculos: [
        {
            id: "V001",
            placa: "ABC123",
            marca: "Toyota",
            modelo: "Corolla",
            año: "2020",
            color: "Blanco",
            kilometraje: "45000",
            clienteId: "C001",
            notas: ""
        }
    ],
    
    clientes: [
        {
            id: "C001",
            nombre: "Jose Jimenez",
            telefono: "8298521218",
            email: "jose@email.com",
            direccion: "Calle Principal #123",
            notas: "Cliente frecuente"
        }
    ],
    
    tiposServicio: [
        { 
            id: "TS001", 
            nombre: "Alineación y Balanceo", 
            descripcion: "Alineación de ruedas y balanceo de llantas",
            precio: 1500, 
            duracion: "2 horas",
            categoria: "Suspensión"
        },
        { 
            id: "TS002", 
            nombre: "Cambio de Aceite", 
            descripcion: "Cambio de aceite y filtro",
            precio: 800, 
            duracion: "1 hora",
            categoria: "Mantenimiento"
        },
        { 
            id: "TS003", 
            nombre: "Revisión de Frenos", 
            descripcion: "Revisión y reparación del sistema de frenos",
            precio: 1200, 
            duracion: "3 horas",
            categoria: "Frenos"
        }
    ],
    
    empleados: [
        { 
            id: "E001", 
            nombre: "Juan Pérez", 
            especialidad: "Mecánica General",
            telefono: "8091234567",
            email: "juan@taller.com",
            horario: "Matutino (8am-4pm)"
        },
        { 
            id: "E002", 
            nombre: "María García", 
            especialidad: "Electricidad Automotriz",
            telefono: "8097654321",
            email: "maria@taller.com",
            horario: "Completo (8am-5pm)"
        },
        { 
            id: "E003", 
            nombre: "Carlos López", 
            especialidad: "Suspensión",
            telefono: "8099876543",
            email: "carlos@taller.com",
            horario: "Vespertino (1pm-9pm)"
        }
    ],
    
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
        for (let i = 0; i < 6; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    },
    
    formatDate: (dateStr) => {
        const date = new Date(dateStr);
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    },
    
    formatTime: (timeStr) => {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'p.m.' : 'a.m.';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
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
    
    // Buscar por ID
    findServiceById: (id) => DataStore.services.find(s => s.id === id),
    findVehiculoById: (id) => DataStore.vehiculos.find(v => v.id === id),
    findClienteById: (id) => DataStore.clientes.find(c => c.id === id),
    findServicioById: (id) => DataStore.tiposServicio.find(s => s.id === id),
    findEmpleadoById: (id) => DataStore.empleados.find(e => e.id === id),
    
    // Obtener servicios por fecha
    getServicesByDate: (date) => {
        const targetDate = new Date(date);
        return DataStore.services.filter(service => {
            const serviceDate = new Date(service.date);
            return serviceDate.toDateString() === targetDate.toDateString();
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
    }
};
// data.js (al final)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AppState, DataStore, DataUtils };
} else {
    window.DataUtils = DataUtils;
    window.DataStore = DataStore;
    window.AppState = AppState;
}