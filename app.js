const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const estudianteController = require('./controllers/estudianteController');

// Función para leer el cuerpo de la petición (Body Parser Manual)
const getBodyData = (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
  });
};

// Función para responder en formato JSON
const sendJSON = (res, status, data) => {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Manejo de CORS Preflight (OPTIONS)
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  try {
    // --- RUTAS DE DOCUMENTACIÓN ---

    // Servir el archivo swagger.json para que sea "documentado en Swagger"
    if (pathname === '/api-docs' || pathname === '/swagger.json') {
      const swaggerPath = path.join(__dirname, 'swagger.json');
      const swaggerData = fs.readFileSync(swaggerPath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      return res.end(swaggerData);
    }

    // --- RUTAS DE LA API ---

    // 1. Obtener materias para el desplegable del celular
    if (pathname === '/api/estudiantes/config/materias' && method === 'GET') {
      await estudianteController.obtenerMaterias(req, res, sendJSON);
    }

    // 2. Buscar estudiantes por nombre (?nombre=...) o listar todos
    else if (pathname === '/api/estudiantes' && method === 'GET') {
      req.query = parsedUrl.query;
      await estudianteController.listarEstudiantes(req, res, sendJSON);
    }

    // 3. Obtener estudiante por cédula (/api/estudiantes/12345)
    else if (pathname.startsWith('/api/estudiantes/') && method === 'GET' && !pathname.includes('notas')) {
      const cedula = pathname.split('/').pop();
      req.params = { cedula };
      await estudianteController.obtenerEstudiante(req, res, sendJSON);
    }

    // 4. Registrar nuevo estudiante
    else if (pathname === '/api/estudiantes' && method === 'POST') {
      req.body = await getBodyData(req);
      await estudianteController.registrarEstudiante(req, res, sendJSON);
    }

    // 5. Actualizar notas (/api/estudiantes/notas/12345)
    else if (pathname.startsWith('/api/estudiantes/notas/') && method === 'PUT') {
      const cedula = pathname.split('/').pop();
      req.params = { cedula };
      req.body = await getBodyData(req);
      await estudianteController.actualizarNotas(req, res, sendJSON);
    }

    // Ruta de bienvenida / Prueba
    else if (pathname === '/' && method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<h1>Backend de Notas Nativo (Node Agnóstico) funcionando 🚀</h1><p>Doc: <a href="/api-docs">/api-docs</a></p>');
    }

    // Ruta no encontrada
    else {
      sendJSON(res, 404, { error: 'Ruta no encontrada' });
    }

  } catch (error) {
    console.error(error);
    sendJSON(res, 500, { error: 'Error interno del servidor', detalles: error.message });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor nativo (Agnóstico) corriendo en puerto ${PORT}`);
  console.log(`Documentación Swagger JSON en: http://localhost:${PORT}/api-docs`);
});
