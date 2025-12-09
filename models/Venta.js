// models/Venta.js
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
        // COMENTARIO: El campo 'fecha' almacena la fecha de la venta, dato clave de RF-16: "Registrar Venta" y RF-17: "Visualizar listado de ventas".
        
        total: {
            type: DataTypes.FLOAT, // O DECIMAL(10,2) para mayor precisión financiera
            allowNull: false,
            defaultValue: 0
        },
        // COMENTARIO: El campo 'total' complementa la información financiera de RF-16 y RF-17.
        
        estado: {
            type: DataTypes.ENUM('Pendiente', 'Completada', 'Cancelada'),
            defaultValue: 'Pendiente'
        }
        // COMENTARIO: El campo 'estado' es crucial para implementar la restricción de RF-18: "Actualizar venta", que solo permite modificar ventas si están en estado "no registrada" o "pendiente" (Pendiente en este modelo) y no permite modificar "ventas ya efectuadas o cerradas" (Completada/Cancelada).
    }, {
        tableName: 'Ventas',
        timestamps: true
    });

    Venta.associate = (models) => {
        // Una Venta pertenece a un Empleado (el vendedor)
        Venta.belongsTo(models.Empleado, { foreignKey: 'empleado_id', as: 'empleado' });
        
        // Una Venta tiene muchos Detalles (Productos vendidos)
        // Nota: Necesitaremos crear el modelo DetalleVenta próximamente
        Venta.hasMany(models.DetalleVenta, { foreignKey: 'venta_id', as: 'detalles' });
        // COMENTARIO: Esta asociación es necesaria para poder mostrar la información completa del listado de ventas (RF-17).
    };

    return Venta;
};