// main.js - VERSIÓN COMPLETA CON VEHÍCULOS, CLIENTES Y SERVICIOS
document.addEventListener('DOMContentLoaded', async () => {
    console.log('=== TALLER HUNTER - INICIANDO ===');
    await initApp();
    setupEventListeners();
    console.log('=== SISTEMA LISTO ===');
});

// ==================== INICIALIZACIÓN ====================
async function initApp() {
    const fechaInput = document.getElementById('fecha');
    if (fechaInput) {
        fechaInput.min = new Date().toISOString().split('T')[0];
    }
    await cargarTodosLosDatos();
    cargarPagina('agenda');
}

async function cargarTodosLosDatos() {
    if (!window.supabase) {
        console.warn('⚠️ Supabase no disponible');
        return;
    }
    try {
        const [servicios, clientes, vehiculos, tiposServicio, empleados] = await Promise.all([
            DB.getServicios(),
            DB.getClientes(),
            DB.getVehiculos(),
            DB.getTiposServicio(),
            DB.getEmpleados()
        ]);

        // Mapear servicios al formato interno
        DataStore.services = servicios.map(s => ({
            id: s.id,
            vehicle: s.vehiculo || s.vehiculo_id || 'N/A',
            owner: s.cliente || s.cliente_id || 'N/A',
            date: s.fecha || new Date().toISOString().split('T')[0],
            service: s.tipo_servicio || s.tipo_servicio_id || 'N/A',
            phone: s.telefono || 'No disponible',
            time: s.hora || '08:00',
            employee: s.empleado || s.empleado_id || 'No asignado',
            status: s.estado || 'pending',
            notes: s.notas || ''
        }));

        // Mapear clientes
        DataStore.clientes = clientes.map(c => ({
            id: c.id,
            nombre: c.nombre || c.id,
            telefono: c.telefono || '',
            email: c.email || '',
            direccion: c.direccion || '',
            notas: c.notas || ''
        }));

        // Mapear vehículos
        DataStore.vehiculos = vehiculos.map(v => ({
            id: v.id,
            placa: v.placa || v.id,
            marca: v.marca || '',
            modelo: v.modelo || '',
            año: v.año || v.anio || '',
            color: v.color || '',
            clienteId: v.cliente_id || '',
            kilometraje: v.kilometraje || '',
            notas: v.notas || ''
        }));

        // Mapear tipos de servicio
        DataStore.tiposServicio = tiposServicio.map(t => ({
            id: t.id,
            nombre: t.nombre || t.descripcion || t.id,
            descripcion: t.descripcion || '',
            precio: t.precio || t.precio_base || 0,
            duracion: t.duracion || '',
            categoria: t.categoria || 'General'
        }));

        // Mapear empleados
        DataStore.empleados = empleados.map(e => ({
            id: e.id,
            nombre: e.nombre || e.id,
            especialidad: e.especialidad || '',
            telefono: e.telefono || '',
            email: e.email || '',
            horario: e.horario || ''
        }));

        console.log(`✅ Datos cargados — Servicios: ${DataStore.services.length}, Clientes: ${DataStore.clientes.length}, Vehículos: ${DataStore.vehiculos.length}`);
        actualizarEstadisticas();

    } catch (error) {
        console.error('❌ Error cargando datos:', error);
    }
}

// ==================== EVENTOS GLOBALES ====================
function setupEventListeners() {
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

    // Tabs de agenda
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            AppState.currentTab = tab.getAttribute('data-tab');
            if (AppState.currentPage === 'agenda') renderAgenda();
        });
    });

    // Botones de vista (lista/semana/calendario)
    document.querySelectorAll('#agendaContent .view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#agendaContent .view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            AppState.currentView = btn.getAttribute('data-view');
            if (AppState.currentPage === 'agenda') cambiarVistaAgenda(AppState.currentView);
        });
    });

    // Botones de vista en reportes
    document.querySelectorAll('[data-report]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-report]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            UIManager.renderReportes(btn.getAttribute('data-report'), document.getElementById('reportesContentArea'));
        });
    });

    // Botones de vista en configuración
    document.querySelectorAll('[data-config]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-config]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            UIManager.renderConfiguracion(btn.getAttribute('data-config'), document.getElementById('configuracionArea'));
            setupConfigEventListeners();
        });
    });
}

