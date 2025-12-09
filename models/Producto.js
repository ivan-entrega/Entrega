// models/Producto.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Producto = sequelize.define('Producto', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        sku: { // Código único del producto (RF-19, RF-20)
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        // COMENTARIO: El campo 'sku' es fundamental para RF-19 (Registrar movimiento de inventario) y RF-20 (Consultar estado de inventario).
        nombre: {
            type: DataTypes.STRING,
            allowNull: false
        },
        descripcion: { // (RF-19)
            type: DataTypes.TEXT,
            allowNull: true
        },
        // COMENTARIO: 'descripcion' se utiliza para RF-19, junto con 'nombre', para identificar el producto en el movimiento de inventario.
        precio_costo: { // (RF-19, RF-20)
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0
        },
        // COMENTARIO: 'precio_costo' es un dato esencial para RF-19 (movimiento de inventario) y RF-20 (estado de inventario). Es un atributo modificable (U) por el encargado del departamento (RF-6).
        precio_venta_base: { // Precio sugerido
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0
        },
        // COMENTARIO: 'precio_venta_base' es un atributo modificable (U) relacionado con productos y precios (RF-6).
        stock_actual: { // Cantidad disponible (RF-16, RF-20)
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        // COMENTARIO: 'stock_actual' es el campo central para validar la restricción de RF-16 (stock suficiente) y para mostrar la 'cantidad disponible' en RF-20 (Consultar estado de inventario).
        estado: { // (RF-7 imagen: 'Alto', 'Normal', 'Bajo')
            type: DataTypes.ENUM('Alto', 'Normal', 'Bajo Stock'),
            defaultValue: 'Normal'
        }
        // COMENTARIO: Los campos de este modelo, en su conjunto (atributos, precios, servicios implícitos en descripción, inventarios/stock), definen los "datos de los atributos" que quedan sujetos a actualizaciones constantes (RF-6) y a eliminación (RF-7).
    }, {
        tableName: 'Productos',
        timestamps: true
    });

    Producto.associate = (models) => {
        // Un Producto puede estar en muchos Detalles de Venta
        Producto.hasMany(models.DetalleVenta, { foreignKey: 'producto_id', as: 'detalles_ventas' });
    };

    return Producto;
};