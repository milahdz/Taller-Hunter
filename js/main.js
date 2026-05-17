// main.js - VERSIÓN COMPLETA

// ── Confirmación global ───────────────────────────────────────────────────────
const Confirmacion = {
    _resolver: null,

    mostrar(mensaje) {
        return new Promise(resolve => {
            Confirmacion._resolver = resolve;
            const msg = document.getElementById('confirmMsg');
            if (msg) msg.textContent = mensaje || '¿Estás seguro de realizar esta acción?';
            const modal = document.getElementById('confirmModal');
            if (modal) modal.style.display = 'flex';
        });
    },

    _responder(valor) {
        const modal = document.getElementById('confirmModal');
        if (modal) modal.style.display = 'none';
        if (Confirmacion._resolver) {
            Confirmacion._resolver(valor);
            Confirmacion._resolver = null;
        }
    }
};

// Silence all native confirm() dialogs — our custom modal already asked
window.confirm = () => true;

// Wires the two confirm-modal buttons (called once after DOM ready)
function setupConfirmModal() {
    document.getElementById('confirmOkBtn')
        ?.addEventListener('click', () => Confirmacion._responder(true));
    document.getElementById('confirmCancelBtn')
        ?.addEventListener('click', () => Confirmacion._responder(false));
}

// Buttons that should NOT trigger confirmation (non-destructive actions)
function shouldSkipConfirm(btn) {
    if (btn.closest('#confirmModal')) return true;
    if (btn.classList.contains('close-modal')) return true;
    if (btn.classList.contains('view-btn') || btn.getAttribute('data-view')) return true;
    if (btn.classList.contains('notification-close')) return true;
    // Edit buttons just open modals — not destructive
    if (btn.classList.contains('btn-edit') || btn.classList.contains('svc-btn-edit')) return true;
    const skipIds = [
        'cancelBtn','cancelVehiculoBtn','cancelClienteBtn','cancelServicioBtn','cancelEmpleadoBtn',
        'addVehicleBtn','addVehiculoBtn','addClienteBtn','addServicioBtn','addEmpleadoBtn',
        'printBtn','confirmCancelBtn','confirmOkBtn',
        'savePerfilBtn','savePasswordBtn','saveTallerBtn','saveConfigBtn','saveHorariosBtn',
        'themeToggle'
    ];
    return skipIds.includes(btn.id);
}

// Global interceptor: consequential button clicks go through confirmation first
let _trustedClick = false;
document.addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn || _trustedClick) return;
    if (shouldSkipConfirm(btn)) return;

    e.preventDefault();
    e.stopImmediatePropagation();

    const confirmado = await Confirmacion.mostrar('¿Estás seguro de realizar esta acción?');
    if (confirmado) {
        _trustedClick = true;
        btn.click();
        _trustedClick = false;
    }
}, true);

// ── Loading overlay ───────────────────────────────────────────────────────────
function showLoading() {
    const el = document.getElementById('loadingOverlay');
    if (el) el.style.display = 'flex';
}
function hideLoading() {
    const el = document.getElementById('loadingOverlay');
    if (el) el.style.display = 'none';
}
// ─────────────────────────────────────────────────────────────────────────────

// Normalize DB status strings to internal keys
function normalizeStatus(estado) {
    const map = {
        'Pendiente':'pending','En Proceso':'process','En proceso':'process',
        'Completado':'completed','completado':'completed',
        'Cancelado':'cancelled','cancelado':'cancelled',
        'pending':'pending','process':'process','completed':'completed','cancelled':'cancelled'
    };
    return map[estado] || 'pending';
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log('=== TALLER HUNTER ===');
    // Apply persisted theme
    const savedTheme = localStorage.getItem('th_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    // Apply persisted admin name
    const savedName = localStorage.getItem('th_admin_name');
    if (savedName) {
        const nameEl   = document.querySelector('.user-name');
        const avatarEl = document.querySelector('.user-avatar');
        if (nameEl)   nameEl.textContent   = savedName;
        if (avatarEl) avatarEl.textContent  = savedName.substring(0,2).toUpperCase();
    }
    setupConfirmModal();
    await initApp();
    setupEventListeners();
    setupModalListeners();
    console.log('=== SISTEMA LISTO ===');
});

