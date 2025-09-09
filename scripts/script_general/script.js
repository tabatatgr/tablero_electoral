// Electoral Dashboard JavaScript - Clean Version
console.log('Loading Electoral Dashboard...');

//  Helper para notificaciones seguras
function safeNotification(method, ...args) {
    // Intentar llamar inmediatamente si el sistema está listo
    if (window.notifications && window.notifications.isReady && typeof window.notifications[method] === 'function') {
        try {
            return window.notifications[method](...args);
        } catch (err) {
            console.warn('[safeNotification] Error al ejecutar método inmediato:', err);
            return null;
        }
    }

    // Si no está listo, hacer reintentos con backoff corto (evita condiciones de carrera)
    const maxAttempts = 12; // hasta ~1.2s
    const attemptDelay = 100; // ms

    let attempt = 0;
    const tryLater = () => {
        attempt++;
        if (window.notifications && window.notifications.isReady && typeof window.notifications[method] === 'function') {
            try {
                return window.notifications[method](...args);
            } catch (err) {
                console.warn('[safeNotification] Error al ejecutar método en retry:', err);
                return null;
            }
        }
        if (attempt < maxAttempts) {
            setTimeout(tryLater, attemptDelay);
        } else {
            // Al agotar reintentos, hacer un último intento directo si existe la API
            if (window.notifications && typeof window.notifications[method] === 'function') {
                try {
                    return window.notifications[method](...args);
                } catch (err) {
                    console.warn('[safeNotification] Último intento falló:', err);
                }
            }
        }
    };

    // Lanzar el primer retry asincrónico
    setTimeout(tryLater, attemptDelay);
    return null; // No siempre podremos devolver un ID síncrono
}

//  Variables para control de notificaciones - SIMPLIFICADO
let isInitializing = true; // Solo para controlar la primera carga

// Función para obtener la cámara actual
function getCurrentChamber() {
    const senadoresBtn = document.querySelector('.chamber-btn[data-chamber="senadores"]');
    const diputadosBtn = document.querySelector('.chamber-btn[data-chamber="diputados"]');
    
    if (senadoresBtn && senadoresBtn.classList.contains('active')) {
        return 'senado';
    } else if (diputadosBtn && diputadosBtn.classList.contains('active')) {
        return 'diputados';
    }
    
    // Fallback: revisar sidebar si existe
    const sidebar = document.querySelector('control-sidebar');
    if (sidebar && sidebar.selectedChamber) {
        return sidebar.selectedChamber === 'senadores' ? 'senado' : 'diputados';
    }
    
    return 'senado'; // Default
}

// ===== REQUEST CONTROLLER PARA EVITAR SOLAPAMIENTO =====
let currentController = null;
let pendingRequestId = null;

function createNewRequestController() {
    // Cancelar request anterior si existe
    if (currentController) {
        currentController.abort();
        console.log('[DEBUG] Request anterior cancelado');
    }
    
    // Crear nuevo controller
    currentController = new AbortController();
    return currentController;
}

// ===== MAIN INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    // ❌ NOTIFICACIÓN INICIAL ELIMINADA - Solo mostrar notificaciones en interacciones del usuario
    /*
    //  Esperar a que el sistema de notificaciones esté listo
    function showInitialNotification() {
        const result = safeNotification('show', {
            title: 'Cargando componentes y datos iniciales...',
            type: 'loading',
            autoHide: false
        });
        
        if (!result) {
            // Reintentar después de un momento
            setTimeout(showInitialNotification, 100);
        }
    }
    
    showInitialNotification();
    */
    
    // 🔄 NUEVO SISTEMA DE REPARTO EXCLUSIVO - Event listeners
    const repartoModeRadios = document.querySelectorAll('input[name="reparto-mode"]');
    repartoModeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const modelSelect = document.getElementById('model-select');
            if (modelSelect && modelSelect.value === 'personalizado') {
                actualizarDesdeControlesDebounced(); // Modo de reparto NO activa "Calculando modelo"
                console.log('[DEBUG] Modo de reparto cambiado:', this.value);
            }
        });
    });
    
    const repartoMethodSelect = document.getElementById('reparto-method');
    if (repartoMethodSelect) {
        repartoMethodSelect.addEventListener('change', function() {
            const modelSelect = document.getElementById('model-select');
            if (modelSelect && modelSelect.value === 'personalizado') {
                actualizarDesdeControlesDebounced(); // Método de reparto NO activa "Calculando modelo"
                console.log('[DEBUG] Método de reparto cambiado:', this.value);
            }
        });
    }
    // Radios de regla electoral: solo dispara actualización si el modelo es personalizado
    const electoralRuleRadios = document.querySelectorAll('input[name="electoral-rule"]');
    electoralRuleRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const modelSelect = document.getElementById('model-select');
            if (modelSelect && modelSelect.value === 'personalizado') {
                actualizarDesdeControlesDebounced(); // Regla electoral NO activa "Calculando modelo"
            }
        });
    });
    // Slider de umbral: dispara actualización para cualquier modelo en senado
    const thresholdInput = document.getElementById('threshold-slider');
    if (thresholdInput) {
        thresholdInput.addEventListener('input', function() {
            const currentChamber = getCurrentChamber();
            const modelSelect = document.getElementById('model-select');
            const umbralValue = parseFloat(this.value);
            
            // UI Feedback: Indicar estado del umbral
            let feedbackMsg = '';
            let feedbackClass = '';
            
            if (umbralValue > 10) {
                feedbackMsg = ` Umbral muy alto (${umbralValue}%) - Puede eliminar todos los partidos`;
                feedbackClass = 'umbral-muy-alto';
            } else if (umbralValue > 5) {
                feedbackMsg = ` Umbral alto (${umbralValue}%) - Reducirá partidos significativamente`;
                feedbackClass = 'umbral-alto';
            } else if (umbralValue > 0) {
                feedbackMsg = ` Umbral normal (${umbralValue}%)`;
                feedbackClass = 'umbral-normal';
            } else {
                feedbackMsg = 'Sin umbral electoral';
                feedbackClass = 'umbral-off';
            }
            
            console.log('[DEBUG]  Umbral slider changed:', {
                valor: umbralValue,
                camara: currentChamber,
                modeloActual: modelSelect?.value,
                feedback: feedbackMsg
            });
            
            // TEMPORAL: Solo actualizar para diputados mientras debuggeamos senado
            if (currentChamber === 'diputados' || 
                (modelSelect && modelSelect.value === 'personalizado')) {
                console.log('[DEBUG]  Umbral changed, triggering update for chamber:', currentChamber);
                actualizarDesdeControlesDebounced(true); //  Marcar como acción del usuario
            } else {
                console.log('[DEBUG]  UMBRAL DESHABILITADO TEMPORALMENTE PARA SENADO NO-PERSONALIZADO');
            }
        });
    }
    // Slider de sobrerrepresentación: solo dispara actualización si el modelo es personalizado
    const overrepInput = document.getElementById('overrep-slider');
    if (overrepInput) {
        overrepInput.addEventListener('input', function() {
            const modelSelect = document.getElementById('model-select');
            if (modelSelect && modelSelect.value === 'personalizado') {
                actualizarDesdeControlesDebounced(true); //  Marcar como acción del usuario
            }
        });
    }
    // Slider de tope de escaños por partido: solo dispara actualización si el modelo es personalizado
    const seatCapInput = document.getElementById('seat-cap-input');
    if (seatCapInput) {
        seatCapInput.addEventListener('input', function() {
            const modelSelect = document.getElementById('model-select');
            if (modelSelect && modelSelect.value === 'personalizado') {
                actualizarDesdeControlesDebounced(true); //  Marcar como acción del usuario
            }
        });
    }
    console.log('DOM loaded, initializing dashboard...');
    
    // Small delay to ensure all elements are ready
    setTimeout(() => {
        initializeAllFunctionality();
    }, 100);
});

// ===== MASTER INITIALIZATION FUNCTION =====
function initializeAllFunctionality() {
    console.log('Starting full initialization...');
    try {
        // Only initialize global dashboard logic, not sidebar controls
        // If you have other global initializations, keep them here
        console.log('Dashboard initialized successfully!');
    } catch (error) {
        console.error('Error during initialization:', error);
    }
}

// ===== SIDEBAR FUNCTIONALITY =====
function initializeEnhancedSidebar() {
    console.log(' Initializing enhanced sidebar...');
    
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('control-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    
    if (!mobileMenuBtn || !sidebar || !overlay) {
        console.warn('Missing sidebar elements');
        return;
    }
    
    // Mobile menu functionality
    mobileMenuBtn.addEventListener('click', function() {
        console.log('Mobile menu opened');
        sidebar.classList.add('open');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    
    // Close sidebar when clicking overlay
    overlay.addEventListener('click', function() {
        closeMobileSidebar();
    });
    
    // Close sidebar with toggle button
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                closeMobileSidebar();
            } else {
                // Desktop sidebar collapse
                sidebar.classList.toggle('collapsed');
                const isCollapsed = sidebar.classList.contains('collapsed');
                localStorage.setItem('sidebarCollapsed', isCollapsed);
                console.log(` Sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`);
            }
        });
    }
    
    // Close sidebar on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && sidebar.classList.contains('open')) {
            closeMobileSidebar();
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            closeMobileSidebar();
        }
    });
    
    function closeMobileSidebar() {
        console.log(' Mobile sidebar closed');
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // Load saved sidebar state for desktop
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState === 'true' && window.innerWidth > 768) {
        sidebar.classList.add('collapsed');
    }
}

