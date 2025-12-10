// Simple test version of ControlSidebar
export class ControlSidebar extends HTMLElement {
  connectedCallback() {
    console.log('ControlSidebar connected!');
    
    //  Exposer referencia global para que VoteRedistribution pueda acceder
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
            
            <!-- 2. Tamaño de la cámara (ahora colocado antes de la regla electoral) -->
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
                  <div id="magnitud-note" class="parameter-note" style="display:none; color:#6b7280; margin-top:6px; font-size:0.9em;">Nota: en sistemas de Mayoría Relativa (MR) el número de escaños asignables está limitado por la cantidad de distritos; no puedes asignar más escaños por MR que distritos disponibles. Ajusta la magnitud o la distribución según corresponda.</div>
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

                  <!-- magnitud: placeholder moved outside rules group -->
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
            
              <!-- magnitud movida arriba para priorizar tamaño de cámara frente a la regla electoral -->

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
        updateOverrepVisibility();
      });
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

    // Master controls (chamber, year, model)
    const chamberToggles = this.querySelectorAll('.master-toggle[data-chamber]');
    chamberToggles.forEach(toggle => {
      toggle.addEventListener('click', (event) => {
        // Usar currentTarget para asegurar que el botón correcto reciba la clase
        // si el usuario clickea un elemento hijo (span, svg, etc.).
        const clickedToggle = event.currentTarget || event.target.closest('.master-toggle');
        if (!clickedToggle) return;
        chamberToggles.forEach(t => t.classList.remove('active'));
        clickedToggle.classList.add('active');

        // Handle chamber-specific controls
        const selectedChamber = clickedToggle.dataset.chamber;
        
        //  LÓGICA PARA COALICIONES - Ajustar año cuando cambie la cámara
        const coalitionSwitch = document.querySelector('#coalition-switch');
        const yearSelect = document.getElementById('year-select');
        
        if (coalitionSwitch && yearSelect && coalitionSwitch.classList.contains('active')) {
          // Si las coaliciones están activadas, cambiar a 2024 automáticamente
          yearSelect.value = '2024';
          console.log('[DEBUG]  Cámara cambiada a', selectedChamber, 'con coaliciones activadas: estableciendo año 2024');
        }
        
        const overrepGroup = document.getElementById('overrepresentation-group');
        const seatCapGroup = document.getElementById('seat-cap-group');
        const firstMinorityGroup = document.getElementById('first-minority-group');
        
        if (selectedChamber === 'diputados') {
          // Show overrepresentation, seat cap AND first minority for deputies
          if (overrepGroup) overrepGroup.style.display = 'block';
          if (seatCapGroup) seatCapGroup.style.display = 'block';
          
          // 🆕 PRIMERA MINORÍA TAMBIÉN DISPONIBLE PARA DIPUTADOS
          if (firstMinorityGroup) {
            const selectedElectoralRule = document.querySelector('input[name="electoral-rule"]:checked');
            const electoralValue = selectedElectoralRule ? selectedElectoralRule.value : 'mixto';
            const shouldShowFirstMinority = electoralValue === 'mr' || electoralValue === 'mixto';
            
            firstMinorityGroup.style.display = shouldShowFirstMinority ? 'block' : 'none';
            
            console.log(` Switched to Diputados - Primera Minoría ${shouldShowFirstMinority ? 'MOSTRADA' : 'OCULTADA'} (Sistema: ${electoralValue})`);
          }
          console.log(' Switched to Diputados - showing overrepresentation controls & PM');
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
        
        //  Recargar partidos cuando cambie la cámara
        const currentYearSelect = document.getElementById('year-select');
        if (currentYearSelect) {
          // Actualizar años disponibles según la cámara (comentado temporalmente)
          // this.updateAvailableYears(selectedChamber);
          
          const currentYear = parseInt(currentYearSelect.value);
          console.log(`[DEBUG]  Cambiando cámara a ${selectedChamber}, manteniendo año ${currentYear}`);
          
          //  Actualizar configuración de VoteRedistribution con nueva cámara
          if (window.voteRedistribution) {
            window.voteRedistribution.setConfig({
              camara: selectedChamber
            });
            console.log(`[DEBUG]  Configuración actualizada - Cámara: ${selectedChamber}`);
          }
          
          this.loadPartiesByYear(currentYear, selectedChamber);
        }
      });
    });

    // Event listener para cambios de año - cargar partidos dinámicamente
    const yearSelect = this.querySelector('#year-select');
    if (yearSelect) {
      yearSelect.addEventListener('change', () => {
  // Marcar que el usuario seleccionó explícitamente un año
  try { yearSelect.dataset.userSelected = 'true'; } catch(e) { /* silent */ }
        const selectedYear = parseInt(yearSelect.value);
        const activeChamber = this.querySelector('.master-toggle.active');
        const chamber = activeChamber ? activeChamber.dataset.chamber : 'diputados';
        
        console.log(`[DEBUG]  Año cambiado a ${selectedYear} para cámara ${chamber} - cargando partidos...`);
        this.loadPartiesByYear(selectedYear, chamber);
      });
    }

    const yearPills = this.querySelectorAll('.master-pill[data-year]');
    yearPills.forEach(pill => {
      pill.addEventListener('click', function() {
        // Marcar visualmente la pill seleccionada
        yearPills.forEach(p => p.classList.remove('active'));
        this.classList.add('active');

        // Sincronizar con el select de año y disparar la carga correspondiente
        const yearValue = this.getAttribute('data-year') || this.dataset.year || this.textContent.trim();
        const yearSelectEl = document.getElementById('year-select');
        const activeChamber = this.closest('control-sidebar') ? this.closest('control-sidebar').querySelector('.master-toggle.active') : document.querySelector('.master-toggle.active');
        const chamber = activeChamber ? activeChamber.dataset.chamber : 'diputados';

        if (yearSelectEl) {
          // Indicar que el usuario eligió el año mediante la pill
          try { yearSelectEl.dataset.userSelected = 'true'; } catch(e) { /* silent */ }
          yearSelectEl.value = String(yearValue);
          // Disparar evento change para reutilizar el listener existente
          yearSelectEl.dispatchEvent(new Event('change'));
        } else {
          // Si no existe el select por alguna razón, llamar directamente al loader
          const parsed = parseInt(yearValue, 10) || 2024;
          try {
            if (typeof window.controlSidebar !== 'undefined' && typeof window.controlSidebar.loadPartiesByYear === 'function') {
              window.controlSidebar.loadPartiesByYear(parsed, chamber);
            } else if (typeof this.loadPartiesByYear === 'function') {
              this.loadPartiesByYear(parsed, chamber);
            }
          } catch (err) {
            console.warn('[WARN] No se pudo invocar loadPartiesByYear desde pill click:', err);
          }
        }
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
      modelSelect.addEventListener('change', (event) => {
        const isPersonalizado = modelSelect.value === 'personalizado';
        // Si el cambio proviene del usuario (isTrusted), NO sincronizamos automáticamente
        // con valores vigentes para evitar sobreescribir lo que el usuario ya tenía.
        const syncWithVigente = !(event && event.isTrusted);
        this.updateSlidersState(isPersonalizado, syncWithVigente);
        console.log(`[DEBUG]  Modelo cambiado a: ${modelSelect.value} - Sliders ${isPersonalizado ? 'habilitados' : 'deshabilitados'} (syncWithVigente=${syncWithVigente})`);

        // Ajustar topes de sliders según modelo y cámara
        const chamberBtn = this.querySelector('.master-toggle.active');
        const camara = chamberBtn ? chamberBtn.dataset.chamber : 'diputados';
        const mrSlider = this.querySelector('#input-mr');
        const magnitudeSlider = this.querySelector('#input-magnitud');
        let maxMr = 700;
        let maxMagnitud = 700;
        if (modelSelect.value === 'personalizado' || modelSelect.value === 'mixto') {
          if (camara === 'senadores') {
            maxMr = 64;
            maxMagnitud = 128;
          } else {
            maxMr = 300;
            maxMagnitud = 500;
          }
        }
        if (mrSlider) {
          // Aplicar tope absoluto según cámara
          const chamberCap = camara === 'senadores' ? 64 : 300;
          const capped = Math.min(maxMr, chamberCap);
          mrSlider.max = capped;
          // Si el valor actual excede el tope, recortarlo
          const cur = parseInt(mrSlider.value || '0', 10);
          if (!isNaN(cur) && cur > capped) {
            mrSlider.value = capped;
            if (mrValue) mrValue.textContent = String(capped);
            handleMrChange(capped);
          }
        }
        if (magnitudeSlider) magnitudeSlider.max = maxMagnitud;
      });
      
  // Establecer estado inicial (sin especificar event → sincronizar por defecto)
  const initialPersonalizado = modelSelect.value === 'personalizado';
  this.updateSlidersState(initialPersonalizado, true);
    }

    // Sliders de shock por partido - AHORA SON DINÁMICOS
    // Los event listeners se agregan automáticamente en updatePartySliders()
    console.log('[DEBUG]  Sliders dinámicos - event listeners se configuran automáticamente');

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
    
    //  Función para actualizar límites cuando cambia magnitud
    //  allowAdjust: si es false, solo actualiza min/max y validación, pero NO reescribe los valores actuales
    const updateSliderLimits = (allowAdjust = true) => {
      const magnitudTotal = getMagnitudTotal();
      const minValue = Math.max(1, Math.floor(magnitudTotal * 0.1));
      const maxValue = magnitudTotal - minValue;
      
      if (mrSlider) {
        // Determinar tope según cámara: 300 para diputados, 64 para senadores
        const chamberBtnLocal = document.querySelector('.master-toggle.active') || this.querySelector('.master-toggle.active');
        const camaraLocal = chamberBtnLocal ? chamberBtnLocal.dataset.chamber : 'diputados';
        const chamberCap = (camaraLocal === 'senadores' || camaraLocal === 'senado') ? 64 : 300;

        const cappedMax = Math.min(maxValue, chamberCap);
        mrSlider.min = Math.min(minValue, cappedMax);
        mrSlider.max = cappedMax;

        // Si el valor actual excede el tope, recortarlo
        const currentMr = parseInt(mrSlider.value || '0', 10);
        if (!isNaN(currentMr) && currentMr > cappedMax) {
          mrSlider.value = cappedMax;
          if (mrValue) mrValue.textContent = String(cappedMax);
          console.log(`[DEBUG] mrSlider recortado a tope de cámara: ${cappedMax}`);
          // Propagar cambio
          handleMrChange(cappedMax);
        }
      }
      if (rpSlider) {
        rpSlider.min = minValue;
        rpSlider.max = maxValue;
      }
      
      // Re-validar valores actuales
      const mrActual = parseInt(mrSlider ? mrSlider.value : 64);
      const rpActual = parseInt(rpSlider ? rpSlider.value : 64);
      
      if (mrActual + rpActual !== magnitudTotal) {
        if (allowAdjust) {
          // Auto-ajustar manteniendo proporciones
          const proporcionMr = mrActual / (mrActual + rpActual);
          const nuevoMr = Math.round(magnitudTotal * proporcionMr);
          handleMrChange(nuevoMr);
        } else {
          // No ajustar valores automáticamente, solo actualizar la validación visual
          updateValidation();
          console.log('[DEBUG] updateSliderLimits: cambio de magnitud detectado pero allowAdjust=false → no se reescriben valores');
        }
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
        // Safety clamp: ensure value never exceeds declared max (cap por cámara)
        try {
          const declaredMax = parseInt(this.max || this.getAttribute('max') || '0', 10);
          let val = parseInt(this.value || '0', 10);
          if (!isNaN(declaredMax) && val > declaredMax) {
            val = declaredMax;
            this.value = String(val);
            if (mrValue) mrValue.textContent = String(val);
            console.log(`[DEBUG] mrSlider input recortado al max declarado: ${declaredMax}`);
          }
          handleMrChange(val);
        } catch (err) {
          // Fallback: si falla, llamar normalmente
          handleMrChange(this.value);
        }
        
        // Actualizar configuración del sistema de redistribución
        if (window.voteRedistribution) {
          // DEBUG: asegurar que el valor leído del slider es el que se envía
          console.log('[TRACE] ControlSidebar -> setConfig (mr input):', {
            mr_from_slider: parseInt(this.value),
            rp_from_slider: parseInt(rpSlider ? rpSlider.value : 64),
            escanos_from_slider: parseInt(magnitudeSlider ? magnitudeSlider.value : 128)
          });
          const reqId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(36).slice(2,9)}`;
          // Guardar req_id y parámetros en el componente global para poder validar/rescalar respuestas
          if (window.controlSidebar) {
            window.controlSidebar.lastRequestId = reqId;
            window.controlSidebar.lastRequestParams = {
              mr_seats: parseInt(this.value),
              rp_seats: parseInt(rpSlider ? rpSlider.value : 64),
              escanos_totales: parseInt(magnitudeSlider ? magnitudeSlider.value : 128)
            };
          }
          window.voteRedistribution.setConfig({
            req_id: reqId,
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
          console.log('[TRACE] ControlSidebar -> setConfig (rp input):', {
            mr_from_slider: parseInt(mrSlider ? mrSlider.value : 64),
            rp_from_slider: parseInt(this.value),
            escanos_from_slider: parseInt(magnitudeSlider ? magnitudeSlider.value : 128)
          });
          const reqId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(36).slice(2,9)}`;
          if (window.controlSidebar) {
            window.controlSidebar.lastRequestId = reqId;
            window.controlSidebar.lastRequestParams = {
              mr_seats: parseInt(mrSlider ? mrSlider.value : 64),
              rp_seats: parseInt(this.value),
              escanos_totales: parseInt(magnitudeSlider ? magnitudeSlider.value : 128)
            };
          }
          window.voteRedistribution.setConfig({
            req_id: reqId,
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
  // Usuario ajusta magnitud: solo actualizar min/max y validación, NO reescribir valores actuales
  updateSliderLimits(false);
        
        // Actualizar configuración del sistema de redistribución
        if (window.voteRedistribution) {
          console.log('[TRACE] ControlSidebar -> setConfig (magnitude input):', {
            escanos_from_slider: parseInt(this.value),
            mr_from_slider: parseInt(mrSlider ? mrSlider.value : 64),
            rp_from_slider: parseInt(rpSlider ? rpSlider.value : 64)
          });
          const reqId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(36).slice(2,9)}`;
          if (window.controlSidebar) {
            window.controlSidebar.lastRequestId = reqId;
            window.controlSidebar.lastRequestParams = {
              escanos_totales: parseInt(this.value),
              mr_seats: parseInt(mrSlider ? mrSlider.value : 64),
              rp_seats: parseInt(rpSlider ? rpSlider.value : 64)
            };
          }
          window.voteRedistribution.setConfig({
            req_id: reqId,
            escanos_totales: parseInt(this.value),
            mr_seats: parseInt(mrSlider ? mrSlider.value : 64),
            rp_seats: parseInt(rpSlider ? rpSlider.value : 64)
          });
        }
      });
    }
    
  // Inicializar todo
  updateSliderLimits(true);
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
              
              // Controlar visibilidad de Primera Minoría y nota de magnitud según sistema electoral
              const firstMinorityGroup = document.getElementById('first-minority-group');
              const magnitudNote = document.getElementById('magnitud-note');
              const showForMrOrMixto = this.value === 'mr' || this.value === 'mixto';
              if (firstMinorityGroup) {
                firstMinorityGroup.style.display = showForMrOrMixto ? 'block' : 'none';
                console.log(` Primera Minoría ${showForMrOrMixto ? 'MOSTRADA' : 'OCULTADA'} para sistema: ${this.value}`);
                // Si se oculta, desactivar el switch automáticamente
                if (!showForMrOrMixto) {
                  const firstMinoritySwitch = document.getElementById('first-minority-switch');
                  if (firstMinoritySwitch && firstMinoritySwitch.getAttribute('data-switch') === 'On') {
                    firstMinoritySwitch.click(); // Desactivar
                    console.log(' Primera Minoría desactivada automáticamente');
                  }
                }
              }
              // Mostrar nota explicativa de magnitud sólo si MR o Mixto
              if (magnitudNote) {
                magnitudNote.style.display = showForMrOrMixto ? 'block' : 'none';
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

                  // Si el usuario está en modo personalizado, NO forzar el valor de MR a un tope como 300.
                  // Solo actualizar límites y max sin reescribir el valor actual.
                  try {
                    const modelSelect = document.getElementById('model-select');
                    const isPersonalizado = modelSelect && modelSelect.value === 'personalizado';
                    if (isPersonalizado) {
                      console.log('[DEBUG] electoral-rule: MR seleccionado en modo personalizado → actualizar topes sin forzar valores');
                      // Actualizar límites de sliders sin ajustar valores
                      updateSliderLimits(false);
                      // Ajustar max de input-mr si hace falta según magnitud actual
                      const magnitudeSlider = document.getElementById('input-magnitud');
                      const mrSliderLocal = document.getElementById('input-mr');
                      if (magnitudeSlider && mrSliderLocal) {
                        const camaraBtn = document.querySelector('.master-toggle.active');
                        const camara = camaraBtn ? camaraBtn.dataset.chamber : 'diputados';
                        const maxMr = camara === 'senadores' ? 64 : Math.min(300, parseInt(magnitudeSlider.max || 500));
                        mrSliderLocal.max = maxMr;
                        console.log(`[DEBUG] input-mr.max ajustado a ${maxMr} sin cambiar su valor actual`);
                      }
                    }
                  } catch (err) {
                    console.warn('[WARN] No se pudo aplicar ajuste seguro al seleccionar MR:', err);
                  }
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
      
      // 🆕 PRIMERA MINORÍA TAMBIÉN DISPONIBLE PARA DIPUTADOS (igual que senado)
      if (firstMinorityGroup) {
        const selectedElectoralRule = this.querySelector('input[name="electoral-rule"]:checked');
        const electoralValue = selectedElectoralRule ? selectedElectoralRule.value : 'mixto';
        const shouldShowFirstMinority = electoralValue === 'mr' || electoralValue === 'mixto';
        
        firstMinorityGroup.style.display = shouldShowFirstMinority ? 'block' : 'none';
        
        console.log(` Diputados - Primera Minoría ${shouldShowFirstMinority ? 'MOSTRADA' : 'OCULTADA'} (Sistema: ${electoralValue})`);
      }
      
      // Aplicar lógica constitucional para sobrerrepresentación
      this.updateOverrepresentationVisibility();
    } else {
      // Para senado, verificar también el sistema electoral
      if (overrepGroup) overrepGroup.style.display = 'none';
      if (seatCapGroup) seatCapGroup.style.display = 'none';
      
      // Primera minoría también visible en senado con sistema MR o Mixto
      if (firstMinorityGroup) {
        const selectedElectoralRule = this.querySelector('input[name="electoral-rule"]:checked');
        const electoralValue = selectedElectoralRule ? selectedElectoralRule.value : 'mixto';
        const shouldShowFirstMinority = electoralValue === 'mr' || electoralValue === 'mixto';
        
        firstMinorityGroup.style.display = shouldShowFirstMinority ? 'block' : 'none';
        
        console.log(` Primera Minoría ${shouldShowFirstMinority ? 'MOSTRADA' : 'OCULTADA'} - Cámara: ${selectedChamber}, Sistema: ${electoralValue}`);
      }
    }
    
    console.log(`Initialized chamber controls for: ${selectedChamber}`);
    
    //  INICIALIZAR SISTEMA DE REPARTO EXCLUSIVO
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
    
    //  Event listener para el switch de coaliciones
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
              console.log('[DEBUG]  Coaliciones activadas: cambiando a año 2024 para', camara);
            } else {
              // Coaliciones desactivadas: cambiar a 2018
              yearSelect.value = '2018';
              console.log('[DEBUG]  Coaliciones desactivadas: cambiando a año 2018 para', camara);
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
          camara: chamber, //  Agregar cámara actual
          usar_coaliciones: coalitionSwitch ? coalitionSwitch.classList.contains('active') : true,
          mr_seats: 64,
          rp_seats: 64,
          escanos_totales: 128
        });
        
        //  Cargar partidos dinámicamente en lugar de datos estáticos
        const initialYear = yearSelect ? parseInt(yearSelect.value) : 2024;
        
        // Configurar años disponibles para la cámara inicial (comentado temporalmente)
        // this.updateAvailableYears(chamber);
        
        console.log(`[DEBUG]  Inicialización: año ${initialYear}, cámara ${chamber}`);
        console.log(`[DEBUG]  LLAMANDO loadPartiesByYear(${initialYear}, ${chamber})`);
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
    // Validación por req_id si viene (evita aplicar respuestas fuera de orden)
    if (result && result.meta && result.meta.req_id && this.lastRequestId && result.meta.req_id !== this.lastRequestId) {
      console.warn('[WARN] Ignorando resultado con req_id distinto (posible response out-of-order):', result.meta.req_id, '!==', this.lastRequestId);
      return; // ignorar
    }

    // Guardar último resultado (solo si no fue ignorado)
    // Preserve original raw result and allow a possibly scaled version for UI
    this.lastResultOriginal = result || null;
    this.lastResult = result || null;

    // Mostrar notificación clara sobre si la redistribución se ejecutó en backend
    try {
      const executed = result && result.meta && result.meta.redistribution_executed;
      if (executed) {
        if (window.notifications && window.notifications.isReady) {
          window.notifications.success('Redistribución aplicada', 'La redistribución se aplicó correctamente.', 4000);
        } else {
          safeNotification && safeNotification('success', 'Redistribución aplicada', 'La redistribución se aplicó correctamente.');
        }
      } else {
        // Si no se detectó ejecución, normalmente avisamos. Si el resultado es un fallback_local
        // (resultado local generado por el frontend), suprimir la notificación visual para evitar ruido.
        if (result && result.meta && result.meta.fallback_local) {
          console.warn('[WARN] Redistribución no detectada en backend pero resultado es fallback_local; notificación suprimida');
        } else {
          // Notificar solo cuando realmente se sospeche un fallo del backend
          if (window.notifications && window.notifications.isReady) {
            window.notifications.warning('Atención: no se aplicó la redistribución', 'No se detectó ejecución remota de la redistribución. Los resultados mostrados pueden ser aproximados.', 8000);
          } else {
            safeNotification && safeNotification('warning', 'Atención: no se aplicó la redistribución', 'No se detectó ejecución remota de la redistribución. Los resultados mostrados pueden ser aproximados.');
          }
        }
      }
    } catch (err) {
      console.warn('[WARN] Error al notificar estado de redistribución:', err);
    }

    // Si estamos en modo personalizado y el backend devolvió un total distinto al solicitado,
    // crear una versión escalada del seat_chart para mostrar en UI (sin mutar el original)
    try {
      const modelSelect = document.getElementById('model-select');
      const isPersonalizado = modelSelect && modelSelect.value === 'personalizado';
      const requested = (window.controlSidebar && window.controlSidebar.lastRequestParams) ? window.controlSidebar.lastRequestParams : null;
      const backendTotal = result && result.kpis && result.kpis.total_escanos ? parseInt(result.kpis.total_escanos) : null;
      const requestedTotal = requested && requested.escanos_totales ? parseInt(requested.escanos_totales) : null;

      if (isPersonalizado && backendTotal && requestedTotal && backendTotal !== requestedTotal && Array.isArray(result.seat_chart)) {
        // Do NOT auto-scale the server result. Instead, record mismatch and show a warning.
        console.warn('[WARN] Backend devolvió un total distinto al solicitado en modo personalizado. No se aplicará escalado automático. BackendTotal:', backendTotal, 'RequestedTotal:', requestedTotal);
        // Mark mismatch so UI or telemetry can handle it; do not mutate or replace seat_chart
        this.lastResult._server_total_mismatch = true;
        // Notify the user (non-intrusive) that server result differs from requested total
        try {
          if (window.notifications && window.notifications.isReady) {
            window.notifications.warning('Discrepancia en total de escaños', `Los resultados devueltos contienen ${backendTotal} escaños mientras solicitaste ${requestedTotal}. Se mostrará la versión recibida.`, 8000);
          } else {
            safeNotification('warning', `Los resultados devueltos contienen ${backendTotal} escaños mientras solicitaste ${requestedTotal}. Se mostrará la versión recibida.`);
          }
        } catch (err) {
          console.warn('[WARN] No se pudo mostrar la notificación de discrepancia:', err);
        }
      }
    } catch (err) {
      console.warn('[WARN] Error al intentar escalar seat_chart para UI:', err);
    }

    // No automatic replacement of seat-chart with scaled version (scaling is prohibited)

    // If there was a server mismatch we already warned the user above; do not create extra UI actions

    if (result.kpis) {
      this.updateKPIs(result.kpis);
    }
    
    // Actualizar tabla de resultados detallados si existe
    if (result.resultados_detalle) {
      this.updateResultsTable(result.resultados_detalle);
    }
    
    // Actualizar la notificación de usuario (si existe) a Listo cuando lleguen resultados
    try {
      if (window.notifications && window.notifications.isReady) {
        try {
          window.notifications.update('user-calculation', { title: 'Listo', subtitle: 'Resultados calculados', type: 'success', duration: 3500 });
        } catch (e) {
          try { window.notifications.hide('user-calculation'); } catch(err){}
          window.notifications.success('Listo', 'Resultados calculados', 3500);
        }
      } else if (typeof safeNotification === 'function') {
        try { safeNotification('hide', 'user-calculation'); } catch(e){}
        safeNotification('success', { title: 'Listo', message: 'Resultados calculados', id: 'user-calculation-done', duration: 3500 });
      }
    } catch (err) {
      console.warn('[WARN] No se pudo actualizar notificación user-calculation:', err);
    }

    console.log('[DEBUG] ControlSidebar UI actualizada con nuevos resultados');
  }
  
  updateKPIs(kpis) {
    // Helper: calcular relación local si backend no la provee (usa campos 'votos' y 'total' cuando existen)
    function computeLocalRelation(resultados) {
      if (!Array.isArray(resultados) || resultados.length === 0) return null;
      const totalVotos = resultados.reduce((s, r) => s + (r.votos || r.votes || 0), 0);
      const totalEscanos = resultados.reduce((s, r) => s + (r.total || r.seats || 0), 0);
      if (totalVotos <= 0 || totalEscanos <= 0) return null;
      const ratios = resultados
        .filter(r => (r.votos || r.votes || 0) > 0 && (r.total || r.seats || 0) > 0)
        .map(r => {
          const votos = r.votos || r.votes || 0;
          const esc = r.total || r.seats || 0;
          return ((esc / totalEscanos) / (votos / totalVotos));
        });
      if (!ratios.length) return null;
      ratios.sort((a, b) => a - b);
      const m = ratios.length;
      const median = (m % 2 === 1) ? ratios[(m - 1) / 2] : (ratios[m / 2 - 1] + ratios[m / 2]) / 2;
      return median;
    }

    // Actualizar indicador de total de escaños si viene
    const totalEscanos = document.querySelector('indicador-box[etiqueta="Total de escaños"]');
    if (totalEscanos && kpis && kpis.total_escanos !== undefined && kpis.total_escanos !== null) {
      totalEscanos.setAttribute('valor', String(kpis.total_escanos));
    }

    const relacionVotos = document.querySelector('indicador-box[etiqueta="Relación votos-escaños"]');
    if (relacionVotos) {
      // Prioridad clara solicitada por el cliente
      // 1) kpis.relacion_votos_escanos
      // 2) kpis.ratio_promedio_ponderado_por_votos
      // 3) kpis.ratio_promedio_unweighted
      // 4) kpis.ratio_promedio
      // 5) kpis.mae_votos_vs_escanos
      // 6) calcular localmente
      let relacion = null;
      let fuente = null;

      if (kpis) {
        if (kpis.relacion_votos_escanos != null) {
          relacion = kpis.relacion_votos_escanos;
          fuente = 'backend.relacion_votos_escanos';
        } else if (kpis.ratio_promedio_ponderado_por_votos != null) {
          relacion = kpis.ratio_promedio_ponderado_por_votos;
          fuente = 'backend.ratio_promedio_ponderado_por_votos';
        } else if (kpis.ratio_promedio_unweighted != null) {
          relacion = kpis.ratio_promedio_unweighted;
          fuente = 'backend.ratio_promedio_unweighted';
        } else if (kpis.ratio_promedio != null) {
          relacion = kpis.ratio_promedio;
          fuente = 'backend.ratio_promedio';
        } else if (kpis.mae_votos_vs_escanos != null) {
          relacion = kpis.mae_votos_vs_escanos;
          fuente = 'backend.mae_votos_vs_escanos';
        }
      }

      // Helper: calcular ratio promedio (media) local si backend no lo provee
      function computeAverageRelation(resultados) {
        if (!Array.isArray(resultados) || resultados.length === 0) return null;
        const totalVotos = resultados.reduce((s, r) => s + (r.votos || r.votes || 0), 0);
        const totalEscanos = resultados.reduce((s, r) => s + (r.total || r.seats || 0), 0);
        if (totalVotos <= 0 || totalEscanos <= 0) return null;
        const ratios = resultados
          .filter(r => (r.votos || r.votes || 0) > 0 && (r.total || r.seats || 0) > 0)
          .map(r => {
            const votos = r.votos || r.votes || 0;
            const esc = r.total || r.seats || 0;
            return ((esc / totalEscanos) / (votos / totalVotos));
          });
        if (!ratios.length) return null;
        const sum = ratios.reduce((a,b) => a + b, 0);
        return sum / ratios.length;
      }

      // Si no hay relación en kpis, intentar calcular con resultados disponibles (usar versión escalada si existe)
      if (relacion == null && this.lastResult && (this.lastResult.result || this.lastResult.resultados || this.lastResult.seat_chart)) {
        // Use only the server-provided results (no scaled fallback)
        const posibles = this.lastResult.result || this.lastResult.resultados || this.lastResult.seat_chart;
        // Intentar primero mediana (ya implementada), luego promedio si procede
        relacion = computeLocalRelation(posibles);
        if (relacion != null) {
          fuente = 'local.median_ratio';
        } else {
          const avg = computeAverageRelation(posibles);
          if (avg != null) {
            relacion = avg;
            fuente = 'local.mean_ratio';
          }
        }
      }

      // Formateo y actualización UI
  if (relacion == null || isNaN(Number(relacion))) {
        relacionVotos.setAttribute('valor', '—');
        relacionVotos.setAttribute('fuente', 'n/a');
        relacionVotos.removeAttribute('tooltip');
        console.warn('[WARN] updateKPIs: no se pudo obtener relacion votos-escaños (backend ni cálculo local)');
      } else {
        const numeric = Number(relacion);
        relacionVotos.setAttribute('valor', numeric.toFixed(3));
        relacionVotos.setAttribute('fuente', fuente || 'backend.unknown');

        // Tooltip: si backend marca meta.ratio_informativo en la respuesta, mostrarlo
        if (this.lastResult && this.lastResult.meta && this.lastResult.meta.ratio_informativo) {
          relacionVotos.setAttribute('tooltip', this.lastResult.meta.ratio_informativo);
        } else {
          // Si no hay tooltip suministrado, eliminar cualquier tooltip previo
          relacionVotos.removeAttribute('tooltip');
        }
      }
    }

    const gallagher = document.querySelector('indicador-box[etiqueta="Índice de Gallagher"]');
    if (gallagher && kpis.gallagher !== undefined && kpis.gallagher !== null) {
      if (typeof kpis.gallagher === 'number' && !isNaN(kpis.gallagher)) {
        gallagher.setAttribute('valor', kpis.gallagher.toFixed(1));
      } else {
        gallagher.setAttribute('valor', 'N/D');
      }
    }
  }
  
  
  updateResultsTable(resultados) {
    // Crear o actualizar tabla de resultados por partido si no existe
    // Este método se puede expandir según necesidades específicas
    console.log('[DEBUG] Resultados por partido:', resultados);
  }
  
  showLoadingState(loading) {
    const notifId = 'redistribution-processing';
    try {
      if (loading) {
        const reqId = this.lastRequestId || (window.voteRedistribution && window.voteRedistribution.lastResponseMeta && window.voteRedistribution.lastResponseMeta.req_id) || null;
        const subtitle = reqId ? `Calculando resultados… (req ${reqId})` : 'Calculando resultados…';
        if (window.notifications && window.notifications.isReady) {
          // Mostrar notificación persistente de carga
          window.notifications.loading('Procesando redistribución', subtitle, notifId);
        } else if (typeof safeNotification === 'function') {
          // Fallback al safeNotification global si existe
          safeNotification('show', {
            title: 'Procesando redistribución',
            message: subtitle,
            type: 'loading',
            autoHide: false,
            id: notifId
          });
        } else {
          console.log('[INFO] Procesando redistribución:', subtitle);
        }
      } else {
        // Finalizó la carga: actualizar notificación a success y dejar que se oculte automáticamente
        if (window.notifications && window.notifications.isReady) {
          try {
            // Intentar actualizar la notificación existente
            window.notifications.update(notifId, { title: 'Listo', subtitle: 'Resultados calculados', type: 'success', duration: 3500 });
          } catch (err) {
            // Si no existe o hay error, ocultar e informar
            try { window.notifications.hide(notifId); } catch (e) { /* silent */ }
            window.notifications.success('Listo', 'Resultados calculados', 3500);
          }
        } else if (typeof safeNotification === 'function') {
          try { safeNotification('hide', notifId); } catch (e) { /* silent */ }
          safeNotification('success', { title: 'Listo', message: 'Resultados calculados', id: `${notifId}-done`, autoHide: 3500 });
        } else {
          console.log('[INFO] Redistribución completada');
        }
      }
    } catch (err) {
      console.warn('[WARN] showLoadingState error:', err);
    }
  }
  
  showError(error) {
    console.error('[ERROR] Vote redistribution:', error);
    const notifId = 'redistribution-processing';
    try {
      // Ocultar la notificación de procesando si existe
      if (window.notifications && window.notifications.isReady) {
        try { window.notifications.hide(notifId); } catch (e) { /* silent */ }
        // No mostrar notificación de error visual en la UI para evitar spam.
        // Registramos el detalle en consola para debugging y dejamos al desarrollador
        // revisar logs si es necesario.
        const msg = (error && error.message) ? error.message : String(error || 'Error desconocido');
        console.warn('[WARN] Redistribución produjo error (notificación suprimida):', msg);
      } else if (typeof safeNotification === 'function') {
        try { safeNotification('hide', notifId); } catch (e) { /* silent */ }
        // Evitar mostrar safeNotification de error para no saturar al usuario
        try { console.warn('[WARN] Redistribución produjo error (safeNotification suprimida):', String(error || 'Error desconocido')); } catch(e){}
      } else {
        // Fallback final: log en consola
        console.warn('Error en redistribución (alert suprimido): ' + (error && error.message ? error.message : String(error)));
      }
    } catch (err) {
      console.warn('[WARN] showError error:', err);
    }
  }

  //  Método para cargar partidos dinámicamente por año
  async loadPartiesByYear(year, chamber = 'diputados') {
    // Generar ID único para esta llamada
    const callId = Math.random().toString(36).substr(2, 9);
    console.log(`[DEBUG]  loadPartiesByYear iniciado - ID: ${callId}, año: ${year}, cámara: ${chamber}`);
    console.log(`[DEBUG]  Estado del lock actual: this.loadingParties = ${this.loadingParties}`);
    
    // Prevenir llamadas simultáneas
    if (this.loadingParties) {
      console.log(`[DEBUG] ⏸ Ya hay una carga en progreso, saltando llamada ${callId}`);
      return;
    }
    
    console.log(`[DEBUG]  Estableciendo lock - this.loadingParties = true`);
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
        console.warn(`[WARN]  Año ${year} no disponible para ${chamber}. Usando ${validYear} como fallback.`);
        
        // Actualizar el selector de año
        const yearSelect = document.getElementById('year-select');
        if (yearSelect) {
          yearSelect.value = String(validYear);
        }
      }
      
      console.log(`[DEBUG]  Cargando partidos para año ${validYear}, cámara ${chamber}...`);
      
      // Mostrar indicador de carga (usar safeNotification si está disponible)
      if (typeof safeNotification === 'function') {
        safeNotification('show', {
          title: 'Cargando partidos...',
          message: `Actualizando datos para ${validYear}`,
          type: 'loading',
          autoHide: false,
          id: 'loading-parties'
        });
      } else if (window.notifications) {
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
      console.log(`[DEBUG]  ANTES de fetch - URL: ${peticionURL}`);
      console.log(`[DEBUG]  Petición: ${peticionURL}`);
      
      const response = await fetch(peticionURL);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[ERROR] Response error:`, { status: response.status, statusText: response.statusText, body: errorText });
        throw new Error(`Error ${response.status}: ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log(`[DEBUG] RESPUESTA RAW COMPLETA del backend:`, JSON.stringify(data, null, 2));
      console.log(`[DEBUG] Datos recibidos del backend:`, {
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
      
      console.log(`[DEBUG]  Partidos recibidos del backend (${data.partidos.length}):`, 
        data.partidos.map(p => `${p.partido}: ${p.porcentaje_vigente}%`));
      
      //  Debug: Mostrar específicamente partidos con 0% cuando el backend esté actualizado
      const partidosConCero = data.partidos.filter(p => p.porcentaje_vigente === 0.0);
      if (partidosConCero.length > 0) {
        console.log(`[DEBUG]  Partidos con 0% detectados (${partidosConCero.length}):`, 
          partidosConCero.map(p => p.partido));
      } else {
        console.log(`[DEBUG] ℹ No hay partidos con 0% en esta respuesta (backend en actualización)`);
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
        console.log(`[DEBUG]  Validando partido: ${nombre} (${porcentaje}%) - Nombre: ${esNombreValido ? '✅' : '❌'}, Porcentaje: ${esPorcentajeValido ? '✅' : '❌'}`);
        
        // Debug: mostrar qué partidos se están filtrando
        if (!esNombreValido || !esPorcentajeValido) {
          console.log(`[DEBUG] Partido RECHAZADO: ${nombre} - Nombre válido: ${esNombreValido}, Porcentaje válido: ${esPorcentajeValido} (${porcentaje})`);
        } else {
          console.log(`[DEBUG]  Partido ACEPTADO: ${nombre} (${porcentaje}%)`);
        }
        
        return esNombreValido && esPorcentajeValido;
      });
      
      if (partidosValidos.length === 0) {
        throw new Error(`No se encontraron partidos válidos para ${year}/${camaraParam}`);
      }
      
      console.log(`[DEBUG]  Partidos válidos encontrados: ${partidosValidos.length}`, partidosValidos.map(p => `${p.partido}: ${p.porcentaje_vigente}%`));
      
      //  Verificar suma total de partidos válidos
      const sumaTotal = partidosValidos.reduce((sum, p) => sum + p.porcentaje_vigente, 0);
      console.log(`[DEBUG]  Suma total de partidos válidos: ${sumaTotal.toFixed(2)}%`);
      
      // Actualizar sliders con nuevos datos
      this.updatePartySliders(partidosValidos);
      
      //  Crear baseline data para el sistema integrado (sin VoteRedistribution)
      if (partidosValidos.length > 0) {
        const baselineData = {};
        
        // Usar todos los partidos válidos (ya no hay lista fija)
        partidosValidos.forEach(partido => {
          const nombreUpper = partido.partido.toUpperCase();
          baselineData[nombreUpper] = partido.porcentaje_vigente;
        });
        
        // Validar suma de porcentajes baseline
        const totalBaseline = Object.values(baselineData).reduce((sum, val) => sum + val, 0);
        console.log(`[DEBUG]  Suma baseline: ${totalBaseline.toFixed(2)}%`);
        
        if (totalBaseline < 90 || totalBaseline > 110) {
          console.error(`[ERROR]  Datos baseline inválidos - Suma: ${totalBaseline.toFixed(2)}%`);
          throw new Error(`Datos baseline inválidos: suma ${totalBaseline.toFixed(1)}% (debería ser ~100%)`);
        }
        
        console.log(`[DEBUG]  Partidos para sistema integrado:`, Object.keys(baselineData));
        console.log(`[DEBUG]  Baseline data completa:`, baselineData);
        console.log(`[DEBUG]  Sliders listos para ${validYear} con sistema integrado cargarSimulacion`);
      }
      
      // Ocultar indicador de carga
      if (typeof safeNotification === 'function') {
        safeNotification('hide', 'loading-parties');
      } else if (window.notifications) {
        window.notifications.hide('loading-parties');
      }
      
      console.log(`[DEBUG]  loadPartiesByYear completado exitosamente - ID: ${callId}`);
      
    } catch (error) {
      console.error(`[ERROR] Al cargar partidos por año (ID: ${callId}):`, error);
      
      // Ocultar indicador de carga. Mostrar notificación de error sólo si el usuario
      // está en modo personalizado (evita alertas durante cargas automáticas/iniciales).
      const modelSelectEl = document.getElementById('model-select');
      const isPersonalizado = modelSelectEl && modelSelectEl.value === 'personalizado';

      if (typeof safeNotification === 'function') {
        safeNotification('hide', 'loading-parties');
        if (isPersonalizado) {
          safeNotification('error', 'Error al cargar partidos', `No se pudieron cargar los datos para ${validYear}: ${error.message}`, 5000, 'error-loading-parties');
        } else {
          console.warn(`[WARN] loadPartiesByYear falló pero el modelo no es 'personalizado' (${modelSelectEl ? modelSelectEl.value : 'no disponible'}). Error: ${error.message}`);
        }
      } else if (window.notifications) {
        window.notifications.hide('loading-parties');
        if (isPersonalizado) {
          window.notifications.error(
            'Error al cargar partidos',
            `No se pudieron cargar los datos para ${validYear}: ${error.message}`,
            5000,
            'error-loading-parties'
          );
        } else {
          console.warn(`[WARN] loadPartiesByYear falló pero el modelo no es 'personalizado' (${modelSelectEl ? modelSelectEl.value : 'no disponible'}). Error: ${error.message}`);
        }
      } else {
        // No hay sistema de notificaciones disponible
        console.warn(`[WARN] loadPartiesByYear error (no hay notifications): ${error.message}`);
      }
    } finally {
      // Liberar lock
      this.loadingParties = false;
      console.log(`[DEBUG]  Lock liberado - ID: ${callId}`);
    }
  }

  //  Método para generar sliders dinámicos según partidos disponibles
  updatePartySliders(partidos) {
    if (!partidos || !Array.isArray(partidos)) {
      console.warn('[WARN] Datos de partidos inválidos:', partidos);
      return;
    }

    console.log(`[DEBUG]  INICIANDO updatePartySliders con ${partidos.length} partidos:`, partidos.map(p => `${p.partido}: ${p.porcentaje_vigente}%`));
    
    const container = this.querySelector('#dynamic-party-sliders');
    if (!container) {
      console.error('[ERROR] No se encontró el contenedor de sliders dinámicos');
      return;
    }
    
    // Limpiar sliders existentes
    const slidersAnteriores = container.children.length;
    container.innerHTML = '';
    console.log(`[DEBUG]  Limpiados ${slidersAnteriores} sliders anteriores`);
    
    //  RESET COMPLETO - Limpiar datos anteriores de memoria
    this.partidosData = {};
    
    console.log(`[DEBUG]  Reset completo realizado - partidosData limpiado para sistema integrado`);
    
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
      
      console.log(`[DEBUG]  Partido inicializado: ${partyLabel} = vigente:${porcentajeVigente}%, actual:${porcentajeVigente}%`);
      
      // Crear HTML del slider - ahora muestra porcentajes absolutos
      const sliderGroup = document.createElement('div');
      sliderGroup.className = 'shock-input-group';
      sliderGroup.innerHTML = `
        <div class="shock-value-box" id="shock-value-${partyName}">${porcentajeVigente.toFixed(1)}%</div>
        <label class="shock-label" for="shock-${partyName}" title="Vigente: ${porcentajeVigente.toFixed(1)}%">${partyLabel}</label>
        <input type="range" class="control-slider" id="shock-${partyName}" min="0" max="100" step="0.1" value="${porcentajeVigente}">
      `;
      
      container.appendChild(sliderGroup);
      
      console.log(`[DEBUG]  Slider creado: ${partyLabel} -> ${porcentajeVigente.toFixed(1)}% (min:0, max:100, value:${porcentajeVigente})`);
      
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
          
          //  Solo activar redistribución si el modelo es "personalizado"
          const modelSelect = document.getElementById('model-select');
          const isPersonalizado = modelSelect && modelSelect.value === 'personalizado';
          
          if (!isPersonalizado) {
            console.log(`[DEBUG] Redistribución desactivada - Modelo: ${modelSelect ? modelSelect.value : 'desconocido'}`);
            // Si no es personalizado, revertir al valor vigente
            slider.value = this.partidosData[partyNameUpper].porcentajeVigente;
            valueBox.textContent = `${this.partidosData[partyNameUpper].porcentajeVigente.toFixed(1)}%`;
            this.partidosData[partyNameUpper].porcentajeActual = this.partidosData[partyNameUpper].porcentajeVigente;
            return;
          }
          
          //  Implementar normalización automática
          this.normalizeSliders(partyNameUpper, newValue);
          
          console.log(`[DEBUG]  Slider actualizado - ${partyNameUpper}: ${newValue.toFixed(1)}%`);
          
          // Enviar datos actualizados al sistema integrado de cargarSimulacion
          const porcentajesActuales = {};
          Object.keys(this.partidosData).forEach(partido => {
            porcentajesActuales[partido] = this.partidosData[partido].porcentajeActual;
          });
          
          console.log(`[DEBUG] Iniciando cargarSimulacion con porcentajes actualizados:`, porcentajesActuales);
          
          // Usar el sistema integrado de cargarSimulacion con debounce
          if (window.actualizarDesdeControlesDebounced) {
            // Marcar esto como acción del usuario: usar la versión debounced con flag true
            window.porcentajesTemporales = porcentajesActuales;
            window.actualizarDesdeControlesDebounced(true);
            // Además, si existe el módulo VoteRedistribution, actualizar directamente sus porcentajes
            try {
              if (window.voteRedistribution && typeof window.voteRedistribution.updatePorcentajes === 'function') {
                // Generar req_id para correlación y pasar config mínima
                const reqIdLocal = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(36).slice(2,9)}`;
                // Guardar en el sidebar para debug/correlación
                if (window.controlSidebar) {
                  window.controlSidebar.lastRequestId = reqIdLocal;
                  window.controlSidebar.lastRequestParams = window.controlSidebar.lastRequestParams || {};
                  window.controlSidebar.lastRequestParams.porcentajes = porcentajesActuales;
                }
                // Asegurar que VoteRedistribution conoce el req_id
                try { window.voteRedistribution.setConfig({ req_id: reqIdLocal }); } catch (e) { /* ignore */ }
                // Actualizar porcentajes (esto disparará debouncedFetchResultados en el módulo)
                try {
                  window.voteRedistribution.porcentajes = { ...porcentajesActuales };
                  if (typeof window.voteRedistribution.debouncedFetchResultados === 'function') {
                    window.voteRedistribution.debouncedFetchResultados();
                  } else if (typeof window.voteRedistribution.updatePorcentajes === 'function') {
                    // fallback
                    window.voteRedistribution.updatePorcentajes(porcentajesActuales);
                  }
                } catch (e) {
                  console.warn('[WARN] Fallback updating VoteRedistribution porcentajes failed:', e);
                }
              }
            } catch (err) {
              console.warn('[WARN] Error actualizando VoteRedistribution desde sliders:', err);
            }
            
            // --- Immediate local seat-chart update (proportional allocation with largest remainders)
            try {
              const seatChartEl = document.querySelector('seat-chart');
              const magnitudeEl = document.getElementById('input-magnitud');
              const totalSeats = (this && this.partidosData && window.controlSidebar && window.controlSidebar.lastRequestParams && window.controlSidebar.lastRequestParams.escanos_totales)
                ? Number(window.controlSidebar.lastRequestParams.escanos_totales)
                : (magnitudeEl ? Number(magnitudeEl.value) : 128);

              // Build array of {party, pct}
              const parties = Object.keys(porcentajesActuales).map(p => ({ party: p, pct: Number(porcentajesActuales[p]) }));
              // Initial seats by floor
              let allocated = 0;
              const interim = parties.map(p => {
                const exact = (p.pct / 100) * totalSeats;
                const floored = Math.floor(exact);
                allocated += floored;
                return { party: p.party, exact, floored, remainder: exact - floored };
              });
              // Distribute remaining seats by largest remainder
              let remaining = totalSeats - allocated;
              interim.sort((a,b) => b.remainder - a.remainder);
              for (let i=0; i<interim.length && remaining>0; i++) {
                interim[i].floored += 1;
                remaining -= 1;
              }
              // Build seat chart data in expected format (array)
              const localSeatChart = interim.map(item => ({ partido: item.party, escaños: item.floored }));
              if (seatChartEl) {
                try {
                  seatChartEl.setAttribute('data', JSON.stringify(localSeatChart));
                  console.log('[DEBUG] SeatChart local actualizado inmediatamente con cambios de sliders');
                } catch (e) { console.warn('[WARN] No se pudo actualizar seatChart localmente', e); }
              }
            } catch (err) {
              console.warn('[WARN] Error en seat-chart local update:', err);
            }
          } else if (window.actualizarDesdeControlesSilent) {
            // Fallback: si no existe la versión debounced, usar silent pero marcar manualmente
            try { window.isUserTriggered = true; } catch(e){/* silent */}
            window.porcentajesTemporales = porcentajesActuales;
            window.actualizarDesdeControlesSilent();
          }
        });
        
        console.log(`[DEBUG]  Slider generado: ${partyLabel} -> base: ${porcentajeVigente.toFixed(1)}%`);
      }
    });
    
    console.log(`[DEBUG]  ${partidos.length} sliders dinámicos generados exitosamente`);
      console.log(`[DEBUG]  Estado final partidosData:`, Object.keys(this.partidosData).map(partido => 
        `${partido}: vigente=${this.partidosData[partido].porcentajeVigente}%, actual=${this.partidosData[partido].porcentajeActual}%`));
      
      //  Resumen de cambios importantes
      const partidosConPorcentajeBajo = Object.keys(this.partidosData).filter(partido => 
        this.partidosData[partido].porcentajeVigente < 1.0);
      const partidosConPorcentajeCero = Object.keys(this.partidosData).filter(partido => 
        this.partidosData[partido].porcentajeVigente === 0.0);
        
      if (partidosConPorcentajeBajo.length > 0) {
        console.log(`[DEBUG]  Partidos con < 1%: ${partidosConPorcentajeBajo.join(', ')}`);
      }
      if (partidosConPorcentajeCero.length > 0) {
        console.log(`[DEBUG] 0️ Partidos con 0%: ${partidosConPorcentajeCero.join(', ')}`);
      }
      
    // Aplicar estado actual del modelo a los sliders recién generados
    const modelSelect = document.getElementById('model-select');
    if (modelSelect) {
      const isPersonalizado = modelSelect.value === 'personalizado';
      console.log(`[DEBUG]  Aplicando estado del modelo después de regenerar sliders: ${isPersonalizado ? 'personalizado' : 'vigente'}`);
      
      //  Pequeño delay para asegurar que los sliders estén completamente en el DOM
      setTimeout(() => {
        // Determinar si la regeneración fue iniciada por una acción del usuario
        const yearSelectEl = document.getElementById('year-select');
        const userInitiatedLoad = yearSelectEl && yearSelectEl.dataset && yearSelectEl.dataset.userSelected === 'true';

        // Si la carga fue iniciada por el usuario, NO sincronizamos automáticamente
        // con los valores vigentes para evitar sobrescribir lo que el usuario ya haya ajustado.
        const shouldSyncWithVigente = !userInitiatedLoad;

        console.log(`[DEBUG] Aplicando estado del modelo después de regenerar sliders: ${isPersonalizado ? 'personalizado' : 'vigente'} (userInitiatedLoad=${userInitiatedLoad}, shouldSyncWithVigente=${shouldSyncWithVigente})`);

        this.updateSlidersState(isPersonalizado, shouldSyncWithVigente);

        // Solo forzar sincronización adicional si está permitido (no fue iniciado por el usuario)
        if (isPersonalizado && shouldSyncWithVigente) {
          console.log(`[DEBUG]  Forzando sincronización adicional en modo personalizado (no iniciada por usuario)`);
          this.forceSyncPersonalizedSliders();
        }
      }, 10);
    }

    // Attach delegated input handler to ensure slider changes are always captured
    try {
      if (!this._delegatedSliderHandlerAttached) {
        const containerEl = this.querySelector('#dynamic-party-sliders');
        if (containerEl) {
          containerEl.addEventListener('input', (e) => {
            try {
              const target = e.target;
              if (!target || !target.classList || !target.classList.contains('control-slider')) return;

              // Determine party id
              const id = target.id || '';
              if (!id.startsWith('shock-')) return;
              const partyNameLower = id.replace('shock-', '');
              const partyNameUpper = partyNameLower.toUpperCase();
              const newValue = parseFloat(target.value || 0);

              // Update internal partidosData if present
              if (this.partidosData && this.partidosData[partyNameUpper]) {
                this.partidosData[partyNameUpper].porcentajeActual = newValue;
              }

              // Ensure model is 'personalizado' when user interacts with party sliders
              const modelSel = document.getElementById('model-select');
              let isPersonalizado = modelSel && modelSel.value === 'personalizado';
              if (!isPersonalizado && modelSel) {
                try {
                  modelSel.value = 'personalizado';
                  const ev = new Event('change', { bubbles: true });
                  modelSel.dispatchEvent(ev);
                  isPersonalizado = true;
                  console.log('[DEBUG] Modo forzado a personalizado por interaccion con slider');
                } catch (err) {
                  console.warn('[WARN] No se pudo forzar model-select a personalizado:', err);
                }
              }
              if (!isPersonalizado) return;

              // Build porcentajesActuales map
              const porcentajesActuales = {};
              if (this.partidosData) {
                Object.keys(this.partidosData).forEach(p => {
                  porcentajesActuales[p] = this.partidosData[p].porcentajeActual;
                });
              }

              // Set global temporal percentages for cargarSimulacion
              try { window.porcentajesTemporales = porcentajesActuales; } catch (err) { /* ignore */ }

              // Mostrar notificación determinista para que pruebas E2E la detecten
              try {
                if (window.notifications && window.notifications.isReady) {
                  window.notifications.loading('Calculando modelo', 'Calculando resultados…', 'user-calculation');
                } else if (typeof safeNotification === 'function') {
                  safeNotification('show', { title: 'Calculando modelo', subtitle: 'Calculando resultados…', type: 'loading', id: 'user-calculation', autoHide: false });
                }
              } catch (e) {
                console.warn('[WARN] No se pudo mostrar notificación de cálculo:', e);
              }

              // Nota: evitar disparar aquí la función global `actualizarDesdeControlesDebounced`
              // porque el mismo slider ya actualiza directamente `voteRedistribution` más abajo
              // y provocar dos requests paralelos (uno del módulo y otro global) causa que
              // el segundo en llegar sobrescriba la UI. Por tanto NO llamar a
              // actualizarDesdeControlesDebounced desde este handler delegado.

              // No crear notificaciones adicionales aquí; dejar que VoteRedistribution
              // maneje la notificación de 'Procesando' / 'Listo' de forma centralizada.

              try {
                const reqIdLocal = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(36).slice(2,9)}`;
                if (window.voteRedistribution) {
                  window.voteRedistribution.porcentajes = { ...porcentajesActuales };
                  if (typeof window.voteRedistribution.debouncedFetchResultados === 'function') window.voteRedistribution.debouncedFetchResultados();
                  else if (typeof window.voteRedistribution.updatePorcentajes === 'function') window.voteRedistribution.updatePorcentajes(porcentajesActuales);
                }
              } catch (err) {
                console.warn('[WARN] Delegated slider handler: failed to update VoteRedistribution', err);
              }

              // Immediate local seat chart update (same logic as above)
              try {
                const seatChartEl = document.querySelector('seat-chart');
                const magnitudeEl = document.getElementById('input-magnitud');
                const totalSeats = (window.controlSidebar && window.controlSidebar.lastRequestParams && window.controlSidebar.lastRequestParams.escanos_totales)
                  ? Number(window.controlSidebar.lastRequestParams.escanos_totales)
                  : (magnitudeEl ? Number(magnitudeEl.value) : 128);
                const parties = Object.keys(porcentajesActuales).map(p => ({ party: p, pct: Number(porcentajesActuales[p]) }));
                let allocated = 0;
                const interim = parties.map(p => {
                  const exact = (p.pct / 100) * totalSeats;
                  const floored = Math.floor(exact);
                  allocated += floored;
                  return { party: p.party, exact, floored, remainder: exact - floored };
                });
                let remaining = totalSeats - allocated;
                interim.sort((a,b) => b.remainder - a.remainder);
                for (let i=0; i<interim.length && remaining>0; i++) { interim[i].floored += 1; remaining -= 1; }
                const localSeatChart = interim.map(item => ({ partido: item.party, escaños: item.floored }));
                if (seatChartEl) seatChartEl.setAttribute('data', JSON.stringify(localSeatChart));

                // Informar inmediatamente al módulo VoteRedistribution con un resultado local
                try {
                  if (window.voteRedistribution) {
                    const fallbackResult = { seat_chart: localSeatChart, meta: { fallback_local: true, timestamp: Date.now() } };
                    window.voteRedistribution.result = fallbackResult;
                    // También actualizar su state interno para que getState() refleje lo mostrado
                    window.debugLastResponse = fallbackResult;
                    if (typeof window.voteRedistribution.notifyUpdate === 'function') {
                      window.voteRedistribution.notifyUpdate();
                    } else if (typeof window.voteRedistribution.updateSeatChart === 'function') {
                      window.voteRedistribution.updateSeatChart(localSeatChart);
                      if (window.voteRedistribution.callbacks && typeof window.voteRedistribution.callbacks.onUpdate === 'function') {
                        try { window.voteRedistribution.callbacks.onUpdate(fallbackResult); } catch(e){/* ignore */}
                      }
                    }
                  }
                } catch (e) {
                  console.warn('[WARN] No se pudo notificar a voteRedistribution del resultado local:', e);
                }
              } catch (err) { /* ignore */ }

            } catch (err) {
              console.warn('[WARN] Error in delegated slider input handler:', err);
            }
          });
          this._delegatedSliderHandlerAttached = true;
        }
      }
    } catch (err) {
      console.warn('[WARN] Could not attach delegated slider handler:', err);
    }
  }

  // Método para normalizar sliders automáticamente a 100%
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
    console.log(`[DEBUG]  Normalización completada - Suma total: ${totalSum.toFixed(2)}%`);
  }

  //  Método para actualizar estado de sliders según modelo
  updateSlidersState(enabled, syncWithVigente = true) {
    const container = this.querySelector('#dynamic-party-sliders');
    if (!container) return;
    
    const sliders = container.querySelectorAll('.control-slider');
    const valueBoxes = container.querySelectorAll('.shock-value-box');
    
    if (enabled) {
      // Modelo personalizado - habilitar sliders. Opcionalmente sincronizar con valores vigentes del año actual
      console.log(`[DEBUG]  Habilitando modo personalizado - sincronizando valores vigentes (syncWithVigente=${syncWithVigente})`);

      sliders.forEach(slider => {
        slider.disabled = false;

        //  IMPORTANTE: Sincronizar con valor vigente del año actual solo si se solicita
        const partyName = slider.id.replace('shock-', '').toUpperCase();
        if (syncWithVigente && this.partidosData && this.partidosData[partyName]) {
          const porcentajeVigente = this.partidosData[partyName].porcentajeVigente;
          slider.value = porcentajeVigente;
          this.partidosData[partyName].porcentajeActual = porcentajeVigente;
          console.log(`[DEBUG]  Slider ${partyName} sincronizado: ${porcentajeVigente}%`);
        }
      });

      valueBoxes.forEach(valueBox => {
        valueBox.style.opacity = '1';

        //  IMPORTANTE: Sincronizar display con valor vigente del año actual solo si se solicita
        const partyName = valueBox.id.replace('shock-value-', '').toUpperCase();
        if (syncWithVigente && this.partidosData && this.partidosData[partyName]) {
          const porcentajeVigente = this.partidosData[partyName].porcentajeVigente;
          valueBox.textContent = `${porcentajeVigente.toFixed(1)}%`;
        }
      });

      //  Sincronizar también con VoteRedistribution solo si se pidió sincronizar
      if (syncWithVigente && window.voteRedistribution && this.partidosData) {
        const porcentajesActuales = {};
        Object.keys(this.partidosData).forEach(partido => {
          porcentajesActuales[partido] = this.partidosData[partido].porcentajeVigente; // Usar vigente como baseline
        });

        console.log(`[DEBUG]  Sincronizando VoteRedistribution con valores vigentes:`, porcentajesActuales);
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
    
    console.log(`[DEBUG]  Sliders ${enabled ? 'habilitados' : 'deshabilitados'} - Total: ${sliders.length}`);
  }

  //  Método para forzar sincronización en modo personalizado
  forceSyncPersonalizedSliders() {
    if (!this.partidosData) {
      console.warn(`[WARN]  forceSyncPersonalizedSliders: No hay partidosData disponible`);
      return;
    }
    
    console.log(`[DEBUG]  Iniciando sincronización forzada de sliders personalizados`);
    
    const container = this.querySelector('#dynamic-party-sliders');
    if (!container) {
      console.error(`[ERROR]  No se encontró contenedor de sliders dinámicos`);
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
        
        console.log(`[DEBUG]  Slider sincronizado: ${partyNameUpper} = ${vigente}%`);
      } else {
        console.warn(`[WARN]  No se encontró slider para ${partyNameUpper}`);
      }
    });
    
    // Sincronizar con cargarSimulacion en lugar de VoteRedistribution
    const porcentajesVigentes = {};
    Object.keys(this.partidosData).forEach(partido => {
      porcentajesVigentes[partido] = this.partidosData[partido].porcentajeVigente;
    });
    
    console.log(`[DEBUG]  Iniciando cargarSimulacion con porcentajes vigentes:`, porcentajesVigentes);
    
    // Usar cargarSimulacion integrado en lugar de VoteRedistribution separado
    if (window.actualizarDesdeControlesDebounced) {
      // Forzar actualización marcada como acción del usuario
      window.actualizarDesdeControlesDebounced(true);
    } else if (window.actualizarDesdeControles) {
      try { window.isUserTriggered = true; } catch(e){/* silent */}
      window.actualizarDesdeControlesSilent();
    }
    
    console.log(`[DEBUG]  Sincronización forzada completada`);
  }

  // Método para actualizar años disponibles según la cámara
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
    
    console.log(`[DEBUG]  Años actualizados para ${chamber}:`, availableValues, `Seleccionado: ${yearSelect.value}`);
  }

  //  Método para controlar visibilidad de sobrerrepresentación según sistema electoral
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