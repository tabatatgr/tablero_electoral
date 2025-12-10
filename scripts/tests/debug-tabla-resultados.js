// Script de debugging para tabla de resultados
// Ejecutar en consola del navegador

console.log('🔍 Iniciando debugging de tabla de resultados...\n');

// 1. Verificar que existe el seat-chart
const seatChart = document.querySelector('seat-chart');
console.log('1️⃣ Seat Chart element:', seatChart ? '✅ Encontrado' : '❌ No encontrado');

// 2. Verificar que existe el contenedor de la tabla
const container = document.getElementById('results-table-container');
console.log('2️⃣ Contenedor #results-table-container:', container ? '✅ Encontrado' : '❌ No encontrado');

if (container) {
  console.log('   - innerHTML actual:', container.innerHTML);
  console.log('   - Padre:', container.parentElement);
}

// 3. Verificar que existe ControlSidebar
const controlSidebar = document.querySelector('control-sidebar');
console.log('3️⃣ Control Sidebar:', controlSidebar ? '✅ Encontrado' : '❌ No encontrado');

// 4. Verificar método updateResultsTable
if (controlSidebar && typeof controlSidebar.updateResultsTable === 'function') {
  console.log('4️⃣ Método updateResultsTable: ✅ Disponible');
} else {
  console.log('4️⃣ Método updateResultsTable: ❌ No disponible');
}

// 5. Verificar debugLastResponse
if (window.debugLastResponse) {
  console.log('5️⃣ debugLastResponse:', window.debugLastResponse);
  
  if (window.debugLastResponse.seat_chart) {
    console.log('   - seat_chart:', window.debugLastResponse.seat_chart);
  }
  
  if (window.debugLastResponse.resultados_detalle) {
    console.log('   - resultados_detalle:', window.debugLastResponse.resultados_detalle);
  }
} else {
  console.log('5️⃣ debugLastResponse: ⚠️ No disponible aún');
}

// 6. Función helper para probar manualmente
window.testTablaResultados = function() {
  console.log('\n🧪 Probando tabla de resultados manualmente...\n');
  
  const sidebar = document.querySelector('control-sidebar');
  if (!sidebar) {
    console.error('❌ ControlSidebar no encontrado');
    return;
  }
  
  // Datos de prueba
  const datosPrueba = [
    { partido: 'MORENA', mr: 150, pm: 30, rp: 80, total: 260 },
    { partido: 'PAN', mr: 80, pm: 15, rp: 45, total: 140 },
    { partido: 'PRI', mr: 40, pm: 10, rp: 25, total: 75 },
    { partido: 'MC', mr: 20, pm: 0, rp: 15, total: 35 }
  ];
  
  const config = {
    sistema: 'mixto',
    pm_activo: true
  };
  
  console.log('📊 Llamando updateResultsTable con datos de prueba...');
  sidebar.updateResultsTable(datosPrueba, config);
  
  setTimeout(() => {
    const container = document.getElementById('results-table-container');
    console.log('✅ Tabla inyectada. HTML:', container ? container.innerHTML.substring(0, 200) + '...' : 'N/A');
  }, 100);
};

console.log('\n💡 Para probar manualmente, ejecuta: testTablaResultados()');
console.log('💡 Espera a que se carguen datos reales o mueve un slider\n');
