# ✅ NUEVOS ESCENARIOS IMPLEMENTADOS - Frontend

## 📅 Fecha: 17 de enero de 2026

---

## 🎯 Resumen

Se han implementado **3 nuevos escenarios predeterminados** para Diputados en el frontend, además de mejorar la UI con descripciones dinámicas.

---

## 🆕 Escenarios Agregados al Selector

### **Para Diputados:**

1. **300-100 con Topes** 🆕
   - ID: `300_100_con_topes`
   - 300 MR + 100 RP = 400 escaños
   - Tope máximo: 300 escaños por partido
   - Umbral: 3%

2. **300-100 sin Topes** 🆕
   - ID: `300_100_sin_topes`
   - 300 MR + 100 RP = 400 escaños
   - Sin tope de escaños por partido
   - Umbral: 3%

3. **200-200 Balanceado** ⚖️
   - ID: `200_200_sin_topes`
   - 200 MR + 200 RP = 400 escaños (50-50)
   - Sin tope de escaños por partido
   - Umbral: 3%

---

## 🎨 Mejoras en la UI

### **Selector de Escenarios Mejorado**

El dropdown de "Modelo" ahora se llama **"Escenario"** y está organizado en grupos:

```
⚖️ Sistema Oficial
  └─ ⚖️ Sistema Vigente

📋 Propuestas de Reforma
  ├─ 📊 Plan A - Solo RP (300)
  └─ 🗳️ Plan C - Solo MR (300)

🆕 Escenarios Nuevos (400 escaños)
  ├─ 🆕 300-100 con Topes
  ├─ 🆕 300-100 sin Topes
  └─ ⚖️ 200-200 Balanceado

⚙️ Configuración Manual
  └─ ⚙️ Personalizado
```

### **Hints Dinámicos**

Ahora aparece una descripción debajo del selector que cambia según el escenario y la cámara:

**Ejemplo para Diputados:**
- Vigente → "300 MR + 200 RP = 500 escaños (con tope de 300)"
- Plan A → "300 RP puro (sin mayorías relativas)"
- 300-100 con Topes → "300 MR + 100 RP = 400 (tope 300 escaños)"

**Ejemplo para Senadores:**
- Vigente → "64 MR + 32 PM + 32 RP = 128 senadores"
- Plan A → "96 RP puro (lista nacional)"
- Plan C → "32 MR + 32 PM = 64 (sin RP)"

---

## 🔧 Cambios Técnicos Implementados

### **1. Actualización de `script.js`**

**Archivo:** `scripts/script_general/script.js`

#### Constantes de Escenarios Agregadas:

```javascript
const ESCENARIOS_DIPUTADOS = {
    'vigente': { ... },
    'plan_a': { ... },
    'plan_c': { ... },
    '300_100_con_topes': { ... },  // NUEVO
    '300_100_sin_topes': { ... },  // NUEVO
    '200_200_sin_topes': { ... },  // NUEVO
    'personalizado': { ... }
};

const ESCENARIOS_SENADO = {
    'vigente': { ... },
    'plan_a': { ... },
    'plan_c': { ... },
    'personalizado': { ... }
};
```

#### Función `mapearModeloAPlan()` Actualizada:

```javascript
function mapearModeloAPlan(modelo) {
    const mapeo = {
        'vigente': 'vigente',
        'plan a': 'plan_a',
        'plan_a': 'plan_a',
        'plan c': 'plan_c',
        'plan_c': 'plan_c',
        '300_100_con_topes': '300_100_con_topes',      // NUEVO
        '300-100 con topes': '300_100_con_topes',     // NUEVO
        '300_100_sin_topes': '300_100_sin_topes',      // NUEVO
        '300-100 sin topes': '300_100_sin_topes',     // NUEVO
        '200_200_sin_topes': '200_200_sin_topes',      // NUEVO
        '200-200 balanceado': '200_200_sin_topes',    // NUEVO
        'personalizado': 'personalizado'
    };
    
    return mapeo[modelo.toLowerCase()] || modelo;
}
```

---

### **2. Actualización de `ControlSidebar.js`**

**Archivo:** `components/panel_control/ControlSidebar.js`

