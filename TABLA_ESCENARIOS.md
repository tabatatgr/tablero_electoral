# 📊 TABLA COMPARATIVA - Todos los Escenarios

## DIPUTADOS

| Escenario | Código | Total | MR | RP | PM | Umbral | Tope | Gallagher* | Flechitas | Nuevo |
|-----------|--------|-------|----|----|----| -------|------|-----------|-----------|-------|
| ⚖️ **Sistema Vigente** | `vigente` | 500 | 300 | 200 | 0 | 3% | 300 | ~11 | ✅ | - |
| 📊 **Plan A - Solo RP** | `plan_a` | 300 | 0 | 300 | 0 | 3% | ❌ | ~2 | ❌ | - |
| 🗳️ **Plan C - Solo MR** | `plan_c` | 300 | 300 | 0 | 0 | 0% | ❌ | ~22 | ⚠️ | - |
| 🆕 **300-100 con Topes** | `300_100_con_topes` | 400 | 300 | 100 | 0 | 3% | 300 | ~12 | ✅ | 🆕 |
| 🆕 **300-100 sin Topes** | `300_100_sin_topes` | 400 | 300 | 100 | 0 | 3% | ❌ | ~15 | ✅ | 🆕 |
| ⚖️ **200-200 Balanceado** | `200_200_sin_topes` | 400 | 200 | 200 | 0 | 3% | ❌ | ~8 | ✅ | 🆕 |
| ⚙️ **Personalizado** | `personalizado` | ⚙️ | ⚙️ | ⚙️ | ⚙️ | ⚙️ | ⚙️ | ⚙️ | ✅ | - |

*Gallagher Index estimado para elecciones 2024

---

## SENADO

| Escenario | Código | Total | MR | RP | PM | Umbral | Tope | Gallagher* | Flechitas |
|-----------|--------|-------|----|----|----| -------|------|-----------|-----------|
| ⚖️ **Sistema Vigente** | `vigente` | 128 | 64 | 32 | 32 | 3% | ❌ | ~9 | ✅ |
| 📊 **Plan A - Solo RP** | `plan_a` | 96 | 0 | 96 | 0 | 3% | ❌ | ~2 | ❌ |
| 🗳️ **Plan C - Solo MR+PM** | `plan_c` | 64 | 32 | 0 | 32 | 0% | ❌ | ~18 | ⚠️ |
| ⚙️ **Personalizado** | `personalizado` | ⚙️ | ⚙️ | ⚙️ | ⚙️ | ⚙️ | ⚙️ | ⚙️ | ✅ |

---

## LEYENDA

### Símbolos
- ✅ = Funciona completamente
- ❌ = No disponible / No aplica
- ⚠️ = Funciona con limitaciones
- ⚙️ = Configurable por usuario
- 🆕 = Nuevo escenario agregado

### Columnas
- **Código:** ID que se envía al backend
- **Total:** Total de escaños en la cámara
- **MR:** Mayoría Relativa (distritos uninominales)
- **RP:** Representación Proporcional (lista nacional)
- **PM:** Primera Minoría (segundo lugar por estado)
- **Umbral:** Mínimo de votos para entrar (%)
- **Tope:** Máximo de escaños por partido
- **Gallagher:** Índice de desproporcionalidad (menor = más proporcional)
- **Flechitas:** Compatibilidad con micro-ajustes geográficos

### Flechitas
- **✅ Funciona:** Permite ajustar MR por estado, RP compensa
- **❌ No funciona:** No hay MR para ajustar (Plan A)
- **⚠️ Limitado:** Permite ajustar MR pero sin compensación RP (Plan C)

---

## PROPORCIONALIDAD (Gallagher Index)

```
0 ────────────── 5 ────────────── 10 ───────────── 15 ───────────── 20+
│                │                 │                │                 │
│   MUY          │   PROPORCIONAL  │   MODERADO     │  DESPROPORCIONAL│
│   PROPORCIONAL │                 │                │                 │
│                │                 │                │                 │
Plan A         200-200         Vigente      300-100 (sin)       Plan C
(~2)           (~8)            (~11)          (~15)            (~22)
```

---

## COMPARACIÓN POR CATEGORÍAS

### Por Tamaño de Cámara
```
700 ┤
600 ┤
500 ┼─── Vigente (500)
400 ┼─── 300-100 con/sin Topes, 200-200 (400)
300 ┼─── Plan A, Plan C (300)
200 ┤
100 ┤
  0 └────────────────────────────────
```

