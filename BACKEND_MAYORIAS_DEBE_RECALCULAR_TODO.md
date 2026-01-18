# 🚨 ESPECIFICACIÓN CRÍTICA - BACKEND DEBE RECALCULAR TODO EL SISTEMA

## ✅ ACTUALIZACIÓN: FRONTEND VERIFICADO (15 ENE 2026)

**El frontend YA ESTÁ COMPLETAMENTE IMPLEMENTADO** y enviando todos los parámetros necesarios:

### Parámetros que el Frontend Envía:

#### Siempre (todos los planes):
- ✅ `partido` - Ej: "MORENA"
- ✅ `tipo_mayoria` - "simple" o "calificada"
- ✅ `plan` - "vigente", "personalizado", etc.
- ✅ `aplicar_topes` - "true" o "false"
- ✅ `anio` - "2024", "2021", "2018"

#### Solo para planes personalizados:
- ✅ `escanos_totales` - Ej: 128
- ✅ `mr_seats` - Ej: 64
- ✅ `rp_seats` - Ej: 64
- ✅ `sistema` - "mixto", "mr", "rp"

**Código verificado:** `ControlSidebar.js` líneas 2540-2680

📄 **Ver detalles completos en:** `VERIFICACION_MAYORIAS_FRONTEND_COMPLETO.md`

---

## ⚠️ PROBLEMA ACTUAL DEL BACKEND

El endpoint `/calcular/mayoria_forzada` actualmente solo devuelve:
```json
{
  "viable": true,
  "diputados_necesarios": 251,
  "diputados_obtenidos": 248,
  "votos_porcentaje": 45.2,
  "mr_asignados": 153,
  "rp_asignados": 95
}
```

**Esto NO es suficiente.** El frontend necesita el `seat_chart` COMPLETO recalculado.

---

## ✅ LO QUE DEBE HACER EL BACKEND

### **Comportamiento Esperado:**

Cuando recibe:
```
GET /calcular/mayoria_forzada?partido=MORENA&tipo_mayoria=simple&plan=vigente&aplicar_topes=true&anio=2024
```

El backend debe:

1. **Determinar umbral de mayoría:**
   - Simple: 251 diputados (o 65 senadores)
   - Calificada: 334 diputados (o 86 senadores)

2. **Calcular cuántos votos necesita el partido:**
   - Algoritmo: Ajustar porcentaje de votos de MORENA hasta que alcance 251 escaños
   - Considerar: sistema (mixto/puro), MR/RP, topes si están activos

3. **RECALCULAR TODO EL SISTEMA:**
   - **NO** solo calcular escaños de MORENA
   - **SÍ** recalcular escaños de TODOS los partidos con la nueva distribución de votos
   - Ajustar porcentajes de otros partidos proporcionalmente

4. **Devolver respuesta COMPLETA:**
   ```json
   {
     "viable": true,
     "diputados_necesarios": 251,
     "diputados_obtenidos": 251,  // ← Debe alcanzar el umbral
     "votos_porcentaje": 47.5,    // ← % ajustado necesario
     "mr_asignados": 158,
     "rp_asignados": 93,
     
     // 🔑 CRÍTICO: Incluir seat_chart completo recalculado
     "seat_chart": [
       {
         "party": "MORENA",
         "seats": 251,        // ← FORZADO a mayoría
         "mr_seats": 158,
         "rp_seats": 93,
         "votes_percent": 47.5,
         "color": "#941B1E"
       },
       {
         "party": "PAN",
         "seats": 85,         // ← RECALCULADO con nuevo %
         "mr_seats": 42,
         "rp_seats": 43,
         "votes_percent": 18.2,
         "color": "#0059B3"
       },
       {
         "party": "PRI",
         "seats": 64,         // ← RECALCULADO
         "mr_seats": 30,
         "rp_seats": 34,
         "votes_percent": 14.3,
         "color": "#E20613"
       },
       // ... resto de partidos RECALCULADOS
     ],
     
     // 🔑 CRÍTICO: Incluir KPIs recalculados
     "kpis": {
       "total_escanos": 500,
       "gallagher": 8.45,
       "ratio_promedio": 0.912,
       "total_votos": 45678901
     }
   }
   ```

