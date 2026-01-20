# ✅ Frontend Mayoría Forzada - Correcciones para POST Backend

## 📋 Cambios Realizados

### 1. **Agregado campo `plan` al payload POST** 
**Archivo**: `ControlSidebar.js` línea ~4248

**Antes**:
```javascript
const payload = {
  partido: partido,
  tipo_mayoria: tipoMayoria,
  anio: parseInt(anio),
  solo_partido: soloPartido,
  aplicar_topes: aplicarTopes
};
```

**Después**:
```javascript
const payload = {
  partido: partido,
  tipo_mayoria: tipoMayoria,
  plan: plan,  // 🆕 AGREGADO: vigente, plan_a, plan_c, personalizado
  anio: parseInt(anio),
  solo_partido: soloPartido,
  aplicar_topes: aplicarTopes
};
```

✅ **Efecto**: El backend ahora recibe el modelo/plan seleccionado (vigente, plan_a, plan_c, personalizado).

---

### 2. **Manejo mejorado de campos `mr_por_estado` y `mr_distritos_por_estado`**
**Archivo**: `ControlSidebar.js` línea ~4433

Según la documentación del backend, devuelve **DOS campos** diferentes:
- `mr_distritos_por_estado`: Con IDs numéricos (`"1": {"MORENA": 2}`)
- `mr_por_estado`: Con nombres de estados (`"AGUASCALIENTES": {"MORENA": 2}`)

**Cambios**:

1. **Detectar ambos campos con fallback**:
```javascript
const mrPorEstado = data.mr_por_estado || data.mr_distritos_por_estado;
```

2. **Guardar AMBOS campos en lastResult.meta** (máxima compatibilidad):
```javascript
if (data.mr_por_estado) {
  this.lastResult.meta.mr_por_estado = data.mr_por_estado;
  console.log('[MAYORÍAS] ✅ mr_por_estado (nombres) guardado');
}

if (data.mr_distritos_por_estado) {
  this.lastResult.meta.mr_distritos_por_estado = data.mr_distritos_por_estado;
  console.log('[MAYORÍAS] ✅ mr_distritos_por_estado (IDs) guardado');
}
```

3. **Mejor logging para debug**:
```javascript
console.log('[MAYORÍAS] ✅ Datos de MR por estado recibidos:', numEstados, 'estados');
console.log('[MAYORÍAS] 📊 Muestra de datos:', JSON.stringify(Object.entries(mrPorEstado).slice(0, 3), null, 2));
console.log('[MAYORÍAS] 📋 Estados guardados:', Object.keys(this.lastResult.meta.mr_por_estado || {}).length);
console.log('[MAYORÍAS] ✅ updateStatesTable() ejecutado');
```

✅ **Efecto**: La tabla de distritos se actualiza correctamente sin importar qué formato use el backend.

---

### 3. **Corregido error de sintaxis en `else` duplicado**
**Archivo**: `ControlSidebar.js` línea ~4472

**Antes** (causaba error de compilación):
```javascript
    } else {
      console.warn('[MAYORÍAS] ⚠️ No se recibió mr_por_estado...');
    } else {  // ❌ DUPLICADO
      console.warn('[MAYORÍAS] ⚠️ No se recibió mr_distritos_por_estado...');
    }
```

**Después**:
```javascript
    } else {
      console.warn('[MAYORÍAS] ⚠️ No se recibió mr_por_estado ni mr_distritos_por_estado del backend');
    }
```

✅ **Efecto**: Código compila sin errores.

---

### 4. **Actualizado cache en `index.html`**
**Archivo**: `index.html` línea 21

**Cambios**:
- Corregido `</script></script>` duplicado
- Actualizado versión de cache: `v=20260119010000`

```html
<script type="module" src="components/panel_control/ControlSidebar.js?v=20260119010000"></script>
```

✅ **Efecto**: El navegador carga la versión actualizada del código.

---

## 🔍 Verificación Recomendada

### 1. **Abrir la consola del navegador** y buscar estos logs:

