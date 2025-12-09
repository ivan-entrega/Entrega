// routes/inventario.js
const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRole } = require('../middlewares/auth');
const inventarioController = require('../controllers/inventarioController');

router.use(verifyToken);
// COMENTARIO: verifyToken asegura que solo "usuarios que trabajen directamente con la pagina" (RF-2) o que hayan completado el RF-1 puedan acceder a estas rutas.

// Rutas existentes
router.post('/movimiento', authorizeRole(['Administrador', 'Bodeguero']), inventarioController.registrarMovimiento);
// COMENTARIO: Esta ruta implementa el RF-19 (Registrar movimiento de inventario). El middleware authorizeRole restringe el acceso a Administrador y Bodeguero, asegurando que solo los responsables puedan efectuar movimientos.

router.get('/', inventarioController.obtenerInventario);
// COMENTARIO: Esta ruta implementa el RF-20 (Consultar estado de inventario). No requiere restricción fuerte de rol en la ruta, aunque la información puede ser visible solo para roles internos.

// 👇 NUEVAS RUTAS (RF-6 y RF-7)
// Editar: Admin y Bodeguero pueden ajustar precios/detalles
router.put('/:id', authorizeRole(['Administrador', 'Bodeguero']), inventarioController.actualizarProducto);
// COMENTARIO: Esta ruta implementa la función U (Actualizar) de RF-6 (Actualizar datos de los atributos/productos). El middleware restringe el acceso a Administrador y Bodeguero, cumpliendo con que sea "Solo el responsable de cada departamento [o encargado]" quien haga los cambios.

// Eliminar: Solo Administrador (Restricción fuerte RF-7)
router.delete('/:id', authorizeRole(['Administrador']), inventarioController.eliminarProducto);
// COMENTARIO: Esta ruta implementa la función D (Eliminar) de RF-7 (Requisitos para eliminar atributos). El middleware restringe el acceso solo al Administrador. La restricción de "previa autorización mediante correo electrónico por el usuario master" (RF-7) debe ser validada dentro del controlador 'eliminarProducto' o mediante un middleware adicional, ya que implica lógica de negocio.

module.exports = router;