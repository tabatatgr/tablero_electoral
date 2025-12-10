# 📊 Propuesta: Tabla Inteligente de Resultados por Partido

## 🎯 Objetivo

Crear una tabla de resultados que muestre desglose MR/PM/RP **solo cuando sea relevante** según el sistema electoral activo.

---

## 🧠 Lógica de Visualización

### Columnas dinámicas según sistema:

| Sistema Electoral | Columnas Visibles |
|-------------------|-------------------|
| **MR Puro** | Partido, Total |
| **RP Puro** | Partido, Total |
| **Mixto (sin PM)** | Partido, MR, RP, Total |
| **Mixto (con PM)** | Partido, MR, PM, RP, Total |
| **MR con PM** | Partido, MR, PM, Total |

---

## 🎨 Diseño Visual

### Ubicación
Debajo del `seat-chart`, antes del `main-content`:

```html
<seat-chart></seat-chart>

<!-- 🆕 Tabla de Resultados -->
<div class="results-table-container" id="results-table-container">
  <h3 class="results-table-title">Resultados por Partido</h3>
  <div class="results-table-wrapper">
    <table class="results-table" id="results-table">
      <!-- Contenido dinámico generado por JS -->
    </table>
  </div>
</div>

<div class="main-content">
  <!-- ... -->
</div>
```

### Estructura de la tabla

```html
<table class="results-table">
  <thead>
    <tr>
      <th class="col-partido">Partido</th>
      <th class="col-mr" data-system-column="mr">MR</th>
      <th class="col-pm" data-system-column="pm">PM</th>
      <th class="col-rp" data-system-column="rp">RP</th>
      <th class="col-total">Total</th>
    </tr>
  </thead>
  <tbody>
    <tr data-partido="MORENA">
      <td class="partido-cell">
        <div class="partido-color" style="background-color: #A5182E;"></div>
        <span class="partido-nombre">MORENA</span>
      </td>
      <td class="col-mr" data-system-column="mr">150</td>
      <td class="col-pm" data-system-column="pm">50</td>
      <td class="col-rp" data-system-column="rp">80</td>
      <td class="col-total"><strong>280</strong></td>
    </tr>
    <!-- ... más partidos ... -->
  </tbody>
  <tfoot>
    <tr class="totals-row">
      <td class="partido-cell"><strong>TOTAL</strong></td>
      <td class="col-mr" data-system-column="mr"><strong>300</strong></td>
      <td class="col-pm" data-system-column="pm"><strong>100</strong></td>
      <td class="col-rp" data-system-column="rp"><strong>200</strong></td>
      <td class="col-total"><strong>500</strong></td>
    </tr>
  </tfoot>
</table>
```

---

## 🎨 Estilos CSS

```css
/* ========================================
   TABLA DE RESULTADOS INTELIGENTE
   ======================================== */

.results-table-container {
  width: 100%;
  margin: 24px 0;
  padding: 20px;
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.results-table-title {
  font-size: 18px;
  font-weight: 600;
  color: #0F2027;
  margin-bottom: 16px;
  font-family: 'Noto Sans', sans-serif;
}

.results-table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.results-table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'Noto Sans', sans-serif;
  font-size: 14px;
}

/* HEADER */
.results-table thead th {
  background: #F3F4F6;
  color: #374151;
  font-weight: 600;
  text-align: left;
  padding: 12px 16px;
  border-bottom: 2px solid #E5E7EB;
  white-space: nowrap;
}

.results-table thead th.col-total {
  text-align: right;
  background: #EEF2FF;
  color: #4F46E5;
}

.results-table thead th.col-mr {
  background: #FEF3C7;
  color: #92400E;
}

.results-table thead th.col-pm {
  background: #F3E8FF;
  color: #6B21A8;
}

.results-table thead th.col-rp {
  background: #DBEAFE;
  color: #1E40AF;
}

/* BODY */
.results-table tbody tr {
  border-bottom: 1px solid #E5E7EB;
  transition: background-color 0.2s;
}

.results-table tbody tr:hover {
  background-color: #F9FAFB;
}

.results-table tbody td {
  padding: 12px 16px;
  color: #1F2937;
}

.results-table tbody td.col-mr,
.results-table tbody td.col-pm,
.results-table tbody td.col-rp,
.results-table tbody td.col-total {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.results-table tbody td.col-total {
  font-weight: 600;
  color: #4F46E5;
}

/* PARTIDO CELL */
.partido-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.partido-color {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  flex-shrink: 0;
}

.partido-nombre {
  font-weight: 500;
}

/* FOOTER (TOTALES) */
.results-table tfoot tr {
  background: #F9FAFB;
  border-top: 2px solid #D1D5DB;
}

.results-table tfoot td {
  padding: 12px 16px;
  font-weight: 600;
  color: #111827;
}

.results-table tfoot td.col-total {
  color: #4F46E5;
  font-size: 16px;
}

/* OCULTAR COLUMNAS SEGÚN SISTEMA */
.results-table th[data-system-column].hidden,
.results-table td[data-system-column].hidden {
  display: none;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .results-table-container {
    padding: 16px;
    margin: 16px 0;
  }
  
  .results-table {
    font-size: 13px;
  }
  
  .results-table thead th,
  .results-table tbody td,
  .results-table tfoot td {
    padding: 8px 12px;
  }
  
  .partido-color {
    width: 12px;
    height: 12px;
  }
}

@media (max-width: 480px) {
  .results-table {
    font-size: 12px;
  }
  
  .results-table thead th,
  .results-table tbody td,
  .results-table tfoot td {
    padding: 6px 8px;
  }
  
  .partido-cell {
    gap: 6px;
  }
}

/* ESTADOS ESPECIALES */
.results-table-container.loading {
  opacity: 0.6;
  pointer-events: none;
}

.results-table-container.empty {
  display: none;
}

/* ANIMACIÓN DE CARGA */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.results-table tbody tr {
  animation: fadeIn 0.3s ease-out;
}

.results-table tbody tr:nth-child(1) { animation-delay: 0.05s; }
.results-table tbody tr:nth-child(2) { animation-delay: 0.1s; }
.results-table tbody tr:nth-child(3) { animation-delay: 0.15s; }
.results-table tbody tr:nth-child(4) { animation-delay: 0.2s; }
.results-table tbody tr:nth-child(5) { animation-delay: 0.25s; }
```

