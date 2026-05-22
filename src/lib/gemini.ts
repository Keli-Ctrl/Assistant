import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function generateAIResponse(systemPrompt: string, history: { role: "user" | "assistant", content: string }[]) {
  try {
    const chat = model.startChat({
      history: history.map(msg => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      })),
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    // Gemini doesn't have a direct "system prompt" in startChat like Claude, 
    // but we can prepend it to the message or use systemInstruction if the SDK version supports it.
    // In newer versions of the SDK, you can pass systemInstruction when getting the model.
    
    const result = await chat.sendMessage(systemPrompt + "\n\nUser message: " + history[history.length - 1].content);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API error:", error);
    throw error;
  }
}

// Alternatively, creating the model with system instructions is better if supported.
export async function generateGeminiResponse(systemInstruction: string, history: { role: "user" | "assistant", content: string }[]) {
    try {
      const modelWithSystem = genAI.getGenerativeModel({ 
          model: "gemini-1.5-flash",
          systemInstruction: systemInstruction
      });
  
      const chat = modelWithSystem.startChat({
      history: history.slice(0, -1).map(msg => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      })),
    });

    const lastMessage = history[history.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    const response = await result.response;
    return response.text();
    } catch (error) {
      console.error("Gemini API error:", error);
      throw error;
    }
  }
