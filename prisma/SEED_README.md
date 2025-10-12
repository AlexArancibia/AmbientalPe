# Seed Completo de Base de Datos - Sistema de Monitoreo Ambiental

Este archivo contiene un seed completo que **elimina todos los datos existentes** y crea un sistema completo desde cero con usuarios de todos los tipos.

## 📋 Datos Incluidos

### 🏢 Infraestructura Base
- **Empresa**: Información completa de la empresa de monitoreo ambiental
- **Clientes**: Empresas y contactos registrados
- **Proveedores**: Proveedores de insumos y servicios
- **Equipos**: Equipos de monitoreo y su estado

### 👥 Usuarios de Todos los Tipos (8 usuarios)

| Usuario | Email | Contraseña | Rol | Idioma | Nivel |
|---------|-------|------------|-----|--------|-------|
| **Super Admin** | `superadmin@ambiental.com` | `SuperAdmin123!@#` | super_admin | ES | Alto |
| **Admin User** | `admin@ambiental.com` | `Admin123!@#` | admin | ES | Alto |
| **Operador 1** | `operador@ambiental.com` | `Operador123!@#` | operator | ES | Medio |
| **Maria Rodriguez** | `maria@ambiental.com` | `Maria123!@#` | operator | ES | Medio |
| **John Smith** | `john@ambiental.com` | `John123!@#` | operator | ES | Medio |
| **Ana Silva** | `ana@ambiental.com` | `Ana123!@#` | operator | ES | Medio |
| **Viewer User** | `viewer@ambiental.com` | `Viewer123!@#` | viewer | ES | Básico |

### 🔐 Sistema RBAC Completo
- **4 Roles**: super_admin, admin, operator, viewer
- **Permisos**: 50+ permisos granulares por recurso
- **Jerarquía**: Super Admin > Admin > Operator > Viewer

### 📋 Órdenes de Servicio
- Órdenes de servicio ambiental registradas
- Estados: Pendiente, En Proceso, Completada
- Asignación de equipos y personal

### 📊 Cotizaciones
- Cotizaciones generadas para clientes
- Estados: Borrador, Enviada, Aceptada, Rechazada
- Histórico de cotizaciones

## 🚀 Cómo Ejecutar

### ⚠️ **ADVERTENCIA IMPORTANTE**
Este seed **ELIMINA TODOS LOS DATOS EXISTENTES** y crea todo desde cero.

### Prerequisitos
1. Base de datos PostgreSQL ejecutándose
2. Variables de entorno configuradas (`DATABASE_URL`)
3. Dependencias instaladas (`pnpm install`)

### Comandos Disponibles

```bash
# Instalar dependencias
pnpm install

# Generar cliente de Prisma
pnpm postinstall

# Ejecutar migraciones (si es necesario)
pnpm db:migrate

# Ejecutar el seed completo (ELIMINA TODO)
pnpm db:seed

# Abrir Prisma Studio para ver los datos
pnpm db:studio
```

### Ejecución Paso a Paso

1. **Instalar dependencias**:
   ```bash
   pnpm install
   ```

2. **Configurar base de datos**:
   ```bash
   # Si es la primera vez, ejecutar migraciones
   pnpm db:migrate
   ```

3. **Ejecutar seed completo**:
   ```bash
   pnpm db:seed
   ```

4. **Verificar datos**:
   ```bash
   pnpm db:studio
   ```

## 🔍 Verificación de Datos

Después de ejecutar el seed, deberías ver:

- ✅ 1 registro en `CompanyInfo`
- ✅ 4 roles con permisos granulares
- ✅ Clientes registrados con información completa
- ✅ Proveedores con datos de contacto
- ✅ Equipos de monitoreo categorizados
- ✅ **7 usuarios** (1 super admin, 1 admin, 4 operadores, 1 viewer)
- ✅ Órdenes de servicio con diferentes estados
- ✅ Cotizaciones generadas
- ✅ Items de plantillas configurados

## 🔐 Credenciales de Acceso

### 👑 Super Admin
- **Email**: `superadmin@ambiental.com`
- **Contraseña**: `SuperAdmin123!@#`
- **Permisos**: Acceso completo al sistema

### 👨‍💼 Admin
- **Email**: `admin@ambiental.com`
- **Contraseña**: `Admin123!@#`
- **Permisos**: Gestión de usuarios y configuración del sistema

### 👨‍💻 Operadores (4 usuarios)
- **Operador**: `operador@ambiental.com` / `Operador123!@#`
- **Maria**: `maria@ambiental.com` / `Maria123!@#`
- **John**: `john@ambiental.com` / `John123!@#`
- **Ana**: `ana@ambiental.com` / `Ana123!@#`
- **Permisos**: Gestión de órdenes, equipos y cotizaciones

### 👁️ Viewer
- **Email**: `viewer@ambiental.com`
- **Contraseña**: `Viewer123!@#`
- **Permisos**: Solo lectura de datos básicos

## 🛠️ Personalización

Para modificar los datos del seed:

1. **Cambiar datos de usuarios**: Edita el array `users` en la sección "USER CREATION"
2. **Agregar más clientes/proveedores**: Modifica los arrays en las secciones correspondientes
3. **Cambiar equipos**: Modifica el array de equipos de monitoreo
4. **Ajustar permisos**: Modifica las secciones de asignación de permisos por rol

## 📝 Notas Importantes

- ⚠️ **EL SEED ELIMINA TODOS LOS DATOS** antes de crear nuevos
- ✅ Usa **Better Auth** para autenticación real
- ✅ **Email verificado** automáticamente para todos los usuarios
- ✅ **Contraseñas seguras** que cumplen requisitos mínimos
- ✅ **Sistema RBAC completo** con jerarquía de permisos
- ✅ **Datos realistas** con balances y trades generados

## 🐛 Troubleshooting

### Error: "Database not found"
- Verifica que PostgreSQL esté ejecutándose
- Confirma que `DATABASE_URL` esté configurada correctamente

### Error: "Permission denied"
- Ejecuta `pnpm db:migrate` antes del seed
- Verifica que el usuario de la DB tenga permisos de escritura

### Error: "Password too short"
- Las contraseñas deben tener al menos 8 caracteres
- Deben incluir mayúsculas, minúsculas, números y símbolos

### Error: "tsx not found"
- Ejecuta `pnpm install` para instalar todas las dependencias

## 🎯 Casos de Uso

### Para Desarrollo
- Usa `operador@ambiental.com` para testing de funcionalidades operativas
- Usa `admin@ambiental.com` para testing de administración
- Usa `viewer@ambiental.com` para testing de permisos de solo lectura

### Para Testing
- Usa `superadmin@ambiental.com` para testing completo del sistema
- Usa diferentes operadores para testing de múltiples usuarios
- Usa diferentes roles para testing de permisos

## 📞 Soporte

Si encuentras problemas con el seed, revisa:
1. Los logs de la consola durante la ejecución
2. La configuración de la base de datos
3. Las variables de entorno
4. La versión de Node.js (recomendado: 18+)

## 🔄 Reset Completo

Para hacer un reset completo:
```bash
pnpm db:reset  # Esto también ejecuta el seed automáticamente
```