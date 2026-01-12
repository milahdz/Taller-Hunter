// Datos iniciales
let services = [
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
];

// Estado de la aplicación
let currentTab = "all";
let currentView = "list";
let editingServiceId = null;

// Elementos del DOM
const totalCountEl = document.getElementById('totalCount');
const pendingCountEl = document.getElementById('pendingCount');
const processCountEl = document.getElementById('processCount');
const completedCountEl = document.getElementById('completedCount');
const tabs = document.querySelectorAll('.tab');
const viewBtns = document.querySelectorAll('.view-btn');
const listViewEl = document.getElementById('listView');
const weekViewEl = document.getElementById('weekView');
const calendarViewEl = document.getElementById('calendarView');
const viewTitleEl = document.getElementById('viewTitle');
const addVehicleBtn = document.getElementById('addVehicleBtn');
const scheduleModal = document.getElementById('scheduleModal');
const closeModalBtn = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const saveBtn = document.getElementById('saveBtn');
const scheduleForm = document.getElementById('scheduleForm');

// Inicializar la aplicación
function initApp() {
    console.log("Taller Hunter - Sistema inicializando...");
    updateStats();
    renderServices();
    setupWeekView();
    setupCalendarView();
    
    // Configurar eventos
    setupEventListeners();
    
    // Configurar fecha mínima en el formulario (hoy)
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').min = today;
    
    // Establecer fecha por defecto (mañana)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('date').value = tomorrow.toISOString().split('T')[0];
    
    console.log("Sistema listo para usar");
}

// Actualizar estadísticas
function updateStats() {
    const total = services.length;
    const pending = services.filter(s => s.status === "pending").length;
    const process = services.filter(s => s.status === "process").length;
    const completed = services.filter(s => s.status === "completed").length;
    
    totalCountEl.textContent = total;
    pendingCountEl.textContent = pending;
    processCountEl.textContent = process;
    completedCountEl.textContent = completed;
}

// Generar ID único para nuevos servicios
function generateId() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    let id = 'A';
    
    for (let i = 0; i < 5; i++) {
        id += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    
    return id;
}

// Formatear fecha para mostrar
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

// Formatear hora para mostrar
function formatTime(timeStr) {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'p.m.' : 'a.m.';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
}

// Obtener nombre de pestaña
function getTabName(tab) {
    switch(tab) {
        case 'all': return 'todos';
        case 'pending': return 'pendientes';
        case 'process': return 'en proceso';
        case 'completed': return 'completados';
        default: return '';
    }
}

// Renderizar servicios según la pestaña activa
function renderServices() {
    // Filtrar servicios según la pestaña activa
    let filteredServices = services;
    if (currentTab === "pending") {
        filteredServices = services.filter(s => s.status === "pending");
    } else if (currentTab === "process") {
        filteredServices = services.filter(s => s.status === "process");
    } else if (currentTab === "completed") {
        filteredServices = services.filter(s => s.status === "completed");
    }
    
    // Limpiar lista actual
    listViewEl.innerHTML = "";
    
    // Si no hay servicios, mostrar mensaje
    if (filteredServices.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <i class="fas fa-car"></i>
            <h4>No hay servicios</h4>
            <p>${currentTab === 'all' ? 'No hay servicios agendados' : `No hay servicios ${getTabName(currentTab)}`}</p>
        `;
        listViewEl.appendChild(emptyState);
        return;
    }
    
    // Crear tabla para mostrar los servicios
    const tableContainer = document.createElement('div');
    tableContainer.className = 'table-responsive';
    tableContainer.innerHTML = `
        <table class="services-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Vehículo</th>
                    <th>Cliente</th>
                    <th>Fecha</th>
                    <th>Servicio</th>
                    <th>Empleado</th>
                    <th>Teléfono</th>
                    <th>Hora</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody id="servicesTableBody">
                <!-- Las filas se llenarán con JavaScript -->
            </tbody>
        </table>
    `;
    
    listViewEl.appendChild(tableContainer);
    const tableBody = document.getElementById('servicesTableBody');
    
    // Renderizar cada servicio en la tabla
    filteredServices.forEach(service => {
        const row = document.createElement('tr');
        
        // Determinar el estado
        let statusText, statusClass, statusIcon;
        switch(service.status) {
            case 'pending':
                statusText = 'Pendiente';
                statusClass = 'status-pending';
                statusIcon = 'fas fa-clock';
                break;
            case 'process':
                statusText = 'En Proceso';
                statusClass = 'status-in-process';
                statusIcon = 'fas fa-tools';
                break;
            case 'completed':
                statusText = 'Completado';
                statusClass = 'status-completed';
                statusIcon = 'fas fa-check-circle';
                break;
        }
        
        row.innerHTML = `
            <td><strong>${service.id}</strong></td>
            <td>${service.vehicle}</td>
            <td>${service.owner}</td>
            <td>${formatDate(service.date)}</td>
            <td>${service.service}</td>
            <td>${service.employee || 'No asignado'}</td>
            <td>${service.phone}</td>
            <td>${formatTime(service.time)}</td>
            <td>
                <span class="service-status ${statusClass}" style="margin: 0;">
                    <i class="${statusIcon}"></i>
                    <span>${statusText}</span>
                </span>
            </td>
            <td>
                <div class="action-buttons" style="margin: 0; justify-content: center;">
                    ${service.status !== 'completed' ? `
                    <button class="action-btn btn-complete" data-id="${service.id}" title="Completar">
                        <i class="fas fa-check"></i>
                    </button>` : ''}
                    <button class="action-btn btn-edit" data-id="${service.id}" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn btn-delete" data-id="${service.id}" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Agregar eventos a los botones de acción
    document.querySelectorAll('.btn-complete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const serviceId = e.currentTarget.getAttribute('data-id');
            completeService(serviceId);
        });
    });
    
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const serviceId = e.currentTarget.getAttribute('data-id');
            editService(serviceId);
        });
    });
    
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const serviceId = e.currentTarget.getAttribute('data-id');
            deleteService(serviceId);
        });
    });
}

