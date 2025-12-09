// server.js
const express = require('express');
const db = require('./config/db'); // Importamos la conexión a la base de datos
const app = express();
const PORT = 3000;

// Middleware para leer JSON (¡Muy importante!)
app.use(express.json());

// --- IMPORTAR RUTAS ---
const authRoutes = require('./mis_rutas/auth.js'); // Agregando la extensión .js
const ventasRoutes = require('./mis_rutas/ventas.js');
const inventarioRoutes = require('./mis_rutas/inventario.js');
const proyectosRoutes = require('./mis_rutas/proyectos'); // (Ojo si usaste 'mis_rutas' o 'routes')

// --- DEFINIR RUTAS (ENDPOINTS) ---
app.use('/api/auth', authRoutes);
// COMENTARIO: Esta ruta maneja el endpoint de /login, implementando el acceso inicial para RF-1 (ingreso de usuario) y RF-2 (acceso a recuperación de clave).

app.use('/api/ventas', ventasRoutes);
// COMENTARIO: Esta ruta agrupa las funcionalidades de RF-16 (Registrar Venta), RF-17 (Visualizar listado de ventas) y RF-18 (Actualizar venta), aplicando las restricciones de rol de RF-15.

app.use('/api/inventario', inventarioRoutes);
// COMENTARIO: Esta ruta agrupa las funcionalidades de RF-19 (Registrar movimiento de inventario) y RF-20 (Consultar estado de inventario), además de las operaciones CRUD de atributos (RF-6 y RF-7).

app.use('/api/proyectos', proyectosRoutes);
// COMENTARIO: Esta ruta se encarga de las funcionalidades relacionadas con RF-13 (Mostrar información requerida - proyectos previos) y su restricción de modificación por el administrador.

// --- INICIO DEL SERVIDOR ---
// Primero sincronizamos la base de datos (crea las tablas si no existen)
// y LUEGO iniciamos el servidor.
db.sequelize.sync({ force: false }) 
// COMENTARIO: La sincronización de la base de datos asegura que la estructura (modelos) requerida por todos los RF esté lista antes de que la aplicación comience a funcionar.
    .then(() => {
        console.log('Base de datos sincronizada correctamente.');
        
        // El servidor solo arranca si la base de datos respondió bien
        app.listen(PORT, () => {
            console.log(`Servidor Express escuchando en http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Error al conectar con la base de datos:', error);
    });