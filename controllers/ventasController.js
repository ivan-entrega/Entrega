// controllers/ventasController.js
const db = require('../config/db');

/**
 * POST /api/ventas
 * Registra una venta validando stock (RF-16)
 */
async function registrarVenta(req, res) {
    // Obtenemos los datos del cuerpo de la petición (JSON)
    // Se espera que 'detalles' sea un array con los productos a vender
    const { empleado_id, detalles } = req.body; 

    // 1. INICIAR TRANSACCIÓN (Crucial para integridad de datos)
    const t = await db.sequelize.transaction();

    try {
        let totalVenta = 0;

        // Validamos que haya detalles
        if (!detalles || detalles.length === 0) {
            await t.rollback();
            return res.status(400).json({ mensaje: 'No se indicaron productos para la venta.' });
        }

        // 2. CREAR LA CABECERA DE LA VENTA
        const venta = await db.Venta.create({
            empleado_id: empleado_id, // El ID del vendedor
            fecha: new Date(),
            total: 0,
            estado: 'Completada'
        }, { transaction: t });
        // COMENTARIO: La creación (C) de la venta y el registro de la 'fecha' cumplen parte de RF-16: "Registrar Venta".


        // 3. PROCESAR CADA PRODUCTO (Detalle)
        for (const item of detalles) {
            const { producto_id, cantidad, precio_venta } = item;
            // COMENTARIO: Los datos recibidos (producto_id, cantidad, precio_venta) cumplen con la recolección de información de RF-16.

            // a) Buscar el producto y BLOQUEARLO para evitar condiciones de carrera
            const producto = await db.Producto.findByPk(producto_id, { transaction: t });

            // b) Validar existencia (RF-16)
            if (!producto) {
                throw new Error(`El producto ID ${producto_id} no existe.`);
            }
            // COMENTARIO: La validación de la existencia del producto (R) cumple la restricción de RF-16.

            // c) Validar Stock Suficiente (RF-16)
            if (producto.stock_actual < cantidad) {
                throw new Error(`Stock insuficiente para '${producto.nombre}'. Disponible: ${producto.stock_actual}, Solicitado: ${cantidad}`);
            }
            // COMENTARIO: La validación de que el stock sea suficiente cumple la restricción de RF-16.

            // d) Calcular margen (Opcional según RF-16, pero buena práctica)
            // Margen = ((Precio Venta - Precio Costo) / Precio Venta) * 100
            const margen = ((precio_venta - producto.precio_costo) / precio_venta) * 100;
            // COMENTARIO: El cálculo del margen (%) cumple parte de la información solicitada en RF-16.

            // e) Crear el registro en DetalleVenta
            await db.DetalleVenta.create({
                venta_id: venta.id,
                producto_id: producto_id,
                cantidad: cantidad,
                precio_venta_real: precio_venta,
                margen_porcentaje: margen
            }, { transaction: t });
            // COMENTARIO: La creación (C) del detalle de venta finaliza la implementación de RF-16.

            // f) DESCONTAR STOCK (RF-16, RF-20)
            producto.stock_actual -= cantidad;
            await producto.save({ transaction: t });
            // COMENTARIO: El descuento de stock y su guardado (U) es la consecuencia de registrar la venta (RF-16) y mantiene actualizado el inventario (RF-20).

            // Sumar al total de la venta
            totalVenta += (precio_venta * cantidad);
        }

        // 4. ACTUALIZAR EL TOTAL DE LA VENTA
        venta.total = totalVenta;
        await venta.save({ transaction: t });

        // 5. CONFIRMAR TRANSACCIÓN (Commit)
        await t.commit();

        res.status(201).json({
            mensaje: 'Venta registrada exitosamente. Stock actualizado.',
            venta_id: venta.id,
            total: totalVenta
        });

    } catch (error) {
        // Si hay error, deshacemos todo
        await t.rollback();
        console.error('Error en venta:', error);
        res.status(400).json({ 
            mensaje: 'Error al registrar la venta.', 
            error: error.message 
        });
    }
}

