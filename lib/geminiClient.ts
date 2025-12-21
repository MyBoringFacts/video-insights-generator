import { GoogleGenerativeAI } from "@google/generative-ai";

// Use GEMINI_API_KEY or GOOGLE_API_KEY for compatibility
const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const DEFAULT_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

if (!API_KEY) {
  // We don't throw here to avoid crashing the build, but all callers will
  // see a clear error if the key is missing.
  // eslint-disable-next-line no-console
  console.warn(
    "[geminiClient] GEMINI_API_KEY or GOOGLE_API_KEY is not set. API calls will fail at runtime.",
  );
}

// Initialize the Gemini client
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

function isYouTubeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const youtubeDomains = [
      "www.youtube.com",
      "m.youtube.com",
      "youtube.com",
      "youtu.be",
    ];
    return youtubeDomains.includes(parsed.hostname);
  } catch {
    return false;
  }
}

async function callGeminiAPI(
  parts: (string | { fileData: { fileUri: string; mimeType?: string } })[],
  model: string = DEFAULT_MODEL,
  apiKey?: string,
): Promise<string> {
  // Use provided API key, fallback to env variable
  const effectiveApiKey = apiKey || API_KEY;
  
  if (!effectiveApiKey) {
    throw new Error(
      "Gemini API key is missing. This application requires you to bring your own API key. Get your free API key at https://aistudio.google.com/app/apikey",
    );
  }

  // Create client with the effective API key
  const client = new GoogleGenerativeAI(effectiveApiKey);

  // Remove "models/" prefix if present
  const modelName = model.replace(/^models\//, "");
  
  // eslint-disable-next-line no-console
  console.log(`[geminiClient] Calling Gemini API with model: ${modelName}`);

  try {
    const geminiModel = client.getGenerativeModel({ 
      model: modelName,
    });

    // Use type assertion to match SDK's expected format
    const result = await geminiModel.generateContent(parts as any);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error("Gemini API returned an empty response.");
    }

    return text;
  } catch (error: any) {
    // Handle API key validation errors
    const errorMessage = error?.message || String(error);
    const errorStatus = error?.status || error?.statusCode;
    
    // Check for invalid API key errors
    if (
      errorStatus === 401 ||
      errorStatus === 403 ||
      errorMessage?.toLowerCase().includes("api key") ||
      errorMessage?.toLowerCase().includes("authentication") ||
      errorMessage?.toLowerCase().includes("invalid api key") ||
      errorMessage?.toLowerCase().includes("permission denied") ||
      errorMessage?.toLowerCase().includes("api key not valid")
    ) {
      const apiKeyError = new Error("Invalid API key. Please check your Gemini API key and try again. Get your free API key at https://aistudio.google.com/app/apikey");
      (apiKeyError as any).statusCode = 401;
      (apiKeyError as any).isApiKeyError = true;
      throw apiKeyError;
    }

    // Handle 404 errors (model not found)
    if (errorStatus === 404 || errorMessage?.includes("404")) {
      throw new Error(
        `Gemini API error (404 Not Found): ${errorMessage}. ` +
          `Model used: ${modelName}. ` +
          "This often means the model is invalid or not enabled for your API key. " +
          "Common valid models: 'gemini-2.5-flash', 'gemini-2.0-flash-exp', 'gemini-1.5-flash'. " +
          "Verify the model name in your Google AI Studio.",
      );
    }

    // Handle other errors
    throw new Error(
      `Gemini API error: ${errorMessage}`,
    );
  }
}

export async function processVideo(
  videoSource: string,
  prompt: string,
  apiKey?: string,
): Promise<string> {
  // For now we support YouTube URLs (fileUri form), which matches the
  // "Pass YouTube URLs" flow in the Gemini video understanding docs:
  // https://ai.google.dev/gemini-api/docs/video-understanding#javascript_1
  if (!isYouTubeUrl(videoSource)) {
    throw new Error(
      "Only YouTube URLs are supported from the Next.js runtime right now.",
    );
  }

  // Match the SDK format: text prompt first, then fileData
  // According to docs: https://ai.google.dev/gemini-api/docs/video-understanding#javascript_1
  const parts = [
    prompt,
    {
      fileData: {
        fileUri: videoSource,
        mimeType: "video/*",
      },
    } as any,
  ];

  return callGeminiAPI(parts, DEFAULT_MODEL, apiKey);
}

