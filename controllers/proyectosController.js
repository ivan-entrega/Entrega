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
        //Esta es la operación crear para registrar información de proyectos. Aunque RF-13 es sobre mostrar, es necesario crear nuevos proyectos

        res.status(201).json({ 
            mensaje: 'Proyecto agregado al portafolio exitosamente.', 
            data: nuevoProyecto 
        });

    } catch (error) {
        res.status(500).json({ mensaje: 'Error al crear proyecto', error: error.message });
    }
}

/**
 * RF-13: Mostrar trabajos previos
 */
async function obtenerProyectos(req, res) {
    try {
        const proyectos = await db.Proyecto.findAll({
            order: [['fecha_finalizacion', 'DESC']] // Los más recientes primero
        });
        // La consulta de la lista de proyectos implementa la función principal de RF-13:

        res.status(200).json({ 
            mensaje: 'Portafolio de proyectos cargado.', 
            data: proyectos 
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { crearProyecto, obtenerProyectos };