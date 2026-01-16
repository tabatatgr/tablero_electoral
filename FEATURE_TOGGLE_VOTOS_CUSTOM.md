# 🎛️ Feature: Toggle de Votos Personalizados

## 📋 Resumen

Se ha implementado un **toggle ON/OFF** en el frontend para activar/desactivar la edición manual de la distribución de votos por partido. Cuando está activado, los porcentajes de los sliders de partidos se envían al backend como `votos_custom`.

---

## 🎯 Ubicación

El toggle está en la sección **"Porcentaje de votos por partido"** del panel de control (ControlSidebar), justo antes de los sliders dinámicos de partidos.

---

## 🎨 Interfaz de Usuario

### Toggle Desactivado (OFF) - Por Defecto
```
┌─────────────────────────────────────────────┐
│ ¿Editar distribución de votos manualmente? │
│                                             │
│  ⚪ OFF                                     │
│                                             │
│ Activa esto para definir porcentajes de    │
│ votos personalizados por partido           │
│                                             │
│ [Sliders de partidos con valores vigentes] │
│                                             │
│ Simula cambios en el porcentaje de votos   │
│ por partido                                 │
└─────────────────────────────────────────────┘
```

### Toggle Activado (ON)
```
┌─────────────────────────────────────────────┐
│ ¿Editar distribución de votos manualmente? │
│                                             │
│  🟢 ON                                      │
│                                             │
│ Activa esto para definir porcentajes de    │
│ votos personalizados por partido           │
│                                             │
│ [Sliders de partidos - valores editables]  │
│                                             │
│ ⚠️ Modo edición activado: Los porcentajes  │
│ deben sumar 100%                            │
└─────────────────────────────────────────────┘
```

---

## 🔧 Funcionalidad

### Cuando el Toggle está OFF (Desactivado):
- Los sliders de partidos funcionan normalmente
- Los valores se usan para simulación estándar
- NO se envía el parámetro `votos_custom` al backend
- Mensaje: "Simula cambios en el porcentaje de votos por partido"

### Cuando el Toggle está ON (Activado):
- Los sliders de partidos definen distribución manual de votos
- Los porcentajes se convierten a JSON y se envían como `votos_custom`
- Se muestra advertencia: "⚠️ Modo edición activado: Los porcentajes deben sumar 100%"
- Se valida que los porcentajes sumen 100% (warning en consola si no)

---

## 📊 Datos Enviados al Backend

### Ejemplo con Toggle ON:

**Sliders de Partidos**:
- MORENA: 42.5%
- PAN: 18.0%
- PRI: 13.8%
- PVEM: 15.2%
- PT: 10.0%
- MC: 0.5%

**JSON generado (`votos_custom`)**:
```json
{
  "MORENA": 42.5,
  "PAN": 18.0,
  "PRI": 13.8,
  "PVEM": 15.2,
  "PT": 10.0,
  "MC": 0.5
}
```

**Request al backend**:
```
GET /procesar/diputados?
  anio=2024&
  plan=personalizado&
  sistema=mixto&
  escanos_totales=400&
  mr_seats=200&
  rp_seats=200&
  votos_custom=%7B%22MORENA%22%3A42.5%2C%22PAN%22%3A18.0%2C...%7D
```

---

## 💻 Implementación Técnica

### 1. HTML (ControlSidebar.js)

Se agregó el toggle antes de los sliders de partidos:

```html
<div class="control-description">
  ¿Editar distribución de votos manualmente?
</div>
<div class="control-item">
  <div class="toggle-switch">
    <div class="switch" id="custom-votes-switch" data-switch="Off" role="switch" aria-checked="false">
      <div class="switch-handle"></div>
    </div>
  </div>
</div>
<div class="parameter-note" style="margin-top:8px; color:#9CA3AF;">
  Activa esto para definir porcentajes de votos personalizados por partido
</div>

<div class="parameter-note" id="default-shocks-note">
  Simula cambios en el porcentaje de votos por partido
</div>
<div class="parameter-note" id="custom-votes-note" style="display:none; color:#F59E0B; font-weight:500;">
  ⚠️ Modo edición activado: Los porcentajes deben sumar 100%
</div>
```

