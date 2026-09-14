# DASHBOARDS Y WEB PÚBLICA
## Servicios y Suministros SP

---

## 1. ESTRUCTURA GENERAL DEL SITIO

### WEB PÚBLICA (Sin login requerido)
```
/
├── Inicio
├── Productos
│   ├── Paneles Solares
│   ├── Inversores Híbridos
│   ├── Baterías/Banco de Energía
│   ├── Accesorios
│   ├── Cámaras de Seguridad
│   └── Sistemas de Cerca Eléctrica
├── Servicios
│   ├── Instalación de Paneles
│   ├── Instalación de Inversores
│   ├── Instalación de Cercas
│   └── Mantenimiento
├── Solicitar Cotización
├── Carrito
├── Contacto
├── Nosotros
├── Blog (opcional)
└── Login/Registro
```

### DASHBOARDS (Con login requerido)
```
/dashboard (privado)
├── Admin
│   ├── Dashboard Principal
│   ├── Gestión de Productos
│   ├── Gestión de Técnicos
│   ├── Gestión de Solicitudes
│   ├── Gestión de Pedidos
│   ├── Reportes y Estadísticas
│   ├── Gestión de Usuarios
│   └── Configuración del Sistema
├── Técnico
│   ├── Mi Dashboard
│   ├── Solicitudes Asignadas
│   ├── Trabajos en Progreso
│   ├── Trabajos Completados
│   ├── Agendador de Visitas
│   └── Mi Perfil
└── Cliente
    ├── Mi Dashboard
    ├── Mis Compras
    ├── Mis Solicitudes de Cotización
    ├── Mis Cotizaciones
    ├── Mi Perfil
    ├── Mis Direcciones
    └── Historial
```

---

## 2. WEB PÚBLICA

### 2.1 PÁGINA DE INICIO (/index.php)

**Componentes:**
```
Header
├── Logo y nombre de empresa
├── Navegación principal
├── Carrito
└── Login/Registro

Banner principal
├── Título: "Soluciones Eléctricas para Venezuela"
├── Subtítulo: "Paneles Solares, Inversores y Más"
└── Botones: "Ver Productos" | "Solicitar Cotización"

Sección: Categorías principales (6 cards)
├── Paneles Solares
├── Inversores Híbridos
├── Baterías/Energía
├── Cámaras de Seguridad
├── Sistemas de Cerca Eléctrica
└── Accesorios

Sección: Productos destacados
├── 8 productos en grid
└── Cada producto: imagen, nombre, precio, "Agregar al carrito"

Sección: Servicios principales
├── Instalación de Paneles Solares
├── Instalación de Inversores
├── Instalación de Cercas Eléctricas
└── Cada servicio: descripción, "Solicitar Cotización"

Sección: ¿Cómo funciona?
├── Paso 1: Completa el formulario
├── Paso 2: Nuestro equipo revisa
├── Paso 3: Recibe cotización personalizada
└── Paso 4: Instalación y garantía

Sección: Testimonios (si existen)
├── Cliente 1
├── Cliente 2
└── Cliente 3

Sección: CTA (Call To Action)
├── "¿Necesitas una cotización personalizada?"
└── Botón: "Solicitar Cotización"

Footer
├── Links útiles
├── Contacto
├── Redes sociales
└── Copyright
```

---

### 2.2 PÁGINA DE PRODUCTOS (/productos.php)

**Estructura:**
```
Header (mismo del inicio)

Breadcrumb: Inicio > Productos > [Categoría]

Barra de búsqueda y filtros (izquierda)
├── Búsqueda por texto
├── Filtro por categoría
├── Filtro por rango de precio (slider)
├── Filtro por marca
└── Botón: "Limpiar filtros"

Grid de productos (derecha)
├── Ordenar por: Relevancia, Precio menor, Precio mayor, Nuevos
└── 12-16 productos por página (paginación)

Cada producto card:
├── Imagen
├── Nombre
├── Descripción corta
├── Especificaciones clave (potencia, voltaje, etc)
├── Precio
├── Stock disponible
├── Botones: "Ver detalles" | "Agregar al carrito"
└── Rating/Review (opcional)

Sidebar derecho (opcional):
├── Productos relacionados
└── Productos destacados
```

---

### 2.3 PÁGINA DE DETALLE DE PRODUCTO (/producto.php?id=1)

**Estructura:**
```
Breadcrumb: Inicio > Productos > [Categoría] > [Producto]

Contenido principal (2 columnas):

Columna izquierda:
├── Galería de imágenes (principal + thumbnails)
└── Zoom en hover

Columna derecha:
├── Nombre del producto
├── Calificación/reviews (opcional)
├── Precio grande
├── Stock disponible (con color: verde si hay, rojo si no)
├── Especificaciones técnicas (tabla)
│   ├── Potencia
│   ├── Voltaje
│   ├── Dimensiones
│   ├── Peso
│   └── Garantía
├── Descripción detallada
├── Selector de cantidad
├── Botones: "Agregar al carrito" | "Agregar a favoritos"
├── Compartir en redes
└── Información de envío/retiro

Sección inferior:
├── Especificaciones completas (tabs)
├── Descripción detallada
├── Documentación técnica (PDF si aplica)
├── Reviews de clientes (si hay)
└── Productos relacionados (grid)
```

