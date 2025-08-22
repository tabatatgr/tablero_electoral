// Electoral Dashboard JavaScript
// Function to toggle deputy-specific steps visibility
function toggleDeputySteps() {
    const isDiputados = document.querySelector('.tab-button.active')?.textContent.includes('diputados');
    
    // Step 4: Sobrerrepresentación (solo diputados)
    const step4 = document.getElementById('step-sobrerrepresentacion');
    const overrepCard = document.getElementById('overrepresentation-card');
    const seatCapCard = document.getElementById('seat-cap-card');
    
    if (step4) step4.style.display = isDiputados ? 'flex' : 'none';
    if (overrepCard) overrepCard.style.display = isDiputados ? 'block' : 'none';
    if (seatCapCard) seatCapCard.style.display = isDiputados ? 'block' : 'none';
    
    // Also hide the parameters grid that contains these cards
    const step4Grid = step4?.nextElementSibling;
    if (step4Grid && step4Grid.classList.contains('parameters-grid')) {
        step4Grid.style.display = isDiputados ? 'grid' : 'none';
    }
    
    // Hide/show primera minoría step based on electoral rule and chamber
    togglePrimeraMinoriaStep();
}

// Function to update step numbers dynamically
function updateStepNumbers() {
    const visibleSteps = document.querySelectorAll('.parameter-step:not([style*="display: none"])');
    visibleSteps.forEach((step, index) => {
        const stepNumber = step.querySelector('.step-number');
        if (stepNumber) {
            stepNumber.textContent = index + 1;
        }
    });
}

// Function to toggle Primera Minoría step visibility
function togglePrimeraMinoriaStep() {
    const isDiputados = document.querySelector('.tab-button.active')?.textContent.includes('diputados');
    const selectedRule = document.querySelector('.radio-option[data-state="On"]')?.querySelector('.radio-label')?.textContent;
    
    // Primera Minoría should only appear for Senadores when rule is Mixto or Mayoría Relativa
    const shouldShowPrimeraMinoria = !isDiputados && (selectedRule === 'Mixto' || selectedRule === 'Mayoría Relativa');
    
    // Create or toggle Primera Minoría step if it doesn't exist
    let primeraMinoriaStep = document.getElementById('primera-minoria-step');
    if (!primeraMinoriaStep && shouldShowPrimeraMinoria) {
        createPrimeraMinoriaStep();
    } else if (primeraMinoriaStep) {
        primeraMinoriaStep.style.display = shouldShowPrimeraMinoria ? 'flex' : 'none';
        const primeraMinoriaGrid = document.getElementById('primera-minoria-grid');
        if (primeraMinoriaGrid) {
            primeraMinoriaGrid.style.display = shouldShowPrimeraMinoria ? 'grid' : 'none';
        }
    }
}

