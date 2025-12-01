# 🆕 Primera Minoría (PM) para Diputados - Implementación Frontend

## ✅ Cambios Implementados

### 1. **Habilitación de PM en Diputados**

PM ya está **disponible y funcional** tanto para **Senado** como para **Diputados** cuando el sistema electoral es:
- **Mayoría Relativa (MR)**
- **Mixto (MR + RP)**

**No se muestra** cuando el sistema es **Representación Proporcional pura (RP)**.

---

## 📋 **Estructura de Datos del Backend**

El backend **YA envía** la información completa de PM en la respuesta. Ejemplo:

```json
{
  "resultados": [
    {
      "partido": "MORENA",
      "votos": 42000000,
      "mr": 150,
      "pm": 50,
      "rp": 80,
      "total": 280,
      "porcentaje_votos": 42.5,
      "porcentaje_escanos": 56.0
    }
  ],
  "kpis": {
    "total_escanos": 500,
    "total_mr": 300,
    "total_pm": 100,
    "total_rp": 200,
    "gallagher": 8.5
  }
}
```

---

## 🎨 **Interfaz de Usuario**

### Control de PM (Idéntico en Senado y Diputados)

La interfaz usa **los mismos estilos visuales** que ya existen para Senado:

```html
<div class="control-group" id="first-minority-group">
  <button class="group-toggle" data-target="first-minority">
    <span class="group-title">Primera Minoría</span>
    <svg class="chevron" width="12" height="12" viewBox="0 0 12 12">
      <path d="M4 2l4 4-4 4" stroke="currentColor" stroke-width="1.5" fill="none"/>
    </svg>
  </button>
  <div class="group-content" id="group-first-minority">
    <div class="control-item">
      <label class="control-label">¿Activar primera minoría?</label>
      <div class="toggle-switch">
        <div class="switch" id="first-minority-switch" data-switch="Off">
          <div class="switch-handle"></div>
        </div>
      </div>
    </div>
    <div class="control-item" id="first-minority-input-group" style="display:none;">
      <label class="control-label">
        Escaños por Primera Minoría: 
        <span id="input-first-minority-value">0</span>
      </label>
      <input 
        type="range" 
        class="control-slider" 
        id="input-first-minority" 
        min="0" 
        max="700" 
        step="1" 
        value="0"
      >
      <div id="first-minority-warning" style="display:none;">
        <!-- Mensajes de validación dinámicos -->
      </div>
    </div>
  </div>
</div>
```

---

## 🔧 **Lógica de Visibilidad**

### Archivos Modificados

#### 1. `components/panel_control/ControlSidebar.js`

**Función `initializeChamberControls()`** - Líneas ~1150-1180:

```javascript
if (selectedChamber === 'diputados') {
  // 🆕 PRIMERA MINORÍA TAMBIÉN DISPONIBLE PARA DIPUTADOS
  if (firstMinorityGroup) {
    const selectedElectoralRule = this.querySelector('input[name="electoral-rule"]:checked');
    const electoralValue = selectedElectoralRule ? selectedElectoralRule.value : 'mixto';
    const shouldShowFirstMinority = electoralValue === 'mr' || electoralValue === 'mixto';
    
    firstMinorityGroup.style.display = shouldShowFirstMinority ? 'block' : 'none';
  }
}
```

**Listeners de cambio de cámara** - Líneas ~414-450:

```javascript
if (selectedChamber === 'diputados') {
  // Show PM for deputies when MR or Mixto
  if (firstMinorityGroup) {
    const shouldShowFirstMinority = electoralValue === 'mr' || electoralValue === 'mixto';
    firstMinorityGroup.style.display = shouldShowFirstMinority ? 'block' : 'none';
  }
}
```

#### 2. `scripts/script_general/script.js`

**Event Listeners Sistema Electoral** - Líneas ~128-162:

