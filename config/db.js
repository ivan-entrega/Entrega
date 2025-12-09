// config/db.js
const { Sequelize, DataTypes } = require('sequelize'); 
const fs = require('fs');
const path = require('path');

// CONFIGURACIÓN PARA SQLITE (Base de datos en archivo local)
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite', // Nombre del archivo donde se guardarán los datos
    logging: false // Opcional: para que no llene la consola de texto
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// --- CARGA DINÁMICA DE MODELOS ---
const modelsDir = path.join(__dirname, '../models');

fs.readdirSync(modelsDir)
    .filter(file => {
        return (file.indexOf('.') !== 0) && (file.slice(-3) === '.js');
    })
    .forEach(file => {
        const model = require(path.join(modelsDir, file))(sequelize, DataTypes);
        db[model.name] = model;
    });

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

module.exports = db;