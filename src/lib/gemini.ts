import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('Gemini API key is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(apiKey);

export async function getGeminiResponse(input: string, language: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      Respond to the following query about ${language} vocabulary or language:
      "${input}"
      
      Use **double asterisks** for bold text and *single asterisks* for italic text in your response.
      Use line breaks for paragraph separation.
      
      After your response, on a new line, add "VOCABULARIES:" followed by a comma-separated list of key ${language} vocabulary words or phrases from your explanation, in this format:
      word - meaning, word - meaning
      
      For example:
      VOCABULARIES: bonjour - hello/good day, merci - thank you
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}
