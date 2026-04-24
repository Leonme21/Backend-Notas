const Estudiante = require('../models/estudianteModel');
const pool = require('../config/db');

// 1. Registrar Estudiante
exports.registrarEstudiante = async (req, res) => {
  const client = await pool.connect();

  try {
    const { cedula, nombre, correo, celular, materia } = req.body;
    // 1. PRIMERO validamos si la materia existe
    const materiaEncontrada = await Estudiante.findMateriaByName(materia);
    if (!materiaEncontrada) {
      return res.status(400).json({ error: `La materia '${materia}' no existe en el sistema.` });
    }
    // 2. Iniciamos la transacción
    await client.query('BEGIN');
    // 3. Crear el estudiante
    const nuevoEstudiante = await Estudiante.create(cedula, nombre, correo, celular);
    // 4. Asignar la materia
    await Estudiante.asignarMateria(nuevoEstudiante.id, materiaEncontrada.id);
    // 5. Si todo salió bien, confirmamos los cambios
    await client.query('COMMIT');
    res.status(201).json({
      message: 'Estudiante registrado con éxito',
      estudiante: nuevoEstudiante
    });
  } catch (error) {
    // Si algo falló, deshacemos todo lo que se alcanzó a hacer
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Error al registrar. Verifica si la cédula ya existe.' });
  } finally {
    client.release(); // Liberamos la conexión
  }
};

// 3. Actualizar notas del estudiante
exports.actualizarNotas = async (req, res) => {
  try {
    const { cedula } = req.params;
    const { nota1, nota2, nota3, nota4 } = req.body;

    const notasActualizadas = await Estudiante.updateNotas(cedula, { nota1, nota2, nota3, nota4 });

    if (!notasActualizadas) {
      return res.status(404).json({ error: 'No se pudo actualizar, verifique la cédula' });
    }

    res.json({ message: 'Notas actualizadas con éxito', notas: notasActualizadas });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar las notas' });
  }
};

// 4. Buscar estudiante por nombre
// Buscar por nombre (Query Params)
exports.listarEstudiantes = async (req, res) => {
  try {
    const { nombre } = req.query;

    if (nombre) {
      const estudiantes = await Estudiante.getByName(nombre);
      return res.json(estudiantes);
    }

    // Si no hay nombre, podríamos devolver todos (opcional)
    res.json([]);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar estudiantes por nombre' });
  }
};

// Buscar estudiante por cédula (Esta es la que falta)
exports.obtenerEstudiante = async (req, res) => {
  try {
    const { cedula } = req.params;
    const estudiante = await Estudiante.getByCedula(cedula);

    if (!estudiante) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }

    res.json(estudiante);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar el estudiante' });
  }
};


exports.obtenerMaterias = async (req, res) => {
  try {
    const materias = await Estudiante.getAllMaterias();
    res.json(materias);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener materias' });
  }
};
