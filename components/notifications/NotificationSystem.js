/**
 * 🔔 Sistema de Notificaciones Inteligente
 * Maneja todas las notificaciones del dashboard electoral
 */

class NotificationSystem {
    constructor() {
        this.container = null;
        this.activeNotifications = new Map();
        this.notificationCounter = 0;
        this.isReady = false;
        
        // Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }
    
    initialize() {
        this.container = document.getElementById('notification-system');
        
        // Crear contenedor si no existe
        if (!this.container) {
            this.createContainer();
        }
        
        this.isReady = true;
        console.log('🔔 NotificationSystem inicializado y listo');
    }
    
    createContainer() {
        if (!document.body) {
            console.warn('🔔 document.body no está disponible aún, reintentando...');
            setTimeout(() => this.createContainer(), 100);
            return;
        }
        
        this.container = document.createElement('div');
        this.container.id = 'notification-system';
        this.container.className = 'notification-system';
        document.body.appendChild(this.container);
    }
    
    /**
     * Mostrar notificación
     * @param {Object} options - Opciones de la notificación
     * @param {string} options.title - Título principal
     * @param {string} options.subtitle - Subtítulo/descripción
     * @param {string} options.type - Tipo: 'loading', 'success', 'warning', 'error', 'info'
     * @param {number} options.duration - Duración en ms (0 = persistente)
     * @param {string} options.id - ID único para identificar la notificación
     * @param {boolean} options.showProgress - Mostrar barra de progreso
     * @returns {string} ID de la notificación
     */
    show(options = {}) {
        // Verificar si el sistema está listo
        if (!this.isReady || !this.container) {
            console.warn('🔔 NotificationSystem no está listo aún, programando notificación...');
            setTimeout(() => this.show(options), 100);
            return null;
        }
        
        const {
            title = 'Notificación',
            subtitle = '',
            type = 'info',
            duration = 0,
            id = null,
            showProgress = false
        } = options;
        
        const notificationId = id || `notification-${++this.notificationCounter}`;
        
        // Si ya existe una notificación con este ID, actualizarla
        if (this.activeNotifications.has(notificationId)) {
            return this.update(notificationId, options);
        }
        
        // Crear elemento de notificación
        const notification = this.createNotificationElement(notificationId, title, subtitle, type, showProgress);
        
        // Agregar al contenedor
        this.container.appendChild(notification);
        
        // Guardar referencia (incluir handle para auto-hide)
        this.activeNotifications.set(notificationId, {
            element: notification,
            type,
            timestamp: Date.now(),
            timeoutHandle: null
        });
        
        // Mostrar con animación
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Auto-ocultar si tiene duración (almacenar handle para poder cancelarlo al actualizar)
        if (duration > 0) {
            const handle = setTimeout(() => {
                this.hide(notificationId);
            }, duration);
            const entry = this.activeNotifications.get(notificationId);
            if (entry) entry.timeoutHandle = handle;
        }
        
        console.log(`🔔 Notificación mostrada: ${title} (${type})`);
        return notificationId;
    }
    
    /**
     * Actualizar notificación existente
     */
    update(id, options = {}) {
        const notification = this.activeNotifications.get(id);
        if (!notification) return null;
        
        const { title, subtitle, type, showProgress, duration } = options;
        const element = notification.element;
        
        // Actualizar tipo si cambió
        if (type && type !== notification.type) {
            element.className = `notification show ${type}`;
            notification.type = type;
        }
        
        // Actualizar contenido
        if (title) {
            const titleEl = element.querySelector('.notification-title');
            titleEl.textContent = title;
        }
        
        if (subtitle) {
            const subtitleEl = element.querySelector('.notification-subtitle');
            subtitleEl.textContent = subtitle;
        }
        
        // Actualizar icono según el tipo
        const iconEl = element.querySelector('.notification-icon');
        this.updateIcon(iconEl, type || notification.type);
        
        // Si se indicó duration, reprogramar auto-hide (cancelando previo si existe)
        if (typeof duration === 'number') {
            if (notification.timeoutHandle) {
                clearTimeout(notification.timeoutHandle);
                notification.timeoutHandle = null;
            }
            if (duration > 0) {
                const handle = setTimeout(() => this.hide(id), duration);
                notification.timeoutHandle = handle;
            }
        }

        console.log(`🔔 Notificación actualizada: ${id}`);
        return id;
    }
    
    /**
     * Ocultar notificación
     */
    hide(id) {
        const notification = this.activeNotifications.get(id);
        if (!notification) return;
        
        const element = notification.element;

        // Cancelar timeout si existiera
        if (notification.timeoutHandle) {
            clearTimeout(notification.timeoutHandle);
            notification.timeoutHandle = null;
        }
        
        // Animación de salida
        element.classList.remove('show');
        element.classList.add('hidden');
        
        // Remover del DOM después de la animación
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
            this.activeNotifications.delete(id);
        }, 400);
        
        console.log(`🔔 Notificación ocultada: ${id}`);
    }
    
    /**
     * Crear elemento HTML de notificación
     */
    createNotificationElement(id, title, subtitle, type, showProgress) {
        const notification = document.createElement('div');
        notification.id = id;
        notification.className = `notification ${type}`;
        
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon ${type}">
                    ${type === 'loading' ? '<div class="spinner"></div>' : ''}
                </div>
                <div class="notification-text">
                    <div class="notification-title">${title}</div>
                    <div class="notification-subtitle">${subtitle}</div>
                </div>
            </div>
            ${showProgress ? '<div class="notification-progress"></div>' : ''}
        `;
        
        return notification;
    }
    
    /**
     * Actualizar icono según el tipo
     */
    updateIcon(iconEl, type) {
        iconEl.className = `notification-icon ${type}`;
        
        if (type === 'loading') {
            iconEl.innerHTML = '<div class="spinner"></div>';
        } else {
            iconEl.innerHTML = '';
        }
    }
    
    /**
     * Ocultar todas las notificaciones
     */
    hideAll() {
        this.activeNotifications.forEach((notification, id) => {
            this.hide(id);
        });
    }
    
    /**
     * Métodos de conveniencia para tipos específicos
     */
    loading(title, subtitle = '', id = null) {
        return this.show({
            title,
            subtitle,
            type: 'loading',
            duration: 0, // Persistente hasta que se actualice
            id
        });
    }
    
    success(title, subtitle = '', duration = 4000, id = null) {
        return this.show({
            title,
            subtitle,
            type: 'success',
            duration,
            id
        });
    }
    
    warning(title, subtitle = '', duration = 6000, id = null) {
        return this.show({
            title,
            subtitle,
            type: 'warning',
            duration,
            id
        });
    }
    
    error(title, subtitle = '', duration = 8000, id = null) {
        return this.show({
            title,
            subtitle,
            type: 'error',
            duration,
            id
        });
    }
    
    info(title, subtitle = '', duration = 5000, id = null) {
        return this.show({
            title,
            subtitle,
            type: 'info',
            duration,
            id
        });
    }
}

// Instancia global - crear cuando el DOM esté listo
let notificationSystemInstance = null;

function initializeNotificationSystem() {
    if (!notificationSystemInstance) {
        notificationSystemInstance = new NotificationSystem();
        window.notifications = notificationSystemInstance;
        console.log('🔔 NotificationSystem cargado y disponible como window.notifications');
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeNotificationSystem);
} else {
    initializeNotificationSystem();
}

// Exportar para uso como módulo
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationSystem;
}
