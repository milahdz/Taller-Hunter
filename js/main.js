// Punto de entrada principal de la aplicación
document.addEventListener('DOMContentLoaded', () => {
    console.log('Taller Hunter - Sistema inicializando...');
    
    // Inicializar componentes
    ModalManager.initModals();
    
    // Configurar eventos de navegación
    setupNavigation();
    
    // Configurar eventos de botones
    setupButtons();
    
    // Configurar eventos de modales
    ModalManager.setupModalEvents();
    
    // Cargar página inicial (agenda)
    loadInitialPage();
    
    console.log('Sistema listo para usar');
});

// Configurar navegación
function setupNavigation() {
    // Navegación principal
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Actualizar navegación activa
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            // Cambiar a la página seleccionada
            const page = item.getAttribute('data-page');
            const buttons = UIManager.changePage(page);
            
            // Si estamos en agenda, configurar eventos de los botones de servicio
            if (page === 'agenda' && buttons) {
                setupServiceButtons(buttons);
            }
        });
    });
    
    // Tabs de agenda
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            UIManager.changeTab(tabId);
            
            // Después de cambiar tab, reconfigurar botones de servicio
            if (AppState.currentPage === 'agenda') {
                const services = DataUtils.filterServices(tabId);
                const buttons = UIManager.renderServicesTable(services, document.getElementById('listView'));
                setupServiceButtons(buttons);
            }
        });
    });
    
    // Vistas de agenda
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.getAttribute('data-view');
            UIManager.changeView(view);
        });
    });
    
    // Vistas de reportes
    document.querySelectorAll('[data-report]').forEach(btn => {
        btn.addEventListener('click', () => {
            const reportType = btn.getAttribute('data-report');
            UIManager.renderReportes(reportType, document.getElementById('reportesContentArea'));
            
            // Actualizar botones activos
            document.querySelectorAll('[data-report]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

// Configurar botones generales
function setupButtons() {
    // Botón para agendar vehículo
    document.getElementById('addVehicleBtn').addEventListener('click', () => {
        ModalManager.openScheduleModal();
    });
    
    // Botón para agregar vehículo (en página de vehículos)
    document.getElementById('addVehiculoBtn').addEventListener('click', () => {
        ModalManager.openVehiculoModal();
    });
    
    // Botón para agregar cliente
    document.getElementById('addClienteBtn').addEventListener('click', () => {
        ModalManager.openClienteModal();
    });
    
    // Botón para agregar servicio
    document.getElementById('addServicioBtn').addEventListener('click', () => {
        ModalManager.openServicioModal();
    });
    
    // Botón de imprimir
    document.getElementById('printBtn').addEventListener('click', () => {
        window.print();
    });
}

// Configurar botones de servicio (completar, editar, eliminar)
function setupServiceButtons(buttons) {
    if (!buttons) return;
    
    // Botones de completar
    buttons.completeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const serviceId = e.currentTarget.getAttribute('data-id');
            ServiceManager.completeService(serviceId);
            UIManager.showNotification('Servicio completado', 'success');
            UIManager.updateStatsUI();
            UIManager.changeView(AppState.currentView);
        });
    });
    
    // Botones de editar
    buttons.editBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const serviceId = e.currentTarget.getAttribute('data-id');
            const service = DataUtils.findServiceById(serviceId);
            if (service) {
                ModalManager.openScheduleModal(service);
            }
        });
    });
    
    // Botones de eliminar
    buttons.deleteBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const serviceId = e.currentTarget.getAttribute('data-id');
            if (confirm('¿Está seguro de que desea eliminar este servicio?')) {
                ServiceManager.deleteService(serviceId);
                UIManager.showNotification('Servicio eliminado', 'success');
                UIManager.updateStatsUI();
                UIManager.changeView(AppState.currentView);
            }
        });
    });
}

// Cargar página inicial
function loadInitialPage() {
    const buttons = UIManager.changePage('agenda');
    setupServiceButtons(buttons);
}

// Función para recargar servicios (útil para actualizaciones)
function reloadServices() {
    if (AppState.currentPage === 'agenda') {
        const services = DataUtils.filterServices(AppState.currentTab);
        const buttons = UIManager.renderServicesTable(services, document.getElementById('listView'));
        setupServiceButtons(buttons);
        UIManager.updateStatsUI();
    }
}

// Hacer funciones disponibles globalmente si es necesario
window.reloadServices = reloadServices;
window.AppState = AppState;
window.DataStore = DataStore;
window.DataUtils = DataUtils;
window.ServiceManager = ServiceManager;
window.UIManager = UIManager;
window.ModalManager = ModalManager;
window.CalendarManager = CalendarManager;