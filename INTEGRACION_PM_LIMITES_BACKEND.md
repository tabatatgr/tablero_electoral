# Integración de Límites Dinámicos de Primera Minoría con Backend

## 📋 Resumen de Cambios

Se ha integrado el endpoint del backend `/calcular-limites-pm` para obtener límites dinámicos de Primera Minoría (PM) basados en el sistema electoral, escaños totales y escaños MR.

## 🔧 Cambios Realizados

### 1. Nueva Función: `fetchPMLimitsFromBackend()`

**Ubicación**: `components/panel_control/ControlSidebar.js` (línea ~787)

**Funcionalidad**:
- Determina automáticamente el sistema electoral según la distribución MR/RP
- Llama al endpoint `/calcular-limites-pm` del backend
- Retorna objeto con límites calculados: `max_pm`, `valido`, `descripcion`, `sistema`
- Incluye fallback local si el backend no está disponible

**Ejemplo de uso**:
```javascript
const limits = await fetchPMLimitsFromBackend();
// {
//   max_pm: 200,
//   valido: true,
//   descripcion: "Sistema mixto: PM puede ser hasta 200 (escaños MR)",
//   sistema: "mixto"
// }
```

### 2. Función Actualizada: `updateFirstMinorityLimits()`

**Ubicación**: `components/panel_control/ControlSidebar.js` (línea ~835)

**Cambios**:
- Ahora es una función `async` que consulta el backend
- Actualiza el atributo `max` del slider dinámicamente
- Deshabilita el slider si PM no es válido para el sistema actual
- Muestra mensajes descriptivos del backend en el warning
- Logs detallados con prefijo `[PM LIMITS]`

**Comportamiento**:
- **Sistema Mixto**: PM max = escaños MR
- **Sistema MR puro**: PM max = escaños totales
- **Sistema RP puro**: PM deshabilitado (max = 0, valido = false)

### 3. Triggers Automáticos de Actualización

Se agregaron llamadas a `updateFirstMinorityLimits()` en los siguientes eventos:

#### a) Cambio de Cámara (Diputados ↔ Senadores)
**Ubicación**: Línea ~456
```javascript
setTimeout(() => {
  if (typeof updateFirstMinorityLimits === 'function') {
    updateFirstMinorityLimits();
    console.log(`[PM LIMITS] Límites actualizados tras cambio de cámara a ${selectedChamber}`);
  }
}, 100);
```

#### b) Cambio de Magnitud Total
**Ubicación**: Línea ~604
```javascript
magnitudeSlider.addEventListener('input', function() {
  magnitudeValue.textContent = this.value;
  
  setTimeout(() => {
    if (typeof updateFirstMinorityLimits === 'function') {
      updateFirstMinorityLimits();
      console.log(`[PM LIMITS] Límites actualizados tras cambio de magnitud: ${this.value}`);
    }
  }, 100);
});
```

#### c) Cambio de Escaños MR/RP
**Ubicación**: Líneas ~662 y ~695 (ya existentes)
```javascript
// En handleMrChange()
updateFirstMinorityLimits();

// En handleRpChange()
updateFirstMinorityLimits();
```

#### d) Cambio de Sistema Electoral (MR/Mixto/RP)
**Ubicación**: Línea ~1123
```javascript
setTimeout(() => {
  if (typeof updateFirstMinorityLimits === 'function') {
    updateFirstMinorityLimits();
    console.log(`[PM LIMITS] Límites actualizados tras cambio de sistema electoral: ${this.value}`);
  }
}, 100);
```

## 🎯 Resultados

### Antes
- Límite de PM hardcodeado a 64 o 700
- No se validaba según el sistema electoral
- Slider siempre habilitado incluso en sistemas donde PM no aplica

### Después
- Límite de PM calculado dinámicamente por el backend
- Validación automática según sistema electoral
- Slider deshabilitado cuando PM no es válido
- Mensajes descriptivos del backend
- Actualización automática al cambiar cualquier parámetro relevante

## 📊 Ejemplos de Funcionamiento

