"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Save, Plus, Trash2, Check, Loader2, ArrowLeft } from "lucide-react";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function ConfiguracionEmpresaPage() {
  const { data: company, isLoading, refetch } = trpc.company.get.useQuery();
  const createCompany = trpc.company.create.useMutation();
  const updateCompany = trpc.company.update.useMutation();
  
  const createBankAccount = trpc.company.bankAccount.create.useMutation();
  const updateBankAccount = trpc.company.bankAccount.update.useMutation();
  const deleteBankAccount = trpc.company.bankAccount.delete.useMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [bankDialogOpen, setBankDialogOpen] = useState(false);
  const [editingBankAccount, setEditingBankAccount] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    ruc: "",
    address: "",
    email: "",
    phone: "",
    logo: "",
  });

  const createInitialBankFormData = () => ({
    bankName: "",
    accountNumber: "",
    accountType: "CORRIENTE",
    currency: "PEN",
    isDefault: false,
    isDetraction: false,
  });

  const [bankFormData, setBankFormData] = useState(createInitialBankFormData());

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name,
        ruc: company.ruc,
        address: company.address,
        email: company.email,
        phone: company.phone,
        logo: company.logo || "",
      });
    }
  }, [company]);

  const accountTypeLabels = useMemo(
    () => ({
      CORRIENTE: "Corriente",
      AHORROS: "Ahorros",
      CCI: "CCI",
      DETRACCION: "Detracción",
    }),
    []
  );

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (company) {
        await updateCompany.mutateAsync({
          id: company.id,
          ...formData,
        });
        toast.success("Información de empresa actualizada exitosamente");
      } else {
        await createCompany.mutateAsync(formData);
        toast.success("Información de empresa creada exitosamente");
      }
      refetch();
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || "Error al guardar la información");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBankAccount = async () => {
    setIsSaving(true);
    try {
      if (editingBankAccount) {
        await updateBankAccount.mutateAsync({
          id: editingBankAccount.id,
          ...bankFormData,
        });
        toast.success("Cuenta bancaria actualizada exitosamente");
      } else {
        if (!company) {
          toast.error("Debes crear la información de la empresa primero");
          return;
        }
        await createBankAccount.mutateAsync({
          companyId: company.id,
          ...bankFormData,
        });
        toast.success("Cuenta bancaria creada exitosamente");
      }
      refetch();
      setBankDialogOpen(false);
      setEditingBankAccount(null);
      setBankFormData(createInitialBankFormData());
    } catch (error: any) {
      toast.error(error.message || "Error al guardar la cuenta bancaria");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBankAccount = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta cuenta bancaria?")) return;
    
    try {
      await deleteBankAccount.mutateAsync({ id });
      toast.success("Cuenta bancaria eliminada exitosamente");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar la cuenta bancaria");
    }
  };

  const openBankDialog = (account?: any) => {
    if (account) {
      setEditingBankAccount(account);
      setBankFormData({
        bankName: account.bankName,
        accountNumber: account.accountNumber,
        accountType: account.accountType,
        currency: account.currency,
        isDefault: account.isDefault,
        isDetraction: account.isDetraction ?? false,
      });
    } else {
      setEditingBankAccount(null);
      setBankFormData(createInitialBankFormData());
    }
    setBankDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/configuracion">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Building2 className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Información de Empresa</h1>
              <p className="text-muted-foreground">
                Configura los datos de tu empresa y cuentas bancarias
              </p>
            </div>
          </div>
        </div>

        {/* Company Information Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Datos de la Empresa</CardTitle>
                <CardDescription>
                  Esta información aparecerá en todos los documentos PDF generados
                </CardDescription>
              </div>
              {!isEditing && company && (
                <Button onClick={() => setIsEditing(true)}>
                  Editar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!company && !isEditing ? (
              <div className="text-center py-8">
                <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No hay información de empresa</h3>
                <p className="text-muted-foreground mb-4">
                  Crea la información de tu empresa para que aparezca en los PDFs
                </p>
                <Button onClick={() => setIsEditing(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Información de Empresa
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Razón Social *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Nombre de la empresa"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ruc">RUC *</Label>
                  <Input
                    id="ruc"
                    value={formData.ruc}
                    onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                    disabled={!isEditing}
                    placeholder="20XXXXXXXXX"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Dirección *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Dirección completa"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                    placeholder="contacto@empresa.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing}
                    placeholder="+51 XXX XXX XXX"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="logo">URL del Logo (opcional)</Label>
                  <Input
                    id="logo"
                    value={formData.logo}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                    disabled={!isEditing}
                    placeholder="https://..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Por defecto se usará /logo.png del proyecto
                  </p>
                </div>

                {isEditing && (
                  <div className="md:col-span-2 flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        if (company) {
                          setFormData({
                            name: company.name,
                            ruc: company.ruc,
                            address: company.address,
                            email: company.email,
                            phone: company.phone,
                            logo: company.logo || "",
                          });
                        }
                      }}
                      disabled={isSaving}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                      {isSaving ? (
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
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bank Accounts Card */}
        {company && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Cuentas Bancarias</CardTitle>
                  <CardDescription>
                    Gestiona las cuentas bancarias que aparecerán en los documentos
                  </CardDescription>
                </div>
                <Dialog open={bankDialogOpen} onOpenChange={setBankDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => openBankDialog()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva Cuenta
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingBankAccount ? "Editar" : "Nueva"} Cuenta Bancaria
                      </DialogTitle>
                      <DialogDescription>
                        Completa los datos de la cuenta bancaria
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="bankName">Banco *</Label>
                        <Input
                          id="bankName"
                          value={bankFormData.bankName}
                          onChange={(e) =>
                            setBankFormData({ ...bankFormData, bankName: e.target.value })
                          }
                          placeholder="BCP, Interbank, BBVA..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="accountNumber">Número de Cuenta *</Label>
                        <Input
                          id="accountNumber"
                          value={bankFormData.accountNumber}
                          onChange={(e) =>
                            setBankFormData({ ...bankFormData, accountNumber: e.target.value })
                          }
                          placeholder="XXX-XXXXXXXX-X-XX"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="accountType">Tipo de Cuenta *</Label>
                        <Select
                          value={bankFormData.accountType}
                          onValueChange={(value) =>
                            setBankFormData({ ...bankFormData, accountType: value })
                          }
                          disabled={bankFormData.isDetraction}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CORRIENTE">Corriente</SelectItem>
                            <SelectItem value="AHORROS">Ahorros</SelectItem>
                            <SelectItem value="CCI">CCI</SelectItem>
                            <SelectItem value="DETRACCION">Detracción</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="currency">Moneda *</Label>
                        <Select
                          value={bankFormData.currency}
                          onValueChange={(value) =>
                            setBankFormData({ ...bankFormData, currency: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PEN">Soles (PEN)</SelectItem>
                            <SelectItem value="USD">Dólares (USD)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="isDefault"
                            checked={bankFormData.isDefault}
                            onChange={(e) =>
                              setBankFormData({ ...bankFormData, isDefault: e.target.checked })
                            }
                            className="rounded border-gray-300"
                          />
                          <Label htmlFor="isDefault" className="font-normal">
                            Cuenta por defecto
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="isDetraction"
                            checked={bankFormData.isDetraction}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setBankFormData((prev) => ({
                                ...prev,
                                isDetraction: checked,
                                accountType: checked
                                  ? "DETRACCION"
                                  : prev.accountType === "DETRACCION"
                                    ? "CORRIENTE"
                                    : prev.accountType,
                              }));
                            }}
                            className="rounded border-gray-300"
                          />
                          <Label htmlFor="isDetraction" className="font-normal">
                            Cuenta de detracción
                          </Label>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setBankDialogOpen(false)}
                        disabled={isSaving}
                      >
                        Cancelar
                      </Button>
                      <Button onClick={handleSaveBankAccount} disabled={isSaving}>
                        {isSaving ? (
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
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {company.bankAccounts && company.bankAccounts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Banco</TableHead>
                      <TableHead>Número de Cuenta</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Moneda</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {company.bankAccounts.map((account: any) => {
                      const accountTypeKey = account.accountType as keyof typeof accountTypeLabels;
                      const accountTypeLabel =
                        accountTypeLabels[accountTypeKey] ?? account.accountType;

                      return (
                      <TableRow key={account.id}>
                        <TableCell className="font-medium">{account.bankName}</TableCell>
                        <TableCell>{account.accountNumber}</TableCell>
                          <TableCell>{accountTypeLabel}</TableCell>
                        <TableCell>{account.currency}</TableCell>
                        <TableCell className="space-y-1">
                          {account.isDefault && (
                            <Badge variant="default">
                              <Check className="h-3 w-3 mr-1" />
                              Por Defecto
                            </Badge>
                          )}
                          {account.isDetraction && (
                            <Badge variant="outline">
                              <Check className="h-3 w-3 mr-1" />
                              Detracción
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openBankDialog(account)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteBankAccount(account.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No hay cuentas bancarias registradas</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

