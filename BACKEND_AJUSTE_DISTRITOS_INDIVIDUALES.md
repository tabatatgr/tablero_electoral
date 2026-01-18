# 🎯 ESPECIFICACIÓN BACKEND - AJUSTE DE DISTRITOS INDIVIDUALES (FLECHITAS)

## ✅ ACTUALIZACIÓN: FRONTEND YA ESTÁ 100% IMPLEMENTADO

**El frontend YA está completamente funcional** y envía todos los datos necesarios.

**📄 Ver detalles completos en:** `FRONTEND_FLECHITAS_IMPLEMENTADO.md`

### **Datos que el Frontend ENVÍA al Backend:**

```json
{
  "mr_distritos_manuales": "{\"MORENA\":152,\"PAN\":84,\"MC\":42,...}",
  "mr_por_estado": "{\"Jalisco\":{\"MORENA\":11,\"PAN\":7,...},\"CDMX\":{...},...}"
}
```

- ✅ `mr_distritos_manuales`: Totales nacionales por partido (STRING JSON)
- ✅ `mr_por_estado`: Desglose por estado (STRING JSON) - **NUEVO**

---

## 📋 CONTEXTO

**Estado actual:** Los sliders de distribución MR a nivel nacional YA FUNCIONAN PERFECTAMENTE.

**Nueva funcionalidad:** Permitir ajustes **distrito por distrito** usando flechitas (↑↓) para redistribuir escaños MR entre partidos **a nivel estatal/distrital**.

---

## 🎯 OBJETIVO

Implementar endpoint que permita:
1. **Incrementar/decrementar** MR de un partido en un distrito específico
2. **Redistribuir automáticamente** el escaño quitado a otro partido en ese mismo distrito
3. **Actualizar totales nacionales** de MR por partido
4. **Recalcular todo el sistema** (RP, totales, KPIs, seat_chart)

---

## 🔄 LÓGICA MICRO (IGUAL QUE LOS SLIDERS)

### **Principio Fundamental:**
> "Si le sumo 1 distrito MR a un partido en Jalisco, se lo tengo que quitar a otro partido en Jalisco, y los totales nacionales deben reflejar este cambio"

### **Ejemplo Concreto:**

**Estado inicial - Jalisco (20 distritos MR):**
```json
{
  "estado": "Jalisco",
  "distritos_totales": 20,
  "distribucion_mr": {
    "MORENA": 12,
    "PAN": 6,
    "MC": 2,
    "PRI": 0,
    "PVEM": 0,
    "PT": 0,
    "PRD": 0
  }
}
```

**Usuario hace clic en ↑ para PAN:**
- PAN en Jalisco: 6 → **7** (+1)
- Se debe quitar 1 distrito a otro partido en Jalisco
- Prioridad de quitar: **el partido con MÁS distritos** (en este caso MORENA con 12)

**Estado final - Jalisco:**
```json
{
  "estado": "Jalisco",
  "distritos_totales": 20,
  "distribucion_mr": {
    "MORENA": 11,  // ← Le quitamos 1
    "PAN": 7,      // ← Le sumamos 1
    "MC": 2,
    "PRI": 0,
    "PVEM": 0,
    "PT": 0,
    "PRD": 0
  }
}
```

**Impacto en totales nacionales:**
```json
{
  "totales_mr_nacional": {
    "MORENA": 152,  // ← Bajó de 153
    "PAN": 84,      // ← Subió de 83
    "MC": 42,
    // ... resto igual
  }
}
```

---

## 📡 CÓMO FUNCIONA (SIMPLIFICADO)

### **NO se necesita endpoint nuevo**

El frontend usa el **mismo endpoint existente** que los sliders:
```
POST /procesar/{camara}
```

### **Body que recibe (IGUAL que sliders):**
```json
{
  "anio": 2024,
  "plan": "vigente",
  "aplicar_topes": true,
  
  // Totales nacionales (SIEMPRE viene, de sliders o flechitas)
  "mr_distritos_manuales": "{\"MORENA\":152,\"PAN\":84,\"MC\":42,...}",
  
  // 🆕 Desglose por estado (OPCIONAL, solo viene de flechitas)
  "mr_por_estado": "{\"Jalisco\":{\"MORENA\":11,\"PAN\":7,...},...}"
}
```

