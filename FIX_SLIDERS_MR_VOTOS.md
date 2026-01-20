# ✅ FIX: Sliders de Distribución MR y Votos No Se Actualizan

## 🐛 Problema

Los sliders de distribución MR se generaban pero quedaban en 0/64 (deshabilitados) cuando se calculaba mayoría forzada, a pesar de que el backend enviaba `mr_distritos_manuales` y `votos_custom`.

### Logs problemáticos:
```
[MR DISTRIBUTION] ✅ Slider creado para MORENA: 0/64  ← ❌ Debería mostrar el valor real
[MR DISTRIBUTION] ✅ Slider creado para PAN: 0/64
[MR DISTRIBUTION] Actualizando estado de sliders: DESHABILITADOS ❌
```

---

## 🔍 Causa Raíz

### Flujo problemático:

```
1. Usuario calcula mayoría forzada
2. Backend responde con:
   - votos_custom: { MORENA: 47.5, PAN: 18.6, ... }
   - mr_distritos_manuales: { MORENA: 162, PAN: 60, ... }
3. Frontend guarda datos en window.mayoriaForzadaData ✅
4. Sliders YA ESTÁN GENERADOS con valores en 0 ❌
5. generateMRDistributionSliders() NO lee de window.mayoriaForzadaData ❌
6. Sliders permanecen en 0 ❌
```

**Problema**: Los datos se guardaban pero nunca se aplicaban a los sliders.

---

## ✅ Solución Implementada

### 1. **Leer de `window.mayoriaForzadaData` en `generateMRDistributionSliders()`**
**Archivo**: `ControlSidebar.js` línea ~5287

**Antes**:
```javascript
// Solo leía de lastResult.meta.mr_por_estado (datos de estados)
let valoresIniciales = {};
if (this.lastResult && this.lastResult.meta && this.lastResult.meta.mr_por_estado) {
  const mrPorEstado = this.lastResult.meta.mr_por_estado;
  // Calculaba totales sumando estados...
}
```

**Después**:
```javascript
// PRIORIDAD 1: Leer de mayoría forzada (distribución nacional directa)
let valoresIniciales = {};
if (window.mayoriaForzadaData && window.mayoriaForzadaData.mr_distritos_manuales) {
  valoresIniciales = { ...window.mayoriaForzadaData.mr_distritos_manuales };
  console.info('[MR DISTRIBUTION] ✅ Valores desde mayoría forzada:', valoresIniciales);
} 
// PRIORIDAD 2: Si no hay mayoría forzada, calcular desde tabla de estados
else if (this.lastResult && this.lastResult.meta && this.lastResult.meta.mr_por_estado) {
  // Calcular totales...
}
```

**Efecto**: Ahora lee primero de `window.mayoriaForzadaData.mr_distritos_manuales`, que tiene los valores directos del backend.

---

### 2. **Regenerar Sliders MR Después de Actualizar Datos**
**Archivo**: `ControlSidebar.js` línea ~4532

**Antes**:
```javascript
setTimeout(() => {
  window.actualizarDesdeControles();
  
  if (mrPorEstado && typeof this.updateStatesTable === 'function') {
    this.updateStatesTable();
  }
  
  // Notificación...
}, 100);
```

**Después**:
```javascript
setTimeout(() => {
  window.actualizarDesdeControles();
  
  if (mrPorEstado && typeof this.updateStatesTable === 'function') {
    this.updateStatesTable();
  }
  
  // 🆕 REGENERAR sliders MR con datos actualizados
  if (data.mr_distritos_manuales && typeof this.generateMRDistributionSliders === 'function') {
    console.log('[MAYORÍAS] Actualizando sliders de distribucion MR...');
    this.generateMRDistributionSliders();
    console.log('[MAYORÍAS] Sliders de distribucion MR actualizados');
  }
  
  // Notificación...
}, 100);
```

**Efecto**: Los sliders se regeneran después de guardar los datos, usando los valores de `window.mayoriaForzadaData`.

---

### 3. **Actualizar Sliders de Votos Directamente**
**Archivo**: `ControlSidebar.js` línea ~4537

**Nuevo código**:
```javascript
// ACTUALIZAR SLIDERS DE VOTOS con los datos de mayoria forzada
if (data.votos_custom) {
  console.log('[MAYORÍAS] Actualizando sliders de votos...');
  Object.entries(data.votos_custom).forEach(([partido, porcentaje]) => {
    const partidoLower = partido.toLowerCase();
    const slider = this.querySelector(`#input-${partidoLower}`);
    const valueBox = this.querySelector(`#value-${partidoLower}`);
    
    if (slider && valueBox) {
      slider.value = porcentaje;
      valueBox.textContent = porcentaje.toFixed(2);
      console.log(`[MAYORÍAS] Slider ${partido}: ${porcentaje.toFixed(2)}%`);
    }
  });
  console.log('[MAYORÍAS] Sliders de votos actualizados');
}
```

**Efecto**: 
- Encuentra cada slider de voto por su ID (ej: `#input-morena`)
- Actualiza el valor del slider
- Actualiza el display visual (`#value-morena`)
- Logs confirman cada actualización

