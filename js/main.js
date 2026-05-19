// main.js - VERSIÓN COMPLETA

// ── Pasos de progreso del vehículo ────────────────────────────────────────────
const PASOS_PROGRESO = [
    { key: 'recepcion',   label: 'Recepción',    icon: 'fas fa-car',            desc: 'Vehículo recibido en el taller' },
    { key: 'diagnostico', label: 'Diagnóstico',  icon: 'fas fa-search',         desc: 'Evaluación completa del vehículo' },
    { key: 'reparacion',  label: 'Reparación',   icon: 'fas fa-tools',          desc: 'Vehículo en proceso de reparación' },
    { key: 'calidad',     label: 'Calidad',       icon: 'fas fa-clipboard-check',desc: 'Verificación y control final' },
    { key: 'entrega',     label: 'Entrega',       icon: 'fas fa-handshake',      desc: 'Vehículo listo y entregado al cliente' }
];

function getProgresoIndex(progreso) {
    return PASOS_PROGRESO.findIndex(p => p.key === progreso);
}

function getProgresoLabel(progreso) {
    const paso = PASOS_PROGRESO.find(p => p.key === progreso);
    return paso ? paso.label : 'Sin iniciar';
}

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

// Solo los botones de ELIMINAR requieren confirmación
function shouldSkipConfirm(btn) {
    if (btn.closest('#confirmModal')) return true;
    // Solo pedir confirmación para botones de eliminar
    const isDelete = btn.classList.contains('btn-delete') ||
                     btn.classList.contains('svc-btn-delete') ||
                     btn.classList.contains('card-btn-delete');
    return !isDelete;
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

    // Verificar sesión — redirigir si no hay usuario
    const sessionRaw = localStorage.getItem('tallerhunter_user');
    if (!sessionRaw) {
        window.location.href = '../login/index.html';
        return;
    }

    // Apply persisted theme
    const savedTheme = localStorage.getItem('th_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Cargar nombre real del usuario autenticado
    try {
        const userData = JSON.parse(sessionRaw);
        const displayName = userData.nombre || localStorage.getItem('th_admin_name') || 'Administrador';
        const nameEl   = document.querySelector('.user-name');
        const avatarEl = document.querySelector('.user-avatar');
        if (nameEl)   nameEl.textContent  = displayName;
        if (avatarEl) avatarEl.textContent = displayName.substring(0, 2).toUpperCase();
        const roleEl = document.querySelector('.user-role');
        if (roleEl) roleEl.textContent = userData.rol || 'Sistema';
    } catch (e) {
        localStorage.removeItem('tallerhunter_user');
        window.location.href = '../login/index.html';
        return;
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
                id:                 s.id,
                codigo_seguimiento: s.codigo_seguimiento || s.id,  // fallback para registros anteriores
                cliente_id:         s.cliente_id  || '',
                vehiculo_id:        s.vehiculo_id || '',
                vehicle:    s.placa         || (vObj ? vObj.placa   : s.vehiculo_id  || 'N/A'),
                owner:      s.propietario   || (cObj ? cObj.nombre  : 'N/A'),
                date:       s.fecha         || new Date().toISOString().split('T')[0],
                service:    s.tipo_servicio || (tObj ? tObj.nombre  : 'N/A'),
                phone:      s.telefono      || (cObj ? cObj.telefono : 'No disponible'),
                time:       s.hora          || '08:00',
                employee:   s.empleado      || (eObj ? eObj.nombre  : 'Sin asignar'),
                status:     normalizeStatus(s.estado),
                notes:      s.notas || '',
                progreso:   s.progreso || null
            };
        });

        // clientes: id, nombre, email, telefono, vehiculos, total_servicios, desde, estado
        DataStore.clientes = clientes.map(c => ({
            id:             c.id,
            nombre:         c.nombre         || '',
            telefono:       c.telefono        || '',
            email:          c.email           || '',
            desde:          c.desde           || '',
            estado:         c.estado          || '',
            total_servicios: c.total_servicios || 0,
            vehiculosCount:  c.vehiculos      || 0
        }));

        // vehiculos: id, placa, modelo, marca, anio, color, cliente, ultimo_servicio, estado, cliente_id
        DataStore.vehiculos = vehiculos.map(v => ({
            id:        v.id,
            placa:     v.placa    || '',
            marca:     v.marca    || '',
            modelo:    v.modelo   || '',
            anio:      v.anio     || '',
            color:     v.color    || '',
            clienteId: v.cliente_id || '',
            cliente:   v.cliente  || '',
            estado:    v.estado   || 'Activo'
        }));

        // tipos_servicio: id, codigo, nombre, categoria, duracion, precio_base, descripcion, estado
        DataStore.tiposServicio = tiposServicio.map(t => ({
            id:          t.id,
            codigo:      t.codigo      || t.id,
            nombre:      t.nombre      || '',
            descripcion: t.descripcion || '',
            precio:      t.precio_base ?? 0,
            duracion:    t.duracion    || '',
            categoria:   t.categoria   || '',
            estado:      t.estado      || 'Activo'
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

    // Search bars
    document.getElementById('searchAgenda')?.addEventListener('input', e => {
        AppState.searchAgenda = e.target.value;
        if (AppState.currentPage === 'agenda') renderListaServicios();
    });
    document.getElementById('searchVehiculos')?.addEventListener('input', e => {
        AppState.searchVehiculos = e.target.value;
        if (AppState.currentPage === 'vehiculos') renderVehiculos();
    });
    document.getElementById('searchClientes')?.addEventListener('input', e => {
        AppState.searchClientes = e.target.value;
        if (AppState.currentPage === 'clientes') renderClientes();
    });
    document.getElementById('searchServicios')?.addEventListener('input', e => {
        AppState.searchServicios = e.target.value;
        if (AppState.currentPage === 'servicios') renderServicios();
    });

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('tallerhunter_user');
            localStorage.removeItem('th_admin_name');
            localStorage.removeItem('th_theme');
            localStorage.removeItem('th_session');
            window.location.href = '../login/index.html';
        });
    }

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

    // Modal de progreso: cerrar al click fuera
    const progresoModal = document.getElementById('progresoModal');
    if (progresoModal) {
        progresoModal.addEventListener('click', (e) => {
            if (e.target === progresoModal) cerrarModalProgreso();
        });
    }

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

    // Esquema real: placa, marca, modelo, anio, color, cliente_id  (no existe kilometraje ni notas)
    const data = {
        placa:     document.getElementById('vehiculoPlaca').value,
        marca:     document.getElementById('vehiculoMarca').value,
        modelo:    document.getElementById('vehiculoModelo').value,
        anio:      document.getElementById('vehiculoAnio').value  || null,
        color:     document.getElementById('vehiculoColor').value || null,
        clienteId: document.getElementById('vehiculoCliente').value
    };

    const btn = document.getElementById('saveVehiculoBtn');
    btn.disabled = true;
    try {
        let result;
        if (AppState.editingVehiculoId) {
            result = await VehiculoManager.updateVehiculo(AppState.editingVehiculoId, data);
            UIManager.showNotification('Vehículo actualizado correctamente', 'success');
        } else {
            result = await VehiculoManager.createVehiculo(data);
            UIManager.showNotification('Vehículo creado correctamente', 'success');
        }
        cerrarModal('vehiculoModal');
        // Si el modal de agenda está abierto, refrescar vehículos y pre-seleccionar
        const scheduleModal = document.getElementById('scheduleModal');
        if (scheduleModal && scheduleModal.style.display === 'flex') {
            const clienteId = document.getElementById('cliente')?.value;
            AgendaManager.poblarVehiculos(clienteId);
            if (result && result.id) {
                setTimeout(() => {
                    const sel = document.getElementById('vehiculo');
                    if (sel) sel.value = result.id;
                }, 50);
            }
        } else if (AppState.currentPage === 'vehiculos') {
            renderVehiculos();
        }
    } catch (e) { /* manejado en el manager */ }
    finally { btn.disabled = false; }
}

