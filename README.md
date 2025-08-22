# Tablero Electoral - Dashboard de Impacto de Reformas

Un dashboard interactivo para visualizar el impacto de diferentes reformas electorales en la composición del Congreso mexicano.

## Características

### 🏛️ Visualización de Cámaras
- **Cámara de Diputados** (500 escaños)
- **Cámara de Senadores** (128 escaños)
- Visualización de escaños por partido político con colores distintivos

### ⚙️ Parámetros Configurables
- **Coalición**: Activar/desactivar coalición del siglado
- **Magnitud**: Definir por Total de Cámara, Circunscripción, Estado o Distrito
- **Reglas**: Selección entre RM, RP o sistema Mixto
- **Método de reparto RP**: Cociente + restos (Hare, Droop) o Divisores (D'Hondt)
- **Umbral de inclusión**: Nacional o Estatal
- **Primera minoría**: Configuración de escaños MR como PM
- **Shocks de votación**: Multiplicador o Delta (PP)
- **Límites de representación**: Para diputados
- **Distritos editables**: Reasignación de distritos (Fase 2)

### 📊 Indicadores Clave
- **Total de escaños**: Número total con % de cambio
- **Índice de Gallagher**: Medición de proporcionalidad
- **% votos vs. % escaños**: Diferencia promedio
- **Total de votos**: Conteo total de votos válidos

### 🎛️ Controles Interactivos
- **Selección de año**: 2018, 2021, 2024
- **Modelos**: Vigente, Plan A, Plan C, Personalizado
- **Switches**: Para activar/desactivar funcionalidades
- **Radio buttons**: Para selecciones exclusivas
- **Dropdowns**: Para opciones múltiples

## Tecnologías

### Frontend
- **HTML5**: Estructura semántica y accesible
- **CSS3**: Diseño responsive con variables CSS y Flexbox/Grid
- **JavaScript**: Interactividad y gestión de estado
- **Fuentes**: Noto Sans (UI) y Roboto (datos)

### Colores del Sistema
```css
/* Neutros */
--Neutro-100: #FFFFFF
--Neutro-200: #F9F9F9
--Neutro-300: #F3F3F3
--Neutro-400: #DDDDDD
--Neutro-500: #AAAAAA
--Neutro-600: #767676
--Neutro-700: #434343
--Neutro-800: #161A1D

/* Terciarios */
--Green-600: #002F2A
--Green-500: #1E5B4F
```

### Partidos Políticos
- **MORENA**: #8B2231
- **PAN**: #0055A5
- **PRI**: #0D7137
- **PT**: #D52B1E
- **PVEM**: #5CE23D
- **MC**: #F58025
- **PRD**: #FFCC00

## Estructura del Proyecto

```
tablero_electoral/
├── index.html          # Estructura principal
├── style.css           # Estilos y diseño
├── script.js           # Funcionalidad JavaScript
├── package.json        # Configuración del proyecto
├── LICENSE             # Licencia
└── README.md           # Documentación
```

## Instalación y Uso

### Requisitos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- No requiere instalación de dependencias

### Ejecución Local
1. Clona el repositorio:
   ```bash
   git clone https://github.com/usuario/tablero_electoral.git
   cd tablero_electoral
   ```

2. Abre `index.html` en tu navegador web o usa un servidor local:
   ```bash
   # Con Python 3
   python -m http.server 8000
   
   # Con Node.js (http-server)
   npx http-server
   
   # Con PHP
   php -S localhost:8000
   ```

3. Navega a `http://localhost:8000`

## Funcionalidades

### Interactividad
- **Cambio de cámara**: Alterna entre Diputados y Senadores
- **Selección temporal**: Elige año electoral (2018, 2021, 2024)
- **Modelos de reforma**: Compara diferentes propuestas
- **Configuración de parámetros**: Ajusta reglas electorales
- **Visualización en tiempo real**: Los cambios se reflejan inmediatamente

### Accesibilidad
- **ARIA labels**: Para lectores de pantalla
- **Navegación por teclado**: Tab, Enter y Space
- **Contraste adecuado**: WCAG 2.1 AA compliant
- **Foco visible**: Indicadores claros de elemento activo
- **Texto alternativo**: Para elementos gráficos

### Responsive Design
- **Desktop**: 1440px (diseño principal)
- **Tablet**: 768px - 1199px (adaptado)
- **Mobile**: < 768px (layout vertical)

## API y Datos

### Estructura de Datos
Los resultados se calculan basándose en:
- Datos electorales históricos
- Parámetros de configuración del usuario
- Fórmulas de asignación de escaños
- Simulaciones de diferentes escenarios

### Cálculos Principales
1. **Asignación proporcional**: Según método seleccionado
2. **Aplicación de umbrales**: Nacional/estatal
3. **Distribución territorial**: Por estado/distrito
4. **Efectos de coalición**: Agregación de votos
5. **Primera minoría**: Asignación especial

## Desarrollo

### Estructura del CSS
- **Variables globales**: Colores y espaciado
- **Reset y base**: Normalización
- **Componentes**: Modulares y reutilizables
- **Layout**: Grid y Flexbox
- **Estados**: Hover, focus, active
- **Responsive**: Media queries
- **Animaciones**: Transiciones suaves

### JavaScript Patterns
- **Event delegation**: Manejo eficiente de eventos
- **State management**: Control de estado de la aplicación
- **Modular functions**: Funciones específicas y reutilizables
- **Async operations**: Carga de datos simulada
- **Error handling**: Gestión de errores

## Contribución

### Guidelines
1. Seguir la estructura de código existente
2. Mantener la accesibilidad como prioridad
3. Probar en múltiples navegadores
4. Documentar cambios significativos
5. Respetar el diseño visual establecido

### Pull Requests
- Describe claramente los cambios
- Incluye screenshots si aplica
- Verifica que no haya errores de consola
- Asegúrate de que el diseño responsive funcione

## Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles.

## Contacto

Para preguntas, sugerencias o reportes de bugs, por favor abre un issue en GitHub.

---

**Nota**: Este es un proyecto de demostración para visualizar el impacto de reformas electorales. Los datos y cálculos son simulados para propósitos educativos y de análisis.
