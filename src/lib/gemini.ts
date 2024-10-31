import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('Gemini API key is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(apiKey);

// Move getCustomLanguagePrompt inside getGeminiResponse to access input parameter
export async function getGeminiResponse(input: string, language: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const getCustomLanguagePrompt = (lang: string, userInput: string) => `
      Respond to the following query about ${lang} vocabulary or language:
      "${userInput}"
      
      Use **double asterisks** for bold text and *single asterisks* for italic text in your response.
      Use line breaks for paragraph separation.
      
      After your response, on a new line, add "VOCABULARIES:" followed by a comma-separated list of key ${lang} vocabulary words or phrases from your explanation.
    `;

    const languagePrompts = {
      english: `
        Respond to the following query about English vocabulary or language:
        "${input}"
        
        Use **double asterisks** for bold text and *single asterisks* for italic text in your response.
        Use line breaks for paragraph separation.
        
        After your response, on a new line, add "VOCABULARIES:" followed by a comma-separated list of key English vocabulary words or phrases from your explanation.
      `,
      french: `
        Répondez à la question suivante sur le vocabulaire ou la langue française:
        "${input}"
        
        Utilisez **double astérisques** pour le texte en gras et *astérisques simples* pour l'italique.
        Utilisez des sauts de ligne pour la séparation des paragraphes.
        
        Après votre réponse, sur une nouvelle ligne, ajoutez "VOCABULAIRES:" suivi d'une liste de mots ou expressions clés en français, séparés par des virgules.
      `,
      spanish: `
        Responde a la siguiente consulta sobre vocabulario o lenguaje español:
        "${input}"
        
        Usa **doble asterisco** para texto en negrita y *asterisco simple* para cursiva.
        Usa saltos de línea para separar párrafos.
        
        Después de tu respuesta, en una nueva línea, añade "VOCABULARIOS:" seguido de una lista de palabras o frases clave en español, separadas por comas.
      `
    };

    // Use custom prompt if language is not in predefined list
    const prompt = languagePrompts[language as keyof typeof languagePrompts] || 
      getCustomLanguagePrompt(language, input);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}
