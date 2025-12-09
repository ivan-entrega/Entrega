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
        descripcion: { 
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
        //almacenar la información de los trabajos previos requerida por RF-13
    }, {
        tableName: 'Proyectos',
        timestamps: true
    });


    return Proyecto;
};