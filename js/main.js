// main.js - Punto de entrada principal
document.addEventListener('DOMContentLoaded', () => {
    console.log('=== TALLER HUNTER INICIANDO ===');
    
    // Inicializar
    initApp();
    
    // Configurar eventos
    setupEventListeners();
    
    console.log('=== APP LISTA ===');
});

function initApp() {
    console.log('Inicializando aplicación...');
    
    // Configurar fecha mínima en formularios
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('date');
    if (dateInput) {
        dateInput.min = today;
        
        // Fecha por defecto (mañana)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateInput.value = tomorrow.toISOString().split('T')[0];
    }
    
    // Cargar página inicial
    cargarPagina('agenda');
}

function setupEventListeners() {
    console.log('Configurando eventos...');
    
    // 1. NAVEGACIÓN PRINCIPAL
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.getAttribute('data-page');
            console.log('Navegando a:', page);
            
            // Actualizar clase activa
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            // Cambiar página
            cargarPagina(page);
        });
    });
    
    // 2. BOTONES DE AGREGAR
    // Agenda - Agendar vehículo
    const addVehicleBtn = document.getElementById('addVehicleBtn');
    if (addVehicleBtn) {
        addVehicleBtn.addEventListener('click', () => {
            abrirModalAgenda();
        });
    }
    
    // Vehículos - Nuevo vehículo
    const addVehiculoBtn = document.getElementById('addVehiculoBtn');
    if (addVehiculoBtn) {
        addVehiculoBtn.addEventListener('click', () => {
            abrirModalVehiculo();
        });
    }
    
    // Clientes - Nuevo cliente
    const addClienteBtn = document.getElementById('addClienteBtn');
    if (addClienteBtn) {
        addClienteBtn.addEventListener('click', () => {
            abrirModalCliente();
        });
    }
    
    // Servicios - Nuevo servicio
    const addServicioBtn = document.getElementById('addServicioBtn');
    if (addServicioBtn) {
        addServicioBtn.addEventListener('click', () => {
            abrirModalServicio();
        });
    }
    
    // 3. TABS DE AGENDA
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            console.log('Cambiando tab a:', tabId);
            
            // Actualizar clase activa
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Cambiar tab
            AppState.currentTab = tabId;
            if (AppState.currentPage === 'agenda') {
                renderAgenda();
            }
        });
    });
    
    // 4. VISTAS DE AGENDA (Lista, Semana, Calendario)
    document.querySelectorAll('#agendaContent .view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.getAttribute('data-view');
            console.log('Cambiando vista a:', view);
            
            // Actualizar clase activa
            document.querySelectorAll('#agendaContent .view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Cambiar vista
            AppState.currentView = view;
            if (AppState.currentPage === 'agenda') {
                cambiarVistaAgenda(view);
            }
        });
    });
    
    // 5. EVENTOS DE MODALES (si los módulos están cargados)
    setTimeout(() => {
        if (typeof ModalManager !== 'undefined') {
            ModalManager.setupModalEvents();
        }
    }, 500);
}

