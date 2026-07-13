// Server functions for AI-powered placement assistant features.
// Callable from client via useServerFn / direct import.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callGateway, callGatewayJson, type ChatMessage } from "./ai-gateway.server";

// ---------- CHAT ----------
const ChatInput = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(8000),
      }),
    )
    .min(1)
    .max(50),
});

export const chatCompletion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => ChatInput.parse(data))
  .handler(async ({ data }) => {
    const messages: ChatMessage[] = [
      {
        role: "system",
        content:
          "You are an AI Placement Assistant helping students prepare for tech interviews and job placements. Be encouraging, concise, and structure answers with markdown (headings, lists, code blocks). Focus on practical, actionable advice.",
      },
      ...data.messages,
    ];
    const reply = await callGateway(messages);
    return { reply };
  });

// ---------- HR INTERVIEW ----------
const InterviewGenInput = z.object({
  role: z.string().min(1).max(120),
  previousQuestions: z.array(z.string()).max(20).optional(),
});

export const generateInterviewQuestion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => InterviewGenInput.parse(d))
  .handler(async ({ data }) => {
    const prev = data.previousQuestions?.length
      ? `Avoid repeating these already-asked questions:\n${data.previousQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}`
      : "";
    const result = await callGatewayJson<{ question: string }>(
      [
        {
          role: "system",
          content:
            "You are a senior HR interviewer. Return a single realistic HR interview question. Respond as JSON: {\"question\": string}",
        },
        {
          role: "user",
          content: `Role: ${data.role}\n${prev}\nGive one thoughtful HR interview question.`,
        },
      ],
      { temperature: 0.9 },
    );
    return result;
  });

const InterviewEvalInput = z.object({
  role: z.string().min(1).max(120),
  question: z.string().min(1).max(2000),
  answer: z.string().min(1).max(8000),
});

export const evaluateInterviewAnswer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => InterviewEvalInput.parse(d))
  .handler(async ({ data }) => {
    return callGatewayJson<{
      score: number;
      strengths: string[];
      weaknesses: string[];
      improvedAnswer: string;
      tips: string[];
    }>([
      {
        role: "system",
        content:
          "You are an expert HR interview coach. Evaluate the candidate's answer and return STRICT JSON with keys: score (0-10 number), strengths (string[]), weaknesses (string[]), improvedAnswer (string, markdown ok), tips (string[]). No prose outside JSON.",
      },
      {
        role: "user",
        content: `Role: ${data.role}\nQuestion: ${data.question}\nAnswer: ${data.answer}`,
      },
    ]);
  });

// ---------- RESUME REVIEW ----------
const ResumeInput = z.object({
  filename: z.string().min(1).max(200),
  // base64 (no data: prefix)
  base64: z.string().min(10),
  mimeType: z.string().min(3).max(100),
});

export const reviewResume = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ResumeInput.parse(d))
  .handler(async ({ data }) => {
    const dataUrl = `data:${data.mimeType};base64,${data.base64}`;
    return callGatewayJson<{
      atsScore: number;
      missingSkills: string[];
      grammarIssues: string[];
      betterSummary: string;
      betterProjects: string[];
      suggestions: string[];
      overallVerdict: string;
    }>(
      [
        {
          role: "system",
          content:
            "You are an expert career coach and ATS resume reviewer. Return STRICT JSON: {atsScore (0-100 number), missingSkills (string[]), grammarIssues (string[]), betterSummary (string, markdown), betterProjects (string[] rewritten bullets), suggestions (string[]), overallVerdict (string)}",
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Review this resume PDF in depth." },
            { type: "file", file: { filename: data.filename, file_data: dataUrl } },
          ],
        },
      ],
      { model: "google/gemini-2.5-flash" },
    );
  });

// ---------- COMPANY PREP ----------
const CompanyInput = z.object({
  company: z.string().min(1).max(120),
  role: z.string().max(120).optional(),
});

export const companyPrep = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => CompanyInput.parse(d))
  .handler(async ({ data }) => {
    return callGatewayJson<{
      overview: string;
      interviewProcess: string;
      technicalQuestions: string[];
      hrQuestions: string[];
      salaryQuestions: string[];
      tips: string[];
    }>([
      {
        role: "system",
        content:
          "You are a placement expert. Return STRICT JSON: {overview (markdown string), interviewProcess (markdown string), technicalQuestions (string[]), hrQuestions (string[]), salaryQuestions (string[]), tips (string[])}",
      },
      {
        role: "user",
        content: `Company: ${data.company}${data.role ? `\nRole: ${data.role}` : ""}\nGive complete placement preparation.`,
      },
    ]);
  });

// ---------- DSA PRACTICE ----------
const DsaInput = z.object({
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  topic: z.string().max(80).optional(),
});

export const generateDsaProblem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => DsaInput.parse(d))
  .handler(async ({ data }) => {
    return callGatewayJson<{
      title: string;
      statement: string;
      examples: Array<{ input: string; output: string; explanation?: string }>;
      constraints: string[];
      hints: string[];
      optimalSolution: string; // markdown with code block
      timeComplexity: string;
      spaceComplexity: string;
      explanation: string;
    }>(
      [
        {
          role: "system",
          content:
            "You are a DSA coach. Generate a coding problem and full solution. Return STRICT JSON with keys: title, statement (markdown), examples (array of {input, output, explanation}), constraints (string[]), hints (string[] progressive), optimalSolution (markdown with a fenced code block, preferably Python), timeComplexity, spaceComplexity, explanation (markdown).",
        },
        {
          role: "user",
          content: `Difficulty: ${data.difficulty}${data.topic ? `\nTopic: ${data.topic}` : ""}\nGenerate one fresh original problem.`,
        },
      ],
      { temperature: 0.8 },
    );
  });
