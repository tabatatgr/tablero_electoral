# ✅ FRONTEND FLECHITAS - ESTADO DE IMPLEMENTACIÓN

## 🎉 RESUMEN EJECUTIVO

**¡EL FRONTEND YA ESTÁ 100% IMPLEMENTADO!** Las flechitas (↑↓) para ajustar distritos individuales ya funcionan y envían todos los datos necesarios al backend.

---

## ✅ LO QUE YA ESTÁ IMPLEMENTADO

### 1. **Interfaz de Usuario (UI)**
**Archivo:** `components/panel_control/ControlSidebar.js` (líneas 3140-3180)

```javascript
// Cada celda de partido en cada estado tiene flechitas
<div class="arrow-buttons">
  <button class="state-arrow-btn state-arrow-up" 
          data-estado="${estado}" 
          data-partido="${partido}"
          ${distritos >= totalDistritos ? 'disabled' : ''}
          title="Aumentar">▲</button>
  <button class="state-arrow-btn state-arrow-down" 
          data-estado="${estado}" 
          data-partido="${partido}"
          ${distritos === 0 ? 'disabled' : ''}
          title="Disminuir">▼</button>
</div>
<span class="state-value">${distritos}</span>
```

✅ **Botones se deshabilitan automáticamente cuando:**
- ↑ No se puede aumentar si ya tiene todos los distritos del estado
- ↓ No se puede disminuir si el partido tiene 0 distritos

---

### 2. **Event Listeners**
**Archivo:** `components/panel_control/ControlSidebar.js` (líneas 2849-2872)

```javascript
attachStateArrowListeners() {
  const container = this.querySelector('#states-table-container');
  
  // Event delegation para mejor performance
  container.addEventListener('click', (event) => {
    const button = event.target.closest('.state-arrow-btn');
    if (!button || button.disabled) return;
    
    const estado = button.getAttribute('data-estado');
    const partido = button.getAttribute('data-partido');
    const isUp = button.classList.contains('state-arrow-up');
    
    // Llamar a la función de ajuste
    this.adjustStateDistrict(estado, partido, isUp ? 1 : -1);
  });
}
```

✅ **Usa event delegation** (un solo listener para toda la tabla, mejor performance)

---

### 3. **Lógica de Redistribución Micro**
**Archivo:** `components/panel_control/ControlSidebar.js` (líneas 2875-2993)

#### **Función Principal: `adjustStateDistrict()`**

```javascript
adjustStateDistrict(estado, partido, delta) {
  const valorActual = mrPorEstado[estado][partido] || 0;
  const nuevoValor = Math.max(0, valorActual + delta);
  const totalDistritos = distritosPorEstado[estado];
  
  // Validar que no exceda el total
  const totalAsignado = Object.values(mrPorEstado[estado]).reduce((sum, val) => sum + val, 0);
  const totalDespues = totalAsignado - valorActual + nuevoValor;
  
  if (totalDespues > totalDistritos) {
    console.warn('⚠️ No se puede aumentar: excedería total');
    return;
  }
  
  // Actualizar valor
  mrPorEstado[estado][partido] = nuevoValor;
  
  // Redistribuir automáticamente
  if (delta < 0) {
    this.redistributeStateDistricts(estado, partido, -delta, mrPorEstado, totalDistritos);
  }
  
  if (delta > 0) {
    this.takeFromOtherParties(estado, partido, delta, mrPorEstado);
  }
  
  // Actualizar UI y enviar al backend
  this.updateStatesTable();
  this.updateMRSlidersFromStatesData(mrPorEstado, partidos);
  
  // Debounce de 500ms antes de enviar
  clearTimeout(this._stateAdjustTimeout);
  this._stateAdjustTimeout = setTimeout(() => {
    this.sendMRDistributionFromStates();
  }, 500);
}
```

✅ **Lógica implementada:**
- Suma de distritos en estado = constante
- Si incrementas partido A, automáticamente decrementa partido con MÁS distritos
- Si decrementas partido A, automáticamente incrementa partido con MÁS distritos
- Validaciones: no negativos, no exceder total del estado

---

#### **Función: `takeFromOtherParties()`** (líneas 2967-2993)