### Por Proporcionalidad (menor Gallagher = mejor)
```
Plan A              ▓ 2
200-200             ▓▓▓▓▓▓▓▓ 8
Vigente             ▓▓▓▓▓▓▓▓▓▓▓ 11
300-100 (con)       ▓▓▓▓▓▓▓▓▓▓▓▓ 12
300-100 (sin)       ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 15
Plan C              ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 22
```

### Por Balance MR/RP
```
100% MR    75% MR    60% MR    50% MR    0% MR
Plan C     300-100   Vigente   200-200   Plan A
(300/0)    (300/100) (300/200) (200/200) (0/300)
```

---

## CASOS DE USO RECOMENDADOS

| Si quieres... | Usa este escenario |
|---------------|-------------------|
| Analizar elecciones reales | ⚖️ Sistema Vigente |
| Máxima proporcionalidad | 📊 Plan A |
| Mayorías amplificadas | 🗳️ Plan C |
| Reducir cámara con control | 🆕 300-100 con Topes |
| Ver concentración natural | 🆕 300-100 sin Topes |
| Sistema más balanceado | ⚖️ 200-200 Balanceado |
| Crear escenario único | ⚙️ Personalizado |

---

## COMPATIBILIDAD CON HERRAMIENTAS

| Herramienta | Vigente | Plan A | Plan C | 300-100 (con) | 300-100 (sin) | 200-200 | Personalizado |
|-------------|---------|--------|--------|---------------|---------------|---------|---------------|
| **Sliders de Votos** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Flechitas MR** | ✅ | ❌ | ⚠️ | ✅ | ✅ | ✅ | ✅* |
| **MR Manual** | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅* |
| **Votos Custom** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Coaliciones** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

*Si tiene MR configurado

---

## PAYLOAD DE EJEMPLO

### Simple (Escenario Predeterminado)
```json
{
  "anio": 2024,
  "plan": "300_100_con_topes"
}
```

### Complejo (Personalizado)
```json
{
  "anio": 2024,
  "plan": "personalizado",
  "escanos_totales": 450,
  "mr_seats": 250,
  "rp_seats": 180,
  "pm_seats": 20,
  "umbral": 0.05,
  "max_seats_per_party": 270,
  "reparto_method": "dhondt"
}
```

---

## HINTS AUTOMÁTICOS

### Diputados
| Escenario | Hint mostrado |
|-----------|--------------|
| vigente | "300 MR + 200 RP = 500 escaños (con tope de 300)" |
| plan_a | "300 RP puro (sin mayorías relativas)" |
| plan_c | "300 MR puro (sin proporcionales)" |
| 300_100_con_topes | "300 MR + 100 RP = 400 (tope 300 escaños)" |
| 300_100_sin_topes | "300 MR + 100 RP = 400 (sin tope)" |
| 200_200_sin_topes | "200 MR + 200 RP = 400 (balanceado 50-50)" |
| personalizado | "Configura tus propios parámetros" |

### Senadores
| Escenario | Hint mostrado |
|-----------|--------------|
| vigente | "64 MR + 32 PM + 32 RP = 128 senadores" |
| plan_a | "96 RP puro (lista nacional)" |
| plan_c | "32 MR + 32 PM = 64 (sin RP)" |
| personalizado | "Configura tus propios parámetros" |

---

## MAPEO DE NOMBRES

El sistema acepta múltiples formas de referirse al mismo escenario:

| Input | Output Backend |
|-------|---------------|
| `"vigente"` | `"vigente"` |
| `"plan a"` o `"plan_a"` | `"plan_a"` |
| `"plan c"` o `"plan_c"` | `"plan_c"` |
| `"300_100_con_topes"` o `"300-100 con topes"` | `"300_100_con_topes"` |
| `"300_100_sin_topes"` o `"300-100 sin topes"` | `"300_100_sin_topes"` |
| `"200_200_sin_topes"` o `"200-200 balanceado"` | `"200_200_sin_topes"` |
| `"personalizado"` | `"personalizado"` |

---

## REFERENCIA RÁPIDA DE COLORES (UI)

```
⚖️ Sistema Oficial       → Verde institucional
📋 Propuestas Reforma    → Azul académico
🆕 Escenarios Nuevos     → Naranja destacado
⚙️ Personalizado         → Gris neutral
```

---

**Última actualización:** 17 de enero de 2026