### **Lo que el Backend DEBE hacer:**

```python
@app.post("/procesar/{camara}")
async def procesar(camara: str, body: dict):
    mr_manuales_str = body.get('mr_distritos_manuales')
    mr_por_estado_str = body.get('mr_por_estado')  # 🆕 Nuevo (opcional)
    
    if mr_manuales_str:
        # Parsear totales
        mr_manuales = json.loads(mr_manuales_str)
        # {"MORENA": 152, "PAN": 84, ...}
        
        # 🔑 CLAVE: NO calcular MR, usar los que vienen del frontend
        resultados = calcular_sistema_electoral_con_mr_manual(
            votos=obtener_votos(anio, camara),
            mr_manual=mr_manuales,  # ← Usar estos MR fijos
            plan=body.get('plan'),
            aplicar_topes=body.get('aplicar_topes'),
            camara=camara
        )
        
        # Opcional: Si viene desglose por estado, incluirlo en respuesta
        meta = {}
        if mr_por_estado_str:
            meta['mr_por_estado'] = json.loads(mr_por_estado_str)
    
    # CRÍTICO: Devolver seat_chart + kpis
    return {
        "seat_chart": construir_seat_chart(resultados),
        "kpis": calcular_kpis(resultados),
        "meta": meta
    }
```

---

## 📡 ENDPOINT PROPUESTO

### **Ruta:**
```
POST /ajustar/distrito-individual
```

**⚠️ NOTA:** Este endpoint YA NO ES NECESARIO. El frontend usa el mismo endpoint que los sliders globales (`/procesar/{camara}`).

**Mantener esta sección solo como referencia de la lógica que el backend podría implementar opcionalmente.**

---
```json
{
  "camara": "diputados",
  "anio": 2024,
  "estado": "Jalisco",
  "partido": "PAN",
  "accion": "incrementar",  // o "decrementar"
  "plan": "vigente",
  "aplicar_topes": true,
  
  // Distribución MR actual de TODO el país (para contexto)
  "mr_distritos_actuales": {
    "MORENA": 153,
    "PAN": 83,
    "MC": 42,
    "PRI": 35,
    "PVEM": 28,
    "PT": 22,
    "PRD": 10
  },
  
  // Distribución MR actual del ESTADO específico
  "mr_estado_actual": {
    "MORENA": 12,
    "PAN": 6,
    "MC": 2,
    "PRI": 0,
    "PVEM": 0,
    "PT": 0,
    "PRD": 0
  }
}
```

### **Respuesta Esperada:**
```json
{
  "success": true,
  
  // Distribución MR actualizada del ESTADO
  "mr_estado_nuevo": {
    "MORENA": 11,  // ← Ajustado
    "PAN": 7,      // ← Ajustado
    "MC": 2,
    "PRI": 0,
    "PVEM": 0,
    "PT": 0,
    "PRD": 0
  },
  
  // Totales MR nacionales actualizados
  "mr_nacional_nuevo": {
    "MORENA": 152,  // ← Actualizado
    "PAN": 84,      // ← Actualizado
    "MC": 42,
    "PRI": 35,
    "PVEM": 28,
    "PT": 22,
    "PRD": 10
  },
  
  // CRÍTICO: Sistema completo recalculado
  "seat_chart": [
    {
      "party": "MORENA",
      "seats": 234,        // ← Total recalculado (MR + RP)
      "mr_seats": 152,     // ← Nuevo total MR
      "rp_seats": 82,      // ← RP recalculado con topes
      "votes_percent": 42.3,
      "color": "#941B1E"
    },
    {
      "party": "PAN",
      "seats": 98,
      "mr_seats": 84,      // ← Nuevo total MR
      "rp_seats": 14,
      "votes_percent": 18.5,
      "color": "#0059B3"
    }
    // ... resto de partidos
  ],
  
  "kpis": {
    "total_escanos": 500,
    "gallagher": 9.23,
    "ratio_promedio": 0.908,
    "total_votos": 56789012
  },
  
  // Información del ajuste realizado
  "ajuste_realizado": {
    "estado": "Jalisco",
    "partido_incrementado": "PAN",
    "partido_decrementado": "MORENA",
    "cambio": 1
  }
}
```

---

## 🧮 ALGORITMO DE IMPLEMENTACIÓN

