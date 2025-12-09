"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useTradeStore, Account } from "@/store/useTradeStore";
import { Trash2, Plus, Wallet, Building2, User } from "lucide-react";

export default function AccountsPage() {
    const { accounts, addAccount, removeAccount } = useTradeStore();
    const [isAdding, setIsAdding] = useState(false);
    const [newAccount, setNewAccount] = useState<Partial<Account>>({
        name: "",
        balance: 0,
        type: "Funding",
        firm: "",
    });

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAccount.name || !newAccount.balance) return;

        addAccount({
            id: crypto.randomUUID(),
            name: newAccount.name,
            balance: Number(newAccount.balance),
            type: newAccount.type as any,
            firm: newAccount.firm,
        });

        setNewAccount({ name: "", balance: 0, type: "Funding", firm: "" });
        setIsAdding(false);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'Funding': return <Building2 className="w-5 h-5 text-neon-blue" />;
            case 'Personal': return <User className="w-5 h-5 text-neon-green" />;
            default: return <Wallet className="w-5 h-5 text-neon-purple" />;
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        Gestión de <span className="text-neon-blue">Cuentas</span>
                    </h1>
                    <p className="text-white/50 mt-2">Administra tus cuentas de fondeo y personales.</p>
                </div>
                <Button onClick={() => setIsAdding(!isAdding)} variant="primary">
                    <Plus className="w-4 h-4" />
                    Nueva Cuenta
                </Button>
            </header>

            {isAdding && (
                <Card className="mb-8 border-neon-blue/30 bg-neon-blue/5">
                    <form onSubmit={handleAdd} className="space-y-4">
                        <h3 className="text-lg font-bold text-white">Añadir Nueva Cuenta</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Nombre de la Cuenta"
                                placeholder="Ej. Funding Pips 100k"
                                value={newAccount.name}
                                onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                            />
                            <Input
                                label="Tamaño de Cuenta ($)"
                                type="number"
                                value={newAccount.balance}
                                onChange={(e) => setNewAccount({ ...newAccount, balance: Number(e.target.value) })}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-foreground/60 font-mono uppercase tracking-wider">Tipo</label>
                                <select
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm font-mono text-foreground focus:outline-none focus:border-neon-blue/50"
                                    value={newAccount.type}
                                    onChange={(e) => setNewAccount({ ...newAccount, type: e.target.value as any })}
                                >
                                    <option value="Funding">Empresa de Fondeo</option>
                                    <option value="Personal">Personal</option>
                                    <option value="Challenge">Challenge / Prueba</option>
                                </select>
                            </div>
                            {newAccount.type !== 'Personal' && (
                                <Input
                                    label="Empresa (Prop Firm)"
                                    placeholder="Ej. FTMO, Funding Pips"
                                    value={newAccount.firm}
                                    onChange={(e) => setNewAccount({ ...newAccount, firm: e.target.value })}
                                />
                            )}
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>Cancelar</Button>
                            <Button type="submit" variant="primary">Guardar Cuenta</Button>
                        </div>
                    </form>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {accounts.map((account) => (
                    <Card key={account.id} className="group hover:border-white/20 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                                    {getIcon(account.type)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg">{account.name}</h3>
                                    <p className="text-xs text-white/50 uppercase tracking-wider">{account.type} {account.firm ? `• ${account.firm}` : ''}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => removeAccount(account.id)}
                                className="text-white/20 hover:text-neon-red transition-colors p-2"
                                title="Eliminar cuenta"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="pt-4 border-t border-white/5">
                            <p className="text-xs text-white/50 uppercase mb-1">Balance Inicial</p>
                            <p className="text-2xl font-mono font-bold text-white">
                                ${account.balance.toLocaleString()}
                            </p>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