---

## 💻 Lógica JavaScript

### Método principal: `updateResultsTable()`

```javascript
updateResultsTable(resultados, config = {}) {
  console.log('[DEBUG] 📊 Actualizando tabla de resultados:', resultados);
  
  const container = document.getElementById('results-table-container');
  const table = document.getElementById('results-table');
  
  if (!container || !table) {
    console.warn('[WARN] Contenedor o tabla de resultados no encontrado');
    return;
  }
  
  // Si no hay datos, ocultar tabla
  if (!resultados || resultados.length === 0) {
    container.classList.add('empty');
    return;
  }
  
  container.classList.remove('empty');
  
  // 1️⃣ DETERMINAR QUÉ COLUMNAS MOSTRAR
  const sistema = config.sistema || this.getActiveSystem();
  const pmActivo = config.pm_activo || this.isPMActive();
  
  const columnsConfig = this.getTableColumnsConfig(sistema, pmActivo);
  
  // 2️⃣ GENERAR HEADER
  const thead = this.generateTableHeader(columnsConfig);
  
  // 3️⃣ GENERAR BODY
  const tbody = this.generateTableBody(resultados, columnsConfig);
  
  // 4️⃣ GENERAR FOOTER (TOTALES)
  const tfoot = this.generateTableFooter(resultados, columnsConfig);
  
  // 5️⃣ ACTUALIZAR TABLA
  table.innerHTML = thead + tbody + tfoot;
  
  console.log('[DEBUG] ✅ Tabla actualizada con config:', columnsConfig);
}

// Determinar configuración de columnas según sistema
getTableColumnsConfig(sistema, pmActivo) {
  const config = {
    partido: true,  // Siempre visible
    mr: false,
    pm: false,
    rp: false,
    total: true     // Siempre visible
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
  
  html += '<th class="col-total">Total</th>';
  html += '</tr></thead>';
  
  return html;
}

// Generar filas de partidos
generateTableBody(resultados, columnsConfig) {
  let html = '<tbody>';
  
  // Ordenar por total de escaños (mayor a menor)
  const sorted = [...resultados].sort((a, b) => b.total - a.total);
  
  sorted.forEach(partido => {
    const color = this.getPartyColor(partido.partido);
    
    html += `<tr data-partido="${partido.partido}">`;
    
    // Columna Partido
    html += `
      <td class="partido-cell">
        <div class="partido-color" style="background-color: ${color};"></div>
        <span class="partido-nombre">${partido.partido}</span>
      </td>
    `;
    
    // Columna MR
    if (columnsConfig.mr) {
      const mrValue = partido.mr || 0;
      html += `<td class="col-mr" data-system-column="mr">${mrValue}</td>`;
    }
    
    // Columna PM
    if (columnsConfig.pm) {
      const pmValue = partido.pm || 0;
      html += `<td class="col-pm" data-system-column="pm">${pmValue}</td>`;
    }
    
    // Columna RP
    if (columnsConfig.rp) {
      const rpValue = partido.rp || 0;
      html += `<td class="col-rp" data-system-column="rp">${rpValue}</td>`;
    }
    
    // Columna Total
    html += `<td class="col-total"><strong>${partido.total || 0}</strong></td>`;
    
    html += '</tr>';
  });
  
  html += '</tbody>';
  return html;
}

// Generar footer con totales
generateTableFooter(resultados, columnsConfig) {
  let html = '<tfoot><tr class="totals-row">';
  
  html += '<td class="partido-cell"><strong>TOTAL</strong></td>';
  
  // Total MR
  if (columnsConfig.mr) {
    const totalMR = resultados.reduce((sum, p) => sum + (p.mr || 0), 0);
    html += `<td class="col-mr" data-system-column="mr"><strong>${totalMR}</strong></td>`;
  }
  
  // Total PM
  if (columnsConfig.pm) {
    const totalPM = resultados.reduce((sum, p) => sum + (p.pm || 0), 0);
    html += `<td class="col-pm" data-system-column="pm"><strong>${totalPM}</strong></td>`;
  }
  
  // Total RP
  if (columnsConfig.rp) {
    const totalRP = resultados.reduce((sum, p) => sum + (p.rp || 0), 0);
    html += `<td class="col-rp" data-system-column="rp"><strong>${totalRP}</strong></td>`;
  }
  
  // Total General
  const totalGeneral = resultados.reduce((sum, p) => sum + (p.total || 0), 0);
  html += `<td class="col-total"><strong>${totalGeneral}</strong></td>`;
  
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
  const colores = {
    'MORENA': '#A5182E',
    'PAN': '#003DA5',
    'PRI': '#E31921',
    'MC': '#FF6900',
    'PVEM': '#7FBF43',
    'PT': '#D71920',
    'PRD': '#FFD400',
    'PES': '#5E1D89',
    'RSP': '#00A19B',
    'FXM': '#8B4513'
  };
  
  return colores[partido] || '#6B7280';
}
```

