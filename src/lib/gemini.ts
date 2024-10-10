import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function getGeminiResponse(input: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
  Respond to the following query about vocabulary or language:
  "${input}"
  
  Use **double asterisks** for bold text and *single asterisks* for italic text in your response.
  
  After your response, on a new line, add "VOCABULARIES:" followed by a comma-separated list of key vocabulary words or phrases from your explanation.
  
  Example format:
  Here's an explanation of the **word** or *concept*...
  VOCABULARIES: word1, word2, phrase1, word3
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}