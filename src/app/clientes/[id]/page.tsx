"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, ArrowLeft, Edit, Save, X, Loader2, Mail, MapPin, User, CreditCard, Calendar, FileCheck, FolderOpen, Phone, Building2 } from "lucide-react";
import { useState, useEffect } from "react";
import { trpc } from "@/utils/trpc";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { CompanyType } from "@prisma/client";

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;

  const [isEditMode, setIsEditMode] = useState(searchParams.get("mode") === "edit");

  // Get client data
  const { data: client, isLoading, refetch } = trpc.client.getById.useQuery({ id }, {
    enabled: !!id,
  });

  // Get quotations for this client
  const { data: quotationsData } = trpc.quotation.getAll.useQuery({
    page: 1,
    limit: 10,
    clientId: id,
  }, {
    enabled: !!id,
  });

  // Get service orders for this client
  const { data: serviceOrdersData } = trpc.serviceOrder.getAll.useQuery({
    page: 1,
    limit: 10,
    clientId: id,
  }, {
    enabled: !!id,
  });

  // Update mutation
  const updateMutation = trpc.client.update.useMutation({
    onSuccess: () => {
      refetch();
      setIsEditMode(false);
    },
  });

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    ruc: "",
    email: "",
    address: "",
    contactPerson: "",
    creditLine: 0,
    paymentMethod: "",
  });

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        ruc: client.ruc,
        email: client.email,
        address: client.address,
        contactPerson: client.contactPerson || "",
        creditLine: client.creditLine || 0,
        paymentMethod: client.paymentMethod || "",
      });
    }
  }, [client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateMutation.mutateAsync({
      id,
      ...formData,
      type: CompanyType.CLIENT,
    });
  };

  const handleCancel = () => {
    if (client) {
      setFormData({
        name: client.name,
        ruc: client.ruc,
        email: client.email,
        address: client.address,
        contactPerson: client.contactPerson || "",
        creditLine: client.creditLine || 0,
        paymentMethod: client.paymentMethod || "",
      });
    }
    setIsEditMode(false);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      APPROVED: { label: "Aprobada", className: "bg-green-50 text-green-700 border-green-200" },
      PENDING: { label: "Pendiente", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
      DRAFT: { label: "Borrador", className: "bg-gray-50 text-gray-700 border-gray-200" },
      REJECTED: { label: "Rechazada", className: "bg-red-50 text-red-700 border-red-200" },
      IN_PROGRESS: { label: "En Progreso", className: "bg-blue-50 text-blue-700 border-blue-200" },
      COMPLETED: { label: "Completada", className: "bg-green-50 text-green-700 border-green-200" },
      CANCELLED: { label: "Cancelada", className: "bg-red-50 text-red-700 border-red-200" },
    };
    return variants[status as keyof typeof variants] || variants.PENDING;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando cliente...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex items-center justify-center h-full py-12">
        <div className="text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Cliente no encontrado</h3>
          <Button onClick={() => router.push("/clientes")}>
            Volver a clientes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <div className="container mx-auto p-6 space-y-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/clientes")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{client.name}</h1>
              <p className="text-sm text-muted-foreground">RUC: {client.ruc}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Cliente
            </Badge>
            {!isEditMode && (
              <Button onClick={() => setIsEditMode(true)} size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Client Information */}
          <div className="md:col-span-2 space-y-6">
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información General</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Nombre</Label>
                      {isEditMode ? (
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      ) : (
                        <p className="text-sm font-medium">{client.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">RUC</Label>
                      {isEditMode ? (
                        <Input
                          value={formData.ruc}
                          onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                          required
                        />
                      ) : (
                        <p className="text-sm font-medium font-mono">{client.ruc}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Email</Label>
                      {isEditMode ? (
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      ) : (
                        <p className="text-sm font-medium">{client.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Contacto</Label>
                      {isEditMode ? (
                        <Input
                          value={formData.contactPerson}
                          onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                        />
                      ) : (
                        <p className="text-sm font-medium">{client.contactPerson || "-"}</p>
                      )}
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label className="text-xs text-muted-foreground">Dirección</Label>
                      {isEditMode ? (
                        <Textarea
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          required
                          rows={2}
                        />
                      ) : (
                        <p className="text-sm font-medium">{client.address}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Línea de Crédito</Label>
                      {isEditMode ? (
                        <Input
                          type="number"
                          value={formData.creditLine}
                          onChange={(e) => setFormData({ ...formData, creditLine: parseFloat(e.target.value) || 0 })}
                          min="0"
                          step="0.01"
                        />
                      ) : (
                        <p className="text-sm font-medium">S/ {client.creditLine?.toLocaleString() || "0"}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Método de Pago</Label>
                      {isEditMode ? (
                        <Input
                          value={formData.paymentMethod}
                          onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                        />
                      ) : (
                        <p className="text-sm font-medium">{client.paymentMethod || "-"}</p>
                      )}
                    </div>
                  </div>

                  {isEditMode && (
                    <div className="flex space-x-2 pt-4 border-t">
                      <Button
                        type="submit"
                        size="sm"
                        disabled={updateMutation.isPending}
                      >
                        {updateMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Guardar
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCancel}
                        disabled={updateMutation.isPending}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </form>

            {/* Quotations and Orders Tabs */}
            <Card>
              <CardContent className="pt-6">
                <Tabs defaultValue="quotations">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="quotations">
                      <FileCheck className="h-4 w-4 mr-2" />
                      Cotizaciones ({quotationsData?.total || 0})
                    </TabsTrigger>
                    <TabsTrigger value="orders">
                      <FolderOpen className="h-4 w-4 mr-2" />
                      Órdenes ({serviceOrdersData?.total || 0})
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="quotations" className="space-y-3 mt-4">
                    {quotationsData?.quotations && quotationsData.quotations.length > 0 ? (
                      quotationsData.quotations.map((quotation: any) => {
                        const statusBadge = getStatusBadge(quotation.status);
                        return (
                          <div
                            key={quotation.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                            onClick={() => router.push(`/cotizaciones/${quotation.id}`)}
                          >
                            <div className="space-y-1">
                              <p className="text-sm font-medium">{quotation.number}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(quotation.date).toLocaleDateString()} • {quotation.currency} {quotation.total.toLocaleString()}
                              </p>
                            </div>
                            <Badge variant="outline" className={statusBadge.className}>
                              {statusBadge.label}
                            </Badge>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No hay cotizaciones registradas
                      </p>
                    )}
                  </TabsContent>

                  <TabsContent value="orders" className="space-y-3 mt-4">
                    {serviceOrdersData?.serviceOrders && serviceOrdersData.serviceOrders.length > 0 ? (
                      serviceOrdersData.serviceOrders.map((order: any) => {
                        const statusBadge = getStatusBadge(order.status);
                        return (
                          <div
                            key={order.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                            onClick={() => router.push(`/ordenes/servicio/${order.id}`)}
                          >
                            <div className="space-y-1">
                              <p className="text-sm font-medium">{order.number}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(order.date).toLocaleDateString()} • {order.currency} {order.total.toLocaleString()}
                              </p>
                            </div>
                            <Badge variant="outline" className={statusBadge.className}>
                              {statusBadge.label}
                            </Badge>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No hay órdenes de servicio registradas
                      </p>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Estadísticas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Cotizaciones</span>
                    <span className="font-bold">{quotationsData?.total || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Órdenes</span>
                    <span className="font-bold">{serviceOrdersData?.total || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Línea de Crédito</span>
                    <span className="font-bold">S/ {client.creditLine?.toLocaleString() || "0"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Información Adicional
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Creado</p>
                    <p className="font-medium">{new Date(client.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Actualizado</p>
                    <p className="font-medium">{new Date(client.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
