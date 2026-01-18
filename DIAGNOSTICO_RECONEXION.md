# 🔧 DIAGNÓSTICO Y PLAN DE RECONEXIÓN FRONTEND-BACKEND

**Fecha**: 17 de enero de 2026  
**Estado**: Sistema desconectado - Requiere verificación completa

---

## 📋 RESUMEN EJECUTIVO

El frontend actualmente NO puede comunicarse con el backend. Los cambios recientes en `ControlSidebar.js` causaron que:

1. ❌ **ERROR 404** en `/procesar/diputados` y `/procesar/senado`
2. ❌ No se cargan datos iniciales
3. ❌ Las tablas no se renderizan
4. ❌ Los KPIs no se actualizan

---

## 🔍 ANÁLISIS DE COMPONENTES

### ✅ Backend (Probablemente OK)
- **URL Base**: `https://back-electoral.onrender.com`
- **Endpoints críticos**:
  - ✅ `/procesar/diputados` (POST)
  - ✅ `/procesar/senado` (POST)
  - ✅ `/data/initial` (GET)
  - ✅ `/kpis/{camara}/{anio}` (GET)
  - ✅ `/calcular-limites-pm` (GET)

**Nota**: El backend NO fue modificado. Solo el frontend tiene problemas.

---

### ⚠️ Frontend (DESCONECTADO)

#### **Archivo Crítico**: `scripts/script_general/script.js`

**Función Principal**: `cargarSimulacion()`
- **Línea**: ~390-800
- **Responsabilidad**: Construir URL y hacer POST al backend

**Problemas detectados**:
```javascript
// LÍNEA ~405 - Determinar endpoint
const endpoint = camara === 'senado' ? 'procesar/senado' : 'procesar/diputados';
let url = `https://back-electoral.onrender.com/${endpoint}?anio=${anio}`;
```

**Parámetros que SE ENVÍAN**:
- ✅ `anio` (2018, 2021, 2024)
- ✅ `plan` (vigente, A, B, C, personalizado)
- ✅ `escanos_totales` (solo en personalizado)
- ✅ `umbral` (solo si switch activo)
- ✅ `sobrerrepresentacion` (solo si switch activo)
- ✅ `sistema` (mr, rp, mixto)
- ✅ `mr_seats`, `rp_seats`, `pm_seats`
- ✅ `reparto_mode`, `reparto_method`
- ✅ `usar_coaliciones`

**Parámetros en BODY** (JSON):
- ✅ `porcentajes_partidos` (redistribución de votos)
- ✅ `mr_distritos_manuales` (distribución manual global)
- ✅ `mr_distritos_por_estado` (distribución manual por estado - IDs numéricos)

---

#### **Archivo Crítico**: `components/panel_control/ControlSidebar.js`

**Responsabilidad**: 
- Renderizar controles UI
- Leer valores de sliders/switches
- Llamar a `window.actualizarDesdeControles()`

**Cambios recientes que ROMPIERON el sistema**:
```javascript
// LÍNEAS 2720-2740 (updateStatesTable)
// ❌ ANTES (ESTRICTO - CAUSÓ FALLO):
if (this.selectedChamber === 'senadores') {
    distritosPorEstado = this.lastResult.meta.senadores_por_estado; // SI FALTA → CRASH
} else {
    distritosPorEstado = this.lastResult.meta.distritos_por_estado; // SI FALTA → CRASH
}

// ✅ AHORA (FLEXIBLE - RESTAURADO):
let distritosPorEstado = this.lastResult.meta.distritos_por_estado || 
                         this.lastResult.meta.senadores_por_estado ||
                         this.lastResult.meta.mr_distritos_por_estado;
