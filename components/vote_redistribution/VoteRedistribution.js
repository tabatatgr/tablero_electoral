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
        console.log('[DEBUG] fetchResultados llamado - porcentajes actuales:', this.porcentajes);
        
        if (!this.porcentajes || Object.keys(this.porcentajes).length === 0) {
            console.warn('[WARN] No hay porcentajes para enviar al backend');
            return;
        }
        
        if (this.loading) {
            console.log('[DEBUG] Ya hay una peticion en progreso, saltando...');
            return;
        }

        const total = Object.values(this.porcentajes).reduce((sum, val) => sum + val, 0);
        console.log('[DEBUG] Suma de porcentajes:', total.toFixed(2) + '%');
        
        if (total < 90 || total > 110) {
            console.error('[ERROR] Porcentajes desbalanceados:', total.toFixed(2) + '%');
            this.setError('Porcentajes invalidos: ' + total.toFixed(1) + '%');
            return;
        }

        this.setLoading(true);
        this.setError(null);

        try {
            let configActual = { ...this.config };
            
            if (this.config.camara === 'senadores' || this.config.camara === 'senado') {
                configActual = {
                    ...configActual,
                    mr_seats: 64,
                    rp_seats: 64,
                    escanos_totales: 128
                };
            } else {
                configActual = {
                    ...configActual,
                    mr_seats: 300,
                    rp_seats: 200,
                    escanos_totales: 500
                };
            }
            
            // CORRECCION: Separar parametros entre query string y body segun backend
            // Parametros que van en query string
            const queryParams = new URLSearchParams({
                anio: String(configActual.anio),
                plan: 'personalizado',
                mr_seats: String(configActual.mr_seats),
                rp_seats: String(configActual.rp_seats),
                escanos_totales: String(configActual.escanos_totales),
                umbral: String(configActual.umbral),
                sobrerrepresentación: String(configActual.sobrerrepresentacion || 8),
                reparto_mode: configActual.reparto_mode,
                reparto_method: configActual.reparto_method,
                usar_coaliciones: String(configActual.usar_coaliciones)
            });
            
            // Parametros que van en el body
            const formData = new URLSearchParams({
                porcentajes_partidos: JSON.stringify(this.porcentajes),
                partidos_fijos: JSON.stringify({}),
                overrides_pool: JSON.stringify({})
            });

            const API_BASE = 'https://back-electoral.onrender.com';
            const camaraEndpoint = this.config.camara === 'senadores' || this.config.camara === 'senado' ? 'senado' : 'diputados';
            const fullURL = API_BASE + '/procesar/' + camaraEndpoint + '?' + queryParams.toString();
            
            console.log('[DEBUG] Enviando peticion:', {
                url: fullURL,
                camara: this.config.camara,
                endpoint: camaraEndpoint,
                porcentajes: this.porcentajes,
                config: configActual,
                queryParams: Object.fromEntries(queryParams.entries()),
                bodyData: Object.fromEntries(formData.entries())
            });
            
            // CORRECCION: Metodo POST con headers y body correctos
            const res = await fetch(fullURL, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData
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
            this.result = data;
            this.notifyUpdate();

        } catch (error) {
            this.setError(error.message);
            console.error('Error fetching resultados:', error);
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
    }

    setError(error) {
        this.error = error;
        if (this.callbacks.onError) {
            this.callbacks.onError(error);
        }
    }

    notifyUpdate() {
        if (this.callbacks.onUpdate) {
            this.callbacks.onUpdate(this.result);
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
window.voteRedistribution = new VoteRedistribution();

export default VoteRedistribution;