```javascript
// 🆕 Función para controlar visibilidad de Primera Minoría
function updateFirstMinorityVisibility() {
  const firstMinorityGroup = document.getElementById('first-minority-group');
  if (!firstMinorityGroup) return;
  
  const currentChamber = getCurrentChamber();
  const selectedElectoralRule = document.querySelector('input[name="electoral-rule"]:checked');
  const electoralValue = selectedElectoralRule ? selectedElectoralRule.value : 'mixto';
  
  // PM visible en ambas cámaras cuando el sistema es MR o Mixto
  const shouldShowFirstMinority = electoralValue === 'mr' || electoralValue === 'mixto';
  
  firstMinorityGroup.style.display = shouldShowFirstMinority ? 'block' : 'none';
  
  console.log(`[DEBUG] Primera Minoría ${shouldShowFirstMinority ? 'MOSTRADA' : 'OCULTADA'} - Cámara: ${currentChamber}, Sistema: ${electoralValue}`);
}

// Listener en los radios del sistema electoral
electoralRuleRadios.forEach(radio => {
  radio.addEventListener('change', function() {
    // ... código existente ...
    updateFirstMinorityVisibility();
  });
});
```

---

## ✅ **Validaciones Automáticas**

### Límites de PM según MR

PM **no puede exceder** los escaños de MR. El sistema actualiza automáticamente:

```javascript
const updateFirstMinorityLimits = () => {
  const mrActual = parseInt(mrSlider.value);
  const magnitudTotal = getMagnitudTotal();
  
  // El máximo de PM no puede superar MR
  const maxFirstMinority = Math.min(mrActual, magnitudTotal);
  firstMinoritySlider.max = maxFirstMinority;
  
  // Si el valor actual supera el límite, ajustarlo
  if (currentFirstMinority > maxFirstMinority) {
    firstMinoritySlider.value = maxFirstMinority;
    // Actualizar UI y recalcular
  }
};
```

### Mensajes de Advertencia

```javascript
if (finalFirstMinority >= maxFirstMinority * 0.8) {
  // Advertencia: cerca del límite
  firstMinorityWarning.innerHTML = `Límite: máx ${maxFirstMinority} escaños (MR disponibles)`;
  firstMinorityWarning.style.color = '#f59e0b';
} else if (finalFirstMinority > 0) {
  // Información: porcentaje usado
  const percentageOfMr = Math.round((finalFirstMinority / mrActual) * 100);
  firstMinorityWarning.innerHTML = `${percentageOfMr}% de escaños MR (${finalFirstMinority}/${mrActual})`;
  firstMinorityWarning.style.color = '#6B7280';
}
```

---

## 📊 **Envío al Backend**

### Parámetros en la petición

```javascript
// En cargarSimulacion() - script.js línea ~368
async function cargarSimulacion({
  anio, 
  camara, 
  modelo, 
  mr_seats, 
  rp_seats, 
  pm_seats,  // 🆕 Escaños PM
  escanos_totales,
  // ... otros parámetros
}) {
  // PM se envía como query param
  if (typeof pm_seats !== 'undefined' && pm_seats !== null) {
    const pmSeatsRounded = Math.round(pm_seats);
    url += `&pm_seats=${pmSeatsRounded}`;
  }
}
```

### Lectura desde el slider

```javascript
// En actualizarDesdeControles() - script.js línea ~1428
const pmSwitch = document.getElementById('first-minority-switch');
const pmSlider = document.getElementById('input-first-minority');

let pm_seats = undefined;
if (pmSwitch && pmSlider && pmSwitch.getAttribute('data-switch') === 'On') {
  pm_seats = Math.round(parseFloat(pmSlider.value));
  console.log('[DEBUG] PM Slider leído:', pm_seats);
}

// Se pasa a cargarSimulacion()
await cargarSimulacion({
  // ... otros parámetros
  pm_seats,
  // ...
});
```

---

## 🎯 **Comportamiento Esperado**

