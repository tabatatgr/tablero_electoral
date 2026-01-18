# 🔧 INSTRUCCIONES ESPECÍFICAS PARA DESARROLLADOR BACKEND

## 🎯 Objetivo

Modificar el endpoint `/calcular/mayoria_forzada` para que devuelva el **sistema completo recalculado**, no solo los datos del partido objetivo.

---

## 📝 Cambios Requeridos

### 1. ✅ Firma del Endpoint (YA IMPLEMENTADO)

```python
@app.get("/calcular/mayoria_forzada")
async def calcular_mayoria_forzada(
    partido: str,
    tipo_mayoria: str,  # "simple" o "calificada"
    plan: str,
    aplicar_topes: bool,
    anio: int,
    # Parámetros personalizados (opcionales)
    escanos_totales: Optional[int] = None,
    mr_seats: Optional[int] = None,
    rp_seats: Optional[int] = None,
    sistema: Optional[str] = None
):
```

### 2. ⏳ Lógica del Endpoint (PENDIENTE)

```python
@app.get("/calcular/mayoria_forzada")
async def calcular_mayoria_forzada(...):
    try:
        # PASO 1: Determinar configuración
        if escanos_totales and mr_seats and rp_seats and sistema:
            # Configuración personalizada
            config = {
                'total': escanos_totales,
                'mr': mr_seats,
                'rp': rp_seats,
                'sistema': sistema
            }
        else:
            # Configuración del plan
            config = obtener_config_plan(plan, anio)
        
        # PASO 2: Determinar umbral de mayoría
        if tipo_mayoria == "simple":
            umbral = math.ceil(config['total'] / 2)
        elif tipo_mayoria == "calificada":
            umbral = math.ceil(config['total'] * 2/3)
        else:
            raise ValueError(f"tipo_mayoria inválido: {tipo_mayoria}")
        
        # PASO 3: Verificar si es posible con topes
        if aplicar_topes:
            max_posible = math.floor(config['total'] * 0.6)  # 60% del total
            
            if umbral > max_posible:
                return {
                    "success": False,
                    "viable": False,
                    "mensaje": f"Mayoría {tipo_mayoria} imposible con topes del 60%",
                    "umbral_mayorias": umbral,
                    "max_posible": max_posible,
                    "diputados_obtenidos": 0,
                    "porcentaje_necesario": None
                }
        
        # PASO 4: Obtener votos originales
        votos_originales = obtener_votos_por_anio(anio)
        
        # PASO 5: Buscar porcentaje necesario (búsqueda binaria)
        porcentaje_necesario = buscar_porcentaje_necesario(
            partido_objetivo=partido,
            umbral=umbral,
            votos_originales=votos_originales,
            config=config,
            aplicar_topes=aplicar_topes
        )
        
        # PASO 6: Redistribuir votos
        votos_ajustados = redistribuir_votos(
            partido_objetivo=partido,
            porcentaje_necesario=porcentaje_necesario,
            votos_originales=votos_originales
        )
        
        # PASO 7: Calcular sistema completo
        resultados = calcular_sistema_electoral(
            votos=votos_ajustados,
            mr_seats=config['mr'],
            rp_seats=config['rp'],
            aplicar_topes=aplicar_topes,
            sistema=config['sistema']
        )
        
        # PASO 8: Construir seat_chart
        seat_chart = construir_seat_chart(resultados, votos_ajustados)
        
        # PASO 9: Calcular KPIs
        kpis = calcular_kpis(resultados, votos_ajustados, config)
        
        # PASO 10: Preparar respuesta
        return {
            "success": True,
            "viable": True,
            "umbral_mayorias": umbral,
            "diputados_obtenidos": resultados[partido]['total'],
            "porcentaje_necesario": porcentaje_necesario,
            "mr_asignados": resultados[partido]['mr'],
            "rp_asignados": resultados[partido]['rp'],
            "seat_chart": seat_chart,  # ← CRÍTICO
            "kpis": kpis                # ← CRÍTICO
        }
        
    except Exception as e:
        logger.error(f"Error en calcular_mayoria_forzada: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
```

---

## 🔍 Funciones Auxiliares Necesarias

### 1. Búsqueda de Porcentaje Necesario

