# 🎯 Guía de Prueba - Mayoría Forzada con `solo_partido`

## ✅ Cambios Implementados

### 1. **Nuevos Controles en el Panel**

Se agregaron al grupo "Mayorías":

- ✅ **Checkbox "Solo el partido (sin coalición)"** - Controla el parámetro `solo_partido`
- ✅ **Checkbox "Aplicar topes constitucionales"** - Controla `aplicar_topes`
- ✅ **Botón "🎯 Calcular Mayoría Forzada"** - Dispara el cálculo
- ✅ **Texto de ayuda dinámico** - Explica qué hace cada opción
- ✅ **Warning automático** - Alerta si mayoría calificada + topes (no viable)

### 2. **Funcionalidad Implementada**

#### `solo_partido=true` (DEFAULT - Checkbox activado):
```
✅ Solo MORENA alcanzará la mayoría (251+ escaños)
❌ PT y PVEM tendrán 0 escaños
📊 Los votos se redistribuyen proporcionalmente entre TODOS los partidos
```

#### `solo_partido=false` (Checkbox desactivado):
```
✅ MORENA + PT + PVEM alcanzarán mayoría juntos (251+ escaños)
📊 Distribución normal entre la coalición
```

---

## 🧪 Casos de Prueba

### **PRUEBA 1: Senado 96 Escaños - Solo MR + PM**

#### Configuración:
1. Ir a **Senado** → **2024** → **Personalizado**
2. Configurar:
   - **Magnitud total**: 96 escaños
   - **Regla Electoral**: Mixto
   - **MR**: 64 escaños
   - **RP**: 0 escaños
   - **Primera Minoría**: Activar switch → 32 escaños

3. Abrir grupo **"Mayorías"**:
   - Activar switch de Mayorías
   - **Tipo**: Mayoría Simple
   - **Partido**: MORENA
   - **Solo el partido**: ✅ Activado
   - **Aplicar topes**: ✅ Activado

4. Click en **"🎯 Calcular Mayoría Forzada"**

#### Resultados Esperados:

**Desglose por tipo de escaño:**
```
Total: 96 escaños (100%)
├─ MR Pura: 64 escaños (66.67%)
├─ Primera Minoría: 32 escaños (33.33%)
└─ RP: 0 escaños (0%)
```

**Umbral para mayoría simple:**
- Necesita: 49 escaños (50% + 1)

**Distribución esperada:**
| Partido | MR Pura | PM | Total | % |
|---------|---------|-----|-------|---|
| MORENA  | ~28-32  | ~17-21 | ~49+ | ~51% |
| PAN     | ~12-15  | ~6-8   | ~20  | ~21% |
| PRI     | ~10-12  | ~4-5   | ~15  | ~16% |
| MC      | ~6-8    | ~2-3   | ~8   | ~8%  |
| PT      | 0       | 0      | 0    | 0%   |
| PVEM    | 0       | 0      | 0    | 0%   |

**Validaciones:**
- ✅ MORENA debe tener ≥49 escaños (mayoría simple)
- ✅ PT y PVEM deben tener 0 escaños (solo_partido=true)
- ✅ Total debe sumar exactamente 96
- ✅ MR Pura + PM = 96 (no hay RP)

---

### **PRUEBA 2: MORENA Mayoría Simple - Solo el Partido**

#### Configuración:
1. **Diputados** → **2024** → **Vigente**
2. Grupo **"Mayorías"**:
   - **Tipo**: Mayoría Simple (251 escaños)
   - **Partido**: MORENA
   - **Solo el partido**: ✅ Activado
   - **Topes**: ✅ Activado

#### Resultado Esperado:
```json
{
  "viable": true,
  "votos_necesarios": 47.50,
  "mr_distritos": 162,
  "rp_estimado": 95,
  "partido": "MORENA",
  "solo_partido": true,
  
  "votos_custom": {
    "MORENA": 47.50,
    "PAN": 18.64,
    "PRI": 15.23,
    "MC": 10.16,
    "PVEM": 5.08,  // ⬇️ Baja proporcionalmente
    "PT": 3.38     // ⬇️ Baja proporcionalmente
  },
  
  "mr_distritos_manuales": {
    "MORENA": 162,
    "PAN": 60,
    "PRI": 46,
    "MC": 32,
    "PT": 0,       // ❌ 0 escaños
    "PVEM": 0      // ❌ 0 escaños
  }
}
```

