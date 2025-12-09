// routes/proyectos.js
const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRole } = require('../middlewares/auth');
const proyectosController = require('../controllers/proyectosController');

router.use(verifyToken);

// RF-13: Listar Proyectos (Visible para todos los empleados para mostrar credibilidad)
router.get('/', proyectosController.obtenerProyectos);
// COMENTARIO: Esta ruta implementa la función R (Consulta) de RF-13: "Mostrar tal información requerida" (proyectos previos). Es accesible para todos los usuarios internos después de autenticarse, ya que su objetivo es dar credibilidad y proveer información del departamento.

// Agregar Proyectos (Solo Administrador)
router.post('/', authorizeRole(['Administrador']), proyectosController.crearProyecto);
// COMENTARIO: Esta ruta implementa la función C (Crear) de un proyecto. La restricción de acceso mediante authorizeRole(['Administrador']) asegura que la información mostrada (RF-13) solo sea modificable por el encargado correspondiente (el administrador), cumpliendo con la restricción de RF-13.

module.exports = router;