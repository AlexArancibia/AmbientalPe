"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Users, Shield, Building2, User, Key } from "lucide-react";
import Link from "next/link";

export default function ConfiguracionPage() {
  const configSections = [
    {
      title: "Mi Perfil",
      description: "Actualiza tu información personal y preferencias",
      icon: User,
      href: "/configuracion/perfil",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Usuarios",
      description: "Gestiona los usuarios del sistema",
      icon: Users,
      href: "/dashboard/users",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Roles y Permisos",
      description: "Configura roles y permisos de acceso",
      icon: Shield,
      href: "/dashboard/roles",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Información de Empresa",
      description: "Datos de la empresa y cuentas bancarias",
      icon: Building2,
      href: "/configuracion/empresa",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Seguridad",
      description: "Cambiar contraseña y opciones de seguridad",
      icon: Key,
      href: "/configuracion/seguridad",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div className="bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gray-500/10 rounded-lg">
            <Settings className="h-6 w-6 text-gray-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
            <p className="text-muted-foreground">
              Administra la configuración del sistema
            </p>
          </div>
        </div>

        {/* Configuration Sections */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {configSections.map((section) => (
            <Link key={section.title} href={section.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className={`w-12 h-12 ${section.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                    <section.icon className={`h-6 w-6 ${section.color}`} />
                  </div>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {section.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* System Info */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Versión:</span>
                  <span className="font-medium">1.0.0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Última actualización:</span>
                  <span className="font-medium">11 Oct 2024</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Base de datos:</span>
                  <span className="font-medium">PostgreSQL</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estado:</span>
                  <span className="font-medium text-green-600">● Activo</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/users">
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Crear nuevo usuario
              </Button>
            </Link>
            <Link href="/dashboard/roles">
              <Button variant="outline" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Gestionar permisos
              </Button>
            </Link>
            <Link href="/configuracion/empresa">
              <Button variant="outline" className="w-full justify-start">
                <Building2 className="h-4 w-4 mr-2" />
                Actualizar datos de empresa
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
