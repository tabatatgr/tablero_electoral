# 🎚️ FEATURE: Sliders Inteligentes para Sistema Mixto

## 📋 Objetivo

Mejorar la experiencia de usuario al configurar sistemas electorales mixtos, haciendo que:

1. **Al cambiar Magnitud** → MR y RP se ajustan automáticamente 50/50
2. **Al mover MR** → RP se ajusta automáticamente para sumar el total
3. **Al mover RP** → MR se ajusta automáticamente para sumar el total

---

## ✅ Implementación

### **Archivo modificado:**
- `components/panel_control/ControlSidebar.js`

### **Cambios realizados:**

#### **1. Auto-ajuste 50/50 al cambiar Magnitud** (Líneas ~730-795)

Cuando el usuario mueve el slider de **Total de escaños** (Magnitud):

```javascript
magnitudeSlider.addEventListener('input', function() {
  const magnitudTotal = parseInt(this.value);
  const mitad = Math.floor(magnitudTotal / 2);
  const otra_mitad = magnitudTotal - mitad; // Para números impares
  
  // Auto-ajustar MR y RP
  mrSlider.value = mitad;
  mrValue.textContent = mitad;
  rpSlider.value = otra_mitad;
  rpValue.textContent = otra_mitad;
  
  // Actualizar límites sin reescribir valores
  updateSliderLimits(false);
  
  // Actualizar primera minoría
  updateFirstMinorityLimits();
  
  // Notificar al sistema de redistribución
  window.voteRedistribution.setConfig({
    escanos_totales: magnitudTotal,
    mr_seats: mitad,
    rp_seats: otra_mitad
  });
});
```

**Ejemplos:**
- Magnitud = 500 → MR = 250, RP = 250
- Magnitud = 128 → MR = 64, RP = 64
- Magnitud = 501 → MR = 250, RP = 251 (números impares)

#### **2. Ajuste recíproco MR ↔ RP** (Ya existía en líneas 790-870)

Los handlers `handleMrChange()` y `handleRpChange()` ya estaban implementados para:

- Cuando usuario mueve **MR** → Auto-ajusta **RP** = Total - MR
- Cuando usuario mueve **RP** → Auto-ajusta **MR** = Total - RP

**Esto permite:**
- El usuario puede mover cualquier slider manualmente
- El otro slider se ajusta automáticamente
- Siempre suman el total de escaños configurado

---

## 🎯 Comportamiento del Usuario

### **Escenario 1: Configuración inicial**
1. Usuario cambia Magnitud de 128 a 500
2. ✅ MR se ajusta automáticamente a 250
3. ✅ RP se ajusta automáticamente a 250

### **Escenario 2: Ajuste manual después**
1. Sistema ya está en 500 escaños (MR=250, RP=250)
2. Usuario mueve MR a 300
3. ✅ RP se ajusta automáticamente a 200

### **Escenario 3: Usuario quiere mayoría relativa dominante**
1. Magnitud = 500
2. Usuario mueve MR a 400
3. ✅ RP se ajusta automáticamente a 100

### **Escenario 4: Números impares**
1. Usuario configura Magnitud = 501
2. ✅ MR = 250, RP = 251 (se distribuye correctamente)

---

## 🔍 Validación Visual

El sistema también muestra un mensaje de validación debajo de los sliders:

- ✅ **Verde/Gris**: "La suma da el total de escaños seleccionados (500)"
- ❌ **Advertencia**: "La suma de escaños debe dar el total de escaños seleccionados (480 ≠ 500)"

---

## 🧪 Testing

### **Test 1: Auto-ajuste 50/50**
1. Ir a Sistema Mixto
2. Cambiar Magnitud de 128 a 500
3. ✅ Verificar: MR = 250, RP = 250

### **Test 2: Ajuste manual MR**
1. Con Magnitud = 500
2. Mover MR a 350
3. ✅ Verificar: RP se ajusta a 150

### **Test 3: Ajuste manual RP**
1. Con Magnitud = 500
2. Mover RP a 400
3. ✅ Verificar: MR se ajusta a 100

### **Test 4: Números impares**
1. Configurar Magnitud = 501
2. ✅ Verificar: MR + RP = 501 (sin errores)

### **Test 5: Cambio de cámara**
1. Diputados → Magnitud 500
2. Cambiar a Senadores
3. ✅ Verificar: Magnitud se ajusta a 128
4. ✅ Verificar: MR = 64, RP = 64

---

## 🐛 Corrección de Duplicados

**Problema encontrado:**
Había **dos event listeners** para `magnitudeSlider`:
- Uno en línea ~730 (nuevo)
- Uno en línea ~1184 (antiguo)

**Solución:**
- ✅ Fusionamos ambos en uno solo
- ✅ Eliminamos el duplicado
- ✅ Mantenemos toda la funcionalidad (redistribución, primera minoría, etc.)

---

## 📞 Integración con otros componentes

### **Sistema de Redistribución de Votos**
Cuando cambian los sliders, se notifica automáticamente:

```javascript
window.voteRedistribution.setConfig({
  req_id: crypto.randomUUID(),
  escanos_totales: magnitudTotal,
  mr_seats: mitad,
  rp_seats: otra_mitad
});
```

### **Límites de Primera Minoría**
Se actualiza automáticamente el máximo permitido:

```javascript
updateFirstMinorityLimits();
```

### **Actualización del modelo**
Se dispara el recálculo del sistema:

```javascript
window.actualizarDesdeControles();
```

---

## 💡 Ventajas

✅ **Usabilidad mejorada**: Usuario solo ajusta magnitud y sistema configura 50/50
✅ **Flexibilidad**: Usuario puede ajustar manualmente MR/RP después si lo necesita
✅ **Coherencia**: Siempre MR + RP = Magnitud Total
✅ **Sin errores**: Maneja números impares correctamente
✅ **Feedback visual**: Usuario ve inmediatamente cómo se distribuyen los escaños

---

## 🎨 Mejoras futuras (opcional)

- [ ] Agregar botón "Reset 50/50" para volver a distribución equitativa
- [ ] Mostrar porcentaje (%) además de números absolutos
- [ ] Guardar preferencias de distribución MR/RP por usuario
- [ ] Animación suave al auto-ajustar sliders

---

**Fecha de implementación:** 15 de enero de 2026
**Desarrollador:** GitHub Copilot + Usuario
**Estado:** ✅ Implementado y funcionando