// Function to create Primera Minoría step
function createPrimeraMinoriaStep() {
    const metodStep = document.querySelector('.parameter-step:last-of-type');
    if (!metodStep) return;

    const primeraMinoriaStepHTML = `
        <div class="parameter-step" id="primera-minoria-step">
            <div class="step-number">8</div>
            <div class="step-title">Primera Minoría (Solo Senadores)</div>
        </div>
        <div class="parameters-grid" id="primera-minoria-grid">
            <div class="parameter-card primera-minoria">
                <div class="parameter-title-section">
                    <div class="parameter-title">¿Aplicar regla de primera minoría?</div>
                </div>
                <div class="parameter-content">
                    <div class="control-switch" data-switch="Off" role="switch" aria-checked="false" aria-label="Activar primera minoría" tabindex="0">
                        <div class="switch-slider"></div>
                    </div>
                    <div class="parameter-note">
                        La primera minoría garantiza al menos un senador al segundo partido más votado en cada estado.
                    </div>
                </div>
            </div>
        </div>
    `;

    metodStep.insertAdjacentHTML('afterend', primeraMinoriaStepHTML);
    
    // Add event listener to the new switch
    const newSwitch = document.querySelector('#primera-minoria-step + .parameters-grid .control-switch');
    if (newSwitch) {
        newSwitch.addEventListener('click', function() {
            const currentState = this.getAttribute('data-switch');
            if (currentState === 'On') {
                this.setAttribute('data-switch', 'Off');
                this.setAttribute('aria-checked', 'false');
            } else {
                this.setAttribute('data-switch', 'On');
                this.setAttribute('aria-checked', 'true');
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    
    // Chamber Tab Switching
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all tabs
            tabButtons.forEach(tab => tab.classList.remove('active'));
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Update chamber title
            const chamberTitle = document.querySelector('.composition-title');
            if (this.textContent.includes('diputados')) {
                chamberTitle.textContent = 'Composición de la Cámara de Diputados';
            } else {
                chamberTitle.textContent = 'Composición de la Cámara de Senadores';
            }
            
            // Toggle visibility of deputy-specific steps
            toggleDeputySteps();
            updateStepNumbers();
        });
    });

    // Initialize step visibility on page load
    toggleDeputySteps();
    updateStepNumbers();

    // Year Pills Selection
    const yearPills = document.querySelectorAll('.control-group:first-child .pill-button');
    yearPills.forEach(pill => {
        pill.addEventListener('click', function() {
            yearPills.forEach(p => p.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Model Pills Selection
    const modelPills = document.querySelectorAll('.control-group:last-child .pill-button');
    modelPills.forEach(pill => {
        pill.addEventListener('click', function() {
            modelPills.forEach(p => p.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Toggle Switches
    const switches = document.querySelectorAll('.control-switch');
    switches.forEach(switchEl => {
        switchEl.addEventListener('click', function() {
            const currentState = this.getAttribute('data-switch');
            if (currentState === 'On') {
                this.setAttribute('data-switch', 'Off');
                this.setAttribute('aria-checked', 'false');
            } else {
                this.setAttribute('data-switch', 'On');
                this.setAttribute('aria-checked', 'true');
            }
        });
    });

    // Radio Button Groups
    const radioOptions = document.querySelectorAll('.radio-option');
    radioOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Find the parent parameter card
            const parentCard = this.closest('.parameter-card');
            if (!parentCard) return;

            // Deselect all radio options in this card
            const allOptions = parentCard.querySelectorAll('.radio-option');
            allOptions.forEach(opt => {
                opt.setAttribute('data-state', 'Off');
                const button = opt.querySelector('.radio-button');
                const existingDot = button.querySelector('.radio-dot');
                if (existingDot) {
                    existingDot.remove();
                }
            });

            // Select the clicked option
            this.setAttribute('data-state', 'On');
            const button = this.querySelector('.radio-button');
            
            // Add dot if it doesn't exist
            if (!button.querySelector('.radio-dot')) {
                const dot = document.createElement('div');
                dot.className = 'radio-dot';
                button.appendChild(dot);
            }

            // If this is an electoral rule change, update Primera Minoría visibility
            if (parentCard.classList.contains('rules')) {
                setTimeout(() => {
                    togglePrimeraMinoriaStep();
                    updateStepNumbers();
                }, 100);
            }
        });
    });

    // Form Select Interactions
    const selects = document.querySelectorAll('.form-select');
    selects.forEach(select => {
        select.addEventListener('change', function() {
            console.log('Selected:', this.value);
        });
    });

    // Form Input Interactions
    const inputs = document.querySelectorAll('.form-input');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            console.log('Input value:', this.value);
        });
    });

    // Seat Hover Effects (already handled in CSS)
    const seats = document.querySelectorAll('.seat');
    seats.forEach(seat => {
        seat.addEventListener('click', function() {
            console.log('Seat clicked:', this.className);
        });
    });

    // Generate complete seat visualization with improved amphitheater shape
    function generateCompleteSeats() {
        const seatGrid = document.querySelector('.seat-grid');
        if (!seatGrid) return;

        // Party distribution for senate (128 seats total)
        const distribution = {
            'morena': 69,
            'pan': 22,
            'pri': 16,
            'pt': 8,
            'pvem': 6,
            'mc': 4,
            'prd': 3
        };

        // Clear existing seats
        seatGrid.innerHTML = '';

        let seatCount = 0;
        const totalSeats = 128;
        
        // Improved amphitheater configuration: perfect hemicircle
        const rowConfig = [
            { seats: 8, maxWidth: '35%' },   // Front row - shortest
            { seats: 10, maxWidth: '45%' },  
            { seats: 12, maxWidth: '60%' },  
            { seats: 14, maxWidth: '75%' },  
            { seats: 16, maxWidth: '85%' },  
            { seats: 18, maxWidth: '95%' },  
            { seats: 20, maxWidth: '100%' }, // Back rows - longest
            { seats: 20, maxWidth: '100%' },
            { seats: 10, maxWidth: '100%' }  // Final row with remaining seats
        ];

        // Create party assignment array for better distribution
        const seatAssignments = [];
        for (const [party, count] of Object.entries(distribution)) {
            for (let i = 0; i < count; i++) {
                seatAssignments.push(party);
            }
        }

        rowConfig.forEach((rowData, rowIndex) => {
            if (seatCount >= totalSeats) return;
            
            const rowElement = document.createElement('div');
            rowElement.className = 'seat-row';
            rowElement.style.maxWidth = rowData.maxWidth;

            const seatsInThisRow = Math.min(rowData.seats, totalSeats - seatCount);
            
            for (let col = 0; col < seatsInThisRow; col++) {
                const seat = document.createElement('div');
                seat.className = 'seat';

                // Assign party from pre-shuffled array
                const assignedParty = seatAssignments[seatCount] || 'morena';
                seat.classList.add(assignedParty);
                seat.title = `${assignedParty.toUpperCase()} - Escaño ${seatCount + 1}`;
                
                // Add click handler for interaction
                seat.addEventListener('click', function() {
                    console.log(`Clicked seat ${seatCount + 1}: ${assignedParty.toUpperCase()}`);
                });

                rowElement.appendChild(seat);
                seatCount++;
            }

            seatGrid.appendChild(rowElement);
        });

        console.log(`Generated ${seatCount} seats in hemicircle formation`);
    }

    // Generate complete seat visualization
    generateCompleteSeats();

    // Update results based on current configuration
    function updateResults() {
        // This would typically connect to actual data/calculations
        // For now, we'll keep the static values from the HTML
        console.log('Results updated');
    }

    // Initialize
    updateResults();

    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            // Handle tab navigation for accessibility
            return;
        }
        
        if (e.key === 'Enter' || e.key === ' ') {
            const focused = document.activeElement;
            if (focused.classList.contains('pill-button') || 
                focused.classList.contains('tab-button') ||
                focused.classList.contains('radio-option') ||
                focused.classList.contains('control-switch')) {
                e.preventDefault();
                focused.click();
            }
        }
    });

    // Add loading state management
    function showLoading() {
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <div class="loading-text">Calculando resultados...</div>
            </div>
        `;
        document.body.appendChild(loadingOverlay);
    }

    function hideLoading() {
        const loadingOverlay = document.querySelector('.loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.remove();
        }
    }

    // Simulate data updates
    function simulateCalculation() {
        showLoading();
        setTimeout(() => {
            hideLoading();
            updateResults();
        }, 1500);
    }

    // Trigger calculation when key parameters change
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('form-select') || 
            e.target.classList.contains('form-input')) {
            // Debounce the calculation
            clearTimeout(window.calculationTimeout);
            window.calculationTimeout = setTimeout(simulateCalculation, 500);
        }
    });

    console.log('Electoral Dashboard initialized');

    // Enhanced parameter handling for step-by-step flow
    function initializeParameterSteps() {
        // Step 1: Shock handling
        const shockTypeRadios = document.querySelectorAll('.parameter-card.shocks .radio-option');
        shockTypeRadios.forEach(radio => {
            radio.addEventListener('click', function() {
                handleRadioSelection(shockTypeRadios, this);
                updateShockInputs(this.querySelector('.radio-label').textContent);
            });
        });

        // Step 2: Magnitude handling
        const magnitudeRadios = document.querySelectorAll('.parameter-card.magnitude .radio-option');
        magnitudeRadios.forEach(radio => {
            radio.addEventListener('click', function() {
                handleRadioSelection(magnitudeRadios, this);
                updateMagnitudeConfig(this.querySelector('.radio-label').textContent);
            });
        });

        // Step 3: Threshold handling
        const thresholdRadios = document.querySelectorAll('.parameter-card.threshold .radio-option');
        thresholdRadios.forEach(radio => {
            radio.addEventListener('click', function() {
                handleRadioSelection(thresholdRadios, this);
                updateThresholdType(this.querySelector('.radio-label').textContent);
            });
        });

        // Step 6: Electoral rule handling
        const ruleRadios = document.querySelectorAll('.parameter-card.rules .radio-option');
        ruleRadios.forEach(radio => {
            radio.addEventListener('click', function() {
                handleRadioSelection(ruleRadios, this);
                updateElectoralRule(this.querySelector('.radio-label').textContent);
            });
        });

        // Initialize shock value inputs
        const shockInputs = document.querySelectorAll('.shock-input-group input');
        shockInputs.forEach(input => {
            input.addEventListener('change', function() {
                updateShockValues();
            });
        });

        // Initialize threshold value input
        const thresholdInput = document.querySelector('.parameter-card.threshold-value input');
        if (thresholdInput) {
            thresholdInput.addEventListener('change', function() {
                updateThresholdValue(this.value);
            });
        }

        // Initialize representation limit input
        const repLimitInput = document.querySelector('.parameter-card.overrepresentation input');
        if (repLimitInput) {
            repLimitInput.addEventListener('change', function() {
                updateRepresentationLimit(this.value);
            });
        }

        // Initialize senate seats per state input
        const seatsPerStateInput = document.querySelector('.parameter-card.magnitude-values input');
        if (seatsPerStateInput) {
            seatsPerStateInput.addEventListener('change', function() {
                updateSeatsPerState(this.value);
            });
        }

        // Initialize first minority input
        const firstMinorityInput = document.querySelector('.parameter-card.first-minority input');
        if (firstMinorityInput) {
            firstMinorityInput.addEventListener('change', function() {
                updateFirstMinoritySeats(this.value);
            });
        }
    }

    function updateShockInputs(shockType) {
        console.log(`Shock type selected: ${shockType}`);
        // Update UI based on shock type selection
        const inputGroups = document.querySelectorAll('.shock-input-group');
        if (shockType === 'Delta (PP)') {
            inputGroups.forEach(group => {
                const input = group.querySelector('input');
                input.setAttribute('step', '1');
                input.setAttribute('min', '-50');
                input.setAttribute('max', '50');
                input.value = '0';
            });
        } else {
            inputGroups.forEach(group => {
                const input = group.querySelector('input');
                input.setAttribute('step', '0.1');
                input.setAttribute('min', '0');
                input.setAttribute('max', '5');
                input.value = '1.0';
            });
        }
    }

    function updateMagnitudeConfig(magnitudeType) {
        console.log(`Magnitude type selected: ${magnitudeType}`);
        // Update configuration options based on magnitude selection
    }

    function updateThresholdType(thresholdType) {
        console.log(`Threshold type selected: ${thresholdType}`);
        // Update threshold configuration
    }

    function updateElectoralRule(ruleType) {
        console.log(`Electoral rule selected: ${ruleType}`);
        // Update rule-specific options
    }

    function updateShockValues() {
        const shockValues = {};
        const inputs = document.querySelectorAll('.shock-input-group');
        inputs.forEach(group => {
            const label = group.querySelector('.shock-label').textContent.replace(':', '');
            const value = group.querySelector('input').value;
            shockValues[label] = parseFloat(value);
        });
        console.log('Shock values updated:', shockValues);
        // Trigger simulation update
        updateSimulation();
    }

    function updateThresholdValue(value) {
        console.log(`Threshold value set to: ${value}%`);
        updateSimulation();
    }

    function updateRepresentationLimit(value) {
        console.log(`Representation limit set to: ${value}pp`);
        updateSimulation();
    }

    function updateSeatsPerState(value) {
        console.log(`Seats per state set to: ${value}`);
        const totalSeats = parseInt(value) * 32; // 32 estados
        console.log(`Total senate seats: ${totalSeats}`);
        updateSimulation();
    }

    function updateFirstMinoritySeats(value) {
        console.log(`First minority seats set to: ${value}`);
        updateSimulation();
    }

    function updateSimulation() {
        // Collect all parameter values
        const parameters = collectAllParameters();
        console.log('Running simulation with parameters:', parameters);
        
        // Update KPIs and seat chart
        updateKPIs(parameters);
        updateSeatChart(parameters);
    }

    function collectAllParameters() {
        const seatCapSwitch = document.getElementById('seat-cap-switch');
        const seatCapInput = document.getElementById('seat-cap-input');
        return {
            shockType: getSelectedRadioValue('.parameter-card.shocks'),
            shockValues: getShockValues(),
            magnitudeType: getSelectedRadioValue('.parameter-card.magnitude'),
            seatsPerState: document.querySelector('.parameter-card.magnitude-values input')?.value || 4,
            thresholdType: getSelectedRadioValue('.parameter-card.threshold'),
            thresholdValue: document.querySelector('.parameter-card.threshold-value input')?.value || 3,
            representationLimit: document.querySelector('.parameter-card.overrepresentation input')?.value || 8,
            coalitionsEnabled: document.querySelector('.parameter-card.coalition .control-switch')?.dataset.switch === 'On',
            electoralRule: getSelectedRadioValue('.parameter-card.rules'),
            firstMinorityEnabled: document.querySelector('.parameter-card.first-minority .control-switch')?.dataset.switch === 'On',
            firstMinoritySeats: document.querySelector('.parameter-card.first-minority input')?.value || 1,
            quotaMethod: document.querySelector('#quota-method')?.value || 'hare',
            divisorMethod: document.querySelector('#divisor-method')?.value || 'dhondt',
            districtsEditable: document.querySelector('.parameter-card.districts-phase2 .control-switch')?.dataset.switch === 'On',
            seatCapEnabled: seatCapSwitch && seatCapSwitch.getAttribute('data-switch') === 'On',
            seatCapValue: seatCapInput ? parseInt(seatCapInput.value) : null
        };
    }

    function getShockValues() {
        const values = {};
        const inputs = document.querySelectorAll('.shock-input-group');
        inputs.forEach(group => {
            const label = group.querySelector('.shock-label').textContent.replace(':', '');
            const value = group.querySelector('input').value;
            values[label] = parseFloat(value);
        });
        return values;
    }

    function getSelectedRadioValue(selector) {
        const selectedRadio = document.querySelector(`${selector} .radio-option[data-state="On"]`);
        return selectedRadio ? selectedRadio.querySelector('.radio-label').textContent : null;
    }

    function updateKPIs(parameters) {
        // Simulate KPI calculations based on parameters
        const kpis = calculateKPIs(parameters);
        
        // Update KPI displays
        document.querySelector('.indicator-card.total-seats .indicator-value').textContent = kpis.totalSeats;
        document.querySelector('.indicator-card.votes-vs-seats .indicator-value').textContent = `±${kpis.votesVsSeats}%`;
        document.querySelector('.indicator-card.gallagher-index .indicator-value').textContent = kpis.gallagherIndex;
        document.querySelector('.indicator-card.total-votes .indicator-value').textContent = `${kpis.totalVotes}M`;
        document.querySelector('.indicator-card.thresholds .indicator-value').textContent = `${parameters.thresholdValue}%`;
        document.querySelector('.indicator-card.representation-threshold .indicator-value').textContent = `${parameters.representationLimit}pp`;
    }

    function calculateKPIs(parameters) {
        // Mock calculation - replace with actual electoral simulation logic
        return {
            totalSeats: parameters.seatsPerState * 32,
            votesVsSeats: (Math.random() * 5 + 1).toFixed(1),
            gallagherIndex: (Math.random() * 10 + 2).toFixed(1),
            totalVotes: (60 + Math.random() * 5).toFixed(1)
        };
    }

    function updateSeatChart(parameters) {
        // Update the seat visualization based on parameters
        console.log('Updating seat chart with parameters:', parameters);
        // This would generate new seat arrangements based on the simulation
    }

    initializeParameterSteps();
    initializeShockSliders();
    initializeMagnitudInput();
    initializeThresholdSlider();
    initializeOverrepSlider();
    handleOverrepresentationVisibility();
    handleFirstMinorityVisibility();
    tabButtons.forEach(btn => {
        btn.addEventListener('click', handleOverrepresentationVisibility);
        btn.addEventListener('click', handleFirstMinorityVisibility);
    });

    // Inicializar visibilidad de inputs mixtos
    handleMixtoInputsVisibility();
    // Cambiar visibilidad al seleccionar opción
    ['radio-mixto','radio-mr','radio-rp'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('click', handleMixtoInputsVisibility);
        }
    });

    // Tope de escaños por partido
    handleSeatCapVisibility();
    initializeSeatCapControls();
    tabButtons.forEach(btn => {
        btn.addEventListener('click', handleSeatCapVisibility);
    });

    // Inicializar validación
    initializeMixtoValidation();

    // Mostrar valores dinámicos de sliders numéricos
    function bindSliderValue(sliderId, valueId) {
        const slider = document.getElementById(sliderId);
        const valueSpan = document.getElementById(valueId);
        if (slider && valueSpan) {
            valueSpan.textContent = slider.value;
            slider.addEventListener('input', function() {
                valueSpan.textContent = this.value;
            });
        }
    }
    bindSliderValue('input-magnitud', 'input-magnitud-value');
    bindSliderValue('seat-cap-input', 'seat-cap-input-value');
    bindSliderValue('input-mr', 'input-mr-value');
    bindSliderValue('input-rp', 'input-rp-value');
    bindSliderValue('primera-minoria-seats', 'primera-minoria-seats-value');
});

// ===== MISSING INITIALIZATION FUNCTIONS =====

function initializeShockSliders() {
    console.log('Initializing shock sliders...');
    const shockSliders = document.querySelectorAll('.shock-slider');
    shockSliders.forEach(slider => {
        slider.addEventListener('input', function() {
            const valueBox = document.getElementById(`shock-value-${this.id.replace('shock-', '')}`);
            if (valueBox) {
                const value = parseFloat(this.value);
                valueBox.textContent = `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
            }
        });
    });
}

