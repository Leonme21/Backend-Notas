const pool = require('../config/db');

const Estudiante = {
  // Crea el estudiante y retorna el registro
  create: async (cedula, nombre, correo, celular) => {
    const query = `
      INSERT INTO estudiantes (cedula, nombre, correo, celular)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [cedula, nombre, correo, celular]);
    return rows[0];
  },

  getByName: async (nombre) => {
    const query = `
      SELECT e.nombre, e.cedula, m.nombre as materia, n.nota1, n.nota2, n.nota3, n.nota4, n.definitiva
      FROM estudiantes e
      LEFT JOIN notas n ON e.id = n.estudiante_id
      LEFT JOIN materias m ON n.materia_id = m.id
      WHERE e.nombre ILIKE $1
    `;
    const { rows } = await pool.query(query, [`%${nombre}%`]);
    return rows;
  },


  // Obtener estudiante con su materia y notas (Para Pantalla 1 y 3)
  getByCedula: async (cedula) => {
    const query = `
      SELECT e.nombre, e.cedula, m.nombre as materia, n.nota1, n.nota2, n.nota3, n.nota4, n.definitiva
      FROM estudiantes e
      LEFT JOIN notas n ON e.id = n.estudiante_id
      LEFT JOIN materias m ON n.materia_id = m.id
      WHERE e.cedula = $1
    `;
    const { rows } = await pool.query(query, [cedula]);
    return rows[0];
  },

  // Obtener todas las materias disponibles (FALTABA ESTA)
  getAllMaterias: async () => {
    const query = 'SELECT nombre FROM materias ORDER BY nombre ASC';
    const { rows } = await pool.query(query);
    return rows;
  },


  // Actualizar las notas de un estudiante
  updateNotas: async (cedula, notas) => {
    const { nota1, nota2, nota3, nota4 } = notas;

    // Calculamos la definitiva (promedio)
    const definitiva = (parseFloat(nota1) + parseFloat(nota2) + parseFloat(nota3) + parseFloat(nota4)) / 4;

    const query = `
      UPDATE notas 
      SET nota1 = $1, nota2 = $2, nota3 = $3, nota4 = $4, definitiva = $5
      WHERE estudiante_id = (SELECT id FROM estudiantes WHERE cedula = $6)
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [nota1, nota2, nota3, nota4, definitiva, cedula]);
    return rows[0];
  },



  // Busca una materia por nombre para obtener su ID
  findMateriaByName: async (nombreMateria) => {
    const query = 'SELECT id FROM materias WHERE nombre = $1';
    const { rows } = await pool.query(query, [nombreMateria]);
    return rows[0];
  },

  // Asocia al estudiante con la materia en la tabla de notas
  asignarMateria: async (estudianteId, materiaId) => {
    const query = `
      INSERT INTO notas (estudiante_id, materia_id, nota1, nota2, nota3, nota4)
      VALUES ($1, $2, 0, 0, 0, 0)
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [estudianteId, materiaId]);
    return rows[0];
  }
};

module.exports = Estudiante;
