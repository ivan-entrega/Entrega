// controllers/empleadosControllers.js
const bcrypt = require('bcryptjs');
const db = require('../config/db');

/**
 * POST: Crea un nuevo empleado/usuario (RF-1, RF-4, RF-8)
 * Guarda los datos permanentemente en SQLite.
 */
async function crearEmpleado(req, res) {
    try {
        const { email, password, rol_id, departamento_id, nombre_completo, fecha_contratacion } = req.body;
        
        // --- Validación de datos de entrada ---
        if (!email || !password || !rol_id || !departamento_id || !nombre_completo || !fecha_contratacion) {
            return res.status(400).json({ 
                mensaje: '❌ Faltan datos requeridos (email, password, rol, depto, nombre, fecha).' 
            });
        }
        
        // 1. Validar si el email ya existe
        const existe = await db.Empleado.findOne({ where: { email } });
        if (existe) {
            return res.status(400).json({ mensaje: 'El correo electrónico ya está registrado.' });
        }

        // 2. Hashear la contraseña
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        
        // 3. Crear el registro en la BASE DE DATOS REAL
        const nuevoEmpleado = await db.Empleado.create({
            email,
            password_hash,
            rol_id,
            departamento_id,
            nombre_completo,
            fecha_contratacion,
            estado: 'Activo'
        });

        res.status(201).json({ 
            mensaje: 'Empleado registrado exitosamente en la Base de Datos.', 
            data: {
                id: nuevoEmpleado.id,
                nombre: nuevoEmpleado.nombre_completo,
                email: nuevoEmpleado.email
            }
        });

    } catch (error) {
        res.status(500).json({ mensaje: 'Error al crear empleado.', error: error.message });
    }
}

/**
 * GET: Obtiene el listado de todos los empleados (RF-5)
 * Consulta la tabla real de Empleados.
 */
async function obtenerEmpleados(req, res) {
    try {
        const empleados = await db.Empleado.findAll({ 
            attributes: ['id', 'nombre_completo', 'email', 'estado', 'fecha_contratacion'],
            include: [
                { model: db.Rol, as: 'rol', attributes: ['nombre'] }, 
                { model: db.Departamento, as: 'departamento', attributes: ['nombre'] }
            ],
            order: [['rol_id', 'ASC']] // Ordenando según el cargo (RF-5)
        });
        
        res.status(200).json({ 
            mensaje: '✅ Listado de empleados consultado (RF-5).',
            data: empleados 
        });

    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener empleados.', error: error.message });
    }
}

/**
 * DELETE: Elimina (lógicamente) un empleado (RF-11)
 */
async function eliminarEmpleado(req, res) {
    const { id } = req.params;

    try {
        const empleado = await db.Empleado.findByPk(id);

        if (!empleado) {
            return res.status(404).json({ mensaje: 'Empleado no encontrado.' });
        }

        // Eliminación lógica (cambiar estado a Inactivo)
        empleado.estado = 'Inactivo';
        await empleado.save();

        res.status(200).json({ 
            mensaje: `Empleado ${empleado.nombre_completo} marcado como Inactivo.`, 
        });
        
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al eliminar empleado.', error: error.message });
    }
}

module.exports = { crearEmpleado, obtenerEmpleados, eliminarEmpleado };