```

**Estado actual**: ✅ **CORREGIDO** (acabo de arreglarlo)

---

## 🛠️ PLAN DE RECONEXIÓN (PASO A PASO)

### **PASO 1: Verificar que el backend responde** ✅

Abre la consola del navegador (F12) y ejecuta:

```javascript
// TEST 1: Endpoint básico de diputados
fetch('https://back-electoral.onrender.com/procesar/diputados?anio=2024&plan=vigente&escanos_totales=500', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
.then(r => r.json())
.then(d => console.log('✅ Backend diputados OK:', d))
.catch(e => console.error('❌ Backend diputados FALLO:', e));

// TEST 2: Endpoint básico de senado
fetch('https://back-electoral.onrender.com/procesar/senado?anio=2024&plan=vigente&escanos_totales=128', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
.then(r => r.json())
.then(d => console.log('✅ Backend senado OK:', d))
.catch(e => console.error('❌ Backend senado FALLO:', e));

// TEST 3: Data inicial
fetch('https://back-electoral.onrender.com/data/initial?camara=diputados&anio=2024')
.then(r => r.json())
.then(d => console.log('✅ Data inicial OK:', d.meta ? 'CON META' : 'SIN META'))
.catch(e => console.error('❌ Data inicial FALLO:', e));
```

**Resultado esperado**: 
- Si ves `✅ Backend OK` → El backend está bien, problema solo en frontend
- Si ves `❌ FALLO` → Problema en el backend (verificar logs de Render.com)

---

### **PASO 2: Limpiar caché del navegador** 🧹

El navegador puede tener versiones antiguas del código JavaScript:

1. Presiona `Ctrl + Shift + Delete` (Windows) o `Cmd + Shift + Delete` (Mac)
2. Selecciona "Caché" y "Cookies"
3. Limpia solo del último día
4. Recarga la página con `Ctrl + F5` (recarga forzada)

---

### **PASO 3: Verificar que el frontend carga correctamente** 📂

En la consola del navegador, deberías ver:

```
✅ LOGS ESPERADOS:
[DEBUG] DOM loaded, initializing dashboard...
[DEBUG] Starting full initialization...
[DEBUG] URL generada para petición: https://back-electoral.onrender.com/procesar/diputados?anio=2024&plan=vigente...
[DEBUG] Status de respuesta: 200 OK
[DEBUG] Respuesta backend: {seat_chart: [...], kpis: {...}, meta: {...}}
```

```
❌ LOGS DE ERROR (NO DEBERÍAS VER):
[DEBUG] Error al cargar datos: 404 Not Found
[ERROR] Backend error 404
TypeError: Cannot read property 'meta' of undefined
```

---

### **PASO 4: Verificar la estructura de datos del backend** 🔍

Ejecuta en consola:

```javascript
// Verificar que lastResult tiene la estructura correcta
const sidebar = document.querySelector('control-sidebar');
console.log('sidebar.lastResult:', sidebar.lastResult);
console.log('sidebar.lastResult.meta:', sidebar.lastResult?.meta);
console.log('Keys en meta:', sidebar.lastResult?.meta ? Object.keys(sidebar.lastResult.meta) : 'NO META');
```

**Estructura esperada** (Diputados):
```javascript
{
  seat_chart: [...],
  kpis: {...},
  meta: {
    mr_por_estado: { "AGUASCALIENTES": { "MORENA": 3, "PAN": 0, ... }, ... },
    distritos_por_estado: { "AGUASCALIENTES": 3, "BAJA CALIFORNIA": 8, ... },
    // O alternativamente:
    mr_distritos_por_estado: { ... }
  }
}
```

**Estructura esperada** (Senado):
```javascript
{
  seat_chart: [...],
  kpis: {...},
  meta: {
    mr_por_estado: { ... },
    senadores_por_estado: { "AGUASCALIENTES": 2, "BAJA CALIFORNIA": 3, ... }
    // O alternativamente:
    distritos_por_estado: { ... }
  }
}
```

---

### **PASO 5: Reconectar funcionalidades una por una** 🔌

#### **5.1 Carga Inicial de Datos**

**Archivo**: `scripts/script_general/script.js` (línea ~1538)

```javascript
// Cargar simulación inicial con vigente por defecto
setTimeout(() => {
    cargarSimulacion({
        anio: 2024,
        camara: 'diputados', 
        modelo: 'vigente',
        silentLoad: false
    }).then(() => {
        // ✅ Verificar que esto se ejecuta
        console.log('✅ CARGA INICIAL COMPLETADA');
    });
}, 1000);
```

**Test**: Recarga la página y verifica que ves "✅ CARGA INICIAL COMPLETADA" en consola.

---

#### **5.2 Tabla de Resultados**

**Archivo**: `ControlSidebar.js` (método `updateResultsTable`)

**Test en consola**:
```javascript
const sidebar = document.querySelector('control-sidebar');
const testData = [
  { party: 'MORENA', seats: 236, mr_seats: 164, rp_seats: 72, votes_percent: 42.3, color: '#A0234F' },
  { party: 'PAN', seats: 108, mr_seats: 73, rp_seats: 35, votes_percent: 21.2, color: '#0C479D' }
];
sidebar.updateResultsTable(testData, { sistema: 'mixto', pm_activo: false });
// Deberías ver la tabla renderizada
```

---

#### **5.3 Tabla de Estados (MR por Estado)**

**Archivo**: `ControlSidebar.js` (método `updateStatesTable`)

**Test**:
```javascript
const sidebar = document.querySelector('control-sidebar');
await sidebar.updateStatesTable();
// Verifica que aparece la tabla de estados con las flechitas
```

**Si falla**: Verificar que `sidebar.lastResult.meta.mr_por_estado` existe.

---

#### **5.4 Sliders de MR/RP**

**Test**:
```javascript
const mrSlider = document.getElementById('input-mr');
const rpSlider = document.getElementById('input-rp');

console.log('MR Slider:', mrSlider?.value);
console.log('RP Slider:', rpSlider?.value);

// Cambiar valor y verificar que actualiza
mrSlider.value = 250;
mrSlider.dispatchEvent(new Event('input'));
// Deberías ver logs de actualización
```

---

#### **5.5 Switches (Umbral, Sobrerrepresentación, etc.)**

**Test**:
```javascript
const thresholdSwitch = document.getElementById('threshold-switch');
console.log('Threshold Switch:', thresholdSwitch?.getAttribute('data-switch'));

// Activar/desactivar
thresholdSwitch?.click();
// Deberías ver el slider de umbral aparecer/desaparecer
```

---

#### **5.6 Redistribución de Votos**

**Archivo**: `ControlSidebar.js` (sliders dinámicos de partidos)

**Test**:
```javascript
const sidebar = document.querySelector('control-sidebar');
console.log('Datos de partidos:', sidebar.partidosData);

// Verificar que los sliders existen
const morenaSlider = document.getElementById('shock-morena');
console.log('Slider MORENA:', morenaSlider?.value);
```

---

#### **5.7 Distribución Manual de MR (Sliders Globales)**

**Test**:
```javascript
console.log('MR Distribution Manual:', window.mrDistributionManual);

const mrDistSwitch = document.getElementById('mr-distribution-switch');
mrDistSwitch?.click(); // Activar modo manual

// Verificar que los sliders aparecen
const morenaDistSlider = document.getElementById('mr-dist-morena');
console.log('MR Dist Slider MORENA:', morenaDistSlider?.value);
```

---

#### **5.8 Distribución Manual por Estados (Flechitas)**

**Test**:
```javascript
const sidebar = document.querySelector('control-sidebar');
await sidebar.updateStatesTable();

// Verificar que las flechitas funcionan
const upButton = document.querySelector('[data-state="AGUASCALIENTES"][data-party="MORENA"] .arrow-up');
upButton?.click();

// Deberías ver el valor incrementarse
```

---

## 🚨 PUNTOS CRÍTICOS A VERIFICAR

### 1️⃣ **window.actualizarDesdeControles está definido**

```javascript
console.log(typeof window.actualizarDesdeControles); // Debe ser 'function'
```

Si sale `undefined`, el archivo `script.js` no se cargó correctamente.

---

### 2️⃣ **ControlSidebar se renderiza correctamente**

```javascript
const sidebar = document.querySelector('control-sidebar');
console.log('Sidebar encontrado:', !!sidebar);
console.log('Sidebar innerHTML length:', sidebar?.innerHTML.length);
```

Debe mostrar `Sidebar encontrado: true` y longitud > 10000.

---

### 3️⃣ **No hay errores de CORS**

En consola NO debes ver:
```
❌ Access to fetch at 'https://back-electoral.onrender.com/...' has been blocked by CORS policy
```

Si ves esto, el backend necesita configurar headers CORS correctamente.

---

### 4️⃣ **Los eventos se disparan**

```javascript
// Agregar listener temporal
window.addEventListener('click', (e) => {
  console.log('Click en:', e.target);
});

// Hacer click en botones y verificar que se registra
```

---

## 📝 CHECKLIST DE RECONEXIÓN

Marca cada elemento a medida que lo verificas:

- [ ] **Backend responde** (TEST 1, 2, 3 del PASO 1)
- [ ] **Caché limpiado** (PASO 2)
- [ ] **Logs de carga inicial OK** (PASO 3)
- [ ] **lastResult.meta existe** (PASO 4)
- [ ] **Carga inicial funciona** (PASO 5.1)
- [ ] **Tabla de resultados renderiza** (PASO 5.2)
- [ ] **Tabla de estados renderiza** (PASO 5.3)
- [ ] **Sliders MR/RP funcionan** (PASO 5.4)
- [ ] **Switches funcionan** (PASO 5.5)
- [ ] **Redistribución de votos funciona** (PASO 5.6)
- [ ] **Distribución MR manual funciona** (PASO 5.7)
- [ ] **Flechitas de estados funcionan** (PASO 5.8)
- [ ] **window.actualizarDesdeControles existe** (Punto crítico 1)
- [ ] **ControlSidebar renderizado** (Punto crítico 2)
- [ ] **Sin errores CORS** (Punto crítico 3)
- [ ] **Eventos se disparan** (Punto crítico 4)

---

## 🔧 COMANDOS RÁPIDOS DE DEBUG

Copia y pega en la consola del navegador:

```javascript
// DIAGNÓSTICO COMPLETO
console.log('=== DIAGNÓSTICO FRONTEND ===');
console.log('1. ControlSidebar:', !!document.querySelector('control-sidebar'));
console.log('2. actualizarDesdeControles:', typeof window.actualizarDesdeControles);
console.log('3. lastResult:', !!document.querySelector('control-sidebar')?.lastResult);
console.log('4. meta:', !!document.querySelector('control-sidebar')?.lastResult?.meta);
console.log('5. mr_por_estado:', !!document.querySelector('control-sidebar')?.lastResult?.meta?.mr_por_estado);
console.log('6. Sliders:', {
  mr: !!document.getElementById('input-mr'),
  rp: !!document.getElementById('input-rp'),
  umbral: !!document.getElementById('threshold-slider')
});
console.log('7. Switches:', {
  threshold: document.getElementById('threshold-switch')?.getAttribute('data-switch'),
  overrep: document.getElementById('overrep-switch')?.getAttribute('data-switch'),
  mrDist: document.getElementById('mr-distribution-switch')?.getAttribute('data-switch')
});

// TEST RÁPIDO DE BACKEND
fetch('https://back-electoral.onrender.com/procesar/diputados?anio=2024&plan=vigente', {method:'POST'})
  .then(r => r.ok ? console.log('✅ Backend OK') : console.error('❌ Backend FALLO:', r.status));
```

---

## 📞 PRÓXIMOS PASOS

1. **Ejecuta el diagnóstico completo** (comandos de arriba)
2. **Comparte los resultados** de la consola
3. **Indica qué checklist items están ❌**
4. Te daré instrucciones específicas para cada problema

---

**Status**: ✅ Archivo `ControlSidebar.js` corregido  
**Acción requerida**: Ejecutar tests de verificación
