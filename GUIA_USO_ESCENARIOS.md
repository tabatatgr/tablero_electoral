# 📖 Guía de Uso - Escenarios Predeterminados

## 🎯 Introducción

Esta guía te ayudará a entender cuándo y cómo usar cada escenario predeterminado del simulador electoral.

---

## 🗳️ Escenarios para DIPUTADOS

### 1. ⚖️ **Sistema Vigente**

**¿Qué es?**
El sistema electoral actual de México para Diputados (300 MR + 200 RP = 500 escaños).

**Ejemplo de uso:**
```
Caso: Quieres analizar las elecciones de 2024 tal como fueron

Pasos:
1. Seleccionar Cámara: Diputados
2. Seleccionar Año: 2024
3. Seleccionar Escenario: ⚖️ Sistema Vigente
4. Ver resultados reales con tope del 60% (300 escaños)
```

**Resultado esperado:**
- MORENA + aliados: ~300 escaños (tope aplicado)
- Oposición distribuida proporcionalmente en los restantes
- Gallagher Index: ~8-12 (sobrerrepresentación moderada)

---

### 2. 📊 **Plan A - Solo RP (300 escaños)**

**¿Qué es?**
Sistema 100% proporcional sin distritos uninominales.

**Ejemplo de uso:**
```
Caso: Ver qué pasaría si México fuera como Alemania o Países Bajos

Pasos:
1. Seleccionar Cámara: Diputados
2. Seleccionar Año: 2024
3. Seleccionar Escenario: 📊 Plan A - Solo RP (300)
4. Comparar con Sistema Vigente
```

**Resultado esperado:**
- Distribución casi perfectamente proporcional
- MORENA: ~105 escaños (35% votos → 35% escaños)
- PAN: ~66 escaños (22% votos → 22% escaños)
- Gallagher Index: <3 (muy proporcional)
- Sin ventaja territorial

---

### 3. 🗳️ **Plan C - Solo MR (300 escaños)**

**¿Qué es?**
Sistema 100% mayoritario estilo Reino Unido.

**Ejemplo de uso:**
```
Caso: Ver qué pasaría con un sistema tipo Westminster

Pasos:
1. Seleccionar Cámara: Diputados
2. Seleccionar Año: 2024
3. Seleccionar Escenario: 🗳️ Plan C - Solo MR (300)
4. Ver mayoría amplificada
```

**Resultado esperado:**
- MORENA gana la mayoría de distritos
- MORENA: ~180-220 escaños (60-73%)
- Oposición muy reducida en escaños
- Gallagher Index: >20 (muy desproporcional)
- ⚠️ **Flechitas NO funcionan** (no hay RP para ajustar)

---

### 4. 🆕 **300-100 con Topes**

**¿Qué es?**
Reduce la cámara a 400 escaños (300 MR + 100 RP) con tope del 60%.

**Ejemplo de uso:**
```
Caso: Propuesta de reducción de la cámara con controles

Pasos:
1. Seleccionar Cámara: Diputados
2. Seleccionar Año: 2024
3. Seleccionar Escenario: 🆕 300-100 con Topes
4. Ver distribución en cámara reducida
```

**Resultado esperado:**
- Total: 400 escaños (ahorro de 100 plazas)
- MORENA + aliados: máximo 240 escaños (60% tope)
- Distribución similar a vigente pero comprimida
- Gallagher Index: ~10-14

**Ventajas:**
- ✅ Reduce costos (menos diputados)
- ✅ Mantiene tope de 60%
- ✅ Conserva balance MR/RP (3:1)

---

### 5. 🆕 **300-100 sin Topes**

**¿Qué es?**
Igual que el anterior PERO sin límite de escaños por partido.

**Ejemplo de uso:**
```
Caso: Ver el impacto de quitar el tope del 60%

Pasos:
1. Seleccionar Cámara: Diputados
2. Seleccionar Año: 2024
3. Seleccionar Escenario: 🆕 300-100 sin Topes
4. Comparar con "300-100 con Topes"
```

**Resultado esperado:**
- Total: 400 escaños
- MORENA + aliados: ~260-280 escaños (65-70%)
- Mayor concentración de poder
- Gallagher Index: >15

**Diferencia con "con Topes":**
```
CON TOPES:    MORENA = 240 escaños (tope aplicado)
SIN TOPES:    MORENA = 270 escaños (sin restricción)
              ↑ +30 escaños de diferencia
```

**Cuándo usar:**
- Análisis académico de sobrerrepresentación
- Comparar impacto del tope constitucional
- Estudios de concentración del poder

---

### 6. ⚖️ **200-200 Balanceado**

**¿Qué es?**
Sistema perfectamente equilibrado: 50% MR + 50% RP.

**Ejemplo de uso:**
```
Caso: Propuesta de reforma más balanceada

Pasos:
1. Seleccionar Cámara: Diputados
2. Seleccionar Año: 2024
3. Seleccionar Escenario: ⚖️ 200-200 Balanceado
4. Ver equilibrio entre territorial y proporcional
```

