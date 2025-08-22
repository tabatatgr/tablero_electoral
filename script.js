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

// ===== FUNCIONALIDAD MEJORADA PARA SLIDERS Y VALUE BOXES =====
    
// Initialize shock sliders with dynamic value updates
function initializeShockSliders() {
    const shockSliders = document.querySelectorAll('.shock-slider');
    
    shockSliders.forEach(slider => {
        const sliderId = slider.id;
        const valueBoxId = `shock-value-${sliderId.replace('shock-', '')}`;
        const valueBox = document.getElementById(valueBoxId);
        
        if (valueBox) {
            // Set initial value
            updateShockValueBox(slider, valueBox);
            
            // Add event listener for real-time updates
            slider.addEventListener('input', function() {
                updateShockValueBox(this, valueBox);
            });
            
            // Add event listener for final change
            slider.addEventListener('change', function() {
                updateShockValueBox(this, valueBox);
                triggerRecalculation();
            });
        }
    });
}

// Update shock value box with proper formatting
function updateShockValueBox(slider, valueBox) {
    const value = parseFloat(slider.value);
    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);
    const sign = value >= 0 ? '+' : '';
    const formattedValue = `${sign}${value.toFixed(1)}%`;
    valueBox.textContent = formattedValue;
    
    // Calculate progress percentage for CSS variable
    const progress = ((value - min) / (max - min)) * 100;
    slider.style.setProperty('--progress', `${progress}%`);
    
    // Add visual feedback based on value
    valueBox.className = 'shock-value-box';
    if (value > 0) {
        valueBox.style.background = 'linear-gradient(135deg, #059669, #047857)';
    } else if (value < 0) {
        valueBox.style.background = 'linear-gradient(135deg, #DC2626, #B91C1C)';
    } else {
        valueBox.style.background = 'linear-gradient(135deg, #5F7272, #4A5E5E)';
    }
}

// Initialize threshold slider
function initializeThresholdSlider() {
    const thresholdSlider = document.getElementById('threshold-slider');
    const thresholdValueBox = document.getElementById('threshold-value-box');
    
    if (thresholdSlider && thresholdValueBox) {
        // Set initial value
        updateThresholdValueBox(thresholdSlider, thresholdValueBox);
        
        // Add event listeners
        thresholdSlider.addEventListener('input', function() {
            updateThresholdValueBox(this, thresholdValueBox);
        });
        
        thresholdSlider.addEventListener('change', function() {
            updateThresholdValueBox(this, thresholdValueBox);
            triggerRecalculation();
        });
    }
}

// Update threshold value box
function updateThresholdValueBox(slider, valueBox) {
    const value = parseFloat(slider.value);
    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);
    valueBox.textContent = `${value.toFixed(1)}%`;
    
    // Calculate progress percentage for CSS variable
    const progress = ((value - min) / (max - min)) * 100;
    slider.style.setProperty('--progress', `${progress}%`);
}

// Initialize overrepresentation slider
function initializeOverrepSlider() {
    const overrepSlider = document.getElementById('overrep-slider');
    const overrepValueBox = document.getElementById('overrep-value-box');
    
    if (overrepSlider && overrepValueBox) {
        // Set initial value
        updateOverrepValueBox(overrepSlider, overrepValueBox);
        
        // Add event listeners
        overrepSlider.addEventListener('input', function() {
            updateOverrepValueBox(this, overrepValueBox);
        });
        
        overrepSlider.addEventListener('change', function() {
            updateOverrepValueBox(this, overrepValueBox);
            triggerRecalculation();
        });
    }
}

// Update overrepresentation value box
function updateOverrepValueBox(slider, valueBox) {
    const value = parseFloat(slider.value);
    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);
    valueBox.textContent = `${value.toFixed(1)}%`;
    
    // Calculate progress percentage for CSS variable
    const progress = ((value - min) / (max - min)) * 100;
    slider.style.setProperty('--progress', `${progress}%`);
}