### Ejemplo 1: Sistema Mixto - 400 escaños (200 MR + 200 RP)
```
Endpoint: /calcular-limites-pm?sistema=mixto&escanos_totales=400&mr_seats=200
Response: {
  "max_pm": 200,
  "valido": true,
  "descripcion": "Sistema mixto: PM puede ser hasta 200 (escaños MR)"
}
Resultado: Slider PM max=200, habilitado
```

### Ejemplo 2: Sistema MR Puro - 300 escaños
```
Endpoint: /calcular-limites-pm?sistema=mr&escanos_totales=300&mr_seats=300
Response: {
  "max_pm": 300,
  "valido": true,
  "descripcion": "Sistema MR puro: PM puede ser hasta 300 (todos los escaños)"
}
Resultado: Slider PM max=300, habilitado
```

### Ejemplo 3: Sistema RP Puro - 200 escaños
```
Endpoint: /calcular-limites-pm?sistema=rp&escanos_totales=200&mr_seats=0
Response: {
  "max_pm": 0,
  "valido": false,
  "descripcion": "Sistema RP puro: Primera Minoría no es válida"
}
Resultado: Slider PM deshabilitado, valor=0
```

## 🔍 Debugging

### Logs en Consola

Buscar en la consola del navegador:
```
[PM LIMITS] Consultando backend: https://back-electoral.onrender.com/calcular-limites-pm?...
[PM LIMITS] Respuesta backend: {...}
[PM LIMITS] Límite actualizado: max 200 | Sistema: mixto | ...
[PM LIMITS] Límites actualizados tras cambio de cámara a diputados
[PM LIMITS] Límites actualizados tras cambio de magnitud: 400
[PM LIMITS] Límites actualizados tras cambio de sistema electoral: mixto
```

### Fallback Local

Si el backend no está disponible:
```
[PM LIMITS] Error consultando backend: TypeError: Failed to fetch
[PM LIMITS] Usando cálculo local: max=200, valido=true, descripcion="Calculado localmente (backend no disponible)"
```

## ✅ Testing

### Checklist de Pruebas

- [ ] **Sistema Mixto**: Cambiar MR/RP → PM max se actualiza correctamente
- [ ] **Sistema MR**: PM max = escaños totales
- [ ] **Sistema RP**: PM deshabilitado, mensaje de error visible
- [ ] **Cambio de Cámara**: Diputados (500) → Senadores (128) → PM max se actualiza
- [ ] **Cambio de Magnitud**: Aumentar/disminuir magnitud → PM max se ajusta
- [ ] **Backend Offline**: Fallback local funciona, no rompe la UI
- [ ] **Mensajes de Warning**: Se muestran correctamente según el límite
- [ ] **Slider Deshabilitado**: En RP puro, slider no permite cambios

## 🚀 Próximos Pasos (Opcional)

1. **Caché de Respuestas**: Evitar llamadas redundantes al backend
2. **Loading State**: Mostrar indicador mientras se consulta el backend
3. **Error Handling Mejorado**: Reintentos automáticos si falla la primera llamada
4. **Tests Unitarios**: Validar lógica de determinación de sistema (MR/Mixto/RP)
5. **Tooltip Explicativo**: Hover sobre slider PM con descripción del backend

## 📝 Notas Técnicas

### Determinación Automática del Sistema
```javascript
let sistema = 'mixto';
if (mrActual === magnitudTotal) {
  sistema = 'mr';      // 100% MR
} else if (mrActual === 0) {
  sistema = 'rp';      // 100% RP
}
```

### Timing de Actualizaciones
Se usa `setTimeout(..., 100)` para asegurar que:
- Las funciones estén definidas en el scope
- Los valores de los sliders estén actualizados
- No se bloquee el hilo principal

### Compatibilidad
- La función `updateFirstMinorityLimits` ahora es `async`
- Las llamadas sin `await` funcionan correctamente (promesas no bloqueantes)
- Fallback local asegura funcionamiento offline

---

**Fecha**: 2024
**Autor**: GitHub Copilot
**Backend Endpoint**: `https://back-electoral.onrender.com/calcular-limites-pm`
