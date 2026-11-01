/**
 * Core type definitions for CodeMaster - Python & DSA Academy
 */

export type Category = 'python' | 'dsa' | 'cs-fundamentals';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type QuestionType = 'coding' | 'conceptual';

export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  explanation?: string;
}

export interface ExampleCase {
  input: string;
  output: string;
  explanation?: string;
}

export interface Question {
  id: string;
  title: string;
  category: Category;
  topic: string;
  subtopic: string;
  difficulty: Difficulty;
  relevance: string;
  type: QuestionType;
  statement: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string[];
  examples: ExampleCase[];
  starterCode: string;
  solution: string;
  testCases: TestCase[];
  explanation: string;
  algorithm: string[];
  timeComplexity: string;
  spaceComplexity: string;
  relatedConcepts: string[];
  commonMistakes: string[];
  // For conceptual multiple choice or short answer questions:
  conceptualOptions?: string[];
  correctOptionIndex?: number;
}

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  error?: string;
  executionTimeMs: number;
  testResults?: {
    total: number;
    passed: number;
    failed: number;
    details: Array<{
      testIndex: number;
      input: string;
      expected: string;
      actual: string;
      passed: boolean;
      isHidden: boolean;
      error?: string;
    }>;
  };
}

export interface RevisionItem {
  questionId: string;
  nextReviewDate: string; // YYYY-MM-DD
  revisionLevel: number; // 1 (1d), 2 (3d), 3 (7d), 4 (14d), 5 (30d)
  lastReviewedAt: number;
}

export interface TestResultItem {
  questionId: string;
  title: string;
  isCorrect: boolean;
  timeTakenSeconds: number;
  topic: string;
}

export interface TimedTestSession {
  id: string;
  testName: string;
  category: string;
  difficulty: string;
  durationMinutes: number;
  questions: Question[];
  currentQuestionIndex: number;
  userAnswers: Record<string, string>; // questionId -> code or option
  reviewedQuestions: Record<string, boolean>;
  startTime: number;
  timeRemainingSeconds: number;
  isCompleted: boolean;
}

export interface TimedTestResult {
  id: string;
  testName: string;
  category: string;
  difficulty: string;
  totalMarks: number;
  score: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unattemptedQuestions: number;
  accuracy: number;
  timeSpentSeconds: number;
  date: string;
  topicPerformance: Record<string, { total: number; correct: number }>;
  recommendations: string[];
  details: TestResultItem[];
}

export interface UserPreferences {
  theme: 'dark' | 'light';
  editorFontSize: number;
  uiFontSize: 'normal' | 'compact' | 'large';
  autoSaveCode: boolean;
  soundEnabled: boolean;
  dailyGoalQuestions: number;
  weeklyTargetQuestions: number;
}

export interface UserProgressData {
  userId: string;
  displayName: string;
  email: string | null;
  isGuest: boolean;
  xp: number;
  streak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  totalCodingTimeSeconds: number;
  solvedQuestions: Record<string, {
    solvedAt: number;
    bestTimeMs: number;
    attempts: number;
    code: string;
  }>;
  attemptedQuestions: Record<string, {
    lastAttemptAt: number;
    attempts: number;
    lastCode: string;
  }>;
  bookmarkedQuestionIds: string[];
  difficultQuestionIds: string[];
  notes: Record<string, string>; // questionId -> markdown note
  revisionQueue: RevisionItem[];
  dailyChallenges: Record<string, {
    date: string;
    questionId: string;
    completed: boolean;
    completedAt?: string;
  }>;
  timedTestHistory: TimedTestResult[];
  activityCalendar: Record<string, number>; // YYYY-MM-DD -> submissions count
  completedLessons: string[]; // lesson IDs
  unlockedAchievements: string[]; // achievement IDs
}

export interface Lesson {
  id: string;
  category: 'python' | 'dsa';
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  topic: string;
  title: string;
  summary: string;
  content: string; // markdown explanation & syntax
  codeExample: string;
  expectedOutput: string;
  practicalUseCases: string[];
  commonMistakes: string[];
  practiceQuestionIds: string[];
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpBonus: number;
  unlocked: boolean;
  progress: number;
  target: number;
}