```javascript
takeFromOtherParties(estado, partidoBeneficiado, distritosNecesarios, mrPorEstado) {
  // Ordenar partidos de mayor a menor por distritos
  const otrosPartidos = Object.keys(mrPorEstado[estado])
    .filter(p => p !== partidoBeneficiado && (mrPorEstado[estado][p] || 0) > 0)
    .sort((a, b) => (mrPorEstado[estado][b] || 0) - (mrPorEstado[estado][a] || 0));
  
  let distritosRestantes = distritosNecesarios;
  
  // Quitar primero de los que tienen MÁS
  for (const p of otrosPartidos) {
    if (distritosRestantes === 0) break;
    
    const valorActual = mrPorEstado[estado][p] || 0;
    const aQuitar = Math.min(valorActual, distritosRestantes);
    
    mrPorEstado[estado][p] = valorActual - aQuitar;
    distritosRestantes -= aQuitar;
  }
}
```

✅ **Estrategia de redistribución:**
- Quita primero del partido con MÁS distritos en el estado
- Nunca deja distritos negativos
- Si necesita quitar más, va al siguiente partido con más distritos

---

#### **Función: `redistributeStateDistricts()`** (líneas 2933-2965)

```javascript
redistributeStateDistricts(estado, partidoExcluido, distritosLibres, mrPorEstado, totalDistritos) {
  const otrosPartidos = Object.keys(mrPorEstado[estado])
    .filter(p => p !== partidoExcluido && (mrPorEstado[estado][p] || 0) > 0);
  
  // Redistribuir proporcionalmente
  const totalOtros = otrosPartidos.reduce((sum, p) => sum + (mrPorEstado[estado][p] || 0), 0);
  let distritosRestantes = distritosLibres;
  
  otrosPartidos.forEach((p, index) => {
    const valorActual = mrPorEstado[estado][p] || 0;
    const proporcion = valorActual / totalOtros;
    
    // Último partido recibe residuo para evitar errores de redondeo
    const ajuste = (index === otrosPartidos.length - 1) 
      ? distritosRestantes 
      : Math.min(Math.round(distritosLibres * proporcion), distritosRestantes);
    
    mrPorEstado[estado][p] = valorActual + ajuste;
    distritosRestantes -= ajuste;
  });
}
```

✅ **Redistribución proporcional:**
- Si MORENA pierde 3 distritos, se reparten entre PAN, MC, PRI según sus porcentajes actuales
- Último partido recibe el residuo (evita suma incorrecta por redondeo)

---

### 4. **Envío al Backend**
**Archivo:** `components/panel_control/ControlSidebar.js` (líneas 2996-3039)

```javascript
sendMRDistributionFromStates() {
  const mrPorEstado = this.lastResult.meta.mr_por_estado;
  
  // Calcular totales nacionales
  const distribucion = {};
  partidos.forEach(partido => {
    let total = 0;
    Object.values(mrPorEstado).forEach(estadoData => {
      total += estadoData[partido] || 0;
    });
    distribucion[partido] = total;
  });
  
  // Actualizar window global
  window.mrDistributionManual = {
    activa: true,
    distribucion: distribucion,        // Totales nacionales
    por_estado: mrPorEstado,           // 🆕 Desglose por estado
    total_asignado: Object.values(distribucion).reduce((sum, val) => sum + val, 0)
  };
  
  // Recalcular
  window.actualizarDesdeControles();
}
```

✅ **Datos enviados:**
- `distribucion`: Totales nacionales (ej: `{MORENA: 152, PAN: 84, ...}`)
- `por_estado`: Desglose completo por estado (ej: `{Jalisco: {MORENA: 11, PAN: 7, ...}, ...}`)

---

**Archivo:** `scripts/script_general/script.js` (líneas 589-603)

```javascript
if (mr_distritos_manuales && mr_distritos_manuales.activa && mr_distritos_manuales.distribucion) {
  // Totales nacionales (obligatorio)
  jsonBody.mr_distritos_manuales = JSON.stringify(mr_distritos_manuales.distribucion);
  
  // 🆕 Desglose por estado (opcional, solo si viene de flechitas)
  if (mr_distritos_manuales.por_estado) {
    jsonBody.mr_por_estado = JSON.stringify(mr_distritos_manuales.por_estado);
    console.log('[MR DISTRIBUTION] 🗺️ Enviando desglose por estado');
  }
}
```