// ==================== NAVEGACIÓN DE PÁGINAS ====================
function cargarPagina(pagina) {
    AppState.currentPage = pagina;

    document.querySelectorAll('#dynamicContent > .content-area').forEach(el => {
        el.style.display = 'none';
    });

    const statsContainer = document.getElementById('statsContainer');
    const tabsContainer = document.getElementById('tabsContainer');
    const addVehicleBtn = document.getElementById('addVehicleBtn');
    const printBtn = document.getElementById('printBtn');
    const pageTitle = document.getElementById('pageTitle');

    // Ocultar elementos de agenda por defecto
    if (statsContainer) statsContainer.style.display = 'none';
    if (tabsContainer) tabsContainer.style.display = 'none';
    if (addVehicleBtn) addVehicleBtn.style.display = 'none';
    if (printBtn) printBtn.style.display = 'none';

    switch (pagina) {
        case 'agenda':
            document.getElementById('agendaContent').style.display = 'block';
            if (statsContainer) statsContainer.style.display = 'grid';
            if (tabsContainer) tabsContainer.style.display = 'flex';
            if (addVehicleBtn) addVehicleBtn.style.display = 'inline-flex';
            if (pageTitle) pageTitle.textContent = 'Sistema de Gestión de Agenda';
            actualizarEstadisticas();
            renderAgenda();
            break;

        case 'vehiculos':
            document.getElementById('vehiculosContent').style.display = 'block';
            if (pageTitle) pageTitle.textContent = 'Gestión de Vehículos';
            renderVehiculos();
            setupVehiculosEventListeners();
            break;

        case 'clientes':
            document.getElementById('clientesContent').style.display = 'block';
            if (pageTitle) pageTitle.textContent = 'Gestión de Clientes';
            renderClientes();
            setupClientesEventListeners();
            break;

        case 'servicios':
            document.getElementById('serviciosContent').style.display = 'block';
            if (pageTitle) pageTitle.textContent = 'Tipos de Servicios';
            renderServicios();
            setupServiciosEventListeners();
            break;

        case 'reportes':
            document.getElementById('reportesContent').style.display = 'block';
            if (pageTitle) pageTitle.textContent = 'Reportes y Estadísticas';
            UIManager.renderReportes('diario', document.getElementById('reportesContentArea'));
            break;

        case 'configuracion':
            document.getElementById('configuracionContent').style.display = 'block';
            if (pageTitle) pageTitle.textContent = 'Configuración del Sistema';
            UIManager.renderConfiguracion('empleados', document.getElementById('configuracionArea'));
            setupConfigEventListeners();
            break;
    }
}

