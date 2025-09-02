// Electoral Dashboard JavaScript - Clean Version
console.log('Loading Electoral Dashboard...');

// ===== MAIN INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    // Disparar actualización al cambiar método de reparto (cuota o divisor)
    const quotaMethodSelect = document.getElementById('quota-method');
    if (quotaMethodSelect) {
        quotaMethodSelect.addEventListener('change', function() {
            const modelSelect = document.getElementById('model-select');
            if (modelSelect && modelSelect.value === 'personalizado') {
                actualizarDesdeControlesDebounced();
            }
        });
    }
    const divisorMethodSelect = document.getElementById('divisor-method');
    if (divisorMethodSelect) {
        divisorMethodSelect.addEventListener('change', function() {
            const modelSelect = document.getElementById('model-select');
            if (modelSelect && modelSelect.value === 'personalizado') {
                actualizarDesdeControlesDebounced();
            }
        });
    }
    // Radios de regla electoral: solo dispara actualización si el modelo es personalizado
    const electoralRuleRadios = document.querySelectorAll('input[name="electoral-rule"]');
    electoralRuleRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const modelSelect = document.getElementById('model-select');
            if (modelSelect && modelSelect.value === 'personalizado') {
                actualizarDesdeControlesDebounced();
            }
        });
    });
    // Slider de umbral: solo dispara actualización si el modelo es personalizado
    const thresholdInput = document.getElementById('threshold-slider');
    if (thresholdInput) {
        thresholdInput.addEventListener('input', function() {
            const modelSelect = document.getElementById('model-select');
            if (modelSelect && modelSelect.value === 'personalizado') {
                actualizarDesdeControlesDebounced();
            }
        });
    }
    // Slider de sobrerrepresentación: solo dispara actualización si el modelo es personalizado
    const overrepInput = document.getElementById('overrep-slider');
    if (overrepInput) {
        overrepInput.addEventListener('input', function() {
            const modelSelect = document.getElementById('model-select');
            if (modelSelect && modelSelect.value === 'personalizado') {
                actualizarDesdeControlesDebounced();
            }
        });
    }
    // Slider de tope de escaños por partido: solo dispara actualización si el modelo es personalizado
    const seatCapInput = document.getElementById('seat-cap-input');
    if (seatCapInput) {
        seatCapInput.addEventListener('input', function() {
            const modelSelect = document.getElementById('model-select');
            if (modelSelect && modelSelect.value === 'personalizado') {
                actualizarDesdeControlesDebounced();
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

async function cargarSimulacion({anio = 2018, camara = 'diputados', modelo = 'vigente', magnitud, umbral = undefined, sobrerrepresentacion = undefined, sistema = undefined, mixto_mr_seats = undefined, quota_method = undefined, divisor_method = undefined, max_seats_per_party = undefined} = {}) {
    try {
        // ✨ ANTI-CACHÉ: Generar timestamp único
        const timestamp = Date.now();
        const requestId = `${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Determinar endpoint basado en la cámara
        const endpoint = camara === 'senado' ? 'procesar/senado' : 'procesar/diputados';
        let url = `https://back-electoral.onrender.com/${endpoint}?anio=${anio}`;
        
        // Agregar plan (equivalente al modelo)
        let plan = 'A'; // Por defecto plan A
        if (modelo === 'personalizado') {
            plan = 'C'; // Plan personalizado
        }
        url += `&plan=${plan}`;
        
        // Solo agregar magnitud si está definida (esto podría ser escanos_totales en la nueva API)
        if (typeof magnitud !== 'undefined' && camara === 'senado') {
            url += `&escanos_totales=${magnitud}`;
        }
        
        // ✨ ANTI-CACHÉ: Añadir timestamp a la URL
        url += `&_t=${timestamp}&_r=${requestId}`;
        
        console.log('[DEBUG] URL generada para petición:', url);
        console.log('[DEBUG] Request ID:', requestId);
        console.log('[DEBUG] Parámetros:', {anio, camara, modelo, magnitud, umbral, sobrerrepresentacion, quota_method, divisor_method, max_seats_per_party});
        
        // Cambiar a POST en lugar de GET
        const resp = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // ✨ ANTI-CACHÉ: Headers que fuerzan no-cache
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                'X-Request-ID': requestId
            }
        });
        
        console.log('[DEBUG] Status de respuesta:', resp.status, resp.statusText);
        
        if (!resp.ok) {
            // Intentar leer el error del backend
            try {
                const errorData = await resp.text();
                console.error('[DEBUG] Error del backend:', errorData);
                throw new Error(`Backend error ${resp.status}: ${errorData}`);
            } catch (parseError) {
                throw new Error(`Error ${resp.status}: ${resp.statusText}`);
            }
        }
        const data = await resp.json();
        console.log('[DEBUG] Respuesta backend:', data);
        
        // Usar los datos que ya vienen en la respuesta principal
        if (data.seat_chart) {
            const seatChart = document.querySelector('seat-chart');
            if (seatChart) {
                // El componente espera un array
                const seatArray = Array.isArray(data.seat_chart) ? data.seat_chart : data.seat_chart.seats || [];
                
                // ✨ ANTI-CACHÉ: Forzar re-render con key única
                const renderKey = `${requestId}_seats`;
                seatChart.setAttribute('data-key', renderKey);
                seatChart.setAttribute('data', JSON.stringify(seatArray));
                
                // ✨ VERIFICAR CAMBIOS REALES: Hash de contenido
                const contentHash = btoa(JSON.stringify(seatArray)).slice(0, 16);
                console.log('[DEBUG] seat-chart actualizado desde respuesta principal');
                console.log('[DEBUG] Content Hash:', contentHash, 'Render Key:', renderKey);
                
                // ✨ FORZAR ACTUALIZACIÓN: Trigger custom event
                seatChart.dispatchEvent(new CustomEvent('force-update', { 
                    detail: { requestId, contentHash, timestamp } 
                }));
            }
        }
        
        if (data.kpis) {
            const indicadores = document.querySelectorAll('.indicadores-resumen indicador-box');
            if (indicadores.length >= 4) {
                // ✨ FORZAR RE-RENDER: Key única para cada indicador
                const kpiKey = `${requestId}_kpis`;
                
                indicadores[0].setAttribute('data-key', `${kpiKey}_1`);
                indicadores[0].setAttribute('valor', data.kpis.total_escanos || 0);
                
                indicadores[1].setAttribute('data-key', `${kpiKey}_2`);
                indicadores[1].setAttribute('valor', `±${(data.kpis.mae_votos_escanos || 0).toFixed(2)}%`);
                
                indicadores[2].setAttribute('data-key', `${kpiKey}_3`);
                indicadores[2].setAttribute('valor', (data.kpis.indice_gallagher || 0).toFixed(2));
                
                indicadores[3].setAttribute('data-key', `${kpiKey}_4`);
                indicadores[3].setAttribute('valor', (data.kpis.total_votos || 0).toLocaleString('es-MX'));
                
                console.log('[DEBUG] KPIs actualizados desde respuesta principal');
                console.log('[DEBUG] KPI Keys:', kpiKey);
                
                // ✨ TRIGGER CUSTOM EVENTS para forzar actualización
                indicadores.forEach((ind, idx) => {
                    ind.dispatchEvent(new CustomEvent('force-update', { 
                        detail: { requestId, index: idx, timestamp } 
                    }));
                });
            }
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
        
    } catch (err) {
        console.error('Error cargando simulación:', err);
    }
}

// Función para cargar datos del seat-chart
async function cargarSeatChart(anio, camara, modelo) {
    try {
        // ✨ ANTI-CACHÉ: Timestamp único
        const timestamp = Date.now();
        const requestId = `${timestamp}_seatChart_${Math.random().toString(36).substr(2, 9)}`;
        
        const plan = modelo === 'personalizado' ? 'C' : 'A';
        let url = `https://back-electoral.onrender.com/seat-chart/${camara}/${anio}?plan=${plan}`;
        
        // ✨ ANTI-CACHÉ: Añadir timestamp
        url += `&_t=${timestamp}&_r=${requestId}`;
        
        console.log('[DEBUG] Cargando seat-chart desde:', url);
        console.log('[DEBUG] Seat-Chart Request ID:', requestId);
        
        const resp = await fetch(url, {
            // ✨ ANTI-CACHÉ: Headers no-cache
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
            
            // ✨ FORZAR RE-RENDER: Key única
            const renderKey = `${requestId}_fallback_seats`;
            seatChart.setAttribute('data-key', renderKey);
            seatChart.setAttribute('data', JSON.stringify(seatArray));
            
            // ✨ VERIFICAR CAMBIOS: Content hash
            const contentHash = btoa(JSON.stringify(seatArray)).slice(0, 16);
            console.log('[DEBUG] seat-chart actualizado correctamente con array:', seatArray);
            console.log('[DEBUG] Fallback Content Hash:', contentHash, 'Render Key:', renderKey);
            
            // ✨ FORZAR ACTUALIZACIÓN
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
        // ✨ ANTI-CACHÉ: Timestamp único
        const timestamp = Date.now();
        const requestId = `${timestamp}_kpis_${Math.random().toString(36).substr(2, 9)}`;
        
        const plan = modelo === 'personalizado' ? 'C' : 'A';
        let url = `https://back-electoral.onrender.com/kpis/${camara}/${anio}?plan=${plan}`;
        
        // ✨ ANTI-CACHÉ: Añadir timestamp
        url += `&_t=${timestamp}&_r=${requestId}`;
        
        console.log('[DEBUG] Cargando KPIs desde:', url);
        console.log('[DEBUG] KPIs Request ID:', requestId);
        
        const resp = await fetch(url, {
            // ✨ ANTI-CACHÉ: Headers no-cache
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
                // ✨ FORZAR RE-RENDER: Key única para cada indicador
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
                
                // ✨ TRIGGER CUSTOM EVENTS para forzar actualización
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
function actualizarDesdeControlesDebounced() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(actualizarDesdeControles, 120);
}


document.addEventListener('DOMContentLoaded', function() {
    // Inicializa con valores actuales
    actualizarDesdeControles();

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
            actualizarDesdeControlesDebounced();
        });
    }
    if (modelSelect) {
        modelSelect.addEventListener('change', actualizarDesdeControlesDebounced);
    }
    // También actualizar modelos si cambia la cámara
    const chamberToggles = document.querySelectorAll('.master-toggle');
    chamberToggles.forEach(btn => {
        btn.addEventListener('click', function() {
            setTimeout(() => {
                updateModelosDisponibles();
                actualizarDesdeControlesDebounced();
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
                actualizarDesdeControlesDebounced();
            }
        });
    }
});


function actualizarDesdeControles() {
    // Cámara
    let camara = 'diputados';
    const activeChamber = document.querySelector('.master-toggle.active');
    if (activeChamber) {
        const val = activeChamber.getAttribute('data-chamber');
        if (val === 'senadores' || val === 'senado') camara = 'senado';
        else camara = 'diputados';
    }
    // Actualiza el dropdown de año según la cámara
    const yearSelect = document.getElementById('year-select');
    if (yearSelect) {
        let years = camara === 'senado' ? [2018, 2024] : [2018, 2021, 2024];
        const currentOptions = Array.from(yearSelect.options).map(opt => parseInt(opt.value, 10));
        if (JSON.stringify(currentOptions) !== JSON.stringify(years)) {
            yearSelect.innerHTML = years.map(y => `<option value="${y}">${y}</option>`).join('');
        }
    }
    // Año
    let anio = 2018;
    if (yearSelect) {
        anio = parseInt(yearSelect.value, 10);
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
        if (thresholdSwitch && thresholdSwitch.classList.contains('active')) {
            umbral = thresholdInput ? parseFloat(thresholdInput.value) : 0;
            if (isNaN(umbral)) umbral = 0;
        } else {
            umbral = 0;
        }
        const electoralRuleRadio = document.querySelector('input[name="electoral-rule"]:checked');
        let sistema = electoralRuleRadio ? electoralRuleRadio.value : undefined;
        let mixto_mr_seats = undefined;
        if (sistema === 'mixto') {
            const mrSlider = document.getElementById('input-mr');
            mixto_mr_seats = mrSlider ? parseInt(mrSlider.value, 10) : undefined;
        }
        // Leer métodos de reparto
        const quotaMethodSelect = document.getElementById('quota-method');
        const divisorMethodSelect = document.getElementById('divisor-method');
        let quota_method = quotaMethodSelect ? quotaMethodSelect.value : 'hare';
        let divisor_method = divisorMethodSelect ? divisorMethodSelect.value : 'dhondt';
        
        // Leer tope de escaños por partido
        const seatCapSwitch = document.getElementById('seat-cap-switch');
        const seatCapInput = document.getElementById('seat-cap-input');
        let max_seats_per_party = undefined;
        if (seatCapSwitch && seatCapSwitch.classList.contains('active') && seatCapInput) {
            max_seats_per_party = parseInt(seatCapInput.value, 10);
        }
        
        cargarSimulacion({anio, camara, modelo: modeloBackend, magnitud, sobrerrepresentacion, umbral, sistema, mixto_mr_seats, quota_method, divisor_method, max_seats_per_party});
    } else {
        // Estado por defecto: vigente diputados=500, senado=128
        let magnitud = (camara === 'senado') ? 128 : 500;
    cargarSimulacion({anio, camara, modelo: modeloBackend, magnitud});
    }
}

// ===== 🛠️ DEBUG HELPER - ANTI-CACHÉ =====
window.electoralDebugger = {
    // 🔍 Ver estado actual de componentes
    getComponentState() {
        console.log('🔍 ESTADO ACTUAL DE COMPONENTES:');
        
        const seatChart = document.querySelector('seat-chart');
        const indicadores = document.querySelectorAll('.indicadores-resumen indicador-box');
        
        if (seatChart) {
            console.log('📊 SeatChart:', {
                hasData: !!seatChart.getAttribute('data'),
                dataKey: seatChart.getAttribute('data-key'),
                dataLength: seatChart.getAttribute('data') ? JSON.parse(seatChart.getAttribute('data')).length : 0
            });
        }
        
        console.log('📈 KPIs:', Array.from(indicadores).map((ind, idx) => ({
            index: idx,
            valor: ind.getAttribute('valor'),
            dataKey: ind.getAttribute('data-key')
        })));
        
        return { seatChart, indicadores };
    },
    
    // 🔄 Forzar refresh manual (Solución Nuclear)
    forceRefresh() {
        console.log('🚨 FORZANDO REFRESH NUCLEAR...');
        
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
                console.log('✅ SeatChart recreado');
            }, 100);
        }
        
        indicadores.forEach((ind, idx) => {
            ind.removeAttribute('data-key');
            ind.setAttribute('valor', '🔄');
            setTimeout(() => {
                console.log(`✅ KPI ${idx} limpiado`);
            }, 50);
        });
        
        // Triggear una nueva carga después de limpiar
        setTimeout(() => {
            console.log('🔄 Ejecutando actualizarDesdeControles después del refresh...');
            actualizarDesdeControles();
        }, 200);
    },
    
    // 📊 Monitorear cambios en tiempo real
    startMonitoring() {
        console.log('👀 INICIANDO MONITOREO EN TIEMPO REAL...');
        
        // Observer para cambios en seat-chart
        const seatChart = document.querySelector('seat-chart');
        if (seatChart) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && 
                        (mutation.attributeName === 'data' || mutation.attributeName === 'data-key')) {
                        console.log('🔔 SeatChart actualizado:', {
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
                        console.log(`🔔 KPI ${idx} actualizado:`, {
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
        
        console.log('✅ Monitoreo activo. Los cambios aparecerán en la consola.');
    },
    
    // 🧪 Test de conectividad
    async testConnectivity() {
        console.log('🧪 TESTING CONECTIVIDAD...');
        
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
                
                console.log(`✅ ${url}: ${response.status} ${response.statusText}`);
                
                if (response.ok) {
                    const data = await response.json();
                    console.log(`   📦 Datos recibidos: ${JSON.stringify(data).length} caracteres`);
                }
            } catch (error) {
                console.error(`❌ ${url}: ${error.message}`);
            }
        }
    }
};

// 🎯 Comandos rápidos para la consola
console.log(`
🚀 ANTI-CACHÉ CONFIGURADO! 

Comandos disponibles en la consola:
• electoralDebugger.getComponentState() - Ver estado actual
• electoralDebugger.forceRefresh() - Refresh nuclear (last resort)  
• electoralDebugger.startMonitoring() - Monitorear cambios en tiempo real
• electoralDebugger.testConnectivity() - Test de conectividad

Mejoras implementadas:
✅ Timestamp único en cada request
✅ Headers no-cache forzados  
✅ Keys únicas para re-render
✅ Content hashing para verificar cambios
✅ Custom events para forzar actualización
✅ Debug helper completo

¡El problema de caché debería estar resuelto! 🎉
`);
