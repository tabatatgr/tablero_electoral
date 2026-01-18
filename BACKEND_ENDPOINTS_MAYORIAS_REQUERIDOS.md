# ✅ ENDPOINTS DE MAYORÍAS - DOCUMENTACIÓN ACTUALIZADA

## 🎯 COMPORTAMIENTO ESPERADO DEL BACKEND

### **⚠️ IMPORTANTE: El backend debe RECALCULAR para alcanzar la mayoría**

Cuando el frontend llama a `/calcular/mayoria_forzada`, el backend debe:

1. **Tomar los parámetros del modelo actual** (plan, año, sistema, etc.)
2. **Calcular cuántos votos/territorios necesita el partido** para alcanzar la mayoría
3. **FORZAR el modelo** para que el partido obtenga esos votos/territorios
4. **Devolver el seat_chart COMPLETO recalculado** con todos los partidos ajustados

### **📊 Ejemplo de Comportamiento:**

**Entrada:**
```
GET /calcular/mayoria_forzada?partido=MORENA&tipo_mayoria=simple&plan=vigente&aplicar_topes=true&anio=2024
```

**Backend debe:**
1. Determinar: "Para mayoría simple necesito 251 diputados"
2. Calcular: "MORENA tiene 180 actualmente, necesita 71 más"
3. **Ajustar votos de MORENA** hasta que alcance 251 escaños
4. **Recalcular escaños de TODOS los partidos** con los nuevos porcentajes
5. Devolver el `seat_chart` completo con la distribución ajustada

**⚠️ CASO ESPECIAL - Topes activos:**
- Si `aplicar_topes=true` y la mayoría calificada es imposible (>300 escaños por topes)
- Devolver: `{ "viable": false, "mensaje": "Imposible con topes del 60%" }`

---

## ✅ ENDPOINTS CORRECTOS DEL BACKEND

### **1. Mayoría Forzada - DIPUTADOS**

**URL CORRECTA:**
```
GET https://back-electoral.onrender.com/calcular/mayoria_forzada
```
**⚠️ NOTA:** Para diputados NO se usa `/mayoria_forzada_diputados`, solo `/mayoria_forzada`

**Parámetros:**
```
?partido=MORENA
&tipo_mayoria=simple        // o "calificada"
&plan=vigente
&aplicar_topes=true
```

**Ejemplo de petición:**
```javascript
const url = 'https://back-electoral.onrender.com/calcular/mayoria_forzada?partido=MORENA&tipo_mayoria=simple&plan=vigente&aplicar_topes=true';

const response = await fetch(url);
const data = await response.json();

console.log(data);
// Respuesta esperada:
// {
//   "viable": true,
//   "diputados_necesarios": 251,
//   "diputados_obtenidos": 248,
//   "votos_porcentaje": 45.2,
//   "mr_asignados": 153,
//   "rp_asignados": 95,
//   ...
// }
```

---

### **2. Mayoría Forzada - SENADO**

**URL CORRECTA:**
```
GET https://back-electoral.onrender.com/calcular/mayoria_forzada_senado
```

**Parámetros:**
```
?partido=MORENA
&tipo_mayoria=simple        // o "calificada"
&plan=vigente
&aplicar_topes=true
&anio=2024                  // ⬅️ SOLO para senado
```

**Ejemplo de petición:**
```javascript
const url = 'https://back-electoral.onrender.com/calcular/mayoria_forzada_senado?partido=MORENA&tipo_mayoria=simple&plan=vigente&aplicar_topes=true&anio=2024';

const response = await fetch(url);
const data = await response.json();

console.log(data);
// Respuesta esperada:
// {
//   "viable": true,
//   "senadores_necesarios": 65,
//   "senadores_obtenidos": 70,
//   "votos_porcentaje": 45.0,
//   "estados_ganados": 24,
//   "mr_senadores": 48,
//   "pm_senadores": 10,
//   "rp_senadores": 12,
//   ...
// }
```

---

## 🔑 DIFERENCIAS CLAVE ENTRE ENDPOINTS

| Característica | Diputados | Senado |
|---------------|-----------|--------|
| **Endpoint** | `/calcular/mayoria_forzada` | `/calcular/mayoria_forzada_senado` |
| **Parámetro `anio`** | ❌ NO se envía | ✅ SÍ se envía |
| **Campo respuesta** | `diputados_necesarios` | `senadores_necesarios` |
| **Campo respuesta** | `diputados_obtenidos` | `senadores_obtenidos` |
| **Campo territorial** | `distritos_ganados` | `estados_ganados` |

---

## 📊 ESTRUCTURA DE RESPUESTA COMPLETA

