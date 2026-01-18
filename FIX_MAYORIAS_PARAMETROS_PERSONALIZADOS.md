# 🔧 FIX: Enviar Parámetros Personalizados a Mayorías Forzadas

## 🐛 Problema Detectado

El frontend estaba enviando solicitudes de **mayoría forzada** al backend pero **NO estaba incluyendo los parámetros de configuración personalizada** cuando el usuario había configurado un plan personalizado.

### Error del backend:
```json
{
  "detail": "Error calculando mayoría forzada: 'JSONResponse' object is not subscriptable"
}
```

### Causa raíz:
Cuando el frontend manda un **plan personalizado** (ej: 128 escaños, 64 MR + 64 RP), el backend necesita saber:
- Cuántos escaños totales tiene el sistema
- Cuántos son de Mayoría Relativa (MR)
- Cuántos son de Representación Proporcional (RP)
- Qué sistema electoral usar (mixto, mr, rp)

**Sin estos parámetros**, el backend no puede recalcular correctamente la mayoría forzada.

---

## ✅ Solución Implementada

### **Archivo modificado:**
- `components/panel_control/ControlSidebar.js` (función `calcularMayoriaForzada`)

### **Cambios realizados:**

#### **1. Captura de parámetros personalizados** (Líneas ~2540-2565)

Antes solo se capturaban:
```javascript
const plan = modelSelect ? modelSelect.value : 'vigente';
const anio = yearSelect ? parseInt(yearSelect.value) : 2024;
```

Ahora también se capturan:
```javascript
// 🆕 Obtener parámetros de configuración personalizada
const magnitudSlider = document.getElementById('input-magnitud');
const mrSlider = document.getElementById('input-mr');
const rpSlider = document.getElementById('input-rp');
const electoralRuleRadio = document.querySelector('input[name="electoral-rule"]:checked');
const topesSwitch = document.getElementById('topes-switch');

const escanosTotales = magnitudSlider ? parseInt(magnitudSlider.value) : 500;
const mrSeats = mrSlider ? parseInt(mrSlider.value) : 300;
const rpSeats = rpSlider ? parseInt(rpSlider.value) : 200;
const sistema = electoralRuleRadio ? electoralRuleRadio.value : 'mixto';
const aplicarTopes = topesSwitch ? topesSwitch.classList.contains('active') : true;
```

#### **2. Envío condicional al backend** (Líneas ~2580-2605)

Se agregó lógica para detectar planes personalizados y enviar parámetros adicionales:

```javascript
const params = new URLSearchParams({
  partido: partido,
  tipo_mayoria: tipoMayoria,
  plan: plan,
  aplicar_topes: aplicarTopes.toString(),
  anio: anio.toString()
});

// 🆕 Agregar parámetros de configuración personalizada
if (plan === 'personalizado' || !['vigente', 'reforma_2024'].includes(plan)) {
  params.append('escanos_totales', escanosTotales.toString());
  params.append('mr_seats', mrSeats.toString());
  params.append('rp_seats', rpSeats.toString());
  params.append('sistema', sistema);
  
  console.log('[MAYORÍAS] 🔧 Plan personalizado detectado, enviando configuración:', {
    escanos_totales: escanosTotales,
    mr_seats: mrSeats,
    rp_seats: rpSeats,
    sistema: sistema
  });
}
```

---

## 📊 Ejemplos de Llamadas

### **Plan predefinido (vigente):**
```http
GET /calcular/mayoria_forzada?
  partido=MORENA
  &tipo_mayoria=simple
  &plan=vigente
  &aplicar_topes=true
  &anio=2024
```
✅ No necesita parámetros adicionales (el backend conoce la configuración)

### **Plan personalizado (128 escaños):**
```http
GET /calcular/mayoria_forzada?
  partido=MORENA
  &tipo_mayoria=simple
  &plan=personalizado
  &aplicar_topes=true
  &anio=2024
  &escanos_totales=128
  &mr_seats=64
  &rp_seats=64
  &sistema=mixto
```
✅ Incluye parámetros personalizados para que el backend recalcule correctamente