// ===== UTILITY FUNCTIONS =====
function handleRadioSelection(radioGroup, selectedOption) {
    // Deselect all options in the group
    radioGroup.forEach(option => {
        option.setAttribute('data-state', 'Off');
        const button = option.querySelector('.radio-button');
        const dot = button.querySelector('.radio-dot');
        if (dot) dot.remove();
    });
    
    // Select the clicked option
    selectedOption.setAttribute('data-state', 'On');
    const button = selectedOption.querySelector('.radio-button');
    if (!button.querySelector('.radio-dot')) {
        const dot = document.createElement('div');
        dot.className = 'radio-dot';
        button.appendChild(dot);
    }
}

console.log(' Electoral Dashboard script loaded');

(function(){
  function setFill(input){
    const min = Number(input.min || 0);
    const max = Number(input.max || 100);
    const val = Number(input.value || 0);
    const pct = ((val - min) * 100) / (max - min);
    // Update CSS variable for WebKit
    input.style.setProperty('--fill', pct + '%');

    // Update value chip if it exists
    const chip = document.querySelector('.slider-value[data-for="' + input.id + '"]');
    if(chip){ chip.textContent = val + '%'; }
  }

  function initSlider(input){
    setFill(input);
    input.addEventListener('input', () => setFill(input));
    input.addEventListener('change', () => setFill(input));
  }

  document.addEventListener('DOMContentLoaded', function(){
    document.querySelectorAll('.slider').forEach(initSlider);
  });

})();

// ===== FETCH Y ACTUALIZACIÓN DE DASHBOARD (MVP) =====

//  FUNCIÓN CENTRALIZADA: Mapeo modelo → plan
function mapearModeloAPlan(modelo) {
    const mapeo = {
        'vigente': 'vigente',
        'plan a': 'A', 
        'plan b': 'B',
        'plan c': 'C',
        'plan_c': 'C',
        'personalizado': 'personalizado'  //  CORRECTO: mantener como personalizado
    };
    
    // Si el modelo está en el mapeo, usarlo; sino usar el modelo tal como viene
    const resultado = mapeo[modelo.toLowerCase()] || modelo;
    
    console.log('[DEBUG]  MAPEO CENTRALIZADO:', {
        entrada: modelo,
        salida: resultado,
        encontradoEnMapeo: modelo.toLowerCase() in mapeo
    });
    
    return resultado;
}

