"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

// Log helper dummy (since it was referenced in the original error log but not imported, I will remove it or fix it if I knew where it came from. Actually, looking at line 19: logToDebugFile. It seems undefined in the file view! I should probably remove that line too if it's not defined, or just wrap it. The build error didn't complain about logToDebugFile yet because it failed parsing before that).
// Wait, the log said: "Parsing ecmascript source code failed".
// I will just wrap it for now.

export async function getTrades() {
    const session = await auth();
    let userId = session?.user?.id;

    // Fallback for Admin
    if (!userId && session?.user?.email) {
        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (user) userId = user.id;
    }

    if (!userId) return { success: false, error: "Unauthorized" };

    try {
        const trades = await prisma.trade.findMany({
            where: { userId: userId },
            orderBy: { date: 'desc' },
            include: { account: true }
        });
        return { success: true, data: trades };
    } catch (error) {
        console.error("Error fetching trades:", error);
        return { success: false, error: "Failed to fetch trades" };
    }
}

export async function createTrade(data: any) {
    const session = await auth();
    console.log("DEBUG: createTrade Session:", JSON.stringify(session, null, 2));

    let userId = session?.user?.id;

    // Fallback: If ID is missing but email is present (Admin fallback)
    if (!userId && session?.user?.email) {
        console.log("DEBUG: ID missing, looking up user by email:", session.user.email);
        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (user) {
            userId = user.id;
        }
    }

    if (!userId) {
        console.error("DEBUG: Unauthorized access attempt. Session:", session);
        return { success: false, error: "Unauthorized: No User ID found" };
    }

    try {
        let accountId = data.accountId;

        if (!accountId && data.account) {
            const account = await prisma.tradingAccount.findFirst({
                where: { name: data.account, userId: userId }
            });
            if (account) {
                accountId = account.id;
            } else {
                const newAccount = await prisma.tradingAccount.create({
                    data: {
                        name: data.account,
                        balance: 10000,
                        type: "Personal",
                        userId: userId!
                    }
                });
                accountId = newAccount.id;
            }
        }

        const trade = await prisma.trade.create({
            data: {
                date: new Date(data.date),
                pair: data.pair,
                direction: data.direction,
                entrySizeUSD: Number(data.entrySizeUSD),
                risk: Number(data.risk),
                pnl: Number(data.pnl),
                roi: Number(data.roi),
                rr: Number(data.rr),
                result: data.result,
                tags: Array.isArray(data.tags) ? data.tags.join(",") : data.tags,
                notes: data.notes,
                screenshotUrl: data.screenshotUrl,
                accountId: accountId,
                userId: userId!,
                // New Fields
                entryPrice: data.entryPrice ? Number(data.entryPrice) : null,
                exitPrice: data.exitPrice ? Number(data.exitPrice) : null,
                lotSize: data.lotSize ? Number(data.lotSize) : null,
                pips: data.pips ? Number(data.pips) : null,
                commission: data.commission ? Number(data.commission) : null,
                extraFees: data.extraFees ? Number(data.extraFees) : null,
                exitReason: data.exitReason,
            },
        });
        revalidatePath("/journal");
        revalidatePath("/");
        return { success: true, data: trade };
    } catch (error) {
        console.error("Error creating trade:", error);
        return { success: false, error: "Failed to create trade" };
    }
}



export async function deleteTrade(id: string) {
    const session = await auth();
    let userId = session?.user?.id;

    // Fallback for Admin
    if (!userId && session?.user?.email) {
        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (user) userId = user.id;
    }

    if (!userId) return { success: false, error: "Unauthorized" };

    try {
        const trade = await prisma.trade.findFirst({
            where: { id, userId: userId }
        });
        if (!trade) return { success: false, error: "Trade not found or unauthorized" };

        await prisma.trade.delete({
            where: { id },
        });
        revalidatePath("/journal");
        return { success: true };
    } catch (error) {
        console.error("Error deleting trade:", error);
        return { success: false, error: "Failed to delete trade" };
    }
}
