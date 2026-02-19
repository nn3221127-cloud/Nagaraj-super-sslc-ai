
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { LearnerMode, EvaluationResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// EXAM PAPER INTELLIGENCE (Extracted from user's 2026 Preparatory Papers)
const PAPER_ANALYSIS = `
PAPER PATTERN & WEIGHTAGE:
- Highly Repeated: Myopia (causes/lens), Ohm's Law (factors/formula), Magnetic Field Lines (properties), Circuit Resistance (Parallel/Series calculation), Sex Determination (XY chromosomes), Hydrogenation (Vanaspati), Solder/Amalgam/Hydrocarbons.
- Science Pattern: One-word definitions, Application of laws, Ray diagrams (F1 location), Balancing Equations.
- Math Pattern: HCF/LCM formula, Trigonometric identities, Section formula, Statistics (Mean/Median).

STRICT RULES:
1. Fast Learner (A): Use Application-level questions. Mixed concepts. Multi-step numericals.
2. Slow Learner (C): MISSION 40+. Use ONLY repeated questions and board-essential definitions. 
3. Science Flow: Generate ONE clear exam question. Wait for answer.
4. Feedback Flow: Return 'Correct' or 'Wrong'. ONLY show explanation if Wrong.
5. Voice: Strict examiner + kind teacher. No emojis. No greetings. Short replies.
`;

export async function generateStrictQuestion(concept: string, mode: LearnerMode): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `MISSION: Generate ONE board-style question for "${concept}" for a Learner Mode ${mode}.
    If ${mode} is C: Focus on REPEATED questions from 2026 prep papers (e.g., definitions, basic properties).
    If ${mode} is A: Focus on numericals, diagrams, or deeper logic.
    Return ONLY the question.`,
    config: {
      systemInstruction: PAPER_ANALYSIS,
      temperature: 0.7,
    }
  });

  return response.text.trim();
}

export async function evaluateStrictAnswer(
  concept: string, 
  question: string, 
  answer: string, 
  mode: LearnerMode
): Promise<EvaluationResult> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Question: ${question}
    Student Answer: ${answer}
    Evaluate for Learner Mode ${mode}.`,
    config: {
      systemInstruction: PAPER_ANALYSIS + "\nEvaluate the answer. Return JSON only.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isCorrect: { type: Type.BOOLEAN },
          finalAnswer: { type: Type.STRING, description: "The textbook correct answer" },
          explanation: { type: Type.STRING, description: "Step-by-step logic if wrong" }
        },
        required: ["isCorrect", "finalAnswer", "explanation"]
      }
    }
  });

  return JSON.parse(response.text);
}

export async function speakText(text: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const data = decode(base64Audio);
    const audioBuffer = await decodeAudioData(data, audioContext, 24000, 1);
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();
  } catch (e) {
    console.error("TTS Error:", e);
  }
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export async function searchDoubt(query: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Solve SSLC doubt: "${query}" using KSEAB patterns.`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
    title: chunk.web?.title || "Reference",
    uri: chunk.web?.uri
  })).filter((s: any) => s.uri) || [];

  return {
    text: response.text,
    sources
  };
}
