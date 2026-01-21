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
    takeProfit?: number | null;
    lotSize?: number | null;
    pips?: number | null;
    commission?: number | null;
    extraFees?: number | null;
    exitReason?: string | null; // TP, SL, BE, Manual

    entrySizeUSD: number;
    result: 'Win' | 'Loss' | 'Breakeven';
    pnl: number;
    risk: number;
    roi: number;
    account: string;
    accountId?: string; // Add ID for filtering
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
    baseAccountSize: number;
    selectedAccountId: string | "ALL";

    // Actions
    setBaseAccountSize: (size: number) => void;
    setSelectedAccountId: (id: string | "ALL") => void;
    fetchInitialData: () => Promise<void>;
    addTrade: (trade: any) => Promise<{ success: boolean; error?: string }>;
    addAccount: (account: any) => Promise<void>;
    removeAccount: (id: string) => Promise<void>;
}

export const useTradeStore = create<TradeStore>((set, get) => ({
    trades: [],
    accounts: [],
    isLoading: false,
    baseAccountSize: 10000,
    selectedAccountId: "ALL",

    setBaseAccountSize: (size: number) => set({ baseAccountSize: size }),
    setSelectedAccountId: (id: string | "ALL") => set({ selectedAccountId: id }),

    fetchInitialData: async () => {
        set({ isLoading: true });
        try {
            const [tradesRes, accountsRes] = await Promise.all([
                getTrades(),
                getAccounts()
            ]);

            if (tradesRes.success && tradesRes.data) {
                const formattedTrades = tradesRes.data.map((t: any) => ({
                    ...t,
                    date: new Date(t.date).toISOString(),
                    direction: t.direction as 'Long' | 'Short',
                    result: t.result as 'Win' | 'Loss' | 'Breakeven',
                    tags: t.tags ? t.tags.split(',') : [],
                    account: t.account?.name || 'Unknown',
                    accountId: t.accountId, // Map ID
                    // Map new fields safely
                    entryPrice: t.entryPrice,
                    exitPrice: t.exitPrice,
                    lotSize: t.lotSize,
                    pips: t.pips,
                    commission: t.commission,
                    extraFees: t.extraFees,
                    exitReason: t.exitReason
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
        const res = await createTrade(tradeData);
        if (res.success && res.data) {
            const t = res.data;
            const newTrade: Trade = {
                ...t,
                date: new Date(t.date).toISOString(),
                direction: t.direction as 'Long' | 'Short',
                result: t.result as 'Win' | 'Loss' | 'Breakeven',
                tags: t.tags ? t.tags.split(',') : [],
                account: tradeData.account,
                accountId: t.accountId, // Map ID
                entryPrice: t.entryPrice,
                exitPrice: t.exitPrice,
                lotSize: t.lotSize,
                pips: t.pips,
                commission: t.commission,
                extraFees: t.extraFees,
                exitReason: t.exitReason
            };
            set((state) => ({ trades: [newTrade, ...state.trades] }));
            return { success: true };
        }
        return { success: false, error: res.error };
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