**Resultado esperado:**
- Total: 400 escaños
- 200 MR (territorial) + 200 RP (proporcional)
- Balance 50-50 entre ambos principios
- Gallagher Index: ~8-10

**Ventajas:**
- ✅ Equilibrio perfecto entre MR y RP
- ✅ Reduce cámara a 400
- ✅ Mayor proporcionalidad que vigente
- ✅ Mantiene representación territorial

**Comparación con Vigente:**
```
VIGENTE:      300 MR (60%) + 200 RP (40%) = 500
BALANCEADO:   200 MR (50%) + 200 RP (50%) = 400
              ↓ Más proporcional y más compacto
```

---

### 7. ⚙️ **Personalizado**

**¿Qué es?**
Control total sobre todos los parámetros.

**Ejemplo de uso:**
```
Caso: Quieres simular un sistema único

Pasos:
1. Seleccionar Cámara: Diputados
2. Seleccionar Escenario: ⚙️ Personalizado
3. Configurar manualmente:
   - Total escaños: 450
   - MR: 250
   - RP: 180
   - PM: 20
   - Umbral: 5%
   - Tope: 270 (60%)
4. Calcular
```

**Parámetros configurables:**
- **Escaños totales:** 1-700
- **MR seats:** Mayoría Relativa
- **RP seats:** Representación Proporcional  
- **PM seats:** Primera Minoría
- **Umbral:** 0-20%
- **Tope:** 0-700 escaños
- **Método de reparto:** Hare, D'Hondt, etc.

---

## 🏛️ Escenarios para SENADO

### 1. ⚖️ **Sistema Vigente**

**¿Qué es?**
Sistema actual: 64 MR + 32 PM + 32 RP = 128 senadores.

**Ejemplo de uso:**
```
Caso: Analizar distribución real del Senado 2024

Pasos:
1. Seleccionar Cámara: Senadores
2. Seleccionar Año: 2024
3. Seleccionar Escenario: ⚖️ Sistema Vigente
4. Ver 2 senadores por estado (MR) + 1 primera minoría + 32 lista nacional
```

**Resultado esperado:**
- 32 estados × 3 senadores = 96 directos (64 MR + 32 PM)
- 32 lista nacional (RP)
- Total: 128 senadores

---

### 2. 📊 **Plan A - Solo RP (96 senadores)**

**¿Qué es?**
Sistema 100% proporcional para Senado.

**Ejemplo de uso:**
```
Caso: Ver Senado totalmente proporcional

Pasos:
1. Seleccionar Cámara: Senadores
2. Seleccionar Año: 2024
3. Seleccionar Escenario: 📊 Plan A - Solo RP
4. Ver distribución perfectamente proporcional a votos
```

**Resultado esperado:**
- Total: 96 senadores (reducción de 32)
- 100% lista nacional
- Sin representación territorial directa
- Muy proporcional

---

### 3. 🗳️ **Plan C - Solo MR+PM (64 senadores)**

**¿Qué es?**
Sistema solo territorial: 1 MR + 1 PM por estado.

**Ejemplo de uso:**
```
Caso: Ver Senado puramente territorial

Pasos:
1. Seleccionar Cámara: Senadores
2. Seleccionar Año: 2024
3. Seleccionar Escenario: 🗳️ Plan C - Solo MR+PM
4. Ver 2 senadores por estado (ganador + segundo lugar)
```

**Resultado esperado:**
- Total: 64 senadores
- 32 MR + 32 PM
- Sin lista nacional
- 100% territorial

---

## 🎓 Casos de Uso Avanzados

### **Caso 1: Comparar Proporcionalidad**

**Objetivo:** Ver qué escenario es más proporcional

```
Pasos:
1. Cargar Sistema Vigente → Anotar Gallagher Index
2. Cargar Plan A → Anotar Gallagher Index
3. Cargar 200-200 → Anotar Gallagher Index

Resultado esperado:
- Plan A: < 3 (MÁS proporcional)
- 200-200: ~ 8-10
- Vigente: ~ 10-12
- Plan C: > 20 (MENOS proporcional)
```

---

### **Caso 2: Micro-ajustes con Flechitas**

**Objetivo:** Ajustar distribución geográfica manualmente

```
Pasos:
1. Seleccionar escenario: 300-100 con Topes
2. Expandir "Distribución MR por Estado"
3. Usar flechitas ↑↓ para ajustar:
   - Jalisco: +2 MORENA, -2 PAN
   - CDMX: +1 MC, -1 MORENA
4. Ver cómo cambia RP para compensar
```

**Escenarios compatibles con flechitas:**
- ✅ Vigente
- ✅ 300-100 (ambos)
- ✅ 200-200
- ✅ Personalizado (si tiene MR)
- ❌ Plan A (sin MR)
- ❌ Plan C (sin RP para compensar)

