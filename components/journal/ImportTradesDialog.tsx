"use client"

import { useState } from "react"
import Papa from "papaparse"
import { Upload, Loader2, FileText, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase"
import { useAuthStore } from "@/store/useAuthStore"
import { useJournalStore } from "@/store/useJournalStore"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function ImportTradesDialog() {
    const [open, setOpen] = useState(false)
    const [isImporting, setIsImporting] = useState(false)
    const [summary, setSummary] = useState<{ total: number; valid: number } | null>(null)
    const [file, setFile] = useState<File | null>(null)

    const { user } = useAuthStore()
    const { activeAccountId, setTrades } = useJournalStore()
    const supabase = createClient()

    const fetchTrades = async (accountId: string) => {
        const { data } = await supabase
            .from("trades")
            .select("*")
            .eq("account_id", accountId)
            .order("entry_date", { ascending: false })

        if (data) setTrades(data)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
            setSummary(null)
        }
    }

    const parseAndImport = async () => {
        if (!file || !user || !activeAccountId) return

        setIsImporting(true)

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const trades = results.data
                let importedCount = 0

                try {
                    const validTrades = trades.map((row: any) => {
                        // Basic mapping - flexible for common CSV formats
                        // Expected: Date, Symbol, Type/Direction, Price, PnL, Lot, Commission

                        const symbol = row['Symbol'] || row['symbol'] || row['Pair'] || row['Instrument']
                        const direction = row['Type'] || row['cards'] || row['Direction'] // User mentioned 'cards' in notion? No, image had 'Direction'
                        const pnl = row['Profit'] || row['P/L'] || row['PnL'] || row['Amount']
                        const lot = row['Size'] || row['Lot'] || row['Volume'] || row['Quantity']
                        const commission = row['Commission'] || row['Comm'] || row['Fee'] || 0

                        // normalize direction
                        let dir = 'Long'
                        if (direction && String(direction).toLowerCase().includes('short')) dir = 'Short'
                        if (direction && String(direction).toLowerCase().includes('sell')) dir = 'Short'

                        // normalize status
                        let status = 'Win'
                        const pnlVal = parseFloat(pnl || '0')
                        if (pnlVal < 0) status = 'Loss'
                        if (pnlVal === 0) status = 'BE'

                        if (!symbol) return null

                        return {
                            user_id: user.id,
                            account_id: activeAccountId,
                            entry_date: row['Date'] || row['Time'] || new Date().toISOString(),
                            symbol: String(symbol).toUpperCase(),
                            direction: dir,
                            status: status,
                            gross_pnl: pnlVal,
                            commission: Math.abs(parseFloat(commission || '0')),
                            lot_size: parseFloat(lot || '0'),
                            notes: row['Comment'] || row['Notes'] || 'Imported via CSV'
                        }
                    }).filter(t => t !== null)

                    if (validTrades.length === 0) {
                        toast.error("No valid trades found in CSV. Check column headers.")
                        setIsImporting(false)
                        return
                    }

                    // Insert in batches
                    const { error } = await supabase
                        .from('trades')
                        .insert(validTrades)

                    if (error) throw error

                    toast.success(`Successfully imported ${validTrades.length} trades!`)
                    fetchTrades(activeAccountId) // Refresh list
                    setOpen(false)
                    setFile(null)
                } catch (err: any) {
                    console.error(err)
                    toast.error("Import failed: " + err.message)
                } finally {
                    setIsImporting(false)
                }
            },
            error: (err) => {
                toast.error("CSV Parse Error: " + err.message)
                setIsImporting(false)
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 border-gray-700 text-gray-300 hover:bg-[#1e1e1e] hover:text-white">
                    <Upload className="h-4 w-4" />
                    Import CSV
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-[#121212] border-[#27272a] text-white">
                <DialogHeader>
                    <DialogTitle>Import Trades</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Upload a CSV file to bulk import your trading history.
                        <br />
                        <span className="text-xs text-gray-500">Supported columns: Date, Symbol, Type, Size, Price, Profit/PnL, Commission.</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Input
                            type="file"
                            accept=".csv, .txt"
                            onChange={handleFileChange}
                            className="bg-[#0a0a0a] border-gray-800 cursor-pointer text-gray-300 file:bg-blue-900 file:text-blue-100 file:border-0 file:rounded-md file:mr-4 file:px-4 file:py-2 hover:file:bg-blue-800"
                        />
                    </div>

                    {file && (
                        <Alert className="bg-blue-900/20 border-blue-900/50 text-blue-200">
                            <FileText className="h-4 w-4" />
                            <AlertTitle>Ready to Import</AlertTitle>
                            <AlertDescription>
                                File: {file.name} ({Math.round(file.size / 1024)} KB)
                            </AlertDescription>
                        </Alert>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        onClick={parseAndImport}
                        disabled={!file || isImporting}
                        className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                    >
                        {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Import Data
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
    return <input {...props} className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${props.className}`} />
}