### **Paso 1: Validar la operación**
```python
def validar_ajuste(estado, partido, accion, mr_estado_actual, distritos_totales_estado):
    """
    Verifica que el ajuste sea posible.
    """
    if accion == "incrementar":
        # Verificar que no se exceda el total de distritos del estado
        total_actual = sum(mr_estado_actual.values())
        if total_actual >= distritos_totales_estado:
            return False, "No hay distritos disponibles en este estado"
        
        # Verificar que haya al menos un partido con distritos para quitar
        partidos_con_mr = [p for p, v in mr_estado_actual.items() if v > 0]
        if len(partidos_con_mr) == 0:
            return False, "No hay partidos con distritos para redistribuir"
    
    elif accion == "decrementar":
        # Verificar que el partido tenga al menos 1 distrito en este estado
        if mr_estado_actual.get(partido, 0) == 0:
            return False, f"{partido} no tiene distritos en {estado}"
    
    return True, "OK"


def ejecutar_ajuste(estado, partido, accion, mr_estado_actual, mr_nacional_actual):
    """
    Ejecuta el ajuste y retorna las nuevas distribuciones.
    """
    mr_estado_nuevo = mr_estado_actual.copy()
    mr_nacional_nuevo = mr_nacional_actual.copy()
    
    if accion == "incrementar":
        # 1. Incrementar el partido objetivo
        mr_estado_nuevo[partido] = mr_estado_nuevo.get(partido, 0) + 1
        mr_nacional_nuevo[partido] = mr_nacional_nuevo.get(partido, 0) + 1
        
        # 2. Quitar 1 distrito del partido con MÁS distritos en el estado
        #    (excluyendo el partido que acabamos de incrementar)
        candidatos = {
            p: v for p, v in mr_estado_nuevo.items() 
            if p != partido and v > 0
        }
        
        if not candidatos:
            raise ValueError("No hay partidos disponibles para quitar distrito")
        
        # Encontrar partido con más distritos
        partido_a_decrementar = max(candidatos, key=candidatos.get)
        
        mr_estado_nuevo[partido_a_decrementar] -= 1
        mr_nacional_nuevo[partido_a_decrementar] -= 1
        
        ajuste_info = {
            "partido_incrementado": partido,
            "partido_decrementado": partido_a_decrementar,
            "cambio": 1
        }
    
    elif accion == "decrementar":
        # 1. Decrementar el partido objetivo
        mr_estado_nuevo[partido] = mr_estado_nuevo.get(partido, 0) - 1
        mr_nacional_nuevo[partido] = mr_nacional_nuevo.get(partido, 0) - 1
        
        # 2. Sumar 1 distrito al partido con MÁS distritos en el estado
        #    (excluyendo el partido que acabamos de decrementar)
        candidatos = {
            p: v for p, v in mr_estado_nuevo.items() 
            if p != partido
        }
        
        partido_a_incrementar = max(candidatos, key=candidatos.get)
        
        mr_estado_nuevo[partido_a_incrementar] += 1
        mr_nacional_nuevo[partido_a_incrementar] += 1
        
        ajuste_info = {
            "partido_incrementado": partido_a_incrementar,
            "partido_decrementado": partido,
            "cambio": 1
        }
    
    return mr_estado_nuevo, mr_nacional_nuevo, ajuste_info
```

---

### **Paso 2: Recalcular sistema completo**

