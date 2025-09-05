// Test simple para debuggear la petición al backend
async function testBackend() {
    console.log('🧪 INICIANDO TEST DE BACKEND...');
    
    // Datos de prueba similares a los del frontend
    const testData = {
        "MORENA": 36.1,
        "PAN": 21.7,
        "PRI": 11.8,
        "MC": 16.2,
        "PVEM": 8.4,
        "PT": 4.9,
        "PRD": 0.9
    };
    
    // Parametros query string
    const queryParams = new URLSearchParams({
        anio: '2024',
        plan: 'personalizado',
        mr_seats: '300',
        rp_seats: '200',
        escanos_totales: '500',
        umbral: '0.03',
        sobrerrepresentacion: '8',
        reparto_mode: 'cuota',
        reparto_method: 'hare',
        usar_coaliciones: 'true'
    });
    
    // Parametros body
    const formData = new URLSearchParams({
        porcentajes_partidos: JSON.stringify(testData),
        partidos_fijos: JSON.stringify({}),
        overrides_pool: JSON.stringify({})
    });
    
    const url = 'https://back-electoral.onrender.com/procesar/diputados?' + queryParams.toString();
    
    console.log('🔍 URL:', url);
    console.log('🔍 Query params:', Object.fromEntries(queryParams.entries()));
    console.log('🔍 Body data:', Object.fromEntries(formData.entries()));
    console.log('🔍 JSON data:', JSON.stringify(testData));
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
        });
        
        console.log('📡 Response status:', response.status);
        console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
        
        const responseText = await response.text();
        console.log('📡 Response body:', responseText);
        
        if (response.ok) {
            console.log('✅ SUCCESS!');
            return JSON.parse(responseText);
        } else {
            console.log('❌ ERROR:', response.status, responseText);
            return null;
        }
        
    } catch (error) {
        console.error('💥 FETCH ERROR:', error);
        return null;
    }
}

// Ejecutar test
testBackend();
