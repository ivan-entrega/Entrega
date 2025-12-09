// UBICACIÓN: middlewares/auth.js
const jwt = require('jsonwebtoken');
// IMPORTANTE: Importamos la clave desde el archivo común
const { SECRET_KEY } = require('../config/secrets'); 

function verifyToken(req, res, next) {
    const authHeader = req.header('Authorization');
    if (!authHeader) return res.status(401).json({ mensaje: 'Token no proporcionado.' });
    
    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) return res.status(401).json({ mensaje: 'Formato inválido.' });
    // COMENTARIO: Las líneas anteriores aseguran que el usuario haya iniciado sesión (RF-1: "ingreso de usuario") antes de acceder a las funcionalidades del sistema.

    try {
        // Verifica usando la MISMA clave que se usó para firmar
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded; 
        next();
    } catch (ex) {
        res.status(400).json({ mensaje: 'Token inválido.' });
    }
}

function authorizeRole(rolesPermitidos) {
    return (req, res, next) => {
        if (!req.user || !rolesPermitidos.includes(req.user.rolNombre)) {
            return res.status(403).json({ mensaje: 'Permiso denegado.' });
        }
        next();
    };
    // COMENTARIO: Esta función de middleware implementa las restricciones de acceso por rol, cumpliendo la esencia de varios Requisitos Funcionales:
    // - RF-1 (Restricción): "Administrador solo puede crear" (Controlado al aplicar este middleware a la ruta de creación).
    // - RF-3 (Atributos/Roles): Garantiza la limitación según atributo (rol).
    // - RF-4 (Restricción): "administrador general solo debe hacerlo" (Controlado al aplicar este middleware a la ruta de agregar nuevos empleados).
    // - RF-5 (Restricción): "administrador solo puede tener visible el listado".
    // - RF-6, RF-7, RF-10 (Restricción): Controla que "Solo el responsable de cada departamento" o el "encargado" pueda actualizar/eliminar atributos, según el rolnombre.
    // - RF-14 (Restricción): Controla que "solo el administrador tiene los permisos" para modificar/obtener información gerencial.
    // - RF-15 (Restricción): "el usuario solo puede entrar a su rol", aplicando accesibilidad según su departamento/rol.
}

module.exports = { verifyToken, authorizeRole };