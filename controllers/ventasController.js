// controllers/ventasController.js
const db = require('../config/db');

/**
 * Registra una venta validando stock (RF-16)
 */
async function registrarVenta(req, res) {
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
        // La creación de la venta y el registro de la 'fecha' cumplen parte de RF-16: Registrar Venta


        // 3. PROCESAR CADA PRODUCTO (Detalle)
        for (const item of detalles) {
            const { producto_id, cantidad, precio_venta } = item;
            // Los datos recibidos cumplen con la recolección de información de RF-16.

            const producto = await db.Producto.findByPk(producto_id, { transaction: t });

            // Validar existencia (RF-16)
            if (!producto) {
                throw new Error(`El producto ID ${producto_id} no existe.`);
            }
            //La validación de la existencia del producto cumple la restricción de RF-16.

            // Validar Stock Suficiente (RF-16)
            if (producto.stock_actual < cantidad) {
                throw new Error(`Stock insuficiente para '${producto.nombre}'. Disponible: ${producto.stock_actual}, Solicitado: ${cantidad}`);
            }
            //validación de que el stock sea suficiente

            // Calcular margen según RF-16
            const margen = ((precio_venta - producto.precio_costo) / precio_venta) * 100;

            // Crear el registro en DetalleVenta
            await db.DetalleVenta.create({
                venta_id: venta.id,
                producto_id: producto_id,
                cantidad: cantidad,
                precio_venta_real: precio_venta,
                margen_porcentaje: margen
            }, { transaction: t });
            // COMENTARIO: La creación (C) del detalle de venta finaliza la implementación de RF-16.

            //DESCONTAR STOCK (RF-16, RF-20)
            producto.stock_actual -= cantidad;
            await producto.save({ transaction: t });

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
        // consulta de las ventas con sus detalles función de RF-17: Visualizar listado de ventas.
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

        // 3. VALIDAR NUEVO STOCK y Verificar si podemos sacar la nueva cantidad
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
        //La re-validación del stock disponible implementa la restricción de RF-18: Debe validarse nuevamente el stock disponible.

        // 4. DESCONTAR NUEVO STOCK
        productoNuevo.stock_actual -= cantidadNueva;
        await productoNuevo.save({ transaction: t });

        // 5. ACTUALIZAR EL DETALLE DE LA VENTA
        detalle.producto_id = productoNuevoId;
        detalle.cantidad = cantidadNueva;
        detalle.precio_venta_real = precioNuevo;
        detalle.margen_porcentaje = ((precioNuevo - productoNuevo.precio_costo) / precioNuevo) * 100;
        
        await detalle.save({ transaction: t });
        // La actualización del detalle de venta permite cumple con RF-18: Actualizar venta.

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