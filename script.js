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