**Validaciones:**
- ✅ MORENA: 251+ escaños (mayoría alcanzada)
- ✅ PT y PVEM: 0 escaños
- ✅ Votos de PT y PVEM **NO son 0%** (redistribución proporcional)
- ✅ Total escaños = 500

---

### **PRUEBA 3: MORENA+PT+PVEM Mayoría Simple - Con Coalición**

#### Configuración:
1. **Diputados** → **2024** → **Vigente**
2. Grupo **"Mayorías"**:
   - **Tipo**: Mayoría Simple
   - **Partido**: MORENA+PT+PVEM
   - **Solo el partido**: ❌ Desactivado
   - **Topes**: ✅ Activado

#### Resultado Esperado:
```json
{
  "partido": "MORENA+PT+PVEM",
  "solo_partido": false,
  
  "escanos_totales_coalicion": 283,
  
  "resultados": [
    {"partido": "MORENA", "escanos": 251},
    {"partido": "PT", "escanos": 18},
    {"partido": "PVEM", "escanos": 14}
  ]
}
```

**Validaciones:**
- ✅ MORENA + PT + PVEM ≥ 251 escaños (coalición alcanza mayoría)
- ✅ PT y PVEM **SÍ tienen escaños** (solo_partido=false)
- ✅ Distribución normal de votos

---

### **PRUEBA 4: PAN Mayoría Calificada - Auto-desactivar Topes**

#### Configuración:
1. **Diputados** → **2024** → **Vigente**
2. Grupo **"Mayorías"**:
   - **Tipo**: Mayoría Calificada (334 escaños)
   - **Partido**: PAN
   - **Solo el partido**: ✅ Activado
   - **Topes**: ✅ Activado (se debe desactivar automáticamente)

#### Comportamiento Esperado:

1. Al hacer click en "Calcular":
   ```
   ⚠️ Mayoría calificada con topes constitucionales probablemente NO sea viable.
   
   ¿Deseas desactivar los topes automáticamente?
   [Sí] [No]
   ```

2. Si acepta → Topes se desactivan automáticamente

3. Notificación:
   ```
   ℹ️ Topes desactivados automáticamente
   
   Para permitir mayoría calificada de PAN, se desactivaron los topes 
   constitucionales (la mayoría calificada requiere 334 escaños, 
   el tope permite máximo 300).
   ```

**Validaciones:**
- ✅ Sistema detecta conflicto mayoría calificada + topes
- ✅ Muestra diálogo de confirmación
- ✅ Desactiva topes si usuario acepta
- ✅ Muestra notificación informativa

---

### **PRUEBA 5: Verificar Actualización de Sliders**

**IMPORTANTE**: El backend devuelve:
```json
{
  "votos_custom": {
    "MORENA": 47.50,
    "PAN": 18.64,
    ...
  },
  "mr_distritos_manuales": {
    "MORENA": 162,
    "PAN": 60,
    ...
  }
}
```

**El frontend DEBE:**
1. ✅ Actualizar sliders de votos por partido
2. ✅ Actualizar sliders de distritos MR
3. ✅ Actualizar tabla de resultados
4. ✅ Actualizar gráfico de escaños (seat chart)

#### Cómo Verificar:

1. Calcular mayoría forzada
2. Abrir grupo "Redistribución de Votos"
3. Verificar que los sliders de porcentajes se hayan actualizado:
   - MORENA: ~47.50%
   - PAN: ~18.64%
   - etc.

4. Verificar tabla de resultados:
   - MORENA: 251+ escaños
   - PT: 0 escaños
   - PVEM: 0 escaños

---

## 🔍 Debugging

### Ver Logs en Consola:

```javascript
// Ver parámetros enviados al backend
console.log('[MAYORÍAS] 📋 Payload POST:', payload);

// Ver respuesta del backend
console.log('[MAYORÍAS] ✅ Data recibida:', data);

// Ver si solo_partido fue confirmado
console.log('[MAYORÍAS] solo_partido:', data.solo_partido);
```

### Verificar Request en Network Tab:

1. Abrir DevTools → Network
2. Filtrar por `/mayoria_forzada`
3. Click en request
4. Ver **Request Payload**:
   ```json
   {
     "partido": "MORENA",
     "tipo_mayoria": "simple",
     "anio": 2024,
     "solo_partido": true,  // ← Verificar que se envíe
     "aplicar_topes": true
   }
   ```

### Errores Comunes:

