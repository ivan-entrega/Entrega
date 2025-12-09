const express = require('express');
const router = express.Router();
// Importar middleware de seguridad
const { verifyToken, authorizeRole } = require('../middlewares/auth');
// Importar el controlador
const ventasController = require('../controllers/ventasController');


router.use(verifyToken);
//asegura que el usuario ha iniciado sesión
/**
 * Solo Vendedores y Administradores pueden registrar ventas
 */
router.post('/', authorizeRole(['Vendedor', 'Administrador']), ventasController.registrarVenta);
//Esta ruta implementa la función crear de RF-16: "Registrar Venta".

router.get('/', authorizeRole(['Administrador', 'Vendedor']), ventasController.obtenerVentas);
//Esta ruta implementa la función Consultar de RF-17 El acceso está restringido a Administradores y Vendedores

router.put('/:id', authorizeRole(['Administrador', 'Vendedor']), ventasController.actualizarVenta);
//RF-18: Actualizar Venta
//Esta ruta implementa la función Actualizar de RF-18

module.exports = router;