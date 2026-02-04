"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Plus } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase"
import { useAuthStore } from "@/store/useAuthStore"
import { useJournalStore } from "@/store/useJournalStore"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const formSchema = z.object({
    symbol: z.string().min(1, "Symbol is required"),
    direction: z.enum(["Long", "Short"]),
    status: z.enum(["Win", "Loss", "BE", "Open"]),
    lot_size: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Must be a positive number"),
    commission: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, "Must be a non-negative number").default("0"),
    gross_pnl: z.string().refine((val) => !isNaN(Number(val)), "Must be a number"),
    pnl_percentage: z.string().refine((val) => !isNaN(Number(val)), "Must be a number").optional(),
    entry_price: z.string().optional(),
    exit_price: z.string().optional(),
    notes: z.string().optional(),
})

export function AddTradeDialog() {
    const [open, setOpen] = useState(false)
    const { user } = useAuthStore()
    const { activeAccountId, addTrade } = useJournalStore()
    const supabase = createClient()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            symbol: "",
            direction: "Long",
            status: "Win",
            lot_size: "0.01",
            commission: "0",
            gross_pnl: "0",
            notes: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!user || !activeAccountId) {
            toast.error("Please select an account first")
            return
        }

        try {
            const { data, error } = await supabase
                .from("trades")
                .insert({
                    user_id: user.id,
                    account_id: activeAccountId,
                    symbol: values.symbol.toUpperCase(),
                    direction: values.direction,
                    status: values.status,
                    lot_size: Number(values.lot_size),
                    commission: Number(values.commission),
                    gross_pnl: Number(values.gross_pnl),
                    pnl_percentage: values.pnl_percentage ? Number(values.pnl_percentage) : null,
                    entry_price: values.entry_price ? Number(values.entry_price) : null,
                    exit_price: values.exit_price ? Number(values.exit_price) : null,
                    notes: values.notes,
                    entry_date: new Date().toISOString(),
                })
                .select()
                .single()

            if (error) throw error

            toast.success("Trade logged successfully!")
            addTrade(data)
            setOpen(false)
            form.reset()
        } catch (error: any) {
            toast.error("Failed to log trade: " + error.message)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                    <Plus className="h-4 w-4" />
                    Log Trade
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-[#121212] border-[#27272a] text-white">
                <DialogHeader>
                    <DialogTitle>Log New Trade</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Record your trade execution details.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="symbol"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Symbol (e.g. EURUSD)</FormLabel>
                                        <FormControl>
                                            <Input {...field} className="bg-[#0a0a0a] border-gray-800 uppercase" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="direction"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Direction</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-[#0a0a0a] border-gray-800">
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-[#121212] border-[#27272a] text-white">
                                                <SelectItem value="Long">Long (Buy)</SelectItem>
                                                <SelectItem value="Short">Short (Sell)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="lot_size"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Lot Size</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} className="bg-[#0a0a0a] border-gray-800" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="commission"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Commission ($)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} className="bg-[#0a0a0a] border-gray-800" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Outcome</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-[#0a0a0a] border-gray-800">
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-[#121212] border-[#27272a] text-white">
                                                <SelectItem value="Win" className="text-green-500">Win</SelectItem>
                                                <SelectItem value="Loss" className="text-red-500">Loss</SelectItem>
                                                <SelectItem value="BE" className="text-gray-400">Break Even</SelectItem>
                                                <SelectItem value="Open" className="text-blue-500">Open</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="gross_pnl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Gross PnL ($)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} className="bg-[#0a0a0a] border-gray-800" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} className="bg-[#0a0a0a] border-gray-800 min-h-[80px]" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit" disabled={form.formState.isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Trade
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
