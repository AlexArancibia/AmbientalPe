# Picker Component

Un componente reutilizable con scroll infinito y búsqueda para seleccionar items de una lista.

## Características

- ✅ **Scroll Infinito**: Carga automática de más datos al hacer scroll
- ✅ **Búsqueda con Debounce**: Input de búsqueda optimizado (300ms)
- ✅ **Selección Simple o Múltiple**: Soporta ambos modos
- ✅ **Totalmente Tipado**: TypeScript con generics
- ✅ **Personalizable**: Renderizado custom de items
- ✅ **Responsive**: Se adapta a cualquier tamaño
- ✅ **Estados de Carga**: Indicadores visuales claros
- ✅ **Optimizado**: Usa IntersectionObserver para scroll infinito

## Instalación

El componente ya está instalado en `src/components/ui/picker.tsx`

## Uso Básico

```tsx
import { Picker, type PickerItem } from "~/components/ui/picker";

function MyComponent() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string>();

  const items: PickerItem[] = [
    { id: "1", label: "Item 1" },
    { id: "2", label: "Item 2" },
    { id: "3", label: "Item 3" },
  ];

  return (
    <Picker
      items={items}
      fetchMore={() => {}}
      hasMore={false}
      isLoading={false}
      searchValue={search}
      onSearchChange={setSearch}
      selectedId={selectedId}
      onSelect={(item) => setSelectedId(item.id)}
    />
  );
}
```

## Props

### Requeridas

| Prop | Tipo | Descripción |
|------|------|-------------|
| `items` | `T[]` | Array de items a mostrar |
| `fetchMore` | `() => void` | Función para cargar más datos |
| `hasMore` | `boolean` | Si hay más datos disponibles |
| `isLoading` | `boolean` | Estado de carga inicial |
| `searchValue` | `string` | Valor del input de búsqueda |
| `onSearchChange` | `(value: string) => void` | Callback cuando cambia la búsqueda |
| `onSelect` | `(item: T) => void` | Callback cuando se selecciona un item |

### Opcionales

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `isFetchingMore` | `boolean` | `false` | Estado de carga de más datos |
| `searchPlaceholder` | `string` | `"Buscar..."` | Placeholder del input |
| `selectedId` | `string` | `undefined` | ID del item seleccionado (simple) |
| `selectedIds` | `string[]` | `[]` | IDs seleccionados (múltiple) |
| `multiple` | `boolean` | `false` | Habilitar selección múltiple |
| `renderItem` | `(item: T) => ReactNode` | - | Renderizado custom de items |
| `emptyMessage` | `string` | `"No se encontraron resultados"` | Mensaje cuando no hay items |
| `loadingMessage` | `string` | `"Cargando..."` | Mensaje de carga |
| `className` | `string` | - | Clases CSS adicionales |
| `maxHeight` | `string` | `"400px"` | Altura máxima de la lista |
| `allowClear` | `boolean` | `false` | Mostrar botón para limpiar búsqueda |

## Ejemplos

### Con tRPC y Paginación

```tsx
import { Picker, type PickerItem } from "~/components/ui/picker";
import { trpc } from "~/utils/trpc";

interface Client extends PickerItem {
  id: string;
  label: string;
  ruc: string;
  email: string;
}

function ClientPicker() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string>();
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = trpc.client.getAll.useQuery({
    page,
    limit: 20,
    search,
    type: "CLIENT",
  });

  const items: Client[] = (data?.clients || []).map((client) => ({
    id: client.id,
    label: client.name,
    ruc: client.ruc,
    email: client.email,
  }));

  const handleFetchMore = () => {
    if (data && page < data.totalPages) {
      setPage(prev => prev + 1);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1); // Reset a página 1 al buscar
  };

  return (
    <Picker<Client>
      items={items}
      fetchMore={handleFetchMore}
      hasMore={data ? page < data.totalPages : false}
      isLoading={isLoading}
      isFetchingMore={isFetching && page > 1}
      searchValue={search}
      onSearchChange={handleSearchChange}
      selectedId={selectedId}
      onSelect={(client) => setSelectedId(client.id)}
      allowClear
    />
  );
}
```

### Con Renderizado Personalizado

```tsx
<Picker<Client>
  items={items}
  // ... otras props
  renderItem={(client) => (
    <div className="flex flex-col gap-1">
      <span className="font-medium">{client.label}</span>
      <span className="text-xs text-muted-foreground">
        RUC: {client.ruc} • {client.email}
      </span>
    </div>
  )}
/>
```

### Selección Múltiple

```tsx
function MultipleSelectExample() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelect = (item: PickerItem) => {
    setSelectedIds(prev => {
      if (prev.includes(item.id)) {
        return prev.filter(id => id !== item.id);
      }
      return [...prev, item.id];
    });
  };

  return (
    <Picker
      items={items}
      selectedIds={selectedIds}
      onSelect={handleSelect}
      multiple
      // ... otras props
    />
  );
}
```

## Tipos

### PickerItem

Tipo base que deben extender tus items:

```typescript
interface PickerItem {
  id: string;
  label: string;
  [key: string]: any; // Campos adicionales
}
```

### PickerProps

```typescript
interface PickerProps<T extends PickerItem> {
  // Ver tabla de Props arriba
}
```

## Notas Importantes

1. **Tipo Genérico**: El componente usa TypeScript generics. Tu tipo debe extender `PickerItem`
2. **Campo `label`**: Es obligatorio y se usa como texto por defecto
3. **Scroll Infinito**: Usa `IntersectionObserver` con threshold de 0.1 y rootMargin de 50px
4. **Debounce**: La búsqueda tiene un debounce de 300ms automático
5. **Reset de Página**: Al buscar, es recomendable resetear la página a 1
6. **Performance**: Para listas muy grandes, usa `maxHeight` para limitar el viewport

## Dependencias

- `lucide-react`: Iconos (Search, Loader2, X)
- `~/hooks/useDebounce`: Hook de debounce personalizado
- `~/components/ui/input`: Input component
- `~/components/ui/button`: Button component
- `~/components/ui/card`: Card component

## Accesibilidad

- ✅ Navegación por teclado
- ✅ Focus visible
- ✅ Screen reader friendly
- ✅ ARIA labels apropiados
- ✅ Roles semánticos correctos

## Problemas Comunes

### El scroll infinito no funciona

Verifica que:
1. `hasMore` sea `true`
2. `isLoading` y `isFetchingMore` no sean ambos `true`
3. La función `fetchMore` esté actualizando los datos correctamente

### La búsqueda no filtra

El componente NO filtra automáticamente. Debes:
1. Pasar el `searchValue` a tu query/fetch
2. O filtrar los `items` antes de pasarlos al Picker

### Los items duplicados

Al paginar, acumula los items en tu estado en lugar de reemplazarlos:

```tsx
// ✅ Correcto
setItems(prev => [...prev, ...newItems]);

// ❌ Incorrecto
setItems(newItems);
```

## Mejoras Futuras

- [ ] Soporte para virtualization en listas muy grandes
- [ ] Modo dropdown/popover
- [ ] Keyboard navigation mejorada
- [ ] Agrupación de items
- [ ] Soporte para items deshabilitados

