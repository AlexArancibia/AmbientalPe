"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Users, ArrowLeft, Save, Loader2 } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/navigation";
import { CompanyType } from "@prisma/client";

export default function NewClientPage() {
  const router = useRouter();

  // Create mutation
  const createMutation = trpc.client.create.useMutation({
    onSuccess: (data) => {
      router.push(`/clientes/${data.id}`);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync({
      ...formData,
      type: CompanyType.CLIENT,
    });
  };

  return (
    <div className="bg-background">
      <div className="container mx-auto p-6 space-y-6 max-w-4xl">
        {/* Header */}
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
            <h1 className="text-3xl font-bold tracking-tight">Nuevo Cliente</h1>
            <p className="text-muted-foreground">
              Registra un nuevo cliente en el sistema
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Información del Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name */}
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

              {/* RUC */}
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

              {/* Email */}
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

              {/* Address */}
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

              {/* Contact Person */}
              <div className="space-y-2">
                <Label htmlFor="contactPerson">Persona de Contacto</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  placeholder="Ej: María García"
                />
              </div>

              {/* Credit Line */}
              <div className="space-y-2">
                <Label htmlFor="creditLine">Línea de Crédito (S/)</Label>
                <Input
                  id="creditLine"
                  type="number"
                  value={formData.creditLine}
                  onChange={(e) => setFormData({ ...formData, creditLine: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.01"
                  placeholder="Ej: 10000.00"
                />
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Método de Pago</Label>
                <Input
                  id="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  placeholder="Ej: Transferencia bancaria, Crédito, etc."
                />
              </div>

              {/* Actions */}
              <div className="flex space-x-2 pt-4">
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Crear Cliente
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/clientes")}
                  disabled={createMutation.isPending}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}