---

### 2.4 PÁGINA SERVICIOS (/servicios.php)

**Estructura:**
```
Título: "Nuestros Servicios"

Grid de servicios (3-4 cards):

Servicio 1: Instalación de Paneles Solares
├── Imagen
├── Descripción
├── Lista de beneficios
├── Proceso
├── Botón: "Solicitar Cotización"

Servicio 2: Instalación de Inversores Híbridos
├── Imagen
├── Descripción
├── Lista de beneficios
├── Proceso
├── Botón: "Solicitar Cotización"

Servicio 3: Instalación de Cercas Eléctricas
├── Imagen
├── Descripción
├── Lista de beneficios
├── Proceso
├── Botón: "Solicitar Cotización"

Servicio 4: Mantenimiento y Soporte
├── Imagen
├── Descripción
├── Planes de mantenimiento
├── Botón: "Solicitar Cotización"

Sección: Proceso de cotización
├── Explicación paso a paso
├── Ventajas
└── Botón: "Comenzar"

CTA final:
├── "¿Tienes dudas?"
└── Botón: "Contactar al equipo"
```

---

### 2.5 PÁGINA SOLICITAR COTIZACIÓN (/solicitar-cotizacion.php)

**Formulario multi-paso:**

**Paso 1: Tipo de Servicio**
```
Título: "¿Qué necesitas?"

Opciones (radio buttons):
○ Instalación de Paneles Solares + Inversor
○ Instalación de Cerca Eléctrica
○ Ambos servicios
○ Otro servicio

Botón: "Siguiente"
```

**Paso 2: Datos Personales**
```
Nombre (text) *
Email (email) *
Teléfono (tel) *
Tipo de cliente: ○ Persona ○ Empresa
Cédula/RIF (text) (opcional)

Botón: "Siguiente"
```

**Paso 3: Datos del Proyecto**
```
PARA PANELES/INVERSOR:
├── Carga instalada actual (kW) *
├── Consumo mensual aproximado (kWh) *
├── Factura eléctrica (opcional - puede subirla)
├── Horas de luz disponibles
└── Porcentaje a cubrir con solar: ○ 50% ○ 75% ○ 100%

PARA CERCA ELÉCTRICA:
├── Perímetro a cercar (metros) *
├── Tipo de terreno: ○ Plano ○ Accidentado
├── Altura deseada (metros)
└── Material existente: ○ Ninguno ○ Cerca existente ○ Muro

COMÚN:
├── Ubicación/Dirección *
├── Descripción adicional (textarea)
├── Disponibilidad para visita técnica:
│   ├── Rango de fechas
│   └── Horario preferido
└── Presupuesto aproximado:
    ○ Abierto ○ <$1000 ○ $1000-$5000 ○ >$5000

Botón: "Siguiente"
```

**Paso 4: Revisión y Envío**
```
Resumen de datos:
├── Tipo de servicio
├── Datos personales
├── Datos del proyecto
└── Disponibilidad

Checkbox: "Aceptar términos y condiciones"

Botones: "Atrás" | "Enviar Solicitud"

Confirmación:
├── Mensaje: "¡Solicitud enviada!"
├── "Tu número de solicitud es: #SOL-2025-001"
├── "Te contactaremos pronto"
└── Botón: "Volver al inicio"
```

---

### 2.6 CARRITO DE COMPRAS (/carrito.php)

**Estructura:**
```
Título: "Tu Carrito"

Tabla de productos:
├── Imagen
├── Nombre
├── Precio unitario
├── Cantidad (con +/-)
├── Subtotal
├── Botón X (eliminar)

Resumen derecho:
├── Subtotal
├── Impuestos (IVA)
├── Descuento (si aplica)
├── TOTAL

Opciones:
├── "¿Deseas agregar instalación?"
│   ├── Si selecciona "Sí" → Mostrar checkbox de servicios
│   └── Si selecciona "No" → Continuar compra
├── Código de descuento (input + botón aplicar)
└── Botones: "Seguir comprando" | "Proceder al pago"

Si carrito vacío:
├── Mensaje: "Tu carrito está vacío"
└── Botón: "Volver a la tienda"
```

---

### 2.7 CHECKOUT (/checkout.php)

**Paso 1: Dirección de Entrega**
```
Si cliente registrado:
├── Mostrar direcciones guardadas (con radio select)
└── Botón: "Agregar nueva dirección"

Si cliente anónimo o nueva dirección:
├── Calle *
├── Número *
├── Apartamento (opcional)
├── Ciudad *
├── Estado *
├── Código postal
├── Referencia (textarea)
└── Guardar para próximas compras (checkbox)

Botón: "Siguiente"
```

**Paso 2: Método de Pago**
```
Opciones:
○ Transferencia bancaria
  └── Mostrar datos bancarios
○ Efectivo contra entrega
○ Tarjeta de crédito (si está disponible)
  └── Integración con pasarela

Botón: "Siguiente"
```