---

## 🔗 Integración con VoteRedistribution

Actualizar `updateUIWithResults` en `ControlSidebar.js`:

```javascript
updateUIWithResults(result) {
  console.log('[DEBUG] ControlSidebar updateUIWithResults:', result);
  
  // ... código existente de KPIs y seat-chart ...
  
  // 🆕 ACTUALIZAR TABLA DE RESULTADOS
  if (result.resultados_detalle || result.seat_chart) {
    // Transformar seat_chart a formato de tabla si no viene resultados_detalle
    const resultadosTabla = result.resultados_detalle || this.transformSeatChartToTable(result.seat_chart);
    
    const config = {
      sistema: this.getActiveSystem(),
      pm_activo: this.isPMActive()
    };
    
    this.updateResultsTable(resultadosTabla, config);
  }
  
  // ... resto del código ...
}

// Transformar seat_chart a formato tabla
transformSeatChartToTable(seatChart) {
  if (!Array.isArray(seatChart)) return [];
  
  return seatChart.map(item => ({
    partido: item.partido,
    mr: item.mr || 0,
    pm: item.pm || 0,
    rp: item.rp || 0,
    total: item.escaños || item.total || 0
  }));
}
```

---

## 📱 Responsive

La tabla usa scroll horizontal en móviles:

- **Desktop**: Tabla completa visible
- **Tablet**: Scroll horizontal suave
- **Mobile**: Compresión de padding, scroll táctil optimizado

---

## 🧪 Casos de Prueba

### Test 1: Sistema Mixto sin PM
- Input: MR=300, RP=200, PM=Off
- Output: Columnas "Partido, MR, RP, Total"

### Test 2: Sistema Mixto con PM
- Input: MR=300, PM=100, RP=200
- Output: Columnas "Partido, MR, PM, RP, Total"

### Test 3: Sistema MR Puro
- Input: MR=300, RP=0
- Output: Columnas "Partido, Total" (MR implícito)

### Test 4: Sistema RP Puro
- Input: MR=0, RP=500
- Output: Columnas "Partido, Total" (RP implícito)

---

## 📝 Notas de Implementación

1. **Colores de partido**: Usar el mapa existente o ampliar según necesidades
2. **Orden**: Descendente por total de escaños
3. **Formato números**: Usar `tabular-nums` para alineación
4. **Animación**: Fade-in escalonado al cargar filas
5. **Accesibilidad**: Headers semánticos, contraste adecuado

---

## ✅ Checklist de Implementación

- [ ] Añadir HTML del contenedor en `index.html`
- [ ] Crear CSS en nuevo archivo `components/results-table/ResultsTable.css`
- [ ] Implementar métodos JS en `ControlSidebar.js`
- [ ] Conectar con `updateUIWithResults()`
- [ ] Probar con diferentes sistemas electorales
- [ ] Validar responsive en móvil
- [ ] Verificar totales calculados correctamente

---

**¿Quieres que implemente esto ahora o prefieres ajustar algo del diseño primero?**
