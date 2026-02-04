"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { useAuthStore } from "@/store/useAuthStore"
import { useJournalStore } from "@/store/useJournalStore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, TrendingUp, AlertTriangle } from "lucide-react"

export function AccountList() {
    const { user } = useAuthStore()
    const { accounts, setAccounts, setActiveAccount, activeAccountId } = useJournalStore()
    const supabase = createClient()

    useEffect(() => {
        async function fetchAccounts() {
            if (!user) return
            const { data, error } = await supabase
                .from("trading_accounts")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: true })

            if (data) {
                setAccounts(data)
                // Set first account as active if none selected
                if (!activeAccountId && data.length > 0) {
                    setActiveAccount(data[0].id)
                }
            }
        }
        fetchAccounts()
    }, [user, setAccounts, setActiveAccount, activeAccountId, supabase])

    if (accounts.length === 0) {
        return (
            <div className="text-center p-8 border border-dashed border-gray-800 rounded-lg">
                <Wallet className="mx-auto h-12 w-12 text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-300">No Accounts Found</h3>
                <p className="text-gray-500 mb-4">Create your first trading account to get started.</p>
            </div>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => (
                <Card
                    key={account.id}
                    className={`bg-[#121212] border-gray-800 cursor-pointer transition-all hover:border-gray-600 ${activeAccountId === account.id ? 'border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)] role="active"' : ''}`}
                    onClick={() => setActiveAccount(account.id)}
                >
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-base font-medium text-white">{account.name}</CardTitle>
                            <span className={`px-2 py-0.5 text-xs rounded-full border ${account.type === 'Funded' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                account.type === 'Challenge' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                    'bg-gray-500/10 text-gray-500 border-gray-500/20'
                                }`}>
                                {account.type}
                            </span>
                        </div>
                        <CardDescription>${account.current_balance.toLocaleString()}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-gray-400">
                                <span>Risk Limit:</span>
                                <span className="text-red-400 font-mono">{account.daily_drawdown_limit}%</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
