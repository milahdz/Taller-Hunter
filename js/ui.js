// Manejo de la interfaz de usuario
const UIManager = {
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
            // Buscar cliente por ID o usar campo texto 'cliente'
            const clienteObj = DataStore.clientes.find(c => String(c.id) === String(vehiculo.clienteId));
            const nombreCliente  = clienteObj?.nombre  || vehiculo.cliente  || 'Sin propietario';
            const telefonoCliente = clienteObj?.telefono || '—';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${vehiculo.placa}</strong></td>
                <td>${vehiculo.marca}</td>
                <td>${vehiculo.modelo}</td>
                <td>${vehiculo.anio || '—'}</td>
                <td>${vehiculo.color || '—'}</td>
                <td>${nombreCliente}</td>
                <td>${telefonoCliente}</td>
                <td>
                    <div class="action-buttons" style="margin: 0; justify-content: center;">
                        <button class="action-btn-icon btn-edit" data-id="${vehiculo.id}" data-type="vehiculo" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn-icon btn-delete" data-id="${vehiculo.id}" data-type="vehiculo" title="Eliminar">
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
            const vehiculosCliente = DataStore.vehiculos.filter(v => String(v.clienteId) === String(cliente.id));
            // Buscar servicios por ID o por nombre del propietario
            const serviciosCliente = DataStore.services.filter(s =>
                String(s.cliente_id) === String(cliente.id) || s.owner === cliente.nombre
            );
            const ultimoServicio = serviciosCliente.length > 0
                ? DataUtils.formatDate(serviciosCliente[serviciosCliente.length - 1].date)
                : 'Nunca';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${cliente.id}</strong></td>
                <td>${cliente.nombre}</td>
                <td>${cliente.telefono}</td>
                <td>${cliente.email || 'No tiene'}</td>
                <td>${vehiculosCliente.length}</td>
                <td>${ultimoServicio}</td>
                <td>
                    <div class="action-buttons" style="margin: 0; justify-content: center;">
                        <button class="action-btn-icon btn-edit" data-id="${cliente.id}" data-type="cliente" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn-icon btn-delete" data-id="${cliente.id}" data-type="cliente" title="Eliminar">
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
                    <span class="badge ${servicio.categoria === 'preventivo' ? 'badge-success' : servicio.categoria === 'correctivo' ? 'badge-warning' : 'badge-info'}"
                          style="margin-left: 0.5rem; font-size: 0.7rem;">
                        ${servicio.categoria === 'preventivo' ? 'Preventivo' : servicio.categoria === 'correctivo' ? 'Correctivo' : servicio.categoria || 'General'}
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
                <div class="service-card-actions">
                    <button class="svc-btn svc-btn-edit card-btn-edit" data-id="${servicio.id}" data-type="servicio">
                        <i class="fas fa-pen"></i>
                        <span>Editar</span>
                    </button>
                    <button class="svc-btn svc-btn-delete card-btn-delete" data-id="${servicio.id}" data-type="servicio">
                        <i class="fas fa-trash"></i>
                        <span>Eliminar</span>
                    </button>
                </div>
            `;
            
            cardsContainer.appendChild(card);
        });
        
        container.appendChild(cardsContainer);
        
        return {
            editBtns: container.querySelectorAll('button.card-btn-edit'),
            deleteBtns: container.querySelectorAll('button.card-btn-delete')
        };
    },
    
    // Chart instance registry — prevents canvas reuse errors
    _charts: {},
    _destroyChart(key) {
        if (UIManager._charts[key]) { UIManager._charts[key].destroy(); UIManager._charts[key] = null; }
    },

    _kpiCard(bg, color, icon, value, label) {
        return `<div class="kpi-card">
            <div class="kpi-icon" style="background:${bg};"><i class="${icon}" style="color:${color};"></i></div>
            <div><div class="kpi-value">${value}</div><div class="kpi-label">${label}</div></div>
        </div>`;
    },

    _buildSeries(period, services) {
        const now = new Date();
        if (period === 'diario') {
            const hours = [7,8,9,10,11,12,13,14,15,16,17,18];
            return {
                labels: hours.map(h => h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h-12}pm`),
                values: hours.map(h => services.filter(s => s.time && parseInt(s.time) === h).length),
                color: '#3b82f6'
            };
        }
        if (period === 'semanal') {
            const days = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
            const labels = [], values = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date(now); d.setDate(d.getDate() - i);
                labels.push(days[d.getDay()]);
                const ds = d.toISOString().split('T')[0];
                values.push(services.filter(s => s.date === ds).length);
            }
            return { labels, values, color: '#8b5cf6' };
        }
        // monthly
        const days = new Date(now.getFullYear(), now.getMonth()+1, 0).getDate();
        const labels = Array.from({length: days}, (_, i) => String(i+1));
        const values = labels.map((_, i) => {
            const ds = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(i+1).padStart(2,'0')}`;
            return services.filter(s => s.date === ds).length;
        });
        return { labels, values, color: '#10b981' };
    },

    // Renderizar reportes
    renderReportes: (reportType, container) => {
        container.innerHTML = '';

        const all       = DataStore.services || [];
        const done      = all.filter(s => s.status === 'completed');
        const inProcess = all.filter(s => s.status === 'process');
        const pending   = all.filter(s => s.status === 'pending');

        let ingresos = 0;
        done.forEach(s => {
            const t = (DataStore.tiposServicio||[]).find(x => x.nombre === s.service);
            if (t) ingresos += parseFloat(t.precio) || 0;
        });

        const vehiculosUnicos = new Set(all.map(s => s.vehicle).filter(Boolean)).size;
        const clientesUnicos  = new Set(all.map(s => s.owner).filter(Boolean)).size;
        const series          = UIManager._buildSeries(reportType, all);
        const periodLabel     = {diario:'Hoy', semanal:'Esta semana', mensual:'Este mes'}[reportType] || 'Período';

        const wrap = document.createElement('div');
        wrap.style.padding = '1.25rem';
        wrap.innerHTML = `
        <div class="report-kpi-grid">
            ${UIManager._kpiCard('#dcfce7','#16a34a','fas fa-dollar-sign',
                'RD$'+ingresos.toLocaleString('es-DO',{minimumFractionDigits:2,maximumFractionDigits:2}), 'Ingresos Realizados')}
            ${UIManager._kpiCard('#dbeafe','#2563eb','fas fa-wrench', done.length, 'Servicios Completados')}
            ${UIManager._kpiCard('#f3e8ff','#9333ea','fas fa-car', vehiculosUnicos, 'Vehículos Atendidos')}
            ${UIManager._kpiCard('#fef3c7','#d97706','fas fa-users', clientesUnicos, 'Clientes Registrados')}
        </div>

        <div class="report-chart-grid" style="display:grid;grid-template-columns:1fr 300px;gap:1rem;margin-bottom:1rem;">
            <div class="chart-container" style="padding:1.25rem;">
                <div class="chart-header">
                    <div class="chart-title">Actividad — ${periodLabel}</div>
                </div>
                <canvas id="rcBar" style="max-height:240px;"></canvas>
            </div>
            <div class="chart-container" style="padding:1.25rem;">
                <div class="chart-header"><div class="chart-title">Por Estado</div></div>
                <div style="display:flex;align-items:center;justify-content:center;padding:0.5rem 0;">
                    <canvas id="rcDonut" style="max-height:170px;max-width:170px;"></canvas>
                </div>
                <div style="font-size:0.8rem;display:flex;flex-direction:column;gap:0.375rem;margin-top:0.5rem;">
                    <div style="display:flex;align-items:center;gap:0.5rem;"><span style="width:10px;height:10px;border-radius:2px;background:#16a34a;flex-shrink:0;"></span>Completados: <strong>${done.length}</strong></div>
                    <div style="display:flex;align-items:center;gap:0.5rem;"><span style="width:10px;height:10px;border-radius:2px;background:#2563eb;flex-shrink:0;"></span>En Proceso: <strong>${inProcess.length}</strong></div>
                    <div style="display:flex;align-items:center;gap:0.5rem;"><span style="width:10px;height:10px;border-radius:2px;background:#d97706;flex-shrink:0;"></span>Pendientes: <strong>${pending.length}</strong></div>
                </div>
            </div>
        </div>

        <div class="chart-container" style="padding:0;">
            <div class="chart-header" style="padding:1rem 1.25rem;">
                <div class="chart-title">Resumen del Período</div>
            </div>
            <table class="services-table">
                <tbody>
                    <tr><td style="color:#64748b;font-size:0.825rem;width:50%;">Período analizado</td><td><strong>${periodLabel}</strong></td></tr>
                    <tr><td style="color:#64748b;font-size:0.825rem;">Total registros</td><td><strong>${all.length}</strong></td></tr>
                    <tr><td style="color:#64748b;font-size:0.825rem;">Tasa de completación</td><td><strong>${all.length>0?Math.round((done.length/all.length)*100):0}%</strong></td></tr>
                    <tr><td style="color:#64748b;font-size:0.825rem;">Cliente más frecuente</td><td><strong>${UIManager.getClienteMasFrecuente()}</strong></td></tr>
                    <tr><td style="color:#64748b;font-size:0.825rem;">Servicio más solicitado</td><td><strong>${UIManager.getServicioMasSolicitado(all)}</strong></td></tr>
                    <tr><td style="color:#64748b;font-size:0.825rem;">Empleado más activo</td><td><strong>${UIManager.getEmpleadoMasActivo(all)}</strong></td></tr>
                    <tr><td style="color:#64748b;font-size:0.825rem;">Fecha del reporte</td><td><strong>${new Date().toLocaleDateString('es-ES',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</strong></td></tr>
                </tbody>
            </table>
        </div>`;

        container.appendChild(wrap);

        requestAnimationFrame(() => {
            UIManager._destroyChart('rcBar');
            UIManager._destroyChart('rcDonut');

            const barCtx = document.getElementById('rcBar');
            if (barCtx && window.Chart) {
                UIManager._charts.rcBar = new Chart(barCtx, {
                    type: 'bar',
                    data: {
                        labels: series.labels,
                        datasets: [{ label:'Servicios', data: series.values,
                            backgroundColor: series.color+'33', borderColor: series.color,
                            borderWidth: 2, borderRadius: 5 }]
                    },
                    options: {
                        responsive:true, maintainAspectRatio:true,
                        plugins:{ legend:{ display:false } },
                        scales:{
                            y:{ beginAtZero:true, ticks:{ stepSize:1, color:'#94a3b8' }, grid:{ color:'#f1f5f9' } },
                            x:{ ticks:{ color:'#94a3b8' }, grid:{ display:false } }
                        }
                    }
                });
            }

            const donutCtx = document.getElementById('rcDonut');
            if (donutCtx && window.Chart) {
                const hasData = done.length + inProcess.length + pending.length > 0;
                UIManager._charts.rcDonut = new Chart(donutCtx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Completados','En Proceso','Pendientes'],
                        datasets: [{
                            data: hasData ? [done.length, inProcess.length, pending.length] : [1,1,1],
                            backgroundColor: ['#16a34a','#2563eb','#d97706'],
                            borderWidth:2, borderColor:'#fff'
                        }]
                    },
                    options: {
                        responsive:true, maintainAspectRatio:true, cutout:'66%',
                        plugins:{
                            legend:{ display:false },
                            tooltip:{ callbacks:{ label: ctx => ` ${ctx.label}: ${hasData ? ctx.parsed : 0}` } }
                        }
                    }
                });
            }
        });
    },
    
    // Renderizar configuración
    renderConfiguracion: (configType, container) => {
        container.innerHTML = '';
        if      (configType === 'perfil')    UIManager.renderConfigPerfil(container);
        else if (configType === 'taller')    UIManager.renderConfigTaller(container);
        else if (configType === 'empleados') UIManager.renderEmpleados(container);
        else if (configType === 'general')   UIManager.renderConfigGeneral(container);
        else if (configType === 'horarios')  UIManager.renderConfigHorarios(container);
    },

    renderConfigPerfil: (container) => {
        const savedName  = localStorage.getItem('th_admin_name')  || 'Administrador';
        const savedEmail = localStorage.getItem('th_admin_email') || '';
        const isDark     = document.documentElement.getAttribute('data-theme') === 'dark';
        container.innerHTML = `
        <div class="config-card">
            <h4><i class="fas fa-user-circle" style="color:var(--primary);margin-right:0.5rem;"></i>Perfil del Administrador</h4>
            <div class="form-group">
                <label>Nombre del Administrador</label>
                <input type="text" id="cfgNombre" class="form-control" value="${savedName}" placeholder="Tu nombre">
            </div>
            <div class="form-group">
                <label>Correo Electrónico</label>
                <input type="email" id="cfgEmail" class="form-control" value="${savedEmail}" placeholder="admin@taller.com">
            </div>
            <button class="btn btn-primary" id="savePerfilBtn"><i class="fas fa-save"></i> Guardar Perfil</button>
        </div>

        <div class="config-card" style="margin-top:1rem;">
            <h4><i class="fas fa-key" style="color:var(--primary);margin-right:0.5rem;"></i>Cambiar Contraseña</h4>
            <div class="form-group">
                <label>Contraseña actual</label>
                <input type="password" id="cfgPassActual" class="form-control" placeholder="••••••••">
            </div>
            <div class="form-group">
                <label>Nueva contraseña</label>
                <input type="password" id="cfgPassNueva" class="form-control" placeholder="Mínimo 6 caracteres">
            </div>
            <div class="form-group">
                <label>Confirmar contraseña</label>
                <input type="password" id="cfgPassConfirmar" class="form-control" placeholder="Repite la contraseña">
            </div>
            <button class="btn btn-primary" id="savePasswordBtn"><i class="fas fa-shield-alt"></i> Actualizar Contraseña</button>
        </div>

        <div class="config-card" style="margin-top:1rem;">
            <h4><i class="fas fa-palette" style="color:var(--primary);margin-right:0.5rem;"></i>Apariencia</h4>
            <div class="config-toggle-row">
                <div>
                    <div class="config-toggle-label">Tema Oscuro</div>
                    <div class="config-toggle-desc">Cambia entre tema claro y oscuro</div>
                </div>
                <label class="theme-toggle">
                    <input type="checkbox" id="themeToggle" ${isDark ? 'checked' : ''}>
                    <span class="theme-toggle-slider"></span>
                </label>
            </div>
        </div>`;
    },

    renderConfigTaller: (container) => {
        const d = JSON.parse(localStorage.getItem('th_taller') || '{}');
        container.innerHTML = `
        <div class="config-card">
            <h4><i class="fas fa-store" style="color:var(--primary);margin-right:0.5rem;"></i>Información del Taller</h4>
            <div class="form-group">
                <label>Nombre del Taller</label>
                <input type="text" id="tallerNombre" class="form-control" value="${d.nombre||'Taller Hunter'}" placeholder="Nombre del taller">
            </div>
            <div class="form-group">
                <label>Teléfono</label>
                <input type="tel" id="tallerTelefono" class="form-control" value="${d.telefono||''}" placeholder="+1 (809) 000-0000">
            </div>
            <div class="form-group">
                <label>Dirección</label>
                <input type="text" id="tallerDireccion" class="form-control" value="${d.direccion||''}" placeholder="Calle, Ciudad, País">
            </div>
            <div class="form-group">
                <label>Correo de Contacto</label>
                <input type="email" id="tallerEmail" class="form-control" value="${d.email||''}" placeholder="info@taller.com">
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
                <div class="form-group">
                    <label>Hora de Apertura</label>
                    <input type="time" id="tallerApertura" class="form-control" value="${d.apertura||'08:00'}">
                </div>
                <div class="form-group">
                    <label>Hora de Cierre</label>
                    <input type="time" id="tallerCierre" class="form-control" value="${d.cierre||'18:00'}">
                </div>
            </div>
            <button class="btn btn-primary" id="saveTallerBtn"><i class="fas fa-save"></i> Guardar Información</button>
        </div>`;
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
                            <button class="action-btn-icon btn-edit" data-id="${empleado.id}" data-type="empleado" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn-icon btn-delete" data-id="${empleado.id}" data-type="empleado" title="Eliminar">
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
    
    // Mostrar notificación
    showNotification: (message, type = 'info') => {
        const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle';
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${icon}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" aria-label="Cerrar">&times;</button>
        `;
        document.body.appendChild(notification);
        setTimeout(() => { if (notification.parentNode) notification.remove(); }, 5000);
        notification.querySelector('.notification-close').addEventListener('click', () => {
            if (notification.parentNode) notification.remove();
        });
    }
};

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UIManager };
} else {
    window.UIManager = UIManager;
}