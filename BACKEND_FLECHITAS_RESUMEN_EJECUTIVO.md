# 🚀 RESUMEN EJECUTIVO PARA EL BACKEND - FLECHITAS

## ✅ LO QUE NECESITAS SABER

El frontend **YA está 100% implementado** y envía todos los datos necesarios.

---

## 📡 LO QUE EL BACKEND RECIBE

### **Endpoint (ya existente):**
```
POST /procesar/diputados
POST /procesar/senado
```

### **Body del POST:**
```json
{
  "anio": 2024,
  "plan": "vigente",
  "aplicar_topes": true,
  
  // Totales MR por partido (viene de sliders O flechitas)
  "mr_distritos_manuales": "{\"MORENA\":152,\"PAN\":84,\"MC\":42,\"PRI\":35,...}",
  
  // 🆕 Desglose por estado (OPCIONAL, solo si vino de flechitas)
  "mr_por_estado": "{\"Jalisco\":{\"MORENA\":11,\"PAN\":7,\"MC\":2,...},\"CDMX\":{\"MORENA\":20,...},...}"
}
```

---

## 🔑 LO QUE EL BACKEND DEBE HACER

### **1. Leer `mr_distritos_manuales`**

```python
mr_manuales_str = body.get('mr_distritos_manuales')

if mr_manuales_str:
    # Parsear el JSON string
    mr_manuales = json.loads(mr_manuales_str)
    # Resultado: {"MORENA": 152, "PAN": 84, "MC": 42, ...}
```

---

### **2. NO calcular MR, usar los del frontend**

```python
# ❌ MAL: Calcular MR desde cero
mr_seats = calcular_mr_desde_votos(votos, distritos)

# ✅ BIEN: Usar MR que vienen del frontend
mr_seats = mr_manuales  # {"MORENA": 152, "PAN": 84, ...}
```

---

### **3. Calcular RP proporcional a votos**

```python
def calcular_rp_con_mr_fijo(votos, mr_fijos, aplicar_topes, camara):
    """
    Calcula RP cuando los MR ya están dados manualmente.
    """
    # 1. Definir RP totales disponibles
    rp_totales = 200 if camara == "diputados" else 32
    total_votos = sum(votos.values())
    
    # 2. Asignar RP proporcionalmente a votos
    rp_asignados = {}
    for partido, votos_partido in votos.items():
        proporcion = votos_partido / total_votos
        rp_asignados[partido] = round(rp_totales * proporcion)
    
    # 3. Ajustar residuo de redondeo
    diferencia = rp_totales - sum(rp_asignados.values())
    if diferencia != 0:
        partido_mayor = max(votos, key=votos.get)
        rp_asignados[partido_mayor] += diferencia
    
    # 4. Aplicar topes si corresponde
    resultados = {}
    if aplicar_topes:
        total_escanos = sum(mr_fijos.values()) + rp_totales
        max_escanos = math.floor(total_escanos * 0.6)  # 60%
        
        for partido in votos.keys():
            mr = mr_fijos.get(partido, 0)
            rp = rp_asignados.get(partido, 0)
            total = mr + rp
            
            if total > max_escanos:
                # Reducir RP para cumplir tope
                rp_final = max(0, max_escanos - mr)
            else:
                rp_final = rp
            
            resultados[partido] = {
                'mr': mr,
                'rp': rp_final,
                'total': mr + rp_final
            }
    else:
        for partido in votos.keys():
            mr = mr_fijos.get(partido, 0)
            rp = rp_asignados.get(partido, 0)
            resultados[partido] = {
                'mr': mr,
                'rp': rp,
                'total': mr + rp
            }
    
    return resultados
```

---

### **4. Construir `seat_chart`**

```python
def construir_seat_chart(resultados, votos):
    seat_chart = []
    total_votos = sum(votos.values())
    
    for partido, datos in resultados.items():
        seat_chart.append({
            "party": partido,
            "seats": datos['total'],
            "mr_seats": datos['mr'],
            "rp_seats": datos['rp'],
            "pm_seats": datos.get('pm', 0),
            "votes_percent": round((votos[partido] / total_votos) * 100, 2),
            "color": PARTY_COLORS.get(partido, "#CCCCCC")
        })
    
    return seat_chart
```

---

### **5. Calcular KPIs**

```python
def calcular_kpis(resultados, votos):
    total_escanos = sum(r['total'] for r in resultados.values())
    total_votos = sum(votos.values())
    
    # Índice de Gallagher
    gallagher_sum = 0
    for partido, datos in resultados.items():
        pct_votos = (votos[partido] / total_votos) * 100
        pct_escanos = (datos['total'] / total_escanos) * 100
        gallagher_sum += (pct_escanos - pct_votos) ** 2
    
    gallagher = math.sqrt(gallagher_sum / 2)
    
    return {
        "total_escanos": total_escanos,
        "gallagher": round(gallagher, 2),
        "total_votos": total_votos
    }
```

---

### **6. Devolver respuesta COMPLETA**

