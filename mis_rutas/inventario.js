// routes/inventario.js
const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRole } = require('../middlewares/auth');
const inventarioController = require('../controllers/inventarioController');

router.use(verifyToken);
// asegura que solo "usuarios que trabajen directamente con la pagina" (RF-2) o que hayan completado el RF-1 puedan acceder a estas rutas.

// Rutas existentes
router.post('/movimiento', authorizeRole(['Administrador', 'Bodeguero']), inventarioController.registrarMovimiento);
// Esta ruta implementa el RF-19 Registrar movimiento de inventario

router.get('/', inventarioController.obtenerInventario);
// Esta ruta implementa el RF-20 Consultar estado de inventario

// 👇 NUEVAS RUTAS (RF-6 y RF-7)
// Editar: Admin y Bodeguero pueden ajustar precios/detalles
router.put('/:id', authorizeRole(['Administrador', 'Bodeguero']), inventarioController.actualizarProducto);

// Eliminar: Solo Administrador (Restricción fuerte RF-7)
router.delete('/:id', authorizeRole(['Administrador']), inventarioController.eliminarProducto);
// Esta ruta implementa la función D (Eliminar) de RF-7 (Requisitos para eliminar atributos). El middleware restringe el acceso solo al Administrador. 

module.exports = router;