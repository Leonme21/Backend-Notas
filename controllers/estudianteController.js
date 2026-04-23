const Estudiante = require('../models/estudianteModel');

// 1. Registrar Estudiante
exports.registrarEstudiante = async (req, res) => {
  try {
    const { cedula, nombre, correo, celular, materia } = req.body;
    const nuevoEstudiante = await Estudiante.create(cedula, nombre, correo, celular);
    const materiaEncontrada = await Estudiante.findMateriaByName(materia);

    if (!materiaEncontrada) {
      return res.status(404).json({ error: 'La materia especificada no existe' });
    }

    await Estudiante.asignarMateria(nuevoEstudiante.id, materiaEncontrada.id);

    res.status(201).json({
      message: 'Estudiante registrado y materia asignada con éxito',
      estudiante: nuevoEstudiante
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar el estudiante' });
  }
};

// 2. Buscar estudiante por cédula
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
