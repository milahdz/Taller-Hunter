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
            return null;
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
        container.innerHTML = '';
        
        if (vehiculos.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <i class="fas fa-car"></i>
                <h4>No hay vehículos registrados</h4>
                <p>Comienza agregando un nuevo vehículo</p>
            `;
            container.appendChild(emptyState);
            return null;
        }
        
        const tableContainer = document.createElement('div');
        tableContainer.className = 'table-responsive';
        tableContainer.innerHTML = `
            <table class="services-table">
                <thead>
                    <tr>
                        <th>Placa</th>
                        <th>Marca</th>
                        <th>Modelo</th>
                        <th>Año</th>
                        <th>Color</th>
                        <th>Propietario</th>
                        <th>Teléfono</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="vehiculosTableBody">
                </tbody>
            </table>
        `;
        
        container.appendChild(tableContainer);
        const tableBody = document.getElementById('vehiculosTableBody');
        
        vehiculos.forEach(vehiculo => {
            const cliente = DataUtils.findClienteById(vehiculo.clienteId) || {};
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${vehiculo.placa}</strong></td>
                <td>${vehiculo.marca}</td>
                <td>${vehiculo.modelo}</td>
                <td>${vehiculo.año}</td>
                <td>${vehiculo.color}</td>
                <td>${cliente.nombre || 'Sin propietario'}</td>
                <td>${cliente.telefono || 'No disponible'}</td>
                <td>
                    <div class="action-buttons" style="margin: 0; justify-content: center;">
                        <button class="action-btn btn-edit" data-id="${vehiculo.id}" data-type="vehiculo" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn btn-delete" data-id="${vehiculo.id}" data-type="vehiculo" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        return {
            editBtns: document.querySelectorAll('[data-type="vehiculo"].btn-edit'),
            deleteBtns: document.querySelectorAll('[data-type="vehiculo"].btn-delete')
        };
    },
    
    // Renderizar clientes
    renderClientes: (clientes, container) => {
        container.innerHTML = '';
        
        if (clientes.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <i class="fas fa-users"></i>
                <h4>No hay clientes registrados</h4>
                <p>Comienza agregando un nuevo cliente</p>
            `;
            container.appendChild(emptyState);
            return null;
        }
        
        // Stats de clientes
        const statsRow = document.createElement('div');
        statsRow.className = 'stats-container';
        statsRow.style.marginBottom = '1.5rem';
        statsRow.innerHTML = `
            <div class="stat-card stat-total">
                <h3>Total Clientes</h3>
                <div class="stat-value">${clientes.length}</div>
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
                <h3>Servicios Completados</h3>
                <div class="stat-value">${DataStore.services.filter(s => s.status === 'completed').length}</div>
            </div>
        `;
        container.appendChild(statsRow);
        
        // Tabla de clientes
        const tableContainer = document.createElement('div');
        tableContainer.className = 'table-responsive';
        tableContainer.innerHTML = `
            <table class="services-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Teléfono</th>
                        <th>Email</th>
                        <th>Dirección</th>
                        <th>Vehículos</th>
                        <th>Último Servicio</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="clientesTableBody">
                </tbody>
            </table>
        `;
        
        container.appendChild(tableContainer);
        const tableBody = document.getElementById('clientesTableBody');
        
        clientes.forEach(cliente => {
            // Contar vehículos del cliente
            const vehiculosCliente = DataStore.vehiculos.filter(v => v.clienteId === cliente.id);
            
            // Obtener último servicio
            const serviciosCliente = DataStore.services.filter(s => s.owner === cliente.nombre);
            const ultimoServicio = serviciosCliente.length > 0 
                ? DataUtils.formatDate(serviciosCliente[serviciosCliente.length - 1].date)
                : 'Nunca';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${cliente.id}</strong></td>
                <td>${cliente.nombre}</td>
                <td>${cliente.telefono}</td>
                <td>${cliente.email || 'No tiene'}</td>
                <td>${cliente.direccion || 'No registrada'}</td>
                <td>${vehiculosCliente.length}</td>
                <td>${ultimoServicio}</td>
                <td>
                    <div class="action-buttons" style="margin: 0; justify-content: center;">
                        <button class="action-btn btn-edit" data-id="${cliente.id}" data-type="cliente" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn btn-delete" data-id="${cliente.id}" data-type="cliente" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        return {
            editBtns: document.querySelectorAll('[data-type="cliente"].btn-edit'),
            deleteBtns: document.querySelectorAll('[data-type="cliente"].btn-delete')
        };
    },
    
    // Renderizar tipos de servicio
    renderServicios: (servicios, container) => {
        container.innerHTML = '';
        
        if (servicios.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <i class="fas fa-cogs"></i>
                <h4>No hay servicios configurados</h4>
                <p>Comienza agregando un nuevo tipo de servicio</p>
            `;
            container.appendChild(emptyState);
            return null;
        }
        
        // Mostrar servicios como cards
        const cardsContainer = document.createElement('div');
        cardsContainer.className = 'card-grid';
        
        servicios.forEach(servicio => {
            const card = document.createElement('div');
            card.className = 'service-card';
            card.innerHTML = `
                <div class="service-id" style="font-size: 1rem; color: var(--primary); margin-bottom: 0.5rem;">
                    ${servicio.nombre}
                    <span class="badge ${servicio.categoria === 'Mantenimiento' ? 'badge-success' : servicio.categoria === 'Reparación' ? 'badge-warning' : 'badge-info'}" 
                          style="margin-left: 0.5rem; font-size: 0.7rem;">
                        ${servicio.categoria || 'General'}
                    </span>
                </div>
                <div style="margin-bottom: 1rem; color: var(--gray-600); font-size: 0.875rem;">
                    ${servicio.descripcion || 'Sin descripción'}
                </div>
                <div class="service-details">
                    <div class="service-detail">
                        <div class="detail-label">Precio</div>
                        <div class="detail-value" style="font-size: 1.25rem; font-weight: 700; color: var(--success);">
                            RD$${parseFloat(servicio.precio).toFixed(2)}
                        </div>
                    </div>
                    <div class="service-detail">
                        <div class="detail-label">Duración</div>
                        <div class="detail-value">${servicio.duracion || 'No especificada'}</div>
                    </div>
                </div>
                <div class="action-buttons" style="margin-top: 1rem;">
                    <button class="action-btn btn-edit" data-id="${servicio.id}" data-type="servicio" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn btn-delete" data-id="${servicio.id}" data-type="servicio" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            cardsContainer.appendChild(card);
        });
        
        container.appendChild(cardsContainer);
        
        return {
            editBtns: document.querySelectorAll('[data-type="servicio"].btn-edit'),
            deleteBtns: document.querySelectorAll('[data-type="servicio"].btn-delete')
        };
    },
    
    // Renderizar reportes
    renderReportes: (reportType, container) => {
        container.innerHTML = '';
        
        const { startDate, endDate } = CalendarManager.getDateRange(reportType);
        
        // Filtrar servicios por rango de fecha
        const serviciosFiltrados = CalendarManager.generateDateReport(
            DataStore.services,
            startDate,
            endDate
        );
        
        // Calcular estadísticas
        const totalServicios = serviciosFiltrados.length;
        const totalPendientes = serviciosFiltrados.filter(s => s.status === 'pending').length;
        const totalProceso = serviciosFiltrados.filter(s => s.status === 'process').length;
        const totalCompletados = serviciosFiltrados.filter(s => s.status === 'completed').length;
        
        // Calcular ingresos estimados
        let ingresosEstimados = 0;
        let ingresosPotenciales = 0;
        
        serviciosFiltrados.forEach(servicio => {
            const tipoServicio = DataStore.tiposServicio.find(t => t.nombre === servicio.service);
            if (tipoServicio) {
                if (servicio.status === 'completed') {
                    ingresosEstimados += parseFloat(tipoServicio.precio);
                } else {
                    ingresosPotenciales += parseFloat(tipoServicio.precio);
                }
            }
        });
        
        const totalIngresos = ingresosEstimados + ingresosPotenciales;
        
        // Crear contenido del reporte
        const reporteContent = document.createElement('div');
        reporteContent.innerHTML = `
            <div class="stats-container" style="margin-bottom: 2rem;">
                <div class="stat-card stat-total">
                    <h3>Servicios Totales</h3>
                    <div class="stat-value">${totalServicios}</div>
                    <div style="font-size: 0.875rem; color: var(--gray-600); margin-top: 0.5rem;">
                        ${DataUtils.formatDate(startDate)} - ${DataUtils.formatDate(endDate)}
                    </div>
                </div>
                <div class="stat-card stat-pendientes">
                    <h3>Pendientes</h3>
                    <div class="stat-value">${totalPendientes}</div>
                </div>
                <div class="stat-card stat-proceso">
                    <h3>En Proceso</h3>
                    <div class="stat-value">${totalProceso}</div>
                </div>
                <div class="stat-card stat-completados">
                    <h3>Completados</h3>
                    <div class="stat-value">${totalCompletados}</div>
                </div>
            </div>
            
            <div class="chart-container">
                <div class="chart-header">
                    <div class="chart-title">Ingresos Financieros</div>
                </div>
                <div class="stats-container">
                    <div class="stat-card" style="border-left: 4px solid var(--success);">
                        <h3>Ingresos Realizados</h3>
                        <div class="stat-value" style="color: var(--success);">RD$${ingresosEstimados.toFixed(2)}</div>
                    </div>
                    <div class="stat-card" style="border-left: 4px solid var(--warning);">
                        <h3>Ingresos Potenciales</h3>
                        <div class="stat-value" style="color: var(--warning);">RD$${ingresosPotenciales.toFixed(2)}</div>
                    </div>
                    <div class="stat-card" style="border-left: 4px solid var(--primary);">
                        <h3>Total Proyectado</h3>
                        <div class="stat-value" style="color: var(--primary);">RD$${totalIngresos.toFixed(2)}</div>
                    </div>
                </div>
            </div>
            
            <div class="chart-container">
                <div class="chart-header">
                    <div class="chart-title">Servicios por Estado</div>
                </div>
                <div style="padding: 1rem;">
                    <div style="margin-bottom: 1rem;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                            <span>Completados</span>
                            <span>${totalCompletados} (${totalServicios > 0 ? Math.round((totalCompletados/totalServicios)*100) : 0}%)</span>
                        </div>
                        <div style="height: 8px; background: var(--gray-200); border-radius: 4px; overflow: hidden;">
                            <div style="width: ${totalServicios > 0 ? (totalCompletados/totalServicios)*100 : 0}%; height: 100%; background: var(--success);"></div>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 1rem;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                            <span>En Proceso</span>
                            <span>${totalProceso} (${totalServicios > 0 ? Math.round((totalProceso/totalServicios)*100) : 0}%)</span>
                        </div>
                        <div style="height: 8px; background: var(--gray-200); border-radius: 4px; overflow: hidden;">
                            <div style="width: ${totalServicios > 0 ? (totalProceso/totalServicios)*100 : 0}%; height: 100%; background: var(--primary);"></div>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 1rem;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                            <span>Pendientes</span>
                            <span>${totalPendientes} (${totalServicios > 0 ? Math.round((totalPendientes/totalServicios)*100) : 0}%)</span>
                        </div>
                        <div style="height: 8px; background: var(--gray-200); border-radius: 4px; overflow: hidden;">
                            <div style="width: ${totalServicios > 0 ? (totalPendientes/totalServicios)*100 : 0}%; height: 100%; background: var(--warning);"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="chart-container">
                <div class="chart-header">
                    <div class="chart-title">Resumen de Servicios</div>
                </div>
                <div style="padding: 1rem;">
                    <div style="margin-bottom: 0.5rem;">
                        <strong>Período:</strong> ${reportType === 'diario' ? 'Hoy' : reportType === 'semanal' ? 'Esta semana' : 'Este mes'}
                    </div>
                    <div style="margin-bottom: 0.5rem;">
                        <strong>Fecha de reporte:</strong> ${new Date().toLocaleDateString('es-ES')}
                    </div>
                    <div style="margin-bottom: 0.5rem;">
                        <strong>Cliente más frecuente:</strong> ${this.getClienteMasFrecuente()}
                    </div>
                    <div style="margin-bottom: 0.5rem;">
                        <strong>Servicio más solicitado:</strong> ${this.getServicioMasSolicitado(serviciosFiltrados)}
                    </div>
                    <div>
                        <strong>Empleado más activo:</strong> ${this.getEmpleadoMasActivo(serviciosFiltrados)}
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(reporteContent);
    },
    
    // Renderizar configuración
    renderConfiguracion: (configType, container) => {
        container.innerHTML = '';
        
        if (configType === 'empleados') {
            this.renderEmpleados(container);
        } else if (configType === 'general') {
            this.renderConfigGeneral(container);
        } else if (configType === 'horarios') {
            this.renderConfigHorarios(container);
        }
    },
    
    // Renderizar empleados
    renderEmpleados: (container) => {
        container.innerHTML = `
            <div style="margin-bottom: 1.5rem;">
                <h4 style="margin-bottom: 1rem;">Gestión de Empleados</h4>
                <p style="color: var(--gray-600); margin-bottom: 1rem;">Administra los empleados del taller</p>
                <button class="btn btn-primary" id="addEmpleadoBtn">
                    <i class="fas fa-plus"></i> Nuevo Empleado
                </button>
            </div>
            
            <div id="empleadosList"></div>
        `;
        
        // Renderizar lista de empleados
        const empleadosContainer = document.getElementById('empleadosList');
        if (DataStore.empleados.length === 0) {
            empleadosContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <h4>No hay empleados registrados</h4>
                    <p>Comienza agregando un nuevo empleado</p>
                </div>
            `;
        } else {
            const tableContainer = document.createElement('div');
            tableContainer.className = 'table-responsive';
            tableContainer.innerHTML = `
                <table class="services-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Especialidad</th>
                            <th>Teléfono</th>
                            <th>Email</th>
                            <th>Horario</th>
                            <th>Servicios Asignados</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="empleadosTableBody">
                    </tbody>
                </table>
            `;
            
            empleadosContainer.appendChild(tableContainer);
            const tableBody = document.getElementById('empleadosTableBody');
            
            DataStore.empleados.forEach(empleado => {
                const serviciosAsignados = DataStore.services.filter(s => s.employee === empleado.nombre).length;
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${empleado.nombre}</td>
                    <td>${empleado.especialidad}</td>
                    <td>${empleado.telefono || 'No disponible'}</td>
                    <td>${empleado.email || 'No disponible'}</td>
                    <td>${empleado.horario || 'No especificado'}</td>
                    <td>${serviciosAsignados}</td>
                    <td>
                        <div class="action-buttons" style="margin: 0; justify-content: center;">
                            <button class="action-btn btn-edit" data-id="${empleado.id}" data-type="empleado" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn btn-delete" data-id="${empleado.id}" data-type="empleado" title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                `;
                
                tableBody.appendChild(row);
            });
        }
    },
    
    // Renderizar configuración general
    renderConfigGeneral: (container) => {
        const config = DataStore.configuracion;
        
        container.innerHTML = `
            <div class="config-card">
                <h4>Configuración General del Sistema</h4>
                <form id="configGeneralForm">
                    <div class="form-group">
                        <label for="configIva">IVA (%)</label>
                        <input type="number" id="configIva" class="form-control" value="${config.iva}" min="0" max="100" step="0.1">
                    </div>
                    
                    <div class="form-group">
                        <label for="configIntervalo">Intervalo entre Citas (minutos)</label>
                        <input type="number" id="configIntervalo" class="form-control" value="${config.intervaloCitas}" min="15" max="120" step="15">
                    </div>
                    
                    <div class="form-group">
                        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                            <input type="checkbox" id="configNotifEmail" ${config.notificacionesEmail ? 'checked' : ''}>
                            <label for="configNotifEmail" style="margin-bottom: 0;">Notificaciones por Email</label>
                        </div>
                        
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <input type="checkbox" id="configNotifSMS" ${config.notificacionesSMS ? 'checked' : ''}>
                            <label for="configNotifSMS" style="margin-bottom: 0;">Notificaciones por SMS</label>
                        </div>
                    </div>
                    
                    <button type="button" class="btn btn-primary" id="saveConfigBtn">
                        <i class="fas fa-save"></i> Guardar Configuración
                    </button>
                </form>
            </div>
        `;
    },
    
    // Renderizar configuración de horarios
    renderConfigHorarios: (container) => {
        const config = DataStore.configuracion;
        
        container.innerHTML = `
            <div class="config-card">
                <h4>Configuración de Horarios</h4>
                <form id="configHorariosForm">
                    <div class="form-group">
                        <label for="configHoraApertura">Hora de Apertura</label>
                        <input type="time" id="configHoraApertura" class="form-control" value="${config.horarioApertura}">
                    </div>
                    
                    <div class="form-group">
                        <label for="configHoraCierre">Hora de Cierre</label>
                        <input type="time" id="configHoraCierre" class="form-control" value="${config.horarioCierre}">
                    </div>
                    
                    <div class="form-group">
                        <label>Días de Operación</label>
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem;">
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <input type="checkbox" id="configLunes" checked>
                                <label for="configLunes" style="margin-bottom: 0;">Lunes</label>
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <input type="checkbox" id="configMartes" checked>
                                <label for="configMartes" style="margin-bottom: 0;">Martes</label>
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <input type="checkbox" id="configMiercoles" checked>
                                <label for="configMiercoles" style="margin-bottom: 0;">Miércoles</label>
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <input type="checkbox" id="configJueves" checked>
                                <label for="configJueves" style="margin-bottom: 0;">Jueves</label>
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <input type="checkbox" id="configViernes" checked>
                                <label for="configViernes" style="margin-bottom: 0;">Viernes</label>
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <input type="checkbox" id="configSabado">
                                <label for="configSabado" style="margin-bottom: 0;">Sábado</label>
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <input type="checkbox" id="configDomingo">
                                <label for="configDomingo" style="margin-bottom: 0;">Domingo</label>
                            </div>
                        </div>
                    </div>
                    
                    <button type="button" class="btn btn-primary" id="saveHorariosBtn">
                        <i class="fas fa-save"></i> Guardar Horarios
                    </button>
                </form>
            </div>
        `;
    },
    
    // Métodos auxiliares para reportes
    getClienteMasFrecuente: () => {
        if (DataStore.services.length === 0) return 'No hay datos';
        
        const frecuencia = {};
        DataStore.services.forEach(service => {
            frecuencia[service.owner] = (frecuencia[service.owner] || 0) + 1;
        });
        
        const clienteMasFrecuente = Object.keys(frecuencia).reduce((a, b) => 
            frecuencia[a] > frecuencia[b] ? a : b
        );
        
        return clienteMasFrecuente;
    },
    
    getServicioMasSolicitado: (servicios) => {
        if (servicios.length === 0) return 'No hay datos';
        
        const frecuencia = {};
        servicios.forEach(service => {
            frecuencia[service.service] = (frecuencia[service.service] || 0) + 1;
        });
        
        const servicioMasSolicitado = Object.keys(frecuencia).reduce((a, b) => 
            frecuencia[a] > frecuencia[b] ? a : b
        );
        
        return servicioMasSolicitado;
    },
    
    getEmpleadoMasActivo: (servicios) => {
        if (servicios.length === 0) return 'No hay datos';
        
        const frecuencia = {};
        servicios.forEach(service => {
            if (service.employee) {
                frecuencia[service.employee] = (frecuencia[service.employee] || 0) + 1;
            }
        });
        
        const empleadoMasActivo = Object.keys(frecuencia).reduce((a, b) => 
            frecuencia[a] > frecuencia[b] ? a : b
        );
        
        return empleadoMasActivo || 'No asignado';
    },
    
    // FUNCIÓN changeView ACTUALIZADA
    changeView: (view) => {
        console.log('UIManager.changeView llamado con:', view);
        AppState.currentView = view;
        
        // Actualizar botones activos
        document.querySelectorAll('#agendaContent .view-btn').forEach(btn => {
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
                const buttons = UIManager.renderServicesTable(services, document.getElementById('listView'));
                // Los botones se configurarán desde main.js
                return buttons;
            case 'week':
                document.getElementById('weekView').style.display = 'block';
                document.getElementById('viewTitle').textContent = 'Vista Semanal';
                CalendarManager.setupWeekView(
                    document.querySelector('#weekView .calendar-container'),
                    services
                );
                return null;
            case 'calendar':
                document.getElementById('calendarView').style.display = 'block';
                document.getElementById('viewTitle').textContent = 'Calendario';
                CalendarManager.setupCalendarView(
                    document.querySelector('#calendarView .calendar-container'),
                    services
                );
                return null;
        }
    },
    
    // Cambiar pestaña (todos, pendientes, en proceso, completados)
    changeTab: (tab) => {
        console.log('UIManager.changeTab llamado con:', tab);
        AppState.currentTab = tab;
        
        // Actualizar botones activos
        document.querySelectorAll('.tab').forEach(tabEl => {
            tabEl.classList.remove('active');
            if (tabEl.getAttribute('data-tab') === tab) {
                tabEl.classList.add('active');
            }
        });
        
        // Recargar la vista actual con los servicios filtrados
        return UIManager.changeView(AppState.currentView);
    },
    
    // Cambiar página (navegación)
    changePage: (pageName) => {
        console.log('UIManager.changePage llamado con:', pageName);
        AppState.currentPage = pageName;
        
        // Ocultar todo el contenido primero
        document.querySelectorAll('#dynamicContent > .content-area').forEach(el => {
            el.style.display = 'none';
        });
        
        // Mostrar elementos específicos según la página
        const statsContainer = document.getElementById('statsContainer');
        const tabsContainer = document.getElementById('tabsContainer');
        const printBtn = document.getElementById('printBtn');
        const addVehicleBtn = document.getElementById('addVehicleBtn');
        
        if (pageName === 'agenda') {
            // Mostrar agenda
            document.getElementById('agendaContent').style.display = 'block';
            statsContainer.style.display = 'grid';
            tabsContainer.style.display = 'flex';
            printBtn.style.display = 'inline-flex';
            addVehicleBtn.style.display = 'inline-flex';
            document.getElementById('pageTitle').textContent = 'Sistema de Gestión de Agenda';
            
            // Actualizar estadísticas y renderizar servicios
            this.updateStatsUI();
            const buttons = this.changeView(AppState.currentView);
            
            return buttons; // Devolver botones para agregar eventos
        } else {
            // Otras páginas
            document.getElementById(`${pageName}Content`).style.display = 'block';
            statsContainer.style.display = 'none';
            tabsContainer.style.display = 'none';
            printBtn.style.display = 'none';
            addVehicleBtn.style.display = 'none';
            
            let buttons = null;
            
            // Renderizar contenido específico de la página
            switch(pageName) {
                case 'vehiculos':
                    document.getElementById('pageTitle').textContent = 'Gestión de Vehículos';
                    buttons = this.renderVehiculos(DataStore.vehiculos, document.getElementById('vehiculosList'));
                    break;
                case 'clientes':
                    document.getElementById('pageTitle').textContent = 'Gestión de Clientes';
                    buttons = this.renderClientes(DataStore.clientes, document.getElementById('clientesList'));
                    break;
                case 'servicios':
                    document.getElementById('pageTitle').textContent = 'Tipos de Servicios';
                    buttons = this.renderServicios(DataStore.tiposServicio, document.getElementById('serviciosList'));
                    break;
                case 'reportes':
                    document.getElementById('pageTitle').textContent = 'Reportes y Estadísticas';
                    this.renderReportes('diario', document.getElementById('reportesContentArea'));
                    break;
                case 'configuracion':
                    document.getElementById('pageTitle').textContent = 'Configuración del Sistema';
                    this.renderConfiguracion('empleados', document.getElementById('configuracionArea'));
                    break;
            }
            
            return buttons;
        }
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
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
        
        // Cerrar al hacer clic en el botón
        notification.querySelector('.notification-close').addEventListener('click', () => {
            if (notification.parentNode) {
                notification.remove();
            }
        });
    }
};

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UIManager };
}// ui.js (al final)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UIManager };
} else {
    window.UIManager = UIManager;
}