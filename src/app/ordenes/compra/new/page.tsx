"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingCart, ArrowLeft, Save, Loader2, Search, Trash2, Edit, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/navigation";
import { CompanyType } from "@prisma/client";
import { PickerDialog } from "@/components/ui/picker-dialog";
import type { PickerItem } from "@/components/ui/picker";
import { toast } from "sonner";

type Template = {
  id: string;
  code: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

type PurchaseOrderItem = {
  id: string; // Temporary ID for UI
  code: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  saveAsTemplate: boolean;
};

interface ProviderItem extends PickerItem {
  id: string;
  label: string;
  name: string;
  ruc: string;
  email: string;
}

export default function NewPurchaseOrderPage() {
  const router = useRouter();

  // Provider picker state
  const [providerSearch, setProviderSearch] = useState("");
  const [providerPage, setProviderPage] = useState(1);

  // Get providers with pagination
  const { data: providersData, isLoading: providersLoading } = trpc.client.getAll.useQuery({
    page: providerPage,
    limit: 20,
    search: providerSearch,
    type: CompanyType.PROVIDER,
  });

  // Get users for gestor dropdown
  const { data: usersData } = trpc.user.getAll.useQuery({
    page: 1,
    limit: 1000,
  });

  // Get existing templates
  const [templateSearch, setTemplateSearch] = useState("");
  const [templatePage, setTemplatePage] = useState(1);
  const { data: templatesData, refetch: refetchTemplates } = trpc.purchaseOrderItemTemplate.getAll.useQuery({
    page: templatePage,
    limit: 100,
    search: templateSearch,
  });

  // Get next purchase order number
  const { data: nextNumberData } = trpc.purchaseOrder.getNextNumber.useQuery();

  // Create purchase order mutation
  const createMutation = trpc.purchaseOrder.create.useMutation({
    onSuccess: (data) => {
      router.push(`/ordenes/compra/${data?.id}`);
    },
    onError: (error) => {
      toast.error("Error al crear la orden", {
        description: error.message,
      });
    },
  });

  // Template mutations
  const createTemplateMutation = trpc.purchaseOrderItemTemplate.create.useMutation({
    onSuccess: () => {
      refetchTemplates();
    },
  });

  const updateTemplateMutation = trpc.purchaseOrderItemTemplate.update.useMutation({
    onSuccess: () => {
      refetchTemplates();
      setEditingTemplate(null);
      toast.success("Template actualizado correctamente");
    },
  });

  const deleteTemplateMutation = trpc.purchaseOrderItemTemplate.delete.useMutation({
    onSuccess: () => {
      refetchTemplates();
      toast.success("Template eliminado correctamente");
    },
  });

  // Form state
  const [formData, setFormData] = useState({
    number: "",
    date: new Date(),
    clientId: "", // Actually providerId
    currency: "PEN",
    status: "PENDING",
    description: "",
    paymentTerms: "",
    gestorId: "",
    attendantName: "",
    comments: "",
  });

  // Items of the order
  const [orderItems, setOrderItems] = useState<PurchaseOrderItem[]>([]);

  // Auto-fill purchase order number when it's fetched
  useEffect(() => {
    if (nextNumberData?.nextNumber && !formData.number) {
      setFormData((prev) => ({ ...prev, number: nextNumberData.nextNumber }));
    }
  }, [nextNumberData]);

  // New item form state
  const [newItemForm, setNewItemForm] = useState<Omit<PurchaseOrderItem, "id">>({
    code: "",
    name: "",
    description: "",
    quantity: 1,
    unitPrice: 0,
    saveAsTemplate: false,
  });

  // Editing template state
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("new");
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [newTemplateForm, setNewTemplateForm] = useState<Omit<Template, "id">>({
    code: "",
    name: "",
    description: "",
    quantity: 1,
    unitPrice: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (orderItems.length === 0) {
      toast.error("Debe agregar al menos un item");
      return;
    }

    try {
      // Create items from order items
      const items = orderItems.map(item => ({
        code: item.code,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }));

      // Create the purchase order
      await createMutation.mutateAsync({
        ...formData,
        items,
      });

      // Create templates for items marked to save as template
      const itemsToSaveAsTemplates = orderItems.filter(item => item.saveAsTemplate);
      
      for (const item of itemsToSaveAsTemplates) {
        try {
          await createTemplateMutation.mutateAsync({
            code: item.code,
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          });
        } catch (error) {
          // Continue even if template creation fails (might be duplicate code)
          console.error("Error creating template:", error);
        }
      }
    } catch (error) {
      console.error("Error creating purchase order:", error);
    }
  };

  const handleAddItem = () => {
    if (!newItemForm.code || !newItemForm.name || !newItemForm.description) {
      toast.error("Por favor complete todos los campos requeridos");
      return;
    }

    const newItem: PurchaseOrderItem = {
      id: `temp-${Date.now()}`,
      ...newItemForm,
    };

    setOrderItems([...orderItems, newItem]);
    
    // Reset form
    setNewItemForm({
      code: "",
      name: "",
      description: "",
      quantity: 1,
      unitPrice: 0,
      saveAsTemplate: false,
    });

    toast.success("Item agregado a la orden");
  };

  const handleAddFromTemplate = (template: Template) => {
    const newItem: PurchaseOrderItem = {
      id: `temp-${Date.now()}`,
      code: template.code,
      name: template.name,
      description: template.description,
      quantity: template.quantity,
      unitPrice: template.unitPrice,
      saveAsTemplate: false,
    };

    setOrderItems([...orderItems, newItem]);
    toast.success("Item agregado desde template");
  };

  const handleRemoveItem = (id: string) => {
    setOrderItems(orderItems.filter(item => item.id !== id));
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
      
      // Reset form and close
      setNewTemplateForm({
        code: "",
        name: "",
        description: "",
        quantity: 1,
        unitPrice: 0,
      });
      setIsCreatingTemplate(false);
      toast.success("Template creado exitosamente");
    } catch (error) {
      toast.error("Error al crear el template");
    }
  };

  const calculateSubtotal = () => {
    return orderItems.reduce(
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

  // Transform providers for picker
  const providerItems: ProviderItem[] = (providersData?.clients || []).map((provider) => ({
    id: provider.id,
    label: provider.name,
    name: provider.name,
    ruc: provider.ruc,
    email: provider.email,
  }));

  // Handle provider search and reset page
  const handleProviderSearchChange = (value: string) => {
    setProviderSearch(value);
    setProviderPage(1);
  };

  return (
    <div className="bg-background">
      <div className="container mx-auto p-4 space-y-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/ordenes")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="p-2 bg-green-500/10 rounded-lg">
            <ShoppingCart className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Nueva Orden de Compra</h1>
            <p className="text-sm text-muted-foreground">
              Crea una nueva orden de compra
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="number" className="text-sm">
                    Número <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="number"
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    required
                    placeholder="OC-2024-001"
                    className="h-9"
                    disabled={!nextNumberData}
                  />
                  {nextNumberData && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Número generado automáticamente. Puedes modificarlo si es necesario.
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="date" className="text-sm">
                    Fecha <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date.toISOString().split("T")[0]}
                    onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value) })}
                    required
                    className="h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="clientId" className="text-sm">
                    Proveedor <span className="text-red-500">*</span>
                  </Label>
                  <PickerDialog<ProviderItem>
                    items={providerItems}
                    totalPages={providersData?.totalPages || 1}
                    currentPage={providerPage}
                    onPageChange={setProviderPage}
                    isLoading={providersLoading}
                    searchValue={providerSearch}
                    onSearchChange={handleProviderSearchChange}
                    searchPlaceholder="Buscar proveedores..."
                    selectedId={formData.clientId}
                    onSelect={(provider) => setFormData({ ...formData, clientId: provider.id })}
                    triggerPlaceholder="Seleccionar proveedor"
                    emptyMessage="No se encontraron proveedores"
                    disabled={providersLoading}
                    renderItem={(provider) => (
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">{provider.name}</span>
                        <span className="text-xs text-muted-foreground">
                          RUC: {provider.ruc} • {provider.email}
                        </span>
                      </div>
                    )}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="currency" className="text-sm">
                    Moneda <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PEN">PEN</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="gestorId" className="text-sm">
                    Gestor <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.gestorId}
                    onValueChange={(value) => setFormData({ ...formData, gestorId: value })}
                    required
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Seleccionar gestor" />
                    </SelectTrigger>
                    <SelectContent>
                      {usersData?.data.map((user: any) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="status" className="text-sm">
                    Estado <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger className="h-9">
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
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="paymentTerms" className="text-sm">Términos de Pago</Label>
                  <Input
                    id="paymentTerms"
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                    placeholder="30 días"
                    className="h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="attendantName" className="text-sm">Nombre del Encargado</Label>
                  <Input
                    id="attendantName"
                    value={formData.attendantName}
                    onChange={(e) => setFormData({ ...formData, attendantName: e.target.value })}
                    placeholder="Nombre completo"
                    className="h-9"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-sm">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  placeholder="Descripción general de la orden..."
                  className="resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="comments" className="text-sm">Comentarios</Label>
                <Textarea
                  id="comments"
                  value={formData.comments}
                  onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                  rows={2}
                  placeholder="Comentarios adicionales..."
                  className="resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Items Section */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Items de la Orden</CardTitle>
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
                        onChange={(e) =>
                          setNewItemForm({ ...newItemForm, description: e.target.value })
                        }
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
                          onChange={(e) =>
                            setNewItemForm({
                              ...newItemForm,
                              quantity: parseInt(e.target.value) || 1,
                            })
                          }
                          min="1"
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Precio Unit. *</Label>
                        <Input
                          type="number"
                          value={newItemForm.unitPrice}
                          onChange={(e) =>
                            setNewItemForm({
                              ...newItemForm,
                              unitPrice: parseFloat(e.target.value) || 0,
                            })
                          }
                          min="0"
                          step="0.01"
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 pt-1">
                      <Checkbox
                        id="saveAsTemplate"
                        checked={newItemForm.saveAsTemplate}
                        onCheckedChange={(checked) =>
                          setNewItemForm({ ...newItemForm, saveAsTemplate: checked as boolean })
                        }
                      />
                      <label
                        htmlFor="saveAsTemplate"
                        className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Guardar como template para uso futuro
                      </label>
                    </div>
                    <Button
                      type="button"
                      onClick={handleAddItem}
                      className="w-full h-8 text-sm"
                    >
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
                        <div className="p-2.5">
                          <div className="flex items-start gap-2.5">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-0.5">
                                <div className="font-medium text-sm truncate">
                                  {template.code} - {template.name}
                                </div>
                                <div className="flex gap-1 shrink-0">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleAddFromTemplate(template)}
                                    className="h-6 px-2 text-xs"
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Agregar
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => setExpandedTemplate(
                                      expandedTemplate === template.id ? null : template.id
                                    )}
                                  >
                                    {expandedTemplate === template.id ? (
                                      <ChevronUp className="h-3.5 w-3.5" />
                                    ) : (
                                      <ChevronDown className="h-3.5 w-3.5" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {template.description}
                              </p>
                              <div className="flex gap-3 text-xs text-muted-foreground mt-0.5">
                                <span>Cant: {template.quantity}</span>
                                <span>
                                  {formData.currency === "PEN" ? "S/" : "$"} {template.unitPrice.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Expanded View */}
                        {expandedTemplate === template.id && (
                          <div className="px-2.5 pb-2.5 border-t border-border bg-muted/20">
                            {editingTemplate?.id === template.id ? (
                              // Edit Mode
                              <div className="space-y-2 pt-2">
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="space-y-1">
                                    <Label className="text-xs">Código</Label>
                                    <Input
                                      value={editingTemplate.code}
                                      onChange={(e) =>
                                        setEditingTemplate({ ...editingTemplate, code: e.target.value })
                                      }
                                      className="h-7 text-sm"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs">Nombre</Label>
                                    <Input
                                      value={editingTemplate.name}
                                      onChange={(e) =>
                                        setEditingTemplate({ ...editingTemplate, name: e.target.value })
                                      }
                                      className="h-7 text-sm"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Descripción</Label>
                                  <Textarea
                                    value={editingTemplate.description}
                                    onChange={(e) =>
                                      setEditingTemplate({
                                        ...editingTemplate,
                                        description: e.target.value,
                                      })
                                    }
                                    rows={2}
                                    className="text-sm resize-none"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="space-y-1">
                                    <Label className="text-xs">Cantidad</Label>
                                    <Input
                                      type="number"
                                      value={editingTemplate.quantity}
                                      onChange={(e) =>
                                        setEditingTemplate({
                                          ...editingTemplate,
                                          quantity: parseInt(e.target.value) || 0,
                                        })
                                      }
                                      className="h-7 text-sm"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs">Precio Unit.</Label>
                                    <Input
                                      type="number"
                                      value={editingTemplate.unitPrice}
                                      onChange={(e) =>
                                        setEditingTemplate({
                                          ...editingTemplate,
                                          unitPrice: parseFloat(e.target.value) || 0,
                                        })
                                      }
                                      step="0.01"
                                      className="h-7 text-sm"
                                    />
                                  </div>
                                </div>
                                <div className="flex gap-2 pt-1">
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={handleUpdateTemplate}
                                    disabled={updateTemplateMutation.isPending}
                                    className="h-7 text-xs"
                                  >
                                    {updateTemplateMutation.isPending ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      "Guardar"
                                    )}
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditingTemplate(null)}
                                    className="h-7 text-xs"
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

          {/* Resumen del Pedido */}
          <Card className="border-2 border-primary/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Resumen de la Orden</CardTitle>
            </CardHeader>
            <CardContent className="pt-3">
              {orderItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No hay items en la orden</p>
                  <p className="text-xs mt-1">Agrega items para ver el resumen</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Items de la Orden */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-primary">Items Agregados ({orderItems.length})</h3>
                    </div>
                    <div className="border border-border rounded-lg divide-y divide-border max-h-[300px] overflow-y-auto">
                      {orderItems.map((item) => (
                        <div key={item.id} className="p-2.5 flex items-start gap-2.5 hover:bg-muted/30">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <div className="font-medium text-sm truncate">
                                {item.code} - {item.name}
                                {item.saveAsTemplate && (
                                  <span className="ml-2 text-xs text-blue-600 font-normal">(Se guardará como template)</span>
                                )}
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveItem(item.id)}
                                className="h-6 w-6 p-0 shrink-0 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
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

          {/* Actions */}
          <div className="flex gap-2">
            <Button type="submit" disabled={createMutation.isPending || orderItems.length === 0} className="h-9">
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Crear Orden de Compra
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/ordenes")}
              disabled={createMutation.isPending}
              className="h-9"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
