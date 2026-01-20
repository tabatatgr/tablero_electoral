# 🔧 DEBUG: Tabla de Distritos No Se Actualiza - Solución

## 🐛 Problema
La tabla de distritos NO se actualiza cuando se calcula mayoría forzada.

## ✅ Cambios Aplicados

### 1. **Inicialización Automática de `lastResult`**
**Archivo**: `ControlSidebar.js` línea ~4440

**Problema**: Si `lastResult` o `lastResult.meta` no existen cuando se calcula mayoría forzada, no se pueden guardar los datos.

**Solución**: Inicializar automáticamente antes de guardar datos:

```javascript
// 🆕 INICIALIZAR lastResult si no existe
if (!this.lastResult) {
  console.log('[MAYORÍAS] ⚠️ lastResult no existe, inicializando...');
  this.lastResult = {
    meta: {},
    resultados: []
  };
}

// 🆕 INICIALIZAR lastResult.meta si no existe
if (!this.lastResult.meta) {
  console.log('[MAYORÍAS] ⚠️ lastResult.meta no existe, inicializando...');
  this.lastResult.meta = {};
}
```

---

### 2. **Generación Automática de `distritos_por_estado`**
**Archivo**: `ControlSidebar.js` línea ~4468

**Problema**: `updateStatesTable()` necesita `distritos_por_estado` (total de distritos por estado), pero el backend puede no enviarlo.

**Solución**: Si no viene del backend, inferirlo de `mr_por_estado`:

```javascript
if (data.distritos_por_estado) {
  this.lastResult.meta.distritos_por_estado = data.distritos_por_estado;
  console.log('[MAYORÍAS] ✅ distritos_por_estado guardado:', Object.keys(data.distritos_por_estado).length, 'estados');
} else if (data.mr_por_estado) {
  // 🆕 Inferir distritos_por_estado desde mr_por_estado
  console.log('[MAYORÍAS] ⚠️ distritos_por_estado no recibido, generando desde mr_por_estado...');
  const distritosPorEstado = {};
  Object.keys(data.mr_por_estado).forEach(estado => {
    const total = Object.values(data.mr_por_estado[estado]).reduce((a, b) => a + b, 0);
    distritosPorEstado[estado] = total;
  });
  this.lastResult.meta.distritos_por_estado = distritosPorEstado;
  console.log('[MAYORÍAS] ✅ distritos_por_estado inferido:', Object.keys(distritosPorEstado).length, 'estados');
}
```

**Ejemplo**:
Si el backend envía:
```json
{
  "mr_por_estado": {
    "AGUASCALIENTES": {"MORENA": 2, "PAN": 1},
    "BAJA CALIFORNIA": {"MORENA": 4, "PAN": 3, "PRI": 1}
  }
}
```

El frontend genera automáticamente:
```json
{
  "distritos_por_estado": {
    "AGUASCALIENTES": 3,    // 2 + 1
    "BAJA CALIFORNIA": 8    // 4 + 3 + 1
  }
}
```

---

### 3. **Logging Mejorado para Debug**
**Archivo**: `ControlSidebar.js` línea ~4474

**Nuevo**:
```javascript
console.log('[MAYORÍAS] 📋 Resumen de datos guardados en meta:', {
  mr_por_estado: !!this.lastResult.meta.mr_por_estado,
  mr_distritos_por_estado: !!this.lastResult.meta.mr_distritos_por_estado,
  distritos_por_estado: !!this.lastResult.meta.distritos_por_estado
});

// 🆕 Mostrar estructura de mr_por_estado
if (this.lastResult.meta.mr_por_estado) {
  const primerosEstados = Object.entries(this.lastResult.meta.mr_por_estado).slice(0, 2);
  console.log('[MAYORÍAS] 📊 Ejemplo de mr_por_estado:', JSON.stringify(primerosEstados, null, 2));
}
```

**Propósito**: Verificar exactamente qué datos se guardaron antes de llamar a `updateStatesTable()`.

---

## 🔍 Cómo Verificar si Funciona

### 1. **Recarga la página con cache limpio**
```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

### 2. **Abre la consola del navegador** (F12)

### 3. **Activa mayoría forzada y selecciona partido**

### 4. **Busca estos logs en orden**:

#### ✅ **Paso 1: Inicialización**
```
[MAYORÍAS] ⚠️ lastResult no existe, inicializando...
[MAYORÍAS] ⚠️ lastResult.meta no existe, inicializando...
```
O (si ya existía):
```
(no aparece mensaje de inicialización)
```

#### ✅ **Paso 2: Datos Guardados**
```
[MAYORÍAS] ✅ mr_por_estado (nombres) guardado: 32 estados
[MAYORÍAS] ✅ distritos_por_estado guardado: 32 estados
```
O (si se infirió):
```
[MAYORÍAS] ⚠️ distritos_por_estado no recibido, generando desde mr_por_estado...
[MAYORÍAS] ✅ distritos_por_estado inferido: 32 estados
```

#### ✅ **Paso 3: Resumen**
```
[MAYORÍAS] 📋 Resumen de datos guardados en meta: {
  mr_por_estado: true,
  mr_distritos_por_estado: true,
  distritos_por_estado: true
}

