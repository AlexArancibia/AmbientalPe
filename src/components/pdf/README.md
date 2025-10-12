# 📄 Sistema de Generación de PDFs - AmbientalPE

Este directorio contiene todos los componentes de generación de PDFs del sistema usando `@react-pdf/renderer`.

## 📋 Componentes Disponibles

### Documentos Individuales

#### 1. QuotationPDF.tsx
**Propósito:** Generar PDF de cotizaciones individuales  
**Ruta API:** `/api/pdf/quotation/[id]`  
**Uso en UI:** Botón "Descargar PDF" en `/cotizaciones/[id]`

```typescript
import { QuotationPDF } from '@/components/pdf/QuotationPDF';

const pdfData = {
  number: "COT-2025-001",
  date: "2025-10-12T00:00:00.000Z",
  validityDays: 30,
  currency: "PEN",
  subtotal: 1000.00,
  igv: 180.00,
  total: 1180.00,
  notes: "Términos y condiciones...",
  equipmentReleaseDate: "2025-10-15T00:00:00.000Z",
  returnDate: null,
  monitoringLocation: "Lima, Perú",
  client: { name: "...", ruc: "...", email: "...", address: "..." },
  items: [...]
};

<QuotationPDF quotation={pdfData} />
```

#### 2. ServiceOrderPDF.tsx
**Propósito:** Generar PDF de órdenes de servicio  
**Ruta API:** `/api/pdf/service-order/[id]`  
**Uso en UI:** Botón "Descargar PDF" en `/ordenes/servicio/[id]`

**Características:**
- Badge de estado (Pendiente, En Progreso, Completado)
- Información del gestor y encargado
- Tabla con servicios, días y precios
- Comentarios adicionales

#### 3. PurchaseOrderPDF.tsx
**Propósito:** Generar PDF de órdenes de compra  
**Ruta API:** `/api/pdf/purchase-order/[id]`  
**Uso en UI:** Botón "Descargar PDF" en `/ordenes/compra/[id]`

**Características:**
- Badge de estado
- Información del proveedor
- Tabla de items de compra
- Términos de pago

### Reportes de Lista

#### 4. ClientListPDF.tsx
**Propósito:** Exportar lista completa de clientes y proveedores  
**Ruta API:** `/api/pdf/clients?type=CLIENT&search=...`  
**Uso en UI:** Botón "Exportar PDF" en `/clientes`

**Filtros soportados:**
- `type`: CLIENT | PROVIDER
- `search`: Búsqueda por nombre, RUC o email

**Características:**
- Resumen con estadísticas (total clientes vs proveedores)
- Tabla compacta con información principal
- Paginación automática

#### 5. ProviderListPDF.tsx
**Propósito:** Exportar lista de proveedores  
**Ruta API:** `/api/pdf/providers?search=...`  
**Uso en UI:** Botón "Exportar PDF" en `/proveedores`

**Filtros soportados:**
- `search`: Búsqueda por nombre, RUC o email

#### 6. EquipmentListPDF.tsx
**Propósito:** Exportar inventario de equipos  
**Ruta API:** `/api/pdf/equipment?type=...&status=...&search=...`  
**Uso en UI:** Botón "Exportar Inventario PDF" en `/equipos`

**Filtros soportados:**
- `type`: Tipo de equipo
- `status`: available, in_use, maintenance, inactive
- `search`: Búsqueda por nombre, código o descripción

**Características:**
- Badges de estado con colores
- Resumen con conteo por estado
- Números de serie

## 🎨 Diseño y Estilo

### Paleta de Colores
- **Azul Oscuro Principal:** `#1e3a8a` (headers, títulos, bordes)
- **Azul Claro:** `#dbeafe` (badge "En Progreso")
- **Verde:** `#dcfce7` / `#166534` (badge "Completado")
- **Amarillo:** `#fef3c7` / `#92400e` (badge "Pendiente", notas)
- **Gris:** `#f8fafc` / `#64748b` (filas alternas, textos secundarios)