// FUNCIONES PRINCIPALES
function cargarPagina(pagina) {
    console.log('Cargando página:', pagina);
    
    // Ocultar todo el contenido primero
    document.querySelectorAll('#dynamicContent > .content-area').forEach(el => {
        el.style.display = 'none';
    });
    
    // Actualizar estado
    AppState.currentPage = pagina;
    
    // Mostrar/ocultar elementos según la página
    const statsContainer = document.getElementById('statsContainer');
    const tabsContainer = document.getElementById('tabsContainer');
    const printBtn = document.getElementById('printBtn');
    const addVehicleBtn = document.getElementById('addVehicleBtn');
    const pageTitle = document.getElementById('pageTitle');
    
    if (pagina === 'agenda') {
        // Mostrar elementos de agenda
        document.getElementById('agendaContent').style.display = 'block';
        if (statsContainer) statsContainer.style.display = 'grid';
        if (tabsContainer) tabsContainer.style.display = 'flex';
        if (printBtn) printBtn.style.display = 'inline-flex';
        if (addVehicleBtn) addVehicleBtn.style.display = 'inline-flex';
        if (pageTitle) pageTitle.textContent = 'Sistema de Gestión de Agenda';
        
        // Cargar contenido de agenda
        renderAgenda();
        actualizarEstadisticas();
    } else {
        // Ocultar elementos de agenda
        if (statsContainer) statsContainer.style.display = 'none';
        if (tabsContainer) tabsContainer.style.display = 'none';
        if (printBtn) printBtn.style.display = 'none';
        if (addVehicleBtn) addVehicleBtn.style.display = 'none';
        
        // Mostrar página específica
        document.getElementById(`${pagina}Content`).style.display = 'block';
        
        // Actualizar título
        if (pageTitle) {
            const titulos = {
                'vehiculos': 'Gestión de Vehículos',
                'clientes': 'Gestión de Clientes',
                'servicios': 'Tipos de Servicios',
                'reportes': 'Reportes y Estadísticas',
                'configuracion': 'Configuración del Sistema'
            };
            pageTitle.textContent = titulos[pagina] || 'Taller Hunter';
        }
        
        // Renderizar contenido específico
        switch(pagina) {
            case 'vehiculos':
                renderVehiculos();
                break;
            case 'clientes':
                renderClientes();
                break;
            case 'servicios':
                renderServicios();
                break;
            case 'reportes':
                renderReportes();
                break;
            case 'configuracion':
                renderConfiguracion();
                break;
        }
    }
}

// RENDERIZADO DE CONTENIDO
function renderAgenda() {
    if (AppState.currentView === 'list') {
        renderListaServicios();
    } else if (AppState.currentView === 'week') {
        renderVistaSemanal();
    } else if (AppState.currentView === 'calendar') {
        renderVistaCalendario();
    }
}

function cambiarVistaAgenda(vista) {
    AppState.currentView = vista;
    
    // Ocultar todas las vistas
    document.getElementById('listView').style.display = 'none';
    document.getElementById('weekView').style.display = 'none';
    document.getElementById('calendarView').style.display = 'none';
    
    // Actualizar título
    const viewTitle = document.getElementById('viewTitle');
    if (viewTitle) {
        const titulos = {
            'list': 'Lista de Servicios',
            'week': 'Vista Semanal',
            'calendar': 'Calendario'
        };
        viewTitle.textContent = titulos[vista] || 'Vista';
    }
    
    // Mostrar vista seleccionada
    switch(vista) {
        case 'list':
            document.getElementById('listView').style.display = 'block';
            renderListaServicios();
            break;
        case 'week':
            document.getElementById('weekView').style.display = 'block';
            renderVistaSemanal();
            break;
        case 'calendar':
            document.getElementById('calendarView').style.display = 'block';
            renderVistaCalendario();
            break;
    }
}

