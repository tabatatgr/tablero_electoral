// 🧪 TEST PARA VERIFICAR SI BACKEND DEVUELVE SEAT_CHART COMPLETO

(async () => {
  console.clear();
  console.log('🧪 VERIFICANDO RESPUESTA DEL BACKEND DE MAYORÍAS...\n');
  
  const API = 'https://back-electoral.onrender.com';
  
  // ====================================
  // TEST 1: Mayoría Simple - Diputados
  // ====================================
  console.log('📋 Test 1: Mayoría Simple DIPUTADOS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const url = `${API}/calcular/mayoria_forzada?partido=MORENA&tipo_mayoria=simple&plan=vigente&aplicar_topes=true`;
  console.log('🔗 URL:', url);
  
  try {
    const response = await fetch(url);
    console.log('📡 Status:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      
      console.log('\n✅ RESPUESTA RECIBIDA:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      // Verificar campos básicos
      console.log('\n📊 CAMPOS BÁSICOS:');
      console.table({
        'Viable': data.viable,
        'Diputados Necesarios': data.diputados_necesarios,
        'Diputados Obtenidos': data.diputados_obtenidos,
        'Votos %': data.votos_porcentaje,
        'MR Asignados': data.mr_asignados,
        'RP Asignados': data.rp_asignados
      });
      
      // 🔑 VERIFICAR SI TIENE SEAT_CHART
      console.log('\n🔑 VERIFICACIÓN CRÍTICA:');
      const tieneSeatChart = !!data.seat_chart;
      const esArray = Array.isArray(data.seat_chart);
      const longitudSeatChart = data.seat_chart?.length || 0;
      
      if (tieneSeatChart && esArray && longitudSeatChart > 0) {
        console.log('✅ TIENE seat_chart:', 'SÍ');
        console.log('✅ Es array:', 'SÍ');
        console.log('✅ Número de partidos:', longitudSeatChart);
        
        console.log('\n📋 PARTIDOS EN SEAT_CHART:');
        data.seat_chart.forEach((partido, idx) => {
          console.log(`${idx + 1}. ${partido.party}: ${partido.seats} escaños (MR: ${partido.mr_seats || 0}, RP: ${partido.rp_seats || 0})`);
        });
        
        const totalEscanos = data.seat_chart.reduce((sum, p) => sum + (p.seats || 0), 0);
        console.log('\n📊 Total escaños en seat_chart:', totalEscanos);
        
      } else {
        console.error('❌ NO TIENE seat_chart completo');
        console.log('   - Tiene campo seat_chart:', tieneSeatChart);
        console.log('   - Es array:', esArray);
        console.log('   - Longitud:', longitudSeatChart);
        console.log('\n⚠️ EL BACKEND NECESITA DEVOLVER seat_chart COMPLETO');
      }
      
      // 🔑 VERIFICAR SI TIENE KPIs
      console.log('\n📊 KPIs:');
      if (data.kpis) {
        console.log('✅ TIENE kpis:', 'SÍ');
        console.table(data.kpis);
      } else {
        console.error('❌ NO TIENE kpis');
      }
      
      console.log('\n📦 DATOS COMPLETOS:');
      console.log(JSON.stringify(data, null, 2));
      
    } else {
      const errorText = await response.text();
      console.error('❌ Error:', response.status, errorText);
    }
    
  } catch (error) {
    console.error('❌ Error de red:', error.message);
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ TEST COMPLETADO');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  console.log('\n📝 RESUMEN:');
  console.log('Si ves "✅ TIENE seat_chart: SÍ" → El backend está bien configurado');
  console.log('Si ves "❌ NO TIENE seat_chart" → El backend necesita actualizarse');
  console.log('\nVer: BACKEND_MAYORIAS_DEBE_RECALCULAR_TODO.md para especificación completa');
  
})();
