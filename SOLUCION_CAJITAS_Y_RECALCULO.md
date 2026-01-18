# ✅ CORRECCIÓN MAYORÍAS - CAJITAS Y RECÁLCULO COMPLETO

**Fecha:** 15 de enero de 2026  
**Problema 1:** Las cajitas del seat chart NO se pintan según la mayoría  
**Problema 2:** El sistema NO recalcula - debe FORZAR la mayoría ajustando votos

---

## 🔧 CAMBIOS REALIZADOS EN EL FRONTEND

### **1. script.js - Ahora usa seat_chart completo del backend**

**ANTES:**
```javascript
// Solo sobrescribía el partido objetivo
data.seat_chart[partidoIndex].seats = mayoriaData.escanos_obtenidos;
```

**AHORA:**
```javascript
// Si el backend devuelve seat_chart completo, lo usa DIRECTAMENTE
if (mayoriaData.data_completa && mayoriaData.data_completa.seat_chart) {
  // REEMPLAZAR COMPLETAMENTE el seat_chart
  data.seat_chart = mayoriaData.data_completa.seat_chart;
  
  // También KPIs si vienen
  if (mayoriaData.data_completa.kpis) {
    data.kpis = mayoriaData.data_completa.kpis;
  }
}
```

**Resultado:**
- ✅ Si el backend devuelve `seat_chart` completo → Las cajitas se pintarán correctamente
- ✅ Si el backend devuelve `kpis` → Se mostrarán índices recalculados
- ⚠️ Si el backend NO devuelve `seat_chart` → Usa fallback (solo actualiza un partido)

---

## 📋 LO QUE NECESITA EL BACKEND

### **Comportamiento Actual (INCORRECTO):**

```
Frontend → GET /calcular/mayoria_forzada?partido=MORENA&tipo_mayoria=simple
Backend → { diputados_obtenidos: 248, mr_asignados: 153, ... }
```

**Problema:** Solo devuelve números, NO recalcula el sistema completo.

---

### **Comportamiento Esperado (CORRECTO):**

```
Frontend → GET /calcular/mayoria_forzada?partido=MORENA&tipo_mayoria=simple
Backend → Debe:
  1. Calcular: "Necesito 251 diputados para mayoría simple"
  2. Buscar: "¿Qué % de votos necesita MORENA para llegar a 251?"
  3. Ajustar: Modificar votos de MORENA hasta alcanzar 251 escaños
  4. Recalcular: Escaños de TODOS los partidos con la nueva distribución
  5. Devolver: seat_chart COMPLETO + kpis
```

**Respuesta Esperada:**
```json
{
  "viable": true,
  "diputados_necesarios": 251,
  "diputados_obtenidos": 251,  // ← Alcanza EXACTAMENTE el umbral
  "votos_porcentaje": 47.5,
  "mr_asignados": 158,
  "rp_asignados": 93,
  
  // 🔑 CRÍTICO: seat_chart COMPLETO recalculado
  "seat_chart": [
    {
      "party": "MORENA",
      "seats": 251,         // ← FORZADO a mayoría
      "mr_seats": 158,
      "rp_seats": 93,
      "votes_percent": 47.5,
      "color": "#941B1E"
    },
    {
      "party": "PAN",
      "seats": 85,          // ← RECALCULADO con nuevo %
      "mr_seats": 42,
      "rp_seats": 43,
      "votes_percent": 18.2,
      "color": "#0059B3"
    },
    {
      "party": "PRI",
      "seats": 64,          // ← RECALCULADO
      "mr_seats": 30,
      "rp_seats": 34,
      "votes_percent": 14.3,
      "color": "#E20613"
    }
    // ... TODOS los partidos recalculados
  ],
  
  // 🔑 CRÍTICO: KPIs recalculados
  "kpis": {
    "total_escanos": 500,
    "gallagher": 8.45,
    "ratio_promedio": 0.912,
    "total_votos": 45678901
  }
}
```

---

## ⚠️ CASO ESPECIAL: Mayoría Imposible con Topes

Si el usuario tiene **topes activados** y pide **mayoría calificada**:

```
Mayoría calificada = 334 diputados
Tope del 60% = máximo 300 diputados
→ IMPOSIBLE
```

