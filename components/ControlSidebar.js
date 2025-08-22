// ControlSidebar Web Component
class ControlSidebar extends HTMLElement {
  connectedCallback() {
    this.render();
    this.initializeSidebarControls();
  }

  render() {
    this.innerHTML = `
      <aside class="control-sidebar">
        <div class="sidebar-header">
          <h3 class="sidebar-title">Panel de Control</h3>
        </div>
        <div class="sidebar-content">
          <!-- Step 0: Configuración Maestra -->
          <div class="control-group master-controls" data-group="master">
            <button class="group-toggle" data-target="master">
              <span class="group-title">Configuración Base</span>
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
                    <span class="toggle-count">500</span>
                  </button>
                  <button class="master-toggle active" data-chamber="senadores" role="tab">
                    <span class="toggle-text">Senadores</span>
                    <span class="toggle-count">128</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <!-- Step 1: Shocks de Votación -->
          <div class="control-group" data-group="shocks">
            <button class="group-toggle" data-target="shocks">
              <span class="group-title">Shocks por partido (Δ porcentaje)</span>
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
                    <input type="range" class="shock-slider" id="shock-morena" min="-20" max="20" step="0.1" value="0">
                  </div>
                  <div class="shock-input-group">
                    <div class="shock-value-box" id="shock-value-pan">+0.0%</div>
                    <label class="shock-label" for="shock-pan">PAN</label>
                    <input type="range" class="shock-slider" id="shock-pan" min="-20" max="20" step="0.1" value="0">
                  </div>
                  <div class="shock-input-group">
                    <div class="shock-value-box" id="shock-value-pri">+0.0%</div>
                    <label class="shock-label" for="shock-pri">PRI</label>
                    <input type="range" class="shock-slider" id="shock-pri" min="-20" max="20" step="0.1" value="0">
                  </div>
                  <div class="shock-input-group">
                    <div class="shock-value-box" id="shock-value-pt">+0.0%</div>
                    <label class="shock-label" for="shock-pt">PT</label>
                    <input type="range" class="shock-slider" id="shock-pt" min="-20" max="20" step="0.1" value="0">
                  </div>
                  <div class="shock-input-group">
                    <div class="shock-value-box" id="shock-value-pvem">+0.0%</div>
                    <label class="shock-label" for="shock-pvem">PVEM</label>
                    <input type="range" class="shock-slider" id="shock-pvem" min="-20" max="20" step="0.1" value="0">
                  </div>
                  <div class="shock-input-group">
                    <div class="shock-value-box" id="shock-value-mc">+0.0%</div>
                    <label class="shock-label" for="shock-mc">MC</label>
                    <input type="range" class="shock-slider" id="shock-mc" min="-20" max="20" step="0.1" value="0">
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Step 2: Magnitud -->
          <div class="control-group" data-group="magnitude">
            <button class="group-toggle" data-target="magnitude">
              <span class="group-title">2. Total de Cámara</span>
              <svg class="chevron" width="12" height="12" viewBox="0 0 12 12">
                <path d="M4 2l4 4-4 4" stroke="currentColor" stroke-width="1.5" fill="none"/>
              </svg>
            </button>
            <div class="group-content expanded" id="group-magnitude">
              <div class="control-item">
                <label class="control-label">Total de escaños: <span id="input-magnitud-value">128</span></label>
                <input type="range" class="control-slider" id="input-magnitud" min="1" max="700" step="1" value="128">
              </div>
            </div>
          </div>
          <!-- Step 3: Umbral -->
          <div class="control-group" data-group="threshold">
            <button class="group-toggle" data-target="threshold">
              <span class="group-title">3. Configuración del Umbral</span>
              <svg class="chevron" width="12" height="12" viewBox="0 0 12 12">
                <path d="M4 2l4 4-4 4" stroke="currentColor" stroke-width="1.5" fill="none"/>
              </svg>
            </button>
            <div class="group-content expanded" id="group-threshold">
              <div class="control-item">
                <label class="control-label">¿Activar umbral?</label>
                <div class="toggle-switch">
                  <div class="switch active" id="threshold-switch" data-switch="On" role="switch" aria-checked="true">
                    <div class="switch-handle"></div>
                  </div>
                </div>
              </div>
              <div class="control-item">
                <div class="radio-options">
                  <div class="radio-option" data-state="On" id="radio-national">
                    <div class="radio-button">
                      <div class="radio-dot"></div>
                    </div>
                    <div class="radio-text">
                      <div class="radio-label">Nacional (%)</div>
                    </div>
                  </div>
                  <div class="radio-option" data-state="Off" id="radio-state">
                    <div class="radio-button"></div>
                    <div class="radio-text">
                      <div class="radio-label">Estatal (%)</div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="control-item">
                <div class="threshold-controls">
                  <div class="threshold-value-box" id="threshold-value-box">3.0%</div>
                  <label class="control-label">Porcentaje mínimo:</label>
                  <input type="range" class="control-slider threshold-slider" id="threshold-slider" min="0" max="20" step="0.1" value="3">
                </div>
              </div>
            </div>
          </div>
          <!-- Step 4: Cláusula de Sobrerrepresentación -->
          <div class="control-group deputy-only" data-group="overrepresentation" id="overrepresentation-group" style="display:none;">
            <button class="group-toggle" data-target="overrepresentation">
              <span class="group-title">4. Límite de Sobrerrepresentación</span>
              <svg class="chevron" width="12" height="12" viewBox="0 0 12 12">
                <path d="M4 2l4 4-4 4" stroke="currentColor" stroke-width="1.5" fill="none"/>
              </svg>
            </button>
            <div class="group-content expanded" id="group-overrepresentation">
              <div class="control-item">
                <div class="overrep-value-box" id="overrep-value-box">8.0%</div>
                <label class="control-label">Límite sobre % voto nacional:</label>
                <input type="range" class="control-slider overrep-slider" id="overrep-slider" min="0" max="20" step="0.1" value="8">
              </div>
            </div>
          </div>
          <!-- Step 4.1: Tope de Escaños por Partido -->
          <div class="control-group deputy-only" data-group="seat-cap" id="seat-cap-group" style="display:none;">
            <button class="group-toggle" data-target="seat-cap">
              <span class="group-title">4.1. Tope de escaños por partido</span>
              <svg class="chevron" width="12" height="12" viewBox="0 0 12 12">
                <path d="M4 2l4 4-4 4" stroke="currentColor" stroke-width="1.5" fill="none"/>
              </svg>
            </button>
            <div class="group-content expanded" id="group-seat-cap">
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
          <!-- Step 5: Coaliciones -->
          <div class="control-group" data-group="coalition">
            <button class="group-toggle" data-target="coalition">
              <span class="group-title">5. ¿Utilizar coaliciones para repartir escaños?</span>
              <svg class="chevron" width="12" height="12" viewBox="0 0 12 12">
                <path d="M4 2l4 4-4 4" stroke="currentColor" stroke-width="1.5" fill="none"/>
              </svg>
            </button>
            <div class="group-content expanded" id="group-coalition">
              <div class="control-item">
                <div class="toggle-switch">
                  <div class="switch active" id="coalition-switch" data-switch="On" role="switch" aria-checked="true">
                    <div class="switch-handle"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Step 6: Regla Electoral -->
          <div class="control-group" data-group="rules">
            <button class="group-toggle" data-target="rules">
              <span class="group-title">6. Tipo de Regla</span>
              <svg class="chevron" width="12" height="12" viewBox="0 0 12 12">
                <path d="M4 2l4 4-4 4" stroke="currentColor" stroke-width="1.5" fill="none"/>
              </svg>
            </button>
            <div class="group-content expanded" id="group-rules">
              <div class="control-item">
                <div class="radio-options">
                  <div class="radio-option" data-state="Off" id="radio-mr">
                    <div class="radio-button"></div>
                    <div class="radio-text">
                      <div class="radio-label">Mayoría Relativa</div>
                    </div>
                  </div>
                  <div class="radio-option" data-state="Off" id="radio-rp">
                    <div class="radio-button"></div>
                    <div class="radio-text">
                      <div class="radio-label">Representación Proporcional</div>
                    </div>
                  </div>
                  <div class="radio-option" data-state="On" id="radio-mixto">
                    <div class="radio-button">
                      <div class="radio-dot"></div>
                    </div>
                    <div class="radio-text">
                      <div class="radio-label">Mixto</div>
                      <div class="radio-sublabel">Mayoría Relativa + Representación Proporcional</div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="control-item mixto-inputs" id="mixto-inputs">
                <div class="dual-slider">
                  <div class="slider-group">
                    <label class="slider-label">MR <span id="input-mr-value">64</span></label>
                    <input type="range" class="control-slider" id="input-mr" min="0" max="700" step="1" value="64">
                  </div>
                  <div class="slider-group">
                    <label class="slider-label">RP <span id="input-rp-value">64</span></label>
                    <input type="range" class="control-slider" id="input-rp" min="0" max="700" step="1" value="64">
                  </div>
                </div>
                <div class="validation-message hidden" id="mixto-validation">
                  ⚠️ La suma de escaños debe ser igual al total de la cámara
                </div>
              </div>
            </div>
          </div>
          <!-- Step 6.1: Primera Minoría -->
          <div class="control-group" data-group="first-minority" id="first-minority-group" style="display:none;">
            <button class="group-toggle" data-target="first-minority">
              <span class="group-title">6.1. Primera Minoría</span>
              <svg class="chevron" width="12" height="12" viewBox="0 0 12 12">
                <path d="M4 2l4 4-4 4" stroke="currentColor" stroke-width="1.5" fill="none"/>
              </svg>
            </button>
            <div class="group-content expanded" id="group-first-minority">
              <div class="control-item">
                <label class="control-label">¿Activar primera minoría?</label>
                <div class="toggle-switch">
                  <div class="switch active" id="first-minority-switch" data-switch="On" role="switch" aria-checked="true">
                    <div class="switch-handle"></div>
                  </div>
                </div>
              </div>
              <div class="control-item">
                <label class="control-label">Escaños por Primera Minoría: <span id="input-first-minority-value">0</span></label>
                <input type="range" class="control-slider" id="input-first-minority" min="0" max="700" step="1" value="0">
              </div>
            </div>
          </div>
          <!-- Step 7: Método de Reparto -->
          <div class="control-group" data-group="method">
            <button class="group-toggle" data-target="method">
              <span class="group-title">7. Método de Asignación</span>
              <svg class="chevron" width="12" height="12" viewBox="0 0 12 12">
                <path d="M4 2l4 4-4 4" stroke="currentColor" stroke-width="1.5" fill="none"/>
              </svg>
            </button>
            <div class="group-content expanded" id="group-method">
              <div class="control-item">
                <label class="control-label">Cociente + restos:</label>
                <select class="control-select" id="quota-method">
                  <option value="hare" selected>Hare</option>
                  <option value="droop">Droop</option>
                </select>
              </div>
              <div class="control-item">
                <label class="control-label">Divisores:</label>
                <select class="control-select" id="divisor-method">
                  <option value="dhondt" selected>D'Hondt</option>
                  <option value="sainte-lague">Sainte-Laguë</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </aside>
    `;
  }

