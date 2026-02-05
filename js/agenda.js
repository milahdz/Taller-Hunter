// agendar.js - VERSIÓN SIMPLIFICADA Y CORREGIDA
console.log('📄 Cargando agendar.js...');

const AgendaManager = {
    // Inicializar
    init: function() {
        console.log('🚗 Inicializando AgendaManager...');
        
        // Verificar elementos críticos
        this.verificarElementos();
        this.setupEventListeners();
    },
    
    // Verificar que todos los elementos existen
    verificarElementos: function() {
        const elementosCriticos = [
            'addVehicleBtn',
            'scheduleModal',
            'scheduleForm',
            'saveScheduleBtn',
            'cancelBtn',
            'closeModal',
            'vehiculo_nuevo',
            'cliente_nuevo',
            'fecha',
            'servicio',
            'empleado',
            'telefono',
            'notas'
        ];
        
        console.log('🔍 Verificando elementos:');
        elementosCriticos.forEach(id => {
            const elemento = document.getElementById(id);
            console.log(`- ${id}:`, elemento ? '✅' : '❌ NO ENCONTRADO');
        });
    },
    
    // Configurar eventos
    setupEventListeners: function() {
        console.log('🔗 Configurando event listeners...');
        
        // 1. Botón "Agendar Vehículo"
        const addVehicleBtn = document.getElementById('addVehicleBtn');
        if (addVehicleBtn) {
            addVehicleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🎯 Click en "Agendar Vehículo"');
                this.abrirModal();
            });
        }
        
        // 2. Botón "Guardar"
        const saveBtn = document.getElementById('saveScheduleBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('💾 Click en "Guardar"');
                this.guardarAgendamiento();
            });
        }
        
        // 3. Botón "Cancelar"
        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('❌ Click en "Cancelar"');
                this.cerrarModal();
            });
        }
        
        // 4. Botón "Cerrar" (X)
        const closeBtn = document.getElementById('closeModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('❌ Click en "Cerrar" (X)');
                this.cerrarModal();
            });
        }
        
        // 5. Cerrar modal al hacer clic fuera
        const modal = document.getElementById('scheduleModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    console.log('👆 Click fuera del modal');
                    this.cerrarModal();
                }
            });
        }
        
        console.log('✅ Event listeners configurados');
    },
    
    // Abrir modal (SIMPLIFICADO)
    abrirModal: function() {
        console.log('🔓 Abriendo modal...');
        
        const modal = document.getElementById('scheduleModal');
        if (!modal) {
            console.error('❌ ERROR: Modal no encontrado');
            alert('Error: No se puede abrir el formulario');
            return;
        }
        
        // Mostrar modal
        modal.style.display = 'flex';
        
        // Configurar fecha por defecto (mañana)
        const fechaInput = document.getElementById('fecha');
        if (fechaInput) {
            const hoy = new Date();
            const manana = new Date(hoy);
            manana.setDate(manana.getDate() + 1);
            
            fechaInput.min = hoy.toISOString().split('T')[0];
            fechaInput.value = manana.toISOString().split('T')[0];
            console.log('📅 Fecha configurada:', fechaInput.value);
        }
        
        // Limpiar formulario
        const form = document.getElementById('scheduleForm');
        if (form) {
            form.reset();
            console.log('🧹 Formulario limpiado');
        }
        
        console.log('✅ Modal abierto y listo');
    },
    
    // Validar formulario
    validarFormulario: function() {
        console.log('✓ Validando formulario...');
        
        const campos = [
            { id: 'vehiculo_nuevo', nombre: 'Vehículo' },
            { id: 'cliente_nuevo', nombre: 'Cliente' },
            { id: 'fecha', nombre: 'Fecha' },
            { id: 'servicio', nombre: 'Servicio' },
            { id: 'empleado', nombre: 'Empleado' }
        ];
        
        for (const campo of campos) {
            const elemento = document.getElementById(campo.id);
            if (!elemento) {
                console.error(`❌ Elemento ${campo.id} no encontrado`);
                alert(`Error: Campo ${campo.nombre} no disponible`);
                return false;
            }
            
            if (!elemento.value.trim()) {
                elemento.focus();
                elemento.style.borderColor = '#dc3545';
                alert(`❌ Por favor, completa el campo: ${campo.nombre}`);
                return false;
            } else {
                elemento.style.borderColor = '';
            }
        }
        
        console.log('✅ Formulario válido');
        return true;
    },
    
    // Guardar agendamiento
    async guardarAgendamiento() {
        console.log('💾 Iniciando guardado...');
        
        // 1. Validar
        if (!this.validarFormulario()) {
            console.log('❌ Validación fallida');
            return;
        }
        
        // 2. Obtener datos del formulario
        const datos = {
            id: `REG_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
            vehiculo_id: '1', // Temporal - usar el primer vehículo
            cliente_id: `CLI_${Date.now()}`, // Temporal - crear nuevo cliente
            tipo_servicio_id: `SVC_${Date.now()}`, // Temporal - crear nuevo servicio
            empleado_id: document.getElementById('empleado').value.trim(),
            fecha: document.getElementById('fecha').value,
            hora: '08:00',
            telefono: document.getElementById('telefono').value.trim() || '',
            notas: document.getElementById('notas').value.trim() || '',
            estado: 'pending'
        };
        
        console.log('📤 Datos preparados:', datos);
        
        // 3. Deshabilitar botón de guardar
        const saveBtn = document.getElementById('saveScheduleBtn');
        if (!saveBtn) {
            console.error('❌ Botón Guardar no encontrado');
            return;
        }
        
        const originalText = saveBtn.innerHTML;
        const originalDisabled = saveBtn.disabled;
        
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        saveBtn.disabled = true;
        
        try {
            // 4. Verificar que supabase esté disponible
            if (!window.supabase) {
                throw new Error('Supabase no está disponible. Recarga la página.');
            }
            
            console.log('📡 Conectando con Supabase...');
            
            // 5. Guardar en la base de datos
            const { data, error } = await supabase
                .from('registro_servicio_vehiculo')
                .insert([datos])
                .select()
                .single();
            
            if (error) {
                console.error('❌ Error de Supabase:', error);
                throw error;
            }
            
            console.log('✅ Registro guardado exitosamente:', data);
            
            // 6. Mostrar mensaje de éxito
            this.mostrarMensaje('✅ ¡Vehículo agendado exitosamente!', 'success');
            
            // 7. Cerrar modal
            this.cerrarModal();
            
            // 8. Recargar la página después de 1.5 segundos
            setTimeout(() => {
                console.log('🔄 Recargando página...');
                window.location.reload();
            }, 1500);
            
        } catch (error) {
            console.error('❌ Error al guardar:', error);
            
            // Mostrar mensaje de error específico
            let mensaje = 'Error al guardar el agendamiento';
            
            if (error.message.includes('null value in column "id"')) {
                mensaje = 'Error: No se pudo generar un ID único. Intenta nuevamente.';
            } else if (error.message.includes('duplicate key')) {
                mensaje = 'Error: Este registro ya existe. Intenta con datos diferentes.';
            } else if (error.message.includes('network')) {
                mensaje = 'Error de conexión. Verifica tu internet.';
            }
            
            this.mostrarMensaje(`❌ ${mensaje}\n\nDetalle: ${error.message}`, 'error');
            
        } finally {
            // 9. Restaurar botón
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = originalDisabled;
        }
    },
    
    // Cerrar modal
    cerrarModal: function() {
        console.log('🔒 Cerrando modal...');
        
        const modal = document.getElementById('scheduleModal');
        if (modal) {
            modal.style.display = 'none';
            console.log('✅ Modal cerrado');
        }
    },
    
    // Mostrar mensaje (toast/alert)
    mostrarMensaje: function(mensaje, tipo = 'info') {
        console.log(`💬 Mensaje (${tipo}):`, mensaje);
        
        if (tipo === 'error') {
            alert(mensaje);
        } else {
            // Crear toast de éxito
            const toast = document.createElement('div');
            toast.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #10b981;
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 9999;
                animation: slideIn 0.3s ease;
                display: flex;
                align-items: center;
                gap: 10px;
                max-width: 400px;
            `;
            
            toast.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <span>${mensaje}</span>
            `;
            
            document.body.appendChild(toast);
            
            // Remover después de 3 segundos
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.style.animation = 'slideOut 0.3s ease';
                    setTimeout(() => toast.remove(), 300);
                }
            }, 3000);
            
            // Agregar animaciones si no existen
            if (!document.querySelector('#toast-animations')) {
                const style = document.createElement('style');
                style.id = 'toast-animations';
                style.textContent = `
                    @keyframes slideIn {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                    @keyframes slideOut {
                        from { transform: translateX(0); opacity: 1; }
                        to { transform: translateX(100%); opacity: 0; }
                    }
                `;
                document.head.appendChild(style);
            }
        }
    }
};

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📄 DOM completamente cargado');
        AgendaManager.init();
    });
} else {
    console.log('📄 DOM ya está listo');
    AgendaManager.init();
}

// Hacer disponible globalmente
window.AgendaManager = AgendaManager;

console.log('✅ agendar.js completamente cargado');