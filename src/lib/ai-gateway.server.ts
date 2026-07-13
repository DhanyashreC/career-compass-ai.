import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content:
    | string
    | Array<
        | { type: "text"; text: string }
        | { type: "image_url"; image_url: { url: string } }
        | { type: "file"; file: { filename: string; file_data: string } }
      >;
};

export interface CallOptions {
  model?: string;
  temperature?: number;
  responseJson?: boolean;
}

export async function callGateway(
  messages: ChatMessage[],
  opts: CallOptions = {}
): Promise<string> {
  const prompt = messages
    .map((m) =>
      typeof m.content === "string"
        ? `${m.role.toUpperCase()}:\n${m.content}`
        : `${m.role.toUpperCase()}: [Attached Content]`
    )
    .join("\n\n");

  const response = await ai.models.generateContent({
    model: opts.model ?? "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text ?? "";
}

export async function callGatewayJson<T>(
  messages: ChatMessage[],
  opts: CallOptions = {}
): Promise<T> {
  const text = await callGateway(messages, opts);

  const cleaned = text
    .replace(/^```json/i, "")
    .replace(/^```/i, "")
    .replace(/```$/, "")
    .trim();

  return JSON.parse(cleaned) as T;
}