---

### **Caso 3: Evaluar Propuesta de Reforma**

**Objetivo:** Justificar reducción de la cámara

```
Escenario propuesto: Reducir a 400 con topes

Análisis:
1. Vigente (baseline):
   - 500 escaños
   - Tope 60%
   - Costo: $$$$$

2. 300-100 con Topes (propuesta):
   - 400 escaños (-20%)
   - Tope 60% (mismo)
   - Costo: $$$$ (ahorro)
   
3. Resultados:
   ✅ Ahorra 100 plazas
   ✅ Mantiene mismo tope
   ✅ Distribución similar
   ⚠️ Ligeramente menos proporcional
```

---

## 🔧 Tips y Trucos

### **Tip 1: Usa hints para recordar**
El hint debajo del selector te recuerda la composición:
```
"300 MR + 100 RP = 400 (tope 300 escaños)"
```

### **Tip 2: Combina con sliders**
Puedes ajustar porcentajes de votos en cualquier escenario predeterminado cambiando a "Personalizado" después.

### **Tip 3: Compara visualmente**
Abre dos pestañas del dashboard para comparar escenarios lado a lado.

### **Tip 4: Revisa los KPIs**
El Índice de Gallagher te dice qué tan proporcional es:
- **0-5:** Muy proporcional
- **5-10:** Proporcional moderado
- **10-15:** Moderadamente desproporcional
- **15+:** Muy desproporcional

---

## ⚠️ Advertencias Importantes

### **Flechitas en Plan A**
```
❌ Las flechitas NO funcionan en Plan A
Razón: No hay MR para ajustar (es 100% RP)
```

### **Flechitas en Plan C**
```
⚠️ Las flechitas funcionan PERO sin compensación RP
Razón: No hay RP para redistribuir
Efecto: Cambios en MR no se compensan
```

### **Topes en escenarios "sin topes"**
```
⚠️ El tope está DESACTIVADO
Resultado: Partidos grandes pueden ganar >60%
Uso: Solo para análisis académico
```

---

## 📊 Tabla de Decisión Rápida

**¿Qué escenario usar según tu objetivo?**

| Objetivo | Escenario Recomendado |
|----------|----------------------|
| Analizar elecciones reales | ⚖️ Sistema Vigente |
| Ver máxima proporcionalidad | 📊 Plan A |
| Ver mayoría amplificada | 🗳️ Plan C |
| Proponer reducción con controles | 🆕 300-100 con Topes |
| Estudiar concentración del poder | 🆕 300-100 sin Topes |
| Proponer sistema balanceado | ⚖️ 200-200 Balanceado |
| Experimento personalizado | ⚙️ Personalizado |

---

## 🎯 Ejemplos Prácticos Paso a Paso

### **Ejemplo 1: "¿Qué pasaría sin el tope del 60%?"**

```
Paso 1: Cargar Sistema Vigente
→ MORENA: 300 escaños (60% - TOPE APLICADO)
→ Anotar distribución

Paso 2: Cargar 300-100 sin Topes
→ MORENA: ~270 escaños (67%)
→ Comparar

Conclusión:
El tope evita ~30 escaños de concentración
en el partido mayoritario.
```

---

### **Ejemplo 2: "¿Cuánto más proporcional sería con 50-50?"**

```
Paso 1: Cargar Sistema Vigente
→ Gallagher Index: ~11.5
→ MORENA ventaja: +10% escaños vs votos

Paso 2: Cargar 200-200 Balanceado
→ Gallagher Index: ~8.2
→ MORENA ventaja: +6% escaños vs votos

Conclusión:
Sistema 50-50 reduce sobrerrepresentación
en ~3-4 puntos del Gallagher Index.
```

---

### **Ejemplo 3: "¿Cómo afecta el tamaño de la cámara?"**

```
Vigente:       500 escaños → Gallagher ~11
300-100:       400 escaños → Gallagher ~12
Plan A:        300 escaños → Gallagher ~2

Conclusión:
Tamaño no afecta mucho la proporcionalidad.
Lo que importa es la proporción MR/RP.
```

---

## 📚 Recursos Adicionales

- **Índice de Gallagher:** Mide desproporcionalidad (0=perfecto, 20+=muy desproporcional)
- **Sobrerrepresentación:** % escaños - % votos
- **Tope 60%:** Límite constitucional mexicano
- **Umbral 3%:** Mínimo de votos para entrar

---

## ✅ Resumen Final

**Recuerda:**
1. Cada escenario tiene un propósito específico
2. Los hints te guían sobre qué hace cada uno
3. Usa flechitas para micro-ajustes (excepto Plan A)
4. Compara Gallagher Index para medir proporcionalidad
5. "sin Topes" es solo para análisis, no propuesta real

**¡Experimenta y descubre!** 🚀
