# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

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

SELECT
c.table_name AS tabla,
c.column_name AS columna,
c.data_type AS tipo_dato,
CASE WHEN pk.column_name IS NOT NULL THEN 'SI' ELSE 'NO' END AS es_pk,
COALESCE(fk.tabla_destino, '-') AS referencia_tabla_fk,
COALESCE(fk.columna_destino, '-') AS referencia_columna_fk
FROM
information_schema.columns c
LEFT JOIN (
-- Subconsulta para identificar Primary Keys
SELECT
tc.table_name,
kc.column_name
FROM
information_schema.table_constraints tc
JOIN
information_schema.key_column_usage kc
ON tc.constraint_name = kc.constraint_name
AND tc.table_schema = kc.table_schema
WHERE
tc.constraint_type = 'PRIMARY KEY'
AND tc.table_schema = 'public'
) pk ON c.table_name = pk.table_name AND c.column_name = pk.column_name
LEFT JOIN (
-- Subconsulta para identificar Foreign Keys
SELECT
tc.table_name AS tabla_origen,
kcu.column_name AS columna_origen,
ccu.table_name AS tabla_destino,
ccu.column_name AS columna_destino
FROM
information_schema.table_constraints tc
JOIN
information_schema.key_column_usage kcu
ON tc.constraint_name = kcu.constraint_name
AND tc.table_schema = kcu.table_schema
JOIN
information_schema.constraint_column_usage ccu
ON ccu.constraint_name = tc.constraint_name
AND ccu.table_schema = tc.table_schema
WHERE
tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
) fk ON c.table_name = fk.tabla_origen AND c.column_name = fk.columna_origen
WHERE
c.table_schema = 'public'
AND c.table_name IN (
'catalogo_productos','categorias_producto', 'clientes', 'configuracion_empresa', 'cotizacion_items',
'cotizaciones', 'egresos', 'empresa_miembros', 'empresas', 'filamentos',
'impresoras', 'ingresos', 'metas_financieras', 'pedido_checklist_items',
'pedido_eventos','pedido_impresion_intentos','pedido_pagos', 'pedidos','piezas_stock' ,'profiles', 'reglas_margen_ganancia'
)
ORDER BY
c.table_name,
c.ordinal_position;