async function initApp() {
    showLoading();
    const fechaInput = document.getElementById('fecha');
    if (fechaInput) fechaInput.min = new Date().toISOString().split('T')[0];
    await cargarDatosReales();
    hideLoading();
    cargarPagina('agenda');
}

async function cargarDatosReales() {
    if (!window.supabase) { console.log('Supabase no disponible'); return; }
    try {
        const [servicios, clientes, vehiculos, tiposServicio, empleados] = await Promise.all([
            DB.getServicios(),
            DB.getTodosClientes(),
            DB.getTodosVehiculos(),
            DB.getTodosTiposServicio(),
            DB.getTodosEmpleados()
        ]);

        DataStore.services = servicios.map(s => {
            // Resolve names: prefer text columns stored alongside FKs,
            // fall back to cross-referencing the loaded tables
            const vObj = vehiculos.find(v => String(v.id) === String(s.vehiculo_id));
            const cObj = clientes.find(c => c.id === s.cliente_id);
            const tObj = tiposServicio.find(t => t.id === s.tipo_servicio_id);
            const eObj = empleados.find(e => String(e.id) === String(s.empleado_id));
            return {
                id:       s.id,
                vehicle:  s.placa         || (vObj ? vObj.placa   : s.vehiculo_id  || 'N/A'),
                owner:    s.propietario   || (cObj ? cObj.nombre  : 'N/A'),
                date:     s.fecha         || new Date().toISOString().split('T')[0],
                service:  s.tipo_servicio || (tObj ? tObj.nombre  : 'N/A'),
                phone:    s.telefono      || (cObj ? cObj.telefono : 'No disponible'),
                time:     s.hora          || '08:00',
                employee: s.empleado      || (eObj ? eObj.nombre  : 'Sin asignar'),
                status:   normalizeStatus(s.estado),
                notes:    s.notas || ''
            };
        });

        DataStore.clientes = clientes.map(c => ({
            id: c.id,
            nombre: c.nombre || '',
            telefono: c.telefono || '',
            email: c.email || '',
            direccion: c.direccion || '',
            notas: c.notas || ''
        }));

        DataStore.vehiculos = vehiculos.map(v => ({
            id: v.id,
            placa: v.placa || '',
            marca: v.marca || '',
            modelo: v.modelo || '',
            año: v.año || '',
            color: v.color || '',
            clienteId: v.cliente_id || '',
            kilometraje: v.kilometraje || '',
            notas: v.notas || ''
        }));

        DataStore.tiposServicio = tiposServicio.map(t => ({
            id: t.id,
            nombre: t.nombre || t.descripcion || 'Sin nombre',
            descripcion: t.descripcion || '',
            precio: t.precio ?? t.precio_base ?? 0,
            duracion: t.duracion || '',
            categoria: t.categoria || ''
        }));

        DataStore.empleados = empleados.map(e => ({
            id: e.id,
            nombre: e.nombre || '',
            especialidad: e.especialidad || '',
            telefono: e.telefono || '',
            email: e.email || '',
            horario: e.horario || ''
        }));

        actualizarEstadisticas();
        console.log('✅ Datos cargados:', {
            servicios: DataStore.services.length,
            clientes: DataStore.clientes.length,
            vehiculos: DataStore.vehiculos.length,
            tipos: DataStore.tiposServicio.length,
            empleados: DataStore.empleados.length
        });
    } catch (error) {
        console.error('Error cargando datos:', error);
    }
}