**Paso 3: Revisión de Orden**
```
Resumen:
├── Productos
├── Dirección de entrega
├── Método de pago
├── Total final
└── Estimado de entrega

Botón: "Confirmar y pagar" | "Volver"

Confirmación:
├── Número de orden: #PED-2025-0001
├── Mensaje de éxito
├── Instrucciones de pago (según método)
└── Botón: "Descargar factura"
```

---

### 2.8 CONTACTO (/contacto.php)

**Estructura:**
```
Título: "Contacto"

Grid 2 columnas:

Columna izquierda: Información de contacto
├── Email: info@serviciosysuministrossp.com
├── Teléfono: +58 (XXX) XXX-XXXX
├── WhatsApp: Enlace directo
├── Horario de atención
├── Dirección física (si tienen tienda)
└── Mapa (Google Maps)

Columna derecha: Formulario de contacto
├── Nombre *
├── Email *
├── Teléfono
├── Asunto *
├── Mensaje *
└── Botón: "Enviar"

Mensaje de éxito (si envía):
├── "¡Mensaje recibido!"
└── "Te contactaremos en breve"
```

---

### 2.9 LOGIN (/login.php)

**Estructura:**
```
Logo/Nombre empresa

Formulario:
├── Email o Usuario *
├── Contraseña *
├── Checkbox: "Recordarme"
├── Link: "¿Olvidaste tu contraseña?"
└── Botón: "Ingresar"

Link: "¿No tienes cuenta? Regístrate aquí"
```

---

### 2.10 REGISTRO (/registro.php)

**Estructura:**
```
Título: "Crear Cuenta"

Formulario:
├── Nombre completo *
├── Email *
├── Teléfono *
├── Contraseña * (con validación)
├── Confirmar contraseña *
├── Tipo de cliente: ○ Persona ○ Empresa
├── Documento (Cédula/RIF) *
├── Checkbox: "Aceptar términos"
└── Botón: "Registrarse"

Link: "¿Ya tienes cuenta? Inicia sesión"

Validación en tiempo real:
├── Email único
├── Contraseña fuerte (8+ caracteres, mayúscula, número, símbolo)
└── Campos requeridos
```

---

## 3. DASHBOARD DE ADMIN (/dashboard/admin/)

### 3.1 PÁGINA PRINCIPAL - Dashboard

**Widgets principales:**

```
┌─────────────────────────────────────────────────────┐
│                    DASHBOARD ADMIN                   │
│                                                      │
│ Hola, [Nombre Admin]  [Hora local]  [Perfil]       │
└─────────────────────────────────────────────────────┘

ROW 1: KPIs (números grandes)
┌──────────┬──────────┬──────────┬──────────┐
│ Ventas   │ Pedidos  │Solicitud │ Técnicos │
│ Hoy      │Pendientes│Pendientes│ Activos  │
│ $XXXXX   │    X     │    X     │    X     │
└──────────┴──────────┴──────────┴──────────┘

ROW 2: Gráficos (2 columnas)
┌─────────────────────────┬─────────────────────────┐
│ Ventas últimos 30 días  │ Productos más vendidos  │
│ (Gráfico línea)         │ (Gráfico barras)        │
└─────────────────────────┴─────────────────────────┘

ROW 3: Tablas (2 columnas)
┌─────────────────────────┬─────────────────────────┐
│ Últimos pedidos         │ Solicitudes recientes   │
│ (Tabla compacta)        │ (Tabla compacta)        │
│ - Número               │ - Número               │
│ - Cliente              │ - Cliente              │
│ - Total                │ - Tipo                 │
│ - Estado               │ - Estado               │
│ - Fecha                │ - Fecha                │
└─────────────────────────┴─────────────────────────┘

ROW 4: Alertas/Notificaciones
┌─────────────────────────────────────────────────────┐
│ ⚠️ Stock bajo: Panel Solar 400W (5 unidades)        │
│ ⚠️ Cotización vence: #COT-2025-001 (2 días)        │
│ ⚠️ Pago pendiente: #PED-2025-0005                  │
│ ✅ Nueva solicitud recibida: #SOL-2025-0010       │
└─────────────────────────────────────────────────────┘
```

**Navegación lateral:**
```
Admin Panel
├── Dashboard (actual)
├── Productos
│   ├── Ver todos
│   ├── Agregar nuevo
│   └── Categorías
├── Solicitudes
│   ├── Pendientes
│   ├── En revisión
│   ├── Cotizando
│   └── Completadas
├── Pedidos
│   ├── Todos
│   ├── Pendientes de pago
│   ├── En preparación
│   └── Entregados
├── Clientes
│   ├── Todos
│   └── Búsqueda
├── Técnicos
│   ├── Activos
│   ├── Inactivos
│   └── Agregar nuevo
├── Reportes
│   ├── Ventas
│   ├── Solicitudes
│   ├── Clientes
│   └── Técnicos
├── Configuración
│   ├── General
│   ├── Productos
│   ├── Precios
│   ├── Pagos
│   └── Email
└── Usuarios (Admin)
    ├── Todos
    ├── Agregar nuevo
    └── Mis datos
```

---

### 3.2 GESTIÓN DE PRODUCTOS (/dashboard/admin/productos/)

