[
  {
    "tabla": "catalogo_productos",
    "columna": "id",
    "tipo_dato": "uuid",
    "es_pk": "SI",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "catalogo_productos",
    "columna": "nombre",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "catalogo_productos",
    "columna": "categoria",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "catalogo_productos",
    "columna": "descripcion",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "catalogo_productos",
    "columna": "precio_referencia",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "catalogo_productos",
    "columna": "tiempo_impresion_horas",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "catalogo_productos",
    "columna": "peso_gramos",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "catalogo_productos",
    "columna": "filamento_sugerido_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "filamentos",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "catalogo_productos",
    "columna": "impresora_sugerida_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "impresoras",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "catalogo_productos",
    "columna": "stock_terminado",
    "tipo_dato": "integer",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "catalogo_productos",
    "columna": "umbral_stock_bajo",
    "tipo_dato": "integer",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "catalogo_productos",
    "columna": "imagen_url",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "catalogo_productos",
    "columna": "activo",
    "tipo_dato": "boolean",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "catalogo_productos",
    "columna": "created_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "catalogo_productos",
    "columna": "updated_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "catalogo_productos",
    "columna": "empresa_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "empresas",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "clientes",
    "columna": "id",
    "tipo_dato": "uuid",
    "es_pk": "SI",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "clientes",
    "columna": "telefono",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "clientes",
    "columna": "direccion",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "clientes",
    "columna": "notas",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "clientes",
    "columna": "created_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "clientes",
    "columna": "updated_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "clientes",
    "columna": "nombre",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "clientes",
    "columna": "empresa_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "empresas",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "clientes",
    "columna": "user_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "profiles",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "configuracion_empresa",
    "columna": "empresa_id",
    "tipo_dato": "uuid",
    "es_pk": "SI",
    "referencia_tabla_fk": "empresas",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "configuracion_empresa",
    "columna": "costo_kwh",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "configuracion_empresa",
    "columna": "costo_mano_obra_hora",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "configuracion_empresa",
    "columna": "costo_operativo_fijo_mensual",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "configuracion_empresa",
    "columna": "horas_laborables_mes",
    "tipo_dato": "integer",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "configuracion_empresa",
    "columna": "tasa_fallo_defecto_pct",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "configuracion_empresa",
    "columna": "impuesto_pct",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "configuracion_empresa",
    "columna": "margen_ganancia_defecto_pct",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "configuracion_empresa",
    "columna": "moneda",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "configuracion_empresa",
    "columna": "qr_pago_url",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "configuracion_empresa",
    "columna": "qr_pago_titular",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "configuracion_empresa",
    "columna": "updated_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizacion_items",
    "columna": "id",
    "tipo_dato": "uuid",
    "es_pk": "SI",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizacion_items",
    "columna": "cotizacion_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "cotizaciones",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "cotizacion_items",
    "columna": "impresora_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "impresoras",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "cotizacion_items",
    "columna": "filamento_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "filamentos",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "cotizacion_items",
    "columna": "nombre_pieza",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizacion_items",
    "columna": "cantidad",
    "tipo_dato": "integer",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizacion_items",
    "columna": "peso_gramos",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizacion_items",
    "columna": "tiempo_impresion_horas",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizacion_items",
    "columna": "tiempo_preparacion_minutos",
    "tipo_dato": "integer",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizacion_items",
    "columna": "tiempo_postprocesado_minutos",
    "tipo_dato": "integer",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizacion_items",
    "columna": "costo_material",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizacion_items",
    "columna": "costo_energia",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizacion_items",
    "columna": "costo_amortizacion",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizacion_items",
    "columna": "costo_mantenimiento",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizacion_items",
    "columna": "costo_mano_obra",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizacion_items",
    "columna": "costo_subtotal_item",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizacion_items",
    "columna": "created_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "id",
    "tipo_dato": "uuid",
    "es_pk": "SI",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "creado_por",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "profiles",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "cotizaciones",
    "columna": "creado_por",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "profiles",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "cotizaciones",
    "columna": "codigo_cotizacion",
    "tipo_dato": "integer",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "cliente_nombre",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "cliente_contacto",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "costo_directo_total",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "costo_indirecto_total",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "costo_fallos_total",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "subtotal_costo_base",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "monto_ganancia",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "monto_impuesto",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "precio_final",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "margen_ganancia_aplicado_pct",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "estado",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "notas",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "created_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "cliente_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "clientes",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "cotizaciones",
    "columna": "empresa_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "empresas",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "cotizaciones",
    "columna": "token_publico",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "voucher_data",
    "tipo_dato": "jsonb",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "imagen_referencia_url",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "cotizaciones",
    "columna": "costo_diseno_total",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "egresos",
    "columna": "id",
    "tipo_dato": "uuid",
    "es_pk": "SI",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "egresos",
    "columna": "registrado_por",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "profiles",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "egresos",
    "columna": "registrado_por",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "profiles",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "egresos",
    "columna": "categoria",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "egresos",
    "columna": "concepto",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "egresos",
    "columna": "monto",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "egresos",
    "columna": "metodo",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "egresos",
    "columna": "filamento_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "filamentos",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "egresos",
    "columna": "impresora_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "impresoras",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "egresos",
    "columna": "fecha",
    "tipo_dato": "date",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "egresos",
    "columna": "created_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "egresos",
    "columna": "empresa_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "empresas",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "empresa_miembros",
    "columna": "id",
    "tipo_dato": "uuid",
    "es_pk": "SI",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresa_miembros",
    "columna": "empresa_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "empresas",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "empresa_miembros",
    "columna": "user_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "profiles",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "empresa_miembros",
    "columna": "rol",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresa_miembros",
    "columna": "estado",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresa_miembros",
    "columna": "created_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresas",
    "columna": "id",
    "tipo_dato": "uuid",
    "es_pk": "SI",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresas",
    "columna": "creado_por",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresas",
    "columna": "logo_url",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresas",
    "columna": "nombre_comercial",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresas",
    "columna": "nit",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresas",
    "columna": "razon_social",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresas",
    "columna": "direccion_fiscal",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresas",
    "columna": "ciudad",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresas",
    "columna": "whatsapp",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresas",
    "columna": "instagram",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresas",
    "columna": "facebook",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresas",
    "columna": "sitio_web",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresas",
    "columna": "garantia",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresas",
    "columna": "created_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresas",
    "columna": "updated_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresas",
    "columna": "es_singleton",
    "tipo_dato": "boolean",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "empresas",
    "columna": "ubicacion_url",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "filamentos",
    "columna": "id",
    "tipo_dato": "uuid",
    "es_pk": "SI",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "filamentos",
    "columna": "marca",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "filamentos",
    "columna": "material",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "filamentos",
    "columna": "color",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "filamentos",
    "columna": "capacidad_rollo_gramos",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "filamentos",
    "columna": "costo_compra",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "filamentos",
    "columna": "activo",
    "tipo_dato": "boolean",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "filamentos",
    "columna": "created_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "filamentos",
    "columna": "color_hex",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "filamentos",
    "columna": "stock_gramos",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "filamentos",
    "columna": "proveedor",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "filamentos",
    "columna": "fecha_compra",
    "tipo_dato": "date",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "filamentos",
    "columna": "umbral_bajo_stock",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "filamentos",
    "columna": "updated_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "filamentos",
    "columna": "empresa_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "empresas",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "filamentos",
    "columna": "imagen_url",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "impresoras",
    "columna": "id",
    "tipo_dato": "uuid",
    "es_pk": "SI",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "impresoras",
    "columna": "modelo",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "impresoras",
    "columna": "costo_compra",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "impresoras",
    "columna": "vida_util_horas",
    "tipo_dato": "integer",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "impresoras",
    "columna": "potencia_watts",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "impresoras",
    "columna": "costo_mantenimiento_hora",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "impresoras",
    "columna": "activa",
    "tipo_dato": "boolean",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "impresoras",
    "columna": "created_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "impresoras",
    "columna": "marca",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "impresoras",
    "columna": "horas_uso_total",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "impresoras",
    "columna": "estado",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "impresoras",
    "columna": "pedido_actual",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "impresoras",
    "columna": "fecha_adquisicion",
    "tipo_dato": "date",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "impresoras",
    "columna": "updated_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "impresoras",
    "columna": "empresa_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "empresas",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "impresoras",
    "columna": "imagen_url",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "ingresos",
    "columna": "id",
    "tipo_dato": "uuid",
    "es_pk": "SI",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "ingresos",
    "columna": "pedido_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "pedidos",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "ingresos",
    "columna": "cliente_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "clientes",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "ingresos",
    "columna": "producto_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "catalogo_productos",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "ingresos",
    "columna": "concepto",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "ingresos",
    "columna": "monto",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "ingresos",
    "columna": "metodo",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "ingresos",
    "columna": "fecha",
    "tipo_dato": "date",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "ingresos",
    "columna": "created_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "ingresos",
    "columna": "empresa_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "empresas",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "metas_financieras",
    "columna": "id",
    "tipo_dato": "uuid",
    "es_pk": "SI",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "metas_financieras",
    "columna": "periodo",
    "tipo_dato": "date",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "metas_financieras",
    "columna": "monto_meta",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "metas_financieras",
    "columna": "created_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "metas_financieras",
    "columna": "empresa_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "empresas",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "pedido_checklist_items",
    "columna": "id",
    "tipo_dato": "uuid",
    "es_pk": "SI",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedido_checklist_items",
    "columna": "pedido_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "pedidos",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "pedido_checklist_items",
    "columna": "label",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedido_checklist_items",
    "columna": "hecho",
    "tipo_dato": "boolean",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedido_checklist_items",
    "columna": "orden",
    "tipo_dato": "integer",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedido_eventos",
    "columna": "id",
    "tipo_dato": "uuid",
    "es_pk": "SI",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedido_eventos",
    "columna": "pedido_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "pedidos",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "pedido_eventos",
    "columna": "texto",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedido_eventos",
    "columna": "created_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedido_pagos",
    "columna": "id",
    "tipo_dato": "uuid",
    "es_pk": "SI",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedido_pagos",
    "columna": "pedido_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "pedidos",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "pedido_pagos",
    "columna": "tipo",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedido_pagos",
    "columna": "monto",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedido_pagos",
    "columna": "metodo",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedido_pagos",
    "columna": "comprobante_url",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedido_pagos",
    "columna": "fecha",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedido_pagos",
    "columna": "created_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedido_pagos",
    "columna": "registrado_por",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "profiles",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "pedido_pagos",
    "columna": "verificado",
    "tipo_dato": "boolean",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedidos",
    "columna": "id",
    "tipo_dato": "uuid",
    "es_pk": "SI",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedidos",
    "columna": "creado_por",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "profiles",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "pedidos",
    "columna": "creado_por",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "profiles",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "pedidos",
    "columna": "cotizacion_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "cotizaciones",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "pedidos",
    "columna": "cliente_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "clientes",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "pedidos",
    "columna": "producto_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "catalogo_productos",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "pedidos",
    "columna": "codigo_pedido",
    "tipo_dato": "integer",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedidos",
    "columna": "pieza_descripcion",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedidos",
    "columna": "estado",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedidos",
    "columna": "fecha_entrega",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedidos",
    "columna": "pago_total",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedidos",
    "columna": "pago_anticipo_pct",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedidos",
    "columna": "pago_monto_cobrado",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedidos",
    "columna": "pago_estado",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedidos",
    "columna": "envio_tipo",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedidos",
    "columna": "envio_costo",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedidos",
    "columna": "envio_tracking",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedidos",
    "columna": "foto_final_url",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedidos",
    "columna": "created_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedidos",
    "columna": "updated_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedidos",
    "columna": "empresa_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "empresas",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "pedidos",
    "columna": "fecha_inicio_impresion",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedidos",
    "columna": "fecha_estimada_listo",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "pedidos",
    "columna": "horas_impresion_estimadas",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "profiles",
    "columna": "id",
    "tipo_dato": "uuid",
    "es_pk": "SI",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "profiles",
    "columna": "email",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "profiles",
    "columna": "full_name",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "profiles",
    "columna": "avatar_url",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "profiles",
    "columna": "updated_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "profiles",
    "columna": "created_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "profiles",
    "columna": "telefono",
    "tipo_dato": "text",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "reglas_margen_ganancia",
    "columna": "id",
    "tipo_dato": "uuid",
    "es_pk": "SI",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "reglas_margen_ganancia",
    "columna": "margen_ganancia_pct",
    "tipo_dato": "numeric",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "reglas_margen_ganancia",
    "columna": "created_at",
    "tipo_dato": "timestamp with time zone",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  },
  {
    "tabla": "reglas_margen_ganancia",
    "columna": "empresa_id",
    "tipo_dato": "uuid",
    "es_pk": "NO",
    "referencia_tabla_fk": "empresas",
    "referencia_columna_fk": "id"
  },
  {
    "tabla": "reglas_margen_ganancia",
    "columna": "nombre",
    "tipo_dato": "character varying",
    "es_pk": "NO",
    "referencia_tabla_fk": "-",
    "referencia_columna_fk": "-"
  }
]





