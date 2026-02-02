"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/Button"
import { LogIn, Shield } from "lucide-react"
import { AdminLoginForm } from "./AdminLoginForm"

export function LoginButton() {
    const [showAdminLogin, setShowAdminLogin] = useState(false)

    if (showAdminLogin) {
        return <AdminLoginForm onCancel={() => setShowAdminLogin(false)} />
    }

    return (
        <div className="flex flex-col gap-3 w-full">
            <Button
                onClick={() => signIn("google", { callbackUrl: "/" })}
                className="w-full flex items-center justify-center gap-2 bg-white text-black hover:bg-white/90"
            >
                <LogIn className="w-4 h-4" />
                <span>Iniciar con Google</span>
            </Button>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#0A0A0A] px-2 text-white/30">O</span>
                </div>
            </div>

            <Button
                onClick={() => setShowAdminLogin(true)}
                variant="ghost"
                className="w-full flex items-center justify-center gap-2 border border-white/10 text-white/50 hover:text-white hover:bg-white/5"
            >
                <Shield className="w-4 h-4" />
                <span>Acceso Admin</span>
            </Button>
        </div>
    )
}
