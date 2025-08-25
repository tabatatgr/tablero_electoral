// Electoral Dashboard JavaScript - Clean Version
console.log('Loading Electoral Dashboard...');

// ===== MAIN INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
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
    console.log('🔧 Initializing enhanced sidebar...');
    
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
                console.log(`📱 Sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`);
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
        console.log('📱 Mobile sidebar closed');
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

console.log('📜 Electoral Dashboard script loaded');

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

async function cargarSimulacion({anio = 2018, camara = 'diputados', modelo = 'vigente'} = {}) {
    try {
    const url = `https://backend-electoral-fw8f.onrender.com/simulacion?anio=${anio}&camara=${camara}&modelo=${modelo}`;
        const resp = await fetch(url);
        if (!resp.ok) throw new Error('Error al obtener datos');
        const data = await resp.json();
        // Actualiza el seat chart
        const seatChart = document.querySelector('seat-chart');
        if (seatChart && data.seatChart) {
            seatChart.setAttribute('data', JSON.stringify(data.seatChart));
        }
        // Actualiza los KPIs usando los <indicador-box> en el orden correcto
        if (data.kpis) {
            const { total_seats, gallagher, mae_votos_vs_escanos, total_votos } = data.kpis;
            // Busca los indicador-box en el slot de dashboard-title
            const indicadores = document.querySelectorAll('.indicadores-resumen indicador-box');
            if (indicadores.length >= 4) {
                indicadores[0].setAttribute('valor', total_seats);
                indicadores[1].setAttribute('valor', `±${mae_votos_vs_escanos.toFixed(2)}%`);
                indicadores[2].setAttribute('valor', gallagher.toFixed(2));
                indicadores[3].setAttribute('valor', total_votos.toLocaleString('es-MX'));
            }
        }
        console.log('Datos cargados:', data);
    } catch (err) {
        console.error('Error cargando simulación:', err);
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
    if (yearSelect) {
        yearSelect.addEventListener('change', actualizarDesdeControlesDebounced);
    }
    // Modelo
    const modelSelect = document.getElementById('model-select');
    if (modelSelect) {
        modelSelect.addEventListener('change', actualizarDesdeControlesDebounced);
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
        { value: 'plan-c', label: 'Plan C' }
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
    cargarSimulacion({anio, camara, modelo: modeloBackend});
}
