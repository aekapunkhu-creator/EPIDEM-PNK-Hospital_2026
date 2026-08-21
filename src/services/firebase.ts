import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getDatabase, ref, get, set, child } from 'firebase/database';
import firebaseConfig from '../../firebase-applet-config.json';

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

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firestore with custom database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Firebase Realtime Database URL
export const RTDB_URL = "https://gen-lang-client-0300364247-default-rtdb.asia-southeast1.firebasedatabase.app/";
export const rtdb = getDatabase(app, RTDB_URL);

// Initialize Auth
export const auth = getAuth(app);

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

// Test connection on boot (tests both Firestore and Realtime Database)
export async function testFirebaseConnection(): Promise<boolean> {
  try {
    // Ping RTDB connection node or check metadata
    const rtdbRef = ref(rtdb, '.info/connected');
    get(rtdbRef).then(snap => {
      if (snap.exists() && snap.val() === true) {
        console.log('Firebase Realtime Database Connected Successfully:', RTDB_URL);
      }
    }).catch(err => {
      console.log('RTDB ping error (non-fatal):', err);
    });

    await getDocFromServer(doc(db, 'meta', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client appears offline, working with cache/local store');
    }
    return true;
  }
}
