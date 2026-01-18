# 🎯 Feature: Detección Visual de Mayorías en Tabla de Resultados

## 📋 Resumen

Se implementó un sistema visual para detectar y resaltar mayorías directamente en la tabla de resultados existente, respetando el diseño minimalista blanco.

---

## ✅ Funcionalidades Implementadas

### 1. **Columna de Coalición**
- Nueva columna que muestra si un partido está en coalición
- Ícono: ✓ (verde) para coaliciones, — (gris) para partidos individuales
- Alineada al centro

### 2. **Colorización de Celdas "Total"**
Las celdas de la columna "Total" se colorean automáticamente según mayorías:

| Tipo de Mayoría | Color | Condición |
|----------------|-------|-----------|
| **Mayoría Calificada** | Verde oscuro `#059669` | ≥ 2/3 de escaños (ej: ≥267 de 400) |
| **Mayoría Simple** | Verde claro `#10B981` | > 50% de escaños (ej: >200 de 400) |
| **Sin mayoría** | Blanco (sin cambio) | < 50% de escaños |

### 3. **Leyenda Minimalista**
Se agregó una leyenda debajo de la tabla con simbología clara:

```
🟢 Mayoría Calificada (≥267)  |  🟢 Mayoría Simple (>200)  |  ⚪ Sin mayoría
```

Los umbrales se calculan **dinámicamente** según el total de escaños:
- **Mayoría Simple**: `Math.floor(total / 2) + 1`
- **Mayoría Calificada**: `Math.ceil(total * (2/3))`

---

## 🎨 Diseño Visual

### **Celdas con Mayoría Calificada**
```css
background-color: #059669;  /* Verde oscuro */
color: #FFFFFF;             /* Texto blanco */
font-weight: 700;           /* Bold */
```

### **Celdas con Mayoría Simple**
```css
background-color: #10B981;  /* Verde medio */
color: #FFFFFF;             /* Texto blanco */
font-weight: 700;           /* Bold */
```

### **Tooltip Informativo**
Al hacer hover sobre una celda con mayoría, aparece tooltip:
- "Mayoría Calificada (270/267 necesarios)"
- "Mayoría Simple (210/201 necesarios)"

---

## 📊 Estructura de la Tabla

### **Antes:**
```
| Partido | MR | PM | RP | Total* |
```

### **Después:**
```
| Partido | MR | PM | RP | Coalición | Total* |
|---------|----|----|----|-----------| -------|
| MORENA  | 150| 30 | 90 |     ✓     | 270 ← Verde oscuro
| PAN     |  80| 10 | 30 |     —     | 120 ← Blanco
```

---

## 🔧 Archivos Modificados

### **1. ControlSidebar.js**

#### `getTableColumnsConfig()`
```javascript
const config = {
  partido: true,
  mr: false,
  pm: false,
  rp: false,
  coalicion: true,  // 🆕 Columna de coalición
  total: true
};
```

#### `generateTableHeader()`
```javascript
if (columnsConfig.coalicion) {
  html += '<th class="col-coalicion">Coalición</th>';
}
```

#### `generateTableBody()`
```javascript
// Calcular umbrales
const umbralSimple = Math.floor(totalEscanos / 2) + 1;
const umbralCalificada = Math.ceil(totalEscanos * (2/3));

// Determinar clase de mayoría
let mayoriaClass = '';
if (total >= umbralCalificada) {
  mayoriaClass = 'mayoria-calificada';
} else if (total >= umbralSimple) {
  mayoriaClass = 'mayoria-simple';
}

// Aplicar clase a celda Total
html += `<td class="col-total ${mayoriaClass}" title="${mayoriaTooltip}">...</td>`;
```

#### `generateTableFooter()`
```javascript
// Agregar celda vacía para coalición
if (columnsConfig.coalicion) {
  html += `<td class="col-coalicion">—</td>`;
}
```

