# 📋 Especificación Backend: seat_chart con Desglose MR/PM/RP

## 🎯 Objetivo

El backend debe enviar el **desglose de escaños por tipo** (MR, PM, RP) en el objeto `seat_chart` para que el frontend pueda mostrar la tabla completa de resultados.

---

## 📊 Estructura Actual (INCOMPLETA)

### Lo que envías ahora:

```json
{
  "seat_chart": [
    {
      "party": "MORENA",
      "seats": 247,
      "color": "#8B2231",
      "percent": 49.4,
      "votes": 24286412
    },
    {
      "party": "PVEM",
      "seats": 76,
      "color": "#1E9F00",
      "percent": 15.2,
      "votes": 4993902
    }
  ]
}
```

### ❌ **Problema**:
- Falta `mr` (Mayoría Relativa)
- Falta `pm` (Plurinominal)
- Falta `rp` (Representación Proporcional)

---

## ✅ Estructura Requerida (COMPLETA)

### Lo que necesitamos que envíes:

```json
{
  "seat_chart": [
    {
      "party": "MORENA",
      "seats": 247,          // ← Total de escaños
      "color": "#8B2231",
      "percent": 49.4,        // ← % de votos (actual)
      "votes": 24286412,
      "mr": 150,              // ← 🆕 AGREGAR: Mayoría Relativa
      "pm": 30,               // ← 🆕 AGREGAR: Plurinominal
      "rp": 67                // ← 🆕 AGREGAR: Representación Proporcional
    },
    {
      "party": "PVEM",
      "seats": 76,
      "color": "#1E9F00",
      "percent": 15.2,
      "votes": 4993902,
      "mr": 45,               // ← 🆕 AGREGAR
      "pm": 12,               // ← 🆕 AGREGAR
      "rp": 19                // ← 🆕 AGREGAR
    },
    {
      "party": "PAN",
      "seats": 69,
      "color": "#0055A5",
      "percent": 13.8,
      "votes": 10049424,
      "mr": 40,               // ← 🆕 AGREGAR
      "pm": 10,               // ← 🆕 AGREGAR
      "rp": 19                // ← 🆕 AGREGAR
    }
  ]
}
```

---

## 📐 Validación de Datos

### **Regla de Suma**:
```
mr + pm + rp = seats
```

### **Ejemplo**:
```json
{
  "party": "MORENA",
  "seats": 247,
  "mr": 150,
  "pm": 30,
  "rp": 67
}
```

**Validación**:
```
150 + 30 + 67 = 247 ✅
```

Si la suma no coincide, habrá inconsistencia en la tabla.

---

## 🔢 Tipos de Escaños según Sistema Electoral

### **Sistema Mixto** (Diputados Federales):
- **MR** (Mayoría Relativa): 300 escaños
- **RP** (Representación Proporcional): 200 escaños
- **PM** (Plurinominal): Se calculan con fórmulas de sobrerrepresentación
- **Total**: 500 escaños

### **Sistema Mixto** (Senadores):
- **MR** (Mayoría Relativa): 2 por estado × 32 = 64
- **Primera Minoría**: 1 por estado × 32 = 32
- **RP** (Representación Proporcional): 32 escaños
- **Total**: 128 escaños

---

## 🛠️ Implementación en el Backend

### **Endpoint Afectado**:
```
POST https://back-electoral.onrender.com/simulate
```

### **Cambios Necesarios**:

1. **Agregar campos al objeto de cada partido**:
   - `mr`: integer
   - `pm`: integer (opcional según sistema)
   - `rp`: integer

2. **Calcular desglose**:
   ```python
   # Pseudocódigo
   for partido in resultados:
       partido['mr'] = calcular_escanos_mr(partido)
       partido['rp'] = calcular_escanos_rp(partido)
       partido['pm'] = calcular_escanos_pm(partido)  # Si aplica
       partido['seats'] = partido['mr'] + partido['pm'] + partido['rp']
   ```

3. **Validar suma antes de enviar**:
   ```python
   assert partido['mr'] + partido['pm'] + partido['rp'] == partido['seats']
   ```

---

## 📋 Checklist de Cambios

### **Backend**:
- [ ] Agregar campo `mr` a cada item de `seat_chart`
- [ ] Agregar campo `pm` a cada item de `seat_chart`
- [ ] Agregar campo `rp` a cada item de `seat_chart`
- [ ] Validar que `mr + pm + rp = seats`
- [ ] Probar con simulación de Diputados
- [ ] Probar con simulación de Senado

