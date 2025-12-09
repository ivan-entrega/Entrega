// UBICACIÓN: routes/empleados.js
const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRole } = require('../middlewares/auth');

// IMPORTANTE: Aquí debe coincidir con el nombre de tu archivo en la carpeta controllers
// En tu caso es 'empleadosControllers' (PLURAL)
const empleadosController = require('../controllers/empleadosControllers'); 

// Aplicamos seguridad a todas las rutas de empleados
router.use(verifyToken);

// RF-4: Crear Empleado (Solo Admin)
router.post('/', authorizeRole(['Administrador']), empleadosController.crearEmpleado);

// RF-5: Listar Empleados (Solo Admin)
router.get('/', authorizeRole(['Administrador']), empleadosController.obtenerEmpleados);

// RF-11: Eliminar Empleado (Solo Admin)
router.delete('/:id', authorizeRole(['Administrador']), empleadosController.eliminarEmpleado);

// 👇 ESTA LÍNEA ES LA QUE HACE QUE APAREZCA EL ALIAS EN SERVER.JS
module.exports = router;