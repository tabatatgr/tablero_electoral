// IndicadorBox Web Component (standalone)

export class IndicadorBox extends HTMLElement {
  static get observedAttributes() {
    return ['etiqueta', 'valor'];
  }
  connectedCallback() { this.render(); }
  attributeChangedCallback() { this.render(); }
  render() {
    const etiqueta = this.getAttribute('etiqueta') || '';
    const valor = this.getAttribute('valor') || '';
    this.innerHTML = `
      <div class="etiqueta">${etiqueta}</div>
      <div class="valor">${valor}</div>
    `;
  }
}

customElements.define('indicador-box', IndicadorBox);
