-- ============================================================================
-- JEDD3DLAB — ESQUEMA MULTIEMPRESA (MULTI-TENANT)
-- ============================================================================
-- Cambios de fondo respecto a tu esquema actual:
--
-- 1. `empresas` deja de ser singleton. Cualquier usuario autenticado puede
--    crear una empresa (se vuelve admin automáticamente vía trigger).
-- 2. Nueva tabla `empresa_miembros`: relación N:M entre profiles y empresas,
--    con `rol` (admin/empleado/cliente) POR EMPRESA. El rol ya no vive en
--    `profiles` porque un mismo usuario podría pertenecer a más de una
--    empresa con roles distintos.
-- 3. TODAS las tablas operativas (impresoras, filamentos, clientes,
--    catalogo_productos, cotizaciones, reglas_margen_ganancia, pedidos,
--    ingresos, egresos, metas_financieras, configuracion_empresa) ahora
--    tienen `empresa_id` y el aislamiento se hace por membresía, no por
--    `user_id` dueño de fila.
-- 4. `configuracion_usuario` se renombra a `configuracion_empresa` y pasa a
--    tener PK `empresa_id` (es configuración del taller, no de una persona).
--    Aquí vive también `qr_pago_url` (ver análisis al final del archivo).
-- 5. Se agregan funciones SECURITY DEFINER `es_miembro_empresa` /
--    `es_staff_empresa` para evitar recursión de RLS y centralizar la
--    lógica de autorización.
--
-- Ejecutar sobre una base NUEVA o vacía. Si ya tienes datos con el esquema
-- viejo, este archivo no migra datos — solo define la estructura final.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ============================================================================
-- 1. TABLA: PROFILES  (identidad global del usuario, sin rol — el rol es por empresa)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    telefono TEXT,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- 2. TABLA: EMPRESAS  (ya NO es singleton — una app, muchas empresas)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.empresas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creado_por UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    logo_url TEXT,
    nombre_comercial TEXT NOT NULL,
    nit TEXT,
    razon_social TEXT,
    direccion_fiscal TEXT,
    ciudad TEXT,
    whatsapp TEXT,
    instagram TEXT,
    facebook TEXT,
    sitio_web TEXT,
    garantia TEXT DEFAULT 'Ofrecemos 15 días de garantía por defectos de impresión atribuibles al taller.',
    plan TEXT NOT NULL DEFAULT 'free',
    activa BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- 3. TABLA: EMPRESA_MIEMBROS  (membresía + rol por empresa)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.empresa_miembros (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rol TEXT NOT NULL DEFAULT 'cliente' CHECK (rol IN ('admin', 'empleado', 'cliente')),
    estado TEXT NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'invitado', 'suspendido')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (empresa_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_empresa_miembros_user ON public.empresa_miembros(user_id);
CREATE INDEX IF NOT EXISTS idx_empresa_miembros_empresa ON public.empresa_miembros(empresa_id);
ALTER TABLE public.empresa_miembros ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- 4. FUNCIONES DE AUTORIZACIÓN (SECURITY DEFINER — evitan recursión de RLS)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.es_miembro_empresa(p_empresa_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.empresa_miembros
        WHERE empresa_id = p_empresa_id
          AND user_id = auth.uid()
          AND estado = 'activo'
    );
$$;

CREATE OR REPLACE FUNCTION public.es_staff_empresa(p_empresa_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.empresa_miembros
        WHERE empresa_id = p_empresa_id
          AND user_id = auth.uid()
          AND rol IN ('admin', 'empleado')
          AND estado = 'activo'
    );
$$;

CREATE OR REPLACE FUNCTION public.es_admin_empresa(p_empresa_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.empresa_miembros
        WHERE empresa_id = p_empresa_id
          AND user_id = auth.uid()
          AND rol = 'admin'
          AND estado = 'activo'
    );
$$;

-- Al crear una empresa, quien la crea queda como admin automáticamente
CREATE OR REPLACE FUNCTION public.crear_admin_al_crear_empresa()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.empresa_miembros (empresa_id, user_id, rol, estado)
    VALUES (NEW.id, NEW.creado_por, 'admin', 'activo');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_crear_admin_empresa ON public.empresas;
CREATE TRIGGER trg_crear_admin_empresa
AFTER INSERT ON public.empresas
FOR EACH ROW EXECUTE FUNCTION public.crear_admin_al_crear_empresa();


-- ============================================================================
-- 5. TABLA: CONFIGURACION_EMPRESA  (antes "configuracion_usuario")
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.configuracion_empresa (
    empresa_id UUID PRIMARY KEY REFERENCES public.empresas(id) ON DELETE CASCADE,
    costo_kwh NUMERIC(8, 4) NOT NULL DEFAULT 0.80,
    costo_mano_obra_hora NUMERIC(8, 2) NOT NULL DEFAULT 25.00,
    costo_operativo_fijo_mensual NUMERIC(10, 2) DEFAULT 0,
    horas_laborables_mes INT DEFAULT 160,
    tasa_fallo_defecto_pct NUMERIC(5, 2) DEFAULT 10.0,
    impuesto_pct NUMERIC(5, 2) DEFAULT 0.0,
    margen_ganancia_defecto_pct NUMERIC(5, 2) DEFAULT 30.0,
    moneda TEXT DEFAULT 'BOB',
    qr_pago_url TEXT,              -- imagen del QR de cobro del taller (ver análisis)
    qr_pago_titular TEXT,          -- nombre que aparece en el QR (opcional, referencia visual)
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.configuracion_empresa ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- 6. TABLA: IMPRESORAS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.impresoras (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE NOT NULL,
    marca TEXT,
    modelo TEXT NOT NULL,
    costo_compra NUMERIC(10, 2) NOT NULL,
    vida_util_horas INT NOT NULL DEFAULT 3000,
    potencia_watts NUMERIC(8, 2) NOT NULL DEFAULT 150,
    costo_mantenimiento_hora NUMERIC(8, 2) NOT NULL DEFAULT 0.50,
    horas_uso_total NUMERIC(10, 2) DEFAULT 0,
    estado TEXT DEFAULT 'disponible',
    pedido_actual TEXT,
    fecha_adquisicion DATE,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_impresoras_empresa ON public.impresoras(empresa_id);
ALTER TABLE public.impresoras ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- 7. TABLA: FILAMENTOS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.filamentos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE NOT NULL,
    marca TEXT,
    material TEXT NOT NULL,
    color TEXT,
    color_hex TEXT,
    capacidad_rollo_gramos NUMERIC(8, 2) NOT NULL DEFAULT 1000,
    costo_compra NUMERIC(10, 2) NOT NULL,
    stock_gramos NUMERIC(8, 2) NOT NULL DEFAULT 1000,
    umbral_bajo_stock NUMERIC(8, 2) DEFAULT 200,
    proveedor TEXT,
    fecha_compra DATE,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_filamentos_empresa ON public.filamentos(empresa_id);
ALTER TABLE public.filamentos ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- 8. TABLA: CLIENTES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.clientes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE NOT NULL,
    nombre TEXT NOT NULL,
    telefono TEXT,
    direccion TEXT,
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (empresa_id, telefono)
);

CREATE INDEX IF NOT EXISTS idx_clientes_empresa ON public.clientes(empresa_id);
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- 9. TABLA: CATALOGO_PRODUCTOS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.catalogo_productos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE NOT NULL,
    nombre TEXT NOT NULL,
    categoria TEXT,
    descripcion TEXT,
    precio_referencia NUMERIC(10, 2),
    tiempo_impresion_horas NUMERIC(6, 2),
    peso_gramos NUMERIC(8, 2),
    filamento_sugerido_id UUID REFERENCES public.filamentos(id) ON DELETE SET NULL,
    impresora_sugerida_id UUID REFERENCES public.impresoras(id) ON DELETE SET NULL,
    stock_terminado INT NOT NULL DEFAULT 0,
    umbral_stock_bajo INT NOT NULL DEFAULT 2,
    imagen_url TEXT,
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_catalogo_empresa_activo ON public.catalogo_productos(empresa_id, activo);
ALTER TABLE public.catalogo_productos ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- 10. TABLA: COTIZACIONES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.cotizaciones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE NOT NULL,
    creado_por UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
    codigo_cotizacion SERIAL,
    cliente_nombre TEXT NOT NULL,      -- respaldo histórico si el cliente se borra
    cliente_contacto TEXT,
    costo_directo_total NUMERIC(10, 2) NOT NULL DEFAULT 0,
    costo_indirecto_total NUMERIC(10, 2) NOT NULL DEFAULT 0,
    costo_fallos_total NUMERIC(10, 2) NOT NULL DEFAULT 0,
    subtotal_costo_base NUMERIC(10, 2) NOT NULL DEFAULT 0,
    monto_ganancia NUMERIC(10, 2) NOT NULL DEFAULT 0,
    monto_impuesto NUMERIC(10, 2) NOT NULL DEFAULT 0,
    precio_final NUMERIC(10, 2) NOT NULL DEFAULT 0,
    margen_ganancia_aplicado_pct NUMERIC(5, 2) NOT NULL,
    estado TEXT CHECK (estado IN ('pendiente', 'aceptada', 'rechazada', 'completada')) DEFAULT 'pendiente',
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cotizaciones_empresa ON public.cotizaciones(empresa_id);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_cliente ON public.cotizaciones(cliente_id);
ALTER TABLE public.cotizaciones ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- 11. TABLA: COTIZACION_ITEMS  (hereda empresa vía cotizacion_id, no necesita empresa_id propio)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.cotizacion_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cotizacion_id UUID REFERENCES public.cotizaciones(id) ON DELETE CASCADE NOT NULL,
    impresora_id UUID REFERENCES public.impresoras(id) ON DELETE SET NULL,
    filamento_id UUID REFERENCES public.filamentos(id) ON DELETE SET NULL,

    nombre_pieza TEXT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    peso_gramos NUMERIC(8, 2) NOT NULL,
    tiempo_impresion_horas NUMERIC(6, 2) NOT NULL,
    tiempo_preparacion_minutos INT NOT NULL DEFAULT 15,
    tiempo_postprocesado_minutos INT NOT NULL DEFAULT 0,

    costo_material NUMERIC(8, 2) NOT NULL,
    costo_energia NUMERIC(8, 2) NOT NULL,
    costo_amortizacion NUMERIC(8, 2) NOT NULL,
    costo_mantenimiento NUMERIC(8, 2) NOT NULL,
    costo_mano_obra NUMERIC(8, 2) NOT NULL,
    costo_subtotal_item NUMERIC(10, 2) NOT NULL,

    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cotizacion_items_cotizacion ON public.cotizacion_items(cotizacion_id);
ALTER TABLE public.cotizacion_items ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- 12. TABLA: REGLAS_MARGEN_GANANCIA
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.reglas_margen_ganancia (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE NOT NULL,
    cantidad_minima INT NOT NULL DEFAULT 1,
    cantidad_maxima INT,
    margen_ganancia_pct NUMERIC(5, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT chk_rango_valido CHECK (cantidad_maxima IS NULL OR cantidad_maxima >= cantidad_minima),
    CONSTRAINT chk_cantidad_minima_positiva CHECK (cantidad_minima > 0)
);

CREATE INDEX IF NOT EXISTS idx_reglas_margen_empresa ON public.reglas_margen_ganancia(empresa_id);
ALTER TABLE public.reglas_margen_ganancia ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- 13. TABLA: PEDIDOS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.pedidos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE NOT NULL,
    creado_por UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    cotizacion_id UUID REFERENCES public.cotizaciones(id) ON DELETE SET NULL,
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE RESTRICT NOT NULL,
    producto_id UUID REFERENCES public.catalogo_productos(id) ON DELETE SET NULL,
    codigo_pedido SERIAL,

    pieza_descripcion TEXT NOT NULL,
    estado TEXT NOT NULL DEFAULT 'pendiente'
        CHECK (estado IN ('pendiente', 'en_impresion', 'listo', 'entregado')),
    fecha_entrega TIMESTAMPTZ,

    pago_total NUMERIC(10, 2) NOT NULL DEFAULT 0,
    pago_anticipo_pct NUMERIC(5, 2) NOT NULL DEFAULT 50,
    pago_monto_cobrado NUMERIC(10, 2) NOT NULL DEFAULT 0,   -- mantenido por trigger
    pago_estado TEXT NOT NULL DEFAULT 'sin_pagar'            -- mantenido por trigger
        CHECK (pago_estado IN ('sin_pagar', 'anticipo', 'pagado')),

    envio_tipo TEXT NOT NULL DEFAULT 'recogida'
        CHECK (envio_tipo IN ('recogida', 'domicilio', 'transporte')),
    envio_costo NUMERIC(8, 2) DEFAULT 0,
    envio_tracking TEXT,

    foto_final_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pedidos_empresa_estado ON public.pedidos(empresa_id, estado);
CREATE INDEX IF NOT EXISTS idx_pedidos_fecha_entrega ON public.pedidos(fecha_entrega);
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente ON public.pedidos(cliente_id);
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- 14. TABLA: PEDIDO_PAGOS  (fuente de verdad de los cobros — hereda empresa vía pedido_id)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.pedido_pagos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pedido_id UUID REFERENCES public.pedidos(id) ON DELETE CASCADE NOT NULL,
    registrado_por UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    tipo TEXT NOT NULL DEFAULT 'abono'
        CHECK (tipo IN ('anticipo', 'abono', 'pago_final')),
    monto NUMERIC(10, 2) NOT NULL CHECK (monto > 0),
    metodo TEXT NOT NULL CHECK (metodo IN ('transferencia', 'efectivo', 'qr')),
    comprobante_url TEXT,   -- captura del comprobante QUE ENVÍA EL CLIENTE (comprobante de pago)
    fecha TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pedido_pagos_pedido ON public.pedido_pagos(pedido_id);
ALTER TABLE public.pedido_pagos ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- 15. TABLA: PEDIDO_EVENTOS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.pedido_eventos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pedido_id UUID REFERENCES public.pedidos(id) ON DELETE CASCADE NOT NULL,
    texto TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pedido_eventos_pedido ON public.pedido_eventos(pedido_id);
ALTER TABLE public.pedido_eventos ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- 16. TABLA: PEDIDO_CHECKLIST_ITEMS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.pedido_checklist_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pedido_id UUID REFERENCES public.pedidos(id) ON DELETE CASCADE NOT NULL,
    label TEXT NOT NULL,
    hecho BOOLEAN DEFAULT false,
    orden INT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_checklist_pedido ON public.pedido_checklist_items(pedido_id);
ALTER TABLE public.pedido_checklist_items ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- 17. TABLAS: INGRESOS / EGRESOS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ingresos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE NOT NULL,
    pedido_id UUID REFERENCES public.pedidos(id) ON DELETE SET NULL,
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
    producto_id UUID REFERENCES public.catalogo_productos(id) ON DELETE SET NULL,
    concepto TEXT NOT NULL,
    monto NUMERIC(10, 2) NOT NULL CHECK (monto > 0),
    metodo TEXT NOT NULL CHECK (metodo IN ('transferencia', 'efectivo', 'qr')),
    fecha DATE NOT NULL DEFAULT current_date,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ingresos_empresa_fecha ON public.ingresos(empresa_id, fecha);
CREATE INDEX IF NOT EXISTS idx_ingresos_producto ON public.ingresos(producto_id);
ALTER TABLE public.ingresos ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.egresos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE NOT NULL,
    registrado_por UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    categoria TEXT NOT NULL
        CHECK (categoria IN ('material', 'energia', 'repuestos_reimpresion', 'mantenimiento', 'otro')),
    concepto TEXT NOT NULL,
    monto NUMERIC(10, 2) NOT NULL CHECK (monto > 0),
    metodo TEXT NOT NULL CHECK (metodo IN ('transferencia', 'efectivo', 'qr')),
    filamento_id UUID REFERENCES public.filamentos(id) ON DELETE SET NULL,
    impresora_id UUID REFERENCES public.impresoras(id) ON DELETE SET NULL,
    fecha DATE NOT NULL DEFAULT current_date,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_egresos_empresa_fecha ON public.egresos(empresa_id, fecha);
ALTER TABLE public.egresos ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- 18. TABLA: METAS_FINANCIERAS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.metas_financieras (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE NOT NULL,
    periodo DATE NOT NULL,
    monto_meta NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (empresa_id, periodo)
);

ALTER TABLE public.metas_financieras ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- 19. TRIGGERS updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_empresas_updated_at ON public.empresas;
CREATE TRIGGER update_empresas_updated_at
BEFORE UPDATE ON public.empresas
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_impresoras_updated_at ON public.impresoras;
CREATE TRIGGER update_impresoras_updated_at
BEFORE UPDATE ON public.impresoras
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_filamentos_updated_at ON public.filamentos;
CREATE TRIGGER update_filamentos_updated_at
BEFORE UPDATE ON public.filamentos
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_clientes_updated_at ON public.clientes;
CREATE TRIGGER update_clientes_updated_at
BEFORE UPDATE ON public.clientes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_catalogo_updated_at ON public.catalogo_productos;
CREATE TRIGGER update_catalogo_updated_at
BEFORE UPDATE ON public.catalogo_productos
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_pedidos_updated_at ON public.pedidos;
CREATE TRIGGER update_pedidos_updated_at
BEFORE UPDATE ON public.pedidos
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ============================================================================
-- 20. TRIGGERS DE NEGOCIO (pedidos / pagos)
-- ============================================================================

-- Historial automático al cambiar estado del pedido
CREATE OR REPLACE FUNCTION public.log_cambio_estado_pedido()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.estado IS DISTINCT FROM OLD.estado THEN
        INSERT INTO public.pedido_eventos (pedido_id, texto)
        VALUES (NEW.id, 'Estado cambiado a "' || NEW.estado || '"');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_cambio_estado ON public.pedidos;
CREATE TRIGGER trg_log_cambio_estado
AFTER UPDATE ON public.pedidos
FOR EACH ROW EXECUTE FUNCTION public.log_cambio_estado_pedido();

-- Regla: no se puede pasar a "en_impresion" sin el anticipo mínimo pagado
CREATE OR REPLACE FUNCTION public.validar_anticipo_antes_de_imprimir()
RETURNS TRIGGER AS $$
DECLARE
    minimo_requerido NUMERIC(10,2);
BEGIN
    IF NEW.estado = 'en_impresion' AND OLD.estado = 'pendiente' THEN
        minimo_requerido := ROUND(NEW.pago_total * (NEW.pago_anticipo_pct / 100.0), 2);
        IF NEW.pago_monto_cobrado < minimo_requerido THEN
            RAISE EXCEPTION
                'No se puede iniciar la impresión: falta cobrar el anticipo. Requerido: Bs % — Cobrado: Bs %',
                minimo_requerido, NEW.pago_monto_cobrado;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validar_anticipo ON public.pedidos;
CREATE TRIGGER trg_validar_anticipo
BEFORE UPDATE ON public.pedidos
FOR EACH ROW EXECUTE FUNCTION public.validar_anticipo_antes_de_imprimir();

-- Al insertar un pago: actualiza pedidos.pago_* y crea el ingreso en Finanzas
CREATE OR REPLACE FUNCTION public.procesar_pago_pedido()
RETURNS TRIGGER AS $$
DECLARE
    v_pedido public.pedidos%ROWTYPE;
    v_nuevo_cobrado NUMERIC(10,2);
    v_nuevo_estado_pago TEXT;
BEGIN
    SELECT * INTO v_pedido FROM public.pedidos WHERE id = NEW.pedido_id;

    v_nuevo_cobrado := v_pedido.pago_monto_cobrado + NEW.monto;
    v_nuevo_estado_pago := CASE
        WHEN v_nuevo_cobrado >= v_pedido.pago_total THEN 'pagado'
        WHEN v_nuevo_cobrado > 0 THEN 'anticipo'
        ELSE 'sin_pagar'
    END;

    UPDATE public.pedidos
    SET pago_monto_cobrado = v_nuevo_cobrado,
        pago_estado = v_nuevo_estado_pago
    WHERE id = NEW.pedido_id;

    INSERT INTO public.ingresos (empresa_id, pedido_id, cliente_id, producto_id, concepto, monto, metodo, fecha)
    VALUES (
        v_pedido.empresa_id,
        v_pedido.id,
        v_pedido.cliente_id,
        v_pedido.producto_id,
        v_pedido.pieza_descripcion || ' (' || NEW.tipo || ')',
        NEW.monto,
        NEW.metodo,
        NEW.fecha::date
    );

    INSERT INTO public.pedido_eventos (pedido_id, texto)
    VALUES (NEW.pedido_id, 'Pago registrado: Bs ' || NEW.monto || ' (' || NEW.tipo || ', ' || NEW.metodo || ')');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_procesar_pago ON public.pedido_pagos;
CREATE TRIGGER trg_procesar_pago
AFTER INSERT ON public.pedido_pagos
FOR EACH ROW EXECUTE FUNCTION public.procesar_pago_pedido();


-- ============================================================================
-- 21. POLÍTICAS RLS
-- ============================================================================

-- PROFILES: cada quien ve/edita su propio perfil global
DROP POLICY IF EXISTS "Ver propio perfil" ON public.profiles;
CREATE POLICY "Ver propio perfil" ON public.profiles
    FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Editar propio perfil" ON public.profiles;
CREATE POLICY "Editar propio perfil" ON public.profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Crear propio perfil" ON public.profiles;
CREATE POLICY "Crear propio perfil" ON public.profiles
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- EMPRESAS
DROP POLICY IF EXISTS "Ver empresas de las que soy miembro" ON public.empresas;
CREATE POLICY "Ver empresas de las que soy miembro" ON public.empresas
    FOR SELECT TO authenticated USING (public.es_miembro_empresa(id));

DROP POLICY IF EXISTS "Cualquier autenticado crea una empresa" ON public.empresas;
CREATE POLICY "Cualquier autenticado crea una empresa" ON public.empresas
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = creado_por);

DROP POLICY IF EXISTS "Solo admin edita su empresa" ON public.empresas;
CREATE POLICY "Solo admin edita su empresa" ON public.empresas
    FOR UPDATE TO authenticated USING (public.es_admin_empresa(id));

DROP POLICY IF EXISTS "Solo admin elimina su empresa" ON public.empresas;
CREATE POLICY "Solo admin elimina su empresa" ON public.empresas
    FOR DELETE TO authenticated USING (public.es_admin_empresa(id));

-- EMPRESA_MIEMBROS
DROP POLICY IF EXISTS "Ver miembros de mi empresa" ON public.empresa_miembros;
CREATE POLICY "Ver miembros de mi empresa" ON public.empresa_miembros
    FOR SELECT TO authenticated USING (public.es_miembro_empresa(empresa_id));

DROP POLICY IF EXISTS "Solo admin gestiona miembros" ON public.empresa_miembros;
CREATE POLICY "Solo admin gestiona miembros" ON public.empresa_miembros
    FOR ALL TO authenticated
    USING (public.es_admin_empresa(empresa_id))
    WITH CHECK (public.es_admin_empresa(empresa_id));

-- CONFIGURACION_EMPRESA
DROP POLICY IF EXISTS "Miembros ven la configuracion" ON public.configuracion_empresa;
CREATE POLICY "Miembros ven la configuracion" ON public.configuracion_empresa
    FOR SELECT TO authenticated USING (public.es_miembro_empresa(empresa_id));

DROP POLICY IF EXISTS "Staff edita la configuracion" ON public.configuracion_empresa;
CREATE POLICY "Staff edita la configuracion" ON public.configuracion_empresa
    FOR ALL TO authenticated
    USING (public.es_staff_empresa(empresa_id))
    WITH CHECK (public.es_staff_empresa(empresa_id));

-- Tablas con el mismo patrón: lectura para todo miembro, escritura solo staff
DO $$
DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'impresoras', 'filamentos', 'clientes', 'catalogo_productos',
        'cotizaciones', 'reglas_margen_ganancia', 'pedidos', 'ingresos',
        'egresos', 'metas_financieras'
    ]
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Miembros ven %1$s" ON public.%1$s', t);
        EXECUTE format(
            'CREATE POLICY "Miembros ven %1$s" ON public.%1$s FOR SELECT TO authenticated USING (public.es_miembro_empresa(empresa_id))',
            t
        );

        EXECUTE format('DROP POLICY IF EXISTS "Staff gestiona %1$s" ON public.%1$s', t);
        EXECUTE format(
            'CREATE POLICY "Staff gestiona %1$s" ON public.%1$s FOR INSERT TO authenticated WITH CHECK (public.es_staff_empresa(empresa_id))',
            t
        );
        EXECUTE format(
            'CREATE POLICY "Staff actualiza %1$s" ON public.%1$s FOR UPDATE TO authenticated USING (public.es_staff_empresa(empresa_id))',
            t
        );
        EXECUTE format(
            'CREATE POLICY "Staff elimina %1$s" ON public.%1$s FOR DELETE TO authenticated USING (public.es_staff_empresa(empresa_id))',
            t
        );
    END LOOP;
END $$;

-- COTIZACION_ITEMS (hereda autorización de la cotización padre)
DROP POLICY IF EXISTS "Acceso a items via cotizacion" ON public.cotizacion_items;
CREATE POLICY "Acceso a items via cotizacion" ON public.cotizacion_items
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.cotizaciones c
            WHERE c.id = cotizacion_items.cotizacion_id
              AND public.es_miembro_empresa(c.empresa_id)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.cotizaciones c
            WHERE c.id = cotizacion_items.cotizacion_id
              AND public.es_staff_empresa(c.empresa_id)
        )
    );

