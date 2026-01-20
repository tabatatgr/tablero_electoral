# 🔧 FIX: Tabla de Distritos Se Borra Después de Mayoría Forzada

## 🐛 Problema

La tabla de distritos se actualizaba correctamente al calcular mayoría forzada, pero **se borraba inmediatamente después** cuando `window.actualizarDesdeControles()` cargaba nuevos datos del backend.

---

## 🔍 Causa Raíz

### Flujo problemático:

1. Usuario calcula mayoría forzada
2. Frontend guarda `mr_por_estado` en `lastResult.meta`
3. Frontend llama a `updateStatesTable()` → ✅ Tabla se muestra correctamente
4. Frontend llama a `window.actualizarDesdeControles()`
5. `actualizarDesdeControles()` carga datos del backend
6. Línea 2195 de `ControlSidebar.js`:
   ```javascript
   this.lastResult = result || null;  // ❌ SOBRESCRIBE TODO
   ```
7. Los datos de `mr_por_estado` de mayoría forzada **se pierden**
8. Tabla se borra o muestra datos antiguos

---

## ✅ Solución Implementada

### 1. **Marcar Datos de Mayoría Forzada**
**Archivo**: `ControlSidebar.js` línea ~4480

**Antes**:
```javascript
if (data.mr_por_estado) {
  this.lastResult.meta.mr_por_estado = data.mr_por_estado;
}
```

**Después**:
```javascript
if (data.mr_por_estado) {
  this.lastResult.meta.mr_por_estado = data.mr_por_estado;
  this.lastResult.meta._mayoriaForzada = true;  // 🆕 FLAG para preservar
}
```

---

### 2. **Preservar Datos al Actualizar `lastResult`**
**Archivo**: `ControlSidebar.js` línea ~2193

**Antes**:
```javascript
this.lastResultOriginal = result || null;
this.lastResult = result || null;  // ❌ Sobrescribe todo
```

**Después**:
```javascript
this.lastResultOriginal = result || null;

// 🆕 PRESERVAR datos de mayoría forzada si existen
const mayoriaForzadaMeta = this.lastResult && this.lastResult.meta && 
                           (this.lastResult.meta.mr_por_estado || this.lastResult.meta.mr_distritos_por_estado);

this.lastResult = result || null;

// 🆕 Si había datos de mayoría forzada y el nuevo result no los trae, preservarlos
if (mayoriaForzadaMeta && this.lastResult && this.lastResult.meta) {
  if (!this.lastResult.meta.mr_por_estado && this.lastResult.meta._mayoriaForzada) {
    console.log('[MAYORÍAS] 🔄 Preservando datos de mr_por_estado de mayoría forzada...');
    this.lastResult.meta.mr_por_estado = mayoriaForzadaMeta;
  }
}
```

**Efecto**: 
- Si `actualizarDesdeControles()` trae nuevos datos SIN `mr_por_estado`
- Y los datos actuales vienen de mayoría forzada (`_mayoriaForzada = true`)
- **Se preservan** los datos de `mr_por_estado` en lugar de sobrescribirlos

---

### 3. **Re-actualizar Tabla Después de `actualizarDesdeControles()`**
**Archivo**: `ControlSidebar.js` línea ~4530

**Antes**:
```javascript
setTimeout(() => {
  window.actualizarDesdeControles();
  console.log('[MAYORÍAS] ✅ Sistema actualizado');
}, 100);
```

**Después**:
```javascript
setTimeout(() => {
  window.actualizarDesdeControles();
  console.log('[MAYORÍAS] ✅ Sistema actualizado (seat chart y KPIs)');
  
  // 🆕 VOLVER A ACTUALIZAR LA TABLA después de actualizarDesdeControles
  if (mrPorEstado && typeof this.updateStatesTable === 'function') {
    console.log('[MAYORÍAS] 🔄 Re-actualizando tabla después de actualizarDesdeControles...');
    this.updateStatesTable();
    console.log('[MAYORÍAS] ✅ Tabla re-actualizada');
  }
}, 100);
```

**Efecto**: 
- Después de que `actualizarDesdeControles()` actualice el seat chart
- Se vuelve a llamar a `updateStatesTable()` para asegurar que la tabla use los datos correctos

---

## 🔄 Flujo Corregido

```
1. Usuario calcula mayoría forzada
2. Frontend guarda mr_por_estado en lastResult.meta
3. Frontend marca _mayoriaForzada = true
4. Frontend llama updateStatesTable() → ✅ Tabla se muestra
5. Frontend llama actualizarDesdeControles()
6. actualizarDesdeControles() carga datos del backend
7. Línea 2195: this.lastResult = result
8. Línea 2203: Detecta _mayoriaForzada = true
9. Línea 2205: PRESERVA mr_por_estado de mayoría forzada ✅
10. Línea 4535: Re-actualiza tabla con datos preservados ✅
11. Tabla permanece visible con distribución correcta ✅
```

---

## 🧪 Logs Esperados

Al calcular mayoría forzada, deberías ver:

```
[MAYORÍAS] ✅ mr_por_estado (nombres) guardado: 32 estados
[MAYORÍAS] 🔄 Llamando a updateStatesTable()...
[DEBUG] ✅ Tabla de estados actualizada en el DOM
[MAYORÍAS] ✅ updateStatesTable() ejecutado
[MAYORÍAS] 🚀 Llamando a actualizarDesdeControles()...
[MAYORÍAS] ✅ Sistema actualizado (seat chart y KPIs)
[MAYORÍAS] 🔄 Re-actualizando tabla después de actualizarDesdeControles...
[MAYORÍAS] 🔄 Preservando datos de mr_por_estado de mayoría forzada...  ← NUEVO
[DEBUG] ✅ Tabla de estados actualizada en el DOM
[MAYORÍAS] ✅ Tabla re-actualizada
```

---

## 📦 Archivos Modificados

- ✅ `ControlSidebar.js` línea ~2193 (preservar datos al actualizar lastResult)
- ✅ `ControlSidebar.js` línea ~4480 (marcar flag _mayoriaForzada)
- ✅ `ControlSidebar.js` línea ~4530 (re-actualizar tabla)
- ✅ `index.html` (cache v=20260119014500)

---

## 🎯 Prueba

1. **Recarga con Ctrl+Shift+R**
2. **Selecciona mayoría forzada**
3. **Elige partido/coalición**
4. **Verifica**:
   - ✅ Tabla aparece con distribución de MR por estado
   - ✅ Tabla **NO se borra** después de unos momentos
   - ✅ Distribución permanece visible
   - ✅ Puedes ver los distritos asignados por partido en cada estado

---

## 🎉 Resultado Esperado

La tabla de distritos ahora **permanece actualizada** con los datos de mayoría forzada, incluso después de que el sistema actualice el seat chart y los KPIs.
