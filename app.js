const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Middlewares
app.use(cors());
app.use(express.json());

// 2. Configuración de Swagger
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Notas Universitarias',
      version: '1.0.0',
      description: 'Documentación de la API para el registro de estudiantes y notas',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
  },
  apis: ['./routes/*.js'], 
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// 3. Rutas
const estudiantesRoutes = require('./routes/estudiantesRoutes');
app.use('/api/estudiantes', estudiantesRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('API de Notas funcionando 🚀');
});

// 4. Servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📖 Documentación disponible en http://localhost:${PORT}/api-docs`);
});