```python
@app.post("/ajustar/distrito-individual")
async def ajustar_distrito_individual(request: AjusteDistritoRequest):
    """
    Ajusta MR de un partido en un estado y recalcula todo el sistema.
    """
    
    # 1. Obtener distritos totales del estado
    distritos_totales_estado = obtener_distritos_por_estado(
        request.estado, 
        request.camara
    )
    
    # 2. Validar operación
    valido, mensaje = validar_ajuste(
        estado=request.estado,
        partido=request.partido,
        accion=request.accion,
        mr_estado_actual=request.mr_estado_actual,
        distritos_totales_estado=distritos_totales_estado
    )
    
    if not valido:
        raise HTTPException(400, mensaje)
    
    # 3. Ejecutar ajuste
    mr_estado_nuevo, mr_nacional_nuevo, ajuste_info = ejecutar_ajuste(
        estado=request.estado,
        partido=request.partido,
        accion=request.accion,
        mr_estado_actual=request.mr_estado_actual,
        mr_nacional_actual=request.mr_distritos_actuales
    )
    
    # 4. RECALCULAR SISTEMA COMPLETO con nuevos MR totales
    #    (esto es IGUAL a como funciona con los sliders)
    votos_reales = obtener_votos_historicos(request.anio, request.camara)
    
    resultados = calcular_sistema_electoral_con_mr_manual(
        votos=votos_reales,
        mr_manual=mr_nacional_nuevo,  # ← Usamos los MR ajustados
        plan=request.plan,
        aplicar_topes=request.aplicar_topes,
        camara=request.camara
    )
    
    # 5. Construir seat_chart
    total_votos = sum(votos_reales.values())
    seat_chart = []
    
    for partido_name, datos in resultados.items():
        seat_chart.append({
            "party": partido_name,
            "seats": datos['total'],
            "mr_seats": datos['mr'],
            "rp_seats": datos['rp'],
            "pm_seats": datos.get('pm', 0),
            "votes_percent": round((votos_reales[partido_name] / total_votos) * 100, 2),
            "color": PARTY_COLORS.get(partido_name, "#CCCCCC")
        })
    
    # 6. Calcular KPIs
    kpis = calcular_kpis_sistema(resultados, votos_reales, total_votos)
    
    # 7. Retornar respuesta completa
    return {
        "success": True,
        "mr_estado_nuevo": mr_estado_nuevo,
        "mr_nacional_nuevo": mr_nacional_nuevo,
        "seat_chart": seat_chart,
        "kpis": kpis,
        "ajuste_realizado": {
            "estado": request.estado,
            **ajuste_info
        }
    }
```

---

### **Paso 3: Calcular RP con MR manual**

```python
def calcular_sistema_electoral_con_mr_manual(
    votos: dict,
    mr_manual: dict,
    plan: str,
    aplicar_topes: bool,
    camara: str
):
    """
    Calcula RP basándose en MR manuales (de sliders o flechitas).
    
    IMPORTANTE: NO calcula MR (ya vienen dados), solo calcula RP.
    """
    
    # 1. Usar MR manuales directamente
    resultados = {}
    for partido, mr_escanos in mr_manual.items():
        resultados[partido] = {
            'mr': mr_escanos,
            'rp': 0,  # Se calculará después
            'total': mr_escanos
        }
    
    # 2. Calcular RP disponibles
    if camara == "diputados":
        rp_totales = 200
    elif camara == "senado":
        rp_totales = 32
    else:
        raise ValueError(f"Cámara inválida: {camara}")
    
    # 3. Asignar RP por proporcionalidad de votos
    total_votos = sum(votos.values())
    rp_asignados_temp = {}
    
    for partido, votos_partido in votos.items():
        proporcion = votos_partido / total_votos
        rp_calculados = round(rp_totales * proporcion)
        rp_asignados_temp[partido] = rp_calculados
    
    # 4. Ajustar para que sumen exactamente rp_totales
    diferencia = rp_totales - sum(rp_asignados_temp.values())
    
    if diferencia != 0:
        # Ajustar al partido con más votos
        partido_mayor = max(votos, key=votos.get)
        rp_asignados_temp[partido_mayor] += diferencia
    
    # 5. Aplicar topes si es necesario
    if aplicar_topes:
        total_escanos = sum(mr_manual.values()) + rp_totales
        max_escanos = math.floor(total_escanos * 0.6)  # 60%
        
        for partido in resultados:
            mr = resultados[partido]['mr']
            rp = rp_asignados_temp.get(partido, 0)
            total = mr + rp
            
            if total > max_escanos:
                # Reducir RP para cumplir tope
                rp_ajustado = max_escanos - mr
                rp_quitado = rp - rp_ajustado
                
                resultados[partido]['rp'] = rp_ajustado
                resultados[partido]['total'] = max_escanos
                
                # Redistribuir RP quitado
                # (lógica de redistribución...)
            else:
                resultados[partido]['rp'] = rp
                resultados[partido]['total'] = total
    else:
        for partido in resultados:
            rp = rp_asignados_temp.get(partido, 0)
            resultados[partido]['rp'] = rp
            resultados[partido]['total'] = resultados[partido]['mr'] + rp
    
    return resultados
```

---

## 🔗 INTEGRACIÓN CON FRONTEND

