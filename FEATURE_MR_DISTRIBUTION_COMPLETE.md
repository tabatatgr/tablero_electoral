# 🎯 Feature: Distribución Manual de Distritos MR - Implementación Completa

## 📋 Resumen

Sistema completo para controlar manualmente la distribución de distritos de Mayoría Relativa (MR) por partido político, permitiendo simulaciones donde el usuario especifica cuántos distritos gana cada partido en lugar de calcularlos automáticamente desde los votos.

---

## 🏗️ Arquitectura

### Flujo de Datos

```
┌─────────────────────────────────────────────────────────────────┐
│  1. Usuario activa toggle "Distribución Manual de Distritos MR" │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. ControlSidebar.generateMRDistributionSliders()              │
│     - Lee partidosData del sistema                              │
│     - Crea sliders dinámicos (uno por partido)                  │
│     - Inicializa this.mrDistributionData = {}                   │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. Usuario ajusta sliders                                      │
│     Event 'input': Actualiza display + validación              │
│     Event 'change': Envía datos al backend                     │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. sendMRDistribution()                                        │
│     - Valida total ≤ totalMR                                    │
│     - Crea window.mrDistributionManual = {                      │
│         activa: true,                                           │
│         distribucion: {"MORENA": 150, "PAN": 80, ...},         │
│         total_asignado: 280,                                    │
│         total_disponible: 300                                   │
│       }                                                          │
│     - Llama window.actualizarDesdeControles()                   │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  5. actualizarDesdeControlesSilent()                            │
│     Lee window.mrDistributionManual y lo pasa a cargarSimulacion│
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  6. cargarSimulacion({ ..., mr_distritos_manuales })           │
│     Incluye en body JSON:                                       │
│     {                                                            │
│       "mr_distritos_manuales": {                                │
│         "MORENA": 150,                                          │
│         "PAN": 80,                                              │
│         ...                                                      │
│       }                                                          │
│     }                                                            │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  7. Backend procesa y devuelve seat_chart + kpis               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Archivos Modificados

### 1. `components/panel_control/ControlSidebar.js`

#### HTML Toggle & Container (Líneas 308-338)

```javascript
<!-- MR Distribution Manual -->
<div class="control-row">
  <div class="control-label-container">
    <div class="control-label">
      <span class="label-text">Distribución Manual de Distritos MR</span>
      <span class="label-subtitle">Asigna distritos ganados por partido</span>
    </div>
    <div class="toggle-switch" id="mr-distribution-switch" data-switch="Off">
      <div class="toggle-slider"></div>
    </div>
  </div>
  
  <div id="mr-distribution-warning" class="mr-distribution-warning" style="display: none;">
    <div class="warning-icon">⚠️</div>
    <div class="warning-content">
      <div class="warning-title">Control Manual Activo</div>
      <div class="warning-stats">
        <span class="stat-item">
          <strong>Total distritos MR:</strong> <span id="mr-total-display">300</span>
        </span>
        <span class="stat-divider">|</span>
        <span class="stat-item">
          <strong>Asignados:</strong> <span id="mr-assigned-display">0</span>
        </span>
      </div>
    </div>
  </div>
  
  <div id="mr-distribution-controls" style="display: none; margin-top: 10px;">
    <div id="mr-distribution-sliders"></div>
  </div>
</div>
```

**Características**:
- Toggle switch para activar/desactivar
- Warning box con totales y validación visual
- Container dinámico para sliders

#### Toggle Event Handler (Líneas 440-475)

```javascript
// MR Distribution switch - mostrar/ocultar controles
if (switchId === 'mr-distribution-switch') {
  const controlsDiv = document.getElementById('mr-distribution-controls');
  if (controlsDiv) {
    controlsDiv.style.display = isActive ? 'block' : 'none';
  }
  
  console.log(`[MR DISTRIBUTION] ${isActive ? 'ACTIVADA ✅' : 'DESACTIVADA ❌'}`);
  
  if (isActive) {
    // Generar sliders
    const sidebar = document.querySelector('control-sidebar');
    if (sidebar && typeof sidebar.generateMRDistributionSliders === 'function') {
      sidebar.generateMRDistributionSliders();
    }
  } else {
    // Limpiar datos y recalcular
    console.log('[MR DISTRIBUTION] 🧹 Limpiando distribución manual...');
    
    const sidebar = document.querySelector('control-sidebar');
    if (sidebar) {
      sidebar.mrDistributionData = null;
    }
    
    window.mrDistributionManual = null;
    
    // Recalcular con distribución automática
    if (typeof window.actualizarDesdeControles === 'function') {
      setTimeout(() => {
        window.actualizarDesdeControles();
        console.log('[MR DISTRIBUTION] ✅ Sistema recalculado con distribución automática');
      }, 100);
    }
  }
}
```

**Comportamiento**:
- **Activación**: Genera sliders dinámicos
- **Desactivación**: Limpia datos, resetea variable global, recalcula sin distribución manual

#### generateMRDistributionSliders() (Líneas 3401-3538)

Función completa que:

1. **Validaciones iniciales**:
```javascript
if (!this.partidosData || this.partidosData.length === 0) {
  console.error('[MR DISTRIBUTION] ❌ No hay datos de partidos');
  container.innerHTML = '<p style="color: #9CA3AF;">Cargando partidos...</p>';
  return;
}
```

2. **Configuración**:
```javascript
const mrSlider = this.querySelector('#input-mr');
const totalMR = mrSlider ? parseInt(mrSlider.value) : 300;

