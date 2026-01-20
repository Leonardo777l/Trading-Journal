"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateTradingAnalysis(trades: any[], accountName: string) {
    if (!process.env.GEMINI_API_KEY) {
        return {
            success: false,
            error: "Gemini API Key not configured. Please add GEMINI_API_KEY to your .env file."
        };
    }

    if (!trades || trades.length === 0) {
        return { success: false, error: "No trades available to analyze." };
    }

    // Filter last 20 trades for context
    const recentTrades = trades.slice(0, 20).map(t => ({
        date: t.date,
        pair: t.pair,
        direction: t.direction,
        result: t.result,
        pnl: t.pnl,
        risk: t.risk,
        entryPrice: t.entryPrice,
        exitPrice: t.exitPrice,
        exitReason: t.exitReason,
        notes: t.notes
    }));

    const prompt = `
    Act as a Professional Forex Trading Mentor and Risk Manager.
    Analyze the following recent trading history for account "${accountName}".
    
    Data:
    ${JSON.stringify(recentTrades, null, 2)}

    Please provide a concise but impactful analysis covering:
    1. **Psychology check**: Do you see revenge trading, over-leveraging after losses, or hesitation?
    2. **Performance**: Brief comment on Win Rate vs Risk:Reward.
    3. **Actionable Advice**: 2-3 specific things to focus on next session.

    Format the response in clean Markdown. Use bolding for key points. Keep it under 200 words.
  `;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return { success: true, analysis: text };
    } catch (error) {
        console.error("Gemini AI Error:", error);
        return { success: false, error: "Failed to generate analysis. Please try again." };
    }
}
