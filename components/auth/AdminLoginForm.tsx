"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Lock, LogIn } from "lucide-react";

interface AdminLoginFormProps {
    onCancel: () => void;
}

export function AdminLoginForm({ onCancel }: AdminLoginFormProps) {
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const result = await signIn("credentials", {
                password,
                redirect: false,
                callbackUrl: "/"
            });

            if (result?.error) {
                setError("Contraseña incorrecta");
            } else {
                // Force reload to update session
                window.location.reload();
            }
        } catch (err) {
            setError("Error al iniciar sesión");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 w-full animate-in fade-in zoom-in duration-300">
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-white/70">Contraseña de Admin</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-neon-blue transition-colors"
                        placeholder="••••••••"
                        autoFocus
                    />
                </div>
            </div>

            {error && <p className="text-xs text-neon-red font-bold">{error}</p>}

            <div className="flex gap-2 pt-2">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onCancel}
                    className="flex-1 text-white/50 hover:text-white"
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    disabled={isLoading || !password}
                    className="flex-1 bg-neon-blue text-black hover:bg-neon-blue/80 font-bold"
                >
                    {isLoading ? "Validando..." : "Entrar"}
                </Button>
            </div>
        </form>
    );
}
