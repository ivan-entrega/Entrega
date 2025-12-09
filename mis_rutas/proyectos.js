// routes/proyectos.js
const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRole } = require('../middlewares/auth');
const proyectosController = require('../controllers/proyectosController');

router.use(verifyToken);

// RF-13: Listar Proyectos 
router.get('/', proyectosController.obtenerProyectos);
// Esta ruta implementa la función Consulta de RF-13

// Agregar Proyectos (Solo Administrador)
router.post('/', authorizeRole(['Administrador']), proyectosController.crearProyecto);
// COMENTARIO: Esta ruta implementa la función C (Crear) de un proyecto. 

module.exports = router;