export async function getTranscript(videoSource: string, apiKey?: string): Promise<string> {
  const prompt =
    "Please transcribe this video. Include all spoken content, clearly identifying speakers if possible.";
  return processVideo(videoSource, prompt, apiKey);
}

export async function summarizeFromTranscript(
  transcript: string,
  apiKey?: string,
): Promise<string> {
  const prompt = `
You are an assistant that summarizes meeting or video transcripts.
Based on the following transcript, provide a concise summary of the content.
Focus on the main discussion points, key decisions made, and overall outcomes.
Make sure the summary is well-structured with clear sections and bullet points where helpful.

IMPORTANT: The summary must be less than 200 words. Be concise and focus only on the most important information.

TRANSCRIPT:
${transcript}
`;

  return callGeminiAPI([prompt], DEFAULT_MODEL, apiKey);
}

export async function extractActionItemsFromTranscript(
  transcript: string,
  apiKey?: string,
): Promise<string> {
  const prompt = `
You are an assistant that extracts actionable tasks from transcripts.
Based on the following transcript, extract all action items.

For each action item, identify:
1. The specific task to be completed
2. The person or team assigned to the task (owner)
3. The deadline or due date, if mentioned

Format each action item with clear labels for Task, Owner, and Deadline.
If any information is not specified, mark it as "Unspecified".

Example format:
ACTION ITEM 1
Task: [task description]
Owner: [owner name or team]
Deadline: [deadline or Unspecified]

ACTION ITEM 2
Task: [task description]
Owner: [owner name or team]
Deadline: [deadline or Unspecified]

TRANSCRIPT:
${transcript}
`;

  return callGeminiAPI([prompt], DEFAULT_MODEL, apiKey);
}

export async function getInsightsFromTranscript(
  transcript: string,
  apiKey?: string,
): Promise<string> {
  const prompt = `
You are an assistant that extracts key insights from transcripts.
Based on the following transcript, identify 5-7 key insights, learnings,
or important points discussed.

Format the response as a clear bulleted list with detailed explanations for each insight.

TRANSCRIPT:
${transcript}
`;

  return callGeminiAPI([prompt], DEFAULT_MODEL, apiKey);
}

export async function answerQuestion(
  videoSource: string,
  question: string,
  apiKey?: string,
): Promise<string> {
  const prompt = `Based on this video, please answer the following question: ${question}`;
  return processVideo(videoSource, prompt, apiKey);
}

export async function answerQuestionFromTranscript(
  transcript: string,
  question: string,
  apiKey?: string,
): Promise<string> {
  const prompt = `Based on the following video (in text format), please answer the question.

VIDEO TRANSCRIPT:
${transcript}

QUESTION: ${question}

Please provide a clear and consice answer based only on the information in the video. 
If the transcript doesn't contain enough information to answer the question, please say so.`;

  return callGeminiAPI([prompt], DEFAULT_MODEL, apiKey);
}

export async function analyzeVideo(
  videoSource: string,
  includeSummary: boolean = true,
  apiKey?: string,
): Promise<{
  summary?: string;
  actionItems: string;
  insights: string;
  transcript: string;
}> {
  const transcript = await getTranscript(videoSource, apiKey);

  const [summary, actionItems, insights] = await Promise.all([
    includeSummary ? summarizeFromTranscript(transcript, apiKey) : Promise.resolve(""),
    extractActionItemsFromTranscript(transcript, apiKey),
    getInsightsFromTranscript(transcript, apiKey),
  ]);

  return {
    summary: includeSummary ? summary : undefined,
    actionItems,
    insights,
    transcript,
  };
}
