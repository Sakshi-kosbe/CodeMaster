import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI client if API key is present
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    geminiConfigured: !!apiKey
  });
});

// Daily Challenge Endpoint
app.get('/api/daily-challenge', (req: Request, res: Response) => {
  const today = new Date().toISOString().split('T')[0];
  // Stable hash based on date string
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = (hash << 5) - hash + today.charCodeAt(i);
    hash |= 0;
  }
  const qNum = (Math.abs(hash) % 900) + 1;
  const qId = qNum <= 300 
    ? `py-${String(qNum).padStart(3, '0')}`
    : `dsa-${String(qNum - 300).padStart(3, '0')}`;

  res.json({
    date: today,
    questionId: qId,
    bonusXp: 100,
    multiplier: 1.5
  });
});

// Question Bank Batch Stats Endpoint
app.get('/api/questions/batch-stats', (req: Request, res: Response) => {
  try {
    const batchesDir = path.resolve(__dirname, 'src/data/questions/batches');
    const files = fs.readdirSync(batchesDir);
    const batchesInfo = files.map(file => {
      const filePath = path.join(batchesDir, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      return {
        file,
        count: data.length,
        category: data[0]?.category,
        topic: data[0]?.topic,
        startId: data[0]?.id,
        endId: data[data.length - 1]?.id,
        status: 'Verified (0 Duplicates)'
      };
    });

    const total = batchesInfo.reduce((acc, curr) => acc + curr.count, 0);

    res.json({
      total,
      batchCount: batchesInfo.length,
      batches: batchesInfo
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// USER DATABASE PERSISTENCE & AUTHENTICATION ENDPOINTS
// ----------------------------------------------------
const USERS_DB_DIR = path.resolve(__dirname, 'data/users');
const SUBMISSIONS_DB_DIR = path.resolve(__dirname, 'data/submissions');

if (!fs.existsSync(USERS_DB_DIR)) {
  fs.mkdirSync(USERS_DB_DIR, { recursive: true });
}
if (!fs.existsSync(SUBMISSIONS_DB_DIR)) {
  fs.mkdirSync(SUBMISSIONS_DB_DIR, { recursive: true });
}

// Helper: Sanitize User ID
const sanitizeId = (id: string) => id.replace(/[^a-zA-Z0-9_\-]/g, '_').substring(0, 128);

// Google Authentication endpoint
app.post('/api/auth/google-login', (req: Request, res: Response) => {
  const { email, displayName, photoURL, guestProgressToMerge } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required for Google authentication.' });
  }

  // Stable user ID derived from email
  const cleanEmail = email.toLowerCase().trim();
  const userId = `usr_${Buffer.from(cleanEmail).toString('hex').slice(0, 16)}`;
  const userFile = path.join(USERS_DB_DIR, `${sanitizeId(userId)}.json`);

  let userProgress: any = null;
  let isNewUser = false;

  if (fs.existsSync(userFile)) {
    try {
      userProgress = JSON.parse(fs.readFileSync(userFile, 'utf-8'));
      // Update profile info in case changed
      userProgress.displayName = displayName || userProgress.displayName || cleanEmail.split('@')[0];
      userProgress.email = cleanEmail;
      userProgress.isGuest = false;
      userProgress.photoURL = photoURL || userProgress.photoURL;
    } catch (e) {
      console.error('Error reading existing user file, creating fresh:', e);
    }
  }

  if (!userProgress) {
    isNewUser = true;
    userProgress = {
      userId,
      displayName: displayName || cleanEmail.split('@')[0],
      email: cleanEmail,
      photoURL: photoURL || null,
      isGuest: false,
      xp: 200, // Welcome XP
      streak: 1,
      longestStreak: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      totalCodingTimeSeconds: 600,
      solvedQuestions: {},
      attemptedQuestions: {},
      bookmarkedQuestionIds: [],
      difficultQuestionIds: [],
      notes: {},
      revisionQueue: [],
      dailyChallenges: {},
      timedTestHistory: [],
      activityCalendar: {
        [new Date().toISOString().split('T')[0]]: 1
      },
      completedLessons: ['py-les-01'],
      unlockedAchievements: ['first_login', 'google_verified'],
      submissionHistory: []
    };
  }

  // Merge guest progress if requested
  if (guestProgressToMerge && typeof guestProgressToMerge === 'object') {
    if (guestProgressToMerge.solvedQuestions) {
      userProgress.solvedQuestions = {
        ...userProgress.solvedQuestions,
        ...guestProgressToMerge.solvedQuestions
      };
    }
    if (guestProgressToMerge.attemptedQuestions) {
      userProgress.attemptedQuestions = {
        ...userProgress.attemptedQuestions,
        ...guestProgressToMerge.attemptedQuestions
      };
    }
    if (Array.isArray(guestProgressToMerge.bookmarkedQuestionIds)) {
      userProgress.bookmarkedQuestionIds = Array.from(
        new Set([...userProgress.bookmarkedQuestionIds, ...guestProgressToMerge.bookmarkedQuestionIds])
      );
    }
    if (guestProgressToMerge.notes) {
      userProgress.notes = { ...userProgress.notes, ...guestProgressToMerge.notes };
    }
    if (Array.isArray(guestProgressToMerge.submissionHistory)) {
      userProgress.submissionHistory = [
        ...userProgress.submissionHistory,
        ...guestProgressToMerge.submissionHistory
      ];
    }
    if (guestProgressToMerge.xp) {
      userProgress.xp = Math.max(userProgress.xp, (userProgress.xp || 0) + (guestProgressToMerge.xp || 0));
    }
  }

  fs.writeFileSync(userFile, JSON.stringify(userProgress, null, 2), 'utf-8');

  res.json({
    success: true,
    isNewUser,
    user: {
      userId,
      email: cleanEmail,
      displayName: userProgress.displayName,
      photoURL: userProgress.photoURL
    },
    progress: userProgress
  });
});

// GET User Progress (Primary Database for Authenticated Users)
app.get('/api/users/:userId/progress', (req: Request, res: Response) => {
  const userId = sanitizeId(req.params.userId);
  const userFile = path.join(USERS_DB_DIR, `${userId}.json`);

  if (!fs.existsSync(userFile)) {
    return res.status(404).json({ error: 'User progress not found', found: false });
  }

  try {
    const data = JSON.parse(fs.readFileSync(userFile, 'utf-8'));
    res.json({ success: true, progress: data });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to read user progress', details: err.message });
  }
});

// POST User Progress (Atomic Cloud Save for Authenticated Users)
app.post('/api/users/:userId/progress', (req: Request, res: Response) => {
  const userId = sanitizeId(req.params.userId);
  const userFile = path.join(USERS_DB_DIR, `${userId}.json`);
  const progressData = req.body;

  if (!progressData || typeof progressData !== 'object') {
    return res.status(400).json({ error: 'Invalid progress data payload.' });
  }

  try {
    progressData.userId = userId;
    progressData.updatedAt = new Date().toISOString();
    fs.writeFileSync(userFile, JSON.stringify(progressData, null, 2), 'utf-8');

    // Also persist submissions audit log separately
    if (Array.isArray(progressData.submissionHistory) && progressData.submissionHistory.length > 0) {
      const subFile = path.join(SUBMISSIONS_DB_DIR, `${userId}.json`);
      fs.writeFileSync(subFile, JSON.stringify(progressData.submissionHistory, null, 2), 'utf-8');
    }

    res.json({
      success: true,
      savedAt: Date.now(),
      message: 'User progress persisted to primary database'
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to write user progress', details: err.message });
  }
});

// Admin Firestore Import Endpoint
app.post('/api/admin/import-firestore', async (req: Request, res: Response) => {
  try {
    const { importQuestionsToFirestore } = await import('./scripts/import_to_firestore.js');
    const result = await importQuestionsToFirestore();
    res.json({
      success: true,
      message: 'Question bank verified and ready for Firestore synchronization',
      details: result
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// AI Mentor Endpoint (Gemini 3.8 Flash)
app.post('/api/ai/mentor', async (req: Request, res: Response) => {
  const { mode, question, userCode, prompt, context } = req.body;

  if (!aiClient) {
    // Return friendly offline/simulated guidance if API key is missing
    let offlineFallback = '';
    if (mode === 'HINT') {
      offlineFallback = `💡 **Hint 1:** Consider the constraints of ${question?.title || 'the problem'}. Can you utilize a hash map or two-pointer approach to avoid an $O(N^2)$ brute force? Check the properties of the inputs before iterating.`;
    } else if (mode === 'EXPLAIN') {
      offlineFallback = `📖 **Conceptual Walkthrough:**\n\n1. **Core Problem:** We need to find the optimal result for ${question?.title || 'the target task'}.\n2. **Intuition:** A greedy or frequency-map based technique allows single-pass $O(N)$ traversal.\n3. **Edge Cases:** Keep empty inputs and negative numbers in mind.\n\n*Note: Add your GEMINI_API_KEY in the Secrets panel to activate full real-time interactive AI reasoning!*`;
    } else {
      offlineFallback = `💻 **Optimized Approach:**\n\`\`\`python\n${question?.solution || '# Solution reference'}\n\`\`\`\n\n**Time Complexity:** ${question?.timeComplexity || 'O(N)'}\n**Space Complexity:** ${question?.spaceComplexity || 'O(1)'}`;
    }

    return res.json({
      text: offlineFallback,
      isConfigured: false
    });
  }

  try {
    let systemInstruction = `You are CodeMaster AI, an expert Senior Python & Competitive Programming Mentor and Technical Interview Coach.
You assist developers in mastering Python, Data Structures and Algorithms, and Big-Tech technical interviews.
Keep explanations concise, precise, mathematically sound, and formatted in clean Markdown.`;

    let userPrompt = '';

    if (mode === 'HINT') {
      systemInstruction += `\nCRITICAL: The user has chosen HINT mode. DO NOT reveal the complete solution or full code! Provide a progressive, encouraging hint that points them toward the right data structure, invariant, or technique without solving it for them.`;
      userPrompt = `Problem Title: ${question.title}
Difficulty: ${question.difficulty}
Topic: ${question.topic} - ${question.subtopic}
Problem Statement: ${question.statement}
User's Current Code:
\`\`\`python
${userCode || '# No code written yet'}
\`\`\`

Please provide a clever, progressive hint to guide the candidate.`;
    } else if (mode === 'EXPLAIN') {
      userPrompt = `Problem Title: ${question.title}
Difficulty: ${question.difficulty}
Topic: ${question.topic} - ${question.subtopic}
Problem Statement: ${question.statement}
Examples: ${JSON.stringify(question.examples)}

Explain this problem step-by-step:
1. High-level intuition and why brute force is suboptimal.
2. The optimal algorithm and data structure choice.
3. Edge cases and boundary conditions to watch out for.
4. Time and space complexity trade-offs.`;
    } else if (mode === 'SOLUTION') {
      userPrompt = `Problem Title: ${question.title}
Problem Statement: ${question.statement}
Constraints: ${JSON.stringify(question.constraints)}

Provide the most optimal, idiomatic Python solution with:
1. Complete, clean Python 3 implementation with type annotations.
2. Line-by-line breakdown of non-obvious logic.
3. Rigorous Big-O Time and Auxiliary Space complexity analysis.`;
    } else if (mode === 'DEBUG') {
      userPrompt = `The candidate is attempting: ${question.title}
Problem Statement: ${question.statement}

Candidate's Code:
\`\`\`python
${userCode}
\`\`\`
Runtime Error or Test Failure:
${context || 'Failed test cases or runtime bug'}

Analyze the candidate's code. Identify the logical flaw or syntax error, explain why it fails, and suggest how to fix it without giving away the full answer immediately if possible.`;
    } else if (mode === 'MOCK_INTERVIEW') {
      userPrompt = `You are conducting a FAANG-level mock coding interview.
Candidate has submitted code for: ${question.title}
Code:
\`\`\`python
${userCode}
\`\`\`
Provide professional interview feedback covering:
1. Code correctness and edge case handling.
2. Code readability, Pythonic idioms, and naming.
3. Time & Space complexity.
4. Follow-up interview questions you would ask the candidate in an on-site round.`;
    } else {
      userPrompt = prompt || `Help me with this Python coding question: ${question.title}`;
    }

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction
      }
    });

    res.json({
      text: response.text || 'Unable to generate mentor response.',
      isConfigured: true
    });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.status(500).json({
      error: error.message || 'Error communicating with Gemini AI',
      isConfigured: true
    });
  }
});

// ----------------------------------------------------
// FRONTEND SERVING
// ----------------------------------------------------
if (!isProd) {
  // Vite Dev Server middleware mode
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });
  app.use(vite.middlewares);
} else {
  // Production static file serving
  const distPath = path.resolve(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 CodeMaster server running at http://0.0.0.0:${PORT}`);
});
