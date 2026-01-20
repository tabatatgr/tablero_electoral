# ✅ FIX FINAL: Tabla de Distritos + Notificaciones Confusas

## 🐛 Problema Reportado

> "primero se actualiza la tabla de distritos pero no la de escaños, luego se borra la tabla y se actualiza la tabla de escaños y se borra la de distritos actualizada y se deja la vieja y las notificaciones están confusas"

### Síntomas:
1. Tabla de distritos se actualiza ✅
2. Tabla de escaños NO se actualiza aún ❌
3. `actualizarDesdeControles()` actualiza tabla de escaños ✅
4. Tabla de distritos se borra ❌
5. Notificaciones aparecen múltiples veces ❌

---

## 🔍 Causa Raíz

### Flujo Problemático:

```
1. aplicarMayoriaForzadaAlSistema() se ejecuta
2. Guarda mr_por_estado en lastResult.meta
3. Llama a updateStatesTable() → Tabla distritos aparece ✅
4. Muestra notificación de éxito ✅
5. Llama a actualizarDesdeControles() 
6. actualizarDesdeControles() sobrescribe lastResult ❌
7. Tabla de distritos pierde datos y se borra ❌
8. Tabla de escaños se actualiza ✅
9. Usuario ve: tabla distritos vacía + notificación duplicada ❌
```

**Problema**: Orden incorrecto de operaciones + notificaciones prematuras

---

## ✅ Solución Implementada

### 1. **Eliminar Primera Llamada a `updateStatesTable()`**
**Archivo**: `ControlSidebar.js` línea ~4532

**Antes**:
```javascript
// Llamar directamente a la función que actualiza la tabla
if (typeof this.updateStatesTable === 'function') {
  console.log('[MAYORÍAS] 🔄 Llamando a updateStatesTable()...');
  this.updateStatesTable();  // ❌ PRIMERA LLAMADA (prematura)
  console.log('[MAYORÍAS] ✅ updateStatesTable() ejecutado');
}

// Luego llama a actualizarDesdeControles()
setTimeout(() => {
  window.actualizarDesdeControles();  // Sobrescribe lastResult
  
  // Segunda llamada a updateStatesTable()
  if (mrPorEstado && typeof this.updateStatesTable === 'function') {
    this.updateStatesTable();  // Segunda actualización
  }
}, 100);
```

**Después**:
```javascript
// NO llamar updateStatesTable() aquí - dejar que actualizarDesdeControles lo haga
console.log('[MAYORÍAS] 💾 Datos guardados en lastResult.meta, esperando actualización del sistema...');

// Actualizar TODO el sistema una sola vez
setTimeout(() => {
  window.actualizarDesdeControles();  // Actualiza tabla de escaños
  
  // DESPUÉS actualizar tabla de distritos (una sola vez)
  if (mrPorEstado && typeof this.updateStatesTable === 'function') {
    console.log('[MAYORÍAS] 🗺️ Actualizando tabla de distritos...');
    this.updateStatesTable();
    console.log('[MAYORÍAS] ✅ Tabla de distritos actualizada');
  }
}, 100);
```

**Efecto**: 
- Solo **UNA** actualización de tabla de distritos (en el momento correcto)
- Orden correcto: escaños primero, distritos después

---

### 2. **Mover Notificación al Final del Proceso**
**Archivo**: `ControlSidebar.js` línea ~4350 y ~4533

**Antes**:
```javascript
// En calcularMayoriaForzada():
window.notifications.hide('mayoria-calculating');  // ❌ TEMPRANO

this.aplicarMayoriaForzadaAlSistema(data, ...);

window.notifications.success(...);  // ❌ ANTES de actualizar tablas
```

**Después**:
```javascript
// En calcularMayoriaForzada():
// NO mostrar notificaciones aquí
this.aplicarMayoriaForzadaAlSistema(data, tipoMayoria, partido, camara, partidoSeleccionado, soloPartido);

// En aplicarMayoriaForzadaAlSistema():
setTimeout(() => {
  window.actualizarDesdeControles();  // Actualiza escaños
  
  if (mrPorEstado && typeof this.updateStatesTable === 'function') {
    this.updateStatesTable();  // Actualiza distritos
  }
  
  // ✅ NOTIFICACIÓN AL FINAL (cuando TODO está listo)
  if (window.notifications && window.notifications.isReady) {
    window.notifications.hide('mayoria-calculating');  // Ocultar loading
    
    const tipoTexto = tipoMayoria === 'simple' ? 'simple' : 'calificada';
    const votosNecesarios = data.votos_necesarios || data.votos_porcentaje || 0;
    const nombreMostrar = soloPartido ? partido : partidoSeleccionado;
    
    window.notifications.success(
      `Mayoria ${tipoTexto} calculada`,
      `${nombreMostrar} necesita ${votosNecesarios.toFixed(2)}% de votos`,
      5000
    );
  }
}, 100);
```

