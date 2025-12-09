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
        // COMENTARIO: Este modelo y su asociación son la base de RF-3: "usuarios del sistema", que exige dar el mayor atributo al administrador, seguido por secretario, marketing, finanzas.
        // La relación permite establecer la limitación de acceso "según atributo" (restricción de RF-3) y aplicar las "ciertas limitaciones" de RF-15.
    };

    return Rol;
};