this.mrDistributionData = {};
this.partidosData.forEach(partido => {
  const partyName = partido.toUpperCase();
  this.mrDistributionData[partyName] = 0;
});
```

3. **Generación de sliders**:
```javascript
this.partidosData.forEach(partido => {
  const partyName = partido.toUpperCase();
  const partyLabel = partido;
  const partyColor = this.partidosColores?.[partyName] || '#6B7280';
  
  const sliderGroup = document.createElement('div');
  sliderGroup.className = 'mr-distribution-slider-group';
  sliderGroup.style.cssText = `
    display: flex; 
    align-items: center; 
    gap: 12px; 
    margin-bottom: 12px;
    padding: 8px;
    background: rgba(255,255,255,0.05);
    border-radius: 6px;
  `;
  
  sliderGroup.innerHTML = `
    <div style="flex: 0 0 12px; height: 12px; border-radius: 50%; background: ${partyColor};"></div>
    <label style="flex: 0 0 120px; color: #E5E7EB; font-weight: 500;">${partyLabel}</label>
    <input type="range" min="0" max="${totalMR}" value="0" 
           id="mr-dist-${partyName}" 
           class="control-slider" 
           style="flex: 1; --slider-color: ${partyColor};">
    <span id="mr-dist-value-${partyName}" class="shock-value-box"
          style="flex: 0 0 60px; text-align: center;">0</span>
  `;
  
  container.appendChild(sliderGroup);
});
```

4. **Event listeners**:
```javascript
slider.addEventListener('input', (event) => {
  const newValue = parseInt(event.target.value);
  valueBox.textContent = newValue;
  this.mrDistributionData[partido] = newValue;
  console.log(`[MR DISTRIBUTION] 🎚️ ${partyLabel}: ${newValue} distritos`);
  this.updateMRDistributionTotal();
});

slider.addEventListener('change', () => {
  this.sendMRDistribution(); // Solo al terminar de ajustar
});
```

**Diseño**:
- Color dot con código de color del partido
- Label con nombre del partido
- Slider con color personalizado vía CSS variable
- Value box mostrando valor actual
- Fondo semi-transparente para agrupación visual

#### updateMRDistributionTotal() (Líneas 3540-3565)

```javascript
updateMRDistributionTotal() {
  if (!this.mrDistributionData) return;
  
  const total = Object.values(this.mrDistributionData).reduce((sum, val) => sum + val, 0);
  const mrAssignedDisplay = document.getElementById('mr-assigned-display');
  
  if (mrAssignedDisplay) {
    mrAssignedDisplay.textContent = total;
    
    const mrSlider = this.querySelector('#input-mr');
    const totalMR = mrSlider ? parseInt(mrSlider.value) : 300;
    
    if (total > totalMR) {
      mrAssignedDisplay.style.color = '#EF4444'; // Rojo - excede
      console.log(`[MR DISTRIBUTION] ⚠️ EXCESO: ${total}/${totalMR}`);
    } else if (total === totalMR) {
      mrAssignedDisplay.style.color = '#10B981'; // Verde - perfecto
      console.log(`[MR DISTRIBUTION] ✅ COMPLETO: ${total}/${totalMR}`);
    } else {
      mrAssignedDisplay.style.color = '#F59E0B'; // Amarillo - parcial
      console.log(`[MR DISTRIBUTION] ⏳ PARCIAL: ${total}/${totalMR}`);
    }
  }
}
```

**Lógica de colores**:
- 🔴 Rojo (`#EF4444`): `total > totalMR` - Usuario asignó más de lo permitido
- 🟢 Verde (`#10B981`): `total === totalMR` - Asignación perfecta
- 🟡 Amarillo (`#F59E0B`): `total < totalMR` - Todavía falta asignar

