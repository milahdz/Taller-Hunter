// Funciones relacionadas con calendario y vistas de tiempo
const CalendarManager = {
    // Configurar vista semanal
    setupWeekView: (container, services) => {
        container.innerHTML = '';
        
        const today = new Date();
        
        // Generar los próximos 7 días
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(today.getDate() + i);
            
            const dayNames = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];
            const dayName = dayNames[date.getDay()];
            const dayNumber = date.getDate();
            
            // Filtrar servicios para este día
            const dayServices = services.filter(service => {
                const serviceDate = new Date(service.date);
                return serviceDate.getDate() === date.getDate() && 
                       serviceDate.getMonth() === date.getMonth() && 
                       serviceDate.getFullYear() === date.getFullYear();
            });
            
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            
            if (dayServices.length === 0) {
                dayEl.innerHTML = `
                    <div class="day-header">
                        <div class="day-name">${dayName}</div>
                        <div class="day-number">${dayNumber}</div>
                    </div>
                    <div class="no-schedule">Sin agenda</div>
                `;
            } else {
                let servicesHTML = '';
                dayServices.forEach(service => {
                    servicesHTML += `
                        <div class="service-card" style="margin: 0.5rem 0; padding: 0.75rem; font-size: 0.875rem;">
                            <div class="service-id" style="font-size: 1rem;">${service.id}</div>
                            <div class="service-vehicle">${service.vehicle}</div>
                            <div>${service.owner}</div>
                            <div><strong>Empleado:</strong> ${service.employee}</div>
                            <div class="detail-label">${DataUtils.formatTime(service.time)}</div>
                        </div>
                    `;
                });
                
                dayEl.innerHTML = `
                    <div class="day-header">
                        <div class="day-name">${dayName}</div>
                        <div class="day-number">${dayNumber}</div>
                    </div>
                    ${servicesHTML}
                `;
            }
            
            container.appendChild(dayEl);
        }
    },
    
    // Configurar vista de calendario mensual
    setupCalendarView: (container, services) => {
        container.innerHTML = '';
        
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        
        const dayNames = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'];
        
        // Crear encabezados de días
        dayNames.forEach(dayName => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day';
            dayHeader.style.minHeight = 'auto';
            dayHeader.style.padding = '0.5rem';
            dayHeader.style.fontWeight = '600';
            dayHeader.style.backgroundColor = 'var(--gray-100)';
            dayHeader.textContent = dayName;
            container.appendChild(dayHeader);
        });
        
        // Espacios en blanco para días anteriores al primer día
        const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
        for (let i = 0; i < firstDayOfWeek; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day';
            emptyDay.style.backgroundColor = 'transparent';
            container.appendChild(emptyDay);
        }
        
        // Crear días del mes
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(currentYear, currentMonth, day);
            const dayOfWeek = date.getDay();
            const dayName = dayNames[dayOfWeek === 0 ? 6 : dayOfWeek - 1];
            
            // Filtrar servicios para este día
            const dayServices = services.filter(service => {
                const serviceDate = new Date(service.date);
                return serviceDate.getDate() === day && 
                       serviceDate.getMonth() === currentMonth && 
                       serviceDate.getFullYear() === currentYear;
            });
            
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            
            if (dayServices.length === 0) {
                dayEl.innerHTML = `
                    <div class="day-header">
                        <div class="day-name">${dayName}</div>
                        <div class="day-number">${day}</div>
                    </div>
                    <div class="no-schedule">Sin agenda</div>
                `;
            } else {
                let servicesHTML = '';
                dayServices.forEach(service => {
                    let statusDot = '';
                    switch(service.status) {
                        case 'pending': statusDot = '🔴'; break;
                        case 'process': statusDot = '🟡'; break;
                        case 'completed': statusDot = '🟢'; break;
                    }
                    
                    servicesHTML += `
                        <div class="service-card" style="margin: 0.25rem 0; padding: 0.5rem; font-size: 0.75rem;">
                            <div>${statusDot} ${service.id}</div>
                            <div style="font-weight: 600;">${service.vehicle}</div>
                            <div>${service.owner}</div>
                            <div><small>${service.employee}</small></div>
                            <div>${DataUtils.formatTime(service.time)}</div>
                        </div>
                    `;
                });
                
                dayEl.innerHTML = `
                    <div class="day-header">
                        <div class="day-name">${dayName}</div>
                        <div class="day-number">${day}</div>
                    </div>
                    ${servicesHTML}
                `;
            }
            
            // Destacar el día actual
            if (day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
                dayEl.style.border = '2px solid var(--primary)';
            }
            
            container.appendChild(dayEl);
        }
    },
    
    // Obtener rango de fechas para reportes
    getDateRange: (rangeType) => {
        const today = new Date();
        let startDate, endDate;
        
        switch(rangeType) {
            case 'diario':
                startDate = new Date(today);
                endDate = new Date(today);
                break;
            case 'semanal':
                startDate = new Date(today);
                startDate.setDate(today.getDate() - today.getDay());
                endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + 6);
                break;
            case 'mensual':
                startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                break;
            default:
                startDate = new Date(today);
                endDate = new Date(today);
        }
        
        return { startDate, endDate };
    },
    
    // Generar reporte de servicios por fecha
    generateDateReport: (services, startDate, endDate) => {
        return services.filter(service => {
            const serviceDate = new Date(service.date);
            return serviceDate >= startDate && serviceDate <= endDate;
        });
    }
};// calendar.js (al final)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CalendarManager };
} else {
    window.CalendarManager = CalendarManager;
}