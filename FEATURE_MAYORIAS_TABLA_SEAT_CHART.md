# ✅ MAYORÍAS FORZADAS - SISTEMA DE ACTUALIZACIÓN DE TABLA Y SEAT CHART

**Fecha:** 15 de enero de 2026  
**Feature:** Sistema completo de mayorías forzadas integrado con tabla y seat chart

---

## 🎯 CÓMO FUNCIONA

Cuando el usuario activa la **calculadora de mayorías** y selecciona un partido:

### 1. **Usuario Activa Toggle**
```
Usuario activa toggle "Mayorías Forzadas" → Selecciona partido (MORENA) → Elige tipo (simple/calificada)
```

### 2. **Frontend Llama al Backend**
```javascript
// ControlSidebar.js (líneas ~2495-2550)
GET https://back-electoral.onrender.com/calcular/mayoria_forzada?partido=MORENA&tipo_mayoria=simple&plan=vigente&aplicar_topes=true
```

### 3. **Backend Responde con Datos**
```json
{
  "viable": true,
  "diputados_necesarios": 251,
  "diputados_obtenidos": 248,
  "mr_asignados": 153,
  "rp_asignados": 95,
  "votos_porcentaje": 45.2
}
```

### 4. **Frontend Guarda Datos en `window.mayoriaForzadaData`**
```javascript
// ControlSidebar.js - aplicarMayoriaForzadaAlSistema() (líneas ~2590-2650)
window.mayoriaForzadaData = {
  activa: true,
  partido: "MORENA",
  tipo: "simple",
  escanos_obtenidos: 248,
  mr_asignados: 153,
  rp_asignados: 95,
  ...
};
```

### 5. **Frontend Dispara Actualización Global**
```javascript
// ControlSidebar.js
window.actualizarDesdeControles(); // ← Esto recalcula TODO
```

### 6. **`script.js` Intercepta y Modifica Datos**
```javascript
// script.js (líneas ~655-690)
// Cuando recibe datos del backend NORMAL...
const data = await resp.json(); // ← Datos normales del modelo

// 🔄 SI hay mayoría forzada activa:
if (window.mayoriaForzadaData && window.mayoriaForzadaData.activa) {
  // Busca el partido en seat_chart
  const partidoIndex = data.seat_chart.findIndex(p => p.party === "MORENA");
  
  // SOBRESCRIBE los escaños del partido con los de mayoría forzada
  data.seat_chart[partidoIndex] = {
    ...partidoOriginal,
    seats: 248,        // ← Desde mayoría forzada
    mr_seats: 153,     // ← Desde mayoría forzada  
    rp_seats: 95       // ← Desde mayoría forzada
  };
}

// Continúa procesamiento normal...
// ↓
// La tabla y seat chart se actualizan con datos MODIFICADOS
```

### 7. **Tabla y Seat Chart Se Actualizan**
```javascript
// script.js (líneas ~755-770)
// Actualiza seat chart visual
seatChart.setAttribute('data', JSON.stringify(seatArray)); // ← Con datos de mayoría

// Actualiza tabla de resultados
sidebar.updateResultsTable(resultadosTabla, config); // ← Con datos de mayoría
```

---

## 📂 FLUJO DE DATOS

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USUARIO ACTIVA TOGGLE Y SELECCIONA PARTIDO              │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. FRONTEND → BACKEND                                       │
│    GET /calcular/mayoria_forzada?partido=MORENA             │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. BACKEND RESPONDE                                         │
│    { diputados_obtenidos: 248, mr: 153, rp: 95, ... }      │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. FRONTEND GUARDA EN GLOBAL                                │
│    window.mayoriaForzadaData = {...}                        │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. DISPARA ACTUALIZACIÓN                                    │
│    window.actualizarDesdeControles()                        │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. BACKEND DEVUELVE DATOS NORMALES                          │
│    GET /calcular?plan=vigente&...                           │
│    → { seat_chart: [...], kpis: {...} }                     │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. script.js INTERCEPTA Y MODIFICA                          │
│    if (window.mayoriaForzadaData) {                         │
│      // Sobrescribe escaños del partido objetivo            │
│      data.seat_chart[partidoIndex].seats = 248              │
│    }                                                         │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. UI SE ACTUALIZA CON DATOS MODIFICADOS                    │
│    ✅ Tabla muestra: MORENA - 248 escaños (153 MR + 95 RP)  │
│    ✅ Seat Chart muestra: 248 asientos para MORENA          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 ARCHIVOS MODIFICADOS

### **1. ControlSidebar.js**

#### **Función: `calcularMayoriaForzada()`** (Líneas ~2495-2565)
- Construye URL correcta según cámara:
  - Diputados: `/calcular/mayoria_forzada`
  - Senado: `/calcular/mayoria_forzada_senado`
- Parámetros:
  - `partido`, `tipo_mayoria`, `plan`, `aplicar_topes`
  - `anio` (solo para senado)