// ===== NAVEGACIÓN Y EVENTOS ESTÁTICOS =====

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
            const tabId = tab.getAttribute('data-tab');
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            AppState.currentTab = tabId;
            if (AppState.currentPage === 'agenda') renderAgenda();
        });
    });

    // Vistas de agenda
    document.querySelectorAll('#agendaContent .view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.getAttribute('data-view');
            document.querySelectorAll('#agendaContent .view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            AppState.currentView = view;
            if (AppState.currentPage === 'agenda') cambiarVistaAgenda(view);
        });
    });

    // Botones "Nuevo" en el HTML estático
    const addVehiculoBtn = document.getElementById('addVehiculoBtn');
    if (addVehiculoBtn) addVehiculoBtn.addEventListener('click', () => ModalManager.openVehiculoModal());

    const addClienteBtn = document.getElementById('addClienteBtn');
    if (addClienteBtn) addClienteBtn.addEventListener('click', () => ModalManager.openClienteModal());

    const addServicioBtn = document.getElementById('addServicioBtn');
    if (addServicioBtn) addServicioBtn.addEventListener('click', () => ModalManager.openServicioModal());

    // Tabs de reportes
    document.querySelectorAll('[data-report]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-report]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            AppState.currentReport = btn.getAttribute('data-report');
            if (AppState.currentPage === 'reportes') renderReportes();
        });
    });

    // Tabs de configuración
    document.querySelectorAll('[data-config]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-config]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            AppState.currentConfig = btn.getAttribute('data-config');
            if (AppState.currentPage === 'configuracion') renderConfiguracion();
        });
    });
}

// ===== MODALES =====

function setupModalListeners() {
    // Botones cerrar (X)
    const cierres = {
        'closeVehiculoModal': 'vehiculoModal',
        'closeClienteModal':  'clienteModal',
        'closeServicioModal': 'servicioModal',
        'closeEmpleadoModal': 'empleadoModal'
    };
    Object.entries(cierres).forEach(([btnId, modalId]) => {
        const btn = document.getElementById(btnId);
        if (btn) btn.addEventListener('click', () => cerrarModal(modalId));
    });

    // Botones cancelar
    const cancelaciones = {
        'cancelVehiculoBtn': 'vehiculoModal',
        'cancelClienteBtn':  'clienteModal',
        'cancelServicioBtn': 'servicioModal',
        'cancelEmpleadoBtn': 'empleadoModal'
    };
    Object.entries(cancelaciones).forEach(([btnId, modalId]) => {
        const btn = document.getElementById(btnId);
        if (btn) btn.addEventListener('click', () => cerrarModal(modalId));
    });

    // Click fuera del modal
    ['vehiculoModal', 'clienteModal', 'servicioModal', 'empleadoModal'].forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) cerrarModal(modalId); });
    });

    // Evitar envío nativo de formularios
    ['vehiculoForm', 'clienteForm', 'servicioForm', 'empleadoForm'].forEach(formId => {
        const form = document.getElementById(formId);
        if (form) form.addEventListener('submit', e => e.preventDefault());
    });

    // Botones guardar (async)
    const saveVehiculoBtn = document.getElementById('saveVehiculoBtn');
    if (saveVehiculoBtn) saveVehiculoBtn.addEventListener('click', guardarVehiculo);

    const saveClienteBtn = document.getElementById('saveClienteBtn');
    if (saveClienteBtn) saveClienteBtn.addEventListener('click', guardarCliente);

    const saveServicioBtn = document.getElementById('saveServicioBtn');
    if (saveServicioBtn) saveServicioBtn.addEventListener('click', guardarServicio);

    const saveEmpleadoBtn = document.getElementById('saveEmpleadoBtn');
    if (saveEmpleadoBtn) saveEmpleadoBtn.addEventListener('click', guardarEmpleado);
}

function cerrarModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
    const formId = modalId.replace('Modal', 'Form');
    const form = document.getElementById(formId);
    if (form) form.reset();
    AppState.editingVehiculoId = null;
    AppState.editingClienteId = null;
    AppState.editingServicioId = null;
    AppState.editingEmpleadoId = null;
}

// ===== GUARDAR ASYNC =====

