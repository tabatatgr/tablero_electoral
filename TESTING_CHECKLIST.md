# ✅ Checklist de Testing - Bugs Corregidos

## Fecha: 18 de diciembre de 2025

---

## 🧪 Test #1: Fix de Año que se Reinicia a 2018

### Pasos a Seguir:

1. **Abrir la aplicación** en el navegador
   - URL: `file:///c:/Users/pablo/OneDrive/Documentos/GitHub/tablero_electoral/index.html`
   - O abrir con Live Server si tienes uno

2. **Abrir Consola del Navegador**
   - Presiona `F12`
   - Ve a la pestaña "Console"

3. **Test A: Desactivar Coaliciones**
   - ✅ Estado inicial: Coaliciones activadas, año 2024
   - ✅ Acción: Clic en switch de coaliciones para DESACTIVAR
   - ✅ **Verificar**: El año debe MANTENERSE en 2024 (NO cambiar a 2018)
   - ✅ En consola debe aparecer: `[DEBUG] Coaliciones desactivadas: manteniendo año 2024`

4. **Test B: Cambiar Año y Desactivar Coaliciones**
   - ✅ Cambiar año a 2021
   - ✅ Desactivar coaliciones
   - ✅ **Verificar**: El año debe MANTENERSE en 2021 (NO cambiar a 2018)
   - ✅ En consola: `[DEBUG] Coaliciones desactivadas: manteniendo año 2021`

5. **Test C: Activar Coaliciones desde Año Antiguo**
   - ✅ Asegurarse de tener año 2018 o 2021
   - ✅ Activar coaliciones
   - ✅ **Verificar**: El año debe cambiar a 2024 (porque 2018/2021 no tienen coaliciones)
   - ✅ En consola: `[DEBUG] Coaliciones activadas: cambiando a año 2024 (año previo no tenía coaliciones)`

6. **Test D: Activar Coaliciones desde 2024**
   - ✅ Tener año 2024
   - ✅ Desactivar coaliciones (debe mantener 2024)
   - ✅ Reactivar coaliciones
   - ✅ **Verificar**: Debe MANTENER 2024
   - ✅ En consola: `[DEBUG] Coaliciones activadas: manteniendo año actual 2024`

### ✅ Resultado Esperado:
- ❌ **Antes**: Desactivar coaliciones FORZABA cambio a 2018 (molesto)
- ✅ **Ahora**: Desactivar coaliciones RESPETA la elección del usuario

---

## 🧪 Test #2: Integración de Primera Minoría con Backend

### Pasos a Seguir:

1. **Configuración Inicial**
   - Cámara: Diputados
   - Sistema: Mixto
   - Magnitud: 400 escaños
   - MR: 200, RP: 200

2. **Verificar Límite de PM**
   - En consola buscar: `[PM LIMITS] Consultando backend: https://back-electoral.onrender.com/calcular-limites-pm?sistema=mixto&escanos_totales=400&mr_seats=200`
   - En consola buscar: `[PM LIMITS] Respuesta backend: {max_pm: 200, valido: true, ...}`
   - ✅ **Verificar**: Slider de Primera Minoría debe tener `max="200"`
   - ✅ **Verificar**: Slider debe estar habilitado (no disabled)

3. **Test: Cambiar a Sistema MR Puro**
   - Cambiar radio button a "Mayoría Relativa"
   - Ajustar MR a 400 (100% de escaños)
   - En consola buscar: `[PM LIMITS] Límites actualizados tras cambio de sistema electoral: mr`
   - ✅ **Verificar**: Slider PM debe tener `max="400"` (todos los escaños)

4. **Test: Cambiar a Sistema RP Puro**
   - Cambiar radio button a "Representación Proporcional"
   - Ajustar RP a 400 (100% de escaños)
   - ✅ **Verificar**: Slider PM debe estar DESHABILITADO
   - ✅ **Verificar**: Mensaje debe decir "PM no disponible en sistema RP"

5. **Test: Cambiar Cámara**
   - Sistema: Mixto
   - MR: 64, RP: 64 (Senadores)
   - Cambiar de Diputados a Senadores
   - En consola buscar: `[PM LIMITS] Límites actualizados tras cambio de cámara a senadores`
   - ✅ **Verificar**: Slider PM debe tener `max="64"`

6. **Test: Cambiar Magnitud**
   - Mover slider de magnitud a 300
   - En consola buscar: `[PM LIMITS] Límites actualizados tras cambio de magnitud: 300`
   - ✅ **Verificar**: Límite de PM se actualiza según nueva distribución MR/RP