### **Diputados (`/calcular/mayoria_forzada`):**

```json
{
  "viable": true,
  "diputados_necesarios": 251,      // Para mayoría simple (334 para calificada)
  "diputados_obtenidos": 248,       // Con % de votos dado
  "votos_porcentaje": 45.2,
  "mr_asignados": 153,
  "rp_asignados": 95,
  "partido": "MORENA",
  "plan": "vigente",
  "tipo_mayoria": "simple"
}
```

### **Senado (`/calcular/mayoria_forzada_senado`):**

```json
{
  "viable": true,
  "senadores_necesarios": 65,       // Para mayoría simple (86 para calificada)
  "senadores_obtenidos": 70,
  "votos_porcentaje": 45.0,
  "estados_ganados": 24,
  "mr_senadores": 48,
  "pm_senadores": 10,
  "rp_senadores": 12,
  "partido": "MORENA",
  "plan": "vigente",
  "tipo_mayoria": "simple"
}
```

---

## � TEST RÁPIDO EN CONSOLA

**Copia esto en la consola del navegador:**

```javascript
(async () => {
  const API = 'https://back-electoral.onrender.com';
  
  console.log('🧪 Test 1: Mayoría Forzada DIPUTADOS');
  const test1 = await fetch(`${API}/calcular/mayoria_forzada?partido=MORENA&tipo_mayoria=simple&plan=vigente&aplicar_topes=true`)
    .then(r => {
      console.log('Status Diputados:', r.status);
      return r.json();
    })
    .catch(e => ({ error: e.message }));
  console.log('✅ Diputados:', test1);
  
  console.log('🧪 Test 2: Mayoría Forzada SENADO');
  const test2 = await fetch(`${API}/calcular/mayoria_forzada_senado?partido=MORENA&tipo_mayoria=simple&plan=vigente&aplicar_topes=true&anio=2024`)
    .then(r => {
      console.log('Status Senado:', r.status);
      return r.json();
    })
    .catch(e => ({ error: e.message }));
  console.log('✅ Senado:', test2);
  
  if (test1.error || test2.error) {
    console.error('❌ Algún endpoint falló');
  } else {
    console.log('🎉 AMBOS ENDPOINTS FUNCIONAN');
  }
})();
```

---

## � CAMBIO REALIZADO EN EL FRONTEND

### **ANTES (Incorrecto):**
```javascript
// ❌ Incorrecto - endpoint no existe
const endpoint = camara === 'senado' 
  ? 'calcular/mayoria_forzada_senado' 
  : 'calcular/mayoria_forzada_diputados';  // ⬅️ NO EXISTE
```

### **DESPUÉS (Correcto):**
```javascript
// ✅ Correcto - endpoints que SÍ existen en el backend
const endpoint = camara === 'senado' 
  ? 'calcular/mayoria_forzada_senado'      // ✅ Para senado
  : 'calcular/mayoria_forzada';            // ✅ Para diputados (SIN sufijo)
```

---

## 📝 NOTAS IMPORTANTES

1. **El endpoint de diputados NO tiene sufijo:**
   - ✅ `/calcular/mayoria_forzada` (correcto)
   - ❌ `/calcular/mayoria_forzada_diputados` (NO EXISTE)

2. **El parámetro `anio` solo se usa para senado:**
   - Diputados: `partido`, `tipo_mayoria`, `plan`, `aplicar_topes`
   - Senado: `partido`, `tipo_mayoria`, `plan`, `aplicar_topes`, **`anio`**

3. **Usar UNDERSCORES (_) en nombres de parámetros:**
   - ✅ `tipo_mayoria` (correcto)
   - ❌ `tipoMayoria` o `tipo-mayoria` (incorrecto)

4. **El frontend acepta nombres flexibles en la respuesta:**
   - `senadores_necesarios` o `diputados_necesarios` o `escanos_necesarios`
   - `estados_ganados` o `distritos_ganados`

---

## 🚀 ESTADO ACTUAL

✅ **Frontend corregido** - Ahora usa `/calcular/mayoria_forzada` para diputados  
✅ **Parámetro `anio`** - Solo se envía para senado  
✅ **Logging detallado** - Para debugging  
✅ **Manejo de errores** - Con notificaciones al usuario  

---

## 🎯 PRÓXIMOS PASOS

1. **Prueba los endpoints** con el test de consola de arriba
2. **Verifica las respuestas** - Compara con las estructuras esperadas
3. **Si hay errores** - Revisa los logs en consola para más detalles

---

**Con estos cambios, la calculadora de mayorías debería funcionar correctamente** ✅
