# ARQUITECTURA - SERVICIOS Y SUMINISTROS SP
## Tienda Online + Sistema de Cotizaciones Personalizadas

---

## 1. VISIÓN GENERAL

**Servicios y Suministros SP** es una plataforma que integra:
- **Tienda Online**: Venta directa de productos
- **Sistema de Cotizaciones**: Solicitudes personalizadas que requieren revisión técnica

Ambos comparten el mismo **catálogo de productos**, pero tienen flujos diferentes.

---

## 2. USUARIOS DEL SISTEMA

### 2.1 CLIENTE (Sin registrar o Registrado)
**Acceso:**
- Ver tienda de productos
- Comprar directamente (carrito)
- Crear solicitudes de cotización
- Ver historial de compras/solicitudes (si está registrado)
- Descargar cotizaciones

**Funciones:**
- Navegar productos por categoría
- Agregar productos al carrito
- Completar checkout y pago
- Completar formulario de solicitud
- Recibir notificaciones por email

### 2.2 CLIENTE REGISTRADO (Extra)
**Acceso:**
- Todo lo anterior, más:
- Dashboard personal
- Historial de compras
- Historial de solicitudes/cotizaciones
- Guardar direcciones
- Ver estado de pedidos en tiempo real

### 2.3 TÉCNICO/ASESOR
**Acceso:**
- Panel de administración técnica
- Ver solicitudes pendientes
- Revisar detalles de solicitud
- Confirmar/rechazar solicitud
- Agendar visita
- Subir informe de visita (fotos, mediciones)
- Generar cotización
- Ver estado de instalaciones

### 2.4 ADMIN/GERENTE
**Acceso:**
- Panel administrativo completo
- Gestionar productos (CRUD)
- Gestionar técnicos
- Ver reportes y estadísticas
- Gestionar pedidos
- Gestionar solicitudes
- Gestionar pagos
- Configurar precios y márgenes

---

## 3. FLUJOS DE NEGOCIO

### FLUJO 1: COMPRA DIRECTA EN TIENDA

```
1. Cliente anonimizado navega tienda
2. Selecciona productos → Carrito
3. Completa datos (nombre, email, teléfono, dirección)
4. Selecciona método de pago
5. Pago procesado
6. Sistema crea PEDIDO (sin técnico asignado)
7. Cliente recibe confirmación
8. Opción: "¿Deseas agregar instalación?" 
   - Sí → Crea SOLICITUD DE INSTALACIÓN
   - No → Pedido listo para entrega/retiro
```

**Automatizaciones:**
- Email confirmación automático
- Cálculo de impuestos automático
- Descuento si agrega instalación

---

### FLUJO 2: SOLICITUD DE COTIZACIÓN PERSONALIZADA

```
1. Cliente hace clic en "Solicitar Cotización"
2. Completa formulario:
   - Datos personales
   - Tipo de proyecto (paneles+inversor, cerca eléctrica, ambos)
   - Carga eléctrica / Consumo mensual
   - Ubicación/zona
   - Descripción adicional
   - Disponibilidad para visita
3. Envía solicitud
4. Sistema crea SOLICITUD (estado: PENDIENTE)
5. Email a cliente: "Solicitud recibida, nos contactaremos pronto"

--- PANEL TÉCNICO ---

6. Técnico ve solicitud en dashboard
7. Técnico revisa detalles
8. Técnico CONFIRMA o RECHAZA
   - Si CONFIRMA:
     * Estado → EN REVISIÓN
     * Agendar visita técnica
     * Email a cliente: Visita agendada
     * Técnico realiza visita (toma fotos, mediciones, valida carga)
     * Sube informe
   - Si RECHAZA:
     * Email a cliente: Explica motivo
     * Estado → RECHAZADO

9. Con informe técnico, sistema CALCULA automáticamente:
   - Equipo necesario (paneles, inversor, batería, etc.)
   - Costo de materiales
   - Costo de instalación
   - Total con ganancia

10. Técnico REVISA y AJUSTA si es necesario
11. Cotización generada (PDF)
12. Email a cliente con cotización
13. Cliente ACEPTA o RECHAZA
    - Si ACEPTA:
      * Crea PEDIDO (asociado a solicitud)
      * Se agenda instalación
      * Email: "¡Aceptado! Tu instalación se realizará el..."
    - Si RECHAZA:
      * Estado → RECHAZADO POR CLIENTE
      * Opcional: Técnico llama para negociar

14. Instalación realizada
15. Cliente paga (si no pagó antes)
16. Instalación completa → Pedido CERRADO
```

