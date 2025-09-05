// AuthManager.js - Sistema de gestión de autenticación
class AuthManager {
  constructor() {
    this.isAuthenticated = false;
    this.sessionTimeout = 30 * 60 * 1000; // 30 minutos en milisegundos
    this.warningTimeout = 5 * 60 * 1000; // Advertir 5 minutos antes
    this.timeoutId = null;
    this.warningId = null;
    this.lastActivity = Date.now();
    this.sessionKey = 'tablero_electoral_session';
    
    // Bind methods
    this.handleActivity = this.handleActivity.bind(this);
    this.logout = this.logout.bind(this);
    
    this.init();
  }
  
  init() {
    // Verificar si hay una sesión existente
    this.checkExistingSession();
    
    // Configurar listeners de actividad
    this.setupActivityListeners();
    
    // Iniciar timer de sesión si está autenticado
    if (this.isAuthenticated) {
      this.startSessionTimer();
    }
  }
  
  checkExistingSession() {
    const session = localStorage.getItem(this.sessionKey);
    if (session) {
      try {
        const sessionData = JSON.parse(session);
        const now = Date.now();
        
        // Verificar si la sesión no ha expirado
        if (sessionData.expiry > now) {
          this.isAuthenticated = true;
          this.lastActivity = now;
          console.log('[AUTH] Sesión válida encontrada');
          return true;
        } else {
          // Sesión expirada
          this.clearSession();
          console.log('[AUTH] Sesión expirada');
        }
      } catch (error) {
        console.error('[AUTH] Error al verificar sesión:', error);
        this.clearSession();
      }
    }
    return false;
  }
  
  login(username, password) {
    // Credenciales de ejemplo - en producción esto vendría de un backend
    const validCredentials = [
      { username: 'admin', password: 'admin123' },
      { username: 'usuario', password: 'usuario123' },
      { username: 'prueba', password: 'prueba' }
    ];
    
    const isValid = validCredentials.some(cred => 
      cred.username === username && cred.password === password
    );
    
    if (isValid) {
      this.isAuthenticated = true;
      this.lastActivity = Date.now();
      
      // Guardar sesión en localStorage
      const sessionData = {
        username: username,
        loginTime: Date.now(),
        expiry: Date.now() + this.sessionTimeout
      };
      
      localStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
      
      // Iniciar timer de sesión
      this.startSessionTimer();
      
      // Mostrar notificación de bienvenida
      if (window.notifications) {
        window.notifications.success(
          'Bienvenido',
          `Sesión iniciada como ${username}`,
          3000
        );
      }
      
      console.log('[AUTH] Login exitoso:', username);
      return true;
    }
    
    console.log('[AUTH] Credenciales inválidas');
    return false;
  }
  
  logout(reason = 'manual') {
    this.isAuthenticated = false;
    this.clearSession();
    this.clearTimers();
    
    // Mostrar mensaje según la razón
    if (window.notifications) {
      if (reason === 'timeout') {
        window.notifications.warning(
          'Sesión expirada',
          'Tu sesión ha expirado por inactividad',
          5000
        );
      } else if (reason === 'manual') {
        window.notifications.info(
          'Sesión cerrada',
          'Has cerrado sesión exitosamente',
          3000
        );
      }
    }
    
    console.log('[AUTH] Logout:', reason);
    
    // Redirigir a login
    this.redirectToLogin();
  }
  
  clearSession() {
    localStorage.removeItem(this.sessionKey);
  }
  
  clearTimers() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    if (this.warningId) {
      clearTimeout(this.warningId);
      this.warningId = null;
    }
  }
  
  startSessionTimer() {
    this.clearTimers();
    
    // Timer de advertencia (5 minutos antes de expirar)
    this.warningId = setTimeout(() => {
      if (this.isAuthenticated) {
        this.showSessionWarning();
      }
    }, this.sessionTimeout - this.warningTimeout);
    
    // Timer de logout automático
    this.timeoutId = setTimeout(() => {
      if (this.isAuthenticated) {
        this.logout('timeout');
      }
    }, this.sessionTimeout);
  }
  
  showSessionWarning() {
    if (window.notifications) {
      window.notifications.warning(
        'Sesión por expirar',
        'Tu sesión expirará en 5 minutos. Haz clic en cualquier lugar para mantenerla activa.',
        10000
      );
    }
  }
  
  handleActivity() {
    if (!this.isAuthenticated) return;
    
    const now = Date.now();
    
    // Solo resetear timer si ha pasado más de 1 minuto desde la última actividad
    if (now - this.lastActivity > 60000) {
      this.lastActivity = now;
      this.startSessionTimer();
      
      // Actualizar expiry en localStorage
      const session = localStorage.getItem(this.sessionKey);
      if (session) {
        try {
          const sessionData = JSON.parse(session);
          sessionData.expiry = now + this.sessionTimeout;
          localStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
        } catch (error) {
          console.error('[AUTH] Error al actualizar sesión:', error);
        }
      }
    }
  }
  
  setupActivityListeners() {
    // Eventos que indican actividad del usuario
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, this.handleActivity, true);
    });
  }
  
  requireAuth() {
    if (!this.isAuthenticated) {
      console.log('[AUTH] Acceso no autorizado, redirigiendo a login');
      this.redirectToLogin();
      return false;
    }
    return true;
  }
  
  redirectToLogin() {
    // Si estamos en la página principal, redirigir a login
    if (window.location.pathname !== '/login.html' && !window.location.pathname.includes('login')) {
      window.location.href = 'login.html';
    }
  }
  
  getUserInfo() {
    const session = localStorage.getItem(this.sessionKey);
    if (session) {
      try {
        return JSON.parse(session);
      } catch (error) {
        console.error('[AUTH] Error al obtener info del usuario:', error);
      }
    }
    return null;
  }
  
  extendSession() {
    if (this.isAuthenticated) {
      this.handleActivity();
      if (window.notifications) {
        window.notifications.success(
          'Sesión extendida',
          'Tu sesión ha sido extendida por 30 minutos más',
          3000
        );
      }
    }
  }
}

// Crear instancia global
window.authManager = new AuthManager();

// Exponer métodos útiles globalmente
window.requireAuth = () => window.authManager.requireAuth();
window.logout = () => window.authManager.logout();
window.getUserInfo = () => window.authManager.getUserInfo();