```python
def buscar_porcentaje_necesario(
    partido_objetivo: str,
    umbral: int,
    votos_originales: Dict[str, int],
    config: Dict,
    aplicar_topes: bool
) -> float:
    """
    Búsqueda binaria para encontrar el % de votos necesario.
    
    Returns:
        float: Porcentaje de votos necesario (0-100)
    """
    porcentaje_min = 0.0
    porcentaje_max = 100.0
    tolerancia = 0.01
    max_iteraciones = 100
    iteracion = 0
    
    while (porcentaje_max - porcentaje_min > tolerancia) and (iteracion < max_iteraciones):
        iteracion += 1
        porcentaje_prueba = (porcentaje_min + porcentaje_max) / 2
        
        # Redistribuir votos con este porcentaje
        votos_ajustados = redistribuir_votos(
            partido_objetivo,
            porcentaje_prueba,
            votos_originales
        )
        
        # Calcular escaños con estos votos
        resultados = calcular_sistema_electoral(
            votos=votos_ajustados,
            mr_seats=config['mr'],
            rp_seats=config['rp'],
            aplicar_topes=aplicar_topes,
            sistema=config['sistema']
        )
        
        escanos_obtenidos = resultados[partido_objetivo]['total']
        
        if escanos_obtenidos < umbral:
            # Necesita más votos
            porcentaje_min = porcentaje_prueba
        else:
            # Tiene suficientes votos (o más)
            porcentaje_max = porcentaje_prueba
    
    return porcentaje_max
```

### 2. Redistribución de Votos

```python
def redistribuir_votos(
    partido_objetivo: str,
    porcentaje_necesario: float,
    votos_originales: Dict[str, int]
) -> Dict[str, int]:
    """
    Ajusta votos del partido objetivo y redistribuye proporcionalmente.
    
    Args:
        partido_objetivo: Partido que obtiene mayoría
        porcentaje_necesario: % de votos que necesita (0-100)
        votos_originales: Votos históricos por partido
    
    Returns:
        Dict con votos ajustados por partido
    """
    total_votos = sum(votos_originales.values())
    votos_ajustados = {}
    
    # Asignar votos al partido objetivo
    votos_ajustados[partido_objetivo] = int(total_votos * (porcentaje_necesario / 100))
    
    # Calcular votos restantes
    votos_restantes = total_votos - votos_ajustados[partido_objetivo]
    
    # Sumar votos originales de otros partidos
    suma_otros = sum(v for p, v in votos_originales.items() 
                     if p != partido_objetivo)
    
    if suma_otros == 0:
        # Caso especial: solo hay un partido
        return votos_ajustados
    
    # Redistribuir proporcionalmente
    for partido, votos_orig in votos_originales.items():
        if partido != partido_objetivo:
            proporcion = votos_orig / suma_otros
            votos_ajustados[partido] = int(votos_restantes * proporcion)
    
    return votos_ajustados
```

### 3. Construcción de seat_chart

```python
def construir_seat_chart(
    resultados: Dict[str, Dict],
    votos: Dict[str, int]
) -> List[Dict]:
    """
    Construye el array seat_chart con todos los partidos.
    
    Args:
        resultados: Dict con escaños por partido {partido: {total, mr, rp, pm}}
        votos: Dict con votos por partido
    
    Returns:
        Lista de diccionarios con datos de cada partido
    """
    total_votos = sum(votos.values())
    seat_chart = []
    
    for partido in resultados.keys():
        seat_chart.append({
            "party": partido,
            "seats": resultados[partido]['total'],
            "mr": resultados[partido].get('mr', 0),
            "rp": resultados[partido].get('rp', 0),
            "pm": resultados[partido].get('pm', 0),
            "votes": votos.get(partido, 0),
            "percent": round((votos.get(partido, 0) / total_votos) * 100, 2),
            "color": COLORES_PARTIDOS.get(partido, "#808080")
        })
    
    # Ordenar por escaños descendente
    seat_chart.sort(key=lambda x: x['seats'], reverse=True)
    
    return seat_chart
```

### 4. Cálculo de KPIs

```python
def calcular_kpis(
    resultados: Dict[str, Dict],
    votos: Dict[str, int],
    config: Dict
) -> Dict:
    """
    Calcula KPIs del sistema electoral.
    
    Returns:
        Dict con total_votos, total_escanos, gallagher, ratio_promedio
    """
    total_votos = sum(votos.values())
    total_escanos = sum(r['total'] for r in resultados.values())
    
    # Índice de Gallagher
    gallagher = calcular_indice_gallagher(resultados, votos, total_votos, total_escanos)
    
    # Ratio promedio
    ratios = []
    for partido in resultados.keys():
        if votos[partido] > 0:
            porcentaje_votos = (votos[partido] / total_votos) * 100
            porcentaje_escanos = (resultados[partido]['total'] / total_escanos) * 100
            ratio = porcentaje_escanos / porcentaje_votos if porcentaje_votos > 0 else 0
            ratios.append(ratio)
    
    ratio_promedio = sum(ratios) / len(ratios) if ratios else 0
    
    return {
        "total_votos": total_votos,
        "total_escanos": total_escanos,
        "gallagher": round(gallagher, 2),
        "ratio_promedio": round(ratio_promedio, 4)
    }
```