// Trigger recalculation with debouncing
function triggerRecalculation() {
    clearTimeout(window.recalculationTimeout);
    window.recalculationTimeout = setTimeout(() => {
        console.log('Triggering recalculation...');
        updateResults();
        // Here you would call your actual simulation/calculation functions
    }, 300);
}

// Initialize all slider functionality
function initializeAllSliders() {
    initializeShockSliders();
    initializeThresholdSlider();
    initializeOverrepSlider();
}

// Call initialization function
initializeAllSliders();

// Shocks sliders: actualizar valor en cajita
function initializeShockSliders() {
    const sliders = document.querySelectorAll('.shock-slider');
    sliders.forEach(slider => {
        const party = slider.id.replace('shock-', '');
        const valueBox = document.getElementById(`shock-value-${party}`);
        function updateBox() {
            let val = parseFloat(slider.value);
            const min = parseFloat(slider.min);
            const max = parseFloat(slider.max);
            let sign = val > 0 ? '+' : (val < 0 ? '' : '+');
            valueBox.textContent = `${sign}${val.toFixed(1)}%`;
            
            // Calculate progress percentage for CSS variable
            const progress = ((val - min) / (max - min)) * 100;
            slider.style.setProperty('--progress', `${progress}%`);
        }
        slider.addEventListener('input', updateBox);
        updateBox();
    });
}

// Magnitud: sincronizar con cámara
function initializeMagnitudInput() {
    const input = document.getElementById('input-magnitud');
    const tabButtons = document.querySelectorAll('.tab-button');
    function setDefaultByChamber() {
        if (!input) return;
        const senadoresActive = document.querySelector('.tab-button.active')?.textContent.includes('senadores');
        input.value = senadoresActive ? 128 : 500;
    }
    // Al cambiar de cámara
    tabButtons.forEach(btn => {
        btn.addEventListener('click', setDefaultByChamber);
    });
    // Al cargar
    setDefaultByChamber();
}

// Threshold slider: actualizar valor en cajita
function initializeThresholdSlider() {
    const slider = document.getElementById('threshold-slider');
    const valueBox = document.getElementById('threshold-value-box');
    if (!slider || !valueBox) return;
    function updateBox() {
        let val = parseFloat(slider.value);
        const min = parseFloat(slider.min);
        const max = parseFloat(slider.max);
        valueBox.textContent = val.toFixed(1) + '%';
        
        // Calculate progress percentage for CSS variable
        const progress = ((val - min) / (max - min)) * 100;
        slider.style.setProperty('--progress', `${progress}%`);
    }
    slider.addEventListener('input', updateBox);
    updateBox();
}

// Mostrar/ocultar cláusula de sobrerrepresentación según cámara
function handleOverrepresentationVisibility() {
    const overrepCard = document.getElementById('overrepresentation-card');
    const senadoresActive = document.querySelector('.tab-button.active')?.textContent.includes('senadores');
    if (overrepCard) {
        overrepCard.style.display = senadoresActive ? 'none' : '';
    }
}

// Slider de sobrerrepresentación: actualizar valor en cajita
function initializeOverrepSlider() {
    const slider = document.getElementById('overrep-slider');
    const valueBox = document.getElementById('overrep-value-box');
    if (!slider || !valueBox) return;
    function updateBox() {
        let val = parseFloat(slider.value);
        const min = parseFloat(slider.min);
        const max = parseFloat(slider.max);
        valueBox.textContent = val.toFixed(1) + '%';
        
        // Calculate progress percentage for CSS variable
        const progress = ((val - min) / (max - min)) * 100;
        slider.style.setProperty('--progress', `${progress}%`);
    }
    slider.addEventListener('input', updateBox);
    updateBox();
}

// Mostrar inputs de escaños MR y RP solo si se elige Mixto
function handleMixtoInputsVisibility() {
    const radioMixto = document.getElementById('radio-mixto');
    const radioMR = document.getElementById('radio-mr');
    const radioRP = document.getElementById('radio-rp');
    const mixtoInputs = document.getElementById('mixto-inputs');
    if (!mixtoInputs) return;
    if (radioMixto && radioMixto.getAttribute('data-state') === 'On') {
        mixtoInputs.classList.remove('mixed-hidden');
    } else {
        mixtoInputs.classList.add('mixed-hidden');
    }
}