function initializeMagnitudInput() {
    console.log('Initializing magnitude input...');
    const magnitudSlider = document.getElementById('input-magnitud');
    const magnitudValue = document.getElementById('input-magnitud-value');
    
    if (magnitudSlider && magnitudValue) {
        magnitudSlider.addEventListener('input', function() {
            magnitudValue.textContent = this.value;
        });
    }
}

function initializeThresholdSlider() {
    console.log('Initializing threshold slider...');
    const thresholdSlider = document.getElementById('threshold-slider');
    const thresholdValueBox = document.getElementById('threshold-value-box');
    
    if (thresholdSlider && thresholdValueBox) {
        thresholdSlider.addEventListener('input', function() {
            thresholdValueBox.textContent = `${this.value}%`;
        });
    }
}

function initializeOverrepSlider() {
    console.log('Initializing overrepresentation slider...');
    // Add overrepresentation slider functionality if it exists
}

function initializeSeatCapControls() {
    console.log('Initializing seat cap controls...');
    // Add seat cap controls functionality
}

function initializeMixtoValidation() {
    console.log('Initializing mixto validation...');
    // Add mixto validation functionality
}

function handleOverrepresentationVisibility() {
    console.log('Handling overrepresentation visibility...');
    // Handle visibility based on chamber type
}

