# 🎵 Descargador de Canciones con SpotDL

Una aplicación web simple para descargar música de Spotify, YouTube y otras plataformas usando SpotDL, diseñada para ser desplegada en Vercel.

## Características

- ✨ Interfaz web moderna y responsiva
- 🎵 Descarga música de múltiples plataformas:
  - Spotify
  - YouTube / YouTube Music  
  - SoundCloud
  - Y más...
- 🎧 Múltiples formatos de audio soportados (MP3, M4A, FLAC)
- ⚡ API RESTful para integraciones
- 🚀 Optimizado para Vercel
- 🔒 Limpieza automática de archivos temporales

## Plataformas Soportadas

- **Spotify**: `https://open.spotify.com/track/...`
- **YouTube**: `https://www.youtube.com/watch?v=...`
- **YouTube Music**: `https://music.youtube.com/watch?v=...`
- **SoundCloud**: `https://soundcloud.com/...`

## Uso

### Interfaz Web

1. Visita la página principal
2. Pega la URL de la canción
3. Selecciona el formato deseado
4. Haz clic en "Descargar Canción"
5. Una vez completado, descarga el archivo

### API

#### Descargar canción

```bash
POST /api/download
Content-Type: application/json

{
  "url": "https://open.spotify.com/track/...",
  "format": "mp3"
}
```

#### Respuesta exitosa

```json
{
  "success": true,
  "title": "Nombre de la canción",
  "artist": "Nombre del artista",
  "format": "mp3",
  "filename": "song_1234567890.mp3",
  "downloadUrl": "/downloads/song_1234567890.mp3"
}
```

#### Health Check

```bash
GET /api/health
```

## Despliegue en Vercel

1. Fork este repositorio
2. Conecta tu cuenta de Vercel
3. Importa el proyecto
4. Vercel automáticamente detectará la configuración
5. ¡Despliega!

### Variables de Entorno (Opcional)

```bash
NODE_ENV=production
```

## Desarrollo Local

### Requisitos

- Node.js 18+
- Python 3.7+ (para SpotDL)
- pip (para instalar SpotDL)

### Instalación

```bash
# Clonar el repositorio
git clone <tu-repo>
cd spotdl-song-downloader

# Instalar dependencias de Node.js
npm install

# SpotDL se instalará automáticamente en el primer uso
# O instalarlo manualmente:
pip install spotdl

# Ejecutar en modo desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## Estructura del Proyecto

```
├── public/           # Archivos estáticos (HTML, CSS, JS)
│   └── index.html   # Interfaz principal
├── downloads/       # Directorio temporal para descargas
├── index.js         # Servidor principal
├── package.json     # Dependencias de Node.js
├── vercel.json      # Configuración de Vercel
└── README.md        # Este archivo
```

## Tecnologías Utilizadas

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3, JavaScript vanilla
- **Descarga**: SpotDL (Python)
- **Despliegue**: Vercel
- **Seguridad**: Helmet.js, CORS

## Características de Seguridad

- ✅ Validación de URLs
- ✅ Sanitización de nombres de archivo
- ✅ Limpieza automática de archivos temporales
- ✅ Límites de tiempo de ejecución
- ✅ Headers de seguridad con Helmet
- ✅ CORS configurado

## Limitaciones

- Los archivos se eliminan automáticamente después de 1 hora
- Tiempo límite de descarga de 2 minutos por canción
- Depende de la disponibilidad de SpotDL y las APIs de las plataformas

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto es de código abierto. Úsalo responsablemente y respeta los términos de servicio de las plataformas de las que descargas contenido.

## Aviso Legal

Esta herramienta es solo para uso educativo y personal. Asegúrate de tener los derechos necesarios para descargar el contenido. El uso de esta aplicación es bajo tu propia responsabilidad.