### 5. Índice de Gallagher

```python
def calcular_indice_gallagher(
    resultados: Dict[str, Dict],
    votos: Dict[str, int],
    total_votos: int,
    total_escanos: int
) -> float:
    """
    Calcula el índice de Gallagher (desproporcionalidad).
    
    Formula: sqrt(0.5 * sum((Vi - Si)^2))
    Donde Vi = % votos, Si = % escaños
    """
    suma_cuadrados = 0.0
    
    for partido in resultados.keys():
        porcentaje_votos = (votos[partido] / total_votos) * 100
        porcentaje_escanos = (resultados[partido]['total'] / total_escanos) * 100
        diferencia = porcentaje_votos - porcentaje_escanos
        suma_cuadrados += diferencia ** 2
    
    gallagher = math.sqrt(0.5 * suma_cuadrados)
    
    return gallagher
```

---

## 🧪 Ejemplo de Flujo Completo

### Input:
```
GET /calcular/mayoria_forzada?
    partido=MORENA&
    tipo_mayoria=simple&
    plan=personalizado&
    aplicar_topes=true&
    anio=2024&
    escanos_totales=128&
    mr_seats=64&
    rp_seats=64&
    sistema=mixto
```

### Procesamiento:

1. **Config detectada:**
   ```python
   config = {
       'total': 128,
       'mr': 64,
       'rp': 64,
       'sistema': 'mixto'
   }
   ```

2. **Umbral calculado:**
   ```python
   umbral = math.ceil(128 / 2) = 65
   ```

3. **Votos originales (2024):**
   ```python
   votos_originales = {
       'MORENA': 21630000,
       'PAN': 8746050,
       'PRI': 7288950,
       'PVEM': 3644475,
       'PT': 1457790,
       'MC': 728895
   }
   # Total: ~43.5M votos
   ```

4. **Búsqueda binaria encuentra:**
   ```python
   porcentaje_necesario = 55.0  # MORENA necesita 55% de votos
   ```

5. **Redistribución:**
   ```python
   votos_ajustados = {
       'MORENA': 23927500,  # 55% del total
       'PAN': 7612500,      # Redistribuido proporcionalmente
       'PRI': 6343750,      # Redistribuido proporcionalmente
       'PVEM': 3171875,     # Redistribuido proporcionalmente
       'PT': 1268750,       # Redistribuido proporcionalmente
       'MC': 634375         # Redistribuido proporcionalmente
   }
   ```

6. **Cálculo de escaños:**
   ```python
   resultados = {
       'MORENA': {'total': 68, 'mr': 32, 'rp': 36, 'pm': 0},
       'PAN': {'total': 23, 'mr': 13, 'rp': 10, 'pm': 0},
       'PRI': {'total': 18, 'mr': 9, 'rp': 9, 'pm': 0},
       'PVEM': {'total': 10, 'mr': 5, 'rp': 5, 'pm': 0},
       'PT': {'total': 5, 'mr': 3, 'rp': 2, 'pm': 0},
       'MC': {'total': 4, 'mr': 2, 'rp': 2, 'pm': 0}
   }
   ```

7. **Output final:**
   ```json
   {
       "success": true,
       "viable": true,
       "umbral_mayorias": 65,
       "diputados_obtenidos": 68,
       "porcentaje_necesario": 55.0,
       "mr_asignados": 32,
       "rp_asignados": 36,
       "seat_chart": [
           { "party": "MORENA", "seats": 68, ... },
           { "party": "PAN", "seats": 23, ... },
           { "party": "PRI", "seats": 18, ... },
           { "party": "PVEM", "seats": 10, ... },
           { "party": "PT", "seats": 5, ... },
           { "party": "MC", "seats": 4, ... }
       ],
       "kpis": {
           "total_votos": 43958750,
           "total_escanos": 128,
           "gallagher": 2.74,
           "ratio_promedio": 0.8492
       }
   }
   ```

---