#### Selector HTML Mejorado:

```html
<select class="control-select" id="model-select">
  <optgroup label="⚖️ Sistema Oficial">
    <option value="vigente" selected>⚖️ Sistema Vigente</option>
  </optgroup>
  <optgroup label="📋 Propuestas de Reforma">
    <option value="plan_a">📊 Plan A - Solo RP (300)</option>
    <option value="plan_c">🗳️ Plan C - Solo MR (300)</option>
  </optgroup>
  <optgroup label="🆕 Escenarios Nuevos (400 escaños)">
    <option value="300_100_con_topes">🆕 300-100 con Topes</option>
    <option value="300_100_sin_topes">🆕 300-100 sin Topes</option>
    <option value="200_200_sin_topes">⚖️ 200-200 Balanceado</option>
  </optgroup>
  <optgroup label="⚙️ Configuración Manual">
    <option value="personalizado">⚙️ Personalizado</option>
  </optgroup>
</select>
<small class="control-hint" id="model-hint"></small>
```

#### Función `updateModelHint()` Agregada:

```javascript
const updateModelHint = (escenarioId) => {
  const hintEl = this.querySelector('#model-hint');
  const chamberBtn = this.querySelector('.master-toggle.active');
  const camara = chamberBtn ? chamberBtn.dataset.chamber : 'diputados';
  
  const HINTS_DIPUTADOS = {
    'vigente': '300 MR + 200 RP = 500 escaños (con tope de 300)',
    'plan_a': '300 RP puro (sin mayorías relativas)',
    'plan_c': '300 MR puro (sin proporcionales)',
    '300_100_con_topes': '300 MR + 100 RP = 400 (tope 300 escaños)',
    '300_100_sin_topes': '300 MR + 100 RP = 400 (sin tope)',
    '200_200_sin_topes': '200 MR + 200 RP = 400 (balanceado 50-50)',
    'personalizado': 'Configura tus propios parámetros'
  };
  
  const HINTS_SENADO = {
    'vigente': '64 MR + 32 PM + 32 RP = 128 senadores',
    'plan_a': '96 RP puro (lista nacional)',
    'plan_c': '32 MR + 32 PM = 64 (sin RP)',
    'personalizado': 'Configura tus propios parámetros'
  };
  
  const hints = camara === 'senadores' ? HINTS_SENADO : HINTS_DIPUTADOS;
  const hint = hints[escenarioId] || '';
  
  hintEl.textContent = hint;
  hintEl.style.display = hint ? 'block' : 'none';
};
```

---

### **3. Actualización de `ControlSidebar.css`**

**Archivo:** `components/panel_control/ControlSidebar.css`

#### Estilos para el Hint:

```css
.control-hint {
  display: block;
  margin-top: 6px;
  font-size: 0.75rem;
  line-height: 1.3;
  color: #64748b;
  font-style: italic;
  padding: 4px 8px;
  background: #f8fafc;
  border-radius: 4px;
  border-left: 2px solid #1E5B4F;
}

.control-hint:empty {
  display: none;
}
```

---

## 🧪 Cómo Probar

### **1. Abrir el Dashboard**
```
Abre index.html en el navegador
```

### **2. Seleccionar Escenario**
1. Ir al Panel de Control (sidebar izquierdo)
2. Expandir "Parámetros principales"
3. En el selector "Escenario", elegir uno de los nuevos:
   - 🆕 300-100 con Topes
   - 🆕 300-100 sin Topes
   - ⚖️ 200-200 Balanceado

### **3. Verificar Comportamiento**
- ✅ El hint debe aparecer debajo del selector
- ✅ Debe mostrar la descripción correcta
- ✅ Al cambiar de cámara, el hint debe actualizarse
- ✅ Al hacer clic en "Calcular", debe enviar `plan: "300_100_con_topes"` (etc.) al backend

### **4. Revisar Console**
```javascript
// Debe verse:
[DEBUG]  MAPEO CENTRALIZADO: {
  entrada: "300_100_con_topes",
  salida: "300_100_con_topes",
  encontradoEnMapeo: true
}

[DEBUG]  Escenario cambiado a: 300_100_con_topes
```

