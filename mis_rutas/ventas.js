// routes/ventas.js
const express = require('express');
const router = express.Router();
// Importar middleware de seguridad
const { verifyToken, authorizeRole } = require('../middlewares/auth');
// Importar el controlador
const ventasController = require('../controllers/ventasController');

// Aplicar seguridad a todas las rutas de ventas (RF-15)
router.use(verifyToken);
// COMENTARIO: verifyToken asegura que el usuario ha iniciado sesión. Esto, junto con authorizeRole, es fundamental para la implementación de RF-15: "Aplicar ciertas limitaciones" y "accesibilidad según su departamento/rol".

/**
 * POST /api/ventas
 * Solo Vendedores y Administradores pueden registrar ventas
 */
router.post('/', authorizeRole(['Vendedor', 'Administrador']), ventasController.registrarVenta);
// COMENTARIO: Esta ruta implementa la función C (Crear) de RF-16: "Registrar Venta". El middleware authorizeRole restringe el acceso solo a los roles que pueden ejecutar esta operación crítica de negocio, cumpliendo con RF-15.

router.get('/', authorizeRole(['Administrador', 'Vendedor']), ventasController.obtenerVentas);
// COMENTARIO: Esta ruta implementa la función R (Consultar) de RF-17: "Visualizar listado de ventas". El acceso está restringido a Administradores y Vendedores, que son los encargados de manejar o auditar esta información (RF-15).

router.put('/:id', authorizeRole(['Administrador', 'Vendedor']), ventasController.actualizarVenta);
// RF-18: Actualizar Venta (Si la agregaste)
// COMENTARIO: Esta ruta implementa la función U (Actualizar) de RF-18: "Actualizar venta". La restricción de rol a Administrador/Vendedor asegura que solo los responsables puedan modificar ventas pendientes, cumpliendo con RF-15.

module.exports = router;