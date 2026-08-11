import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getDatabase, Database } from 'firebase-admin/database';
import path from 'path';
import fs from 'fs';

const databaseURL = "https://docugen-676bf-default-rtdb.asia-southeast1.firebasedatabase.app";

let db: Firestore | null = null;
let rtdb: Database | null = null;
let firebaseInitialized = false;

try {
  if (!getApps().length) {
    let serviceAccount: any = null;

    // 1. Priority 1: Environment Variable FIREBASE_PRIVATE_KEY_JSON (for Vercel deployment)
    if (process.env.FIREBASE_PRIVATE_KEY_JSON) {
      try {
        const envVal = process.env.FIREBASE_PRIVATE_KEY_JSON.trim();
        serviceAccount = JSON.parse(envVal);
        console.log('Firebase Admin initialized from FIREBASE_PRIVATE_KEY_JSON env variable');
      } catch (err) {
        console.error('Error parsing FIREBASE_PRIVATE_KEY_JSON env variable:', err);
      }
    }

    // 2. Priority 2: Local JSON key file
    if (!serviceAccount) {
      const keyFilename = 'docugen-676bf-firebase-adminsdk-fbsvc-a4f8311b31.json';
      const keyPaths = [
        path.join(process.cwd(), '..', keyFilename),
        path.join(process.cwd(), keyFilename)
      ];
      for (const kPath of keyPaths) {
        try {
          if (fs.existsSync(kPath)) {
            const fileData = fs.readFileSync(kPath, 'utf8');
            serviceAccount = JSON.parse(fileData);
            console.log('Firebase Admin initialized from local file:', kPath);
            break;
          }
        } catch {
          // ignore
        }
      }
    }

    if (serviceAccount) {
      // Fix private key escaped newlines if passed as single line string in env
      if (typeof serviceAccount.private_key === 'string') {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }

      initializeApp({
        credential: cert(serviceAccount),
        databaseURL: databaseURL
      });
      firebaseInitialized = true;
    } else {
      console.warn('No Firebase credentials found (checked FIREBASE_PRIVATE_KEY_JSON env and local JSON files)');
    }
  } else {
    firebaseInitialized = true;
  }

  if (getApps().length > 0) {
    db = getFirestore();
    try {
      rtdb = getDatabase();
    } catch (e) {
      console.warn('Realtime Database access warning:', e);
    }
  }
} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK:', error);
}

export { db, rtdb, firebaseInitialized };
