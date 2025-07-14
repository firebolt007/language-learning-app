/**
 * @file Service for interacting with Large Language Models (LLMs).
 * Abstracts the API calls to different providers like OpenAI.
 */

export interface LlmAnalysis {
  explanation: string;
  translation: string; // Chinese translation
  suggestedTags?: string[]; // e.g., ['grammar#tenses', 'topic#travel']

}

/**
 * Analyzes a word or phrase using an LLM (currently OpenAI).
 *
 * @param text The text to analyze.
 * @param apiKey The user's OpenAI API key.
 * @returns A promise that resolves to the analysis.
 */
export const analyzeTextWithLLM = async (text: string, apiKey: string): Promise<LlmAnalysis> => {
  // --- Prompt Engineering ---
  // We instruct the model to return a specific JSON format.
  // This makes the response predictable and easy to parse in our application.
  const prompt = `
    You are a language learning assistant. Analyze the following English text for a Chinese speaker.
    The text is: "${text}"

    Provide your analysis in a valid JSON format, with two keys:
    1. "explanation": A concise explanation of the word or phrase in English, including its part of speech and a simple example sentence.
    2. "translation": The most common and accurate Chinese translation.

    Do not include any text outside of the JSON object.
  `;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo', // A cost-effective and fast model
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3, // Lower temperature for more predictable, factual output
      response_format: { type: "json_object" }, // Ensures the output is a valid JSON
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`OpenAI API Error: ${errorData.error.message}`);
  }

  const data = await response.json();
  const analysis = JSON.parse(data.choices[0].message.content);
  return analysis as LlmAnalysis;
};