import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from './env';

let client: GoogleGenerativeAI | null = null;

export function getGemini() {
  if (!client) {
    if (!env.geminiApiKey) throw new Error('GEMINI_API_KEY not set');
    client = new GoogleGenerativeAI(env.geminiApiKey);
  }
  return client;
}

export async function chatOnce(userText: string) {
  const genAI = getGemini();
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const safetyPrefix = `You are CampusCare, a supportive, non-clinical assistant for students.\n` +
    `If a user expresses self-harm or imminent danger, encourage reaching out to emergency services or campus counseling.\n` +
    `Be empathetic, brief, and offer coping strategies and resources. You are not a licensed therapist.`;
  const prompt = `${safetyPrefix}\n\nUser: ${userText}`;
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return text;
}

export async function classifyRisk(userText: string): Promise<{ score: number; labels: string[] }> {
  const genAI = getGemini();
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const instruction = `You are a classifier for mental health risk in short messages.\n` +
    `Return STRICT JSON with fields: score (0..1) and labels (array of strings among [anxiety, depression, self_harm, crisis, stress, loneliness, other]).\n` +
    `If imminent danger or self-harm is explicit, score>=0.9 and include 'self_harm' or 'crisis'. No extra text.`;
  const prompt = `${instruction}\n\nText: ${userText}\nJSON:`;
  try {
    const res = await model.generateContent(prompt);
    const text = res.response.text().trim();
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart >= 0 && jsonEnd > jsonStart) {
      const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
      let score = Number(parsed.score);
      if (!Number.isFinite(score)) score = 0;
      const labels = Array.isArray(parsed.labels) ? parsed.labels.map(String) : [];
      return { score: Math.max(0, Math.min(1, score)), labels };
    }
  } catch {
    // ignore
  }
  return { score: 0, labels: [] };
}
