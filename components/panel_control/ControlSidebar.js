// Simple test version of ControlSidebar
export class ControlSidebar extends HTMLElement {
  connectedCallback() {
    console.log('ControlSidebar connected!');
    
    //  Exposer referencia global para que VoteRedistribution pueda acceder
    window.controlSidebar = this;
    // Inicializar cámara por defecto
    this.selectedChamber = 'diputados';

    // Renderizar y preparar controles
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
                    <option value="plan_a">Plan A</option>
                    <option value="plan_c">Plan C</option>
                    <option value="300_100_con_topes">300-100 con Topes</option>
                    <option value="300_100_sin_topes">300-100 sin Topes</option>
                    <option value="200_200_sin_topes">200-200 Balanceado</option>
                    <option value="personalizado">Personalizado</option>
                  </select>
                  <small class="control-hint" id="model-hint"></small>
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
                </div>
              </div>
            </div>

            <!-- 3. Tipo de Regla Electoral -->
            <div class="control-group" data-group="rules">
              <button class="group-toggle" data-target="rules">
                <span class="group-title">Regla Electoral</span>
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
                <!-- Toggle para editar distribución de votos -->
                <div class="control-description">
                  ¿Editar distribución de votos manualmente?
                </div>
                <div class="control-item">
                  <div class="toggle-switch">
                    <div class="switch" id="custom-votes-switch" data-switch="Off" role="switch" aria-checked="false">
                      <div class="switch-handle"></div>
                    </div>
                  </div>
                </div>
                
                <div class="control-item" style="margin-top:16px;">
                  <div class="party-shock-inputs" id="dynamic-party-sliders">
                    <!-- Los sliders se generarán dinámicamente aquí -->
                  </div>
                  <!-- Mensajes informativos ocultados -->
                  <!-- <div class="parameter-note" id="default-shocks-note">Simula cambios en el porcentaje de votos por partido</div>
                  <div class="parameter-note" id="custom-votes-note" style="display:none; color:#F59E0B; font-weight:500;">
                    ⚠️ Modo edición activado: Los porcentajes deben sumar 100%
                  </div> -->
                </div>
              </div>
            </div>
            
            <!-- 🆕 Ajuste de MR por Partido -->
            <div class="control-group" data-group="mr-districts">
              <button class="group-toggle" data-target="mr-districts">
                <span class="group-title">Ajuste de MR por Partido</span>
                <svg class="chevron" width="12" height="12" viewBox="0 0 12 12">
                  <path d="M4 2l4 4-4 4" stroke="currentColor" stroke-width="1.5" fill="none"/>
                </svg>
              </button>
              <div class="group-content" id="group-mr-districts">
                <!-- Toggle para editar distribución manual -->
                <div class="control-description">
                  ¿Editar distribución MR manualmente?
                </div>
                <div class="control-item">
                  <div class="toggle-switch">
                    <div class="switch" id="mr-distribution-switch" data-switch="Off" role="switch" aria-checked="false">
                      <div class="switch-handle"></div>
                    </div>
                  </div>
                </div>
                
                <div class="control-item" style="margin-top:16px;">
                  <div class="party-shock-inputs" id="dynamic-mr-district-sliders">
                    <!-- Los sliders de distritos se generarán dinámicamente aquí -->
                  </div>
                  <!-- Mensajes informativos ocultados -->
                  <!-- <div class="parameter-note" id="default-mr-note">Asigna manualmente los distritos MR ganados por partido</div>
                  <div class="parameter-note" id="custom-mr-note" style="display:none; color:#F59E0B; font-weight:500;">
                    ⚠️ Modo edición activado: Total asignado <span id="mr-assigned-display" style="font-weight:700;">0</span> de <span id="mr-total-display" style="font-weight:700;">300</span> distritos MR
                  </div> -->
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
            
            <!-- 🆕 11. Mayorías (Calculadora de Mayoría Forzada) -->
            <div class="control-group" data-group="mayorias">
              <button class="group-toggle" data-target="mayorias">
                <span class="group-title">Mayorías</span>
                <svg class="chevron" width="12" height="12" viewBox="0 0 12 12">
                  <path d="M4 2l4 4-4 4" stroke="currentColor" stroke-width="1.5" fill="none"/>
                </svg>
              </button>
              <div class="group-content" id="group-mayorias">
                
                <!-- Toggle ON/OFF -->
                <div class="control-item">
                  <label class="control-label">¿Activar cálculo de mayorías?</label>
                  <div class="toggle-switch">
                    <div class="switch" id="mayorias-switch" data-switch="Off" role="switch" aria-checked="false">
                      <div class="switch-handle"></div>
                    </div>
                  </div>
                </div>
                
                <!-- Controles (solo visibles cuando está ON) -->
                <div id="mayorias-controls" style="display:none;">
                  <!-- Tipo de mayoría -->
                  <div class="control-item">
                    <label class="control-label">Tipo de mayoría:</label>
                    <div class="radio-group">
                      <div class="radio-item">
                        <input class="radio" type="radio" id="mayoria-simple" name="tipo-mayoria" value="simple" checked>
                        <label class="radio-label" for="mayoria-simple">
                          Mayoría Simple
                          <div class="radio-sublabel">>50% de escaños</div>
                        </label>
                      </div>
                      <div class="radio-item">
                        <input class="radio" type="radio" id="mayoria-calificada" name="tipo-mayoria" value="calificada">
                        <label class="radio-label" for="mayoria-calificada">
                          Mayoría Calificada
                          <div class="radio-sublabel">≥2/3 de escaños (66.67%)</div>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Selección de partido/coalición -->
                  <div class="control-item">
                    <label class="control-label">Partido o coalición:</label>
                    <select class="control-select" id="mayoria-partido-select">
                      <option value="" disabled selected>Selecciona un partido...</option>
                      <option value="MORENA">MORENA</option>
                      <option value="PAN">PAN</option>
                      <option value="PRI">PRI</option>
                      <option value="PRD">PRD</option>
                      <option value="PT">PT</option>
                      <option value="PVEM">PVEM</option>
                      <option value="MC">MC</option>
                      <option value="coalicion" disabled>──────────</option>
                      <option value="MORENA+PT+PVEM">MORENA + PT + PVEM</option>
                      <option value="PAN+PRI+PRD">PAN + PRI + PRD</option>
                    </select>
                  </div>
                  
                  <!-- Resultado del cálculo (oculto inicialmente) -->
                  <div class="control-item" id="mayoria-resultado" style="display:none;">
                    <div class="mayoria-resultado-card">
                      <div class="mayoria-resultado-header">
                        <span class="mayoria-badge">🟢 Mayoría Alcanzable</span>
                      </div>
                      <div class="mayoria-resultado-body">
                        <div class="mayoria-stat">
                          <span class="stat-label">Escaños necesarios:</span>
                          <span class="stat-value" id="escanos-necesarios">—</span>
                        </div>
                        <div class="mayoria-stat">
                          <span class="stat-label">Votos requeridos:</span>
                          <span class="stat-value" id="votos-requeridos">—</span>
                        </div>
                        <div class="mayoria-stat">
                          <span class="stat-label">Estados/Distritos a ganar:</span>
                          <span class="stat-value" id="territorios-ganar">—</span>
                        </div>
                      </div>
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
        
        // 🆕 Guardar cámara seleccionada en el sidebar
        this.selectedChamber = selectedChamber;
        console.log('[DEBUG] 📌 Cámara seleccionada guardada:', this.selectedChamber);
        
        // 🆕 Actualizar hint del escenario cuando cambia la cámara
        const modelSelectEl = this.querySelector('#model-select');
        if (modelSelectEl && typeof updateModelHint === 'function') {
          updateModelHint(modelSelectEl.value);
        }
        
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
        
        //  ACTUALIZAR LÍMITES DE PM AL CAMBIAR CÁMARA
        // Necesitamos esperar a que updateFirstMinorityLimits esté definida
        setTimeout(() => {
          if (typeof updateFirstMinorityLimits === 'function') {
            updateFirstMinorityLimits();
            console.log(`[PM LIMITS] Límites actualizados tras cambio de cámara a ${selectedChamber}`);
          }
        }, 100);
        
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

    // 🆕 Función para actualizar el hint del escenario (definida fuera para ser reutilizable)
    const updateModelHint = (escenarioId) => {
      const hintEl = this.querySelector('#model-hint');
      if (!hintEl) return;
      
      const chamberBtn = this.querySelector('.master-toggle.active');
      const camara = chamberBtn ? chamberBtn.dataset.chamber : 'diputados';
      
      // Mapeo de descripciones según cámara
      const HINTS_DIPUTADOS = {
        'vigente': '300 MR + 200 RP = 500 escaños (con tope de 300)',
        'plan_a': '300 RP puro (sin mayorías relativas)',
        'plan_c': '300 MR puro (sin proporcionales)',
        '300_100_con_topes': '300 MR + 100 RP = 400 (tope 300 escaños)',
        '300_100_sin_topes': '300 MR + 100 RP = 400 (sin tope)',
        '200_200_sin_topes': '200 MR + 200 RP = 400 (balanceado 50-50)',
        'personalizado': 'Configura tus propios parámetros'
      };
      
      const HINTS_SENADO = {
        'vigente': '64 MR + 32 PM + 32 RP = 128 senadores',
        'plan_a': '96 RP puro (lista nacional)',
        'plan_c': '32 MR + 32 PM = 64 (sin RP)',
        'personalizado': 'Configura tus propios parámetros'
      };
      
      const hints = camara === 'senadores' ? HINTS_SENADO : HINTS_DIPUTADOS;
      const hint = hints[escenarioId] || '';
      
      hintEl.textContent = hint;
      hintEl.style.display = hint ? 'block' : 'none';
    };

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
        const scenario = modelSelect.value;
        const isPersonalizado = scenario === 'personalizado';
        
        // 🆕 HABILITAR sliders para TODOS los escenarios (no solo "personalizado")
        // El usuario puede modificar cualquier escenario predefinido
        const enableSliders = true; // Siempre habilitado para permitir ajustes
        
        // Si el cambio proviene del usuario (isTrusted), NO sincronizamos automáticamente
        // con valores vigentes para evitar sobreescribir lo que el usuario ya tenía.
        const syncWithVigente = !(event && event.isTrusted);
        this.updateSlidersState(enableSliders, syncWithVigente);
        console.log(`[DEBUG]  Escenario cambiado a: ${scenario} - Sliders habilitados para permitir ajustes (syncWithVigente=${syncWithVigente})`);

        // 🆕 Actualizar hint del escenario
        updateModelHint(scenario);

        // 🆕 PRE-LLENAR VALORES según escenario seleccionado
        const chamberBtn = this.querySelector('.master-toggle.active');
        const camara = chamberBtn ? chamberBtn.dataset.chamber : 'diputados';
        const mrSlider = this.querySelector('#input-mr');
        const rpSlider = this.querySelector('#input-rp');
        const mrValue = this.querySelector('#input-mr-value');
        const rpValue = this.querySelector('#input-rp-value');
        const magnitudeSlider = this.querySelector('#input-magnitud');
        const magnitudeValue = this.querySelector('#input-magnitud-value');
        const overrepSwitch = this.querySelector('#overrep-switch');
        const overrepSlider = this.querySelector('#overrep-slider');
        const overrepValue = this.querySelector('#overrep-value-box');
        
        // Radio buttons de sistema electoral
        const radioMixto = this.querySelector('#radio-mixto');
        const radioMR = this.querySelector('#radio-mr');
        const radioRP = this.querySelector('#radio-rp');
        
        // Configurar valores predefinidos por escenario (solo para Diputados)
        if (camara === 'diputados' && event && event.isTrusted) {
          const escenarios = {
            'vigente': { 
              mr: 300, rp: 200, total: 500, 
              sistema: 'mixto',
              sobrerrepActiva: true, sobrerrepValor: 8.0,
              umbralActivo: true, umbralTipo: 'national', umbralValor: 3.0,
              repartoMode: 'cuota', repartoMethod: 'hare',
              topeEscanosActivo: false, topeEscanosValor: 300
            },
            'plan_a': { 
              mr: 0, rp: 300, total: 300,
              sistema: 'rp',
              sobrerrepActiva: false, sobrerrepValor: 0,
              umbralActivo: true, umbralTipo: 'national', umbralValor: 3.0,
              repartoMode: 'cuota', repartoMethod: 'hare',
              topeEscanosActivo: false, topeEscanosValor: 300
            },
            'plan_c': { 
              mr: 300, rp: 0, total: 300,
              sistema: 'mr',
              sobrerrepActiva: false, sobrerrepValor: 0,
              umbralActivo: false, umbralTipo: 'national', umbralValor: 3.0,
              repartoMode: 'cuota', repartoMethod: 'hare',
              topeEscanosActivo: false, topeEscanosValor: 300
            },
            '300_100_con_topes': { 
              mr: 300, rp: 100, total: 400,
              sistema: 'mixto',
              sobrerrepActiva: true, sobrerrepValor: 8.0,
              umbralActivo: true, umbralTipo: 'national', umbralValor: 3.0,
              repartoMode: 'cuota', repartoMethod: 'hare',
              topeEscanosActivo: true, topeEscanosValor: 300
            },
            '300_100_sin_topes': { 
              mr: 300, rp: 100, total: 400,
              sistema: 'mixto',
              sobrerrepActiva: false, sobrerrepValor: 0,
              umbralActivo: true, umbralTipo: 'national', umbralValor: 3.0,
              repartoMode: 'cuota', repartoMethod: 'hare',
              topeEscanosActivo: false, topeEscanosValor: 300
            },
            '200_200_sin_topes': { 
              mr: 200, rp: 200, total: 400,
              sistema: 'mixto',
              sobrerrepActiva: false, sobrerrepValor: 0,
              umbralActivo: true, umbralTipo: 'national', umbralValor: 3.0,
              repartoMode: 'cuota', repartoMethod: 'hare',
              topeEscanosActivo: false, topeEscanosValor: 300
            }
          };
          
          if (escenarios[scenario]) {
            const config = escenarios[scenario];
            console.log(`[SCENARIO] 🎯 Aplicando configuración completa de "${scenario}":`, config);
            
            // 1. ✅ Sistema electoral (radio buttons)
            if (config.sistema === 'mixto' && radioMixto) radioMixto.checked = true;
            else if (config.sistema === 'mr' && radioMR) radioMR.checked = true;
            else if (config.sistema === 'rp' && radioRP) radioRP.checked = true;
            
            // 2. ✅ Mostrar/ocultar controles según sistema
            const mixtoInputs = this.querySelector('#mixto-inputs');
            if (mixtoInputs) {
              mixtoInputs.style.display = config.sistema === 'mixto' ? 'block' : 'none';
            }
            
            // 3. ✅ Valores de MR/RP
            if (mrSlider && mrValue) {
              mrSlider.value = config.mr;
              mrValue.textContent = config.mr;
            }
            if (rpSlider && rpValue) {
              rpSlider.value = config.rp;
              rpValue.textContent = config.rp;
            }
            
            // 4. ✅ Magnitud total
            if (magnitudeSlider && magnitudeValue) {
              magnitudeSlider.value = config.total;
              magnitudeValue.textContent = config.total;
            }
            
            // 5. ✅ Sobrerrepresentación (switch + slider)
            if (overrepSwitch) {
              if (config.sobrerrepActiva) {
                overrepSwitch.classList.add('active');
                overrepSwitch.setAttribute('data-switch', 'On');
                overrepSwitch.setAttribute('aria-checked', 'true');
              } else {
                overrepSwitch.classList.remove('active');
                overrepSwitch.setAttribute('data-switch', 'Off');
                overrepSwitch.setAttribute('aria-checked', 'false');
              }
            }
            if (overrepSlider && overrepValue) {
              overrepSlider.value = config.sobrerrepValor;
              overrepValue.textContent = `${config.sobrerrepValor.toFixed(1)}%`;
            }
            
            // 6. 🆕 UMBRAL (switch + tipo + valor)
            const thresholdSwitch = this.querySelector('#threshold-switch');
            const thresholdRadioGroup = this.querySelector('#threshold-radio-group');
            const thresholdControlsGroup = this.querySelector('#threshold-controls-group');
            const thresholdSlider = this.querySelector('#threshold-slider');
            const thresholdValueBox = this.querySelector('#threshold-value-box');
            const radioNational = this.querySelector('#radio-national');
            const radioState = this.querySelector('#radio-state');
            
            if (thresholdSwitch) {
              if (config.umbralActivo) {
                thresholdSwitch.classList.add('active');
                thresholdSwitch.setAttribute('data-switch', 'On');
                thresholdSwitch.setAttribute('aria-checked', 'true');
                if (thresholdRadioGroup) thresholdRadioGroup.style.display = 'block';
                if (thresholdControlsGroup) thresholdControlsGroup.style.display = 'block';
              } else {
                thresholdSwitch.classList.remove('active');
                thresholdSwitch.setAttribute('data-switch', 'Off');
                thresholdSwitch.setAttribute('aria-checked', 'false');
                if (thresholdRadioGroup) thresholdRadioGroup.style.display = 'none';
                if (thresholdControlsGroup) thresholdControlsGroup.style.display = 'none';
              }
            }
            
            if (config.umbralActivo) {
              if (config.umbralTipo === 'national' && radioNational) radioNational.checked = true;
              else if (config.umbralTipo === 'state' && radioState) radioState.checked = true;
              
              if (thresholdSlider && thresholdValueBox) {
                thresholdSlider.value = config.umbralValor;
                thresholdValueBox.textContent = `${config.umbralValor.toFixed(1)}%`;
              }
            }
            
            // 7. 🆕 MÉTODO DE REPARTO (radio mode + select method)
            const repartoCuotaRadio = this.querySelector('#reparto-cuota');
            const repartoDivisorRadio = this.querySelector('#reparto-divisor');
            const repartoMethodSelect = this.querySelector('#reparto-method');
            
            if (config.repartoMode === 'cuota' && repartoCuotaRadio) {
              repartoCuotaRadio.checked = true;
              // Actualizar opciones del select para métodos de cuota
              if (repartoMethodSelect) {
                repartoMethodSelect.innerHTML = `
                  <option value="hare" ${config.repartoMethod === 'hare' ? 'selected' : ''}>Hare</option>
                  <option value="droop" ${config.repartoMethod === 'droop' ? 'selected' : ''}>Droop</option>
                  <option value="imperiali" ${config.repartoMethod === 'imperiali' ? 'selected' : ''}>Imperiali</option>
                `;
              }
            } else if (config.repartoMode === 'divisor' && repartoDivisorRadio) {
              repartoDivisorRadio.checked = true;
              // Actualizar opciones del select para métodos de divisor
              if (repartoMethodSelect) {
                repartoMethodSelect.innerHTML = `
                  <option value="dhondt" ${config.repartoMethod === 'dhondt' ? 'selected' : ''}>D'Hondt</option>
                  <option value="saint-lague" ${config.repartoMethod === 'saint-lague' ? 'selected' : ''}>Sainte-Laguë</option>
                  <option value="modified-saint-lague" ${config.repartoMethod === 'modified-saint-lague' ? 'selected' : ''}>Sainte-Laguë Modificado</option>
                `;
              }
            }
            
            // 8. 🆕 TOPE DE ESCAÑOS POR PARTIDO (switch + valor)
            const seatCapSwitch = this.querySelector('#seat-cap-switch');
            const seatCapInputGroup = this.querySelector('#seat-cap-input-group');
            const seatCapInput = this.querySelector('#seat-cap-input');
            const seatCapInputValue = this.querySelector('#seat-cap-input-value');
            
            if (seatCapSwitch) {
              if (config.topeEscanosActivo) {
                seatCapSwitch.classList.add('active');
                seatCapSwitch.setAttribute('data-switch', 'On');
                seatCapSwitch.setAttribute('aria-checked', 'true');
                if (seatCapInputGroup) seatCapInputGroup.style.display = 'block';
              } else {
                seatCapSwitch.classList.remove('active');
                seatCapSwitch.setAttribute('data-switch', 'Off');
                seatCapSwitch.setAttribute('aria-checked', 'false');
                if (seatCapInputGroup) seatCapInputGroup.style.display = 'none';
              }
            }
            
            if (config.topeEscanosActivo && seatCapInput && seatCapInputValue) {
              seatCapInput.value = config.topeEscanosValor;
              seatCapInputValue.textContent = config.topeEscanosValor;
            }
            
            console.log(`[SCENARIO] ✅ Configuración COMPLETA aplicada:
              - Sistema: ${config.sistema}, MR:${config.mr}, RP:${config.rp}, Total:${config.total}
              - Sobrerrepresentación: ${config.sobrerrepActiva ? config.sobrerrepValor + '%' : 'OFF'}
              - Umbral: ${config.umbralActivo ? config.umbralTipo + ' ' + config.umbralValor + '%' : 'OFF'}
              - Reparto: ${config.repartoMode} / ${config.repartoMethod}
              - Tope escaños: ${config.topeEscanosActivo ? config.topeEscanosValor : 'OFF'}`);
          }
        }

        // Ajustar topes de sliders según modelo y cámara
        // Ajustar topes de sliders según modelo y cámara
        let maxMr = 700;
        let maxMagnitud = 700;
        if (scenario === 'personalizado' || scenario === 'mixto') {
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
      
      // 🆕 Mostrar hint inicial
      updateModelHint(modelSelect.value);
      
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
        
        // 🆕 AUTO-AJUSTAR MR Y RP al 50/50 cuando cambie magnitud
        const magnitudTotal = parseInt(this.value);
        const mitad = Math.floor(magnitudTotal / 2);
        const otra_mitad = magnitudTotal - mitad; // Para manejar números impares
        
        const mrSlider = document.querySelector('#input-mr');
        const mrValue = document.querySelector('#input-mr-value');
        const rpSlider = document.querySelector('#input-rp');
        const rpValue = document.querySelector('#input-rp-value');
        
        if (mrSlider && rpSlider && mrValue && rpValue) {
          mrSlider.value = mitad;
          mrValue.textContent = mitad;
          rpSlider.value = otra_mitad;
          rpValue.textContent = otra_mitad;
          
          console.log(`[MAGNITUD] 🔄 Auto-ajuste 50/50: MR=${mitad}, RP=${otra_mitad} (Total=${magnitudTotal})`);
        }
        
        // 🆕 ACTUALIZAR MENSAJE DE VALIDACIÓN INMEDIATAMENTE
        if (typeof updateValidation === 'function') {
          updateValidation();
          console.log(`[MAGNITUD] ✅ Validación actualizada: ${mitad} + ${otra_mitad} = ${magnitudTotal}`);
        }
        
        // Actualizar límites (sin reescribir valores ya que los acabamos de setear)
        if (typeof updateSliderLimits === 'function') {
          updateSliderLimits(false);
        }
        
        //  ACTUALIZAR LÍMITES DE PM AL CAMBIAR MAGNITUD
        setTimeout(() => {
          if (typeof updateFirstMinorityLimits === 'function') {
            updateFirstMinorityLimits();
            console.log(`[PM LIMITS] Límites actualizados tras cambio de magnitud: ${this.value}`);
          }
        }, 100);
        
        // Actualizar configuración del sistema de redistribución
        if (window.voteRedistribution) {
          console.log('[TRACE] ControlSidebar -> setConfig (magnitude input):', {
            escanos_from_slider: parseInt(this.value),
            mr_from_slider: mitad,
            rp_from_slider: otra_mitad
          });
          const reqId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(36).slice(2,9)}`;
          if (window.controlSidebar) {
            window.controlSidebar.lastRequestId = reqId;
            window.controlSidebar.lastRequestParams = {
              escanos_totales: parseInt(this.value),
              mr_seats: mitad,
              rp_seats: otra_mitad
            };
          }
          window.voteRedistribution.setConfig({
            req_id: reqId,
            escanos_totales: parseInt(this.value),
            mr_seats: mitad,
            rp_seats: otra_mitad
          });
        }
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
    
    console.log('[DEBUG] 🔍 Sliders encontrados:', {
      mrSlider: !!mrSlider,
      mrValue: !!mrValue,
      rpSlider: !!rpSlider,
      rpValue: !!rpValue,
      validationDiv: !!validationDiv
    });
    
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
      
      // 🆕 ACTUALIZAR TOTAL DE DISTRITOS MR EN LA NOTA DE DISTRIBUCIÓN
      const mrTotalDisplay = document.getElementById('mr-total-display');
      if (mrTotalDisplay) {
        mrTotalDisplay.textContent = mrLimitado;
      }
      
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
      console.log(`[MAGNITUD DEBUG] updateSliderLimits llamado - Magnitud: ${magnitudTotal}, allowAdjust: ${allowAdjust}`);
      
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
          console.log(`[MAGNITUD DEBUG] Auto-ajustando MR/RP - Magnitud: ${magnitudTotal}, MR: ${mrActual}→${nuevoMr}, RP: ${rpActual}→${magnitudTotal - nuevoMr}`);
          handleMrChange(nuevoMr);
        } else {
          // No ajustar valores automáticamente, solo actualizar la validación visual
          updateValidation();
          console.log(`[MAGNITUD DEBUG] No auto-ajustando - Magnitud: ${magnitudTotal}, MR: ${mrActual}, RP: ${rpActual} (allowAdjust=false)`);
        }
      } else {
        console.log(`[MAGNITUD DEBUG] MR+RP ya suma magnitud total (${magnitudTotal}) - sin cambios`);
      }
      
      //  VALIDAR PRIMERA MINORÍA TRAS CAMBIOS DE MAGNITUD
      updateFirstMinorityLimits();
    };
    
    //  Función para obtener límites de PM desde el backend
    const fetchPMLimitsFromBackend = async () => {
      try {
        const mrActual = parseInt(mrSlider ? mrSlider.value : 64);
        const rpActual = parseInt(rpSlider ? rpSlider.value : 64);
        const magnitudTotal = getMagnitudTotal();
        
        // Determinar sistema según RADIO BUTTON seleccionado (más confiable)
        const selectedElectoralRule = document.querySelector('input[name="electoral-rule"]:checked');
        let sistema = selectedElectoralRule ? selectedElectoralRule.value : 'mixto';
        
        // Si no hay radio button, inferir desde distribución MR/RP
        if (!selectedElectoralRule) {
          if (mrActual === magnitudTotal) {
            sistema = 'mr';
          } else if (mrActual === 0 || rpActual === magnitudTotal) {
            sistema = 'rp';
          } else {
            sistema = 'mixto';
          }
        }
        
        // 🆕 OBTENER CÁMARA ACTUAL
        const chamberSelect = document.getElementById('chamber-select');
        const camara = chamberSelect ? chamberSelect.value : 'diputados';
        
        const url = `https://back-electoral.onrender.com/calcular-limites-pm?sistema=${sistema}&escanos_totales=${magnitudTotal}&mr_seats=${mrActual}&camara=${camara}`;
        console.log(`[PM LIMITS] Consultando backend: ${url} (sistema: ${sistema}, cámara: ${camara})`);
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Backend error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`[PM LIMITS] Respuesta backend:`, data);
        
        return {
          max_pm: data.max_pm || 0,
          valido: data.valido !== false,
          descripcion: data.descripcion || '',
          sistema: sistema
        };
      } catch (error) {
        console.error(`[PM LIMITS] Error consultando backend:`, error);
        // Fallback: cálculo local si backend falla
        const mrActual = parseInt(mrSlider ? mrSlider.value : 64);
        const magnitudTotal = getMagnitudTotal();
        
        // Determinar sistema para fallback
        const selectedElectoralRule = document.querySelector('input[name="electoral-rule"]:checked');
        let sistema = selectedElectoralRule ? selectedElectoralRule.value : 'mixto';
        
        // Calcular max_pm según sistema
        let max_pm_fallback = 0;
        if (sistema === 'mr') {
          max_pm_fallback = magnitudTotal; // En MR puro, PM puede ser hasta el total
        } else if (sistema === 'mixto') {
          max_pm_fallback = mrActual; // En mixto, PM limitado por MR
        } else {
          max_pm_fallback = 0; // En RP, PM no válido
        }
        
        return {
          max_pm: max_pm_fallback,
          valido: sistema !== 'rp',
          descripcion: 'Calculado localmente (backend no disponible)',
          sistema: sistema
        };
      }
    };
    
    //  Función para validar límites de Primera Minoría con backend
    const updateFirstMinorityLimits = async () => {
      const firstMinoritySlider = document.getElementById('input-first-minority');
      const firstMinorityValue = document.getElementById('input-first-minority-value');
      const firstMinorityWarning = document.getElementById('first-minority-warning');
      
      if (firstMinoritySlider && firstMinorityValue) {
        const mrActual = parseInt(mrSlider ? mrSlider.value : 64);
        const magnitudTotal = getMagnitudTotal();
        
        // Obtener límites desde el backend
        const limits = await fetchPMLimitsFromBackend();
        const maxFirstMinority = limits.max_pm;
        
        // Actualizar max del slider
        firstMinoritySlider.max = maxFirstMinority;
        
        // Deshabilitar slider si PM no es válido para este sistema
        if (!limits.valido || maxFirstMinority === 0) {
          firstMinoritySlider.disabled = true;
          firstMinoritySlider.value = 0;
          firstMinorityValue.textContent = '0';
          if (firstMinorityWarning) {
            firstMinorityWarning.innerHTML = `PM no disponible en sistema ${limits.sistema.toUpperCase()}`;
            firstMinorityWarning.style.display = 'block';
            firstMinorityWarning.style.color = '#EF4444';
          }
          console.log(`[PM LIMITS] Primera Minoría deshabilitada: ${limits.descripcion}`);
          return;
        } else {
          firstMinoritySlider.disabled = false;
        }
        
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
        
        // Mostrar SOLO información de cantidad PM/MR (sin advertencias)
        if (firstMinorityWarning) {
          const finalFirstMinority = parseInt(firstMinoritySlider.value);
          const percentageOfMr = mrActual > 0 ? Math.round((finalFirstMinority / mrActual) * 100) : 0;
          
          // Solo mostrar si PM > 0, sino ocultar
          if (finalFirstMinority > 0 && mrActual > 0) {
            firstMinorityWarning.innerHTML = `${percentageOfMr}% de MR (${finalFirstMinority}/${mrActual})`;
            firstMinorityWarning.style.display = 'block';
            firstMinorityWarning.style.color = '#6B7280'; // Color gris neutro
          } else {
            firstMinorityWarning.style.display = 'none'; // Ocultar cuando PM = 0
          }
        }
        
        console.log(`[PM LIMITS] Límite actualizado: max ${maxFirstMinority} | Sistema: ${limits.sistema} | ${limits.descripcion}`);
      }
    };
    
    // Event listeners para sliders MR/RP - INTEGRADO CON SISTEMA DE REDISTRIBUCIÓN
    if (mrSlider) {
      console.log('[DEBUG] 🎚️ Registrando event listener para MR slider');
      mrSlider.addEventListener('input', function() {
        console.log('[DEBUG] 🎚️ MR slider movido a:', this.value);
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
      console.log('[DEBUG] 🎚️ Registrando event listener para RP slider');
      rpSlider.addEventListener('input', function() {
        console.log('[DEBUG] 🎚️ RP slider movido a:', this.value);
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
        
        // Custom votes switch - cambiar modo de sliders de partidos
        if (switchId === 'custom-votes-switch') {
          const defaultNote = document.getElementById('default-shocks-note');
          const customNote = document.getElementById('custom-votes-note');
          
          // Usar optional chaining para evitar errores si los elementos no existen
          if (defaultNote) defaultNote.style.display = isActive ? 'none' : 'block';
          if (customNote) customNote.style.display = isActive ? 'block' : 'none';
          
          console.log(`[CUSTOM VOTES] Modo edición de votos: ${isActive ? 'ACTIVADO' : 'DESACTIVADO'}`);
          
          // Actualizar simulación cuando cambia el modo
          if (typeof window.actualizarDesdeControles === 'function') {
            setTimeout(() => window.actualizarDesdeControles(), 100);
          }
        }
        
        // 🆕 MR Distribution switch - habilitar/deshabilitar sliders
        if (switchId === 'mr-distribution-switch') {
          console.info(`[MR DISTRIBUTION] Toggle cambiado: ${isActive ? 'ACTIVADO ✅' : 'DESACTIVADO ❌'}`);
          
          // Llamar a updateMRSlidersState para habilitar/deshabilitar
          const sidebar = document.querySelector('control-sidebar');
          if (sidebar && typeof sidebar.updateMRSlidersState === 'function') {
            sidebar.updateMRSlidersState();
          }
          
          if (!isActive) {
            // Limpiar variable global
            window.mrDistributionManual = null;
            
            // Recalcular con datos normales
            if (typeof window.actualizarDesdeControles === 'function') {
              setTimeout(() => {
                window.actualizarDesdeControles();
                console.info('[MR DISTRIBUTION] ✅ Sistema recalculado con distribución automática');
              }, 100);
            }
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
                
                //  ACTUALIZAR LÍMITES DE PM AL CAMBIAR SISTEMA ELECTORAL
                setTimeout(() => {
                  if (typeof updateFirstMinorityLimits === 'function') {
                    updateFirstMinorityLimits();
                    console.log(`[PM LIMITS] Límites actualizados tras cambio de sistema electoral: ${this.value}`);
                  }
                }, 100);
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
              // Coaliciones activadas: sugerir 2024 si está en año sin coaliciones
              // Pero respetar la elección del usuario
              const currentYear = parseInt(yearSelect.value);
              if (currentYear < 2024) {
                yearSelect.value = '2024';
                console.log('[DEBUG]  Coaliciones activadas: cambiando a año 2024 (año previo no tenía coaliciones)');
              } else {
                console.log('[DEBUG]  Coaliciones activadas: manteniendo año actual', currentYear);
              }
            } else {
              // Coaliciones desactivadas: RESPETAR elección del usuario
              // No forzar cambio de año automáticamente
              console.log('[DEBUG]  Coaliciones desactivadas: manteniendo año', yearSelect.value);
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
    
    // 🆕 Event listeners para mayorías automáticas
    const mayoriasSwitch = this.querySelector('#mayorias-switch');
    const mayoriasControls = document.getElementById('mayorias-controls');
    
    if (mayoriasSwitch) {
      // Toggle para mostrar/ocultar controles
      mayoriasSwitch.addEventListener('click', () => {
        setTimeout(() => {
          const isActive = mayoriasSwitch.classList.contains('active');
          if (mayoriasControls) {
            mayoriasControls.style.display = isActive ? 'block' : 'none';
          }
          
          // Si se activa, calcular inmediatamente
          if (isActive) {
            this.calcularMayoriaAutomatica();
          } else {
            // 🔄 Si se desactiva, limpiar datos de mayoría forzada
            console.log('[MAYORÍAS] ❌ Toggle desactivado - limpiando datos de mayoría forzada');
            window.mayoriaForzadaData = null;
            
            // Ocultar resultado visual
            const resultadoDiv = document.getElementById('mayoria-resultado');
            if (resultadoDiv) {
              resultadoDiv.style.display = 'none';
            }
            
            // 🔄 Actualizar sistema para volver a datos normales
            if (typeof window.actualizarDesdeControles === 'function') {
              console.log('[MAYORÍAS] 🔄 Recalculando con datos normales...');
              setTimeout(() => {
                window.actualizarDesdeControles();
                
                if (window.notifications && window.notifications.isReady) {
                  window.notifications.info(
                    'Mayoría forzada desactivada',
                    'Mostrando resultados normales',
                    3000
                  );
                }
              }, 100);
            }
          }
        }, 10);
      });
    }
    
    // Event listeners para recalcular cuando cambien los controles
    const tipoMayoriaRadios = this.querySelectorAll('input[name="tipo-mayoria"]');
    tipoMayoriaRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        if (mayoriasSwitch && mayoriasSwitch.classList.contains('active')) {
          this.calcularMayoriaAutomatica();
        }
      });
    });
    
    const partidoSelect = this.querySelector('#mayoria-partido-select');
    if (partidoSelect) {
      partidoSelect.addEventListener('change', () => {
        if (mayoriasSwitch && mayoriasSwitch.classList.contains('active')) {
          this.calcularMayoriaAutomatica();
        }
      });
    }
    
    // 🆕 Event listeners para recalcular cuando cambien parámetros globales
    // Cambio de cámara (Diputados ↔ Senadores)
    const masterToggles = this.querySelectorAll('.master-toggle');
    masterToggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
        setTimeout(() => {
          if (mayoriasSwitch && mayoriasSwitch.classList.contains('active')) {
            const partidoSelect = this.querySelector('#mayoria-partido-select');
            if (partidoSelect && partidoSelect.value) {
              console.log('[MAYORÍAS] 🔄 Cambio de cámara detectado, recalculando...');
              this.calcularMayoriaAutomatica();
            }
          }
        }, 100); // Pequeño delay para que el toggle se actualice
      });
    });
    
    // Cambio de año
    const yearSelect = this.querySelector('#year-select');
    if (yearSelect) {
      yearSelect.addEventListener('change', () => {
        if (mayoriasSwitch && mayoriasSwitch.classList.contains('active')) {
          const partidoSelect = this.querySelector('#mayoria-partido-select');
          if (partidoSelect && partidoSelect.value) {
            console.log('[MAYORÍAS] 🔄 Cambio de año detectado, recalculando...');
            this.calcularMayoriaAutomatica();
          }
        }
      });
    }
    
    // Cambio de modelo/plan
    const modelSelect = this.querySelector('#model-select');
    if (modelSelect) {
      modelSelect.addEventListener('change', () => {
        if (mayoriasSwitch && mayoriasSwitch.classList.contains('active')) {
          const partidoSelect = this.querySelector('#mayoria-partido-select');
          if (partidoSelect && partidoSelect.value) {
            console.log('[MAYORÍAS] 🔄 Cambio de modelo detectado, recalculando...');
            this.calcularMayoriaAutomatica();
          }
        }
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
    
    // 🆕 ACTUALIZAR TABLA DE RESULTADOS INTELIGENTE
    // Usar requestAnimationFrame para asegurar que el SeatChart se haya renderizado
    if (result.resultados_detalle || result.seat_chart) {
      const resultadosTabla = result.resultados_detalle || this.transformSeatChartToTable(result.seat_chart);
      
      const config = {
        sistema: this.getActiveSystem(),
        pm_activo: this.isPMActive()
      };
      
      // Esperar al próximo frame para que el SeatChart haya actualizado el DOM
      requestAnimationFrame(() => {
        console.log('[DEBUG] 🎯 Actualizando tabla después de render del SeatChart');
        this.updateResultsTable(resultadosTabla, config);
        
        // 🆕 Actualizar tabla de distritos por estado
        this.updateStatesTable();
      });
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
  
  
  updateResultsTable(resultados, config = {}) {
    console.log('[DEBUG] 📊 Actualizando tabla de resultados:', resultados);
    console.log('[DEBUG] 📊 Config:', config);
    
    // Función para inyectar la tabla
    const injectTable = () => {
      const container = document.getElementById('results-table-container');
      
      console.log('[DEBUG] 📊 Contenedor encontrado:', !!container, container);
      
      if (!container) {
        console.error('[ERROR] ❌ Contenedor #results-table-container NO ENCONTRADO en el DOM');
        console.log('[DEBUG] Seat chart element:', document.querySelector('seat-chart'));
        return false;
      }
      
      // Si no hay datos, limpiar contenedor
      if (!resultados || resultados.length === 0) {
        console.warn('[WARN] No hay datos para mostrar en la tabla');
        container.innerHTML = '<p style="text-align:center;color:#9CA3AF;padding:20px;">No hay datos disponibles</p>';
        return true;
      }
      
      console.log('[DEBUG] ✅ Hay datos para mostrar, generando tabla...');
      
      // 🔍 DETECTAR SI HAY DESGLOSE MR/PM/RP
      const tieneDesglose = resultados.some(r => r.mr > 0 || r.pm > 0 || r.rp > 0);
      console.log('[DEBUG] 🔍 ¿Tiene desglose MR/PM/RP?', tieneDesglose);
      
      // 1️⃣ DETERMINAR QUÉ COLUMNAS MOSTRAR
      const sistema = config.sistema || this.getActiveSystem();
      const pmActivo = config.pm_activo || this.isPMActive();
      
      let columnsConfig;
      
      if (!tieneDesglose) {
        // 🚫 Sin desglose: Solo mostrar Partido y Total
        console.log('[DEBUG] 🚫 Backend no envía desglose, mostrando solo Partido y Total');
        columnsConfig = {
          partido: true,
          mr: false,
          pm: false,
          rp: false,
          total: true
        };
      } else {
        // ✅ Con desglose: Mostrar según sistema electoral
        columnsConfig = this.getTableColumnsConfig(sistema, pmActivo);
      }
      
      // 2️⃣ GENERAR HEADER
      const thead = this.generateTableHeader(columnsConfig);
      
      // 3️⃣ GENERAR BODY
      const tbody = this.generateTableBody(resultados, columnsConfig);
      
      // 4️⃣ GENERAR FOOTER (TOTALES)
      const tfoot = this.generateTableFooter(resultados, columnsConfig);
      
      // 🆕 5️⃣ GENERAR LEYENDA DE MAYORÍAS
      const totalEscanos = resultados.reduce((sum, p) => sum + (p.total || 0), 0);
      const umbralSimple = Math.floor(totalEscanos / 2) + 1;
      const umbralCalificada = Math.ceil(totalEscanos * (2/3));
      
      const mayoriaLegend = `
        <div class="mayoria-legend">
          <div class="mayoria-legend-item">
            <div class="mayoria-legend-badge calificada"></div>
            <span class="mayoria-legend-text">Mayoría Calificada</span>
            <span class="mayoria-legend-umbral">(≥${umbralCalificada})</span>
          </div>
          <div class="mayoria-legend-item">
            <div class="mayoria-legend-badge simple"></div>
            <span class="mayoria-legend-text">Mayoría Simple</span>
            <span class="mayoria-legend-umbral">(>${umbralSimple-1})</span>
          </div>
          <div class="mayoria-legend-item">
            <div class="mayoria-legend-badge sin-mayoria"></div>
            <span class="mayoria-legend-text">Sin mayoría</span>
          </div>
        </div>
      `;
      
      // 6️⃣ CREAR TABLA COMPLETA CON TÍTULO INTEGRADO + NOTA AL PIE + LEYENDA
      const tableHTML = `
        <div class="results-table-wrapper">
          <div class="results-table-title">Resultados por Partido</div>
          <table id="results-table" class="results-table">
            ${thead}
            ${tbody}
            ${tfoot}
          </table>
          <div class="results-table-footnote">*Porcentaje de escaños</div>
          ${mayoriaLegend}
        </div>
      `;
      
      container.innerHTML = tableHTML;
      
      console.log('[DEBUG] ✅ Tabla actualizada con config:', columnsConfig);
      return true;
    };
    
    // Intentar inyectar inmediatamente (por si el contenedor ya existe)
    if (!injectTable()) {
      // Si falla, usar requestAnimationFrame + setTimeout para máxima compatibilidad
      console.log('[DEBUG] ⏳ Primer intento falló, esperando próximo frame...');
      requestAnimationFrame(() => {
        if (!injectTable()) {
          console.log('[DEBUG] ⏳ Segundo intento falló, esperando 200ms adicionales...');
          setTimeout(() => {
            if (!injectTable()) {
              console.error('[ERROR] ❌ No se pudo inyectar la tabla después de múltiples intentos');
            }
          }, 200);
        }
      });
    }
  }
  
  // Determinar configuración de columnas según sistema
  getTableColumnsConfig(sistema, pmActivo) {
    const config = {
      partido: true,    // Siempre visible
      mr: false,
      pm: false,
      rp: false,
      total: true       // Siempre visible
    };
    
    if (sistema === 'mixto') {
      config.mr = true;
      config.rp = true;
      config.pm = pmActivo;
    } else if (sistema === 'mr') {
      config.mr = true;
      config.pm = pmActivo;
    } else if (sistema === 'rp') {
      config.rp = true;
    }
    
    return config;
  }
  
  // Generar header dinámico
  generateTableHeader(columnsConfig) {
    let html = '<thead><tr>';
    html += '<th class="col-partido">Partido</th>';
    
    if (columnsConfig.mr) {
      html += '<th class="col-mr" data-system-column="mr">MR</th>';
    }
    
    if (columnsConfig.pm) {
      html += '<th class="col-pm" data-system-column="pm">PM</th>';
    }
    
    if (columnsConfig.rp) {
      html += '<th class="col-rp" data-system-column="rp">RP</th>';
    }
    
    html += '<th class="col-total">Total*</th>';
    html += '</tr></thead>';
    
    return html;
  }
  
  // Generar filas de partidos
  generateTableBody(resultados, columnsConfig, mayorias = null) {
    let html = '<tbody>';
    
    // Calcular total de escaños para porcentajes
    const totalEscanos = resultados.reduce((sum, p) => sum + (p.total || 0), 0);
    
    // Determinar umbrales según total de escaños
    const umbralSimple = Math.floor(totalEscanos / 2) + 1;
    const umbralCalificada = Math.ceil(totalEscanos * (2/3));
    
    // Ordenar por total de escaños (mayor a menor)
    const sorted = [...resultados].sort((a, b) => (b.total || 0) - (a.total || 0));
    
    sorted.forEach(partido => {
      const esCoalicion = partido.es_coalicion || false;
      const miembros = partido.miembros || [];
      const color = partido.color || this.getPartyColor(partido.partido);
      const total = partido.total || 0;
      const percentEscanos = totalEscanos > 0 ? ((total / totalEscanos) * 100).toFixed(1) : 0;
      
      // Determinar si tiene mayoría y su tipo
      let mayoriaClass = '';
      let mayoriaTooltip = '';
      
      if (total >= umbralCalificada) {
        mayoriaClass = 'mayoria-calificada';
        mayoriaTooltip = `Mayoría Calificada (${total}/${umbralCalificada} necesarios)`;
      } else if (total >= umbralSimple) {
        mayoriaClass = 'mayoria-simple';
        mayoriaTooltip = `Mayoría Simple (${total}/${umbralSimple} necesarios)`;
      }
      
      // 🆕 FILA DE COALICIÓN (con estilo diferente)
      if (esCoalicion) {
        html += `<tr data-partido="${partido.partido}" class="coalicion-row">`;
        
        // Columna Partido (coalición)
        html += `
          <td class="partido-cell coalicion-cell">
            <div class="partido-color coalicion-color" style="background-color: ${color};"></div>
            <span class="partido-nombre coalicion-nombre">${partido.partido}</span>
          </td>
        `;
      } else {
        // FILA NORMAL (partido individual)
        html += `<tr data-partido="${partido.partido}">`;
        
        // Columna Partido
        html += `
          <td class="partido-cell">
            <div class="partido-color" style="background-color: ${color};"></div>
            <span class="partido-nombre">${partido.partido}</span>
          </td>
        `;
      }
      
      // Columna MR
      if (columnsConfig.mr) {
        const mrValue = partido.mr || 0;
        const cellClass = esCoalicion ? 'col-mr coalicion-data' : 'col-mr';
        html += `<td class="${cellClass}" data-system-column="mr">${mrValue}</td>`;
      }
      
      // Columna PM
      if (columnsConfig.pm) {
        const pmValue = partido.pm || 0;
        const cellClass = esCoalicion ? 'col-pm coalicion-data' : 'col-pm';
        html += `<td class="${cellClass}" data-system-column="pm">${pmValue}</td>`;
      }
      
      // Columna RP
      if (columnsConfig.rp) {
        const rpValue = partido.rp || 0;
        const cellClass = esCoalicion ? 'col-rp coalicion-data' : 'col-rp';
        html += `<td class="${cellClass}" data-system-column="rp">${rpValue}</td>`;
      }
      
      // Columna Total con porcentaje y COLOR DE MAYORÍA
      const totalCellClass = esCoalicion ? `col-total coalicion-data ${mayoriaClass}` : `col-total ${mayoriaClass}`;
      html += `<td class="${totalCellClass}" title="${mayoriaTooltip}">
        <strong>${total}</strong> 
        <span class="percent-escanos">(${percentEscanos}%)</span>
      </td>`;
      
      html += '</tr>';
      
      // 🆕 FILAS DE MIEMBROS DE LA COALICIÓN (indentadas)
      if (esCoalicion && miembros.length > 0) {
        miembros.forEach(miembro => {
          const miembroNombre = miembro.partido || miembro.nombre || miembro;
          const miembroTotal = miembro.total || miembro.escanos || 0;
          const miembroMR = miembro.mr || 0;
          const miembroPM = miembro.pm || 0;
          const miembroRP = miembro.rp || 0;
          const miembroColor = miembro.color || this.getPartyColor(miembroNombre);
          const miembroPercent = totalEscanos > 0 ? ((miembroTotal / totalEscanos) * 100).toFixed(1) : 0;
          
          // 🆕 CALCULAR MAYORÍA PARA EL MIEMBRO INDIVIDUAL
          let miembroMayoriaClass = '';
          let miembroMayoriaTooltip = '';
          
          if (miembroTotal >= umbralCalificada) {
            miembroMayoriaClass = 'mayoria-calificada';
            miembroMayoriaTooltip = `Mayoría Calificada (${miembroTotal}/${umbralCalificada} necesarios)`;
          } else if (miembroTotal >= umbralSimple) {
            miembroMayoriaClass = 'mayoria-simple';
            miembroMayoriaTooltip = `Mayoría Simple (${miembroTotal}/${umbralSimple} necesarios)`;
          }
          
          html += `<tr data-partido="${miembroNombre}" class="miembro-coalicion-row">`;
          
          // Columna Partido (miembro, indentado)
          html += `
            <td class="partido-cell miembro-cell">
              <div class="miembro-indent"></div>
              <div class="partido-color miembro-color" style="background-color: ${miembroColor};"></div>
              <span class="partido-nombre miembro-nombre">${miembroNombre}</span>
            </td>
          `;
          
          // Columna MR
          if (columnsConfig.mr) {
            html += `<td class="col-mr miembro-data" data-system-column="mr">${miembroMR}</td>`;
          }
          
          // Columna PM
          if (columnsConfig.pm) {
            html += `<td class="col-pm miembro-data" data-system-column="pm">${miembroPM}</td>`;
          }
          
          // Columna RP
          if (columnsConfig.rp) {
            html += `<td class="col-rp miembro-data" data-system-column="rp">${miembroRP}</td>`;
          }
          
          // Columna Total CON COLOR DE MAYORÍA
          html += `<td class="col-total miembro-data ${miembroMayoriaClass}" title="${miembroMayoriaTooltip}">
            <strong>${miembroTotal}</strong> 
            <span class="percent-escanos">(${miembroPercent}%)</span>
          </td>`;
          
          html += '</tr>';
        });
      }
    });
    
    html += '</tbody>';
    return html;
  }
  
  // Generar footer con totales
  generateTableFooter(resultados, columnsConfig) {
    let html = '<tfoot><tr class="totals-row">';
    
    html += '<td class="partido-cell"><strong>TOTAL</strong></td>';
    
    // 🆕 SOLO SUMAR PARTIDOS QUE NO SON MIEMBROS DE COALICIONES
    // Para evitar doble conteo: solo sumamos las coaliciones (que ya tienen el total) o partidos individuales
    const partidosParaSumar = resultados.filter(p => !p.es_miembro_de_coalicion);
    
    console.log('[DEBUG] 📊 Total de partidos/coaliciones a sumar:', partidosParaSumar.length);
    console.log('[DEBUG] 📊 Datos a sumar:', partidosParaSumar.map(p => `${p.partido}: ${p.total}`));
    
    // Total MR
    if (columnsConfig.mr) {
      const totalMR = partidosParaSumar.reduce((sum, p) => sum + (p.mr || 0), 0);
      html += `<td class="col-mr" data-system-column="mr"><strong>${totalMR}</strong></td>`;
    }
    
    // Total PM
    if (columnsConfig.pm) {
      const totalPM = partidosParaSumar.reduce((sum, p) => sum + (p.pm || 0), 0);
      html += `<td class="col-pm" data-system-column="pm"><strong>${totalPM}</strong></td>`;
    }
    
    // Total RP
    if (columnsConfig.rp) {
      const totalRP = partidosParaSumar.reduce((sum, p) => sum + (p.rp || 0), 0);
      html += `<td class="col-rp" data-system-column="rp"><strong>${totalRP}</strong></td>`;
    }
    
    // Total General con 100%
    const totalGeneral = partidosParaSumar.reduce((sum, p) => sum + (p.total || 0), 0);
    html += `<td class="col-total">
      <strong>${totalGeneral}</strong> 
      <span class="percent-escanos">(100%)</span>
    </td>`;
    
    html += '</tr></tfoot>';
    
    return html;
  }
  
  // Helpers
  getActiveSystem() {
    const selectedRadio = document.querySelector('input[name="electoral-rule"]:checked');
    return selectedRadio ? selectedRadio.value : 'mixto';
  }
  
  isPMActive() {
    const pmSwitch = document.getElementById('first-minority-switch');
    return pmSwitch && pmSwitch.getAttribute('data-switch') === 'On';
  }
  
  getPartyColor(partido) {
    // 1️⃣ PRIMERO: Intentar obtener desde el cache actualizado (más reciente)
    if (this._cachedColors && this._cachedColors[partido]) {
      console.log(`[DEBUG] 🎨 Color de ${partido} desde CACHE: ${this._cachedColors[partido]}`);
      return this._cachedColors[partido];
    }
    
    // 2️⃣ Intentar obtener color desde el último seat_chart (viene del backend)
    if (this.lastResult && this.lastResult.seat_chart) {
      const partidoEnSeatChart = this.lastResult.seat_chart.find(
        p => (p.partido || p.party) === partido
      );
      if (partidoEnSeatChart && partidoEnSeatChart.color) {
        console.log(`[DEBUG] 🎨 Color de ${partido} desde lastResult.seat_chart: ${partidoEnSeatChart.color}`);
        return partidoEnSeatChart.color;
      }
    }
    
    // 3️⃣ Intentar obtener desde debugLastResponse (fallback)
    if (this.debugLastResponse && this.debugLastResponse.seat_chart) {
      const partidoEnDebug = this.debugLastResponse.seat_chart.find(
        p => (p.partido || p.party) === partido
      );
      if (partidoEnDebug && partidoEnDebug.color) {
        console.log(`[DEBUG] 🎨 Color de ${partido} desde debugLastResponse: ${partidoEnDebug.color}`);
        return partidoEnDebug.color;
      }
    }
    
    // 4️⃣ Buscar en el seat-chart del DOM (último recurso antes de fallback)
    const seatChartElement = document.querySelector('seat-chart');
    if (seatChartElement && seatChartElement._data) {
      const partidoEnDOM = seatChartElement._data.find(
        p => (p.partido || p.party) === partido
      );
      if (partidoEnDOM && partidoEnDOM.color) {
        console.log(`[DEBUG] 🎨 Color de ${partido} desde seat-chart DOM: ${partidoEnDOM.color}`);
        return partidoEnDOM.color;
      }
    }
    
    // 5️⃣ Colores de fallback (solo si no viene del backend)
    const coloresFallback = {
      'MORENA': '#8B2231',
      'PAN': '#003DA5',
      'PRI': '#E31921',
      'MC': '#F58025',
      'PVEM': '#1E9F00',
      'PT': '#D52B1E',
      'PRD': '#FFD700',
      'PES': '#5E1D89',
      'RSP': '#00A19B',
      'FXM': '#8B4513'
    };
    
    const colorFinal = coloresFallback[partido] || '#6B7280';
    console.log(`[DEBUG] 🎨 Color de ${partido} desde fallback: ${colorFinal}`);
    return colorFinal;
  }
  
  // Transformar seat_chart a formato tabla
  transformSeatChartToTable(seatChart) {
    console.log('[DEBUG] 🔄 Transformando seat_chart a tabla:', seatChart);
    
    if (!Array.isArray(seatChart)) {
      console.warn('[WARN] seat_chart no es un array:', typeof seatChart);
      return [];
    }
    
    // 🆕 GUARDAR COLORES DEL BACKEND en cache temporal
    if (!this._cachedColors) {
      this._cachedColors = {};
    }
    
    // 🆕 DEFINIR COALICIONES CONOCIDAS (basado en año electoral)
    const coalicionesDefinidas = {
      2024: [
        {
          nombre: 'SIGAMOS HACIENDO HISTORIA',
          color: '#8B2231',
          miembros: ['MORENA', 'PT', 'PVEM']
        },
        {
          nombre: 'FUERZA Y CORAZÓN POR MÉXICO',
          color: '#003DA5',
          miembros: ['PAN', 'PRI', 'PRD']
        }
      ],
      2018: [
        {
          nombre: 'JUNTOS HAREMOS HISTORIA',
          color: '#8B2231',
          miembros: ['MORENA', 'PT', 'PES']
        },
        {
          nombre: 'POR MÉXICO AL FRENTE',
          color: '#003DA5',
          miembros: ['PAN', 'PRD', 'MC']
        }
      ]
    };
    
    // Obtener año actual del selector
    const yearSelect = document.getElementById('year-select');
    const anioActual = yearSelect ? parseInt(yearSelect.value) : 2024;
    const coalicionesDelAnio = coalicionesDefinidas[anioActual] || [];
    
    console.log(`[DEBUG] 🤝 Coaliciones definidas para ${anioActual}:`, coalicionesDelAnio.map(c => c.nombre));
    
    // 🔍 DETECTAR SISTEMA ACTIVO PARA MAPEO INTELIGENTE
    const sistemaActivo = this.getActiveSystem();
    const pmActivo = this.isPMActive();
    console.log(`[DEBUG] 🎯 Sistema activo: ${sistemaActivo}, PM activo: ${pmActivo}`);
    
    const transformed = seatChart.map(item => {
      const partidoNombre = item.partido || item.party || 'Sin nombre';
      
      // 🔍 DEBUG: Ver TODAS las propiedades del item del backend
      console.log(`[DEBUG] 📦 Item completo de ${partidoNombre}:`, JSON.stringify(item, null, 2));
      console.log(`[DEBUG] 🔢 Propiedades disponibles:`, Object.keys(item));
      
      // Guardar el color en el cache
      if (item.color) {
        this._cachedColors[partidoNombre] = item.color;
        console.log(`[DEBUG] 🎨 Guardando color de ${partidoNombre}: ${item.color}`);
      }
      
      // 🔍 Obtener el total de escaños (siempre necesario)
      const total = item.escaños || item.seats || item.total || item.escanos || 0;
      const percent = item.percent || item.porcentaje || 0;
      
      let mr = 0, pm = 0, rp = 0;
      
      // 🆕 MAPEO INTELIGENTE SEGÚN SISTEMA
      if (sistemaActivo === 'mixto') {
        // Sistema mixto: debe tener MR y RP explícitos
        mr = item.mr || item.MR || item.mayoría_relativa || item['mayoría relativa'] || 0;
        rp = item.rp || item.RP || item.representación_proporcional || item['representación proporcional'] || 0;
        if (pmActivo) {
          pm = item.pm || item.PM || item.plurinominales || item.plurinominal || 0;
        }
      } else if (sistemaActivo === 'mr') {
        // 🚨 SISTEMA MR PURO: El backend puede enviar escaños en diferentes propiedades
        // ESTRATEGIA DE FALLBACK:
        // 1. Intentar item.mr primero
        // 2. Si no existe, intentar item.rp (por si el backend envió mal)
        // 3. Si no existe, usar total
        const mrFromBackend = item.mr || item.MR || item.mayoría_relativa || item['mayoría relativa'];
        const rpFromBackend = item.rp || item.RP || item.representación_proporcional || item['representación proporcional'];
        
        if (mrFromBackend) {
          mr = mrFromBackend;
        } else if (rpFromBackend && rpFromBackend > 0) {
          // 🚨 ADVERTENCIA: El backend envió datos en 'rp' cuando el sistema es MR
          console.warn(`[WARN] 🔴 Backend envió datos en 'rp' (${rpFromBackend}) para sistema MR - usando como 'mr' para ${partidoNombre}`);
          mr = rpFromBackend;
        } else {
          // Último recurso: usar total
          mr = total;
        }
        
        if (pmActivo) {
          // PM activo: intentar obtener PM del backend
          pm = item.pm || item.PM || item.plurinominales || item.plurinominal || 0;
        }
        
        // RP debe ser 0 en sistema MR puro
        rp = 0;
        
        console.log(`[DEBUG] 🔴 MR PURO - ${partidoNombre}: MR=${mr} (de item.mr=${item.mr}, item.rp=${item.rp}, total=${total}), PM=${pm}, RP=${rp}`);
      } else if (sistemaActivo === 'rp') {
        // Sistema RP puro: solo RP
        rp = item.rp || item.RP || item.representación_proporcional || item['representación proporcional'] || total;
        mr = 0;
        pm = 0;
      }
      
      console.log(`[DEBUG] 📊 ${partidoNombre}: MR=${mr}, PM=${pm}, RP=${rp}, Total=${total}, Percent=${percent}%`);
      
      return {
        partido: partidoNombre,
        mr: mr,
        pm: pm,
        rp: rp,
        total: total,
        percent: percent,
        color: item.color || this.getPartyColor(partidoNombre)
      };
    });
    
    console.log('[DEBUG] ✅ Datos transformados (sin coaliciones):', transformed);
    
    // 🆕 CONSTRUIR COALICIONES A PARTIR DE PARTIDOS INDIVIDUALES
    const resultadosConCoaliciones = [];
    const partidosUsados = new Set();
    
    // Procesar cada coalición definida
    coalicionesDelAnio.forEach(coalicionDef => {
      // Buscar partidos que pertenecen a esta coalición
      const miembrosEncontrados = [];
      let totalCoalicionMR = 0;
      let totalCoalicionPM = 0;
      let totalCoalicionRP = 0;
      let totalCoalicionTotal = 0;
      
      coalicionDef.miembros.forEach(nombreMiembro => {
        const partido = transformed.find(p => p.partido === nombreMiembro);
        if (partido) {
          miembrosEncontrados.push({...partido});
          totalCoalicionMR += partido.mr || 0;
          totalCoalicionPM += partido.pm || 0;
          totalCoalicionRP += partido.rp || 0;
          totalCoalicionTotal += partido.total || 0;
          partidosUsados.add(nombreMiembro);
        }
      });
      
      // Si encontramos al menos un miembro, crear la coalición
      if (miembrosEncontrados.length > 0) {
        console.log(`[DEBUG] 🤝 Creando coalición ${coalicionDef.nombre} con ${miembrosEncontrados.length} miembros`);
        
        resultadosConCoaliciones.push({
          partido: coalicionDef.nombre,
          mr: totalCoalicionMR,
          pm: totalCoalicionPM,
          rp: totalCoalicionRP,
          total: totalCoalicionTotal,
          percent: 0, // Se calculará después
          es_coalicion: true,
          miembros: miembrosEncontrados,
          color: coalicionDef.color
        });
      }
    });
    
    // Agregar partidos que NO están en ninguna coalición
    transformed.forEach(partido => {
      if (!partidosUsados.has(partido.partido)) {
        resultadosConCoaliciones.push(partido);
      }
    });
    
    console.log('[DEBUG] ✅ Datos con coaliciones:', resultadosConCoaliciones);
    console.log('[DEBUG] 🎨 Cache de colores actualizado:', this._cachedColors);
    return resultadosConCoaliciones;
  }
  
  // 🆕 TABLA DE DISTRITOS POR ESTADO
  async updateStatesTable() {
    console.log('[DEBUG] 🗺️ Actualizando tabla de MR por estado...');
    console.log('[DEBUG] 🔍 this.lastResult:', this.lastResult);
    console.log('[DEBUG] 🔍 Cámara actual:', this.selectedChamber);
    
    const container = document.getElementById('states-table-container');
    console.log('[DEBUG] 🔍 Container encontrado:', !!container);
    
    if (!container) {
      console.warn('[WARN] ❌ No se encontró el contenedor states-table-container');
      return;
    }
    
    // Verificar si hay datos de distribución geográfica
    if (!this.lastResult) {
      console.log('[DEBUG] ❌ No hay lastResult');
      container.innerHTML = '';
      container.classList.add('hidden');
      return;
    }
    
    // 🔥 PRIORIDAD A MAYORÍA FORZADA: Si hay datos de mayoría guardados, usar esos
    let metaSource = this.lastResult.meta;
    
    // Verificar si hay mayoría forzada activa con datos guardados
    if (window.mayoriaForzadaData?.activa && 
        this.lastResult.meta?.mr_distritos_por_estado && 
        this.lastResult.meta?._mayoriaForzada) {
      console.log('[DEBUG] 🎯 MAYORÍA FORZADA ACTIVA - Usando datos de mayoría guardados en meta');
      // Ya está en this.lastResult.meta, solo lo usamos
    } else {
      console.log('[DEBUG] 📊 DATOS NORMALES - Usando this.lastResult.meta estándar');
    }
    
    console.log('[DEBUG] 🔍 metaSource:', metaSource);
    console.log('[DEBUG] 🔍 Keys en meta:', metaSource ? Object.keys(metaSource) : 'NO HAY META');
    
    // 🆕 FALLBACK: Si no hay meta, intentar cargar desde /data/initial
    if (!metaSource) {
      console.log('[DEBUG] ⚠️ No hay meta en this.lastResult');
      console.log('[DEBUG] 🔄 Intentando cargar desde /data/initial para cámara:', this.selectedChamber);
      
      try {
        const camara = this.selectedChamber === 'senadores' ? 'senadores' : 'diputados';
        const anio = new URLSearchParams(window.location.search).get('year') || new Date().getFullYear();
        const url = `https://back-electoral.onrender.com/data/initial?camara=${camara}&anio=${anio}`;
        
        console.log('[DEBUG] 🌐 Haciendo request a:', url);
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        console.log('[DEBUG] ✅ Datos recibidos de /data/initial');
        console.log('[DEBUG] 🔍 data.meta:', data.meta);
        
        // Actualizar metaSource con los datos obtenidos
        if (data.meta) {
          metaSource = data.meta;
          console.log('[DEBUG] ✅ metaSource actualizado desde /data/initial');
        } else {
          console.log('[DEBUG] ❌ /data/initial tampoco devolvió meta');
          container.innerHTML = '<p style="padding: 1rem; text-align: center; color: #888;">No hay datos de distribución geográfica disponibles</p>';
          container.classList.remove('hidden');
          return;
        }
      } catch (error) {
        console.error('[ERROR] ❌ Error al cargar desde /data/initial:', error);
        container.innerHTML = '<p style="padding: 1rem; text-align: center; color: #888;">Error al cargar datos de distribución geográfica</p>';
        container.classList.remove('hidden');
        return;
      }
    }
    
    // 🔥 PRIORIDAD: Si hay mayoría forzada, usar mr_distritos_por_estado
    let mrPorEstado;
    if (this.lastResult.meta?._mayoriaForzada && this.lastResult.meta?.mr_distritos_por_estado) {
      console.log('[DEBUG] 🎯 Usando mr_distritos_por_estado de MAYORÍA FORZADA');
      mrPorEstado = this.lastResult.meta.mr_distritos_por_estado;
    } else {
      console.log('[DEBUG] 📊 Usando mr_por_estado NORMAL');
      mrPorEstado = metaSource.mr_por_estado;
    }
    
    // 🆕 SELECCIÓN FLEXIBLE DE METADATOS (Restaurando funcionalidad)
    // Intentar leer la definición geográfica específica
    let distritosPorEstado = metaSource.distritos_por_estado || 
                             metaSource.senadores_por_estado ||
                             metaSource.mr_distritos_por_estado;
    
    // 🔍 DEBUG: Verificar si el backend envió el nuevo campo
    console.log('[DEBUG] 📦 meta.distritos_por_estado desde backend:', metaSource.distritos_por_estado ? '✅ EXISTE' : '❌ NO EXISTE');
    if (metaSource.distritos_por_estado) {
      console.log('[DEBUG] 📊 Ejemplo distritos_por_estado:', Object.entries(metaSource.distritos_por_estado).slice(0, 3));
    }
                             
    // 🔥 FALLBACK ROBUSTO: Si no hay definición geográfica explícita, 
    // inferirla de la suma de ganadores por estado (funciona para ambas cámaras)
    if (!distritosPorEstado && mrPorEstado) {
         console.log('[DEBUG] ⚠️ No hay distritos_por_estado explícito. Inferiendo de mr_por_estado...');
         distritosPorEstado = {};
         Object.keys(mrPorEstado).forEach(estado => {
             const total = Object.values(mrPorEstado[estado]).reduce((a, b) => a + b, 0);
             distritosPorEstado[estado] = total;
         });
         // Guardar en meta para cachear
         // metaSource.distritos_por_estado = distritosPorEstado; // No cachear para evitar conflictos
    }
    
    // 🔥 DEBUG DETALLADO DE KEYS PARA DIAGNOSTICO
    if (!distritosPorEstado) {
        console.warn('[DIAGNOSTICO] ⚠️ No se pudo determinar la geografía electoral (distritos/senadores por estado)');
    }

    
    console.log('[DEBUG] 🔍 mr_por_estado:', mrPorEstado ? `✅ (${Object.keys(mrPorEstado).length} estados)` : '❌ NO EXISTE');
    console.log('[DEBUG] 🔍 distritos_por_estado (Activo para ' + this.selectedChamber + '):', distritosPorEstado ? '✅' : '❌');
    
    // 🆕 FALLBACK: Si falta el campo específico de distritos/senadores, intentar desde /data/initial
    if (!mrPorEstado || !distritosPorEstado) {
      console.log('[DEBUG] ❌ No hay datos de distribución geográfica en meta');
      console.log('[DEBUG] 💡 El backend debe enviar meta.mr_por_estado y meta.distritos_por_estado/senadores_por_estado');
      console.log('[DEBUG] 🔍 ESTRUCTURA COMPLETA DE META:', JSON.stringify(metaSource, null, 2));
      
      // 🔄 Intentar fallback solo si no se ha intentado antes
      if (!this.lastResult.meta._fallbackAttempted) {
        console.log('[DEBUG] 🔄 Intentando cargar campo faltante desde /data/initial...');
        this.lastResult.meta._fallbackAttempted = true; // Evitar loops infinitos
        
        try {
          const camara = this.selectedChamber === 'senadores' ? 'senadores' : 'diputados';
          const anio = new URLSearchParams(window.location.search).get('year') || new Date().getFullYear();
          const url = `https://back-electoral.onrender.com/data/initial?camara=${camara}&anio=${anio}`;
          
          console.log('[DEBUG] 🌐 Haciendo request a:', url);
          const response = await fetch(url);
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          
          const data = await response.json();
          console.log('[DEBUG] ✅ Datos recibidos de /data/initial');
          console.log('[DEBUG] 🔍 data.meta:', data.meta);
          
          // Merge con meta existente (preservar mr_por_estado si existe)
          if (data.meta) {
            Object.assign(this.lastResult.meta, data.meta);
            console.log('[DEBUG] ✅ meta actualizado desde /data/initial (merge)');
            console.log('[DEBUG] 🔍 Keys después del merge:', Object.keys(this.lastResult.meta));
            
            // 🆕 WORKAROUND: Si estamos en Senado y sigue sin senadores_por_estado, generarlo
            if (this.selectedChamber === 'senadores' && !this.lastResult.meta.senadores_por_estado && this.lastResult.meta.mr_por_estado) {
              // Calcular límite dinámico basado en slider MR
              const mrInput = document.getElementById('input-mr');
              const totalMR = mrInput ? parseInt(mrInput.value) : 64;
              const perState = Math.max(1, Math.floor(totalMR / 32));

              console.log(`[DEBUG] 🔧 WORKAROUND: Generando senadores_por_estado automáticamente (limite: ${perState} por estado, Total: ${totalMR})`);
              const senadoresPorEstado = {};
              Object.keys(this.lastResult.meta.mr_por_estado).forEach(estado => {
                senadoresPorEstado[estado] = perState; 
              });
              this.lastResult.meta.senadores_por_estado = senadoresPorEstado;
              console.log('[DEBUG] ✅ senadores_por_estado generado para', Object.keys(senadoresPorEstado).length, 'estados');
            }
            
            // Recursivamente llamar a updateStatesTable para procesar los nuevos datos
            await this.updateStatesTable();
            return;
          } else {
            console.log('[DEBUG] ❌ /data/initial tampoco devolvió meta completo');
          }
        } catch (error) {
          console.error('[ERROR] ❌ Error al cargar desde /data/initial:', error);
        }
      }
      
      // 🆕 WORKAROUND ADICIONAL: Si ya se intentó fallback pero estamos en Senado sin senadores_por_estado, generarlo
      if (this.selectedChamber === 'senadores' && !this.lastResult.meta.senadores_por_estado && this.lastResult.meta.mr_por_estado) {
        // Calcular límite dinámico basado en slider MR
        const mrInput = document.getElementById('input-mr');
        const totalMR = mrInput ? parseInt(mrInput.value) : 64;
        const perState = Math.max(1, Math.floor(totalMR / 32));

        console.log(`[DEBUG] 🔧 WORKAROUND FINAL: Generando senadores_por_estado automáticamente (limite: ${perState} por estado)`);
        const senadoresPorEstado = {};
        Object.keys(this.lastResult.meta.mr_por_estado).forEach(estado => {
          senadoresPorEstado[estado] = perState;
        });
        this.lastResult.meta.senadores_por_estado = senadoresPorEstado;
        console.log('[DEBUG] ✅ senadores_por_estado generado para', Object.keys(senadoresPorEstado).length, 'estados');
        
        // Recursivamente llamar para procesar con el campo generado        await this.updateStatesTable();
        return;
      }
      
      // Si el fallback falló o ya se intentó, ocultar tabla
      container.innerHTML = '';
      container.classList.add('hidden');
      return;
    }
    
    console.log('[DEBUG] ✅ Datos de estados disponibles:', { mrPorEstado, distritosPorEstado });
    
    // 🆕 Obtener TODOS los partidos disponibles (incluso con 0 distritos)
    const partidosSet = new Set();
    
    // Primero: partidos que ya tienen distritos
    Object.values(mrPorEstado).forEach(estadoData => {
      Object.keys(estadoData).forEach(partido => {
        partidosSet.add(partido);
      });
    });
    
    // Segundo: agregar partidos de partidosData (asegurar que todos aparezcan)
    if (this.partidosData) {
      Object.keys(this.partidosData).forEach(partido => {
        partidosSet.add(partido);
      });
    }
    
    const partidos = Array.from(partidosSet).sort();
    
    console.log('[DEBUG] 🎯 Partidos con escaños MR:', partidos);
    
    // Generar HTML de la tabla
    const tableHTML = this.generateStatesTableHTML(mrPorEstado, distritosPorEstado, partidos);
    
    console.log('[DEBUG] 📝 HTML generado (primeros 500 chars):', tableHTML.substring(0, 500));
    
    // Resetear flag de listeners antes de insertar nuevo HTML
    container._arrowListenersAttached = false;
    
    container.innerHTML = tableHTML;
    container.classList.remove('hidden');
    
    console.log('[DEBUG] ✅ Tabla de estados actualizada en el DOM');
    console.log('[DEBUG] 📏 Tamaño del HTML insertado:', tableHTML.length, 'caracteres');
    
    // 🆕 Adjuntar event listeners a los botones de flechas
    this.attachStateArrowListeners();
    
    // 🆕 ACTUALIZAR SLIDERS DE DISTRIBUCIÓN MR CON LOS TOTALES DE LA TABLA
    this.updateMRSlidersFromStatesData(mrPorEstado, partidos);
  }
  
  // 🆕 Event listeners para botones de flechas en la tabla de estados
  attachStateArrowListeners() {
    // Buscar primero en el documento global (la tabla suele renderizarse fuera del shadow/element)
    const container = document.getElementById('states-table-container') || this.querySelector('#states-table-container') || this.querySelector('.states-table-container');
    if (!container) return;
    
    // Evitar agregar múltiples listeners
    if (container._arrowListenersAttached) return;
    container._arrowListenersAttached = true;
    
    // Event delegation - escuchar clicks en el contenedor
    container.addEventListener('click', (event) => {
      const button = event.target.closest('.state-arrow-btn');
      if (!button || button.disabled) return;
      
      const estado = button.getAttribute('data-estado');
      const partido = button.getAttribute('data-partido');
      const isUp = button.classList.contains('state-arrow-up');
      
      console.log(`[STATES TABLE] 🎯 ${isUp ? '↑' : '↓'} ${partido} en ${estado}`);
      
      this.adjustStateDistrict(estado, partido, isUp ? 1 : -1);
    });
    
    console.log('[STATES TABLE] ✅ Event listeners adjuntados');
  }
  
  // 🆕 Ajustar distritos de un partido en un estado
  adjustStateDistrict(estado, partido, delta) {
    if (!this.lastResult || !this.lastResult.meta || !this.lastResult.meta.mr_por_estado) {
      console.error('[STATES TABLE] ❌ No hay datos de mr_por_estado disponibles');
      return;
    }
    
    // 🔥 Recuperar distribución actual para no perder sincronía
    const mrPorEstado = this.lastResult.meta.mr_por_estado;
    let distritosPorEstado = this.lastResult.meta.distritos_por_estado || 
                             this.lastResult.meta.senadores_por_estado ||
                             this.lastResult.meta.mr_distritos_por_estado;

    // Si no existe el mapa específico, intentar inferirlo
    if (!distritosPorEstado && mrPorEstado) {
         distritosPorEstado = {};
         Object.keys(mrPorEstado).forEach(estado => {
             distritosPorEstado[estado] = Object.values(mrPorEstado[estado]).reduce((a, b) => a + b, 0);
         });
    }
    
    if (!mrPorEstado[estado]) {
      console.error(`[STATES TABLE] ❌ Estado ${estado} no encontrado`);
      return;
    }
    
    // Obtener límites
    let maxDistritosEstado;

    if (this.selectedChamber === 'senadores') {
        // 🔥 SENADO: Usar el valor que reporta el backend si existe (para respetar 96 o 64 según se calculó)
        // Pero si no existe, calcular dinámicamente.
        if (distritosPorEstado && distritosPorEstado[estado]) {
             maxDistritosEstado = distritosPorEstado[estado];
        } else {
             // Fallback dinámico si por alguna razón el backend no mandó la metadata
             const mrInput = document.getElementById('input-mr');
             let totalMR = mrInput ? parseInt(mrInput.value) : 64;
             if (isNaN(totalMR)) totalMR = 64;
             maxDistritosEstado = Math.floor(totalMR / 32); 
             if (maxDistritosEstado < 1) maxDistritosEstado = 2; 
        }
    } else {
        // 🔥 DIPUTADOS: El límite es la geografía física del estado (distritos_por_estado)
        if (distritosPorEstado && distritosPorEstado[estado]) {
            maxDistritosEstado = distritosPorEstado[estado];
        } else {
            console.error(`[STATES TABLE] ❌ No hay límite definido para estado ${estado} en Diputados. Usando default.`);
            maxDistritosEstado = 100; // Valor seguro alto si falla meta
        }
    }

    if (typeof maxDistritosEstado === 'undefined') {
        console.warn(`[STATES TABLE] ⚠️ Límite indefinido para ${estado}, forzando default.`);
        maxDistritosEstado = this.selectedChamber === 'senadores' ? 2 : 10;
    }

    const valorActual = mrPorEstado[estado][partido] || 0;
    
    // Si queremos bajar de 0, ignorar
    if (delta < 0 && valorActual <= 0) return;
    
    const nuevoValor = Math.max(0, valorActual + delta);
    
    // Límite global
    const slidersTotal = document.getElementById('mr-seats-slider');
    const globalLimit = slidersTotal ? parseInt(slidersTotal.value) : 
                        (this.lastResult.meta.scaled_info ? this.lastResult.meta.scaled_info.total_target : 300);

    // Calcular ocupaciones
    const ocupacionEstado = Object.values(mrPorEstado[estado]).reduce((sum, val) => sum + val, 0);
    const ocupacionGlobal = Object.values(mrPorEstado).reduce((acc, est) => {
        return acc + Object.values(est).reduce((s, v) => s + v, 0);
    }, 0);

    // Validación principal
    if (delta > 0) {
        // --- CASO 1: LÍMITE ESTATAL (Priority Criticidad Alta) ---
        // Si el estado está físicamente lleno, DEBEMOS robar localmente.
        const espacioEstado = maxDistritosEstado - ocupacionEstado;
        
        if (espacioEstado < delta) {
            // No cabe en el estado. Intentar robar localmente (a otros partidos del mismo estado)
            const necesarios = delta - espacioEstado;
            const robados = this.takeFromOtherParties(estado, partido, necesarios, mrPorEstado);

            if (robados < necesarios) {
               console.warn(`[STATES TABLE] ⚠️ Estado ${estado} lleno (${ocupacionEstado}/${maxDistritosEstado}). No se pudo redistribuir localmente por completo.`);

               // Intento alternativo: mover el incremento a OTRO estado donde sí haya capacidad disponible
               try {
                 const partidosList = Object.keys(mrPorEstado[estado] || {});
                 const required = necesarios - robados;
                 let moved = false;

                 // Buscar estados candidatos ordenados por (preferir estados donde el partido ya tiene presencia)
                 const otherStates = Object.keys(mrPorEstado).filter(s => s !== estado);
                 otherStates.sort((a,b) => {
                   const pa = mrPorEstado[a][partido] || 0;
                   const pb = mrPorEstado[b][partido] || 0;
                   return (pb - pa); // prefer states where party has more presence
                 });

                 for (const s of otherStates) {
                   // calcular límite para el estado candidato
                   let maxForState;
                   if (this.selectedChamber === 'senadores') {
                     if (distritosPorEstado && distritosPorEstado[s]) {
                       maxForState = distritosPorEstado[s];
                     } else {
                       const mrInput = document.getElementById('input-mr');
                       let totalMR = mrInput ? parseInt(mrInput.value) : 64;
                       if (isNaN(totalMR)) totalMR = 64;
                       maxForState = Math.floor(totalMR / 32);
                       if (maxForState < 1) maxForState = 2;
                     }
                   } else {
                     if (distritosPorEstado && distritosPorEstado[s]) {
                       maxForState = distritosPorEstado[s];
                     } else {
                       maxForState = 100;
                     }
                   }

                   const ocupacionS = Object.values(mrPorEstado[s] || {}).reduce((sum, v) => sum + (v || 0), 0);
                   const espacioS = maxForState - ocupacionS;
                   if (espacioS <= 0) continue;

                   // Cantidad que podemos asignar en este estado
                   const asignar = Math.min(espacioS, required);
                   mrPorEstado[s][partido] = (mrPorEstado[s][partido] || 0) + asignar;
                   console.log(`[STATES TABLE] 🔁 Movimiento alternativo: Asignando +${asignar} a ${partido} en estado ${s} (porque ${estado} está lleno)`);
                   moved = true;
                   // Reducir required y seguir si aún queda
                   required -= asignar;
                   if (required <= 0) break;
                 }

                 if (moved) {
                   // Si movimos al menos parte, continuar (no retornar)
                   console.log('[STATES TABLE] ✅ Incremento aplicado en otro(s) estado(s)');
                 } else {
                   // Ningún estado candidato con capacidad: caer al comportamiento anterior (robar globalmente)
                   const robadosGlobal = this.takeFromGlobalPool(necesarios - robados, partido, mrPorEstado);
                   if (robadosGlobal < (necesarios - robados)) {
                     console.warn(`[STATES TABLE] ⚠️ Límite global alcanzado (${globalLimit}). No hay de donde robar.`);
                     return;
                   }
                 }
               } catch (e) {
                 console.warn('[STATES TABLE] ⚠️ Error en movimiento alternativo entre estados:', e);
                 // Fallback: intentar robar globalmente como antes
                 const robadosGlobal2 = this.takeFromGlobalPool(necesarios - robados, partido, mrPorEstado);
                 if (robadosGlobal2 < (necesarios - robados)) {
                   console.warn(`[STATES TABLE] ⚠️ Límite global alcanzado (${globalLimit}). No hay de donde robar.`);
                   return;
                 }
               }
            }
            // Si robamos localmente, el balance neto global es 0. No necesitamos chequear global.
        } 
        
        // --- CASO 2: LÍMITE GLOBAL ---
        // El estado tiene espacio, pero el país quizás no.
        else {
            const espacioGlobal = globalLimit - ocupacionGlobal;
            
            if (espacioGlobal < delta) {
                 // Cabe en el estado, pero el país está lleno. Robar de cualquier lado (Global).
                 const necesarios = delta - espacioGlobal;
                 const robados = this.takeFromGlobalPool(necesarios, partido, mrPorEstado);
                 
                 if (robados < necesarios) {
                     console.warn(`[STATES TABLE] ⚠️ Límite global alcanzado (${globalLimit}). No hay de donde robar.`);
                     return;
                 }
            }
        }
        
        // Asignar
        mrPorEstado[estado][partido] = nuevoValor;

    } else {
      // Disminuir siempre se puede
      mrPorEstado[estado][partido] = nuevoValor;
    }

    console.log(`[STATES TABLE] 📊 ${partido} en ${estado}: ${valorActual} → ${mrPorEstado[estado][partido]}`);
    try {
      const totalGlobal = Object.values(mrPorEstado).reduce((acc, est) => acc + Object.values(est).reduce((s, v) => s + (Number(v) || 0), 0), 0);
      console.log('[STATES TABLE] 📌 adjustStateDistrict() - estado modificado:', estado, 'partido:', partido, 'nuevoValor:', mrPorEstado[estado][partido]);
      console.log('[STATES TABLE] 📌 adjustStateDistrict() - total MR global tras ajuste:', totalGlobal);
    } catch (e) {
      console.warn('[STATES TABLE] 📌 adjustStateDistrict() - error calculando totales para debug:', e);
    }

    this.updateStatesTable();
    const partidos = Object.keys(this.partidosData || {});
    this.updateMRSlidersFromStatesData(mrPorEstado, partidos);
    
    clearTimeout(this._stateAdjustTimeout);
    this._stateAdjustTimeout = setTimeout(() => {
      this.sendMRDistributionFromStates();
    }, 500);
  }
  
  // 🆕 Redistribuir distritos liberados entre otros partidos
  redistributeStateDistricts(estado, partidoExcluido, distritosLibres, mrPorEstado, totalDistritos) {
    const otrosPartidos = Object.keys(mrPorEstado[estado])
      .filter(p => p !== partidoExcluido && (mrPorEstado[estado][p] || 0) > 0);
    
    if (otrosPartidos.length === 0) return; // No hay a quien darle
    
    // OPCIONAL: Si queremos que redistribuya automáticamente. 
    // Por ahora, redistribuir proporcionalmente a quien ya tiene.
    // Pero ojo: No superar el totalDistritos. (Ya implícito porque solo redistribuimos lo liberado).
    
    // Verificar si realmente necesitamos redistribuir o podemos dejar vacante.
    // UX moderna: Dejar vacante da más control. Redistribuir confunde.
    // COMENTADO para dar control manual total (como sugiere el prompt "asignar libremente").
    /*
    const totalOtros = otrosPartidos.reduce((sum, p) => sum + (mrPorEstado[estado][p] || 0), 0);
    let distritosRestantes = distritosLibres;
    
    otrosPartidos.forEach((p, index) => {
      if (distritosRestantes === 0) return;
      // ... lógica de redistribución ...
    });
    */
  }
  
  // 🆕 Quitar distritos de otros partidos cuando uno aumenta
  takeFromOtherParties(estado, partidoBeneficiado, distritosNecesarios, mrPorEstado) {
    const otrosPartidos = Object.keys(mrPorEstado[estado])
      .filter(p => p !== partidoBeneficiado && (mrPorEstado[estado][p] || 0) > 0)
      .sort((a, b) => (mrPorEstado[estado][b] || 0) - (mrPorEstado[estado][a] || 0)); // Quitar al que más tiene primero
    
    let distritosRestantes = distritosNecesarios;
    let totalQuitado = 0;
    
    for (const p of otrosPartidos) {
      if (distritosRestantes === 0) break;
      
      const valorActual = mrPorEstado[estado][p] || 0;
      const aQuitar = Math.min(valorActual, distritosRestantes);
      
      mrPorEstado[estado][p] = valorActual - aQuitar;
      distritosRestantes -= aQuitar;
      totalQuitado += aQuitar;
      
      console.log(`[STATES TABLE]   🔻 Robando localmente a ${p} en ${estado}: -${aQuitar}`);
    }
    
    return totalQuitado;
  }

  // 🆕 Robar escaños del pool global (buscar partido con más escaños en cualquier estado)
  takeFromGlobalPool(cantidad, partidoBeneficiado, mrPorEstado) {
    if (cantidad <= 0) return 0;

    let robados = 0;
    const partidos = Object.keys(this.partidosData || {});

    // 1. Calcular riqueza nacional (total escaños MR por partido)
    const riqueza = {};
    partidos.forEach(p => riqueza[p] = 0);
    
    Object.values(mrPorEstado).forEach(estadoData => {
        Object.entries(estadoData).forEach(([p, count]) => {
            riqueza[p] = (riqueza[p] || 0) + count;
        });
    });

    // 2. Ordenar candidatos a víctimas (más ricos primero, excluyendo al beneficiado)
    const victimas = partidos
        .filter(p => p !== partidoBeneficiado && (riqueza[p] || 0) > 0)
        .sort((a, b) => riqueza[b] - riqueza[a]);

    // 3. Robar
    for (const victima of victimas) {
        if (robados >= cantidad) break;

        // Buscar estados donde la víctima tenga escaños
        // Prioridad: Estados donde tenga MÁS escaños (para no dejarlo en 0 si es posible)
        const estadosConVictima = Object.keys(mrPorEstado)
            .filter(e => (mrPorEstado[e][victima] || 0) > 0)
            .sort((a, b) => mrPorEstado[b][victima] - mrPorEstado[a][victima]);

        for (const estado of estadosConVictima) {
            if (robados >= cantidad) break;

            const disponible = mrPorEstado[estado][victima];
            if (disponible > 0) {
                mrPorEstado[estado][victima] -= 1;
                robados++;
                console.log(`[STATES TABLE]   🌍 Robando globalmente a ${victima} en ${estado} (-1)`);
            }
        }
    }

    return robados;
  }
  
  // 🆕 Leer distribución MR por estado desde la tabla HTML (Fuente de verdad visual)
  readMRDistributionFromTable() {
    // Intentar buscar en el documento global primero (coherencia con updateStatesTable)
    let container = document.getElementById('states-table-container');
    
    // Fallback: buscar dentro del componente si no está en global
    if (!container) {
      container = this.querySelector('.states-table-container');
    }
    
    if (!container) return null;
    
    const table = container.querySelector('table.states-table');
    if (!table) return null;
    
    const tbody = table.querySelector('tbody');
    if (!tbody) return null;
    
    // Leer encabezados (idx 0=Estado, idx 1=Total, idx 2+=Partidos)
    const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
    const partidos = headers.slice(2); 
    
    const rows = tbody.querySelectorAll('tr');
    const porEstado = {};
    
    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length === 0) return;
      
      const nombreEstado = cells[0].textContent.trim();
      const distribuciones = {};
      
      partidos.forEach((partido, idx) => {
        const cell = cells[idx + 2];
        if (cell) {
          const val = parseInt(cell.textContent.trim()) || 0;
          distribuciones[partido] = val;
        }
      });
      
      porEstado[nombreEstado] = distribuciones;
    });
    
    // Validar integridad mínima
    if (Object.keys(porEstado).length === 0) return null;

    // Debug: mostrar lo que se leyó desde la tabla
    try {
      const totalLeido = Object.values(porEstado).reduce((s, est) => s + Object.values(est).reduce((ss, v) => ss + (Number(v) || 0), 0), 0);
      console.log('[STATES TABLE] 🧾 readMRDistributionFromTable() - datos leídos desde la tabla:', porEstado);
      console.log('[STATES TABLE] 🧾 readMRDistributionFromTable() - total leido desde tabla:', totalLeido);
    } catch (e) {
      console.warn('[STATES TABLE] 🧾 readMRDistributionFromTable() - error al calcular total para debug:', e);
    }

    return porEstado;
  }

  // Normalizar nombre de estado (quita tildes, puntos y normaliza espacios/minúsculas)
  normalizeStateName(name) {
    if (!name) return '';
    try {
      let s = name.normalize('NFKD').replace(/\p{Diacritic}/gu, '');
      s = s.replace(/\./g, '').toLowerCase().trim().replace(/\s+/g, ' ');
      return s;
    } catch (e) {
      // Fallback simple
      return String(name).toLowerCase().trim();
    }
  }

  // Convierte un objeto {NOMBRE_ESTADO: {PARTIDO: count}} a {ID: {PARTIDO: count}}
  convertNamesToIds(mrPorEstado) {
    if (!mrPorEstado) return null;
    const NOMBRE_A_ID = {
      "aguascalientes": 1, "baja california": 2, "baja california sur": 3,
      "campeche": 4, "coahuila": 5, "colima": 6, "chiapas": 7, "chihuahua": 8,
      "ciudad de mexico": 9, "cdmx": 9, "durango": 10, "guanajuato": 11,
      "guerrero": 12, "hidalgo": 13, "jalisco": 14, "mexico": 15, "michoacan": 16,
      "morelos": 17, "nayarit": 18, "nuevo leon": 19, "oaxaca": 20,
      "puebla": 21, "queretaro": 22, "quintana roo": 23, "san luis potosi": 24,
      "sinaloa": 25, "sonora": 26, "tabasco": 27, "tamaulipas": 28,
      "tlaxcala": 29, "veracruz": 30, "yucatan": 31, "zacatecas": 32
    };

    const out = {};
    for (const [nombreEstado, partidos] of Object.entries(mrPorEstado)) {
      const key = this.normalizeStateName(nombreEstado);
      const id = NOMBRE_A_ID[key];
      if (id) {
        out[String(id)] = partidos;
      } else {
        // Si no se reconoce, intentar con la clave original en mayúsculas (backend puede mapear)
        out[nombreEstado] = partidos;
        console.warn('[MR CONVERT] Estado no reconocido, enviando nombre original como fallback:', nombreEstado, '→ normalizado:', key);
      }
    }
    return out;
  }

  // 🆕 Enviar distribución manual por estados al backend
  sendMRDistributionFromStates() {
    // 🔥 LEER DESDE HTML (Prioridad Máxima del Usuario)
    let mrPorEstado = this.readMRDistributionFromTable();
    
    if (!mrPorEstado) {
      console.warn('[STATES TABLE] ⚠️ No se pudo leer HTML, usando fallback de memoria');
      if (this.lastResult && this.lastResult.meta) {
        mrPorEstado = this.lastResult.meta.mr_por_estado;
      }
    }
    
    if (!mrPorEstado) {
      console.error('[STATES TABLE] ❌ No hay datos para enviar');
      return;
    }
    
    // Calcular totales para consumo local (sliders)
    const distribucion = {};
    const partidos = Object.keys(this.partidosData || {});
    // Usar el primer estado para obtener lista de partidos si la global falla
    const firstState = Object.values(mrPorEstado)[0];
    const partidosEnEstado = firstState ? Object.keys(firstState) : [];
    const partidosFinal = partidos.length > 0 ? partidos : partidosEnEstado;
    
    partidosFinal.forEach(partido => {
      let total = 0;
      Object.values(mrPorEstado).forEach(estadoData => {
        total += estadoData[partido] || 0;
      });
      distribucion[partido] = total;
    });
    
    
    // Convertir nombres de estado a IDs cuando sea posible y preparar body compatible
    const porEstadoIds = this.convertNamesToIds(mrPorEstado) || mrPorEstado;

    // Si por alguna razón el parseo desde la tabla devolviera todos 0 (bug intermitente),
    // intentar recuperar la distribución desde la memoria lastResult.meta (más fiable)
    const safeSumStates = (o) => {
      try {
        return Object.values(o).reduce((s, est) => {
          if (!est || typeof est !== 'object') return s;
          return s + Object.values(est).reduce((ss, v) => ss + (Number(v) || 0), 0);
        }, 0);
      } catch (e) { return 0; }
    };

    const totalFromTable = safeSumStates(porEstadoIds);
    if (totalFromTable === 0 && this.lastResult && this.lastResult.meta && this.lastResult.meta.mr_por_estado) {
      console.warn('[STATES TABLE] ⚠️ Distribución leída desde tabla suma 0. Intentando fallback a lastResult.meta.mr_por_estado');
      const fallback = this.convertNamesToIds(this.lastResult.meta.mr_por_estado) || this.lastResult.meta.mr_por_estado;
      const totalFallback = safeSumStates(fallback);
      if (totalFallback > 0) {
        console.info('[STATES TABLE] ✅ Fallback exitoso: usando mr_por_estado de lastResult.meta en lugar de la tabla');
        // Recompute distribucion from fallback
        const partidosFinal2 = partidosFinal;
        const distribucion2 = {};
        partidosFinal2.forEach(partido => {
          let total = 0;
          Object.values(fallback).forEach(estadoData => {
            total += estadoData[partido] || 0;
          });
          distribucion2[partido] = total;
        });

        // Reassign for subsequent logic
        Object.assign(distribucion, distribucion2);
        // Replace porEstadoIds with fallback
        for (const k of Object.keys(porEstadoIds)) delete porEstadoIds[k];
        Object.assign(porEstadoIds, fallback);
      } else {
        console.warn('[STATES TABLE] ❌ Fallback también suma 0: no hay datos válidos para enviar');
      }
    }

    // Asegurarse de que se envíen siempre los 32 estados (IDs "1".."32").
    // Si el usuario no editó algún estado, rellenar desde lastResult.meta.mr_por_estado si existe, o con ceros.
    try {
      const ALL_IDS = Array.from({ length: 32 }, (_, i) => String(i + 1));
      const fallbackFromMeta = (this.lastResult && this.lastResult.meta && this.lastResult.meta.mr_por_estado)
        ? (this.convertNamesToIds(this.lastResult.meta.mr_por_estado) || this.lastResult.meta.mr_por_estado)
        : null;

      const completePorEstado = {};
      ALL_IDS.forEach(id => {
        if (porEstadoIds && Object.prototype.hasOwnProperty.call(porEstadoIds, id) && porEstadoIds[id] && typeof porEstadoIds[id] === 'object') {
          completePorEstado[id] = porEstadoIds[id];
        } else if (fallbackFromMeta && Object.prototype.hasOwnProperty.call(fallbackFromMeta, id) && fallbackFromMeta[id]) {
          completePorEstado[id] = fallbackFromMeta[id];
        } else {
          // Crear objeto con todos los partidos en 0 para este estado
          const emptyState = {};
          partidosFinal.forEach(p => { emptyState[p] = 0; });
          completePorEstado[id] = emptyState;
        }
      });

      // Reassign porEstadoIds to a completed map
      for (const k of Object.keys(porEstadoIds || {})) if (!/^[0-9]+$/.test(k)) delete porEstadoIds[k];
      Object.assign(porEstadoIds, completePorEstado);
    } catch (e) {
      console.warn('[STATES TABLE] ⚠️ Error al completar 32 estados para envío:', e);
    }

    // Actualizar window.mrDistributionManual
    // ⚠️ REGLA DE ORO: Si enviamos por_estado (flechitas), distribucion (sliders) debe ser NULL o ignorada por el script
    const totalAsignado = Object.values(distribucion).reduce((sum, val) => sum + val, 0);
    window.mrDistributionManual = {
      activa: true,
      distribucion: null, // 🔥 NO ENVIAR TOTALES GLOBALES (Para que el backend respete las flechitas)
      por_estado: porEstadoIds, // estructura interna (objeto)
      // Enviar ambos campos serializados para compatibilidad con distintas versiones del backend
      mr_distritos_por_estado: JSON.stringify(porEstadoIds),
      mr_por_estado: JSON.stringify(porEstadoIds),
      total_asignado: totalAsignado
    };
    console.log('[STATES TABLE] 🔍 window.mrDistributionManual preparado:', window.mrDistributionManual);
    
    // Actualizar sliders globales (solo visualmente, sin disparar evento)
    this.mrDistributionData = distribucion;
    this.updateMRDistributionTotal();
    // Aplicar preview optimista al seat-chart y tabla (igual que sliders globales)
    try {
      if (this.lastResult && Array.isArray(this.lastResult.seat_chart)) {
        const lastSeatChart = this.lastResult.seat_chart;
        const previewSeatChart = lastSeatChart.map(item => {
          const clone = Object.assign({}, item);
          const partyName = (item.party || item.Party || item.partido || '').toString();
          // usar totales por partido calculados arriba (distribucion)
          const mrNew = distribucion[partyName] ?? distribucion[partyName.toUpperCase()] ?? distribucion[partyName.toLowerCase()];
          if (typeof mrNew !== 'undefined') {
            if ('mr' in clone) clone.mr = mrNew;
            if ('mr_seats' in clone) clone.mr_seats = mrNew;
            const rpVal = clone.rp ?? clone.rp_seats ?? clone.RP ?? 0;
            clone.seats = Number(rpVal) + Number(mrNew || 0);
          }
          return clone;
        });

        const seatChartEl = document.querySelector('seat-chart');
        if (seatChartEl) {
          seatChartEl.setAttribute('data', JSON.stringify(previewSeatChart));
          try { seatChartEl.dispatchEvent(new CustomEvent('force-update', { detail: { optimistic: true, timestamp: Date.now() } })); } catch(e) {/* ignore */}
        }

        try {
          const resultadosTabla = this.transformSeatChartToTable(previewSeatChart);
          const config = { sistema: this.getActiveSystem ? this.getActiveSystem() : 'mixto', pm_activo: this.isPMActive ? this.isPMActive() : false };
          if (this.updateResultsTable) this.updateResultsTable(resultadosTabla, config);
        } catch (e) {
          console.debug('[STATES TABLE] ⚠️ No se pudo aplicar preview de tabla local:', e);
        }

        console.info('[STATES TABLE] 🔮 Aplicado preview local de seat-chart y tabla (optimista)');
      }
    } catch (e) {
      console.debug('[STATES TABLE] ⚠️ Error al generar preview local desde estados:', e);
    }

    // Recalcular sistema (backend) — mandar payload con por_estado
    if (typeof window.actualizarDesdeControles === 'function') {
      window.actualizarDesdeControles();
      console.log('[STATES TABLE] ✅ Sistema recalculado con distribución desde estados');
    } else {
      console.error('[STATES TABLE] ❌ window.actualizarDesdeControles no está disponible');
    }
  }
  
  updateMRSlidersFromStatesData(mrPorEstado, partidos) {
    console.log('[MR SLIDERS] 🎯 Actualizando sliders con datos de la tabla de estados...');
    console.log('[MR SLIDERS] 🔍 Cámara actual:', this.selectedChamber);
    console.log('[MR SLIDERS] 🔍 Partidos recibidos:', partidos);
    console.log('[MR SLIDERS] 🔍 mrPorEstado keys:', mrPorEstado ? Object.keys(mrPorEstado).length + ' estados' : 'NO DISPONIBLE');
    
    if (!mrPorEstado || !partidos || partidos.length === 0) {
      console.warn('[MR SLIDERS] ⚠️ No hay datos suficientes para actualizar sliders');
      console.warn('[MR SLIDERS] 🔍 mrPorEstado:', !!mrPorEstado);
      console.warn('[MR SLIDERS] 🔍 partidos:', partidos);
      return;
    }
    
    // Calcular totales por partido
    const totalesPorPartido = {};
    partidos.forEach(partido => {
      let totalPartido = 0;
      Object.values(mrPorEstado).forEach(estadoData => {
        totalPartido += estadoData[partido] || 0;
      });
      totalesPorPartido[partido] = totalPartido;
    });
    
    console.log('[MR SLIDERS] 📊 Totales calculados:', totalesPorPartido);
    
    // Actualizar mrDistributionData con los valores del backend
    if (!this.mrDistributionData) {
      this.mrDistributionData = {};
    }
    
    // Solo actualizar si el toggle NO está activado (modo automático)
    const mrSwitch = this.querySelector('#mr-distribution-switch');
    const isManualMode = mrSwitch && mrSwitch.getAttribute('data-switch') === 'On';
    
    if (isManualMode) {
      console.log('[MR SLIDERS] ⚠️ Modo manual activado, NO se sobrescriben los valores del usuario');
      return;
    }
    
    console.log('[MR SLIDERS] ✅ Modo automático, actualizando sliders con valores del backend...');
    
    // Actualizar datos y UI de los sliders
    partidos.forEach(partido => {
      const partyName = partido.toLowerCase();
      const nuevoValor = totalesPorPartido[partido] || 0;
      
      // Actualizar datos
      this.mrDistributionData[partido] = nuevoValor;
      
      // Actualizar UI del slider
      const slider = document.getElementById(`mr-dist-${partyName}`);
      const valueBox = document.getElementById(`mr-dist-value-${partyName}`);
      
      if (slider) {
        slider.value = nuevoValor;
        console.log(`[MR SLIDERS] 🎚️ Slider ${partido}: ${nuevoValor}`);
      }
      
      if (valueBox) {
        valueBox.textContent = nuevoValor;
      }
    });
    
    // Actualizar total asignado
    this.updateMRDistributionTotal();
    
    console.log('[MR SLIDERS] ✅ Sliders actualizados con valores del backend');
  }
  
  generateStatesTableHTML(mrPorEstado, distritosPorEstado, partidos) {
    // 🆕 Determinar cámara actual para título dinámico
    const camaraActual = this.selectedChamber || 'diputados';
    const tituloTabla = camaraActual === 'senadores' 
      ? 'Senadores MR por Estado' 
      : 'Distritos MR por Estado';
    
    // 🆕 Verificar si el modo manual de distribución está activado
    const mrSwitch = this.querySelector('#mr-distribution-switch');
    const isManualMode = mrSwitch && mrSwitch.getAttribute('data-switch') === 'On';
    
    // Header
    let thead = '<thead><tr>';
    thead += '<th>Estado</th>';
    thead += '<th class="col-total-distritos">Total</th>';
    
    partidos.forEach(partido => {
      thead += `<th>${partido}</th>`;
    });
    
    thead += '</tr></thead>';
    
    // Body (ordenar estados alfabéticamente)
    const estados = Object.keys(mrPorEstado).sort();
    let tbody = '<tbody>';
    
    estados.forEach(estado => {
      tbody += '<tr>';
      
      // Nombre del estado
      tbody += `<td class="state-name-col">${estado}</td>`;
      
      // Total de distritos
      const totalDistritos = distritosPorEstado[estado] || 0;
      tbody += `<td class="col-total-distritos">${totalDistritos}</td>`;
      
      // Distritos por partido con controles de flechas
      partidos.forEach(partido => {
        const distritos = mrPorEstado[estado][partido] || 0;
        
        // 🆕 Si modo manual está activo, mostrar controles de flechas
        if (isManualMode) {
          tbody += `
            <td class="states-table-editable">
              <div class="states-table-controls">
                <div class="arrow-buttons">
                  <button class="state-arrow-btn state-arrow-up" 
                          data-estado="${estado}" 
                          data-partido="${partido}"
                          ${distritos >= totalDistritos ? 'disabled' : ''}
                          title="Aumentar">▲</button>
                  <button class="state-arrow-btn state-arrow-down" 
                          data-estado="${estado}" 
                          data-partido="${partido}"
                          ${distritos === 0 ? 'disabled' : ''}
                          title="Disminuir">▼</button>
                </div>
                <span class="state-value ${distritos === 0 ? 'zero-value' : ''}">${distritos}</span>
              </div>
            </td>`;
        } else {
          // Modo normal (sin controles)
          const cellClass = distritos === 0 ? 'empty-cell' : '';
          const cellValue = distritos === 0 ? '—' : distritos;
          tbody += `<td class="${cellClass}">${cellValue}</td>`;
        }
      });
      
      tbody += '</tr>';
    });
    
    tbody += '</tbody>';
    
    // Footer (totales)
    let tfoot = '<tfoot><tr>';
    tfoot += '<td><strong>TOTAL</strong></td>';
    
    // Total de distritos general
    const totalDistritosGeneral = Object.values(distritosPorEstado).reduce((sum, val) => sum + val, 0);
    tfoot += `<td class="col-total-distritos"><strong>${totalDistritosGeneral}</strong></td>`;
    
    // Totales por partido
    partidos.forEach(partido => {
      let totalPartido = 0;
      Object.values(mrPorEstado).forEach(estadoData => {
        totalPartido += estadoData[partido] || 0;
      });
      tfoot += `<td class="total-col"><strong>${totalPartido}</strong></td>`;
    });
    
    tfoot += '</tr></tfoot>';
    
    // Tabla completa
    return `
      <div class="states-table-wrapper">
        <div class="states-table-title">${tituloTabla}</div>
        <div class="states-table-container">
          <table class="states-table">
            ${thead}
            ${tbody}
            ${tfoot}
          </table>
        </div>
      </div>
    `;
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
  
  // 🆕 Calcular Mayoría Automáticamente (sin botón)
  async calcularMayoriaAutomatica() {
    console.log('[MAYORÍAS] 🔍 calcularMayoriaAutomatica() llamada');
    
    // Verificar que el toggle esté activo
    const mayoriasSwitch = document.getElementById('mayorias-switch');
    if (!mayoriasSwitch) {
      console.error('[MAYORÍAS] ❌ No se encontró el elemento mayorias-switch');
      return;
    }
    
    const isActive = mayoriasSwitch.classList.contains('active');
    console.log('[MAYORÍAS] Toggle activo:', isActive);
    
    if (!isActive) {
      console.log('[MAYORÍAS] ⏸ Toggle desactivado, no se calculará');
      return;
    }
    
    // Llamar a la función principal
    console.log('[MAYORÍAS] ✅ Toggle activo, llamando a calcularMayoriaForzada()');
    await this.calcularMayoriaForzada();
  }
  
  // 🆕 Calcular Mayoría Forzada
  async calcularMayoriaForzada() {
    console.log('[MAYORÍAS] 🎯 Calculando mayoría forzada...');
    
    // Obtener valores de los controles
    const tipoMayoria = document.querySelector('input[name="tipo-mayoria"]:checked')?.value || 'simple';
    const partidoSelect = document.getElementById('mayoria-partido-select');
    const partido = partidoSelect?.value;
    const activeChamber = this.querySelector('.master-toggle.active');
    const camara = activeChamber ? activeChamber.dataset.chamber : 'diputados';
    const yearSelect = document.getElementById('year-select');
    const anio = yearSelect ? parseInt(yearSelect.value) : 2024;
    const modelSelect = document.getElementById('model-select');
    const plan = modelSelect ? modelSelect.value : 'vigente';
    
    // 🆕 Obtener parámetros de configuración personalizada
    const magnitudSlider = document.getElementById('input-magnitud');
    const mrSlider = document.getElementById('input-mr');
    const rpSlider = document.getElementById('input-rp');
    const electoralRuleRadio = document.querySelector('input[name="electoral-rule"]:checked');
    const topesSwitch = document.getElementById('topes-switch');
    
    const escanosTotales = magnitudSlider ? parseInt(magnitudSlider.value) : 500;
    const mrSeats = mrSlider ? parseInt(mrSlider.value) : 300;
    const rpSeats = rpSlider ? parseInt(rpSlider.value) : 200;
    const sistema = electoralRuleRadio ? electoralRuleRadio.value : 'mixto';
    let aplicarTopes = topesSwitch ? topesSwitch.classList.contains('active') : true;  // ← CAMBIAR a 'let' en lugar de 'const'
    
    console.log('[MAYORÍAS] 📋 Parámetros:', { 
      partido, tipoMayoria, camara, anio, plan,
      escanosTotales, mrSeats, rpSeats, sistema, aplicarTopes
    });
    
    // Validar que se haya seleccionado un partido
    if (!partido) {
      console.log('[MAYORÍAS] ⏸ No hay partido seleccionado, esperando selección...');
      return;
    }
    
    // 🔍 AUTO-DESACTIVAR TOPES: Mayoría calificada para partido individual
    if (tipoMayoria === 'calificada' && aplicarTopes) {
      // Verificar si es un partido individual (no coalición)
      const esCoalicion = partido.includes('+') || partido.includes('_');
      
      if (!esCoalicion) {
        const umbralCalificada = Math.ceil(escanosTotales * 2 / 3);
        const topeMaximo = Math.floor(escanosTotales * 0.6);
        
        console.log('[MAYORÍAS] 🔍 Mayoría calificada detectada:', {
          partido,
          umbralCalificada,
          topeMaximo,
          requiereDesactivarTopes: umbralCalificada > topeMaximo
        });
        
        if (umbralCalificada > topeMaximo) {
          console.warn('[MAYORÍAS] 🔓 Desactivando topes automáticamente para permitir mayoría calificada');
          
          // Actualizar variable SIEMPRE
          aplicarTopes = false;
          console.log('[MAYORÍAS] 📋 Variable aplicarTopes actualizada a:', aplicarTopes);
          
          // Desactivar el toggle visualmente
          if (topesSwitch) {
            topesSwitch.classList.remove('active');
            topesSwitch.setAttribute('aria-checked', 'false');
            topesSwitch.dataset.switch = 'Off';
            console.log('[MAYORÍAS] ✅ Toggle de topes desactivado visualmente');
          }
          
          // Notificar al usuario
          if (window.notifications && window.notifications.isReady) {
            window.notifications.info(
              'Topes desactivados automáticamente',
              `Para permitir mayoría calificada de ${partido}, se desactivaron los topes constitucionales (la mayoría calificada requiere ${umbralCalificada} escaños, el tope permite máximo ${topeMaximo}).`,
              8000
            );
          }
        }
      }
    }
    
    try {
      // ✅ URL BASE SIN SLASH FINAL (según instrucciones)
      const API_URL = 'https://back-electoral.onrender.com';
      
      // Determinar endpoint según cámara (con UNDERSCORES)
      // ✅ DIPUTADOS: /calcular/mayoria_forzada (SIN sufijo _diputados)
      // ✅ SENADO: /calcular/mayoria_forzada_senado (CON sufijo _senado)
      const endpoint = camara === 'senadores' || camara === 'senado' 
        ? 'calcular/mayoria_forzada_senado' 
        : 'calcular/mayoria_forzada';  // ⬅️ CORREGIDO: sin _diputados
      
      // Construir URL con parámetros (GET)
      // ✅ Incluir 'anio' en AMBOS endpoints (diputados y senado)
      console.log('[MAYORÍAS] 🔧 Construyendo parámetros - aplicarTopes final:', aplicarTopes);
      
      // 🆕 Determinar si es coalición o partido individual
      const esCoalicion = partido.includes('+');
      
      const params = new URLSearchParams({
        partido: partido,
        tipo_mayoria: tipoMayoria,  // ✅ Con UNDERSCORE
        plan: plan,
        aplicar_topes: aplicarTopes.toString(),  // ← Debe usar el valor modificado
        anio: anio.toString(),  // ✅ AGREGADO para ambos endpoints
        solo_partido: (!esCoalicion).toString()  // 🆕 TRUE si es partido individual, FALSE si es coalición
      });
      
      console.log('[MAYORÍAS] 🎯 Tipo de selección:', {
        partidoSeleccionado: partido,
        esCoalicion: esCoalicion,
        soloPartido: !esCoalicion
      });
      
      // 🆕 Agregar parámetros de configuración personalizada
      // Estos son necesarios para que el backend pueda recalcular con el modelo personalizado
      if (plan === 'personalizado' || !['vigente', 'reforma_2024'].includes(plan)) {
        params.append('escanos_totales', escanosTotales.toString());
        params.append('mr_seats', mrSeats.toString());
        params.append('rp_seats', rpSeats.toString());
        params.append('sistema', sistema);
        
        console.log('[MAYORÍAS] 🔧 Plan personalizado detectado, enviando configuración:', {
          escanos_totales: escanosTotales,
          mr_seats: mrSeats,
          rp_seats: rpSeats,
          sistema: sistema
        });
      }
      
      const url = `${API_URL}/${endpoint}?${params}`;
      console.log('[MAYORÍAS] 📡 URL completa:', url);
      console.log('[MAYORÍAS] 🔍 Endpoint:', endpoint);
      console.log('[MAYORÍAS] 🔍 Parámetros:', Object.fromEntries(params));
      
      // 🔔 Mostrar notificación de procesamiento
      if (window.notifications && window.notifications.isReady) {
        window.notifications.loading(
          'Calculando mayoría forzada...',
          'Esto puede tomar unos segundos',
          'calculating-majority'
        );
      }
      
      // Hacer petición al backend (GET)
      console.log('[MAYORÍAS] 🚀 Haciendo fetch...');
      const response = await fetch(url);
      
      console.log('[MAYORÍAS] 📬 Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[MAYORÍAS] ❌ Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('[MAYORÍAS] ✅ Data recibida:', data);
      
      // � DEBUG: Verificar campo solo_partido de la respuesta
      if (data.solo_partido !== undefined) {
        console.log('[MAYORÍAS] ✅ Backend confirmó solo_partido:', data.solo_partido);
      } else {
        console.warn('[MAYORÍAS] ⚠️ Backend NO devolvió campo solo_partido (puede ser versión antigua)');
      }
      
      // �🔄 Actualizar tabla y seat chart en lugar de solo mostrar resumen
      this.aplicarMayoriaForzadaAlSistema(data, tipoMayoria, partido, camara);
      
    } catch (error) {
      console.error('[MAYORÍAS] ❌ Error completo:', error);
      console.error('[MAYORÍAS] ❌ Error stack:', error.stack);
      
      // Mostrar error al usuario
      if (window.notifications && window.notifications.isReady) {
        window.notifications.error(
          'Error al calcular mayoría',
          error.message || 'No se pudo conectar con el servidor',
          5000
        );
      }
      
      // Ocultar resultado si estaba visible
      const resultadoDiv = document.getElementById('mayoria-resultado');
      if (resultadoDiv) {
        resultadoDiv.style.display = 'none';
      }
    }
  }
  
  // 🆕 Aplicar Mayoría Forzada al Sistema (actualiza tabla y seat chart)
  aplicarMayoriaForzadaAlSistema(data, tipoMayoria, partido, camara) {
    console.log('[MAYORÍAS] 🔄 Aplicando mayoría forzada al sistema...', { data, partido, camara });
    
    // Extraer datos según cámara
    const escanosNecesarios = data.senadores_necesarios || data.diputados_necesarios || data.escanos_necesarios || 0;
    const escanosObtenidos = data.senadores_obtenidos || data.diputados_obtenidos || data.escanos_obtenidos || 0;
    const mrAsignados = data.mr_asignados || data.mr_senadores || 0;
    const rpAsignados = data.rp_asignados || data.rp_senadores || 0;
    const pmAsignados = data.pm_senadores || 0;
    
    // Guardar datos en window para que script.js los use
    window.mayoriaForzadaData = {
      activa: true,
      partido: partido,
      tipo: tipoMayoria,
      camara: camara,
      escanos_necesarios: escanosNecesarios,
      escanos_obtenidos: escanosObtenidos,
      mr_asignados: mrAsignados,
      rp_asignados: rpAsignados,
      pm_asignados: pmAsignados,
      viable: data.viable !== false,
      votos_porcentaje: data.votos_porcentaje || 0,
      territorios_ganados: data.estados_ganados || data.distritos_ganados || 0,
      data_completa: data
    };
    
    console.log('[MAYORÍAS] 💾 Datos guardados en window.mayoriaForzadaData');
    
    // 🗺️ GUARDAR DATOS DE DISTRIBUCIÓN POR ESTADO para la tabla de distritos
    const mrPorEstado = data.mr_por_estado || data.mr_distritos_por_estado;
    
    if (mrPorEstado) {
      console.log('[MAYORÍAS] 📊 Guardando distribución por estado para tabla de distritos');
      
      // Inicializar lastResult si no existe
      if (!this.lastResult) {
        this.lastResult = { meta: {}, resultados: [] };
      }
      if (!this.lastResult.meta) {
        this.lastResult.meta = {};
      }
      
      // Guardar datos de distribución por estado
      if (data.mr_por_estado) {
        this.lastResult.meta.mr_por_estado = data.mr_por_estado;
        console.log('[MAYORÍAS] ✅ mr_por_estado guardado:', Object.keys(data.mr_por_estado).length, 'estados');
      }
      
      if (data.mr_distritos_por_estado) {
        this.lastResult.meta.mr_distritos_por_estado = data.mr_distritos_por_estado;
      }
      
      // Inferir o copiar distritos_por_estado
      if (data.distritos_por_estado) {
        this.lastResult.meta.distritos_por_estado = data.distritos_por_estado;
      } else if (data.mr_por_estado) {
        // Inferir desde mr_por_estado
        const distritosPorEstado = {};
        Object.keys(data.mr_por_estado).forEach(estado => {
          const total = Object.values(data.mr_por_estado[estado]).reduce((a, b) => a + b, 0);
          distritosPorEstado[estado] = total;
        });
        this.lastResult.meta.distritos_por_estado = distritosPorEstado;
        console.log('[MAYORÍAS] ✅ distritos_por_estado inferido');
      }
      
      // Marcar que viene de mayoría forzada
      this.lastResult.meta._mayoriaForzada = true;
    } else {
      console.warn('[MAYORÍAS] ⚠️ No se recibió mr_por_estado del backend');
    }
    
    // 🔥 Disparar evento personalizado para que script.js actualice todo
    console.log('[MAYORÍAS] ✅ Datos de mayoría forzada aplicados - disparando evento de actualización...');
    
    // Construir objeto de datos compatible con el formato que espera script.js
    const mayoriaData = {
      plan: data.plan || 'vigente',
      seat_chart: data.seat_chart,
      kpis: data.kpis || {},
      resultados: data.resultados || [],
      meta: this.lastResult.meta, // Usar el meta que acabamos de guardar
      mayorias: {
        activa: true,
        partido: data.partido,
        tipo: data.tipo_mayoria,
        data: data
      }
    };
    
    // Guardar también en this.lastResult para que esté disponible
    this.lastResult = { ...this.lastResult, ...mayoriaData };
    
    // Disparar evento con los datos
    const event = new CustomEvent('mayoria-forzada-aplicada', {
      detail: mayoriaData,
      bubbles: true
    });
    document.dispatchEvent(event);
    
    // Ocultar notificación y mostrar éxito
    setTimeout(() => {
      if (window.notifications && window.notifications.isReady) {
        window.notifications.hide('calculating-majority');
        window.notifications.success('Mayoría forzada aplicada', {
          subtitle: `${data.partido}: ${data.diputados_obtenidos || data.senadores_obtenidos} escaños`,
          duration: 3000
        });
      }
    }, 100);
  }
  
  // ⚠️ DEPRECATED: Función antigua que mostraba solo resumen
  // Se mantiene por compatibilidad pero ya no se usa
  mostrarResultadoMayoria(data, tipoMayoria, partido, camara) {
    console.log('[MAYORÍAS] ⚠️ mostrarResultadoMayoria() está deprecated, usar aplicarMayoriaForzadaAlSistema()');
    this.aplicarMayoriaForzadaAlSistema(data, tipoMayoria, partido, camara);
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
      
      // 🆕 Generar sliders de MR (deshabilitados por defecto)
      this.generateMRDistributionSliders();
      
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
        <label class="shock-label" for="shock-${partyName}">${partyLabel}</label>
        <input type="range" class="control-slider" id="shock-${partyName}" min="0" max="100" step="0.1" value="${porcentajeVigente}">
      `;
      
      container.appendChild(sliderGroup);
      
      console.log(`[DEBUG]  Slider creado: ${partyLabel} -> ${porcentajeVigente.toFixed(1)}% (min:0, max:100, value:${porcentajeVigente})`);
      
      // Agregar event listener al slider recién creado
      const slider = sliderGroup.querySelector(`#shock-${partyName}`);
      const valueBox = sliderGroup.querySelector(`#shock-value-${partyName}`);
      
      if (slider && valueBox) {
        console.log(`[DEBUG] 🎚️ Event listener añadido para slider de ${partyLabel}`);
        slider.addEventListener('input', (event) => {
          console.log(`[DEBUG] 🎚️ Slider de ${partyLabel} movido a: ${event.target.value}%`);
          const newValue = parseFloat(event.target.value);
          const partyNameUpper = partyName.toUpperCase();
          
          // Actualizar display inmediatamente
          valueBox.textContent = `${newValue.toFixed(1)}%`;
          
          // Actualizar datos internos
          this.partidosData[partyNameUpper].porcentajeActual = newValue;
          
          //  Solo activar redistribución si el modelo es "personalizado"
          const modelSelect = document.getElementById('model-select');
          const isPersonalizado = modelSelect && modelSelect.value === 'personalizado';
          
          console.log(`[DEBUG] 🔍 Validación modo: modelSelect=${!!modelSelect}, valor='${modelSelect?.value}', isPersonalizado=${isPersonalizado}`);
          
          if (!isPersonalizado) {
            console.log(`[DEBUG] ⚠️ Redistribución desactivada - Modelo: ${modelSelect ? modelSelect.value : 'desconocido'} - Slider revertido`);
            // Si no es personalizado, revertir al valor vigente
            slider.value = this.partidosData[partyNameUpper].porcentajeVigente;
            valueBox.textContent = `${this.partidosData[partyNameUpper].porcentajeVigente.toFixed(1)}%`;
            this.partidosData[partyNameUpper].porcentajeActual = this.partidosData[partyNameUpper].porcentajeVigente;
            return;
          }
          
          console.log(`[DEBUG] ✅ Modo personalizado activo - Procesando cambio de ${partyLabel}`);
          
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

  // 🆕 Método para generar sliders de distribución de distritos MR
  generateMRDistributionSliders() {
  console.info('[MR DISTRIBUTION] 🎯 Generando sliders de distribución de distritos MR...');
    
    const container = this.querySelector('#dynamic-mr-district-sliders');
    if (!container) {
      console.error('[MR DISTRIBUTION] ❌ Contenedor no encontrado');
      return;
    }
    
    // Limpiar contenedor
    container.innerHTML = '';
    
    // Obtener total de distritos MR disponibles
    const mrSlider = this.querySelector('#input-mr');
    const totalMR = mrSlider ? parseInt(mrSlider.value) : 300;
    
  console.debug(`[MR DISTRIBUTION] 📊 Total de distritos MR disponibles: ${totalMR}`);
    
    // Actualizar display
    const mrTotalDisplay = document.getElementById('mr-total-display');
    if (mrTotalDisplay) {
      mrTotalDisplay.textContent = totalMR;
    }
    
    // Obtener lista de partidos desde partidosData
    if (!this.partidosData || Object.keys(this.partidosData).length === 0) {
      console.warn('[MR DISTRIBUTION] ⚠️ No hay partidos disponibles, esperando datos...');
      
      // Mostrar mensaje de espera
      container.innerHTML = `
        <div style="padding:20px; text-align:center; color:#6B7280;">
          <p style="font-size:14px;">Cargando partidos...</p>
          <p style="font-size:12px; margin-top:4px;">Espera a que se carguen los datos del año seleccionado</p>
        </div>
      `;
      return;
    }
    
    // Inicializar datos de distribución MR
    if (!this.mrDistributionData) {
      this.mrDistributionData = {};
    }
    
    const partidos = Object.keys(this.partidosData);
  console.info(`[MR DISTRIBUTION] 📊 Partidos disponibles (${partidos.length}): ${partidos.join(', ')}`);
    
    // 🆕 Intentar obtener valores iniciales desde la tabla de estados si existe
    let valoresIniciales = {};
    if (this.lastResult && this.lastResult.meta && this.lastResult.meta.mr_por_estado) {
      const mrPorEstado = this.lastResult.meta.mr_por_estado;
  console.debug('[MR DISTRIBUTION] 📊 Datos de estados disponibles, calculando totales...');
      
      partidos.forEach(partido => {
        let totalPartido = 0;
        Object.values(mrPorEstado).forEach(estadoData => {
          totalPartido += estadoData[partido] || 0;
        });
        valoresIniciales[partido] = totalPartido;
      });
      
  console.info('[MR DISTRIBUTION] ✅ Valores iniciales desde backend:', valoresIniciales);
    }
    
    // Generar slider para cada partido
    partidos.forEach(partido => {
      const partyName = partido.toLowerCase();
      const partyLabel = partido;
      const partyColor = this.partidosData[partido]?.color || '#6B7280';
      
      // 🆕 Inicializar con valor del backend si existe, sino con valor guardado o 0
      if (typeof this.mrDistributionData[partido] === 'undefined') {
        this.mrDistributionData[partido] = valoresIniciales[partido] || 0;
      }
      
      // Crear HTML del slider - MISMA ESTRUCTURA QUE LOS SLIDERS DE VOTOS
      const sliderGroup = document.createElement('div');
      sliderGroup.className = 'shock-input-group';
      sliderGroup.innerHTML = `
        <div class="shock-value-box" id="mr-dist-value-${partyName}">${this.mrDistributionData[partido]}</div>
        <label class="shock-label" for="mr-dist-${partyName}">
          ${partyLabel}
        </label>
        <input type="range" class="control-slider" id="mr-dist-${partyName}" 
               min="0" max="${totalMR}" step="1" value="${this.mrDistributionData[partido]}">
      `;
      
      container.appendChild(sliderGroup);
      
  console.debug(`[MR DISTRIBUTION] ✅ Slider creado para ${partyLabel}: ${this.mrDistributionData[partido]}/${totalMR}`);
      
      // Agregar event listener
      const slider = sliderGroup.querySelector(`#mr-dist-${partyName}`);
      const valueBox = sliderGroup.querySelector(`#mr-dist-value-${partyName}`);
      
      if (slider && valueBox) {
        slider.addEventListener('input', (event) => {
          const newValue = parseInt(event.target.value);
          const oldValue = this.mrDistributionData[partido];
          const diferencia = newValue - oldValue;
          
          // Registrar cambio del slider (mensaje conciso)
          console.debug(`[MR DISTRIBUTION] 🎚️ ${partyLabel}: ${oldValue} → ${newValue} (Δ ${diferencia > 0 ? '+' : ''}${diferencia})`);
          
          // 🆕 REDISTRIBUCIÓN PROPORCIONAL (SUMA CERO)
          if (diferencia !== 0) {
            // Actualizar el partido modificado
            this.mrDistributionData[partido] = newValue;
            valueBox.textContent = newValue;
            
            // Otros partidos disponibles para redistribuir
            const otrosPartidos = partidos.filter(p => p !== partido);
            const totalOtros = otrosPartidos.reduce((sum, p) => sum + (this.mrDistributionData[p] || 0), 0);
            
            if (totalOtros > 0 && otrosPartidos.length > 0) {
              // Cantidad a redistribuir (con signo opuesto)
              const aRedistribuir = -diferencia;
              
              // Resumen de redistribución (no log por cada pequeño ajuste)
              console.debug(`[MR DISTRIBUTION] 📊 Redistribuyendo ${aRedistribuir} distritos entre ${otrosPartidos.length} partidos...`);
              
              // Calcular ajustes proporcionales basados en valores actuales
              let distritosRestantes = aRedistribuir;
              const ajustes = {};
              
              // Calcular proporción de cada partido
              otrosPartidos.forEach((otroPartido, index) => {
                const valorActual = this.mrDistributionData[otroPartido] || 0;
                
                if (index === otrosPartidos.length - 1) {
                  // Último partido recibe/pierde lo que queda para evitar errores de redondeo
                  ajustes[otroPartido] = distritosRestantes;
                } else {
                  // Calcular proporción basada en el total de otros partidos
                  const proporcion = valorActual / totalOtros;
                  const ajuste = Math.round(aRedistribuir * proporcion);
                  ajustes[otroPartido] = ajuste;
                  distritosRestantes -= ajuste;
                }
              });
              
              // Aplicar ajustes y acumular resumen de cambios
              const resumenAjustes = [];
              otrosPartidos.forEach(otroPartido => {
                const partyNameOther = otroPartido.toLowerCase();
                const valorActual = this.mrDistributionData[otroPartido] || 0;
                const ajuste = ajustes[otroPartido];
                const nuevoValor = Math.max(0, valorActual + ajuste);

                // Actualizar datos
                this.mrDistributionData[otroPartido] = nuevoValor;

                // Actualizar UI
                const otherSlider = document.getElementById(`mr-dist-${partyNameOther}`);
                const otherValueBox = document.getElementById(`mr-dist-value-${partyNameOther}`);

                if (otherSlider) otherSlider.value = nuevoValor;
                if (otherValueBox) otherValueBox.textContent = nuevoValor;

                resumenAjustes.push(`${otroPartido}: ${valorActual}→${nuevoValor} (${ajuste > 0 ? '+' : ''}${ajuste})`);
              });

              // Log resumido de los ajustes aplicados
              console.info('[MR DISTRIBUTION]   Ajustes aplicados:', resumenAjustes.join(', '));
              
              // Verificar suma total
              const totalFinal = Object.values(this.mrDistributionData).reduce((sum, val) => sum + val, 0);
              console.debug(`[MR DISTRIBUTION] ✅ Total final: ${totalFinal}/${totalMR}`);
            }
          }
          
          // Actualizar total asignado
          this.updateMRDistributionTotal();
          
          // 🆕 DEBOUNCE: Enviar al backend automáticamente después de 800ms sin cambios
          if (this.mrDistributionDebounceTimer) {
            // Evitar spam en consola al cancelar debounces frecuentes
            clearTimeout(this.mrDistributionDebounceTimer);
          }

          console.debug('[MR DISTRIBUTION] ⏱️ Debounce programado (800ms)');
          this.mrDistributionDebounceTimer = setTimeout(() => {
            console.info('[MR DISTRIBUTION] ⏱️ Debounce completado — enviando distribución al backend');
            this.sendMRDistribution();
          }, 800);
        });
        
        // Event listener para cuando termina de mover el slider (mouseup/touchend)
        slider.addEventListener('change', () => {
          // Enviar al backend solo cuando termine de ajustar
          console.info('[MR DISTRIBUTION] 🚀 Cambio finalizado — enviando distribución manual al backend');
          this.sendMRDistribution();
        });
      }
    });
    
    // Actualizar total inicial
    this.updateMRDistributionTotal();
    
  console.info('[MR DISTRIBUTION] ✅ Sliders generados correctamente');
    
    // Aplicar estado inicial (deshabilitados por defecto) - SIN setTimeout
    this.updateMRSlidersState();
  console.debug('[MR DISTRIBUTION] 🎯 Estado inicial aplicado inmediatamente');
  }
  
  // 🆕 Método para habilitar/deshabilitar sliders de MR según toggle
  updateMRSlidersState() {
    const container = this.querySelector('#dynamic-mr-district-sliders');
    if (!container) return;
    
    const mrSwitch = this.querySelector('#mr-distribution-switch');
    const isEnabled = mrSwitch && mrSwitch.getAttribute('data-switch') === 'On';
    
    const sliders = container.querySelectorAll('.control-slider');
    const valueBoxes = container.querySelectorAll('.shock-value-box');
    
  console.info(`[MR DISTRIBUTION] Actualizando estado de sliders: ${isEnabled ? 'HABILITADOS ✅' : 'DESHABILITADOS ❌'} (${sliders.length} sliders)`);
    
    if (isEnabled) {
      // Habilitar sliders
      sliders.forEach(slider => {
        slider.disabled = false;
      });
      
      valueBoxes.forEach(valueBox => {
        valueBox.style.opacity = '1';
      });
      
      // Habilitar contenedor completo (IGUAL QUE SLIDERS DE VOTOS)
      container.style.opacity = '1';
      container.style.pointerEvents = 'auto';
      
  console.info('[MR DISTRIBUTION] ✅ Modo manual activado - sliders habilitados para edición');
      
      // 🆕 Activar flag global para que se envíen los datos manuales
      if (window.mrDistributionManual) {
        window.mrDistributionManual.activa = true;
        console.log('[MR DISTRIBUTION] 🚀 Flag global activado para envío al backend');
      }
      
    } else {
      // Deshabilitar sliders (pero NO resetear valores - mantener los del backend)
      sliders.forEach(slider => {
        slider.disabled = true;
      });
      
      valueBoxes.forEach(valueBox => {
        valueBox.style.opacity = '0.5';
      });
      
      // Deshabilitar contenedor completo (IGUAL QUE SLIDERS DE VOTOS)
      container.style.opacity = '0.5';
      container.style.pointerEvents = 'none';
      
      console.log('[MR DISTRIBUTION] ⚠️ Modo automático activado - sliders deshabilitados, valores del backend se mantendrán');
      
      // 🆕 DESACTIVAR flag global para que NO se envíen datos manuales
      if (window.mrDistributionManual) {
        window.mrDistributionManual.activa = false;
        console.log('[MR DISTRIBUTION] 🔴 Flag global desactivado - usando valores del backend');
      }
      
      // 🆕 RESTAURAR VALORES DEL BACKEND si existen
      if (this.lastResult && this.lastResult.meta && this.lastResult.meta.mr_por_estado) {
        const mrPorEstado = this.lastResult.meta.mr_por_estado;
        const partidos = Object.keys(this.mrDistributionData || {});
        
        console.log('[MR DISTRIBUTION] 🔄 Restaurando valores del backend...');
        
        partidos.forEach(partido => {
          const partyName = partido.toLowerCase();
          let totalPartido = 0;
          
          Object.values(mrPorEstado).forEach(estadoData => {
            totalPartido += estadoData[partido] || 0;
          });
          
          // Actualizar datos
          this.mrDistributionData[partido] = totalPartido;
          
          // Actualizar UI
          const slider = document.getElementById(`mr-dist-${partyName}`);
          const valueBox = document.getElementById(`mr-dist-value-${partyName}`);
          
          if (slider) slider.value = totalPartido;
          if (valueBox) valueBox.textContent = totalPartido;
        });
        
        this.updateMRDistributionTotal();
        console.log('[MR DISTRIBUTION] ✅ Valores restaurados desde el backend');
      }
    }
  }
  
  // 🆕 Actualizar total de distritos MR asignados
  updateMRDistributionTotal() {
    if (!this.mrDistributionData) return;
    
    const total = Object.values(this.mrDistributionData).reduce((sum, val) => sum + val, 0);
    const mrAssignedDisplay = document.getElementById('mr-assigned-display');
    
    if (mrAssignedDisplay) {
      mrAssignedDisplay.textContent = total;
      
      // Cambiar color según si excede o no
      const mrSlider = this.querySelector('#input-mr');
      const totalMR = mrSlider ? parseInt(mrSlider.value) : 300;
      
      if (total > totalMR) {
        mrAssignedDisplay.style.color = '#EF4444'; // Rojo - excede
        console.log(`[MR DISTRIBUTION] ⚠️ EXCESO: ${total}/${totalMR} distritos`);
      } else if (total === totalMR) {
        mrAssignedDisplay.style.color = '#10B981'; // Verde - perfecto
        console.log(`[MR DISTRIBUTION] ✅ COMPLETO: ${total}/${totalMR} distritos`);
      } else {
        mrAssignedDisplay.style.color = '#F59E0B'; // Amarillo - falta asignar
        console.log(`[MR DISTRIBUTION] ⏳ PARCIAL: ${total}/${totalMR} distritos`);
      }
    }
  }
  
  // 🆕 Enviar distribución MR al backend
  async sendMRDistribution() {
    if (!this.mrDistributionData) {
      console.log('[MR DISTRIBUTION] ❌ No hay datos de distribución para enviar');
      return;
    }
    
    const total = Object.values(this.mrDistributionData).reduce((sum, val) => sum + val, 0);
    
    // Validar que el total no exceda el máximo permitido
    const mrSlider = this.querySelector('#input-mr');
    const totalMR = mrSlider ? parseInt(mrSlider.value) : 300;
    
    if (total > totalMR) {
      console.warn(`[MR DISTRIBUTION] ⚠️ Total excede el límite: ${total}/${totalMR}. Enviando de todos modos (Modo Flex).`);
      // Mostrar advertencia visual pero NO BLOQUEAR
      const warningBox = document.getElementById('mr-distribution-warning');
      if (warningBox) {
        warningBox.style.borderColor = '#EF4444';
        setTimeout(() => {
          warningBox.style.borderColor = '#F59E0B';
        }, 2000);
      }
      // return; // 🔥 REMOVED BLOCKING - Allow user override
    }
    
    console.log('[MR DISTRIBUTION] 📡 Enviando distribución al backend:', {
      distribucion: this.mrDistributionData,
      total_asignado: total,
      total_disponible: totalMR,
      porcentaje: `${((total/totalMR)*100).toFixed(1)}%`
    });
    
    // Al usar sliders globales, intencionalmente NO leemos ni enviamos el estado geográfico actual
    // para permitir que el backend regenere la distribución basada en los nuevos totales.

    // Guardar distribución en variable global para que script.js la envíe al backend
    window.mrDistributionManual = {
      activa: true,
      distribucion: { ...this.mrDistributionData },
      // ⚠️ IMPORTANTE: Al mover sliders globales, NO enviamos por_estado (dejamos null)
      // para que el backend pueda recalcular la geografía base usando los nuevos totales.
      // Si enviáramos el por_estado viejo, tendría prioridad y anularía el slider.
      por_estado: null,
      // Para compatibilidad con backends que esperan claves por estado, enviar también
      mr_distritos_por_estado: null,
      mr_por_estado: null,
      total_asignado: total,
      total_disponible: totalMR
    };
    
    console.log('[MR DISTRIBUTION] 🔍 window.mrDistributionManual guardado:', window.mrDistributionManual);
    console.log('[MR DISTRIBUTION] 🔍 ¿Existe window.actualizarDesdeControles?', typeof window.actualizarDesdeControles);
    
    // 🔧 Llamar a actualizarDesdeControles para recalcular TODO (con notificación)
    if (typeof window.actualizarDesdeControles === 'function') {
      console.log('[MR DISTRIBUTION] 🚀 Llamando a window.actualizarDesdeControles()...');
      // Sin setTimeout ni debounce - ejecutar inmediatamente
      // Primero aplicar una actualización optimista local del seat-chart y tabla
      try {
        if (this.lastResult && Array.isArray(this.lastResult.seat_chart)) {
          const lastSeatChart = this.lastResult.seat_chart;
          const previewSeatChart = lastSeatChart.map(item => {
            const clone = Object.assign({}, item);
            const partyName = (item.party || item.Party || '').toString();
            const mrNew = this.mrDistributionData[partyName] ?? this.mrDistributionData[partyName.toUpperCase()] ?? this.mrDistributionData[partyName.toLowerCase()];
            if (typeof mrNew !== 'undefined') {
              if ('mr' in clone) clone.mr = mrNew;
              if ('mr_seats' in clone) clone.mr_seats = mrNew;
              // Recalculate total seats if rp/rp_seats present
              const rpVal = clone.rp ?? clone.rp_seats ?? clone.RP ?? 0;
              clone.seats = Number(rpVal) + Number(mrNew || 0);
            }
            return clone;
          });

          // Actualizar seat-chart DOM para vista inmediata
          const seatChartEl = document.querySelector('seat-chart');
          if (seatChartEl) {
            seatChartEl.setAttribute('data', JSON.stringify(previewSeatChart));
            try { seatChartEl.dispatchEvent(new CustomEvent('force-update', { detail: { optimistic: true, timestamp: Date.now() } })); } catch(e){/* ignore */}
          }

          // Actualizar tabla de resultados usando los helpers locales
          try {
            const resultadosTabla = this.transformSeatChartToTable(previewSeatChart);
            const config = { sistema: this.getActiveSystem ? this.getActiveSystem() : 'mixto', pm_activo: this.isPMActive ? this.isPMActive() : false };
            if (this.updateResultsTable) this.updateResultsTable(resultadosTabla, config);
          } catch (e) {
            console.debug('[MR DISTRIBUTION] ⚠️ No se pudo aplicar preview de tabla local:', e);
          }

          console.info('[MR DISTRIBUTION] 🔮 Aplicado preview local de seat-chart y tabla (optimista)');
        }
      } catch (e) {
        console.debug('[MR DISTRIBUTION] ⚠️ Error al generar preview local:', e);
      }

      // Ejecutar la recálculación real (backend)
      window.actualizarDesdeControles();
      console.log('[MR DISTRIBUTION] ✅ Sistema recalculado con distribución manual');
    } else {
      console.error('[MR DISTRIBUTION] ❌ window.actualizarDesdeControles no está disponible');
      console.error('[MR DISTRIBUTION] 🔍 Funciones disponibles:', Object.keys(window).filter(k => k.includes('actualizar')));
    }
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