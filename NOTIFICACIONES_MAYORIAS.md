# ✅ Notificaciones Agregadas - Mayoría Forzada

## 🔔 Notificaciones Implementadas

### 1. **Notificación "Calculando..."**
```javascript
// Se muestra al iniciar el cálculo
window.notifications.show({
  title: 'Calculando mayoría forzada...',
  type: 'loading',
  autoHide: false,
  id: 'mayoria-calculating'
});
```

**Cuándo aparece:**
- Al cambiar tipo de mayoría (Simple ↔ Calificada)
- Al cambiar partido/coalición
- Al seleccionar un partido diferente
- Al cambiar año, cámara o modelo

---

### 2. **Notificación de Éxito**
```javascript
// Se muestra cuando el cálculo termina correctamente
window.notifications.success(
  `Mayoría ${tipoTexto} calculada`,
  `${partido} necesita ${votosNecesarios}% de votos para alcanzar la mayoría`,
  5000  // 5 segundos
);
```

**Ejemplo:**
```
✅ Mayoría simple calculada
MORENA necesita 47.50% de votos para alcanzar la mayoría
```

---

### 3. **Notificación de Error**
```javascript
// Si el backend falla o hay error de red
window.notifications.error(
  'Error al calcular mayoría',
  error.message || 'No se pudo conectar con el servidor',
  5000
);
```

**Ejemplo:**
```
❌ Error al calcular mayoría
No se pudo conectar con el servidor
```

---

## 📊 Problema: Tabla de Distritos NO se Actualiza

### **Diagnóstico:**

El backend envía estos datos:
```json
{
  "votos_custom": {
    "MORENA": 47.50,
    "PAN": 18.64,
    ...
  },
  "mr_distritos_manuales": {
    "MORENA": 162,
    "PAN": 60,
    ...
  },
  "mr_distritos_por_estado": {
    "1": {"MORENA": 2, "PAN": 1},  // Aguascalientes
    "2": {"MORENA": 4, "PAN": 3},  // Baja California
    ...
  }
}
```

**Estos datos SE GUARDAN en `window.mayoriaForzadaData`** ✅

**Pero NO se usan para actualizar:**
- ❌ Tabla de distritos por estado
- ❌ Sliders de distribución MR
- ❌ Input de votos personalizados

---

## 🔧 Solución Necesaria

### **Dónde Agregar la Lógica:**

En `script.js`, después de línea 950, necesitamos agregar:

```javascript
// 🆕 ACTUALIZAR TABLA DE DISTRITOS con mr_distritos_por_estado
if (mayoriaData.mr_distritos_por_estado) {
  console.log('[MAYORÍAS] 🗺️ Actualizando tabla de distritos...');
  
  // Opción 1: Si hay función global para actualizar tabla
  if (typeof window.updateDistrictTable === 'function') {
    window.updateDistrictTable(mayoriaData.mr_distritos_por_estado);
  }
  
  // Opción 2: Si hay componente de tabla de estados
  const tablaEstados = document.querySelector('tabla-estados');
  if (tablaEstados && tablaEstados.updateData) {
    tablaEstados.updateData(mayoriaData.mr_distritos_por_estado);
  }
  
  // Opción 3: Actualizar inputs directamente
  for (const [estadoId, partidos] of Object.entries(mayoriaData.mr_distritos_por_estado)) {
    for (const [partido, distritos] of Object.entries(partidos)) {
      const input = document.querySelector(
        `[data-estado="${estadoId}"][data-partido="${partido}"]`
      );
      if (input) {
        input.value = distritos;
        input.dispatchEvent(new Event('change'));
      }
    }
  }
}

// 🆕 ACTUALIZAR SLIDERS DE MR con mr_distritos_manuales
if (mayoriaData.mr_distritos_manuales) {
  console.log('[MAYORÍAS] 📊 Actualizando sliders MR...');
  
  for (const [partido, distritos] of Object.entries(mayoriaData.mr_distritos_manuales)) {
    const slider = document.querySelector(`#slider-mr-${partido}`);
    if (slider) {
      slider.value = distritos;
      slider.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
}

// 🆕 ACTUALIZAR SLIDERS DE VOTOS con votos_custom
if (mayoriaData.votos_custom) {
  console.log('[MAYORÍAS] 🗳️ Actualizando sliders de votos...');
  
  for (const [partido, porcentaje] of Object.entries(mayoriaData.votos_custom)) {
    const slider = document.querySelector(`#slider-votos-${partido}`);
    if (slider) {
      slider.value = porcentaje;
      slider.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
}
```

---

## 🔍 Cómo Verificar el Problema

### **1. Abrir DevTools Console**
```javascript
// Después de calcular mayoría, ejecutar:
console.log(window.mayoriaForzadaData);

// Verificar que estos campos existan:
// - votos_custom
// - mr_distritos_manuales  
// - mr_distritos_por_estado
```

### **2. Ver Logs Automáticos**
Ahora con las mejoras verás:
```
[MAYORÍAS] ✅ votos_custom recibido: {...}
[MAYORÍAS] ✅ mr_distritos_manuales recibido: {...}
[MAYORÍAS] ✅ mr_distritos_por_estado recibido: 32 estados
```

O si no vienen:
```
[MAYORÍAS] ⚠️ No se recibió votos_custom del backend
[MAYORÍAS] ⚠️ No se recibió mr_distritos_manuales del backend
[MAYORÍAS] ⚠️ No se recibió mr_distritos_por_estado del backend
```

---

## 📋 Checklist de Estado

### ✅ Implementado:
- [x] Notificación "Calculando..." (loading)
- [x] Notificación de éxito con % de votos necesarios
- [x] Notificación de error si falla
- [x] Datos guardados en `window.mayoriaForzadaData`
- [x] Logs de debug mejorados
- [x] Seat chart se actualiza correctamente
- [x] KPIs se actualizan correctamente

### ❌ Pendiente:
- [ ] Actualizar tabla de distritos por estado
- [ ] Actualizar sliders de distribución MR
- [ ] Actualizar inputs de votos personalizados
- [ ] Identificar componente/función de tabla de estados

---

## 🎯 Próximos Pasos

### **Paso 1: Identificar Componente de Tabla**
Necesitamos saber:
- ¿Cómo se llama el componente de tabla de estados/distritos?
- ¿Tiene un método `updateData()` o similar?
- ¿Dónde están los inputs de la tabla?

### **Paso 2: Buscar en el Código**
```bash
# Buscar componente de tabla
grep -r "tabla.*estado" components/
grep -r "district.*table" components/

# Buscar inputs de distritos
grep -r "data-estado" *.html
grep -r "distrito.*input" *.html
```

### **Paso 3: Implementar Actualización**
Una vez identificado, agregar la lógica en `script.js` línea ~950.

---

## 📝 Resumen

### ✅ Notificaciones: LISTO
```
⏳ Calculando mayoría forzada...
↓
✅ Mayoría simple calculada
   MORENA necesita 47.50% de votos
```

### ⚠️ Tabla de Distritos: PENDIENTE
```
Backend envía datos ✅
Frontend los guarda ✅
Frontend NO los usa ❌  ← Necesita implementación
```

**Caché actualizado:** `v=20260118042000`

**¡Recarga con Ctrl+F5 y verás las notificaciones funcionando!** 🔔
