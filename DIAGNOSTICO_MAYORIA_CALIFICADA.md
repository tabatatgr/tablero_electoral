# 🔍 DIAGNÓSTICO: Mayoría Calificada No Funciona

## 📊 ANÁLISIS DEL PROBLEMA

### ✅ Mayoría Simple - FUNCIONA
- **Umbral**: 251 diputados (50.2% de 500)
- **Con topes activos**: Máximo 300 escaños por partido (60%)
- **Resultado**: ✅ **VIABLE** - 300 > 251

### ❌ Mayoría Calificada - NO FUNCIONA
- **Umbral**: 334 diputados (66.8% de 500)
- **Con topes activos**: Máximo 300 escaños por partido (60%)
- **Resultado**: ❌ **IMPOSIBLE** - 300 < 334

---

## 🧮 MATEMÁTICA DEL PROBLEMA

```
Configuración Vigente:
- Total escaños: 500 diputados
- Sobrerrepresentación permitida: 8%
- Límite de sobrerrepresentación: 60% del total

Cálculo del tope:
- 60% de 500 = 300 escaños MÁXIMO

Umbrales de mayoría:
- Simple: 251 escaños (50.2%) → ✅ Alcanzable (< 300)
- Calificada: 334 escaños (66.8%) → ❌ Imposible (> 300)
```

**La mayoría calificada requiere 334 escaños pero el tope constitucional es 300.**

---

## 🔍 EVIDENCIA EN LOS LOGS

### Configuración detectada en tus logs:
```
[DEBUG] aplicar_topes: True
[DEBUG] sobrerrepresentacion: 8.0
[DEBUG] max_seats: 128  ← Ejemplo personalizado
[DEBUG] Sistema mixto: 64 MR + 64 RP
```

### Cálculo para el ejemplo personalizado (128 escaños):
```
Total: 128 escaños
Tope 60%: 76.8 → 76 escaños máximo

Mayorías:
- Simple: 65 escaños (50.78%) → ✅ Alcanzable (< 76)
- Calificada: 86 escaños (67.19%) → ❌ Imposible (> 76)
```

---

## 🎯 ESCENARIOS POSIBLES

### Escenario 1: Topes Activos (aplicar_topes=true)
| Configuración | Total | Tope 60% | Simple | Calificada | ¿Calificada viable? |
|---------------|-------|----------|--------|------------|---------------------|
| Vigente       | 500   | 300      | 251    | 334        | ❌ NO (300 < 334)   |
| Personalizado | 128   | 76       | 65     | 86         | ❌ NO (76 < 86)     |
| Personalizado | 200   | 120      | 101    | 134        | ❌ NO (120 < 134)   |

**Conclusión**: Con topes activos, la mayoría calificada es **SIEMPRE IMPOSIBLE** porque:
```
Mayoría calificada = 66.67% del total
Tope constitucional = 60% del total
66.67% > 60% → IMPOSIBLE
```

### Escenario 2: Topes Desactivados (aplicar_topes=false)
| Configuración | Total | Simple | Calificada | ¿Calificada viable? |
|---------------|-------|--------|------------|---------------------|
| Vigente       | 500   | 251    | 334        | ✅ SÍ               |
| Personalizado | 128   | 65     | 86         | ✅ SÍ               |
| Personalizado | 200   | 101    | 134        | ✅ SÍ               |

**Conclusión**: Sin topes, la mayoría calificada **SÍ ES POSIBLE**.

---

## 🔧 SOLUCIONES PROPUESTAS

### ✅ Solución 1: Validación en el Frontend (RECOMENDADA)

Detectar el conflicto ANTES de llamar al backend:

```javascript
// En calcularMayoriaForzada(), después de obtener parámetros:

const topesActivos = topesSwitch?.classList.contains('active') ?? true;
const escanosTotales = magnitudSlider ? parseInt(magnitudSlider.value) : 500;
const umbralSimple = Math.floor(escanosTotales / 2) + 1;
const umbralCalificada = Math.ceil(escanosTotales * 2 / 3);
const topeMaximo = Math.floor(escanosTotales * 0.6);

if (tipoMayoria === 'calificada' && topesActivos) {
  if (umbralCalificada > topeMaximo) {
    // Mostrar advertencia al usuario
    window.notifications.warning(
      'Mayoría calificada imposible',
      `Con topes activos (60% = ${topeMaximo} escaños), no se puede alcanzar mayoría calificada (${umbralCalificada} escaños). Desactiva los topes constitucionales.`,
      8000
    );
    
    // No llamar al backend
    return;
  }
}

// Continuar con la petición...
```

### ✅ Solución 2: Mensaje Claro del Backend

El backend debe devolver:

```json
{
  "viable": false,
  "mensaje": "Mayoría calificada imposible con topes del 60%",
  "explicacion": "Se requieren 334 escaños (66.67%) pero el límite constitucional es 300 escaños (60%)",
  "diputados_necesarios": 334,
  "max_posible_con_topes": 300,
  "sugerencia": "Desactiva los topes constitucionales para simular mayoría calificada"
}
```

### ✅ Solución 3: UI que Guía al Usuario

Agregar un mensaje informativo en la UI:

```html
<div class="parameter-note warning" id="calificada-topes-warning" style="display: none;">
  ⚠️ <strong>Mayoría calificada requiere más del 66%</strong><br>
  Con topes activos (límite 60%), no es posible alcanzar mayoría calificada.<br>
  <strong>Sugerencia:</strong> Desactiva "Aplicar topes constitucionales" para simular este escenario.
</div>
```

Mostrar cuando:
- `tipo_mayoria === 'calificada'`
- `topes_switch.active === true`

---

## 🧪 TESTS DE VERIFICACIÓN

### Test 1: Mayoría Simple con Topes (debe funcionar)
```bash
curl "https://back-electoral.onrender.com/calcular/mayoria_forzada?partido=MORENA&tipo_mayoria=simple&plan=vigente&aplicar_topes=true&anio=2024"
```

**Esperado**:
```json
{
  "viable": true,
  "diputados_necesarios": 251,
  "diputados_obtenidos": 251,
  "votos_porcentaje": 47.5
}
```

### Test 2: Mayoría Calificada CON Topes (debe fallar)
```bash
curl "https://back-electoral.onrender.com/calcular/mayoria_forzada?partido=MORENA&tipo_mayoria=calificada&plan=vigente&aplicar_topes=true&anio=2024"
```

**Esperado**:
```json
{
  "viable": false,
  "mensaje": "Mayoría calificada imposible con topes del 60%",
  "diputados_necesarios": 334,
  "max_posible": 300
}
```

### Test 3: Mayoría Calificada SIN Topes (debe funcionar)
```bash
curl "https://back-electoral.onrender.com/calcular/mayoria_forzada?partido=MORENA&tipo_mayoria=calificada&plan=vigente&aplicar_topes=false&anio=2024"
```

**Esperado**:
```json
{
  "viable": true,
  "diputados_necesarios": 334,
  "diputados_obtenidos": 334,
  "votos_porcentaje": 58.3
}
```

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### Frontend (ControlSidebar.js)

- [ ] **Agregar validación antes de llamar al backend**
  - Calcular umbral calificada: `Math.ceil(escanos * 2/3)`
  - Calcular tope máximo: `Math.floor(escanos * 0.6)`
  - Comparar: si `umbral_calificada > tope_maximo` → mostrar warning

- [ ] **Agregar mensaje informativo en UI**
  - Crear `<div id="calificada-topes-warning">`
  - Mostrar/ocultar según estado de topes y tipo de mayoría
  - Incluir botón para desactivar topes rápidamente

- [ ] **Mejorar manejo de respuesta del backend**
  - Si `viable === false`, mostrar `mensaje` del backend
  - Agregar caso para `max_posible` en la UI
  - No intentar actualizar tabla/seat chart si no es viable

### Backend (Python)

- [ ] **Agregar validación temprana**
  - Antes de calcular, verificar matemática
  - Si es imposible, devolver `viable: false` inmediatamente

- [ ] **Mejorar mensajes de error**
  - Explicar POR QUÉ no es viable
  - Incluir números específicos (umbral vs tope)
  - Sugerir acción (desactivar topes)

- [ ] **Documentar comportamiento**
  - Actualizar documentación de API
  - Agregar ejemplos de casos imposibles
  - Explicar interacción topes/mayorías

---

## 🎓 RESUMEN EJECUTIVO

**PROBLEMA**:
- Mayoría calificada requiere 66.67% de escaños
- Topes constitucionales limitan a 60% de escaños
- 66.67% > 60% = MATEMÁTICAMENTE IMPOSIBLE

**SOLUCIÓN INMEDIATA**:
Para probar mayoría calificada, el usuario debe:
1. Ir a "Aplicar topes constitucionales"
2. Desactivar el toggle
3. Volver a calcular mayoría calificada

**SOLUCIÓN A LARGO PLAZO**:
1. Frontend: Validar y advertir ANTES de llamar al backend
2. Backend: Devolver mensaje claro cuando sea imposible
3. UI: Guiar al usuario con mensajes contextuales

---

## 💡 RECOMENDACIÓN FINAL

**No es un bug, es comportamiento esperado.**

La mayoría calificada es incompatible con los topes constitucionales por diseño legal. El sistema está funcionando correctamente al no poder alcanzarla con topes activos.

**Lo que SÍ necesitamos**:
- Mejor comunicación al usuario de POR QUÉ no funciona
- Validación temprana para evitar confusión
- Mensajes que guíen al usuario a la solución (desactivar topes)
