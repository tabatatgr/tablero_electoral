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
        // Initialize all components
        initializeCollapsibleGroups();
        initializeMasterControls();
        initializeEnhancedSidebar();
        initializeSliders();
        initializeToggles();
        initializeRadioButtons();
        
        console.log('✅ Dashboard initialized successfully!');
    } catch (error) {
        console.error('❌ Error during initialization:', error);
    }
}

// ===== COLLAPSIBLE GROUPS =====
function initializeCollapsibleGroups() {
    console.log('🔧 Initializing collapsible groups...');
    
    const groupToggles = document.querySelectorAll('.group-toggle');
    console.log(`Found ${groupToggles.length} group toggles`);
    
    groupToggles.forEach((toggle, index) => {
        const targetId = toggle.dataset.target;
        const content = document.getElementById(`group-${targetId}`);
        
        if (!content) {
            console.warn(`❌ Content not found for group: ${targetId}`);
            return;
        }
        
        console.log(`✅ Setting up group ${index + 1}: ${targetId}`);
        
        // Set initial state - all collapsed by default
        content.classList.remove('expanded');
        toggle.classList.add('collapsed');
        toggle.classList.remove('expanded');
        
        // Load saved state from localStorage
        const savedState = localStorage.getItem(`group-${targetId}-expanded`);
        if (savedState === 'true') {
            expandGroup(toggle, content);
        } else {
            collapseGroup(toggle, content);
        }
        
        // Add click event listener
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log(`🖱️ Clicked group toggle: ${targetId}`);
            
            const isExpanded = content.classList.contains('expanded');
            
            if (isExpanded) {
                collapseGroup(toggle, content);
                localStorage.setItem(`group-${targetId}-expanded`, 'false');
                console.log(`📁 Collapsed: ${targetId}`);
            } else {
                expandGroup(toggle, content);
                localStorage.setItem(`group-${targetId}-expanded`, 'true');
                console.log(`📂 Expanded: ${targetId}`);
            }
        });
    });
}

function expandGroup(toggle, content) {
    content.classList.add('expanded');
    content.classList.remove('collapsed');
    toggle.classList.add('expanded');
    toggle.classList.remove('collapsed');
}

function collapseGroup(toggle, content) {
    content.classList.remove('expanded');
    content.classList.add('collapsed');
    toggle.classList.remove('expanded');
    toggle.classList.add('collapsed');
}