// Configurar vista de semana
function setupWeekView() {
    const calendarContainer = weekViewEl.querySelector('.calendar-container');
    calendarContainer.innerHTML = '';
    
    // Obtener fecha actual
    const today = new Date();
    
    // Generar los próximos 7 días
    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(today.getDate() + i);
        
        const dayNames = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];
        const dayName = dayNames[date.getDay()];
        const dayNumber = date.getDate();
        
        // Filtrar servicios para este día
        const dayServices = services.filter(service => {
            const serviceDate = new Date(service.date);
            return serviceDate.getDate() === date.getDate() && 
                   serviceDate.getMonth() === date.getMonth() && 
                   serviceDate.getFullYear() === date.getFullYear();
        });
        
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        
        if (dayServices.length === 0) {
            dayEl.innerHTML = `
                <div class="day-header">
                    <div class="day-name">${dayName}</div>
                    <div class="day-number">${dayNumber}</div>
                </div>
                <div class="no-schedule">Sin agenda</div>
            `;
        } else {
            let servicesHTML = '';
            dayServices.forEach(service => {
                servicesHTML += `
                    <div class="service-card" style="margin: 0.5rem 0; padding: 0.75rem; font-size: 0.875rem;">
                        <div class="service-id" style="font-size: 1rem;">${service.id}</div>
                        <div class="service-vehicle">${service.vehicle}</div>
                        <div>${service.owner}</div>
                        <div><strong>Empleado:</strong> ${service.employee}</div>
                        <div class="detail-label">${formatTime(service.time)}</div>
                    </div>
                `;
            });
            
            dayEl.innerHTML = `
                <div class="day-header">
                    <div class="day-name">${dayName}</div>
                    <div class="day-number">${dayNumber}</div>
                </div>
                ${servicesHTML}
            `;
        }
        
        calendarContainer.appendChild(dayEl);
    }
}