**Automatizaciones:**
- Cálculo automático de equipos necesarios
- Generación automática de PDF de cotización
- Emails en cada cambio de estado
- Cálculo de margen de ganancia

---

## 4. MÓDULOS DEL SISTEMA

### 4.1 MÓDULO TIENDA
**Funcionalidades:**
- Catálogo de productos
- Filtros y búsqueda
- Carrito de compras
- Checkout
- Procesamiento de pagos
- Gestión de pedidos
- Historial de compras

**Características técnicas:**
- Inventario en tiempo real
- Precios dinámicos
- Descuentos/promociones
- Notificaciones de stock bajo

---

### 4.2 MÓDULO COTIZACIONES
**Funcionalidades:**
- Formulario de solicitud
- Dashboard de solicitudes (para técnico)
- Confirmación/rechazo de solicitudes
- Agendador de visitas
- Generador de cotizaciones
- Cálculo automático de equipos
- Historial de cotizaciones

**Características técnicas:**
- Lógica de cálculo (fórmulas técnicas)
- Validación de datos técnicos
- Generación de PDF
- Estado workflow

---

### 4.3 MÓDULO USUARIOS
**Funcionalidades:**
- Registro/login
- Perfil de usuario
- Gestión de direcciones
- Dashboard personal
- Historial

**Características técnicas:**
- Autenticación segura
- Roles y permisos
- Recuperación de contraseña

---

### 4.4 MÓDULO ADMINISTRATIVO
**Funcionalidades:**
- CRUD de productos
- Gestión de técnicos
- Reportes y estadísticas
- Gestión de pedidos
- Gestión de solicitudes
- Configuración del sistema

---

## 5. BASE DE DATOS - TABLAS PRINCIPALES

### TABLAS DE PRODUCTOS
```
PRODUCTOS
├── id
├── nombre
├── descripcion
├── categoria (paneles, inversores, baterías, accesorios, cámaras, cercas)
├── marca
├── modelo
├── especificaciones (JSON - potencia, voltaje, etc)
├── precio_costo
├── precio_venta
├── margen_ganancia
├── stock_actual
├── stock_minimo
├── imagen_url
├── estado (activo/inactivo)
├── created_at
└── updated_at

CATEGORIAS
├── id
├── nombre
├── slug
├── descripcion
└── imagen_url
```

### TABLAS DE CLIENTES
```
CLIENTES
├── id
├── nombre
├── email
├── telefono
├── ci/rif
├── tipo_cliente (persona/empresa)
├── fecha_registro
├── estado
└── notas

DIRECCIONES_CLIENTE
├── id
├── cliente_id
├── tipo (residencial/comercial)
├── calle
├── numero
├── apto
├── ciudad
├── estado
├── codigo_postal
├── latitud
├── longitud
├── es_principal
└── created_at
```

### TABLAS DE TIENDA
```
PEDIDOS
├── id
├── numero_pedido (único)
├── cliente_id (nullable si es anónimo)
├── subtotal
├── impuestos
├── total
├── estado (pendiente_pago, pagado, enviado, entregado, cancelado)
├── metodo_pago (transferencia, efectivo, tarjeta)
├── fecha_pedido
├── fecha_pago
├── fecha_entrega_esperada
├── direccion_entrega_id
├── notas
├── created_at
└── updated_at

DETALLES_PEDIDO
├── id
├── pedido_id
├── producto_id
├── cantidad
├── precio_unitario
├── subtotal
└── notas_adicionales

PAGOS
├── id
├── pedido_id
├── cantidad
├── metodo
├── referencia_transaccion
├── estado (pendiente, confirmado, rechazado)
├── fecha_pago
└── created_at
```

