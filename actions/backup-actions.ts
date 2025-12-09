"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getBackupData() {
    try {
        const accounts = await prisma.account.findMany();
        const trades = await prisma.trade.findMany();
        return { success: true, data: { accounts, trades } };
    } catch (error) {
        console.error("Error creating backup:", error);
        return { success: false, error: "Failed to create backup" };
    }
}

export async function importData(jsonData: { accounts: any[], trades: any[] }) {
    try {
        // Validar estructura básica
        if (!Array.isArray(jsonData.accounts) || !Array.isArray(jsonData.trades)) {
            return { success: false, error: "Invalid data format" };
        }

        // Usar transacción para asegurar integridad
        await prisma.$transaction(async (tx) => {
            // 1. Limpiar datos existentes (Opcional: el usuario podría querer fusionar, 
            // pero para "Restaurar backup" lo limpio es borrar y poner lo nuevo.
            // O mejor, usar upsert. Para simplificar y evitar duplicados, borraremos todo primero 
            // si el usuario confirma "Restaurar".
            // Vamos a asumir modo "Restauración Completa": Borrar todo e insertar.

            await tx.trade.deleteMany();
            await tx.account.deleteMany();

            // 2. Insertar Cuentas
            for (const acc of jsonData.accounts) {
                await tx.account.create({
                    data: {
                        id: acc.id, // Mantener ID original para preservar relaciones
                        name: acc.name,
                        balance: acc.balance,
                        type: acc.type,
                        firm: acc.firm,
                        createdAt: acc.createdAt ? new Date(acc.createdAt) : undefined,
                        updatedAt: acc.updatedAt ? new Date(acc.updatedAt) : undefined,
                    }
                });
            }

            // 3. Insertar Trades
            for (const trade of jsonData.trades) {
                await tx.trade.create({
                    data: {
                        id: trade.id,
                        date: new Date(trade.date),
                        pair: trade.pair,
                        direction: trade.direction,
                        entrySizeUSD: Number(trade.entrySizeUSD),
                        risk: Number(trade.risk),
                        pnl: Number(trade.pnl),
                        roi: Number(trade.roi),
                        rr: Number(trade.rr),
                        result: trade.result,
                        tags: trade.tags,
                        notes: trade.notes,
                        screenshotUrl: trade.screenshotUrl,
                        accountId: trade.accountId, // Relación directa por ID
                        createdAt: trade.createdAt ? new Date(trade.createdAt) : undefined,
                        updatedAt: trade.updatedAt ? new Date(trade.updatedAt) : undefined,
                    }
                });
            }
        });

        revalidatePath("/");
        revalidatePath("/journal");
        revalidatePath("/accounts");

        return { success: true };
    } catch (error) {
        console.error("Error importing data:", error);
        return { success: false, error: "Failed to import data" };
    }
}
