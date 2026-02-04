import { create } from 'zustand'

export interface TradeAccount {
    id: string
    name: string
    type: 'Challenge' | 'Funded' | 'Personal'
    initial_balance: number
    current_balance: number
    daily_drawdown_limit: number
}

export interface Trade {
    id: string
    account_id: string
    symbol: string
    direction: 'Long' | 'Short'
    status: 'Win' | 'Loss' | 'BE' | 'Open'
    entry_date: string
    entry_price: number | null
    exit_price: number | null
    lot_size: number | null
    commission: number
    gross_pnl: number
    net_pnl: number
    pnl_percentage: number | null
    notes: string | null
    images: string[]
}

interface JournalState {
    accounts: TradeAccount[]
    activeAccountId: string | null
    trades: Trade[]
    isLoading: boolean
    setAccounts: (accounts: TradeAccount[]) => void
    addAccount: (account: TradeAccount) => void
    setActiveAccount: (id: string) => void
    setTrades: (trades: Trade[]) => void
    addTrade: (trade: Trade) => void
}

export const useJournalStore = create<JournalState>((set) => ({
    accounts: [],
    activeAccountId: null,
    trades: [],
    isLoading: false,
    setAccounts: (accounts) => set({ accounts }),
    addAccount: (account) => set((state) => ({ accounts: [...state.accounts, account] })),
    setActiveAccount: (id) => set({ activeAccountId: id }),
    setTrades: (trades) => set({ trades }),
    addTrade: (trade) => set((state) => ({ trades: [trade, ...state.trades] })),
}))