#### sendMRDistribution() (Líneas 3567-3608)

```javascript
async sendMRDistribution() {
  if (!this.mrDistributionData) {
    console.log('[MR DISTRIBUTION] ❌ No hay datos de distribución');
    return;
  }
  
  const total = Object.values(this.mrDistributionData).reduce((sum, val) => sum + val, 0);
  const mrSlider = this.querySelector('#input-mr');
  const totalMR = mrSlider ? parseInt(mrSlider.value) : 300;
  
  // Validación: no enviar si excede el límite
  if (total > totalMR) {
    console.warn(`[MR DISTRIBUTION] ⚠️ Total excede: ${total}/${totalMR}. No se enviará.`);
    
    // Efecto visual de error
    const warningBox = document.getElementById('mr-distribution-warning');
    if (warningBox) {
      warningBox.style.borderColor = '#EF4444';
      setTimeout(() => {
        warningBox.style.borderColor = '#F59E0B';
      }, 2000);
    }
    return;
  }
  
  console.log('[MR DISTRIBUTION] 📡 Enviando:', {
    distribucion: this.mrDistributionData,
    total_asignado: total,
    total_disponible: totalMR,
    porcentaje: `${((total/totalMR)*100).toFixed(1)}%`
  });
  
  // Guardar en variable global
  window.mrDistributionManual = {
    activa: true,
    distribucion: { ...this.mrDistributionData },
    total_asignado: total,
    total_disponible: totalMR
  };
  
  // Recalcular
  if (typeof window.actualizarDesdeControles === 'function') {
    setTimeout(() => {
      window.actualizarDesdeControles();
      console.log('[MR DISTRIBUTION] ✅ Sistema recalculado');
    }, 100);
  } else {
    console.error('[MR DISTRIBUTION] ❌ window.actualizarDesdeControles no disponible');
  }
}
```

**Seguridad**:
- Valida que `total ≤ totalMR` antes de enviar
- Muestra feedback visual si hay error
- No envía datos inválidos al backend

---

### 2. `scripts/script_general/script.js`

#### Modificación en firma de `cargarSimulacion` (Línea 388)

```javascript
async function cargarSimulacion({
  anio = null, 
  camara = 'diputados', 
  modelo = 'vigente', 
  magnitud, 
  umbral = undefined, 
  sobrerrepresentacion = undefined, 
  sistema = undefined, 
  mr_seats = undefined, 
  rp_seats = undefined, 
  pm_seats = undefined, 
  escanos_totales = undefined, 
  reparto_mode = 'cuota', 
  reparto_method = 'hare', 
  max_seats_per_party = undefined, 
  usar_coaliciones = true, 
  votos_custom = null, 
  silentLoad = false, 
  porcentajes_redistribucion = null, 
  mr_distritos_manuales = null  // 🆕 NUEVO PARÁMETRO
} = {}) {
```

#### Construcción del Body JSON (Líneas ~580-605)

```javascript
// Redistribución de votos O distritos MR manuales
if ((porcentajes_redistribucion && Object.keys(porcentajes_redistribucion).length > 0) || mr_distritos_manuales) {
  console.log('[DEBUG] Preparando body para envío...');
  
  const jsonBody = {
    porcentajes_partidos: porcentajes_redistribucion || {},
    partidos_fijos: {},
    overrides_pool: {}
  };
  
  // 🆕 MR DISTRIBUTION: Agregar distribución manual si existe
  if (mr_distritos_manuales && mr_distritos_manuales.activa && mr_distritos_manuales.distribucion) {
    jsonBody.mr_distritos_manuales = mr_distritos_manuales.distribucion;
    console.log('[MR DISTRIBUTION] 📡 Enviando al backend:', {
      distribucion: mr_distritos_manuales.distribucion,
      total_asignado: mr_distritos_manuales.total_asignado,
      total_disponible: mr_distritos_manuales.total_disponible
    });
  }

  fetchOptions.headers['Content-Type'] = 'application/json';
  fetchOptions.body = JSON.stringify(jsonBody);

  console.log('[DEBUG] Body JSON completo:', jsonBody);
} else {
  console.log('[DEBUG] Sin redistribución ni MR manual - POST solo con query parameters');
}
```

**Formato del Body JSON**:
```json
{
  "porcentajes_partidos": { ... },
  "partidos_fijos": {},
  "overrides_pool": {},
  "mr_distritos_manuales": {
    "MORENA": 150,
    "PAN": 80,
    "PRI": 50,
    "PVEM": 20
  }
}
```

#### Llamadas desde actualizarDesdeControlesSilent (Líneas 1742-1761)

