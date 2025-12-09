// seed.js
const db = require('./config/db');

async function seed() {
    try {
        console.log('Reiniciando base de datos y limpiando tablas...');
        // force: true borra las tablas y las crea de nuevo
        await db.sequelize.sync({ force: true });

        // ==========================================
        // 1. ROLES Y DEPARTAMENTOS
        // ==========================================
        console.log('Creando estructura organizacional...');
        
        const adminRol = await db.Rol.create({ nombre: 'Administrador' });
        const vendRol = await db.Rol.create({ nombre: 'Vendedor' });
        const bodegaRol = await db.Rol.create({ nombre: 'Bodeguero' });

        const depVentas = await db.Departamento.create({ nombre: 'Ventas y Proyectos' });
        const depAdmin = await db.Departamento.create({ nombre: 'Administración' });
        const depLogistica = await db.Departamento.create({ nombre: 'Bodega y Despacho' });

        // ==========================================
        // 2. EMPLEADOS (USUARIOS DEL SISTEMA)
        // ==========================================
        console.log('Creando usuarios...');

        // Hash genérico para 'password123' (generado con bcrypt)
        const passwordHash = '$2a$10$i/R1q/2xW.5F9Cj8LqL5mO/6qP1A7u.t.n9xJ1iA7yH1mO7K1mZ8Q';

        // Usuario 1: Administrador General
        const adminUser = await db.Empleado.create({
            nombre_completo: 'Javier Admin',
            email: 'admin@cieloseleva.cl',
            password_hash: passwordHash,
            rol_id: adminRol.id,
            departamento_id: depAdmin.id,
            fecha_contratacion: '2022-03-15',
            estado: 'Activo'
        });

        // Usuario 2: Vendedor Senior
        await db.Empleado.create({
            nombre_completo: 'María Ventas',
            email: 'ventas@cieloseleva.cl',
            password_hash: passwordHash,
            rol_id: vendRol.id,
            departamento_id: depVentas.id,
            fecha_contratacion: '2023-01-10',
            estado: 'Activo'
        });

        // Usuario 3: Encargado de Bodega
        await db.Empleado.create({
            nombre_completo: 'Pedro Bodega',
            email: 'bodega@cieloseleva.cl',
            password_hash: passwordHash,
            rol_id: bodegaRol.id,
            departamento_id: depLogistica.id,
            fecha_contratacion: '2023-06-20',
            estado: 'Activo'
        });

        // ==========================================
        // 3. PRODUCTOS (INVENTARIO REALISTA)
        // ==========================================
        console.log('📦 Poblando inventario de construcción...');

        const listaProductos = [
            // --- CIELOS MODULARES ---
            { sku: 'CIE-FIB-001', nombre: 'Placa Fibra Mineral 60x60 AMF', descripcion: 'Cielo modular acústico borde recto, caja 16 un.', precio_costo: 35000, precio_venta_base: 48900, stock_actual: 150 },
            { sku: 'CIE-YES-002', nombre: 'Cielo Americano Yeso Cartón 60x60', descripcion: 'Placa de yeso recubierta en vinilo lavable, caja 8 un.', precio_costo: 18000, precio_venta_base: 26500, stock_actual: 300 },
            { sku: 'CIE-MET-003', nombre: 'Cielo Metálico Lay-In', descripcion: 'Bandeja metálica perforada blanca 60x60.', precio_costo: 8500, precio_venta_base: 12900, stock_actual: 80 },
            { sku: 'CIE-ACU-004', nombre: 'Nubes Acústicas Colgantes', descripcion: 'Panel acústico decorativo para oficinas, unidad.', precio_costo: 45000, precio_venta_base: 65000, stock_actual: 20 },
            
            // --- PERFILERÍA (ESTRUCTURA) ---
            { sku: 'PER-PRI-001', nombre: 'Perfil Principal T24 3.66m', descripcion: 'Estructura principal para cielo americano, acero galvanizado.', precio_costo: 2800, precio_venta_base: 4200, stock_actual: 500 },
            { sku: 'PER-SEC-002', nombre: 'Perfil Secundario T24 1.22m', descripcion: 'Conector transversal largo para grilla.', precio_costo: 1200, precio_venta_base: 1800, stock_actual: 800 },
            { sku: 'PER-SEC-003', nombre: 'Perfil Secundario T24 0.61m', descripcion: 'Conector transversal corto para grilla.', precio_costo: 800, precio_venta_base: 1100, stock_actual: 900 },
            { sku: 'PER-ANG-004', nombre: 'Ángulo Perimetral L 3.0m', descripcion: 'Remate perimetral muro para cielo modular.', precio_costo: 1900, precio_venta_base: 2900, stock_actual: 400 },
            { sku: 'PER-COL-005', nombre: 'Alambre Galvanizado #14', descripcion: 'Rollo de alambre para suspensión de cielo, 1kg.', precio_costo: 3000, precio_venta_base: 4500, stock_actual: 50 },

            // --- ILUMINACIÓN LED ---
            { sku: 'ILU-PAN-001', nombre: 'Panel LED 60x60 Embutido 40W', descripcion: 'Panel luz fría 6500K para cielo americano.', precio_costo: 12000, precio_venta_base: 18990, stock_actual: 120 },
            { sku: 'ILU-PAN-002', nombre: 'Panel LED 60x60 Cálido 40W', descripcion: 'Panel luz cálida 3000K para oficinas.', precio_costo: 12000, precio_venta_base: 18990, stock_actual: 60 },
            { sku: 'ILU-FOC-003', nombre: 'Foco Downlight 18W Redondo', descripcion: 'Foco embutido luz día, corte 20cm.', precio_costo: 3500, precio_venta_base: 5990, stock_actual: 200 },
            { sku: 'ILU-EME-004', nombre: 'Kit de Emergencia LED', descripcion: 'Batería de respaldo para paneles LED.', precio_costo: 15000, precio_venta_base: 24900, stock_actual: 30 },
            
            // --- TABIQUERÍA Y AISLACIÓN ---
            { sku: 'TAB-LAN-001', nombre: 'Lana de Vidrio 50mm Rollo', descripcion: 'Aislante térmico y acústico libre 1.2x12m.', precio_costo: 18000, precio_venta_base: 28900, stock_actual: 45 },
            { sku: 'TAB-YES-002', nombre: 'Placa Yeso Cartón ST 10mm', descripcion: 'Placa estándar 1.20x2.40m.', precio_costo: 4800, precio_venta_base: 7200, stock_actual: 300 },
            { sku: 'TAB-PER-003', nombre: 'Montante Metalcon 60CA085', descripcion: 'Perfil estructural acero galvanizado 2.4m.', precio_costo: 3200, precio_venta_base: 4900, stock_actual: 150 },
            { sku: 'TAB-PER-004', nombre: 'Canal Metalcon 61CA085', descripcion: 'Perfil base acero galvanizado 3.0m.', precio_costo: 3100, precio_venta_base: 4800, stock_actual: 150 },

            // --- PISOS Y TERMINACIONES ---
            { sku: 'PIS-VIN-001', nombre: 'Piso Vinílico SPC Madera', descripcion: 'Piso click resistente al agua, caja 2.2m2.', precio_costo: 22000, precio_venta_base: 34900, stock_actual: 80 },
            { sku: 'PIS-MAN-002', nombre: 'Manta Acústica Bajo Piso', descripcion: 'Rollo espuma niveladora 20m2.', precio_costo: 9000, precio_venta_base: 14500, stock_actual: 25 },
            { sku: 'TER-GUA-003', nombre: 'Guardapolvo MDF Folio', descripcion: 'Tira 2.44m color madera.', precio_costo: 2500, precio_venta_base: 3900, stock_actual: 200 },
            { sku: 'INS-TOR-004', nombre: 'Tornillo Punta Broca 6x1', descripcion: 'Caja 1000 unidades cabeza lenteja.', precio_costo: 4500, precio_venta_base: 7900, stock_actual: 60 }
        ];

        // Guardar todos los productos
        const productosCreados = await db.Producto.bulkCreate(listaProductos);
        console.log(`${productosCreados.length} productos de construcción cargados.`);

        // ==========================================
        // 4. PROYECTOS (PORTAFOLIO - RF-13)
        // ==========================================
        console.log('Cargando portafolio de proyectos...');

        await db.Proyecto.create({
            nombre: 'Habilitación Oficinas Banco Estado',
            descripcion: 'Instalación de 500m2 de cielo fibra mineral y perfilería sismorresistente.',
            cliente: 'Constructora del Maule',
            fecha_finalizacion: '2023-11-15',
            url_imagen: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000'
        });

        await db.Proyecto.create({
            nombre: 'Remodelación Clínica Lircay',
            descripcion: 'Provisión e instalación de cielos clínicos lavables e iluminación LED certificada.',
            cliente: 'Clínica Lircay',
            fecha_finalizacion: '2024-02-20',
            url_imagen: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1000'
        });

        await db.Proyecto.create({
            nombre: 'Hall de Acceso Edificio Plaza',
            descripcion: 'Diseño e instalación de nubes acústicas y revestimiento de madera.',
            cliente: 'Inmobiliaria Centro',
            fecha_finalizacion: '2024-05-10',
            url_imagen: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1000'
        });

        // ==========================================
        // 5. VENTAS DE EJEMPLO
        // ==========================================
        console.log('Generando ventas históricas...');

        // Venta 1: Se vendieron 10 Paneles LED
        const venta1 = await db.Venta.create({
            empleado_id: adminUser.id,
            fecha: new Date('2025-11-01'),
            total: 189900,
            estado: 'Completada'
        });

        // Producto ID 10 es un Panel LED en la lista de arriba
        // (Nota: los IDs pueden variar, pero al ser bulkCreate suelen ser secuenciales. 
        // Para mayor seguridad en producción se buscarían, pero para seed.js esto sirve).
        const prodVenta = productosCreados.find(p => p.sku === 'ILU-PAN-001');

        if (prodVenta) {
             await db.DetalleVenta.create({
                venta_id: venta1.id,
                producto_id: prodVenta.id,
                cantidad: 10,
                precio_venta_real: 18990,
                margen_porcentaje: 35.5
            });
            // Descontar stock manualmente para el ejemplo
            prodVenta.stock_actual -= 10;
            await prodVenta.save();
        }

        console.log('¡Base de datos de Cielos Eleva poblada exitosamente!');
        process.exit();

    } catch (error) {
        console.error('Error fatal al poblar la BD:', error);
        process.exit(1);
    }
}

seed();