const express = require('express');
const router = express.Router();
const estudianteController = require('../controllers/estudianteController');


// Ruta para que la App móvil sepa qué materias existen
router.get('/config/materias', estudianteController.obtenerMaterias);

/**
 * @swagger
 * /api/estudiantes:
 *   get:
 *     summary: Busca estudiantes por nombre usando query params (?nombre=...)
 *     tags: [Estudiantes]
 *     parameters:
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de estudiantes encontrados
 */
router.get('/', estudianteController.listarEstudiantes);

/**
 * @swagger
 * /api/estudiantes/{cedula}:
 *   get:
 *     summary: Obtiene información y notas del estudiante
 *     tags: [Estudiantes]
 *     parameters:
 *       - in: path
 *         name: cedula
 *         required: true
 *         schema: {type: string}
 *     responses:
 *       200: {description: Éxito}
 */
router.get('/:cedula', estudianteController.obtenerEstudiante);

/**
 * @swagger
 * /api/estudiantes:
 *   post:
 *     summary: Registra un nuevo estudiante
 *     tags: [Estudiantes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cedula: {type: string}
 *               nombre: {type: string}
 *               correo: {type: string}
 *               celular: {type: string}
 *               materia: {type: string}
 *     responses:
 *       201: {description: Éxito}
 */
router.post('/', estudianteController.registrarEstudiante);


/**
 * @swagger
 * /api/estudiantes/notas/{cedula}:
 *   put:
 *     summary: Actualiza las notas
 *     tags: [Estudiantes]
 *     parameters:
 *       - in: path
 *         name: cedula
 *         required: true
 *         schema: {type: string}
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nota1: {type: number}
 *               nota2: {type: number}
 *               nota3: {type: number}
 *               nota4: {type: number}
 *     responses:
 *       200: {description: Éxito}
 */
router.put('/notas/:cedula', estudianteController.actualizarNotas);

module.exports = router;