async function guardarCliente() {
    const form = document.getElementById('clienteForm');
    if (!form.checkValidity()) { form.reportValidity(); return; }

    // Esquema real: nombre, email, telefono  (no existe direccion ni notas)
    const data = {
        nombre:   document.getElementById('clienteNombre').value,
        telefono: document.getElementById('clienteTelefono').value,
        email:    document.getElementById('clienteEmail').value || ''
    };

    const btn = document.getElementById('saveClienteBtn');
    btn.disabled = true;
    try {
        let result;
        if (AppState.editingClienteId) {
            result = await ClienteManager.updateCliente(AppState.editingClienteId, data);
            UIManager.showNotification('Cliente actualizado correctamente', 'success');
        } else {
            result = await ClienteManager.createCliente(data);
            UIManager.showNotification('Cliente creado correctamente', 'success');
        }
        cerrarModal('clienteModal');
        // Si el modal de agenda está abierto, refrescar selects y pre-seleccionar cliente
        const scheduleModal = document.getElementById('scheduleModal');
        if (scheduleModal && scheduleModal.style.display === 'flex') {
            AgendaManager.poblarSelects();
            if (result && result.id) {
                setTimeout(() => {
                    const sel = document.getElementById('cliente');
                    if (sel) { sel.value = result.id; sel.dispatchEvent(new Event('change')); }
                }, 50);
            }
        } else if (AppState.currentPage === 'clientes') {
            renderClientes();
        }
    } catch (e) { /* manejado en el manager */ }
    finally { btn.disabled = false; }
}

