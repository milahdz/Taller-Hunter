// agenda.js
console.log('📄 Cargando agenda.js...');

const AgendaManager = {
    init: function() {
        console.log('🚗 Inicializando AgendaManager...');
        this.setupEventListeners();
    },

    setupEventListeners: function() {
        const addVehicleBtn = document.getElementById('addVehicleBtn');
        if (addVehicleBtn) {
            addVehicleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                AgendaManager.abrirModal();
            });
        }

        const saveBtn = document.getElementById('saveScheduleBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', (e) => {
                e.preventDefault();
                AgendaManager.guardarAgendamiento();
            });
        }

        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                AgendaManager.cerrarModal();
            });
        }

        const closeBtn = document.getElementById('closeModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                AgendaManager.cerrarModal();
            });
        }

        const modal = document.getElementById('scheduleModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) AgendaManager.cerrarModal();
            });
        }

        // Cascade: cliente → vehiculos + telefono
        const selectCliente = document.getElementById('cliente');
        if (selectCliente) {
            selectCliente.addEventListener('change', () => {
                const clienteId = selectCliente.value;
                AgendaManager.poblarVehiculos(clienteId);
                const cliente = (DataStore.clientes || []).find(c => String(c.id) === String(clienteId));
                const telefonoInput = document.getElementById('telefono');
                if (telefonoInput) {
                    telefonoInput.value = cliente ? (cliente.telefono || '') : '';
                }
            });
        }

        // Botones quick-add: abren el modal de cliente/vehículo y vuelven al de agenda
        const quickAddClienteBtn = document.getElementById('quickAddClienteBtn');
        if (quickAddClienteBtn) {
            quickAddClienteBtn.addEventListener('click', () => {
                if (typeof ModalManager !== 'undefined') ModalManager.openClienteModal();
            });
        }

        const quickAddVehiculoBtn = document.getElementById('quickAddVehiculoBtn');
        if (quickAddVehiculoBtn) {
            quickAddVehiculoBtn.addEventListener('click', () => {
                const clienteId = document.getElementById('cliente')?.value;
                if (typeof ModalManager !== 'undefined') {
                    ModalManager.openVehiculoModal();
                    // Pre-seleccionar el cliente si ya está elegido
                    if (clienteId) {
                        setTimeout(() => {
                            const sel = document.getElementById('vehiculoCliente');
                            if (sel) sel.value = clienteId;
                        }, 50);
                    }
                }
            });
        }
    },

    abrirModal: function() {
        const modal = document.getElementById('scheduleModal');
        if (!modal) {
            alert('Error: No se puede abrir el formulario');
            return;
        }

        // Reset form first
        const form = document.getElementById('scheduleForm');
        if (form) form.reset();

        // Default date (tomorrow)
        const fechaInput = document.getElementById('fecha');
        if (fechaInput) {
            const hoy = new Date();
            const manana = new Date(hoy);
            manana.setDate(manana.getDate() + 1);
            fechaInput.min = hoy.toISOString().split('T')[0];
            fechaInput.value = manana.toISOString().split('T')[0];
        }

        // Default time
        const horaInput = document.getElementById('hora');
        if (horaInput) horaInput.value = '08:00';

        // Populate selects from DataStore
        AgendaManager.poblarSelects();

        modal.style.display = 'flex';
    },

    poblarSelects: function() {
        // Clientes
        const selectCliente = document.getElementById('cliente');
        if (selectCliente) {
            const clientes = DataStore.clientes || [];
            selectCliente.innerHTML = '<option value="">-- Seleccionar cliente --</option>';
            clientes.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.id;
                opt.textContent = c.nombre;
                selectCliente.appendChild(opt);
            });
        }

        // Vehiculos (vacío hasta que se seleccione cliente)
        AgendaManager.poblarVehiculos(null);

        // Tipos de Servicio
        const selectServicio = document.getElementById('servicio');
        if (selectServicio) {
            const tipos = DataStore.tiposServicio || [];
            selectServicio.innerHTML = '<option value="">-- Seleccionar servicio --</option>';
            tipos.forEach(t => {
                const opt = document.createElement('option');
                opt.value = t.id;
                opt.textContent = t.nombre + (t.precio ? ` ($${t.precio})` : '');
                selectServicio.appendChild(opt);
            });
        }

        // Empleados
        const selectEmpleado = document.getElementById('empleado');
        if (selectEmpleado) {
            const empleados = DataStore.empleados || [];
            selectEmpleado.innerHTML = '<option value="">-- Seleccionar empleado --</option>';
            empleados.forEach(e => {
                const opt = document.createElement('option');
                opt.value = e.id;
                opt.textContent = e.nombre + (e.especialidad ? ` — ${e.especialidad}` : '');
                selectEmpleado.appendChild(opt);
            });
        }
    },

    poblarVehiculos: function(clienteId) {
        const selectVehiculo = document.getElementById('vehiculo');
        if (!selectVehiculo) return;

        const todosVehiculos = DataStore.vehiculos || [];

        let vehiculos = [];
        let placeholder = '<option value="">-- Primero selecciona un cliente --</option>';

        if (clienteId) {
            // Try filtered by client first
            const filtrados = todosVehiculos.filter(v => String(v.clienteId) === String(clienteId));
            if (filtrados.length > 0) {
                vehiculos = filtrados;
                placeholder = '<option value="">-- Seleccionar vehículo --</option>';
            } else {
                // Fallback: show all vehicles if none are linked to this client
                vehiculos = todosVehiculos;
                placeholder = '<option value="">-- Seleccionar vehículo --</option>';
            }
        }

        selectVehiculo.innerHTML = placeholder;
        vehiculos.forEach(v => {
            const opt = document.createElement('option');
            opt.value = v.id;
            opt.textContent = `${v.placa} — ${v.marca || ''} ${v.modelo || ''}`.trim();
            selectVehiculo.appendChild(opt);
        });
    },

    validarFormulario: function() {
        const campos = [
            { id: 'cliente', nombre: 'Cliente' },
            { id: 'vehiculo', nombre: 'Vehículo' },
            { id: 'fecha', nombre: 'Fecha' },
            { id: 'hora', nombre: 'Hora' },
            { id: 'servicio', nombre: 'Tipo de Servicio' },
            { id: 'empleado', nombre: 'Empleado' }
        ];

        for (const campo of campos) {
            const el = document.getElementById(campo.id);
            if (!el) {
                alert(`Error: Campo ${campo.nombre} no disponible`);
                return false;
            }
            if (!el.value || !el.value.trim()) {
                el.focus();
                el.style.borderColor = '#dc3545';
                alert(`Por favor, completa el campo: ${campo.nombre}`);
                return false;
            } else {
                el.style.borderColor = '';
            }
        }
        return true;
    },

    async guardarAgendamiento() {
        if (!AgendaManager.validarFormulario()) return;

        const vehiculoId  = document.getElementById('vehiculo').value;
        const clienteId   = document.getElementById('cliente').value;
        const servicioId  = document.getElementById('servicio').value;
        const empleadoId  = document.getElementById('empleado').value;

        // Buscar objetos en DataStore para obtener campos de texto
        const vehiculo   = (DataStore.vehiculos     || []).find(v => String(v.id) === String(vehiculoId));
        const cliente    = (DataStore.clientes      || []).find(c => String(c.id) === String(clienteId));
        const tipoServ   = (DataStore.tiposServicio || []).find(t => String(t.id) === String(servicioId));
        const empleado   = (DataStore.empleados     || []).find(e => String(e.id) === String(empleadoId));

        // vehiculo_id is INTEGER FK — ensure we send int or null
        const vehiculoIdFinal = (vehiculoId && !isNaN(Number(vehiculoId)))
            ? Number(vehiculoId)
            : null;

        // hora debe ser HH:MM:SS para columna TIME
        const horaRaw = document.getElementById('hora').value || '08:00';
        const hora = horaRaw.split(':').length === 2 ? horaRaw + ':00' : horaRaw;

        const codigoSeguimiento = DataUtils.generateTrackingCode();

        // Payload completo (esquema nuevo — requiere columna codigo_seguimiento en DB)
        const datosNuevo = {
            id:                 DataUtils.generateUUID(),
            codigo_seguimiento: codigoSeguimiento,
            vehiculo_id:        vehiculoIdFinal,
            cliente_id:         clienteId  || null,
            tipo_servicio_id:   servicioId || null,
            empleado_id:        empleadoId ? String(empleadoId) : null,
            placa:              vehiculo ? vehiculo.placa                                    : null,
            modelo:             vehiculo ? `${vehiculo.marca || ''} ${vehiculo.modelo || ''}`.trim() : null,
            propietario:        cliente  ? cliente.nombre                                    : null,
            tipo_servicio:      tipoServ ? tipoServ.nombre                                   : null,
            empleado:           empleado ? empleado.nombre                                   : null,
            fecha:              document.getElementById('fecha').value,
            hora,
            telefono:           document.getElementById('telefono').value.trim() || null,
            notas:              document.getElementById('notas').value.trim()    || null,
            estado:             'Pendiente'
        };

        // Payload de fallback (esquema antiguo — id = código de seguimiento)
        const datosLegacy = (({ id: _id, codigo_seguimiento: _cs, ...rest }) =>
            ({ ...rest, id: codigoSeguimiento }))(datosNuevo);

        console.log('📤 Guardando agendamiento:', datosNuevo);

        const saveBtn = document.getElementById('saveScheduleBtn');
        const originalHTML = saveBtn ? saveBtn.innerHTML : '';
        if (saveBtn) {
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
            saveBtn.disabled = true;
        }

        try {
            if (!window.supabase) throw new Error('Supabase no está disponible. Recarga la página.');

            // Intenta con esquema nuevo primero
            let { data, error } = await supabase
                .from('registro_servicio_vehiculo')
                .insert([datosNuevo])
                .select()
                .single();

            // PGRST204 = columna no existe aún → usar esquema legacy hasta que se corra la migración SQL
            if (error?.code === 'PGRST204') {
                console.warn('⚠️ Columna codigo_seguimiento no encontrada — usando esquema legacy. Corre la migración SQL en Supabase.');
                const retry = await supabase
                    .from('registro_servicio_vehiculo')
                    .insert([datosLegacy])
                    .select()
                    .single();
                error = retry.error;
                data  = retry.data;
            }

            if (error) throw error;

            console.log('✅ Agendamiento guardado:', data);

            // Show modal with prominent tracking code (reload happens on close)
            AgendaManager.cerrarModal();
            AgendaManager.mostrarCodigoSeguimiento(codigoSeguimiento);

        } catch (err) {
            console.error('❌ Error al guardar:', err);
            let msg = 'Error al guardar el agendamiento.';
            if (err.message) msg += `\n\nDetalle: ${err.message}`;
            AgendaManager.mostrarMensaje(msg, 'error');
        } finally {
            if (saveBtn) {
                saveBtn.innerHTML = originalHTML;
                saveBtn.disabled = false;
            }
        }
    },

    cerrarModal: function() {
        const modal = document.getElementById('scheduleModal');
        if (modal) modal.style.display = 'none';
    },

    mostrarMensaje: function(mensaje, tipo = 'info') {
        if (tipo === 'error') {
            alert(mensaje);
            return;
        }
        const toast = document.createElement('div');
        toast.style.cssText = `
            position:fixed; top:20px; right:20px;
            background:#10b981; color:white;
            padding:12px 20px; border-radius:8px;
            box-shadow:0 4px 12px rgba(0,0,0,0.15);
            z-index:9999; display:flex; align-items:center; gap:10px;
            max-width:400px; font-size:14px;
        `;
        toast.innerHTML = `<i class="fas fa-check-circle"></i><span>${mensaje}</span>`;
        document.body.appendChild(toast);
        setTimeout(() => { if (toast.parentNode) toast.remove(); }, 3000);
    },

    mostrarCodigoSeguimiento: function(codigo) {
        // Remove any existing modal
        document.getElementById('trackingCodeModal')?.remove();

        const overlay = document.createElement('div');
        overlay.id = 'trackingCodeModal';
        overlay.style.cssText = `
            position:fixed; inset:0; background:rgba(0,0,0,0.6);
            z-index:99999; display:flex; align-items:center; justify-content:center;
        `;
        overlay.innerHTML = `
            <div style="background:#fff; border-radius:16px; padding:32px 40px; max-width:440px; width:90%;
                        box-shadow:0 24px 64px rgba(0,0,0,0.25); text-align:center;">
                <div style="width:56px; height:56px; background:#d1fae5; border-radius:50%;
                            display:flex; align-items:center; justify-content:center; margin:0 auto 16px;">
                    <i class="fas fa-check-circle" style="color:#10b981; font-size:24px;"></i>
                </div>
                <h3 style="margin:0 0 8px; font-size:20px; color:#111827;">¡Vehículo agendado!</h3>
                <p style="color:#6b7280; margin:0 0 20px; font-size:14px;">
                    Guarda este código — el cliente lo necesita para consultar el estado de su vehículo.
                </p>
                <div style="background:#eff6ff; border:2px dashed #3b82f6; border-radius:10px; padding:16px; margin-bottom:20px;">
                    <div style="font-size:11px; color:#6b7280; text-transform:uppercase; letter-spacing:1px; margin-bottom:6px;">
                        Código de seguimiento
                    </div>
                    <div id="trackingCodeValue" style="font-family:monospace; font-size:22px; font-weight:bold;
                                color:#1d4ed8; letter-spacing:2px; cursor:pointer;" title="Clic para copiar">
                        ${codigo}
                    </div>
                    <div style="font-size:11px; color:#93c5fd; margin-top:4px;">Clic para copiar</div>
                </div>
                <button id="trackingCodeClose" style="background:#2563eb; color:#fff; border:none; border-radius:8px;
                    padding:10px 32px; font-size:15px; font-weight:600; cursor:pointer; width:100%;">
                    Entendido
                </button>
            </div>
        `;

        document.body.appendChild(overlay);

        // Copy to clipboard on click
        document.getElementById('trackingCodeValue').addEventListener('click', () => {
            navigator.clipboard?.writeText(codigo).then(() => {
                const el = document.getElementById('trackingCodeValue');
                if (el) { el.style.color = '#16a34a'; setTimeout(() => { el.style.color = '#1d4ed8'; }, 1200); }
            });
        });

        document.getElementById('trackingCodeClose').addEventListener('click', () => {
            overlay.remove();
            if (typeof cargarDatosReales === 'function') {
                cargarDatosReales().then(() => {
                    if (typeof renderAgenda === 'function') renderAgenda();
                    if (typeof actualizarEstadisticas === 'function') actualizarEstadisticas();
                });
            }
        });
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AgendaManager.init());
} else {
    AgendaManager.init();
}

window.AgendaManager = AgendaManager;
console.log('✅ agenda.js cargado');
