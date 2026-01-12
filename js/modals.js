// Gestión de modales y formularios
const ModalManager = {
    // Modal de agendamiento
    scheduleModal: document.getElementById('scheduleModal'),
    scheduleForm: document.getElementById('scheduleForm'),
    
    // Modal de vehículos
    vehiculoModal: document.getElementById('vehiculoModal'),
    vehiculoForm: document.getElementById('vehiculoForm'),
    
    // Inicializar modales
    initModals: () => {
        // Configurar fecha mínima en el formulario
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('date').min = today;
        
        // Establecer fecha por defecto (mañana)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        document.getElementById('date').value = tomorrow.toISOString().split('T')[0];
    },
    
    // Abrir modal de agendamiento
    openScheduleModal: (serviceData = null) => {
        const modal = ModalManager.scheduleModal;
        const form = ModalManager.scheduleForm;
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
    
    // Cerrar modal de agendamiento
    closeScheduleModal: () => {
        ModalManager.scheduleModal.style.display = 'none';
        ModalManager.scheduleForm.reset();
        AppState.editingServiceId = null;
    },
    
    // Guardar servicio desde modal
    saveServiceFromModal: () => {
        const form = ModalManager.scheduleForm;
        
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
    
    // Abrir modal de vehículo
    openVehiculoModal: (vehiculoData = null) => {
        const modal = ModalManager.vehiculoModal;
        const title = document.getElementById('vehiculoModalTitle');
        
        if (vehiculoData) {
            title.textContent = 'Editar Vehículo';
            AppState.editingVehiculoId = vehiculoData.id;
        } else {
            title.textContent = 'Nuevo Vehículo';
            AppState.editingVehiculoId = null;
        }
        
        modal.style.display = 'flex';
    },
    
    // Cerrar modal de vehículo
    closeVehiculoModal: () => {
        ModalManager.vehiculoModal.style.display = 'none';
        ModalManager.vehiculoForm.reset();
        AppState.editingVehiculoId = null;
    },
    
    // Abrir modal de cliente
    openClienteModal: (clienteData = null) => {
        // Implementar similar a openVehiculoModal
        console.log('Abrir modal de cliente:', clienteData);
    },
    
    // Abrir modal de servicio
    openServicioModal: (servicioData = null) => {
        // Implementar similar a openVehiculoModal
        console.log('Abrir modal de servicio:', servicioData);
    },
    
    // Configurar eventos de cierre de modales
    setupModalEvents: () => {
        // Cerrar modal al hacer clic fuera
        ModalManager.scheduleModal.addEventListener('click', (e) => {
            if (e.target === ModalManager.scheduleModal) {
                ModalManager.closeScheduleModal();
            }
        });
        
        ModalManager.vehiculoModal.addEventListener('click', (e) => {
            if (e.target === ModalManager.vehiculoModal) {
                ModalManager.closeVehiculoModal();
            }
        });
        
        // Botones de cerrar
        document.getElementById('closeModal').addEventListener('click', () => {
            ModalManager.closeScheduleModal();
        });
        
        document.getElementById('closeVehiculoModal').addEventListener('click', () => {
            ModalManager.closeVehiculoModal();
        });
        
        // Botones de cancelar
        document.getElementById('cancelBtn').addEventListener('click', () => {
            ModalManager.closeScheduleModal();
        });
        
        document.getElementById('cancelVehiculoBtn').addEventListener('click', () => {
            ModalManager.closeVehiculoModal();
        });
        
        // Botones de guardar
        document.getElementById('saveBtn').addEventListener('click', () => {
            ModalManager.saveServiceFromModal();
        });
        
        // Evitar envío del formulario
        ModalManager.scheduleForm.addEventListener('submit', (e) => {
            e.preventDefault();
            ModalManager.saveServiceFromModal();
        });
    }
};

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ModalManager };
}