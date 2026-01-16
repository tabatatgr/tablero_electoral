# 🔧 FIX: Errores de Mayoría Calificada Corregidos

## 📋 PROBLEMAS IDENTIFICADOS Y CORREGIDOS

### 1. ❌ Error: `this.updateCalificadaWarning is not a function`

**Causa**: Llamada a función que fue eliminada pero quedó una referencia

**Ubicación**: `ControlSidebar.js` línea 1663

**Código problemático**:
```javascript
if (isActive) {
    this.updateCalificadaWarning();  // ← Función que ya no existe
    this.calcularMayoriaAutomatica();
}
```

**Solución aplicada**:
```javascript
if (isActive) {
    this.calcularMayoriaAutomatica();  // ← Removida la llamada innecesaria
}
```

**Estado**: ✅ CORREGIDO

---

### 2. ❌ Error: Backend borra el porcentaje de votos del partido

**Causa**: El backend actual NO devuelve `seat_chart` completo, solo datos básicos:
```json
{
  "viable": true,
  "diputados_necesarios": 251,
  "diputados_obtenidos": 251,
  "votos_porcentaje": 47.5,  // ← Tiene el porcentaje aquí
  "mr_asignados": 158,
  "rp_asignados": 93
  // ❌ NO incluye seat_chart completo
}
```

**Problema**: El fallback actualiza escaños pero **NO actualiza el `votes_percent`**, causando que:
1. El partido quede con su porcentaje original (ej: 42.49%)
2. Los cálculos subsiguientes usen el porcentaje viejo
3. La tabla muestre datos incorrectos

**Ubicación**: `scripts/script_general/script.js` líneas 690-720

**Código problemático**:
```javascript
// Actualizar solo el partido
data.seat_chart[partidoIndex] = {
    ...partidoOriginal,
    seats: mayoriaData.escanos_obtenidos,  // ✅ Actualiza escaños
    mr_seats: mayoriaData.mr_asignados,    // ✅ Actualiza MR
    rp_seats: mayoriaData.rp_asignados,    // ✅ Actualiza RP
    pm_seats: mayoriaData.pm_asignados || 0,
    color: partidoOriginal.color
    // ❌ NO actualiza votes_percent
};
```

**Solución aplicada**:
```javascript
// 🆕 CRÍTICO: Actualizar el porcentaje de votos también
const votosPorcentaje = mayoriaData.votos_porcentaje || partidoOriginal.votes_percent;

console.log('[MAYORÍAS] 🔢 Porcentaje de votos:', {
    desde_backend: mayoriaData.votos_porcentaje,
    original: partidoOriginal.votes_percent,
    usando: votosPorcentaje
});

// Actualizar partido con TODOS los datos incluyendo votes_percent
data.seat_chart[partidoIndex] = {
    ...partidoOriginal,
    seats: mayoriaData.escanos_obtenidos,
    mr_seats: mayoriaData.mr_asignados,
    rp_seats: mayoriaData.rp_asignados,
    pm_seats: mayoriaData.pm_asignados || 0,
    votes_percent: votosPorcentaje,  // ← CRÍTICO: Incluir el nuevo porcentaje
    color: partidoOriginal.color
};
```

**Estado**: ✅ CORREGIDO (frontend) - ⚠️ Backend debe devolver seat_chart completo

---

## 🔄 FLUJO ACTUAL DEL SISTEMA

### Cuando usuario selecciona mayoría calificada:

1. **Frontend detecta** necesidad de desactivar topes
2. **Desactiva toggle** visualmente
3. **Llama al backend**: `aplicar_topes=false`
4. **Backend devuelve** (actualmente):
   ```json
   {
     "viable": true,
     "diputados_obtenidos": 334,
     "votos_porcentaje": 58.3,
     "mr_asignados": 200,
     "rp_asignados": 134
   }
   ```
5. **Frontend recibe** y guarda en `window.mayoriaForzadaData`
6. **script.js detecta** mayoría activa
7. **Verifica** si hay `seat_chart` completo → ❌ NO
8. **Usa fallback mejorado**:
   - Busca partido en seat_chart normal
   - Actualiza escaños (seats, mr_seats, rp_seats)
   - **🆕 Actualiza votes_percent** con `votos_porcentaje` del backend
9. **Renderiza tabla** con datos actualizados

---

## 📊 EJEMPLO DE DATOS

### Antes del fix (datos corruptos):

```javascript
// Backend devuelve:
{
  partido: "MORENA",
  votos_porcentaje: 58.3,  // ← Nuevo porcentaje calculado
  diputados_obtenidos: 334
}

// Fallback actualiza:
{
  party: "MORENA",
  seats: 334,              // ✅ Actualizado
  mr_seats: 200,           // ✅ Actualizado
  rp_seats: 134,           // ✅ Actualizado
  votes_percent: 42.49     // ❌ VIEJO (no actualizado)
}

// Resultado: Tabla muestra 334 escaños pero 42.49% votos = INCONSISTENTE
```

### Después del fix (datos correctos):

