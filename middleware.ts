import { type NextRequest, NextResponse } from "next/server";

// Solo rutas de autenticación son públicas
const publicRoutes = [
  "/signin",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/confirm-email",
];

// Rutas legales públicas
const legalRoutes = ["/legal/privacy", "/legal/terms", "/legal/cookies", "/legal/complaints"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir acceso a archivos estáticos y APIs
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/trpc") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/health") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/favicon") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }

  // Permitir acceso a rutas de autenticación
  if (publicRoutes.some((route) => pathname === route)) {
    return NextResponse.next();
  }

  // Permitir acceso a rutas legales
  if (legalRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Para TODAS las demás rutas, verificar token de sesión
  try {
    // Verificar la cookie de sesión de Better Auth
    const sessionToken = request.cookies.get("better-auth.session_token");
    
    if (!sessionToken) {
      // Redirigir a signin si no hay token de sesión
      const url = new URL("/signin", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }

    // Usuario autenticado (tiene token), permitir acceso
    // La validación completa se hará en el servidor
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware auth error:", error);
    // En caso de error, redirigir a signin
    const url = new URL("/signin", request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
