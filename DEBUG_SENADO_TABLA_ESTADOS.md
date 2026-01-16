# 🐛 DEBUG: Tabla de Estados en Senado

## Problema Reportado

1. ❌ La tabla de distritos en **Senado** no carga en la primera vez
2. ❌ Los sliders de distribución MR en **Senado** no funcionan
3. ⚠️ La carga inicial no tiene nada que ver con el seat chart (confuso para usuarios)

## Diagnóstico Paso a Paso

### 1️⃣ Verificar Respuesta del Backend

Abre la **Consola del Navegador** (F12) y busca estos logs cuando cambies a Senado:

```
[DEBUG] 🗺️ Actualizando tabla de MR por estado...
[DEBUG] 🔍 Cámara actual: senadores
[DEBUG] 🔍 this.lastResult.meta: {...}
[DEBUG] 🔍 Keys en meta: [...array de keys...]
```

**¿Qué buscar?**

#### ✅ Caso CORRECTO (Backend envía datos):
```javascript
[DEBUG] 🔍 Keys en meta: ["mr_por_estado", "senadores_por_estado", ...]
[DEBUG] 🔍 mr_por_estado: ✅ (32 estados)
[DEBUG] 🔍 senadores_por_estado: ✅ Senado
[DEBUG] 🔍 Usando para tabla: ✅
```

#### ❌ Caso INCORRECTO (Backend NO envía datos):
```javascript
[DEBUG] 🔍 Keys en meta: []  // O array vacío, o sin senadores_por_estado
[DEBUG] 🔍 mr_por_estado: ❌ NO EXISTE
[DEBUG] 🔍 senadores_por_estado: ❌
[DEBUG] 🔍 Usando para tabla: ❌ NINGUNO DISPONIBLE
[DEBUG] 🔍 ESTRUCTURA COMPLETA DE META: {...}
```

### 2️⃣ Verificar Endpoint del Backend

El backend debe responder con esta estructura para **Senado**:

```json
{
  "seat_chart": [...],
  "meta": {
    "mr_por_estado": {
      "AGUASCALIENTES": {
        "MORENA": 2,
        "PAN": 1,
        "PRI": 0
      },
      "BAJA CALIFORNIA": {...},
      ...
    },
    "senadores_por_estado": {
      "AGUASCALIENTES": 3,
      "BAJA CALIFORNIA": 3,
      "BAJA CALIFORNIA SUR": 3,
      ...
    }
  }
}
```

**Endpoints a verificar:**

```bash
# Endpoint que debería funcionar
GET /data/initial?camara=senadores

# O el endpoint de procesamiento
POST /procesar/senadores
```

### 3️⃣ Verificar Request del Frontend

Busca en la consola:

```
[DEBUG] Método HTTP: POST para cámara: senado
[DEBUG] URL final: https://back-electoral.onrender.com/procesar/senadores?...
```

**¿El frontend está llamando al endpoint correcto?**

- ✅ Debe llamar a `/procesar/senadores` (NO `/procesar/diputados`)
- ✅ El parámetro `camara` debe ser `"senado"` o `"senadores"`

### 4️⃣ Verificar Sliders

Busca estos logs cuando se intenten actualizar los sliders:

```
[MR SLIDERS] 🎯 Actualizando sliders con datos de la tabla de estados...
[MR SLIDERS] 🔍 Cámara actual: senadores
[MR SLIDERS] 🔍 Partidos recibidos: ["MORENA", "PAN", "PRI", ...]
[MR SLIDERS] 🔍 mrPorEstado keys: 32 estados
[MR SLIDERS] 📊 Totales calculados: {MORENA: 45, PAN: 12, ...}
```

**Si ves esto:**
```
[MR SLIDERS] ⚠️ No hay datos suficientes para actualizar sliders
[MR SLIDERS] 🔍 mrPorEstado: false
```

→ **Problema:** El backend NO está enviando `mr_por_estado` para Senado.

## Soluciones Posibles

### Solución 1: Backend no envía `meta` para Senado

**Problema:** El backend solo envía `meta.mr_por_estado` para Diputados.

**Verificar en backend:**
```python
# En el archivo main.py del backend
# Buscar la función que procesa senadores
# Debe incluir esto en la respuesta:

return {
    "seat_chart": [...],
    "meta": {
        "mr_por_estado": {
            "AGUASCALIENTES": {...},
            ...
        },
        "senadores_por_estado": {
            "AGUASCALIENTES": 3,
            ...
        }
    }
}
```

**Acción:** Actualizar el backend para que también devuelva `meta` en `/procesar/senadores`.

### Solución 2: Usar endpoint `/data/initial`

En lugar de llamar a `/procesar/senadores` en la carga inicial, usar:

```javascript
// En script.js, modificar la carga inicial para Senado
async function cargarDatosInicialesSenado() {
  const response = await fetch('https://back-electoral.onrender.com/data/initial?camara=senadores');
  const data = await response.json();
  
  // Este endpoint SÍ incluye meta.mr_por_estado y meta.senadores_por_estado
  sidebar.lastResult = data;
  sidebar.updateStatesTable();
  sidebar.updateMRSlidersFromStatesData(data.meta.mr_por_estado, partidos);
}
```

### Solución 3: Frontend - Fallback cuando no hay `meta`

Si el backend no puede enviar `meta` inmediatamente, agregar un mensaje temporal:

```javascript
// En updateStatesTable()
if (!this.lastResult.meta) {
  container.innerHTML = `
    <div style="padding:20px; text-align:center; color:#6B7280;">
      <p>⚠️ Tabla geográfica no disponible para esta configuración</p>
      <p style="font-size:12px; margin-top:8px;">
        Los datos de distribución por estado se cargarán después del primer cálculo
      </p>
    </div>
  `;
  container.classList.remove('hidden');
  return;
}
```

## Checklist de Debugging

- [ ] **Paso 1:** Abrir consola del navegador (F12)
- [ ] **Paso 2:** Cambiar a pestaña "Senadores" o "Senado"
- [ ] **Paso 3:** Buscar log `[DEBUG] 🔍 ESTRUCTURA COMPLETA DE META:`
- [ ] **Paso 4:** Verificar si aparece `"senadores_por_estado"` en el objeto
- [ ] **Paso 5:** Si NO aparece, el problema está en el **backend**
- [ ] **Paso 6:** Si SÍ aparece, el problema está en el **frontend**

## Logs Clave a Compartir

Si necesitas ayuda, comparte estos logs:

1. **Log de meta:**
```
[DEBUG] 🔍 Keys en meta: [...]
```

2. **Log de estructura completa:**
```
[DEBUG] 🔍 ESTRUCTURA COMPLETA DE META: {...}
```

3. **Log de sliders:**
```
[MR SLIDERS] 📊 Totales calculados: {...}
```

4. **Log de URL del request:**
```
[DEBUG] URL final: https://...
```

## Próximos Pasos

1. ✅ **Código actualizado** con logs detallados
2. 🔍 **Revisar consola** cuando cambies a Senado
3. 📋 **Compartir logs** para identificar el problema exacto
4. 🔧 **Actualizar backend** o **frontend** según el diagnóstico

---

**Última actualización:** 2026-01-16  
**Estado:** Esperando logs de debugging para diagnosticar
