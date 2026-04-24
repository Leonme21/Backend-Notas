const Estudiante = require('../models/estudianteModel');
const pool = require('../config/db');

// 1. Obtener todas las materias 
exports.obtenerMaterias = async (req, res, sendJSON) => {
  try {
    const materias = await Estudiante.getAllMaterias();
    sendJSON(res, 200, materias);
  } catch (error) {
    sendJSON(res, 500, { error: 'Error al obtener materias', detalles: error.message });
  }
};

// 2. Registrar Estudiante 
exports.registrarEstudiante = async (req, res, sendJSON) => {
  const { cedula, nombre, correo, celular, materia } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Crear estudiante
    const queryEstudiante = 'INSERT INTO estudiantes (cedula, nombre, correo, celular) VALUES ($1, $2, $3, $4) RETURNING id';
    const resEstudiante = await client.query(queryEstudiante, [cedula, nombre, correo, celular]);
    const estudianteId = resEstudiante.rows[0].id;

    // Buscar materia
    const queryMateria = 'SELECT id FROM materias WHERE nombre = $1';
    const resMateria = await client.query(queryMateria, [materia]);

    if (resMateria.rows.length === 0) {
      throw new Error('La materia especificada no existe');
    }
    const materiaId = resMateria.rows[0].id;

    // Asignar materia
    const queryNotas = 'INSERT INTO notas (estudiante_id, materia_id, nota1, nota2, nota3, nota4) VALUES ($1, $2, 0, 0, 0, 0)';
    await client.query(queryNotas, [estudianteId, materiaId]);

    await client.query('COMMIT');
    sendJSON(res, 201, { message: 'Estudiante registrado con éxito' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    sendJSON(res, 500, { error: 'Error al registrar', detalles: error.message });
  } finally {
    client.release();
  }
};

// 3. Buscar estudiante por nombre 
exports.listarEstudiantes = async (req, res, sendJSON) => {
  try {
    const { nombre } = req.query;
    if (nombre) {
      const estudiantes = await Estudiante.getByName(nombre);
      return sendJSON(res, 200, estudiantes);
    }
    sendJSON(res, 200, []);
  } catch (error) {
    sendJSON(res, 500, { error: 'Error al buscar por nombre' });
  }
};

// 4. Obtener por cédula
exports.obtenerEstudiante = async (req, res, sendJSON) => {
  try {
    const { cedula } = req.params;
    const estudiante = await Estudiante.getByCedula(cedula);
    if (!estudiante) {
      return sendJSON(res, 404, { error: 'Estudiante no encontrado' });
    }
    sendJSON(res, 200, estudiante);
  } catch (error) {
    sendJSON(res, 500, { error: 'Error al buscar estudiante' });
  }
};

// 5. Actualizar notas
exports.actualizarNotas = async (req, res, sendJSON) => {
  try {
    const { cedula } = req.params;
    const { nota1, nota2, nota3, nota4 } = req.body;
    const notasActualizadas = await Estudiante.updateNotas(cedula, { nota1, nota2, nota3, nota4 });

    if (!notasActualizadas) {
      return sendJSON(res, 404, { error: 'No se pudo actualizar' });
    }
    sendJSON(res, 200, { message: 'Notas actualizadas', notas: notasActualizadas });
  } catch (error) {
    sendJSON(res, 500, { error: 'Error al actualizar', detalles: error.message });
  }
};