```python
@app.post("/procesar/{camara}")
async def procesar(camara: str, body: dict):
    anio = body.get('anio')
    plan = body.get('plan')
    aplicar_topes = body.get('aplicar_topes', False)
    mr_manuales_str = body.get('mr_distritos_manuales')
    mr_por_estado_str = body.get('mr_por_estado')
    
    # Obtener votos reales
    votos = obtener_votos_historicos(anio, camara)
    
    if mr_manuales_str:
        # Modo manual: usar MR del frontend
        mr_manuales = json.loads(mr_manuales_str)
        resultados = calcular_rp_con_mr_fijo(votos, mr_manuales, aplicar_topes, camara)
    else:
        # Modo automático: calcular todo desde cero
        resultados = calcular_sistema_completo(votos, plan, aplicar_topes, camara)
    
    # Construir respuesta
    seat_chart = construir_seat_chart(resultados, votos)
    kpis = calcular_kpis(resultados, votos)
    
    # Opcional: Incluir desglose por estado en meta
    meta = {}
    if mr_por_estado_str:
        meta['mr_por_estado'] = json.loads(mr_por_estado_str)
    
    return {
        "seat_chart": seat_chart,  # ← CRÍTICO
        "kpis": kpis,              # ← CRÍTICO
        "meta": meta
    }
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### **Paso 1: Modificar endpoint `/procesar/{camara}`**
- [ ] Leer `mr_distritos_manuales` del body
- [ ] Parsear JSON string a diccionario
- [ ] Si existe, usar esos MR como fijos (NO calcular)

### **Paso 2: Implementar `calcular_rp_con_mr_fijo()`**
- [ ] Asignar RP proporcional a votos
- [ ] Aplicar topes si `aplicar_topes=true`
- [ ] Redistribuir RP de partidos que exceden tope

### **Paso 3: Construir respuesta completa**
- [ ] `seat_chart` con todos los partidos
- [ ] `kpis` con Gallagher, totales, etc.
- [ ] `meta` opcional con desglose por estado

### **Paso 4: Probar**
- [ ] Test con sliders (solo `mr_distritos_manuales`)
- [ ] Test con flechitas (con `mr_por_estado` también)
- [ ] Verificar que totales coincidan
- [ ] Verificar que topes funcionen correctamente

---

## 🧪 EJEMPLO DE RESPUESTA ESPERADA

```json
{
  "seat_chart": [
    {
      "party": "MORENA",
      "seats": 234,
      "mr_seats": 152,
      "rp_seats": 82,
      "pm_seats": 0,
      "votes_percent": 42.3,
      "color": "#941B1E"
    },
    {
      "party": "PAN",
      "seats": 98,
      "mr_seats": 84,
      "rp_seats": 14,
      "pm_seats": 0,
      "votes_percent": 18.5,
      "color": "#0059B3"
    }
    // ... resto de partidos
  ],
  "kpis": {
    "total_escanos": 500,
    "gallagher": 9.23,
    "total_votos": 56789012
  },
  "meta": {
    "mr_por_estado": {
      "Jalisco": {"MORENA": 11, "PAN": 7, "MC": 2, ...},
      "CDMX": {"MORENA": 20, "PAN": 3, "MC": 1, ...},
      ...
    }
  }
}
```

---

## 📞 DUDAS FRECUENTES

### **Q: ¿Necesito crear un endpoint nuevo?**
**A:** NO. Usa el mismo `/procesar/{camara}` que ya existe. Solo agrégale lógica para leer `mr_distritos_manuales`.

### **Q: ¿Qué hago con `mr_por_estado`?**
**A:** OPCIONAL. Puedes:
1. Ignorarlo (solo usar totales)
2. Validar que sume correctamente
3. Incluirlo en la respuesta para que el frontend lo vuelva a recibir

### **Q: ¿Cómo redistribuyo RP cuando un partido excede el tope?**
**A:** Si MORENA tiene 152 MR + 95 RP = 247, pero el tope es 60% (300), entonces MORENA se queda con 152 MR + 95 RP = 247 (no excede, OK). Si fuera 152 MR + 150 RP = 302, le quitas RP: 300 - 152 = 148 RP máximo. Los 2 RP que le quitaste se redistribuyen proporcionalmente entre otros partidos.

### **Q: ¿El frontend está listo?**
**A:** SÍ, 100% implementado. Solo falta que el backend procese los datos.

---

## 🚀 PRÓXIMOS PASOS

1. **Implementar lógica de MR manual** en `/procesar/{camara}`
2. **Probar con Postman/curl** enviando `mr_distritos_manuales`
3. **Verificar respuesta** incluya `seat_chart` + `kpis`
4. **Desplegar a Render**
5. **¡Funcionalidad completa! 🎉**

---

## 📄 DOCUMENTOS RELACIONADOS

- **Frontend implementación:** `FRONTEND_FLECHITAS_IMPLEMENTADO.md`
- **Especificación completa:** `BACKEND_AJUSTE_DISTRITOS_INDIVIDUALES.md`
- **Backend mayorías:** `BACKEND_MAYORIAS_DEBE_RECALCULAR_TODO.md`
