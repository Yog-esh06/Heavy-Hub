import { askGemini } from "../config/gemini";

export async function getAIResponse(userMessage, conversationHistory = []) {
  try {
    const response = await askGemini(userMessage, conversationHistory);
    return { success: true, message: response };
  } catch (error) {
    console.error("AI response error:", error);
    return {
      success: false,
      message: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
    };
  }
}