---

## 📊 Tabla Comparativa de Escenarios

| Escenario | Total | MR | RP | PM | Umbral | Tope | Disponible en |
|-----------|-------|----|----|----| -------|------|---------------|
| **Vigente** | 500/128 | 300/64 | 200/32 | 0/32 | 3% | 300/- | Ambas |
| **Plan A** | 300/96 | 0/0 | 300/96 | 0/0 | 3% | ❌ | Ambas |
| **Plan C** | 300/64 | 300/32 | 0/0 | 0/32 | ❌ | ❌ | Ambas |
| **300-100 (con topes)** 🆕 | 400 | 300 | 100 | 0 | 3% | 300 | Diputados |
| **300-100 (sin topes)** 🆕 | 400 | 300 | 100 | 0 | 3% | ❌ | Diputados |
| **200-200** 🆕 | 400 | 200 | 200 | 0 | 3% | ❌ | Diputados |
| **Personalizado** | ⚙️ | ⚙️ | ⚙️ | ⚙️ | ⚙️ | ⚙️ | Ambas |

---

## ✅ Checklist de Implementación

- [x] Agregar constantes `ESCENARIOS_DIPUTADOS` y `ESCENARIOS_SENADO` en script.js
- [x] Actualizar función `mapearModeloAPlan()` con nuevos escenarios
- [x] Actualizar selector HTML con optgroups y emojis
- [x] Agregar elemento `<small id="model-hint">` en HTML
- [x] Crear función `updateModelHint()` en ControlSidebar.js
- [x] Conectar `updateModelHint()` al event listener de `model-select`
- [x] Conectar `updateModelHint()` al event listener de cambio de cámara
- [x] Agregar estilos CSS para `.control-hint`
- [x] Probar que hints se actualicen correctamente
- [x] Verificar que backend reciba los nuevos IDs de plan correctamente

---

## 🚀 Próximos Pasos (Opcional)

### **Mejoras Futuras:**

1. **Indicadores Visuales Avanzados**
   - Badges "NUEVO" animados
   - Tooltips con información expandida
   - Iconos dinámicos según características

2. **Comparador de Escenarios**
   - Modal para comparar 2-3 escenarios lado a lado
   - Tabla con diferencias resaltadas
   - Gráficos comparativos

3. **Validaciones Inteligentes**
   - Deshabilitar controles incompatibles según escenario
   - Mostrar advertencias si configuración no es válida
   - Sugerencias automáticas de parámetros

4. **Ayuda Contextual**
   - Botón "?" junto a cada escenario
   - Tutorial interactivo para nuevos usuarios
   - Documentación inline expandible

---

## 📝 Notas Técnicas

### **Compatibilidad con Backend:**

El backend ya soporta estos escenarios. Solo necesita recibir el `plan` correcto:

```javascript
// Frontend envía:
{
  anio: 2024,
  plan: "300_100_con_topes"  // ← Backend lo reconoce automáticamente
}

// Backend responde con configuración hardcodeada:
{
  plan: "300_100_con_topes",
  resultados: [...],
  meta: {
    mr_seats: 300,
    rp_seats: 100,
    total_seats: 400,
    umbral: 0.03,
    max_seats_per_party: 300
  }
}
```

### **Logs de Debugging:**

Para verificar que todo funciona, busca en consola:

```
[DEBUG]  Escenario cambiado a: 300_100_con_topes
[DEBUG]  MAPEO CENTRALIZADO: { entrada: "300_100_con_topes", salida: "300_100_con_topes", encontradoEnMapeo: true }
[DEBUG]  URL generada para petición: .../procesar/diputados?anio=2024&plan=300_100_con_topes...
```

---

## 🎉 Conclusión

Los 3 nuevos escenarios están completamente implementados y funcionales:

✅ UI actualizada con selector organizado por categorías
✅ Hints dinámicos que se actualizan según cámara y escenario
✅ Mapeo correcto en `mapearModeloAPlan()`
✅ Compatibilidad completa con backend
✅ Estilos CSS para mejor UX

**Todo listo para usar!** 🚀
