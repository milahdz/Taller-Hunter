// main.js - VERSIÓN SIMPLIFICADA SIN CONFLICTOS
document.addEventListener('DOMContentLoaded', async () => {
    console.log('=== TALLER HUNTER ===');
    await initApp();
    setupEventListeners();
    console.log('=== SISTEMA LISTO ===');
});

async function initApp() {
    console.log('Inicializando...');
    
    // Configurar fecha mínima
    const fechaInput = document.getElementById('fecha');
    if (fechaInput) {
        const hoy = new Date();
        fechaInput.min = hoy.toISOString().split('T')[0];
    }
    
    // Cargar datos
    await cargarDatosReales();
    
    // Cargar página
    cargarPagina('agenda');
}

async function cargarDatosReales() {
    console.log('Cargando datos...');
    
    if (!window.supabase) {
        console.log('Supabase no disponible');
        return;
    }
    
    try {
        const servicios = await DB.getServicios();
        console.log(`Servicios: ${servicios.length}`);
        
        if (servicios.length === 0) {
            DataStore.services = [];
            console.log('Tabla de servicios vacía');
        } else {
            DataStore.services = servicios.map(s => ({
                id: s.id || `S${Date.now()}`,
                vehicle: `VH${s.vehiculo_id || 'N/A'}`,
                owner: `Cliente ${s.cliente_id || 'N/A'}`,
                date: s.fecha || new Date().toISOString().split('T')[0],
                service: `Servicio ${s.tipo_servicio_id || 'N/A'}`,
                phone: s.telefono || 'No disponible',
                time: s.hora || '08:00',
                employee: s.empleado_id || 'Empleado',
                status: s.estado || 'pending',
                notes: s.notas || ''
            }));
        }
        
        actualizarEstadisticas();
        
    } catch (error) {
        console.error('Error:', error);
    }
}

function setupEventListeners() {
    console.log('Configurando eventos...');
    
    // Solo eventos básicos, NO el botón "Agendar Vehículo"
    // Navegación
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.getAttribute('data-page');
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            cargarPagina(page);
        });
    });
    
    // Tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            AppState.currentTab = tabId;
            if (AppState.currentPage === 'agenda') {
                renderAgenda();
            }
        });
    });
    
    // Vistas
    document.querySelectorAll('#agendaContent .view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.getAttribute('data-view');
            document.querySelectorAll('#agendaContent .view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            AppState.currentView = view;
            if (AppState.currentPage === 'agenda') {
                cambiarVistaAgenda(view);
            }
        });
    });
    
    // ⚠️ NO agregar listener para "Agendar Vehículo" aquí
    // AgendaManager ya lo maneja en agendar.js
}

function cargarPagina(pagina) {
    console.log('Página:', pagina);
    
    document.querySelectorAll('#dynamicContent > .content-area').forEach(el => {
        el.style.display = 'none';
    });
    
    AppState.currentPage = pagina;
    
    const statsContainer = document.getElementById('statsContainer');
    const tabsContainer = document.getElementById('tabsContainer');
    
    if (pagina === 'agenda') {
        document.getElementById('agendaContent').style.display = 'block';
        if (statsContainer) statsContainer.style.display = 'grid';
        if (tabsContainer) tabsContainer.style.display = 'flex';
        
        renderAgenda();
        actualizarEstadisticas();
        
    } else {
        if (statsContainer) statsContainer.style.display = 'none';
        if (tabsContainer) tabsContainer.style.display = 'none';
        
        document.getElementById(`${pagina}Content`).style.display = 'block';
        renderPagina(pagina);
    }
}

function renderAgenda() {
    if (AppState.currentView === 'list') {
        renderListaServicios();
    } else {
        renderVistaPlaceholder();
    }
}