// ==================== AGENDA ====================
function renderAgenda() {
    if (AppState.currentView === 'list') {
        renderListaServicios();
    } else {
        cambiarVistaAgenda(AppState.currentView);
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
                <i class="fas fa-calendar-alt"></i>
                <h4>No hay servicios agendados</h4>
                <p>${AppState.currentTab === 'all' ? 'Usa "Agendar Vehículo" para comenzar' : 'No hay servicios en este estado'}</p>
            </div>`;
        return;
    }

    const btns = UIManager.renderServicesTable(servicios, container);
    if (btns) {
        btns.completeBtns.forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                if (confirm('¿Marcar este servicio como completado?')) {
                    await ServiceManager.completeService(id);
                    UIManager.showNotification('Servicio completado', 'success');
                    actualizarEstadisticas();
                    renderListaServicios();
                }
            });
        });
        btns.editBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const servicio = DataUtils.findServiceById(id);
                if (servicio) ModalManager.openScheduleModal(servicio);
            });
        });
        btns.deleteBtns.forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                if (confirm('¿Eliminar este servicio?')) {
                    await ServiceManager.deleteService(id);
                    UIManager.showNotification('Servicio eliminado', 'success');
                    actualizarEstadisticas();
                    renderListaServicios();
                }
            });
        });
    }
}

function cambiarVistaAgenda(vista) {
    ['listView', 'weekView', 'calendarView'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    const servicios = DataUtils.filterServices(AppState.currentTab);

    switch (vista) {
        case 'list':
            document.getElementById('listView').style.display = 'block';
            renderListaServicios();
            break;
        case 'week':
            const wv = document.getElementById('weekView');
            if (wv) {
                wv.style.display = 'block';
                CalendarManager.setupWeekView(wv.querySelector('.calendar-container'), servicios);
            }
            break;
        case 'calendar':
            const cv = document.getElementById('calendarView');
            if (cv) {
                cv.style.display = 'block';
                CalendarManager.setupCalendarView(cv.querySelector('.calendar-container'), servicios);
            }
            break;
    }
}

// ==================== VEHÍCULOS ====================
function renderVehiculos() {
    const container = document.getElementById('vehiculosList');
    if (!container) return;

    if (DataStore.vehiculos.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-car"></i>
                <h4>No hay vehículos registrados</h4>
                <p>Haz clic en "Nuevo Vehículo" para agregar el primero</p>
            </div>`;
        return;
    }

    const tableHTML = `
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
                        <th>Km</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${DataStore.vehiculos.map(v => {
                        const cliente = DataStore.clientes.find(c => c.id === v.clienteId);
                        return `
                        <tr>
                            <td><strong>${v.placa || '—'}</strong></td>
                            <td>${v.marca || '—'}</td>
                            <td>${v.modelo || '—'}</td>
                            <td>${v.año || '—'}</td>
                            <td>${v.color || '—'}</td>
                            <td>${cliente ? cliente.nombre : 'Sin propietario'}</td>
                            <td>${v.kilometraje ? v.kilometraje.toLocaleString() + ' km' : '—'}</td>
                            <td>
                                <div class="action-buttons" style="margin:0;justify-content:center;">
                                    <button class="action-btn btn-edit" data-id="${v.id}" title="Editar">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="action-btn btn-delete" data-id="${v.id}" title="Eliminar">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        </div>`;
    container.innerHTML = tableHTML;
}

function setupVehiculosEventListeners() {
    // Botón Nuevo Vehículo
    const addBtn = document.getElementById('addVehiculoBtn');
    if (addBtn) {
        addBtn.onclick = () => {
            llenarSelectClientes('vehiculoCliente');
            ModalManager.openVehiculoModal(null);
        };
    }

    // Guardar vehículo
    const saveBtn = document.getElementById('saveVehiculoBtn');
    if (saveBtn) {
        saveBtn.onclick = async () => {
            const form = document.getElementById('vehiculoForm');
            if (!form.checkValidity()) { form.reportValidity(); return; }

            const datos = {
                placa: document.getElementById('vehiculoPlaca').value.trim(),
                marca: document.getElementById('vehiculoMarca').value.trim(),
                modelo: document.getElementById('vehiculoModelo').value.trim(),
                año: document.getElementById('vehiculoAnio').value || '',
                color: document.getElementById('vehiculoColor').value.trim() || '',
                clienteId: document.getElementById('vehiculoCliente').value,
                kilometraje: document.getElementById('vehiculoKilometraje').value || '',
                notas: document.getElementById('vehiculoNotas').value.trim() || ''
            };

            try {
                saveBtn.disabled = true;
                saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

                if (AppState.editingVehiculoId) {
                    await VehiculoManager.updateVehiculo(AppState.editingVehiculoId, datos);
                    UIManager.showNotification('Vehículo actualizado correctamente', 'success');
                } else {
                    await VehiculoManager.createVehiculo(datos);
                    UIManager.showNotification('Vehículo creado correctamente', 'success');
                }

                ModalManager.closeVehiculoModal();
                renderVehiculos();
                setupVehiculosEventListeners();
            } catch (e) {
                UIManager.showNotification('Error al guardar: ' + e.message, 'error');
            } finally {
                saveBtn.disabled = false;
                saveBtn.innerHTML = 'Guardar';
            }
        };
    }

    // Delegación de eventos para editar/eliminar filas
    const lista = document.getElementById('vehiculosList');
    if (lista) {
        lista.onclick = async (e) => {
            const editBtn = e.target.closest('.btn-edit');
            const deleteBtn = e.target.closest('.btn-delete');

            if (editBtn) {
                const id = editBtn.getAttribute('data-id');
                const v = DataUtils.findVehiculoById(id);
                if (v) {
                    llenarSelectClientes('vehiculoCliente');
                    ModalManager.openVehiculoModal(v);
                }
            }
            if (deleteBtn) {
                const id = deleteBtn.getAttribute('data-id');
                if (confirm('¿Eliminar este vehículo?')) {
                    try {
                        await VehiculoManager.deleteVehiculo(id);
                        UIManager.showNotification('Vehículo eliminado', 'success');
                        renderVehiculos();
                        setupVehiculosEventListeners();
                    } catch (e) {
                        UIManager.showNotification('Error al eliminar: ' + e.message, 'error');
                    }
                }
            }
        };
    }
}

// ==================== CLIENTES ====================
function renderClientes() {
    const container = document.getElementById('clientesList');
    if (!container) return;

    if (DataStore.clientes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <h4>No hay clientes registrados</h4>
                <p>Haz clic en "Nuevo Cliente" para agregar el primero</p>
            </div>`;
        return;
    }

    // Mini-stats
    const statsHTML = `
        <div class="stats-container" style="margin-bottom:1.5rem;">
            <div class="stat-card stat-total">
                <h3>Total Clientes</h3>
                <div class="stat-value">${DataStore.clientes.length}</div>
            </div>
            <div class="stat-card stat-pendientes">
                <h3>Vehículos Registrados</h3>
                <div class="stat-value">${DataStore.vehiculos.length}</div>
            </div>
            <div class="stat-card stat-proceso">
                <h3>Servicios Activos</h3>
                <div class="stat-value">${DataStore.services.filter(s => s.status !== 'completed').length}</div>
            </div>
            <div class="stat-card stat-completados">
                <h3>Completados</h3>
                <div class="stat-value">${DataStore.services.filter(s => s.status === 'completed').length}</div>
            </div>
        </div>`;

    const tableHTML = `
        <div class="table-responsive">
            <table class="services-table">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Teléfono</th>
                        <th>Email</th>
                        <th>Dirección</th>
                        <th>Vehículos</th>
                        <th>Último Servicio</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${DataStore.clientes.map(c => {
                        const vehiculosCliente = DataStore.vehiculos.filter(v => v.clienteId === c.id).length;
                        const serviciosCliente = DataStore.services.filter(s => s.owner === c.nombre || s.owner === c.id);
                        const ultimoServicio = serviciosCliente.length > 0
                            ? DataUtils.formatDate(serviciosCliente[0].date)
                            : 'Nunca';
                        return `
                        <tr>
                            <td><strong>${c.nombre || c.id}</strong></td>
                            <td>${c.telefono || '—'}</td>
                            <td>${c.email || '—'}</td>
                            <td>${c.direccion || '—'}</td>
                            <td><span class="badge badge-info">${vehiculosCliente}</span></td>
                            <td>${ultimoServicio}</td>
                            <td>
                                <div class="action-buttons" style="margin:0;justify-content:center;">
                                    <button class="action-btn btn-edit" data-id="${c.id}" title="Editar">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="action-btn btn-delete" data-id="${c.id}" title="Eliminar">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        </div>`;

    container.innerHTML = statsHTML + tableHTML;
}

function setupClientesEventListeners() {
    const addBtn = document.getElementById('addClienteBtn');
    if (addBtn) {
        addBtn.onclick = () => ModalManager.openClienteModal(null);
    }

    const saveBtn = document.getElementById('saveClienteBtn');
    if (saveBtn) {
        saveBtn.onclick = async () => {
            const form = document.getElementById('clienteForm');
            if (!form.checkValidity()) { form.reportValidity(); return; }

            const datos = {
                nombre: document.getElementById('clienteNombre').value.trim(),
                telefono: document.getElementById('clienteTelefono').value.trim(),
                email: document.getElementById('clienteEmail').value.trim() || '',
                direccion: document.getElementById('clienteDireccion').value.trim() || '',
                notas: document.getElementById('clienteNotas').value.trim() || ''
            };

            try {
                saveBtn.disabled = true;
                saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

                if (AppState.editingClienteId) {
                    await ClienteManager.updateCliente(AppState.editingClienteId, datos);
                    UIManager.showNotification('Cliente actualizado correctamente', 'success');
                } else {
                    await ClienteManager.createCliente(datos);
                    UIManager.showNotification('Cliente creado correctamente', 'success');
                }

                ModalManager.closeClienteModal();
                renderClientes();
                setupClientesEventListeners();
            } catch (e) {
                UIManager.showNotification('Error al guardar: ' + e.message, 'error');
            } finally {
                saveBtn.disabled = false;
                saveBtn.innerHTML = 'Guardar';
            }
        };
    }

    const lista = document.getElementById('clientesList');
    if (lista) {
        lista.onclick = async (e) => {
            const editBtn = e.target.closest('.btn-edit');
            const deleteBtn = e.target.closest('.btn-delete');

            if (editBtn) {
                const id = editBtn.getAttribute('data-id');
                const cliente = DataUtils.findClienteById(id);
                if (cliente) ModalManager.openClienteModal(cliente);
            }
            if (deleteBtn) {
                const id = deleteBtn.getAttribute('data-id');
                const tieneVehiculos = DataStore.vehiculos.some(v => v.clienteId === id);
                if (tieneVehiculos) {
                    alert('No se puede eliminar: el cliente tiene vehículos asociados. Elimínalos primero.');
                    return;
                }
                if (confirm('¿Eliminar este cliente?')) {
                    try {
                        await ClienteManager.deleteCliente(id);
                        UIManager.showNotification('Cliente eliminado', 'success');
                        renderClientes();
                        setupClientesEventListeners();
                    } catch (e) {
                        UIManager.showNotification('Error al eliminar: ' + e.message, 'error');
                    }
                }
            }
        };
    }
}

// ==================== TIPOS DE SERVICIO ====================
function renderServicios() {
    const container = document.getElementById('serviciosList');
    if (!container) return;

    if (DataStore.tiposServicio.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-cogs"></i>
                <h4>No hay tipos de servicio configurados</h4>
                <p>Haz clic en "Nuevo Servicio" para agregar el primero</p>
            </div>`;
        return;
    }

    const cardsHTML = `
        <div class="card-grid">
            ${DataStore.tiposServicio.map(s => {
                const badgeClass = s.categoria === 'Mantenimiento' ? 'badge-success'
                    : s.categoria === 'Reparación' ? 'badge-warning' : 'badge-info';
                return `
                <div class="service-card">
                    <div class="service-id" style="font-size:1rem;color:var(--primary);margin-bottom:.5rem;">
                        ${s.nombre}
                        <span class="badge ${badgeClass}" style="margin-left:.5rem;font-size:.7rem;">
                            ${s.categoria || 'General'}
                        </span>
                    </div>
                    <p style="color:var(--gray-600);font-size:.875rem;margin-bottom:1rem;">
                        ${s.descripcion || 'Sin descripción'}
                    </p>
                    <div class="service-details">
                        <div class="service-detail">
                            <div class="detail-label">Precio</div>
                            <div class="detail-value" style="font-size:1.25rem;font-weight:700;color:var(--success);">
                                RD$${parseFloat(s.precio || 0).toFixed(2)}
                            </div>
                        </div>
                        <div class="service-detail">
                            <div class="detail-label">Duración</div>
                            <div class="detail-value">${s.duracion || 'No especificada'}</div>
                        </div>
                    </div>
                    <div class="action-buttons" style="margin-top:1rem;">
                        <button class="action-btn btn-edit" data-id="${s.id}" title="Editar">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="action-btn btn-delete" data-id="${s.id}" title="Eliminar">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </div>
                </div>`;
            }).join('')}
        </div>`;

    container.innerHTML = cardsHTML;
}