async function cargarSimulacion({anio = null, camara = 'diputados', modelo = 'vigente', magnitud, umbral = undefined, sobrerrepresentacion = undefined, sistema = undefined, mr_seats = undefined, rp_seats = undefined, pm_seats = undefined, escanos_totales = undefined, reparto_mode = 'cuota', reparto_method = 'hare', max_seats_per_party = undefined, usar_coaliciones = true, silentLoad = false, porcentajes_redistribucion = null} = {}) {
    // 🆕 LÓGICA PARA COALICIONES - Establecer año por defecto basado en si están activadas
    if (anio === null) {
        if (usar_coaliciones) {
            anio = 2024; // Si coaliciones están activadas, usar 2024 por defecto
            console.log('[DEBUG] 🤝 Coaliciones activadas: usando año 2024 por defecto');
        } else {
            anio = 2018; // Si coaliciones están desactivadas, usar 2018 por defecto
            console.log('[DEBUG] 🚫 Coaliciones desactivadas: usando año 2018 por defecto');
        }
    }
    console.log('[DEBUG]  cargarSimulacion INICIADA con parámetros:', {anio, camara, modelo, magnitud, mr_seats, rp_seats, pm_seats, escanos_totales, reparto_mode, reparto_method, usar_coaliciones, silentLoad});
    
    // Sin notificación en cargarSimulacion - las notificaciones se manejan en actualizarDesdeControles
    let notificationId = null;
    
    try {
        //  ANTI-CACHÉ: Generar timestamp único
        const timestamp = Date.now();
        const requestId = `${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Determinar endpoint basado en la cámara
        const endpoint = camara === 'senado' ? 'procesar/senado' : 'procesar/diputados';
        let url = `https://back-electoral.onrender.com/${endpoint}?anio=${anio}`;
        
        //  USAR FUNCIÓN CENTRALIZADA
        const plan = mapearModeloAPlan(modelo);
        url += `&plan=${plan}`;
        
        //  ENVIAR MAGNITUD PARA AMBAS CÁMARAS (solo si NO es personalizado)
        if (typeof magnitud !== 'undefined' && modelo !== 'personalizado') {
            url += `&escanos_totales=${magnitud}`;
            console.log('[DEBUG]  Enviando magnitud estándar:', magnitud, 'para', camara);
        }
        
        //  ENVIAR PARÁMETROS PERSONALIZADOS AL BACKEND
        // Solo cuando el modelo es personalizado, agregar parámetros adicionales
        if (modelo === 'personalizado') {
            console.log('[DEBUG] 🔧 MODO PERSONALIZADO: Enviando parámetros adicionales...');
            
            //  NOMBRES CORRECTOS SEGÚN EL BACKEND:
            
            // Umbral
            if (typeof umbral !== 'undefined' && umbral !== null) {
                url += `&umbral=${umbral}`;
                console.log('[DEBUG]  Enviando umbral:', umbral, 'para cámara:', camara);
            } else {
                console.log('[DEBUG]  NO se envía umbral (undefined o null) para cámara:', camara);
            }
            
            
            // Sobrerrepresentación (parámetro de tolerancia)
            if (typeof sobrerrepresentacion !== 'undefined' && sobrerrepresentacion !== null) {
                url += `&sobrerrepresentacion=${sobrerrepresentacion}`;
                console.log('[DEBUG]  Enviando sobrerrepresentacion:', sobrerrepresentacion);
            }
            
            // Tope de escaños por partido (parámetro separado del control específico)
            if (typeof max_seats_per_party !== 'undefined' && max_seats_per_party !== null) {
                url += `&max_seats_per_party=${max_seats_per_party}`;
                console.log('[DEBUG]  Enviando max_seats_per_party:', max_seats_per_party);
            }
            
            // Sistema electoral
            if (typeof sistema !== 'undefined' && sistema !== null) {
                url += `&sistema=${sistema}`;
            }
            
            //  MR_SEATS: Enviando escaños mayoría relativa (REDONDEADO A ENTERO)
            if (typeof mr_seats !== 'undefined' && mr_seats !== null) {
                let mrSeatsRounded = Math.round(mr_seats);
                // Aplicar tope por cámara para evitar enviar valores inválidos al backend
                const mrCap = camara === 'senado' ? 64 : 300;
                if (mrSeatsRounded > mrCap) {
                    console.warn('[DEBUG]  mr_seats excede el tope de la cámara:', mrSeatsRounded, '>', mrCap, "- se enviará el tope en su lugar");
                    mrSeatsRounded = mrCap;
                }
                url += `&mr_seats=${mrSeatsRounded}`;
                console.log('[DEBUG]  Enviando mr_seats:', mr_seats, '→', mrSeatsRounded, '(redondeado y clamped si hacía falta)');
            }
            
            //  RP_SEATS: Enviando escaños representación proporcional (REDONDEADO A ENTERO)
            if (typeof rp_seats !== 'undefined' && rp_seats !== null) {
                const rpSeatsRounded = Math.round(rp_seats);
                url += `&rp_seats=${rpSeatsRounded}`;
                console.log('[DEBUG]  Enviando rp_seats:', rp_seats, '→', rpSeatsRounded, '(redondeado)');
            }
            
            //  PM_SEATS: Enviando escaños primera minoría (REDONDEADO A ENTERO)
            if (typeof pm_seats !== 'undefined' && pm_seats !== null) {
                const pmSeatsRounded = Math.round(pm_seats);
                url += `&pm_seats=${pmSeatsRounded}`;
                console.log('[DEBUG]  Enviando pm_seats:', pm_seats, '→', pmSeatsRounded, '(redondeado)');
            }
            
            //  ESCANOS_TOTALES: Total de escaños (REDONDEADO A ENTERO)
            if (typeof escanos_totales !== 'undefined' && escanos_totales !== null) {
                const escanosTotalesRounded = Math.round(escanos_totales);
                url += `&escanos_totales=${escanosTotalesRounded}`;
                console.log('[DEBUG]  Enviando escanos_totales:', escanos_totales, '→', escanosTotalesRounded, '(redondeado) | Variable origen:', typeof escanos_totales);
            } else {
                //  FALLBACK CRÍTICO: Si no hay escanos_totales, usar magnitud
                if (typeof magnitud !== 'undefined' && magnitud !== null) {
                    const magnitudRounded = Math.round(magnitud);
                    url += `&escanos_totales=${magnitudRounded}`;
                    console.log('[DEBUG]  FALLBACK escanos_totales: Usando magnitud', magnitud, '→', magnitudRounded);
                } else {
                    //  ÚLTIMO RECURSO: Valores por defecto por cámara
                    const defaultSeats = camara === 'senado' ? 128 : 500;
                    url += `&escanos_totales=${defaultSeats}`;
                    console.log('[DEBUG]  FALLBACK ÚLTIMO RECURSO: Usando default', defaultSeats, 'para', camara);
                }
            }
            
            // 🔄 NUEVO SISTEMA DE REPARTO EXCLUSIVO
            if (typeof reparto_mode !== 'undefined' && reparto_mode !== null) {
                url += `&reparto_mode=${reparto_mode}`;
                console.log('[DEBUG]  Enviando reparto_mode:', reparto_mode);
            }
            
            if (typeof reparto_method !== 'undefined' && reparto_method !== null) {
                url += `&reparto_method=${reparto_method}`;
                console.log('[DEBUG]  Enviando reparto_method:', reparto_method);
            }
            
            // Toggle de coaliciones (solo en modo personalizado)
            if (typeof usar_coaliciones !== 'undefined' && usar_coaliciones !== null) {
                url += `&usar_coaliciones=${usar_coaliciones}`;
                console.log('[DEBUG]  Enviando usar_coaliciones:', usar_coaliciones, 'para', camara, '(modo personalizado)');
            }
            
            //  ELIMINAR max_seats_per_party duplicado (ya se envía como sobrerrepresentacion)
            // if (typeof max_seats_per_party !== 'undefined' && max_seats_per_party !== null) {
            //     url += `&max_seats_per_party=${max_seats_per_party}`;
            // }
            
            console.log('[DEBUG]  PARÁMETROS PERSONALIZADOS AÑADIDOS CON NOMBRES CORRECTOS');
        }
        
        //  ANTI-CACHÉ: Añadir timestamp a la URL
        url += `&_t=${timestamp}&_r=${requestId}`;
        
        console.log('[DEBUG] URL generada para petición:', url);
        console.log('[DEBUG] Request ID:', requestId);
        console.log('[DEBUG] Parámetros recibidos:', {
            anio, camara, modelo, magnitud, umbral, sobrerrepresentacion, 
            sistema, mr_seats, rp_seats, escanos_totales,
            reparto_mode, reparto_method, max_seats_per_party, usar_coaliciones
        });
        
        //  DEBUG: Mostrar si es personalizado
        if (modelo === 'personalizado') {
            console.log('[DEBUG]  PERSONALIZADO ACTIVO - URL incluye parámetros customizados');
        } else {
            console.log('[DEBUG]  PLAN ESTÁNDAR - Solo parámetros básicos');
        }
        
        //  DEBUG ESPECÍFICO POR CÁMARA: Verificar diferencias Senado vs Diputados
        console.log('[DEBUG]  CÁMARA:', camara.toUpperCase());
        console.log('[DEBUG]  MAGNITUD/ESCAÑOS:', {
            magnitudRecibida: magnitud,
            escanosTotalesRecibidos: escanos_totales,
            seEnviaEnURL: url.includes('escanos_totales'),
            urlCompleta: url
        });
        
        //  CREAR NUEVO CONTROLLER Y CANCELAR ANTERIORES
        const controller = createNewRequestController();
        pendingRequestId = requestId;
        
        // Preparar opciones de fetch
        const fetchOptions = {
            method: 'POST',
            headers: {
                //  ANTI-CACHÉ: Headers que fuerzan no-cache
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache', 
                'Expires': '0',
                'X-Request-ID': requestId
            },
            signal: controller.signal
        };
        
        // 🆕 REDISTRIBUCIÓN DE VOTOS: Si hay porcentajes, enviar en body
        if (porcentajes_redistribucion && Object.keys(porcentajes_redistribucion).length > 0) {
            console.log('[DEBUG] 🗳️ REDISTRIBUCIÓN ACTIVA - Enviando porcentajes en body:', porcentajes_redistribucion);
            
            const formData = new URLSearchParams();
            formData.append('porcentajes_partidos', JSON.stringify(porcentajes_redistribucion));
            formData.append('partidos_fijos', JSON.stringify([]));
            formData.append('overrides_pool', JSON.stringify({}));
            
            fetchOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded';
            fetchOptions.body = formData;
            
            console.log('[DEBUG] Body incluido para redistribución de votos');
        } else {
            console.log('[DEBUG] Sin redistribución - POST solo con query parameters');
        }
        
        console.log('[DEBUG] Método HTTP: POST para cámara:', camara);
        console.log('[DEBUG] URL final:', url);
        if (porcentajes_redistribucion) {
            console.log('[DEBUG] Con body de redistribución - porcentajes personalizados');
        } else {
            console.log('[DEBUG] Sin body - todos los parámetros en query string');
        }
        
        // Sin actualización de notificación - se maneja en actualizarDesdeControles
        
        const resp = await fetch(url, fetchOptions);
        
        console.log('[DEBUG] Status de respuesta:', resp.status, resp.statusText);
        
        if (!resp.ok) {
            // Las notificaciones de error se manejan en actualizarDesdeControles
            console.error('[DEBUG] Error al cargar datos:', resp.status, resp.statusText);
            
            // Intentar leer el error del backend
            try {
                const errorData = await resp.text();
                console.error('[DEBUG] Error del backend:', errorData);
                console.error('[DEBUG] 🚨 ERROR ESPECÍFICO PARA CÁMARA:', camara);
                console.error('[DEBUG] 🚨 PARÁMETROS QUE CAUSARON ERROR:', {
                    anio, camara, modelo, magnitud, umbral, sobrerrepresentacion,
                    urlCompleta: url
                });
                
                // Detección específica de IndexError
                if (errorData.includes('IndexError') || errorData.includes('index') && errorData.includes('out of bounds')) {
                    console.error('[DEBUG]  DETECTADO INDEX ERROR - Probable problema con umbral alto');
                    console.error('[DEBUG]  SUGERENCIA: Reducir umbral a <5% o revisar backend');
                    
                    //  Notificación específica para IndexError
                    if (window.notifications) {
                        window.notifications.warning(
                            'Parámetros Fuera de Rango',
                            'El umbral seleccionado puede ser demasiado alto. Intenta con un valor menor.',
                            10000
                        );
                    }
                }
                
                throw new Error(`Backend error ${resp.status}: ${errorData}`);
            } catch (parseError) {
                throw new Error(`Error ${resp.status}: ${resp.statusText}`);
            }
        }
        
        // Sin actualización de notificación - se maneja en actualizarDesdeControles
        
        const data = await resp.json();
        console.log('[DEBUG] Respuesta backend:', data);
        
        //  VERIFICAR QUE ESTA ES LA RESPUESTA MÁS RECIENTE
        if (pendingRequestId !== requestId) {
            console.log('[DEBUG]  Respuesta descartada - hay un request más reciente');
            return;
        }
        
        console.log('[DEBUG]  DATOS RECIBIDOS DETALLADOS:', {
            hasResultados: !!data.resultados,
            resultadosLength: data.resultados?.length || 0,
            hasSeatChart: !!data.seat_chart,
            seatChartLength: data.seat_chart?.length || 0,
            hasKpis: !!data.kpis,
            kpisKeys: data.kpis ? Object.keys(data.kpis) : [],
            plan: data.plan,
            timestamp: data.timestamp,
            camara: camara,
            modelo: modelo
        });
        
        //  VERIFICACIÓN ESPECÍFICA PARA DIPUTADOS
        if (camara === 'diputados' && (!data.seat_chart || data.seat_chart.length === 0)) {
            console.error('[DEBUG]  PROBLEMA DIPUTADOS: No hay seat_chart data!', {
                url: url,
                parametros: { anio, camara, modelo, magnitud, umbral, sobrerrepresentacion, sistema, mr_seats, rp_seats, escanos_totales },
                respuestaCompleta: data
            });
        }
        
        //  VERIFICACIÓN ESPECÍFICA PARA SENADO
        if (camara === 'senado' && (!data.seat_chart || data.seat_chart.length === 0)) {
            console.error('[DEBUG] 🚨 PROBLEMA SENADO: No hay seat_chart data!', {
                url: url,
                parametros: { anio, camara, modelo, magnitud, umbral, sobrerrepresentacion, sistema, mr_seats, rp_seats, escanos_totales },
                respuestaCompleta: data,
                umbralEnviado: umbral,
                modeloUsado: modelo
            });
            return;
        }
        
        // Usar los datos que ya vienen en la respuesta principal
        if (data.seat_chart) {
            console.log('[DEBUG]  BUSCANDO seat-chart en el DOM...');
            const seatChart = document.querySelector('seat-chart');
            console.log('[DEBUG]  seat-chart encontrado:', !!seatChart, seatChart);
            if (seatChart) {
                // El componente espera un array
                const seatArray = Array.isArray(data.seat_chart) ? data.seat_chart : data.seat_chart.seats || [];
                
                //  DEBUGGING DETALLADO DE SEAT_CHART DATA
                console.log('[DEBUG]  SEAT_CHART DATA ANALYSIS:');
                console.log('[DEBUG]  data.seat_chart tipo:', typeof data.seat_chart);
                console.log('[DEBUG]  data.seat_chart es array:', Array.isArray(data.seat_chart));
                console.log('[DEBUG]  data.seat_chart completo:', data.seat_chart);
                console.log('[DEBUG]  seatArray después de procesar:', seatArray);
                console.log('[DEBUG]  seatArray length:', seatArray.length);
                
                // Calcular total de escaños de seatArray
                let totalCalculado = 0;
                if (Array.isArray(seatArray)) {
                    totalCalculado = seatArray.reduce((total, partido) => {
                        const seats = partido.seats || 0;
                        console.log(`[DEBUG]  Partido ${partido.party}: ${seats} escaños`);
                        return total + seats;
                    }, 0);
                }
                console.log('[DEBUG]  TOTAL ESCAÑOS CALCULADO desde seatArray:', totalCalculado);
                
                //  DETECTAR SI EL TOPE DE ESCAÑOS ESTÁ LIMITANDO LOS RESULTADOS
                if (seatArray.length > 0) {
                    const maxSeatsEnPartidos = Math.max(...seatArray.map(p => p.seats || 0));
                    if (max_seats_per_party && maxSeatsEnPartidos <= max_seats_per_party && totalCalculado < escanos_totales) {
                        console.warn('[DEBUG]  POSIBLE LIMITACIÓN POR TOPE DE ESCAÑOS:');
                        console.warn('[DEBUG]  max_seats_per_party configurado:', max_seats_per_party);
                        console.warn('[DEBUG]  Máximo escaños en un partido:', maxSeatsEnPartidos);
                        console.warn('[DEBUG]  Total calculado:', totalCalculado, 'vs esperado:', escanos_totales);
                        console.warn('[DEBUG]  ¡ESTO PODRÍA ESTAR CAUSANDO LA DISCREPANCIA!');
                    }
                }
                
                // Comparar con los parámetros enviados
                console.log('[DEBUG]  COMPARACIÓN CON PARÁMETROS ENVIADOS:');
                console.log('[DEBUG]  escanos_totales enviado:', escanos_totales);
                console.log('[DEBUG]  magnitud enviada:', magnitud);
                console.log('[DEBUG]  mr_seats enviado:', mr_seats);
                console.log('[DEBUG]  rp_seats enviado:', rp_seats);
                console.log('[DEBUG]  Total desde backend:', totalCalculado);
                
                console.log('[DEBUG]  Datos seat_chart a enviar:', seatArray);
                
                //  ANTI-CACHÉ: Forzar re-render con key única
                const renderKey = `${requestId}_seats`;
                seatChart.setAttribute('data-key', renderKey);
                seatChart.setAttribute('data', JSON.stringify(seatArray));
                
                //  VERIFICAR CAMBIOS REALES: Hash de contenido
                const contentHash = btoa(JSON.stringify(seatArray)).slice(0, 16);
                console.log('[DEBUG] seat-chart actualizado desde respuesta principal');
                console.log('[DEBUG] Content Hash:', contentHash, 'Render Key:', renderKey);
                
                //  FORZAR ACTUALIZACIÓN: Trigger custom event
                seatChart.dispatchEvent(new CustomEvent('force-update', { 
                    detail: { requestId, contentHash, timestamp } 
                }));
            } else {
                console.error('[DEBUG]  NO SE ENCONTRÓ el elemento seat-chart en el DOM!');
            }
        }
        
        if (data.kpis) {
            const indicadores = document.querySelectorAll('.indicadores-resumen indicador-box');
            console.log('[DEBUG]  BUSCANDO INDICADORES KPI:', {
                selector: '.indicadores-resumen indicador-box',
                encontrados: indicadores.length,
                esperados: 4
            });
            
            if (indicadores.length >= 4) {
                console.log('[DEBUG]  APLICANDO KPIs a indicadores:');
                console.log('[DEBUG]  data.kpis completo:', data.kpis);
                
                //  FORZAR RE-RENDER: Key única para cada indicador
                const kpiKey = `${requestId}_kpis`;
                
                console.log('[DEBUG]  KPI 0 - total_escanos:', data.kpis.total_escanos || 0);
                indicadores[0].setAttribute('data-key', `${kpiKey}_1`);
                indicadores[0].setAttribute('valor', data.kpis.total_escanos || 0);
                
                // Preferir ratio promedio proporcionado por el backend; si no existe, fallback a MAE
                const backendRatio = data.kpis.ratio_promedio ?? data.kpis.ratio_promedio_ponderado_por_votos ?? data.kpis.ratio_promedio_unweighted ?? null;
                indicadores[1].setAttribute('data-key', `${kpiKey}_2`);
                if (backendRatio != null) {
                    console.log('[DEBUG]  KPI 1 - ratio_promedio (backend):', backendRatio);
                    indicadores[1].setAttribute('valor', Number(backendRatio).toFixed(3));
                    indicadores[1].setAttribute('fuente', 'backend.ratio_promedio');
                } else {
                    console.log('[DEBUG]  KPI 1 - mae_votos_vs_escanos (fallback):', data.kpis.mae_votos_vs_escanos || 0);
                    indicadores[1].setAttribute('valor', (data.kpis.mae_votos_vs_escanos || 0).toFixed(2));
                    indicadores[1].setAttribute('fuente', 'backend.mae_votos_vs_escanos');
                }
                
                console.log('[DEBUG]  KPI 2 - gallagher:', data.kpis.gallagher || 0);
                indicadores[2].setAttribute('data-key', `${kpiKey}_3`);
                indicadores[2].setAttribute('valor', (data.kpis.gallagher || 0).toFixed(2));
                
                console.log('[DEBUG]  KPI 3 - total_votos:', data.kpis.total_votos || 0);
                indicadores[3].setAttribute('data-key', `${kpiKey}_4`);
                indicadores[3].setAttribute('valor', (data.kpis.total_votos || 0).toLocaleString('es-MX'));
                
                console.log('[DEBUG] KPIs actualizados desde respuesta principal');
                console.log('[DEBUG] KPI Keys:', kpiKey);
                
                // Verificar que los atributos se aplicaron
                indicadores.forEach((ind, idx) => {
                    console.log(`[DEBUG]  Indicador ${idx} final:`, {
                        valor: ind.getAttribute('valor'),
                        dataKey: ind.getAttribute('data-key'),
                        tagName: ind.tagName
                    });
                });
                
                //  TRIGGER CUSTOM EVENTS para forzar actualización
                indicadores.forEach((ind, idx) => {
                    ind.dispatchEvent(new CustomEvent('force-update', { 
                        detail: { requestId, index: idx, timestamp } 
                    }));
                });
            } else {
                console.error('[DEBUG]  NO SE ENCONTRARON SUFICIENTES INDICADORES KPI!', {
                    encontrados: indicadores.length,
                    esperados: 4,
                    elementos: Array.from(indicadores).map(el => ({
                        tagName: el.tagName,
                        classes: el.className,
                        valor: el.getAttribute('valor')
                    }))
                });
            }
        } else {
            console.error('[DEBUG]  NO HAY DATOS KPIs EN LA RESPUESTA!');
        }
        
        // Si no hay datos en la respuesta principal, intentar endpoints separados como fallback
        if (!data.seat_chart || !data.kpis) {
            console.log('[DEBUG] Algunos datos faltantes, cargando endpoints separados como fallback...');
            await Promise.all([
                !data.seat_chart ? cargarSeatChart(anio, camara, modelo) : Promise.resolve(),
                !data.kpis ? cargarKPIs(anio, camara, modelo) : Promise.resolve()
            ]);
        }
        
        console.log('[DEBUG] Datos principales cargados, seat-chart y KPIs solicitados por separado');
        
        //  ✅ NOTIFICACIÓN DE ÉXITO: Mostrar cuando NO es silentLoad Y NO es inicialización
        if (window.notifications && !silentLoad && !isInitializing) {
            if (isUserTriggered) {
                // Para interacciones del usuario: mostrar "Listo" (reemplazará automáticamente si hay una previa)
                console.log('[DEBUG] Mostrando notificación "Listo" para usuario');
                
                window.notifications.success(
                    'Listo',
                    'Simulación actualizada',
                    20000, // Auto-hide 20 segundos
                    'user-calculation' // Usar mismo ID para reemplazar
                );
                
                // Resetear flag de usuario
                isUserTriggered = false;
            } else {
                // Para otras actualizaciones: mensaje estándar
                console.log('[DEBUG] Mostrando notificación estándar');
                
                window.notifications.success(
                    'Datos Actualizados',
                    `${camara} (${anio}) actualizado`,
                    4000
                );
            }
        } else {
            console.log('[DEBUG] NO se muestra notificación:', { 
                hasNotifications: !!window.notifications, 
                silentLoad, 
                isInitializing 
            });
        }

    } catch (err) {
        //  MANEJAR CANCELACIÓN DE REQUESTS
        if (err.name === 'AbortError') {
            console.log('[DEBUG]  Request cancelado (normal cuando hay nuevos requests)');
            return;
        }
        
        console.error('Error cargando simulación:', err);
        
        // Los errores se manejan en actualizarDesdeControles
    }
}

