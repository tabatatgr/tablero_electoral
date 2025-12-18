# 🐛 Bug Report: Cálculos SIN Coalición Incorrectos

## 📊 Estado Actual

### ✅ **Funcionando Correctamente**:
- **Con Coalición + Topes**: Los resultados coinciden con el Excel
- **Con Coalición SIN Topes**: Los resultados coinciden con el Excel

### ❌ **NO Funciona**:
- **SIN Coalición**: Los resultados del backend NO coinciden con el Excel de referencia

---

## 🔍 Información del Bug

### **Fecha**: 17 de diciembre de 2025
### **Severidad**: Alta
### **Impacto**: Los cálculos sin coalición dan resultados incorrectos
### **Ambiente**: Frontend + Backend en producción

---

## 📋 Pasos para Reproducir

1. **Abrir el tablero electoral**
2. **Desactivar la coalición** (toggle OFF)
3. **Mover sliders** o hacer simulación
4. **Comparar resultados** con el Excel de referencia
5. **Resultado**: Los escaños por partido NO coinciden

---

## 📊 Datos Necesarios para Debug

### 1. **Votos de Entrada** (ejemplo)
Por favor proporciona los votos exactos que usaste:

```json
{
  "MORENA": 24286412,
  "PAN": 10049424,
  "PRI": 6623752,
  "PVEM": 4993902,
  "PT": 3254709,
  "MC": 6497404,
  "PRD": 1449655
}
```

### 2. **Configuración**
- **Cámara**: Diputados / Senado
- **Año**: 2024
- **Modelo**: Mixto / MR / RP
- **Coalición**: ❌ DESACTIVADA
- **Topes**: N/A (solo aplica con coalición)

### 3. **Resultados del Excel** (SIN coalición)

Por favor proporciona los escaños que da el Excel:

```
Partido | MR  | PM  | RP  | Total
--------|-----|-----|-----|-------
MORENA  | ??? | ??? | ??? | ???
PAN     | ??? | ??? | ??? | ???
PRI     | ??? | ??? | ??? | ???
PVEM    | ??? | ??? | ??? | ???
PT      | ??? | ??? | ??? | ???
MC      | ??? | ??? | ??? | ???
PRD     | ??? | ??? | ??? | ???
--------|-----|-----|-----|-------
TOTAL   | 300 |  ?? | 200 | 500
```

### 4. **Resultados del Backend** (SIN coalición)

Por favor proporciona los escaños que da el backend:

```
Partido | MR  | PM  | RP  | Total
--------|-----|-----|-----|-------
MORENA  | ??? | ??? | ??? | ???
PAN     | ??? | ??? | ??? | ???
PRI     | ??? | ??? | ??? | ???
PVEM    | ??? | ??? | ??? | ???
PT      | ??? | ??? | ??? | ???
MC      | ??? | ??? | ??? | ???
PRD     | ??? | ??? | ??? | ???
--------|-----|-----|-----|-------
TOTAL   | 300 |  ?? | 200 | 500
```

### 5. **Diferencias Detectadas**

Por favor marca cuáles partidos tienen diferencias:

```
Partido | Diferencia Detectada
--------|---------------------
MORENA  | [x] Sí / [ ] No
PAN     | [ ] Sí / [ ] No
PRI     | [ ] Sí / [ ] No
PVEM    | [ ] Sí / [ ] No
PT      | [ ] Sí / [ ] No
MC      | [ ] Sí / [ ] No
PRD     | [ ] Sí / [ ] No
```

---

## 🔬 Posibles Causas

### 1. **Lógica de Asignación de MR (Mayoría Relativa)**
- **Con coalición**: Los partidos coaligados suman votos y ganan más distritos
- **Sin coalición**: Cada partido compite independiente
- **Posible bug**: El backend puede estar usando la lógica de coalición incluso cuando está desactivada

### 2. **Lógica de Asignación de RP (Representación Proporcional)**
- **Con coalición**: Los partidos coaligados pueden tener topes de sobrerrepresentación conjuntos
- **Sin coalición**: Cada partido tiene su propio tope (8% según legislación)
- **Posible bug**: El cálculo de RP puede no estar considerando el modo sin coalición

### 3. **Umbral del 3%**
- Partidos que no alcanzan el 3% de votos NO reciben escaños de RP
- ¿El backend está aplicando correctamente este umbral sin coalición?

### 4. **Fórmula de Asignación (D'Hondt / Hare / Huntington-Hill)**
- ¿Qué fórmula está usando el backend para RP?
- ¿Es la misma que usa el Excel?

---

## 🛠️ Debugging en Backend

### **Archivos a Revisar**:
```python
# Probablemente en:
backend/kernel/kpi_utils.py
backend/main.py

# Buscar funciones como:
def calcular_escanos_mr(votos, coalicion_activa):
def calcular_escanos_rp(votos, coalicion_activa):
def aplicar_topes_sobrerrepresentacion(escanos, votos, coalicion_activa):
```