**Listado de productos:**
```
Encabezado:
├── Título: "Productos"
├── Botón: "+ Agregar Producto"
├── Búsqueda (text)
├── Filtros: Categoría, Estado
└── Vista: Grid | Lista

Tabla/Grid:
├── Imagen
├── Nombre
├── Categoría
├── Precio costo / Precio venta
├── Stock
├── Estado (Activo/Inactivo)
├── Acciones: Editar | Eliminar | Ver detalles

Paginación: 25 productos por página
```

**Crear/Editar producto:**
```
Formulario:

Datos básicos:
├── Nombre del producto *
├── Categoría *
├── Marca
├── Modelo
├── SKU (código único)
└── Descripción (textarea)

Especificaciones técnicas:
├── Especificación 1 (ej: Potencia en kW)
├── Especificación 2 (ej: Voltaje en V)
├── Especificación 3
└── Agregar más especificaciones

Precios:
├── Precio de costo *
├── Precio de venta *
├── Margen de ganancia (auto-calculado)
└── IVA incluido: ○ Sí ○ No

Inventario:
├── Stock actual *
├── Stock mínimo para alerta
├── Ubicación en almacén
└── Proveedor

Imágenes:
├── Imagen principal (drag & drop)
├── Galería adicional (max 5 imágenes)
└── Alt text para cada imagen

SEO:
├── Meta título
├── Meta descripción
└── Palabras clave

Estado:
├── ○ Activo ○ Inactivo
└── Crear/Editar otro: ○ Sí ○ No

Botones: Guardar | Cancelar | Ver en tienda
```

---

### 3.3 GESTIÓN DE SOLICITUDES (/dashboard/admin/solicitudes/)

**Listado de solicitudes:**
```
Filtros/Búsqueda:
├── Estado: Todos, Pendiente, En revisión, Cotizando, etc.
├── Tipo: Todos, Paneles, Cerca, Ambos
├── Fecha: Desde - Hasta
├── Técnico asignado
└── Búsqueda por nombre/email/teléfono

Tabla:
├── Número de solicitud
├── Cliente
├── Tipo
├── Estado
├── Técnico asignado
├── Fecha
├── Acciones: Ver detalles | Editar | Asignar técnico | Descargar PDF

Paginación y export (CSV/PDF)
```

**Detalle de solicitud:**
```
Información del cliente:
├── Nombre
├── Email
├── Teléfono
├── Dirección

Información de solicitud:
├── Número de solicitud
├── Fecha
├── Tipo de servicio
├── Estado actual
├── Descripción del proyecto

Datos técnicos:
├── Carga eléctrica
├── Consumo mensual
├── Ubicación/zona
├── Otros datos específicos

Asignación técnica:
├── Técnico asignado (dropdown)
├── Fecha de visita agendada
├── Estado de visita
├── Informe de visita (si hay)
│   ├── Fotos subidas
│   ├── Mediciones
│   ├── Observaciones
│   └── Carga confirmada

Cotización:
├── Estado (No generada, Borrador, Enviada, Aceptada)
├── Número de cotización
├── Monto total
├── PDF
└── Fecha de generación

Historial:
├── Timeline de cambios
├── Quién hizo qué y cuándo

Botones de acción:
├── Editar solicitud
├── Asignar/cambiar técnico
├── Agendar visita
├── Generar cotización
├── Descargar PDF
└── Cambiar estado manualmente
```

---

### 3.4 GESTIÓN DE PEDIDOS (/dashboard/admin/pedidos/)

**Listado de pedidos:**
```
Filtros:
├── Estado: Todos, Pendiente pago, Pagado, Enviado, Entregado
├── Fecha
├── Cliente
└── Monto

Tabla:
├── Número de pedido
├── Cliente
├── Total
├── Estado
├── Método de pago
├── Fecha
├── Acciones: Ver detalles | Generar factura | Cambiar estado

Estadísticas rápidas:
├── Total ventas hoy
├── Pendientes de pago
├── Entregados
└── Cancelados
```

**Detalle de pedido:**
```
Información general:
├── Número de pedido
├── Fecha
├── Cliente (link a perfil)
├── Email y teléfono

Detalles de productos:
├── Tabla con:
│   ├── Producto
│   ├── Cantidad
│   ├── Precio unitario
│   ├── Subtotal
│   └── Editar cantidad (si aún no se envió)
├── Subtotal
├── Impuestos
├── Descuento
└── TOTAL

Dirección de entrega:
├── Nombre
├── Calle, número, apto
├── Ciudad, estado, código postal
├── Botón: Editar dirección

Pago:
├── Método de pago
├── Estado (Pendiente, Confirmado, Rechazado)
├── Referencia de transacción (si pagó)
├── Fecha de pago
└── Botón: Validar pago manual

Envío:
├── Transportista
├── Número de seguimiento
├── Estado (Preparando, Enviado, En tránsito, Entregado)
└── Botón: Cambiar estado

Servicios adicionales:
├── Si incluye instalación:
│   ├── Técnico asignado
│   ├── Fecha agendada
│   └── Estado de instalación

Historial:
├── Timeline de eventos

Botones:
├── Generar factura (PDF)
├── Enviar confirmación al cliente
├── Cambiar estado
├── Cancelar pedido
└── Imprimir etiqueta de envío
```

