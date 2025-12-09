import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const isOnDashboard = req.nextUrl.pathname.startsWith("/") && req.nextUrl.pathname !== "/login"

    // Si no está logueado y trata de acceder a rutas protegidas (todo excepto login y api)
    if (!isLoggedIn && isOnDashboard) {
        // Permitir acceso a recursos estáticos y api auth
        if (req.nextUrl.pathname.startsWith("/api/auth") ||
            req.nextUrl.pathname.startsWith("/_next") ||
            req.nextUrl.pathname.includes(".")) {
            return NextResponse.next()
        }
        // Redirigir a login (o simplemente mostrar botón de login en la UI, 
        // pero mejor forzar login para privacidad)
        // Por ahora, como no tenemos página de login dedicada, dejaremos que la UI maneje el estado "no logueado"
        // mostrando el botón de login en el Sidebar, pero protegiendo las acciones de servidor.
        // Sin embargo, para mejor UX, podríamos redirigir a una landing page si no está logueado.
        // Dado que el usuario pidió "acceder con cuenta de Google", asumimos que quiere ver sus datos.

        // Vamos a ser permisivos en el middleware y estrictos en las Server Actions y UI.
        // Esto permite ver la estructura de la app pero no los datos.
    }
})

// Configuración para que el middleware se ejecute en todas las rutas excepto estáticos
export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
