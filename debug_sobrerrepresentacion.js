// 🔍 VERIFICACIÓN DE SOBRERREPRESENTACIÓN
// Ejecuta este código en la consola del navegador

function verificarSobrerrepresentacion() {
    console.log('🔍 VERIFICANDO SOBRERREPRESENTACIÓN...');
    
    // 1. Verificar que el slider existe
    const overrepSlider = document.getElementById('overrep-slider');
    const overrepSwitch = document.getElementById('overrep-switch');
    
    console.log('📊 Control de Sobrerrepresentación:');
    console.log('- Slider encontrado:', !!overrepSlider);
    console.log('- Switch encontrado:', !!overrepSwitch);
    
    if (overrepSlider) {
        console.log('- Valor actual del slider:', overrepSlider.value);
    }
    
    if (overrepSwitch) {
        console.log('- Estado del switch:', overrepSwitch.getAttribute('data-switch'));
    }
    
    // 2. Simular cambio y ver si se envía el parámetro
    if (overrepSlider && overrepSwitch) {
        console.log('🧪 SIMULANDO CAMBIO...');
        
        // Activar switch si no está activo
        if (overrepSwitch.getAttribute('data-switch') !== 'On') {
            overrepSwitch.click();
            console.log('✅ Switch activado');
        }
        
        // Cambiar valor del slider
        overrepSlider.value = 8.5;
        overrepSlider.dispatchEvent(new Event('input'));
        
        console.log('✅ Slider cambiado a 8.5');
        console.log('⏳ Esperando request... (revisa los logs [DEBUG] URL final)');
        
        return true;
    } else {
        console.log('❌ No se encontraron los controles de sobrerrepresentación');
        return false;
    }
}

// 🧮 FUNCIÓN PARA CALCULAR SOBRERREPRESENTACIÓN MANUALMENTE
function calcularSobrerrepresentacionManual() {
    console.log('🧮 CALCULANDO SOBRERREPRESENTACIÓN DE LOS DATOS ACTUALES...');
    
    // Buscar el seat-chart actual
    const seatChart = document.querySelector('seat-chart');
    if (!seatChart) {
        console.log('❌ No se encontró seat-chart');
        return;
    }
    
    const data = seatChart.getAttribute('data');
    if (!data) {
        console.log('❌ No hay datos en seat-chart');
        return;
    }
    
    try {
        const partidos = JSON.parse(data);
        console.log('📊 ANÁLISIS DE SOBRERREPRESENTACIÓN:');
        console.log('Partido | % Votos | % Escaños | Sobrerrepres. | ¿Excede 8%?');
        console.log('---------|---------|-----------|---------------|-------------');
        
        partidos.forEach(partido => {
            if (partido.seats > 0) {
                const sobrerrepresentacion = partido.percent - (partido.votes / 50376138 * 100);
                const excede = sobrerrepresentacion > 8;
                
                console.log(
                    `${partido.party.padEnd(8)} | ` +
                    `${(partido.votes / 50376138 * 100).toFixed(1)}%`.padEnd(7) + ` | ` +
                    `${partido.percent.toFixed(1)}%`.padEnd(9) + ` | ` +
                    `${sobrerrepresentacion.toFixed(1)}%`.padEnd(13) + ` | ` +
                    (excede ? '🚨 SÍ' : '✅ NO')
                );
            }
        });
        
    } catch (e) {
        console.log('❌ Error parseando datos:', e);
    }
}

// 🎯 EJECUTAR VERIFICACIÓN COMPLETA
function verificacionCompleta() {
    console.log('🎯 VERIFICACIÓN COMPLETA DE SOBRERREPRESENTACIÓN');
    console.log('================================================');
    
    verificarSobrerrepresentacion();
    
    setTimeout(() => {
        calcularSobrerrepresentacionManual();
    }, 2000);
}

// Exportar funciones para uso manual
window.debugSobrerrepresentacion = {
    verificar: verificarSobrerrepresentacion,
    calcular: calcularSobrerrepresentacionManual,
    completo: verificacionCompleta
};

console.log('✅ Debug de sobrerrepresentación cargado!');
console.log('📝 Usa: debugSobrerrepresentacion.completo() para verificar todo');
