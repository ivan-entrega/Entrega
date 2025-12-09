// models/Proyecto.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Proyecto = sequelize.define('Proyecto', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombre: { // "Instalación de Cielos Modulares"
            type: DataTypes.STRING,
            allowNull: false
        },
        descripcion: { // "Trabajo realizado en oficinas Banco de Chile..."
            type: DataTypes.TEXT,
            allowNull: true
        },
        cliente: { // "Banco de Chile"
            type: DataTypes.STRING,
            allowNull: true
        },
        fecha_finalizacion: {
            type: DataTypes.DATEONLY, // Solo fecha sin hora
            allowNull: false
        },
        url_imagen: { // Para mostrar la foto del trabajo (RF-13)
            type: DataTypes.STRING,
            allowNull: true
        }
        // COMENTARIO: Todos estos campos (nombre, descripcion, cliente, url_imagen) están destinados a almacenar la información de los "trabajos previos" requerida por RF-13: "Mostrar tal información requerida", con el fin de "dar credibilidad de lo que se está vendiendo".
    }, {
        tableName: 'Proyectos',
        timestamps: true
    });

    Proyecto.associate = (models) => {
        // Opcional: Relacionar con departamento si quisieras filtrar estrictamente
        // Proyecto.belongsTo(models.Departamento, { foreignKey: 'departamento_id' });
    };

    return Proyecto;
};