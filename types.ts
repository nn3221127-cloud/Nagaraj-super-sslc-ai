
export enum LearnerMode {
  FAST_A = 'A',
  SLOW_C = 'C'
}

export enum ExamPrediction {
  UNKNOWN = 'Unknown',
  FAIL_RISK = 'FAIL RISK',
  PASS = 'PASS',
  FIRST_CLASS = 'FIRST CLASS',
  DISTINCTION = 'DISTINCTION'
}

export interface SessionResult {
  concept: string;
  score: number;
  confidence: number;
  timestamp: number;
  feedback: string;
}

export interface StudentProfile {
  name: string;
  scores: number[];
  mastery: Record<string, number>;
  sessions: SessionResult[];
}

export interface EvaluationResult {
  isCorrect: boolean;
  finalAnswer: string;
  explanation: string;
}

export interface SyllabusStructure {
  [subject: string]: {
    [topic: string]: string[];
  };
}
