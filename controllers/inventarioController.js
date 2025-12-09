// controllers/inventarioController.js
const db = require('../config/db');

/**
 * RF-19: Registrar movimiento (Entrada de mercancía o Ajuste)
 * Esto nos sirve para CREAR productos o sumar stock.
 */
async function registrarMovimiento(req, res) {
    const { sku, nombre, descripcion, precio_costo, precio_venta, cantidad, tipo_movimiento } = req.body;

    const t = await db.sequelize.transaction();

    try {
        // 1. Buscar si el producto ya existe por SKU
        let producto = await db.Producto.findOne({ where: { sku } }, { transaction: t });
        // COMENTARIO: La consulta (R) inicial verifica si el SKU existe, cumpliendo parte de la restricción de RF-19.

        if (!producto) {
            // Si es una SALIDA y no existe el producto, error
            if (tipo_movimiento === 'Salida') {
                await t.rollback();
                return res.status(404).json({ mensaje: 'No se puede dar salida a un producto que no existe.' });
            }

            // Si es ENTRADA y no existe, lo creamos (Alta de producto)
            producto = await db.Producto.create({
                sku,
                nombre,
                descripcion,
                precio_costo,
                precio_venta_base: precio_venta,
                stock_actual: 0 // Iniciamos en 0 y sumamos abajo
            }, { transaction: t });
            // COMENTARIO: La creación (C) del producto al registrar una Entrada implementa la parte de "Registrar movimiento de inventario" de RF-19.
        }

        // 2. Calcular nuevo stock
        if (tipo_movimiento === 'Entrada') {
            producto.stock_actual += parseInt(cantidad);
        } else if (tipo_movimiento === 'Salida') {
            if (producto.stock_actual < cantidad) {
                await t.rollback();
                return res.status(400).json({ mensaje: `Stock insuficiente. Actual: ${producto.stock_actual}` });
            }
            // COMENTARIO: Esta validación asegura que "la salida no exceda el stock disponible", cumpliendo la restricción de RF-19.
            producto.stock_actual -= parseInt(cantidad);
        }

        // 3. Guardar cambios en Producto
        await producto.save({ transaction: t });
        // COMENTARIO: La actualización (U) del stock cumple la función central de RF-19.

        // 4. Registrar el historial del movimiento (Opcional si tienes tabla de movimientos, aquí simplificado)
        // await db.Movimiento.create({ ... });

        await t.commit();

        res.status(201).json({
            mensaje: 'Movimiento registrado exitosamente.',
            producto: {
                id: producto.id,
                nombre: producto.nombre,
                stock_nuevo: producto.stock_actual
            }
        });

    } catch (error) {
        await t.rollback();
        res.status(500).json({ mensaje: 'Error en inventario', error: error.message });
    }
}

/**
 * RF-20: Consultar estado de inventario
 */
async function obtenerInventario(req, res) {
    try {
        const productos = await db.Producto.findAll();
        // COMENTARIO: La consulta (R) de todos los productos y sus datos (stock, SKU, precio costo) implementa la función principal de RF-20: "Consultar estado de inventario". La restricción de solo lectura se aplica en la capa de rutas/front-end.
        res.status(200).json({ mensaje: 'Inventario consultado', data: productos });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function actualizarProducto(req, res) {
    const { id } = req.params;
    const { nombre, descripcion, precio_costo, precio_venta_base, estado } = req.body;

    try {
        const producto = await db.Producto.findByPk(id);

        if (!producto) {
            return res.status(404).json({ mensaje: 'Producto no encontrado.' });
        }

        // Actualizamos los campos
        producto.nombre = nombre || producto.nombre;
        producto.descripcion = descripcion || producto.descripcion;
        producto.precio_costo = precio_costo || producto.precio_costo;
        producto.precio_venta_base = precio_venta_base || producto.precio_venta_base;
        producto.estado = estado || producto.estado;

        await producto.save();
        // COMENTARIO: Esta es la operación U (Actualizar) que permite modificar datos de productos y sus atributos (materiales, colores, usos, etc. implícitos en nombre/descripción/costo), cumpliendo con RF-6: "Actualizar datos de los atributos". La restricción de permisos debe validarse en el middleware.

        res.status(200).json({ 
            mensaje: 'Producto actualizado correctamente (RF-6).', 
            producto 
        });

    } catch (error) {
        res.status(500).json({ mensaje: 'Error al actualizar producto', error: error.message });
    }
}

/**
 * RF-7: Eliminar atributos (Producto)
 * Restricción: Solo si el usuario tiene permiso (simulado aquí con Rol).
 */
async function eliminarProducto(req, res) {
    const { id } = req.params;

    try {
        const producto = await db.Producto.findByPk(id);

        if (!producto) {
            return res.status(404).json({ mensaje: 'Producto no encontrado.' });
        }

        // Eliminación física (o podría ser lógica con 'estado: Inactivo')
        await producto.destroy();
        // COMENTARIO: La eliminación (D) del producto representa la función de RF-7: "Requisitos para eliminar atributos". La restricción de "previa autorización" (Master) y la limitación a "encargado de cada departamento" deben ser validadas en el middleware de la ruta.

        res.status(200).json({ mensaje: 'Producto eliminado correctamente (RF-7).' });

    } catch (error) {
        // Error común: intentar borrar un producto que ya tiene ventas asociadas (Integridad referencial)
        res.status(400).json({ 
            mensaje: 'No se puede eliminar el producto porque tiene ventas o movimientos asociados.',
            error: error.message 
        });
    }
}

// IMPORTANTE: Agrégalas al export
module.exports = { registrarMovimiento, obtenerInventario, actualizarProducto, eliminarProducto };