```javascript
// Backend devuelve:
{
  partido: "MORENA",
  votos_porcentaje: 58.3,  // ← Nuevo porcentaje
  diputados_obtenidos: 334
}

// Fallback mejorado actualiza:
{
  party: "MORENA",
  seats: 334,              // ✅ Actualizado
  mr_seats: 200,           // ✅ Actualizado
  rp_seats: 134,           // ✅ Actualizado
  votes_percent: 58.3      // ✅ ACTUALIZADO con el nuevo porcentaje
}

// Resultado: Tabla muestra 334 escaños y 58.3% votos = CONSISTENTE ✅
```

---

## 🧪 VALIDACIÓN

### Test: Mayoría Calificada MORENA

**Configuración**:
- Partido: MORENA
- Tipo: Mayoría Calificada
- Topes: Se desactivan automáticamente
- Total: 500 escaños

**Datos originales**:
- MORENA: 248 escaños (42.49% votos)

**Resultado esperado**:
- MORENA: 334 escaños (≈58.3% votos)

**Verificación en consola**:
```javascript
[MAYORÍAS] 🔢 Porcentaje de votos: {
  desde_backend: 58.3,
  original: 42.49,
  usando: 58.3
}

[MAYORÍAS] ✅ Partido actualizado (fallback mejorado): {
  party: "MORENA",
  seats: 334,
  votes_percent: 58.3,  // ← Debe mostrar el nuevo porcentaje
  mr_seats: 200,
  rp_seats: 134
}
```

**En la tabla**:
```
MORENA | 58.3% | 334 escaños | MR: 200 | RP: 134
```

---

## ⚠️ LIMITACIONES ACTUALES

### Backend NO devuelve seat_chart completo

**Problema**: El backend de mayorías (`/calcular/mayoria_forzada`) actualmente solo devuelve:
- Escaños del partido objetivo
- Porcentaje de votos necesario
- **NO** recalcula escaños de otros partidos

**Impacto**:
1. ✅ **Partido objetivo**: Se actualiza correctamente (escaños + votos)
2. ❌ **Otros partidos**: Mantienen datos originales (incorrectos)
3. ❌ **KPIs**: No se recalculan (Gallagher, ratio, etc.)

**Solución temporal (frontend)**:
- Fallback mejorado actualiza partido objetivo con `votes_percent`
- **Funcional** pero no ideal

**Solución ideal (backend)**:
- Implementar recalculo completo del sistema
- Devolver `seat_chart` con TODOS los partidos actualizados
- Devolver `kpis` recalculados

Ver detalles en: `BACKEND_MAYORIAS_DEBE_RECALCULAR_TODO.md`

---

## 📝 CAMBIOS REALIZADOS

### 1. ControlSidebar.js (línea 1663)
```diff
  if (isActive) {
-   this.updateCalificadaWarning();
    this.calcularMayoriaAutomatica();
  }
```

### 2. script.js (líneas 690-720)
```diff
+ // 🆕 CRÍTICO: Actualizar el porcentaje de votos también
+ const votosPorcentaje = mayoriaData.votos_porcentaje || partidoOriginal.votes_percent;
+ 
+ console.log('[MAYORÍAS] 🔢 Porcentaje de votos:', {
+     desde_backend: mayoriaData.votos_porcentaje,
+     original: partidoOriginal.votes_percent,
+     usando: votosPorcentaje
+ });

  data.seat_chart[partidoIndex] = {
      ...partidoOriginal,
      seats: mayoriaData.escanos_obtenidos,
      mr_seats: mayoriaData.mr_asignados,
      rp_seats: mayoriaData.rp_asignados,
      pm_seats: mayoriaData.pm_asignados || 0,
+     votes_percent: votosPorcentaje,  // ← CRÍTICO: Incluir el nuevo porcentaje
      color: partidoOriginal.color
  };
```

---

## ✅ ESTADO ACTUAL

### Funcionando Correctamente:
- ✅ Auto-desactivación de topes
- ✅ Notificación al usuario
- ✅ Detección de partido vs coalición
- ✅ Actualización de escaños del partido objetivo
- ✅ **Actualización de votes_percent del partido objetivo**
- ✅ Renderizado en tabla con datos consistentes

### Pendiente (requiere backend):
- ⏳ Recalculo de escaños de otros partidos
- ⏳ Redistribución proporcional de votos
- ⏳ KPIs recalculados (Gallagher, etc.)
- ⏳ Seat chart completo en respuesta

---

## 🎯 PRÓXIMOS PASOS

### Corto plazo (Frontend - HECHO ✅):
1. ✅ Corregir error de función inexistente
2. ✅ Mejorar fallback para incluir votes_percent
3. ✅ Agregar logs detallados para debugging

### Mediano plazo (Backend - PENDIENTE):
1. ⏳ Implementar cálculo de porcentaje necesario
2. ⏳ Recalcular escaños de TODOS los partidos
3. ⏳ Redistribuir votos proporcionalmente
4. ⏳ Devolver seat_chart completo en respuesta
5. ⏳ Calcular y devolver KPIs actualizados

### Largo plazo (Optimización):
1. ⏳ Cache de cálculos de mayoría
2. ⏳ Validación de viabilidad en backend
3. ⏳ Soporte para coaliciones con mayorías

---

**Fecha**: 16 de enero de 2026
**Estado**: ✅ Frontend corregido - ⚠️ Backend pendiente
**Prioridad**: Frontend funcional, backend puede mejorar gradualmente