---

## 🧮 ALGORITMO RECOMENDADO

### **Paso 1: Determinar Umbral**
```python
if tipo_mayoria == "simple":
    umbral = 251 if camara == "diputados" else 65
elif tipo_mayoria == "calificada":
    umbral = 334 if camara == "diputados" else 86
```

### **Paso 2: Buscar % de votos necesario**
```python
def calcular_porcentaje_necesario(partido, umbral, parametros):
    """
    Búsqueda binaria o iterativa para encontrar el % de votos
    que necesita el partido para alcanzar el umbral de escaños.
    """
    porcentaje_min = 0.0
    porcentaje_max = 100.0
    tolerancia = 0.01
    
    while porcentaje_max - porcentaje_min > tolerancia:
        porcentaje_prueba = (porcentaje_min + porcentaje_max) / 2
        
        # Ajustar votos del partido
        votos_ajustados = ajustar_votos_partido(partido, porcentaje_prueba, parametros)
        
        # Calcular escaños con el sistema electoral
        escanos_obtenidos = calcular_escanos(votos_ajustados, parametros)
        
        if escanos_obtenidos[partido] < umbral:
            # Necesita más votos
            porcentaje_min = porcentaje_prueba
        else:
            # Tiene suficientes votos (o más)
            porcentaje_max = porcentaje_prueba
    
    return porcentaje_max
```

### **Paso 3: Recalcular Sistema Completo**
```python
def recalcular_con_mayoria_forzada(partido_objetivo, umbral, parametros):
    """
    Ajusta votos del partido objetivo y recalcula todo el sistema.
    """
    # 1. Encontrar % necesario
    porcentaje_necesario = calcular_porcentaje_necesario(
        partido_objetivo, 
        umbral, 
        parametros
    )
    
    # 2. Obtener votos actuales de todos los partidos
    votos_originales = obtener_votos_por_partido(parametros.anio)
    
    # 3. Ajustar votos del partido objetivo
    votos_ajustados = votos_originales.copy()
    total_votos = sum(votos_originales.values())
    votos_ajustados[partido_objetivo] = total_votos * (porcentaje_necesario / 100)
    
    # 4. Redistribuir votos de otros partidos proporcionalmente
    votos_restantes = total_votos - votos_ajustados[partido_objetivo]
    suma_otros = sum(v for p, v in votos_originales.items() if p != partido_objetivo)
    
    for partido in votos_originales:
        if partido != partido_objetivo:
            proporcion = votos_originales[partido] / suma_otros
            votos_ajustados[partido] = votos_restantes * proporcion
    
    # 5. Calcular escaños con el sistema electoral
    resultados = calcular_sistema_electoral(
        votos_ajustados,
        plan=parametros.plan,
        aplicar_topes=parametros.aplicar_topes,
        sistema=parametros.sistema,
        # ... otros parámetros
    )
    
    # 6. Construir seat_chart
    seat_chart = []
    for partido in resultados:
        seat_chart.append({
            "party": partido,
            "seats": resultados[partido]["total"],
            "mr_seats": resultados[partido]["mr"],
            "rp_seats": resultados[partido]["rp"],
            "pm_seats": resultados[partido].get("pm", 0),
            "votes_percent": (votos_ajustados[partido] / total_votos) * 100,
            "color": COLORES_PARTIDOS[partido]
        })
    
    # 7. Calcular KPIs
    kpis = calcular_kpis(resultados, votos_ajustados)
    
    return {
        "viable": True,
        "diputados_necesarios": umbral,
        "diputados_obtenidos": resultados[partido_objetivo]["total"],
        "votos_porcentaje": porcentaje_necesario,
        "mr_asignados": resultados[partido_objetivo]["mr"],
        "rp_asignados": resultados[partido_objetivo]["rp"],
        "seat_chart": seat_chart,  # ← CRÍTICO
        "kpis": kpis                # ← CRÍTICO
    }
```