// Función para cargar datos del seat-chart
async function cargarSeatChart(anio, camara, modelo) {
    try {
        //  ANTI-CACHÉ: Timestamp único
        const timestamp = Date.now();
        const requestId = `${timestamp}_seatChart_${Math.random().toString(36).substr(2, 9)}`;
        
        //  USAR FUNCIÓN CENTRALIZADA
        const plan = mapearModeloAPlan(modelo);
        let url = `https://back-electoral.onrender.com/seat-chart/${camara}/${anio}?plan=${plan}`;
        
        //  ANTI-CACHÉ: Añadir timestamp
        url += `&_t=${timestamp}&_r=${requestId}`;
        
        console.log('[DEBUG] Cargando seat-chart desde:', url);
        console.log('[DEBUG] Seat-Chart Request ID:', requestId);
        
        const resp = await fetch(url, {
            //  ANTI-CACHÉ: Headers no-cache
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                'X-Request-ID': requestId
            }
        });
        console.log('[DEBUG] Status seat-chart:', resp.status, resp.statusText);
        
        if (!resp.ok) {
            const errorText = await resp.text();
            console.error('[DEBUG] Error seat-chart:', errorText);
            throw new Error(`Seat-chart error ${resp.status}: ${errorText}`);
        }
        
        const seatChartData = await resp.json();
        console.log('[DEBUG] Datos seat-chart recibidos:', seatChartData);
        
        // Actualizar el componente seat-chart
        const seatChart = document.querySelector('seat-chart');
        if (seatChart && seatChartData && !seatChartData.error) {
            // El componente espera un array, no un objeto
            const seatArray = seatChartData.seats || seatChartData;
            
            //  FORZAR RE-RENDER: Key única
            const renderKey = `${requestId}_fallback_seats`;
            seatChart.setAttribute('data-key', renderKey);
            seatChart.setAttribute('data', JSON.stringify(seatArray));
            
            //  VERIFICAR CAMBIOS: Content hash
            const contentHash = btoa(JSON.stringify(seatArray)).slice(0, 16);
            console.log('[DEBUG] seat-chart actualizado correctamente con array:', seatArray);
            console.log('[DEBUG] Fallback Content Hash:', contentHash, 'Render Key:', renderKey);
            
            //  FORZAR ACTUALIZACIÓN
            seatChart.dispatchEvent(new CustomEvent('force-update', { 
                detail: { requestId, contentHash, timestamp, source: 'fallback' } 
            }));
        } else {
            console.warn('[DEBUG] seat-chart: No hay datos válidos para mostrar');
        }
    } catch (err) {
        console.error('[ERROR] Error cargando seat-chart:', err);
    }
}

