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
      { party: 'Partido Verde', seats: 25, color: '#1E9F00', percent: 19.5 },
      { party: 'Partido Amarillo', seats: 13, color: '#fbc02d', percent: 10.1 },
    ];
    if (this.getAttribute('data')) {
      try {
        data = JSON.parse(this.getAttribute('data'));
      } catch (e) {}
    }
    const total = data.reduce((sum, p) => sum + p.seats, 0);
    
    // Calcular distribución dinámica de escaños por fila según el total
    function calculateSeatsPerRow(totalSeats) {
      if (totalSeats <= 50) {
        // Para pocos escaños: 2 filas
        const row1 = Math.ceil(totalSeats * 0.4);
        const row2 = totalSeats - row1;
        return [row1, row2];
      } else if (totalSeats <= 150) {
        // Para escaños medianos: 3 filas
        const row1 = Math.ceil(totalSeats * 0.25);
        const row2 = Math.ceil(totalSeats * 0.35);
        const row3 = totalSeats - row1 - row2;
        return [row1, row2, row3];
      } else if (totalSeats <= 300) {
        // Para muchos escaños: 4 filas
        const row1 = Math.ceil(totalSeats * 0.15);
        const row2 = Math.ceil(totalSeats * 0.20);
        const row3 = Math.ceil(totalSeats * 0.25);
        const row4 = totalSeats - row1 - row2 - row3;
        return [row1, row2, row3, row4];
      } else {
        // Para muchísimos escaños: 5 filas
        const row1 = Math.ceil(totalSeats * 0.12);
        const row2 = Math.ceil(totalSeats * 0.16);
        const row3 = Math.ceil(totalSeats * 0.20);
        const row4 = Math.ceil(totalSeats * 0.24);
        const row5 = totalSeats - row1 - row2 - row3 - row4;
        return [row1, row2, row3, row4, row5];
      }
    }
    
    // Hemicycle SVG generation
    const seatRadius = 8; // Reducido de 10 para dar más espacio visual
    const seatGap = 8; // Aumentado de 5 para más separación
    const seatsPerRow = calculateSeatsPerRow(total);
    const rows = seatsPerRow.length;
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
      const radius = 130 + row * (seatRadius * 2 + seatGap + 6); // Aumentado radio base de 110 a 130
      for (let i = 0; i < seats; i++) {
        const angle = Math.PI * (i / (seats - 1)); // Cambiar para que vaya de 0 a π (boca hacia abajo)
        const x = 260 + radius * Math.cos(angle); // Centrado en viewBox más ancho (520/2 = 260)
        const y = 200 - radius * Math.sin(angle); // Ajustar posición vertical para mejor centrado
        const color = partySeatMap[seatIndex] || '#eee';
        seatElements.push(`<circle cx="${x}" cy="${y}" r="${seatRadius}" fill="${color}" stroke="#fff" stroke-width="2" />`);
        seatIndex++;
      }
    }
    // Legend
    let legend = `<div class="legend-title">Simbología</div>` + data.map(p => `
      <div class="legend-item">
        <div class="legend-left">
          <span class="legend-dot" style="background:${p.color}"></span>
          <span class="legend-name">${p.party}</span>
        </div>
        <div class="legend-right">
          ${p.seats} escaños (${p.percent}%)
        </div>
      </div>
    `).join('');
    this.innerHTML = `
      <div class="seat-chart-container">
        <div class="seat-chart-svg" style="display: flex; align-items: flex-start;">
          <svg viewBox="0 0 520 300" aria-label="Distribución de escaños" style="width: 100%; height: 100%; display: block; transform: translateY(70px);">
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