---

### 3.5 REPORTES (/dashboard/admin/reportes/)

**Tipos de reportes:**

```
Ventas:
├── Período: Hoy, Últimos 7 días, Mes, Custom
├── Gráfico: Línea (ventas diarias)
├── Tabla: Desglose por producto
├── Tabla: Desglose por cliente
├── Total general
└── Exportar: CSV, PDF, Excel

Productos:
├── Productos más vendidos
├── Stock actual
├── Productos con stock bajo
├── Productos inactivos
├── Rotación de inventario
└── Exportar

Solicitudes y Cotizaciones:
├── Solicitudes por estado
├── Tasa de conversión (solicitud → cotización → venta)
├── Tiempo promedio de respuesta
├── Técnicos más productivos
├── Productos más solicitados en cotizaciones
└── Exportar

Clientes:
├── Clientes nuevos
├── Clientes recurrentes
├── Valor promedio de compra
├── Cliente con más compras
├── Clientes inactivos
└── Exportar

Técnicos:
├── Solicitudes asignadas
├── Trabajos completados
├── Tiempo promedio por trabajo
├── Satisfacción del cliente
└── Exportar
```

---

### 3.6 CONFIGURACIÓN (/dashboard/admin/configuracion/)

**Opciones:**

```
General:
├── Nombre de empresa
├── Logo
├── Descripción
├── Correo de contacto
├── Teléfono
├── Dirección
├── Horario de atención
└── Moneda (USD, Bs)

Productos:
├── Margen de ganancia por defecto (%)
├── Costo de instalación por hora
├── IVA aplicable (%)
└── Stock mínimo para alerta

Pagos:
├── Métodos de pago habilitados
├── Datos bancarios (para mostrar en transferencias)
├── Integración con pasarela (si la hay)
└── Términos de pago

Email:
├── Servidor SMTP
├── Email de envío
├── Contraseña
├── Templates de email (editable)
│   ├── Confirmación de compra
│   ├── Confirmación de solicitud
│   ├── Visita técnica agendada
│   ├── Cotización enviada
│   └── Pedido entregado

Notificaciones:
├── Avisar cuando: Stock bajo
├── Avisar cuando: Nueva solicitud
├── Avisar cuando: Nuevo pedido
├── Avisar cuando: Cotización vence
└── Destinatarios (emails)

Respaldo/Seguridad:
├── Última copia de seguridad
├── Botón: Crear backup ahora
├── Botón: Descargar último backup
└── Historial de acceso (logs)
```

---

## 4. DASHBOARD DE TÉCNICO (/dashboard/tecnico/)

### 4.1 PÁGINA PRINCIPAL - Dashboard

**Widgets:**
```
┌─────────────────────────────────────────────────────┐
│              DASHBOARD TÉCNICO                       │
│                                                      │
│ Hola, [Nombre Técnico]  [Hora local]  [Perfil]     │
└─────────────────────────────────────────────────────┘

ROW 1: KPIs
┌────────────┬────────────┬────────────┬────────────┐
│ Solicitudes│ Visitas    │  En        │ Completadas│
│ Asignadas  │ Agendadas  │ Progreso   │ Este mes   │
│     X      │     X      │     X      │     X      │
└────────────┴────────────┴────────────┴────────────┘

ROW 2: Calendario (grande)
├── Próximas 2 semanas
├── Visitas agendadas
├── Click para ver detalles
└── Click para confirmar/cambiar

ROW 3: Tareas pendientes
├── Tabla:
│   ├── Solicitud
│   ├── Cliente
│   ├── Fecha agendada
│   ├── Estado
│   └── Acciones

ROW 4: Estadísticas personales
├── Visitassemana
├── Promedio de tiempo por visita
├── Trabajos completados este mes
├── Satisfacción del cliente
└── Ingresos generados (opcional)
```

**Navegación lateral:**
```
Mi Dashboard
├── Dashboard (actual)
├── Mis solicitudes
│   ├── Asignadas
│   ├── En revisión
│   └── Completadas
├── Mis visitas
│   ├── Próximas
│   ├── Completadas
│   └── Canceladas
├── Mis trabajos
│   ├── En progreso
│   └── Completados
├── Cotizaciones
│   ├── Mis cotizaciones
│   └── Ver detalles
├── Mi agenda
└── Mi perfil
```

---

### 4.2 MIS SOLICITUDES (/dashboard/tecnico/solicitudes/)

**Listado:**
```
Filtros:
├── Estado: Asignadas, En revisión, Cotizando, Completadas
├── Rango de fechas
└── Búsqueda

Vista: Lista o Tarjetas

Cada solicitud muestra:
├── Número de solicitud
├── Cliente (nombre y foto)
├── Tipo de servicio
├── Ubicación
├── Carga eléctrica (si aplica)
├── Fecha asignada
├── Estado actual
├── Próxima acción
└── Click → Ver detalles
```

