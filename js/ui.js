// Manejo de la interfaz de usuario
const UIManager = {
    // Actualizar estadísticas en la UI
    updateStatsUI: () => {
        const stats = DataUtils.getStats();
        document.getElementById('totalCount').textContent = stats.total;
        document.getElementById('pendingCount').textContent = stats.pending;
        document.getElementById('processCount').textContent = stats.process;
        document.getElementById('completedCount').textContent = stats.completed;
    },
    
    // Renderizar servicios en tabla
    renderServicesTable: (services, container) => {
        container.innerHTML = '';
        
        if (services.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <i class="fas fa-car"></i>
                <h4>No hay servicios</h4>
                <p>${AppState.currentTab === 'all' ? 'No hay servicios agendados' : `No hay servicios ${DataUtils.getTabName(AppState.currentTab)}`}</p>
            `;
            container.appendChild(emptyState);
            return;
        }
        
        const tableContainer = document.createElement('div');
        tableContainer.className = 'table-responsive';
        tableContainer.innerHTML = `
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
                        <th>Hora</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="servicesTableBody">
                </tbody>
            </table>
        `;
        
        container.appendChild(tableContainer);
        const tableBody = document.getElementById('servicesTableBody');
        
        services.forEach(service => {
            const row = document.createElement('tr');
            
            let statusText, statusClass, statusIcon;
            switch(service.status) {
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
            }
            
            row.innerHTML = `
                <td><strong>${service.id}</strong></td>
                <td>${service.vehicle}</td>
                <td>${service.owner}</td>
                <td>${DataUtils.formatDate(service.date)}</td>
                <td>${service.service}</td>
                <td>${service.employee || 'No asignado'}</td>
                <td>${service.phone}</td>
                <td>${DataUtils.formatTime(service.time)}</td>
                <td>
                    <span class="service-status ${statusClass}" style="margin: 0;">
                        <i class="${statusIcon}"></i>
                        <span>${statusText}</span>
                    </span>
                </td>
                <td>
                    <div class="action-buttons" style="margin: 0; justify-content: center;">
                        ${service.status !== 'completed' ? `
                        <button class="action-btn btn-complete" data-id="${service.id}" title="Completar">
                            <i class="fas fa-check"></i>
                        </button>` : ''}
                        <button class="action-btn btn-edit" data-id="${service.id}" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn btn-delete" data-id="${service.id}" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // Devolver los botones para agregar eventos después
        return {
            completeBtns: document.querySelectorAll('.btn-complete'),
            editBtns: document.querySelectorAll('.btn-edit'),
            deleteBtns: document.querySelectorAll('.btn-delete')
        };
    },
    
    // Renderizar vehículos
    renderVehiculos: (vehiculos, container) => {
        container.innerHTML = '<p>Lista de vehículos aquí...</p>';
        // Implementar renderizado de vehículos
    },
    
    // Renderizar clientes
    renderClientes: (clientes, container) => {
        container.innerHTML = '<p>Lista de clientes aquí...</p>';
        // Implementar renderizado de clientes
    },
    
    // Renderizar tipos de servicio
    renderServicios: (servicios, container) => {
        container.innerHTML = '<p>Lista de tipos de servicio aquí...</p>';
        // Implementar renderizado de servicios
    },
    
    // Renderizar reportes
    renderReportes: (reportType, container) => {
        let content = '';
        switch(reportType) {
            case 'diario':
                content = '<h4>Reporte Diario</h4><p>Contenido del reporte diario...</p>';
                break;
            case 'semanal':
                content = '<h4>Reporte Semanal</h4><p>Contenido del reporte semanal...</p>';
                break;
            case 'mensual':
                content = '<h4>Reporte Mensual</h4><p>Contenido del reporte mensual...</p>';
                break;
        }
        container.innerHTML = content;
    },
    
    // Cambiar página (navegación)
    changePage: (pageName) => {
        AppState.currentPage = pageName;
        
        // Ocultar todo el contenido primero
        document.querySelectorAll('#dynamicContent > .content-area').forEach(el => {
            el.style.display = 'none';
        });
        
        // Mostrar elementos específicos según la página
        const statsContainer = document.getElementById('statsContainer');
        const tabsContainer = document.getElementById('tabsContainer');
        const printBtn = document.getElementById('printBtn');
        
        if (pageName === 'agenda') {
            // Mostrar agenda
            document.getElementById('agendaContent').style.display = 'block';
            statsContainer.style.display = 'grid';
            tabsContainer.style.display = 'flex';
            printBtn.style.display = 'inline-flex';
            document.getElementById('pageTitle').textContent = 'Sistema de Gestión de Agenda';
            
            // Actualizar estadísticas y renderizar servicios
            UIManager.updateStatsUI();
            const services = DataUtils.filterServices(AppState.currentTab);
            const buttons = UIManager.renderServicesTable(services, document.getElementById('listView'));
            
            // Configurar vistas de calendario si están activas
            if (AppState.currentView === 'week') {
                CalendarManager.setupWeekView(
                    document.querySelector('#weekView .calendar-container'),
                    services
                );
            } else if (AppState.currentView === 'calendar') {
                CalendarManager.setupCalendarView(
                    document.querySelector('#calendarView .calendar-container'),
                    services
                );
            }
            
            return buttons; // Devolver botones para agregar eventos
        } else {
            // Otras páginas
            document.getElementById(`${pageName}Content`).style.display = 'block';
            statsContainer.style.display = 'none';
            tabsContainer.style.display = 'none';
            printBtn.style.display = 'none';
            
            // Renderizar contenido específico de la página
            switch(pageName) {
                case 'vehiculos':
                    document.getElementById('pageTitle').textContent = 'Gestión de Vehículos';
                    UIManager.renderVehiculos(DataStore.vehiculos, document.getElementById('vehiculosList'));
                    break;
                case 'clientes':
                    document.getElementById('pageTitle').textContent = 'Gestión de Clientes';
                    UIManager.renderClientes(DataStore.clientes, document.getElementById('clientesList'));
                    break;
                case 'servicios':
                    document.getElementById('pageTitle').textContent = 'Tipos de Servicios';
                    UIManager.renderServicios(DataStore.tiposServicio, document.getElementById('serviciosList'));
                    break;
                case 'reportes':
                    document.getElementById('pageTitle').textContent = 'Reportes y Estadísticas';
                    UIManager.renderReportes('diario', document.getElementById('reportesContentArea'));
                    break;
                case 'configuracion':
                    document.getElementById('pageTitle').textContent = 'Configuración del Sistema';
                    break;
            }
        }
        
        return null;
    },
    
    // Cambiar vista (lista, semana, calendario)
    changeView: (view) => {
        AppState.currentView = view;
        
        // Actualizar botones activos
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-view') === view) {
                btn.classList.add('active');
            }
        });
        
        // Ocultar todas las vistas
        document.querySelectorAll('#agendaContent .view-content').forEach(el => {
            el.style.display = 'none';
        });
        
        // Mostrar vista seleccionada
        const services = DataUtils.filterServices(AppState.currentTab);
        
        switch(view) {
            case 'list':
                document.getElementById('listView').style.display = 'block';
                document.getElementById('viewTitle').textContent = 'Lista de Servicios';
                UIManager.renderServicesTable(services, document.getElementById('listView'));
                break;
            case 'week':
                document.getElementById('weekView').style.display = 'block';
                document.getElementById('viewTitle').textContent = 'Vista Semanal';
                CalendarManager.setupWeekView(
                    document.querySelector('#weekView .calendar-container'),
                    services
                );
                break;
            case 'calendar':
                document.getElementById('calendarView').style.display = 'block';
                document.getElementById('viewTitle').textContent = 'Calendario';
                CalendarManager.setupCalendarView(
                    document.querySelector('#calendarView .calendar-container'),
                    services
                );
                break;
        }
    },
    
    // Cambiar pestaña (todos, pendientes, en proceso, completados)
    changeTab: (tab) => {
        AppState.currentTab = tab;
        
        // Actualizar botones activos
        document.querySelectorAll('.tab').forEach(tabEl => {
            tabEl.classList.remove('active');
            if (tabEl.getAttribute('data-tab') === tab) {
                tabEl.classList.add('active');
            }
        });
        
        // Recargar la vista actual con los servicios filtrados
        UIManager.changeView(AppState.currentView);
    },
    
    // Mostrar notificación
    showNotification: (message, type = 'info') => {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">&times;</button>
        `;
        
        // Agregar estilos si no existen
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    padding: 1rem;
                    border-radius: 0.5rem;
                    box-shadow: var(--shadow-lg);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    min-width: 300px;
                    z-index: 1000;
                    animation: slideIn 0.3s ease;
                }
                .notification-success { border-left: 4px solid var(--success); }
                .notification-error { border-left: 4px solid var(--danger); }
                .notification-info { border-left: 4px solid var(--primary); }
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .notification-close {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: var(--gray-500);
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Auto-eliminar después de 5 segundos
        setTimeout(() => {
            notification.remove();
        }, 5000);
        
        // Cerrar al hacer clic en el botón
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }
};

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UIManager };
}