// Función para cargar KPIs
async function cargarKPIs(anio, camara, modelo) {
    try {
        //  ANTI-CACHÉ: Timestamp único
        const timestamp = Date.now();
        const requestId = `${timestamp}_kpis_${Math.random().toString(36).substr(2, 9)}`;
        
        //  USAR FUNCIÓN CENTRALIZADA
        const plan = mapearModeloAPlan(modelo);
        let url = `https://back-electoral.onrender.com/kpis/${camara}/${anio}?plan=${plan}`;
        
        //  ANTI-CACHÉ: Añadir timestamp
        url += `&_t=${timestamp}&_r=${requestId}`;
        
        console.log('[DEBUG] Cargando KPIs desde:', url);
        console.log('[DEBUG] KPIs Request ID:', requestId);
        
        const resp = await fetch(url, {
            //  ANTI-CACHÉ: Headers no-cache
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                'X-Request-ID': requestId
            }
        });
        console.log('[DEBUG] Status KPIs:', resp.status, resp.statusText);
        
        if (!resp.ok) {
            const errorText = await resp.text();
            console.error('[DEBUG] Error KPIs:', errorText);
            throw new Error(`KPIs error ${resp.status}: ${errorText}`);
        }
        
        const kpisData = await resp.json();
        console.log('[DEBUG] Datos KPIs recibidos:', kpisData);
        
        if (kpisData && !kpisData.error) {
            // Actualizar indicadores con el formato correcto
            const indicadores = document.querySelectorAll('.indicadores-resumen indicador-box');
            if (indicadores.length >= 4) {
                //  FORZAR RE-RENDER: Key única para cada indicador
                const kpiKey = `${requestId}_fallback_kpis`;
                
                indicadores[0].setAttribute('data-key', `${kpiKey}_1`);
                indicadores[0].setAttribute('valor', kpisData.total_escanos || 0);
                
                const mae = kpisData.proporcionalidad?.mae_votos_escanos || 0;
                const gallagher = kpisData.proporcionalidad?.indice_gallagher || 0;
                
                indicadores[1].setAttribute('data-key', `${kpiKey}_2`);
                indicadores[1].setAttribute('valor', `±${mae.toFixed(2)}%`);
                
                indicadores[2].setAttribute('data-key', `${kpiKey}_3`);
                indicadores[2].setAttribute('valor', gallagher.toFixed(2));
                
                indicadores[3].setAttribute('data-key', `${kpiKey}_4`);
                indicadores[3].setAttribute('valor', (kpisData.total_votos || 0).toLocaleString('es-MX'));
                
                console.log('[DEBUG] KPIs actualizados correctamente');
                console.log('[DEBUG] Fallback KPI Keys:', kpiKey);
                
                //  TRIGGER CUSTOM EVENTS para forzar actualización
                indicadores.forEach((ind, idx) => {
                    ind.dispatchEvent(new CustomEvent('force-update', { 
                        detail: { requestId, index: idx, timestamp, source: 'fallback' } 
                    }));
                });
            }
        } else {
            console.warn('[DEBUG] No se encontraron datos de KPIs en la respuesta');
        }
    } catch (err) {
        console.error('[ERROR] Error cargando KPIs:', err);
    }
}

// === Vincular controles del panel de control con debounce ===
let debounceTimer = null;
function actualizarDesdeControlesDebounced(userTriggered = false) {
    if (debounceTimer) clearTimeout(debounceTimer);
    
    //  CANCELAR REQUESTS PENDIENTES AL HACER DEBOUNCE
    if (currentController) {
        currentController.abort();
        console.log('[DEBUG]  Request cancelado por debounce');
    }
    
    // Marcar si es acción del usuario
    isUserTriggered = userTriggered;
    
    debounceTimer = setTimeout(actualizarDesdeControles, 300); //  AUMENTAR DEBOUNCE DE 120ms a 300ms
}


document.addEventListener('DOMContentLoaded', function() {
    // 🔔 FLUJO DE NOTIFICACIONES INICIAL
    console.log('[DEBUG] Iniciando flujo de notificaciones...');
    
    // 1️⃣ Mostrar "Cargando datos" con ID fijo
    const loadingNotificationId = safeNotification('show', { 
        title: 'Cargando datos...',
        type: 'loading', 
        autoHide: false,
        id: 'initial-loading'
    });
    
    // Cargar simulación inicial con vigente por defecto
    setTimeout(() => {
        cargarSimulacion({
            anio: 2024,
            camara: 'diputados', 
            modelo: 'vigente',
            silentLoad: false
        }).then(() => {
            // 2️⃣ Actualizar a "Tablero listo" y auto-ocultar en 5 segundos
            safeNotification('update', { 
                id: 'initial-loading',
                title: 'Tablero listo',
                type: 'success'
            });
            
            // Auto-ocultar después de 5 segundos
            setTimeout(() => {
                safeNotification('hide', 'initial-loading');
            }, 5000);
            
            // ✅ Resetear flag de inicialización
            isInitializing = false;
        });
    }, 1000);
    
    //  EVENT LISTENERS DIRECTOS (sin depender de ControlSidebar)
    setTimeout(() => {
        console.log('[DEBUG] 🔧 Configurando event listeners directos...');
        
        // Listeners para sliders MR/RP
        const mrSlider = document.getElementById('input-mr');
        const rpSlider = document.getElementById('input-rp');
        
        if (mrSlider) {
            mrSlider.addEventListener('input', () => {
                console.log('[DEBUG]  MR Slider changed:', mrSlider.value);
                setTimeout(() => actualizarDesdeControlesSilent(), 150);
            });
            console.log('[DEBUG]  MR slider listener attached');
        }
        
        if (rpSlider) {
            rpSlider.addEventListener('input', () => {
                console.log('[DEBUG]  RP Slider changed:', rpSlider.value);
                setTimeout(() => actualizarDesdeControlesSilent(), 150);
            });
            console.log('[DEBUG]  RP slider listener attached');
        }
        
        // Event listeners para Primera Minoría
        const pmSwitch = document.getElementById('first-minority-switch');
        const pmSlider = document.getElementById('input-first-minority');
        
        if (pmSwitch) {
            pmSwitch.addEventListener('click', () => {
                console.log('[DEBUG]  PM Switch changed:', pmSwitch.getAttribute('data-switch'));
                setTimeout(() => actualizarDesdeControlesSilent(), 150);
            });
            console.log('[DEBUG]  PM switch listener attached');
        }
        
        if (pmSlider) {
            pmSlider.addEventListener('input', () => {
                console.log('[DEBUG]  PM Slider changed:', pmSlider.value);
                setTimeout(() => actualizarDesdeControlesSilent(), 150);
            });
            console.log('[DEBUG]  PM slider listener attached');
        }
        
        // Listener para cambio de modelo
        const modelSelect = document.getElementById('model-select');
        if (modelSelect) {
            modelSelect.addEventListener('change', () => {
                console.log('[DEBUG]  Model changed:', modelSelect.value);
                setTimeout(() => actualizarDesdeControlesSilent(), 100);
            });
            console.log('[DEBUG]  Model select listener attached');
        }
        
        // Listeners para botones de cámara
        document.querySelectorAll('[data-chamber]').forEach(btn => {
            btn.addEventListener('click', () => {
                console.log('[DEBUG]  Chamber changed:', btn.getAttribute('data-chamber'));
                setTimeout(() => actualizarDesdeControlesSilent(), 200);
            });
        });
        console.log('[DEBUG]  Chamber button listeners attached');
        
    }, 1200);
    
    // Inicializa con valores actuales
    actualizarDesdeControlesSilent();

    // Cámara (botones): usar MutationObserver para detectar el cambio de clase 'active'
    const sidebar = document.getElementById('control-sidebar') || document.querySelector('control-sidebar');
    if (sidebar) {
        const observer = new MutationObserver(() => {
            actualizarDesdeControlesDebounced();
        });
        observer.observe(sidebar, {
            subtree: true,
            attributes: true,
            attributeFilter: ['class'],
        });
    }
    // Año
    const yearSelect = document.getElementById('year-select');
    const modelSelect = document.getElementById('model-select');
    // Mapas de modelos válidos por año y cámara
    const modelosPorCamaraAnio = {
        'diputados': {
            2018: [ 'vigente', 'plan-a', 'plan-c', 'personalizado' ],
            2021: [ 'vigente', 'plan-a', 'plan-c', 'personalizado' ],
            2024: [ 'vigente', 'plan-a', 'plan-c', 'personalizado' ]
        },
        'senado': {
            2018: [ 'vigente', 'plan-a', 'plan-c', 'personalizado' ],
            2024: [ 'vigente', 'plan-a', 'plan-c', 'personalizado' ]
        }
    };
    function updateModelosDisponibles() {
        // Detecta cámara y año
        let camara = 'diputados';
        const activeChamber = document.querySelector('.master-toggle.active');
        if (activeChamber) {
            const val = activeChamber.getAttribute('data-chamber');
            if (val === 'senadores' || val === 'senado') camara = 'senado';
        }
        let anio = 2018;
        if (yearSelect) {
            anio = parseInt(yearSelect.value, 10);
        }
        const modelosValidos = (modelosPorCamaraAnio[camara] && modelosPorCamaraAnio[camara][anio])
            ? modelosPorCamaraAnio[camara][anio]
            : [ 'vigente' ];
        // Opciones legibles
        const modelosLabels = {
            'vigente': 'Vigente',
            'plan-a': 'Plan A',
            'plan-c': 'Plan C',
            'personalizado': 'Personalizado'
        };
        // Actualiza el select de modelos
        if (modelSelect) {
            modelSelect.innerHTML = modelosValidos.map(m => `<option value="${m}">${modelosLabels[m] || m}</option>`).join('');
            // Si el modelo actual no es válido, resetea
            if (!modelosValidos.includes(modelSelect.value)) {
                modelSelect.value = modelosValidos[0];
            }
        }
    }
    if (yearSelect) {
        yearSelect.addEventListener('change', function() {
            updateModelosDisponibles();
            actualizarDesdeControlesDebounced(true); // Año SÍ activa "Calculando modelo"
        });
    }
    if (modelSelect) {
        modelSelect.addEventListener('change', () => actualizarDesdeControlesDebounced(true)); // Modelo SÍ activa "Calculando modelo"
    }
    // También actualizar modelos si cambia la cámara
    const chamberToggles = document.querySelectorAll('.master-toggle');
    chamberToggles.forEach(btn => {
        btn.addEventListener('click', function() {
            //  Notificación específica para cambio de cámara - SOLO después de inicialización
            if (!isInitializing) {
                const chamberName = this.dataset.chamber === 'senadores' ? 'Senado' : 'Diputados';
                if (window.notifications) {
                    window.notifications.info(
                        `Cambiando a ${chamberName}`,
                        'Cargando...',
                        2000,
                        'chamber-change'
                    );
                }
            }
            
            setTimeout(() => {
                updateModelosDisponibles();
                actualizarDesdeControlesDebounced(); // Botón cámara: sin userTriggered
            }, 50);
        });
    });
    // Inicializa modelos disponibles al cargar
    updateModelosDisponibles();

    // Slider de magnitud: solo dispara actualización si el modelo es personalizado
    const magnitudInput = document.getElementById('input-magnitud');
    if (magnitudInput) {
        magnitudInput.addEventListener('input', function() {
            const modelSelect = document.getElementById('model-select');
            if (modelSelect && modelSelect.value === 'personalizado') {
                actualizarDesdeControlesDebounced(true); //  Marcar como acción del usuario
            }
        });
    }
});


