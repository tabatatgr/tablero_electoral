// Script de prueba rápida para verificar PM en Diputados
// Ejecutar en consola del navegador con la app abierta

console.log('🧪 Iniciando pruebas de Primera Minoría (PM) en Diputados...\n');

// 1. Verificar que el elemento PM existe
const pmGroup = document.getElementById('first-minority-group');
const pmSwitch = document.getElementById('first-minority-switch');
const pmSlider = document.getElementById('input-first-minority');

console.log('1️⃣ Elementos PM:', {
  grupo: pmGroup ? '✅ Encontrado' : '❌ No encontrado',
  switch: pmSwitch ? '✅ Encontrado' : '❌ No encontrado',
  slider: pmSlider ? '✅ Encontrado' : '❌ No encontrado'
});

// 2. Verificar cámara actual
function getCurrentChamber() {
  const senadoresBtn = document.querySelector('.chamber-btn[data-chamber="senadores"]');
  const diputadosBtn = document.querySelector('.chamber-btn[data-chamber="diputados"]');
  
  if (senadoresBtn && senadoresBtn.classList.contains('active')) {
    return 'senado';
  } else if (diputadosBtn && diputadosBtn.classList.contains('active')) {
    return 'diputados';
  }
  return 'diputados';
}

const camaraActual = getCurrentChamber();
console.log('\n2️⃣ Cámara actual:', camaraActual);

// 3. Verificar sistema electoral
const sistemaElectoral = document.querySelector('input[name="electoral-rule"]:checked');
const sistemaValue = sistemaElectoral ? sistemaElectoral.value : 'desconocido';
console.log('3️⃣ Sistema electoral:', sistemaValue);

// 4. Verificar visibilidad de PM
const pmVisible = pmGroup && pmGroup.style.display !== 'none';
console.log('4️⃣ PM visible:', pmVisible ? '✅ Sí' : '❌ No');

// 5. Verificar lógica de visibilidad esperada
const deberiaSerVisible = (sistemaValue === 'mr' || sistemaValue === 'mixto');
const logicaCorrecta = pmVisible === deberiaSerVisible;

console.log('\n5️⃣ Validación lógica:', {
  sistema: sistemaValue,
  deberiaSerVisible: deberiaSerVisible ? 'Sí' : 'No',
  esVisible: pmVisible ? 'Sí' : 'No',
  resultado: logicaCorrecta ? '✅ CORRECTO' : '❌ ERROR'
});

// 6. Probar cambio de sistema electoral
console.log('\n6️⃣ Prueba de cambio de sistema electoral:');
console.log('   Cambiar manualmente entre MR, RP y Mixto y verificar que PM se muestre/oculte');

// 7. Si PM está activo, verificar configuración
if (pmSwitch && pmSwitch.getAttribute('data-switch') === 'On') {
  const pmValue = pmSlider ? parseInt(pmSlider.value) : 0;
  console.log('\n7️⃣ PM Activo:', {
    valor: pmValue,
    max: pmSlider ? pmSlider.max : 'N/A',
    min: pmSlider ? pmSlider.min : 'N/A'
  });
} else {
  console.log('\n7️⃣ PM no está activado (switch en Off)');
}

// 8. Verificar que pm_seats se incluye en el request
console.log('\n8️⃣ Para verificar envío al backend:');
console.log('   1. Activa el switch de PM');
console.log('   2. Mueve el slider a un valor (ej: 100)');
console.log('   3. Ejecuta: console.log(window.debugLastRequest)');
console.log('   4. Busca "pm_seats" en queryParams');

// Resumen
console.log('\n' + '='.repeat(50));
console.log('📊 RESUMEN DE PRUEBAS:');
console.log('='.repeat(50));
console.log(`Cámara: ${camaraActual}`);
console.log(`Sistema: ${sistemaValue}`);
console.log(`PM Visible: ${pmVisible ? 'Sí' : 'No'}`);
console.log(`Lógica correcta: ${logicaCorrecta ? '✅ SÍ' : '❌ NO'}`);
console.log('='.repeat(50) + '\n');

// Función helper para activar PM y probar
window.testPM = function(escanos = 100) {
  console.log(`\n🔧 Activando PM con ${escanos} escaños...`);
  
  if (!pmSwitch || !pmSlider) {
    console.error('❌ Elementos PM no encontrados');
    return;
  }
  
  // Activar switch
  if (pmSwitch.getAttribute('data-switch') === 'Off') {
    pmSwitch.click();
    console.log('✅ Switch PM activado');
  }
  
  // Establecer valor
  pmSlider.value = escanos;
  pmSlider.dispatchEvent(new Event('input', { bubbles: true }));
  
  const valueDisplay = document.getElementById('input-first-minority-value');
  if (valueDisplay) {
    valueDisplay.textContent = escanos;
  }
  
  console.log(`✅ PM establecido en ${escanos} escaños`);
  console.log('⏳ Esperando actualización...');
  
  setTimeout(() => {
    if (window.debugLastRequest && window.debugLastRequest.queryParams) {
      const pmEnRequest = window.debugLastRequest.queryParams.pm_seats || 
                          window.debugLastRequest.url?.includes('pm_seats');
      console.log('\n📡 Verificación de envío:');
      console.log('debugLastRequest:', window.debugLastRequest.queryParams);
      console.log('pm_seats presente:', pmEnRequest ? '✅ SÍ' : '❌ NO');
    }
  }, 2000);
};

console.log('💡 Tip: Ejecuta testPM(100) para activar PM automáticamente con 100 escaños');