### **Verificar**:
1. ¿Hay un `if coalicion_activa:` que cambie la lógica?
2. ¿Se está usando la misma lógica para MR con y sin coalición?
3. ¿Se está aplicando correctamente el umbral del 3% sin coalición?
4. ¿Los topes de sobrerrepresentación se aplican correctamente sin coalición?

---

## 📊 Ejemplo de Caso de Prueba

### **Input**:
```json
{
  "camara": "diputados",
  "anio": 2024,
  "modelo": "mixto",
  "coalicion": false,  // ← SIN coalición
  "votos": {
    "MORENA": 24286412,
    "PAN": 10049424,
    "PRI": 6623752
  }
}
```

### **Output Esperado** (según Excel):
```json
{
  "seat_chart": [
    {
      "party": "MORENA",
      "seats": ???,
      "mr": ???,
      "pm": ???,
      "rp": ???
    },
    {
      "party": "PAN",
      "seats": ???,
      "mr": ???,
      "pm": ???,
      "rp": ???
    },
    {
      "party": "PRI",
      "seats": ???,
      "mr": ???,
      "pm": ???,
      "rp": ???
    }
  ]
}
```

### **Output Real** (del backend actual):
```json
{
  "seat_chart": [
    {
      "party": "MORENA",
      "seats": ???,  // ← Diferente al Excel
      "mr": ???,
      "pm": ???,
      "rp": ???
    }
  ]
}
```

---

## ✅ Checklist de Validación

### **Para confirmar el bug**:
- [ ] Copiar votos de entrada exactos
- [ ] Copiar resultados del Excel (SIN coalición)
- [ ] Copiar resultados del Backend (SIN coalición)
- [ ] Identificar qué partidos tienen diferencias
- [ ] Calcular la diferencia en escaños por partido
- [ ] Verificar si el total sigue siendo 500

### **Para el equipo de backend**:
- [ ] Revisar código de asignación de MR sin coalición
- [ ] Revisar código de asignación de RP sin coalición
- [ ] Verificar aplicación del umbral del 3%
- [ ] Verificar topes de sobrerrepresentación sin coalición
- [ ] Agregar logging para debug
- [ ] Comparar con el Excel paso a paso

---

## 🎯 Próximos Pasos

### 1. **Documentar el caso específico**:
- Proporciona los datos exactos (votos + resultados)
- Esto permitirá reproducir el bug en desarrollo

### 2. **Backend debe debuggear**:
- Agregar logs en el cálculo de escaños
- Comparar paso a paso con el Excel
- Identificar dónde divergen los resultados

### 3. **Crear test unitario**:
- Con el caso documentado, crear un test que reproduzca el bug
- Así se puede verificar cuando esté corregido

---

## 📞 Información Adicional

### **Preguntas para el usuario**:
1. ¿Los resultados con coalición coinciden **exactamente** con el Excel?
2. ¿El problema es solo sin coalición o también hay diferencias con coalición?
3. ¿Qué partidos específicamente tienen diferencias sin coalición?
4. ¿Las diferencias son en MR, RP, o ambos?
5. ¿Tienes el Excel de referencia para compartir?

### **Preguntas para el backend**:
1. ¿Hay una bandera `coalicion` que se pasa al endpoint?
2. ¿Cómo se está usando esa bandera en el código?
3. ¿Hay logs que muestren qué lógica se está ejecutando?
4. ¿El Excel usa alguna fórmula o metodología específica que debamos seguir?

---

## 🚨 Prioridad

**Alta** - Esto afecta la funcionalidad principal del simulador.

**Bloqueante para**: Producción completa, validación de resultados, presentaciones.

---

## 📝 Template para Reportar el Bug

Copia y pega esto con los datos reales:

```markdown
## Bug: Cálculos SIN Coalición

### Configuración:
- Cámara: Diputados
- Año: 2024
- Modelo: Mixto
- Coalición: ❌ DESACTIVADA

### Votos de Entrada:
```json
{
  "MORENA": ???,
  "PAN": ???,
  // ... resto
}
```

### Resultados del Excel (esperado):
| Partido | MR  | PM  | RP  | Total |
|---------|-----|-----|-----|-------|
| MORENA  | ??? | ??? | ??? | ???   |
| PAN     | ??? | ??? | ??? | ???   |

### Resultados del Backend (actual):
| Partido | MR  | PM  | RP  | Total |
|---------|-----|-----|-----|-------|
| MORENA  | ??? | ??? | ??? | ???   |
| PAN     | ??? | ??? | ??? | ???   |

### Diferencias:
- MORENA: Excel dice XXX, Backend dice YYY
- PAN: Excel dice XXX, Backend dice YYY

### Logs del Backend:
[Pegar logs relevantes si los hay]
```

---

**Fecha de creación**: 17 de diciembre de 2025  
**Reportado por**: Frontend Team  
**Asignado a**: Backend Team  
**Estado**: 🔴 Pendiente de investigación