### TABLAS DE COTIZACIONES
```
SOLICITUDES_COTIZACION
├── id
├── numero_solicitud (único)
├── cliente_id (si está registrado)
├── nombre_cliente (si anónimo)
├── email
├── telefono
├── tipo_solicitud (paneles_inversor, cerca_electrica, ambos, otro)
├── carga_electrica (kW)
├── consumo_mensual (kWh)
├── descripcion_proyecto
├── ubicacion
├── disponibilidad_visita
├── presupuesto_aproximado
├── estado (pendiente, en_revision, confirmada, rechazada, cotizando, cotizacion_enviada, aceptada, instalando, completada)
├── tecnico_asignado_id
├── fecha_solicitud
├── fecha_confirmacion
├── fecha_rechaza
├── fecha_visita_agendada
├── notas_internas
├── created_at
└── updated_at

VISITAS_TECNICAS
├── id
├── solicitud_id
├── tecnico_id
├── fecha_visita
├── hora_visita
├── notas_previa
├── confirmado (bool)
├── carga_confirmada (kW)
├── consumo_real (kWh)
├── horas_sol_zona
├── observations (texto)
├── fotos_urls (JSON - array de rutas)
├── estado (agendada, completada, cancelada)
├── created_at
└── updated_at

COTIZACIONES
├── id
├── numero_cotizacion (único)
├── solicitud_id
├── tecnico_id
├── total_materiales
├── costo_instalacion
├── descuento (%)
├── total_final
├── margen_ganancia (%)
├── pdf_url
├── estado (borrador, enviada, aceptada, rechazada, vencida)
├── fecha_creacion
├── fecha_vencimiento
├── fecha_aceptacion
├── pedido_id (cuando se convierte en pedido)
├── notas
├── created_at
└── updated_at

DETALLES_COTIZACION
├── id
├── cotizacion_id
├── producto_id
├── cantidad
├── precio_unitario
├── subtotal
└── razon (equipo necesario para...)

EQUIPOS_SUGERIDOS
├── id
├── cotizacion_id
├── producto_id
├── cantidad_calculada
└── razon_calculo
```

### TABLAS DE TÉCNICOS
```
TECNICOS
├── id
├── nombre
├── email
├── telefono
├── especialidad (paneles, cercas, ambas)
├── estado (activo/inactivo)
├── zona_cobertura
├── telefono_contacto_emergencia
├── documento_id
├── costo_hora_instalacion
├── created_at
└── updated_at

ASIGNACIONES_TECNICO
├── id
├── tecnico_id
├── pedido_id
├── solicitud_id
├── fecha_asignacion
├── estado (asignado, en_progreso, completado, cancelado)
├── notas
└── created_at
```

### TABLAS DE CONFIGURACIÓN
```
CONFIGURACION
├── id
├── clave (ej: IVA, MARGEN_GANANCIA_PANELES, COSTO_HORA_INSTALACION)
├── valor
├── tipo (numero, texto, decimal, porcentaje)
├── descripcion
└── updated_at

CALCULOS_TECNICO (para guardar fórmulas y parámetros)
├── id
├── tipo_proyecto (paneles_inversor, cerca_electrica)
├── carga_por_persona (kW)
├── eficiencia_panel (%)
├── horas_sol_promedio_venezuela (horas)
├── factor_seguridad
├── descripcion
└── updated_at
```

---

## 6. PROCESOS AUTOMATIZADOS

### 6.1 Al crear SOLICITUD
- ✅ Validar datos
- ✅ Generar número único
- ✅ Enviar email confirmación al cliente
- ✅ Notificar a técnicos (nuevo) en panel

### 6.2 Al CONFIRMAR solicitud (técnico)
- ✅ Cambiar estado a EN_REVISIÓN
- ✅ Crear VISITA_TECNICA
- ✅ Enviar email al cliente (fecha y hora de visita)
- ✅ Crear reminder para técnico

### 6.3 Al RECHAZAR solicitud
- ✅ Cambiar estado
- ✅ Enviar email al cliente (con motivo)
- ✅ Notificar a técnico

### 6.4 Al COMPLETAR visita técnica
- ✅ Validar que se subieron fotos/mediciones
- ✅ Cambiar estado a COTIZANDO
- ✅ TRIGGER: Iniciar cálculo automático

### 6.5 CÁLCULO AUTOMÁTICO DE COTIZACIÓN
**Lógica:**
1. Validar carga confirmada
2. Aplicar factor de seguridad
3. Calcular paneles necesarios
   - Fórmula: (Consumo kWh / Horas sol) × Factor seguridad
4. Calcular inversor necesario
   - Debe ser ≥ a carga instalada
5. Calcular batería/banco de energía
   - Según autonomía deseada
6. Listar accesorios necesarios (cables, estructuras, etc)
7. Aplicar precios de productos
8. Agregar costo de instalación
9. Aplicar margen de ganancia
10. Generar PDF