#### `updateResultsTable()`
```javascript
// Generar leyenda de mayorías
const mayoriaLegend = `
  <div class="mayoria-legend">
    <div class="mayoria-legend-item">
      <div class="mayoria-legend-badge calificada"></div>
      <span>Mayoría Calificada (≥${umbralCalificada})</span>
    </div>
    ...
  </div>
`;
```

---

### **2. ResultsTable.css**

#### Estilos para celdas con mayoría
```css
/* Mayoría Calificada */
.results-table tbody td.mayoria-calificada {
  background-color: #059669 !important;
  color: #FFFFFF !important;
  font-weight: 700 !important;
}

/* Mayoría Simple */
.results-table tbody td.mayoria-simple {
  background-color: #10B981 !important;
  color: #FFFFFF !important;
  font-weight: 700 !important;
}
```

#### Estilos para columna de coalición
```css
.results-table th.col-coalicion,
.results-table td.col-coalicion {
  text-align: center !important;
  font-weight: 500;
}
```

#### Estilos para leyenda
```css
.mayoria-legend {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 12px 0;
  margin-top: 12px;
  font-size: 12px;
  color: #6B7280;
  border-top: 1px solid #F3F4F6;
}

.mayoria-legend-badge {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.mayoria-legend-badge.calificada {
  background-color: #059669;
}

.mayoria-legend-badge.simple {
  background-color: #10B981;
}
```

---

## 🧪 Casos de Prueba

### **Caso 1: Mayoría Calificada en Diputados (400 escaños)**
```
Total: 400
Umbral simple: 201
Umbral calificado: 267

MORENA tiene 270 escaños
→ Celda Total verde oscuro (#059669)
→ Tooltip: "Mayoría Calificada (270/267 necesarios)"
```

### **Caso 2: Mayoría Simple en Senado (128 escaños)**
```
Total: 128
Umbral simple: 65
Umbral calificado: 86

MORENA tiene 70 escaños
→ Celda Total verde claro (#10B981)
→ Tooltip: "Mayoría Simple (70/65 necesarios)"
```

### **Caso 3: Sin mayoría**
```
Total: 400
Umbral simple: 201

MORENA tiene 180 escaños
→ Celda Total blanca (sin cambio)
→ Sin tooltip especial
```

### **Caso 4: Coalición alcanza mayoría**
```
MORENA+PT+PVEM = 270 escaños (coalición)
→ Columna "Coalición" muestra ✓ en verde
→ Celda Total verde oscuro
```

---

## 📱 Responsive

La leyenda y columnas se adaptan a pantallas pequeñas:
- En mobile, la leyenda se apila verticalmente
- Columna de coalición se oculta primero en pantallas muy pequeñas

---

## 🔮 Futuras Mejoras (Opcional)

1. **Animación de cambio de mayoría**: Highlight breve cuando un partido alcanza mayoría
2. **Comparación con coaliciones**: Detectar automáticamente si solo se alcanza con coalición
3. **Gráfico de barra de progreso**: Mostrar visualmente qué tan cerca está del umbral
4. **Exportar tabla con colores**: Mantener colores en CSV/PDF

---

## ✅ Estado

- [x] Columna de Coalición agregada
- [x] Colorización de celdas Total implementada
- [x] Cálculo dinámico de umbrales
- [x] Leyenda minimalista agregada
- [x] Estilos CSS integrados
- [x] Tooltips informativos
- [ ] Integración con datos de backend (requiere campo `es_coalicion`)

---

## 📞 Notas

- Los colores respetan la paleta minimalista del diseño existente
- La columna de coalición asume que el backend enviará un campo `es_coalicion: boolean`
- Si el backend no envía este campo, por defecto se muestra "—" (no coalición)
- Los umbrales se recalculan automáticamente si cambia el total de escaños

---

**Fecha de implementación:** 15 de enero de 2026  
**Desarrollador:** GitHub Copilot + Usuario