async function guardarVehiculo() {
    const form = document.getElementById('vehiculoForm');
    if (!form.checkValidity()) { form.reportValidity(); return; }

    const data = {
        placa:       document.getElementById('vehiculoPlaca').value,
        marca:       document.getElementById('vehiculoMarca').value,
        modelo:      document.getElementById('vehiculoModelo').value,
        año:         document.getElementById('vehiculoAnio').value || '',
        color:       document.getElementById('vehiculoColor').value || '',
        clienteId:   document.getElementById('vehiculoCliente').value,
        kilometraje: document.getElementById('vehiculoKilometraje').value || '',
        notas:       document.getElementById('vehiculoNotas').value || ''
    };

    const btn = document.getElementById('saveVehiculoBtn');
    btn.disabled = true;
    try {
        if (AppState.editingVehiculoId) {
            await VehiculoManager.updateVehiculo(AppState.editingVehiculoId, data);
            UIManager.showNotification('Vehículo actualizado correctamente', 'success');
        } else {
            await VehiculoManager.createVehiculo(data);
            UIManager.showNotification('Vehículo creado correctamente', 'success');
        }
        cerrarModal('vehiculoModal');
        renderVehiculos();
    } catch (e) { /* manejado en el manager */ }
    finally { btn.disabled = false; }
}

async function guardarCliente() {
    const form = document.getElementById('clienteForm');
    if (!form.checkValidity()) { form.reportValidity(); return; }

    const data = {
        nombre:    document.getElementById('clienteNombre').value,
        telefono:  document.getElementById('clienteTelefono').value,
        email:     document.getElementById('clienteEmail').value || '',
        direccion: document.getElementById('clienteDireccion').value || '',
        notas:     document.getElementById('clienteNotas').value || ''
    };

    const btn = document.getElementById('saveClienteBtn');
    btn.disabled = true;
    try {
        if (AppState.editingClienteId) {
            await ClienteManager.updateCliente(AppState.editingClienteId, data);
            UIManager.showNotification('Cliente actualizado correctamente', 'success');
        } else {
            await ClienteManager.createCliente(data);
            UIManager.showNotification('Cliente creado correctamente', 'success');
        }
        cerrarModal('clienteModal');
        renderClientes();
    } catch (e) { /* manejado en el manager */ }
    finally { btn.disabled = false; }
}

async function guardarServicio() {
    const form = document.getElementById('servicioForm');
    if (!form.checkValidity()) { form.reportValidity(); return; }

    const data = {
        nombre:      document.getElementById('servicioNombre').value,
        descripcion: document.getElementById('servicioDescripcion').value || '',
        precio:      parseFloat(document.getElementById('servicioPrecio').value),
        duracion:    document.getElementById('servicioDuracion').value || '',
        categoria:   document.getElementById('servicioCategoria').value || ''
    };

    const btn = document.getElementById('saveServicioBtn');
    btn.disabled = true;
    try {
        if (AppState.editingServicioId) {
            await ServicioManager.updateServicio(AppState.editingServicioId, data);
            UIManager.showNotification('Servicio actualizado correctamente', 'success');
        } else {
            await ServicioManager.createServicio(data);
            UIManager.showNotification('Servicio creado correctamente', 'success');
        }
        cerrarModal('servicioModal');
        renderServicios();
    } catch (e) { /* manejado en el manager */ }
    finally { btn.disabled = false; }
}

async function guardarEmpleado() {
    const form = document.getElementById('empleadoForm');
    if (!form.checkValidity()) { form.reportValidity(); return; }

    const data = {
        nombre:       document.getElementById('empleadoNombre').value,
        especialidad: document.getElementById('empleadoEspecialidad').value || '',
        telefono:     document.getElementById('empleadoTelefono').value || '',
        email:        document.getElementById('empleadoEmail').value || '',
        horario:      document.getElementById('empleadoHorario').value || ''
    };

    const btn = document.getElementById('saveEmpleadoBtn');
    btn.disabled = true;
    try {
        if (AppState.editingEmpleadoId) {
            await EmpleadoManager.updateEmpleado(AppState.editingEmpleadoId, data);
            UIManager.showNotification('Empleado actualizado correctamente', 'success');
        } else {
            await EmpleadoManager.createEmpleado(data);
            UIManager.showNotification('Empleado creado correctamente', 'success');
        }
        cerrarModal('empleadoModal');
        renderConfiguracion();
    } catch (e) { /* manejado en el manager */ }
    finally { btn.disabled = false; }
}

