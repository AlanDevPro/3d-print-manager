-- ============================================================================
-- ESQUEMA COMPLEMENTARIO — JEDD3DLAB
-- Tablas para: Clientes, Catálogo/Inventario, Pedidos, Pagos, Historial,
-- Finanzas reales (ingresos/egresos), Metas.
--
-- Se ejecuta DESPUÉS de tu esquema base (profiles, configuracion_usuario,
-- impresoras, filamentos, cotizaciones, cotizacion_items,
-- reglas_margen_ganancia, empresas).
-- ============================================================================

-- ============================================================================
-- 1. TABLA: CLIENTES

---

-- Hoy el nombre/teléfono del cliente se repite como texto libre en cada
-- cotización y pedido. Sin esta tabla no puedes saber cuántas veces te ha
-- comprado alguien, ni calcular "cliente recurrente" de forma confiable.
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.clientes (
id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
nombre TEXT NOT NULL,
telefono TEXT,
direccion TEXT,
notas TEXT,
created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
UNIQUE (user_id, telefono)
);
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acceso total a sus clientes" ON public.clientes;
CREATE POLICY "Acceso total a sus clientes" ON public.clientes
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_clientes_updated_at ON public.clientes;
CREATE TRIGGER update_clientes_updated_at
BEFORE UPDATE ON public.clientes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Conecta cotizaciones existentes a la nueva tabla de clientes
-- (mantenemos cliente_nombre/cliente_contacto como respaldo histórico)
ALTER TABLE public.cotizaciones
ADD COLUMN IF NOT EXISTS cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_cotizaciones_cliente ON public.cotizaciones(cliente_id);

-- ============================================================================
-- 2. TABLA: CATALOGO_PRODUCTOS

---

