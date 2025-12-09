const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Departamento = sequelize.define('Departamento', {
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
        tableName: 'Departamentos',
        timestamps: false
    });

    Departamento.associate = (models) => {
        // Un Departamento tiene muchos Empleados (RF-12)
        Departamento.hasMany(models.Empleado, { foreignKey: 'departamento_id', as: 'empleados' });
        // implementación de RF-12: "Registrar datos" y RF-15: "Aplicar ciertas limitaciones". 
        // Permite que cada usuario esté asociado a un departamento específico,
    };

    return Departamento;
};