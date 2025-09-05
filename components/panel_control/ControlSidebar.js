// Simple test version of ControlSidebar
export class ControlSidebar extends HTMLElement {
  connectedCallback() {
    console.log('ControlSidebar connected!');
    
    // 🌍 Exposer referencia global para que VoteRedistribution pueda acceder
    window.controlSidebar = this;
    
    this.render();
    this.initializeSidebarControls();
  }

  render() {
    console.log('ControlSidebar rendering...');
    this.innerHTML = `
        <!-- All your sidebar HTML content starts here -->
        <aside class="control-sidebar">
          <div class="sidebar-header">
            <h3 class="sidebar-title">Panel de control</h3>
          </div>
          <div class="sidebar-content">
            <!-- 1. Master controls -->
            <div class="control-group" data-group="master">
              <button class="group-toggle" data-target="master">
                <span class="group-title">Parámetros principales</span>
                <svg class="chevron" width="12" height="12" viewBox="0 0 12 12">
                  <path d="M4 2l4 4-4 4" stroke="currentColor" stroke-width="1.5" fill="none"/>
                </svg>
              </button>
              <div class="group-content" id="group-master">
                <div class="control-item">
                  <label class="control-label">Cámara</label>
                  <div class="master-toggle-group" role="tablist">
                    <button class="master-toggle active" data-chamber="diputados" role="tab">
                      <span class="toggle-text">Diputados</span>
                    </button>
                    <button class="master-toggle" data-chamber="senadores" role="tab">
                      <span class="toggle-text">Senadores</span>
                    </button>
                  </div>
                </div>
                <div class="control-item">
                  <label class="control-label">Año</label>
                  <select class="control-select" id="year-select">
                    <option value="2024" selected>2024</option>
                    <option value="2021">2021</option>
                    <option value="2018">2018</option>
                  </select>
                </div>
                <div class="control-item">
                  <label class="control-label">Modelo</label>
                  <select class="control-select" id="model-select">
                    <option value="vigente" selected>Vigente</option>
                    <option value="personalizado">Personalizado</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- 2. Tamaño de la cámara -->
            <div class="control-group" data-group="magnitude">
              <button class="group-toggle" data-target="magnitude">
                <span class="group-title">Tamaño de la cámara</span>
                <svg class="chevron" width="12" height="12" viewBox="0 0 12 12">
                  <path d="M4 2l4 4-4 4" stroke="currentColor" stroke-width="1.5" fill="none"/>
                </svg>
              </button>
              <div class="group-content" id="group-magnitude">
                <div class="control-item">
                  <label class="control-label">Total de escaños: <span id="input-magnitud-value">128</span></label>
                  <input type="range" class="control-slider" id="input-magnitud" min="1" max="700" step="1" value="128">
                </div>
              </div>
            </div>
            
            <!-- 3. Tipo de Regla Electoral -->
            <div class="control-group" data-group="rules">
              <button class="group-toggle" data-target="rules">
                <span class="group-title">Tipo de regla electoral</span>
                <svg class="chevron" width="12" height="12" viewBox="0 0 12 12">
                  <path d="M4 2l4 4-4 4" stroke="currentColor" stroke-width="1.5" fill="none"/>
                </svg>
              </button>
              <div class="group-content" id="group-rules">
                <div class="control-item">
                  <div class="radio-group">
                    <div class="radio-item">
                      <input class="radio" type="radio" id="radio-mr" name="electoral-rule" value="mr">
                      <label class="radio-label" for="radio-mr">Mayoría Relativa</label>
                    </div>
                    <div class="radio-item">
                      <input class="radio" type="radio" id="radio-rp" name="electoral-rule" value="rp">
                      <label class="radio-label" for="radio-rp">Representación Proporcional</label>
                    </div>
                    <div class="radio-item">
                      <input class="radio" type="radio" id="radio-mixto" name="electoral-rule" value="mixto" checked>
                      <label class="radio-label" for="radio-mixto">
                        Mixto
                        <div class="radio-sublabel">Mayoría Relativa + Representación Proporcional</div>
                      </label>
                    </div>
                  </div>
                </div>
                <div class="control-item mixto-inputs" id="mixto-inputs">
                  <div class="dual-slider">
                    <div class="slider-group">
                      <label class="slider-label">Mayoría Relativa <span id="input-mr-value">64</span></label>
                      <input type="range" class="control-slider" id="input-mr" min="0" max="700" step="1" value="64">
                    </div>
                    <div class="slider-group">
                      <label class="slider-label">Representación Proporcional <span id="input-rp-value">64</span></label>
                      <input type="range" class="control-slider" id="input-rp" min="0" max="700" step="1" value="64">
                    </div>
                  </div>
                  <div class="validation-message hidden" id="mixto-validation">
                    La suma de escaños debe dar el total de escaños seleccionados
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 4. Primera Minoría (solo para senado con MR o Mixto) -->
            <div class="control-group" data-group="first-minority" id="first-minority-group" style="display:none;">
              <button class="group-toggle" data-target="first-minority">
                <span class="group-title">Primera Minoría</span>
                <svg class="chevron" width="12" height="12" viewBox="0 0 12 12">
                  <path d="M4 2l4 4-4 4" stroke="currentColor" stroke-width="1.5" fill="none"/>
                </svg>
              </button>
              <div class="group-content" id="group-first-minority">
                <div class="control-item">
                  <label class="control-label">¿Activar primera minoría?</label>
                  <div class="toggle-switch">
                    <div class="switch" id="first-minority-switch" data-switch="Off" role="switch" aria-checked="false">
                      <div class="switch-handle"></div>
                    </div>
                  </div>
                </div>
                <div class="control-item" id="first-minority-input-group" style="display:none;">
                  <label class="control-label">Escaños por Primera Minoría: <span id="input-first-minority-value">0</span></label>
                  <input type="range" class="control-slider" id="input-first-minority" min="0" max="700" step="1" value="0">
                  <div id="first-minority-warning" style="display:none; margin-top: 5px; font-size: 0.8em; color: #f59e0b;"></div>
                </div>
              </div>
            </div>
            
            <!-- 5. Método de Reparto EXCLUSIVO -->
            <div class="control-group" data-group="method">
              <button class="group-toggle" data-target="method">
                <span class="group-title">Método de reparto</span>
                <svg class="chevron" width="12" height="12" viewBox="0 0 12 12">
                  <path d="M4 2l4 4-4 4" stroke="currentColor" stroke-width="1.5" fill="none"/>
                </svg>
              </button>
              <div class="group-content" id="group-method">
                <div class="control-item">
                  <label class="control-label">Tipo de sistema:</label>
                  <div class="radio-group">
                    <div class="radio-item">
                      <input class="radio" type="radio" id="reparto-cuota" name="reparto-mode" value="cuota" checked>
                      <label class="radio-label" for="reparto-cuota">Métodos de cuota</label>
                    </div>
                    <div class="radio-item">
                      <input class="radio" type="radio" id="reparto-divisor" name="reparto-mode" value="divisor">
                      <label class="radio-label" for="reparto-divisor">Métodos de divisor</label>
                    </div>
                  </div>
                </div>
                <div class="control-item">
                  <label class="control-label">Método específico:</label>
                  <select class="control-select" id="reparto-method">
                    <!-- Opciones se actualizan dinámicamente según el radio seleccionado -->
                    <option value="hare" selected>Hare</option>
                    <option value="droop">Droop</option>
                    <option value="imperiali">Imperiali</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- 6. Límite sobrerrepresentación -->
            <div class="control-group deputy-only" data-group="overrepresentation" id="overrepresentation-group" style="display:none;">
              <button class="group-toggle" data-target="overrepresentation">
                <span class="group-title">Límite de sobrerrepresentación</span>
                <svg class="chevron" width="12" height="12" viewBox="0 0 12 12">
                  <path d="M4 2l4 4-4 4" stroke="currentColor" stroke-width="1.5" fill="none"/>
                </svg>
              </button>
              <div class="group-content" id="group-overrepresentation">
                <div class="control-item">
                  <label class="control-label">¿Activar límite de sobrerrepresentación?</label>
                  <div class="toggle-switch">
                    <div class="switch active" id="overrep-switch" data-switch="On" role="switch" aria-checked="true">
                      <div class="switch-handle"></div>
                    </div>
                  </div>
                </div>
                <div class="control-item overrep-controls">
                  <div class="overrep-value-box" id="overrep-value-box">8.0%</div>
                  <label class="control-label">Límite sobre % voto nacional:</label>
                  <input type="range" class="control-slider overrep-slider" id="overrep-slider" min="0" max="20" step="0.1" value="8">
                </div>
              </div>
            </div>
            
            <!-- 7. Configuración del umbral -->
            <div class="control-group" data-group="threshold">
              <button class="group-toggle" data-target="threshold">
                <span class="group-title">Configuración del umbral</span>
                <svg class="chevron" width="12" height="12" viewBox="0 0 12 12">
                  <path d="M4 2l4 4-4 4" stroke="currentColor" stroke-width="1.5" fill="none"/>
                </svg>
              </button>
              <div class="group-content" id="group-threshold">
                <div class="control-item">
                  <label class="control-label">¿Activar umbral?</label>
                  <div class="toggle-switch">
                    <div class="switch" id="threshold-switch" data-switch="Off" role="switch" aria-checked="false">
                      <div class="switch-handle"></div>
                    </div>
                  </div>
                </div>
                <div class="control-item" id="threshold-radio-group" style="display:none;">
                  <div class="radio-group">
                    <div class="radio-item">
                      <input class="radio" type="radio" id="radio-national" name="threshold-type" value="national" checked>
                      <label class="radio-label" for="radio-national">Nacional (%)</label>
                    </div>
                    <div class="radio-item">
                      <input class="radio" type="radio" id="radio-state" name="threshold-type" value="state">
                      <label class="radio-label" for="radio-state">Estatal (%)</label>
                    </div>
                  </div>
                </div>
                <div class="control-item" id="threshold-controls-group" style="display:none;">
                  <div class="threshold-controls">
                    <div class="threshold-value-box" id="threshold-value-box">3.0%</div>
                    <label class="control-label">Porcentaje mínimo:</label>
                    <input type="range" class="control-slider threshold-slider" id="threshold-slider" min="0" max="20" step="0.1" value="3">
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 8. Tope de escaños -->
            <div class="control-group deputy-only" data-group="seat-cap" id="seat-cap-group" style="display:none;">
              <button class="group-toggle" data-target="seat-cap">
                <span class="group-title">Tope de escaños por partido</span>
                <svg class="chevron" width="12" height="12" viewBox="0 0 12 12">
                  <path d="M4 2l4 4-4 4" stroke="currentColor" stroke-width="1.5" fill="none"/>
                </svg>
              </button>
              <div class="group-content" id="group-seat-cap">
                <div class="control-item">
                  <label class="control-label">¿Limitar máximo de escaños por partido?</label>
                  <div class="toggle-switch">
                    <div class="switch" id="seat-cap-switch" data-switch="Off" role="switch" aria-checked="false">
                      <div class="switch-handle"></div>
                    </div>
                  </div>
                </div>
                <div class="control-item" id="seat-cap-input-group" style="display:none;">
                  <label class="control-label">Máximo de escaños por partido: <span id="seat-cap-input-value">300</span></label>
                  <input type="range" class="control-slider" id="seat-cap-input" min="1" max="500" step="1" value="300">
                  <div class="parameter-note">Si un partido supera el tope, los escaños excedentes se redistribuyen por RP.</div>
                </div>
              </div>
            </div>
            
            <!-- 9. Ajuste por partido -->
            <div class="control-group" data-group="shocks">
              <button class="group-toggle" data-target="shocks">
                <span class="group-title">Ajuste por partido</span>
                <svg class="chevron" width="12" height="12" viewBox="0 0 12 12">
                  <path d="M4 2l4 4-4 4" stroke="currentColor" stroke-width="1.5" fill="none"/>
                </svg>
              </button>
              <div class="group-content" id="group-shocks">
                <div class="control-item">
                  <div class="party-shock-inputs" id="dynamic-party-sliders">
                    <!-- Los sliders se generarán dinámicamente aquí -->
                  </div>
                  <div class="parameter-note">Simula cambios en el porcentaje de votos por partido</div>
                </div>
              </div>
            </div>
            
            <!-- 10. Coaliciones -->
            <div class="control-group" data-group="coalition">
              <button class="group-toggle" data-target="coalition">
                <span class="group-title">Coaliciones</span>
                <svg class="chevron" width="12" height="12" viewBox="0 0 12 12">
                  <path d="M4 2l4 4-4 4" stroke="currentColor" stroke-width="1.5" fill="none"/>
                </svg>
              </button>
              <div class="group-content" id="group-coalition">
                <div class="control-description">
                  ¿Activar coaliciones electorales?
                </div>
                <div class="control-item">
                  <div class="toggle-switch">
                    <div class="switch active" id="coalition-switch" data-switch="On" role="switch" aria-checked="true">
                      <div class="switch-handle"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </aside>
    `;
    console.log('ControlSidebar rendered!');
  }

initializeSidebarControls() {
    // Mostrar/ocultar controles de sobrerrepresentación según el switch
    const overrepSwitch = this.querySelector('#overrep-switch');
    const overrepControls = this.querySelector('.overrep-controls');
    function updateOverrepVisibility() {
      const isActive = overrepSwitch && overrepSwitch.classList.contains('active');
      if (overrepControls) overrepControls.style.display = isActive ? 'block' : 'none';
    }
    if (overrepSwitch) {
      overrepSwitch.addEventListener('click', function() {
        setTimeout(updateOverrepVisibility, 0);
      });
      updateOverrepVisibility();
    }
    // Collapsible groups
    const groupToggles = this.querySelectorAll('.group-toggle');
    groupToggles.forEach((toggle) => {
      const targetId = toggle.dataset.target;
      const content = this.querySelector(`#group-${targetId}`);
      if (!content) return;
      // Siempre iniciar cerrados, sin importar localStorage
      content.classList.remove('expanded');
      toggle.classList.add('collapsed');
      toggle.classList.remove('expanded');
      // Comentado para que siempre inicien cerrados
      // const savedState = localStorage.getItem(`group-${targetId}-expanded`);
      // if (savedState === 'true') {
      //   content.classList.add('expanded');
      //   toggle.classList.add('expanded');
      //   toggle.classList.remove('collapsed');
      // }
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isExpanded = content.classList.contains('expanded');
        if (isExpanded) {
          content.classList.remove('expanded');
          toggle.classList.remove('expanded');
          toggle.classList.add('collapsed');
          localStorage.setItem(`group-${targetId}-expanded`, 'false');
        } else {
          content.classList.add('expanded');
          toggle.classList.add('expanded');
          toggle.classList.remove('collapsed');
          localStorage.setItem(`group-${targetId}-expanded`, 'true');
        }
      });

    // Mostrar/ocultar controles de umbral según el switch
    const thresholdSwitch = this.querySelector('#threshold-switch');
    const thresholdRadioGroup = this.querySelector('#threshold-radio-group');
    const thresholdControlsGroup = this.querySelector('#threshold-controls-group');
    function updateThresholdVisibility() {
      const isActive = thresholdSwitch && thresholdSwitch.classList.contains('active');
      if (thresholdRadioGroup) thresholdRadioGroup.style.display = isActive ? 'block' : 'none';
      if (thresholdControlsGroup) thresholdControlsGroup.style.display = isActive ? 'block' : 'none';
    }
    
    if (thresholdSwitch) {
      thresholdSwitch.addEventListener('click', function() {
        setTimeout(updateThresholdVisibility, 0);
        // También actualizar visibilidad de sobrerrepresentación
        setTimeout(() => this.updateOverrepresentationVisibility(), 0);
      }.bind(this));
      // Inicializar visibilidad al cargar
      updateThresholdVisibility();
    }
    });

    // Master controls (chamber, year, model)
    const chamberToggles = this.querySelectorAll('.master-toggle[data-chamber]');
    chamberToggles.forEach(toggle => {
      toggle.addEventListener('click', (event) => {
        const clickedToggle = event.target;
        chamberToggles.forEach(t => t.classList.remove('active'));
        clickedToggle.classList.add('active');
        
        // Handle chamber-specific controls
        const selectedChamber = clickedToggle.dataset.chamber;
        
        // 🆕 LÓGICA PARA COALICIONES - Ajustar año cuando cambie la cámara
        const coalitionSwitch = document.querySelector('#coalition-switch');
        const yearSelect = document.getElementById('year-select');
        
        if (coalitionSwitch && yearSelect && coalitionSwitch.classList.contains('active')) {
          // Si las coaliciones están activadas, cambiar a 2024 automáticamente
          yearSelect.value = '2024';
          console.log('[DEBUG] 🤝 Cámara cambiada a', selectedChamber, 'con coaliciones activadas: estableciendo año 2024');
        }
        
        const overrepGroup = document.getElementById('overrepresentation-group');
        const seatCapGroup = document.getElementById('seat-cap-group');
        const firstMinorityGroup = document.getElementById('first-minority-group');
        
        if (selectedChamber === 'diputados') {
          // Show overrepresentation and seat cap for deputies
          if (overrepGroup) overrepGroup.style.display = 'block';
          if (seatCapGroup) seatCapGroup.style.display = 'block';
          if (firstMinorityGroup) firstMinorityGroup.style.display = 'none';
          console.log(' Switched to Diputados - showing overrepresentation controls');
        } else if (selectedChamber === 'senadores') {
          // Hide deputy-specific controls
          if (overrepGroup) overrepGroup.style.display = 'none';
          if (seatCapGroup) seatCapGroup.style.display = 'none';
          
          // Para senado, verificar también el sistema electoral antes de mostrar primera minoría
          if (firstMinorityGroup) {
            const selectedElectoralRule = document.querySelector('input[name="electoral-rule"]:checked');
            const electoralValue = selectedElectoralRule ? selectedElectoralRule.value : 'mixto';
            const shouldShowFirstMinority = electoralValue === 'mr' || electoralValue === 'mixto';
            
            firstMinorityGroup.style.display = shouldShowFirstMinority ? 'block' : 'none';
            
            console.log(` Switched to Senadores - Primera Minoría ${shouldShowFirstMinority ? 'MOSTRADA' : 'OCULTADA'} (Sistema: ${electoralValue})`);
          }
        }
        
        //  LLAMAR ACTUALIZACIÓN CUANDO CAMBIE CÁMARA
        if (typeof window.actualizarDesdeControles === 'function') {
          window.actualizarDesdeControles();
          console.log(' Called actualizarDesdeControles after chamber change');
        } else {
          console.error(' actualizarDesdeControles no disponible');
        }
        
        // 🆕 Recargar partidos cuando cambie la cámara
        const currentYearSelect = document.getElementById('year-select');
        if (currentYearSelect) {
          // Actualizar años disponibles según la cámara (comentado temporalmente)
          // this.updateAvailableYears(selectedChamber);
          
          const currentYear = parseInt(currentYearSelect.value);
          console.log(`[DEBUG] 🔄 Cambiando cámara a ${selectedChamber}, manteniendo año ${currentYear}`);
          
          // 🆕 Actualizar configuración de VoteRedistribution con nueva cámara
          if (window.voteRedistribution) {
            window.voteRedistribution.setConfig({
              camara: selectedChamber
            });
            console.log(`[DEBUG] 📊 Configuración actualizada - Cámara: ${selectedChamber}`);
          }
          
          this.loadPartiesByYear(currentYear, selectedChamber);
        }
      });
    });

    // Event listener para cambios de año - cargar partidos dinámicamente
    const yearSelect = this.querySelector('#year-select');
    if (yearSelect) {
      yearSelect.addEventListener('change', () => {
        const selectedYear = parseInt(yearSelect.value);
        const activeChamber = this.querySelector('.master-toggle.active');
        const chamber = activeChamber ? activeChamber.dataset.chamber : 'diputados';
        
        console.log(`[DEBUG] 📅 Año cambiado a ${selectedYear} para cámara ${chamber} - cargando partidos...`);
        this.loadPartiesByYear(selectedYear, chamber);
      });
    }

    const yearPills = this.querySelectorAll('.master-pill[data-year]');
    yearPills.forEach(pill => {
      pill.addEventListener('click', function() {
        yearPills.forEach(p => p.classList.remove('active'));
        this.classList.add('active');
      });
    });

    const modelPills = this.querySelectorAll('.master-pill[data-model]');
    modelPills.forEach(pill => {
      pill.addEventListener('click', function() {
        modelPills.forEach(p => p.classList.remove('active'));
        this.classList.add('active');
      });
    });

    // Event listener para cambios de modelo - controlar estado de sliders
    const modelSelect = this.querySelector('#model-select');
    if (modelSelect) {
      modelSelect.addEventListener('change', () => {
        const isPersonalizado = modelSelect.value === 'personalizado';
        this.updateSlidersState(isPersonalizado);
        console.log(`[DEBUG] 🎛️ Modelo cambiado a: ${modelSelect.value} - Sliders ${isPersonalizado ? 'habilitados' : 'deshabilitados'}`);
      });
      
      // Establecer estado inicial
      const initialPersonalizado = modelSelect.value === 'personalizado';
      this.updateSlidersState(initialPersonalizado);
    }

    // Sliders de shock por partido - AHORA SON DINÁMICOS
    // Los event listeners se agregan automáticamente en updatePartySliders()
    console.log('[DEBUG] 🎚️ Sliders dinámicos - event listeners se configuran automáticamente');

    // Example for other sliders (add as needed):
    const magnitudeSlider = this.querySelector('#input-magnitud');
    const magnitudeValue = this.querySelector('#input-magnitud-value');
    if (magnitudeSlider && magnitudeValue) {
      magnitudeSlider.addEventListener('input', function() {
        magnitudeValue.textContent = this.value;
      });
      magnitudeValue.textContent = magnitudeSlider.value;
    }

    const thresholdSlider = this.querySelector('#threshold-slider');
    const thresholdValueBox = this.querySelector('#threshold-value-box');
    if (thresholdSlider && thresholdValueBox) {
      thresholdSlider.addEventListener('input', function() {
        thresholdValueBox.textContent = `${this.value}%`;
        
        // Actualizar configuración del sistema de redistribución
        if (window.voteRedistribution) {
          window.voteRedistribution.setConfig({
            umbral: parseFloat(this.value) / 100 // Convertir porcentaje a decimal
          });
        }
      });
      thresholdValueBox.textContent = `${thresholdSlider.value}%`;
    }

    // Overrepresentation slider
    const overrepSlider = this.querySelector('#overrep-slider');
    const overrepValueBox = this.querySelector('#overrep-value-box');
    if (overrepSlider && overrepValueBox) {
      overrepSlider.addEventListener('input', function() {
        overrepValueBox.textContent = `${this.value}%`;
      });
      overrepValueBox.textContent = `${overrepSlider.value}%`;
    }

    // SLIDERS INTELIGENTES MR/RP
    const mrSlider = this.querySelector('#input-mr');
    const mrValue = this.querySelector('#input-mr-value');
    const rpSlider = this.querySelector('#input-rp');
    const rpValue = this.querySelector('#input-rp-value');
    const validationDiv = this.querySelector('#mixto-validation');
    
    let ultimoModificado = 'mr'; // Track cual slider modificó el usuario
    
    //  Función para obtener magnitud total actual
    const getMagnitudTotal = () => parseInt(magnitudeSlider ? magnitudeSlider.value : 128);
    
    // Función para validar y ajustar MR
    const handleMrChange = (nuevoMr) => {
      const magnitudTotal = getMagnitudTotal();
      const nuevoMrNum = parseInt(nuevoMr);
      const minMr = Math.max(1, Math.floor(magnitudTotal * 0.1)); // 10% mínimo
      const maxMr = magnitudTotal - Math.max(1, Math.floor(magnitudTotal * 0.1)); // 90% máximo
      
      // Aplicar límites
      const mrLimitado = Math.min(Math.max(nuevoMrNum, minMr), maxMr);
      
      // Auto-ajustar RP
      const nuevoRp = magnitudTotal - mrLimitado;
      
      // Actualizar valores
      if (mrSlider) mrSlider.value = mrLimitado;
      if (mrValue) mrValue.textContent = mrLimitado;
      if (rpSlider) rpSlider.value = nuevoRp;
      if (rpValue) rpValue.textContent = nuevoRp;
      
      ultimoModificado = 'mr';
      updateValidation();
      
      //  ACTUALIZAR LÍMITES DE PRIMERA MINORÍA CUANDO CAMBIE MR
      updateFirstMinorityLimits();
      
      console.log(` Slider MR: ${nuevoMrNum} → ${mrLimitado}, RP auto-ajustado: ${nuevoRp}`);
      
      //  LLAMAR ACTUALIZACIÓN CUANDO CAMBIEN SLIDERS
      if (typeof window.actualizarDesdeControles === 'function') {
        setTimeout(() => window.actualizarDesdeControles(), 100);
      }
    };
    
    // Función para validar y ajustar RP
    const handleRpChange = (nuevoRp) => {
      const magnitudTotal = getMagnitudTotal();
      const nuevoRpNum = parseInt(nuevoRp);
      const minRp = Math.max(1, Math.floor(magnitudTotal * 0.1)); // 10% mínimo
      const maxRp = magnitudTotal - Math.max(1, Math.floor(magnitudTotal * 0.1)); // 90% máximo
      
      // Aplicar límites
      const rpLimitado = Math.min(Math.max(nuevoRpNum, minRp), maxRp);
      
      // Auto-ajustar MR
      const nuevoMr = magnitudTotal - rpLimitado;
      
      // Actualizar valores
      if (rpSlider) rpSlider.value = rpLimitado;
      if (rpValue) rpValue.textContent = rpLimitado;
      if (mrSlider) mrSlider.value = nuevoMr;
      if (mrValue) mrValue.textContent = nuevoMr;
      
      ultimoModificado = 'rp';
      updateValidation();
      
      //  ACTUALIZAR LÍMITES DE PRIMERA MINORÍA CUANDO CAMBIE MR (por auto-ajuste)
      updateFirstMinorityLimits();
      
      console.log(` Slider RP: ${nuevoRpNum} → ${rpLimitado}, MR auto-ajustado: ${nuevoMr}`);
      
      //  LLAMAR ACTUALIZACIÓN CUANDO CAMBIEN SLIDERS
      if (typeof window.actualizarDesdeControles === 'function') {
        setTimeout(() => window.actualizarDesdeControles(), 100);
      }
    };
    
    // Función para mostrar validación visual
    const updateValidation = () => {
      const magnitudTotal = getMagnitudTotal();
      const mrActual = parseInt(mrSlider ? mrSlider.value : 64);
      const rpActual = parseInt(rpSlider ? rpSlider.value : 64);
      const sumaTotal = mrActual + rpActual;
      const esValido = sumaTotal === magnitudTotal;
      
      if (validationDiv) {
        validationDiv.classList.remove('hidden');
        if (esValido) {
          validationDiv.innerHTML = `<span style="color: #6B7280;">La suma da el total de escaños seleccionados (${sumaTotal})</span>`;
        } else {
          validationDiv.innerHTML = `<span style="color: #6B7280;">La suma de escaños debe dar el total de escaños seleccionados (${sumaTotal} ≠ ${magnitudTotal})</span>`;
        }
      }
      
      // Aplicar clases CSS para feedback visual
      if (mrSlider) {
        mrSlider.classList.remove('slider-active', 'slider-auto');
        mrSlider.classList.add(ultimoModificado === 'mr' ? 'slider-active' : 'slider-auto');
      }
      if (rpSlider) {
        rpSlider.classList.remove('slider-active', 'slider-auto');
        rpSlider.classList.add(ultimoModificado === 'rp' ? 'slider-active' : 'slider-auto');
      }
    };
    
    // 📡 Función para actualizar límites cuando cambia magnitud
    const updateSliderLimits = () => {
      const magnitudTotal = getMagnitudTotal();
      const minValue = Math.max(1, Math.floor(magnitudTotal * 0.1));
      const maxValue = magnitudTotal - minValue;
      
      if (mrSlider) {
        mrSlider.min = minValue;
        mrSlider.max = maxValue;
      }
      if (rpSlider) {
        rpSlider.min = minValue;
        rpSlider.max = maxValue;
      }
      
      // Re-validar valores actuales
      const mrActual = parseInt(mrSlider ? mrSlider.value : 64);
      const rpActual = parseInt(rpSlider ? rpSlider.value : 64);
      
      if (mrActual + rpActual !== magnitudTotal) {
        // Auto-ajustar manteniendo proporciones
        const proporcionMr = mrActual / (mrActual + rpActual);
        const nuevoMr = Math.round(magnitudTotal * proporcionMr);
        handleMrChange(nuevoMr);
      }
      
      //  VALIDAR PRIMERA MINORÍA TRAS CAMBIOS DE MAGNITUD
      updateFirstMinorityLimits();
    };
    
    //  Función para validar límites de Primera Minoría
    const updateFirstMinorityLimits = () => {
      const firstMinoritySlider = document.getElementById('input-first-minority');
      const firstMinorityValue = document.getElementById('input-first-minority-value');
      const firstMinorityWarning = document.getElementById('first-minority-warning');
      
      if (firstMinoritySlider && firstMinorityValue) {
        const mrActual = parseInt(mrSlider ? mrSlider.value : 64);
        const magnitudTotal = getMagnitudTotal();
        
        // El máximo de primera minoría no puede superar escaños MR
        const maxFirstMinority = Math.min(mrActual, magnitudTotal);
        firstMinoritySlider.max = maxFirstMinority;
        
        // Si el valor actual supera el nuevo límite, ajustarlo
        const currentFirstMinority = parseInt(firstMinoritySlider.value);
        if (currentFirstMinority > maxFirstMinority) {
          const newValue = Math.min(currentFirstMinority, maxFirstMinority);
          firstMinoritySlider.value = newValue;
          firstMinorityValue.textContent = newValue;
          
          console.log(` Primera Minoría ajustada: ${currentFirstMinority} → ${newValue} (Límite MR: ${mrActual})`);
          
          // Trigger update if function exists
          if (typeof window.actualizarDesdeControles === 'function') {
            setTimeout(() => window.actualizarDesdeControles(), 100);
          }
        }
        
        // Mostrar información de límites
        if (firstMinorityWarning) {
          const finalFirstMinority = parseInt(firstMinoritySlider.value);
          const percentageOfMr = mrActual > 0 ? Math.round((finalFirstMinority / mrActual) * 100) : 0;
          
          if (finalFirstMinority >= maxFirstMinority * 0.8 && maxFirstMinority > 0) {
            firstMinorityWarning.innerHTML = `Límite: máx ${maxFirstMinority} escaños (MR disponibles)`;
            firstMinorityWarning.style.display = 'block';
            firstMinorityWarning.style.color = '#f59e0b';
          } else if (finalFirstMinority > 0) {
            firstMinorityWarning.innerHTML = `${percentageOfMr}% de escaños MR (${finalFirstMinority}/${mrActual})`;
            firstMinorityWarning.style.display = 'block';
            firstMinorityWarning.style.color = '#6B7280';
          } else {
            firstMinorityWarning.style.display = 'none';
          }
        }
        
        console.log(` Primera Minoría - Límite actualizado: max ${maxFirstMinority} (MR: ${mrActual}, Total: ${magnitudTotal})`);
      }
    };
    
    // Event listeners para sliders MR/RP - INTEGRADO CON SISTEMA DE REDISTRIBUCIÓN
    if (mrSlider) {
      mrSlider.addEventListener('input', function() {
        handleMrChange(this.value);
        
        // Actualizar configuración del sistema de redistribución
        if (window.voteRedistribution) {
          window.voteRedistribution.setConfig({
            mr_seats: parseInt(this.value),
            rp_seats: parseInt(rpSlider ? rpSlider.value : 64),
            escanos_totales: parseInt(magnitudeSlider ? magnitudeSlider.value : 128)
          });
        }
      });
      // Inicializar valor
      mrValue.textContent = mrSlider.value;
    }
    
    if (rpSlider) {
      rpSlider.addEventListener('input', function() {
        handleRpChange(this.value);
        
        // Actualizar configuración del sistema de redistribución
        if (window.voteRedistribution) {
          window.voteRedistribution.setConfig({
            mr_seats: parseInt(mrSlider ? mrSlider.value : 64),
            rp_seats: parseInt(this.value),
            escanos_totales: parseInt(magnitudeSlider ? magnitudeSlider.value : 128)
          });
        }
      });
      // Inicializar valor
      rpValue.textContent = rpSlider.value;
    }
    
    // Event listener para magnitud - INTEGRADO CON SISTEMA DE REDISTRIBUCIÓN
    if (magnitudeSlider) {
      magnitudeSlider.addEventListener('input', function() {
        updateSliderLimits();
        
        // Actualizar configuración del sistema de redistribución
        if (window.voteRedistribution) {
          window.voteRedistribution.setConfig({
            escanos_totales: parseInt(this.value),
            mr_seats: parseInt(mrSlider ? mrSlider.value : 64),
            rp_seats: parseInt(rpSlider ? rpSlider.value : 64)
          });
        }
      });
    }
    
    // Inicializar todo
    updateSliderLimits();
    updateValidation();

    // First minority slider
    const firstMinoritySlider = this.querySelector('#input-first-minority');
    const firstMinorityValue = this.querySelector('#input-first-minority-value');
    if (firstMinoritySlider && firstMinorityValue) {
      firstMinoritySlider.addEventListener('input', function() {
        firstMinorityValue.textContent = this.value;
        
        //  ACTUALIZAR WARNING EN TIEMPO REAL
        updateFirstMinorityLimits();
        
        // Trigger update if function exists
        if (typeof window.actualizarDesdeControles === 'function') {
          setTimeout(() => window.actualizarDesdeControles(), 100);
        }
      });
      firstMinorityValue.textContent = firstMinoritySlider.value;
    }

    // Seat cap slider
    const seatCapSlider = this.querySelector('#seat-cap-input');
    const seatCapValue = this.querySelector('#seat-cap-input-value');
    if (seatCapSlider && seatCapValue) {
      seatCapSlider.addEventListener('input', function() {
        seatCapValue.textContent = this.value;
      });
      seatCapValue.textContent = seatCapSlider.value;
    }

    // Toggles (switches) - improved handling
    const switches = this.querySelectorAll('.control-switch, .switch');
    switches.forEach(switchEl => {
      switchEl.addEventListener('click', function() {
        const isActive = switchEl.classList.toggle('active');
        switchEl.setAttribute('aria-checked', isActive ? 'true' : 'false');
        switchEl.dataset.switch = isActive ? 'On' : 'Off';
        
        // Handle specific switch behaviors
        const switchId = switchEl.id;
        console.log(` Switch ${switchId} toggled: ${isActive ? 'ON' : 'OFF'}`);
        
        // Seat cap switch - show/hide additional controls
        if (switchId === 'seat-cap-switch') {
          const inputGroup = document.getElementById('seat-cap-input-group');
          if (inputGroup) {
            inputGroup.style.display = isActive ? 'block' : 'none';
          }
        }
        
        // First minority switch - show/hide slider
        if (switchId === 'first-minority-switch') {
          const inputGroup = document.getElementById('first-minority-input-group');
          if (inputGroup) {
            inputGroup.style.display = isActive ? 'block' : 'none';
          }
        }
      });
      
      // Initialize switch states
      const isActive = switchEl.classList.contains('active');
      switchEl.setAttribute('aria-checked', isActive ? 'true' : 'false');
      switchEl.dataset.switch = isActive ? 'On' : 'Off';
    });

    // Radio buttons - native implementation
    const radioGroups = ['threshold-type', 'electoral-rule'];
    radioGroups.forEach(groupName => {
      const radios = this.querySelectorAll(`input[name="${groupName}"]`);
      radios.forEach(radio => {
        radio.addEventListener('change', function() {
          if (this.checked) {
            console.log(` ${groupName} selected: ${this.value}`);
            
            // Handle specific logic for electoral rule changes
            if (groupName === 'electoral-rule') {
              const mixtoInputs = document.getElementById('mixto-inputs');
              if (mixtoInputs) {
                mixtoInputs.style.display = this.value === 'mixto' ? 'block' : 'none';
              }
              
              // Controlar visibilidad de Primera Minoría según sistema electoral
              const firstMinorityGroup = document.getElementById('first-minority-group');
              if (firstMinorityGroup) {
                // Mostrar solo si es mayoría relativa o mixto
                const shouldShow = this.value === 'mr' || this.value === 'mixto';
                firstMinorityGroup.style.display = shouldShow ? 'block' : 'none';
                
                console.log(` Primera Minoría ${shouldShow ? 'MOSTRADA' : 'OCULTADA'} para sistema: ${this.value}`);
                
                // Si se oculta, desactivar el switch automáticamente
                if (!shouldShow) {
                  const firstMinoritySwitch = document.getElementById('first-minority-switch');
                  if (firstMinoritySwitch && firstMinoritySwitch.getAttribute('data-switch') === 'On') {
                    firstMinoritySwitch.click(); // Desactivar
                    console.log(' Primera Minoría desactivada automáticamente');
                  }
                }
              }
              
              // Controlar visibilidad de Sobrerrepresentación según sistema electoral
              const overrepGroup = document.getElementById('overrepresentation-group');
              const activeChamber = document.querySelector('.master-toggle.active');
              const currentChamber = activeChamber ? activeChamber.dataset.chamber : 'diputados';
              
              if (overrepGroup && currentChamber === 'diputados') {
                // Lógica según tu análisis constitucional:
                let shouldShowOverrep = false;
                let reason = '';
                
                if (this.value === 'mr') {
                  // MR puro → NO tiene sentido (resultado ya dado distrito por distrito)
                  shouldShowOverrep = false;
                  reason = 'MR puro: resultado ya definido distrito por distrito';
                } else if (this.value === 'rp') {
                  // RP puro → Verificar si hay umbral
                  const thresholdSwitch = document.getElementById('threshold-switch');
                  const hasThreshold = thresholdSwitch && thresholdSwitch.getAttribute('data-switch') === 'On';
                  
                  if (!hasThreshold) {
                    // RP sin umbral → NO tiene sentido (reparto perfectamente proporcional)
                    shouldShowOverrep = false;
                    reason = 'RP puro sin umbral: reparto perfectamente proporcional';
                  } else {
                    // RP con umbral → PODRÍA tener sentido pero es "doble freno"
                    shouldShowOverrep = true;
                    reason = 'RP con umbral: posible pero es doble freno';
                  }
                } else if (this.value === 'mixto') {
                  // Mixto → SÍ tiene sentido (combinación clásica donde puede haber sobrerrep)
                  shouldShowOverrep = true;
                  reason = 'Mixto: escenario clásico para sobrerrepresentación';
                }
                
                overrepGroup.style.display = shouldShowOverrep ? 'block' : 'none';
                
                console.log(` Sobrerrepresentación ${shouldShowOverrep ? 'MOSTRADA' : 'OCULTADA'} - Sistema: ${this.value} (${reason})`);
                
                // Si se oculta, desactivar el switch automáticamente
                if (!shouldShowOverrep) {
                  const overrepSwitch = document.getElementById('overrep-switch');
                  if (overrepSwitch && overrepSwitch.getAttribute('data-switch') === 'On') {
                    overrepSwitch.click(); // Desactivar
                    console.log(' Sobrerrepresentación desactivada automáticamente');
                  }
                }
              }
            }
          }
        });
      });
    });

    // Initialize input group states based on switch states
    const firstMinoritySwitch = this.querySelector('#first-minority-switch');
    const firstMinorityInputGroup = this.querySelector('#first-minority-input-group');
    if (firstMinoritySwitch && firstMinorityInputGroup) {
      const isActive = firstMinoritySwitch.classList.contains('active');
      firstMinorityInputGroup.style.display = isActive ? 'block' : 'none';
    }

    // Initialize chamber-specific controls on page load
    this.initializeChamberControls();

    // Add more control initializations as needed...
  }

  initializeChamberControls() {
    // Set initial state based on active chamber
    const activeChamber = this.querySelector('.master-toggle.active');
    const selectedChamber = activeChamber ? activeChamber.dataset.chamber : 'senadores';
    
    const overrepGroup = this.querySelector('#overrepresentation-group');
    const seatCapGroup = this.querySelector('#seat-cap-group');
    const firstMinorityGroup = this.querySelector('#first-minority-group');
    
    if (selectedChamber === 'diputados') {
      if (overrepGroup) overrepGroup.style.display = 'block';
      if (seatCapGroup) seatCapGroup.style.display = 'block';
      if (firstMinorityGroup) firstMinorityGroup.style.display = 'none';
      
      // Aplicar lógica constitucional para sobrerrepresentación
      this.updateOverrepresentationVisibility();
    } else {
      // Para senado, verificar también el sistema electoral
      if (overrepGroup) overrepGroup.style.display = 'none';
      if (seatCapGroup) seatCapGroup.style.display = 'none';
      
      // Primera minoría solo visible en senado Y con sistema MR o Mixto
      if (firstMinorityGroup) {
        const selectedElectoralRule = this.querySelector('input[name="electoral-rule"]:checked');
        const electoralValue = selectedElectoralRule ? selectedElectoralRule.value : 'mixto';
        const shouldShowFirstMinority = electoralValue === 'mr' || electoralValue === 'mixto';
        
        firstMinorityGroup.style.display = shouldShowFirstMinority ? 'block' : 'none';
        
        console.log(` Primera Minoría ${shouldShowFirstMinority ? 'MOSTRADA' : 'OCULTADA'} - Cámara: ${selectedChamber}, Sistema: ${electoralValue}`);
      }
    }
    
    console.log(`Initialized chamber controls for: ${selectedChamber}`);
    
    // 🔄 INICIALIZAR SISTEMA DE REPARTO EXCLUSIVO
    this.initializeRepartoSystem();
  }
  
  initializeRepartoSystem() {
    const repartoModeRadios = this.querySelectorAll('input[name="reparto-mode"]');
    const repartoMethodSelect = this.querySelector('#reparto-method');
    
    // Métodos disponibles por modo
    const metodos = {
      cuota: [
        { value: 'hare', label: 'Hare' },
        { value: 'droop', label: 'Droop' },
        { value: 'imperiali', label: 'Imperiali' }
      ],
      divisor: [
        { value: 'dhondt', label: "D'Hondt" },
        { value: 'sainte_lague', label: 'Sainte-Laguë' },
        { value: 'webster', label: 'Webster' }
      ]
    };
    
    // Función para actualizar el dropdown
    const updateMethodSelect = (mode) => {
      if (!repartoMethodSelect) return;
      
      const opciones = metodos[mode] || metodos.cuota;
      repartoMethodSelect.innerHTML = opciones
        .map(metodo => `<option value="${metodo.value}">${metodo.label}</option>`)
        .join('');
      
      console.log(`[DEBUG] Métodos de ${mode} cargados:`, opciones.map(m => m.value));
    };
    
    // Event listeners para los radio buttons
    repartoModeRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (e.target.checked) {
          updateMethodSelect(e.target.value);
          console.log(`[DEBUG] Modo de reparto cambiado a: ${e.target.value}`);
        }
      });
    });
    
    // Inicializar con el modo seleccionado por defecto
    const modoSeleccionado = this.querySelector('input[name="reparto-mode"]:checked');
    if (modoSeleccionado) {
      updateMethodSelect(modoSeleccionado.value);
    } else {
      updateMethodSelect('cuota'); // Default
    }
    
    // 🆕 Event listener para el switch de coaliciones
    const coalitionSwitch = this.querySelector('#coalition-switch');
    if (coalitionSwitch) {
      coalitionSwitch.addEventListener('click', function() {
        // Pequeño delay para que el estado del switch se actualice
        setTimeout(() => {
          const isActive = coalitionSwitch.classList.contains('active');
          const yearSelect = document.getElementById('year-select');
          const activeChamber = document.querySelector('.master-toggle.active');
          
          if (yearSelect && activeChamber) {
            const camara = activeChamber.getAttribute('data-chamber');
            
            if (isActive) {
              // Coaliciones activadas: cambiar a 2024
              yearSelect.value = '2024';
              console.log('[DEBUG] 🤝 Coaliciones activadas: cambiando a año 2024 para', camara);
            } else {
              // Coaliciones desactivadas: cambiar a 2018
              yearSelect.value = '2018';
              console.log('[DEBUG] 🚫 Coaliciones desactivadas: cambiando a año 2018 para', camara);
            }
            
            // Trigger change event para actualizar la simulación
            if (window.actualizarDesdeControles) {
              window.actualizarDesdeControles();
            }
            
            // Actualizar configuración del sistema de redistribución
            if (window.voteRedistribution) {
              window.voteRedistribution.setConfig({
                anio: parseInt(yearSelect.value),
                usar_coaliciones: isActive
              });
            }
          }
        }, 10);
      });
    }
    
    // INICIALIZACIÓN DEL SISTEMA DE REDISTRIBUCIÓN
    this.initializeVoteRedistribution();
    
    console.log('[DEBUG] Sistema de reparto exclusivo inicializado');
  }

  initializeVoteRedistribution() {
    // Importar y configurar el sistema de redistribución
    import('../vote_redistribution/VoteRedistribution.js').then(() => {
      if (window.voteRedistribution) {
        // Configurar callbacks
        window.voteRedistribution.on('update', (result) => {
          this.updateUIWithResults(result);
        });
        
        window.voteRedistribution.on('loading', (loading) => {
          this.showLoadingState(loading);
        });
        
        window.voteRedistribution.on('error', (error) => {
          this.showError(error);
        });
        
        // Configuración inicial
        const yearSelect = document.getElementById('year-select');
        const coalitionSwitch = this.querySelector('#coalition-switch');
        const activeChamber = this.querySelector('.master-toggle.active');
        const chamber = activeChamber ? activeChamber.dataset.chamber : 'diputados';
        
        window.voteRedistribution.setConfig({
          anio: yearSelect ? parseInt(yearSelect.value) : 2024,
          camara: chamber, // 🆕 Agregar cámara actual
          usar_coaliciones: coalitionSwitch ? coalitionSwitch.classList.contains('active') : true,
          mr_seats: 64,
          rp_seats: 64,
          escanos_totales: 128
        });
        
        // 🆕 Cargar partidos dinámicamente en lugar de datos estáticos
        const initialYear = yearSelect ? parseInt(yearSelect.value) : 2024;
        
        // Configurar años disponibles para la cámara inicial (comentado temporalmente)
        // this.updateAvailableYears(chamber);
        
        console.log(`[DEBUG] 🎬 Inicialización: año ${initialYear}, cámara ${chamber}`);
        console.log(`[DEBUG] 🚀 LLAMANDO loadPartiesByYear(${initialYear}, ${chamber})`);
        this.loadPartiesByYear(initialYear, chamber);
      }
    }).catch(error => {
      console.error('Error loading VoteRedistribution:', error);
    });
  }
  
  updateUIWithResults(result) {
    console.log('[DEBUG] ControlSidebar updateUIWithResults:', result);
    
    // El seat chart ya se actualiza automaticamente via VoteRedistribution.updateSeatChart()
    // Solo actualizar KPIs y tabla de resultados si existen
    
    // Actualizar KPIs
    if (result.kpis) {
      this.updateKPIs(result.kpis);
    }
    
    // Actualizar tabla de resultados detallados si existe
    if (result.resultados_detalle) {
      this.updateResultsTable(result.resultados_detalle);
    }
    
    console.log('[DEBUG] ControlSidebar UI actualizada con nuevos resultados');
  }
  
  updateKPIs(kpis) {
    // Actualizar indicadores en el dashboard
    const totalEscanos = document.querySelector('indicador-box[etiqueta="Total de escaños"]');
    if (totalEscanos && kpis.total_escanos) {
      totalEscanos.setAttribute('valor', kpis.total_escanos.toString());
    }
    
    const relacionVotos = document.querySelector('indicador-box[etiqueta="Relación votos-escaños"]');
    if (relacionVotos && kpis.ratio_promedio) {
      relacionVotos.setAttribute('valor', `±${kpis.ratio_promedio.toFixed(1)}%`);
    }
    
    const gallagher = document.querySelector('indicador-box[etiqueta="Índice de Gallagher"]');
    if (gallagher && kpis.gallagher) {
      gallagher.setAttribute('valor', kpis.gallagher.toFixed(1));
    }
  }
  
  updateResultsTable(resultados) {
    // Crear o actualizar tabla de resultados por partido si no existe
    // Este método se puede expandir según necesidades específicas
    console.log('[DEBUG] Resultados por partido:', resultados);
  }
  
  showLoadingState(loading) {
    if (loading) {
      // Mostrar indicador de carga
      if (window.notifications) {
        window.notifications.show({
          title: 'Calculando redistribución...',
          type: 'loading',
          autoHide: false,
          id: 'vote-redistribution-loading'
        });
      }
    } else {
      // Ocultar indicador de carga
      if (window.notifications) {
        window.notifications.hide('vote-redistribution-loading');
      }
    }
  }
  
  showError(error) {
    console.error('[ERROR] Vote redistribution:', error);
    if (window.notifications) {
      window.notifications.error(
        'Error en redistribución',
        error,
        5000,
        'vote-redistribution-error'
      );
    }
  }

  // 🆕 Método para cargar partidos dinámicamente por año
  async loadPartiesByYear(year, chamber = 'diputados') {
    // Generar ID único para esta llamada
    const callId = Math.random().toString(36).substr(2, 9);
    console.log(`[DEBUG] 🆔 loadPartiesByYear iniciado - ID: ${callId}, año: ${year}, cámara: ${chamber}`);
    console.log(`[DEBUG] 🔒 Estado del lock actual: this.loadingParties = ${this.loadingParties}`);
    
    // Prevenir llamadas simultáneas
    if (this.loadingParties) {
      console.log(`[DEBUG] ⏸️ Ya hay una carga en progreso, saltando llamada ${callId}`);
      return;
    }
    
    console.log(`[DEBUG] 🔓 Estableciendo lock - this.loadingParties = true`);
    this.loadingParties = true;
    
    // Declarar validYear fuera del try/catch para acceso en catch
    let validYear = year;
    
    try {
      // Validar año disponible según cámara
      const availableYears = {
        'diputados': [2024, 2021, 2018],
        'senadores': [2024, 2018],
        'senado': [2024, 2018]
      };
      
      const validYears = availableYears[chamber] || availableYears['diputados'];
      
      if (!validYears.includes(year)) {
        // Fallback al año más reciente disponible
        validYear = validYears[0];
        console.warn(`[WARN] ⚠️ Año ${year} no disponible para ${chamber}. Usando ${validYear} como fallback.`);
        
        // Actualizar el selector de año
        const yearSelect = document.getElementById('year-select');
        if (yearSelect) {
          yearSelect.value = String(validYear);
        }
      }
      
      console.log(`[DEBUG] 🔄 Cargando partidos para año ${validYear}, cámara ${chamber}...`);
      
      // Mostrar indicador de carga
      if (window.notifications) {
        window.notifications.show({
          title: 'Cargando partidos...',
          message: `Actualizando datos para ${validYear}`,
          type: 'loading',
          autoHide: false,
          id: 'loading-parties'
        });
      }

      // Realizar petición al backend usando la URL correcta
      const API_BASE = 'https://back-electoral.onrender.com';
      
      // Normalizar parámetro de cámara para el backend
      const camaraParam = chamber === 'senadores' ? 'senado' : 'diputados';
      
      const peticionURL = `${API_BASE}/partidos/por-anio?anio=${validYear}&camara=${camaraParam}`;
      console.log(`[DEBUG] 🔍 ANTES de fetch - URL: ${peticionURL}`);
      console.log(`[DEBUG] 🔍 Petición: ${peticionURL}`);
      
      const response = await fetch(peticionURL);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[ERROR] Response error:`, { status: response.status, statusText: response.statusText, body: errorText });
        throw new Error(`Error ${response.status}: ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log(`[DEBUG] 🔍 RESPUESTA RAW COMPLETA del backend:`, JSON.stringify(data, null, 2));
      console.log(`[DEBUG] ✅ Datos recibidos del backend:`, {
        year: validYear,
        chamber: camaraParam,
        totalPartidos: data.partidos?.length,
        primerPartido: data.partidos?.[0],
        ultimoPartido: data.partidos?.[data.partidos?.length - 1],
        url: peticionURL,
        responseHeaders: Object.fromEntries(response.headers.entries())
      });
      
      // Filtrar y validar datos de partidos
      if (!data.partidos || !Array.isArray(data.partidos)) {
        throw new Error('Formato de respuesta inválido: no se encontraron partidos');
      }
      
      console.log(`[DEBUG] 📥 Partidos recibidos del backend (${data.partidos.length}):`, 
        data.partidos.map(p => `${p.partido}: ${p.porcentaje_vigente}%`));
      
      // 🆕 Debug: Mostrar específicamente partidos con 0% cuando el backend esté actualizado
      const partidosConCero = data.partidos.filter(p => p.porcentaje_vigente === 0.0);
      if (partidosConCero.length > 0) {
        console.log(`[DEBUG] 🆕 Partidos con 0% detectados (${partidosConCero.length}):`, 
          partidosConCero.map(p => p.partido));
      } else {
        console.log(`[DEBUG] ℹ️ No hay partidos con 0% en esta respuesta (backend en actualización)`);
      }
      
      // Filtrar partidos válidos (eliminar entradas extrañas como TOTAL_PARTIDOS_SUM)
      const partidosValidos = data.partidos.filter(partido => {
        const nombre = partido.partido?.toUpperCase();
        const porcentaje = parseFloat(partido.porcentaje_vigente);
        
        // Filtrar nombres inválidos y porcentajes fuera de rango
        const esNombreValido = nombre && 
          !nombre.includes('TOTAL') && 
          !nombre.includes('SUM') && 
          nombre !== 'ANIO' &&
          nombre.length >= 2 &&
          nombre.length <= 20; // Aumentar límite para nombres más largos
          
        const esPorcentajeValido = !isNaN(porcentaje) && porcentaje >= 0 && porcentaje <= 100;
        
        // Debug detallado: mostrar TODOS los partidos y su estado de validación
        console.log(`[DEBUG] 🔍 Validando partido: ${nombre} (${porcentaje}%) - Nombre: ${esNombreValido ? '✅' : '❌'}, Porcentaje: ${esPorcentajeValido ? '✅' : '❌'}`);
        
        // Debug: mostrar qué partidos se están filtrando
        if (!esNombreValido || !esPorcentajeValido) {
          console.log(`[DEBUG] 🚫 Partido RECHAZADO: ${nombre} - Nombre válido: ${esNombreValido}, Porcentaje válido: ${esPorcentajeValido} (${porcentaje})`);
        } else {
          console.log(`[DEBUG] ✅ Partido ACEPTADO: ${nombre} (${porcentaje}%)`);
        }
        
        return esNombreValido && esPorcentajeValido;
      });
      
      if (partidosValidos.length === 0) {
        throw new Error(`No se encontraron partidos válidos para ${year}/${camaraParam}`);
      }
      
      console.log(`[DEBUG] 🔍 Partidos válidos encontrados: ${partidosValidos.length}`, partidosValidos.map(p => `${p.partido}: ${p.porcentaje_vigente}%`));
      
      // 🔍 Verificar suma total de partidos válidos
      const sumaTotal = partidosValidos.reduce((sum, p) => sum + p.porcentaje_vigente, 0);
      console.log(`[DEBUG] 📊 Suma total de partidos válidos: ${sumaTotal.toFixed(2)}%`);
      
      // Actualizar sliders con nuevos datos
      this.updatePartySliders(partidosValidos);
      
      // 🆕 Crear baseline data para el sistema integrado (sin VoteRedistribution)
      if (partidosValidos.length > 0) {
        const baselineData = {};
        
        // Usar todos los partidos válidos (ya no hay lista fija)
        partidosValidos.forEach(partido => {
          const nombreUpper = partido.partido.toUpperCase();
          baselineData[nombreUpper] = partido.porcentaje_vigente;
        });
        
        // 🔍 Validar suma de porcentajes baseline
        const totalBaseline = Object.values(baselineData).reduce((sum, val) => sum + val, 0);
        console.log(`[DEBUG] 📊 Suma baseline: ${totalBaseline.toFixed(2)}%`);
        
        if (totalBaseline < 90 || totalBaseline > 110) {
          console.error(`[ERROR] ⚠️ Datos baseline inválidos - Suma: ${totalBaseline.toFixed(2)}%`);
          throw new Error(`Datos baseline inválidos: suma ${totalBaseline.toFixed(1)}% (debería ser ~100%)`);
        }
        
        console.log(`[DEBUG] 🎚️ Partidos para sistema integrado:`, Object.keys(baselineData));
        console.log(`[DEBUG] 📊 Baseline data completa:`, baselineData);
        console.log(`[DEBUG] 🔄 Sliders listos para ${validYear} con sistema integrado cargarSimulacion`);
      }
      
      // Ocultar indicador de carga
      if (window.notifications) {
        window.notifications.hide('loading-parties');
        window.notifications.success(
          'Partidos actualizados',
          `Datos cargados para ${validYear}`,
          3000,
          'parties-updated'
        );
      }
      
      console.log(`[DEBUG] ✅ loadPartiesByYear completado exitosamente - ID: ${callId}`);
      
    } catch (error) {
      console.error(`[ERROR] Al cargar partidos por año (ID: ${callId}):`, error);
      
      // Ocultar indicador de carga y mostrar error
      if (window.notifications) {
        window.notifications.hide('loading-parties');
        window.notifications.error(
          'Error al cargar partidos',
          `No se pudieron cargar los datos para ${validYear}: ${error.message}`,
          5000,
          'error-loading-parties'
        );
      }
    } finally {
      // Liberar lock
      this.loadingParties = false;
      console.log(`[DEBUG] 🔓 Lock liberado - ID: ${callId}`);
    }
  }

  // 🆕 Método para generar sliders dinámicos según partidos disponibles
  updatePartySliders(partidos) {
    if (!partidos || !Array.isArray(partidos)) {
      console.warn('[WARN] Datos de partidos inválidos:', partidos);
      return;
    }

    console.log(`[DEBUG] 🎚️ INICIANDO updatePartySliders con ${partidos.length} partidos:`, partidos.map(p => `${p.partido}: ${p.porcentaje_vigente}%`));
    
    const container = this.querySelector('#dynamic-party-sliders');
    if (!container) {
      console.error('[ERROR] No se encontró el contenedor de sliders dinámicos');
      return;
    }
    
    // Limpiar sliders existentes
    const slidersAnteriores = container.children.length;
    container.innerHTML = '';
    console.log(`[DEBUG] 🧹 Limpiados ${slidersAnteriores} sliders anteriores`);
    
    // 🆕 RESET COMPLETO - Limpiar datos anteriores de memoria
    this.partidosData = {};
    
    console.log(`[DEBUG] 🔄 Reset completo realizado - partidosData limpiado para sistema integrado`);
    
    // Generar slider para cada partido
    partidos.forEach(partido => {
      const partyName = partido.partido.toLowerCase();
      const partyLabel = partido.partido.toUpperCase();
      const porcentajeVigente = partido.porcentaje_vigente;
      
      // Guardar datos del partido
      this.partidosData[partyLabel] = {
        porcentajeVigente: porcentajeVigente,
        porcentajeActual: porcentajeVigente
      };
      
      console.log(`[DEBUG] 📝 Partido inicializado: ${partyLabel} = vigente:${porcentajeVigente}%, actual:${porcentajeVigente}%`);
      
      // Crear HTML del slider - ahora muestra porcentajes absolutos
      const sliderGroup = document.createElement('div');
      sliderGroup.className = 'shock-input-group';
      sliderGroup.innerHTML = `
        <div class="shock-value-box" id="shock-value-${partyName}">${porcentajeVigente.toFixed(1)}%</div>
        <label class="shock-label" for="shock-${partyName}" title="Vigente: ${porcentajeVigente.toFixed(1)}%">${partyLabel}</label>
        <input type="range" class="control-slider" id="shock-${partyName}" min="0" max="100" step="0.1" value="${porcentajeVigente}">
      `;
      
      container.appendChild(sliderGroup);
      
      console.log(`[DEBUG] ✅ Slider creado: ${partyLabel} -> ${porcentajeVigente.toFixed(1)}% (min:0, max:100, value:${porcentajeVigente})`);
      
      // Agregar event listener al slider recién creado
      const slider = sliderGroup.querySelector(`#shock-${partyName}`);
      const valueBox = sliderGroup.querySelector(`#shock-value-${partyName}`);
      
      if (slider && valueBox) {
        slider.addEventListener('input', (event) => {
          const newValue = parseFloat(event.target.value);
          const partyNameUpper = partyName.toUpperCase();
          
          // Actualizar display inmediatamente
          valueBox.textContent = `${newValue.toFixed(1)}%`;
          
          // Actualizar datos internos
          this.partidosData[partyNameUpper].porcentajeActual = newValue;
          
          // 🎯 Solo activar redistribución si el modelo es "personalizado"
          const modelSelect = document.getElementById('model-select');
          const isPersonalizado = modelSelect && modelSelect.value === 'personalizado';
          
          if (!isPersonalizado) {
            console.log(`[DEBUG] 🔒 Redistribución desactivada - Modelo: ${modelSelect ? modelSelect.value : 'desconocido'}`);
            // Si no es personalizado, revertir al valor vigente
            slider.value = this.partidosData[partyNameUpper].porcentajeVigente;
            valueBox.textContent = `${this.partidosData[partyNameUpper].porcentajeVigente.toFixed(1)}%`;
            this.partidosData[partyNameUpper].porcentajeActual = this.partidosData[partyNameUpper].porcentajeVigente;
            return;
          }
          
          // 🎚️ Implementar normalización automática
          this.normalizeSliders(partyNameUpper, newValue);
          
          console.log(`[DEBUG] 🎚️ Slider actualizado - ${partyNameUpper}: ${newValue.toFixed(1)}%`);
          
          // Enviar datos actualizados al sistema integrado de cargarSimulacion
          const porcentajesActuales = {};
          Object.keys(this.partidosData).forEach(partido => {
            porcentajesActuales[partido] = this.partidosData[partido].porcentajeActual;
          });
          
          console.log(`[DEBUG] 🔄 Iniciando cargarSimulacion con porcentajes actualizados:`, porcentajesActuales);
          
          // Usar el sistema integrado de cargarSimulacion con debounce
          if (window.actualizarDesdeControlesSilent) {
            // Guardar porcentajes en variable global temporal para que cargarSimulacion los use
            window.porcentajesTemporales = porcentajesActuales;
            window.actualizarDesdeControlesSilent();
          }
        });
        
        console.log(`[DEBUG] ✅ Slider generado: ${partyLabel} -> base: ${porcentajeVigente.toFixed(1)}%`);
      }
    });
    
    console.log(`[DEBUG] 🎯 ${partidos.length} sliders dinámicos generados exitosamente`);
      console.log(`[DEBUG] 📊 Estado final partidosData:`, Object.keys(this.partidosData).map(partido => 
        `${partido}: vigente=${this.partidosData[partido].porcentajeVigente}%, actual=${this.partidosData[partido].porcentajeActual}%`));
      
      // 🆕 Resumen de cambios importantes
      const partidosConPorcentajeBajo = Object.keys(this.partidosData).filter(partido => 
        this.partidosData[partido].porcentajeVigente < 1.0);
      const partidosConPorcentajeCero = Object.keys(this.partidosData).filter(partido => 
        this.partidosData[partido].porcentajeVigente === 0.0);
        
      if (partidosConPorcentajeBajo.length > 0) {
        console.log(`[DEBUG] 🔍 Partidos con < 1%: ${partidosConPorcentajeBajo.join(', ')}`);
      }
      if (partidosConPorcentajeCero.length > 0) {
        console.log(`[DEBUG] 0️⃣ Partidos con 0%: ${partidosConPorcentajeCero.join(', ')}`);
      }
      
    // Aplicar estado actual del modelo a los sliders recién generados
    const modelSelect = document.getElementById('model-select');
    if (modelSelect) {
      const isPersonalizado = modelSelect.value === 'personalizado';
      console.log(`[DEBUG] 🎛️ Aplicando estado del modelo después de regenerar sliders: ${isPersonalizado ? 'personalizado' : 'vigente'}`);
      
      // 🆕 Pequeño delay para asegurar que los sliders estén completamente en el DOM
      setTimeout(() => {
        this.updateSlidersState(isPersonalizado);
        
        // 🆕 Forzar sincronización adicional si está en modo personalizado
        if (isPersonalizado) {
          console.log(`[DEBUG] 🔄 Forzando sincronización adicional en modo personalizado`);
          this.forceSyncPersonalizedSliders();
        }
      }, 10);
    }
  }

  // 🆕 Método para normalizar sliders automáticamente a 100%
  normalizeSliders(changedParty, newValue) {
    if (!this.partidosData) return;
    
    // Obtener todos los partidos excepto el que cambió
    const otherParties = Object.keys(this.partidosData).filter(party => party !== changedParty);
    
    if (otherParties.length === 0) return;
    
    // Calcular cuánto porcentaje queda para distribuir
    const remainingPercentage = 100 - newValue;
    
    if (remainingPercentage < 0) {
      // Si el nuevo valor excede 100%, limitar a 100%
      newValue = 100;
      this.partidosData[changedParty].porcentajeActual = newValue;
      
      // Actualizar el slider y display
      const sliderElement = document.getElementById(`shock-${changedParty.toLowerCase()}`);
      const valueBox = document.getElementById(`shock-value-${changedParty.toLowerCase()}`);
      if (sliderElement) sliderElement.value = newValue;
      if (valueBox) valueBox.textContent = `${newValue.toFixed(1)}%`;
      
      // Poner todos los otros en 0
      otherParties.forEach(party => {
        this.partidosData[party].porcentajeActual = 0;
        const otherSlider = document.getElementById(`shock-${party.toLowerCase()}`);
        const otherValueBox = document.getElementById(`shock-value-${party.toLowerCase()}`);
        if (otherSlider) otherSlider.value = 0;
        if (otherValueBox) otherValueBox.textContent = '0.0%';
      });
      
      return;
    }
    
    // Calcular la suma actual de los otros partidos
    const currentOthersSum = otherParties.reduce((sum, party) => {
      return sum + this.partidosData[party].porcentajeActual;
    }, 0);
    
    // Si la suma actual es 0, distribuir equitativamente
    if (currentOthersSum === 0) {
      const equalShare = remainingPercentage / otherParties.length;
      
      otherParties.forEach(party => {
        this.partidosData[party].porcentajeActual = equalShare;
        const slider = document.getElementById(`shock-${party.toLowerCase()}`);
        const valueBox = document.getElementById(`shock-value-${party.toLowerCase()}`);
        if (slider) slider.value = equalShare;
        if (valueBox) valueBox.textContent = `${equalShare.toFixed(1)}%`;
      });
    } else {
      // Redistribuir proporcionalmente
      const scaleFactor = remainingPercentage / currentOthersSum;
      
      otherParties.forEach(party => {
        const newPartyValue = this.partidosData[party].porcentajeActual * scaleFactor;
        this.partidosData[party].porcentajeActual = newPartyValue;
        
        const slider = document.getElementById(`shock-${party.toLowerCase()}`);
        const valueBox = document.getElementById(`shock-value-${party.toLowerCase()}`);
        if (slider) slider.value = newPartyValue;
        if (valueBox) valueBox.textContent = `${newPartyValue.toFixed(1)}%`;
      });
    }
    
    // Verificar que la suma sea exactamente 100%
    const totalSum = Object.values(this.partidosData).reduce((sum, data) => sum + data.porcentajeActual, 0);
    console.log(`[DEBUG] 🎚️ Normalización completada - Suma total: ${totalSum.toFixed(2)}%`);
  }

  // 🆕 Método para actualizar estado de sliders según modelo
  updateSlidersState(enabled) {
    const container = this.querySelector('#dynamic-party-sliders');
    if (!container) return;
    
    const sliders = container.querySelectorAll('.control-slider');
    const valueBoxes = container.querySelectorAll('.shock-value-box');
    
    if (enabled) {
      // Modelo personalizado - habilitar sliders Y sincronizar con valores vigentes del año actual
      console.log(`[DEBUG] 🎛️ Habilitando modo personalizado - sincronizando valores vigentes`);
      
      sliders.forEach(slider => {
        slider.disabled = false;
        
        // 🆕 IMPORTANTE: Sincronizar con valor vigente del año actual
        const partyName = slider.id.replace('shock-', '').toUpperCase();
        if (this.partidosData && this.partidosData[partyName]) {
          const porcentajeVigente = this.partidosData[partyName].porcentajeVigente;
          slider.value = porcentajeVigente;
          this.partidosData[partyName].porcentajeActual = porcentajeVigente;
          
          console.log(`[DEBUG] 🔄 Slider ${partyName} sincronizado: ${porcentajeVigente}%`);
        }
      });
      
      valueBoxes.forEach(valueBox => {
        valueBox.style.opacity = '1';
        
        // 🆕 IMPORTANTE: Sincronizar display con valor vigente del año actual
        const partyName = valueBox.id.replace('shock-value-', '').toUpperCase();
        if (this.partidosData && this.partidosData[partyName]) {
          const porcentajeVigente = this.partidosData[partyName].porcentajeVigente;
          valueBox.textContent = `${porcentajeVigente.toFixed(1)}%`;
        }
      });
      
      // 🆕 Sincronizar también con VoteRedistribution
      if (window.voteRedistribution && this.partidosData) {
        const porcentajesActuales = {};
        Object.keys(this.partidosData).forEach(partido => {
          porcentajesActuales[partido] = this.partidosData[partido].porcentajeVigente; // Usar vigente como baseline
        });
        
        console.log(`[DEBUG] 🔄 Sincronizando VoteRedistribution con valores vigentes:`, porcentajesActuales);
        window.voteRedistribution.porcentajes = porcentajesActuales;
        window.voteRedistribution.debouncedFetchResultados();
      }
      
    } else {
      // Modelo vigente - deshabilitar sliders y mostrar valores vigentes
      sliders.forEach(slider => {
        slider.disabled = true;
        
        // Encontrar el partido correspondiente y resetear al valor vigente
        const partyName = slider.id.replace('shock-', '').toUpperCase();
        if (this.partidosData && this.partidosData[partyName]) {
          const porcentajeVigente = this.partidosData[partyName].porcentajeVigente;
          slider.value = porcentajeVigente;
          this.partidosData[partyName].porcentajeActual = porcentajeVigente;
        }
      });
      
      valueBoxes.forEach(valueBox => {
        valueBox.style.opacity = '0.5';
        
        // Encontrar el partido correspondiente y mostrar valor vigente
        const partyName = valueBox.id.replace('shock-value-', '').toUpperCase();
        if (this.partidosData && this.partidosData[partyName]) {
          const porcentajeVigente = this.partidosData[partyName].porcentajeVigente;
          valueBox.textContent = `${porcentajeVigente.toFixed(1)}%`;
        }
      });
    }
    
    // Actualizar contenedor visual
    if (container) {
      if (enabled) {
        container.style.opacity = '1';
        container.style.pointerEvents = 'auto';
      } else {
        container.style.opacity = '0.5';
        container.style.pointerEvents = 'none';
      }
    }
    
    console.log(`[DEBUG] 🎚️ Sliders ${enabled ? 'habilitados' : 'deshabilitados'} - Total: ${sliders.length}`);
  }

  // 🆕 Método para forzar sincronización en modo personalizado
  forceSyncPersonalizedSliders() {
    if (!this.partidosData) {
      console.warn(`[WARN] 🚫 forceSyncPersonalizedSliders: No hay partidosData disponible`);
      return;
    }
    
    console.log(`[DEBUG] 🔄 Iniciando sincronización forzada de sliders personalizados`);
    
    const container = this.querySelector('#dynamic-party-sliders');
    if (!container) {
      console.error(`[ERROR] 🚫 No se encontró contenedor de sliders dinámicos`);
      return;
    }
    
    // Verificar y sincronizar cada slider individualmente
    Object.keys(this.partidosData).forEach(partyNameUpper => {
      const partyNameLower = partyNameUpper.toLowerCase();
      const slider = document.getElementById(`shock-${partyNameLower}`);
      const valueBox = document.getElementById(`shock-value-${partyNameLower}`);
      const vigente = this.partidosData[partyNameUpper].porcentajeVigente;
      
      if (slider && valueBox) {
        // Sincronizar valor del slider
        slider.value = vigente;
        valueBox.textContent = `${vigente.toFixed(1)}%`;
        
        // Actualizar datos internos
        this.partidosData[partyNameUpper].porcentajeActual = vigente;
        
        console.log(`[DEBUG] ✅ Slider sincronizado: ${partyNameUpper} = ${vigente}%`);
      } else {
        console.warn(`[WARN] 🚫 No se encontró slider para ${partyNameUpper}`);
      }
    });
    
    // Sincronizar con cargarSimulacion en lugar de VoteRedistribution
    const porcentajesVigentes = {};
    Object.keys(this.partidosData).forEach(partido => {
      porcentajesVigentes[partido] = this.partidosData[partido].porcentajeVigente;
    });
    
    console.log(`[DEBUG] 🔄 Iniciando cargarSimulacion con porcentajes vigentes:`, porcentajesVigentes);
    
    // Usar cargarSimulacion integrado en lugar de VoteRedistribution separado
    if (window.actualizarDesdeControles) {
      // Llamar al sistema estándar que ya maneja cargarSimulacion con timing correcto
      window.actualizarDesdeControlesSilent();
    }
    
    console.log(`[DEBUG] ✅ Sincronización forzada completada`);
  }

  // 🆕 Método para actualizar años disponibles según la cámara
  updateAvailableYears(chamber) {
    const yearSelect = document.getElementById('year-select');
    if (!yearSelect) return;

    // Definir años disponibles por cámara
    const availableYears = {
      'diputados': [
        { value: '2024', label: '2024' },
        { value: '2021', label: '2021' },
        { value: '2018', label: '2018' }
      ],
      'senadores': [
        { value: '2024', label: '2024' },
        { value: '2018', label: '2018' }
      ]
    };

    const currentValue = yearSelect.value;
    const yearsForChamber = availableYears[chamber] || availableYears['diputados'];
    
    // Limpiar opciones existentes
    yearSelect.innerHTML = '';
    
    // Agregar nuevas opciones
    yearsForChamber.forEach(year => {
      const option = document.createElement('option');
      option.value = year.value;
      option.textContent = year.label;
      yearSelect.appendChild(option);
    });
    
    // Intentar mantener el año actual si está disponible
    const availableValues = yearsForChamber.map(y => y.value);
    if (availableValues.includes(currentValue)) {
      yearSelect.value = currentValue;
    } else {
      // Si el año actual no está disponible, usar el más reciente
      yearSelect.value = yearsForChamber[0].value;
    }
    
    console.log(`[DEBUG] 📅 Años actualizados para ${chamber}:`, availableValues, `Seleccionado: ${yearSelect.value}`);
  }

  // 🆕 Método para controlar visibilidad de sobrerrepresentación según sistema electoral
  updateOverrepresentationVisibility() {
    const overrepGroup = document.getElementById('overrepresentation-group');
    const activeChamber = document.querySelector('.master-toggle.active');
    const currentChamber = activeChamber ? activeChamber.dataset.chamber : 'diputados';
    const selectedElectoralRule = document.querySelector('input[name="electoral-rule"]:checked');
    const electoralValue = selectedElectoralRule ? selectedElectoralRule.value : 'mixto';
    
    if (overrepGroup && currentChamber === 'diputados') {
      let shouldShowOverrep = false;
      let reason = '';
      
      if (electoralValue === 'mr') {
        // MR puro → NO tiene sentido (resultado ya dado distrito por distrito)
        shouldShowOverrep = false;
        reason = 'MR puro: resultado ya definido distrito por distrito';
      } else if (electoralValue === 'rp') {
        // RP puro → Verificar si hay umbral
        const thresholdSwitch = document.getElementById('threshold-switch');
        const hasThreshold = thresholdSwitch && thresholdSwitch.getAttribute('data-switch') === 'On';
        
        if (!hasThreshold) {
          // RP sin umbral → NO tiene sentido (reparto perfectamente proporcional)
          shouldShowOverrep = false;
          reason = 'RP puro sin umbral: reparto perfectamente proporcional';
        } else {
          // RP con umbral → PODRÍA tener sentido pero es "doble freno"
          shouldShowOverrep = true;
          reason = 'RP con umbral: posible pero es doble freno';
        }
      } else if (electoralValue === 'mixto') {
        // Mixto → SÍ tiene sentido (combinación clásica donde puede haber sobrerrep)
        shouldShowOverrep = true;
        reason = 'Mixto: escenario clásico para sobrerrepresentación';
      }
      
      overrepGroup.style.display = shouldShowOverrep ? 'block' : 'none';
      console.log(`[DEBUG] [updateOverrepresentationVisibility] ${shouldShowOverrep ? 'MOSTRADA' : 'OCULTADA'} - ${reason}`);
      
      // Si se oculta, desactivar el switch automáticamente
      if (!shouldShowOverrep) {
        const overrepSwitch = document.getElementById('overrep-switch');
        if (overrepSwitch && overrepSwitch.getAttribute('data-switch') === 'On') {
          overrepSwitch.click();
          console.log('[DEBUG] Sobrerrepresentación desactivada automáticamente');
        }
      }
    }
  }
}

customElements.define('control-sidebar', ControlSidebar);