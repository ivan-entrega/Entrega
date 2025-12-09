// UBICACIÓN: routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authControllers'); // Recuerda la 's' final

router.post('/login', authController.login);
// COMENTARIO: Esta ruta (POST /login) es donde se implementa el RF-1: "ingreso de usuario". 
// Permite que el usuario se autentique con sus credenciales, lo cual es manejado por el controlador authController.login.
// La restricción de que solo el Administrador puede crear usuarios no aplica aquí, sino en la ruta de creación de empleados.

module.exports = router;