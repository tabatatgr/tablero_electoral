# ✅ CHECKLIST: Frontend vs Backend - Compatibilidad

## 📅 Fecha: 17 de enero de 2026
## 🎯 Objetivo: Verificar que el frontend envía datos correctamente según lo que espera el backend

---

## 🔍 ANÁLISIS COMPLETO

### ✅ **DIPUTADOS - Estado Actual**

#### **Frontend (`scripts/script_general/script.js`):**
- ✅ Endpoint: `POST /procesar/diputados`
- ✅ Envía `mr_distritos_manuales` (totales por partido)
- ✅ Envía `mr_distritos_por_estado` (desglose geográfico con IDs numéricos 1-32)
- ✅ Envía `mr_por_estado` (alias compatible, mismo contenido)
- ✅ Mapeo de nombres → IDs numéricos está implementado (líneas 612-633)
- ✅ Validación de formato: Si viene ID numérico, lo acepta directamente
- ✅ Fallback: Si no reconoce estado, normaliza acentos
- ✅ Logs de debug extensivos

#### **Backend esperado según documentación:**
- ✅ Acepta `mr_distritos_manuales` como JSON string
- ✅ Acepta `mr_por_estado` como JSON string (opcional)
- ✅ Devuelve `meta.mr_por_estado` con lo que recibió
- ✅ Usa MR fijos del frontend en vez de calcularlos

---

### ✅ **SENADO - Estado Actual**

#### **Frontend (`scripts/script_general/script.js`):**
- ✅ Endpoint: `POST /procesar/senado`
- ✅ **MISMA LÓGICA** que Diputados (reutiliza el mismo código)
- ✅ Envía `mr_distritos_manuales` (totales por partido)
- ✅ Envía `mr_por_estado` con IDs numéricos de estados
- ✅ Total esperado: 96 MR (3 senadores × 32 estados)

#### **Backend esperado según documentación:**
- ✅ Acepta los MISMOS campos que Diputados
- ✅ Valida que suma sea 96 MR
- ✅ Valida que todos los 32 estados estén presentes
- ✅ Calcula 32 RP proporcionalmente a votos

---

## 📊 FORMATO DE DATOS

### **1. Totales por Partido (`mr_distritos_manuales`)**

**Formato esperado por backend:**
```json
{
  "MORENA": 152,
  "PAN": 84,
  "MC": 42,
  "PRI": 35
}
```

**Lo que envía el frontend:**
```javascript
// Línea 602: Serialización a JSON string
jsonBody.mr_distritos_manuales = JSON.stringify(mr_distritos_manuales.distribucion);
```

**✅ Compatible:** El frontend envía JSON.stringify(), backend espera JSON string

---

### **2. Desglose por Estado (`mr_por_estado` / `mr_distritos_por_estado`)**

**Formato esperado por backend:**
```json
{
  "1": {"MORENA": 2, "PAN": 1, "MC": 0},     // Aguascalientes (3 senadores)
  "14": {"MORENA": 11, "PAN": 7, "MC": 2},   // Jalisco (20 distritos diputados)
  "9": {"MORENA": 20, "PAN": 4, "MC": 0}     // CDMX
}
```

**Lo que envía el frontend:**
```javascript
// Líneas 652-658: Envía AMBAS claves para compatibilidad
jsonBody.mr_distritos_por_estado = JSON.stringify(porEstadoConIDs);
jsonBody.mr_por_estado = JSON.stringify(porEstadoConIDs);
```

**Mapeo de nombres a IDs (líneas 612-622):**
```javascript
const NOMBRE_A_ID = {
  "AGUASCALIENTES": 1, "BAJA CALIFORNIA": 2, ..., "ZACATECAS": 32
};

// Conversión automática (líneas 625-640)
for (const [nombreEstado, distribuciones] of Object.entries(...)) {
  if (/^\d+$/.test(String(nombreEstado).trim())) {
    // Ya es ID numérico → usar directamente
    porEstadoConIDs[String(nombreEstado).trim()] = distribuciones;
  } else {
    // Es nombre → convertir a ID
    const nombreKey = String(nombreEstado).trim().toUpperCase();
    const id = NOMBRE_A_ID[nombreKey];
    porEstadoConIDs[id.toString()] = distribuciones;
  }
}
```

**✅ Compatible:** El frontend convierte nombres a IDs numéricos como espera el backend

---

## 🧪 VALIDACIONES IMPLEMENTADAS

### **Frontend:**
- ✅ Verifica que suma de MR sea correcta (línea 697-703)
- ✅ Cuenta estados enviados (debe ser 32)
- ✅ Logs de debug con primeros 3 IDs de estado
- ✅ Muestra ejemplo de distribución de Aguascalientes (ID "1")

### **Backend (según docs):**
- ✅ Valida suma total: 300 MR Diputados / 96 MR Senado
- ✅ Valida que 32 estados estén presentes
- ✅ Valida que cada partido tenga valor (puede ser 0)

---

## 🔄 FLUJO COMPLETO