// --- Tope de escaños por partido (solo diputados) ---
function handleSeatCapVisibility() {
    const seatCapCard = document.getElementById('seat-cap-card');
    const isDiputados = document.querySelector('.tab-button.active')?.textContent.includes('diputados');
    if (seatCapCard) {
        seatCapCard.style.display = isDiputados ? '' : 'none';
    }
}

function initializeSeatCapControls() {
    const seatCapSwitch = document.getElementById('seat-cap-switch');
    const seatCapInputGroup = document.getElementById('seat-cap-input-group');
    if (!seatCapSwitch || !seatCapInputGroup) return;
    seatCapSwitch.addEventListener('click', function() {
        const isOn = seatCapSwitch.getAttribute('data-switch') === 'On';
        seatCapInputGroup.style.display = isOn ? '' : 'none';
    });
}

// Validación automática de suma MR+RP vs total de cámara
function validateMixtoInputs() {
    const radioMixto = document.getElementById('radio-mixto');
    const inputMR = document.getElementById('input-mr');
    const inputRP = document.getElementById('input-rp');
    const inputMagnitud = document.getElementById('input-magnitud');
    const validationMessage = document.getElementById('mixto-validation');
    
    if (!radioMixto || !inputMR || !inputRP || !inputMagnitud || !validationMessage) return;
    
    // Solo validar si está seleccionada la opción "Mixto"
    if (radioMixto.getAttribute('data-state') !== 'On') {
        validationMessage.style.display = 'none';
        inputMR.style.borderColor = '';
        inputRP.style.borderColor = '';
        return;
    }
    
    const mrValue = parseInt(inputMR.value) || 0;
    const rpValue = parseInt(inputRP.value) || 0;
    const totalValue = parseInt(inputMagnitud.value) || 0;
    const suma = mrValue + rpValue;
    
    if (suma !== totalValue && totalValue > 0) {
        // Mostrar error
        validationMessage.style.display = 'block';
        inputMR.style.borderColor = '#c33';
        inputRP.style.borderColor = '#c33';
    } else {
        // Ocultar error
        validationMessage.style.display = 'none';
        inputMR.style.borderColor = '';
        inputRP.style.borderColor = '';
    }
}

// Inicializar validación
function initializeMixtoValidation() {
    const inputMR = document.getElementById('input-mr');
    const inputRP = document.getElementById('input-rp');
    const inputMagnitud = document.getElementById('input-magnitud');
    
    if (inputMR) inputMR.addEventListener('input', validateMixtoInputs);
    if (inputRP) inputRP.addEventListener('input', validateMixtoInputs);
    if (inputMagnitud) inputMagnitud.addEventListener('input', validateMixtoInputs);
}

// ===== VALIDACIÓN AUTOMÁTICA PARA SISTEMA MIXTO =====
    
