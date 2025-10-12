"use client";

import { useAuthContext } from "@/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Users,
  Truck,
  Wrench,
  FileText,
  FileCheck,
  FolderOpen,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Clientes",
    href: "/clientes",
    icon: Users,
  },
  {
    title: "Proveedores",
    href: "/proveedores",
    icon: Truck,
  },
  {
    title: "Equipos",
    href: "/equipos",
    icon: Wrench,
  },
  {
    title: "Cotizaciones",
    href: "/cotizaciones",
    icon: FileCheck,
  },
  {
    title: "Órdenes",
    href: "/ordenes",
    icon: FolderOpen,
  },
];

export default function GlobalNavbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, signOut } = useAuthContext();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsMenuOpen(false);
      router.push("/signin");
    } catch (_error) {
      // Error handled by Better Auth
    }
  };

  const handleSignIn = () => {
    router.push("/signin");
    setIsMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-gray-900 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center">
          <Link href={isAuthenticated ? "/" : "/signin"} className="flex items-center">
            <Image 
              src="/logo.png" 
              alt="AmbientalPe Logo" 
              width={40} 
              height={40}
              className="object-contain"
              priority
            />
          </Link>
        </div>

        {/* Desktop Navigation - Solo mostrar si está autenticado */}
        {isAuthenticated && (
          <div className="hidden lg:flex flex-1 items-center justify-center gap-1 px-4 xl:px-6">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${
                      isActive
                        ? "bg-gray-600 text-primary-foreground shadow-sm"
                        : "text-gray-300 hover:text-white hover:bg-white/10"
                    }
                  `}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">{item.title}</span>
                </Link>
              );
            })}
          </div>
        )}

        {/* Desktop User Menu */}
        <div className="hidden lg:flex items-center gap-3 ml-auto">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-gray-300 whitespace-nowrap">
                {user?.name || "Usuario"}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer ring-2 ring-transparent bg-amber-50 hover:ring-primary/50 transition-all h-9 w-9">
                    {user?.image ? (
                      <AvatarImage src={user.image} alt={user?.name || "Usuario"} />
                    ) : (
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user?.name
                          ? user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)
                          : "U"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.name || "Usuario"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email || ""}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/configuracion")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configuración</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={handleSignIn}
                size="sm"
                className="text-gray-300 hover:text-white hover:bg-white/10"
              >
                Iniciar Sesión
              </Button>
              <Button 
                onClick={() => router.push("/signup")}
                size="sm"
              >
                Registrarse
              </Button>
            </div>
          )}
        </div>

        {/* Mobile menu button and avatar */}
        <div className="flex lg:hidden ml-auto items-center gap-3">
          {isAuthenticated && (
            <Avatar className="h-8 w-8 ring-2 ring-transparent bg-amber-50">
              {user?.image ? (
                <AvatarImage src={user.image} alt={user?.name || "Usuario"} />
              ) : (
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {user?.name
                    ? user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                    : "U"}
                </AvatarFallback>
              )}
            </Avatar>
          )}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="text-gray-300 hover:text-white p-2 rounded-md hover:bg-white/10 transition-colors"
                aria-label="Abrir menú"
              >
                <Menu className="h-6 w-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>
                  {isAuthenticated ? "Menú de Navegación" : "AmbientalPe"}
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                {isAuthenticated ? (
                  <>
                    {/* User Info */}
                    <div className="flex items-center gap-3 px-3 py-3 bg-muted rounded-lg">
                      <Avatar className="h-10 w-10 ring-2 ring-background bg-amber-50">
                        {user?.image ? (
                          <AvatarImage
                            src={user.image}
                            alt={user?.name || "Usuario"}
                          />
                        ) : (
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {user?.name
                              ? user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)
                              : "U"}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-sm font-medium truncate">
                          {user?.name || "Usuario"}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          {user?.email || ""}
                        </span>
                      </div>
                    </div>

                    {/* Navigation Items */}
                    <div className="space-y-1">
                      {navItems.map((item) => {
                        const isActive =
                          pathname === item.href ||
                          (item.href !== "/" &&
                            pathname?.startsWith(item.href));

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMenuOpen(false)}
                            className={`
                              flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                              ${
                                isActive
                                  ? "bg-primary text-primary-foreground shadow-sm"
                                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
                              }
                            `}
                          >
                            <item.icon className="h-5 w-5 flex-shrink-0" />
                            <span>{item.title}</span>
                          </Link>
                        );
                      })}
                    </div>

                    {/* Sign Out */}
                    <div className="pt-4 border-t">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/10 transition-all duration-200"
                      >
                        <LogOut className="h-5 w-5 flex-shrink-0" />
                        <span>Cerrar sesión</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground px-3">
                      Inicia sesión para acceder al sistema
                    </p>
                    <Button
                      onClick={handleSignIn}
                      className="w-full"
                    >
                      Iniciar Sesión
                    </Button>
                    <Button
                      onClick={() => {
                        router.push("/signup");
                        setIsMenuOpen(false);
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      Registrarse
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
