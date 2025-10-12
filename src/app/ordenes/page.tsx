"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { FolderOpen, Search, Plus, Calendar, User, Loader2, Edit, Eye, Trash2, FileDown } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/utils/trpc";
import { DataTable, type Column } from "@/components/ui/data-table";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type ServiceOrder = {
  id: string;
  number: string;
  date: string;
  clientId: string;
  description: string | null;
  currency: string;
  subtotal: number;
  igv: number;
  total: number;
  status: string;
  client: { id: string; name: string };
};

type PurchaseOrder = {
  id: string;
  number: string;
  date: string;
  clientId: string;
  description: string | null;
  currency: string;
  subtotal: number;
  igv: number;
  total: number;
  status: string;
  client: { id: string; name: string };
};

export default function OrdenesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceOrderPage, setServiceOrderPage] = useState(1);
  const [purchaseOrderPage, setPurchaseOrderPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<{ id: string; type: "service" | "purchase" } | null>(null);

  // Obtener datos del backend usando tRPC
  const { data: serviceOrdersData, isLoading: isLoadingServiceOrders, refetch: refetchService } = trpc.serviceOrder.getAll.useQuery({
    page: serviceOrderPage,
    limit: 15,
    search: searchTerm || undefined,
  });

  const { data: purchaseOrdersData, isLoading: isLoadingPurchaseOrders, refetch: refetchPurchase } = trpc.purchaseOrder.getAll.useQuery({
    page: purchaseOrderPage,
    limit: 15,
    search: searchTerm || undefined,
  });

  // Delete mutations
  const deleteServiceMutation = trpc.serviceOrder.delete.useMutation({
    onSuccess: () => {
      refetchService();
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
    },
  });

  const deletePurchaseMutation = trpc.purchaseOrder.delete.useMutation({
    onSuccess: () => {
      refetchPurchase();
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
    },
  });

  const ordenesServicio = serviceOrdersData?.serviceOrders || [];
  const ordenesCompra = purchaseOrdersData?.purchaseOrders || [];

  const handleDeleteOrder = async () => {
    if (orderToDelete) {
      if (orderToDelete.type === "service") {
        await deleteServiceMutation.mutateAsync({ id: orderToDelete.id });
      } else {
        await deletePurchaseMutation.mutateAsync({ id: orderToDelete.id });
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      COMPLETED: { label: "Completada", className: "bg-green-50 text-green-700 border-green-200" },
      IN_PROGRESS: { label: "En Progreso", className: "bg-blue-50 text-blue-700 border-blue-200" },
      APPROVED: { label: "Aprobada", className: "bg-purple-50 text-purple-700 border-purple-200" },
      PENDING: { label: "Pendiente", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
      CANCELLED: { label: "Cancelada", className: "bg-red-50 text-red-700 border-red-200" },
    };
    return variants[status as keyof typeof variants] || variants.PENDING;
  };

  const handleDownloadServiceOrderPDF = async (orderId: string, orderNumber: string) => {
    try {
      toast.info("Generando PDF...");
      const response = await fetch(`/api/pdf/service-order/${orderId}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || 'Error al descargar el PDF');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Orden-Servicio-${orderNumber}.pdf`;
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

  const handleDownloadPurchaseOrderPDF = async (orderId: string, orderNumber: string) => {
    try {
      toast.info("Generando PDF...");
      const response = await fetch(`/api/pdf/purchase-order/${orderId}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || 'Error al descargar el PDF');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Orden-Compra-${orderNumber}.pdf`;
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

  const serviceOrderColumns: Column<ServiceOrder>[] = [
    {
      header: "Número",
      cell: (order) => (
        <div className="min-w-[120px]">
          <div className="font-medium">{order.number}</div>
        </div>
      ),
    },
    {
      header: "Cliente",
      cell: (order) => (
        <div className="flex items-center space-x-2 min-w-[200px]">
          <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="truncate">{order.client.name}</span>
        </div>
      ),
    },
    {
      header: "Fecha",
      cell: (order) => (
        <div className="flex items-center space-x-2 min-w-[120px]">
          <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span>{new Date(order.date).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      header: "Descripción",
      cell: (order) => (
        <div className="min-w-[200px] max-w-[300px]">
          <span className="line-clamp-2 text-sm">{order.description || "Sin descripción"}</span>
        </div>
      ),
    },
    {
      header: "Monto Total",
      cell: (order) => (
        <div className="min-w-[120px] text-right">
          <span className="font-medium">
            {order.currency === "PEN" ? "S/" : "$"} {order.total.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      ),
      className: "text-right",
    },
    {
      header: "Estado",
      cell: (order) => {
        const statusBadge = getStatusBadge(order.status);
        return (
          <Badge variant="outline" className={statusBadge.className}>
            {statusBadge.label}
          </Badge>
        );
      },
    },
    {
      header: "",
      cell: (order) => (
        <div className="flex justify-end items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDownloadServiceOrderPDF(order.id, order.number)}
            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            title="Descargar PDF"
          >
            <FileDown className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/ordenes/servicio/${order.id}`)}
            className="h-8 w-8"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/ordenes/servicio/${order.id}?mode=edit`)}
            className="h-8 w-8"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setOrderToDelete({ id: order.id, type: "service" });
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

  const purchaseOrderColumns: Column<PurchaseOrder>[] = [
    {
      header: "Número",
      cell: (order) => (
        <div className="min-w-[120px]">
          <div className="font-medium">{order.number}</div>
        </div>
      ),
    },
    {
      header: "Proveedor",
      cell: (order) => (
        <div className="flex items-center space-x-2 min-w-[200px]">
          <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="truncate">{order.client.name}</span>
        </div>
      ),
    },
    {
      header: "Fecha",
      cell: (order) => (
        <div className="flex items-center space-x-2 min-w-[120px]">
          <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span>{new Date(order.date).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      header: "Descripción",
      cell: (order) => (
        <div className="min-w-[200px] max-w-[300px]">
          <span className="line-clamp-2 text-sm">{order.description || "Sin descripción"}</span>
        </div>
      ),
    },
    {
      header: "Monto Total",
      cell: (order) => (
        <div className="min-w-[120px] text-right">
          <span className="font-medium">
            {order.currency === "PEN" ? "S/" : "$"} {order.total.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      ),
      className: "text-right",
    },
    {
      header: "Estado",
      cell: (order) => {
        const statusBadge = getStatusBadge(order.status);
        return (
          <Badge variant="outline" className={statusBadge.className}>
            {statusBadge.label}
          </Badge>
        );
      },
    },
    {
      header: "",
      cell: (order) => (
        <div className="flex justify-end items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDownloadPurchaseOrderPDF(order.id, order.number)}
            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            title="Descargar PDF"
          >
            <FileDown className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/ordenes/compra/${order.id}`)}
            className="h-8 w-8"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/ordenes/compra/${order.id}?mode=edit`)}
            className="h-8 w-8"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setOrderToDelete({ id: order.id, type: "purchase" });
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

  return (
    <div className="bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-pink-500/10 rounded-lg">
              <FolderOpen className="h-6 w-6 text-pink-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Órdenes</h1>
              <p className="text-muted-foreground">
                Gestiona órdenes de servicio y compra
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={async () => {
                try {
                  toast.info("Generando reporte PDF...");
                  const params = new URLSearchParams();
                  if (searchTerm) params.append('search', searchTerm);
                  
                  const response = await fetch(`/api/pdf/orders?${params.toString()}`);
                  if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
                    throw new Error(errorData.error || 'Error al generar el PDF');
                  }
                  
                  const blob = await response.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Reporte-Ordenes-${new Date().toISOString().split('T')[0]}.pdf`;
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
            <Button onClick={() => router.push("/ordenes/servicio/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Orden de Servicio
            </Button>
            <Button variant="outline" onClick={() => router.push("/ordenes/compra/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Orden de Compra
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por número o cliente/proveedor..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setServiceOrderPage(1);
                setPurchaseOrderPage(1);
              }}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="servicio" className="space-y-4">
          <TabsList>
            <TabsTrigger value="servicio">
              Órdenes de Servicio ({serviceOrdersData?.total || 0})
            </TabsTrigger>
            <TabsTrigger value="compra">
              Órdenes de Compra ({purchaseOrdersData?.total || 0})
            </TabsTrigger>
          </TabsList>

          {/* Órdenes de Servicio */}
          <TabsContent value="servicio" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Órdenes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{serviceOrdersData?.total || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    En Progreso
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {ordenesServicio.filter((o) => o.status === "IN_PROGRESS").length}
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
                    S/ {ordenesServicio.reduce((sum, o) => sum + o.total, 0).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </div>

            <DataTable
              data={ordenesServicio}
              columns={serviceOrderColumns}
              pageSize={15}
              currentPage={serviceOrderPage}
              onPageChange={setServiceOrderPage}
              totalPages={serviceOrdersData?.totalPages || 1}
              isLoading={isLoadingServiceOrders}
              emptyMessage="No se encontraron órdenes de servicio"
              emptyDescription="Intenta con otro término de búsqueda o crea una nueva orden"
              emptyIcon={<FolderOpen className="h-12 w-12 text-muted-foreground" />}
            />
          </TabsContent>

          {/* Órdenes de Compra */}
          <TabsContent value="compra" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Órdenes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{purchaseOrdersData?.total || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Completadas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {ordenesCompra.filter((o) => o.status === "COMPLETED").length}
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
                    S/ {ordenesCompra.reduce((sum, o) => sum + o.total, 0).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </div>

            <DataTable
              data={ordenesCompra}
              columns={purchaseOrderColumns}
              pageSize={15}
              currentPage={purchaseOrderPage}
              onPageChange={setPurchaseOrderPage}
              totalPages={purchaseOrdersData?.totalPages || 1}
              isLoading={isLoadingPurchaseOrders}
              emptyMessage="No se encontraron órdenes de compra"
              emptyDescription="Intenta con otro término de búsqueda o crea una nueva orden"
              emptyIcon={<FolderOpen className="h-12 w-12 text-muted-foreground" />}
            />
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. La orden será eliminada permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteOrder}
                className="bg-red-600 hover:bg-red-700"
              >
                {(deleteServiceMutation.isPending || deletePurchaseMutation.isPending) ? (
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
