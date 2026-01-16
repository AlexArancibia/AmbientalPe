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
import { ShoppingCart, ArrowLeft, Save, Loader2, Plus, Trash2, Edit, Eye, Search, ChevronDown, ChevronUp, Check, FileDown, Printer, X } from "lucide-react";
import { trpc } from "@/utils/trpc";
import { useRouter, useSearchParams } from "next/navigation";
import { CompanyType } from "@prisma/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

type PurchaseOrderItem = {
  id?: string;
  code: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  saveAsTemplate?: boolean;
};

type Template = {
  id: string;
  code: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

export default function PurchaseOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const unwrappedParams = React.use(params);
  const mode = searchParams.get("mode") || "view";
  const [isEditMode, setIsEditMode] = useState(mode === "edit");
  
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
    unitPrice: 0,
  });
  const [newItemForm, setNewItemForm] = useState<Omit<PurchaseOrderItem, "id">>({
    code: "",
    name: "",
    description: "",
    quantity: 1,
    unitPrice: 0,
    saveAsTemplate: false,
  });

  // Item editing states
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<PurchaseOrderItem | null>(null);

  // Get purchase order
  const { data: purchaseOrder, isLoading } = trpc.purchaseOrder.getById.useQuery({
    id: unwrappedParams.id,
  });

  // Get providers for dropdown
  const { data: providersData } = trpc.client.getAll.useQuery({
    page: 1,
    limit: 1000,
    type: CompanyType.PROVIDER,
  });

  // Get users for gestor dropdown
  const { data: usersData } = trpc.user.getAll.useQuery({
    page: 1,
    limit: 1000,
  });

  // Update mutation
  const updateMutation = trpc.purchaseOrder.update.useMutation({
    onSuccess: () => {
      setIsEditMode(false);
      router.refresh();
    },
  });

  // Get templates
  const { data: templatesData, refetch: refetchTemplates } = trpc.purchaseOrderItemTemplate.getAll.useQuery({
    page: templatePage,
    limit: 20,
    search: templateSearch,
  });

  // Template mutations
  const createTemplateMutation = trpc.purchaseOrderItemTemplate.create.useMutation({
    onSuccess: () => {
      refetchTemplates();
      toast.success("Template creado exitosamente");
    },
  });

  const updateTemplateMutation = trpc.purchaseOrderItemTemplate.update.useMutation({
    onSuccess: () => {
      refetchTemplates();
      setEditingTemplate(null);
      toast.success("Template actualizado exitosamente");
    },
  });

  const deleteTemplateMutation = trpc.purchaseOrderItemTemplate.delete.useMutation({
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
    items: [] as PurchaseOrderItem[],
  });

  // Initialize form data when purchase order is loaded
  useEffect(() => {
    if (purchaseOrder) {
      setFormData({
        number: purchaseOrder.number,
        date: new Date(purchaseOrder.date),
        clientId: purchaseOrder.clientId,
        description: purchaseOrder.description || "",
        currency: purchaseOrder.currency,
        paymentTerms: purchaseOrder.paymentTerms || "",
        gestorId: purchaseOrder.gestorId,
        attendantName: purchaseOrder.attendantName || "",
        comments: purchaseOrder.comments || "",
        status: purchaseOrder.status,
        items: purchaseOrder.items.map((item: any) => ({
          id: item.id,
          code: item.code,
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      });
    }
  }, [purchaseOrder]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateMutation.mutateAsync({
      id: unwrappedParams.id,
      ...formData,
    });
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
      unitPrice: 0,
      saveAsTemplate: false,
    });
    toast.success("Item agregado");
  };

  const handleAddFromTemplate = (template: Template) => {
    const newItem: PurchaseOrderItem = {
      id: `temp-${Date.now()}`,
      code: template.code,
      name: template.name,
      description: template.description,
      quantity: template.quantity,
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

  const handleEditItem = (itemId: string) => {
    const item = formData.items.find((item) => item.id === itemId);
    if (item) {
      setEditingItem({ ...item });
      setEditingItemId(itemId);
    }
  };

  const handleUpdateItem = () => {
    if (!editingItem || !editingItemId) return;

    if (!editingItem.code || !editingItem.name || !editingItem.description) {
      toast.error("Por favor complete todos los campos requeridos");
      return;
    }

    setFormData({
      ...formData,
      items: formData.items.map((item) =>
        item.id === editingItemId ? { ...editingItem } : item
      ),
    });

    setEditingItem(null);
    setEditingItemId(null);
    toast.success("Item actualizado");
  };

  const handleCancelEditItem = () => {
    setEditingItem(null);
    setEditingItemId(null);
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplate?.id) return;
    const { id, ...data } = editingTemplate;
    await updateTemplateMutation.mutateAsync({ id, ...data });
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
      await createTemplateMutation.mutateAsync(newTemplateForm);
      
      setNewTemplateForm({
        code: "",
        name: "",
        description: "",
        quantity: 1,
        unitPrice: 0,
      });
      setIsCreatingTemplate(false);
    } catch (error) {
      toast.error("Error al crear el template");
    }
  };

  const calculateSubtotal = () => {
    return formData.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
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

  if (isLoading) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!purchaseOrder) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Orden no encontrada</h2>
          <Button onClick={() => router.push("/ordenes")} className="mt-4">
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
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold tracking-tight">
                  {isEditMode ? "Editar" : "Ver"} Orden de Compra
                </h1>
                <Badge variant="outline" className={statusBadge.className}>
                  {statusBadge.label}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                {purchaseOrder.number}
              </p>
            </div>
          </div>
          {!isEditMode && (
            <div className="flex items-center space-x-2">
              <Button 
                onClick={async () => {
                  try {
                    toast.info("Generando PDF...");
                    const response = await fetch(`/api/pdf/purchase-order/${unwrappedParams.id}`);
                    if (!response.ok) {
                      const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
                      throw new Error(errorData.error || 'Error al descargar el PDF');
                    }
                    
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Orden-Compra-${purchaseOrder.number}.pdf`;
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
                    const response = await fetch(`/api/pdf/purchase-order/${unwrappedParams.id}`);
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
              <Button onClick={() => setIsEditMode(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </div>
          )}
        </div>

        {/* Form */}
        <form id="purchase-order-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Number */}
                <div className="space-y-2">
                  <Label htmlFor="number">
                    Número <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="number"
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    required
                    disabled={!isEditMode}
                  />
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <Label htmlFor="date">
                    Fecha <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date.toISOString().split("T")[0]}
                    onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value) })}
                    required
                    disabled={!isEditMode}
                  />
                </div>

                {/* Provider */}
                <div className="space-y-2">
                  <Label htmlFor="clientId">
                    Proveedor <span className="text-red-500">*</span>
                  </Label>
                  {isEditMode ? (
                    <Select
                      value={formData.clientId}
                      onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un proveedor" />
                      </SelectTrigger>
                      <SelectContent>
                        {providersData?.clients.map((provider: any) => (
                          <SelectItem key={provider.id} value={provider.id}>
                            {provider.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={purchaseOrder.client.name} disabled />
                  )}
                </div>

                {/* Currency */}
                <div className="space-y-2">
                  <Label htmlFor="currency">
                    Moneda <span className="text-red-500">*</span>
                  </Label>
                  {isEditMode ? (
                    <Select
                      value={formData.currency}
                      onValueChange={(value) => setFormData({ ...formData, currency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PEN">PEN (Soles)</SelectItem>
                        <SelectItem value="USD">USD (Dólares)</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={formData.currency} disabled />
                  )}
                </div>

                {/* Gestor */}
                <div className="space-y-2">
                  <Label htmlFor="gestorId">
                    Gestor <span className="text-red-500">*</span>
                  </Label>
                  {isEditMode ? (
                    <Select
                      value={formData.gestorId}
                      onValueChange={(value) => setFormData({ ...formData, gestorId: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un gestor" />
                      </SelectTrigger>
                      <SelectContent>
                        {usersData?.data.map((user: any) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={purchaseOrder.gestor.name} disabled />
                  )}
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">
                    Estado <span className="text-red-500">*</span>
                  </Label>
                  {isEditMode ? (
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pendiente</SelectItem>
                        <SelectItem value="APPROVED">Aprobada</SelectItem>
                        <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                        <SelectItem value="COMPLETED">Completada</SelectItem>
                        <SelectItem value="CANCELLED">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={statusBadge.label} disabled />
                  )}
                </div>

                {/* Payment Terms */}
                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Términos de Pago</Label>
                  <Input
                    id="paymentTerms"
                    value={formData.paymentTerms}
                    onChange={(e) =>
                      setFormData({ ...formData, paymentTerms: e.target.value })
                    }
                    disabled={!isEditMode}
                  />
                </div>

                {/* Attendant Name */}
                <div className="space-y-2">
                  <Label htmlFor="attendantName">Nombre del Encargado</Label>
                  <Input
                    id="attendantName"
                    value={formData.attendantName}
                    onChange={(e) =>
                      setFormData({ ...formData, attendantName: e.target.value })
                    }
                    disabled={!isEditMode}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  disabled={!isEditMode}
                />
              </div>

              {/* Comments */}
              <div className="space-y-2">
                <Label htmlFor="comments">Comentarios</Label>
                <Textarea
                  id="comments"
                  value={formData.comments}
                  onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                  rows={3}
                  disabled={!isEditMode}
                />
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          {/* Items Section */}
          {isEditMode && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Agregar Items</CardTitle>
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
                            placeholder="ITEM-001"
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Nombre *</Label>
                          <Input
                            value={newItemForm.name}
                            onChange={(e) => setNewItemForm({ ...newItemForm, name: e.target.value })}
                            placeholder="Nombre del item"
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
                          placeholder="Descripción del item..."
                          className="resize-none text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
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
                              placeholder="ITEM-001"
                              className="h-8 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Nombre *</Label>
                            <Input
                              value={newTemplateForm.name}
                              onChange={(e) => setNewTemplateForm({ ...newTemplateForm, name: e.target.value })}
                              placeholder="Nombre del item"
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
                            placeholder="Descripción del item..."
                            className="resize-none text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
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
                                    <div className="grid grid-cols-2 gap-2">
                                      <Input
                                        type="number"
                                        value={editingTemplate.quantity}
                                        onChange={(e) => setEditingTemplate({ ...editingTemplate, quantity: parseInt(e.target.value) || 1 })}
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

          {/* Resumen de la Orden */}
          <Card className="border-2 border-primary/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Resumen de la Orden</CardTitle>
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
                          {editingItemId === item.id && editingItem ? (
                            // Edit Mode
                            <div className="flex-1 space-y-2 pt-2">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <Label className="text-xs">Código *</Label>
                                  <Input
                                    value={editingItem.code}
                                    onChange={(e) => setEditingItem({ ...editingItem, code: e.target.value })}
                                    placeholder="ITEM-001"
                                    className="h-8 text-sm"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Nombre *</Label>
                                  <Input
                                    value={editingItem.name}
                                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                                    placeholder="Nombre del item"
                                    className="h-8 text-sm"
                                  />
                                </div>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Descripción *</Label>
                                <Textarea
                                  value={editingItem.description}
                                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                                  rows={2}
                                  placeholder="Descripción del item..."
                                  className="resize-none text-sm"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <Label className="text-xs">Cantidad *</Label>
                                  <Input
                                    type="number"
                                    value={editingItem.quantity}
                                    onChange={(e) => setEditingItem({ ...editingItem, quantity: parseInt(e.target.value) || 1 })}
                                    min="1"
                                    className="h-8 text-sm"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Precio Unit. *</Label>
                                  <Input
                                    type="number"
                                    value={editingItem.unitPrice}
                                    onChange={(e) => setEditingItem({ ...editingItem, unitPrice: parseFloat(e.target.value) || 0 })}
                                    min="0"
                                    step="0.01"
                                    className="h-8 text-sm"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={handleUpdateItem}
                                  className="h-6 text-xs flex-1"
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Guardar
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={handleCancelEditItem}
                                  className="h-6 text-xs"
                                >
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          ) : (
                            // View Mode
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-0.5">
                                <div className="font-medium text-sm truncate">
                                  {item.code} - {item.name}
                                  {item.saveAsTemplate && (
                                    <span className="ml-2 text-xs text-blue-600 font-normal">(Se guardará como template)</span>
                                  )}
                                </div>
                                {isEditMode && (
                                  <div className="flex items-center gap-1">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditItem(item.id!)}
                                      className="h-6 w-6 p-0 shrink-0 text-blue-600 hover:text-blue-700"
                                    >
                                      <Edit className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRemoveItem(item.id!)}
                                      className="h-6 w-6 p-0 shrink-0 text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-1 mb-1">
                                {item.description}
                              </p>
                              <div className="flex gap-3 text-xs text-muted-foreground">
                                <span>Cant: {item.quantity}</span>
                                <span>
                                  {formData.currency === "PEN" ? "S/" : "$"} {item.unitPrice.toFixed(2)}
                                </span>
                                <span className="font-medium">
                                  Total: {formData.currency === "PEN" ? "S/" : "$"}{" "}
                                  {(item.quantity * item.unitPrice).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          )}
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

        </form>

        {/* Sticky Actions Sidebar */}
        {isEditMode && (
          <div className="fixed right-6 top-24 z-50">
            <Card className="w-64 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  type="submit"
                  form="purchase-order-form"
                  className="w-full"
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
                      Guardar Cambios
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditMode(false)}
                  className="w-full"
                  disabled={updateMutation.isPending}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