async function guardarServicio() {
    const form = document.getElementById('servicioForm');
    if (!form.checkValidity()) { form.reportValidity(); return; }

    // Esquema real: nombre, descripcion, precio_base, duracion, categoria
    const data = {
        nombre:      document.getElementById('servicioNombre').value,
        descripcion: document.getElementById('servicioDescripcion').value || '',
        precio:      parseFloat(document.getElementById('servicioPrecio').value) || 0,
        precio_base: parseFloat(document.getElementById('servicioPrecio').value) || 0,
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
    const q = (AppState.searchVehiculos || '').toLowerCase().trim();
    const data = q
        ? DataStore.vehiculos.filter(v =>
            `${v.placa} ${v.marca} ${v.modelo} ${v.cliente}`.toLowerCase().includes(q))
        : DataStore.vehiculos;
    const buttons = UIManager.renderVehiculos(data, document.getElementById('vehiculosList'));
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
    const q = (AppState.searchClientes || '').toLowerCase().trim();
    const data = q
        ? DataStore.clientes.filter(c =>
            `${c.nombre} ${c.telefono} ${c.email}`.toLowerCase().includes(q))
        : DataStore.clientes;
    const buttons = UIManager.renderClientes(data, document.getElementById('clientesList'));
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
    const q = (AppState.searchServicios || '').toLowerCase().trim();
    const data = q
        ? DataStore.tiposServicio.filter(s =>
            `${s.nombre} ${s.categoria} ${s.descripcion}`.toLowerCase().includes(q))
        : DataStore.tiposServicio;
    const buttons = UIManager.renderServicios(data, document.getElementById('serviciosList'));
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
    const q = (AppState.searchAgenda || '').toLowerCase().trim();
    if (q) {
        servicios = servicios.filter(s =>
            `${s.codigo_seguimiento || s.id} ${s.vehicle} ${s.owner} ${s.service} ${s.employee}`.toLowerCase().includes(q));
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
                        <th>Código</th><th>Vehículo</th><th>Propietario</th><th>Fecha</th>
                        <th>Servicio</th><th>Empleado</th><th>Estado</th>
                        <th>Progreso</th>
                        <th style="text-align:center;">Acciones</th>
                    </tr>
                </thead>
                <tbody>`;

    servicios.forEach(s => {
        const st = statusMap[s.status] || statusMap.pending;
        const hora   = s.time ? s.time.substring(0,5) : '--:--';
        const codigo = s.codigo_seguimiento || s.id || '—';
        const progresoIdx = getProgresoIndex(s.progreso);
        const progresoLabel = getProgresoLabel(s.progreso);

        // Mini barra de progreso (5 puntos)
        const minitimeline = PASOS_PROGRESO.map((p, i) => {
            const cls = i < progresoIdx ? 'mini-step done' : i === progresoIdx ? 'mini-step active' : 'mini-step';
            return `<span class="${cls}" title="${p.desc}"></span>`;
        }).join('');

        html += `
            <tr>
                <td><span class="tracking-badge" title="Código de seguimiento">${codigo}</span></td>
                <td><strong>${s.vehicle}</strong><br><small style="color:var(--gray-500)">${hora}</small></td>
                <td>${s.owner}<br><small style="color:var(--gray-500)">${s.phone}</small></td>
                <td>${DataUtils.formatDate(s.date)}</td>
                <td>${s.service}</td>
                <td>${s.employee || 'Sin asignar'}</td>
                <td><span class="service-status ${st.cls}"><i class="${st.icon}"></i>${st.txt}</span></td>
                <td>
                    <div class="mini-progress" title="${progresoLabel}">${minitimeline}</div>
                    <small style="color:var(--gray-500);font-size:11px;">${progresoLabel}</small>
                </td>
                <td>
                    <div class="action-buttons" style="justify-content:center;">
                        ${s.status !== 'completed' ? `<button class="action-btn-icon btn-progreso" data-id="${s.id}" title="Actualizar Progreso" style="color:#0891b2;"><i class="fas fa-tasks"></i></button>` : ''}
                        ${s.status !== 'completed' ? `<button class="action-btn-icon btn-complete" data-id="${s.id}" title="Marcar Completado"><i class="fas fa-check"></i></button>` : ''}
                        <button class="action-btn-icon btn-print" data-id="${s.id}" title="Imprimir Factura" style="color:#7c3aed;"><i class="fas fa-print"></i></button>
                        <button class="action-btn-icon btn-delete" data-id="${s.id}" title="Eliminar"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>`;
    });

    html += `</tbody></table></div>`;
    container.innerHTML = html;

    // Wire action buttons
    container.querySelectorAll('.btn-progreso').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            abrirModalProgreso(id);
        });
    });
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
    container.querySelectorAll('.btn-print').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            printServiceInvoice(id);
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

// ===== PRINT INVOICE =====

function printServiceInvoice(serviceId) {
    const s = DataUtils.findServiceById(serviceId);
    if (!s) { UIManager.showNotification('Servicio no encontrado', 'error'); return; }

    // ── Datos del taller ─────────────────────────────────────────────────────
    const tallerData   = (() => { try { return JSON.parse(localStorage.getItem('th_taller') || '{}'); } catch(e) { return {}; } })();
    const tallerNombre = tallerData.nombre    || 'Taller Hunter';
    const tallerTel    = tallerData.telefono  || '+1 (809) 555-1234';
    const tallerDir    = tallerData.direccion || 'Av. Principal #123, Santo Domingo';
    const tallerEmail  = tallerData.email     || 'info@tallerhunter.com';
    const tallerRNC    = tallerData.rnc       || '';

    // ── Búsqueda del precio del servicio ────────────────────────────────────
    // Busca por nombre exacto o por tipo_servicio_id si está disponible
    const tipoObj = DataStore.tiposServicio.find(t =>
        t.nombre === s.service ||
        (s.tipo_servicio_id && String(t.id) === String(s.tipo_servicio_id))
    );
    const precioUnitario = parseFloat(tipoObj?.precio ?? tipoObj?.precio_base ?? 0);
    const cantidad       = 1;

    // ── Cálculo financiero ───────────────────────────────────────────────────
    const IVA_PCT  = parseFloat(DataStore.configuracion?.iva ?? 18);   // ITBIS RD
    const subtotal = precioUnitario * cantidad;
    const impuesto = subtotal * (IVA_PCT / 100);
    const total    = subtotal + impuesto;

    // Formateador de moneda DOP
    const fmt = (n) => new Intl.NumberFormat('es-DO', {
        style:                 'currency',
        currency:              'DOP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(n);

    // ── Estado visual ────────────────────────────────────────────────────────
    const statusLabel  = { pending:'Pendiente', process:'En Proceso', completed:'Completado', cancelled:'Cancelado' };
    const statusColors = { pending:'#d97706',   process:'#2563eb',    completed:'#16a34a',    cancelled:'#dc2626'  };
    const st            = s.status || 'pending';
    const codigoVisible = s.codigo_seguimiento || s.id || 'N/A';

    // ── Progreso ─────────────────────────────────────────────────────────────
    const progresoLabels = {
        recepcion: 'Recepción del vehículo', diagnostico: 'Diagnóstico detallado',
        reparacion: 'Reparación / Servicio', calidad: 'Control de calidad',
        entrega: 'Entrega al cliente'
    };
    const progresoText = s.progreso ? progresoLabels[s.progreso] || s.progreso : 'Sin iniciar';

    // ── Fila de item ─────────────────────────────────────────────────────────
    const itemRow = precioUnitario > 0
        ? `<tr>
            <td style="padding:10px 8px;">${s.service || 'Servicio general'}</td>
            <td style="padding:10px 8px;text-align:center;">${cantidad}</td>
            <td style="padding:10px 8px;text-align:right;">${fmt(precioUnitario)}</td>
            <td style="padding:10px 8px;text-align:right;font-weight:600;">${fmt(subtotal)}</td>
           </tr>`
        : `<tr>
            <td style="padding:10px 8px;">${s.service || 'Servicio general'}</td>
            <td style="padding:10px 8px;text-align:center;">1</td>
            <td style="padding:10px 8px;text-align:right;color:#94a3b8;">—</td>
            <td style="padding:10px 8px;text-align:right;color:#94a3b8;">—</td>
           </tr>`;

    // ── Bloque de totales ────────────────────────────────────────────────────
    const totalesHTML = precioUnitario > 0
        ? `<tr style="border-top:1px solid #e2e8f0;">
               <td colspan="3" style="padding:8px;text-align:right;color:#64748b;font-size:12px;">Subtotal</td>
               <td style="padding:8px;text-align:right;">${fmt(subtotal)}</td>
           </tr>
           <tr>
               <td colspan="3" style="padding:8px;text-align:right;color:#64748b;font-size:12px;">ITBIS (${IVA_PCT}%)</td>
               <td style="padding:8px;text-align:right;">${fmt(impuesto)}</td>
           </tr>
           <tr style="background:#1d4ed8;color:#fff;">
               <td colspan="3" style="padding:12px 8px;text-align:right;font-weight:700;font-size:14px;letter-spacing:.5px;">TOTAL A PAGAR</td>
               <td style="padding:12px 8px;text-align:right;font-weight:800;font-size:18px;">${fmt(total)}</td>
           </tr>`
        : `<tr style="border-top:1px solid #e2e8f0;">
               <td colspan="4" style="padding:12px 8px;text-align:center;color:#94a3b8;font-size:12px;">
                   El precio de este servicio no está configurado en el catálogo.
               </td>
           </tr>`;

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Factura ${codigoVisible} — ${tallerNombre}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:Arial,sans-serif;font-size:13px;color:#1a1a2e;padding:24px;background:#fff;}
  .invoice{max-width:700px;margin:0 auto;}

  /* Encabezado */
  .inv-header{display:flex;justify-content:space-between;align-items:flex-start;
              margin-bottom:28px;padding-bottom:20px;border-bottom:3px solid #1d4ed8;}
  .inv-logo h1{font-size:22px;color:#1d4ed8;margin-bottom:4px;}
  .inv-logo p{font-size:11px;color:#64748b;line-height:1.6;}
  .inv-meta{text-align:right;}
  .inv-meta h2{font-size:18px;color:#1d4ed8;text-transform:uppercase;letter-spacing:1px;}
  .tracking{display:inline-block;background:#dbeafe;color:#1d4ed8;border:1.5px solid #93c3fd;
             font-family:monospace;font-size:14px;font-weight:700;
             padding:5px 12px;border-radius:6px;margin:6px 0;}
  .status-pill{display:inline-block;padding:3px 10px;border-radius:20px;color:#fff;
               font-weight:700;font-size:11px;background:${statusColors[st]||'#64748b'};}

  /* Secciones */
  .section{margin-bottom:20px;}
  .section-title{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#64748b;
                 border-bottom:1px solid #e2e8f0;padding-bottom:5px;margin-bottom:10px;}
  .grid-2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
  .field label{font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:2px;}
  .field span{font-weight:600;font-size:13px;}

  /* Tabla de servicios */
  .items-table{width:100%;border-collapse:collapse;margin-bottom:0;}
  .items-table thead th{background:#f8fafc;padding:8px;font-size:11px;text-transform:uppercase;
                         letter-spacing:.5px;color:#64748b;border-bottom:2px solid #e2e8f0;}
  .items-table tbody tr:nth-child(even){background:#fafafa;}
  .items-table tbody tr:hover{background:#f1f5f9;}
  .items-table tfoot td{font-size:13px;}

  /* Caja de progreso */
  .progress-box{background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;
                padding:12px 16px;margin-bottom:20px;}
  .progress-box .pb-label{font-size:10px;text-transform:uppercase;color:#0369a1;letter-spacing:.5px;}
  .progress-box .pb-value{font-weight:600;color:#0c4a6e;margin-top:2px;}

  /* Caja código */
  .code-box{background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:8px;
             padding:12px 16px;text-align:center;margin-bottom:20px;}
  .code-box .cb-label{font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px;}
  .code-box .cb-code{font-family:monospace;font-size:18px;font-weight:800;color:#1d4ed8;margin:4px 0;}
  .code-box .cb-note{font-size:11px;color:#94a3b8;}

  /* Pie */
  .inv-footer{margin-top:28px;padding-top:14px;border-top:1px solid #e2e8f0;
              text-align:center;font-size:11px;color:#94a3b8;line-height:1.8;}

  @media print{
    body{padding:0;}
    @page{margin:1cm;}
    .items-table tfoot tr:last-child td{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
  }
</style>
</head>
<body>
<div class="invoice">

  <!-- ENCABEZADO -->
  <div class="inv-header">
    <div class="inv-logo">
      <h1>&#128295; ${tallerNombre}</h1>
      <p>${tallerDir}</p>
      <p>${tallerTel} &bull; ${tallerEmail}</p>
      ${tallerRNC ? `<p>RNC: ${tallerRNC}</p>` : ''}
    </div>
    <div class="inv-meta">
      <h2>Factura de Servicio</h2>
      <div class="tracking">${codigoVisible}</div><br>
      <small style="color:#64748b;">
        ${DataUtils.formatDate(s.date)} &bull; ${s.time ? s.time.substring(0,5) : '--:--'}
      </small><br>
      <div class="status-pill" style="margin-top:6px;">${statusLabel[st] || st}</div>
    </div>
  </div>

  <!-- CLIENTE -->
  <div class="section">
    <div class="section-title">Información del Cliente</div>
    <div class="grid-2">
      <div class="field"><label>Propietario</label><span>${s.owner || '—'}</span></div>
      <div class="field"><label>Teléfono</label><span>${s.phone || '—'}</span></div>
    </div>
  </div>

  <!-- VEHÍCULO Y TÉCNICO -->
  <div class="section">
    <div class="section-title">Información del Vehículo y Servicio</div>
    <div class="grid-2">
      <div class="field"><label>Placa del Vehículo</label><span>${s.vehicle || '—'}</span></div>
      <div class="field"><label>Técnico Asignado</label><span>${s.employee || 'Sin asignar'}</span></div>
      <div class="field"><label>Fecha de Ingreso</label><span>${DataUtils.formatDate(s.date)}</span></div>
      <div class="field"><label>Hora de Ingreso</label><span>${s.time ? s.time.substring(0,5) : '—'}</span></div>
    </div>
    ${s.notes ? `
    <div style="margin-top:10px;background:#f8fafc;padding:10px;border-radius:6px;border-left:3px solid #cbd5e1;">
      <div style="font-size:10px;color:#94a3b8;text-transform:uppercase;margin-bottom:4px;">Observaciones</div>
      <div style="font-size:12px;">${s.notes}</div>
    </div>` : ''}
  </div>

  <!-- PROGRESO -->
  ${s.progreso ? `
  <div class="progress-box">
    <div class="pb-label">Estado de Progreso</div>
    <div class="pb-value">&#9654; ${progresoText}</div>
  </div>` : ''}

  <!-- DETALLE DE SERVICIOS Y TOTALES -->
  <div class="section">
    <div class="section-title">Detalle del Servicio</div>
    <table class="items-table">
      <thead>
        <tr>
          <th style="text-align:left;">Descripción</th>
          <th style="text-align:center;width:60px;">Qty</th>
          <th style="text-align:right;width:130px;">Precio Unit.</th>
          <th style="text-align:right;width:130px;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemRow}
      </tbody>
      <tfoot>
        ${totalesHTML}
      </tfoot>
    </table>
  </div>

  <!-- CÓDIGO DE SEGUIMIENTO -->
  <div class="code-box">
    <div class="cb-label">Código de Seguimiento</div>
    <div class="cb-code">${codigoVisible}</div>
    <div class="cb-note">Presenta este código en el taller para consultar el estado de tu vehículo</div>
  </div>

  <!-- PIE -->
  <div class="inv-footer">
    <p><strong>Gracias por confiar en ${tallerNombre}</strong></p>
    <p>${tallerTel} &bull; ${tallerEmail} &bull; ${tallerDir}</p>
    <p>Factura generada el ${new Date().toLocaleDateString('es-DO', {day:'2-digit',month:'long',year:'numeric'})}</p>
  </div>

</div>
<script>window.onload = () => window.print();<\/script>
</body></html>`;

    const win = window.open('', '_blank', 'width=780,height=960');
    if (win) {
        win.document.write(html);
        win.document.close();
    }
}

// ===== MODAL DE PROGRESO =====

function abrirModalProgreso(servicioId) {
    const servicio = DataUtils.findServiceById(servicioId);
    if (!servicio) return;

    const modal = document.getElementById('progresoModal');
    if (!modal) return;

    document.getElementById('progresoModalTitle').textContent =
        `Progreso — ${servicio.vehicle} (${servicio.owner})`;
    document.getElementById('progresoObservaciones').value = '';

    const pasoActualIdx = getProgresoIndex(servicio.progreso);

    // Renderizar los pasos del timeline
    const container = document.getElementById('progresoStepsContainer');
    container.innerHTML = PASOS_PROGRESO.map((paso, i) => {
        const isDone   = i < pasoActualIdx;
        const isActive = i === pasoActualIdx;
        return `
        <div class="progreso-step ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}"
             data-key="${paso.key}" data-idx="${i}" style="cursor:pointer;">
            <div class="progreso-circle">
                <i class="${isDone ? 'fas fa-check' : paso.icon}"></i>
            </div>
            <div class="progreso-info">
                <div class="progreso-label">${paso.label}</div>
                <div class="progreso-desc">${paso.desc}</div>
            </div>
            ${i < PASOS_PROGRESO.length - 1 ? '<div class="progreso-connector"></div>' : ''}
        </div>`;
    }).join('');

    // Click en paso para seleccionarlo
    container.querySelectorAll('.progreso-step').forEach(el => {
        el.addEventListener('click', () => {
            container.querySelectorAll('.progreso-step').forEach(s => s.classList.remove('selecting'));
            el.classList.add('selecting');
            modal.dataset.selectedKey = el.dataset.key;
        });
    });

    modal.dataset.servicioId  = servicioId;
    modal.dataset.selectedKey = servicio.progreso || '';
    modal.style.display = 'flex';
}

function cerrarModalProgreso() {
    const modal = document.getElementById('progresoModal');
    if (modal) modal.style.display = 'none';
}

async function guardarProgreso() {
    const modal      = document.getElementById('progresoModal');
    const servicioId = modal.dataset.servicioId;
    const pasoKey    = modal.dataset.selectedKey;

    if (!pasoKey) {
        UIManager.showNotification('Selecciona un paso de progreso', 'warning');
        return;
    }

    const obs = document.getElementById('progresoObservaciones').value.trim();
    const btn = document.getElementById('saveProgresoBtn');
    btn.disabled = true;

    try {
        await ServiceManager.updateProgreso(servicioId, pasoKey, obs);
        cerrarModalProgreso();
        renderListaServicios();
        actualizarEstadisticas();
        UIManager.showNotification('Progreso actualizado correctamente', 'success');
    } catch (e) {
        UIManager.showNotification('Error actualizando progreso', 'error');
    } finally {
        btn.disabled = false;
    }
}
