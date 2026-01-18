# 🎯 Feature: Calculadora Automática de Mayorías

## 📋 Resumen

Se agregó una nueva sección en el Control Sidebar llamada **"Mayorías"** que calcula automáticamente cuántos votos y territorios necesita un partido o coalición para alcanzar mayoría simple o calificada.

---

## ✅ Funcionalidades Implementadas

### 1. **Toggle ON/OFF para Mayorías**
- Switch activador al inicio de la sección
- Cuando está OFF: controles ocultos
- Cuando está ON: controles visibles y cálculo automático

### 2. **Cálculo Automático**
El cálculo se ejecuta automáticamente cuando:
- ✅ Se activa el toggle
- ✅ Se cambia el tipo de mayoría (Simple ↔ Calificada)
- ✅ Se selecciona un partido diferente
- ✅ Se cambia la cámara (Diputados ↔ Senadores)

**No hay botón "Calcular"** - todo es reactivo y automático.

### 3. **Tipos de Mayoría**

| Tipo | Descripción | Umbral |
|------|-------------|--------|
| **Simple** | >50% de escaños | Diputados: >200 (de 400)<br>Senado: >64 (de 128) |
| **Calificada** | ≥2/3 de escaños (66.67%) | Diputados: ≥267 (de 400)<br>Senado: ≥86 (de 128) |

### 3. **Integración con Backend**

Se integran los siguientes endpoints:

#### **Para Senado:**
```http
GET /calcular/mayoria_forzada_senado?partido=MORENA&tipo_mayoria=simple&plan=vigente&aplicar_topes=true&anio=2024
```

#### **Para Diputados:**
```http
GET /calcular/mayoria_forzada_diputados?partido=MORENA&tipo_mayoria=calificada&plan=vigente&aplicar_topes=true&anio=2024
```

**Response esperado:**
```json
{
  "viable": true,
  "partido": "MORENA",
  "senadores_necesarios": 65,
  "estados_ganados": 24,
  "votos_porcentaje": 52,
  "senadores_obtenidos": 70
}
```

### 4. **Card de Resultados**

Muestra automáticamente:

- **Badge de estado:**
  - 🟢 "Mayoría Simple/Calificada Alcanzable" (si viable)
  - 🔴 "Mayoría No Viable" (si no es alcanzable)

- **Estadísticas:**
  - **Escaños necesarios:** `X (obtendrías Y)`
  - **Votos requeridos:** `Z% de los votos`
  - **Estados/Distritos a ganar:** `A de B estados/distritos`

---

## 🎨 Diseño Visual

### **Paleta de Colores**

```css
/* Botón principal */
background: #059669;  /* Verde oscuro de mayoría calificada */
hover: #047857;       /* Verde más oscuro */

/* Card de resultado */
background: #F9FAFB;  /* Gris muy claro */
border: #E5E7EB;      /* Gris claro */

/* Badge verde (viable) */
background: #D1FAE5;  /* Verde muy claro */
color: #047857;       /* Verde oscuro */

/* Badge rojo (no viable) */
background: #FEE2E2;  /* Rojo claro */
color: #991B1B;       /* Rojo oscuro */
```

### **Estados del Botón**

1. **Normal:** Verde con sombra sutil
2. **Hover:** Verde más oscuro con sombra más pronunciada
3. **Loading:** Spinner animado + deshabilitado
4. **Disabled:** Gris + cursor not-allowed

---

## 📊 Flujo de Usuario

### **Flujo Automático (Simplificado)**
1. Usuario activa el toggle "¿Activar cálculo de mayorías?"
2. Aparecen los controles (tipo de mayoría + partido)
3. Usuario selecciona tipo de mayoría (Simple/Calificada)
4. Usuario selecciona partido del dropdown
5. **El cálculo se ejecuta automáticamente** sin necesidad de botón
6. Card de resultados aparece inmediatamente
7. Si cambia cualquier parámetro, se recalcula automáticamente

### **Desactivación**
1. Usuario desactiva el toggle
2. Controles se ocultan
3. Card de resultados se oculta

---

## 🔧 Archivos Modificados