---

## ⚠️ CASO ESPECIAL: Mayoría Imposible con Topes

Si `aplicar_topes=true` y se solicita mayoría calificada:

```python
if aplicar_topes and tipo_mayoria == "calificada":
    # Verificar si es posible
    max_escanos_posible = 300  # 60% del total (500)
    
    if umbral > max_escanos_posible:
        return {
            "viable": False,
            "mensaje": "Mayoría calificada imposible con topes del 60%",
            "diputados_necesarios": umbral,
            "max_posible": max_escanos_posible,
            "diputados_obtenidos": 0,
            "votos_porcentaje": None
        }
```

---

## 📋 ESTRUCTURA DE RESPUESTA COMPLETA

### **Caso Exitoso:**
```json
{
  "viable": true,
  "diputados_necesarios": 251,
  "diputados_obtenidos": 251,
  "votos_porcentaje": 47.5,
  "mr_asignados": 158,
  "rp_asignados": 93,
  "seat_chart": [
    {
      "party": "MORENA",
      "seats": 251,
      "mr_seats": 158,
      "rp_seats": 93,
      "pm_seats": 0,
      "votes_percent": 47.5,
      "color": "#941B1E"
    },
    {
      "party": "PAN",
      "seats": 85,
      "mr_seats": 42,
      "rp_seats": 43,
      "pm_seats": 0,
      "votes_percent": 18.2,
      "color": "#0059B3"
    }
    // ... resto de partidos
  ],
  "kpis": {
    "total_escanos": 500,
    "gallagher": 8.45,
    "ratio_promedio": 0.912,
    "total_votos": 45678901
  }
}
```

### **Caso Imposible (con topes):**
```json
{
  "viable": false,
  "mensaje": "Mayoría calificada imposible con topes del 60%",
  "diputados_necesarios": 334,
  "max_posible": 300,
  "diputados_obtenidos": 0,
  "votos_porcentaje": null
}
```

---

## 🧪 TESTS ESPERADOS

### **Test 1: Mayoría Simple Diputados**
```bash
curl "https://back-electoral.onrender.com/calcular/mayoria_forzada?partido=MORENA&tipo_mayoria=simple&plan=vigente&aplicar_topes=false&anio=2024"
```

**Debe devolver:**
- `viable: true`
- `diputados_obtenidos: 251` (exactamente el umbral)
- `seat_chart` con 7-10 partidos TODOS recalculados
- `kpis` con índice de Gallagher, etc.

### **Test 2: Mayoría Calificada con Topes**
```bash
curl "https://back-electoral.onrender.com/calcular/mayoria_forzada?partido=PAN&tipo_mayoria=calificada&plan=vigente&aplicar_topes=true&anio=2024"
```

**Debe devolver:**
- `viable: false`
- `mensaje: "Mayoría calificada imposible con topes del 60%"`
- NO incluir `seat_chart` (no tiene sentido si es imposible)

---

## 🎯 PRIORIDAD CRÍTICA

**SIN el `seat_chart` completo recalculado, el frontend NO puede:**
1. Actualizar la tabla de partidos correctamente
2. Actualizar el seat chart visual (cajitas)
3. Mostrar KPIs precisos

**El backend DEBE devolver `seat_chart` + `kpis` para que la feature funcione.**

---

## 📞 INTEGRACIÓN CON FRONTEND

Una vez implementado, el frontend:

1. Llama al endpoint con los parámetros del usuario
2. Recibe `seat_chart` completo en la respuesta
3. Reemplaza los datos normales con los de mayoría forzada
4. La tabla y el seat chart se actualizan automáticamente

**¡Sin cambios adicionales en el frontend!**