### 6.6 Al GENERAR cotización
- ✅ Crear PDF descargable
- ✅ Cambiar estado a COTIZACION_ENVIADA
- ✅ Enviar PDF por email
- ✅ Crear enlace para descargar desde portal
- ✅ Establecer fecha de vencimiento (30 días)

### 6.7 Al ACEPTAR cotización
- ✅ Cambiar estado a ACEPTADA
- ✅ Crear PEDIDO automáticamente
- ✅ Crear orden de instalación
- ✅ Asignar técnico
- ✅ Enviar email confirmación
- ✅ Generar orden de compra

### 6.8 Al CREAR PEDIDO (desde tienda o cotización)
- ✅ Generar número único
- ✅ Reservar stock de productos
- ✅ Calcular fecha estimada de entrega
- ✅ Enviar confirmación
- ✅ Notificar a admin
- ✅ Si incluye instalación → Crear solicitud de instalación

### 6.9 Al PAGAR
- ✅ Validar pago
- ✅ Cambiar estado de PEDIDO
- ✅ Enviar recibo
- ✅ Liberar para preparación/instalación
- ✅ Notificar a técnico (si hay instalación)

### 6.10 Recordatorios automáticos
- ✅ Email: Cotización vence en 5 días
- ✅ Email: Pedido pendiente de pago después de 3 días
- ✅ Email: Recordar visita técnica agendada (1 día antes)

---

## 7. ROLES Y PERMISOS

### CLIENTE
```
- Ver catálogo
- Comprar productos
- Crear solicitud cotización
- Ver mis pedidos
- Ver mis solicitudes
- Descargar cotizaciones
```

### TÉCNICO
```
- Ver solicitudes asignadas
- Confirmar/rechazar solicitud
- Agendar visita
- Subir informe visita
- Generar cotización
- Ver estado instalaciones
- Reportar trabajo completado
```

### ADMIN
```
- Gestionar productos (CRUD)
- Gestionar técnicos
- Gestionar clientes
- Ver todas las solicitudes/pedidos
- Generar reportes
- Configurar sistema
- Gestionar pagos
```

---

## 8. FLUJOS DE PAGO

### Opción 1: Pago en TIENDA (antes)
```
Producto → Carrito → Checkout → Pago → Pedido → Entrega
```

### Opción 2: Pago en COTIZACIÓN (después de aceptación)
```
Solicitud → Cotización → Acepta → Pedido → Pago → Instalación
```

### Opción 3: Pago MIXTO (mitad ahora, mitad después)
```
Cotización → Acepta → Pago 50% → Comienza instalación → Pago 50% → Completado
```

---

## 9. INTEGRACIONES EXTERNAS

### Email
- Notificaciones automáticas

### SMS (Opcional)
- Recordatorios de visita
- Actualizaciones de estado

### Pasarela de Pagos
- Tarjeta de crédito
- Transferencia bancaria

### Google Maps API
- Ubicación de solicitudes
- Optimización de rutas técnicos

### WhatsApp (Opcional)
- Confirmación de visita
- Notificaciones

---

## 10. SEGURIDAD

- Autenticación con contraseña segura
- Hashing de contraseñas (bcrypt)
- Validación de todas las entradas
- HTTPS obligatorio
- Backup automático
- Protección contra CSRF
- Rate limiting en login
- Auditoría de cambios

---

## 11. FUNCIONALIDADES EXTRAS (Fase 2)

- Chat en vivo con técnico
- Galería de proyectos completados
- Testimonios de clientes
- Simulador de ahorro energético
- App móvil
- Sistema de recomendaciones
- Blog técnico
- Integración con redes sociales

---

## 12. RESUMEN DE FLUJOS PRINCIPALES

| Acción | Inicio | Fin | Participantes | Automatizaciones |
|--------|--------|-----|----------------|------------------|
| **Compra Tienda** | Cliente compra | Entrega | Cliente, Admin | Email confirmación, cálculo impuestos |
| **Solicitud Cotización** | Cliente solicita | Cotización aceptada | Cliente, Técnico, Admin | Email notificaciones, cálculo equipos |
| **Instalación** | Cotización aceptada | Completada | Cliente, Técnico | Asignación técnico, recordatorios |
| **Pago** | Checkout | Confirmación | Cliente, Sistema Pago | Validación, recibo, cambio estado |

---

**SIGUIENTE PASO:** Definir la estructura de carpetas del proyecto y comenzar con diseño de base de datos.