function renderListaServicios() {
    const container = document.getElementById('listView');
    if (!container) return;
    
    let servicios = DataStore.services || [];
    
    if (AppState.currentTab !== 'all') {
        servicios = servicios.filter(s => s.status === AppState.currentTab);
    }
    
    if (servicios.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-car"></i>
                <h4>No hay servicios agendados</h4>
                <p>${AppState.currentTab === 'all' ? 'Usa el botón "Agendar Vehículo" para comenzar' : `No hay servicios ${AppState.currentTab}`}</p>
            </div>
        `;
        return;
    }
    
    let html = `
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
                        <th>Teléfono</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    servicios.forEach(servicio => {
        let statusClass, statusText;
        switch(servicio.status) {
            case 'pending': statusClass = 'status-pending'; statusText = 'Pendiente'; break;
            case 'process': statusClass = 'status-in-process'; statusText = 'En Proceso'; break;
            case 'completed': statusClass = 'status-completed'; statusText = 'Completado'; break;
            default: statusClass = 'status-pending'; statusText = 'Pendiente';
        }
        
        const fechaFormateada = DataUtils.formatDate(servicio.date);
        
        html += `
            <tr>
                <td><strong>${servicio.id}</strong></td>
                <td>${servicio.vehicle}</td>
                <td>${servicio.owner}</td>
                <td>${fechaFormateada}</td>
                <td>${servicio.service}</td>
                <td>${servicio.employee}</td>
                <td>${servicio.phone}</td>
                <td><span class="service-status ${statusClass}">${statusText}</span></td>
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

function renderVistaPlaceholder() {
    const container = document.getElementById('weekView') || document.getElementById('calendarView');
    if (!container) return;
    
    container.innerHTML = `
        <div style="padding: 40px; text-align: center;">
            <div style="font-size: 48px; color: #ccc; margin-bottom: 20px;">
                <i class="fas fa-calendar"></i>
            </div>
            <h3 style="color: #666; margin-bottom: 10px;">En Desarrollo</h3>
            <p style="color: #888;">Esta vista estará disponible próximamente</p>
        </div>
    `;
}

function cambiarVistaAgenda(vista) {
    AppState.currentView = vista;
    
    document.getElementById('listView').style.display = 'none';
    const weekView = document.getElementById('weekView');
    const calendarView = document.getElementById('calendarView');
    if (weekView) weekView.style.display = 'none';
    if (calendarView) calendarView.style.display = 'none';
    
    switch(vista) {
        case 'list':
            document.getElementById('listView').style.display = 'block';
            renderListaServicios();
            break;
        case 'week':
            if (weekView) weekView.style.display = 'block';
            renderVistaPlaceholder();
            break;
        case 'calendar':
            if (calendarView) calendarView.style.display = 'block';
            renderVistaPlaceholder();
            break;
    }
}

function renderPagina(pagina) {
    const contenedores = {
        'vehiculos': 'vehiculosList',
        'clientes': 'clientesList',
        'servicios': 'serviciosList',
        'reportes': 'reportesContentArea',
        'configuracion': 'configuracionArea'
    };
    
    const contenedorId = contenedores[pagina];
    if (!contenedorId) return;
    
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return;
    
    contenedor.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-${pagina === 'vehiculos' ? 'car' : pagina === 'clientes' ? 'users' : pagina === 'servicios' ? 'cogs' : pagina === 'reportes' ? 'chart-bar' : 'cog'}"></i>
            <h4>${pagina.charAt(0).toUpperCase() + pagina.slice(1)}</h4>
            <p>En desarrollo</p>
        </div>
    `;
}

function actualizarEstadisticas() {
    const servicios = DataStore.services || [];
    const total = servicios.length;
    const pendientes = servicios.filter(s => s.status === "pending").length;
    const proceso = servicios.filter(s => s.status === "process").length;
    const completados = servicios.filter(s => s.status === "completed").length;
    
    const elementos = {
        'totalCount': total,
        'pendingCount': pendientes,
        'processCount': proceso,
        'completedCount': completados
    };
    
    Object.keys(elementos).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = elementos[id];
    });
}