#### ✅ Debe aparecer al calcular mayoría forzada:
```
[MAYORÍAS] 📡 Payload (POST body): {
  "partido": "MORENA",
  "tipo_mayoria": "simple",
  "plan": "vigente",  ← NUEVO CAMPO
  "anio": 2024,
  "solo_partido": true,
  "aplicar_topes": true
}
```

#### ✅ Debe aparecer cuando el backend responde:
```
[MAYORÍAS] ✅ Data recibida: {...}
[MAYORÍAS] ✅ votos_custom recibido: {...}
[MAYORÍAS] ✅ mr_distritos_manuales recibido: {...}
[MAYORÍAS] ✅ Datos de MR por estado recibidos: 32 estados
[MAYORÍAS] 📊 Muestra de datos: [...]
[MAYORÍAS] ✅ mr_por_estado (nombres) guardado
[MAYORÍAS] 🗺️ Actualizando tabla de distritos con datos de mayoría forzada...
[MAYORÍAS] 🔄 Llamando a updateStatesTable()...
[MAYORÍAS] ✅ updateStatesTable() ejecutado
```

#### ❌ Si el POST retorna 405 (esperado si el backend aún usa GET):
```
[MAYORÍAS] ⚠️ POST retornó 405 - Backend usa GET
[MAYORÍAS] 📡 Reintentando con GET: ...
```

---

### 2. **Verificar que la tabla de distritos se actualiza**

1. Activar mayoría forzada
2. Seleccionar partido (ej: MORENA)
3. Seleccionar tipo (simple o calificada)
4. **Verificar en la tabla inferior** que los distritos MR se actualizan por estado

---

## 🎯 Próximos Pasos (Si aún no funciona)

### Si la tabla NO se actualiza:

1. **Verificar que `lastResult.meta` existe**:
   - Buscar en logs: `❌ lastResult o lastResult.meta no existen`
   - Si aparece → problema de inicialización

2. **Verificar que `updateStatesTable()` existe**:
   - Buscar en logs: `⚠️ updateStatesTable() no disponible`
   - Si aparece → verificar que la función existe en `ControlSidebar.js`

3. **Verificar estructura de datos recibidos**:
   - Buscar en logs: `📊 Muestra de datos: [...]`
   - Copiar JSON completo y verificar estructura

---

## 📚 Campos Enviados al Backend (POST)

✅ **Payload completo enviado**:
```json
{
  "partido": "MORENA",           // string
  "tipo_mayoria": "simple",      // "simple" | "calificada"
  "plan": "vigente",             // 🆕 "vigente" | "plan_a" | "plan_c" | "personalizado"
  "anio": 2024,                  // number
  "solo_partido": true,          // boolean
  "aplicar_topes": true          // boolean
}
```

---

## 📚 Campos Esperados del Backend (Response)

✅ **Campos críticos para frontend**:

### Para Diputados:
```json
{
  "votos_custom": { "MORENA": 47.50, ... },
  "mr_distritos_manuales": { "MORENA": 162, ... },
  "mr_distritos_por_estado": { "1": {"MORENA": 2}, ... },  // IDs numéricos
  "mr_por_estado": { "AGUASCALIENTES": {"MORENA": 2}, ... },  // Nombres
  "seat_chart": [...],
  "kpis": {...}
}
```

### Para Senado:
```json
{
  "votos_custom": { "MORENA": 48.20, ... },
  "mr_distritos_por_estado": { ... },  // Opcional en Senado
  "mr_por_estado": { ... },
  "seat_chart": [...],
  "kpis": {...}
}
```

---

## 🎉 Resumen

✅ **Completado**:
- Campo `plan` agregado al POST
- Manejo mejorado de `mr_por_estado` y `mr_distritos_por_estado`
- Mejor logging para debug
- Error de sintaxis corregido
- Cache actualizado

✅ **Próximo test**:
1. Recargar página (Ctrl+Shift+R para forzar cache)
2. Activar mayoría forzada
3. Seleccionar partido
4. Verificar logs en consola
5. Verificar que tabla de distritos se actualiza

**¡Listo para probar!** 🚀