  initializeSidebarControls() {
    // Collapsible groups
    const groupToggles = this.querySelectorAll('.group-toggle');
    groupToggles.forEach((toggle) => {
      const targetId = toggle.dataset.target;
      const content = this.querySelector(`#group-${targetId}`);
      if (!content) return;
      content.classList.remove('expanded');
      toggle.classList.add('collapsed');
      toggle.classList.remove('expanded');
      const savedState = localStorage.getItem(`group-${targetId}-expanded`);
      if (savedState === 'true') {
        content.classList.add('expanded');
        toggle.classList.add('expanded');
        toggle.classList.remove('collapsed');
      }
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
    // Master controls (chamber, year, model)
    const chamberToggles = this.querySelectorAll('.master-toggle[data-chamber]');
    chamberToggles.forEach(toggle => {
      toggle.addEventListener('click', function() {
        chamberToggles.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        // Optionally: dispatch event to main app
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
    const shockSliders = this.querySelectorAll('.shock-slider');
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
    // Toggles (switches)
    const switches = this.querySelectorAll('.control-switch, .switch');
    switches.forEach(switchEl => {
      switchEl.addEventListener('click', function() {
        const isActive = switchEl.classList.toggle('active');
        switchEl.setAttribute('aria-checked', isActive ? 'true' : 'false');
        switchEl.dataset.switch = isActive ? 'On' : 'Off';
      });
    });
    // Radio buttons
    const radioOptions = this.querySelectorAll('.radio-option');
    radioOptions.forEach(option => {
      option.addEventListener('click', function() {
        const group = option.parentElement;
        if (!group) return;
        group.querySelectorAll('.radio-option').forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        // Add dot if not present
        if (!option.querySelector('.radio-dot')) {
          const dot = document.createElement('div');
          dot.className = 'radio-dot';
          option.appendChild(dot);
        }
      });
    });
    // Add more control initializations as needed...
  }
}

customElements.define('control-sidebar', ControlSidebar);