### 2. JavaScript - Event Listener (ControlSidebar.js línea ~1120)

```javascript
// Custom votes switch - cambiar modo de sliders de partidos
if (switchId === 'custom-votes-switch') {
  const defaultNote = document.getElementById('default-shocks-note');
  const customNote = document.getElementById('custom-votes-note');
  
  if (defaultNote && customNote) {
    defaultNote.style.display = isActive ? 'none' : 'block';
    customNote.style.display = isActive ? 'block' : 'none';
  }
  
  console.log(`[CUSTOM VOTES] Modo edición de votos: ${isActive ? 'ACTIVADO' : 'DESACTIVADO'}`);
  
  // Actualizar simulación cuando cambia el modo
  if (typeof window.actualizarDesdeControles === 'function') {
    setTimeout(() => window.actualizarDesdeControles(), 100);
  }
}
```

### 3. JavaScript - Construcción de votos_custom (script.js línea ~1625)

```javascript
//  CONSTRUIR VOTOS_CUSTOM SI EL SWITCH ESTÁ ACTIVADO
let votos_custom = null;
const customVotesSwitch = document.getElementById('custom-votes-switch');

if (customVotesSwitch && customVotesSwitch.classList.contains('active')) {
  // Obtener porcentajes de todos los partidos desde partidosData
  const sidebar = document.querySelector('control-sidebar');
  if (sidebar && sidebar.partidosData) {
    const votosObj = {};
    let totalPorcentaje = 0;
    
    for (const partido in sidebar.partidosData) {
      const porcentaje = sidebar.partidosData[partido].porcentajeActual;
      if (porcentaje > 0) {
        votosObj[partido] = porcentaje;
        totalPorcentaje += porcentaje;
      }
    }
    
    // Convertir a JSON string
    votos_custom = JSON.stringify(votosObj);
    
    console.log('[CUSTOM VOTES] 🗳️ Votos personalizados activados:', {
      votos_custom,
      total_porcentaje: totalPorcentaje.toFixed(2) + '%',
      partidos: Object.keys(votosObj).length
    });
    
    // Advertencia si no suma 100%
    if (Math.abs(totalPorcentaje - 100) > 0.1) {
      console.warn(`[CUSTOM VOTES] ⚠️ Los porcentajes no suman 100% (suma: ${totalPorcentaje.toFixed(2)}%)`);
    }
  }
}
```

### 4. JavaScript - Envío al Backend (script.js línea ~530)

```javascript
//  VOTOS PERSONALIZADOS (votos_custom)
if (votos_custom !== null && votos_custom !== undefined) {
  // Enviar como parámetro de query string (URL encoded)
  url += `&votos_custom=${encodeURIComponent(votos_custom)}`;
  console.log('[CUSTOM VOTES] 🗳️ Enviando votos_custom al backend:', votos_custom);
}
```

---

## 🧪 Testing

### Test Case 1: Toggle OFF → ON
1. Abrir modo personalizado
2. Observar sliders de partidos con valores vigentes
3. Activar toggle "Editar distribución de votos manualmente"
4. ✅ **Verificar**: Mensaje cambia a "⚠️ Modo edición activado"
5. ✅ **Verificar en consola**: `[CUSTOM VOTES] Modo edición de votos: ACTIVADO`

### Test Case 2: Editar Porcentajes
1. Toggle ON
2. Mover sliders de partidos
3. Observar que suma cercana a 100%
4. Simular
5. ✅ **Verificar en consola**: 
   ```
   [CUSTOM VOTES] 🗳️ Votos personalizados activados: {...}
   [CUSTOM VOTES] 🗳️ Enviando votos_custom al backend: {"MORENA":42.5,...}
   ```

