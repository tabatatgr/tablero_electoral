# ✅ Rediseño UI - Mayorías Mejorado

## 🎨 Cambios Realizados

### ❌ **Eliminado (diseño feo):**
```html
<!-- ANTES: Checkboxes confusos -->
<checkbox> Solo el partido (sin coalición)
<checkbox> Aplicar topes constitucionales
<select> Mezcla de partidos y coaliciones
```

### ✅ **Nuevo Diseño (limpio):**
```html
<!-- Radio buttons claros -->
○ Partido individual
  ↳ Solo el partido alcanza mayoría
○ Coalición  
  ↳ Partido + aliados alcanzan mayoría

<!-- Dropdown dinámico según selección -->
Si "Partido": MORENA, PAN, PRI, PRD, PT, PVEM, MC
Si "Coalición": MORENA+PT+PVEM, PAN+PRI+PRD

<!-- Botón simplificado -->
[🎯 Calcular Mayoría]
```

---

## 🔧 Funcionalidad

### **Radio Button: Partido vs Coalición**

**Partido individual** (checked por defecto):
- `solo_partido = true`
- Dropdown muestra: MORENA, PAN, PRI, PRD, PT, PVEM, MC
- Comportamiento: Solo el partido seleccionado alcanza mayoría (coalición = 0 escaños)

**Coalición**:
- `solo_partido = false`  
- Dropdown muestra: MORENA+PT+PVEM, PAN+PRI+PRD
- Comportamiento: Partido + aliados alcanzan mayoría juntos

---

## 🎯 Ejemplo de Uso

### **Caso 1: MORENA solo (sin coalición)**
```
1. Seleccionar: ○ Partido individual
2. Dropdown automáticamente muestra partidos individuales
3. Elegir: MORENA
4. Click en "🎯 Calcular Mayoría"

Resultado:
- MORENA: 251+ escaños ✅
- PT: 0 escaños ❌
- PVEM: 0 escaños ❌
```

### **Caso 2: MORENA con coalición**
```
1. Seleccionar: ○ Coalición
2. Dropdown automáticamente muestra coaliciones
3. Elegir: MORENA+PT+PVEM
4. Click en "🎯 Calcular Mayoría"

Resultado:
- MORENA: ~210 escaños
- PT: ~20 escaños
- PVEM: ~21 escaños
- Total coalición: 251+ escaños ✅
```

---

## 🔍 Lógica del Código

### **Actualización Dinámica del Dropdown:**

```javascript
// Event listeners
tipoPartidoRadio.addEventListener('change', actualizarDropdown);
tipoCoalicionRadio.addEventListener('change', actualizarDropdown);

// Función que actualiza opciones
const actualizarDropdown = () => {
  const esPartido = tipoPartidoRadio.checked;
  const opciones = esPartido ? opcionesPartidos : opcionesCoaliciones;
  
  partidoSelect.innerHTML = opciones.map(...);
  selectLabel.textContent = esPartido 
    ? 'Selecciona un partido:' 
    : 'Selecciona una coalición:';
};
```

### **Determinación de solo_partido:**

```javascript
// En el botón calcular
const tipoRadio = document.querySelector('input[name="mayoria-tipo"]:checked');
const esPartidoIndividual = tipoRadio ? tipoRadio.value === 'partido' : true;
const soloPartido = esPartidoIndividual;

// Se envía al backend
await calcularMayoriaForzada(
  partido, 
  tipoMayoria, 
  anio, 
  camara, 
  soloPartido,  // ← true/false según radio button
  aplicarTopes
);
```

---

## 🚫 Topes - Notificación Automática

Ya NO hay checkbox de topes en el grupo "Mayorías".

**En su lugar:**
- Se usa el switch global de topes (ya existente)
- Si mayoría calificada + topes activados → Notificación automática sugiere desactivar
- Sistema auto-desactiva topes si es necesario

**Código existente:**
```javascript
// AUTO-DESACTIVAR TOPES (ya implementado)
if (tipoMayoria === 'calificada' && aplicarTopes && !esCoalicion) {
  const umbralCalificada = Math.ceil(escanosTotales * 2 / 3);
  const topeMaximo = Math.floor(escanosTotales * 0.6);
  
  if (umbralCalificada > topeMaximo) {
    aplicarTopes = false;
    topesSwitch.classList.remove('active');
    
    // Notificación automática
    window.notifications.info(
      'Topes desactivados automáticamente',
      `Para mayoría calificada se requiere...`,
      8000
    );
  }
}
```

