const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Venta = sequelize.define('Venta', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        fecha: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
        },
        // fecha, dato clave de RF-16: "Registrar Venta" y RF-17: "Visualizar listado de ventas".
        
        total: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0
        },
        // complementa la información financiera de RF-16 y RF-17.
        
        estado: {
            type: DataTypes.ENUM('Pendiente', 'Completada', 'Cancelada'),
            defaultValue: 'Pendiente'
        }
        //estado es crucial para implementar la restricción de RF-18: Actualizar venta
    }, {
        tableName: 'Ventas',
        timestamps: true
    });

    Venta.associate = (models) => {
        // Una Venta pertenece a un Empleado (el vendedor)
        Venta.belongsTo(models.Empleado, { foreignKey: 'empleado_id', as: 'empleado' });
        
        // Una Venta tiene muchos Detalles (Productos vendidos)
        Venta.hasMany(models.DetalleVenta, { foreignKey: 'venta_id', as: 'detalles' });
        //Esta asociación es necesaria para poder mostrar la información completa del listado de ventas (RF-17).
    };

    return Venta;
};