[MAYORÍAS] 📊 Ejemplo de mr_por_estado: [
  ["AGUASCALIENTES", {"MORENA": 2, "PAN": 1}],
  ["BAJA CALIFORNIA", {"MORENA": 4, "PAN": 3, "PRI": 1}]
]
```

#### ✅ **Paso 4: Llamada a updateStatesTable()**
```
[MAYORÍAS] 🔄 Llamando a updateStatesTable()...
[DEBUG] 🗺️ Actualizando tabla de MR por estado...
[DEBUG] 🔍 this.lastResult: {...}
[DEBUG] 🔍 mr_por_estado: ✅ (32 estados)
[DEBUG] 🔍 distritos_por_estado (Activo para diputados): ✅
[DEBUG] ✅ Tabla de estados actualizada en el DOM
[MAYORÍAS] ✅ updateStatesTable() ejecutado
```

#### ❌ **Si ves este error**:
```
[MAYORÍAS] ❌ lastResult o lastResult.meta no existen
```
→ El código de inicialización NO se ejecutó (revisar versión de cache)

#### ❌ **Si ves este error**:
```
[DEBUG] ❌ No hay datos de distribución geográfica en meta
```
→ El backend NO está enviando `mr_por_estado` O el formato es incorrecto

---

## 🔄 Flujo Completo (Esperado)

```
1. Usuario selecciona partido y tipo de mayoría
2. Frontend envía POST al backend
3. Backend responde con:
   - mr_por_estado (o mr_distritos_por_estado)
   - distritos_por_estado (opcional)
   - seat_chart
   - kpis
4. Frontend recibe respuesta
5. Inicializa lastResult/meta si no existe
6. Guarda mr_por_estado en lastResult.meta
7. Genera distritos_por_estado si no viene del backend
8. Llama a updateStatesTable()
9. updateStatesTable() renderiza HTML en el DOM
10. Tabla visible con nueva distribución
```

---

## 🚨 Si Aún NO Funciona

### Caso 1: Backend NO envía `mr_por_estado`

**Síntoma**:
```
[MAYORÍAS] ⚠️ No se recibió mr_por_estado ni mr_distritos_por_estado del backend
```

**Solución**: Verificar que el backend esté devolviendo el campo. Buscar en logs:
```
[MAYORÍAS] ✅ Data recibida: {...}
```
Copiar el JSON completo y verificar que tenga `mr_por_estado`.

---

### Caso 2: `updateStatesTable()` no encuentra el contenedor

**Síntoma**:
```
[WARN] ❌ No se encontró el contenedor states-table-container
```

**Solución**: Verificar que el HTML tenga el elemento:
```html
<div id="states-table-container"></div>
```

Ejecutar en consola:
```javascript
document.getElementById('states-table-container')
```
Debe devolver el elemento HTML, no `null`.

---

### Caso 3: Tabla se renderiza pero no es visible

**Síntoma**: Logs muestran éxito pero la tabla no aparece en pantalla.

**Verificación en consola**:
```javascript
const container = document.getElementById('states-table-container');
console.log('HTML:', container.innerHTML.substring(0, 200)); // Primeros 200 caracteres
console.log('Clases:', container.classList); // Debe NO tener 'hidden'
console.log('Display:', window.getComputedStyle(container).display); // Debe NO ser 'none'
```

**Solución**: Si tiene clase `hidden`, el CSS lo está ocultando. Verificar que `updateStatesTable()` haga:
```javascript
container.classList.remove('hidden');
```

---

## 📦 Archivos Modificados

- ✅ `ControlSidebar.js` (v=20260119012500)
- ✅ `index.html` (cache actualizado)

---

## 🎯 Próximo Paso

1. **Recarga la página** (Ctrl+Shift+R)
2. **Activa mayoría forzada**
3. **Copia TODOS los logs** que empiecen con `[MAYORÍAS]` y `[DEBUG]`
4. **Pégalos aquí** para diagnosticar si aún no funciona

---

## 🎉 Éxito Esperado

Deberías ver:

✅ Notificación: "Mayoría simple calculada - MORENA necesita X%"
✅ Gráfico de escaños actualizado
✅ KPIs actualizados
✅ **Tabla de distritos por estado** mostrando la distribución de MR

Si la tabla aparece vacía o con datos antiguos → copiar logs completos.