### **Frontend** (ya implementado):
- [x] Leer campos `mr`, `pm`, `rp` del backend
- [x] Mostrar columnas dinámicas según sistema
- [x] Ocultar columnas si no hay datos (fallback actual)
- [x] Mostrar porcentaje de escaños en columna Total
- [x] Cache de colores sincronizado

---

## 🧪 Ejemplo de Respuesta Completa

### **Request**:
```json
POST /simulate
{
  "camara": "diputados",
  "anio": 2024,
  "modelo": "mixto",
  "simulacion": {
    "MORENA": { "votos": 24286412 },
    "PAN": { "votos": 10049424 },
    "PRI": { "votos": 6623752 }
  }
}
```

### **Response Esperado**:
```json
{
  "seat_chart": [
    {
      "party": "MORENA",
      "seats": 247,
      "color": "#8B2231",
      "percent": 49.4,
      "votes": 24286412,
      "mr": 150,        // ← MR calculado
      "pm": 30,         // ← PM calculado
      "rp": 67          // ← RP calculado
    },
    {
      "party": "PVEM",
      "seats": 76,
      "color": "#1E9F00",
      "percent": 15.2,
      "votes": 4993902,
      "mr": 45,
      "pm": 12,
      "rp": 19
    },
    {
      "party": "PAN",
      "seats": 69,
      "color": "#0055A5",
      "percent": 13.8,
      "votes": 10049424,
      "mr": 40,
      "pm": 10,
      "rp": 19
    },
    {
      "party": "PT",
      "seats": 50,
      "color": "#D52B1E",
      "percent": 10.0,
      "votes": 3254709,
      "mr": 30,
      "pm": 8,
      "rp": 12
    },
    {
      "party": "PRI",
      "seats": 33,
      "color": "#0D7137",
      "percent": 6.6,
      "votes": 6623752,
      "mr": 20,
      "pm": 5,
      "rp": 8
    },
    {
      "party": "MC",
      "seats": 24,
      "color": "#F58025",
      "percent": 4.8,
      "votes": 6497404,
      "mr": 14,
      "pm": 4,
      "rp": 6
    },
    {
      "party": "PRD",
      "seats": 1,
      "color": "#FFCC00",
      "percent": 0.2,
      "votes": 1449655,
      "mr": 1,
      "pm": 0,
      "rp": 0
    }
  ],
  "kpis": {
    "total_escanos": 500,
    "ratio_promedio": 1.0,
    "gallagher": 9.89,
    "total_votos": 57155258
  }
}
```

---

## 🔍 Validación Manual

### **Verificar suma de totales**:
```javascript
MORENA: 150 + 30 + 67 = 247 ✅
PVEM:    45 + 12 + 19 =  76 ✅
PAN:     40 + 10 + 19 =  69 ✅
PT:      30 +  8 + 12 =  50 ✅
PRI:     20 +  5 +  8 =  33 ✅
MC:      14 +  4 +  6 =  24 ✅
PRD:      1 +  0 +  0 =   1 ✅
--------------------------------
TOTAL:  300 + 69 + 131 = 500 ✅
```

### **Verificar consistencia con sistema**:
- **MR Total**: 300 (de 300 distritos) ✅
- **RP Total**: 131 (de 200 disponibles) ✅
- **PM Total**: 69 (calculados con fórmulas) ✅

---

## 🎨 Cómo se Verá en el Frontend

Una vez que envíes los datos correctos, la tabla mostrará:

```
┌─────────────┬─────┬─────┬─────┬────────────────┐
│ Partido     │  MR │  PM │  RP │ Total*         │
├─────────────┼─────┼─────┼─────┼────────────────┤
│ 🔴 MORENA   │ 150 │  30 │  67 │ 247 (49.4%)    │
│ 🟢 PVEM     │  45 │  12 │  19 │  76 (15.2%)    │
│ 🔵 PAN      │  40 │  10 │  19 │  69 (13.8%)    │
│ 🔴 PT       │  30 │   8 │  12 │  50 (10.0%)    │
│ 🔴 PRI      │  20 │   5 │   8 │  33 (6.6%)     │
│ 🟠 MC       │  14 │   4 │   6 │  24 (4.8%)     │
│ 🟡 PRD      │   1 │   0 │   0 │   1 (0.2%)     │
├─────────────┼─────┼─────┼─────┼────────────────┤
│ TOTAL       │ 300 │  69 │ 131 │ 500 (100%)     │
└─────────────┴─────┴─────┴─────┴────────────────┘
*Porcentaje de escaños
```

