# ✅ Porcentaje de Escaños Agregado a la Tabla

## Problema Identificado

El backend **NO** está enviando el desglose de MR/PM/RP. Solo envía:
```json
{
  "party": "MORENA",
  "seats": 247,
  "color": "#8B2231",
  "percent": 49.4,  // ← Este es % de VOTOS, no de escaños
  "votes": 24286412
}
```

**Resultado**: Todas las columnas MR/PM/RP salían en 0.

---

## Solución Implementada

### ✅ **Agregado Porcentaje de Escaños en Columna Total**

Ahora la tabla muestra:
- **Escaños totales** (número grande)
- **Porcentaje de escaños** (en gris, entre paréntesis)
- **Asterisco (*)** en el header "Total*"
- **Nota al pie**: "*Porcentaje de escaños"

---

## Cambios Realizados

### 1. **Header con Asterisco**

**Archivo**: `components/panel_control/ControlSidebar.js` (línea ~1713)

```javascript
// ANTES:
html += '<th class="col-total">Total</th>';

// AHORA:
html += '<th class="col-total">Total*</th>'; // ← Asterisco
```

---

### 2. **Body con Porcentaje Calculado**

**Archivo**: `components/panel_control/ControlSidebar.js` (líneas ~1721-1768)

```javascript
generateTableBody(resultados, columnsConfig) {
  let html = '<tbody>';
  
  // ✅ Calcular total de escaños para porcentajes
  const totalEscanos = resultados.reduce((sum, p) => sum + (p.total || 0), 0);
  
  const sorted = [...resultados].sort((a, b) => (b.total || 0) - (a.total || 0));
  
  sorted.forEach(partido => {
    // ... columnas MR/PM/RP ...
    
    // ✅ Columna Total con porcentaje
    const total = partido.total || 0;
    const percentEscanos = totalEscanos > 0 
      ? ((total / totalEscanos) * 100).toFixed(1) 
      : 0;
    
    html += `<td class="col-total">
      <strong>${total}</strong> 
      <span class="percent-escanos">(${percentEscanos}%)</span>
    </td>`;
  });
  
  html += '</tbody>';
  return html;
}
```

**Cálculo**:
- `totalEscanos = 500` (suma de todos los partidos)
- `percentEscanos = (247 / 500) * 100 = 49.4%`

---

### 3. **Footer con 100%**

**Archivo**: `components/panel_control/ControlSidebar.js` (líneas ~1801-1815)

```javascript
// ✅ Total General con 100%
const totalGeneral = resultados.reduce((sum, p) => sum + (p.total || 0), 0);
html += `<td class="col-total">
  <strong>${totalGeneral}</strong> 
  <span class="percent-escanos">(100%)</span>
</td>`;

html += '</tr></tfoot>';

// 🆕 NOTA AL PIE
html += `<tr class="nota-pie">
  <td colspan="10" style="...">
    *Porcentaje de escaños
  </td>
</tr></tfoot>`;
```

---

### 4. **Guardar Percent del Backend**

**Archivo**: `components/panel_control/ControlSidebar.js` (líneas ~1904-1917)

```javascript
transformSeatChartToTable(seatChart) {
  const transformed = seatChart.map(item => {
    const percent = item.percent || item.porcentaje || 0; // ← Guardar del backend
    
    return {
      partido: partidoNombre,
      mr: mr,
      pm: pm,
      rp: rp,
      total: total,
      percent: percent // ← Incluir (por si después se usa)
    };
  });
}
```

**Nota**: Actualmente NO usamos `item.percent` porque es % de **votos**, no de escaños. Calculamos el % de escaños dividiendo entre el total.

---

### 5. **CSS para Porcentaje en Gris**

**Archivo**: `components/results_table/ResultsTable.css` (líneas ~73-87)

```css
/* PORCENTAJE DE ESCAÑOS (en gris, entre paréntesis) */
.percent-escanos {
  color: #9CA3AF; /* Gris para notas */
  font-size: 13px;
  font-weight: 400;
  margin-left: 4px;
}

/* NOTA AL PIE */
.nota-pie td {
  padding: 8px 16px !important;
  font-size: 12px;
  color: #6B7280; /* Gris medio */
  text-align: left !important;
  border-top: 1px solid #E5E7EB;
  border-right: none !important;
  font-style: italic;
}
```

---

## Resultado Visual

### **Antes** (sin porcentaje):
```
┌───────────┬──────┐
│ Partido   │ Total│
├───────────┼──────┤
│ 🔴 MORENA │  247 │
│ 🟢 PVEM   │   76 │
│ 🔵 PAN    │   69 │
├───────────┼──────┤
│ TOTAL     │  500 │
└───────────┴──────┘
```

### **Ahora** (con porcentaje):
```
┌───────────┬────────────────┐
│ Partido   │ Total*         │
├───────────┼────────────────┤
│ 🔴 MORENA │ 247 (49.4%)    │ ← Gris
│ 🟢 PVEM   │  76 (15.2%)    │
│ 🔵 PAN    │  69 (13.8%)    │
│ 🔴 PT     │  50 (10.0%)    │
│ 🔴 PRI    │  33 (6.6%)     │
│ 🟠 MC     │  24 (4.8%)     │
│ 🟡 PRD    │   1 (0.2%)     │
├───────────┼────────────────┤
│ TOTAL     │ 500 (100%)     │
└───────────┴────────────────┘
*Porcentaje de escaños
```

---

## Detalles Técnicos

### **Formato del Porcentaje**:
- **`.toFixed(1)`** = 1 decimal (49.4%, 10.0%, 0.2%)
- **Color gris** (#9CA3AF) para que se vea como nota
- **Entre paréntesis** para separarlo visualmente
- **Margen izquierdo** de 4px para separarlo del número

### **Nota al Pie**:
- **`colspan="10"`** para que ocupe todas las columnas
- **Italic** y gris medio (#6B7280)
- **Tamaño pequeño** (12px)
- **Borde superior** para separarlo del total

---

## Pendiente: Backend

⚠️ **El backend debe enviar el desglose MR/PM/RP**:

```json
{
  "party": "MORENA",
  "seats": 247,
  "color": "#8B2231",
  "mr": 150,     // ← FALTA
  "pm": 30,      // ← FALTA
  "rp": 67,      // ← FALTA
  "votes": 24286412,
  "percent": 49.4
}
```

Cuando el backend envíe estos datos, las columnas MR/PM/RP se llenarán automáticamente.

---

## Testing Checklist

Para verificar:

- [ ] **Recarga la página (F5)**
- [ ] **Mueve un slider**
- [ ] **Verifica la tabla**:
  - [ ] Columna "Total*" con asterisco
  - [ ] Números con porcentaje en gris: "247 (49.4%)"
  - [ ] Footer con "500 (100%)"
  - [ ] Nota al pie: "*Porcentaje de escaños"
  - [ ] Porcentajes suman 100%

---

## Archivos Modificados

1. **`components/panel_control/ControlSidebar.js`**:
   - `generateTableHeader()` - Asterisco en "Total*"
   - `generateTableBody()` - Cálculo y display de porcentaje
   - `generateTableFooter()` - 100% y nota al pie
   - `transformSeatChartToTable()` - Guardar percent del backend

2. **`components/results_table/ResultsTable.css`**:
   - `.percent-escanos` - Estilo gris para porcentaje
   - `.nota-pie td` - Estilo para nota al pie

---

**¡Recarga la página para ver los porcentajes! 🎯**
