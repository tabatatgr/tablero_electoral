import numpy as np

def mae_votos_vs_escanos(votos, escanos):
    """
    Calcula el MAE (mean absolute error) entre el porcentaje de votos y el porcentaje de escaños.
    votos: array-like o dict con votos por partido
    escanos: array-like o dict con escaños por partido
    """
    votos = np.array(list(votos.values()) if isinstance(votos, dict) else votos, dtype=float)
    escanos = np.array(list(escanos.values()) if isinstance(escanos, dict) else escanos, dtype=float)
    total_votos = np.sum(votos)
    total_escanos = np.sum(escanos)
    if total_votos == 0 or total_escanos == 0:
        return 0.0
    pct_votos = votos / total_votos
    pct_escanos = escanos / total_escanos
    return float(np.mean(np.abs(pct_votos - pct_escanos)))

def indice_gallagher(votos, escanos):
    """
    Calcula el índice de Gallagher entre el porcentaje de votos y el porcentaje de escaños.
    votos: array-like o dict con votos por partido
    escanos: array-like o dict con escaños por partido
    """
    votos = np.array(list(votos.values()) if isinstance(votos, dict) else votos, dtype=float)
    escanos = np.array(list(escanos.values()) if isinstance(escanos, dict) else escanos, dtype=float)
    total_votos = np.sum(votos)
    total_escanos = np.sum(escanos)
    if total_votos == 0 or total_escanos == 0:
        return 0.0
    pct_votos = votos / total_votos
    pct_escanos = escanos / total_escanos
    return float(np.sqrt(np.sum((pct_votos - pct_escanos) ** 2) / 2))

def kpis_votos_escanos(votos, escanos):
    """
    Calcula todos los KPIs relevantes y los devuelve en un diccionario.
    """
    return {
        'mae_votos_vs_escanos': mae_votos_vs_escanos(votos, escanos),
        'indice_gallagher': indice_gallagher(votos, escanos)
    }

def calcular_kpis_electorales(resultado_simulacion):
    """
    Calcula KPIs electorales basados en el resultado de una simulación.
    
    Args:
        resultado_simulacion: Diccionario con el resultado de procesar_senadores o procesar_diputados
    
    Returns:
        dict: KPIs calculados
    """
    try:
        if not resultado_simulacion or 'resultado' not in resultado_simulacion:
            return {"error": "Datos de simulación inválidos"}
        
        resultado = resultado_simulacion['resultado']
        
        # Extraer votos y escaños de los resultados
        votos = {}
        escanos_totales = {}
        escanos_mr = {}
        escanos_rp = {}
        
        for partido_data in resultado:
            partido = partido_data['party']
            votos[partido] = partido_data.get('votes', 0)
            escanos_totales[partido] = partido_data.get('seats', 0)
            escanos_mr[partido] = partido_data.get('mr_seats', 0)
            escanos_rp[partido] = partido_data.get('rp_seats', 0)
        
        # Calcular KPIs básicos
        total_votos = sum(votos.values())
        total_escanos = sum(escanos_totales.values())
        total_escanos_mr = sum(escanos_mr.values())
        total_escanos_rp = sum(escanos_rp.values())
        
        # KPIs de proporcionalidad
        kpis_prop = kpis_votos_escanos(votos, escanos_totales)
        
        # Encontrar partido mayoritario
        partido_mayoritario = max(escanos_totales.items(), key=lambda x: x[1])
        
        # Efectividad de votos (votos que contribuyeron a ganar escaños)
        votos_efectivos = sum(votos[p] for p in votos if escanos_totales.get(p, 0) > 0)
        efectividad_votos = (votos_efectivos / total_votos * 100) if total_votos > 0 else 0
        
        kpis = {
            "total_votos": int(total_votos),
            "total_escanos": int(total_escanos),
            "escanos_mr": int(total_escanos_mr),
            "escanos_rp": int(total_escanos_rp),
            "partido_mayoritario": {
                "nombre": partido_mayoritario[0] if partido_mayoritario else "N/A",
                "escanos": int(partido_mayoritario[1]) if partido_mayoritario else 0,
                "porcentaje": round(partido_mayoritario[1] / total_escanos * 100, 2) if total_escanos > 0 and partido_mayoritario else 0
            },
            "proporcionalidad": {
                "mae_votos_escanos": round(kpis_prop['mae_votos_vs_escanos'], 4),
                "indice_gallagher": round(kpis_prop['indice_gallagher'], 4)
            },
            "efectividad_votos": round(efectividad_votos, 2),
            "numero_partidos_con_escanos": len([p for p in escanos_totales if escanos_totales[p] > 0])
        }
        
        return kpis
        
    except Exception as e:
        return {"error": f"Error calculando KPIs: {str(e)}"}

def formato_seat_chart(resultado_simulacion):
    """
    Formatea los datos para el componente seat-chart del frontend.
    
    Args:
        resultado_simulacion: Diccionario con el resultado de procesar_senadores o procesar_diputados
    
    Returns:
        dict: Datos formateados para el seat-chart
    """
    try:
        if not resultado_simulacion or 'resultado' not in resultado_simulacion:
            return {"error": "Datos de simulación inválidos"}
        
        resultado = resultado_simulacion['resultado']
        
        # Mapeo de colores por partido (puedes personalizar estos colores)
        colores_partidos = {
            'MORENA': '#8B4513',    # Marrón
            'PAN': '#1E90FF',       # Azul
            'PRI': '#FF0000',       # Rojo
            'PRD': '#FFD700',       # Amarillo
            'PT': '#FF69B4',        # Rosa
            'PVEM': '#00FF00',      # Verde
            'MC': '#FFA500',        # Naranja
            'PES': '#800080',       # Púrpura
            'NA': '#808080',        # Gris
            'RSP': '#00FFFF',       # Cian
            'FXM': '#FF1493',       # Rosa intenso
            'CI': '#32CD32'         # Verde lima
        }
        
        seat_data = []
        seat_id = 1
        
        for partido_data in resultado:
            partido = partido_data['party']
            escanos = partido_data.get('seats', 0)
            
            if escanos > 0:
                # Crear un asiento por cada escaño
                for i in range(escanos):
                    seat_data.append({
                        "id": seat_id,
                        "party": partido,
                        "color": colores_partidos.get(partido, '#999999'),
                        "seats": 1
                    })
                    seat_id += 1
        
        # Resumen para el seat-chart
        seat_chart = {
            "seats": seat_data,
            "total_seats": len(seat_data),
            "summary": [
                {
                    "party": partido_data['party'],
                    "seats": partido_data.get('seats', 0),
                    "color": colores_partidos.get(partido_data['party'], '#999999'),
                    "percentage": round(partido_data.get('seats', 0) / len(seat_data) * 100, 2) if seat_data else 0
                }
                for partido_data in resultado
                if partido_data.get('seats', 0) > 0
            ]
        }
        
        return seat_chart
        
    except Exception as e:
        return {"error": f"Error formateando seat-chart: {str(e)}"}
