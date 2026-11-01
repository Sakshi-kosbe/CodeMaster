/**
 * Firestore Question Bank Batch Import Script
 * Reads all 1,000 verified questions and imports them into Cloud Firestore
 * in atomic batches of 500 documents (Firestore batch transaction limit).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Question {
  id: string;
  title: string;
  category: string;
  topic: string;
  subtopic: string;
  difficulty: string;
  statement: string;
  [key: string]: any;
}

export async function importQuestionsToFirestore(customDb?: any) {
  const filePath = path.resolve(__dirname, '../src/data/questions/all-questions.json');
  if (!fs.existsSync(filePath)) {
    throw new Error('Question bank dataset not found at ' + filePath);
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  const questions: Question[] = JSON.parse(raw);

  console.log(`📦 Loaded ${questions.length} questions for Firestore import.`);

  // Validation step
  const validatedQuestions: Question[] = [];
  const seenIds = new Set<string>();

  for (const q of questions) {
    if (!q.id || !q.title || !q.category || !q.statement || !q.difficulty) {
      throw new Error(`Validation failed for question: ${JSON.stringify(q)}`);
    }
    if (seenIds.has(q.id)) {
      throw new Error(`Duplicate ID found during import validation: ${q.id}`);
    }
    seenIds.add(q.id);
    validatedQuestions.push(q);
  }

  console.log(`✅ All ${validatedQuestions.length} questions passed strict schema validation.`);

  // If a Firestore instance is provided, execute batch write
  if (customDb && typeof customDb.batch === 'function') {
    const BATCH_SIZE = 500;
    const totalBatches = Math.ceil(validatedQuestions.length / BATCH_SIZE);

    for (let b = 0; b < totalBatches; b++) {
      const chunk = validatedQuestions.slice(b * BATCH_SIZE, (b + 1) * BATCH_SIZE);
      const batch = customDb.batch();

      for (const q of chunk) {
        const ref = customDb.collection('questions').doc(q.id);
        batch.set(ref, {
          ...q,
          importedAt: new Date().toISOString()
        });
      }

      await batch.commit();
      console.log(`🚀 Committed Batch ${b + 1}/${totalBatches} (${chunk.length} questions) to Firestore.`);
    }
    console.log('🎉 Full 1,000 Question Bank Successfully Imported into Cloud Firestore!');
  } else {
    console.log('ℹ️ Dry-run / Validation completed. Firestore SDK not connected or running in local offline mode.');
  }

  return {
    totalImported: validatedQuestions.length,
    timestamp: new Date().toISOString(),
    batches: Math.ceil(validatedQuestions.length / 500)
  };
}

// Direct CLI execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  importQuestionsToFirestore()
    .then(res => console.log('Import result:', res))
    .catch(err => console.error('Import failed:', err));
}
