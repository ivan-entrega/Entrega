const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config/secrets'); // <--- Importamos desde el nuevo archivo

async function login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ mensaje: 'Faltan datos.' });
    }

    // --- SIMULACIÓN DE USUARIO EN BASE DE DATOS ---
    // Generamos el hash de 'password123' al vuelo para que SIEMPRE coincida en la prueba
    const hashDePrueba = await bcrypt.hash('password123', 10);

    const empleadoSimulado = {
        id: 1,
        email: 'admin@cieloseleva.cl',
        password_hash: hashDePrueba, // Usamos el hash generado recién
        rol: { nombre: 'Administrador' },
        rol_id: 1,
        departamento_id: 1,
        nombre: 'Admin Demo'
    };
    // ----------------------------------------------

    // 1. Validar Email
    if (email !== empleadoSimulado.email) {
        return res.status(401).json({ mensaje: 'Usuario no encontrado (Use: admin@cieloseleva.cl).' });
    }

    // 2. Validar Contraseña
    const isMatch = await bcrypt.compare(password, empleadoSimulado.password_hash);
    
    if (!isMatch) {
        return res.status(401).json({ mensaje: 'Contraseña incorrecta.' });
    }

    // 3. Generar Token
    const token = jwt.sign(
        { 
            id: empleadoSimulado.id, 
            rolId: empleadoSimulado.rol_id,
            rolNombre: empleadoSimulado.rol.nombre 
        }, 
        SECRET_KEY, 
        { expiresIn: '1h' }
    );

    res.status(200).json({
        mensaje: 'Login Exitoso',
        token: token
    });
}

module.exports = { login };