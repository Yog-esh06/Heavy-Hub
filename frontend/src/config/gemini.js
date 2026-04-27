const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `You are HeavyHub Assistant, a helpful AI for a heavy equipment rental marketplace in India.
You help users with:
- Finding the right equipment for their needs (tractors, harvesters, JCBs, excavators, bulldozers, cranes)
- Understanding pricing (equipment is priced in INR per day)
- Booking process: browse -> add to cart -> confirm booking -> get driver assigned
- Driver requests: users can choose to rent with or without a driver
- Cancellation policy: 90% refund if cancelled 48hrs before, 50% if 24-48hrs, no refund under 24hrs
- Listing equipment: owners can list for rent, sale, or both
- Driver application: anyone can apply to be a driver through their dashboard

Keep responses short, friendly, and specific to heavy equipment rental in India.
Always respond in the same language the user writes in.
If asked something unrelated to HeavyHub, politely redirect to equipment-related help.`;

export async function askGemini(userMessage, conversationHistory = []) {
  if (!GEMINI_API_KEY) {
    return "Please add your Gemini API key to enable AI responses. Get a free key at aistudio.google.com";
  }

  const contents = [
    ...conversationHistory.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    })),
    {
      role: "user",
      parts: [{ text: userMessage }],
    },
  ];

  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      },
    }),
  });

  if (!response.ok) {
    let errorMessage = "Gemini API error";

    try {
      const err = await response.json();
      errorMessage = err.error?.message || errorMessage;
    } catch {
      errorMessage = "Gemini API error";
    }

    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "I could not generate a response right now.";
}