function actualizarDesdeControles() {
    //  Notificación de "Calculando modelo" - SOLO si es acción del usuario después de inicialización
    if (!isInitializing && isUserTriggered) {
        safeNotification('show', { 
            title: 'Calculando modelo...',
            type: 'loading',
            autoHide: false,
            id: 'user-calculation' // ID fijo para poder actualizar después
        });
    }
    
    actualizarDesdeControlesSilent(null, true); // Mostrar notificación de éxito para interacciones del usuario
}

// Versión silenciosa para llamadas automáticas internas
function actualizarDesdeControlesSilent(forceChamber = null, showSuccessNotification = false) {
    
    // Cámara: usar la forzada si se proporciona, sino leer del DOM
    let camara = forceChamber || 'diputados';
    
    if (!forceChamber) {
        const activeChamber = document.querySelector('.master-toggle.active');
        if (activeChamber) {
            const val = activeChamber.getAttribute('data-chamber');
            if (val === 'senadores' || val === 'senado') camara = 'senado';
            else camara = 'diputados';
        }
    }
    
    console.log('[DEBUG]  actualizarDesdeControlesSilent - cámara detectada/forzada:', camara, 'forceChamber:', forceChamber);
    // Actualiza el dropdown de año según la cámara
    const yearSelect = document.getElementById('year-select');
    if (yearSelect) {
        let years = camara === 'senado' ? [2018, 2024] : [2018, 2021, 2024];
        const currentOptions = Array.from(yearSelect.options).map(opt => parseInt(opt.value, 10));
        if (JSON.stringify(currentOptions) !== JSON.stringify(years)) {
            // Preserve current selection if user explicitly chose an year
            const prevValue = yearSelect.value;
            const userSelected = yearSelect.dataset && yearSelect.dataset.userSelected === 'true';
            yearSelect.innerHTML = years.map(y => `<option value="${y}">${y}</option>`).join('');
            // If the previous value is still valid, restore it
            if (prevValue && years.includes(parseInt(prevValue, 10))) {
                yearSelect.value = prevValue;
            } else if (userSelected) {
                // If user had selected a year that is no longer in the options, keep the closest newer/older logic
                // but prefer to keep the previous textual value if possible
                const parsedPrev = parseInt(prevValue, 10);
                if (!isNaN(parsedPrev)) {
                    // If parsedPrev not in years, try to pick the nearest year
                    let nearest = years.reduce((a, b) => Math.abs(b - parsedPrev) < Math.abs(a - parsedPrev) ? b : a);
                    yearSelect.value = String(nearest);
                } else {
                    // Fallback to the first year
                    yearSelect.value = String(years[0]);
                }
            } else {
                // No user selection, default to first available
                yearSelect.value = String(years[0]);
            }
        }
    }
    // Año
    let anio = 2018;
    
    // 🆕 LÓGICA PARA COALICIONES - Determinar año por defecto
    const coalitionSwitch = document.getElementById('coalition-switch');
    let coalicionesActivadas = false;
    if (coalitionSwitch) {
        coalicionesActivadas = coalitionSwitch.classList.contains('active');
    }
    
    if (yearSelect) {
        anio = parseInt(yearSelect.value, 10);
        
        // Si las coaliciones están activadas y estamos en el año por defecto, cambiar a 2024
        // If coalitions are active, suggest 2024 only when the user did not explicitly select an year
        const userSelected = yearSelect.dataset && yearSelect.dataset.userSelected === 'true';
        if (!userSelected && coalicionesActivadas && (anio === 2018 || !yearSelect.value)) {
            if (camara === 'diputados') {
                anio = 2024;
                yearSelect.value = '2024';
                console.log('[DEBUG] 🤝 Coaliciones activadas para diputados: estableciendo año 2024');
            } else if (camara === 'senado') {
                anio = 2024;
                yearSelect.value = '2024';
                console.log('[DEBUG] 🤝 Coaliciones activadas para senado: estableciendo año 2024');
            }
        }
    }
    // Modelos válidos
    const modelosValidos = [
        { value: 'vigente', label: 'Vigente' },
        { value: 'plan-a', label: 'Plan A' },
        { value: 'plan-c', label: 'Plan C' },
        { value: 'personalizado', label: 'Personalizado' }
    ];
    const modelSelect = document.getElementById('model-select');
    if (modelSelect) {
        // Si las opciones no coinciden, actualiza
        const currentModelos = Array.from(modelSelect.options).map(opt => opt.value);
        const validModelos = modelosValidos.map(m => m.value);
        if (JSON.stringify(currentModelos) !== JSON.stringify(validModelos)) {
            modelSelect.innerHTML = modelosValidos.map(m => `<option value="${m.value}">${m.label}</option>`).join('');
        }
    }
    // Modelo
    let modelo = 'vigente';
    if (modelSelect) {
        modelo = modelSelect.value;
    }
    // Mapear modelo a los valores esperados por el backend/parquet
    let modeloBackend = modelo;
    if (modelo === 'vigente') modeloBackend = 'vigente';
    else if (modelo === 'plan-a') modeloBackend = 'plan a';
    else if (modelo === 'plan-c') modeloBackend = 'plan c';

    // ===== LEER SISTEMA DE REPARTO (PARA TODOS LOS MODELOS) =====
    const repartoModeRadios = document.querySelectorAll('input[name="reparto-mode"]');
    const repartoMethodSelect = document.getElementById('reparto-method');
    
    let reparto_mode = 'cuota'; // Default
    let reparto_method = 'hare'; // Default
    
    // Leer modo de reparto seleccionado
    for (const radio of repartoModeRadios) {
        if (radio.checked) {
            reparto_mode = radio.value; // "cuota" o "divisor"
            break;
        }
    }
    
    // Leer método específico
    if (repartoMethodSelect) {
        reparto_method = repartoMethodSelect.value;
    }
    
    console.log('[DEBUG] Sistema de reparto exclusivo (global):', { reparto_mode, reparto_method });

    // Si el modelo es personalizado, obtener el valor del slider de magnitud, sobrerrepresentación, umbral y regla electoral
    if (modelo === 'personalizado') {
        const magnitudInput = document.getElementById('input-magnitud');
        let magnitud;
        if (magnitudInput && magnitudInput.value) {
            magnitud = parseInt(magnitudInput.value, 10);
        } else {
            // Valor por defecto: vigente diputados=500, senado=128
            magnitud = (camara === 'senado') ? 128 : 500;
        }
        const overrepInput = document.getElementById('overrep-slider');
        const overrepSwitch = document.getElementById('overrep-switch');
        let sobrerrepresentacion = undefined;
        if (overrepSwitch && overrepSwitch.classList.contains('active') && overrepInput) {
            sobrerrepresentacion = parseFloat(overrepInput.value);
        }
        const thresholdInput = document.getElementById('threshold-slider');
        const thresholdSwitch = document.getElementById('threshold-switch');
        let umbral = 0;
        
        console.log('[DEBUG]  UMBRAL DEBUG:', {
            thresholdInputFound: !!thresholdInput,
            thresholdSwitchFound: !!thresholdSwitch,
            switchActive: thresholdSwitch ? thresholdSwitch.classList.contains('active') : false,
            sliderValue: thresholdInput ? thresholdInput.value : 'N/A',
            camara: camara,
            modelo: modelo
        });
        
        if (thresholdSwitch && thresholdSwitch.classList.contains('active')) {
            umbral = thresholdInput ? parseFloat(thresholdInput.value) : 0;
            if (isNaN(umbral)) umbral = 0;
            
            // Validación robusta de rangos
            let umbralStatus = 'normal';
            if (umbral > 10) {
                umbralStatus = 'muy_alto';
                console.log('[DEBUG]  UMBRAL MUY ALTO:', umbral, '% - Puede eliminar todos los partidos');
            } else if (umbral > 5) {
                umbralStatus = 'alto';
                console.log('[DEBUG]  UMBRAL ALTO:', umbral, '% - Puede reducir significativamente los partidos');
            } else {
                console.log('[DEBUG] UMBRAL NORMAL:', umbral, '%');
            }
            
            console.log('[DEBUG]  UMBRAL ACTIVADO:', umbral, 'Status:', umbralStatus);
        } else {
            umbral = 0;
            console.log('[DEBUG]  UMBRAL DESACTIVADO (switch off o no encontrado)');
        }
        const electoralRuleRadio = document.querySelector('input[name="electoral-rule"]:checked');
        let sistema = electoralRuleRadio ? electoralRuleRadio.value : undefined;
        
        //  LEER TODOS LOS SLIDERS SIEMPRE (sin condicionar por sistema)
        let mr_seats = undefined;
        let rp_seats = undefined; 
        let pm_seats = undefined;
        let escanos_totales = undefined;
        
        //  DEBUG: Verificar qué sliders están disponibles
        console.log('[DEBUG]  SLIDERS DISPONIBLES:', {
            'input-mr': !!document.getElementById('input-mr'),
            'input-rp': !!document.getElementById('input-rp'), 
            'magnitude-slider': !!document.getElementById('magnitude-slider'),
            'total-seats-slider': !!document.getElementById('total-seats-slider'),
            'seats-slider': !!document.getElementById('seats-slider'),
            'chamber-size-slider': !!document.getElementById('chamber-size-slider')
        });
        
        // Leer slider MR (mayoría relativa)
        const mrSlider = document.getElementById('input-mr');
        if (mrSlider) {
            mr_seats = Math.round(parseFloat(mrSlider.value));
            console.log('[DEBUG]  MR Slider leído:', mr_seats);
        }
        
        // Leer slider RP (representación proporcional) 
        const rpSlider = document.getElementById('input-rp');
        if (rpSlider) {
            rp_seats = Math.round(parseFloat(rpSlider.value));
            console.log('[DEBUG]  RP Slider leído:', rp_seats);
        }
        
        // Leer slider PM (primera minoría) - solo si está activo
        const pmSwitch = document.getElementById('first-minority-switch');
        const pmSlider = document.getElementById('input-first-minority');
        if (pmSwitch && pmSlider && pmSwitch.getAttribute('data-switch') === 'On') {
            pm_seats = Math.round(parseFloat(pmSlider.value));
            console.log('[DEBUG]  PM Slider leído:', pm_seats);
        } else {
            console.log('[DEBUG]  PM Slider NO activo o no encontrado');
        }
        
        //  BUSCAR SLIDER DE ESCAÑOS TOTALES (múltiples IDs posibles)
        const possibleTotalSliders = [
            'input-magnitud',        //  ID CORRECTO del ControlSidebar
            'magnitude-slider',
            'total-seats-slider', 
            'seats-slider',
            'chamber-size-slider',
            'escanos-slider',
            'size-slider'
        ];
        
        let totalSeatsSlider = null;
        let sliderFound = null;
        
        for (const sliderId of possibleTotalSliders) {
            const slider = document.getElementById(sliderId);
            if (slider) {
                totalSeatsSlider = slider;
                sliderFound = sliderId;
                break;
            }
        }
        
        if (totalSeatsSlider) {
            escanos_totales = Math.round(parseFloat(totalSeatsSlider.value));
            console.log('[DEBUG]  Escaños Totales leído desde', sliderFound + ':', escanos_totales, '| Valor crudo:', totalSeatsSlider.value);
        } else {
            console.log('[DEBUG]  NO SE ENCONTRÓ slider de escaños totales en ninguno de estos IDs:', possibleTotalSliders);
            
            //  FALLBACK: Usar la magnitud que viene como parámetro
            if (typeof magnitud !== 'undefined' && magnitud !== null) {
                escanos_totales = Math.round(magnitud);
                console.log('[DEBUG]  FALLBACK: Usando magnitud como escanos_totales:', escanos_totales, '| Magnitud original:', magnitud);
            }
        }
        
        console.log('[DEBUG]  SISTEMA ELECTORAL:', sistema);
        
        //  VALIDACIÓN ROBUSTA DE ESCAÑOS TOTALES
        if (escanos_totales && !isNaN(escanos_totales)) {
            if (escanos_totales < 50) {
                console.warn('[DEBUG]  ESCAÑOS TOTALES MUY BAJO:', escanos_totales, '- Verificar configuración');
            } else if (escanos_totales > 1000) {
                console.warn('[DEBUG]  ESCAÑOS TOTALES MUY ALTO:', escanos_totales, '- Posible error');
            } else {
                console.log('[DEBUG]  ESCAÑOS TOTALES VÁLIDO:', escanos_totales);
            }
        }
        
        console.log('[DEBUG]  VALORES SLIDERS:', { mr_seats, rp_seats, escanos_totales });
        
        // CORRECCIÓN: Ajustar mr_seats y rp_seats según el sistema electoral
        if (sistema === 'mr') {
            // Sistema mayoría relativa pura: por defecto todos los escaños van a MR,
            // pero RESPETAR el valor si fue proporcionado explícitamente por el caller/UI.
            const chamberCap = camara === 'senado' ? 64 : 300;
            if (typeof mr_seats === 'undefined' || mr_seats === null) {
                mr_seats = escanos_totales;
                console.log('[DEBUG]  SISTEMA MR: mr_seats no proporcionado → usando escanos_totales:', mr_seats);
            } else {
                // Si el usuario pasó un mr_seats menor, respetarlo (pero redondear y clamar)
                mr_seats = Math.round(Number(mr_seats) || 0);
                console.log('[DEBUG]  SISTEMA MR: mr_seats proporcionado por UI:', mr_seats);
            }
            // Aplicar límites: nunca superar escanos_totales ni el tope de la cámara
            mr_seats = Math.min(mr_seats, escanos_totales, chamberCap);
            // rp_seats es lo que quede (siempre >= 0)
            rp_seats = Math.max(0, Math.round(Number(escanos_totales || 0)) - Math.round(Number(mr_seats || 0)));
            console.log('[DEBUG]  SISTEMA MR: mr_seats final:', mr_seats, ', rp_seats final:', rp_seats);
        } else if (sistema === 'rp') {
            // Sistema representación proporcional pura: todos los escaños van a RP
            mr_seats = 0;
            rp_seats = escanos_totales;
            console.log('[DEBUG]  SISTEMA RP: mr_seats ajustado a', mr_seats, ', rp_seats a', rp_seats);
        }
        // Para sistema 'mixto', usar los valores de los sliders tal como están
        
        // Leer tope de escaños por partido
        const seatCapSwitch = document.getElementById('seat-cap-switch');
        const seatCapInput = document.getElementById('seat-cap-input');
        let max_seats_per_party = undefined;
        if (seatCapSwitch && seatCapSwitch.classList.contains('active') && seatCapInput) {
            max_seats_per_party = parseInt(seatCapInput.value, 10);
            console.log('[DEBUG]  TOPE DE ESCAÑOS POR PARTIDO ACTIVO:', max_seats_per_party);
        } else {
            console.log('[DEBUG] Tope de escaños por partido NO activo');
        }
        
        // Leer toggle de coaliciones
        const coalitionSwitch = document.getElementById('coalition-switch');
        let usar_coaliciones = true; // Por defecto activado
        if (coalitionSwitch) {
            usar_coaliciones = coalitionSwitch.classList.contains('active');
            console.log('[DEBUG]  COALICIONES:', usar_coaliciones ? 'ACTIVADAS' : 'DESACTIVADAS');
        } else {
            console.log('[DEBUG]  Coalition switch no encontrado, usando valor por defecto: true');
        }
        
        //  CORRECCIÓN CRÍTICA: Usar escanos_totales como magnitud si está definido
        let magnitudFinal = magnitud;
        if (typeof escanos_totales !== 'undefined' && escanos_totales !== null) {
            magnitudFinal = escanos_totales;
            console.log('[DEBUG]  USANDO escanos_totales como magnitud:', escanos_totales, '(en lugar de', magnitud, ')');
        }
        
        console.log('[DEBUG]  PARÁMETROS FINALES ANTES DE ENVIAR:', {
            anio, camara, modelo: modeloBackend, 
            magnitudOriginal: magnitud,
            magnitudFinal: magnitudFinal,
            escanos_totales,
            mr_seats, rp_seats,
            sobrerrepresentacion, umbral, sistema,
            reparto_mode, reparto_method, max_seats_per_party,
            usar_coaliciones
        });
        
        cargarSimulacion({
            anio, camara, modelo: modeloBackend, magnitud: magnitudFinal, 
            sobrerrepresentacion, umbral, sistema, 
            mr_seats, rp_seats, pm_seats, escanos_totales,  //  Nuevos parámetros
            reparto_mode, reparto_method, max_seats_per_party,
            usar_coaliciones,
            silentLoad: !showSuccessNotification,  // Mostrar notificación de éxito si es interacción del usuario
            porcentajes_redistribucion: window.porcentajesTemporales || null  // 🆕 Incluir porcentajes si existen
        });
    } else {
        // Estado por defecto: vigente diputados=500, senado=128
        let magnitud = (camara === 'senado') ? 128 : 500;
        cargarSimulacion({
            anio, camara, modelo: modeloBackend, magnitud, 
            reparto_mode, reparto_method,
            silentLoad: !showSuccessNotification,
            porcentajes_redistribucion: window.porcentajesTemporales || null  // 🆕 Incluir porcentajes si existen
        });
    }
    
    // 🧹 Limpiar porcentajes temporales después de usar
    if (window.porcentajesTemporales) {
        console.log('[DEBUG] 🗳️ Porcentajes de redistribución enviados:', window.porcentajesTemporales);
        delete window.porcentajesTemporales;
    }
}

