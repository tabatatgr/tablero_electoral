// <seat-chart> Web Component
class SeatChart extends HTMLElement {
  static get observedAttributes() {
    return ['data']; // JSON string: [{party, seats, color, ...}]
  }

  connectedCallback() {
    console.log('[DEBUG] 🎯 SeatChart connectedCallback - elemento conectado al DOM');
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log('[DEBUG]  SeatChart attributeChangedCallback:', name, 'oldValue:', oldValue?.slice(0, 50), 'newValue:', newValue?.slice(0, 50));
    // Limpia el contenido antes de renderizar para forzar el refresco visual
    this.innerHTML = '';
    this.render();
  }

  render() {
    console.log('[DEBUG]  SeatChart render() iniciado');
    console.log('[DEBUG]  SeatChart this.getAttribute("data"):', this.getAttribute('data'));
    
    // Datos de ejemplo con partidos mexicanos reales y colores oficiales
    let data = [
      { party: 'MORENA', seats: 167, color: '#8B4513', percent: 33.4 },
      { party: 'PAN', seats: 111, color: '#0073B7', percent: 22.2 },
      { party: 'PRI', seats: 69, color: '#EE1C25', percent: 13.8 },
      { party: 'PVEM', seats: 44, color: '#00A651', percent: 8.8 },
      { party: 'PT', seats: 61, color: '#ED1C24', percent: 12.2 },
      { party: 'MC', seats: 28, color: '#FF8800', percent: 5.6 },
      { party: 'PRD', seats: 20, color: '#FFD700', percent: 4.0 },
    ];
    
    if (this.getAttribute('data')) {
      try {
        const rawData = this.getAttribute('data');
        console.log('[DEBUG]  SeatChart datos RAW completos:', rawData);
        
        const parsedData = JSON.parse(rawData);
        console.log('[DEBUG]  SeatChart datos parseados:', parsedData);
        console.log('[DEBUG]  SeatChart tipo de datos:', typeof parsedData, Array.isArray(parsedData));
        
        if (Array.isArray(parsedData)) {
          console.log('[DEBUG]  SeatChart número de partidos:', parsedData.length);
          parsedData.forEach((partido, index) => {
            console.log(`[DEBUG]  SeatChart partido ${index}:`, {
              party: partido.party,
              seats: partido.seats,
              color: partido.color,
              percent: partido.percent
            });
          });
        }
        
        data = parsedData;
      } catch (e) {
        console.error('[DEBUG]  SeatChart error parseando datos:', e);
        console.error('[DEBUG]  SeatChart datos que causaron error:', this.getAttribute('data'));
      }
    } else {
      console.log('[DEBUG]  SeatChart usando datos de ejemplo (no hay atributo data)');
    }
    
    const total = data.reduce((sum, p) => sum + p.seats, 0);
    console.log('[DEBUG]  SeatChart TOTAL ESCAÑOS CALCULADO:', total, 'partidos:', data.length);
    
    // Log individual de cada partido para verificar escaños
    data.forEach((partido, index) => {
      console.log(`[DEBUG]  SeatChart verificación partido ${index}: ${partido.party} = ${partido.seats} escaños`);
    });
    
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
    
    // 🔧 CALCULAR DIMENSIONES DINÁMICAS
    const baseRadius = 130;
    const maxRadius = baseRadius + (rows - 1) * (seatRadius * 2 + seatGap + 6);
    const svgWidth = (maxRadius + 50) * 2; // Margen extra a los lados
    const svgHeight = maxRadius + 100; // Margen extra arriba y abajo
    const centerX = svgWidth / 2;
    const centerY = maxRadius + 50; // Posición del centro del hemiciclo
    
    console.log(`[DEBUG] 📐 SeatChart dimensiones: ${rows} filas, radio máximo: ${maxRadius}, SVG: ${svgWidth}x${svgHeight}`);
    
    for (let row = 0; row < rows; row++) {
      const seats = seatsPerRow[row];
      const radius = baseRadius + row * (seatRadius * 2 + seatGap + 6);
      for (let i = 0; i < seats; i++) {
        const angle = Math.PI * (i / (seats - 1)); // Cambiar para que vaya de 0 a π (boca hacia abajo)
        const x = centerX + radius * Math.cos(angle); // Centrado dinámicamente
        const y = centerY - radius * Math.sin(angle); // Posición vertical dinámica
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
        <div class="seat-chart-svg" style="display: flex; align-items: center; justify-content: center;">
          <svg viewBox="0 0 ${svgWidth} ${svgHeight}" aria-label="Distribución de escaños" style="width: 100%; height: auto; display: block;">
            ${seatElements.join('')}
          </svg>
        </div>
        <div class="seat-chart-legend">
          ${legend}
        </div>
      </div>
    `;
    console.log('[DEBUG]  SeatChart render() completado, innerHTML establecido');
  }
}
customElements.define('seat-chart', SeatChart);