// ===== NAVEGACIÓN DE PÁGINAS =====

function cargarPagina(pagina) {
    document.querySelectorAll('#dynamicContent > .content-area').forEach(el => {
        el.style.display = 'none';
    });
    AppState.currentPage = pagina;

    const statsContainer = document.getElementById('statsContainer');
    const tabsContainer  = document.getElementById('tabsContainer');

    if (pagina === 'agenda') {
        document.getElementById('agendaContent').style.display = 'block';
        if (statsContainer) statsContainer.style.display = 'grid';
        if (tabsContainer)  tabsContainer.style.display  = 'flex';
        renderAgenda();
        actualizarEstadisticas();
    } else {
        if (statsContainer) statsContainer.style.display = 'none';
        if (tabsContainer)  tabsContainer.style.display  = 'none';
        document.getElementById(`${pagina}Content`).style.display = 'block';
        switch (pagina) {
            case 'vehiculos':     renderVehiculos();    break;
            case 'clientes':      renderClientes();     break;
            case 'servicios':     renderServicios();    break;
            case 'reportes':      renderReportes();     break;
            case 'configuracion': renderConfiguracion(); break;
        }
    }
}

// ===== RENDER DE SECCIONES =====

function renderVehiculos() {
    const buttons = UIManager.renderVehiculos(DataStore.vehiculos, document.getElementById('vehiculosList'));
    if (!buttons) return;
    buttons.editBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const vehiculo = DataUtils.findVehiculoById(e.currentTarget.getAttribute('data-id'));
            if (vehiculo) ModalManager.openVehiculoModal(vehiculo);
        });
    });
    buttons.deleteBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            if (!confirm('¿Eliminar este vehículo?')) return;
            await VehiculoManager.deleteVehiculo(id);
            UIManager.showNotification('Vehículo eliminado', 'success');
            renderVehiculos();
        });
    });
}

function renderClientes() {
    const buttons = UIManager.renderClientes(DataStore.clientes, document.getElementById('clientesList'));
    if (!buttons) return;
    buttons.editBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const cliente = DataUtils.findClienteById(e.currentTarget.getAttribute('data-id'));
            if (cliente) ModalManager.openClienteModal(cliente);
        });
    });
    buttons.deleteBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            if (DataStore.vehiculos.some(v => v.clienteId === id)) {
                alert('No se puede eliminar: el cliente tiene vehículos asociados.');
                return;
            }
            if (!confirm('¿Eliminar este cliente?')) return;
            await ClienteManager.deleteCliente(id);
            UIManager.showNotification('Cliente eliminado', 'success');
            renderClientes();
        });
    });
}

function renderServicios() {
    const buttons = UIManager.renderServicios(DataStore.tiposServicio, document.getElementById('serviciosList'));
    if (!buttons) return;
    buttons.editBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const servicio = DataUtils.findServicioById(e.currentTarget.getAttribute('data-id'));
            if (servicio) ModalManager.openServicioModal(servicio);
        });
    });
    buttons.deleteBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            if (!confirm('¿Eliminar este tipo de servicio?')) return;
            await ServicioManager.deleteServicio(id);
            UIManager.showNotification('Servicio eliminado', 'success');
            renderServicios();
        });
    });
}

function renderReportes() {
    UIManager.renderReportes(
        AppState.currentReport || 'diario',
        document.getElementById('reportesContentArea')
    );
}