function initializeMixtoValidation() {
    const radioMixto = document.getElementById('radio-mixto');
    const inputMR = document.getElementById('input-mr');
    const inputRP = document.getElementById('input-rp');
    const inputMagnitud = document.getElementById('input-magnitud');
    const mixtoValidation = document.getElementById('mixto-validation');
    const mixtoInputs = document.getElementById('mixto-inputs');

    if (!radioMixto || !inputMR || !inputRP || !inputMagnitud) return;

    // Función para validar la suma
    function validateMixtoSum() {
        const mrValue = parseInt(inputMR.value) || 0;
        const rpValue = parseInt(inputRP.value) || 0;
        const totalValue = parseInt(inputMagnitud.value) || 128;
        const sum = mrValue + rpValue;

        if (mixtoValidation) {
            if (sum !== totalValue && sum > 0) {
                mixtoValidation.style.display = 'block';
                mixtoValidation.innerHTML = `La suma de escaños Mayoría Relativa (${mrValue}) + Representación Proporcional (${rpValue}) = ${sum} debe ser igual al total de la cámara (${totalValue})`;
                inputMR.style.borderColor = '#DC2626';
                inputRP.style.borderColor = '#DC2626';                } else {
                    mixtoValidation.style.display = 'none';
                    inputMR.style.borderColor = '#5F7272';
                    inputRP.style.borderColor = '#5F7272';
                }
        }
    }

    // Función para manejar la visibilidad de inputs mixtos
    function toggleMixtoInputs() {
        const isMixtoSelected = radioMixto.getAttribute('data-state') === 'On';
        
        if (mixtoInputs) {
            if (isMixtoSelected) {
                mixtoInputs.style.display = 'block';
                const totalValue = parseInt(inputMagnitud.value) || 128;
                // Sugerir valores por defecto
                if (totalValue === 128) { // Senado
                    inputMR.value = 64;
                    inputRP.value = 64;
                } else if (totalValue === 500) { // Diputados
                    inputMR.value = 300;
                    inputRP.value = 200;
                }
                validateMixtoSum();
            } else {
                mixtoInputs.style.display = 'none';
                if (mixtoValidation) mixtoValidation.style.display = 'none';
            }
        }
    }

    // Eventos para los radio buttons de reglas electorales
    const allRuleRadios = document.querySelectorAll('.parameter-card.rules .radio-option');
    allRuleRadios.forEach(radio => {
        radio.addEventListener('click', function() {
            // Actualizar estados de radio buttons
            allRuleRadios.forEach(r => r.setAttribute('data-state', 'Off'));
            this.setAttribute('data-state', 'On');
            
            // Actualizar dots visuales
            allRuleRadios.forEach(r => {
                const dot = r.querySelector('.radio-dot');
                if (dot) dot.remove();
            });
            
            const newDot = document.createElement('div');
            newDot.className = 'radio-dot';
            this.querySelector('.radio-button').appendChild(newDot);
            
            toggleMixtoInputs();
        });
    });

    // Eventos para inputs de MR y RP
    inputMR.addEventListener('input', validateMixtoSum);
    inputRP.addEventListener('input', validateMixtoSum);
    inputMagnitud.addEventListener('input', function() {
        if (radioMixto.getAttribute('data-state') === 'On') {
            validateMixtoSum();
        }
    });

    // Inicializar el estado
    toggleMixtoInputs();
}

// ===== CAMBIO AUTOMÁTICO DE MAGNITUD POR CÁMARA =====

function initializeChamberMagnitude() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const inputMagnitud = document.getElementById('input-magnitud');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (inputMagnitud) {
                if (this.textContent.includes('diputados')) {
                    inputMagnitud.value = 500;
                    showDeputadosOnlyParams();
                } else {
                    inputMagnitud.value = 128;
                    hideDeputadosOnlyParams();
                }
                
                // Revalidar mixto si está activo
                const radioMixto = document.getElementById('radio-mixto');
                if (radioMixto && radioMixto.getAttribute('data-state') === 'On') {
                    initializeMixtoValidation();
                }
            }
        });
    });
}

// Mostrar parámetros solo de diputados
function showDeputadosOnlyParams() {
    const overrepCard = document.getElementById('overrepresentation-card');
    const seatCapCard = document.getElementById('seat-cap-card');
    
    if (overrepCard) overrepCard.style.display = 'block';
    if (seatCapCard) seatCapCard.style.display = 'block';
}

// Ocultar parámetros solo de diputados
function hideDeputadosOnlyParams() {
    const overrepCard = document.getElementById('overrepresentation-card');
    const seatCapCard = document.getElementById('seat-cap-card');
    
    if (overrepCard) overrepCard.style.display = 'none';
    if (seatCapCard) seatCapCard.style.display = 'none';
}

// Inicializar todas las validaciones
function initializeValidations() {
    initializeMixtoValidation();
    initializeChamberMagnitude();
}

// Llamar las inicializaciones
initializeValidations();