**Detalle de solicitud:**
```
Información del cliente:
├── Nombre
├── Foto/Avatar
├── Email
├── Teléfono
├── Dirección completa
├── Mapa (Google Maps)

Datos de la solicitud:
├── Número y fecha
├── Tipo de servicio
├── Carga eléctrica
├── Consumo mensual
├── Descripción del proyecto
├── Notas internas (de admin)
├── Presupuesto aproximado del cliente

Visita técnica:
├── Fecha agendada
├── Hora
├── Estado (Agendada, Completada, Cancelada)
├── Botón: Confirmar asistencia
├── Botón: Cambiar fecha
├── Botón: Cancelar visita

Si ya se completó la visita:
├── Fecha realizada
├── Fotos subidas (galería)
├── Mediciones tomadas (tabla)
├── Carga confirmada (kW)
├── Horas de sol de la zona
├── Observaciones/notas
├── Documentos adjuntos (PDF, etc)

Cotización:
├── Estado
├── Monto total
├── PDF para descargar/enviar
├── Botón: Editar cotización (si está en borrador)
├── Botón: Marcar como enviada
└── Botón: Regenerar PDF

Pedido asociado (si existe):
├── Número de pedido
├── Estado
├── Monto
├── Método de pago
└── Link al pedido

Acciones:
├── Confirmar visita
├── Subir informe de visita (fotos, mediciones)
├── Editar cotización
├── Generar/enviar cotización
├── Cambiar estado
└── Cambiar disponibilidad
```

---

### 4.3 MI AGENDA (/dashboard/tecnico/agenda/)

**Calendario detallado:**
```
Vista: Mes | Semana | Día | Lista

Próximas visitas:
├── Hoy
│   ├── Visita 1: Hora - Cliente - Dirección
│   │   └── Botón: "En camino" | "Completada"
│   └── Visita 2: Hora - Cliente - Dirección
│
├── Mañana
│   ├── Visita X
│   └── Visita Y
│
└── Próximos 7 días

Detalle de visita (click en evento):
├── Cliente
├── Ubicación (con mapa)
├── Hora
├── Tipo de trabajo
├── Notas previas
├── Botones: Confirmar | Cambiar | Cancelar

Estadísticas de la semana:
├── Visitas programadas
├── Visitas completadas
├── Horas totales
└── Distancia recorrida (si se usa GPS)
```

---

### 4.4 SUBIR INFORME DE VISITA

**Formulario después de completar visita:**
```
Datos de la visita:
├── Fecha y hora realizada (auto-llenado)
├── Duración de la visita (minutos)
└── ¿Fue completada? ○ Sí ○ No - ¿Motivo?

Mediciones técnicas (para paneles):
├── Carga real confirmada (kW) *
├── Consumo real estimado (kWh) *
├── Horas de sol disponibles *
├── Voltaje del sistema (V)
├── Ubicación de paneles: ○ Techo ○ Piso ○ Estructura
├── Sombreado: ○ Ninguno ○ Parcial ○ Significativo
└── Espacio disponible (m²)

Mediciones técnicas (para cercas):
├── Perímetro medido (metros) *
├── Altura implementada (metros) *
├── Terreno: ○ Plano ○ Accidentado
├── Obstáculos encontrados
└── Condición de terreno

Fotos:
├── Galería de fotos (drag & drop)
├── Min 3 fotos - Max 15
├── Cada foto con descripción (opcional)
└── Preview antes de enviar

Observaciones:
├── Observations generales (textarea)
├── ¿Se puede realizar el trabajo? ○ Sí ○ No
├── Si No: ¿Motivo?
├── Recomendaciones especiales
└── Contacto del cliente para coordinación

Documentos:
├── Subir planos/croquis (PDF)
├── Subir factura eléctrica (si la cliente la compartió)
└── Otros documentos

Botones: Guardar | Guardar y generar cotización | Cancelar
```

---

### 4.5 GENERAR COTIZACIÓN (/dashboard/tecnico/cotizacion/)

**Asistente de cotización:**

**Paso 1: Seleccionar productos**
```
Basado en las mediciones, sistema sugiere:

Panel Solar:
├── Modelo (dropdown con opciones)
├── Cantidad calculada: X unidades
├── Precio unitario: $XXX
├── Subtotal: $XXXX
└── Razón: "Según carga de XX kW"

Inversor:
├── Modelo (dropdown)
├── Cantidad: 1
├── Precio: $XXXX
└── Razón: "Capacidad necesaria para XX kW"

Baterías/Banco de energía:
├── Modelo (dropdown)
├── Cantidad: X
├── Precio unitario: $XXX
├── Subtotal: $XXXX
└── Razón: "Para autonomía de X horas"

Accesorios necesarios:
├── Cable de X mm² - X metros - $XX
├── Estructura de montaje - $XX
├── Controlador de carga - $XX
├── Disyuntores - $XX
└── Otros (agregar manual)

Cada producto puede editarse (cambiar cantidad, modelo, etc)

Botón: "Siguiente"
```

