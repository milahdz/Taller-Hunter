// Script para la página de Taller Hunter

document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navList = document.querySelector('.nav-list');
    const backToTopBtn = document.getElementById('backToTop');
    const trackingForm = document.getElementById('tracking-form');
    const statusResult = document.getElementById('status-result');
    const statusDetails = document.getElementById('status-details');
    const resultPlaceholder = document.querySelector('.result-placeholder');
    const trackingHelpCheckbox = document.getElementById('show-help');
    const navLinks = document.querySelectorAll('.nav-list a');
    const sections = document.querySelectorAll('section');
    
    // Datos de ejemplo para el estado del vehículo
    const vehicleStatusData = {
        'ETHUNTER2021': {
            vehicle: 'Toyota Corolla 2020',
            plate: 'ABC-1234',
            status: 'En reparación',
            progress: 60,
            steps: [
                {id: 1, title: 'Recepción del vehículo', description: 'Vehículo recibido y diagnóstico inicial realizado', completed: true, date: '2024-03-10'},
                {id: 2, title: 'Diagnóstico detallado', description: 'Análisis completo de sistemas del vehículo', completed: true, date: '2024-03-11'},
                {id: 3, title: 'Reparación de suspensión', description: 'Reemplazo de amortiguadores y brazos de control', completed: true, date: '2024-03-12'},
                {id: 4, title: 'Alineación y balanceo', description: 'Alineación de dirección y balanceo de ruedas', completed: false, date: '2024-03-13'},
                {id: 5, title: 'Prueba de calidad', description: 'Verificación final de todos los sistemas', completed: false, date: '2024-03-14'},
                {id: 6, title: 'Entrega al cliente', description: 'Limpieza final y preparación para entrega', completed: false, date: '2024-03-15'}
            ],
            estimatedCompletion: '2024-03-15'
        }
    };
    
    // Funciones de utilidad
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    }
    
    // Menú móvil
    function toggleMobileMenu() {
        navList.classList.toggle('active');
        mobileMenuBtn.querySelector('i').classList.toggle('fa-bars');
        mobileMenuBtn.querySelector('i').classList.toggle('fa-times');
    }
    
    // Cerrar menú móvil al hacer clic en un enlace
    function closeMobileMenu() {
        navList.classList.remove('active');
        mobileMenuBtn.querySelector('i').classList.add('fa-bars');
        mobileMenuBtn.querySelector('i').classList.remove('fa-times');
    }
    
    // Mostrar/ocultar botón "Volver arriba"
    function handleScroll() {
        // Botón "Volver arriba"
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
        
        // Resaltar enlace activo en navegación
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }
    
    // Procesar formulario de seguimiento
    function handleTrackingForm(event) {
        event.preventDefault();
        
        const trackingCode = document.getElementById('tracking-code').value.trim().toUpperCase();
        
        if (!trackingCode) {
            alert('Por favor, ingresa un código de seguimiento.');
            return;
        }
        
        // Simular consulta a servidor
        setTimeout(() => {
            showVehicleStatus(trackingCode);
        }, 800);
    }
    
    // Mostrar estado del vehículo
    function showVehicleStatus(trackingCode) {
        const statusData = vehicleStatusData[trackingCode];
        
        if (!statusData) {
            // Código no encontrado
            resultPlaceholder.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i>
                <h4>Código no encontrado</h4>
                <p>El código "${trackingCode}" no está registrado en nuestro sistema.</p>
                <p>Por favor, verifica el código e intenta nuevamente.</p>
            `;
            resultPlaceholder.style.display = 'block';
            statusDetails.style.display = 'none';
            return;
        }
        
        // Ocultar placeholder y mostrar detalles
        resultPlaceholder.style.display = 'none';
        statusDetails.style.display = 'block';
        
        // Generar HTML para los pasos del estado
        let stepsHTML = '';
        statusData.steps.forEach(step => {
            stepsHTML += `
                <div class="status-step">
                    <div class="step-icon ${step.completed ? 'active' : ''}">
                        <i class="fas fa-${step.completed ? 'check' : 'clock'}"></i>
                    </div>
                    <div class="step-content">
                        <h4>${step.title}</h4>
                        <p>${step.description}</p>
                        <small>${formatDate(step.date)}</small>
                    </div>
                </div>
            `;
        });
        
        // Mostrar información del vehículo
        statusDetails.innerHTML = `
            <div class="vehicle-info">
                <h4>Información del Vehículo</h4>
                <p><strong>Vehículo:</strong> ${statusData.vehicle}</p>
                <p><strong>Placa:</strong> ${statusData.plate}</p>
                <p><strong>Estado:</strong> <span class="status-badge">${statusData.status}</span></p>
                <p><strong>Progreso:</strong></p>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${statusData.progress}%"></div>
                </div>
                <p><strong>Entrega estimada:</strong> ${formatDate(statusData.estimatedCompletion)}</p>
            </div>
            <div class="status-timeline">
                <h4>Progreso de Reparación</h4>
                ${stepsHTML}
            </div>
        `;
        
        // Añadir estilos para la barra de progreso
        const style = document.createElement('style');
        style.textContent = `
            .vehicle-info {
                background-color: var(--light-gray);
                padding: 1.5rem;
                border-radius: var(--border-radius);
                margin-bottom: 2rem;
            }
            
            .status-badge {
                display: inline-block;
                background-color: var(--accent);
                color: white;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 0.9rem;
                font-weight: 500;
            }
            
            .progress-bar {
                height: 10px;
                background-color: #e0e0e0;
                border-radius: 5px;
                margin: 10px 0;
                overflow: hidden;
            }
            
            .progress-fill {
                height: 100%;
                background-color: var(--secondary);
                border-radius: 5px;
                transition: width 0.5s ease;
            }
            
            .status-timeline {
                margin-top: 2rem;
            }
        `;
        
        // Remover estilos anteriores si existen
        const existingStyles = document.querySelectorAll('#status-styles');
        existingStyles.forEach(style => style.remove());
        
        // Asignar id para poder removerlos después
        style.id = 'status-styles';
        document.head.appendChild(style);
    }
    
    // Inicializar eventos
    function initEvents() {
        // Menú móvil
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
        
        // Cerrar menú móvil al hacer clic en un enlace
        navLinks.forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });
        
        // Scroll
        window.addEventListener('scroll', handleScroll);
        
        // Formulario de seguimiento
        trackingForm.addEventListener('submit', handleTrackingForm);
        
        // Ayuda de seguimiento (acordeón)
        trackingHelpCheckbox.addEventListener('change', function() {
            const helpContent = document.querySelector('.help-content');
            if (this.checked) {
                helpContent.style.maxHeight = helpContent.scrollHeight + 'px';
            } else {
                helpContent.style.maxHeight = '0';
            }
        });
        
        // Simular clic en el checkbox para inicializar el acordeón
        document.querySelector('.tracking-help label').addEventListener('click', function(e) {
            // Dejar que el checkbox maneje el cambio
            setTimeout(() => {
                const helpContent = document.querySelector('.help-content');
                if (trackingHelpCheckbox.checked) {
                    helpContent.style.maxHeight = helpContent.scrollHeight + 'px';
                }
            }, 10);
        });
    }
    
    // Inicializar la página
    function initPage() {
        // Inicializar eventos
        initEvents();
        
        // Inicializar estado del scroll
        handleScroll();
        
        // Añadir datos de ejemplo para códigos válidos
        const exampleCode = document.getElementById('tracking-code');
        exampleCode.addEventListener('click', function() {
            if (!this.value) {
                this.value = 'ETHUNTER2021';
            }
        });
        
        // Añadir efecto de escritura en el título del hero
        const heroTitle = document.querySelector('.hero h2');
        const originalText = heroTitle.textContent;
        heroTitle.textContent = '';
        
        let i = 0;
        function typeWriter() {
            if (i < originalText.length) {
                heroTitle.textContent += originalText.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            }
        }
        
        // Iniciar efecto de escritura después de un breve retraso
        setTimeout(typeWriter, 500);
    }
    
    // Inicializar la página cuando el DOM esté listo
    initPage();
});