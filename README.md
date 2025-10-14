# AMBIENTALPE - Sistema de Monitoreo Ambiental

Sistema integral de gestión y monitoreo ambiental desarrollado con el stack T3, diseñado para empresas que requieren servicios de monitoreo ambiental, gestión de equipos, cotizaciones y órdenes de servicio.

## 🏗️ Stack Tecnológico

Este proyecto utiliza el [T3 Stack](https://create.t3.gg/) con las siguientes tecnologías:

- [Next.js](https://nextjs.org) - Framework React con App Router
- [Better Auth](https://better-auth.com) - Autenticación moderna y segura
- [Prisma](https://prisma.io) - ORM para base de datos
- [Tailwind CSS](https://tailwindcss.com) - Framework de estilos
- [tRPC](https://trpc.io) - APIs type-safe end-to-end
- [Zod](https://zod.dev) - Validación de esquemas TypeScript
- [React Hook Form](https://react-hook-form.com) - Manejo de formularios

## 🚀 Características Principales

### 👥 Gestión de Usuarios y RBAC
- Sistema completo de roles y permisos (RBAC)
- Roles: Super Admin, Admin, Manager, Operator, Viewer
- Autenticación con Better Auth
- Gestión de sesiones seguras

### 🏢 Gestión de Clientes y Proveedores
- Registro de empresas cliente y proveedores
- Gestión de líneas de crédito
- Información de contacto y facturación

### 📊 Gestión de Equipos
- Catálogo de equipos de monitoreo ambiental
- Estados de equipos (Disponible, En uso, Mantenimiento, Calibración, Fuera de servicio)
- Control de calibraciones y mantenimientos

### 📋 Órdenes y Cotizaciones
- Sistema de cotizaciones con items reutilizables
- Órdenes de servicio y compra
- Gestión de estados y aprobaciones
- Generación de PDFs profesionales

### 📈 Monitoreo y Reportes
- Sesiones de monitoreo ambiental
- Parámetros ambientales con umbrales
- Reportes de cumplimiento
- Dashboard con métricas clave

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- PostgreSQL
- pnpm

### Pasos de instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd AMBIENTALPE/T3-BetterAuth
```

2. **Instalar dependencias**
```bash
pnpm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
# Editar .env.local con tus configuraciones
```

4. **Configurar base de datos**
```bash
# Generar cliente Prisma
pnpm db:generate

# Ejecutar migraciones
pnpm db:migrate

# Poblar con datos de prueba
pnpm db:seed
```

5. **Ejecutar en desarrollo**
```bash
pnpm dev
```

## 📚 Documentación

### Scripts Disponibles
- `pnpm dev` - Servidor de desarrollo
- `pnpm build` - Build de producción
- `pnpm db:studio` - Abrir Prisma Studio
- `pnpm db:seed` - Poblar base de datos
- `pnpm lint` - Verificar código
- `pnpm typecheck` - Verificar tipos TypeScript

### Usuarios de Prueba
Ver [SEED_README.md](./prisma/SEED_README.md) para información sobre usuarios de prueba y datos iniciales.

## 🚀 Despliegue

Para despliegue en producción, sigue las guías de:
- [Vercel](https://create.t3.gg/en/deployment/vercel)
- [Docker](https://create.t3.gg/en/deployment/docker)

## 📄 Licencia

Este proyecto es privado y está destinado para uso interno de AMBIENTALPE.
