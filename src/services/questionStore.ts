import { Question, Category, Difficulty } from '../types';
import allQuestionsRaw from '../data/questions/all-questions.json';

// In-memory indexed dataset
const allQuestions: Question[] = allQuestionsRaw as Question[];
const questionMap = new Map<string, Question>();
allQuestions.forEach(q => questionMap.set(q.id, q));

export interface FilterOptions {
  category?: Category | 'all';
  topic?: string;
  subtopic?: string;
  difficulty?: Difficulty | 'all';
  status?: 'all' | 'solved' | 'unsolved' | 'attempted';
  bookmarkedOnly?: boolean;
  revisionOnly?: boolean;
  searchQuery?: string;
  sortBy?: 'id' | 'title' | 'difficulty' | 'relevance';
  sortOrder?: 'asc' | 'desc';
}

export class QuestionStore {
  public static getAllQuestions(): Question[] {
    return allQuestions;
  }

  public static getQuestionById(id: string): Question | undefined {
    return questionMap.get(id);
  }

  public static getCategories(): Category[] {
    return ['python', 'dsa', 'cs-fundamentals'];
  }

  public static getTopics(category?: Category): string[] {
    const list = category
      ? allQuestions.filter(q => q.category === category)
      : allQuestions;
    return Array.from(new Set(list.map(q => q.topic))).sort();
  }

  public static getSubtopics(topic?: string): string[] {
    const list = topic
      ? allQuestions.filter(q => q.topic === topic)
      : allQuestions;
    return Array.from(new Set(list.map(q => q.subtopic))).sort();
  }

  public static getRandomQuestion(category?: Category, difficulty?: Difficulty): Question {
    let pool = allQuestions;
    if (category) pool = pool.filter(q => q.category === category);
    if (difficulty) pool = pool.filter(q => q.difficulty === difficulty);
    if (pool.length === 0) pool = allQuestions;
    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex];
  }

  public static getNextAndPrevQuestion(currentId: string, filteredIds?: string[]): { prev?: Question; next?: Question } {
    const pool = filteredIds && filteredIds.length > 0
      ? filteredIds.map(id => questionMap.get(id)!).filter(Boolean)
      : allQuestions;

    const idx = pool.findIndex(q => q.id === currentId);
    if (idx === -1) return {};

    const prev = idx > 0 ? pool[idx - 1] : undefined;
    const next = idx < pool.length - 1 ? pool[idx + 1] : undefined;
    return { prev, next };
  }

  public static filterQuestions(
    options: FilterOptions,
    solvedIds: Set<string> = new Set(),
    attemptedIds: Set<string> = new Set(),
    bookmarkedIds: Set<string> = new Set(),
    revisionIds: Set<string> = new Set()
  ): Question[] {
    let results = allQuestions;

    // Filter by category
    if (options.category && options.category !== 'all') {
      results = results.filter(q => q.category === options.category);
    }

    // Filter by topic
    if (options.topic && options.topic !== 'all') {
      results = results.filter(q => q.topic === options.topic);
    }

    // Filter by subtopic
    if (options.subtopic && options.subtopic !== 'all') {
      results = results.filter(q => q.subtopic === options.subtopic);
    }

    // Filter by difficulty
    if (options.difficulty && options.difficulty !== 'all') {
      results = results.filter(q => q.difficulty === options.difficulty);
    }

    // Filter by solved / attempted status
    if (options.status && options.status !== 'all') {
      if (options.status === 'solved') {
        results = results.filter(q => solvedIds.has(q.id));
      } else if (options.status === 'unsolved') {
        results = results.filter(q => !solvedIds.has(q.id));
      } else if (options.status === 'attempted') {
        results = results.filter(q => attemptedIds.has(q.id) && !solvedIds.has(q.id));
      }
    }

    // Bookmarked only
    if (options.bookmarkedOnly) {
      results = results.filter(q => bookmarkedIds.has(q.id));
    }

    // Revision only
    if (options.revisionOnly) {
      results = results.filter(q => revisionIds.has(q.id));
    }

    // Search query (case insensitive title, topic, subtopic, statement, or ID)
    if (options.searchQuery && options.searchQuery.trim().length > 0) {
      const qLower = options.searchQuery.toLowerCase().trim();
      results = results.filter(q =>
        q.id.toLowerCase().includes(qLower) ||
        q.title.toLowerCase().includes(qLower) ||
        q.topic.toLowerCase().includes(qLower) ||
        q.subtopic.toLowerCase().includes(qLower) ||
        q.statement.toLowerCase().includes(qLower) ||
        q.relatedConcepts.some(c => c.toLowerCase().includes(qLower))
      );
    }

    // Sorting
    const sortBy = options.sortBy || 'id';
    const isAsc = options.sortOrder !== 'desc';

    results = [...results].sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'title') {
        cmp = a.title.localeCompare(b.title);
      } else if (sortBy === 'difficulty') {
        const diffWeight = { Easy: 1, Medium: 2, Hard: 3 };
        cmp = diffWeight[a.difficulty] - diffWeight[b.difficulty];
      } else if (sortBy === 'relevance') {
        cmp = a.relevance.localeCompare(b.relevance);
      } else {
        cmp = a.id.localeCompare(b.id, undefined, { numeric: true });
      }
      return isAsc ? cmp : -cmp;
    });

    return results;
  }

  public static getDatasetStats() {
    const total = allQuestions.length;
    const pythonTotal = allQuestions.filter(q => q.category === 'python').length;
    const dsaTotal = allQuestions.filter(q => q.category === 'dsa').length;
    const csTotal = allQuestions.filter(q => q.category === 'cs-fundamentals').length;

    const easyCount = allQuestions.filter(q => q.difficulty === 'Easy').length;
    const mediumCount = allQuestions.filter(q => q.difficulty === 'Medium').length;
    const hardCount = allQuestions.filter(q => q.difficulty === 'Hard').length;

    const topicsMap: Record<string, number> = {};
    allQuestions.forEach(q => {
      topicsMap[q.topic] = (topicsMap[q.topic] || 0) + 1;
    });

    return {
      total,
      pythonTotal,
      dsaTotal,
      csTotal,
      difficulty: {
        easy: easyCount,
        medium: mediumCount,
        hard: hardCount
      },
      topics: topicsMap
    };
  }
}