// ===== MASTER CONTROLS =====
function initializeMasterControls() {
    console.log('🔧 Initializing master controls...');
    
    // Chamber toggle buttons
    const chamberToggles = document.querySelectorAll('.master-toggle[data-chamber]');
    console.log(`Found ${chamberToggles.length} chamber toggles`);
    
    chamberToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            console.log(`🏛️ Chamber selected: ${this.dataset.chamber}`);
            
            // Remove active from all chamber toggles
            chamberToggles.forEach(t => t.classList.remove('active'));
            // Add active to clicked toggle
            this.classList.add('active');
            
            // Update UI based on selected chamber
            const chamber = this.dataset.chamber;
            updateChamberSpecificElements(chamber);
        });
    });
    
    // Year pills
    const yearPills = document.querySelectorAll('.master-pill[data-year]');
    console.log(`Found ${yearPills.length} year pills`);
    
    yearPills.forEach(pill => {
        pill.addEventListener('click', function() {
            console.log(`📅 Year selected: ${this.dataset.year}`);
            yearPills.forEach(p => p.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Model pills
    const modelPills = document.querySelectorAll('.master-pill[data-model]');
    console.log(`Found ${modelPills.length} model pills`);
    
    modelPills.forEach(pill => {
        pill.addEventListener('click', function() {
            console.log(`🧮 Model selected: ${this.dataset.model}`);
            modelPills.forEach(p => p.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// ===== CHAMBER-SPECIFIC ELEMENTS =====
function updateChamberSpecificElements(chamber) {
    console.log(`🔄 Updating chamber-specific elements for: ${chamber}`);
    
    const isDiputados = chamber === 'diputados';
    
    // Show/hide deputy-only elements
    const deputyOnlyElements = document.querySelectorAll('.deputy-only');
    deputyOnlyElements.forEach(element => {
        element.style.display = isDiputados ? 'block' : 'none';
    });
    
    // Update chamber composition title
    const compositionTitle = document.querySelector('.composition-title');
    if (compositionTitle) {
        compositionTitle.textContent = isDiputados 
            ? 'Composición de la Cámara de Diputados' 
            : 'Composición de la Cámara de Senadores';
    }
    
    // Update magnitude slider
    const magnitudSlider = document.getElementById('input-magnitud');
    const magnitudValue = document.getElementById('input-magnitud-value');
    if (magnitudSlider && magnitudValue) {
        const newValue = isDiputados ? 500 : 128;
        magnitudSlider.value = newValue;
        magnitudValue.textContent = newValue;
    }
    
    // Update KPI indicators
    updateKPIIndicators(chamber);
}

// ===== KPI INDICATORS =====
function updateKPIIndicators(chamber) {
    const totalSeatsCard = document.querySelector('.indicator-card.total-seats');
    if (totalSeatsCard) {
        const valueElement = totalSeatsCard.querySelector('.indicator-value');
        const changeElement = totalSeatsCard.querySelector('.indicator-change');
        
        if (valueElement && changeElement) {
            valueElement.textContent = chamber === 'diputados' ? '500' : '128';
            changeElement.textContent = chamber === 'diputados' ? 'Diputados' : 'Senadores';
        }
    }
}

// ===== SLIDERS =====
function initializeSliderComponent(sliderClass, valueSuffix) {
    const sliders = document.querySelectorAll(sliderClass);
    console.log(`Found ${sliders.length} sliders for class: ${sliderClass}`);

    sliders.forEach(slider => {
        const valueBox = document.getElementById(`${slider.id}${valueSuffix}`);
        if (valueBox) {
            // Set initial value
            const value = parseFloat(slider.value);
            valueBox.textContent = `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;

            // Add event listener
            slider.addEventListener('input', function() {
                const updatedValue = parseFloat(this.value);
                valueBox.textContent = `${updatedValue >= 0 ? '+' : ''}${updatedValue.toFixed(1)}%`;
                console.log(`🎚️ Slider updated: ${slider.id} = ${updatedValue}%`);
            });
        }
    });
}

function initializeSliders() {
    console.log('🔧 Initializing all sliders...');

    // Initialize shock sliders
    initializeSliderComponent('.shock-slider', '-value');

    // Initialize magnitude slider
    initializeSliderComponent('#input-magnitud', '-value');

    // Initialize threshold slider
    initializeSliderComponent('#threshold-slider', '-value-box');

    // Initialize MR/RP sliders
    initializeSliderComponent('#input-mr', '-value');
    initializeSliderComponent('#input-rp', '-value');
    initializeSliderComponent('#input-first-minority', '-value');
}

// ===== TOGGLE SWITCHES =====
function initializeToggles() {
    console.log('🔧 Initializing toggle switches...');
    
    const toggleSwitches = document.querySelectorAll('.switch');
    console.log(`Found ${toggleSwitches.length} toggle switches`);
    
    toggleSwitches.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const currentState = this.getAttribute('data-switch');
            const newState = currentState === 'On' ? 'Off' : 'On';
            
            this.setAttribute('data-switch', newState);
            this.setAttribute('aria-checked', newState === 'On');
            
            if (newState === 'On') {
                this.classList.add('active');
            } else {
                this.classList.remove('active');
            }
            
            console.log(`🔄 Toggle switched: ${this.id} = ${newState}`);
        });
    });
}

// ===== RADIO BUTTONS =====
function initializeRadioButtons() {
    console.log('🔧 Initializing native radio buttons...');
    
    // Handle threshold type change
    const thresholdRadios = document.querySelectorAll('input[name="threshold-type"]');
    thresholdRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                console.log(`📻 Threshold type selected: ${this.value}`);
                // Add any specific logic for threshold type change
            }
        });
    });
    
    // Handle electoral rule change
    const ruleRadios = document.querySelectorAll('input[name="electoral-rule"]');
    ruleRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                console.log(`📻 Electoral rule selected: ${this.value}`);
                
                // Show/hide mixto inputs based on selection
                const mixtoInputs = document.getElementById('mixto-inputs');
                if (mixtoInputs) {
                    mixtoInputs.style.display = this.value === 'mixto' ? 'block' : 'none';
                }
                
                // Add any other rule-specific logic here
            }
        });
    });
    
    console.log(`✅ Radio buttons initialized successfully`);
}

// ===== SIDEBAR FUNCTIONALITY =====
function initializeEnhancedSidebar() {
    console.log('🔧 Initializing enhanced sidebar...');
    
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('control-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    
    if (!mobileMenuBtn || !sidebar || !overlay) {
        console.warn('❌ Missing sidebar elements');
        return;
    }
    
    // Mobile menu functionality
    mobileMenuBtn.addEventListener('click', function() {
        console.log('📱 Mobile menu opened');
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
function handleRadioSelection(radioName, selectedValue) {
    // For native radio buttons, we just need to set the checked state
    const selectedRadio = document.querySelector(`input[name="${radioName}"][value="${selectedValue}"]`);
    if (selectedRadio) {
        selectedRadio.checked = true;
        // Trigger change event for any listeners
        selectedRadio.dispatchEvent(new Event('change', { bubbles: true }));
    }
}

function getSelectedRadioValue(radioName) {
    const selectedRadio = document.querySelector(`input[name="${radioName}"]:checked`);
    return selectedRadio ? selectedRadio.value : null;
}

console.log('📜 Electoral Dashboard script loaded');
