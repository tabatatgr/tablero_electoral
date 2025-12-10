# 🔍 Instrucciones de Debugging - Tabla de Resultados

## Problema
La tabla no se ve después de mover sliders.

---

## Paso 1: Verificar Elementos del DOM

Copia y pega en la **consola del navegador** (F12 → Console):

```javascript
// 1️⃣ Verificar que existe el seat-chart
console.log('seat-chart:', document.querySelector('seat-chart'));

// 2️⃣ Verificar que existe el contenedor de la tabla
console.log('results-table-container:', document.getElementById('results-table-container'));

// 3️⃣ Verificar que existe el control-sidebar
console.log('control-sidebar:', document.querySelector('control-sidebar'));
```

**Resultado esperado**:
- ✅ Todos deben mostrar elementos HTML (no `null`)
- ❌ Si alguno es `null`, ese es el problema

---

## Paso 2: Verificar Último Response del Backend

```javascript
// 4️⃣ Verificar si hay datos del backend
const sidebar = document.querySelector('control-sidebar');
console.log('debugLastResponse:', sidebar?.debugLastResponse);
```

**Verificar**:
- ¿Existe `seat_chart` en el response?
- ¿Existe `resultados_detalle` en el response?
- ¿Qué formato tienen los datos?

---

## Paso 3: Verificar Método updateResultsTable

```javascript
// 5️⃣ Verificar que existe el método
const sidebar = document.querySelector('control-sidebar');
console.log('updateResultsTable existe:', typeof sidebar?.updateResultsTable);
```

**Resultado esperado**: `"function"`

---

## Paso 4: Inyectar Tabla Manualmente (Datos de Prueba)

Copia y pega **TODO ESTE BLOQUE** en la consola:

```javascript
// Función de prueba completa
(function testTablaResultados() {
  console.log('🧪 [TEST] Iniciando prueba de tabla de resultados...');
  
  const sidebar = document.querySelector('control-sidebar');
  
  if (!sidebar) {
    console.error('❌ No se encontró control-sidebar');
    return;
  }
  
  if (!sidebar.updateResultsTable) {
    console.error('❌ Método updateResultsTable no existe');
    return;
  }
  
  // Datos de prueba hardcodeados
  const datosPrueba = [
    { partido: 'MORENA', mr: 150, pm: 30, rp: 80, total: 260 },
    { partido: 'PAN', mr: 80, pm: 15, rp: 45, total: 140 },
    { partido: 'PRI', mr: 40, pm: 10, rp: 25, total: 75 },
    { partido: 'MC', mr: 20, pm: 0, rp: 15, total: 35 },
    { partido: 'PVEM', mr: 15, pm: 5, rp: 10, total: 30 },
    { partido: 'PT', mr: 10, pm: 0, rp: 8, total: 18 }
  ];
  
  const config = {
    sistema: 'mixto',
    pm_activo: true
  };
  
  console.log('📊 Llamando updateResultsTable con datos de prueba:', datosPrueba);
  console.log('📊 Config:', config);
  
  sidebar.updateResultsTable(datosPrueba, config);
  
  console.log('✅ Prueba completada. Verifica la tabla abajo del seat-chart.');
})();
```

**Qué debe pasar**:
1. Se verá la tabla con 6 partidos
2. Columnas: Partido | MR | PM | RP | Total
3. Título "Resultados por Partido" integrado
4. Footer con totales

---

## Paso 5: Verificar HTML Generado

```javascript
// 6️⃣ Verificar el HTML dentro del contenedor
const container = document.getElementById('results-table-container');
console.log('HTML generado:', container?.innerHTML);
```

**Verificar**:
- ¿Hay un `<div class="results-table-wrapper">`?
- ¿Hay un `<div class="results-table-title">`?
- ¿Hay un `<table class="results-table">`?

---

## Paso 6: Verificar CSS Cargado