### Tipografía
- **Fuente:** Helvetica
- **Tamaño base:** 9pt
- **Título principal:** 20pt
- **Subtítulos de sección:** 12pt
- **Tablas:** 8pt
- **Footer:** 7pt

### Espaciado
- **Padding de página:** 30px
- **Márgenes entre secciones:** 15px
- **Padding de tabla:** 6px
- **Espaciado de filas:** 4px

## 🔧 Uso de las Rutas API

### Documentos Individuales (con ID)

```typescript
// En el componente React
const handleDownloadPDF = async (id: string) => {
  try {
    const response = await fetch(`/api/pdf/quotation/${id}`);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Cotizacion-${quotationNumber}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error al descargar PDF:', error);
  }
};
```

### Reportes de Lista (con filtros)

```typescript
// Con query params
const handleExportClientsPDF = async (filters: { type?: string; search?: string }) => {
  const params = new URLSearchParams();
  if (filters.type) params.append('type', filters.type);
  if (filters.search) params.append('search', filters.search);
  
  const response = await fetch(`/api/pdf/clients?${params.toString()}`);
  const blob = await response.blob();
  // ... mismo flujo de descarga
};
```

## 📦 Estructura de Datos

### QuotationPDF Props
```typescript
interface QuotationPDFProps {
  quotation: {
    number: string;
    date: string; // ISO string
    validityDays: number;
    currency: 'PEN' | 'USD';
    subtotal: number;
    igv: number;
    total: number;
    notes: string | null;
    equipmentReleaseDate?: string;
    returnDate?: string | null;
    monitoringLocation?: string;
    client: {
      name: string;
      ruc: string;
      email: string;
      address: string;
    };
    items: Array<{
      code: string;
      name: string;
      description: string;
      quantity: number;
      days: number;
      unitPrice: number;
    }>;
  };
}
```

### ServiceOrderPDF Props
```typescript
interface ServiceOrderPDFProps {
  serviceOrder: {
    number: string;
    date: string;
    currency: 'PEN' | 'USD';
    subtotal: number;
    igv: number;
    total: number;
    description?: string | null;
    paymentTerms?: string | null;
    comments?: string | null;
    attendantName?: string | null;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    client: { /* same as above */ };
    gestor: {
      name: string;
      email: string;
    };
    items: Array<{
      code: string;
      name: string;
      description: string;
      quantity: number;
      days?: number | null;
      unitPrice: number;
    }>;
  };
}
```

## 🐛 Solución de Problemas

### Error: "ENOENT: no such file or directory, open '/logo.png'"
**Solución:** Todos los componentes ahora usan `process.cwd()` para obtener la ruta absoluta al logo:
```typescript
<Image src={`${process.cwd()}/public/logo.png`} />
```

### PDF no se descarga en el navegador
**Posibles causas:**
1. Verificar que la ruta API exista y devuelva `Content-Type: application/pdf`
2. Revisar errores en console del navegador
3. Verificar que el ID del documento exista en la base de datos

### Tabla se corta entre páginas
**Solución:** Los componentes están configurados para paginación automática. Si el contenido es muy grande, se creará una nueva página automáticamente.

### Estilos no se aplican correctamente
**Nota:** `@react-pdf/renderer` usa un subset de CSS. No todas las propiedades CSS funcionan. Consultar la [documentación oficial](https://react-pdf.org/styling).

## 🚀 Mejoras Futuras

1. **QR Code de Verificación:** Agregar código QR que enlace al documento en el sistema
2. **Firma Digital:** Espacio para firma y sello
3. **Marca de Agua:** Para borradores o copias no oficiales
4. **Multi-idioma:** Soporte para inglés
5. **Plantillas Personalizables:** Permitir que cada empresa personalice sus PDFs
6. **Cache:** Implementar cache para PDFs generados frecuentemente

## 📚 Documentación Adicional

- [React PDF Documentation](https://react-pdf.org/)
- [Styling in React PDF](https://react-pdf.org/styling)
- [Advanced Examples](https://react-pdf.org/advanced)

---

**Última Actualización:** 12 Octubre 2025  
**Mantenedor:** Equipo AmbientalPE