### **1. ControlSidebar.js**

#### Sección HTML (línea ~310)
```javascript
<!-- 🆕 11. Mayorías (Calculadora de Mayoría Forzada) -->
<div class="control-group" data-group="mayorias">
  <button class="group-toggle" data-target="mayorias">
    <span class="group-title">Mayorías</span>
    ...
  </button>
  <div class="group-content" id="group-mayorias">
    <!-- Toggle ON/OFF -->
    <div class="control-item">
      <label>¿Activar cálculo de mayorías?</label>
      <div class="switch" id="mayorias-switch" data-switch="Off">...</div>
    </div>
    
    <!-- Controles (ocultos si toggle OFF) -->
    <div id="mayorias-controls" style="display:none;">
      <!-- Radio buttons para tipo de mayoría -->
      <!-- Dropdown para partido/coalición -->
      <!-- Card de resultado -->
    </div>
  </div>
</div>
```

#### Event Listeners (línea ~1520)
```javascript
// Toggle para mostrar/ocultar controles
mayoriasSwitch.addEventListener('click', () => {
  const isActive = mayoriasSwitch.classList.contains('active');
  mayoriasControls.style.display = isActive ? 'block' : 'none';
  
  // Si se activa, calcular inmediatamente
  if (isActive) {
    this.calcularMayoriaAutomatica();
  }
});

// Recalcular cuando cambien los controles
tipoMayoriaRadios.forEach(radio => {
  radio.addEventListener('change', () => {
    if (mayoriasSwitch.classList.contains('active')) {
      this.calcularMayoriaAutomatica();
    }
  });
});

partidoSelect.addEventListener('change', () => {
  if (mayoriasSwitch.classList.contains('active')) {
    this.calcularMayoriaAutomatica();
  }
});
```

#### Función `calcularMayoriaAutomatica()` (línea ~2340)
```javascript
async calcularMayoriaAutomatica() {
  // Verificar que el toggle esté activo
  const mayoriasSwitch = document.getElementById('mayorias-switch');
  if (!mayoriasSwitch || !mayoriasSwitch.classList.contains('active')) {
    return;
  }
  
  // Llamar a la función principal
  await this.calcularMayoriaForzada();
}
```

#### Función `calcularMayoriaForzada()` (línea ~2350)
```javascript
async calcularMayoriaForzada() {
  // Obtener valores de controles
  const tipoMayoria = document.querySelector('input[name="tipo-mayoria"]:checked')?.value;
  const partido = document.getElementById('mayoria-partido-select')?.value;
  
  // Validar (sin mostrar error, solo log)
  if (!partido) {
    console.log('[MAYORÍAS] ⏸ No hay partido seleccionado');
    return;
  }
  
  // Llamar al backend (sin loading ni notificaciones)
  const response = await fetch(url);
  const data = await response.json();
  
  // Mostrar resultados automáticamente
  this.mostrarResultadoMayoria(data, ...);
}
```

#### Función `mostrarResultadoMayoria()` (línea ~2400)
```javascript
mostrarResultadoMayoria(data, tipoMayoria, partido, camara) {
  // Actualizar badge según viabilidad
  if (data.viable) {
    badge.textContent = `🟢 Mayoría ${tipoMayoria} Alcanzable`;
  } else {
    badge.textContent = '🔴 Mayoría No Viable';
  }
  
  // Actualizar estadísticas
  escanosNecesarios.textContent = `${necesarios} (obtendrías ${obtenidos})`;
  votosRequeridos.textContent = `${porcentaje}% de los votos`;
  territoriosGanar.textContent = `${territorios} de ${total} ${tipo}`;
  
  // Mostrar y hacer scroll
  resultadoDiv.style.display = 'block';
  resultadoDiv.scrollIntoView({ behavior: 'smooth' });
}
```

---

### **2. ControlSidebar.css**

#### Estilos para card de resultado (línea ~740)
```css
.mayoria-resultado-card {
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 12px;
}

.mayoria-badge {
  padding: 4px 10px;
  background: #D1FAE5;
  color: #047857;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.mayoria-badge.no-viable {
  background: #FEE2E2;
  color: #991B1B;
}

.mayoria-stat {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
}
```