-- PEDIDO_PAGOS (hereda autorización del pedido padre)
DROP POLICY IF EXISTS "Acceso a pagos via pedido" ON public.pedido_pagos;
CREATE POLICY "Acceso a pagos via pedido" ON public.pedido_pagos
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.pedidos p
            WHERE p.id = pedido_pagos.pedido_id
              AND public.es_miembro_empresa(p.empresa_id)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.pedidos p
            WHERE p.id = pedido_pagos.pedido_id
              AND public.es_staff_empresa(p.empresa_id)
        )
    );

-- PEDIDO_EVENTOS (solo lectura para miembros; el registro lo hacen los triggers via SECURITY DEFINER de los propios triggers plpgsql, que corren con privilegios del owner de la función)
DROP POLICY IF EXISTS "Ver eventos via pedido" ON public.pedido_eventos;
CREATE POLICY "Ver eventos via pedido" ON public.pedido_eventos
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.pedidos p
            WHERE p.id = pedido_eventos.pedido_id
              AND public.es_miembro_empresa(p.empresa_id)
        )
    );

-- PEDIDO_CHECKLIST_ITEMS
DROP POLICY IF EXISTS "Acceso a checklist via pedido" ON public.pedido_checklist_items;
CREATE POLICY "Acceso a checklist via pedido" ON public.pedido_checklist_items
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.pedidos p
            WHERE p.id = pedido_checklist_items.pedido_id
              AND public.es_miembro_empresa(p.empresa_id)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.pedidos p
            WHERE p.id = pedido_checklist_items.pedido_id
              AND public.es_staff_empresa(p.empresa_id)
        )
    );