### **Columnas Dinámicas**:
- Si el sistema es **"mr"**: Solo muestra MR + Total
- Si el sistema es **"rp"**: Solo muestra RP + Total
- Si el sistema es **"mixto"**: Muestra MR + PM (opcional) + RP + Total

---

## 🚀 Beneficios

1. **✅ Transparencia**: Los usuarios ven el desglose completo
2. **✅ Validación**: Se puede verificar que MR + PM + RP = Total
3. **✅ Análisis**: Comparar qué partidos ganan más por MR vs RP
4. **✅ Coherencia**: Los datos coinciden con la visualización del hemiciclo

---

## 📞 Contacto

Si tienes dudas sobre la implementación o necesitas ejemplos adicionales, contáctame.

---

## 📝 Resumen Ejecutivo

### **TL;DR**:

**Lo que tienes que hacer**:
1. Agregar 3 campos a cada partido en `seat_chart`:
   - `"mr": 150` (escaños de Mayoría Relativa)
   - `"pm": 30` (escaños Plurinominales)
   - `"rp": 67` (escaños de Representación Proporcional)

2. Validar que `mr + pm + rp = seats`

3. Ya está! El frontend lo detectará automáticamente y mostrará la tabla completa.

**Si NO los envías**: El frontend mostrará solo "Partido" y "Total" (fallback actual).

**Si SÍ los envías**: El frontend mostrará "Partido", "MR", "PM", "RP", "Total" con desglose completo.

---

## ❌ TROUBLESHOOTING: Frontend no recibe campos MR/PM/RP

### 🔍 Diagnóstico

#### Backend está funcionando correctamente ✅

El test confirma que el endpoint `/seat-chart/diputados/2024` **SÍ devuelve** los campos correctamente:

```json
{
  "party": "MORENA",
  "seats": 247,
  "color": "#8B2231",
  "percent": 42.49,
  "votes": 24286412,
  "mr": 160,    ✅
  "pm": 0,      ✅
  "rp": 87      ✅
}
```

#### Frontend recibe datos incompletos ❌

Según los logs del navegador, el frontend recibe:

```json
{
  "party": "PAN",
  "seats": 54,
  "color": "#0055A5",
  "percent": 18,
  "votes": 10049424
  // ❌ Faltan: mr, pm, rp
}
```

---

### 🎯 Posibles Causas

#### 1. **El frontend está llamando a un endpoint diferente**
- Verifica en `script.js` qué URL está usando
- Busca: `fetch(`, `axios.post(`, `/simulate`
- ¿Está llamando a `/seat-chart/` o a `/simulate`?
- **Probable causa**: El endpoint `/simulate` NO tiene los campos nuevos

#### 2. **Problema de caché del navegador**
- Los datos antiguos están cacheados
- **Solución rápida:** Hard refresh (Ctrl+Shift+R)
- **Solución permanente:** Verificar headers `Cache-Control`

#### 3. **El frontend está usando datos de otra fuente**
- ¿Hay un localStorage o sessionStorage?
- ¿Hay datos pre-cargados en el HTML?
- ¿Hay un KPI cache en `ControlSidebar.js`?

#### 4. **El endpoint correcto es otro**
- Si el frontend llama a `/simulate`: Actualizar ESE endpoint
- Si el frontend llama a otro servicio: Verificar cuál es

---

### ✅ Acciones Recomendadas

#### **Para el equipo de frontend:**

1. **Hard refresh del navegador:**
   ```
   Ctrl + Shift + R (Windows/Linux)
   Cmd + Shift + R (Mac)
   ```

2. **Limpiar caché del navegador:**
   - Abrir DevTools (F12)
   - Ir a Network → Disable cache (checkbox)
   - Recargar página

3. **Verificar qué endpoint está llamando:**
   - En DevTools → Network
   - Buscar peticiones con "simulate" o "seat-chart"
   - Ver qué URL se está llamando
   - Ver la respuesta completa (Response tab)
   - **Copiar la URL exacta** que está usando

4. **Verificar el código JavaScript:**
   - Buscar en `script.js` o `ControlSidebar.js`
   - Encontrar donde se procesa `seat_chart`
   - Verificar que NO esté filtrando u omitiendo los campos `mr`, `pm`, `rp`

