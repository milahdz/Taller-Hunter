// Script para la página de Taller Hunter - Usa Supabase JS client (UMD)

document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn     = document.querySelector('.mobile-menu-btn');
    const navList           = document.querySelector('.nav-list');
    const backToTopBtn      = document.getElementById('backToTop');
    const trackingForm      = document.getElementById('tracking-form');
    const statusDetails     = document.getElementById('status-details');
    const resultPlaceholder = document.querySelector('.result-placeholder');
    const trackingHelpCheckbox = document.getElementById('show-help');
    const navLinks          = document.querySelectorAll('.nav-list a');
    const sections          = document.querySelectorAll('section');

    // ========== SUPABASE CLIENT ==========
    const sb = window._sbCliente || null;

    // ========== BUSCAR SERVICIO POR ID ==========
    async function buscarServicioPorCodigo(codigo) {
        if (!sb) {
            throw new Error('La conexión con la base de datos no está disponible. Recarga la página.');
        }

        const c = codigo.trim().toUpperCase();

        // Buscar directamente por ID
        const { data, error } = await sb
            .from('registro_servicio_vehiculo')
            .select('*')
            .eq('id', c)
            .maybeSingle();

        if (error && error.code !== 'PGRST116') {
            throw new Error(`Error al consultar: ${error.message}`);
        }

        return data || null;
    }

    // ========== ESTADO DEL SERVICIO ==========
    function mapearEstado(estado) {
        const mapa = {
            'Pendiente':  { label: 'Pendiente de revisión', progress: 15, color: '#d97706' },
            'En Proceso': { label: 'En proceso de reparación', progress: 55, color: '#2563eb' },
            'En proceso': { label: 'En proceso de reparación', progress: 55, color: '#2563eb' },
            'Completado': { label: 'Listo para retirar', progress: 100, color: '#16a34a' },
            'completado': { label: 'Listo para retirar', progress: 100, color: '#16a34a' },
            'Cancelado':  { label: 'Servicio cancelado', progress: 0, color: '#dc2626' },
        };

        return mapa[estado] || {
            label: estado || 'Estado desconocido',
            progress: 30,
            color: '#6b7280'
        };
    }

    function buildTimeline(servicio) {
        // Usar estadoVehiculo (columna nueva) si existe, sino derivar del estado general
        const estadoVehiculo = servicio.estadoVehiculo || servicio.progreso || null;
        const estado         = servicio.estado || 'Pendiente';

        const PASOS = [
            { key: 'recepcion',   title: 'Recepción del vehículo',   desc: 'Vehículo recibido en el taller. Diagnóstico inicial realizado.' },
            { key: 'diagnostico', title: 'Diagnóstico detallado',     desc: `Servicio requerido: ${servicio.tipo_servicio || 'Por determinar'}` },
            { key: 'reparacion',  title: 'Reparación / Servicio',     desc: servicio.notas || 'En proceso de atención.' },
            { key: 'calidad',     title: 'Control de calidad',         desc: 'Verificación final de todos los sistemas.' },
            { key: 'entrega',     title: 'Entrega al cliente',         desc: 'Limpieza final y preparación para entrega.' }
        ];

        // Índice del paso actual
        let pasoActualIdx = -1;
        if (estadoVehiculo) {
            pasoActualIdx = PASOS.findIndex(p => p.key === estadoVehiculo);
        } else {
            // Derivar índice desde el estado general
            if (estado === 'Completado' || estado === 'completado') pasoActualIdx = 4;
            else if (estado === 'En Proceso' || estado === 'En proceso') pasoActualIdx = 1;
            else pasoActualIdx = 0; // Pendiente = recepción
        }

        return PASOS.map((paso, i) => ({
            title:       paso.title,
            description: paso.desc,
            done:        i <= pasoActualIdx,
            active:      i === pasoActualIdx,
            date:        i === 0 ? servicio.fecha : null
        }));
    }

    function formatDate(dateString) {
        if (!dateString) return 'Por confirmar';

        try {
            return new Date(dateString + 'T12:00:00').toLocaleDateString(
                'es-ES',
                {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }
            );
        } catch (e) {
            return dateString;
        }
    }

    // ========== DISPLAY ==========
    function showLoading() {
        resultPlaceholder.innerHTML = `
            <div style="text-align:center;padding:2rem;">
                <i class="fas fa-spinner fa-spin"
                   style="font-size:2rem;color:var(--secondary);margin-bottom:1rem;display:block;">
                </i>
                <p>Consultando estado del servicio...</p>
            </div>
        `;

        resultPlaceholder.style.display = 'block';
        statusDetails.style.display = 'none';
    }

    function showVehicleStatus(servicio) {
        resultPlaceholder.style.display = 'none';
        statusDetails.style.display = 'block';

        // estadoVehiculo tiene prioridad sobre el estado general
        const estadoVehiculo = servicio.estadoVehiculo || servicio.progreso || null;
        const estadoInfo     = mapearEstado(servicio.estado);
        const steps          = buildTimeline(servicio);

        const vehiculoDesc = [
            servicio.modelo,
            servicio.placa
        ].filter(Boolean).join(' — ') || 'N/A';

        const stepsHTML = steps.map(step => `
            <div class="status-step">
                <div class="step-icon ${step.done ? 'active' : ''} ${step.active ? 'current' : ''}">
                    <i class="fas fa-${step.done ? 'check' : step.active ? 'spinner fa-spin' : 'clock'}"></i>
                </div>

                <div class="step-content">
                    <h4>${step.title}</h4>
                    <p>${step.description}</p>

                    ${step.date
                        ? `<small>${formatDate(step.date)}</small>`
                        : ''
                    }
                </div>
            </div>
        `).join('');

        // Etiqueta del paso actual de estadoVehiculo
        const pasoLabels = {
            recepcion:   'Recepción del vehículo',
            diagnostico: 'Diagnóstico detallado',
            reparacion:  'Reparación / Servicio',
            calidad:     'Control de calidad',
            entrega:     'Entrega al cliente'
        };
        const pasoActualLabel = estadoVehiculo ? (pasoLabels[estadoVehiculo] || estadoVehiculo) : null;

        statusDetails.innerHTML = `
            <div class="vehicle-info">
                <h4>Información del Servicio</h4>

                <p>
                    <strong>Código:</strong>
                    <span style="
                        font-family:monospace;
                        background:#f1f5f9;
                        padding:2px 8px;
                        border-radius:4px;
                    ">
                        ${servicio.codigo_seguimiento || servicio.id}
                    </span>
                </p>

                <p><strong>Vehículo:</strong> ${vehiculoDesc}</p>

                <p>
                    <strong>Propietario:</strong>
                    ${servicio.propietario || 'N/A'}
                </p>

                <p>
                    <strong>Servicio:</strong>
                    ${servicio.tipo_servicio || 'Por determinar'}
                </p>

                <p>
                    <strong>Fecha de ingreso:</strong>
                    ${formatDate(servicio.fecha)}
                </p>

                <p>
                    <strong>Técnico asignado:</strong>
                    ${servicio.empleado || 'Por asignar'}
                </p>

                <p>
                    <strong>Estado:</strong>
                    <span class="status-badge"
                          style="background:${estadoInfo.color}">
                        ${estadoInfo.label}
                    </span>
                </p>

                ${pasoActualLabel ? `
                <p>
                    <strong>Etapa actual:</strong>
                    <span style="font-weight:600;color:#0369a1;">${pasoActualLabel}</span>
                </p>` : ''}

                <p><strong>Progreso:</strong></p>

                <div class="progress-bar">
                    <div class="progress-fill"
                         style="
                            width:${estadoInfo.progress}%;
                            background:${estadoInfo.color}
                         ">
                    </div>
                </div>

                ${(servicio.observaciones || servicio.notas)
                    ? `<p><strong>Observaciones:</strong> ${servicio.observaciones || servicio.notas}</p>`
                    : ''
                }
            </div>

            <div class="status-timeline">
                <h4>Progreso de Reparación</h4>
                ${stepsHTML}
            </div>
        `;

        if (!document.getElementById('status-styles')) {
            const style = document.createElement('style');

            style.id = 'status-styles';

            style.textContent = `
                .vehicle-info {
                    background:#f8fafc;
                    padding:1.5rem;
                    border-radius:8px;
                    margin-bottom:2rem;
                    border:1px solid #e2e8f0;
                }

                .status-badge {
                    display:inline-block;
                    color:#fff;
                    padding:4px 12px;
                    border-radius:20px;
                    font-size:0.9rem;
                    font-weight:500;
                }

                .progress-bar {
                    height:10px;
                    background:#e2e8f0;
                    border-radius:5px;
                    margin:8px 0 16px;
                    overflow:hidden;
                }

                .progress-fill {
                    height:100%;
                    border-radius:5px;
                    transition:width 0.6s ease;
                }

                .status-timeline {
                    margin-top:1.5rem;
                }

                .step-icon.current {
                    border-color: #2563eb;
                    background: #dbeafe;
                    color: #1d4ed8;
                }
            `;

            document.head.appendChild(style);
        }
    }

    function showNotFound(codigo) {
        resultPlaceholder.innerHTML = `
            <i class="fas fa-exclamation-triangle"
               style="
                    color:#d97706;
                    font-size:2rem;
                    margin-bottom:1rem;
                    display:block;
                    text-align:center;
               ">
            </i>

            <h4 style="text-align:center;">
                Código no encontrado
            </h4>

            <p style="text-align:center;">
                El código <strong>${codigo}</strong> no está registrado.
            </p>

            <p style="text-align:center;">
                Verifica el código e intenta nuevamente,
                o contáctanos.
            </p>
        `;

        resultPlaceholder.style.display = 'block';
        statusDetails.style.display = 'none';
    }

    function showError(msg) {
        resultPlaceholder.innerHTML = `
            <i class="fas fa-exclamation-circle"
               style="
                    color:#dc2626;
                    font-size:2rem;
                    margin-bottom:1rem;
                    display:block;
                    text-align:center;
               ">
            </i>

            <h4 style="text-align:center;">
                Error de conexión
            </h4>

            <p style="text-align:center;">
                ${msg}
            </p>

            <p style="
                text-align:center;
                font-size:0.85rem;
                color:#6b7280;
            ">
                Verifica tu conexión a internet y recarga la página.
            </p>
        `;

        resultPlaceholder.style.display = 'block';
        statusDetails.style.display = 'none';
    }

    // ========== FORMULARIO ==========
    async function handleTrackingForm(event) {
        event.preventDefault();

        const trackingCode = document
            .getElementById('tracking-code')
            .value
            .trim();

        if (!trackingCode) {
            alert('Por favor, ingresa un código de seguimiento.');
            return;
        }

        showLoading();

        try {
            const servicio = await buscarServicioPorCodigo(trackingCode);

            if (servicio) {
                showVehicleStatus(servicio);
            } else {
                showNotFound(trackingCode.toUpperCase());
            }

        } catch (err) {
            console.error('Error consultando servicio:', err);

            showError(
                err.message ||
                'No se pudo consultar el estado en este momento.'
            );
        }
    }

    // ========== SERVICIOS DINÁMICOS ==========
    async function cargarServiciosDinamicos() {
        if (!sb) return;

        try {
            const { data, error } = await sb
                .from('tipos_servicio')
                .select(`
                    id,
                    nombre,
                    descripcion,
                    precio_base,
                    categoria,
                    duracion,
                    estado
                `)
                .ilike('estado', 'activo')
                .order('nombre', { ascending: true });

            if (error || !data || data.length === 0) return;

            const grid = document.querySelector('.services-grid');

            if (!grid) return;

            const iconMap = {
                'preventivo': 'fas fa-oil-can',
                'correctivo': 'fas fa-tools'
            };

            const getIcon = cat =>
                iconMap[(cat || '').toLowerCase()] ||
                'fas fa-wrench';

            const fmtPrecio = p =>
                p
                    ? new Intl.NumberFormat('es-DO', {
                        style: 'currency',
                        currency: 'DOP',
                        minimumFractionDigits: 0
                    }).format(p)
                    : null;

            grid.innerHTML = data.map(s => `
                <div class="service-card">
                    <div class="service-icon">
                        <i class="${getIcon(s.categoria)}"></i>
                    </div>

                    <h3>${s.nombre}</h3>

                    <p>
                        ${s.descripcion ||
                        'Servicio especializado con técnicos certificados.'}
                    </p>

                    ${s.precio_base
                        ? `
                            <p class="service-price">
                                <strong>${fmtPrecio(s.precio_base)}</strong>
                                ${s.duracion
                                    ? ` &bull; ${s.duracion}`
                                    : ''
                                }
                            </p>
                        `
                        : ''
                    }
                </div>
            `).join('');

        } catch (e) {
            console.warn(
                'No se pudieron cargar servicios dinámicos:',
                e
            );
        }
    }

    cargarServiciosDinamicos();

    // ========== MENÚ ==========
    function toggleMobileMenu() {
        navList.classList.toggle('active');

        const icon = mobileMenuBtn.querySelector('i');

        if (icon) {
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        }
    }

    function closeMobileMenu() {
        navList.classList.remove('active');

        const icon = mobileMenuBtn.querySelector('i');

        if (icon) {
            icon.classList.add('fa-bars');
            icon.classList.remove('fa-times');
        }
    }

    function handleScroll() {
        if (backToTopBtn) {
            backToTopBtn.classList.toggle(
                'visible',
                window.scrollY > 300
            );
        }

        let currentSection = '';

        sections.forEach(section => {
            const top = section.offsetTop - 100;

            if (
                window.scrollY >= top &&
                window.scrollY < top + section.clientHeight
            ) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');

            if (
                link.getAttribute('href') === `#${currentSection}`
            ) {
                link.classList.add('active');
            }
        });
    }

    // ========== EVENTOS ==========
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener(
            'click',
            toggleMobileMenu
        );
    }

    navLinks.forEach(link =>
        link.addEventListener('click', closeMobileMenu)
    );

    window.addEventListener('scroll', handleScroll);

    if (trackingForm) {
        trackingForm.addEventListener(
            'submit',
            handleTrackingForm
        );
    }

    if (trackingHelpCheckbox) {
        trackingHelpCheckbox.addEventListener(
            'change',
            function() {
                const helpContent =
                    document.querySelector('.help-content');

                if (helpContent) {
                    helpContent.style.maxHeight =
                        this.checked
                            ? helpContent.scrollHeight + 'px'
                            : '0';
                }
            }
        );
    }

    handleScroll();

    // ========== EFECTO HERO ==========
    const heroTitle = document.querySelector('.hero h2');

    if (heroTitle) {
        const originalText = heroTitle.textContent;

        heroTitle.textContent = '';

        let i = 0;

        function typeWriter() {
            if (i < originalText.length) {
                heroTitle.textContent +=
                    originalText.charAt(i++);

                setTimeout(typeWriter, 45);
            }
        }

        setTimeout(typeWriter, 400);
    }
});