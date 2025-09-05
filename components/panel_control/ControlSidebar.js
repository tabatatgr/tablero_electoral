// Simple test version of ControlSidebar
export class ControlSidebar extends HTMLElement {
  connectedCallback() {
    console.log('ControlSidebar connected!');
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
                    <button class="master-toggle" data-chamber="diputados" role="tab">
                      <span class="toggle-text">Diputados</span>
                    </button>
                    <button class="master-toggle active" data-chamber="senadores" role="tab">
                      <span class="toggle-text">Senadores</span>
                    </button>
                  </div>
                </div>
                <div class="control-item">
                  <label class="control-label">Año</label>
                  <select class="control-select" id="year-select">
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
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
                  <div class="party-shock-inputs">
                    <div class="shock-input-group">
                      <div class="shock-value-box" id="shock-value-morena">+0.0%</div>
                      <label class="shock-label" for="shock-morena">MORENA</label>
                      <input type="range" class="control-slider" id="shock-morena" min="-20" max="20" step="0.1" value="0">
                    </div>
                    <div class="shock-input-group">
                      <div class="shock-value-box" id="shock-value-pan">+0.0%</div>
                      <label class="shock-label" for="shock-pan">PAN</label>
                      <input type="range" class="control-slider" id="shock-pan" min="-20" max="20" step="0.1" value="0">
                    </div>
                    <div class="shock-input-group">
                      <div class="shock-value-box" id="shock-value-pri">+0.0%</div>
                      <label class="shock-label" for="shock-pri">PRI</label>
                      <input type="range" class="control-slider" id="shock-pri" min="-20" max="20" step="0.1" value="0">
                    </div>
                    <div class="shock-input-group">
                      <div class="shock-value-box" id="shock-value-pt">+0.0%</div>
                      <label class="shock-label" for="shock-pt">PT</label>
                      <input type="range" class="control-slider" id="shock-pt" min="-20" max="20" step="0.1" value="0">
                    </div>
                    <div class="shock-input-group">
                      <div class="shock-value-box" id="shock-value-pvem">+0.0%</div>
                      <label class="shock-label" for="shock-pvem">PVEM</label>
                      <input type="range" class="control-slider" id="shock-pvem" min="-20" max="20" step="0.1" value="0">
                    </div>
                    <div class="shock-input-group">
                      <div class="shock-value-box" id="shock-value-mc">+0.0%</div>
                      <label class="shock-label" for="shock-mc">MC</label>
                      <input type="range" class="control-slider" id="shock-mc" min="-20" max="20" step="0.1" value="0">
                    </div>
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
    
    // Función para controlar visibilidad de sobrerrepresentación según sistema electoral
    function updateOverrepresentationVisibility() {
      const overrepGroup = document.getElementById('overrepresentation-group');
      const activeChamber = document.querySelector('.master-toggle.active');
      const currentChamber = activeChamber ? activeChamber.dataset.chamber : 'diputados';
      const selectedElectoralRule = document.querySelector('input[name="electoral-rule"]:checked');
      const electoralValue = selectedElectoralRule ? selectedElectoralRule.value : 'mixto';
      
      if (overrepGroup && currentChamber === 'diputados') {
        let shouldShowOverrep = false;
        let reason = '';
        
        if (electoralValue === 'mr') {
          shouldShowOverrep = false;
          reason = 'MR puro: resultado ya definido distrito por distrito';
        } else if (electoralValue === 'rp') {
          const hasThreshold = thresholdSwitch && thresholdSwitch.classList.contains('active');
          if (!hasThreshold) {
            shouldShowOverrep = false;
            reason = 'RP puro sin umbral: reparto perfectamente proporcional';
          } else {
            shouldShowOverrep = true;
            reason = 'RP con umbral: posible pero es doble freno';
          }
        } else if (electoralValue === 'mixto') {
          shouldShowOverrep = true;
          reason = 'Mixto: escenario clásico para sobrerrepresentación';
        }
        
        overrepGroup.style.display = shouldShowOverrep ? 'block' : 'none';
        console.log(` [updateOverrepresentationVisibility] ${shouldShowOverrep ? 'MOSTRADA' : 'OCULTADA'} - ${reason}`);
        
        // Si se oculta, desactivar el switch automáticamente
        if (!shouldShowOverrep) {
          const overrepSwitch = document.getElementById('overrep-switch');
          if (overrepSwitch && overrepSwitch.classList.contains('active')) {
            overrepSwitch.click();
            console.log(' Sobrerrepresentación desactivada automáticamente');
          }
        }
      }
    }
    if (thresholdSwitch) {
      thresholdSwitch.addEventListener('click', function() {
        setTimeout(updateThresholdVisibility, 0);
        // También actualizar visibilidad de sobrerrepresentación
        setTimeout(updateOverrepresentationVisibility, 0);
      });
      // Inicializar visibilidad al cargar
      updateThresholdVisibility();
    }
    });

    // Master controls (chamber, year, model)
    const chamberToggles = this.querySelectorAll('.master-toggle[data-chamber]');
    chamberToggles.forEach(toggle => {
      toggle.addEventListener('click', function() {
        chamberToggles.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        
        // Handle chamber-specific controls
        const selectedChamber = this.dataset.chamber;
        
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
      });
    });

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

    // Sliders (shocks, magnitude, threshold, MR/RP, etc.)
    const shockSliders = this.querySelectorAll('.control-slider[id^="shock-"]');
    shockSliders.forEach(slider => {
      slider.addEventListener('input', function() {
        const partyName = this.id.replace('shock-', '');
        const valueBox = slider.closest('.shock-input-group')?.querySelector('.shock-value-box');
        if (valueBox) {
          const value = parseFloat(this.value);
          valueBox.textContent = `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
        }
      });
      // Initialize display
      const valueBox = slider.closest('.shock-input-group')?.querySelector('.shock-value-box');
      if (valueBox) {
        const value = parseFloat(slider.value);
        valueBox.textContent = `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
      }
    });

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
    
    // Event listeners para sliders MR/RP
    if (mrSlider) {
      mrSlider.addEventListener('input', function() {
        handleMrChange(this.value);
      });
      // Inicializar valor
      mrValue.textContent = mrSlider.value;
    }
    
    if (rpSlider) {
      rpSlider.addEventListener('input', function() {
        handleRpChange(this.value);
      });
      // Inicializar valor
      rpValue.textContent = rpSlider.value;
    }
    
    // Event listener para magnitud (actualizar límites)
    if (magnitudeSlider) {
      magnitudeSlider.addEventListener('input', function() {
        updateSliderLimits();
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
      updateOverrepresentationVisibility();
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
          }
        }, 10);
      });
    }
    
    console.log('[DEBUG] Sistema de reparto exclusivo inicializado');
  }
}

customElements.define('control-sidebar', ControlSidebar);