**Efecto**:
- Notificación aparece **UNA** sola vez
- Aparece **DESPUÉS** de actualizar ambas tablas
- Usuario ve: todo listo → notificación

---

### 3. **Preservar Datos de Mayoría Forzada**
**Archivo**: `ControlSidebar.js` línea ~2193 (ya implementado anteriormente)

```javascript
// Guardar datos previos de mayoría forzada
const mayoriaForzadaMeta = this.lastResult && this.lastResult.meta && 
                           (this.lastResult.meta.mr_por_estado || this.lastResult.meta.mr_distritos_por_estado);

this.lastResult = result || null;  // Actualizar con nuevos datos

// Restaurar datos de mayoría forzada si se perdieron
if (mayoriaForzadaMeta && this.lastResult && this.lastResult.meta) {
  if (!this.lastResult.meta.mr_por_estado && this.lastResult.meta._mayoriaForzada) {
    this.lastResult.meta.mr_por_estado = mayoriaForzadaMeta;
  }
}
```

**Efecto**: Los datos no se pierden cuando `actualizarDesdeControles()` actualiza `lastResult`

---

## 🔄 Flujo Corregido

```
1. Usuario selecciona mayoría forzada
2. Frontend muestra: "Calculando mayoría forzada..." (loading)
3. Backend responde con datos
4. Guardar mr_por_estado en lastResult.meta
5. Marcar _mayoriaForzada = true
6. setTimeout(100ms):
   a. actualizarDesdeControles() → Actualiza tabla de escaños ✅
   b. Preservar mr_por_estado (no se pierde) ✅
   c. updateStatesTable() → Actualiza tabla de distritos ✅
   d. Ocultar loading notification ✅
   e. Mostrar success notification ✅
7. Usuario ve:
   - Tabla de escaños actualizada ✅
   - Tabla de distritos actualizada ✅
   - UNA notificación de éxito ✅
```

---

## 🧪 Logs Esperados

```
[MAYORÍAS] Aplicando mayoría forzada al sistema...
[MAYORÍAS] mr_por_estado (nombres) guardado: 32 estados
[MAYORÍAS] Datos guardados en lastResult.meta, esperando actualización del sistema...
[MAYORÍAS] Actualizando sistema completo...
[MAYORÍAS] Actualizando tabla de distritos...
[DEBUG] Tabla de estados actualizada en el DOM
[MAYORÍAS] Tabla de distritos actualizada
```

**YA NO debe aparecer**:
```
❌ [MAYORÍAS] Llamando a updateStatesTable()... (primera vez)
❌ [MAYORÍAS] updateStatesTable() ejecutado (antes de actualizarDesdeControles)
❌ Notificación de éxito (antes de actualizar tablas)
```

---

## 📦 Archivos Modificados

- ✅ `ControlSidebar.js` línea ~4350 (eliminar notificaciones prematuras)
- ✅ `ControlSidebar.js` línea ~4379 (agregar parámetros partidoSeleccionado, soloPartido)
- ✅ `ControlSidebar.js` línea ~4532 (eliminar primera llamada a updateStatesTable)
- ✅ `ControlSidebar.js` línea ~4533 (agregar notificación al final del setTimeout)
- ✅ `ControlSidebar.js` línea ~2193 (preservar datos - ya implementado)
- ✅ `index.html` (cache v=20260119015000)

---

## 🎯 Prueba

1. **Recarga con Ctrl+Shift+R**
2. **Activa mayoría forzada**
3. **Selecciona partido/coalición**
4. **Observa**:
   - ✅ Notificación "Calculando mayoría forzada..." aparece
   - ✅ **AMBAS** tablas se actualizan (escaños + distritos)
   - ✅ **UNA** notificación de éxito al final
   - ✅ Tabla de distritos permanece visible
   - ✅ Datos correctos en ambas tablas

---

## 🎉 Resultado

✅ **Tabla de escaños se actualiza primero**
✅ **Tabla de distritos se actualiza después y permanece**
✅ **Notificación aparece UNA sola vez al final**
✅ **Orden correcto de actualizaciones**
✅ **Sin confusión ni parpadeos**
