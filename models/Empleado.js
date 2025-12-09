// models/Empleado.js
const { DataTypes } = require('sequelize');
// Asumimos que los modelos 'Rol' y 'Departamento' existen y serán relacionados.

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
        password_hash: { // Contraseña hasheada (RF-1)
            type: DataTypes.STRING,
            allowNull: false
        },
        // COMENTARIO: Los campos 'email' y 'password_hash' son la base de la autenticación de RF-1: "ingreso de usuario".

        // --- Atributos de Rol y Pertenencia (RF-3, RF-15, RF-12) ---
        rol_id: { // Para definir el atributo (Administrador, Secretario, Marketing, Finanzas) (RF-3)
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Roles', // Nombre de la tabla de Roles
                key: 'id',
            }
        },
        // COMENTARIO: 'rol_id' define la jerarquía y el mayor atributo al administrador, seguido por secretario, marketing, finanzas, cumpliendo con RF-3: "usuarios del sistema" y su restricción de limitación según atributo.
        
        departamento_id: { // Para definir el entorno de trabajo (ventas, admin, etc) (RF-12)
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Departamentos', // Nombre de la tabla de Departamentos
                key: 'id',
            }
        },
        // COMENTARIO: 'departamento_id' es esencial para RF-12: "Registrar datos" (manejar la info de departamento) y RF-15: "Aplicar ciertas limitaciones" (accesibilidad según su departamento).
        
        permisos_json: { // Almacenar permisos detallados o módulos habilitados (RF-15)
            type: DataTypes.JSONB, // JSONB es mejor para PostgreSQL, usar JSON para MySQL
            allowNull: true,
            defaultValue: {}
        },
        // COMENTARIO: Este campo permite aplicar las restricciones detalladas de RF-15 (limitaciones, no modificar info si no es el encargado) y RF-8 (otorgar permisos apropiados a su nivel de acceso).

        // --- Datos de Registro de Empleado (RF-4) ---
        nombre_completo: { // Nombre del empleado (RF-4)
            type: DataTypes.STRING,
            allowNull: false
        },
        edad: {
            type: DataTypes.INTEGER,
            allowNull: true // Se asume que no siempre es requerido al ingreso (RF-4 imagen)
        },
        telefono: { // Número de contacto (RF-4)
            type: DataTypes.STRING,
            allowNull: true
        },
        fecha_contratacion: { // Fecha de contratación (RF-4)
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        // COMENTARIO: Los campos 'nombre_completo', 'telefono' y 'fecha_contratacion' almacenan la información requerida por RF-4: "agregar nuevas facultades (Nuevos usuarios)".

        estado: { // Estado del empleado (Activo/Inactivo)
            type: DataTypes.ENUM('Activo', 'Inactivo'),
            defaultValue: 'Activo',
            allowNull: false
        }
        // COMENTARIO: El campo 'estado' se utiliza para la eliminación lógica (D) de empleados/secretarios (RF-11).
        
    }, {
        tableName: 'Empleados',
        timestamps: true // Añade createdAt y updatedAt
    });

    // --- Definición de Relaciones (Associations) ---
    Empleado.associate = (models) => {
        // Un Empleado pertenece a un Rol (FK: rol_id)
        Empleado.belongsTo(models.Rol, { foreignKey: 'rol_id', as: 'rol' }); 
        // COMENTARIO: Esta asociación ayuda a recuperar el rol para mostrar en el listado de empleados (RF-5) y para la validación de permisos.
        
        // Un Empleado pertenece a un Departamento (FK: departamento_id)
        Empleado.belongsTo(models.Departamento, { foreignKey: 'departamento_id', as: 'departamento' });
        
        // Un Empleado puede haber registrado muchas Ventas
        Empleado.hasMany(models.Venta, { foreignKey: 'empleado_id', as: 'ventas' });
    };

    return Empleado;
};