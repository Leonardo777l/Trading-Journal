"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/Button"
import { LogIn } from "lucide-react"

export function LoginButton() {
    return (
        <Button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-2 bg-white text-black hover:bg-white/90"
        >
            <LogIn className="w-4 h-4" />
            <span>Iniciar con Google</span>
        </Button>
    )
}