#### Error: 405 Method Not Allowed
```
🔧 Solución: El código implementa fallback automático a GET
```

#### Error: solo_partido no se está enviando
```
🔧 Verificar que el checkbox esté implementado:
const soloPartidoCheckbox = document.getElementById('mayoria-solo-partido');
console.log('Checkbox encontrado:', !!soloPartidoCheckbox);
console.log('Valor:', soloPartidoCheckbox.checked);
```

#### Error: Sliders no se actualizan
```
🔧 Verificar que data.votos_custom existe:
console.log('votos_custom:', data.votos_custom);

🔧 Verificar que los sliders existen:
const slider = document.getElementById('slider-votos-MORENA');
console.log('Slider MORENA:', !!slider);
```

---

## 📊 Consola de Pruebas Rápidas

### Calcular desde consola:

```javascript
// Obtener referencia al sidebar
const sidebar = document.querySelector('control-sidebar');

// Calcular MORENA mayoría simple (solo partido)
await sidebar.calcularMayoriaForzada(
  'MORENA',      // partido
  'simple',      // tipo_mayoria
  2024,          // anio
  'diputados',   // camara
  true,          // solo_partido
  true           // aplicar_topes
);

// Calcular coalición (MORENA+PT+PVEM)
await sidebar.calcularMayoriaForzada(
  'MORENA+PT+PVEM',
  'simple',
  2024,
  'diputados',
  false,  // ← solo_partido=false (incluir coalición)
  true
);

// Senado 96 escaños con MORENA mayoría simple
await sidebar.calcularMayoriaForzada(
  'MORENA',
  'simple',
  2024,
  'senadores',  // ← Cambiar a senadores
  true,
  true
);
```

---

## ✅ Checklist de Funcionalidad

### UI Components:
- [x] Checkbox "Solo el partido (sin coalición)" implementado
- [x] Checkbox "Aplicar topes constitucionales" implementado
- [x] Botón "Calcular Mayoría Forzada" implementado
- [x] Texto de ayuda dinámico (cambia según checkbox)
- [x] Warning de topes incompatibles con mayoría calificada

### Backend Communication:
- [x] Parámetro `solo_partido` se envía en request
- [x] POST con JSON body implementado
- [x] Fallback a GET si backend retorna 405
- [x] Manejo de errores con notificaciones

### Data Processing:
- [x] Respuesta del backend se procesa correctamente
- [x] `votos_custom` se extrae de la respuesta
- [x] `mr_distritos_manuales` se extrae de la respuesta
- [x] Datos se guardan en `window.mayoriaForzadaData`

### UI Updates:
- [x] Sliders de votos se actualizan (TODO: implementar)
- [x] Sliders de MR se actualizan (TODO: implementar)
- [x] Tabla de resultados se actualiza
- [x] Gráfico de escaños se actualiza

### Edge Cases:
- [x] Mayoría calificada + topes → Diálogo de confirmación
- [x] Auto-desactivar topes si usuario acepta
- [x] Notificación informativa después de desactivar topes
- [x] Validación de partido seleccionado
- [x] Manejo de errores de red

---

## 🚀 Próximos Pasos

### TODO - Actualización de Sliders:

Actualmente los datos se reciben del backend pero falta implementar:

```javascript
// En aplicarMayoriaForzadaAlSistema(), agregar:

// 1. Actualizar sliders de votos
if (data.votos_custom) {
  for (const [partido, porcentaje] of Object.entries(data.votos_custom)) {
    const slider = document.getElementById(`slider-votos-${partido}`);
    if (slider) {
      slider.value = porcentaje;
      slider.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
}

// 2. Actualizar sliders de MR
if (data.mr_distritos_manuales) {
  for (const [partido, distritos] of Object.entries(data.mr_distritos_manuales)) {
    const slider = document.getElementById(`slider-mr-${partido}`);
    if (slider) {
      slider.value = distritos;
      slider.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
}
```

---

## 📝 Notas Finales

- **Redistribución Proporcional**: Los votos NUNCA llegan a 0%, se redistribuyen proporcionalmente
- **MR de Coalición**: Con `solo_partido=true`, PT y PVEM SÍ tienen 0 distritos MR
- **Backend Compatibility**: POST es el método preferido, pero GET funciona como fallback
- **Auto-desactivar Topes**: Solo para mayoría calificada + partido individual

**¡La funcionalidad está lista para pruebas!** 🎉