analisando detalladamente que tengo todos estos datos de mi negocio en mi app movil de react native + expo quiero que me des mis graficos profesionales para mi negocio de impresiones 3D con datos por el momento con datos estaticos para ver las profesionalidad de las graficos en mi apartado de mis finanzas manteniendo mi estructura porfesional que tengo:
cotizador-3d/
├── app/ # SOLO rutas (Expo Router) - Presentación/Navegación
│ ├── (auth)/ # Grupo de rutas de autenticación
│ │ ├── login.tsx
│ │ └── \_layout.tsx
│ ├── (tabs)/ # Tab Navigation principal
│ │ ├── index.tsx # Dashboard / Home
│ │ ├── cotizar.tsx # Cotización de impresiones 3D
│ │ ├── comprobantes.tsx # Subida y gestión de comprobantes
│ │ ├── materiales.tsx # Configuración de materiales e impresoras
│ │ └── \_layout.tsx
│ └── \_layout.tsx # Layout raíz (Providers globales, Auth Guard, Theme)
│
├── src/ # TODA la lógica de negocio, dominio y presentación
│ ├── assets/ # Imágenes, fuentes, íconos locales
│ ├── components/ # Componentes UI reutilizables de UI genérica
│ │ ├── ui/ # Botones, inputs, cards, modales genéricos
│ │ └── forms/ # Form Controls compartidos entre características
│ │
│ ├── config/ # Configuración global de la app
│ │ ├── env.ts # Variables de entorno tipadas
│ │ └── constants.ts
│ │
│ ├── constants/ # Constantes estáticas (colores, dimensiones, roles)
│ │
│ ├── context/ # Contextos globales de la aplicación
│ │ ├── AppDataProvider.tsx # Provider principal que envuelve la app post-login
│ │ ├── AuthContext.tsx # Manejo de sesión de usuario y Supabase Auth
│ │ ├── ThemeContext.tsx # Manejo de modo claro/oscuro
│ │ ├── ConfiguracionTallerContext.tsx # Contexto para parámetros globales de taller
│ │ └── EmpresaContext.tsx # Contexto de la información/perfil de la empresa
│ │
│ ├── features/ # Lógica de negocio modularizada por dominio
│ │ ├── auth/
│ │ │ ├── hooks/
│ │ │ ├── services/ # googleAuth.ts, session.ts
│ │ │ └── types.ts
│ │ │
│ │ ├── cotizacion/
│ │ │ ├── components/ # UI específica de cotizaciones (Calculadora, Resumen)
│ │ │ ├── hooks/
│ │ │ ├── services/
│ │ │ ├── utils/ # Fórmulas matemáticas de cálculo de costos/tiempos
│ │ │ └── types.ts
│ │ │
│ │ ├── materiales/ # Filamentos, impresoras, tarifas energéticas
│ │ │ ├── components/
│ │ │ ├── hooks/
│ │ │ ├── services/
│ │ │ └── types.ts
│ │ │
│ │ ├── comprobantes/
│ │ │ ├── components/
│ │ │ ├── hooks/
│ │ │ ├── services/ # Gestor de buckets/Storage en Supabase
│ │ │ └── types.ts
│ │ │
│ │ ├── empresa/ # Módulo de información y datos de la Empresa/Taller
│ │ │ ├── components/
│ │ │ ├── hooks/
│ │ │ ├── mappers/ # Mapeo entre modelo Supabase DB y modelo UI
│ │ │ │ └── empresaMapper.ts
│ │ │ ├── services/ # Operaciones SELECT / UPSERT en Supabase
│ │ │ │ └── empresaService.ts
│ │ │ └── types.ts # EmpresaInfo (contrato de interfaz para UI)
│ │ │
│ │ ├── parametros/ # Parámetros operativos y costos indirectos de taller
│ │ │ ├── components/
│ │ │ ├── hooks/
│ │ │ ├── mappers/
│ │ │ ├── services/
│ │ │ └── types.ts
│ │ │
│ │ ├── catalogo/ # Catálogo de productos/impresiones predefinidas
│ │ │ ├── components/
│ │ │ ├── hooks/
│ │ │ ├── mappers/ # Mapeador de DB <-> UI para productos del catálogo
│ │ │ ├── services/ # Consultas y mutaciones de catálogo
│ │ │ └── types.ts
│ │ │
│ │ └── inventario/ # Gestión y control de stock de filamentos/insumos
│ │ ├── components/
│ │ ├── hooks/
│ │ ├── mappers/ # Mapeador de DB <-> UI para stock e insumos
│ │ ├── services/ # Gestión de stock y movimientos
│ │ └── types.ts
│ │
│ ├── hooks/ # Hooks personalizados globales utilitarios (e.g. useAuth)
│ │
│ ├── services/ # Clientes base de servicios externos
│ │ └── supabase/
│ │ ├── client.ts # Inicialización y configuración del cliente Supabase
│ │ ├── auth.ts # Métodos transversales de auth
│ │ ├── storage.ts # Helper genérico de buckets/archivos
│ │ └── database.ts # Cliente base o helpers genéricos de BD
│ │
│ ├── theme/ # Design tokens, paleta de colores, tipografía global
│ ├── types/ # Tipos TypeScript compartidos o globales
│ │ └── database.ts # Tipos crudos autogenerados de Supabase (Schema DB)
│ │
│ └── utils/ # Helpers globales (formato de moneda, fechas, sanitizadores)
│
├── scripts/ # Scripts de automatización / generación de tipos
├── app.json
├── eslint.config.js
├── package.json
├── tsconfig.json
├── AGENTS.md
├── CLAUDE.md
└── README.md



