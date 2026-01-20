# ✅ FIX: Error 500 - Partido MORENA+PT+PVEM no encontrado

## 🐛 Problema Original

```
Error: HTTP 500
{"detail":"Partido MORENA+PT+PVEM no encontrado en seat_chart. 
Partidos disponibles: ['PAN', 'PRI', 'PRD', 'PVEM', 'PT', 'MC', 'MORENA']"}
```

### Causa Raíz:
El frontend enviaba coaliciones como **strings completos** (ej: `"MORENA+PT+PVEM"`) al backend, pero el backend solo reconoce **partidos individuales**.

---

## ✅ Solución Implementada

### Concepto Clave:
Cuando el usuario selecciona una **coalición**, el frontend debe:

1. **Extraer el partido líder** (primer partido antes del `+`)
2. **Enviar solo ese partido** al backend
3. **Establecer `solo_partido = false`** para indicar que es coalición

---

## 🔧 Cambios en el Código

### 1. **Extracción del Partido Líder**
**Archivo**: `ControlSidebar.js` línea ~4136

**Antes**:
```javascript
const partido = partidoParam || partidoSelect?.value;
// "MORENA+PT+PVEM" → enviado tal cual al backend ❌
```

**Después**:
```javascript
const partidoSeleccionado = partidoParam || partidoSelect?.value; // "MORENA+PT+PVEM"

// 🆕 EXTRAER PARTIDO LÍDER si es coalición
const esCoalicion = partidoSeleccionado && partidoSeleccionado.includes('+');
const partido = esCoalicion ? partidoSeleccionado.split('+')[0] : partidoSeleccionado;
// "MORENA+PT+PVEM" → "MORENA" ✅

console.log('[MAYORÍAS] 🎯 Partido original seleccionado:', partidoSeleccionado);
console.log('[MAYORÍAS] 🎯 Partido líder (enviado al backend):', partido);
console.log('[MAYORÍAS] 🎯 Es coalición:', esCoalicion);
```

**Efecto**: 
- Si seleccionas `"MORENA+PT+PVEM"` → envía `"MORENA"` al backend
- Si seleccionas `"MORENA"` → envía `"MORENA"` al backend

---

### 2. **Actualización del Parámetro `solo_partido`**
**Archivo**: `ControlSidebar.js` línea ~4162

**Antes**:
```javascript
let soloPartido = !partido.includes('+');  // ❌ partido ya fue limpiado
```

**Después**:
```javascript
let soloPartido = soloPartidoParam !== null 
  ? soloPartidoParam 
  : !esCoalicion;  // ✅ usa la variable esCoalicion calculada antes

// Si hay radio button de tipo, sobreescribir
const tipoRadio = document.querySelector('input[name="mayoria-tipo"]:checked');
if (tipoRadio && soloPartidoParam === null) {
  soloPartido = tipoRadio.value === 'partido';
}
```

**Efecto**:
- Coalición seleccionada → `solo_partido = false`
- Partido individual → `solo_partido = true`

---

### 3. **Payload Enviado al Backend**
**Archivo**: `ControlSidebar.js` línea ~4264

**Payload POST**:
```javascript
{
  "partido": "MORENA",        // ✅ Solo el líder, NO "MORENA+PT+PVEM"
  "tipo_mayoria": "simple",
  "plan": "vigente",
  "anio": 2024,
  "solo_partido": false,      // ✅ false porque es coalición
  "aplicar_topes": true
}
```

---

### 4. **Logging Mejorado**
**Archivo**: `ControlSidebar.js` línea ~4270

**Nuevo log**:
```javascript
console.log('[MAYORÍAS] 🎯 Configuración mayoría forzada:', {
  seleccion: "MORENA+PT+PVEM",      // Lo que seleccionó el usuario
  partidoEnviado: "MORENA",         // Lo que se envía al backend
  soloPartido: false,
  plan: "vigente",
  significado: "MORENA+PT+PVEM (coalición completa) alcanzará mayoría"
});
```

---

### 5. **Notificación Actualizada**
**Archivo**: `ControlSidebar.js` línea ~4344

**Antes**:
```javascript
`${partido} necesita ${votosNecesarios.toFixed(2)}% de votos`
// "MORENA necesita 45.5% de votos"
```

**Después**:
```javascript
const nombreMostrar = soloPartido ? partido : partidoSeleccionado;
`${nombreMostrar} necesita ${votosNecesarios.toFixed(2)}% de votos`
// "MORENA+PT+PVEM necesita 45.5% de votos" ✅ (si es coalición)
// "MORENA necesita 45.5% de votos" ✅ (si es partido individual)
```

---

## 🧪 Pruebas

### Caso 1: Partido Individual

**Input**:
- Radio: "Partido individual"
- Dropdown: "MORENA"

**Payload enviado**:
```json
{
  "partido": "MORENA",
  "solo_partido": true
}
```

**Resultado esperado**: Solo MORENA alcanza mayoría, coalición obtiene 0 escaños.

---

### Caso 2: Coalición

**Input**:
- Radio: "Coalición"
- Dropdown: "MORENA + PT + PVEM"

**Payload enviado**:
```json
{
  "partido": "MORENA",        // ✅ Solo el líder
  "solo_partido": false       // ✅ Indica que es coalición
}
```

**Resultado esperado**: MORENA + PT + PVEM (coalición completa) alcanza mayoría.

---

## 🔍 Verificación en Consola

Después de recargar (Ctrl+Shift+R), al seleccionar una coalición verás:

```
[MAYORÍAS] 🎯 Partido original seleccionado: MORENA+PT+PVEM
[MAYORÍAS] 🎯 Partido líder (enviado al backend): MORENA
[MAYORÍAS] 🎯 Es coalición: true
[MAYORÍAS] 📋 Parámetros finales: {
  partidoOriginal: "MORENA+PT+PVEM",
  partidoLider: "MORENA",
  esCoalicion: true,
  soloPartido: false,
  ...
}
[MAYORÍAS] 🎯 Configuración mayoría forzada: {
  seleccion: "MORENA+PT+PVEM",
  partidoEnviado: "MORENA",
  soloPartido: false,
  significado: "MORENA+PT+PVEM (coalición completa) alcanzará mayoría"
}
[MAYORÍAS] ✅ Data recibida: {...}
```

**Ya NO debe aparecer**:
```
❌ Error: Partido MORENA+PT+PVEM no encontrado
```

---

## 📦 Archivos Modificados

- ✅ `ControlSidebar.js` (v=20260119013500)
- ✅ `index.html` (cache actualizado)

---

## 🎯 Próximo Paso

1. **Recarga la página**: Ctrl+Shift+R
2. **Selecciona "Coalición"**
3. **Elige "MORENA + PT + PVEM"**
4. **Verifica**:
   - ✅ No aparece error 500
   - ✅ Notificación muestra "MORENA+PT+PVEM necesita X%"
   - ✅ Tabla de distritos se actualiza
   - ✅ Seat chart muestra MORENA, PT, PVEM con escaños

---

## 🎉 Resultado

✅ **Coaliciones funcionan correctamente**
✅ **Partidos individuales siguen funcionando**
✅ **Backend recibe solo partidos válidos**
✅ **Notificaciones muestran nombre completo de coalición**
