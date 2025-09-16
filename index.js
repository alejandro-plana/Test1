import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for development
}));
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const execAsync = promisify(exec);

// Ensure downloads directory exists
const DOWNLOADS_DIR = path.join(__dirname, 'downloads');
await fs.ensureDir(DOWNLOADS_DIR);

// Helper function to validate URL
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Helper function to check if spotdl is available
async function checkSpotDL() {
  try {
    await execAsync('spotdl --version');
    return true;
  } catch (error) {
    console.log('SpotDL not found, installing...');
    try {
      await execAsync('pip install spotdl', { timeout: 60000 });
      console.log('SpotDL installed successfully');
      return true;
    } catch (installError) {
      console.error('Failed to install SpotDL:', installError.message);
      return false;
    }
  }
}

// Main route - serve the frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Download endpoint
app.post('/api/download', async (req, res) => {
  const { url, format = 'mp3' } = req.body;

  // Validate input
  if (!url) {
    return res.status(400).json({ 
      success: false, 
      error: 'URL de la canción es requerida' 
    });
  }

  if (!isValidUrl(url)) {
    return res.status(400).json({ 
      success: false, 
      error: 'URL inválida' 
    });
  }

  // Validate format
  const allowedFormats = ['mp3', 'm4a', 'flac', 'wav'];
  if (!allowedFormats.includes(format)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Formato no soportado' 
    });
  }

  try {
    // Check if SpotDL is available
    const spotdlAvailable = await checkSpotDL();
    if (!spotdlAvailable) {
      return res.status(500).json({ 
        success: false, 
        error: 'SpotDL no está disponible. Intenta usar yt-dlp como alternativa.' 
      });
    }

    // Generate unique filename prefix
    const timestamp = Date.now();
    const outputTemplate = path.join(DOWNLOADS_DIR, `song_${timestamp}.%(ext)s`);

    // Construct the spotdl command
    const command = `spotdl "${url}" --output "${outputTemplate}" --format ${format} --threads 1`;

    console.log('Executing command:', command);

    // Execute download command with timeout
    const { stdout, stderr } = await execAsync(command, { 
      timeout: 120000, // 2 minutes timeout
      cwd: DOWNLOADS_DIR 
    });

    console.log('SpotDL stdout:', stdout);
    if (stderr) console.log('SpotDL stderr:', stderr);

    // Find the downloaded file
    const files = await fs.readdir(DOWNLOADS_DIR);
    const downloadedFile = files.find(file => 
      file.startsWith(`song_${timestamp}`) && 
      file.endsWith(`.${format}`)
    );

    if (!downloadedFile) {
      // Fallback: try to find any recently created file with the right format
      const recentFiles = files.filter(file => {
        const filePath = path.join(DOWNLOADS_DIR, file);
        const stats = fs.statSync(filePath);
        const fileAge = Date.now() - stats.birthtime.getTime();
        return file.endsWith(`.${format}`) && fileAge < 180000; // 3 minutes
      });

      if (recentFiles.length === 0) {
        return res.status(500).json({ 
          success: false, 
          error: 'La descarga falló o el archivo no se encontró' 
        });
      }

      const latestFile = recentFiles.sort((a, b) => {
        const aStats = fs.statSync(path.join(DOWNLOADS_DIR, a));
        const bStats = fs.statSync(path.join(DOWNLOADS_DIR, b));
        return bStats.birthtime.getTime() - aStats.birthtime.getTime();
      })[0];

      const newFilename = `song_${timestamp}.${format}`;
      await fs.rename(
        path.join(DOWNLOADS_DIR, latestFile),
        path.join(DOWNLOADS_DIR, newFilename)
      );

      const downloadedFile = newFilename;
    }

    // Extract metadata from filename or stdout
    let title = 'Canción descargada';
    let artist = 'Artista desconocido';

    // Try to extract info from spotdl output
    const outputLines = stdout.split('\n');
    for (const line of outputLines) {
      if (line.includes('Downloaded:') || line.includes('Downloading:')) {
        const match = line.match(/(?:Downloaded:|Downloading:)\s*(.+?)(?:\s*-\s*(.+))?$/);
        if (match) {
          if (match[2]) {
            artist = match[1].trim();
            title = match[2].trim();
          } else {
            title = match[1].trim();
          }
        }
      }
    }

    // Return success response with download link
    res.json({
      success: true,
      title,
      artist,
      format,
      filename: downloadedFile,
      downloadUrl: `/downloads/${downloadedFile}`
    });

    // Clean up old files after 1 hour
    setTimeout(async () => {
      try {
        const filePath = path.join(DOWNLOADS_DIR, downloadedFile);
        if (await fs.pathExists(filePath)) {
          await fs.remove(filePath);
          console.log(`Cleaned up file: ${downloadedFile}`);
        }
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
    }, 3600000); // 1 hour

  } catch (error) {
    console.error('Download error:', error);
    
    let errorMessage = 'Error interno del servidor';
    
    if (error.message.includes('timeout')) {
      errorMessage = 'La descarga tomó demasiado tiempo. Intenta con otra canción.';
    } else if (error.message.includes('not found') || error.stderr?.includes('not found')) {
      errorMessage = 'Canción no encontrada. Verifica la URL.';
    } else if (error.stderr?.includes('rate')) {
      errorMessage = 'Límite de descargas alcanzado. Intenta más tarde.';
    } else if (error.stderr) {
      errorMessage = `Error de SpotDL: ${error.stderr.slice(0, 200)}`;
    }

    res.status(500).json({ 
      success: false, 
      error: errorMessage 
    });
  }
});

// Serve downloaded files
app.get('/downloads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(DOWNLOADS_DIR, filename);
  
  // Security check: ensure the file is within downloads directory
  if (!filePath.startsWith(DOWNLOADS_DIR)) {
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Archivo no encontrado' });
  }

  // Set appropriate headers
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', 'audio/mpeg');
  
  // Stream the file
  res.sendFile(filePath);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'SpotDL Song Downloader' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado' });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🎵 SpotDL Song Downloader listening on port ${PORT}`);
  console.log(`📁 Downloads directory: ${DOWNLOADS_DIR}`);
});