// Mostrar/ocultar primera minoría según cámara (solo Senado)
function handleFirstMinorityVisibility() {
    const firstMinorityGroup = document.getElementById('first-minority-group');
    const senadoresActive = document.querySelector('.tab-button.active')?.textContent.includes('senadores');
    if (firstMinorityGroup) {
        firstMinorityGroup.style.display = senadoresActive ? 'block' : 'none';
    }
}

// Mostrar/ocultar Primera Minoría según cámara y regla electoral
function toggleFirstMinorityCard() {
    const isSenado = document.querySelector('.tab-button.active')?.textContent?.toLowerCase().includes('senador');
    let selectedRule = null;
    document.querySelectorAll('.parameter-card.rules .radio-option').forEach(opt => {
        if (opt.getAttribute('data-state') === 'On') {
            selectedRule = opt.querySelector('.radio-label')?.textContent?.trim();
        }
    });
    const show = isSenado && (selectedRule === 'Mixto' || selectedRule === 'Mayoría Relativa');
    const card = document.getElementById('first-minority-card');
    if (card) card.style.display = show ? '' : 'none';
}

// Llama a la función en los eventos relevantes
// Al cambiar de cámara
const tabButtons = document.querySelectorAll('.tab-button');
tabButtons.forEach(btn => btn.addEventListener('click', toggleFirstMinorityCard));
// Al cambiar de regla electoral
const ruleOptions = document.querySelectorAll('.parameter-card.rules .radio-option');
ruleOptions.forEach(opt => opt.addEventListener('click', function() {
    setTimeout(toggleFirstMinorityCard, 50);
}));
// Al cargar la página
window.addEventListener('DOMContentLoaded', toggleFirstMinorityCard);

// ===== THRESHOLD SWITCH LOGIC =====
document.addEventListener('DOMContentLoaded', function() {
    const thresholdSwitch = document.getElementById('threshold-switch');
    const thresholdSlider = document.getElementById('threshold-slider');
    const thresholdValueBox = document.getElementById('threshold-value-box');
    const thresholdRadios = document.querySelectorAll('.parameter-card.threshold .radio-option');

    if (thresholdSwitch && thresholdSlider && thresholdValueBox) {
        function setThresholdEnabled(enabled) {
            thresholdSlider.disabled = !enabled;
            thresholdValueBox.style.opacity = enabled ? '1' : '0.5';
            thresholdRadios.forEach(radio => {
                radio.classList.toggle('disabled', !enabled);
                radio.setAttribute('tabindex', enabled ? '0' : '-1');
            });
        }
        thresholdSwitch.addEventListener('click', function() {
            const isOn = thresholdSwitch.getAttribute('data-switch') === 'On';
            thresholdSwitch.setAttribute('data-switch', isOn ? 'Off' : 'On');
            thresholdSwitch.setAttribute('aria-checked', isOn ? 'false' : 'true');
            setThresholdEnabled(!isOn);
            // Optionally, trigger recalculation
            if (typeof triggerRecalculation === 'function') triggerRecalculation();
        });
        // Initialize state
        setThresholdEnabled(true);
    }

    // ===== PRIMERA MINORÍA SWITCH LOGIC =====
    const firstMinoritySwitch = document.getElementById('first-minority-switch');
    const firstMinoritySlider = document.getElementById('input-first-minority');
    const firstMinorityValue = document.getElementById('input-first-minority-value');
    if (firstMinoritySwitch && firstMinoritySlider && firstMinorityValue) {
        function setFirstMinorityEnabled(enabled) {
            firstMinoritySlider.disabled = !enabled;
            firstMinorityValue.style.opacity = enabled ? '1' : '0.5';
        }
        firstMinoritySwitch.addEventListener('click', function() {
            const isOn = firstMinoritySwitch.getAttribute('data-switch') === 'On';
            firstMinoritySwitch.setAttribute('data-switch', isOn ? 'Off' : 'On');
            firstMinoritySwitch.setAttribute('aria-checked', isOn ? 'false' : 'true');
            setFirstMinorityEnabled(!isOn);
            if (typeof triggerRecalculation === 'function') triggerRecalculation();
        });
        setFirstMinorityEnabled(true);
    }
});