```javascript
// Modelo personalizado
cargarSimulacion({
  anio, camara, modelo: modeloBackend, magnitud: magnitudFinal, 
  sobrerrepresentacion, umbral, sistema, 
  mr_seats, rp_seats, pm_seats, escanos_totales,
  reparto_mode, reparto_method, max_seats_per_party,
  usar_coaliciones,
  votos_custom,
  silentLoad: !showSuccessNotification,
  porcentajes_redistribucion: window.porcentajesTemporales || null,
  mr_distritos_manuales: window.mrDistributionManual || null  // 🆕
});

// Modelo estándar
cargarSimulacion({
  anio, camara, modelo: modeloBackend, magnitud, 
  reparto_mode, reparto_method,
  silentLoad: !showSuccessNotification,
  porcentajes_redistribucion: window.porcentajesTemporales || null,
  mr_distritos_manuales: window.mrDistributionManual || null  // 🆕
});
```

---

## 🔄 Estado Global

### Variable: `window.mrDistributionManual`

**Estructura**:
```javascript
window.mrDistributionManual = {
  activa: true,                    // Boolean: indica si está activo
  distribucion: {                  // Object: mapa partido -> distritos
    "MORENA": 150,
    "PAN": 80,
    "PRI": 50,
    "PVEM": 20,
    "PT": 0,
    "MC": 0
  },
  total_asignado: 300,            // Number: suma de todos los valores
  total_disponible: 300           // Number: total de distritos MR disponibles
}
```

**Ciclo de Vida**:
1. **Creación**: Al activar el toggle y mover un slider
2. **Actualización**: Cada vez que se mueve un slider (`change` event)
3. **Lectura**: En `actualizarDesdeControlesSilent()` antes de llamar `cargarSimulacion()`
4. **Limpieza**: Al desactivar el toggle → `window.mrDistributionManual = null`

---

## 🎨 Estilos CSS

### Variables de Color

```css
--color-red: #EF4444;      /* Exceso de asignación */
--color-green: #10B981;    /* Asignación perfecta */
--color-yellow: #F59E0B;   /* Asignación parcial */
```

### Sliders Personalizados

```css
.control-slider {
  --slider-color: #6B7280;  /* Default, sobrescrito dinámicamente */
}

.control-slider::-webkit-slider-thumb {
  background: var(--slider-color);
}

.control-slider::-moz-range-thumb {
  background: var(--slider-color);
}
```

**Uso dinámico**:
```javascript
style="--slider-color: ${partyColor};"
```

Cada slider usa el color oficial del partido para mejor visualización.

---

## 🧪 Testing

### Casos de Prueba

#### 1. Activación Básica
- [ ] Activar toggle → Sliders aparecen
- [ ] Desactivar toggle → Sliders desaparecen
- [ ] Warning box muestra totales correctos

#### 2. Asignación de Distritos
- [ ] Mover slider → Valor se actualiza en tiempo real
- [ ] Total asignado se calcula correctamente
- [ ] Colores cambian según el estado (rojo/verde/amarillo)

#### 3. Validación de Límites
- [ ] Asignar más del límite → Color rojo
- [ ] Asignar exactamente el límite → Color verde
- [ ] Asignar menos del límite → Color amarillo
- [ ] Intentar enviar con exceso → No se envía

#### 4. Integración con Backend
- [ ] `window.mrDistributionManual` se crea correctamente
- [ ] `cargarSimulacion()` recibe el parámetro
- [ ] Body JSON contiene `mr_distritos_manuales`
- [ ] Backend procesa y devuelve resultados

#### 5. Limpieza y Reset
- [ ] Desactivar toggle → Variable global se limpia
- [ ] Sistema recalcula con distribución automática
- [ ] No quedan datos residuales

---

## 📊 Logs de Debugging

### Console Output Esperado

#### Al Activar
```
[MR DISTRIBUTION] Distribución manual de distritos MR: ACTIVADA ✅
[MR DISTRIBUTION] 🎯 Generando sliders para 6 partidos...
[MR DISTRIBUTION] ✅ Slider creado para MORENA: 0/300
[MR DISTRIBUTION] ✅ Slider creado para PAN: 0/300
...
[MR DISTRIBUTION] ✅ Sliders generados correctamente
[MR DISTRIBUTION] ⏳ PARCIAL: 0/300 distritos
```

#### Al Mover Slider
```
[MR DISTRIBUTION] 🎚️ MORENA: 150 distritos
[MR DISTRIBUTION] ⏳ PARCIAL: 150/300 distritos
```

#### Al Completar Asignación
```
[MR DISTRIBUTION] 🎚️ PAN: 80 distritos
[MR DISTRIBUTION] ✅ COMPLETO: 300/300 distritos
```