**Paso 2: Costos y precios**
```
Materiales:
├── Subtotal de productos: $XXXX
└── ✓ Subtotal calculado automáticamente

Mano de obra:
├── Costo por hora: $XX (configurable)
├── Horas estimadas: X horas
├── Costo instalación: $XXXX
├── Botón: Ajustar horas

Costos adicionales:
├── Viajes/gasolina (opcional): $XX
├── Permisos (opcional): $XX
├── Otros costos: $XX
└── Agregar costo adicional

Descuentos:
├── Descuento manual: $XX (o %)
└── Motivo: [textarea]

Resumen:
├── Subtotal: $XXXX
├── Descuentos: -$XX
├── Subtotal descuentos: $XXXX
├── IVA (16%): $XXXX
├── TOTAL: $XXXXXX

Margen de ganancia:
├── Porcentaje aplicado: XX%
├── Ganancia total: $XXXX
└── Cambiar margen: [input]

Botón: "Siguiente"
```

**Paso 3: Términos y condiciones**
```
Plazo de validez de cotización:
├── Vigencia: X días
└── Fecha de vencimiento: DD/MM/YYYY

Condiciones de pago:
├── ○ Pago completo antes
├── ○ 50% anticipo, 50% antes de instalar
├── ○ 100% después de instalar
└── Otra opción

Tiempo de instalación:
├── Fecha estimada de inicio: DD/MM/YYYY
├── Duración estimada: X días
└── Disponibilidad del técnico

Incluye:
├── ✓ Materiales listados arriba
├── ✓ Mano de obra (instalación)
├── ✓ Garantía: X años
├── □ Mantenimiento post-instalación
├── □ Capacitación de uso
└── □ Otros servicios

Notas adicionales:
├── [textarea]
└── Puede incluir información sobre garant ía, servicios post-venta, etc

Botón: "Siguiente"
```

**Paso 4: Revisión y envío**
```
Resumen de cotización:
├── Número de cotización (auto-generado)
├── Cliente
├── Fecha de generación
├── Vigencia: DD/MM/YYYY

Desglose de precios:
├── Tabla de productos y precios
├── Subtotal
├── IVA
├── TOTAL FINAL

Vista previa del PDF (pequeña)

Botones:
├── Generar PDF
├── Descargar PDF
├── Enviar por email al cliente
└── Guardar como borrador

Confirmación:
├── "Cotización enviada exitosamente"
├── "El cliente recibirá el PDF en su email"
└── Botón: "Volver a mis solicitudes"
```

---

## 5. DASHBOARD DE CLIENTE (/dashboard/cliente/)

### 5.1 PÁGINA PRINCIPAL - Dashboard

**Widgets:**
```
┌─────────────────────────────────────────────────────┐
│             DASHBOARD CLIENTE                        │
│                                                      │
│ Hola, [Nombre Cliente]  [Perfil]  [Cerrar sesión]  │
└─────────────────────────────────────────────────────┘

ROW 1: KPIs
┌───────────┬────────────┬────────────┬───────────┐
│ Compras   │ Pendientes │ Solicitudes│  Dinero   │
│ Totales   │  de Pago   │  Activas   │ Gastado   │
│    X      │     X      │     X      │  $XXXX    │
└───────────┴────────────┴────────────┴───────────┘

ROW 2: Órdenes recientes (tabla)
├── Número de orden
├── Fecha
├── Total
├── Estado
├── Acciones: Ver detalles | Rastrear | Descargar factura

ROW 3: Solicitudes activas (tabla)
├── Número de solicitud
├── Tipo
├── Estado
├── Fecha
├── Acciones: Ver detalles | Descargar cotización

ROW 4: Próximas instalaciones (si hay)
├── Fecha
├── Técnico asignado
├── Ubicación
└── Botón: Confirmar/Reprogramar
```

**Navegación lateral:**
```
Mi Cuenta
├── Dashboard (actual)
├── Mis compras
│   ├── Todos los pedidos
│   └── Búsqueda
├── Mis solicitudes
│   ├── Cotizaciones
│   ├── En revisión
│   └── Completadas
├── Mis cotizaciones
├── Rastreo de pedidos
├── Mi perfil
│   ├── Datos personales
│   ├── Mis direcciones
│   ├── Mis documentos
│   └── Contraseña
├── Historial de compras
└── Cerrar sesión
```

---

### 5.2 MIS COMPRAS (/dashboard/cliente/compras/)

**Listado de pedidos:**
```
Filtros:
├── Estado: Todos, Pendiente pago, Pagado, Enviado, Entregado, Cancelado
├── Rango de fechas
└── Búsqueda por número o producto

Tabla:
├── Número de pedido (link)
├── Fecha
├── Productos (cantidad)
├── Total
├── Estado (con color)
├── Acciones: Ver detalles | Rastrear | Factura | Devolver

Cada fila expandible para ver resumen rápido
```

**Detalle de pedido:**
```
Información del pedido:
├── Número y fecha
├── Estado actual
├── Total
├── Método de pago
├── Referencia (si pagó)

Productos comprados:
├── Tabla:
│   ├── Imagen
│   ├── Nombre
│   ├── Cantidad
│   ├── Precio unitario
│   ├── Subtotal
│   └── Link a producto

Dirección de entrega:
├── Calle, número, apto
├── Ciudad, estado
├── Teléfono de contacto

Seguimiento de envío:
├── Estado del envío (Preparando, Enviado, En tránsito, Entregado)
├── Fecha estimada de entrega
├── Número de rastreo (si está disponible)
├── Link a rastreador externo (si aplica)
└── Timeline de eventos

Factura:
├── Botón: Descargar PDF
└── Botón: Enviar por email

Servicios adicionales:
├── Si incluye instalación:
│   ├── Estado de instalación
│   ├── Técnico asignado
│   ├── Fecha agendada
│   └── Link a detalles de instalación

Acciones:
├── Si está pendiente de pago: Pagar ahora
├── Si está en envío: Rastrear paquete
├── Si ya fue entregado: Dejar comentario
└── Problema/Duda: Contactar soporte
```

