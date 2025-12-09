"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function getAccounts() {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        const accounts = await prisma.tradingAccount.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, data: accounts };
    } catch (error) {
        console.error("Error fetching accounts:", error);
        return { success: false, error: "Failed to fetch accounts" };
    }
}

export async function createAccount(data: {
    name: string;
    balance: number;
    type: string;
    firm?: string;
}) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        const account = await prisma.tradingAccount.create({
            data: {
                name: data.name,
                balance: data.balance,
                type: data.type,
                firm: data.firm,
                userId: session.user.id,
            },
        });
        revalidatePath("/accounts");
        return { success: true, data: account };
    } catch (error) {
        console.error("Error creating account:", error);
        return { success: false, error: "Failed to create account" };
    }
}

export async function deleteAccount(id: string) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        // Verificar propiedad antes de borrar
        const account = await prisma.tradingAccount.findFirst({
            where: { id, userId: session.user.id }
        });

        if (!account) return { success: false, error: "Account not found or unauthorized" };

        await prisma.tradingAccount.delete({
            where: { id },
        });
        revalidatePath("/accounts");
        return { success: true };
    } catch (error) {
        console.error("Error deleting account:", error);
        return { success: false, error: "Failed to delete account" };
    }
}
