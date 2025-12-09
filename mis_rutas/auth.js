const express = require('express');
const router = express.Router();
const authController = require('../controllers/authControllers'); 

router.post('/login', authController.login);
// Esta ruta POST /login es donde se implementa el RF-1: "ingreso de usuario". 
// Permite que el usuario se autentique con sus credenciales, lo cual es manejado por el controlador authController.login.

module.exports = router;