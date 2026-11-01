/**
 * User Store & Progress Management
 * Handles persistent user progress, spaced repetition revisions, streaks,
 * XP, achievements, and dual-layer sync (LocalStorage/IndexedDB + optional Firebase).
 */

import { UserProgressData, UserPreferences, TimedTestResult, RevisionItem } from '../types';

const STORAGE_KEY = 'codemaster_user_progress_v1';
const PREFS_KEY = 'codemaster_user_prefs_v1';

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'dark',
  editorFontSize: 14,
  uiFontSize: 'normal',
  autoSaveCode: true,
  soundEnabled: true,
  dailyGoalQuestions: 3,
  weeklyTargetQuestions: 20
};

export const DEFAULT_USER_PROGRESS: UserProgressData = {
  userId: 'guest_user',
  displayName: 'Guest Developer',
  email: null,
  isGuest: true,
  xp: 150,
  streak: 1,
  longestStreak: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  totalCodingTimeSeconds: 420,
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
  unlockedAchievements: ['first_login'],
  submissionHistory: []
};

class UserStore {
  private progress: UserProgressData;
  private preferences: UserPreferences;
  private listeners: Set<() => void> = new Set();
  private syncStatus: 'synced' | 'syncing' | 'error' | 'offline' = 'synced';
  private syncTimeout: any = null;

  constructor() {
    this.progress = this.loadProgress();
    this.preferences = this.loadPreferences();
    this.verifyStreak();

    // If previously signed in, immediately revalidate against primary server database
    if (!this.progress.isGuest && this.progress.userId) {
      this.syncFromServer(this.progress.userId);
    }
  }

  public getSyncStatus(): 'synced' | 'syncing' | 'error' | 'offline' {
    return this.syncStatus;
  }

  private setSyncStatus(status: 'synced' | 'syncing' | 'error' | 'offline') {
    this.syncStatus = status;
    this.notify();
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }

  private loadPreferences(): UserPreferences {
    try {
      const data = localStorage.getItem(PREFS_KEY);
      return data ? { ...DEFAULT_PREFERENCES, ...JSON.parse(data) } : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  }

  private loadProgress(): UserProgressData {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? { ...DEFAULT_USER_PROGRESS, ...JSON.parse(data) } : DEFAULT_USER_PROGRESS;
    } catch {
      return DEFAULT_USER_PROGRESS;
    }
  }