function setupServiciosEventListeners() {
    const addBtn = document.getElementById('addServicioBtn');
    if (addBtn) {
        addBtn.onclick = () => ModalManager.openServicioModal(null);
    }

    const saveBtn = document.getElementById('saveServicioBtn');
    if (saveBtn) {
        saveBtn.onclick = async () => {
            const form = document.getElementById('servicioForm');
            if (!form.checkValidity()) { form.reportValidity(); return; }

            const datos = {
                nombre: document.getElementById('servicioNombre').value.trim(),
                descripcion: document.getElementById('servicioDescripcion').value.trim() || '',
                precio: parseFloat(document.getElementById('servicioPrecio').value) || 0,
                duracion: document.getElementById('servicioDuracion').value || '',
                categoria: document.getElementById('servicioCategoria').value || ''
            };

            try {
                saveBtn.disabled = true;
                saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

                if (AppState.editingServicioId) {
                    await ServicioManager.updateServicio(AppState.editingServicioId, datos);
                    UIManager.showNotification('Servicio actualizado correctamente', 'success');
                } else {
                    await ServicioManager.createServicio(datos);
                    UIManager.showNotification('Servicio creado correctamente', 'success');
                }

                ModalManager.closeServicioModal();
                renderServicios();
                setupServiciosEventListeners();
            } catch (e) {
                UIManager.showNotification('Error al guardar: ' + e.message, 'error');
            } finally {
                saveBtn.disabled = false;
                saveBtn.innerHTML = 'Guardar';
            }
        };
    }

    const lista = document.getElementById('serviciosList');
    if (lista) {
        lista.onclick = async (e) => {
            const editBtn = e.target.closest('.btn-edit');
            const deleteBtn = e.target.closest('.btn-delete');

            if (editBtn) {
                const id = editBtn.getAttribute('data-id');
                const servicio = DataUtils.findServicioById(id);
                if (servicio) ModalManager.openServicioModal(servicio);
            }
            if (deleteBtn) {
                const id = deleteBtn.getAttribute('data-id');
                if (confirm('¿Eliminar este tipo de servicio?')) {
                    try {
                        await ServicioManager.deleteServicio(id);
                        UIManager.showNotification('Servicio eliminado', 'success');
                        renderServicios();
                        setupServiciosEventListeners();
                    } catch (e) {
                        UIManager.showNotification('Error al eliminar: ' + e.message, 'error');
                    }
                }
            }
        };
    }
}

