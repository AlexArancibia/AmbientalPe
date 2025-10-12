"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { FileCheck, Search, Plus, Calendar, User, Loader2, Edit, Eye, Trash2, FileDown } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/utils/trpc";
import { DataTable, type Column } from "@/components/ui/data-table";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Quotation = {
  id: string;
  number: string;
  date: string;
  clientId: string;
  currency: string;
  subtotal: number;
  igv: number;
  total: number;
  validityDays: number;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  client: {
    id: string;
    name: string;
  };
  items?: Array<{ id: string }>;
};

export default function CotizacionesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quotationToDelete, setQuotationToDelete] = useState<string | null>(null);

  // Obtener datos del backend usando tRPC
  const { data, isLoading, refetch } = trpc.quotation.getAll.useQuery({
    page: currentPage,
    limit: 15,
    search: searchTerm || undefined,
  });

  // Delete mutation
  const deleteMutation = trpc.quotation.delete.useMutation({
    onSuccess: () => {
      refetch();
      setDeleteDialogOpen(false);
      setQuotationToDelete(null);
    },
  });

  const cotizaciones = data?.quotations || [];
  const totalPages = data?.totalPages || 1;

  const handleDeleteQuotation = async () => {
    if (quotationToDelete) {
      await deleteMutation.mutateAsync({ id: quotationToDelete });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      APPROVED: { label: "Aprobada", className: "bg-green-50 text-green-700 border-green-200" },
      PENDING: { label: "Pendiente", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
      REJECTED: { label: "Rechazada", className: "bg-red-50 text-red-700 border-red-200" },
      DRAFT: { label: "Borrador", className: "bg-gray-50 text-gray-700 border-gray-200" },
    };
    return variants[status as keyof typeof variants] || variants.DRAFT;
  };

  const handleDownloadPDF = async (quotationId: string, quotationNumber: string) => {
    try {
      toast.info("Generando PDF...");
      const response = await fetch(`/api/pdf/quotation/${quotationId}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || 'Error al descargar el PDF');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Cotizacion-${quotationNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("PDF descargado exitosamente");
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error(error instanceof Error ? error.message : 'Error al descargar el PDF');
    }
  };

  const columns: Column<Quotation>[] = [
    {
      header: "Número",
      cell: (quotation) => (
        <div className="min-w-[120px]">
          <div className="font-medium">{quotation.number}</div>
          <div className="text-sm text-muted-foreground">
            {quotation.items?.length || 0} items
          </div>
        </div>
      ),
    },
    {
      header: "Cliente",
      cell: (quotation) => (
        <div className="flex items-center space-x-2 min-w-[200px]">
          <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="truncate">{quotation.client.name}</span>
        </div>
      ),
    },
    {
      header: "Fecha",
      cell: (quotation) => (
        <div className="flex items-center space-x-2 min-w-[120px]">
          <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span>{new Date(quotation.date).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      header: "Monto Total",
      cell: (quotation) => (
        <div className="min-w-[120px] text-right">
          <span className="font-medium">
            {quotation.currency === "PEN" ? "S/" : "$"} {quotation.total.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      ),
      className: "text-right",
    },
    {
      header: "Validez",
      cell: (quotation) => (
        <div className="min-w-[100px] text-center">
          {quotation.validityDays} días
        </div>
      ),
      className: "text-center",
    },
    {
      header: "Estado",
      cell: (quotation) => {
        const statusBadge = getStatusBadge(quotation.status);
        return (
          <Badge variant="outline" className={statusBadge.className}>
            {statusBadge.label}
          </Badge>
        );
      },
    },
    {
      header: "",
      cell: (quotation) => (
        <div className="flex justify-end items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDownloadPDF(quotation.id, quotation.number)}
            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            title="Descargar PDF"
          >
            <FileDown className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/cotizaciones/${quotation.id}`)}
            className="h-8 w-8"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/cotizaciones/${quotation.id}?mode=edit`)}
            className="h-8 w-8"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setQuotationToDelete(quotation.id);
              setDeleteDialogOpen(true);
            }}
            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      className: "w-[160px]",
    },
  ];

  const approvedCount = cotizaciones.filter((c) => c.status === "APPROVED").length;
  const pendingCount = cotizaciones.filter((c) => c.status === "PENDING").length;
  const totalAmount = cotizaciones.reduce((sum, c) => sum + c.total, 0);

  return (
    <div className="bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <FileCheck className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Cotizaciones</h1>
              <p className="text-muted-foreground">
                Gestiona las cotizaciones de servicios
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              onClick={async () => {
                try {
                  toast.info("Generando reporte PDF...");
                  const params = new URLSearchParams();
                  if (searchTerm) params.append('search', searchTerm);
                  
                  const response = await fetch(`/api/pdf/quotations?${params.toString()}`);
                  if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
                    throw new Error(errorData.error || 'Error al generar el PDF');
                  }
                  
                  const blob = await response.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Reporte-Cotizaciones-${new Date().toISOString().split('T')[0]}.pdf`;
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(url);
                  document.body.removeChild(a);
                  toast.success("Reporte PDF descargado exitosamente");
                } catch (error) {
                  console.error('Error downloading PDF:', error);
                  toast.error(error instanceof Error ? error.message : 'Error al descargar el PDF');
                }
              }} 
              variant="outline"
              size="sm"
            >
              <FileDown className="h-4 w-4 mr-2" />
              Exportar Reporte PDF
            </Button>
            <Button onClick={() => router.push("/cotizaciones/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Cotización
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por número o cliente..."
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
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Cotizaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.total || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Aprobadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {approvedCount}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {pendingCount}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Monto Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                S/ {totalAmount.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cotizaciones Table */}
        <DataTable
          data={cotizaciones}
          columns={columns}
          pageSize={15}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          totalPages={totalPages}
          isLoading={isLoading}
          emptyMessage="No se encontraron cotizaciones"
          emptyDescription="Intenta con otro término de búsqueda o crea una nueva cotización"
          emptyIcon={<FileCheck className="h-12 w-12 text-muted-foreground" />}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. La cotización será eliminada permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteQuotation}
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
