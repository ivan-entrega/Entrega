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
        // RF-19 Registrar movimiento de inventario y RF-20 (Consultar estado de inventario).
        nombre: {
            type: DataTypes.STRING,
            allowNull: false
        },
        descripcion: { // (RF-19)
            type: DataTypes.TEXT,
            allowNull: true
        },
        
        precio_costo: { // (RF-19, RF-20)
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0
        },
       
        precio_venta_base: { 
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0
        },
        //'precio_venta_base' es un atributo modificable relacionado con productos y precios (RF-6).
        stock_actual: { // Cantidad disponible (RF-16, RF-20)
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        // COMENTARIO: 'stock_actual' es para validar la restricción de RF-16 stock suficiente y para RF-20 (Consultar estado de inventario).
        estado: { // (RF-7 imagen: )
            type: DataTypes.ENUM('Alto', 'Normal', 'Bajo Stock'),
            defaultValue: 'Normal'
        }
        
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