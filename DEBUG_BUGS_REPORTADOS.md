# 🐛 Debug: Bugs Reportados por Usuario

## Fecha: 18 de diciembre de 2025

## 🔴 Bugs Identificados

### 1. **Tamaño de Cámara se Resiste a Cambiar**
**Síntoma**: Al seleccionar modo personalizado, el slider de magnitud no quiere cambiar o se mantiene en 128/135.

**Posibles Causas**:
- ✅ Límites `max` del slider según cámara:
  - Senadores: `max=128`
  - Diputados: `max=500`
  - Línea 568 en `ControlSidebar.js`
  
- ⚠️ La función `updateSliderLimits()` puede estar reseteando valores automáticamente
  - Línea ~753 en `ControlSidebar.js`
  - Tiene lógica de auto-ajuste cuando `allowAdjust = true`

- ⚠️ Puede haber conflicto entre:
  - Valor que el usuario establece manualmente
  - Valor que el backend devuelve
  - Valor que se sincroniza desde datos vigentes

**Archivos Involucrados**:
- `components/panel_control/ControlSidebar.js`: Líneas 540-590, 753-785
- `scripts/script_general/script.js`: Líneas 1434, 1646

**Logs a Buscar en Consola**:
```
[DEBUG] Modelo cambiado a: personalizado
[DEBUG] updateSliderLimits: cambio de magnitud detectado
[DEBUG] mrSlider recortado a tope de cámara
```

---

### 2. **Año se Reinicia a 2018 Automáticamente**
**Síntoma**: Usuario selecciona un año diferente (ej: 2021, 2024) pero se reinicia a 2018 de la nada.

**Causa Identificada**: ✅ ENCONTRADA
- Cuando el usuario **desactiva las coaliciones**, se fuerza el año a 2018
- Línea 1346 en `ControlSidebar.js`:
  ```javascript
  } else {
    // Coaliciones desactivadas: cambiar a 2018
    yearSelect.value = '2018';
  }
  ```

**Escenario Problemático**:
1. Usuario selecciona año 2021
2. Usuario desactiva switch de coaliciones
3. Sistema automáticamente cambia a 2018
4. Usuario se confunde porque no pidió cambio de año

**Archivos Involucrados**:
- `components/panel_control/ControlSidebar.js`: Líneas 1330-1365
- `scripts/script_general/script.js`: Línea 396

**Logs a Buscar en Consola**:
```
[DEBUG] Coaliciones desactivadas: cambiando a año 2018 para diputados
[DEBUG] 🚫 Coaliciones desactivadas: usando año 2018 por defecto
```

---

## 🔧 Soluciones Propuestas

### Para Bug #1: Tamaño de Cámara
**Opción A**: Remover auto-ajuste agresivo
- Cambiar `updateSliderLimits(true)` a `updateSliderLimits(false)` en ciertos contextos
- Solo actualizar `min`/`max` sin reescribir valores

**Opción B**: Respetar valor manual del usuario
- Agregar flag `userSetValue` para detectar cambios manuales
- No sobrescribir si el usuario acabó de mover el slider

**Opción C**: Logging mejorado
- Agregar más logs para identificar exactamente dónde se resetea

---

### Para Bug #2: Año se Reinicia a 2018
**Opción A**: ✅ RECOMENDADA - No forzar cambio de año
- Eliminar el cambio automático de año cuando se desactivan coaliciones
- Permitir que el usuario mantenga el año que seleccionó
- Solo validar que el año sea compatible con la cámara

**Opción B**: Mostrar confirmación al usuario
- Antes de cambiar el año, preguntar: "¿Desea cambiar a 2018?"
- Dar opción de mantener año actual

**Opción C**: Solo cambiar si es necesario
- Verificar si el año actual tiene datos de coaliciones
- Solo cambiar si el año seleccionado REQUIERE coaliciones pero están desactivadas

---

## 📋 Plan de Acción

### Prioridad Alta
1. **Remover cambio automático de año a 2018**
   - Usuario reporta que es muy molesto
   - Cambio simple: comentar o eliminar líneas 1346-1347

### Prioridad Media
2. **Investigar reseteo de magnitud**
   - Necesitamos reproducir el bug
   - Agregar logs temporales para debug
   - Identificar secuencia exacta de eventos

### Tests a Realizar
- [ ] Cambiar a personalizado, mover magnitud, cambiar cámara → ¿se resetea?
- [ ] Mover magnitud manualmente, luego cambiar MR/RP → ¿se auto-ajusta?
- [ ] Seleccionar año 2021, desactivar coaliciones → ¿cambia a 2018?
- [ ] Activar coaliciones, luego desactivar → ¿cambia año?

---

## 🔍 Comandos de Debug Útiles

### En Consola del Navegador:
```javascript
// Ver valor actual de magnitud
document.getElementById('input-magnitud').value

// Ver listeners activos
getEventListeners(document.getElementById('input-magnitud'))

// Monitorear cambios de magnitud
let oldVal = document.getElementById('input-magnitud').value;
setInterval(() => {
  let newVal = document.getElementById('input-magnitud').value;
  if (oldVal !== newVal) {
    console.trace('Magnitud cambió:', oldVal, '→', newVal);
    oldVal = newVal;
  }
}, 100);

// Ver año actual
document.getElementById('year-select').value

// Ver estado de coaliciones
document.getElementById('coalition-switch').classList.contains('active')
```

---

## 💡 Observaciones

### Interacciones Complejas Detectadas:
1. **Cambio de Cámara** → afecta año, magnitud, MR/RP, PM
2. **Cambio de Modelo** → afecta max de sliders
3. **Cambio de Coaliciones** → fuerza año 2018/2024
4. **Auto-ajuste MR/RP** → puede trigger cambio de magnitud
5. **Sincronización con Backend** → puede sobrescribir valores locales

### Riesgo de "Cascadas de Cambios":
```
Usuario cambia magnitud
  → Trigger updateSliderLimits()
    → Auto-ajusta MR/RP
      → Trigger handleMrChange()
        → Llama actualizarDesdeControles()
          → Backend devuelve valores
            → Frontend sincroniza (posible reseteo)
```

---

## 📝 Próximos Pasos

1. ✅ **Documentar bugs** (este archivo)
2. ⏳ **Reproducir bug de magnitud** con pasos específicos
3. ⏳ **Implementar fix para año 2018**
4. ⏳ **Agregar logs de debug temporales**
5. ⏳ **Testing exhaustivo después de fixes**

---

**Autor**: GitHub Copilot  
**Usuario**: pablo  
**Prioridad**: Alta (afecta UX significativamente)
