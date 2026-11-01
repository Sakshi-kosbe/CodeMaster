# CodeMaster – Personal Python & DSA Coding Academy

CodeMaster is a production-ready, full-stack web application designed for mastering Python programming, Data Structures & Algorithms, and technical interviews.

## Features

- **1,000+ Curated Questions**:
  - **Python Programming (300)**: Python Basics (70), Data Structures (80), Functions & OOP (70), Advanced Python (40), Interview Questions (40).
  - **Data Structures & Algorithms (600)**: Arrays (70), Strings (50), Hashing (40), Two Pointers (35), Sliding Window (35), Sorting & Binary Search (45), Recursion & Backtracking (45), Linked Lists (35), Stacks & Queues (35), Trees & BST (50), Heaps & Priority Queues (25), Graphs (40), Dynamic Programming (55), Greedy (20), Bit Manipulation (20).
  - **Computer Science Fundamentals (100)**: OOP, DBMS & SQL, Operating Systems, Computer Networks, Time & Space Complexity, System Design.
- **In-Browser Python Execution (Pyodide WebAssembly)**:
  - Zero server-side code execution risks.
  - Safe sandboxed execution with `stdout`, `stderr`, execution timer, timeout guards, and automated test case assertions (sample + hidden).
- **Monaco Code Editor**:
  - Python syntax highlighting, bracket matching, custom input, copy, reset, and full-screen mode.
- **Interactive DSA Visualizer**:
  - Live algorithmic invariant demonstrations for Binary Search, Bubble Sort, Two Pointers, Stack & Queue, and Binary Tree In-Order traversal.
- **AI Coding Mentor (Gemini 3.8 Flash)**:
  - Server-side integration with `@google/genai` TypeScript SDK.
  - 3 Assistance Modes: Progressive Hint, Conceptual Explanation, and Optimized Solution with complexity breakdown.
  - Code debugging and mock technical interview evaluations.
- **Structured Learning Curriculum**:
  - Python Track: Beginner, Intermediate, and Advanced lessons with code demonstrations and checkpoint quizzes.
  - DSA Track: Tiered problem modules (Beginner, Intermediate, Advanced).
- **Spaced Repetition & Revision System**:
  - Scientific retention intervals: Level 1 (1 day), Level 2 (3 days), Level 3 (7 days), Level 4 (14 days), Level 5 (30 days).
  - Bookmarks and personal study notes archive.
- **Timed Coding Assessments**:
  - Predefined technical tests with active countdown timer, question navigator, flag for review, and comprehensive scorecard.
- **Daily Coding Challenge**:
  - Rotating date-based daily problems with streak tracking and bonus XP.
- **Dual-Layer Persistence**:
  - Instant local guest mode (LocalStorage & IndexedDB) requiring zero external setup.
  - Cloud Firestore and Firebase Auth ready with `firebase-blueprint.json` and zero-trust `firestore.rules`.
  - Full backup export/import (JSON).

## Environment Variables

Configured in `.env`:
- `PORT`: Port to bind the server to (default `3000`).
- `GEMINI_API_KEY`: API key for Gemini AI capabilities (injected via Google AI Studio Secrets).

## Running Locally

```bash
# Install dependencies
npm install

# Start development full-stack server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Import question bank batches into Cloud Firestore
npx tsx scripts/import_to_firestore.ts
```

## Question Bank Batches Directory

Structured under `src/data/questions/batches/`:
- `batch-01-python-basics.json`: 70 Questions (`py-001` - `py-070`)
- `batch-02-python-datastructures.json`: 80 Questions (`py-071` - `py-150`)
- `batch-03-python-oop-functions.json`: 70 Questions (`py-151` - `py-220`)
- `batch-04-python-advanced.json`: 40 Questions (`py-221` - `py-260`)
- `batch-05-python-interview.json`: 40 Questions (`py-261` - `py-300`)
- `batch-06-dsa-arrays.json` to `batch-20-dsa-bitmanip.json`: 600 Questions (`dsa-001` - `dsa-600`)
- `batch-21-cs-fundamentals.json`: 100 Questions (`cs-001` - `cs-100`)
Total: 1,000 verified questions with 0 duplicates.

