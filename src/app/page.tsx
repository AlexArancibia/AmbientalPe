"use client";

import { useAuthContext } from "@/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRBAC } from "@/hooks/useRBAC";
import {
  Users,
  Truck,
  Wrench,
  Building2,
  FileCheck,
  FolderOpen,
  TrendingUp,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { trpc } from "@/utils/trpc";
import { CompanyType } from "@prisma/client";

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
}

export default function HomePage() {
  const { user, isAuthenticated, loading: authLoading } = useAuthContext();
  const { isLoading: rbacLoading } = useRBAC();
  const router = useRouter();

  // Obtener datos reales
  const { data: clientsData } = trpc.client.getAll.useQuery({
    page: 1,
    limit: 1,
    type: CompanyType.CLIENT,
  }, {
    enabled: isAuthenticated,
  });

  const { data: providersData } = trpc.client.getAll.useQuery({
    page: 1,
    limit: 1,
    type: CompanyType.PROVIDER,
  }, {
    enabled: isAuthenticated,
  });

  const { data: equipmentData } = trpc.equipment.getAll.useQuery({
    page: 1,
    limit: 1,
    status: "AVAILABLE",
  }, {
    enabled: isAuthenticated,
  });

  const { data: quotationsData } = trpc.quotation.getAll.useQuery({
    page: 1,
    limit: 1,
  }, {
    enabled: isAuthenticated,
  });

  const { data: serviceOrdersData } = trpc.serviceOrder.getAll.useQuery({
    page: 1,
    limit: 1,
    status: "IN_PROGRESS",
  }, {
    enabled: isAuthenticated,
  });

  // Redirigir al login si no está autenticado
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/signin");
    }
  }, [authLoading, isAuthenticated, router]);

  const isLoading = authLoading || rbacLoading;

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-full py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  const stats: StatCard[] = [
    {
      title: "Clientes Activos",
      value: clientsData?.total || 0,
      icon: Users,
      href: "/clientes",
      color: "text-blue-600",
    },
    {
      title: "Proveedores",
      value: providersData?.total || 0,
      icon: Truck,
      href: "/proveedores",
      color: "text-green-600",
    },
    {
      title: "Equipos Disponibles",
      value: equipmentData?.total || 0,
      icon: Wrench,
      href: "/equipos",
      color: "text-purple-600",
    },
    {
      title: "Cotizaciones",
      value: quotationsData?.total || 0,
      icon: FileCheck,
      href: "/cotizaciones",
      color: "text-orange-600",
    },
    {
      title: "Órdenes en Progreso",
      value: serviceOrdersData?.total || 0,
      icon: FolderOpen,
      href: "/ordenes",
      color: "text-pink-600",
    },
    {
      title: "Configuración",
      value: "Empresa",
      icon: Building2,
      href: "/configuracion/empresa",
      color: "text-cyan-600",
    },
  ];

  return (
    <div className="bg-background">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenido, {user?.name || "Usuario"}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <Link key={stat.title} href={stat.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-border hover:border-primary/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-primary" />
              Acciones Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <Link
                href="/cotizaciones"
                className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                <FileCheck className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Nueva Cotización</span>
              </Link>
              <Link
                href="/ordenes"
                className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                <FolderOpen className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Nueva Orden</span>
              </Link>
              <Link
                href="/clientes"
                className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Gestionar Clientes</span>
              </Link>
              <Link
                href="/equipos"
                className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                <Wrench className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Ver Equipos</span>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Sistema de Gestión */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-primary" />
              Sistema de Gestión Ambiental
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Bienvenido al sistema de gestión de AmbientalPe. Desde aquí puedes acceder a todas las funcionalidades para gestionar clientes, proveedores, equipos, cotizaciones y órdenes de servicio.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
