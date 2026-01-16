// 🧪 TEST RÁPIDO DE ENDPOINTS DE MAYORÍAS
// Copia y pega esto en la consola del navegador para probar los endpoints

(async () => {
  console.clear();
  console.log('🧪 INICIANDO TEST DE ENDPOINTS DE MAYORÍAS...\n');
  
  const API = 'https://back-electoral.onrender.com';
  
  // ====================================
  // TEST 1: MAYORÍA FORZADA - DIPUTADOS
  // ====================================
  console.log('📋 Test 1: Mayoría Forzada DIPUTADOS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const urlDiputados = `${API}/calcular/mayoria_forzada?partido=MORENA&tipo_mayoria=simple&plan=vigente&aplicar_topes=true`;
  console.log('🔗 URL:', urlDiputados);
  
  try {
    const responseDiputados = await fetch(urlDiputados);
    console.log('📡 Status:', responseDiputados.status, responseDiputados.statusText);
    
    if (responseDiputados.ok) {
      const dataDiputados = await responseDiputados.json();
      console.log('✅ DIPUTADOS - Respuesta exitosa:');
      console.table({
        'Viable': dataDiputados.viable,
        'Diputados Necesarios': dataDiputados.diputados_necesarios,
        'Diputados Obtenidos': dataDiputados.diputados_obtenidos,
        'Votos %': dataDiputados.votos_porcentaje,
        'MR Asignados': dataDiputados.mr_asignados,
        'RP Asignados': dataDiputados.rp_asignados
      });
      console.log('📦 Datos completos:', dataDiputados);
    } else {
      const errorText = await responseDiputados.text();
      console.error('❌ DIPUTADOS - Error:', responseDiputados.status, errorText);
    }
  } catch (error) {
    console.error('❌ DIPUTADOS - Error de red:', error.message);
  }
  
  console.log('\n');
  
  // ====================================
  // TEST 2: MAYORÍA FORZADA - SENADO
  // ====================================
  console.log('📋 Test 2: Mayoría Forzada SENADO');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const urlSenado = `${API}/calcular/mayoria_forzada_senado?partido=MORENA&tipo_mayoria=simple&plan=vigente&aplicar_topes=true&anio=2024`;
  console.log('🔗 URL:', urlSenado);
  
  try {
    const responseSenado = await fetch(urlSenado);
    console.log('📡 Status:', responseSenado.status, responseSenado.statusText);
    
    if (responseSenado.ok) {
      const dataSenado = await responseSenado.json();
      console.log('✅ SENADO - Respuesta exitosa:');
      console.table({
        'Viable': dataSenado.viable,
        'Senadores Necesarios': dataSenado.senadores_necesarios,
        'Senadores Obtenidos': dataSenado.senadores_obtenidos,
        'Votos %': dataSenado.votos_porcentaje,
        'Estados Ganados': dataSenado.estados_ganados,
        'MR Senadores': dataSenado.mr_senadores,
        'PM Senadores': dataSenado.pm_senadores,
        'RP Senadores': dataSenado.rp_senadores
      });
      console.log('📦 Datos completos:', dataSenado);
    } else {
      const errorText = await responseSenado.text();
      console.error('❌ SENADO - Error:', responseSenado.status, errorText);
    }
  } catch (error) {
    console.error('❌ SENADO - Error de red:', error.message);
  }
  
  console.log('\n');
  
  // ====================================
  // TEST 3: MAYORÍA CALIFICADA - DIPUTADOS
  // ====================================
  console.log('📋 Test 3: Mayoría CALIFICADA DIPUTADOS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const urlCalificada = `${API}/calcular/mayoria_forzada?partido=MORENA&tipo_mayoria=calificada&plan=vigente&aplicar_topes=true`;
  console.log('🔗 URL:', urlCalificada);
  
  try {
    const responseCalificada = await fetch(urlCalificada);
    console.log('📡 Status:', responseCalificada.status, responseCalificada.statusText);
    
    if (responseCalificada.ok) {
      const dataCalificada = await responseCalificada.json();
      console.log('✅ MAYORÍA CALIFICADA - Respuesta exitosa:');
      console.table({
        'Viable': dataCalificada.viable,
        'Diputados Necesarios (2/3)': dataCalificada.diputados_necesarios,
        'Diputados Obtenidos': dataCalificada.diputados_obtenidos,
        'Votos %': dataCalificada.votos_porcentaje
      });
      console.log('📦 Datos completos:', dataCalificada);
    } else {
      const errorText = await responseCalificada.text();
      console.error('❌ MAYORÍA CALIFICADA - Error:', responseCalificada.status, errorText);
    }
  } catch (error) {
    console.error('❌ MAYORÍA CALIFICADA - Error de red:', error.message);
  }
  
  console.log('\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ TEST COMPLETADO');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
})();
