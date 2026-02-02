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

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    type: z.enum(["Challenge", "Funded", "Personal"]),
    initial_balance: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Balance must be a positive number.",
    }),
    daily_drawdown_limit: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
        message: "Percentage must be a positive number.",
    }),
})

export function CreateAccountDialog() {
    const [open, setOpen] = useState(false)
    const { user } = useAuthStore()
    const { addAccount } = useJournalStore() // We will add this action to store later
    const supabase = createClient()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            type: "Challenge",
            initial_balance: "100000",
            daily_drawdown_limit: "5",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!user) return

        try {
            const { data, error } = await supabase
                .from("trading_accounts")
                .insert({
                    user_id: user.id,
                    name: values.name,
                    type: values.type,
                    initial_balance: Number(values.initial_balance),
                    current_balance: Number(values.initial_balance),
                    daily_drawdown_limit: Number(values.daily_drawdown_limit),
                })
                .select()
                .single()

            if (error) throw error

            toast.success("Account created successfully!")
            // In a real app we would update the store here
            // addAccount(data) 
            setOpen(false)
            form.reset()
            window.location.reload() // Verified refresh for now
        } catch (error: any) {
            toast.error("Failed to create account: " + error.message)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                    <Plus className="h-4 w-4" />
                    New Account
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-[#121212] border-[#27272a] text-white">
                <DialogHeader>
                    <DialogTitle>Create Trading Account</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Add a new prop firm or personal account to your dashboard.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Account Global Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="FTMO 100k Challenge 1" {...field} className="bg-[#0a0a0a] border-gray-800" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Account Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="bg-[#0a0a0a] border-gray-800">
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="bg-[#121212] border-[#27272a] text-white">
                                            <SelectItem value="Challenge">Challenge (Evaluation)</SelectItem>
                                            <SelectItem value="Funded">Funded (Live)</SelectItem>
                                            <SelectItem value="Personal">Personal (Broker)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="initial_balance"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Balance ($)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} className="bg-[#0a0a0a] border-gray-800" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="daily_drawdown_limit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Daily DD Limit (%)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} className="bg-[#0a0a0a] border-gray-800" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={form.formState.isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Account
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
