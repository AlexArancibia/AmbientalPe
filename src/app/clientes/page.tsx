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
import { Users, Search, Plus, Mail, MapPin, Loader2, Edit, Eye, Trash2, FileDown, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";
import { CompanyType } from "@prisma/client";
import { DataTable, type Column } from "@/components/ui/data-table";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";

type Client = {
  id: string;
  name: string;
  ruc: string;
  email: string;
  address: string;
  contactPerson: string | null;
  phoneNumber: string | null;
  type: CompanyType;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  paymentMethod: string | null;
  startDate: string | null;
};

type ClientFormData = {
  name: string;
  ruc: string;
  email: string;
  address: string;
  contactPerson: string;
  phoneNumber: string;
  paymentMethod: string;
};

export default function ClientesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  // Form state for new client
  const [formData, setFormData] = useState<ClientFormData>({
    name: "",
    ruc: "",
    email: "",
    address: "",
    contactPerson: "",
    phoneNumber: "",
    paymentMethod: "",
  });

  // Obtener datos del backend usando tRPC
  const { data, isLoading, refetch } = trpc.client.getAll.useQuery({
    page: currentPage,
    limit: 15,
    search: debouncedSearch || undefined,
    type: CompanyType.CLIENT,
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
        phoneNumber: "",
        paymentMethod: "",
      });
    },
  });

  // Delete mutation
  const deleteMutation = trpc.client.delete.useMutation({
    onSuccess: () => {
      refetch();
      setDeleteDialogOpen(false);
      setClientToDelete(null);
    },
  });

  const clientes = data?.clients || [];
  const totalPages = data?.totalPages || 1;

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const { phoneNumber, ...rest } = formData;
    await createMutation.mutateAsync({
      ...rest,
      phoneNumber: phoneNumber.trim() !== "" ? phoneNumber.trim() : undefined,
      type: CompanyType.CLIENT,
    });
  };

  const handleDeleteClient = async () => {
    if (clientToDelete) {
      await deleteMutation.mutateAsync({ id: clientToDelete });
    }
  };

  const columns: Column<Client>[] = [
    {
      header: "Nombre",
      cell: (client) => (
        <div className="min-w-[200px]">
          <div className="font-medium">{client.name}</div>
          <div className="text-sm text-muted-foreground">RUC: {client.ruc}</div>
        </div>
      ),
    },
    {
      header: "Email",
      cell: (client) => (
        <div className="flex items-center space-x-2 min-w-[200px]">
          <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="truncate">{client.email}</span>
        </div>
      ),
    },
    {
      header: "Dirección",
      cell: (client) => (
        <div className="flex items-start space-x-2 min-w-[250px]">
          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <span className="line-clamp-2">{client.address}</span>
        </div>
      ),
    },
    {
      header: "Contacto",
      cell: (client) => (
        <div className="min-w-[150px]">
          {client.contactPerson || "-"}
        </div>
      ),
    },
    {
      header: "Teléfono",
      cell: (client) => (
        <div className="flex items-center space-x-2 min-w-[160px]">
          <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span>{client.phoneNumber || "-"}</span>
        </div>
      ),
    },
    {
      header: "Estado",
      cell: () => (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          Activo
        </Badge>
      ),
    },
    {
      header: "",
      cell: (client) => (
        <div className="flex justify-end items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/clientes/${client.id}`)}
            className="h-8 w-8"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/clientes/${client.id}?mode=edit`)}
            className="h-8 w-8"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setClientToDelete(client.id);
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
  const clientsWithPhone = clientes.filter((c) => !!c.phoneNumber).length;

  return (
    <div className="bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
              <p className="text-muted-foreground">
                Gestiona tus clientes activos
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
                  params.append('type', CompanyType.CLIENT);
                  if (debouncedSearch) params.append('search', debouncedSearch);
                  
                  const response = await fetch(`/api/pdf/clients?${params.toString()}`);
                  if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
                    throw new Error(errorData.error || 'Error al generar el PDF');
                  }
                  
                  const blob = await response.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Clientes-${new Date().toISOString().split('T')[0]}.pdf`;
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
                  Nuevo Cliente
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nuevo Cliente</DialogTitle>
                <DialogDescription>
                  Registra un nuevo cliente en el sistema
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateClient} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Nombre del Cliente <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Ej: Empresa XYZ S.A.C."
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
                    placeholder="Ej: María García"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Teléfono</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, phoneNumber: e.target.value })
                    }
                    placeholder="Ej: +51 999 888 777"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Método de Pago</Label>
                  <Input
                    id="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    placeholder="Ej: Transferencia bancaria, Crédito, etc."
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
                      "Crear Cliente"
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

        {/* Clientes Table */}
        <DataTable
          data={clientes}
          columns={columns}
          pageSize={15}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          totalPages={totalPages}
          isLoading={isLoading}
          emptyMessage="No se encontraron clientes"
          emptyDescription="Intenta con otro término de búsqueda o agrega un nuevo cliente"
          emptyIcon={<Users className="h-12 w-12 text-muted-foreground" />}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. El cliente será eliminado permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteClient}
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
