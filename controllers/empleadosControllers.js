// controllers/empleadosController.js
const bcrypt = require('bcryptjs');
// Importamos la conexión a la base de datos y todos los modelos
const db = require('../config/db'); 

// Constantes para roles, idealmente se cargarían desde la BD
const ROL_ADMINISTRADOR = 1; 
const ROL_SECRETARIO = 2;
const ROL_MASTER_EMAIL = 'admin.master@ucm.cl'; // Para simular la autorización master (RF-7, RF-11)


/**
 * POST: Crea un nuevo empleado/usuario (RF-1, RF-4, RF-8)
 */
async function crearEmpleado(req, res) {
    try {
        // La restricción de 'Solo Administrador' se verifica en la ruta (middleware authorizeRole), 
        // cumpliendo con la restricción de RF-1 y RF-4, y el RF-8 (creación de secretario).
        const { email, password, rol_id, departamento_id, nombre_completo, fecha_contratacion } = req.body;
        
        // --- Validación de datos de entrada ---
        if (!email || !password || !rol_id || !departamento_id || !nombre_completo || !fecha_contratacion) {
            return res.status(400).json({ 
                error: 'Faltan datos de registro.', 
                mensaje: 'Asegúrese de enviar email, password, rol_id, departamento_id, nombre_completo y fecha_contratacion (RF-4).' 
            });
        }
        // COMENTARIO: La recolección de 'nombre_completo', 'teléfono' (implícito en la necesidad de contacto), 'fecha_contratacion' y 'cargo' (rol_id) implementa la función C (Crear) de RF-4: "agregar nuevas facultades (Nuevos usuarios)".

        // 1. Hashear la contraseña (Requisito de seguridad, implícito en RF-1)
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        
        // 2. Crear el registro en la BD (Simulación ORM)
        // COMENTARIO: Esta sección de creación (C) y el resultado simulan la implementación de RF-1: "ingreso de usuario" (Crear usuario con contraseña) y RF-8: "Requisitos para creación de secretario" (si rol_id es secretario).
        // PSEUDOCÓDIGO ORM:
        /*
        const empleado = await db.Empleado.create({
            email,
            password_hash,
            rol_id,
            departamento_id,
            nombre_completo,
            fecha_contratacion,
            // ... otros campos
        });
        */

        // Simulación de resultado JSON para Thunder Client:
        const empleadoSimulado = { 
            id: 101, 
            email: email, 
            nombre: nombre_completo, 
            rol_id: rol_id, 
            departamento_id: departamento_id,
            restriccion_aplicada: 'Solo el Administrador puede crear usuarios.' // Recordatorio de la restricción (RF-1)
        };

        res.status(201).json({ 
            mensaje: 'Empleado/Usuario registrado exitosamente (RF-1, RF-4).', 
            data: empleadoSimulado 
        });

    } catch (error) {
        // Manejo de errores de BD (ej: email duplicado)
        if (error.name === 'SequelizeUniqueConstraintError') {
             return res.status(409).json({ mensaje: 'Error: El correo electrónico ya está registrado.' });
        }
        res.status(500).json({ mensaje: 'Error al crear empleado.', error: error.message });
    }
}

/**
 * GET: Obtiene el listado de todos los empleados (RF-5)
 */
async function obtenerEmpleados(req, res) {
    // La restricción de 'Solo Administrador' se verifica en la ruta
    // COMENTARIO: La verificación de la restricción ("administrador solo puede tener visible el listado") cumple la restricción de RF-5.

    try {
        // 1. Obtener datos de empleados, incluyendo sus roles y departamentos
        
        // PSEUDOCÓDIGO ORM:
        /*
        const empleados = await db.Empleado.findAll({ 
            attributes: ['id', 'nombre_completo', 'email', 'estado', 'fecha_contratacion'],
            include: [
                { model: db.Rol, as: 'rol', attributes: ['nombre'] }, 
                { model: db.Departamento, as: 'departamento', attributes: ['nombre'] }
            ],
            order: [['rol_id', 'ASC']] // Ordenando según el cargo (RF-5)
        });
        */
        // COMENTARIO: La consulta (R) de la lista de empleados y el ordenamiento (order: [['rol_id', 'ASC']]) implementan RF-5: "Datos que puedes visualizar (agregar)", ordenando según el cargo.
        
        // Simulación de resultado JSON para Thunder Client:
        const empleadosSimulados = [
            { id: 1, nombre_completo: 'Carlos Rodríguez', rol: 'Administrador', estado: 'Activo', fecha_contratacion: '2023-01-09' },
            { id: 2, nombre_completo: 'María González', rol: 'Vendedor', estado: 'Activo', fecha_contratacion: '2023-03-14' }
        ];

        res.status(200).json({ 
            mensaje: 'Listado de empleados consultado y ordenado por cargo (RF-5).',
            restriccion: 'Solo el Administrador puede tener visible este listado completo.',
            data: empleadosSimulados 
        });

    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener empleados.', error: error.message });
    }
}


/**
 * DELETE: Elimina (lógicamente) un secretario (RF-11)
 */
async function eliminarSecretario(req, res) {
    // La restricción de 'Solo Administrador' se verifica en la ruta
    const empleadoId = req.params.id;

    try {
        // 1. Verificar si el empleado existe y si es un Secretario (RF-11)
        // PSEUDOCÓDIGO ORM: 
        // const empleado = await db.Empleado.findByPk(empleadoId);
        // if (!empleado || empleado.rol_id !== ROL_SECRETARIO) { /* return error */ }

        // 2. Verificar la Autorización Master (RF-11)
        // PSEUDOCÓDIGO ORM:
        /*
        const autorizacion = await db.Autorizacion.findOne({
            where: { 
                empleado_id: empleadoId, 
                tipo_solicitud: 'Eliminar Secretario', 
                estado: 'Aprobada', 
                email_master: ROL_MASTER_EMAIL // Simula la autorización por correo 
            }
        });

        if (!autorizacion) {
            return res.status(403).json({ 
                mensaje: 'Eliminación denegada. Se requiere una autorización previa "Aprobada" mediante correo electrónico por el usuario master (RF-11).' 
            });
        }
        */
        // COMENTARIO: La verificación de la autorización Master antes de la eliminación es la restricción principal y la función D (Eliminar) de RF-11: "Condiciones para la eliminación de un secretario".
        
        // 3. Ejecutar la eliminación lógica (Actualización del estado a 'Inactivo')
        // PSEUDOCÓDIGO ORM: 
        // const [filasActualizadas] = await db.Empleado.update({ estado: 'Inactivo' }, { where: { id: empleadoId } });
        // COMENTARIO: La ejecución de la eliminación lógica cumple la función D (Eliminar) de RF-11.

        res.status(200).json({ 
            mensaje: `Secretario (ID: ${empleadoId}) eliminado lógicamente tras aprobación Master (RF-11).`, 
            accion: 'Se cambió el campo "estado" a Inactivo.'
        });
        
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al procesar la eliminación.', error: error.message });
    }
}

module.exports = { 
    crearEmpleado, 
    obtenerEmpleados, 
    eliminarSecretario,
    // Aquí se agregarían otros controladores como login, recuperar clave, etc.
};