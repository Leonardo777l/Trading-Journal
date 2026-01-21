"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

const session = await auth();
if (!session?.user?.id) return { success: false, error: "Unauthorized" };

try {
    const trades = await prisma.trade.findMany({
        where: { userId: session.user.id },
        orderBy: { date: 'desc' },
        include: { account: true }
    });
    return { success: true, data: trades };
} catch (error) {
    console.error("Error fetching trades:", error);
    logToDebugFile(`Error fetching trades: ${String(error)}`);
    return { success: false, error: "Failed to fetch trades" };
}
}

export async function createTrade(data: any) {
    const session = await auth();
    throw new Error("PRUEBA DE CONEXION - ESTE ERROR ES INTENCIONAL");
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        let accountId = data.accountId;

        if (!accountId && data.account) {
            const account = await prisma.tradingAccount.findFirst({
                where: { name: data.account, userId: session.user.id }
            });
            if (account) {
                accountId = account.id;
            } else {
                const newAccount = await prisma.tradingAccount.create({
                    data: {
                        name: data.account,
                        balance: 10000,
                        type: "Personal",
                        userId: session.user.id
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
                userId: session.user.id,
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
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        const trade = await prisma.trade.findFirst({
            where: { id, userId: session.user.id }
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
