// IndicadorBox Web Component (standalone)

export class IndicadorBox extends HTMLElement {
  static get observedAttributes() {
    return ['etiqueta', 'valor', 'porcentaje', 'cantidad', 'promedio'];
  }
  connectedCallback() { this.render(); }
  attributeChangedCallback() { this.render(); }
  render() {
    const etiqueta = this.getAttribute('etiqueta') || '';
    const valor = this.getAttribute('valor') || '';
    const porcentaje = this.getAttribute('porcentaje') || '';
    const cantidad = this.getAttribute('cantidad') || '';
    const promedio = this.getAttribute('promedio') || '';
    this.innerHTML = `
      <div class="etiqueta">${etiqueta}</div>
      <div class="valor">${valor}</div>
      ${cantidad ? `<div class="cantidad">${cantidad}</div>` : ''}
      ${porcentaje ? `<div class="porcentaje">${porcentaje}</div>` : ''}
      ${promedio ? `<div class="promedio">${promedio}</div>` : ''}
    `;
  }
}

customElements.define('indicador-box', IndicadorBox);
