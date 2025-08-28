// <seat-chart> Web Component
class SeatChart extends HTMLElement {
  static get observedAttributes() {
    return ['data']; // JSON string: [{party, seats, color, ...}]
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    // Limpia el contenido antes de renderizar para forzar el refresco visual
    this.innerHTML = '';
    this.render();
  }

  render() {
    // Example data fallback
    let data = [
      { party: 'Partido Azul', seats: 50, color: '#1976d2', percent: 39.1 },
      { party: 'Partido Rojo', seats: 40, color: '#d32f2f', percent: 31.3 },
      { party: 'Partido Verde', seats: 25, color: '#388e3c', percent: 19.5 },
      { party: 'Partido Amarillo', seats: 13, color: '#fbc02d', percent: 10.1 },
    ];
    if (this.getAttribute('data')) {
      try {
        data = JSON.parse(this.getAttribute('data'));
      } catch (e) {}
    }
    const total = data.reduce((sum, p) => sum + p.seats, 0);
    // Hemicycle SVG generation
    const seatRadius = 12;
    const seatGap = 6;
    const rows = 4;
    const seatsPerRow = [18, 22, 30, 58];
    let seatIndex = 0;
    let seatElements = [];
    let partySeatMap = [];
    data.forEach(p => {
      for (let i = 0; i < p.seats; i++) {
        partySeatMap.push(p.color);
      }
    });
    for (let row = 0; row < rows; row++) {
      const seats = seatsPerRow[row];
      const radius = 90 + row * (seatRadius * 2 + seatGap);
      for (let i = 0; i < seats; i++) {
        const angle = Math.PI * (1 - i / (seats - 1));
        const x = 240 + radius * Math.cos(angle); // Centered in wider SVG (480/2 = 240)
        const y = 150 + radius * Math.sin(angle); // Moved up more (from 170 to 150)
        const color = partySeatMap[seatIndex] || '#eee';
        seatElements.push(`<circle cx="${x}" cy="${y}" r="${seatRadius}" fill="${color}" stroke="#fff" stroke-width="2" />`);
        seatIndex++;
      }
    }
    // Legend
    let legend = `<div class="legend-title">Simbología de partidos</div>` + data.map(p => `
      <div class="legend-item">
        <span class="legend-color" style="background:${p.color}"></span>
        <span class="legend-label">${p.party}</span>
        <span class="legend-seats">${p.seats} escaños</span>
        <span class="legend-percent">(${p.percent}%)</span>
      </div>
    `).join('');
    this.innerHTML = `
      <div class="seat-chart-container" style="transform: translateY(-4px);">
        <div class="seat-chart-svg">
          <svg width="480" height="340" viewBox="0 0 480 340" aria-label="Distribución de escaños">
            ${seatElements.join('')}
          </svg>
        </div>
        <div class="seat-chart-legend">
          ${legend}
        </div>
      </div>
    `;
  }
}
customElements.define('seat-chart', SeatChart);