function handleFirstMinorityVisibility() {
    console.log('Handling first minority visibility...');
    // Handle first minority visibility
}

function handleSeatCapVisibility() {
    console.log('Handling seat cap visibility...');
    // Handle seat cap visibility
}

function handleMixtoInputsVisibility() {
    console.log('Handling mixto inputs visibility...');
    // Handle mixto inputs visibility
}

// ===== IMPROVED COLLAPSIBLE GROUPS FUNCTIONALITY =====

function initializeCollapsibleGroups() {
    console.log('Initializing collapsible groups...');
    const groupToggles = document.querySelectorAll('.group-toggle');
    
    groupToggles.forEach(toggle => {
        const targetId = toggle.dataset.target;
        const content = document.getElementById(`group-${targetId}`);
        
        if (!content) {
            console.warn(`Content not found for group: ${targetId}`);
            return;
        }
        
        console.log(`Setting up group: ${targetId}`);
        
        // Initially all groups are collapsed
        content.classList.remove('expanded');
        toggle.classList.remove('expanded');
        toggle.classList.add('collapsed');
        
        // Load saved state from localStorage
        const savedState = localStorage.getItem(`group-${targetId}-expanded`);
        if (savedState === 'true') {
            content.classList.add('expanded');
            toggle.classList.add('expanded');
            toggle.classList.remove('collapsed');
        }
        
        // Add click handler
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log(`Toggling group: ${targetId}`);
            
            const isExpanded = content.classList.contains('expanded');
            
            if (isExpanded) {
                // Collapse
                content.classList.remove('expanded');
                toggle.classList.remove('expanded');
                toggle.classList.add('collapsed');
                localStorage.setItem(`group-${targetId}-expanded`, 'false');
                console.log(`Collapsed group: ${targetId}`);
            } else {
                // Expand
                content.classList.add('expanded');
                toggle.classList.add('expanded');
                toggle.classList.remove('collapsed');
                localStorage.setItem(`group-${targetId}-expanded`, 'true');
                console.log(`Expanded group: ${targetId}`);
            }
        });
    });
    
    console.log(`Initialized ${groupToggles.length} collapsible groups`);
}