---

### 5.3 MIS SOLICITUDES (/dashboard/cliente/solicitudes/)

**Listado:**
```
Filtros:
├── Estado: Pendiente, En revisión, Cotizando, Cotización enviada, Aceptada, Instalando, Completada
├── Tipo: Todos, Paneles, Cercas, Ambos
└── Rango de fechas

Grid/Tabla:
├── Número de solicitud
├── Tipo de servicio
├── Estado (con icono/color)
├── Fecha de solicitud
├── Próximo paso
└── Link → Ver detalles
```

**Detalle de solicitud:**
```
Estado de la solicitud (timeline visual):
├── 1. Solicitud recibida ✓ (fecha)
├── 2. En revisión técnica ○ (esperando)
├── 3. Visita técnica ○
├── 4. Cotización ○
├── 5. Aceptación ○
├── 6. Instalación ○
└── 7. Completada ○

Información de la solicitud:
├── Número y fecha
├── Tipo de servicio
├── Descripción del proyecto

Datos técnicos:
├── Carga eléctrica
├── Consumo mensual
├── Ubicación

Técnico asignado:
├── Nombre y foto
├── Email
├── Teléfono
├── Especialidad
└── Botón: Contactar

Visita técnica (cuando esté agendada):
├── Fecha y hora
├── Ubicación
├── Botón: Confirmar asistencia
├── Botón: Cambiar fecha
└── Botón: Contactar técnico

Cotización (cuando esté lista):
├── Número de cotización
├── Monto total
├── Vigencia hasta: DD/MM/YYYY
├── Botón: Descargar PDF
├── Botón: Enviar a otro email
├── Botón: Imprimir
├── ✓ Aceptar cotización → Crea pedido
├── ✗ Rechazar cotización → Formulario de motivo
└── Preguntas: Contactar técnico

Pedido (cuando la cotización es aceptada):
├── Número de pedido
├── Estado
├── Link → Ver en Mis Compras

Instalación (cuando está agendada):
├── Fecha estimada
├── Técnico
├── Duración estimada
├── Botón: Confirmar fecha
├── Botón: Cambiar fecha
└── Botón: Contactar

Documentos:
├── Cotización (PDF)
├── Pedido (PDF)
├── Factura (cuando se genera)
└── Informe de instalación (después de completar)

Acciones:
├── Descargar cotización
├── Aceptar/Rechazar cotización
├── Confirmar visita
├── Descargar factura
└── Contactar técnico
```

---

### 5.4 MI PERFIL (/dashboard/cliente/perfil/)

**Datos personales:**
```
Nombre completo *
Email *
Teléfono *
Tipo de documento (Cédula/Pasaporte/RIF) *
Número de documento *
Fecha de nacimiento (opcional)
Empresa (si es cliente empresa) (opcional)

Botón: Guardar cambios
```

**Mis direcciones:**
```
Lista de direcciones guardadas:
├── Dirección 1 (Residencia)
│   ├── Calle, número, apto
│   ├── Ciudad, estado
│   ├── Botones: Editar | Eliminar | Establecer como principal
│
└── Dirección 2 (Comercio)

Botón: + Agregar nueva dirección

Formulario agregar/editar:
├── Tipo: ○ Residencial ○ Comercial
├── Nombre de dirección (ej: "Casa" o "Oficina")
├── Calle *
├── Número *
├── Apartamento/Piso (opcional)
├── Ciudad *
├── Estado *
├── Código postal
├── Referencia
├── ☐ Establecer como principal
└── Botones: Guardar | Cancelar
```

**Cambiar contraseña:**
```
Contraseña actual *
Contraseña nueva * (validación: 8+ caracteres, mayúscula, número, símbolo)
Confirmar contraseña nueva *

Botón: Cambiar contraseña
```

**Mis documentos (opcional):**
```
Documentos de cliente:
├── Factura eléctrica (para cálculos técnicos)
├── Documentos de identidad (para registro)
└── Documentos de propiedad (para ubicación)

Botón: Subir documento
```

---

## 6. RESUMEN DE VISTAS Y FUNCIONALIDADES

| Módulo | Vistas | Usuarios | Funcionalidad Principal |
|--------|--------|----------|------------------------|
| **Web Pública** | 10 | Anónimo/Registrado | Catálogo, Tienda, Solicitudes |
| **Dashboard Admin** | 8 | Admin | Gestionar todo el sistema |
| **Dashboard Técnico** | 6 | Técnico | Gestionar asignaciones y visitas |
| **Dashboard Cliente** | 5 | Cliente | Ver compras y solicitudes |
| **Total** | **29 vistas principales** | **4 roles** | Plataforma completa |

---

**SIGUIENTE PASO:** Crear estructura de carpetas del proyecto y comenzar con SQL schema.