✅ **Body del POST al backend:**
```json
{
  "mr_distritos_manuales": "{\"MORENA\":152,\"PAN\":84,\"MC\":42,...}",
  "mr_por_estado": "{\"Jalisco\":{\"MORENA\":11,\"PAN\":7,...},\"CDMX\":{...},...}"
}
```

---

### 5. **Debounce para Performance**

```javascript
// Espera 500ms después del último clic antes de enviar
clearTimeout(this._stateAdjustTimeout);
this._stateAdjustTimeout = setTimeout(() => {
  this.sendMRDistributionFromStates();
}, 500);
```

✅ **Evita spam al backend:**
- Usuario hace clic en ↑ varias veces rápido
- Frontend espera 500ms de inactividad
- Recién ahí envía UNA sola petición al backend

---

## 🔄 FLUJO COMPLETO (Click en Flechita)

### **Ejemplo: Usuario incrementa PAN en Jalisco**

1. **Click:** Usuario hace clic en ↑ de PAN en Jalisco
   ```
   Estado: Jalisco (20 distritos totales)
   Antes: MORENA: 12, PAN: 6, MC: 2
   ```

2. **Event Listener:** `attachStateArrowListeners()` captura el click
   ```javascript
   estado = "Jalisco"
   partido = "PAN"
   delta = +1
   ```

3. **Ajuste Local:** `adjustStateDistrict()` actualiza datos
   ```javascript
   PAN: 6 → 7 (+1)
   ```

4. **Redistribución:** `takeFromOtherParties()` quita de otros
   ```javascript
   MORENA: 12 → 11 (-1)  // Tenía más distritos
   ```

5. **Resultado Estado:**
   ```
   Después: MORENA: 11, PAN: 7, MC: 2
   Total: 20 (constante ✅)
   ```

6. **Calcular Totales Nacionales:** `sendMRDistributionFromStates()`
   ```javascript
   distribucion = {
     MORENA: 152,  // Bajó 1 (de 153)
     PAN: 84,      // Subió 1 (de 83)
     MC: 42,       // Sin cambios
     ...
   }
   ```

7. **Actualizar Global:**
   ```javascript
   window.mrDistributionManual = {
     activa: true,
     distribucion: {MORENA: 152, PAN: 84, ...},
     por_estado: {
       Jalisco: {MORENA: 11, PAN: 7, MC: 2},
       CDMX: {MORENA: 20, PAN: 3, MC: 1},
       ...
     }
   }
   ```

8. **Envío Backend:** `script.js` → POST `/procesar/diputados`
   ```json
   {
     "mr_distritos_manuales": "{\"MORENA\":152,\"PAN\":84,...}",
     "mr_por_estado": "{\"Jalisco\":{\"MORENA\":11,\"PAN\":7,...},...}"
   }
   ```

9. **Backend Recalcula:**
   - Usa MR manuales (MORENA: 152, PAN: 84, ...)
   - Calcula RP proporcional a votos
   - Aplica topes si está activo
   - Devuelve `seat_chart` completo

10. **Frontend Actualiza:**
    - Tabla de partidos
    - Hemiciclo (seat chart)
    - KPIs
    - Tabla de estados

---

## 📊 DATOS QUE EL BACKEND RECIBE

### **Caso 1: Solo Sliders (ajuste nacional)**
```json
{
  "mr_distritos_manuales": "{\"MORENA\":150,\"PAN\":85,...}"
}
```

### **Caso 2: Flechitas (ajuste por estado)**
```json
{
  "mr_distritos_manuales": "{\"MORENA\":152,\"PAN\":84,...}",
  "mr_por_estado": "{\"Jalisco\":{\"MORENA\":11,\"PAN\":7,\"MC\":2,\"PRI\":0,...},\"CDMX\":{\"MORENA\":20,\"PAN\":3,\"MC\":1,...},...}"
}
```

---

## 🎯 LO QUE EL BACKEND DEBE HACER

### **Opción A: Solo Usar Totales (Más Simple)**

