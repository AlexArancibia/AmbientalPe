"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileCheck, ArrowLeft, Save, Loader2, Plus, Trash2, Edit, Calendar, User, Search, ChevronDown, ChevronUp, Check, FileDown, Printer } from "lucide-react";
import { trpc } from "@/utils/trpc";
import { useRouter, useSearchParams } from "next/navigation";
import { CompanyType } from "@prisma/client";
import { PickerDialog } from "@/components/ui/picker-dialog";
import type { PickerItem } from "@/components/ui/picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

type ServiceOrderItem = {
  id?: string;
  code: string;
  name: string;
  description: string;
  quantity: number;
  days: number | null;
  unitPrice: number;
  saveAsTemplate?: boolean;
};

type Template = {
  id: string;
  code: string;
  name: string;
  description: string;
  quantity: number;
  days: number | null;
  unitPrice: number;
};

interface ClientItem extends PickerItem {
  id: string;
  label: string;
  name: string;
  ruc: string;
  email: string;
}

interface UserItem extends PickerItem {
  id: string;
  label: string;
  name: string;
  email: string;
}

export default function ServiceOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const unwrappedParams = React.use(params);
  const [isEditMode, setIsEditMode] = useState(searchParams.get("mode") === "edit");

  // Client picker state
  const [clientSearch, setClientSearch] = useState("");
  const [clientPage, setClientPage] = useState(1);
  
  // User picker state
  const [userSearch, setUserSearch] = useState("");
  const [userPage, setUserPage] = useState(1);
  
  // Template states
  const [templateSearch, setTemplateSearch] = useState("");
  const [templatePage, setTemplatePage] = useState(1);
  const [activeTab, setActiveTab] = useState("new");
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [newTemplateForm, setNewTemplateForm] = useState<Omit<Template, "id">>({
    code: "",
    name: "",
    description: "",
    quantity: 1,
    days: 1,
    unitPrice: 0,
  });
  const [newItemForm, setNewItemForm] = useState<Omit<ServiceOrderItem, "id">>({
    code: "",
    name: "",
    description: "",
    quantity: 1,
    days: 1,
    unitPrice: 0,
    saveAsTemplate: false,
  });

  // Get service order
  const { data: serviceOrder, isLoading, refetch } = trpc.serviceOrder.getById.useQuery({
    id: unwrappedParams.id,
  });

  // Get clients for dropdown
  const { data: clientsData, isLoading: clientsLoading } = trpc.client.getAll.useQuery({
    page: clientPage,
    limit: 20,
    search: clientSearch,
    type: CompanyType.CLIENT,
  });

  // Get users for gestor dropdown with pagination
  const { data: usersData, isLoading: usersLoading } = trpc.user.getAll.useQuery({
    page: userPage,
    limit: 20,
    search: userSearch,
  });

  // Update mutation
  const updateMutation = trpc.serviceOrder.update.useMutation({
    onSuccess: () => {
      refetch();
      setIsEditMode(false);
    },
  });

  // Get templates
  const { data: templatesData, refetch: refetchTemplates } = trpc.serviceOrderItemTemplate.getAll.useQuery({
    page: templatePage,
    limit: 20,
    search: templateSearch,
  });

  // Template mutations
  const createTemplateMutation = trpc.serviceOrderItemTemplate.create.useMutation({
    onSuccess: () => {
      refetchTemplates();
      toast.success("Template creado exitosamente");
    },
  });

  const updateTemplateMutation = trpc.serviceOrderItemTemplate.update.useMutation({
    onSuccess: () => {
      refetchTemplates();
      setEditingTemplate(null);
      toast.success("Template actualizado exitosamente");
    },
  });

  const deleteTemplateMutation = trpc.serviceOrderItemTemplate.delete.useMutation({
    onSuccess: () => {
      refetchTemplates();
      toast.success("Template eliminado exitosamente");
    },
  });

  // Form state
  const [formData, setFormData] = useState({
    number: "",
    date: new Date(),
    clientId: "",
    description: "",
    currency: "PEN",
    paymentTerms: "",
    gestorId: "",
    attendantName: "",
    comments: "",
    status: "PENDING",
    items: [] as ServiceOrderItem[],
  });

  // Initialize form data when service order is loaded
  useEffect(() => {
    if (serviceOrder) {
      setFormData({
        number: serviceOrder.number,
        date: new Date(serviceOrder.date),
        clientId: serviceOrder.clientId,
        description: serviceOrder.description || "",
        currency: serviceOrder.currency,
        paymentTerms: serviceOrder.paymentTerms || "",
        gestorId: serviceOrder.gestorId,
        attendantName: serviceOrder.attendantName || "",
        comments: serviceOrder.comments || "",
        status: serviceOrder.status,
        items: serviceOrder.items.map((item: any) => ({
          id: item.id,
          code: item.code,
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          days: item.days || 1,
          unitPrice: item.unitPrice,
        })),
      });
    }
  }, [serviceOrder]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateMutation.mutateAsync({
      id: unwrappedParams.id,
      ...formData,
      items: formData.items.map(item => ({
        ...item,
        days: item.days ?? undefined,
      })),
    });
  };

  const handleCancel = () => {
    if (serviceOrder) {
      setFormData({
        number: serviceOrder.number,
        date: new Date(serviceOrder.date),
        clientId: serviceOrder.clientId,
        description: serviceOrder.description || "",
        currency: serviceOrder.currency,
        paymentTerms: serviceOrder.paymentTerms || "",
        gestorId: serviceOrder.gestorId,
        attendantName: serviceOrder.attendantName || "",
        comments: serviceOrder.comments || "",
        status: serviceOrder.status,
        items: serviceOrder.items.map((item: any) => ({
          id: item.id,
          code: item.code,
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          days: item.days || 1,
          unitPrice: item.unitPrice,
        })),
      });
    }
    setIsEditMode(false);
  };

  const handleAddItem = async () => {
    if (!newItemForm.code || !newItemForm.name || !newItemForm.description) {
      toast.error("Por favor complete todos los campos requeridos");
      return;
    }

    const newItem = {
      id: `temp-${Date.now()}`,
      ...newItemForm,
    };

    setFormData({
      ...formData,
      items: [...formData.items, newItem],
    });

    if (newItemForm.saveAsTemplate) {
      try {
        await createTemplateMutation.mutateAsync({
          code: newItemForm.code,
          name: newItemForm.name,
          description: newItemForm.description,
          quantity: newItemForm.quantity,
          days: newItemForm.days ?? undefined,
          unitPrice: newItemForm.unitPrice,
        });
      } catch (error) {
        console.error("Error creating template:", error);
      }
    }

    setNewItemForm({
      code: "",
      name: "",
      description: "",
      quantity: 1,
      days: 1,
      unitPrice: 0,
      saveAsTemplate: false,
    });
    toast.success("Item agregado");
  };

  const handleAddFromTemplate = (template: Template) => {
    const newItem: ServiceOrderItem = {
      id: `temp-${Date.now()}`,
      code: template.code,
      name: template.name,
      description: template.description,
      quantity: template.quantity,
      days: template.days,
      unitPrice: template.unitPrice,
    };

      setFormData({
        ...formData,
      items: [...formData.items, newItem],
    });
    toast.success("Item agregado desde template");
  };

  const handleRemoveItem = (id: string) => {
    setFormData({
      ...formData,
      items: formData.items.filter((item) => item.id !== id),
    });
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplate?.id) return;
    const { id, ...data } = editingTemplate;
    await updateTemplateMutation.mutateAsync({
      id,
      ...data,
      days: data.days ?? undefined,
    });
  };

  const handleDeleteTemplate = async (id: string) => {
    if (confirm("¿Está seguro de eliminar este template?")) {
      await deleteTemplateMutation.mutateAsync({ id });
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplateForm.code || !newTemplateForm.name || !newTemplateForm.description) {
      toast.error("Por favor complete todos los campos requeridos");
      return;
    }

    try {
      await createTemplateMutation.mutateAsync({
        ...newTemplateForm,
        days: newTemplateForm.days ?? undefined,
      });
      
      setNewTemplateForm({
        code: "",
        name: "",
        description: "",
        quantity: 1,
        days: 1,
        unitPrice: 0,
      });
      setIsCreatingTemplate(false);
    } catch (error) {
      toast.error("Error al crear el template");
    }
  };

  const calculateSubtotal = () => {
    return formData.items.reduce(
      (sum, item) => sum + item.quantity * (item.days ?? 0) * item.unitPrice,
      0
    );
  };

  const calculateIGV = () => {
    return calculateSubtotal() * 0.18;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateIGV();
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

  // Transform clients for picker
  const clientItems: ClientItem[] = (clientsData?.clients || []).map((client) => ({
    id: client.id,
    label: client.name,
    name: client.name,
    ruc: client.ruc,
    email: client.email,
  }));

  // Handle client search and reset page
  const handleClientSearchChange = (value: string) => {
    setClientSearch(value);
    setClientPage(1);
  };

  // Transform users for picker
  const userItems: UserItem[] = (usersData?.data || []).map((user: any) => ({
    id: user.id,
    label: user.name,
    name: user.name,
    email: user.email,
  }));

  // Handle user search and reset page
  const handleUserSearchChange = (value: string) => {
    setUserSearch(value);
    setUserPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando orden...</p>
        </div>
      </div>
    );
  }

  if (!serviceOrder) {
    return (
      <div className="flex items-center justify-center h-full py-12">
        <div className="text-center">
          <FileCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Orden no encontrada</h3>
          <Button onClick={() => router.push("/ordenes")}>
            Volver a órdenes
          </Button>
        </div>
      </div>
    );
  }

  const statusBadge = getStatusBadge(formData.status);

  return (
    <div className="bg-background">
      <div className="container mx-auto p-6 space-y-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/ordenes")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="p-2 bg-pink-500/10 rounded-lg">
              <FileCheck className="h-6 w-6 text-pink-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{serviceOrder.number}</h1>
              <p className="text-sm text-muted-foreground">{serviceOrder.client.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className={statusBadge.className}>
              {statusBadge.label}
            </Badge>
            {!isEditMode && (
              <>
                <Button 
                  onClick={async () => {
                    try {
                      toast.info("Generando PDF...");
                      const response = await fetch(`/api/pdf/service-order/${unwrappedParams.id}`);
                      if (!response.ok) {
                        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
                        throw new Error(errorData.error || 'Error al descargar el PDF');
                      }
                      
                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `Orden-Servicio-${serviceOrder.number}.pdf`;
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
                  size="sm"
                  variant="outline"
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  Descargar PDF
                </Button>
                <Button 
                  onClick={async () => {
                    try {
                      toast.info("Generando PDF...");
                      const response = await fetch(`/api/pdf/service-order/${unwrappedParams.id}`);
                      if (!response.ok) {
                        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
                        throw new Error(errorData.error || 'Error al abrir el PDF');
                      }
                      
                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      window.open(url, '_blank');
                      setTimeout(() => window.URL.revokeObjectURL(url), 100);
                      toast.success("PDF abierto en nueva pestaña");
                    } catch (error) {
                      console.error('Error opening PDF:', error);
                      toast.error(error instanceof Error ? error.message : 'Error al abrir el PDF');
                    }
                  }} 
                  size="sm"
                  variant="outline"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir
                </Button>
              <Button onClick={() => setIsEditMode(true)} size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Content - 2/3 */}
          <div className="md:col-span-2 space-y-6">
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información General</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Número</Label>
                      {isEditMode ? (
                        <Input
                          value={formData.number}
                          onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                          required
                        />
                      ) : (
                        <p className="text-sm font-medium font-mono">{serviceOrder.number}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Fecha</Label>
                      {isEditMode ? (
                        <Input
                          type="date"
                          value={formData.date.toISOString().split("T")[0]}
                          onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value) })}
                          required
                        />
                      ) : (
                        <p className="text-sm font-medium">{new Date(serviceOrder.date).toLocaleDateString()}</p>
                      )}
                    </div>

                    <div className="space-y-2 col-span-2">
                      <Label className="text-xs text-muted-foreground">Cliente</Label>
                      {isEditMode ? (
                        <PickerDialog<ClientItem>
                          items={clientItems}
                          totalPages={clientsData?.totalPages || 1}
                          currentPage={clientPage}
                          onPageChange={setClientPage}
                          isLoading={clientsLoading}
                          searchValue={clientSearch}
                          onSearchChange={handleClientSearchChange}
                          searchPlaceholder="Buscar clientes..."
                          selectedId={formData.clientId}
                          onSelect={(client) => setFormData({ ...formData, clientId: client.id })}
                          triggerPlaceholder="Seleccionar cliente"
                          emptyMessage="No se encontraron clientes"
                          disabled={clientsLoading}
                          renderItem={(client) => (
                            <div className="flex flex-col gap-1">
                              <span className="font-medium">{client.name}</span>
                              <span className="text-xs text-muted-foreground">
                                RUC: {client.ruc} • {client.email}
                              </span>
                            </div>
                          )}
                        />
                      ) : (
                        <p className="text-sm font-medium">{serviceOrder.client.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Moneda</Label>
                      {isEditMode ? (
                        <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PEN">PEN</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-sm font-medium">{serviceOrder.currency}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Gestor</Label>
                      {isEditMode ? (
                        <PickerDialog<UserItem>
                          items={userItems}
                          totalPages={(usersData?.pagination?.totalPages ?? 1)}
                          currentPage={userPage}
                          onPageChange={setUserPage}
                          isLoading={usersLoading}
                          searchValue={userSearch}
                          onSearchChange={handleUserSearchChange}
                          searchPlaceholder="Buscar usuarios..."
                          selectedId={formData.gestorId}
                          onSelect={(user) => setFormData({ ...formData, gestorId: user.id })}
                          triggerPlaceholder="Seleccionar gestor"
                          emptyMessage="No se encontraron usuarios"
                          disabled={usersLoading}
                          renderItem={(user) => (
                            <div className="flex flex-col gap-1">
                              <span className="font-medium">{user.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {user.email}
                              </span>
                            </div>
                          )}
                        />
                      ) : (
                        <p className="text-sm font-medium">{serviceOrder.gestor.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Términos de Pago</Label>
                      {isEditMode ? (
                        <Input
                          value={formData.paymentTerms}
                          onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                        />
                      ) : (
                        <p className="text-sm font-medium">{serviceOrder.paymentTerms || "-"}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Encargado</Label>
                      {isEditMode ? (
                        <Input
                          value={formData.attendantName}
                          onChange={(e) => setFormData({ ...formData, attendantName: e.target.value })}
                        />
                      ) : (
                        <p className="text-sm font-medium">{serviceOrder.attendantName || "-"}</p>
                      )}
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label className="text-xs text-muted-foreground">Descripción</Label>
                      {isEditMode ? (
                        <Textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={2}
                        />
                      ) : (
                        <p className="text-sm font-medium">{serviceOrder.description || "-"}</p>
                      )}
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label className="text-xs text-muted-foreground">Comentarios</Label>
                      {isEditMode ? (
                        <Textarea
                          value={formData.comments}
                          onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                          rows={2}
                        />
                      ) : (
                        <p className="text-sm font-medium">{serviceOrder.comments || "-"}</p>
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
                        Cancelar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </form>

            {/* Services Section */}
                  {isEditMode && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Agregar Servicios</CardTitle>
                </CardHeader>
                <CardContent className="pt-3 space-y-4">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="h-9">
                      <TabsTrigger value="new" className="text-sm">Agregar Nuevo Item</TabsTrigger>
                      <TabsTrigger value="templates" className="text-sm">Templates Disponibles</TabsTrigger>
                    </TabsList>

                    {/* Tab: Agregar Nuevo Item */}
                    <TabsContent value="new" className="space-y-2 mt-3">
                      <div className="space-y-2 p-3 border border-border rounded-lg bg-muted/20">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-xs">Código *</Label>
                            <Input
                              value={newItemForm.code}
                              onChange={(e) => setNewItemForm({ ...newItemForm, code: e.target.value })}
                              placeholder="SERV-001"
                              className="h-8 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Nombre *</Label>
                            <Input
                              value={newItemForm.name}
                              onChange={(e) => setNewItemForm({ ...newItemForm, name: e.target.value })}
                              placeholder="Monitoreo ambiental"
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Descripción *</Label>
                          <Textarea
                            value={newItemForm.description}
                            onChange={(e) => setNewItemForm({ ...newItemForm, description: e.target.value })}
                            rows={2}
                            placeholder="Descripción del servicio..."
                            className="resize-none text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-1">
                            <Label className="text-xs">Cantidad *</Label>
                            <Input
                              type="number"
                              value={newItemForm.quantity}
                              onChange={(e) => setNewItemForm({ ...newItemForm, quantity: parseInt(e.target.value) || 1 })}
                              min="1"
                              className="h-8 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Días</Label>
                            <Input
                              type="number"
                              value={newItemForm.days ?? 1}
                              onChange={(e) => setNewItemForm({ ...newItemForm, days: parseInt(e.target.value) || 1 })}
                              min="1"
                              className="h-8 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Precio Unit. *</Label>
                            <Input
                              type="number"
                              value={newItemForm.unitPrice}
                              onChange={(e) => setNewItemForm({ ...newItemForm, unitPrice: parseFloat(e.target.value) || 0 })}
                              min="0"
                              step="0.01"
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="saveAsTemplate"
                            checked={newItemForm.saveAsTemplate}
                            onCheckedChange={(checked) => setNewItemForm({ ...newItemForm, saveAsTemplate: !!checked })}
                          />
                          <Label htmlFor="saveAsTemplate" className="text-xs cursor-pointer">
                            Guardar como template para uso futuro
                          </Label>
                        </div>
                        <Button type="button" onClick={handleAddItem} className="w-full h-8 text-sm">
                          <Plus className="h-3.5 w-3.5 mr-2" />
                      Agregar Item
                    </Button>
                </div>
                    </TabsContent>

                    {/* Tab: Templates Disponibles */}
                    <TabsContent value="templates" className="space-y-2 mt-3">
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
                          <Input
                            placeholder="Buscar templates..."
                            value={templateSearch}
                            onChange={(e) => setTemplateSearch(e.target.value)}
                            className="pl-8 h-8 text-sm"
                          />
                        </div>
                          <Button
                            type="button"
                          variant="default"
                            size="sm"
                          onClick={() => setIsCreatingTemplate(!isCreatingTemplate)}
                          className="h-8"
                          >
                          <Plus className="h-3.5 w-3.5 mr-1" />
                          {isCreatingTemplate ? "Cancelar" : "Crear Template"}
                          </Button>
                        </div>

                      {/* Formulario para crear nuevo template */}
                      {isCreatingTemplate && (
                        <div className="space-y-2 p-3 border border-border rounded-lg bg-muted/20">
                          <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                              <Label className="text-xs">Código *</Label>
                            <Input
                                value={newTemplateForm.code}
                                onChange={(e) => setNewTemplateForm({ ...newTemplateForm, code: e.target.value })}
                                placeholder="SERV-001"
                              className="h-8 text-sm"
                            />
                        </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Nombre *</Label>
                            <Input
                                value={newTemplateForm.name}
                                onChange={(e) => setNewTemplateForm({ ...newTemplateForm, name: e.target.value })}
                                placeholder="Monitoreo ambiental"
                              className="h-8 text-sm"
                            />
                        </div>
                      </div>
                      <div className="space-y-1">
                            <Label className="text-xs">Descripción *</Label>
                          <Textarea
                              value={newTemplateForm.description}
                              onChange={(e) => setNewTemplateForm({ ...newTemplateForm, description: e.target.value })}
                            rows={2}
                              placeholder="Descripción del servicio..."
                              className="resize-none text-sm"
                          />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                              <Label className="text-xs">Cantidad *</Label>
                            <Input
                              type="number"
                                value={newTemplateForm.quantity}
                                onChange={(e) => setNewTemplateForm({ ...newTemplateForm, quantity: parseInt(e.target.value) || 1 })}
                              min="1"
                              className="h-8 text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Días</Label>
                            <Input
                              type="number"
                                value={newTemplateForm.days ?? 1}
                                onChange={(e) => setNewTemplateForm({ ...newTemplateForm, days: parseInt(e.target.value) || 1 })}
                              min="1"
                              className="h-8 text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                              <Label className="text-xs">Precio Unit. *</Label>
                            <Input
                              type="number"
                                value={newTemplateForm.unitPrice}
                                onChange={(e) => setNewTemplateForm({ ...newTemplateForm, unitPrice: parseFloat(e.target.value) || 0 })}
                              min="0"
                              step="0.01"
                              className="h-8 text-sm"
                            />
                            </div>
                          </div>
                          <Button
                            type="button"
                            onClick={handleCreateTemplate}
                            disabled={createTemplateMutation.isPending}
                            className="w-full h-8 text-sm"
                          >
                            {createTemplateMutation.isPending ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                                Creando...
                              </>
                            ) : (
                              <>
                                <Save className="h-3.5 w-3.5 mr-2" />
                                Crear Template
                              </>
                            )}
                          </Button>
                        </div>
                      )}

                      {templatesData?.items && templatesData.items.length > 0 ? (
                        <div className="border border-border rounded-lg divide-y divide-border max-h-[250px] overflow-y-auto">
                          {templatesData.items.map((template) => (
                            <div key={template.id} className="hover:bg-muted/30 transition-colors">
                              <div
                                className="p-2.5 cursor-pointer flex items-center justify-between"
                                onClick={() => setExpandedTemplate(expandedTemplate === template.id ? null : template.id)}
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm truncate">
                                    {template.code} - {template.name}
                      </div>
                                  <div className="text-xs text-muted-foreground flex gap-2">
                                    <span>Cant: {template.quantity}</span>
                                    {template.days && <span>Días: {template.days}</span>}
                                    <span>S/ {template.unitPrice.toFixed(2)}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddFromTemplate(template);
                                    }}
                                    className="h-6 text-xs"
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Agregar
                                  </Button>
                                  {expandedTemplate === template.id ? (
                                    <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                                  )}
                                </div>
                              </div>
                              {expandedTemplate === template.id && (
                                <div className="px-2.5 pb-2.5">
                                  {editingTemplate?.id === template.id ? (
                                    // Edit Mode
                                    <div className="space-y-2 pt-2 border-t">
                                      <div className="grid grid-cols-2 gap-2">
                                        <Input
                                          value={editingTemplate.code}
                                          onChange={(e) => setEditingTemplate({ ...editingTemplate, code: e.target.value })}
                                          placeholder="Código"
                                          className="h-7 text-xs"
                                        />
                                        <Input
                                          value={editingTemplate.name}
                                          onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                                          placeholder="Nombre"
                                          className="h-7 text-xs"
                                        />
                                      </div>
                                      <Textarea
                                        value={editingTemplate.description}
                                        onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                                        rows={2}
                                        className="text-xs resize-none"
                                      />
                                      <div className="grid grid-cols-3 gap-2">
                                        <Input
                                          type="number"
                                          value={editingTemplate.quantity}
                                          onChange={(e) => setEditingTemplate({ ...editingTemplate, quantity: parseInt(e.target.value) || 1 })}
                                          className="h-7 text-xs"
                                        />
                                        <Input
                                          type="number"
                                          value={editingTemplate.days ?? 1}
                                          onChange={(e) => setEditingTemplate({ ...editingTemplate, days: parseInt(e.target.value) || 1 })}
                                          className="h-7 text-xs"
                                        />
                                        <Input
                                          type="number"
                                          value={editingTemplate.unitPrice}
                                          onChange={(e) => setEditingTemplate({ ...editingTemplate, unitPrice: parseFloat(e.target.value) || 0 })}
                                          step="0.01"
                                          className="h-7 text-xs"
                                        />
                                      </div>
                                      <div className="flex gap-2">
                                        <Button
                                          type="button"
                                          size="sm"
                                          onClick={handleUpdateTemplate}
                                          disabled={updateTemplateMutation.isPending}
                                          className="h-6 text-xs flex-1"
                                        >
                                          <Check className="h-3 w-3 mr-1" />
                                          Guardar
                                        </Button>
                                        <Button
                                          type="button"
                                          size="sm"
                                          variant="outline"
                                          onClick={() => setEditingTemplate(null)}
                                          className="h-6 text-xs"
                                        >
                                          Cancelar
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    // View Mode
                                    <div className="pt-2 space-y-1.5">
                                      <div className="text-xs">
                                        <span className="font-medium">Descripción:</span>
                                        <p className="mt-0.5 text-muted-foreground">{template.description}</p>
                                      </div>
                                      <div className="flex gap-2">
                                        <Button
                                          type="button"
                                          size="sm"
                                          variant="outline"
                                          onClick={() => setEditingTemplate(template)}
                                          className="h-6 text-xs"
                                        >
                                          <Edit className="h-3 w-3 mr-1" />
                                          Editar
                                        </Button>
                                        <Button
                                          type="button"
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleDeleteTemplate(template.id)}
                                          disabled={deleteTemplateMutation.isPending}
                                          className="h-6 text-xs text-red-600 hover:text-red-700"
                                        >
                                          <Trash2 className="h-3 w-3 mr-1" />
                                          Eliminar
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-sm text-muted-foreground border border-border rounded-lg">
                          No hay templates disponibles
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}

            {/* Resumen del Pedido */}
            <Card className="border-2 border-primary/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="pt-3">
                {formData.items.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No hay items en la orden</p>
                    {isEditMode && <p className="text-xs mt-1">Agrega items para ver el resumen</p>}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Items de la Orden */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-primary">Items Agregados ({formData.items.length})</h3>
                      </div>
                      <div className="border border-border rounded-lg divide-y divide-border max-h-[300px] overflow-y-auto">
                        {formData.items.map((item) => (
                          <div key={item.id} className="p-2.5 flex items-start gap-2.5 hover:bg-muted/30">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-0.5">
                                <div className="font-medium text-sm truncate">
                                  {item.code} - {item.name}
                                  {item.saveAsTemplate && (
                                    <span className="ml-2 text-xs text-blue-600 font-normal">(Se guardará como template)</span>
                                  )}
                                </div>
                                {isEditMode && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveItem(item.id!)}
                                    className="h-6 w-6 p-0 shrink-0 text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-1 mb-1">
                                {item.description}
                              </p>
                              <div className="flex gap-3 text-xs text-muted-foreground">
                                <span>Cant: {item.quantity}</span>
                                <span>Días: {item.days ?? 0}</span>
                          <span>
                                  {formData.currency === "PEN" ? "S/" : "$"} {item.unitPrice.toFixed(2)}
                                </span>
                                <span className="font-medium">
                                  Total: {formData.currency === "PEN" ? "S/" : "$"}{" "}
                                  {(item.quantity * (item.days ?? 0) * item.unitPrice).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                      </div>
                </div>

                {/* Totals */}
                    <div className="space-y-2 pt-2 border-t-2 border-border">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span className="font-medium">
                          {formData.currency === "PEN" ? "S/" : "$"} {calculateSubtotal().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>IGV (18%):</span>
                    <span className="font-medium">
                          {formData.currency === "PEN" ? "S/" : "$"} {calculateIGV().toFixed(2)}
                    </span>
                  </div>
                      <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                    <span>Total:</span>
                        <span className="text-primary">
                          {formData.currency === "PEN" ? "S/" : "$"} {calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - 1/3 */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Resumen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Estado</span>
                    <Badge variant="outline" className={statusBadge.className}>
                      {statusBadge.label}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Items</span>
                    <span className="font-bold">{serviceOrder.items?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-bold">
                      {serviceOrder.currency} {serviceOrder.total?.toLocaleString()}
                    </span>
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
                    <p className="font-medium">{new Date(serviceOrder.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Actualizado</p>
                    <p className="font-medium">{new Date(serviceOrder.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Cliente</p>
                    <p className="font-medium">{serviceOrder.client.name}</p>
                    <p className="text-xs text-muted-foreground">RUC: {serviceOrder.client.ruc}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Gestor</p>
                    <p className="font-medium">{serviceOrder.gestor.name}</p>
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