**Nota:** Los estilos del botón `.btn-primary` ya no son necesarios.

---

## 🧪 Casos de Prueba

### **Caso 1: Activar toggle y seleccionar partido**
**Input:**
1. Toggle ON
2. Tipo: Simple
3. Partido: MORENA
4. Cámara: Diputados

**Expected Output:**
- Controles aparecen automáticamente
- Al seleccionar MORENA, se calcula inmediatamente
- Card muestra:
```
🟢 Mayoría Simple Alcanzable

Escaños necesarios: 201 (obtendrías 247)
Votos requeridos: 48% de los votos
Distritos a ganar: 180 de 300 distritos
```

---

### **Caso 2: Cambiar tipo de mayoría**
**Input:**
1. Toggle ya está ON
2. MORENA ya seleccionado
3. Cambiar de Simple → Calificada

**Expected Output:**
- Se recalcula automáticamente
- Card se actualiza inmediatamente
```
� Mayoría No Viable

Escaños necesarios: 267 (obtendrías 247)
Votos requeridos: 62% de los votos
Distritos a ganar: 250 de 300 distritos
```

---

### **Caso 3: Desactivar toggle**
**Input:**
- Toggle OFF

**Expected Output:**
- Controles se ocultan
- Card de resultado se oculta
- Sin llamadas al backend

---

## 📱 Responsive

La sección se adapta automáticamente:
- En desktop: Card completo con todos los detalles
- En tablet/mobile: Stack vertical de estadísticas
- Botón siempre ocupa 100% del ancho

---

## 🔮 Futuras Mejoras (Opcional)

1. **Gráfico de barras**: Visualizar progreso hacia la mayoría
2. **Tabla de territorios**: Mostrar lista de estados/distritos específicos a ganar
3. **Comparación**: Ver varios partidos simultáneamente
4. **Exportar**: Guardar escenario como CSV
5. **Historial**: Guardar cálculos previos en localStorage

---

## 🚨 Manejo de Errores

### **Error 404/500 del backend:**
```javascript
if (!response.ok) {
  throw new Error(`Error ${response.status}: ${response.statusText}`);
}
```
- Muestra notificación error toast
- Oculta card de resultados
- Log detallado en consola

### **Sin conexión:**
```javascript
catch (error) {
  window.notifications.error('Error al calcular', error.message, 5000);
}
```

### **Partido no válido:**
Backend devuelve `viable: false` y el card muestra badge rojo.

---

## ✅ Estado

- [x] HTML de sección "Mayorías" agregado
- [x] Estilos CSS completos
- [x] Event listener del botón
- [x] Función `calcularMayoriaForzada()`
- [x] Función `mostrarResultadoMayoria()`
- [x] Integración con notificaciones
- [x] Manejo de errores
- [x] Loading state en botón
- [x] Scroll automático al resultado
- [ ] Testing con backend real (requiere endpoints implementados)

---

## 📞 Notas para el Backend

**Endpoints necesarios:**

1. `GET /calcular/mayoria_forzada_senado`
   - Params: `partido`, `tipo_mayoria`, `plan`, `aplicar_topes`, `anio`
   - Response: `{ viable, partido, senadores_necesarios, estados_ganados, votos_porcentaje, senadores_obtenidos }`

2. `GET /calcular/mayoria_forzada_diputados`
   - Params: `partido`, `tipo_mayoria`, `plan`, `aplicar_topes`, `anio`
   - Response: `{ viable, partido, diputados_necesarios, distritos_ganados, votos_porcentaje, diputados_obtenidos }`

**Partidos válidos:**
- Individuales: MORENA, PAN, PRI, PRD, PT, PVEM, MC
- Coaliciones: "MORENA+PT+PVEM", "PAN+PRI+PRD"

**Valores de `tipo_mayoria`:**
- `"simple"`: >50%
- `"calificada"`: ≥66.67% (2/3)

---

**Fecha de implementación:** 15 de enero de 2026  
**Desarrollador:** GitHub Copilot + Usuario