El frontend enviará una petición cada vez que el usuario haga clic en una flechita:

```javascript
async function ajustarDistritoIndividual(estado, partido, accion) {
    const body = {
        camara: camaraActual,
        anio: anioActual,
        estado: estado,
        partido: partido,
        accion: accion,  // "incrementar" o "decrementar"
        plan: planActual,
        aplicar_topes: aplicarTopesActual,
        mr_distritos_actuales: window.mrDistributionManual.distribucion,
        mr_estado_actual: obtenerDistribucionEstado(estado)
    };
    
    const response = await fetch(
        'https://back-electoral.onrender.com/ajustar/distrito-individual',
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        }
    );
    
    const data = await response.json();
    
    // Actualizar estado local
    actualizarDistribucionEstado(estado, data.mr_estado_nuevo);
    window.mrDistributionManual.distribucion = data.mr_nacional_nuevo;
    
    // Actualizar tabla y seat chart con nueva data
    actualizarSeatChart(data.seat_chart);
    actualizarKPIs(data.kpis);
}
```

---

## 🧪 CASOS DE PRUEBA

### **Test 1: Incrementar PAN en Jalisco**
```json
POST /ajustar/distrito-individual
{
  "estado": "Jalisco",
  "partido": "PAN",
  "accion": "incrementar",
  "mr_estado_actual": {
    "MORENA": 12,
    "PAN": 6,
    "MC": 2
  }
}
```

**Resultado esperado:**
- PAN en Jalisco: 6 → 7
- MORENA en Jalisco: 12 → 11 (le quitamos porque tenía más)
- Total Jalisco sigue siendo 20
- MR nacional PAN: +1, MR nacional MORENA: -1

---

### **Test 2: Decrementar MORENA en CDMX**
```json
POST /ajustar/distrito-individual
{
  "estado": "Ciudad de México",
  "partido": "MORENA",
  "accion": "decrementar",
  "mr_estado_actual": {
    "MORENA": 20,
    "PAN": 3,
    "MC": 1
  }
}
```

**Resultado esperado:**
- MORENA en CDMX: 20 → 19
- PAN en CDMX: 3 → 4 (le sumamos porque tenía más después de MORENA)
- Total CDMX sigue siendo 24
- MR nacional MORENA: -1, MR nacional PAN: +1

---

### **Test 3: Error - Incrementar sin disponibles**
```json
POST /ajustar/distrito-individual
{
  "estado": "Colima",
  "partido": "PRI",
  "accion": "incrementar",
  "mr_estado_actual": {
    "MORENA": 2,
    "PAN": 0,
    "PRI": 0,
    "MC": 0
  }
}
```

**Resultado esperado:**
```json
{
  "error": "No hay distritos disponibles en este estado",
  "status": 400
}
```

---

## ✅ RESUMEN EJECUTIVO

### **Qué hace el endpoint:**
1. Recibe: estado, partido, acción (↑ o ↓)
2. Ajusta MR del estado: +1 a partido X, -1 a partido Y
3. Actualiza MR totales nacionales
4. **Recalcula RP, totales, topes, KPIs**
5. Devuelve `seat_chart` completo + distribución actualizada

### **Lógica clave:**
- **Incrementar:** Suma 1 al partido, resta 1 al que tiene MÁS distritos
- **Decrementar:** Resta 1 al partido, suma 1 al que tiene MÁS distritos
- **Siempre:** Total de distritos del estado = constante
- **Siempre:** Recalcula RP con topes si aplica

### **Igual que sliders pero MICRO:**
- Sliders: Ajuste nacional (MORENA 153 → 150)
- Flechitas: Ajuste estatal (MORENA Jalisco 12 → 11) → impacta nacional

---

## 🎯 PRIORIDAD

**CRÍTICO:** El endpoint debe devolver `seat_chart` completo recalculado, igual que los sliders.

**SIN esto, el frontend NO puede:**
- Actualizar la tabla de partidos
- Actualizar el hemiciclo
- Mostrar KPIs correctos

---

## 📞 DUDAS TÉCNICAS

Si tienes preguntas sobre:
- Estructura de datos de distritos por estado
- Cómo obtener `distritos_totales_estado`
- Integración con código existente de sliders
- Casos edge (empates, estados con 1 solo partido)

**Contáctame y lo resolvemos juntos.** 🚀