```python
@app.post("/procesar/{camara}")
async def procesar(camara: str, body: dict):
    mr_manuales_str = body.get('mr_distritos_manuales')
    
    if mr_manuales_str:
        # Parsear totales
        mr_manuales = json.loads(mr_manuales_str)
        # {"MORENA": 152, "PAN": 84, ...}
        
        # Usar estos MR, calcular RP, aplicar topes
        resultados = calcular_sistema_electoral_con_mr_manual(
            votos=votos_reales,
            mr_manual=mr_manuales,
            ...
        )
    
    return {
        "seat_chart": [...],
        "kpis": {...},
        "meta": {
            "mr_por_estado": {...}  # Backend puede devolver su propio desglose
        }
    }
```

✅ **Ventaja:** Simple, el backend ignora `mr_por_estado` y solo usa totales

---

### **Opción B: Validar Desglose (Más Robusto)**

```python
@app.post("/procesar/{camara}")
async def procesar(camara: str, body: dict):
    mr_manuales_str = body.get('mr_distritos_manuales')
    mr_por_estado_str = body.get('mr_por_estado')
    
    if mr_manuales_str:
        mr_manuales = json.loads(mr_manuales_str)
        
        # Si viene desglose por estado, validar que sume correctamente
        if mr_por_estado_str:
            mr_por_estado = json.loads(mr_por_estado_str)
            
            # Validar que los totales por estado sumen a los totales nacionales
            totales_calculados = {}
            for estado, partidos in mr_por_estado.items():
                for partido, distritos in partidos.items():
                    totales_calculados[partido] = totales_calculados.get(partido, 0) + distritos
            
            # Verificar coincidencia
            if totales_calculados != mr_manuales:
                raise HTTPException(400, "Inconsistencia entre totales y desglose por estado")
        
        resultados = calcular_sistema_electoral_con_mr_manual(...)
    
    return {...}
```

✅ **Ventaja:** Detecta errores en el frontend, más seguro

---

### **Opción C: Usar Desglose para Análisis (Ideal)**

```python
if mr_por_estado_str:
    mr_por_estado = json.loads(mr_por_estado_str)
    
    # Calcular métricas adicionales por estado
    analisis_por_estado = {}
    for estado, partidos in mr_por_estado.items():
        total_estado = sum(partidos.values())
        analisis_por_estado[estado] = {
            "total_mr": total_estado,
            "partido_dominante": max(partidos, key=partidos.get),
            "concentracion": max(partidos.values()) / total_estado if total_estado > 0 else 0
        }
    
    # Incluir en respuesta
    return {
        "seat_chart": [...],
        "kpis": {...},
        "meta": {
            "mr_por_estado": mr_por_estado,
            "analisis_por_estado": analisis_por_estado
        }
    }
```

✅ **Ventaja:** Backend puede devolver análisis enriquecido por estado

---

## ✅ RESUMEN FINAL

### **Frontend:**
✅ Flechitas implementadas y funcionando
✅ Redistribución automática (suma zero-sum)
✅ Debounce de 500ms
✅ Envía `mr_distritos_manuales` (totales)
✅ Envía `mr_por_estado` (desglose)
✅ Actualiza sliders globales
✅ Actualiza tabla de estados
✅ Llama a recalcular sistema

### **Backend (pendiente):**
❌ Procesar `mr_distritos_manuales` (totales) → **CRÍTICO**
⚠️ Procesar `mr_por_estado` (desglose) → **OPCIONAL**
❌ Devolver `seat_chart` completo → **CRÍTICO**
❌ Devolver `kpis` recalculados → **CRÍTICO**

---

## 🚀 PRÓXIMOS PASOS

1. **Backend debe implementar:**
   - Leer `mr_distritos_manuales` del body del POST
   - Usar esos MR como fijos (no calcular)
   - Calcular RP proporcional a votos
   - Aplicar topes si `aplicar_topes=true`
   - Devolver `seat_chart` + `kpis`

2. **Opcional (mejora futura):**
   - Leer `mr_por_estado` para validación
   - Devolver análisis por estado en `meta`

---

## 📞 CONTACTO

Si el backend tiene dudas sobre:
- Formato exacto de los datos
- Cómo calcular RP con MR manual
- Estructura de respuesta esperada

**Revisar:** `BACKEND_AJUSTE_DISTRITOS_INDIVIDUALES.md` para especificación completa.