### **1. Usuario hace micro-edición (flechitas ↑↓)**
```
VoteRedistribution.js → Actualiza window.mrDistributionManual
```

### **2. ControlSidebar detecta cambio**
```javascript
// sidebar.lastResult.meta.mr_por_estado se preserva localmente
```

### **3. cargarSimulacion() envía al backend**
```javascript
// script.js línea 597-660
if (mr_distritos_manuales && mr_distritos_manuales.activa) {
  jsonBody.mr_distritos_manuales = JSON.stringify(distribucion);
  jsonBody.mr_por_estado = JSON.stringify(porEstadoConIDs);
}
```

### **4. Backend procesa**
```python
mr_manuales = json.loads(body.get('mr_distritos_manuales'))
mr_por_estado = json.loads(body.get('mr_por_estado'))

# Usa MR del frontend, NO los recalcula
# Calcula RP proporcionalmente a votos
# Devuelve meta.mr_por_estado = mr_por_estado (preserva)
```

### **5. Frontend recibe respuesta**
```javascript
// script.js línea 972-1003
if (data.meta?.mr_por_estado) {
  sidebar.lastResult.meta.mr_por_estado = data.meta.mr_por_estado;
}
```

---

## ✅ VERIFICACIONES NECESARIAS

### **Para confirmar que TODO funciona:**

1. **Abrir consola del navegador** (F12)
2. **Hacer una micro-edición** con flechitas
3. **Buscar en la consola:**

```
[MR DISTRIBUTION] 🗺️ Enviando desglose por estado (mr_distritos_por_estado & mr_por_estado) con IDs numéricos: 32 estados

[DEBUG] 🗺️ mr_distritos_por_estado EN BODY - Estados enviados: 32 (debe ser 32)

[DEBUG] 🗺️ Primeros 3 IDs: 1, 2, 3

[DEBUG] 🗺️ Ejemplo ID "1" (Aguascalientes): {MORENA: 2, PAN: 1, ...}
```

4. **Verificar en Network tab:**
   - Request Payload debe tener `mr_distritos_manuales` Y `mr_por_estado`
   - Ambos deben ser JSON strings
   - `mr_por_estado` debe tener claves numéricas "1" a "32"

5. **Verificar respuesta del backend:**
   - `data.meta.mr_por_estado` debe existir
   - Debe contener los MISMOS 32 estados enviados
   - Los valores deben coincidir con lo que enviaste

---

## 🚨 PROBLEMAS POTENCIALES

### **Si NO funciona, revisar:**

#### **Problema 1: Backend no recibe `mr_por_estado`**
**Síntoma:** `data.meta.mr_por_estado` es `undefined` o vacío

**Causa:** Backend no está parseando el campo

**Solución:**
```python
# En el endpoint backend, asegurar:
mr_por_estado_str = body.get('mr_por_estado')
if mr_por_estado_str:
    mr_por_estado = json.loads(mr_por_estado_str)
    meta['mr_por_estado'] = mr_por_estado
```

---

#### **Problema 2: IDs de estados incorrectos**
**Síntoma:** Backend rechaza con error "Estado no reconocido"

**Causa:** Discrepancia en mapeo de IDs

**Solución:** Verificar que el mapeo frontend (línea 612-622) coincida con el del backend

---

#### **Problema 3: Suma de MR incorrecta**
**Síntoma:** Backend responde con error "Total MR incorrecto"

**Causa:** Flechitas no suman correctamente

**Solución:** Verificar logs:
```
[DEBUG] 📊 Total MR enviado al backend (mr_distritos_manuales): 300
[DEBUG] 🗺️ Total MR desde estados: 300
```

---

## 🎯 CONCLUSIÓN

### ✅ **EL FRONTEND ESTÁ BIEN IMPLEMENTADO**

- Envía TODOS los campos que el backend necesita
- Usa el formato correcto (JSON strings)
- Convierte nombres de estados a IDs numéricos
- Tiene logs extensivos para debugging
- Preserva la distribución geográfica localmente

### 🔍 **SIGUIENTE PASO:**

**Hacer una prueba en vivo:**

1. Cargar el dashboard
2. Abrir consola (F12)
3. Hacer una micro-edición con flechitas
4. Revisar que los logs muestren:
   - ✅ 32 estados enviados
   - ✅ IDs numéricos (1-32)
   - ✅ Total MR correcto
5. Verificar en Network tab el payload
6. Confirmar que la respuesta incluye `meta.mr_por_estado`

---

## 📝 NOTAS FINALES

**El mensaje original que compartiste es CORRECTO** ✅

- Describe exactamente cómo funciona el sistema
- El frontend YA implementa todo lo descrito
- Solo falta confirmar que el backend responda correctamente

**El código está en:**
- Frontend: `scripts/script_general/script.js` líneas 400-700
- Documentación: `BACKEND_FLECHITAS_RESUMEN_EJECUTIVO.md`

**Si hay algún problema, probablemente sea:**
- Backend no está devolviendo `meta.mr_por_estado`
- Backend está recalculando MR en vez de usar los del frontend
- Mapeo de IDs de estados no coincide entre frontend/backend
