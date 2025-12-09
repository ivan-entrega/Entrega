DESCRIPCIÓN:
Backend desarrollado en Node.js con Express y SQLite para la gestión de ventas, inventario y proyectos de construcción.

INSTRUCCIONES DE EJECUCIÓN:
1. Inicie el servidor backend:
   > npm run dev

   El servidor escuchará en: http://localhost:3000


1. ROL ADMINISTRADOR (Acceso total):
   - Email: admin@cieloseleva.cl
   - Pass:  password123

2. ROL VENDEDOR (Ventas y Listados):
   - Email: ventas@cieloseleva.cl
   - Pass:  password123

3. ROL BODEGUERO (Inventario):
   - Email: bodega@cieloseleva.cl
   - Pass:  password123

RUTAS PRINCIPALES PARA PRUEBAS (Thunder Client):

- Auth:       POST /api/auth/login
- Ventas:     GET  /api/ventas (Listar)
              POST /api/ventas (Registrar nueva venta)
              PUT  /api/ventas/:id (Actualizar venta - RF-18)
- Inventario: GET  /api/inventario (Ver los +20 productos cargados)
              POST /api/inventario/movimiento (Agregar stock)
              PUT  /api/inventario/:id (Editar producto - RF-6)
              DELETE /api/inventario/:id (Eliminar producto - RF-7)
- Proyectos:  GET  /api/proyectos (Ver portafolio - RF-13)
              POST /api/proyectos (Crear proyecto)