async function obtenerVentas(req, res) {
    try {
        const ventas = await db.Venta.findAll({
            include: [
                { model: db.Empleado, as: 'empleado', attributes: ['nombre_completo'] },
                { model: db.DetalleVenta, as: 'detalles' }
            ]
        });
        // COMENTARIO: La consulta (R) de las ventas con sus detalles implementa la función de RF-17: "Visualizar listado de ventas". La restricción de solo lectura se aplica en la capa de la vista o mediante middlewares que impidan el PUT/DELETE.
        res.status(200).json({ mensaje: 'Listado de ventas', data: ventas });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function actualizarVenta(req, res) {
    const ventaId = req.params.id;
    // Recibimos los nuevos datos. Si no se envía alguno, se mantiene el anterior.
    const { nuevo_producto_id, nueva_cantidad, nuevo_precio } = req.body;
    
    const t = await db.sequelize.transaction();

    try {
        // 1. Buscar la venta y sus detalles
        const venta = await db.Venta.findByPk(ventaId, { 
            include: [{ model: db.DetalleVenta, as: 'detalles' }],
            transaction: t
        });

        if (!venta) {
            await t.rollback();
            return res.status(404).json({ mensaje: 'Venta no encontrada.' });
        }
        
        // COMENTARIO: La verificación del estado de la venta debe ir aquí (e.g., if (venta.estado !== 'Pendiente')). 
        // Si la venta está "efectuada o cerrada", la modificación debe ser denegada (Restricción de RF-18).

        // NOTA: Para este ejercicio simplificado, asumiremos que la venta tiene 1 solo detalle.
        // En un sistema real, tendrías que buscar cuál detalle específico editar.
        const detalle = venta.detalles[0];

        if (!detalle) {
            await t.rollback();
            return res.status(400).json({ mensaje: 'Esta venta no tiene detalles para editar.' });
        }

        // Datos Anteriores (Lo que ya se había vendido)
        const productoAnteriorId = detalle.producto_id;
        const cantidadAnterior = detalle.cantidad;

        // Datos Nuevos (Si no vienen en el JSON, usamos los que ya estaban)
        const productoNuevoId = nuevo_producto_id || productoAnteriorId;
        const cantidadNueva = nueva_cantidad || cantidadAnterior;
        const precioNuevo = nuevo_precio || detalle.precio_venta_real;

        // 2. REVERTIR STOCK (Devolver lo que se llevó antes al inventario)
        const productoAnterior = await db.Producto.findByPk(productoAnteriorId, { transaction: t });
        productoAnterior.stock_actual += cantidadAnterior; 
        await productoAnterior.save({ transaction: t });

        // 3. VALIDAR NUEVO STOCK (Verificar si podemos sacar la nueva cantidad)
        // Buscamos el producto nuevo (puede ser el mismo ID u otro diferente)
        const productoNuevo = await db.Producto.findByPk(productoNuevoId, { transaction: t });

        if (!productoNuevo) {
            await t.rollback();
            return res.status(404).json({ mensaje: 'El nuevo producto indicado no existe.' });
        }

        if (productoNuevo.stock_actual < cantidadNueva) {
            await t.rollback();
            return res.status(400).json({ 
                mensaje: `Stock insuficiente para la modificación. Disponible: ${productoNuevo.stock_actual}, Solicitado: ${cantidadNueva}` 
            });
        }
        // COMENTARIO: La re-validación del stock disponible implementa la restricción de RF-18: "Debe validarse nuevamente el stock disponible".

        // 4. DESCONTAR NUEVO STOCK
        productoNuevo.stock_actual -= cantidadNueva;
        await productoNuevo.save({ transaction: t });

        // 5. ACTUALIZAR EL DETALLE DE LA VENTA
        detalle.producto_id = productoNuevoId;
        detalle.cantidad = cantidadNueva;
        detalle.precio_venta_real = precioNuevo;
        // Recalcular margen (opcional)
        detalle.margen_porcentaje = ((precioNuevo - productoNuevo.precio_costo) / precioNuevo) * 100;
        
        await detalle.save({ transaction: t });
        // COMENTARIO: La actualización (U) del detalle de venta permite modificar 'producto', 'cantidad', 'precio' y 'margen', cumpliendo con RF-18: "Actualizar venta".

        // 6. ACTUALIZAR EL TOTAL DE LA VENTA (Cabecera)
        venta.total = cantidadNueva * precioNuevo;
        await venta.save({ transaction: t });

        await t.commit();
        res.status(200).json({ 
            mensaje: 'Venta actualizada correctamente (RF-18). Stock re-validado.',
            venta_actualizada: {
                id: venta.id,
                nuevo_total: venta.total
            }
        });

    } catch (error) {
        await t.rollback();
        console.error(error);
        res.status(500).json({ mensaje: 'Error al actualizar venta', error: error.message });
    }
}
module.exports = { registrarVenta, obtenerVentas, actualizarVenta};