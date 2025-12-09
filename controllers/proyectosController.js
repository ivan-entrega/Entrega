// controllers/proyectosController.js
const db = require('../config/db');

/**
 * Crear un nuevo proyecto (Solo Admin)
 */
async function crearProyecto(req, res) {
    const { nombre, descripcion, cliente, fecha_finalizacion, url_imagen } = req.body;

    try {
        const nuevoProyecto = await db.Proyecto.create({
            nombre,
            descripcion,
            cliente,
            fecha_finalizacion,
            url_imagen
        });
        // COMENTARIO: Esta es la operación C (Crear) para registrar información de proyectos. Aunque RF-13 es sobre mostrar, la habilidad de registrar nuevos proyectos es el requisito implícito para mantener el portafolio actualizado.

        res.status(201).json({ 
            mensaje: 'Proyecto agregado al portafolio exitosamente.', 
            data: nuevoProyecto 
        });

    } catch (error) {
        res.status(500).json({ mensaje: 'Error al crear proyecto', error: error.message });
    }
}

/**
 * RF-13: Mostrar trabajos previos (Credibilidad)
 */
async function obtenerProyectos(req, res) {
    try {
        const proyectos = await db.Proyecto.findAll({
            order: [['fecha_finalizacion', 'DESC']] // Los más recientes primero
        });
        // COMENTARIO: La consulta (R) de la lista de proyectos implementa la función principal de RF-13: "mostrar trabajos previos, cosa que de credibilidad de lo que se está vendiendo".

        res.status(200).json({ 
            mensaje: 'Portafolio de proyectos cargado.', 
            data: proyectos 
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { crearProyecto, obtenerProyectos };