#### **Función: `aplicarMayoriaForzadaAlSistema()`** (Líneas ~2590-2660)
```javascript
// Extrae datos de la respuesta del backend
const escanosObtenidos = data.diputados_obtenidos || data.senadores_obtenidos;
const mrAsignados = data.mr_asignados || data.mr_senadores;
const rpAsignados = data.rp_asignados || data.rp_senadores;

// 💾 Guarda en window para que script.js los use
window.mayoriaForzadaData = {
  activa: true,
  partido: partido,
  escanos_obtenidos: escanosObtenidos,
  mr_asignados: mrAsignados,
  rp_asignados: rpAsignados,
  // ...
};

// 🔄 Dispara actualización global
window.actualizarDesdeControles();
```

#### **Toggle Event Listener** (Líneas ~1581-1610)
```javascript
// Cuando se desactiva el toggle:
if (!isActive) {
  // Limpia datos de mayoría
  window.mayoriaForzadaData = null;
  
  // Recalcula con datos normales
  window.actualizarDesdeControles();
}
```

---

### **2. script.js**

#### **Interceptor de Datos** (Líneas ~655-690)
```javascript
const data = await resp.json(); // Datos normales del backend

// 🔄 APLICAR MAYORÍA FORZADA si está activa
if (window.mayoriaForzadaData && window.mayoriaForzadaData.activa) {
  const partidoObjetivo = window.mayoriaForzadaData.partido;
  const partidoIndex = data.seat_chart.findIndex(p => p.party === partidoObjetivo);
  
  if (partidoIndex !== -1) {
    // SOBRESCRIBE escaños del partido
    data.seat_chart[partidoIndex] = {
      ...partidoOriginal,
      seats: mayoriaData.escanos_obtenidos,
      mr_seats: mayoriaData.mr_asignados,
      rp_seats: mayoriaData.rp_asignados,
      pm_seats: mayoriaData.pm_asignados || 0
    };
  }
}

// Continúa con procesamiento normal (tabla + seat chart)
```

---

## ✅ VENTAJAS DEL SISTEMA

### 🎯 **No Requiere Resumen Separado**
- Los datos se integran directamente en la tabla y seat chart existentes
- El usuario ve los cambios inmediatamente en las visualizaciones principales

### 🔄 **Actualización Automática**
- Cuando cambia cualquier parámetro (partido, tipo de mayoría), se recalcula automáticamente
- Cuando se desactiva el toggle, vuelve a mostrar datos normales

### 💾 **Persistencia Global**
- `window.mayoriaForzadaData` actúa como "state global"
- Cualquier parte del código puede verificar si hay mayoría activa

### 🧩 **Modular y No Invasivo**
- No modifica el flujo principal de actualización
- Solo intercepta y modifica datos cuando es necesario
- Fácil de deshabilitar (set `window.mayoriaForzadaData = null`)

---

## 🧪 CÓMO PROBAR

### **Test 1: Activar Mayoría**
1. Abre el panel de control
2. Activa toggle "Mayorías Forzadas"
3. Selecciona partido (ej: MORENA)
4. Selecciona tipo (Simple o Calificada)
5. **Observa:**
   - ✅ Tabla muestra escaños actualizados para MORENA
   - ✅ Seat chart muestra círculos actualizados
   - ✅ Notificación muestra "Mayoría calculada"

### **Test 2: Desactivar Mayoría**
1. Desactiva toggle "Mayorías Forzadas"
2. **Observa:**
   - ✅ Tabla vuelve a mostrar datos normales
   - ✅ Seat chart vuelve a datos normales
   - ✅ Notificación muestra "Mayoría forzada desactivada"

### **Test 3: Cambiar Parámetros**
1. Con mayoría activa, cambia de "Simple" a "Calificada"
2. **Observa:**
   - ✅ Tabla se actualiza con nuevos escaños
   - ✅ Seat chart se actualiza automáticamente

---

## 📝 LOGS DE DEBUG

### **Cuando se activa mayoría:**
```
[MAYORÍAS] 🎯 Calculando mayoría forzada...
[MAYORÍAS] 📡 URL completa: https://back-electoral.onrender.com/calcular/mayoria_forzada?...
[MAYORÍAS] ✅ Data recibida: {...}
[MAYORÍAS] 🔄 Aplicando mayoría forzada al sistema...
[MAYORÍAS] 💾 Datos guardados en window.mayoriaForzadaData
[MAYORÍAS] 🚀 Llamando a actualizarDesdeControles()...
```

### **Cuando script.js intercepta:**
```
[MAYORÍAS] 🔄 Aplicando mayoría forzada a los datos del backend...
[MAYORÍAS] 📊 Partido encontrado en seat_chart: {party: "MORENA", seats: 180, ...}
[MAYORÍAS] ✅ Partido actualizado: {party: "MORENA", seats: 248, ...}
```

### **Cuando se desactiva:**
```
[MAYORÍAS] ❌ Toggle desactivado - limpiando datos de mayoría forzada
[MAYORÍAS] 🔄 Recalculando con datos normales...
```

---

## 🎉 RESULTADO FINAL

**Antes:** Usuario veía solo un resumen con números  
**Ahora:** Usuario ve la tabla Y el seat chart actualizados en tiempo real con los escaños de la mayoría forzada

**¡El sistema está completo y funcionando!** 🚀
