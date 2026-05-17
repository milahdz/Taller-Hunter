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

                // Auto-rellenar teléfono
                const cliente = (DataStore.clientes || []).find(c => String(c.id) === String(clienteId));
                const telefonoInput = document.getElementById('telefono');
                if (telefonoInput) {
                    telefonoInput.value = cliente ? (cliente.telefono || '') : '';
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

        // Look up text values from DataStore to fill legacy text columns
        const vehiculo   = (DataStore.vehiculos     || []).find(v => String(v.id) === String(vehiculoId));
        const cliente    = (DataStore.clientes      || []).find(c => String(c.id) === String(clienteId));
        const tipoServ   = (DataStore.tiposServicio || []).find(t => String(t.id) === String(servicioId));
        const empleado   = (DataStore.empleados     || []).find(e => String(e.id) === String(empleadoId));

        // vehiculo_id is INTEGER in the DB (unquoted in sample INSERT)
        const vehiculoIdInt = Number(vehiculoId);

        // hora must be HH:MM:SS for the TIME column
        const horaRaw = document.getElementById('hora').value || '08:00';
        const hora = horaRaw.split(':').length === 2 ? horaRaw + ':00' : horaRaw;

        const datos = {
            id:               String(Date.now()),      // TEXT column, no auto-default
            vehiculo_id:      vehiculoIdInt,           // INTEGER
            cliente_id:       clienteId,               // UUID text
            tipo_servicio_id: servicioId,              // UUID text
            empleado_id:      String(empleadoId),      // TEXT (quoted '1' in sample)
            // legacy text columns
            placa:            vehiculo ? vehiculo.placa                              : null,
            modelo:           vehiculo ? `${vehiculo.marca || ''} ${vehiculo.modelo || ''}`.trim() : null,
            propietario:      cliente  ? cliente.nombre                              : null,
            tipo_servicio:    tipoServ ? tipoServ.nombre                             : null,
            empleado:         empleado ? empleado.nombre                             : null,
            fecha:            document.getElementById('fecha').value,
            hora:             hora,
            telefono:         document.getElementById('telefono').value.trim() || null,
            notas:            document.getElementById('notas').value.trim()    || null,
            estado:           'Pendiente'
        };

        console.log('📤 Guardando agendamiento:', datos);

        const saveBtn = document.getElementById('saveScheduleBtn');
        const originalHTML = saveBtn ? saveBtn.innerHTML : '';
        if (saveBtn) {
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
            saveBtn.disabled = true;
        }

        try {
            if (!window.supabase) throw new Error('Supabase no está disponible. Recarga la página.');

            const { data, error } = await supabase
                .from('registro_servicio_vehiculo')
                .insert([datos])
                .select()
                .single();

            if (error) throw error;

            console.log('✅ Agendamiento guardado:', data);
            AgendaManager.mostrarMensaje('¡Vehículo agendado exitosamente!', 'success');
            AgendaManager.cerrarModal();

            // Recargar y re-renderizar agenda
            if (typeof cargarDatosReales === 'function') {
                cargarDatosReales().then(() => {
                    if (typeof renderAgenda === 'function') renderAgenda();
                    if (typeof actualizarEstadisticas === 'function') actualizarEstadisticas();
                });
            }

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
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AgendaManager.init());
} else {
    AgendaManager.init();
}

window.AgendaManager = AgendaManager;
console.log('✅ agenda.js cargado');
