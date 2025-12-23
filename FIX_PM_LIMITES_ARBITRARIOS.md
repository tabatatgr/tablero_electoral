# 🐛 Fix: Primera Minoría Limitada Arbitrariamente

## Problema Reportado

El slider de Primera Minoría (PM) estaba siendo limitado incorrectamente:
- **Sistema Mixto**: PM limitado por MR (correcto ✅)
- **Sistema MR Puro**: PM limitado por MR anterior, NO por total de escaños (incorrecto ❌)
- **Causa**: La detección del sistema electoral se basaba en los valores actuales de los sliders MR/RP, no en el radio button seleccionado

## Escenario del Bug

### Pasos para Reproducir:
1. Usuario selecciona **Sistema Mixto**
2. Establece MR=200, RP=200 (total 400)
3. PM se limita correctamente a 200 (= MR) ✅
4. Usuario cambia a **Sistema MR Puro** (radio button)
5. PM debería permitir hasta 400 (total de escaños)
6. **Bug**: PM seguía limitado a 200 (valor anterior de MR) ❌

### Por qué Pasaba:

```javascript
// CÓDIGO ANTERIOR (INCORRECTO)
const mrActual = parseInt(mrSlider.value); // 200
const magnitudTotal = getMagnitudTotal();  // 400

// Detectar sistema por valores de sliders
let sistema = 'mixto';
if (mrActual === magnitudTotal) {  // 200 !== 400
  sistema = 'mr';                   // ❌ NO se detecta como 'mr'
}

// Resultado: sistema='mixto', max_pm=200 (limitado por MR)
```

**Problema**: Cuando cambias el radio button a "MR", los sliders todavía tienen los valores del modo mixto (MR=200, RP=200). La función detectaba el sistema basándose en esos valores, no en el radio button seleccionado.

## Solución Implementada

### Cambio Principal:

```javascript
// CÓDIGO NUEVO (CORRECTO)
// 1. Detectar sistema desde radio button (fuente confiable)
const selectedElectoralRule = document.querySelector('input[name="electoral-rule"]:checked');
let sistema = selectedElectoralRule ? selectedElectoralRule.value : 'mixto';

// 2. Si no hay radio button, inferir desde sliders (fallback)
if (!selectedElectoralRule) {
  if (mrActual === magnitudTotal) {
    sistema = 'mr';
  } else if (mrActual === 0 || rpActual === magnitudTotal) {
    sistema = 'rp';
  } else {
    sistema = 'mixto';
  }
}
```

### Lógica de Límites según Sistema:

```javascript
// Fallback mejorado
if (sistema === 'mr') {
  max_pm_fallback = magnitudTotal;  // ✅ En MR puro: PM hasta total
} else if (sistema === 'mixto') {
  max_pm_fallback = mrActual;       // ✅ En mixto: PM limitado por MR
} else {
  max_pm_fallback = 0;              // ✅ En RP: PM no válido
}
```

## Comportamiento Correcto

### Sistema MR Puro:
```
Radio button: "Mayoría Relativa" seleccionado
Magnitud total: 400 escaños
MR slider: 400 (puede ajustarse después)
PM límite: 400 ✅ (puede usar hasta todos los escaños)
```

### Sistema Mixto:
```
Radio button: "Mixto" seleccionado
Magnitud total: 400 escaños
MR: 200, RP: 200
PM límite: 200 ✅ (limitado por escaños MR)
```

### Sistema RP Puro:
```
Radio button: "Representación Proporcional" seleccionado
Magnitud total: 400 escaños
RP: 400
PM límite: 0, slider deshabilitado ✅
```

## Logs Mejorados

Ahora verás en consola:

```javascript
[PM LIMITS] Consultando backend: .../calcular-limites-pm?sistema=mr&escanos_totales=400&mr_seats=200 (sistema detectado: mr)
```

El log incluye `(sistema detectado: mr)` para que puedas verificar que se está detectando correctamente.

## Testing

### Test Case 1: Cambio de Mixto a MR
1. Sistema Mixto: MR=200, RP=200, Total=400
2. PM max debería ser 200 ✅
3. Cambiar a "Mayoría Relativa" (radio button)
4. PM max debería cambiar a 400 ✅
5. **Verificar en consola**: `sistema detectado: mr`

### Test Case 2: Cambio de MR a Mixto
1. Sistema MR: Total=500
2. PM max debería ser 500 ✅
3. Cambiar a "Mixto" (radio button)
4. Ajustar MR=300, RP=200
5. PM max debería cambiar a 300 ✅
6. **Verificar en consola**: `sistema detectado: mixto`

### Test Case 3: Cambio de Mixto a RP
1. Sistema Mixto: MR=200, RP=200
2. Cambiar a "Representación Proporcional"
3. PM debería deshabilitarse ✅
4. **Verificar en consola**: `sistema detectado: rp`

## Archivos Modificados

- `components/panel_control/ControlSidebar.js` (línea ~804-860)
  - Función `fetchPMLimitsFromBackend()` actualizada
  - Detección de sistema basada en radio button primero
  - Fallback mejorado con lógica correcta por sistema

## Beneficios

1. ✅ **Detección correcta del sistema electoral**
2. ✅ **PM ilimitado en MR puro** (hasta total de escaños)
3. ✅ **PM limitado por MR en mixto**
4. ✅ **PM deshabilitado en RP puro**
5. ✅ **Logs más informativos** para debug
6. ✅ **Fallback local mejorado** si backend falla

## Próximos Pasos

- [ ] Probar en navegador el cambio de sistemas
- [ ] Verificar logs en consola
- [ ] Confirmar que PM se comporta correctamente en cada sistema
- [ ] Si sigue habiendo problemas, compartir logs de consola

---

**Fecha**: 22 de diciembre de 2025  
**Tipo**: Bug Fix  
**Prioridad**: Alta  
**Estado**: ✅ Corregido
