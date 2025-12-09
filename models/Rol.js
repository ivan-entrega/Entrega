// models/Rol.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Rol = sequelize.define('Rol', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    }, {
        tableName: 'Roles',
        timestamps: false
    });

    Rol.associate = (models) => {
        // Un Rol tiene muchos Empleados (RF-3)
        Rol.hasMany(models.Empleado, { foreignKey: 'rol_id', as: 'empleados' });
        // Este modelo y su asociación son la base de RF-3: usuarios del sistema
    };

    return Rol;
};