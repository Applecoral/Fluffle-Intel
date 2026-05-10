import { GoogleGenAI } from "@google/genai";
import { WalletProfile, InterpretedTransaction } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export async function generateWalletIntel(profile: WalletProfile, transactions: InterpretedTransaction[]) {
  const txSummary = transactions.slice(0, 10).map(tx => `- ${tx.sentence} (${tx.protocol}, ${tx.failed ? 'FAILED' : 'SUCCESS'})`).join('\n');
  
  const prompt = `
    Analyze this MegaETH wallet profile and transaction history.
    
    ADDRESS: ${profile.address}
    RANK: ${profile.rank}
    TOTAL POINTS: ${profile.allTimePoints}
    TOP PROTOCOL: ${profile.topProtocol}
    RECENT TXS:
    ${txSummary}
    
    Provide a concise, tactical "Intel Report" in 3 bullet points:
    1. The wallet's primary behavior (e.g., Aggressive Farmer, Serial Bridger, Failed Tactician).
    2. A specific observation about their protocol interaction.
    3. A tactical recommendation for this wallet.
    
    Keep the tone like a "black-ops" data terminal. Professional, cold, data-driven.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("AI Intel generation failed:", error);
    return "INTEL UNAVILABLE: SIGNAL INTERFERENCE DETECTED.";
  }
}