// Configurar vista de calendario
function setupCalendarView() {
    const calendarContainer = calendarViewEl.querySelector('.calendar-container');
    calendarContainer.innerHTML = '';
    
    // Obtener el mes actual
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Obtener el primer día del mes
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    
    // Días de la semana
    const dayNames = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'];
    
    // Crear encabezados de días
    dayNames.forEach(dayName => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day';
        dayHeader.style.minHeight = 'auto';
        dayHeader.style.padding = '0.5rem';
        dayHeader.style.fontWeight = '600';
        dayHeader.style.backgroundColor = 'var(--gray-100)';
        dayHeader.textContent = dayName;
        calendarContainer.appendChild(dayHeader);
    });
    
    // Espacios en blanco para días anteriores al primer día
    const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    for (let i = 0; i < firstDayOfWeek; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day';
        emptyDay.style.backgroundColor = 'transparent';
        calendarContainer.appendChild(emptyDay);
    }
    
    // Crear días del mes
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(currentYear, currentMonth, day);
        const dayOfWeek = date.getDay();
        const dayName = dayNames[dayOfWeek === 0 ? 6 : dayOfWeek - 1];
        
        // Filtrar servicios para este día
        const dayServices = services.filter(service => {
            const serviceDate = new Date(service.date);
            return serviceDate.getDate() === day && 
                   serviceDate.getMonth() === currentMonth && 
                   serviceDate.getFullYear() === currentYear;
        });
        
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        
        if (dayServices.length === 0) {
            dayEl.innerHTML = `
                <div class="day-header">
                    <div class="day-name">${dayName}</div>
                    <div class="day-number">${day}</div>
                </div>
                <div class="no-schedule">Sin agenda</div>
            `;
        } else {
            let servicesHTML = '';
            dayServices.forEach(service => {
                let statusDot = '';
                switch(service.status) {
                    case 'pending': statusDot = '🔴'; break;
                    case 'process': statusDot = '🟡'; break;
                    case 'completed': statusDot = '🟢'; break;
                }
                
                servicesHTML += `
                    <div class="service-card" style="margin: 0.25rem 0; padding: 0.5rem; font-size: 0.75rem;">
                        <div>${statusDot} ${service.id}</div>
                        <div style="font-weight: 600;">${service.vehicle}</div>
                        <div>${service.owner}</div>
                        <div><small>${service.employee}</small></div>
                        <div>${formatTime(service.time)}</div>
                    </div>
                `;
            });
            
            dayEl.innerHTML = `
                <div class="day-header">
                    <div class="day-name">${dayName}</div>
                    <div class="day-number">${day}</div>
                </div>
                ${servicesHTML}
            `;
        }
        
        // Destacar el día actual
        if (day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
            dayEl.style.border = '2px solid var(--primary)';
        }
        
        calendarContainer.appendChild(dayEl);
    }
}

// Cambiar vista
function changeView(view) {
    currentView = view;
    
    // Actualizar botones de vista
    viewBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-view') === view) {
            btn.classList.add('active');
        }
    });
    
    // Mostrar la vista correspondiente
    listViewEl.style.display = 'none';
    weekViewEl.style.display = 'none';
    calendarViewEl.style.display = 'none';
    
    switch(view) {
        case 'list':
            listViewEl.style.display = 'block';
            viewTitleEl.textContent = 'Lista de Servicios';
            break;
        case 'week':
            weekViewEl.style.display = 'block';
            viewTitleEl.textContent = 'Vista Semanal';
            setupWeekView();
            break;
        case 'calendar':
            calendarViewEl.style.display = 'block';
            viewTitleEl.textContent = 'Calendario';
            setupCalendarView();
            break;
    }
}

// Cambiar pestaña
function changeTab(tab) {
    currentTab = tab;
    
    // Actualizar pestañas activas
    tabs.forEach(tabEl => {
        tabEl.classList.remove('active');
        if (tabEl.getAttribute('data-tab') === tab) {
            tabEl.classList.add('active');
        }
    });
    
    // Renderizar servicios filtrados
    renderServices();
}

// Abrir modal para agendar vehículo
function openScheduleModal() {
    scheduleModal.style.display = 'flex';
    scheduleForm.reset();
    
    // Restaurar texto del botón
    saveBtn.textContent = 'Guardar';
    editingServiceId = null;
    
    // Establecer fecha por defecto (mañana)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('date').value = tomorrow.toISOString().split('T')[0];
    
    // Establecer hora por defecto
    document.getElementById('time').value = '08:30';
}

// Cerrar modal
function closeScheduleModal() {
    scheduleModal.style.display = 'none';
    scheduleForm.reset();
    editingServiceId = null;
}

