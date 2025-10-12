"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Truck, Search, Plus, Mail, MapPin, Loader2, Edit, Eye, Trash2, FileDown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";
import { CompanyType } from "@prisma/client";
import { DataTable, type Column } from "@/components/ui/data-table";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";

type Provider = {
  id: string;
  name: string;
  ruc: string;
  email: string;
  address: string;
  contactPerson: string | null;
  type: CompanyType;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  creditLine: number | null;
  paymentMethod: string | null;
  startDate: string | null;
};

export default function ProveedoresPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [providerToDelete, setProviderToDelete] = useState<string | null>(null);

  // Form state for new provider
  const [formData, setFormData] = useState({
    name: "",
    ruc: "",
    email: "",
    address: "",
    contactPerson: "",
    paymentMethod: "",
  });

  // Obtener datos del backend usando tRPC
  const { data, isLoading, refetch } = trpc.client.getAll.useQuery({
    page: currentPage,
    limit: 15,
    search: debouncedSearch || undefined,
    type: CompanyType.PROVIDER,
  });

  // Create mutation
  const createMutation = trpc.client.create.useMutation({
    onSuccess: () => {
      refetch();
      setIsDialogOpen(false);
      setFormData({
        name: "",
        ruc: "",
        email: "",
        address: "",
        contactPerson: "",
        paymentMethod: "",
      });
    },
  });

  // Delete mutation
  const deleteMutation = trpc.client.delete.useMutation({
    onSuccess: () => {
      refetch();
      setDeleteDialogOpen(false);
      setProviderToDelete(null);
    },
  });

  const proveedores = data?.clients || [];
  const totalPages = data?.totalPages || 1;

  const handleCreateProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync({
      ...formData,
      type: CompanyType.PROVIDER,
    });
  };

  const handleDeleteProvider = async () => {
    if (providerToDelete) {
      await deleteMutation.mutateAsync({ id: providerToDelete });
    }
  };

  const columns: Column<Provider>[] = [
    {
      header: "Nombre",
      cell: (provider) => (
        <div className="min-w-[200px]">
          <div className="font-medium">{provider.name}</div>
          <div className="text-sm text-muted-foreground">RUC: {provider.ruc}</div>
        </div>
      ),
    },
    {
      header: "Email",
      cell: (provider) => (
        <div className="flex items-center space-x-2 min-w-[200px]">
          <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="truncate">{provider.email}</span>
        </div>
      ),
    },
    {
      header: "Dirección",
      cell: (provider) => (
        <div className="flex items-start space-x-2 min-w-[250px]">
          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <span className="line-clamp-2">{provider.address}</span>
        </div>
      ),
    },
    {
      header: "Contacto",
      cell: (provider) => (
        <div className="min-w-[150px]">
          {provider.contactPerson || "-"}
        </div>
      ),
    },
    {
      header: "Estado",
      cell: () => (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Activo
        </Badge>
      ),
    },
    {
      header: "",
      cell: (provider) => (
        <div className="flex justify-end items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/proveedores/${provider.id}`)}
            className="h-8 w-8"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/proveedores/${provider.id}?mode=edit`)}
            className="h-8 w-8"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setProviderToDelete(provider.id);
              setDeleteDialogOpen(true);
            }}
            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      className: "w-[120px]",
    },
  ];

  return (
    <div className="bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Truck className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Proveedores</h1>
              <p className="text-muted-foreground">
                Gestiona tus proveedores activos
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Button 
              onClick={async () => {
                try {
                  toast.info("Generando PDF...");
                  const params = new URLSearchParams();
                  if (debouncedSearch) params.append('search', debouncedSearch);
                  
                  const response = await fetch(`/api/pdf/providers?${params.toString()}`);
                  if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
                    throw new Error(errorData.error || 'Error al generar el PDF');
                  }
                  
                  const blob = await response.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Proveedores-${new Date().toISOString().split('T')[0]}.pdf`;
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(url);
                  document.body.removeChild(a);
                  toast.success("PDF descargado exitosamente");
                } catch (error) {
                  console.error('Error downloading PDF:', error);
                  toast.error(error instanceof Error ? error.message : 'Error al descargar el PDF');
                }
              }} 
              variant="outline"
              size="sm"
            >
              <FileDown className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
            
            {/* Create Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Proveedor
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nuevo Proveedor</DialogTitle>
                <DialogDescription>
                  Registra un nuevo proveedor en el sistema
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateProvider} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Nombre del Proveedor <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Ej: Empresa ABC S.A.C."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ruc">
                    RUC <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="ruc"
                    value={formData.ruc}
                    onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                    required
                    placeholder="Ej: 20123456789"
                    maxLength={11}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="Ej: contacto@empresa.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">
                    Dirección <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                    rows={3}
                    placeholder="Ej: Av. Principal 123, Lima, Perú"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Persona de Contacto</Label>
                  <Input
                    id="contactPerson"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="Ej: Juan Pérez"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Método de Pago</Label>
                  <Input
                    id="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    placeholder="Ej: Transferencia bancaria, Efectivo, etc."
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={createMutation.isPending}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      "Crear Proveedor"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, RUC o email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Proveedores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.total || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Proveedores Activos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.total || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Órdenes de Compra
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
            </CardContent>
          </Card>
        </div>

        {/* Proveedores Table */}
        <DataTable
          data={proveedores}
          columns={columns}
          pageSize={15}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          totalPages={totalPages}
          isLoading={isLoading}
          emptyMessage="No se encontraron proveedores"
          emptyDescription="Intenta con otro término de búsqueda o agrega un nuevo proveedor"
          emptyIcon={<Truck className="h-12 w-12 text-muted-foreground" />}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. El proveedor será eliminado permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteProvider}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  "Eliminar"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
