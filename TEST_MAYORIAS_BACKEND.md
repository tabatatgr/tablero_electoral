# 🧪 Test de Mayorías - Verificación Backend

## 🚀 TEST RÁPIDO EN CONSOLA

Abre la consola del navegador (F12) y pega este código:

```javascript
(async () => {
  const API = 'https://back-electoral.onrender.com';
  
  console.log('🔍 Iniciando tests de mayorías...\n');
  
  // Test 1: Backend despierto
  try {
    const test1 = await fetch(`${API}/`).then(r => r.json());
    console.log('✅ Test 1 - Backend activo:', test1);
  } catch (e) {
    console.error('❌ Test 1 - Backend caído:', e.message);
    return;
  }
  
  // Test 2: Mayoría Senado
  try {
    const url = `${API}/calcular/mayoria_forzada_senado?partido=MORENA&tipo_mayoria=simple&plan=vigente&aplicar_topes=true&anio=2024`;
    console.log('📡 URL Senado:', url);
    const test2 = await fetch(url).then(r => r.json());
    console.log('✅ Test 2 - Mayoría Senado:', test2);
  } catch (e) {
    console.error('❌ Test 2 - Error Senado:', e.message);
  }
  
  // Test 3: Mayoría Diputados
  try {
    const url = `${API}/calcular/mayoria_forzada_diputados?partido=PAN&tipo_mayoria=calificada&plan=vigente&aplicar_topes=true&anio=2024`;
    console.log('📡 URL Diputados:', url);
    const test3 = await fetch(url).then(r => r.json());
    console.log('✅ Test 3 - Mayoría Diputados:', test3);
  } catch (e) {
    console.error('❌ Test 3 - Error Diputados:', e.message);
  }
  
  console.log('\n🎉 Tests completados');
})();
```

## ✅ RESULTADOS ESPERADOS

### Backend activo:
```json
{
  "message": "Electoral System API",
  "version": "1.0.0"
}
```

### Mayoría Senado (ejemplo):
```json
{
  "viable": true,
  "senadores_necesarios": 65,
  "senadores_obtenidos": 68,
  "votos_porcentaje": 45.2,
  "estados_ganados": 24
}
```

### Mayoría Diputados (ejemplo):
```json
{
  "viable": false,
  "diputados_necesarios": 334,
  "diputados_obtenidos": 150,
  "votos_porcentaje": 62.5,
  "distritos_ganados": 250
}
```

## 🔍 LOGS EN LA APP

Cuando uses la calculadora de mayorías, deberías ver estos logs:

```
[MAYORÍAS] 🎯 Calculando mayoría forzada...
[MAYORÍAS] 📋 Parámetros: {partido: "MORENA", tipoMayoria: "simple", ...}
[MAYORÍAS] 📡 URL completa: https://back-electoral.onrender.com/calcular/mayoria_forzada_senado?...
[MAYORÍAS] 🚀 Haciendo fetch...
[MAYORÍAS] 📬 Response status: 200 OK
[MAYORÍAS] ✅ Data recibida: {...}
[MAYORÍAS] 🎨 Mostrando resultados: {...}
[MAYORÍAS] ✅ Resultado mostrado exitosamente
```

## ❌ ERRORES COMUNES

### "Failed to fetch"
**Causa:** Render está dormido  
**Solución:** Espera 30 segundos y vuelve a intentar

### "404 Not Found"
**Causa:** Endpoint mal escrito  
**Solución:** Verifica que uses `mayoria_forzada_senado` (con underscores)

### "422 Unprocessable Entity"
**Causa:** Parámetros incorrectos  
**Solución:** Verifica que `tipo_mayoria` sea "simple" o "calificada"

### "CORS policy error"
**Causa:** Backend caído completamente  
**Solución:** Visita https://back-electoral.onrender.com/ para despertarlo

## 📊 CAMPOS DE RESPUESTA

El backend puede enviar diferentes nombres de campos:

| Campo Genérico | Senado | Diputados |
|---|---|---|
| Escaños necesarios | `senadores_necesarios` | `diputados_necesarios` |
| Escaños obtenidos | `senadores_obtenidos` | `diputados_obtenidos` |
| Territorios | `estados_ganados` | `distritos_ganados` |
| Votos | `votos_porcentaje` | `votos_porcentaje` |

El frontend está preparado para manejar todos estos nombres automáticamente.

## 🎯 PASO A PASO PARA PROBAR EN LA APP

1. **Recarga la página** (F5)
2. **Abre la consola** (F12)
3. **Busca la sección "Mayorías"** en el sidebar
4. **Activa el toggle** "¿Activar cálculo de mayorías?"
5. **Selecciona un partido** (MORENA, PAN, etc.)
6. **Revisa los logs** - Deberías ver todos los pasos
7. **Verifica el resultado** - Card verde o roja con datos

## 🐛 DEBUG ADICIONAL

Si algo falla, agrega esto en la consola para ver más detalles:

```javascript
// Ver si el toggle está activo
const toggle = document.getElementById('mayorias-switch');
console.log('Toggle activo:', toggle?.classList.contains('active'));

// Ver el partido seleccionado
const select = document.getElementById('mayoria-partido-select');
console.log('Partido:', select?.value);

// Forzar un cálculo manual
const sidebar = document.querySelector('control-sidebar');
if (sidebar) {
  sidebar.calcularMayoriaForzada();
}
```

---

**Con estos tests deberías poder identificar exactamente dónde está el problema** 🎯