// Guardar nuevo servicio
function saveService() {
    // Validar formulario
    if (!scheduleForm.checkValidity()) {
        scheduleForm.reportValidity();
        return;
    }
    
    // Obtener valores del formulario
    const plate = document.getElementById('plate').value;
    const owner = document.getElementById('owner').value;
    const model = document.getElementById('model').value;
    const phone = document.getElementById('phone').value;
    const serviceType = document.getElementById('service').value;
    const employee = document.getElementById('employee').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const notes = document.getElementById('notes').value;
    
    let newService;
    
    if (editingServiceId) {
        // Actualizar servicio existente
        newService = {
            id: editingServiceId,
            vehicle: model || `${plate} (Sin modelo)`,
            owner: owner,
            date: date,
            service: serviceType,
            employee: employee,
            phone: phone || 'No especificado',
            time: time || '08:00',
            status: 'pending',
            notes: notes || ''
        };
        
        // Reemplazar el servicio en la lista
        const index = services.findIndex(s => s.id === editingServiceId);
        if (index !== -1) {
            services[index] = newService;
        }
        
        alert(`Servicio ${editingServiceId} actualizado exitosamente`);
    } else {
        // Crear nuevo servicio
        newService = {
            id: generateId(),
            vehicle: model || `${plate} (Sin modelo)`,
            owner: owner,
            date: date,
            service: serviceType,
            employee: employee,
            phone: phone || 'No especificado',
            time: time || '08:00',
            status: 'pending',
            notes: notes || ''
        };
        
        // Agregar a la lista
        services.push(newService);
        
        alert(`Vehículo agendado exitosamente con ID: ${newService.id}`);
    }
    
    // Actualizar interfaz
    updateStats();
    renderServices();
    setupWeekView();
    setupCalendarView();
    
    // Cerrar modal
    closeScheduleModal();
}

// Completar servicio
function completeService(serviceId) {
    const serviceIndex = services.findIndex(s => s.id === serviceId);
    if (serviceIndex !== -1) {
        services[serviceIndex].status = 'completed';
        updateStats();
        renderServices();
        setupWeekView();
        setupCalendarView();
        alert(`Servicio ${serviceId} marcado como completado`);
    }
}

// Editar servicio
function editService(serviceId) {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;
    
    // Rellenar formulario con datos del servicio
    document.getElementById('plate').value = service.id;
    document.getElementById('owner').value = service.owner;
    document.getElementById('model').value = service.vehicle;
    document.getElementById('phone').value = service.phone;
    document.getElementById('service').value = service.service;
    document.getElementById('employee').value = service.employee || '';
    document.getElementById('date').value = service.date;
    document.getElementById('time').value = service.time;
    document.getElementById('notes').value = service.notes || '';
    
    // Cambiar texto del botón
    saveBtn.textContent = 'Actualizar';
    editingServiceId = serviceId;
    
    // Abrir modal
    scheduleModal.style.display = 'flex';
}

// Eliminar servicio
function deleteService(serviceId) {
    if (confirm('¿Está seguro de que desea eliminar este servicio?')) {
        const serviceIndex = services.findIndex(s => s.id === serviceId);
        if (serviceIndex !== -1) {
            services.splice(serviceIndex, 1);
            updateStats();
            renderServices();
            setupWeekView();
            setupCalendarView();
            alert(`Servicio ${serviceId} eliminado exitosamente`);
        }
    }
}

// Configurar eventos
function setupEventListeners() {
    console.log("Configurando eventos...");
    
    // Eventos de pestañas
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            changeTab(tabId);
        });
    });
    
    // Eventos de botones de vista
    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.getAttribute('data-view');
            changeView(view);
        });
    });
    
    // Eventos del modal
    addVehicleBtn.addEventListener('click', openScheduleModal);
    closeModalBtn.addEventListener('click', closeScheduleModal);
    cancelBtn.addEventListener('click', closeScheduleModal);
    
    // Cerrar modal al hacer clic fuera
    scheduleModal.addEventListener('click', (e) => {
        if (e.target === scheduleModal) {
            closeScheduleModal();
        }
    });
    
    // Guardar servicio
    saveBtn.addEventListener('click', saveService);
    
    // Permitir guardar con Enter en el formulario
    scheduleForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveService();
    });
    
    // Eventos de navegación
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            // Cambiar el título según la página seleccionada
            const page = item.getAttribute('data-page');
            const header = document.querySelector('.header h2');
            
            switch(page) {
                case 'agenda':
                    header.textContent = 'Sistema de Gestión de Agenda';
                    break;
                case 'vehiculos':
                    header.textContent = 'Gestión de Vehículos';
                    break;
                case 'clientes':
                    header.textContent = 'Gestión de Clientes';
                    break;
                case 'servicios':
                    header.textContent = 'Tipos de Servicios';
                    break;
                case 'reportes':
                    header.textContent = 'Reportes y Estadísticas';
                    break;
                case 'configuracion':
                    header.textContent = 'Configuración del Sistema';
                    break;
            }
        });
    });
    
    console.log("Eventos configurados correctamente");
}

// Inicializar la aplicación cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', initApp);