---

### 🔬 Comandos de Debug

En la consola del navegador, ejecuta:

```javascript
// Ver qué datos tiene realmente
console.log("seat_chart completo:", JSON.stringify(window.lastSeatChart || {}, null, 2));

// Hacer una petición manual al endpoint de prueba
fetch('https://back-electoral.onrender.com/seat-chart/diputados/2024?plan=vigente')
  .then(r => r.json())
  .then(data => {
    console.log("✅ Respuesta directa del backend:");
    console.log(JSON.stringify(data.seats[0], null, 2));
    console.log("¿Tiene mr?", data.seats[0].mr);
    console.log("¿Tiene pm?", data.seats[0].pm);
    console.log("¿Tiene rp?", data.seats[0].rp);
  });

// Verificar qué endpoint está usando realmente el frontend
performance.getEntriesByType("resource")
  .filter(r => r.name.includes("simulate") || r.name.includes("seat-chart"))
  .forEach(r => console.log("📡 Endpoint llamado:", r.name));
```

---

### 📋 Checklist de Troubleshooting

#### **Para frontend:**
- [ ] Hard refresh del navegador (Ctrl+Shift+R)
- [ ] Verificar en Network DevTools qué endpoint se llama
- [ ] Copiar la URL exacta del endpoint
- [ ] Verificar la respuesta completa en Network → Response tab
- [ ] Buscar en código JS si se están filtrando campos
- [ ] Verificar que no haya localStorage/sessionStorage con datos viejos
- [ ] Comprobar que el frontend esté leyendo la última versión

#### **Para backend:**
- [ ] Verificar que **TODOS** los endpoints devuelvan `mr`, `pm`, `rp`
- [ ] Especialmente verificar el endpoint que usa el frontend en producción
- [ ] Si es `/simulate`: Actualizar ese endpoint también
- [ ] Si hay múltiples endpoints: Actualizar todos
- [ ] Agregar logging para ver qué datos se están enviando

---

### 🚀 Soluciones según la Causa

#### **Si el problema es caché:**
- Hard refresh resolverá temporalmente
- Agregar `?v=timestamp` o `?t=${Date.now()}` a las peticiones para forzar actualización
- Configurar headers `Cache-Control: no-cache` en el backend

#### **Si el problema es código frontend:**
- Actualizar el código que procesa `seat_chart`
- Asegurarse de pasar `mr`, `pm`, `rp` a la tabla
- Verificar que `transformSeatChartToTable()` esté leyendo los campos

#### **Si el problema es endpoint diferente:**
- **Opción A**: Cambiar el frontend para que llame a `/seat-chart/diputados/{anio}`
- **Opción B**: Actualizar el endpoint actual (ej. `/simulate`) para incluir los campos
- **Opción C (recomendado)**: Actualizar TODOS los endpoints que devuelvan `seat_chart`

#### **Si el backend está enviando pero frontend no procesa:**
- Verificar `transformSeatChartToTable()` en `ControlSidebar.js` línea ~1900
- El código YA lee los campos: `item.mr || 0`, `item.pm || 0`, `item.rp || 0`
- Si llegan como 0, es porque el backend NO los está enviando

---

### 🎯 Próximo Paso Concreto

**IDENTIFICAR EL ENDPOINT EXACTO:**

1. Abrir el navegador con la app funcionando
2. Abrir DevTools (F12) → Network tab
3. Mover un slider para hacer simulación
4. Buscar la petición que trae los datos
5. **Copiar la URL completa** (ej: `https://back-electoral.onrender.com/simulate`)
6. Ver la respuesta (Response tab)
7. **Compartir**:
   - La URL exacta
   - La respuesta completa (o al menos 1 partido completo)

Con esa info podemos confirmar:
- ✅ Si el backend SÍ está enviando los campos (entonces es caché)
- ❌ Si el backend NO los está enviando (entonces hay que actualizar ese endpoint específico)

---

### 📞 Siguiente Acción

**Para el equipo de backend:**

> "Por favor confirmen cuál endpoint está usando el frontend en producción:
> - ¿`/simulate`?
> - ¿`/seat-chart/diputados/{anio}`?
> - ¿Otro?
> 
> Y verifica que ESE endpoint específico esté devolviendo `mr`, `pm`, `rp`.
> 
> El test de `/seat-chart/diputados/2024` funciona ✅, pero puede que el frontend use otro endpoint."
