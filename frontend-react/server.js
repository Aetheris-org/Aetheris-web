import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5173;

// Отдаем статические файлы из dist
app.use(express.static(join(__dirname, 'dist')));

// Для всех остальных роутов отдаем index.html (SPA fallback)
app.get('*', (req, res) => {
  try {
    const indexPath = join(__dirname, 'dist', 'index.html');
    const indexHtml = readFileSync(indexPath, 'utf-8');
    res.setHeader('Content-Type', 'text/html');
    res.send(indexHtml);
  } catch (error) {
    console.error('Error serving index.html:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📦 Serving static files from: ${join(__dirname, 'dist')}`);
});