//  EXPONER FUNCIÓN GLOBALMENTE PARA DEBUGGING
window.actualizarDesdeControles = actualizarDesdeControles;
window.actualizarDesdeControlesSilent = actualizarDesdeControlesSilent;

// =====  DEBUG HELPER - ANTI-CACHÉ =====
window.electoralDebugger = {
    //  Ver estado actual de componentes
    getComponentState() {
        console.log(' ESTADO ACTUAL DE COMPONENTES:');
        
        const seatChart = document.querySelector('seat-chart');
        const indicadores = document.querySelectorAll('.indicadores-resumen indicador-box');
        
        if (seatChart) {
            console.log(' SeatChart:', {
                hasData: !!seatChart.getAttribute('data'),
                dataKey: seatChart.getAttribute('data-key'),
                dataLength: seatChart.getAttribute('data') ? JSON.parse(seatChart.getAttribute('data')).length : 0
            });
        }
        
        console.log(' KPIs:', Array.from(indicadores).map((ind, idx) => ({
            index: idx,
            valor: ind.getAttribute('valor'),
            dataKey: ind.getAttribute('data-key')
        })));
        
        return { seatChart, indicadores };
    },
    
    //  Forzar refresh manual (Solución Nuclear)
    forceRefresh() {
        console.log(' FORZANDO REFRESH NUCLEAR...');
        
        // Limpiar completamente los componentes
        const seatChart = document.querySelector('seat-chart');
        const indicadores = document.querySelectorAll('.indicadores-resumen indicador-box');
        
        if (seatChart) {
            seatChart.removeAttribute('data');
            seatChart.removeAttribute('data-key');
            // Forzar re-render removiendo y volviendo a añadir
            const parent = seatChart.parentNode;
            const nextSibling = seatChart.nextSibling;
            parent.removeChild(seatChart);
            setTimeout(() => {
                parent.insertBefore(seatChart, nextSibling);
                console.log(' SeatChart recreado');
            }, 100);
        }
        
        indicadores.forEach((ind, idx) => {
            ind.removeAttribute('data-key');
            ind.setAttribute('valor', '');
            setTimeout(() => {
                console.log(` KPI ${idx} limpiado`);
            }, 50);
        });
        
        // Triggear una nueva carga después de limpiar
        setTimeout(() => {
            console.log(' Ejecutando actualizarDesdeControles después del refresh...');
            actualizarDesdeControlesSilent();
        }, 200);
    },
    
    //  Monitorear cambios en tiempo real
    startMonitoring() {
        console.log(' INICIANDO MONITOREO EN TIEMPO REAL...');
        
        // Observer para cambios en seat-chart
        const seatChart = document.querySelector('seat-chart');
        if (seatChart) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && 
                        (mutation.attributeName === 'data' || mutation.attributeName === 'data-key')) {
                        console.log(' SeatChart actualizado:', {
                            timestamp: new Date().toISOString(),
                            attribute: mutation.attributeName,
                            newValue: mutation.target.getAttribute(mutation.attributeName)?.slice(0, 50) + '...'
                        });
                    }
                });
            });
            
            observer.observe(seatChart, { 
                attributes: true, 
                attributeFilter: ['data', 'data-key'] 
            });
        }
        
        // Observer para KPIs
        const indicadores = document.querySelectorAll('.indicadores-resumen indicador-box');
        indicadores.forEach((ind, idx) => {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && 
                        (mutation.attributeName === 'valor' || mutation.attributeName === 'data-key')) {
                        console.log(` KPI ${idx} actualizado:`, {
                            timestamp: new Date().toISOString(),
                            attribute: mutation.attributeName,
                            newValue: mutation.target.getAttribute(mutation.attributeName)
                        });
                    }
                });
            });
            
            observer.observe(ind, { 
                attributes: true, 
                attributeFilter: ['valor', 'data-key'] 
            });
        });
        
        console.log(' Monitoreo activo. Los cambios aparecerán en la consola.');
    },
    
    //  Test de conectividad
    async testConnectivity() {
        console.log(' TESTING CONECTIVIDAD...');
        
        const testUrls = [
            'https://back-electoral.onrender.com/procesar/diputados?anio=2018&plan=A',
            'https://back-electoral.onrender.com/procesar/senado?anio=2018&plan=A',
            'https://back-electoral.onrender.com/seat-chart/diputados/2018?plan=A',
            'https://back-electoral.onrender.com/kpis/diputados/2018?plan=A'
        ];
        
        for (const url of testUrls) {
            try {
                const timestamp = Date.now();
                const testUrl = `${url}&_t=${timestamp}`;
                const response = await fetch(testUrl, {
                    headers: {
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache',
                        'Expires': '0'
                    }
                });
                
                console.log(` ${url}: ${response.status} ${response.statusText}`);
                
                if (response.ok) {
                    const data = await response.json();
                    console.log(`    Datos recibidos: ${JSON.stringify(data).length} caracteres`);
                }
            } catch (error) {
                console.error(` ${url}: ${error.message}`);
            }
        }
    },
    
    //  TEST ESPECÍFICO PARA DIPUTADOS
    testDiputados() {
        console.log(' TESTING DIPUTADOS ESPECÍFICAMENTE...');
        
        // Cambiar a diputados
        const diputadosBtn = document.querySelector('[data-chamber="diputados"]');
        if (diputadosBtn) {
            diputadosBtn.click();
            console.log(' Clicked Diputados button');
        } else {
            console.error(' No se encontró botón de diputados');
        }
        
        setTimeout(() => {
            // Cambiar a personalizado
            const modelSelect = document.getElementById('model-select');
            if (modelSelect) {
                modelSelect.value = 'personalizado';
                modelSelect.dispatchEvent(new Event('change'));
                console.log(' Changed to personalizado');
            }
            
            setTimeout(() => {
                // Llamar directamente la función
                console.log(' Calling actualizarDesdeControles directly...');
                if (typeof actualizarDesdeControlesSilent === 'function') {
                    actualizarDesdeControlesSilent();
                } else {
                    console.error(' actualizarDesdeControlesSilent no está disponible');
                }
            }, 500);
        }, 500);
    },
    
    //  TEST BRUTAL DIRECTO AL BACKEND
    testDiputadosBrutal() {
        console.log(' TEST BRUTAL DIRECTO AL BACKEND...');
        
        const url = 'https://back-electoral.onrender.com/procesar/diputados?anio=2018&plan=personalizado&umbral=0&max_seats_per_party=8&sistema=mixto&mr_seats=250&rp_seats=250&escanos_totales=500&quota_method=hare&divisor_method=dhondt&_t=' + Date.now();
        
        console.log(' URL de prueba:', url);
        
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            }
        })
        .then(resp => {
            console.log(' Status:', resp.status);
            return resp.json();
        })
        .then(data => {
            console.log(' RESPUESTA BRUTAL:', data);
            
            // Forzar actualización directa del seat-chart
            const seatChart = document.querySelector('seat-chart');
            if (seatChart && data.seat_chart) {
                seatChart.setAttribute('data', JSON.stringify(data.seat_chart));
                seatChart.setAttribute('data-key', 'brutal_test_' + Date.now());
                console.log(' SeatChart actualizado brutalmente');
            }
        })
        .catch(err => {
            console.error(' Error en test brutal:', err);
        });
    }
};

//  Comandos rápidos para la consola
console.log(`
 ANTI-CACHÉ CONFIGURADO! 

Comandos disponibles en la consola:
• electoralDebugger.getComponentState() - Ver estado actual
• electoralDebugger.forceRefresh() - Refresh nuclear (last resort)  
• electoralDebugger.startMonitoring() - Monitorear cambios en tiempo real
• electoralDebugger.testConnectivity() - Test de conectividad
• electoralDebugger.testDiputados() -  TEST ESPECÍFICO DIPUTADOS
• electoralDebugger.testDiputadosBrutal() -  TEST BRUTAL BYPASS TOTAL

Mejoras implementadas:
Timestamp único en cada request
Headers no-cache forzados  
Keys únicas para re-render
Content hashing para verificar cambios
Custom events para forzar actualización
Debug helper completo
Request cancellation system
Bypass directo de componentes
Event listeners directos

¡El problema de caché debería estar resuelto! 
`);