### Escenario 1: Sistema Mixto (MR + RP)

```
Total: 500 escaños
MR: 300
RP: 200

Usuario activa PM y selecciona 100 escaños
→ PM toma 100 de los 300 MR
→ Backend calcula distribución:
  - MR restantes: 200 (300 - 100)
  - PM: 100
  - RP: 200
```

### Escenario 2: Sistema MR Puro

```
Total: 300 escaños
MR: 300

Usuario activa PM y selecciona 64 escaños
→ PM toma 64 de los 300 MR
→ Backend calcula:
  - MR restantes: 236 (300 - 64)
  - PM: 64
  - RP: 0
```

### Escenario 3: Sistema RP Puro

```
PM no se muestra (lógicamente inconsistente)
```

---

## 🧪 **Pruebas Recomendadas**

### Test 1: Visibilidad correcta
1. Cambiar a Diputados
2. Sistema Mixto → PM visible ✅
3. Sistema MR → PM visible ✅
4. Sistema RP → PM oculta ✅

### Test 2: Validación de límites
1. Activar PM en Mixto con MR=300
2. Mover slider PM a 350
3. Sistema debe ajustar a 300 (máximo MR)

### Test 3: Envío al backend
1. Activar PM con 100 escaños
2. Verificar en Network que `pm_seats=100` va en la URL
3. Verificar respuesta del backend incluye desglose MR/PM/RP

### Test 4: Cambio de sistema electoral
1. Activar PM en Mixto
2. Cambiar a RP → PM se oculta
3. Cambiar a MR → PM se muestra de nuevo
4. Valores se preservan

---

## 📝 **Resumen de Cambios**

### ✅ Completado

- ✅ PM habilitada para Diputados (además de Senado)
- ✅ Visibilidad controlada por sistema electoral (MR/Mixto)
- ✅ Validaciones automáticas de límites
- ✅ Envío correcto de `pm_seats` al backend
- ✅ Mensajes de advertencia informativos
- ✅ Estilos visuales reutilizados de Senado

### 🎨 Estilos Heredados

Los estilos de PM son los mismos que usa Senado:
- `.control-group` - Grupo expandible
- `.control-slider` - Slider de rango
- `.switch` - Toggle on/off
- `.control-label` - Etiquetas
- `#first-minority-warning` - Mensajes dinámicos

No se crearon estilos nuevos, todo reutiliza la infraestructura existente.

---

## 🚀 **Próximos Pasos Opcionales**

### Frontend (si se requiere visualización adicional)

1. **Tabla de resultados detallados**
   - Añadir columna "PM" junto a "MR" y "RP"
   - Resaltar con color distintivo (ej: morado #8b5cf6)

2. **KPI de PM**
   - Mostrar total de escaños PM en dashboard
   - Indicador visual de % PM vs MR

3. **Tooltips explicativos**
   - Info sobre qué es PM
   - Cuándo tiene sentido activarlo

### Backend (si no está completo)

1. Asegurar que `pm_seats` se use en el cálculo
2. Devolver desglose MR/PM/RP en cada partido
3. Validar que PM ≤ MR

---

## 📌 **Referencias Rápidas**

- **Switch PM**: `#first-minority-switch`
- **Slider PM**: `#input-first-minority`
- **Valor PM**: `#input-first-minority-value`
- **Advertencias**: `#first-minority-warning`
- **Grupo contenedor**: `#first-minority-group`

---

## 🔍 **Debug**

Para verificar que PM se envía correctamente:

```javascript
// En consola del navegador
console.log(window.debugLastRequest);
// Buscar: pm_seats en queryParams o body
```

---

**Fecha de implementación**: 25 de septiembre de 2025  
**Archivos modificados**: 
- `components/panel_control/ControlSidebar.js`
- `scripts/script_general/script.js`

**Estado**: ✅ **Implementado y listo para pruebas**
