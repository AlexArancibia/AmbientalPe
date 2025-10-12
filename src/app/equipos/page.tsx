"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Wrench, Search, Plus, CheckCircle2, AlertCircle, Loader2, Edit, Eye, Trash2, X, Save, Calendar, FileDown } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";
import { DataTable, type Column } from "@/components/ui/data-table";
import { useDebounce } from "@/hooks/useDebounce";

type Equipment = {
  id: string;
  name: string;
  type: string;
  code: string;
  description: string;
  status: string;
  isCalibrated: boolean | null;
  calibrationDate: string | null;
  serialNumber: string | null;
  observations: string | null;
  createdAt: string;
  updatedAt: string;
};

type DialogMode = "create" | "view" | "edit" | null;

export default function EquiposPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState<string | null>(null);
  
  // Dialog states
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    code: "",
    description: "",
    status: "AVAILABLE",
    isCalibrated: false,
    calibrationDate: "",
    serialNumber: "",
    observations: "",
  });

  // Obtener datos del backend usando tRPC
  const { data, isLoading, refetch } = trpc.equipment.getAll.useQuery({
    page: currentPage,
    limit: 15,
    search: debouncedSearch || undefined,
    status: statusFilter === "ALL" ? undefined : statusFilter,
  });

  // Create mutation
  const createMutation = trpc.equipment.create.useMutation({
    onSuccess: () => {
      refetch();
      closeDialog();
    },
  });

  // Update mutation
  const updateMutation = trpc.equipment.update.useMutation({
    onSuccess: () => {
      refetch();
      closeDialog();
    },
  });

  // Delete mutation
  const deleteMutation = trpc.equipment.delete.useMutation({
    onSuccess: () => {
      refetch();
      setDeleteDialogOpen(false);
      setEquipmentToDelete(null);
    },
  });

  const equipos: Equipment[] = data?.equipment || [];
  const totalPages = data?.totalPages || 1;

  const resetForm = () => {
    setFormData({
      name: "",
      type: "",
      code: "",
      description: "",
      status: "AVAILABLE",
      isCalibrated: false,
      calibrationDate: "",
      serialNumber: "",
      observations: "",
    });
  };

  const closeDialog = () => {
    setDialogMode(null);
    setSelectedEquipment(null);
    resetForm();
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogMode("create");
  };

  const openViewDialog = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setFormData({
      name: equipment.name,
      type: equipment.type,
      code: equipment.code,
      description: equipment.description,
      status: equipment.status,
      isCalibrated: equipment.isCalibrated || false,
      calibrationDate: equipment.calibrationDate || "",
      serialNumber: equipment.serialNumber || "",
      observations: equipment.observations || "",
    });
    setDialogMode("view");
  };

  const openEditDialog = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setFormData({
      name: equipment.name,
      type: equipment.type,
      code: equipment.code,
      description: equipment.description,
      status: equipment.status,
      isCalibrated: equipment.isCalibrated || false,
      calibrationDate: equipment.calibrationDate || "",
      serialNumber: equipment.serialNumber || "",
      observations: equipment.observations || "",
    });
    setDialogMode("edit");
  };

  const switchToEditMode = () => {
    setDialogMode("edit");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { calibrationDate, serialNumber, observations, ...restData } = formData;
    
    const submitData = {
      ...restData,
      calibrationDate: calibrationDate ? new Date(calibrationDate) : undefined,
      serialNumber: serialNumber || undefined,
      observations: observations || undefined,
    };

    if (dialogMode === "create") {
      await createMutation.mutateAsync(submitData);
    } else if (dialogMode === "edit" && selectedEquipment) {
      await updateMutation.mutateAsync({
        id: selectedEquipment.id,
        ...submitData,
      });
    }
  };

  const handleDeleteEquipment = async () => {
    if (equipmentToDelete) {
      await deleteMutation.mutateAsync({ id: equipmentToDelete });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      AVAILABLE: { label: "Disponible", className: "bg-green-50 text-green-700 border-green-200" },
      IN_USE: { label: "En Uso", className: "bg-blue-50 text-blue-700 border-blue-200" },
      MAINTENANCE: { label: "Mantenimiento", className: "bg-orange-50 text-orange-700 border-orange-200" },
      CALIBRATION: { label: "Calibración", className: "bg-purple-50 text-purple-700 border-purple-200" },
      OUT_OF_SERVICE: { label: "Fuera de Servicio", className: "bg-red-50 text-red-700 border-red-200" },
    };

    return variants[status as keyof typeof variants] || variants.AVAILABLE;
  };

  const columns: Column<Equipment>[] = [
    {
      header: "Equipo",
      cell: (equipment) => (
        <div className="min-w-[200px]">
          <div className="font-medium">{equipment.name}</div>
          <div className="text-sm text-muted-foreground">Código: {equipment.code}</div>
        </div>
      ),
    },
    {
      header: "Tipo",
      cell: (equipment) => (
        <div className="min-w-[150px]">{equipment.type}</div>
      ),
    },
    {
      header: "Serie",
      cell: (equipment) => (
        <div className="min-w-[150px] font-mono text-sm">
          {equipment.serialNumber || "-"}
        </div>
      ),
    },
    {
      header: "Calibración",
      cell: (equipment) => (
        <div className="min-w-[120px]">
          {equipment.isCalibrated ? (
            <div className="flex items-center text-green-600">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              <span className="text-xs">
                {equipment.calibrationDate
                  ? new Date(equipment.calibrationDate).toLocaleDateString()
                  : "Calibrado"}
              </span>
            </div>
          ) : (
            <div className="flex items-center text-red-600">
              <AlertCircle className="h-4 w-4 mr-1" />
              <span className="text-xs">Vencida</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Estado",
      cell: (equipment) => {
        const statusBadge = getStatusBadge(equipment.status);
        return (
          <Badge variant="outline" className={statusBadge.className}>
            {statusBadge.label}
          </Badge>
        );
      },
    },
    {
      header: "",
      cell: (equipment) => (
        <div className="flex justify-end items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => openViewDialog(equipment)}
            className="h-8 w-8"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => openEditDialog(equipment)}
            className="h-8 w-8"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setEquipmentToDelete(equipment.id);
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

  const stats = {
    total: data?.total || 0,
    available: equipos.filter((e) => e.status === "AVAILABLE").length,
    inUse: equipos.filter((e) => e.status === "IN_USE").length,
    maintenance: equipos.filter((e) => e.status === "MAINTENANCE").length,
  };

  const isDialogOpen = dialogMode !== null;
  const isViewMode = dialogMode === "view";
  const isEditMode = dialogMode === "edit";
  const isCreateMode = dialogMode === "create";

  return (
    <div className="bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Wrench className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Equipos</h1>
              <p className="text-muted-foreground">
                Gestiona tu equipamiento de monitoreo
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              onClick={async () => {
                try {
                  toast.info("Generando PDF...");
                  const params = new URLSearchParams();
                  if (debouncedSearch) params.append('search', debouncedSearch);
                  if (statusFilter && statusFilter !== 'ALL') params.append('status', statusFilter);
                  
                  const response = await fetch(`/api/pdf/equipment?${params.toString()}`);
                  if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
                    throw new Error(errorData.error || 'Error al generar el PDF');
                  }
                  
                  const blob = await response.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Inventario-Equipos-${new Date().toISOString().split('T')[0]}.pdf`;
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
              Exportar Inventario PDF
            </Button>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Equipo
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, código o tipo..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={statusFilter === "ALL" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setStatusFilter("ALL");
                setCurrentPage(1);
              }}
            >
              Todos
            </Button>
            <Button
              variant={statusFilter === "AVAILABLE" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setStatusFilter("AVAILABLE");
                setCurrentPage(1);
              }}
            >
              Disponibles
            </Button>
            <Button
              variant={statusFilter === "IN_USE" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setStatusFilter("IN_USE");
                setCurrentPage(1);
              }}
            >
              En Uso
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Equipos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Disponibles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.available}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                En Uso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.inUse}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Mantenimiento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.maintenance}</div>
            </CardContent>
          </Card>
        </div>

        {/* Equipos Table */}
        <DataTable
          data={equipos}
          columns={columns}
          pageSize={15}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          totalPages={totalPages}
          isLoading={isLoading}
          emptyMessage="No se encontraron equipos"
          emptyDescription="Intenta con otro término de búsqueda o agrega un nuevo equipo"
          emptyIcon={<Wrench className="h-12 w-12 text-muted-foreground" />}
        />

        {/* Equipment Dialog (Create/View/Edit) */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => !open && closeDialog()}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle>
                    {isCreateMode && "Nuevo Equipo"}
                    {isViewMode && "Detalles del Equipo"}
                    {isEditMode && "Editar Equipo"}
                  </DialogTitle>
                  <DialogDescription>
                    {isCreateMode && "Registra un nuevo equipo en el sistema"}
                    {isViewMode && "Información completa del equipo"}
                    {isEditMode && "Actualiza la información del equipo"}
                  </DialogDescription>
                </div>
                {isViewMode && (
                  <Button onClick={switchToEditMode} size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                )}
              </div>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Nombre del Equipo <span className="text-red-500">*</span>
                  </Label>
                  {isViewMode ? (
                    <p className="text-sm py-2">{formData.name}</p>
                  ) : (
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="Ej: Muestreador de Aire"
                    />
                  )}
                </div>

                {/* Type */}
                <div className="space-y-2">
                  <Label htmlFor="type">
                    Tipo <span className="text-red-500">*</span>
                  </Label>
                  {isViewMode ? (
                    <p className="text-sm py-2">{formData.type}</p>
                  ) : (
                    <Input
                      id="type"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      required
                      placeholder="Ej: Muestreador"
                    />
                  )}
                </div>

                {/* Code */}
                <div className="space-y-2">
                  <Label htmlFor="code">
                    Código <span className="text-red-500">*</span>
                  </Label>
                  {isViewMode ? (
                    <p className="text-sm py-2 font-mono">{formData.code}</p>
                  ) : (
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      required
                      placeholder="Ej: EQ-001"
                    />
                  )}
                </div>

                {/* Serial Number */}
                <div className="space-y-2">
                  <Label htmlFor="serialNumber">Número de Serie</Label>
                  {isViewMode ? (
                    <p className="text-sm py-2 font-mono">{formData.serialNumber || "-"}</p>
                  ) : (
                    <Input
                      id="serialNumber"
                      value={formData.serialNumber}
                      onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                      placeholder="Ej: SN-123456"
                    />
                  )}
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">
                    Estado <span className="text-red-500">*</span>
                  </Label>
                  {isViewMode ? (
                    <Badge variant="outline" className={getStatusBadge(formData.status).className}>
                      {getStatusBadge(formData.status).label}
                    </Badge>
                  ) : (
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AVAILABLE">Disponible</SelectItem>
                        <SelectItem value="IN_USE">En Uso</SelectItem>
                        <SelectItem value="MAINTENANCE">Mantenimiento</SelectItem>
                        <SelectItem value="CALIBRATION">Calibración</SelectItem>
                        <SelectItem value="OUT_OF_SERVICE">Fuera de Servicio</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Is Calibrated */}
                <div className="space-y-2">
                  <Label htmlFor="isCalibrated">Calibración</Label>
                  {isViewMode ? (
                    <div className="py-2">
                      {formData.isCalibrated ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Calibrado
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          No Calibrado
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <Select
                      value={formData.isCalibrated ? "true" : "false"}
                      onValueChange={(value) => setFormData({ ...formData, isCalibrated: value === "true" })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Calibrado</SelectItem>
                        <SelectItem value="false">No Calibrado</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Calibration Date */}
                {formData.isCalibrated && (
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="calibrationDate">Fecha de Calibración</Label>
                    {isViewMode ? (
                      <p className="text-sm py-2">
                        {formData.calibrationDate ? new Date(formData.calibrationDate).toLocaleDateString() : "-"}
                      </p>
                    ) : (
                      <Input
                        id="calibrationDate"
                        type="date"
                        value={formData.calibrationDate}
                        onChange={(e) => setFormData({ ...formData, calibrationDate: e.target.value })}
                      />
                    )}
                  </div>
                )}

                {/* Description */}
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="description">
                    Descripción <span className="text-red-500">*</span>
                  </Label>
                  {isViewMode ? (
                    <p className="text-sm py-2">{formData.description}</p>
                  ) : (
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                      rows={3}
                      placeholder="Descripción del equipo..."
                    />
                  )}
                </div>

                {/* Observations */}
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="observations">Observaciones</Label>
                  {isViewMode ? (
                    <p className="text-sm py-2">{formData.observations || "-"}</p>
                  ) : (
                    <Textarea
                      id="observations"
                      value={formData.observations}
                      onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                      rows={3}
                      placeholder="Observaciones adicionales..."
                    />
                  )}
                </div>
              </div>

              {/* Metadata (only in view mode) */}
              {isViewMode && selectedEquipment && (
                <div className="pt-4 border-t space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Fecha de creación:</span>
                    </span>
                    <span className="font-medium">
                      {new Date(selectedEquipment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Última actualización:</span>
                    </span>
                    <span className="font-medium">
                      {new Date(selectedEquipment.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Actions */}
              {!isViewMode && (
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeDialog}
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {(createMutation.isPending || updateMutation.isPending) ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {isCreateMode ? "Creando..." : "Guardando..."}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {isCreateMode ? "Crear Equipo" : "Guardar Cambios"}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. El equipo será eliminado permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteEquipment}
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