quiero que me des mis datos para estas diagramas:
1. Métricas Clave (KPI Cards)Antes de las gráficas, utiliza tarjetas numéricas de alto impacto con un indicador de tendencia (Sparkline o variación porcentual vs. mes anterior).Ingreso Neto y Margen Operativo: Muestra la rentabilidad real descontando filamento, desgaste de impresora y electricidad.Costo por Hora de Impresión: Determina si el precio de venta cubre la amortización del equipo.Valor Promedio de Pedido (AOV): Muestra si los clientes compran piezas pequeñas o proyectos grandes.2. Ingresos vs. Egresos y Flujo de CajaGráfico Sugerido: Combinado (Barras de Ingresos/Egresos + Línea de Margen Neto) o Gráfico de Cascada (Waterfall Chart).Qué representa: Muestra cómo las ventas totales se reducen a medida que descuentas costos variables (filamento, energía) y costos fijos (mantenimiento de impresoras, licencias de software) hasta llegar a la ganancia real.3. Productos más Rentables y Clientes TopGráfico Sugerido: Gráfico de Pareto (Barras + Línea Acumulada del 80/20).Qué representa: Identifica qué 20% de tus productos o clientes representan el 80% de tus ingresos.Aplicación en Impresión 3D: Permite saber si es más rentable vender figuras impresas personalizadas o dar servicio de prototipado a empresas, identificando además los clientes recurrentes a los que se les debe dar prioridad de cola de impresión.4. Egresos por CategoríaGráfico Sugerido: Gráfico de Donut con Desglose Secundario o Treemap.Qué representa: La proporción exacta de los costos operativos.Categorías clave para Impresión 3D:Materia Prima: Filamentos (PLA, PETG, ABS, Resina) y refacciones (nozzles, camas, extrusores).Energía y Operación: Consumo eléctrico ($kWh$).Mantenimiento: Horas de taller y repuestos por desgaste de equipos.Fijos: Alquiler, servicios, amortización de impresoras.5. Ingresos por Métodos de PagoGráfico Sugerido: Gráfico de Barras Horizontales.Qué representa: Compara el volumen transaccionado por cada canal (Transferencia QR, efectivo, tarjeta de crédito, pasarelas de pago).Utilidad: Permite evaluar qué comisiones bancarias están impactando más el margen y ajustar estrategias de cobro.

dame mis datos de mi tabla con datos estaticos y que todo el codidog de colores funciones y todo eso dentro de un solo archivo por componente de grafica 