function renderListaServicios() {
    const container = document.getElementById('listView');
    if (!container) return;
    
    // Filtrar servicios según tab activo
    let servicios = DataStore.services || [];
    if (AppState.currentTab === 'pending') {
        servicios = servicios.filter(s => s.status === 'pending');
    } else if (AppState.currentTab === 'process') {
        servicios = servicios.filter(s => s.status === 'process');
    } else if (AppState.currentTab === 'completed') {
        servicios = servicios.filter(s => s.status === 'completed');
    }
    
    if (servicios.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-car"></i>
                <h4>No hay servicios</h4>
                <p>${AppState.currentTab === 'all' ? 'No hay servicios agendados' : `No hay servicios ${AppState.currentTab}`}</p>
            </div>
        `;
        return;
    }
    
    // Crear tabla HTML
    let tablaHTML = `
        <div class="table-responsive">
            <table class="services-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Vehículo</th>
                        <th>Cliente</th>
                        <th>Fecha</th>
                        <th>Servicio</th>
                        <th>Empleado</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    servicios.forEach(servicio => {
        let statusText, statusClass, statusIcon;
        switch(servicio.status) {
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
            default:
                statusText = 'Desconocido';
                statusClass = 'status-pending';
                statusIcon = 'fas fa-question';
        }
        
        tablaHTML += `
            <tr>
                <td><strong>${servicio.id}</strong></td>
                <td>${servicio.vehicle}</td>
                <td>${servicio.owner}</td>
                <td>${DataUtils ? DataUtils.formatDate(servicio.date) : servicio.date}</td>
                <td>${servicio.service}</td>
                <td>${servicio.employee || 'No asignado'}</td>
                <td>
                    <span class="service-status ${statusClass}">
                        <i class="${statusIcon}"></i>
                        <span>${statusText}</span>
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        ${servicio.status !== 'completed' ? `
                        <button class="action-btn btn-complete" onclick="completarServicio('${servicio.id}')" title="Completar">
                            <i class="fas fa-check"></i>
                        </button>` : ''}
                        <button class="action-btn btn-edit" onclick="editarServicio('${servicio.id}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn btn-delete" onclick="eliminarServicio('${servicio.id}')" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tablaHTML += `
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = tablaHTML;
}

function renderVistaSemanal() {
    const container = document.querySelector('#weekView .calendar-container');
    if (!container) return;
    
    container.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--gray-600);">
            <i class="fas fa-calendar-week" style="font-size: 3rem; margin-bottom: 1rem;"></i>
            <h3>Vista Semanal</h3>
            <p>Esta funcionalidad estará disponible próximamente</p>
        </div>
    `;
}

function renderVistaCalendario() {
    const container = document.querySelector('#calendarView .calendar-container');
    if (!container) return;
    
    container.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--gray-600);">
            <i class="fas fa-calendar-alt" style="font-size: 3rem; margin-bottom: 1rem;"></i>
            <h3>Calendario</h3>
            <p>Esta funcionalidad estará disponible próximamente</p>
        </div>
    `;
}

function actualizarEstadisticas() {
    const servicios = DataStore.services || [];
    const total = servicios.length;
    const pending = servicios.filter(s => s.status === "pending").length;
    const process = servicios.filter(s => s.status === "process").length;
    const completed = servicios.filter(s => s.status === "completed").length;
    
    const totalEl = document.getElementById('totalCount');
    const pendingEl = document.getElementById('pendingCount');
    const processEl = document.getElementById('processCount');
    const completedEl = document.getElementById('completedCount');
    
    if (totalEl) totalEl.textContent = total;
    if (pendingEl) pendingEl.textContent = pending;
    if (processEl) processEl.textContent = process;
    if (completedEl) completedEl.textContent = completed;
}

// FUNCIONES PARA BOTONES DE ACCIÓN
function completarServicio(serviceId) {
    if (ServiceManager && ServiceManager.completeService) {
        ServiceManager.completeService(serviceId);
        actualizarEstadisticas();
        renderListaServicios();
        mostrarNotificacion('Servicio completado exitosamente', 'success');
    } else {
        // Fallback si el módulo no está cargado
        const servicios = DataStore.services || [];
        const servicio = servicios.find(s => s.id === serviceId);
        if (servicio) {
            servicio.status = 'completed';
            actualizarEstadisticas();
            renderListaServicios();
            mostrarNotificacion('Servicio completado exitosamente', 'success');
        }
    }
}

function editarServicio(serviceId) {
    if (ModalManager && ModalManager.openScheduleModal) {
        const servicios = DataStore.services || [];
        const servicio = servicios.find(s => s.id === serviceId);
        if (servicio) {
            ModalManager.openScheduleModal(servicio);
        }
    } else {
        alert('Funcionalidad de edición en desarrollo');
    }
}

function eliminarServicio(serviceId) {
    if (confirm('¿Está seguro de que desea eliminar este servicio?')) {
        if (ServiceManager && ServiceManager.deleteService) {
            ServiceManager.deleteService(serviceId);
            actualizarEstadisticas();
            renderListaServicios();
            mostrarNotificacion('Servicio eliminado exitosamente', 'success');
        } else {
            // Fallback si el módulo no está cargado
            const servicios = DataStore.services || [];
            const index = servicios.findIndex(s => s.id === serviceId);
            if (index !== -1) {
                servicios.splice(index, 1);
                actualizarEstadisticas();
                renderListaServicios();
                mostrarNotificacion('Servicio eliminado exitosamente', 'success');
            }
        }
    }
}

// RENDERIZADO DE OTRAS PÁGINAS (simplificado por ahora)
function renderVehiculos() {
    const container = document.getElementById('vehiculosList');
    if (!container) return;
    
    const vehiculos = DataStore.vehiculos || [];
    
    if (vehiculos.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-car"></i>
                <h4>No hay vehículos registrados</h4>
                <p>Comienza agregando un nuevo vehículo</p>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="table-responsive">
            <table class="services-table">
                <thead>
                    <tr>
                        <th>Placa</th>
                        <th>Marca</th>
                        <th>Modelo</th>
                        <th>Año</th>
                        <th>Color</th>
                        <th>Propietario</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    vehiculos.forEach(vehiculo => {
        const cliente = (DataStore.clientes || []).find(c => c.id === vehiculo.clienteId);
        
        html += `
            <tr>
                <td><strong>${vehiculo.placa}</strong></td>
                <td>${vehiculo.marca}</td>
                <td>${vehiculo.modelo}</td>
                <td>${vehiculo.año || ''}</td>
                <td>${vehiculo.color || ''}</td>
                <td>${cliente ? cliente.nombre : 'No asignado'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn btn-edit" onclick="editarVehiculo('${vehiculo.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn btn-delete" onclick="eliminarVehiculo('${vehiculo.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = html;
}

function renderClientes() {
    const container = document.getElementById('clientesList');
    if (!container) return;
    
    container.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--gray-600);">
            <i class="fas fa-users" style="font-size: 3rem; margin-bottom: 1rem;"></i>
            <h3>Gestión de Clientes</h3>
            <p>Esta sección estará disponible en la próxima actualización</p>
            <button class="btn btn-primary" onclick="abrirModalCliente()">
                <i class="fas fa-plus"></i> Agregar Cliente
            </button>
        </div>
    `;
}

function renderServicios() {
    const container = document.getElementById('serviciosList');
    if (!container) return;
    
    container.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--gray-600);">
            <i class="fas fa-cogs" style="font-size: 3rem; margin-bottom: 1rem;"></i>
            <h3>Tipos de Servicio</h3>
            <p>Esta sección estará disponible en la próxima actualización</p>
            <button class="btn btn-primary" onclick="abrirModalServicio()">
                <i class="fas fa-plus"></i> Agregar Servicio
            </button>
        </div>
    `;
}

function renderReportes() {
    const container = document.getElementById('reportesContentArea');
    if (!container) return;
    
    container.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--gray-600);">
            <i class="fas fa-chart-bar" style="font-size: 3rem; margin-bottom: 1rem;"></i>
            <h3>Reportes y Estadísticas</h3>
            <p>Esta sección estará disponible en la próxima actualización</p>
        </div>
    `;
}

function renderConfiguracion() {
    const container = document.getElementById('configuracionArea');
    if (!container) return;
    
    container.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--gray-600);">
            <i class="fas fa-cog" style="font-size: 3rem; margin-bottom: 1rem;"></i>
            <h3>Configuración del Sistema</h3>
            <p>Esta sección estará disponible en la próxima actualización</p>
        </div>
    `;
}

// FUNCIONES PARA ABRIR MODALES (fallback)
function abrirModalAgenda() {
    const modal = document.getElementById('scheduleModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function abrirModalVehiculo() {
    const modal = document.getElementById('vehiculoModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function abrirModalCliente() {
    const modal = document.getElementById('clienteModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function abrirModalServicio() {
    const modal = document.getElementById('servicioModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function mostrarNotificacion(mensaje, tipo = 'info') {
    alert(mensaje); // Por ahora, simple alert
}

// Funciones para otras páginas (placeholder)
function editarVehiculo(id) {
    alert(`Editar vehículo ${id} - En desarrollo`);
}

function eliminarVehiculo(id) {
    if (confirm('¿Está seguro de eliminar este vehículo?')) {
        alert(`Vehículo ${id} eliminado - En desarrollo`);
    }
}

// Hacer funciones disponibles globalmente
window.cargarPagina = cargarPagina;
window.completarServicio = completarServicio;
window.editarServicio = editarServicio;
window.eliminarServicio = eliminarServicio;
window.abrirModalAgenda = abrirModalAgenda;
window.abrirModalVehiculo = abrirModalVehiculo;
window.abrirModalCliente = abrirModalCliente;
window.abrirModalServicio = abrirModalServicio;