// ==================== CONFIGURACIÓN (EMPLEADOS) ====================
function setupConfigEventListeners() {
    // Botón Nuevo Empleado (se renderiza dinámicamente)
    setTimeout(() => {
        const addBtn = document.getElementById('addEmpleadoBtn');
        if (addBtn && !addBtn._listenerAdded) {
            addBtn._listenerAdded = true;
            addBtn.onclick = () => ModalManager.openEmpleadoModal(null);
        }

        const saveBtn = document.getElementById('saveEmpleadoBtn');
        if (saveBtn && !saveBtn._listenerAdded) {
            saveBtn._listenerAdded = true;
            saveBtn.onclick = async () => {
                const form = document.getElementById('empleadoForm');
                if (!form.checkValidity()) { form.reportValidity(); return; }

                const datos = {
                    nombre: document.getElementById('empleadoNombre').value.trim(),
                    especialidad: document.getElementById('empleadoEspecialidad').value.trim() || '',
                    telefono: document.getElementById('empleadoTelefono').value.trim() || '',
                    email: document.getElementById('empleadoEmail').value.trim() || '',
                    horario: document.getElementById('empleadoHorario').value || ''
                };

                try {
                    if (AppState.editingEmpleadoId) {
                        await EmpleadoManager.updateEmpleado(AppState.editingEmpleadoId, datos);
                        UIManager.showNotification('Empleado actualizado', 'success');
                    } else {
                        await EmpleadoManager.createEmpleado(datos);
                        UIManager.showNotification('Empleado creado correctamente', 'success');
                    }
                    ModalManager.closeEmpleadoModal();
                    UIManager.renderConfiguracion('empleados', document.getElementById('configuracionArea'));
                    setTimeout(setupConfigEventListeners, 100);
                } catch (e) {
                    UIManager.showNotification('Error al guardar: ' + e.message, 'error');
                }
            };
        }

        // Delegación para editar/eliminar empleados
        const empleadosList = document.getElementById('empleadosList');
        if (empleadosList && !empleadosList._listenerAdded) {
            empleadosList._listenerAdded = true;
            empleadosList.onclick = async (e) => {
                const editBtn = e.target.closest('.btn-edit');
                const deleteBtn = e.target.closest('.btn-delete');

                if (editBtn) {
                    const id = editBtn.getAttribute('data-id');
                    const emp = DataUtils.findEmpleadoById(id);
                    if (emp) ModalManager.openEmpleadoModal(emp);
                }
                if (deleteBtn) {
                    const id = deleteBtn.getAttribute('data-id');
                    if (confirm('¿Eliminar este empleado?')) {
                        try {
                            await EmpleadoManager.deleteEmpleado(id);
                            UIManager.showNotification('Empleado eliminado', 'success');
                            UIManager.renderConfiguracion('empleados', document.getElementById('configuracionArea'));
                            setTimeout(setupConfigEventListeners, 100);
                        } catch (e) {
                            UIManager.showNotification('Error al eliminar: ' + e.message, 'error');
                        }
                    }
                }
            };
        }

        // Guardar config general
        const saveConfigBtn = document.getElementById('saveConfigBtn');
        if (saveConfigBtn && !saveConfigBtn._listenerAdded) {
            saveConfigBtn._listenerAdded = true;
            saveConfigBtn.onclick = () => ModalManager.saveConfigGeneral();
        }

        // Guardar horarios
        const saveHorariosBtn = document.getElementById('saveHorariosBtn');
        if (saveHorariosBtn && !saveHorariosBtn._listenerAdded) {
            saveHorariosBtn._listenerAdded = true;
            saveHorariosBtn.onclick = () => ModalManager.saveConfigHorarios();
        }
    }, 50);
}

// ==================== UTILIDADES ====================
function actualizarEstadisticas() {
    const s = DataStore.services || [];
    const mapa = {
        totalCount: s.length,
        pendingCount: s.filter(x => x.status === 'pending').length,
        processCount: s.filter(x => x.status === 'process').length,
        completedCount: s.filter(x => x.status === 'completed').length
    };
    Object.entries(mapa).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    });
}

function llenarSelectClientes(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    select.innerHTML = '<option value="">Seleccionar cliente</option>';
    DataStore.clientes.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.nombre || c.id;
        select.appendChild(opt);
    });
}
