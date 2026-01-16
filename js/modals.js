// Gestión de modales y formularios
const ModalManager = {
    // Inicializar modales
    initModals: () => {
        // Configurar fecha mínima en el formulario
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('date');
        if (dateInput) {
            dateInput.min = today;
            
            // Establecer fecha por defecto (mañana)
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            dateInput.value = tomorrow.toISOString().split('T')[0];
        }
    },
    
    // Modal de agendamiento
    openScheduleModal: (serviceData = null) => {
        const modal = document.getElementById('scheduleModal');
        const form = document.getElementById('scheduleForm');
        const saveBtn = document.getElementById('saveBtn');
        
        // Limpiar formulario
        form.reset();
        
        if (serviceData) {
            // Modo edición
            document.getElementById('plate').value = serviceData.id || '';
            document.getElementById('owner').value = serviceData.owner || '';
            document.getElementById('model').value = serviceData.vehicle || '';
            document.getElementById('phone').value = serviceData.phone || '';
            document.getElementById('service').value = serviceData.service || '';
            document.getElementById('employee').value = serviceData.employee || '';
            document.getElementById('date').value = serviceData.date || '';
            document.getElementById('time').value = serviceData.time || '08:30';
            document.getElementById('notes').value = serviceData.notes || '';
            
            saveBtn.textContent = 'Actualizar';
            AppState.editingServiceId = serviceData.id;
        } else {
            // Modo creación
            saveBtn.textContent = 'Guardar';
            AppState.editingServiceId = null;
        }
        
        modal.style.display = 'flex';
    },
    
    closeScheduleModal: () => {
        document.getElementById('scheduleModal').style.display = 'none';
        document.getElementById('scheduleForm').reset();
        AppState.editingServiceId = null;
    },
    
    // Modal de vehículos
    openVehiculoModal: (vehiculoData = null) => {
        const modal = document.getElementById('vehiculoModal');
        const title = document.getElementById('vehiculoModalTitle');
        const clienteSelect = document.getElementById('vehiculoCliente');
        
        // Limpiar y llenar select de clientes
        clienteSelect.innerHTML = '<option value="">Seleccionar cliente</option>';
        DataStore.clientes.forEach(cliente => {
            const option = document.createElement('option');
            option.value = cliente.id;
            option.textContent = cliente.nombre;
            clienteSelect.appendChild(option);
        });
        
        if (vehiculoData) {
            title.textContent = 'Editar Vehículo';
            AppState.editingVehiculoId = vehiculoData.id;
            
            // Rellenar formulario con datos existentes
            document.getElementById('vehiculoPlaca').value = vehiculoData.placa || '';
            document.getElementById('vehiculoMarca').value = vehiculoData.marca || '';
            document.getElementById('vehiculoModelo').value = vehiculoData.modelo || '';
            document.getElementById('vehiculoAnio').value = vehiculoData.año || '';
            document.getElementById('vehiculoColor').value = vehiculoData.color || '';
            document.getElementById('vehiculoCliente').value = vehiculoData.clienteId || '';
            document.getElementById('vehiculoKilometraje').value = vehiculoData.kilometraje || '';
            document.getElementById('vehiculoNotas').value = vehiculoData.notas || '';
        } else {
            title.textContent = 'Nuevo Vehículo';
            AppState.editingVehiculoId = null;
            document.getElementById('vehiculoForm').reset();
        }
        
        modal.style.display = 'flex';
    },
    
    closeVehiculoModal: () => {
        document.getElementById('vehiculoModal').style.display = 'none';
        document.getElementById('vehiculoForm').reset();
        AppState.editingVehiculoId = null;
    },
    
    saveVehiculoModal: () => {
        const form = document.getElementById('vehiculoForm');
        
        if (!form.checkValidity()) {
            form.reportValidity();
            return false;
        }
        
        const vehiculoData = {
            placa: document.getElementById('vehiculoPlaca').value,
            marca: document.getElementById('vehiculoMarca').value,
            modelo: document.getElementById('vehiculoModelo').value,
            año: document.getElementById('vehiculoAnio').value || '',
            color: document.getElementById('vehiculoColor').value || '',
            clienteId: document.getElementById('vehiculoCliente').value,
            kilometraje: document.getElementById('vehiculoKilometraje').value || '',
            notas: document.getElementById('vehiculoNotas').value || ''
        };
        
        if (AppState.editingVehiculoId) {
            VehiculoManager.updateVehiculo(AppState.editingVehiculoId, vehiculoData);
            UIManager.showNotification('Vehículo actualizado correctamente', 'success');
        } else {
            VehiculoManager.createVehiculo(vehiculoData);
            UIManager.showNotification('Vehículo creado correctamente', 'success');
        }
        
        ModalManager.closeVehiculoModal();
        
        // Recargar página de vehículos si está activa
        if (AppState.currentPage === 'vehiculos') {
            const buttons = UIManager.renderVehiculos(DataStore.vehiculos, document.getElementById('vehiculosList'));
            if (buttons) {
                // Reconfigurar eventos
                buttons.editBtns.forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const vehiculoId = e.currentTarget.getAttribute('data-id');
                        const vehiculo = DataUtils.findVehiculoById(vehiculoId);
                        if (vehiculo) {
                            ModalManager.openVehiculoModal(vehiculo);
                        }
                    });
                });
                
                buttons.deleteBtns.forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const vehiculoId = e.currentTarget.getAttribute('data-id');
                        if (confirm('¿Está seguro de que desea eliminar este vehículo?')) {
                            VehiculoManager.deleteVehiculo(vehiculoId);
                            UIManager.showNotification('Vehículo eliminado', 'success');
                            UIManager.renderVehiculos(DataStore.vehiculos, document.getElementById('vehiculosList'));
                        }
                    });
                });
            }
        }
        
        return true;
    },
    
    // Modal de clientes
    openClienteModal: (clienteData = null) => {
        const modal = document.getElementById('clienteModal');
        const title = document.getElementById('clienteModalTitle');
        
        if (clienteData) {
            title.textContent = 'Editar Cliente';
            AppState.editingClienteId = clienteData.id;
            
            // Rellenar formulario con datos existentes
            document.getElementById('clienteNombre').value = clienteData.nombre || '';
            document.getElementById('clienteTelefono').value = clienteData.telefono || '';
            document.getElementById('clienteEmail').value = clienteData.email || '';
            document.getElementById('clienteDireccion').value = clienteData.direccion || '';
            document.getElementById('clienteNotas').value = clienteData.notas || '';
        } else {
            title.textContent = 'Nuevo Cliente';
            AppState.editingClienteId = null;
            document.getElementById('clienteForm').reset();
        }
        
        modal.style.display = 'flex';
    },
    
    closeClienteModal: () => {
        document.getElementById('clienteModal').style.display = 'none';
        document.getElementById('clienteForm').reset();
        AppState.editingClienteId = null;
    },
    
    saveClienteModal: () => {
        const form = document.getElementById('clienteForm');
        
        if (!form.checkValidity()) {
            form.reportValidity();
            return false;
        }
        
        const clienteData = {
            nombre: document.getElementById('clienteNombre').value,
            telefono: document.getElementById('clienteTelefono').value,
            email: document.getElementById('clienteEmail').value || '',
            direccion: document.getElementById('clienteDireccion').value || '',
            notas: document.getElementById('clienteNotas').value || ''
        };
        
        if (AppState.editingClienteId) {
            ClienteManager.updateCliente(AppState.editingClienteId, clienteData);
            UIManager.showNotification('Cliente actualizado correctamente', 'success');
        } else {
            ClienteManager.createCliente(clienteData);
            UIManager.showNotification('Cliente creado correctamente', 'success');
        }
        
        ModalManager.closeClienteModal();
        
        // Recargar página de clientes si está activa
        if (AppState.currentPage === 'clientes') {
            const buttons = UIManager.renderClientes(DataStore.clientes, document.getElementById('clientesList'));
            if (buttons) {
                // Reconfigurar eventos
                buttons.editBtns.forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const clienteId = e.currentTarget.getAttribute('data-id');
                        const cliente = DataUtils.findClienteById(clienteId);
                        if (cliente) {
                            ModalManager.openClienteModal(cliente);
                        }
                    });
                });
                
                buttons.deleteBtns.forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const clienteId = e.currentTarget.getAttribute('data-id');
                        // Verificar si el cliente tiene vehículos asociados
                        const tieneVehiculos = DataStore.vehiculos.some(v => v.clienteId === clienteId);
                        if (tieneVehiculos) {
                            alert('No se puede eliminar el cliente porque tiene vehículos asociados. Elimine primero los vehículos.');
                            return;
                        }
                        
                        if (confirm('¿Está seguro de que desea eliminar este cliente?')) {
                            ClienteManager.deleteCliente(clienteId);
                            UIManager.showNotification('Cliente eliminado', 'success');
                            UIManager.renderClientes(DataStore.clientes, document.getElementById('clientesList'));
                        }
                    });
                });
            }
        }
        
        return true;
    },
    
    // Modal de tipos de servicio
    openServicioModal: (servicioData = null) => {
        const modal = document.getElementById('servicioModal');
        const title = document.getElementById('servicioModalTitle');
        
        if (servicioData) {
            title.textContent = 'Editar Tipo de Servicio';
            AppState.editingServicioId = servicioData.id;
            
            // Rellenar formulario con datos existentes
            document.getElementById('servicioNombre').value = servicioData.nombre || '';
            document.getElementById('servicioDescripcion').value = servicioData.descripcion || '';
            document.getElementById('servicioPrecio').value = servicioData.precio || '';
            document.getElementById('servicioDuracion').value = servicioData.duracion || '';
            document.getElementById('servicioCategoria').value = servicioData.categoria || '';
        } else {
            title.textContent = 'Nuevo Tipo de Servicio';
            AppState.editingServicioId = null;
            document.getElementById('servicioForm').reset();
        }
        
        modal.style.display = 'flex';
    },
    
    closeServicioModal: () => {
        document.getElementById('servicioModal').style.display = 'none';
        document.getElementById('servicioForm').reset();
        AppState.editingServicioId = null;
    },
    
    saveServicioModal: () => {
        const form = document.getElementById('servicioForm');
        
        if (!form.checkValidity()) {
            form.reportValidity();
            return false;
        }
        
        const servicioData = {
            nombre: document.getElementById('servicioNombre').value,
            descripcion: document.getElementById('servicioDescripcion').value || '',
            precio: parseFloat(document.getElementById('servicioPrecio').value),
            duracion: document.getElementById('servicioDuracion').value || '',
            categoria: document.getElementById('servicioCategoria').value || ''
        };
        
        if (AppState.editingServicioId) {
            ServicioManager.updateServicio(AppState.editingServicioId, servicioData);
            UIManager.showNotification('Servicio actualizado correctamente', 'success');
        } else {
            ServicioManager.createServicio(servicioData);
            UIManager.showNotification('Servicio creado correctamente', 'success');
        }
        
        ModalManager.closeServicioModal();
        
        // Recargar página de servicios si está activa
        if (AppState.currentPage === 'servicios') {
            const buttons = UIManager.renderServicios(DataStore.tiposServicio, document.getElementById('serviciosList'));
            if (buttons) {
                // Reconfigurar eventos
                buttons.editBtns.forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const servicioId = e.currentTarget.getAttribute('data-id');
                        const servicio = DataUtils.findServicioById(servicioId);
                        if (servicio) {
                            ModalManager.openServicioModal(servicio);
                        }
                    });
                });
                
                buttons.deleteBtns.forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const servicioId = e.currentTarget.getAttribute('data-id');
                        if (confirm('¿Está seguro de que desea eliminar este tipo de servicio?')) {
                            ServicioManager.deleteServicio(servicioId);
                            UIManager.showNotification('Servicio eliminado', 'success');
                            UIManager.renderServicios(DataStore.tiposServicio, document.getElementById('serviciosList'));
                        }
                    });
                });
            }
        }
        
        return true;
    },
    
    // Modal de empleados
    openEmpleadoModal: (empleadoData = null) => {
        const modal = document.getElementById('empleadoModal');
        const title = document.getElementById('empleadoModalTitle');
        
        if (empleadoData) {
            title.textContent = 'Editar Empleado';
            AppState.editingEmpleadoId = empleadoData.id;
            
            // Rellenar formulario con datos existentes
            document.getElementById('empleadoNombre').value = empleadoData.nombre || '';
            document.getElementById('empleadoEspecialidad').value = empleadoData.especialidad || '';
            document.getElementById('empleadoTelefono').value = empleadoData.telefono || '';
            document.getElementById('empleadoEmail').value = empleadoData.email || '';
            document.getElementById('empleadoHorario').value = empleadoData.horario || '';
        } else {
            title.textContent = 'Nuevo Empleado';
            AppState.editingEmpleadoId = null;
            document.getElementById('empleadoForm').reset();
        }
        
        modal.style.display = 'flex';
    },
    
    closeEmpleadoModal: () => {
        document.getElementById('empleadoModal').style.display = 'none';
        document.getElementById('empleadoForm').reset();
        AppState.editingEmpleadoId = null;
    },
    
    saveEmpleadoModal: () => {
        const form = document.getElementById('empleadoForm');
        
        if (!form.checkValidity()) {
            form.reportValidity();
            return false;
        }
        
        const empleadoData = {
            nombre: document.getElementById('empleadoNombre').value,
            especialidad: document.getElementById('empleadoEspecialidad').value || '',
            telefono: document.getElementById('empleadoTelefono').value || '',
            email: document.getElementById('empleadoEmail').value || '',
            horario: document.getElementById('empleadoHorario').value || ''
        };
        
        if (AppState.editingEmpleadoId) {
            EmpleadoManager.updateEmpleado(AppState.editingEmpleadoId, empleadoData);
            UIManager.showNotification('Empleado actualizado correctamente', 'success');
        } else {
            EmpleadoManager.createEmpleado(empleadoData);
            UIManager.showNotification('Empleado creado correctamente', 'success');
        }
        
        ModalManager.closeEmpleadoModal();
        
        // Recargar configuración si está activa
        if (AppState.currentPage === 'configuracion') {
            UIManager.renderConfiguracion('empleados', document.getElementById('configuracionArea'));
        }
        
        return true;
    },
    
    // Guardar servicio desde modal
    saveServiceFromModal: () => {
        const form = document.getElementById('scheduleForm');
        
        if (!form.checkValidity()) {
            form.reportValidity();
            return false;
        }
        
        // Obtener datos del formulario
        const serviceData = {
            vehicle: document.getElementById('model').value || document.getElementById('plate').value + ' (Sin modelo)',
            owner: document.getElementById('owner').value,
            date: document.getElementById('date').value,
            service: document.getElementById('service').value,
            employee: document.getElementById('employee').value,
            phone: document.getElementById('phone').value || 'No especificado',
            time: document.getElementById('time').value || '08:00',
            notes: document.getElementById('notes').value || '',
            status: 'pending'
        };
        
        if (AppState.editingServiceId) {
            // Actualizar servicio existente
            ServiceManager.updateService(AppState.editingServiceId, serviceData);
            UIManager.showNotification('Servicio actualizado correctamente', 'success');
        } else {
            // Crear nuevo servicio
            ServiceManager.createService(serviceData);
            UIManager.showNotification('Servicio creado correctamente', 'success');
        }
        
        ModalManager.closeScheduleModal();
        UIManager.updateStatsUI();
        UIManager.changeView(AppState.currentView);
        
        return true;
    },
    
    // Guardar configuración general
    saveConfigGeneral: () => {
        const updates = {
            iva: parseFloat(document.getElementById('configIva').value) || 18,
            intervaloCitas: document.getElementById('configIntervalo').value || '30',
            notificacionesEmail: document.getElementById('configNotifEmail').checked,
            notificacionesSMS: document.getElementById('configNotifSMS').checked
        };
        
        ConfiguracionManager.updateConfiguracion(updates);
        UIManager.showNotification('Configuración guardada correctamente', 'success');
        return true;
    },
    
    // Guardar configuración de horarios
    saveConfigHorarios: () => {
        const updates = {
            horarioApertura: document.getElementById('configHoraApertura').value,
            horarioCierre: document.getElementById('configHoraCierre').value
        };
        
        ConfiguracionManager.updateConfiguracion(updates);
        UIManager.showNotification('Horarios guardados correctamente', 'success');
        return true;
    },
    
    // Configurar eventos de cierre de modales
    setupModalEvents: () => {
        // Cerrar modal al hacer clic fuera
        const modals = ['scheduleModal', 'vehiculoModal', 'clienteModal', 'servicioModal', 'empleadoModal'];
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        switch(modalId) {
                            case 'scheduleModal': ModalManager.closeScheduleModal(); break;
                            case 'vehiculoModal': ModalManager.closeVehiculoModal(); break;
                            case 'clienteModal': ModalManager.closeClienteModal(); break;
                            case 'servicioModal': ModalManager.closeServicioModal(); break;
                            case 'empleadoModal': ModalManager.closeEmpleadoModal(); break;
                        }
                    }
                });
            }
        });
        
        // Botones de cerrar
        const closeButtons = {
            'closeModal': () => ModalManager.closeScheduleModal(),
            'closeVehiculoModal': () => ModalManager.closeVehiculoModal(),
            'closeClienteModal': () => ModalManager.closeClienteModal(),
            'closeServicioModal': () => ModalManager.closeServicioModal(),
            'closeEmpleadoModal': () => ModalManager.closeEmpleadoModal()
        };
        
        Object.keys(closeButtons).forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.addEventListener('click', closeButtons[btnId]);
            }
        });
        
        // Botones de cancelar
        const cancelButtons = {
            'cancelBtn': () => ModalManager.closeScheduleModal(),
            'cancelVehiculoBtn': () => ModalManager.closeVehiculoModal(),
            'cancelClienteBtn': () => ModalManager.closeClienteModal(),
            'cancelServicioBtn': () => ModalManager.closeServicioModal(),
            'cancelEmpleadoBtn': () => ModalManager.closeEmpleadoModal()
        };
        
        Object.keys(cancelButtons).forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.addEventListener('click', cancelButtons[btnId]);
            }
        });
        
        // Botones de guardar
        const saveButtons = {
            'saveBtn': () => ModalManager.saveServiceFromModal(),
            'saveVehiculoBtn': () => ModalManager.saveVehiculoModal(),
            'saveClienteBtn': () => ModalManager.saveClienteModal(),
            'saveServicioBtn': () => ModalManager.saveServicioModal(),
            'saveEmpleadoBtn': () => ModalManager.saveEmpleadoModal(),
            'saveConfigBtn': () => ModalManager.saveConfigGeneral(),
            'saveHorariosBtn': () => ModalManager.saveConfigHorarios()
        };
        
        Object.keys(saveButtons).forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.addEventListener('click', saveButtons[btnId]);
            }
        });
        
        // Evitar envío del formulario
        const forms = ['scheduleForm', 'vehiculoForm', 'clienteForm', 'servicioForm', 'empleadoForm'];
        forms.forEach(formId => {
            const form = document.getElementById(formId);
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                });
            }
        });
    }
};// modals.js (al final)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ModalManager };
} else {
    window.ModalManager = ModalManager;
}