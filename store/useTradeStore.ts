import { create } from 'zustand';
import { getTrades, createTrade } from '@/actions/trade-actions';
import { getAccounts, createAccount, deleteAccount } from '@/actions/account-actions';

export interface Trade {
    id: string;
    date: string;
    pair: string;
    direction: 'Long' | 'Short';
    entryPrice?: number | null;
    exitPrice?: number | null;
    stopLoss?: number | null;
    positionSize?: number | null;
    entrySizeUSD: number;
    result: 'Win' | 'Loss' | 'Breakeven';
    pnl: number;
    risk: number;
    roi: number;
    account: string;
    rr: number;
    tags: string[];
    screenshotUrl?: string | null;
    notes?: string | null;
}

export interface Account {
    id: string;
    name: string;
    balance: number;
    type: 'Personal' | 'Funding' | 'Challenge';
    firm?: string;
}

interface TradeStore {
    trades: Trade[];
    accounts: Account[];
    isLoading: boolean;

    // Actions
    fetchInitialData: () => Promise<void>;
    addTrade: (trade: any) => Promise<void>;
    addAccount: (account: any) => Promise<void>;
    removeAccount: (id: string) => Promise<void>;
}

export const useTradeStore = create<TradeStore>((set, get) => ({
    trades: [],
    accounts: [],
    isLoading: false,

    fetchInitialData: async () => {
        set({ isLoading: true });
        try {
            const [tradesRes, accountsRes] = await Promise.all([
                getTrades(),
                getAccounts()
            ]);

            if (tradesRes.success && tradesRes.data) {
                // Mapear datos de DB a interfaz Trade (fechas vienen como Date, necesitamos string o manejar Date)
                // Ajustaremos la interfaz para manejar strings en el frontend por simplicidad con JSON
                const formattedTrades = tradesRes.data.map((t: any) => ({
                    ...t,
                    date: t.date.toISOString(),
                    direction: t.direction as 'Long' | 'Short',
                    result: t.result as 'Win' | 'Loss' | 'Breakeven',
                    tags: t.tags ? t.tags.split(',') : [],
                    account: t.account?.name || 'Unknown' // Mapear nombre de cuenta para compatibilidad UI
                }));
                set({ trades: formattedTrades });
            }

            if (accountsRes.success && accountsRes.data) {
                set({ accounts: accountsRes.data as Account[] });
            }
        } catch (error) {
            console.error("Error fetching initial data:", error);
        } finally {
            set({ isLoading: false });
        }
    },

    addTrade: async (tradeData) => {
        // Optimistic update (opcional) o esperar respuesta
        const res = await createTrade(tradeData);
        if (res.success && res.data) {
            // Recargar todo para asegurar consistencia o añadir manualmente
            // Por simplicidad, añadimos al estado local formateado
            const t = res.data;
            const newTrade: Trade = {
                ...t,
                date: t.date.toISOString(),
                direction: t.direction as 'Long' | 'Short',
                result: t.result as 'Win' | 'Loss' | 'Breakeven',
                tags: t.tags ? t.tags.split(',') : [],
                account: tradeData.account // Nombre de cuenta preservado del input
            };
            set((state) => ({ trades: [newTrade, ...state.trades] }));
        }
    },

    addAccount: async (accountData) => {
        const res = await createAccount(accountData);
        if (res.success && res.data) {
            set((state) => ({ accounts: [...state.accounts, res.data as Account] }));
        }
    },

    removeAccount: async (id) => {
        const res = await deleteAccount(id);
        if (res.success) {
            set((state) => ({ accounts: state.accounts.filter(a => a.id !== id) }));
        }
    }
}));
