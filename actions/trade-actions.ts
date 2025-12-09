"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getTrades() {
    try {
        const trades = await prisma.trade.findMany({
            orderBy: { date: 'desc' },
            include: { account: true } // Incluir datos de la cuenta si es necesario
        });
        return { success: true, data: trades };
    } catch (error) {
        console.error("Error fetching trades:", error);
        return { success: false, error: "Failed to fetch trades" };
    }
}

export async function createTrade(data: any) {
    try {
        // Buscar la cuenta por nombre para obtener su ID (temporal, idealmente el form debería enviar el ID)
        // Como el form actual envía el nombre de la cuenta, necesitamos resolverlo.
        // O mejor, actualizaremos el form para enviar el ID.
        // Por ahora, buscaremos la cuenta por nombre para mantener compatibilidad rápida.

        let accountId = data.accountId;

        if (!accountId && data.account) {
            const account = await prisma.account.findFirst({
                where: { name: data.account }
            });
            if (account) {
                accountId = account.id;
            } else {
                // Si no existe la cuenta (ej. TESTING por defecto), creamos una o usamos una default?
                // Mejor fallar o crear una dummy.
                // Vamos a crear una cuenta dummy si no existe para evitar errores.
                const newAccount = await prisma.account.create({
                    data: {
                        name: data.account,
                        balance: 10000,
                        type: "Personal"
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
    try {
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