-- Catálogo real de piezas que imprimes/vendes, con stock de piezas YA
-- terminadas (para poder imprimir por anticipado antes que te las pidan) y
-- un flag `activo` para piezas descontinuadas ("ya no en catálogo").
-- También es la pieza que le falta al ranking de "productos más rentables":
-- hoy ese ranking agrupa por texto libre, aquí agrupa por producto real y
-- puede cruzar contra costo de material/tiempo de impresión.
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.catalogo_productos (
id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
nombre TEXT NOT NULL,
categoria TEXT,
descripcion TEXT,
precio_referencia NUMERIC(10, 2),
tiempo_impresion_horas NUMERIC(6, 2),
peso_gramos NUMERIC(8, 2),
filamento_sugerido_id UUID REFERENCES public.filamentos(id) ON DELETE SET NULL,
impresora_sugerida_id UUID REFERENCES public.impresoras(id) ON DELETE SET NULL,
stock_terminado INT NOT NULL DEFAULT 0, -- piezas ya impresas, listas para vender
umbral_stock_bajo INT NOT NULL DEFAULT 2,
imagen_url TEXT,
activo BOOLEAN NOT NULL DEFAULT true, -- false = descontinuado / retirado del catálogo
created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.catalogo_productos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acceso total a su catalogo" ON public.catalogo_productos;
CREATE POLICY "Acceso total a su catalogo" ON public.catalogo_productos
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_catalogo_updated_at ON public.catalogo_productos;
CREATE TRIGGER update_catalogo_updated_at
BEFORE UPDATE ON public.catalogo_productos
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_catalogo_activo ON public.catalogo_productos(user_id, activo);

-- ============================================================================
-- 3. TABLA: PEDIDOS

---

-- La tabla que le falta a app/(tabs)/pedidos.tsx. Un pedido nace, opcionalmente,
-- de una cotización aceptada. `pago_anticipo_pct` fija la regla de negocio:
-- SIEMPRE se exige un % de anticipo antes de poder imprimir (ver trigger #6).
-- `pago_monto_cobrado` y `pago_estado` son columnas "caché" que se mantienen
-- automáticamente por trigger a partir de pedido_pagos (fuente de verdad).
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.pedidos (
id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
cotizacion_id UUID REFERENCES public.cotizaciones(id) ON DELETE SET NULL,
cliente_id UUID REFERENCES public.clientes(id) ON DELETE RESTRICT NOT NULL,
producto_id UUID REFERENCES public.catalogo_productos(id) ON DELETE SET NULL,
codigo_pedido SERIAL,

    pieza_descripcion TEXT NOT NULL,
    estado TEXT NOT NULL DEFAULT 'pendiente'
        CHECK (estado IN ('pendiente', 'en_impresion', 'listo', 'entregado')),
    fecha_entrega TIMESTAMPTZ,

    pago_total NUMERIC(10, 2) NOT NULL DEFAULT 0,
    pago_anticipo_pct NUMERIC(5, 2) NOT NULL DEFAULT 50,   -- regla: % mínimo exigido antes de imprimir
    pago_monto_cobrado NUMERIC(10, 2) NOT NULL DEFAULT 0,  -- mantenido por trigger
    pago_estado TEXT NOT NULL DEFAULT 'sin_pagar'          -- mantenido por trigger
        CHECK (pago_estado IN ('sin_pagar', 'anticipo', 'pagado')),

    envio_tipo TEXT NOT NULL DEFAULT 'recogida'
        CHECK (envio_tipo IN ('recogida', 'domicilio', 'transporte')),
    envio_costo NUMERIC(8, 2) DEFAULT 0,
    envio_tracking TEXT,

    foto_final_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL

);
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acceso total a sus pedidos" ON public.pedidos;
CREATE POLICY "Acceso total a sus pedidos" ON public.pedidos
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_pedidos_updated_at ON public.pedidos;
CREATE TRIGGER update_pedidos_updated_at
BEFORE UPDATE ON public.pedidos
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON public.pedidos(user_id, estado);
CREATE INDEX IF NOT EXISTS idx_pedidos_fecha_entrega ON public.pedidos(fecha_entrega);
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente ON public.pedidos(cliente_id);

-- ============================================================================
-- 4. TABLA: PEDIDO_PAGOS (fuente de verdad de los cobros)

---

-- Cada anticipo, abono o pago final queda registrado aquí. De aquí se derivan
-- pedidos.pago_monto_cobrado/pago_estado Y el ingreso correspondiente en
-- Finanzas (trigger #7) — así los dos módulos SIEMPRE cuadran, sin doble
-- captura de datos.
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.pedido_pagos (
id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
pedido_id UUID REFERENCES public.pedidos(id) ON DELETE CASCADE NOT NULL,
tipo TEXT NOT NULL DEFAULT 'abono'
CHECK (tipo IN ('anticipo', 'abono', 'pago_final')),
monto NUMERIC(10, 2) NOT NULL CHECK (monto > 0),
metodo TEXT NOT NULL CHECK (metodo IN ('transferencia', 'efectivo', 'qr')),
comprobante_url TEXT,
fecha TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.pedido_pagos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acceso a pagos de sus pedidos" ON public.pedido_pagos;
CREATE POLICY "Acceso a pagos de sus pedidos" ON public.pedido_pagos
FOR ALL USING (
EXISTS (SELECT 1 FROM public.pedidos WHERE pedidos.id = pedido_pagos.pedido_id AND pedidos.user_id = auth.uid())
);

CREATE INDEX IF NOT EXISTS idx_pedido_pagos_pedido ON public.pedido_pagos(pedido_id);

-- ============================================================================
-- 5. TABLA: PEDIDO_EVENTOS (historial del pedido — lo que ves en el modal)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.pedido_eventos (
id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
pedido_id UUID REFERENCES public.pedidos(id) ON DELETE CASCADE NOT NULL,
texto TEXT NOT NULL,
created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.pedido_eventos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acceso a eventos de sus pedidos" ON public.pedido_eventos;
CREATE POLICY "Acceso a eventos de sus pedidos" ON public.pedido_eventos
FOR ALL USING (
EXISTS (SELECT 1 FROM public.pedidos WHERE pedidos.id = pedido_eventos.pedido_id AND pedidos.user_id = auth.uid())
);

CREATE INDEX IF NOT EXISTS idx_pedido_eventos_pedido ON public.pedido_eventos(pedido_id);

-- ============================================================================
-- 5b. TABLA: PEDIDO_CHECKLIST_ITEMS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.pedido_checklist_items (
id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
pedido_id UUID REFERENCES public.pedidos(id) ON DELETE CASCADE NOT NULL,
label TEXT NOT NULL,
hecho BOOLEAN DEFAULT false,
orden INT DEFAULT 0
);
ALTER TABLE public.pedido_checklist_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acceso a checklist de sus pedidos" ON public.pedido_checklist_items;
CREATE POLICY "Acceso a checklist de sus pedidos" ON public.pedido_checklist_items
FOR ALL USING (
EXISTS (SELECT 1 FROM public.pedidos WHERE pedidos.id = pedido_checklist_items.pedido_id AND pedidos.user_id = auth.uid())
);

-- ============================================================================
-- 6. TABLAS: INGRESOS / EGRESOS (Finanzas real, ya no mock)

---

-- OJO: `fecha` es DATE, no texto — imprescindible para poder agrupar por
-- semana/mes/día en los reportes exportables.
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ingresos (
id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
pedido_id UUID REFERENCES public.pedidos(id) ON DELETE SET NULL, -- null = venta directa sin pedido
cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
producto_id UUID REFERENCES public.catalogo_productos(id) ON DELETE SET NULL,
concepto TEXT NOT NULL,
monto NUMERIC(10, 2) NOT NULL CHECK (monto > 0),
metodo TEXT NOT NULL CHECK (metodo IN ('transferencia', 'efectivo', 'qr')),
fecha DATE NOT NULL DEFAULT current_date,
created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.ingresos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acceso total a sus ingresos" ON public.ingresos;
CREATE POLICY "Acceso total a sus ingresos" ON public.ingresos
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_ingresos_fecha ON public.ingresos(user_id, fecha);
CREATE INDEX IF NOT EXISTS idx_ingresos_producto ON public.ingresos(producto_id);

CREATE TABLE IF NOT EXISTS public.egresos (
id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
categoria TEXT NOT NULL
CHECK (categoria IN ('material', 'energia', 'repuestos_reimpresion', 'mantenimiento', 'otro')),
concepto TEXT NOT NULL,
monto NUMERIC(10, 2) NOT NULL CHECK (monto > 0),
metodo TEXT NOT NULL CHECK (metodo IN ('transferencia', 'efectivo', 'qr')),
filamento_id UUID REFERENCES public.filamentos(id) ON DELETE SET NULL, -- si la categoría es "material"
impresora_id UUID REFERENCES public.impresoras(id) ON DELETE SET NULL, -- si la categoría es "mantenimiento"
fecha DATE NOT NULL DEFAULT current_date,
created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.egresos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acceso total a sus egresos" ON public.egresos;
CREATE POLICY "Acceso total a sus egresos" ON public.egresos
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_egresos_fecha ON public.egresos(user_id, fecha);

-- ============================================================================
-- 7. TABLA: METAS_FINANCIERAS (la "Meta del mes" ya no hardcodeada)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.metas_financieras (
id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
periodo DATE NOT NULL, -- guardar como primer día del mes, ej. '2026-08-01'
monto_meta NUMERIC(10, 2) NOT NULL,
created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
UNIQUE (user_id, periodo)
);
ALTER TABLE public.metas_financieras ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acceso total a sus metas" ON public.metas_financieras;
CREATE POLICY "Acceso total a sus metas" ON public.metas_financieras
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 8. FUNCIONES Y TRIGGERS DE NEGOCIO
-- ============================================================================

-- 8.1 — Registrar automáticamente el evento en el historial cuando cambia el estado
CREATE OR REPLACE FUNCTION public.log_cambio_estado_pedido()
RETURNS TRIGGER AS $$
BEGIN
IF NEW.estado IS DISTINCT FROM OLD.estado THEN
INSERT INTO public.pedido_eventos (pedido_id, texto)
VALUES (NEW.id, 'Estado cambiado a "' || NEW.estado || '"');
END IF;
RETURN NEW;
END;

$$
LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_cambio_estado ON public.pedidos;
CREATE TRIGGER trg_log_cambio_estado
AFTER UPDATE ON public.pedidos
FOR EACH ROW EXECUTE FUNCTION public.log_cambio_estado_pedido();


-- 8.2 — REGLA DE NEGOCIO CLAVE: no se puede pasar a "en_impresion" sin el
-- anticipo mínimo pagado. Si tu app intenta ese cambio sin cobro suficiente,
-- la base de datos lo rechaza (aunque falle una validación en el frontend).
CREATE OR REPLACE FUNCTION public.validar_anticipo_antes_de_imprimir()
RETURNS TRIGGER AS
$$

DECLARE
minimo_requerido NUMERIC(10,2);
BEGIN
IF NEW.estado = 'en_impresion' AND OLD.estado = 'pendiente' THEN
minimo_requerido := ROUND(NEW.pago_total \* (NEW.pago_anticipo_pct / 100.0), 2);
IF NEW.pago_monto_cobrado < minimo_requerido THEN
RAISE EXCEPTION
'No se puede iniciar la impresión: falta cobrar el anticipo. Requerido: Bs % — Cobrado: Bs %',
minimo_requerido, NEW.pago_monto_cobrado;
END IF;
END IF;
RETURN NEW;
END;

$$
LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validar_anticipo ON public.pedidos;
CREATE TRIGGER trg_validar_anticipo
BEFORE UPDATE ON public.pedidos
FOR EACH ROW EXECUTE FUNCTION public.validar_anticipo_antes_de_imprimir();


-- 8.3 — Al insertar un pago en pedido_pagos:
--   a) actualiza pago_monto_cobrado / pago_estado en pedidos
--   b) crea automáticamente el ingreso correspondiente en Finanzas
-- Esto es lo que hace que Pedidos y Finanzas SIEMPRE cuadren.
CREATE OR REPLACE FUNCTION public.procesar_pago_pedido()
RETURNS TRIGGER AS
$$

DECLARE
v_pedido public.pedidos%ROWTYPE;
v_nuevo_cobrado NUMERIC(10,2);
v_nuevo_estado_pago TEXT;
BEGIN
SELECT \* INTO v_pedido FROM public.pedidos WHERE id = NEW.pedido_id;

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

    INSERT INTO public.ingresos (user_id, pedido_id, cliente_id, producto_id, concepto, monto, metodo, fecha)
    VALUES (
        v_pedido.user_id,
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

$$
LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_procesar_pago ON public.pedido_pagos;
CREATE TRIGGER trg_procesar_pago
AFTER INSERT ON public.pedido_pagos
FOR EACH ROW EXECUTE FUNCTION public.procesar_pago_pedido();


-- ============================================================================
-- 9. VISTAS PARA REPORTES (lo que alimenta tus pantallas de análisis)
-- ============================================================================

-- 9.1 — Estadísticas de cliente: recurrencia real, total gastado, última compra
CREATE OR REPLACE VIEW public.vista_clientes_stats AS
SELECT
    c.id AS cliente_id,
    c.user_id,
    c.nombre,
    c.telefono,
    COUNT(p.id) AS pedidos_totales,
    (COUNT(p.id) > 1) AS recurrente,
    COALESCE(SUM(p.pago_monto_cobrado), 0) AS total_pagado,
    MAX(p.created_at) AS ultima_compra
FROM public.clientes c
LEFT JOIN public.pedidos p ON p.cliente_id = c.id
GROUP BY c.id;

-- 9.2 — Rentabilidad por producto del catálogo
CREATE OR REPLACE VIEW public.vista_productos_rentabilidad AS
SELECT
    cp.id AS producto_id,
    cp.user_id,
    cp.nombre,
    COUNT(i.id) AS unidades_vendidas,
    COALESCE(SUM(i.monto), 0) AS total_generado
FROM public.catalogo_productos cp
LEFT JOIN public.ingresos i ON i.producto_id = cp.id
GROUP BY cp.id;

-- 9.3 — Ventas agrupadas por día / semana / mes (usa esta vista como base
-- para el botón "Exportar informe" filtrando por rango de fechas)
CREATE OR REPLACE VIEW public.vista_finanzas_diario AS
SELECT
    user_id,
    fecha,
    'ingreso' AS tipo,
    SUM(monto) AS total
FROM public.ingresos
GROUP BY user_id, fecha
UNION ALL
SELECT
    user_id,
    fecha,
    'egreso' AS tipo,
    SUM(monto) AS total
FROM public.egresos
GROUP BY user_id, fecha;
-- Ejemplo de uso para reporte semanal/mensual:
--   SELECT date_trunc('week', fecha) AS semana, tipo, SUM(total)
--   FROM vista_finanzas_diario WHERE user_id = auth.uid()
--   GROUP BY 1, 2 ORDER BY 1;
$$