**Respuesta del backend:**
```json
{
  "viable": false,
  "mensaje": "Mayoría calificada imposible con topes del 60%",
  "diputados_necesarios": 334,
  "max_posible": 300,
  "diputados_obtenidos": 0,
  "votos_porcentaje": null
}
```

**Frontend mostrará:**
- Notificación: "Imposible alcanzar mayoría calificada con topes activos"
- Sugerencia: "Desactiva los topes para calcularlo"

---

## 🧪 CÓMO PROBAR

### **Test 1: Verificar si backend devuelve seat_chart**

Abre la consola del navegador y pega:

```javascript
// Copiar el contenido de TEST_BACKEND_SEAT_CHART.js
```

O simplemente:
```javascript
fetch('https://back-electoral.onrender.com/calcular/mayoria_forzada?partido=MORENA&tipo_mayoria=simple&plan=vigente&aplicar_topes=true')
  .then(r => r.json())
  .then(data => {
    console.log('¿Tiene seat_chart?', !!data.seat_chart);
    console.log('¿Cuántos partidos?', data.seat_chart?.length || 0);
    console.log('Datos completos:', data);
  });
```

**Si ves:**
- ✅ `¿Tiene seat_chart? true` → Backend está bien
- ❌ `¿Tiene seat_chart? false` → Backend necesita actualización

---

### **Test 2: Probar en la UI**

1. Abre el tablero electoral
2. Activa toggle "Mayorías Forzadas"
3. Selecciona MORENA + Mayoría Simple
4. **Revisa la consola:**

**Si backend está bien:**
```
[MAYORÍAS] ✅ Backend devolvió seat_chart completo - REEMPLAZANDO datos normales
[MAYORÍAS] 📊 Seat chart reemplazado: Array(7) [...]
[MAYORÍAS] 📊 Total escaños: 500
```

**Si backend necesita actualización:**
```
[MAYORÍAS] ⚠️ Backend NO devolvió seat_chart completo - usando fallback
[MAYORÍAS] 📊 Partido encontrado: {...}
[MAYORÍAS] ✅ Partido actualizado (fallback): {...}
```

---

## 📂 ARCHIVOS IMPORTANTES

### **Para el desarrollador del BACKEND:**
- `BACKEND_MAYORIAS_DEBE_RECALCULAR_TODO.md` - Especificación completa con algoritmo
- `BACKEND_ENDPOINTS_MAYORIAS_REQUERIDOS.md` - Estructura de endpoints

### **Para probar:**
- `TEST_BACKEND_SEAT_CHART.js` - Script de consola para verificar respuesta

### **Código del FRONTEND:**
- `script.js` (líneas 655-710) - Interceptor que usa seat_chart del backend
- `ControlSidebar.js` (líneas 2605-2665) - Guarda data_completa

---

## 🎯 RESUMEN EJECUTIVO

### **Problema 1: Cajitas no se pintan**
**Causa:** Backend no devuelve `seat_chart` completo  
**Solución:** Backend debe recalcular y devolver array completo  
**Estado Frontend:** ✅ Listo para recibir y usar `seat_chart`  
**Estado Backend:** ⚠️ Necesita implementación

### **Problema 2: No se recalcula para alcanzar mayoría**
**Causa:** Backend solo calcula escaños actuales, no ajusta votos  
**Solución:** Backend debe iterar hasta que partido alcance umbral  
**Estado Frontend:** ✅ Listo para procesar datos recalculados  
**Estado Backend:** ⚠️ Necesita implementación

---

## 🚀 PRÓXIMOS PASOS

1. **Ejecuta el test:** Pega `TEST_BACKEND_SEAT_CHART.js` en consola
2. **Verifica respuesta:** ¿Tiene `seat_chart`?
   - ✅ SÍ → Recarga página y prueba la UI
   - ❌ NO → Comparte resultados con desarrollador del backend

3. **Si backend está actualizado:**
   - Las cajitas se pintarán automáticamente
   - Los escaños se recalcularán correctamente
   - Todo funcionará sin cambios adicionales

4. **Si backend necesita actualización:**
   - Comparte `BACKEND_MAYORIAS_DEBE_RECALCULAR_TODO.md` con el desarrollador
   - Mientras tanto, el sistema usará fallback (funcionalidad limitada)

---

**El frontend está 100% listo. Solo falta que el backend devuelva los datos correctos.** ✅
