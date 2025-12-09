// server.js
const express = require('express');
const db = require('./config/db');
const app = express();
const PORT = 3000;


app.use(express.json());

// --- IMPORTAR RUTAS ---
const authRoutes = require('./mis_rutas/auth.js'); 
const ventasRoutes = require('./mis_rutas/ventas.js');
const inventarioRoutes = require('./mis_rutas/inventario.js');
const proyectosRoutes = require('./mis_rutas/proyectos'); 
const empleadosRoutes = require('./mis_rutas/empleados.js');

// --- DEFINIR RUTAS (ENDPOINTS) ---
app.use('/api/auth', authRoutes);
//Esta ruta maneja el endpoint de /login, implementando el acceso inicial para RF-1 (ingreso de usuario) y RF-2 (acceso a recuperación de clave).

app.use('/api/ventas', ventasRoutes);
//Esta ruta agrupa las funcionalidades de RF-16 (Registrar Venta), RF-17 (Visualizar listado de ventas) y RF-18 (Actualizar venta), aplicando las restricciones de rol de RF-15.

app.use('/api/inventario', inventarioRoutes);
// Esta ruta agrupa las funcionalidades de RF-19 (Registrar movimiento de inventario) y RF-20 (Consultar estado de inventario)

app.use('/api/proyectos', proyectosRoutes);
// Esta ruta se encarga de las funcionalidades relacionadas con RF-13 (Mostrar información requerida - proyectos previos) y su restricción de modificación por el administrador.
app.use('/api/empleados', empleadosRoutes);
// --- INICIO DEL SERVIDOR ---


db.sequelize.sync({ force: false }) 
    .then(() => {
        console.log('Base de datos sincronizada correctamente.');
        
        app.listen(PORT, () => {
            console.log(`Servidor Express escuchando en http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Error al conectar con la base de datos:', error);
    });