function renderConfiguracion() {
    const tipo = AppState.currentConfig || 'perfil';
    UIManager.renderConfiguracion(tipo, document.getElementById('configuracionArea'));

    if (tipo === 'perfil') {
        document.getElementById('savePerfilBtn')?.addEventListener('click', () => {
            const name  = document.getElementById('cfgNombre')?.value.trim();
            const email = document.getElementById('cfgEmail')?.value.trim();
            if (!name) { UIManager.showNotification('El nombre no puede estar vacío', 'error'); return; }
            localStorage.setItem('th_admin_name', name);
            localStorage.setItem('th_admin_email', email);
            const nameEl   = document.querySelector('.user-name');
            const avatarEl = document.querySelector('.user-avatar');
            if (nameEl)   nameEl.textContent   = name;
            if (avatarEl) avatarEl.textContent  = name.substring(0,2).toUpperCase();
            UIManager.showNotification('Perfil actualizado correctamente', 'success');
        });

        document.getElementById('savePasswordBtn')?.addEventListener('click', () => {
            const nueva     = document.getElementById('cfgPassNueva')?.value;
            const confirmar = document.getElementById('cfgPassConfirmar')?.value;
            if (!nueva || nueva.length < 6) { UIManager.showNotification('La contraseña debe tener al menos 6 caracteres', 'error'); return; }
            if (nueva !== confirmar)         { UIManager.showNotification('Las contraseñas no coinciden', 'error'); return; }
            localStorage.setItem('th_admin_pass', nueva);
            ['cfgPassActual','cfgPassNueva','cfgPassConfirmar'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
            UIManager.showNotification('Contraseña actualizada correctamente', 'success');
        });

        document.getElementById('themeToggle')?.addEventListener('change', (e) => {
            const theme = e.target.checked ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('th_theme', theme);
        });

    } else if (tipo === 'taller') {
        document.getElementById('saveTallerBtn')?.addEventListener('click', () => {
            const data = {
                nombre:    document.getElementById('tallerNombre')?.value   || '',
                telefono:  document.getElementById('tallerTelefono')?.value || '',
                direccion: document.getElementById('tallerDireccion')?.value|| '',
                email:     document.getElementById('tallerEmail')?.value    || '',
                apertura:  document.getElementById('tallerApertura')?.value || '08:00',
                cierre:    document.getElementById('tallerCierre')?.value   || '18:00'
            };
            localStorage.setItem('th_taller', JSON.stringify(data));
            if (data.nombre) {
                const logoEl = document.querySelector('.logo h1');
                if (logoEl) logoEl.textContent = data.nombre;
            }
            UIManager.showNotification('Información del taller guardada', 'success');
        });

    } else if (tipo === 'empleados') {
        document.getElementById('addEmpleadoBtn')?.addEventListener('click', () => ModalManager.openEmpleadoModal());
        document.querySelectorAll('[data-type="empleado"].btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const emp = DataUtils.findEmpleadoById(e.currentTarget.getAttribute('data-id'));
                if (emp) ModalManager.openEmpleadoModal(emp);
            });
        });
        document.querySelectorAll('[data-type="empleado"].btn-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                await EmpleadoManager.deleteEmpleado(id);
                UIManager.showNotification('Empleado eliminado', 'success');
                renderConfiguracion();
            });
        });

    } else if (tipo === 'general') {
        document.getElementById('saveConfigBtn')?.addEventListener('click', () => {
            ModalManager.saveConfigGeneral?.();
        });

    } else if (tipo === 'horarios') {
        document.getElementById('saveHorariosBtn')?.addEventListener('click', () => {
            ModalManager.saveConfigHorarios?.();
        });
    }
}