  private save() {
    // 1. Keep local cache updated for instant offline feedback
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.progress));
      localStorage.setItem(PREFS_KEY, JSON.stringify(this.preferences));
    } catch (e) {
      console.error('Failed to write to localStorage', e);
    }
    this.notify();

    // 2. PRIMARY DATABASE: For authenticated users, persist to the server database
    if (!this.progress.isGuest && this.progress.userId) {
      this.debouncePersistToServer();
    }
  }

  private debouncePersistToServer() {
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }
    this.setSyncStatus('syncing');
    this.syncTimeout = setTimeout(async () => {
      try {
        const payload = {
          ...this.progress,
          preferences: this.preferences
        };
        const resp = await fetch(`/api/users/${this.progress.userId}/progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (resp.ok) {
          this.setSyncStatus('synced');
        } else {
          this.setSyncStatus('error');
        }
      } catch (err) {
        console.warn('Network sync warning (will retry on next activity):', err);
        this.setSyncStatus('offline');
      }
    }, 600);
  }

  public async syncFromServer(userId: string) {
    if (!userId || userId.startsWith('guest_')) return;
    this.setSyncStatus('syncing');
    try {
      const resp = await fetch(`/api/users/${userId}/progress`);
      if (resp.ok) {
        const data = await resp.json();
        if (data.success && data.progress) {
          this.progress = {
            ...this.progress,
            ...data.progress,
            isGuest: false
          };
          if (data.progress.preferences) {
            this.preferences = { ...this.preferences, ...data.progress.preferences };
          }
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.progress));
            localStorage.setItem(PREFS_KEY, JSON.stringify(this.preferences));
          } catch {}
          this.setSyncStatus('synced');
          this.notify();
        }
      } else {
        // If not found yet on server, persist our current state
        this.debouncePersistToServer();
      }
    } catch (err) {
      console.warn('Failed to load server progress:', err);
      this.setSyncStatus('offline');
    }
  }

  public async loginWithGoogle(
    email: string,
    displayName?: string,
    photoURL?: string,
    mergeGuest: boolean = true
  ): Promise<{ success: boolean; isNewUser: boolean; error?: string }> {
    this.setSyncStatus('syncing');
    try {
      const guestProgress = mergeGuest && this.progress.isGuest ? this.progress : undefined;
      const resp = await fetch('/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          displayName: displayName || email.split('@')[0],
          photoURL,
          guestProgressToMerge: guestProgress
        })
      });

      if (!resp.ok) {
        const err = await resp.json();
        this.setSyncStatus('error');
        return { success: false, isNewUser: false, error: err.error || 'Login failed' };
      }

      const data = await resp.json();
      this.progress = {
        ...DEFAULT_USER_PROGRESS,
        ...data.progress,
        isGuest: false
      };
      if (data.progress.preferences) {
        this.preferences = { ...this.preferences, ...data.progress.preferences };
      }

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.progress));
        localStorage.setItem(PREFS_KEY, JSON.stringify(this.preferences));
      } catch {}

      this.setSyncStatus('synced');
      this.notify();
      return { success: true, isNewUser: data.isNewUser };
    } catch (e: any) {
      this.setSyncStatus('error');
      return { success: false, isNewUser: false, error: e.message || 'Network error' };
    }
  }

  public logoutToGuest() {
    const newGuestId = `guest_${Math.random().toString(36).substring(2, 9)}`;
    this.progress = {
      ...DEFAULT_USER_PROGRESS,
      userId: newGuestId,
      displayName: 'Guest Developer',
      email: null,
      photoURL: null,
      isGuest: true
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.progress));
    } catch {}
    this.setSyncStatus('synced');
    this.notify();
  }

  public subscribe(callback: () => void) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  public getProgress(): UserProgressData {
    return this.progress;
  }

  public getPreferences(): UserPreferences {
    return this.preferences;
  }

  public updatePreferences(partial: Partial<UserPreferences>) {
    this.preferences = { ...this.preferences, ...partial };
    this.save();
  }

  public setAuthenticatedUser(userId: string, displayName: string, email: string | null) {
    this.progress.userId = userId;
    this.progress.displayName = displayName;
    this.progress.email = email;
    this.progress.isGuest = false;
    this.save();
  }

  public logoutGuest() {
    this.logoutToGuest();
  }

  public verifyStreak() {
    const today = new Date().toISOString().split('T')[0];
    const lastActive = this.progress.lastActiveDate;

    if (!lastActive) {
      this.progress.lastActiveDate = today;
      this.progress.streak = 1;
      this.save();
      return;
    }

    if (lastActive === today) {
      return; // Already checked today
    }

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (lastActive === yesterday) {
      this.progress.streak += 1;
      if (this.progress.streak > this.progress.longestStreak) {
        this.progress.longestStreak = this.progress.streak;
      }
    } else {
      // Streak broken
      this.progress.streak = 1;
    }

    this.progress.lastActiveDate = today;
    this.save();
  }

  public recordSubmission(
    questionId: string,
    passed: boolean,
    executionTimeMs: number,
    code: string,
    submissionMeta?: {
      status?: 'Accepted' | 'Wrong Answer' | 'Runtime Error' | 'Time Limit Exceeded';
      passedTests?: number;
      totalTests?: number;
    }
  ): { newlySolved: boolean; earnedXp: number } {
    const today = new Date().toISOString().split('T')[0];
    let earnedXp = 0;
    let newlySolved = false;

    // Increment today's activity
    this.progress.activityCalendar[today] = (this.progress.activityCalendar[today] || 0) + 1;

    // Track attempt
    const existingAttempt = this.progress.attemptedQuestions[questionId];
    this.progress.attemptedQuestions[questionId] = {
      lastAttemptAt: Date.now(),
      attempts: (existingAttempt ? existingAttempt.attempts : 0) + 1,
      lastCode: code
    };

    const status = submissionMeta?.status || (passed ? 'Accepted' : 'Wrong Answer');

    // Add to submission history
    if (!this.progress.submissionHistory) {
      this.progress.submissionHistory = [];
    }
    this.progress.submissionHistory.unshift({
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      questionId,
      code,
      status,
      passedTests: submissionMeta?.passedTests ?? (passed ? 1 : 0),
      totalTests: submissionMeta?.totalTests ?? 1,
      executionTimeMs,
      timestamp: Date.now()
    });

    if (passed) {
      const alreadySolved = !!this.progress.solvedQuestions[questionId];
      if (!alreadySolved) {
        newlySolved = true;
        // Base XP: 50 for new solve
        earnedXp = 50;
        this.progress.xp += earnedXp;

        this.progress.solvedQuestions[questionId] = {
          solvedAt: Date.now(),
          bestTimeMs: executionTimeMs,
          attempts: this.progress.attemptedQuestions[questionId].attempts,
          code
        };

        // Automatically schedule for Spaced Repetition (Level 1: 1 day)
        this.scheduleRevision(questionId, 1);
      } else {
        // Repeated solve: update code and best time, but give 0 XP to prevent farming
        const prev = this.progress.solvedQuestions[questionId];
        this.progress.solvedQuestions[questionId] = {
          ...prev,
          bestTimeMs: Math.min(prev.bestTimeMs, executionTimeMs),
          code
        };
      }
    }

    this.checkAchievements();
    this.save();
    return { newlySolved, earnedXp };
  }

  public getSubmissionsForQuestion(questionId: string) {
    return (this.progress.submissionHistory || []).filter(s => s.questionId === questionId);
  }

  public scheduleRevision(questionId: string, level: number = 1) {
    // Spaced repetition intervals in days
    const intervals: Record<number, number> = {
      1: 1,  // Day 1
      2: 3,  // Day 3
      3: 7,  // Day 7
      4: 14, // Day 14
      5: 30  // Day 30
    };

    const daysToAdd = intervals[level] || 30;
    const nextDate = new Date(Date.now() + daysToAdd * 86400000).toISOString().split('T')[0];

    const existingIdx = this.progress.revisionQueue.findIndex(r => r.questionId === questionId);
    if (existingIdx >= 0) {
      this.progress.revisionQueue[existingIdx] = {
        questionId,
        nextReviewDate: nextDate,
        revisionLevel: level,
        lastReviewedAt: Date.now()
      };
    } else {
      this.progress.revisionQueue.push({
        questionId,
        nextReviewDate: nextDate,
        revisionLevel: level,
        lastReviewedAt: Date.now()
      });
    }

    this.save();
  }

  public advanceRevision(questionId: string, remembered: boolean) {
    const item = this.progress.revisionQueue.find(r => r.questionId === questionId);
    if (!item) return;

    if (remembered) {
      const nextLevel = Math.min(item.revisionLevel + 1, 5);
      this.scheduleRevision(questionId, nextLevel);
      this.progress.xp += 20; // 20 XP for successful revision
    } else {
      // Reset back to level 1
      this.scheduleRevision(questionId, 1);
    }

    this.save();
  }

  public toggleBookmark(questionId: string): boolean {
    const idx = this.progress.bookmarkedQuestionIds.indexOf(questionId);
    let bookmarked = false;
    if (idx >= 0) {
      this.progress.bookmarkedQuestionIds.splice(idx, 1);
      bookmarked = false;
    } else {
      this.progress.bookmarkedQuestionIds.push(questionId);
      bookmarked = true;
    }
    this.save();
    return bookmarked;
  }

  public toggleDifficult(questionId: string): boolean {
    const idx = this.progress.difficultQuestionIds.indexOf(questionId);
    let isDiff = false;
    if (idx >= 0) {
      this.progress.difficultQuestionIds.splice(idx, 1);
    } else {
      this.progress.difficultQuestionIds.push(questionId);
      isDiff = true;
    }
    this.save();
    return isDiff;
  }

  public saveNote(questionId: string, note: string) {
    this.progress.notes[questionId] = note;
    this.save();
  }

  public completeDailyChallenge(questionId: string): { bonusXp: number } {
    const today = new Date().toISOString().split('T')[0];
    if (this.progress.dailyChallenges[today]?.completed) {
      return { bonusXp: 0 }; // Already claimed today
    }

    const bonusXp = 100;
    this.progress.dailyChallenges[today] = {
      date: today,
      questionId,
      completed: true,
      completedAt: new Date().toISOString()
    };
    this.progress.xp += bonusXp;
    this.save();
    return { bonusXp };
  }

  public saveTimedTestResult(result: TimedTestResult) {
    this.progress.timedTestHistory.unshift(result);
    // XP based on score
    this.progress.xp += Math.round(result.score * 10);
    this.checkAchievements();
    this.save();
  }

  public markLessonCompleted(lessonId: string) {
    if (!this.progress.completedLessons.includes(lessonId)) {
      this.progress.completedLessons.push(lessonId);
      this.progress.xp += 30;
      this.save();
    }
  }

  public addCodingTime(seconds: number) {
    this.progress.totalCodingTimeSeconds += seconds;
    this.save();
  }

  private checkAchievements() {
    const solvedCount = Object.keys(this.progress.solvedQuestions).length;
    const unlocked = new Set(this.progress.unlockedAchievements);

    if (solvedCount >= 1 && !unlocked.has('first_solved')) {
      unlocked.add('first_solved');
      this.progress.xp += 50;
    }
    if (solvedCount >= 5 && !unlocked.has('solved_5')) {
      unlocked.add('solved_5');
      this.progress.xp += 100;
    }
    if (solvedCount >= 25 && !unlocked.has('solved_25')) {
      unlocked.add('solved_25');
      this.progress.xp += 250;
    }
    if (solvedCount >= 50 && !unlocked.has('solved_50')) {
      unlocked.add('solved_50');
      this.progress.xp += 500;
    }
    if (solvedCount >= 100 && !unlocked.has('solved_100')) {
      unlocked.add('solved_100');
      this.progress.xp += 1000;
    }
    if (this.progress.streak >= 7 && !unlocked.has('streak_7')) {
      unlocked.add('streak_7');
      this.progress.xp += 300;
    }
    if (this.progress.streak >= 30 && !unlocked.has('streak_30')) {
      unlocked.add('streak_30');
      this.progress.xp += 1500;
    }

    this.progress.unlockedAchievements = Array.from(unlocked);
  }

  public exportBackup(): string {
    return JSON.stringify({
      version: 1,
      exportedAt: new Date().toISOString(),
      progress: this.progress,
      preferences: this.preferences
    }, null, 2);
  }

  public importBackup(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.progress) {
        this.progress = { ...DEFAULT_USER_PROGRESS, ...parsed.progress };
      }
      if (parsed.preferences) {
        this.preferences = { ...DEFAULT_PREFERENCES, ...parsed.preferences };
      }
      this.save();
      return true;
    } catch (e) {
      console.error('Import error', e);
      return false;
    }
  }

  public clearAllData() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PREFS_KEY);
    this.progress = { ...DEFAULT_USER_PROGRESS };
    this.preferences = { ...DEFAULT_PREFERENCES };
    this.save();
  }
}

export const userStore = new UserStore();