### **Plan no predefinido (240_160):**
```http
GET /calcular/mayoria_forzada?
  partido=PAN
  &tipo_mayoria=calificada
  &plan=240_160_sin_topes
  &aplicar_topes=false
  &anio=2024
  &escanos_totales=400
  &mr_seats=240
  &rp_seats=160
  &sistema=mixto
```
✅ Detecta que no es un plan estándar y envía configuración

---

## 🔍 Detección de Planes Personalizados

El código detecta planes personalizados usando:

```javascript
if (plan === 'personalizado' || !['vigente', 'reforma_2024'].includes(plan)) {
  // Enviar parámetros adicionales
}
```

**Planes que NO necesitan parámetros adicionales:**
- `vigente` (500 escaños: 300 MR + 200 RP)
- `reforma_2024` (configuración predefinida)

**Planes que SÍ necesitan parámetros adicionales:**
- `personalizado` (configurado por el usuario)
- `240_160_sin_topes` (no está en la lista de predefinidos)
- `240_160_con_topes`
- Cualquier otro plan custom

---

## 🧪 Testing

### **Test 1: Plan vigente (sin parámetros extra)**
1. Configurar plan: "Vigente"
2. Activar mayorías
3. Seleccionar MORENA, mayoría simple
4. ✅ Verificar: NO se envían `escanos_totales`, `mr_seats`, etc.
5. ✅ Verificar: Backend responde correctamente

### **Test 2: Plan personalizado de 128 escaños**
1. Configurar plan: "Personalizado"
2. Ajustar magnitud a 128
3. MR = 64, RP = 64
4. Activar mayorías, seleccionar PAN, mayoría simple
5. ✅ Verificar: Se envían `escanos_totales=128`, `mr_seats=64`, `rp_seats=64`, `sistema=mixto`
6. ✅ Verificar: Backend recalcula con configuración correcta

### **Test 3: Sistema puro MR**
1. Configurar sistema: Mayoría Relativa (puro)
2. Magnitud = 300
3. Activar mayorías
4. ✅ Verificar: Se envía `sistema=mr`
5. ✅ Verificar: Backend respeta sistema puro

### **Test 4: Cambio de topes**
1. Configurar plan personalizado
2. Desactivar topes
3. Activar mayorías
4. ✅ Verificar: Se envía `aplicar_topes=false`
5. ✅ Verificar: Backend no aplica límite del 60%

---

## 📝 Logs para Debugging

El sistema ahora genera logs claros:

```javascript
console.log('[MAYORÍAS] 📋 Parámetros:', { 
  partido, tipoMayoria, camara, anio, plan,
  escanosTotales, mrSeats, rpSeats, sistema, aplicarTopes
});

console.log('[MAYORÍAS] 🔧 Plan personalizado detectado, enviando configuración:', {
  escanos_totales: escanosTotales,
  mr_seats: mrSeats,
  rp_seats: rpSeats,
  sistema: sistema
});
```

**Revisar la consola** para verificar que los parámetros se envíen correctamente.

---

## 🎯 Beneficios

✅ **Mayorías forzadas funcionan con configuraciones personalizadas**
✅ **Backend puede recalcular correctamente con cualquier configuración**
✅ **No se rompe compatibilidad con planes predefinidos**
✅ **Logs claros para debugging**
✅ **Código más robusto y completo**

---

## 🔗 Integración con Backend

El backend debe recibir estos parámetros en el endpoint `/calcular/mayoria_forzada`:

```python
@app.get("/calcular/mayoria_forzada")
async def calcular_mayoria_forzada(
    partido: str,
    tipo_mayoria: str,  # "simple" o "calificada"
    plan: str,
    aplicar_topes: bool,
    anio: int,
    escanos_totales: Optional[int] = None,  # ← NUEVO
    mr_seats: Optional[int] = None,         # ← NUEVO
    rp_seats: Optional[int] = None,         # ← NUEVO
    sistema: Optional[str] = None           # ← NUEVO
):
    # Usar estos parámetros para recalcular con configuración personalizada
    ...
```

---

**Fecha de implementación:** 15 de enero de 2026  
**Desarrollador:** GitHub Copilot + Usuario  
**Estado:** ✅ Implementado y listo para testing
