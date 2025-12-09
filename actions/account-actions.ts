"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAccounts() {
    try {
        const accounts = await prisma.account.findMany({
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
    try {
        const account = await prisma.account.create({
            data: {
                name: data.name,
                balance: data.balance,
                type: data.type,
                firm: data.firm,
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
    try {
        await prisma.account.delete({
            where: { id },
        });
        revalidatePath("/accounts");
        return { success: true };
    } catch (error) {
        console.error("Error deleting account:", error);
        return { success: false, error: "Failed to delete account" };
    }
}