```javascript
// 7️⃣ Verificar que ResultsTable.css está vinculado
const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
const resultTableCSS = links.find(link => link.href.includes('ResultsTable.css'));
console.log('ResultsTable.css cargado:', !!resultTableCSS, resultTableCSS?.href);
```

**Resultado esperado**: `true` y la ruta al archivo CSS

---

## Paso 7: Forzar Actualización con Datos Reales

Si ya moviste un slider y hay datos en `debugLastResponse`:

```javascript
const sidebar = document.querySelector('control-sidebar');
const lastResponse = sidebar?.debugLastResponse;

if (lastResponse && lastResponse.seat_chart) {
  console.log('🔄 Actualizando con datos reales:', lastResponse.seat_chart);
  
  // Transformar seat_chart a formato tabla
  const resultadosTabla = lastResponse.seat_chart.map(item => ({
    partido: item.partido || item.party || 'Sin nombre',
    mr: item.mr || 0,
    pm: item.pm || 0,
    rp: item.rp || 0,
    total: item.escaños || item.seats || item.total || 0
  }));
  
  const config = {
    sistema: 'mixto',
    pm_activo: true
  };
  
  sidebar.updateResultsTable(resultadosTabla, config);
} else {
  console.warn('⚠️ No hay datos en debugLastResponse. Mueve un slider primero.');
}
```

---

## Interpretación de Resultados

### ✅ Caso 1: La tabla aparece con datos de prueba
**Significa**: El código funciona, pero no se está llamando correctamente desde `updateUIWithResults()`

**Solución**: Verificar que el método se llama en la línea ~1420 de `ControlSidebar.js`

---

### ❌ Caso 2: Error "Contenedor NO ENCONTRADO"
**Significa**: El `#results-table-container` no existe en el DOM

**Solución**: 
1. Verificar que `SeatChart.js` genera el contenedor
2. Ejecutar: `document.querySelector('seat-chart').render()`

---

### ❌ Caso 3: La tabla aparece pero no se ve (invisible)
**Significa**: Problema de CSS

**Solución**:
```javascript
const container = document.getElementById('results-table-container');
const styles = window.getComputedStyle(container);
console.log('display:', styles.display);
console.log('visibility:', styles.visibility);
console.log('opacity:', styles.opacity);
console.log('height:', styles.height);
```

---

### ❌ Caso 4: No pasa nada, sin errores
**Significa**: El método no se ejecuta

**Solución**:
1. Verificar que `sidebar.updateResultsTable` existe
2. Añadir breakpoint en línea 1575 de `ControlSidebar.js`
3. Mover un slider y verificar si se detiene

---

## Próximos Pasos Según Resultado

| Resultado | Acción |
|-----------|--------|
| Tabla aparece con datos de prueba | ✅ Verificar integración en `updateUIWithResults()` |
| Contenedor no existe | 🔧 Revisar `SeatChart.js` render |
| Tabla invisible (CSS) | 🎨 Revisar `ResultsTable.css` |
| Método no existe | 🛠️ Verificar que `ControlSidebar.js` se cargó correctamente |
| No hay datos del backend | 🌐 Verificar API response en Network tab |

---

## Comandos Útiles Adicionales

### Ver todos los logs de la tabla
```javascript
// Filtrar logs relacionados con la tabla
console.log('Buscando logs de tabla...');
// (los logs ya aparecieron arriba en la consola)
```

### Forzar re-render del SeatChart
```javascript
const seatChart = document.querySelector('seat-chart');
seatChart.render();
console.log('✅ SeatChart re-renderizado');
```

### Ver estructura completa del sidebar
```javascript
const sidebar = document.querySelector('control-sidebar');
console.log('Métodos disponibles:', Object.getOwnPropertyNames(Object.getPrototypeOf(sidebar)));
```

---

**Ejecuta los pasos en orden y comparte los resultados para diagnosticar el problema exacto.** 🔍