### Test Case 3: Validación de Suma
1. Toggle ON
2. Mover sliders para que NO sumen 100% (ej: total 95%)
3. Simular
4. ✅ **Verificar en consola**: 
   ```
   [CUSTOM VOTES] ⚠️ Los porcentajes no suman 100% (suma: 95.00%)
   ```

### Test Case 4: Toggle ON → OFF
1. Toggle ON, editar algunos porcentajes
2. Desactivar toggle
3. ✅ **Verificar**: Mensaje vuelve a "Simula cambios en el porcentaje de votos"
4. ✅ **Verificar**: NO se envía `votos_custom` en siguiente simulación

---

## 📊 Logs de Consola

### Al activar el toggle:
```
[CUSTOM VOTES] Modo edición de votos: ACTIVADO
```

### Al construir votos_custom:
```
[CUSTOM VOTES] 🗳️ Votos personalizados activados: {
  votos_custom: '{"MORENA":42.5,"PAN":18.0,"PRI":13.8,"PVEM":15.2,"PT":10.0,"MC":0.5}',
  total_porcentaje: '100.00%',
  partidos: 6
}
```

### Al enviar al backend:
```
[CUSTOM VOTES] 🗳️ Enviando votos_custom al backend: {"MORENA":42.5,"PAN":18.0,...}
```

### Si no suma 100%:
```
[CUSTOM VOTES] ⚠️ Los porcentajes no suman 100% (suma: 95.50%)
```

---

## 🔄 Integración con Backend

### Backend Esperado:

El backend debe:
1. Recibir parámetro `votos_custom` como string JSON
2. Parsear el JSON a diccionario
3. Usar esos porcentajes en lugar de los datos vigentes
4. Aplicar umbral del 3% (los partidos < 3% no obtienen escaños)
5. Devolver resultados normalmente

### Ejemplo de Endpoint:
```python
@app.get("/procesar/diputados")
async def procesar_diputados(
    anio: int = 2024,
    plan: str = "vigente",
    votos_custom: str | None = None,
    # ... otros parámetros
):
    if votos_custom:
        # Parsear JSON
        votos_dict = json.loads(votos_custom)
        # Usar votos_dict en lugar de datos vigentes
        # ...
```

---

## 📝 Archivos Modificados

1. **components/panel_control/ControlSidebar.js**
   - Línea ~282-305: HTML del toggle y mensajes
   - Línea ~1120-1137: Event listener del toggle

2. **scripts/script_general/script.js**
   - Línea ~391: Agregado `votos_custom = null` a firma de función
   - Línea ~1625-1663: Construcción de JSON votos_custom
   - Línea ~1668: Pasar `votos_custom` a cargarSimulacion()
   - Línea ~530-534: Envío de votos_custom al backend

---

## ✅ Ventajas

1. ✅ **Reutiliza componente existente**: Usa mismo toggle que coaliciones/primera minoría
2. ✅ **Feedback visual claro**: Mensajes diferentes según estado ON/OFF
3. ✅ **Validación en tiempo real**: Warning si porcentajes no suman 100%
4. ✅ **Logging completo**: Logs detallados para debugging
5. ✅ **Compatible con backend**: JSON format esperado por backend
6. ✅ **No invasivo**: Desactivado por defecto, no afecta flujo normal

---

## 🚀 Próximos Pasos (Opcional)

1. **Validación visual en UI**: Mostrar borde rojo si suma ≠ 100%
2. **Auto-normalización**: Botón para normalizar porcentajes automáticamente a 100%
3. **Preset de distribuciones**: Guardar/cargar distribuciones personalizadas
4. **Import CSV**: Cargar distribución desde archivo
5. **Export results**: Exportar resultados con distribución personalizada

---

**Fecha**: 5 de enero de 2026  
**Feature**: Toggle de Votos Personalizados  
**Estado**: ✅ Implementado  
**Componente Reutilizado**: Switch ON/OFF (mismo que coaliciones)
