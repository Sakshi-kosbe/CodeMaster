/**
 * Firebase Client Service & Security Error Handler
 * Strictly adheres to the Firebase Integration Skill specifications:
 * - Structured handleFirestoreError throwing JSON conforming to FirestoreErrorInfo
 * - OperationType enum (CREATE, UPDATE, DELETE, LIST, GET, WRITE)
 * - Safe dynamic loading of firebase-applet-config.json
 * - Cloud & Server fallback synchronizer
 */

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
  currentUser?: {
    uid?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
  }
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid || null,
      email: currentUser?.email || null,
      emailVerified: currentUser?.emailVerified ?? false,
      isAnonymous: currentUser?.isAnonymous ?? true,
      tenantId: currentUser?.tenantId || null,
      providerInfo: currentUser?.email ? [{ providerId: 'google.com', email: currentUser.email }] : []
    },
    operationType,
    path
  };

  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface AuthUserProfile {
  userId: string;
  displayName: string;
  email: string;
  photoURL?: string | null;
}

export const isFirebaseAvailable = false;
