// src/services/gemini.ts
// purpose: handles all Gemini API interactions for component generation

import { GoogleGenerativeAI } from "@google/generative-ai";

// initialize client once (singleton)
const genAI = new GoogleGenerativeAI(
  import.meta.env.VITE_GEMINI_API_KEY
);

// strict prompt template (important for clean output)
const buildPrompt = (userPrompt: string) => `
Return ONLY clean HTML.
No explanations.
No markdown.
No JSX.
Use Tailwind CSS for styling.
The output must have a single root element.
Use realistic content (names, prices, etc).

Component:
${userPrompt}
`;

export const generateComponent = async (prompt: string): Promise<string> => {
  try {
    // get model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.0-pro",
    });

    // call API
    const result = await model.generateContent(buildPrompt(prompt));

    const response = result.response;
    const text = response.text();

    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    return text;

  } catch (error) {
    console.error("Gemini Error:", error);

    // normalize error message
    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error("Failed to generate component");
  }
};