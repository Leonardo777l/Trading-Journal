import { create } from 'zustand'

export interface TradeAccount {
    id: string
    name: string
    type: 'Challenge' | 'Funded' | 'Personal'
    balance: number
    daily_drawdown_limit: number
}

interface JournalState {
    accounts: TradeAccount[]
    activeAccountId: string | null
    isLoading: boolean
    setAccounts: (accounts: TradeAccount[]) => void
    addAccount: (account: TradeAccount) => void
    setActiveAccount: (id: string) => void
}

export const useJournalStore = create<JournalState>((set) => ({
    accounts: [],
    activeAccountId: null,
    isLoading: false,
    setAccounts: (accounts) => set({ accounts }),
    addAccount: (account) => set((state) => ({ accounts: [...state.accounts, account] })),
    setActiveAccount: (id) => set({ activeAccountId: id }),
}))
