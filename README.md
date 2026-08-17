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
├── app/ # SOLO rutas (Expo Router) — la vista del usuario
│ ├── (auth)/ # Grupo de rutas de autenticación
│ │ ├── login.tsx
│ │ └── \_layout.tsx
│ ├── (tabs)/ # Tab Navigation principal
│ │ ├── index.tsx # Home / Dashboard
│ │ ├── cotizar.tsx # Cotización de impresiones 3D
│ │ ├── comprobantes.tsx # Subida y gestión de comprobantes
│ │ ├── materiales.tsx # Configuración de precios (filamentos, impresoras)
│ │ └── \_layout.tsx
│ └── \_layout.tsx # Layout raíz (Providers, Auth Guard, Theme)
│
├── src/ # TODA la lógica de negocio y presentación
│ ├── assets/ # Imágenes, fuentes, íconos locales
│ ├── components/ # Componentes UI reutilizables
│ │ ├── ui/ # Botones, inputs, cards genéricos
│ │ └── forms/ # Formularios de cotización, comprobantes, etc.
│ │
│ ├── config/ # Configuración global
│ │ ├── env.ts # Variables de entorno tipadas
│ │ └── constants.ts
│ │
│ ├── constants/ # Constantes estáticas (colores, dimensiones, roles)
│ ├── context/ # Contextos globales (AuthContext, ThemeContext)
│ │
│ ├── features/ # Lógica organizada por módulos de dominio
│ │ ├── auth/
│ │ │ ├── hooks/
│ │ │ ├── services/ # googleAuth.ts, session.ts
│ │ │ └── types.ts
│ │ ├── cotizacion/
│ │ │ ├── hooks/
│ │ │ ├── services/
│ │ │ ├── utils/ # Fórmulas de cálculo de costos/tiempos
│ │ │ └── types.ts
│ │ ├── materiales/ # Filamentos, impresoras, tarifas energéticas
│ │ │ ├── hooks/
│ │ │ ├── services/
│ │ │ └── types.ts
│ │ └── comprobantes/
│ │ ├── hooks/
│ │ ├── services/ # Subida a Supabase Storage
│ │ └── types.ts
│ │
│ ├── hooks/ # Hooks personalizados globales (e.g. useAuth)
│ │
│ ├── services/ # Clientes de servicios externos
│ │ └── supabase/
│ │ ├── client.ts # Inicialización del cliente Supabase
│ │ ├── auth.ts # Métodos de autenticación
│ │ ├── storage.ts # Métodos de buckets/archivos
│ │ └── database.ts # Queries genéricas reutilizables
│ │
│ ├── theme/ # Tokens de diseño, colores, estilos globales
│ ├── types/ # Tipos TypeScript globales (Database types de Supabase)
│ └── utils/ # Helpers (formato de moneda, fechas, validaciones)
│
├── scripts/
├── app.json
├── eslint.config.js
├── package.json
├── tsconfig.json
├── AGENTS.md
├── CLAUDE.md
└── README.md