#### Al Enviar al Backend
```
[MR DISTRIBUTION] 📡 Enviando: {
  distribucion: { MORENA: 150, PAN: 80, PRI: 50, PVEM: 20 },
  total_asignado: 300,
  total_disponible: 300,
  porcentaje: "100.0%"
}
[MR DISTRIBUTION] 📡 Enviando al backend: {
  distribucion: { MORENA: 150, PAN: 80, ... },
  total_asignado: 300,
  total_disponible: 300
}
[DEBUG] Body JSON completo: {
  porcentajes_partidos: {},
  partidos_fijos: {},
  overrides_pool: {},
  mr_distritos_manuales: { MORENA: 150, PAN: 80, ... }
}
[MR DISTRIBUTION] ✅ Sistema recalculado
```

#### Al Desactivar
```
[MR DISTRIBUTION] Distribución manual de distritos MR: DESACTIVADA ❌
[MR DISTRIBUTION] 🧹 Limpiando distribución manual...
[MR DISTRIBUTION] ✅ Sistema recalculado con distribución automática
```

---

## 🚀 Próximos Pasos

### Backend Implementation Needed

El backend debe:

1. **Recibir el parámetro en el body**:
```python
@app.post("/procesar/diputados")
async def procesar_diputados(
    request: Request,
    anio: int,
    plan: str,
    # ... otros parámetros
):
    body = await request.json()
    mr_distritos_manuales = body.get('mr_distritos_manuales', None)
```

2. **Validar datos**:
```python
if mr_distritos_manuales:
    total_asignado = sum(mr_distritos_manuales.values())
    if total_asignado > mr_seats:
        raise ValueError(f"Total asignado ({total_asignado}) excede MR disponibles ({mr_seats})")
```

3. **Usar distribución manual en lugar de calcular**:
```python
if mr_distritos_manuales:
    # Usar valores directos
    for partido, distritos in mr_distritos_manuales.items():
        df.loc[df['partido'] == partido, 'mr_seats'] = distritos
else:
    # Calcular normalmente desde votos
    calcular_mr_desde_votos(df)
```

4. **Devolver seat_chart actualizado**:
```python
return {
    "seat_chart": [...],
    "kpis": {...},
    "mr_distribution_usado": "manual" if mr_distritos_manuales else "automatico"
}
```

---

## ✅ Checklist de Implementación

### Frontend
- [x] HTML toggle y container
- [x] CSS para warning box y sliders
- [x] Event handler para toggle
- [x] `generateMRDistributionSliders()`
- [x] `updateMRDistributionTotal()`
- [x] `sendMRDistribution()`
- [x] Variable global `window.mrDistributionManual`
- [x] Integración con `actualizarDesdeControlesSilent()`
- [x] Modificación de `cargarSimulacion()`
- [x] Body JSON con `mr_distritos_manuales`
- [x] Logs de debugging completos
- [x] Validación de límites
- [x] Feedback visual con colores

### Backend
- [ ] Endpoint acepta `mr_distritos_manuales` en body
- [ ] Validación de totales
- [ ] Uso de distribución manual en cálculos
- [ ] Respuesta incluye flag de modo usado
- [ ] Tests unitarios

---

## 📝 Notas Importantes

1. **Validación Client-Side**: Frontend valida que el total no exceda el límite ANTES de enviar al backend.

2. **Event Separation**: 
   - `input` event: Solo actualiza display (no llama backend)
   - `change` event: Envía al backend cuando usuario termina de ajustar

3. **Color Coding**: Los sliders usan colores de partidos para mejor UX.

4. **State Management**: Usa variable global `window.mrDistributionManual` para compartir datos entre componentes.

5. **Cleanup**: Al desactivar, limpia completamente el estado y recalcula con modo automático.

---

## 🎯 Ejemplo de Uso

1. Usuario activa toggle "Distribución Manual de Distritos MR"
2. Aparecen sliders para: MORENA, PAN, PRI, PVEM, PT, MC
3. Usuario asigna:
   - MORENA: 150 distritos
   - PAN: 80 distritos
   - PRI: 50 distritos
   - PVEM: 20 distritos
   - PT: 0 distritos
   - MC: 0 distritos
4. Total: 300/300 → ✅ Verde (perfecto)
5. Al soltar cada slider, se envía al backend
6. Backend recalcula seat_chart usando estos valores fijos
7. UI muestra resultados actualizados

---

**Fecha de creación**: 2025
**Autor**: GitHub Copilot
**Status**: ✅ Frontend Completo | ⏳ Backend Pendiente
