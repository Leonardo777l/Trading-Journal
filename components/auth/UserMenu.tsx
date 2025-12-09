"use client"

import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/Button"
import { LogOut, User as UserIcon } from "lucide-react"
import { LoginButton } from "./LoginButton"

export function UserMenu() {
    const { data: session, status } = useSession()

    if (status === "loading") {
        return <div className="h-10 w-full bg-white/5 animate-pulse rounded-lg"></div>
    }

    if (!session) {
        return <LoginButton />
    }

    return (
        <div className="flex flex-col gap-2 p-3 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center gap-3 mb-2">
                {session.user?.image ? (
                    <img
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        className="w-8 h-8 rounded-full border border-white/20"
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-neon-blue/20 flex items-center justify-center text-neon-blue">
                        <UserIcon className="w-4 h-4" />
                    </div>
                )}
                <div className="overflow-hidden">
                    <p className="text-sm font-bold text-white truncate">{session.user?.name}</p>
                    <p className="text-xs text-white/50 truncate">{session.user?.email}</p>
                </div>
            </div>

            <Button
                variant="ghost"
                onClick={() => signOut()}
                className="w-full flex items-center justify-start gap-2 text-neon-red hover:bg-neon-red/10 hover:text-neon-red text-sm py-1"
            >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
            </Button>
        </div>
    )
}