// ===== AGENDA =====

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
                <i class="fas fa-car"></i>
                <h4>No hay servicios agendados</h4>
                <p>${AppState.currentTab === 'all' ? 'Usa el botón "Agendar Vehículo" para comenzar' : `No hay servicios ${DataUtils.getTabName(AppState.currentTab)}`}</p>
            </div>`;
        return;
    }

    const statusMap = {
        pending:   { cls:'status-pending',    txt:'Pendiente',  icon:'fas fa-clock' },
        process:   { cls:'status-in-process', txt:'En Proceso', icon:'fas fa-tools' },
        completed: { cls:'status-completed',  txt:'Completado', icon:'fas fa-check-circle' },
        cancelled: { cls:'status-cancelled',  txt:'Cancelado',  icon:'fas fa-ban' }
    };

    let html = `
        <div class="table-responsive">
            <table class="services-table">
                <thead>
                    <tr>
                        <th>Vehículo</th><th>Propietario</th><th>Fecha</th><th>Hora</th>
                        <th>Servicio</th><th>Empleado</th><th>Teléfono</th><th>Estado</th>
                        <th style="text-align:center;">Acciones</th>
                    </tr>
                </thead>
                <tbody>`;

    servicios.forEach(s => {
        const st = statusMap[s.status] || statusMap.pending;
        const hora = s.time ? s.time.substring(0,5) : '--:--';
        html += `
            <tr>
                <td><strong>${s.vehicle}</strong></td>
                <td>${s.owner}</td>
                <td>${DataUtils.formatDate(s.date)}</td>
                <td>${hora}</td>
                <td>${s.service}</td>
                <td>${s.employee || 'Sin asignar'}</td>
                <td>${s.phone}</td>
                <td><span class="service-status ${st.cls}"><i class="${st.icon}"></i>${st.txt}</span></td>
                <td>
                    <div class="action-buttons" style="justify-content:center;">
                        ${s.status !== 'completed' ? `<button class="action-btn-icon btn-complete" data-id="${s.id}" title="Completar"><i class="fas fa-check"></i></button>` : ''}
                        <button class="action-btn-icon btn-delete" data-id="${s.id}" title="Eliminar"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>`;
    });

    html += `</tbody></table></div>`;
    container.innerHTML = html;

    // Wire action buttons
    container.querySelectorAll('.btn-complete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            await ServiceManager.updateService(id, { estado: 'Completado' });
            await cargarDatosReales();
            renderListaServicios();
            actualizarEstadisticas();
            UIManager.showNotification('Servicio marcado como completado', 'success');
        });
    });
    container.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            await ServiceManager.deleteService(id);
            await cargarDatosReales();
            renderListaServicios();
            actualizarEstadisticas();
            UIManager.showNotification('Registro eliminado', 'success');
        });
    });
}

function cambiarVistaAgenda(vista) {
    AppState.currentView = vista;
    document.getElementById('listView').style.display = 'none';
    const weekView     = document.getElementById('weekView');
    const calendarView = document.getElementById('calendarView');
    if (weekView)     weekView.style.display     = 'none';
    if (calendarView) calendarView.style.display = 'none';

    switch (vista) {
        case 'list':
            document.getElementById('listView').style.display = 'block';
            renderListaServicios();
            break;
        case 'week':
            if (weekView) {
                weekView.style.display = 'block';
                CalendarManager.setupWeekView(weekView.querySelector('.calendar-container'), DataStore.services);
            }
            break;
        case 'calendar':
            if (calendarView) {
                calendarView.style.display = 'block';
                CalendarManager.setupCalendarView(calendarView.querySelector('.calendar-container'), DataStore.services);
            }
            break;
    }
}

function renderVistaPlaceholder() {
    const container = document.getElementById('weekView') || document.getElementById('calendarView');
    if (container) container.innerHTML = `
        <div style="padding:40px;text-align:center;">
            <div style="font-size:48px;color:#ccc;margin-bottom:20px;"><i class="fas fa-calendar"></i></div>
            <h3 style="color:#666;">En Desarrollo</h3>
            <p style="color:#888;">Esta vista estará disponible próximamente</p>
        </div>`;
}

function actualizarEstadisticas() {
    const s = DataStore.services || [];
    const map = {
        totalCount:     s.length,
        pendingCount:   s.filter(x => x.status === 'pending').length,
        processCount:   s.filter(x => x.status === 'process').length,
        completedCount: s.filter(x => x.status === 'completed').length
    };
    Object.entries(map).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    });
}