// ===== MASTER CONTROLS FUNCTIONALITY =====

function initializeMasterControls() {
    // Chamber toggle buttons
    const chamberToggles = document.querySelectorAll('.master-toggle[data-chamber]');
    chamberToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            // Remove active from all chamber toggles
            chamberToggles.forEach(t => t.classList.remove('active'));
            // Add active to clicked toggle
            this.classList.add('active');
            
            // Update UI based on selected chamber
            const chamber = this.dataset.chamber;
            updateChamberSpecificElements(chamber);
            
            // Update magnitud slider
            const magnitudSlider = document.getElementById('input-magnitud');
            const magnitudValue = document.getElementById('input-magnitud-value');
            if (magnitudSlider && magnitudValue) {
                const newValue = chamber === 'diputados' ? 500 : 128;
                magnitudSlider.value = newValue;
                magnitudValue.textContent = newValue;
            }
        });
    });
    
    // Year pills
    const yearPills = document.querySelectorAll('.master-pill[data-year]');
    yearPills.forEach(pill => {
        pill.addEventListener('click', function() {
            yearPills.forEach(p => p.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Model pills
    const modelPills = document.querySelectorAll('.master-pill[data-model]');
    modelPills.forEach(pill => {
        pill.addEventListener('click', function() {
            modelPills.forEach(p => p.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// ===== CHAMBER-SPECIFIC ELEMENT VISIBILITY =====

function updateChamberSpecificElements(chamber) {
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
    
    // Update KPI indicators
    updateKPIIndicators(chamber);
}

// ===== KPI INDICATORS UPDATE =====

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

// ===== ENHANCED SIDEBAR FUNCTIONALITY =====

function initializeEnhancedSidebar() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('control-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    
    if (!mobileMenuBtn || !sidebar || !overlay) return;
    
    // Mobile menu functionality
    mobileMenuBtn.addEventListener('click', function() {
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

// ===== ENSURE CLEAN INITIALIZATION =====

// Remove any conflicting event listeners first
function cleanupExistingListeners() {
    const groupToggles = document.querySelectorAll('.group-toggle');
    groupToggles.forEach(toggle => {
        // Clone and replace to remove all existing listeners
        const newToggle = toggle.cloneNode(true);
        toggle.parentNode.replaceChild(newToggle, toggle);
    });
}

// ===== INITIALIZE EVERYTHING PROPERLY =====

function initializeAllFunctionality() {
    // Clean up first
    cleanupExistingListeners();
    
    // Initialize all components
    initializeCollapsibleGroups();
    initializeMasterControls();
    initializeEnhancedSidebar();
    
    // Initialize chamber-specific elements
    const activeChamber = document.querySelector('.master-toggle.active')?.dataset.chamber || 'senadores';
    updateChamberSpecificElements(activeChamber);
    
    console.log('Dashboard initialized successfully!');
}

// ===== MAIN INITIALIZATION =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing Electoral Dashboard...');
    
    // Small delay to ensure all DOM elements are ready
    setTimeout(() => {
        initializeAllFunctionality();
    }, 100);
});

// ===== MASTER INITIALIZATION FUNCTION =====

function initializeAllFunctionality() {
    console.log('Starting initialization...');
    
    // Clean up any existing listeners first
    cleanupExistingListeners();
    
    // Initialize all components in order
    initializeCollapsibleGroups();
    initializeMasterControls();
    initializeEnhancedSidebar();
    initializeShockSliders();
    initializeMagnitudInput();
    initializeThresholdSlider();
    initializeOverrepSlider();
    
    // Initialize visibility controls
    handleOverrepresentationVisibility();
    handleFirstMinorityVisibility();
    handleSeatCapVisibility();
    handleMixtoInputsVisibility();
    
    // Initialize other controls
    initializeSeatCapControls();
    initializeMixtoValidation();
    
    // Bind slider values
    bindAllSliderValues();
    
    // Initialize chamber-specific elements
    const activeChamber = document.querySelector('.master-toggle.active')?.dataset.chamber || 'senadores';
    updateChamberSpecificElements(activeChamber);
    
    console.log('Dashboard initialized successfully!');
}

// ===== BIND SLIDER VALUES =====

function bindAllSliderValues() {
    function bindSliderValue(sliderId, valueId) {
        const slider = document.getElementById(sliderId);
        const valueSpan = document.getElementById(valueId);
        if (slider && valueSpan) {
            valueSpan.textContent = slider.value;
            slider.addEventListener('input', function() {
                valueSpan.textContent = this.value;
            });
        }
    }
    
    bindSliderValue('input-magnitud', 'input-magnitud-value');
    bindSliderValue('seat-cap-input', 'seat-cap-input-value');
    bindSliderValue('input-mr', 'input-mr-value');
    bindSliderValue('input-rp', 'input-rp-value');
    bindSliderValue('primera-minoria-seats', 'primera-minoria-seats-value');
}
