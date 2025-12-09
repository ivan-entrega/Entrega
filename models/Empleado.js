const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Empleado = sequelize.define('Empleado', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        
        // --- Credenciales y Seguridad (RF-1) ---
        email: { // Usado para login (RF-1)
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password_hash: { // Contraseña (RF-1)
            type: DataTypes.STRING,
            allowNull: false
        },

        // --- Atributos de Rol y Pertenencia (RF-3, RF-15, RF-12) ---
        rol_id: { // Para definir el atributo (RF-3)
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Roles', 
                key: 'id',
            }
        },
        
        departamento_id: { // Para definir el entorno de trabajo (RF-12)
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Departamentos', 
                key: 'id',
            }
        },
        
        permisos_json: { // Almacenar permisos detallados o módulos habilitados (RF-15)
            type: DataTypes.JSONB,
            allowNull: true,
            defaultValue: {}
        },
        //permite aplicar las restricciones de RF-15 y RF-8.

        // --- Datos de Registro de Empleado (RF-4) ---
        nombre_completo: { // Nombre del empleado (RF-4)
            type: DataTypes.STRING,
            allowNull: false
        },
        edad: {
            type: DataTypes.INTEGER,
            allowNull: true 
        },
        telefono: { // Número de contacto (RF-4)
            type: DataTypes.STRING,
            allowNull: true
        },
        fecha_contratacion: { // Fecha de contratación (RF-4)
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        

        estado: { // Estado del empleado (Activo/Inactivo)
            type: DataTypes.ENUM('Activo', 'Inactivo'),
            defaultValue: 'Activo',
            allowNull: false
        }
        
        
    }, {
        tableName: 'Empleados',
        timestamps: true // Añade createdAt y updatedAt
    });

    // --- Definición de Relaciones (Associations) ---
    Empleado.associate = (models) => {
        // Un Empleado pertenece a un Rol
        Empleado.belongsTo(models.Rol, { foreignKey: 'rol_id', as: 'rol' }); 
        // ayuda a recuperar el rol para mostrar en el listado de empleados (RF-5) y para la validación de permisos.
        
        // Un Empleado pertenece a un Departamento
        Empleado.belongsTo(models.Departamento, { foreignKey: 'departamento_id', as: 'departamento' });
        
        // Un Empleado puede haber registrado muchas Ventas
        Empleado.hasMany(models.Venta, { foreignKey: 'empleado_id', as: 'ventas' });
    };

    return Empleado;
};