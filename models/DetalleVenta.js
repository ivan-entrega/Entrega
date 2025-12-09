// models/DetalleVenta.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const DetalleVenta = sequelize.define('DetalleVenta', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        venta_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Ventas',
                key: 'id'
            }
        },
        producto_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Productos',
                key: 'id'
            }
        },
        cantidad: { // Cantidad vendida (RF-16)
            type: DataTypes.INTEGER,
            allowNull: false
        },
        // COMENTARIO: Los campos 'producto_id', 'cantidad', 'precio_venta_real' y 'margen_porcentaje' en el detalle cumplen con el almacenamiento de la información clave requerida en RF-16: "Registrar Venta" y RF-17: "Visualizar listado de ventas" (ya que la información se consulta desde aquí).
        
        precio_venta_real: { // Precio al que se vendió finalmente (RF-16)
            type: DataTypes.FLOAT,
            allowNull: false
        },
        margen_porcentaje: { // Margen de ganancia calculado (RF-16)
            type: DataTypes.FLOAT,
            allowNull: true
        }
    }, {
        tableName: 'DetallesVentas',
        timestamps: false
    });

    DetalleVenta.associate = (models) => {
        DetalleVenta.belongsTo(models.Venta, { foreignKey: 'venta_id', as: 'venta' });
        DetalleVenta.belongsTo(models.Producto, { foreignKey: 'producto_id', as: 'producto' });
    };

    return DetalleVenta;
};