---

## 📋 Estructura Final del HTML

```html
<div class="control-group" data-group="mayorias">
  <button class="group-toggle">Mayorías</button>
  
  <div class="group-content">
    <!-- Toggle ON/OFF -->
    <div class="switch" id="mayorias-switch">ON/OFF</div>
    
    <div id="mayorias-controls">
      <!-- Tipo de mayoría -->
      <div class="radio-group">
        ○ Mayoría Simple (>50%)
        ○ Mayoría Calificada (≥2/3)
      </div>
      
      <!-- 🆕 Partido vs Coalición -->
      <div class="radio-group">
        ● Partido individual
          ↳ Solo el partido alcanza mayoría
        ○ Coalición
          ↳ Partido + aliados alcanzan mayoría
      </div>
      
      <!-- Dropdown dinámico -->
      <select id="mayoria-partido-select">
        <!-- Se actualiza según radio seleccionado -->
      </select>
      
      <!-- Botón -->
      <button id="mayoria-calcular-btn">
        🎯 Calcular Mayoría
      </button>
      
      <!-- Resultado (hidden) -->
      <div id="mayoria-resultado" style="display:none;">
        ...
      </div>
    </div>
  </div>
</div>
```

---

## ✅ Ventajas del Nuevo Diseño

| Antes (Feo) | Ahora (Bonito) |
|-------------|----------------|
| ❌ Checkbox confuso "Solo el partido" | ✅ Radio claro: Partido vs Coalición |
| ❌ Dropdown mezclaba partidos y coaliciones | ✅ Dropdown se adapta según selección |
| ❌ Checkbox de topes duplicado | ✅ Usa switch global ya existente |
| ❌ Texto de ayuda genérico | ✅ Sublabels explicativos en cada radio |
| ❌ 3 clicks para configurar | ✅ 2 clicks: radio + dropdown |

---

## 🧪 Pruebas

### **Test 1: Verificar Dropdown Dinámico**
```javascript
// 1. Inspeccionar radio buttons
const partidoRadio = document.getElementById('mayoria-tipo-partido');
const coalicionRadio = document.getElementById('mayoria-tipo-coalicion');

// 2. Cambiar a partido
partidoRadio.click();
// Verificar: dropdown muestra solo partidos individuales

// 3. Cambiar a coalición
coalicionRadio.click();
// Verificar: dropdown muestra solo coaliciones
```

### **Test 2: Verificar solo_partido Correcto**
```javascript
// 1. Seleccionar "Partido individual"
document.getElementById('mayoria-tipo-partido').click();

// 2. Seleccionar MORENA
document.getElementById('mayoria-partido-select').value = 'MORENA';

// 3. Calcular
document.getElementById('mayoria-calcular-btn').click();

// 4. Ver en consola
// Debe mostrar: solo_partido: true
```

### **Test 3: Verificar Coalición**
```javascript
// 1. Seleccionar "Coalición"
document.getElementById('mayoria-tipo-coalicion').click();

// 2. Seleccionar MORENA+PT+PVEM
document.getElementById('mayoria-partido-select').value = 'MORENA+PT+PVEM';

// 3. Calcular
document.getElementById('mayoria-calcular-btn').click();

// 4. Ver en consola
// Debe mostrar: solo_partido: false
```

---

## 📝 Logs de Consola

**Al cambiar radio button:**
```
[MAYORÍAS] 🔄 Dropdown actualizado: Partidos
[MAYORÍAS] 🔄 Dropdown actualizado: Coaliciones
```

**Al calcular:**
```
[MAYORÍA FORZADA] 🎯 Botón calcular presionado
[MAYORÍA FORZADA] 📋 Parámetros: {
  partido: "MORENA",
  tipoMayoria: "simple",
  esPartidoIndividual: true,
  soloPartido: true,
  significado: "Solo el partido (sin coalición)"
}
```

---

## 🎉 Resultado Final

**Antes:** 😕 UI confusa con checkboxes y dropdown mezclado

**Ahora:** 😍 UI limpia con radio buttons claros y dropdown inteligente

**Caché actualizado:** `v=20260118040000`

**¡Recarga con Ctrl+F5 y disfruta del nuevo diseño!** 🚀