## ✅ Tests de Validación

### Test 1: Verificar búsqueda binaria
```python
def test_buscar_porcentaje():
    votos = {'MORENA': 1000, 'PAN': 800, 'PRI': 600}
    config = {'total': 100, 'mr': 50, 'rp': 50, 'sistema': 'mixto'}
    
    porcentaje = buscar_porcentaje_necesario(
        'MORENA', 
        51,  # Mayoría simple
        votos,
        config,
        aplicar_topes=False
    )
    
    # Verificar que MORENA alcanza 51+ escaños con este %
    assert porcentaje > 0
    assert porcentaje < 100
```

### Test 2: Verificar redistribución
```python
def test_redistribuir_votos():
    votos = {'MORENA': 1000, 'PAN': 800, 'PRI': 600}
    total_original = sum(votos.values())
    
    votos_ajustados = redistribuir_votos('MORENA', 60.0, votos)
    total_ajustado = sum(votos_ajustados.values())
    
    # Total debe mantenerse
    assert total_ajustado == total_original
    
    # MORENA debe tener 60%
    assert abs(votos_ajustados['MORENA'] / total_ajustado - 0.6) < 0.01
```

### Test 3: Verificar seat_chart completo
```python
def test_seat_chart_completo():
    response = calcular_mayoria_forzada(
        partido='MORENA',
        tipo_mayoria='simple',
        plan='personalizado',
        aplicar_topes=True,
        anio=2024,
        escanos_totales=128,
        mr_seats=64,
        rp_seats=64,
        sistema='mixto'
    )
    
    # Debe tener seat_chart
    assert 'seat_chart' in response
    assert isinstance(response['seat_chart'], list)
    assert len(response['seat_chart']) > 1  # Más de un partido
    
    # Verificar estructura de cada partido
    for partido_data in response['seat_chart']:
        assert 'party' in partido_data
        assert 'seats' in partido_data
        assert 'mr' in partido_data
        assert 'rp' in partido_data
        assert 'votes' in partido_data
        assert 'percent' in partido_data
        assert 'color' in partido_data
    
    # Suma de escaños debe ser 128
    total_seats = sum(p['seats'] for p in response['seat_chart'])
    assert total_seats == 128
```

---

## 📊 Logging Recomendado

```python
import logging

logger = logging.getLogger(__name__)

# En cada paso del proceso:
logger.info(f"[MAYORIAS] Config: {config}")
logger.info(f"[MAYORIAS] Umbral: {umbral}")
logger.info(f"[MAYORIAS] Porcentaje necesario: {porcentaje_necesario}%")
logger.info(f"[MAYORIAS] Votos ajustados: {votos_ajustados}")
logger.info(f"[MAYORIAS] Escaños calculados: {resultados}")
logger.info(f"[MAYORIAS] Seat chart generado con {len(seat_chart)} partidos")
```

---

## ⚠️ Casos Edge a Manejar

### 1. Mayoría imposible con topes
```python
if aplicar_topes and umbral > max_posible:
    return {"viable": False, "mensaje": "..."}
```

### 2. Porcentaje > 100%
```python
if porcentaje_necesario > 99.9:
    return {"viable": False, "mensaje": "Requiere más del 100% de votos"}
```

### 3. Solo un partido en votos
```python
if len(votos_originales) == 1:
    # Caso especial
    return {"viable": True, "porcentaje_necesario": 100.0, ...}
```

### 4. Escaños totales inválidos
```python
if escanos_totales != mr_seats + rp_seats:
    raise ValueError("escanos_totales debe ser mr_seats + rp_seats")
```

---

## 🎯 Checklist de Implementación

- [ ] Implementar `buscar_porcentaje_necesario()`
- [ ] Implementar `redistribuir_votos()`
- [ ] Implementar `construir_seat_chart()`
- [ ] Implementar `calcular_kpis()`
- [ ] Implementar `calcular_indice_gallagher()`
- [ ] Modificar endpoint principal
- [ ] Agregar logging
- [ ] Escribir tests unitarios
- [ ] Probar con plan vigente
- [ ] Probar con plan personalizado
- [ ] Probar casos edge (imposible, topes, etc.)
- [ ] Verificar que seat_chart tiene TODOS los partidos
- [ ] Verificar que KPIs se calculan correctamente

---

**Prioridad:** 🔥 ALTA  
**Estimación:** 4-6 horas de desarrollo + 2 horas de testing  
**Bloqueante para:** Feature de mayorías forzadas en frontend