### ✅ Resultado Esperado:
- ✅ Límites de PM calculados dinámicamente por backend
- ✅ PM deshabilitado en sistema RP
- ✅ PM actualizado al cambiar cámara/magnitud/sistema/MR

---

## 🧪 Test #3: Investigación de Bug de Magnitud

### Pasos a Seguir:

1. **Configuración Inicial**
   - Abrir consola (F12)
   - Filtrar por `[MAGNITUD DEBUG]` en consola

2. **Test: Cambiar a Personalizado**
   - Cambiar modelo de "Vigente" a "Personalizado"
   - ✅ **Observar**: ¿Se mantiene el valor actual de magnitud?
   - ✅ **En consola**: Buscar logs `[MAGNITUD DEBUG]`

3. **Test: Mover Slider de Magnitud**
   - Mover slider de magnitud de 128 a 400
   - ✅ **Observar**: ¿El valor se mantiene en 400?
   - ✅ **En consola**: 
     ```
     [MAGNITUD DEBUG] updateSliderLimits llamado - Magnitud: 400, allowAdjust: true
     [MAGNITUD DEBUG] Auto-ajustando MR/RP - Magnitud: 400, MR: X→Y, RP: Z→W
     ```

4. **Test: Cambiar Cámara con Magnitud Personalizada**
   - Establecer magnitud en 350
   - Cambiar de Diputados a Senadores
   - ✅ **Observar**: ¿Se mantiene 350 o se resetea?
   - ✅ **En consola**: Copiar TODOS los logs `[MAGNITUD DEBUG]`

5. **Test: Cambiar MR/RP Manualmente**
   - Magnitud: 400
   - Mover MR a 200 (RP se auto-ajusta a 200)
   - ✅ **Observar**: ¿La magnitud se mantiene en 400?
   - ✅ **En consola**: Buscar logs de auto-ajuste

### 📋 Información a Recolectar:
Si encuentras el bug, copia y pega:
- ✅ Todos los logs que digan `[MAGNITUD DEBUG]`
- ✅ Secuencia exacta de acciones que causaron el problema
- ✅ Valores antes y después del bug

---

## 🧪 Test #4: Nota de MR Eliminada

### Pasos a Seguir:

1. **Test: Seleccionar Sistema MR**
   - Cambiar radio button a "Mayoría Relativa"
   - ✅ **Verificar**: NO debe aparecer ninguna nota debajo del slider de magnitud
   - ✅ **Antes decía**: "Nota: en sistemas de Mayoría Relativa (MR) el número de escaños asignables está limitado..."

2. **Test: Seleccionar Sistema Mixto**
   - Cambiar radio button a "Mixto"
   - ✅ **Verificar**: NO debe aparecer la nota

3. **Test: Seleccionar Sistema RP**
   - Cambiar radio button a "Representación Proporcional"
   - ✅ **Verificar**: NO debe aparecer la nota

### ✅ Resultado Esperado:
- ✅ La nota molesta ha sido completamente eliminada
- ✅ Interfaz más limpia y minimalista

---

## 📊 Resumen de Testing

### Tests Críticos (MUST PASS):
- [ ] Test #1: Año NO se cambia a 2018 al desactivar coaliciones
- [ ] Test #2: Primera Minoría con límites dinámicos funciona
- [ ] Test #4: Nota de MR eliminada

### Tests de Investigación (INFO GATHERING):
- [ ] Test #3: Recolectar logs del bug de magnitud

---

## 🐛 Reporte de Bugs Encontrados

### Si encuentras problemas, anota aquí:

**Bug encontrado**: _____________________

**Pasos para reproducir**:
1. _____________________
2. _____________________
3. _____________________

**Comportamiento esperado**: _____________________

**Comportamiento actual**: _____________________

**Logs de consola**:
```
[Pegar logs aquí]
```

**Screenshots** (si aplica): _____________________

---

## ✅ Confirmación Final

Una vez completadas las pruebas, responde:

1. ¿El fix del año funciona correctamente? ☐ Sí ☐ No
2. ¿La Primera Minoría se actualiza dinámicamente? ☐ Sí ☐ No
3. ¿La nota de MR desapareció? ☐ Sí ☐ No
4. ¿Encontraste el bug de magnitud? ☐ Sí ☐ No
5. ¿Logs de `[MAGNITUD DEBUG]` recolectados? ☐ Sí ☐ No

---

**Tester**: pablo  
**Fecha**: 18 de diciembre de 2025  
**Rama**: iteraciones