-- ============================================================================
-- 22. VISTAS PARA REPORTES (adaptadas a empresa_id)
-- ============================================================================
CREATE OR REPLACE VIEW public.vista_clientes_stats AS
SELECT
    c.id AS cliente_id,
    c.empresa_id,
    c.nombre,
    c.telefono,
    COUNT(p.id) AS pedidos_totales,
    (COUNT(p.id) > 1) AS recurrente,
    COALESCE(SUM(p.pago_monto_cobrado), 0) AS total_pagado,
    MAX(p.created_at) AS ultima_compra
FROM public.clientes c
LEFT JOIN public.pedidos p ON p.cliente_id = c.id
GROUP BY c.id;

CREATE OR REPLACE VIEW public.vista_productos_rentabilidad AS
SELECT
    cp.id AS producto_id,
    cp.empresa_id,
    cp.nombre,
    COUNT(i.id) AS unidades_vendidas,
    COALESCE(SUM(i.monto), 0) AS total_generado
FROM public.catalogo_productos cp
LEFT JOIN public.ingresos i ON i.producto_id = cp.id
GROUP BY cp.id;

CREATE OR REPLACE VIEW public.vista_finanzas_diario AS
SELECT empresa_id, fecha, 'ingreso' AS tipo, SUM(monto) AS total
FROM public.ingresos
GROUP BY empresa_id, fecha
UNION ALL
SELECT empresa_id, fecha, 'egreso' AS tipo, SUM(monto) AS total
FROM public.egresos
GROUP BY empresa_id, fecha;

-- Uso típico en la app (RLS filtra automáticamente por empresa del usuario):
--   SELECT date_trunc('week', fecha) AS semana, tipo, SUM(total)
--   FROM vista_finanzas_diario
--   WHERE empresa_id = '<empresa_activa_en_la_app>'
--   GROUP BY 1, 2 ORDER BY 1;