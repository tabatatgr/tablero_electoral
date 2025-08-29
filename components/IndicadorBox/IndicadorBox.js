// IndicadorBox Web Component (standalone)

export class IndicadorBox extends HTMLElement {
  static get observedAttributes() {
    return ['etiqueta', 'valor', 'tooltip'];
  }
  connectedCallback() { this.render(); }
  attributeChangedCallback() { this.render(); }
  
  render() {
    const etiqueta = this.getAttribute('etiqueta') || '';
    const valor = this.getAttribute('valor') || '';
    const tooltip = this.getAttribute('tooltip') || '';
    
    this.innerHTML = `
      <div class="indicador-container">
        <div class="indicador-header">
          <div class="etiqueta">${etiqueta}</div>
          ${tooltip ? `
            <button class="info-button" type="button" aria-label="Más información">
              <svg width="4" height="16" viewBox="0 0 4 16" fill="none">
                <circle cx="2" cy="2" r="2" fill="currentColor"/>
                <circle cx="2" cy="8" r="2" fill="currentColor"/>
                <circle cx="2" cy="14" r="2" fill="currentColor"/>
              </svg>
            </button>
          ` : ''}
        </div>
        <div class="valor">${valor}</div>
      </div>
    `;
    
    // Agregar event listeners si hay tooltip
    if (tooltip) {
      const button = this.querySelector('.info-button');
      
      if (button) {
        button.addEventListener('click', (e) => {
          e.stopPropagation();
          
          // Cerrar otros popups abiertos
          document.querySelectorAll('.kpi-info-popup').forEach(p => {
            document.body.removeChild(p);
          });
          
          // Crear popup en el body
          const popup = document.createElement('div');
          popup.className = 'kpi-info-popup';
          popup.innerHTML = `
            <div class="kpi-info-popup-content">
              ${tooltip}
            </div>
          `;
          
          // Calcular posición
          const buttonRect = this.getBoundingClientRect();
          popup.style.top = `${buttonRect.bottom + 8}px`;
          popup.style.left = `${buttonRect.left + buttonRect.width / 2 - 150}px`;
          
          document.body.appendChild(popup);
          
          // Cerrar popup al hacer click fuera
          const closePopup = (event) => {
            if (!popup.contains(event.target)) {
              if (document.body.contains(popup)) {
                document.body.removeChild(popup);
              }
              document.removeEventListener('click', closePopup);
            }
          };
          
          setTimeout(() => {
            document.addEventListener('click', closePopup);
          }, 0);
        });
      }
    }
  }
}

customElements.define('indicador-box', IndicadorBox);