---

## 🔄 Flujo Corregido

```
1. Usuario calcula mayoría forzada
2. Backend responde con:
   - votos_custom: { MORENA: 47.5, PAN: 18.6, ... }
   - mr_distritos_manuales: { MORENA: 162, PAN: 60, ... }
   - mr_por_estado: { AGUASCALIENTES: {...}, ... }
3. Frontend guarda datos en window.mayoriaForzadaData ✅
4. Guarda mr_por_estado en lastResult.meta ✅
5. setTimeout(100ms):
   a. actualizarDesdeControles() → Actualiza tabla de escaños ✅
   b. updateStatesTable() → Actualiza tabla de distritos ✅
   c. generateMRDistributionSliders() → Lee de window.mayoriaForzadaData ✅
      - MORENA: 162/300 ✅
      - PAN: 60/300 ✅
      - ...
   d. Actualiza sliders de votos directamente ✅
      - MORENA: 47.5% ✅
      - PAN: 18.6% ✅
      - ...
   e. Notificación de éxito ✅
```

---

## 🧪 Logs Esperados

Después de calcular mayoría forzada, deberías ver:

```
[MAYORÍAS] ✅ votos_custom recibido: { MORENA: 47.5, PAN: 18.6, ... }
[MAYORÍAS] ✅ mr_distritos_manuales recibido: { MORENA: 162, PAN: 60, ... }
[MAYORÍAS] ✅ mr_por_estado recibido: 32 estados
[MAYORÍAS] Datos guardados en lastResult.meta, esperando actualización del sistema...
[MAYORÍAS] Actualizando sistema completo...
[MAYORÍAS] Actualizando tabla de distritos...
[MAYORÍAS] Tabla de distritos actualizada
[MAYORÍAS] Actualizando sliders de distribucion MR...
[MR DISTRIBUTION] 🎯 Generando sliders de distribución de distritos MR...
[MR DISTRIBUTION] ✅ Valores desde mayoría forzada: { MORENA: 162, PAN: 60, ... }
[MR DISTRIBUTION] ✅ Slider creado para MORENA: 162/300  ← ✅ VALOR CORRECTO
[MR DISTRIBUTION] ✅ Slider creado para PAN: 60/300      ← ✅ VALOR CORRECTO
[MAYORÍAS] Sliders de distribucion MR actualizados
[MAYORÍAS] Actualizando sliders de votos...
[MAYORÍAS] Slider MORENA: 47.50%  ← ✅ VALOR CORRECTO
[MAYORÍAS] Slider PAN: 18.64%     ← ✅ VALOR CORRECTO
[MAYORÍAS] Sliders de votos actualizados
```

**YA NO debe aparecer**:
```
❌ [MR DISTRIBUTION] ✅ Slider creado para MORENA: 0/300
❌ [MR DISTRIBUTION] Actualizando estado de sliders: DESHABILITADOS ❌
```

---

## 📦 Archivos Modificados

- ✅ `ControlSidebar.js` línea ~5287 (leer de window.mayoriaForzadaData en generateMRDistributionSliders)
- ✅ `ControlSidebar.js` línea ~4532 (regenerar sliders MR después de actualizar datos)
- ✅ `ControlSidebar.js` línea ~4537 (actualizar sliders de votos directamente)
- ✅ `index.html` (cache v=20260119020000)

---

## 🎯 Prueba

1. **Recarga con Ctrl+Shift+R**
2. **Activa mayoría forzada**
3. **Selecciona partido/coalición**
4. **Verifica en los sliders superiores (votos)**:
   - ✅ MORENA muestra ~47.5%
   - ✅ PAN muestra ~18.6%
   - ✅ Otros partidos tienen valores ajustados
5. **Verifica en los sliders de distribución MR**:
   - ✅ MORENA muestra 162/300 (o similar)
   - ✅ PAN muestra 60/300 (o similar)
   - ✅ Total suma 300 (o el total de distritos MR)
   - ✅ Sliders HABILITADOS (no deshabilitados)

---

## 🎉 Resultado

✅ **Sliders de votos se actualizan con valores del backend**
✅ **Sliders de distribución MR se regeneran con valores correctos**
✅ **Sliders están habilitados y editables**
✅ **Todos los controles sincronizados con mayoría forzada**
✅ **Usuario puede ver y ajustar la distribución calculada**
