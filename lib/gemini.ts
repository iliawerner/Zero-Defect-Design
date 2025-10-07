interface GeminiContentPart {
  text: string;
}

interface GeminiContent {
  role: 'user' | 'model';
  parts: GeminiContentPart[];
}

export interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: GeminiContentPart[];
    };
    finishReason?: string;
  }>;
}

const GEMINI_API_KEY = process.env.Zero_Defect_Gemini;
const GEMINI_MODEL = 'gemini-2.5-pro-latest';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

async function makeGeminiRequest(contents: GeminiContent[], abortSignal?: AbortSignal) {
  if (!GEMINI_API_KEY) {
    throw new Error('Переменная окружения Zero_Defect_Gemini не задана.');
  }

  const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: abortSignal,
    body: JSON.stringify({ contents }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API вернул ошибку: ${response.status} ${error}`);
  }

  return (await response.json()) as GeminiResponse;
}

export async function callGemini(prompt: string, context: unknown) {
  const contextString = JSON.stringify(context ?? {}, null, 2);
  const contents: GeminiContent[] = [
    {
      role: 'user',
      parts: [
        {
          text: `${prompt}\n\nКонтекст:\n${contextString}`,
        },
      ],
    },
  ];

  const response = await makeGeminiRequest(contents);
  const text = response.candidates?.[0]?.content?.parts?.map((part) => part.text).join('\n');

  if (!text) {
    throw new Error('Gemini не вернул текстовый ответ.');
  }

  return text.trim();
}
