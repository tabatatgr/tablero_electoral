// VoteRedistribution.js - Modulo para manejar redistribucion de porcentajes y comunicacion con backend

class VoteRedistribution {
    constructor() {
        this.porcentajes = {};
        this.result = null;
        this.loading = false;
        this.error = null;
        this.debounceTimer = null;
        this.callbacks = {
            onUpdate: null,
            onLoading: null,
            onError: null
        };
        
        // Configuracion por defecto
        this.config = {
            anio: 2024,
            camara: 'diputados',
            plan: 'personalizado',
                sistema: 'mixto',
            mr_seats: 64,
            rp_seats: 64,
            escanos_totales: 128,
            umbral: 0.03,
            sobrerrepresentacion: 8,
            reparto_mode: 'cuota',
            reparto_method: 'hare',
            usar_coaliciones: true
        };
    }

    // Metodo para obtener resultados del backend - VERSION CORREGIDA
    async fetchResultados() {
        // 🔍 DEBUGGING CRÍTICO: Verificar qué porcentajes vamos a enviar
        console.log('🚨 [CRITICAL DEBUG] fetchResultados llamado');
        console.log('🚨 this.porcentajes =', JSON.stringify(this.porcentajes, null, 2));
        console.log('🚨 Object.keys(this.porcentajes).length =', Object.keys(this.porcentajes).length);
        
        if (!this.porcentajes || Object.keys(this.porcentajes).length === 0) {
            console.warn('🚨 [CRITICAL] No hay porcentajes para enviar al backend');
            return;
        }
        
        if (this.loading) {
            console.log('[DEBUG] Ya hay una peticion en progreso, saltando...');
            return;
        }

        const total = Object.values(this.porcentajes).reduce((sum, val) => sum + val, 0);
        console.log('[DEBUG] Total antes de normalizar:', total.toFixed(2) + '%');

        // Normalizar automáticamente usando el método existente
        this.porcentajes = this.normalizePorcentajes(this.porcentajes);

        const nuevoTotal = Object.values(this.porcentajes).reduce((sum, val) => sum + val, 0);
        console.log('[DEBUG] Total después de normalizar:', nuevoTotal.toFixed(2) + '%');
        console.log('[DEBUG] Porcentajes normalizados:', this.porcentajes);

        this.setLoading(true);
        this.setError(null);

        try {
            // Construir configActual a partir de this.config pero SIN FORZAR valores
            // Si la UI o quien llama ya pasó mr_seats/rp_seats/escanos_totales, respetarlos.
            let configActual = { ...this.config };

            const camaraNormalized = (String(configActual.camara || '').toLowerCase());
            const isSenado = camaraNormalized === 'senadores' || camaraNormalized === 'senado';
            const defaultEscanos = isSenado ? 128 : 500;
            const chamberCap = isSenado ? 64 : 300;

            // Asegurar que escanos_totales esté definido
            // En modo 'personalizado' no debemos inventar una magnitud diferente a la que el usuario pidió.
            // Si estamos en 'personalizado' y no se proporcionó explicitamente escanos_totales, abortamos
            // la petición para evitar enviar defaults como 300.
            if (configActual.plan === 'personalizado' && (typeof configActual.escanos_totales === 'undefined' || configActual.escanos_totales === null)) {
                console.warn('[VoteRedistribution] Petición abortada: en modo personalizado falta escanos_totales en configActual; evitar enviar defaults (ej. 300)');
                this.setLoading(false);
                return;
            }

            if (typeof configActual.escanos_totales === 'undefined' || configActual.escanos_totales === null) {
                configActual.escanos_totales = defaultEscanos;
            }

            // Si mr_seats no está definido, usar escanos_totales dentro del tope de la cámara
            if (typeof configActual.mr_seats === 'undefined' || configActual.mr_seats === null) {
                configActual.mr_seats = Math.min(chamberCap, Math.round(Number(configActual.escanos_totales) || defaultEscanos));
            }

            // Si rp_seats no está definido, derivarlo de escanos_totales y mr_seats
            if (typeof configActual.rp_seats === 'undefined' || configActual.rp_seats === null) {
                const total = Math.round(Number(configActual.escanos_totales) || defaultEscanos);
                configActual.rp_seats = Math.max(0, total - Math.round(Number(configActual.mr_seats) || 0));
            }

            // Finalmente, asegurar que mr_seats no exceda el tope de la cámara
            if (Number(configActual.mr_seats) > chamberCap) {
                console.warn('[VoteRedistribution] mr_seats excede tope de cámara; se clampa a', chamberCap);
                configActual.mr_seats = chamberCap;
            }
            
            // CORRECCION: Separar parametros entre query string y body segun backend
            // Parametros que van en query string
            const queryParams = new URLSearchParams({
                anio: String(configActual.anio),
                plan: 'personalizado',
                sistema: String(configActual.sistema || 'mixto'),
                mr_seats: String(configActual.mr_seats),
                rp_seats: String(configActual.rp_seats),
                escanos_totales: String(configActual.escanos_totales),
                umbral: String(configActual.umbral),
                sobrerrepresentación: String(configActual.sobrerrepresentacion || 8),
                reparto_mode: configActual.reparto_mode,
                reparto_method: configActual.reparto_method,
                usar_coaliciones: String(configActual.usar_coaliciones)
            });
            // Incluir req_id si fue provisto por el caller para evitar responses fuera de orden
            if (configActual.req_id) {
                queryParams.set('req_id', String(configActual.req_id));
            }
            // Ensure we have a reqId for headers/debug
            const reqId = (configActual && configActual.req_id) ? String(configActual.req_id) : ((typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(36).slice(2,9)}`);
            
            // Parametros que van en el body (usar JSON explícito)
            // Asegurar que los porcentajes sean números
            const sanitizedPorcentajes = {};
            Object.keys(this.porcentajes).forEach(k => {
                const raw = this.porcentajes[k];
                const num = Number(raw);
                sanitizedPorcentajes[k] = Number.isFinite(num) ? num : 0;
            });

            // Validación local de suma
            const suma = Object.values(sanitizedPorcentajes).reduce((s, v) => s + v, 0);
            let normalizedLocally = false;
            let bodyPorcentajes = sanitizedPorcentajes;
            if (Math.abs(suma - 100) <= 0.1) {
                // pequeña desviación: normalizar automáticamente
                const factor = 100 / (suma || 1);
                bodyPorcentajes = {};
                Object.keys(sanitizedPorcentajes).forEach(k => {
                    bodyPorcentajes[k] = +(sanitizedPorcentajes[k] * factor);
                });
                normalizedLocally = true;
                console.log('[DEBUG] Porcentajes normalizados localmente (pequeña desviación):', bodyPorcentajes);
            } else if (Math.abs(suma - 100) > 5) {
                // Gran desviación: avisar pero no bloquear (se intentará enviar y backend normalizará)
                console.warn('[WARN] Suma de porcentajes distante de 100:', suma);
                try {
                    if (window.notifications && window.notifications.isReady) {
                        window.notifications.warning('Suma de porcentajes inusual', `La suma de porcentajes es ${suma.toFixed(2)}% (esperado ~100%). Se enviará la petición pero revisa los valores.`, 7000);
                    }
                } catch (err) {
                    console.warn('[WARN] No se pudo mostrar advertencia de porcentajes:', err);
                }
            }

            const bodyObj = {
                porcentajes_partidos: bodyPorcentajes,
                partidos_fijos: {},
                overrides_pool: {}
            };

            const API_BASE = 'https://back-electoral.onrender.com';
            const camaraEndpoint = this.config.camara === 'senadores' || this.config.camara === 'senado' ? 'senado' : 'diputados';
            const fullURL = API_BASE + '/procesar/' + camaraEndpoint + '?' + queryParams.toString();
            
            console.log('[DEBUG] Enviando peticion (JSON):', {
                url: fullURL,
                camara: this.config.camara,
                endpoint: camaraEndpoint,
                porcentajes_sent: bodyPorcentajes,
                normalizedLocally,
                config: configActual,
                queryParams: Object.fromEntries(queryParams.entries())
            });

            // Exponer petición para debugging: permite demostrar exactamente qué se envió
            try {
                window.debugLastRequest = {
                    timestamp: Date.now(),
                    url: fullURL,
                    camara: this.config.camara,
                    endpoint: camaraEndpoint,
                    porcentajes: bodyPorcentajes,
                    normalizedLocally: normalizedLocally,
                    config: configActual,
                    queryParams: Object.fromEntries(queryParams.entries()),
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Request-Id': reqId
                    },
                    body: bodyObj
                };
                // Helper para descargar la última respuesta que llegue
                window.downloadLastResponse = function(filename = 'last_response.json') {
                    try {
                        const data = window.debugLastResponse || window.voteRedistribution?.result || null;
                        if (!data) {
                            console.warn('[debug] No hay respuesta para descargar');
                            return;
                        }
                        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = filename;
                        document.body.appendChild(a);
                        a.click();
                        setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 1000);
                        console.log('[debug] Descarga iniciada:', filename);
                    } catch (err) {
                        console.error('[debug] Error al descargar respuesta:', err);
                    }
                };
            } catch (err) {
                console.warn('[debug] No se pudo establecer debugLastRequest en window:', err);
            }
            
            // Metodo POST con JSON body y header Content-Type
            const res = await fetch(fullURL, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-Request-Id': reqId
                },
                body: JSON.stringify(bodyObj)
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error('[ERROR] Response error:', { 
                    status: res.status, 
                    statusText: res.statusText, 
                    body: errorText,
                    url: fullURL
                });
                
                let errorMsg = 'HTTP ' + res.status + ': ' + res.statusText;
                if (errorText) {
                    try {
                        const errorData = JSON.parse(errorText);
                        errorMsg += ' - ' + (errorData.detail || errorText);
                    } catch {
                        errorMsg += ' - ' + errorText;
                    }
                }
                
                throw new Error(errorMsg);
            }

            const data = await res.json();
            // Exponer respuesta para debugging y chequear si la redistribución se ejecutó
            try {
                // Determinar si backend ejecutó la ruta de redistribución (meta.trace)
                const trace = data && data.meta && data.meta.trace ? data.meta.trace : null;
                const executed = !!(trace && (trace.tmp_parquet || trace.votos_redistribuidos || trace.tmp_file));
                if (!data.meta) data.meta = {};
                data.meta.redistribution_executed = executed;

                window.debugLastResponse = data;

                // Si no se detectó ejecución, normalmente mostramos una advertencia.
                // Sin embargo, si la respuesta indica que es un 'fallback_local' (resultado local
                // generado por el frontend), suprimir la advertencia para evitar ruido.
                if (!executed && !(data && data.meta && data.meta.fallback_local)) {
                    // Mantener solo un warning en consola para debugging; no mostrar notificación
                    console.warn('[WARN] No se detectó meta.trace indicando redistribución en la respuesta. (suprimida notificación para evitar ruido en la UI)');
                }
            } catch (err) {
                console.warn('[debug] Error al analizar meta.trace en la respuesta:', err);
            }

            // Adjuntar meta a this.result para que quien consuma VoteRedistribution pueda validar req_id
            this.result = data;
            if (data && data.meta) {
                this.lastResponseMeta = data.meta;
            }
            this.notifyUpdate();

        } catch (error) {
            console.error('Error fetching resultados:', error);

            // Fallback local allocation: si la petición al backend falla (offline/CORS/etc),
            // calcular una asignación local usando mayor resto para que la UI muestre
            // resultados inmediatos y las KPIs se actualicen.
            try {
                const totalSeats = (this.config && this.config.escanos_totales) ? Number(this.config.escanos_totales) : 128;
                const porcentajes = this.porcentajes || {};
                const parties = Object.keys(porcentajes).map(p => ({ party: p, pct: Number(porcentajes[p]) || 0 }));
                let allocated = 0;
                const interim = parties.map(p => {
                    const exact = (p.pct / 100) * totalSeats;
                    const floored = Math.floor(exact);
                    allocated += floored;
                    return { party: p.party, exact, floored, remainder: exact - floored };
                });
                let remaining = totalSeats - allocated;
                interim.sort((a,b) => b.remainder - a.remainder);
                for (let i=0; i<interim.length && remaining>0; i++) { interim[i].floored += 1; remaining -= 1; }
                const seat_chart = interim.map(item => ({ partido: item.party, escaños: item.floored }));

                const fallbackResult = { seat_chart, meta: { fallback_local: true, error: String(error && (error.message || error)) } };
                this.result = fallbackResult;
                window.debugLastResponse = fallbackResult;

                try {
                    if (window.notifications && window.notifications.isReady) {
                        // Mensaje amigable para usuarios finales: evitar mencionar infraestructura técnica
                        window.notifications.warning(
                            'Resultado local',
                            'Se aplicó una asignación local porque no fue posible obtener una respuesta remota. Los resultados mostrados son aproximados.',
                            7000
                        );
                    }
                } catch (e) { /* ignore */ }

                this.notifyUpdate();
            } catch (fallbackErr) {
                console.error('[ERROR] Fallback local también falló:', fallbackErr);
                // Sólo establecer el error si la estrategia de fallback también falló
                this.setError(String(fallbackErr || error || 'Error desconocido'));
            }
        } finally {
            this.setLoading(false);
        }
    }

    // Debounce para evitar spam
    debouncedFetchResultados() {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        
        this.debounceTimer = setTimeout(() => {
            this.fetchResultados();
        }, 350);
    }

    // Inicializacion con datos baseline
    initializeWithBaselineData(baselineData) {
        console.log('[DEBUG] Inicializando VoteRedistribution con baseline:', baselineData);
        this.porcentajes = { ...baselineData };
        this.fetchResultados();
    }

    // Configuracion
    setConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        
        if (this.porcentajes && Object.keys(this.porcentajes).length > 0) {
            this.debouncedFetchResultados();
        }
    }

    // Actualizar porcentajes
    updatePorcentajes(newPorcentajes) {
        this.porcentajes = { ...newPorcentajes };
        this.debouncedFetchResultados();
    }

    // Callbacks y estado
    setLoading(loading) {
        this.loading = loading;
        if (this.callbacks.onLoading) {
            this.callbacks.onLoading(loading);
        }
        // Si no hay callback registrado, intentar usar el sistema global de notificaciones
        try {
            if (!this.callbacks.onLoading) {
                if (window.notifications && window.notifications.isReady) {
                    // Dejar que ControlSidebar maneje la conversión a mensajes visibles
                    // pero emitimos una señal usando la API de notifications para compatibilidad
                    if (loading) {
                        window.notifications.loading('Procesando redistribución', 'Calculando resultados…', 'redistribution-processing');
                    } else {
                        try {
                            window.notifications.update('redistribution-processing', { title: 'Listo', subtitle: 'Resultados calculados', type: 'success', duration: 3500 });
                        } catch (e) {
                            try { window.notifications.hide('redistribution-processing'); } catch (err) { /* silent */ }
                            window.notifications.success('Listo', 'Resultados calculados', 3500);
                        }
                    }
                }
            }
        } catch (err) {
            console.warn('[WARN] setLoading: error al emitir notificación global:', err);
        }
    }

    setError(error) {
        this.error = error;
        if (this.callbacks.onError) {
            this.callbacks.onError(error);
        }
    }

    notifyUpdate() {
        console.log('[DEBUG] notifyUpdate llamado con resultado:', this.result);
        
        // Actualizar seat chart directamente si hay datos
        if (this.result && this.result.seat_chart) {
            this.updateSeatChart(this.result.seat_chart);
        }
        
        // Notificar a los callbacks registrados
        if (this.callbacks.onUpdate) {
            this.callbacks.onUpdate(this.result);
        }
        
        console.log('[DEBUG] UI actualizada con nuevos resultados');
    }

    // Nuevo metodo para actualizar el seat chart
    updateSeatChart(seatChartData) {
        console.log('[DEBUG] Actualizando seat chart con datos:', seatChartData);
        
        const seatChart = document.querySelector('seat-chart');
        if (!seatChart) {
            console.warn('[WARN] No se encontro elemento seat-chart');
            return;
        }

        try {
            // El backend devuelve directamente un array con el formato correcto
            let chartData = seatChartData;
            
            // Asegurar que tengamos el formato correcto
            if (!Array.isArray(chartData)) {
                console.warn('[WARN] Datos de seat chart no son array, intentando conversion');
                chartData = Object.values(chartData);
            }
            
            console.log('[DEBUG] Datos de seat chart procesados para componente:', chartData);
            
            // Forzar re-render con key única
            const renderKey = `redistribution_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            seatChart.setAttribute('data-key', renderKey);
            seatChart.setAttribute('data', JSON.stringify(chartData));
            
            console.log('[DEBUG] Seat chart actualizado exitosamente con', chartData.length, 'partidos');
            
        } catch (error) {
            console.error('[ERROR] Error actualizando seat chart:', error);
        }
    }

    // Metodo 'on' para registrar callbacks
    on(event, callback) {
        const eventMap = {
            'update': 'onUpdate',
            'loading': 'onLoading',
            'error': 'onError'
        };
        
        if (eventMap[event]) {
            this.callbacks[eventMap[event]] = callback;
        } else {
            console.warn('[WARN] Evento no soportado:', event);
        }
    }

    // Metodo para actualizar sliders en UI
    updateSlidersUI(porcentajes = null) {
        const porcentajesActuales = porcentajes || this.porcentajes;
        console.log('[DEBUG] Actualizando sliders UI con porcentajes:', porcentajesActuales);
        
        for (const [partido, porcentaje] of Object.entries(porcentajesActuales)) {
            const slider = document.getElementById('shock-' + partido.toLowerCase());
            const valueBox = document.getElementById('shock-value-' + partido.toLowerCase());
            
            if (slider && valueBox) {
                console.log('[DEBUG] Actualizando slider ' + partido + ': ' + porcentaje + '%');
                
                slider.value = porcentaje.toFixed(1);
                valueBox.textContent = porcentaje.toFixed(1) + '%';
                
                if (window.controlSidebar && window.controlSidebar.partidosData) {
                    const partidoUpper = partido.toUpperCase();
                    if (window.controlSidebar.partidosData[partidoUpper]) {
                        window.controlSidebar.partidosData[partidoUpper].porcentajeActual = porcentaje;
                    }
                }
            } else {
                console.warn('[WARN] No se encontro slider para ' + partido);
            }
        }
        
        console.log('[DEBUG] Sliders UI actualizados');
    }

    // Metodo para normalizar porcentajes a 100%
    normalizePorcentajes(porcentajes) {
        const total = Object.values(porcentajes).reduce((sum, val) => sum + val, 0);
        if (total === 0) return porcentajes;
        
        const factor = 100 / total;
        const normalized = {};
        Object.keys(porcentajes).forEach(partido => {
            normalized[partido] = porcentajes[partido] * factor;
        });
        
        return normalized;
    }

    // Metodo para obtener estado actual
    getState() {
        return {
            porcentajes: this.porcentajes,
            result: this.result,
            loading: this.loading,
            error: this.error,
            config: this.config
        };
    }
}

// Instancia global
// 🆕 Crear instancia mínima para compatibilidad (no se usa activamente)
window.voteRedistribution = new VoteRedistribution();

export default VoteRedistribution;
