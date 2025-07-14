import React, { useContext, useState, useEffect, createContext, useRef } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { writeBatch, doc, collection, serverTimestamp, runTransaction } from 'firebase/firestore';
import { type VocabularyEntry } from '../types';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
});

const LOCAL_STORAGE_KEY = 'vocabulary_app_data_anonymous';

/**
 * Creates a user document in Firestore if it doesn't exist and migrates
 * local data on the first login of a session.
 * This function is called upon the first login/signup of a session.
 * @param user - The newly logged-in user object from Firebase Auth.
 */
const initializeUserAndMigrateData = async (user: User) => {
  const userDocRef = doc(db, 'users', user.uid);

  // Use a transaction to safely create the document only if it doesn't exist.
  // This is robust against race conditions if the user logs in on multiple
  // tabs at nearly the same time.
  try {
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userDocRef);
      if (!userDoc.exists()) {
        transaction.set(userDocRef, {
          uid: user.uid,
          email: user.email,
          createdAt: serverTimestamp(),
        });
      }
    });
  } catch (error) {
    console.error("Failed to create user document:", error);
    // Don't block the rest of the flow if this fails.
  }

  // Now, migrate local data.
  try {
    const localData = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (localData) {
      const words: VocabularyEntry[] = JSON.parse(localData);
      if (words.length > 0) {
        console.log(`Migrating ${words.length} words to your new account...`);
        const batch = writeBatch(db);
        const userVocabCollection = collection(db, 'users', user.uid, 'vocabulary');

        for (const word of words) {
          const docRef = doc(userVocabCollection, word.id);
          const { id, addedAt, ...firestoreData } = word;
          batch.set(docRef, { ...firestoreData, addedAt: serverTimestamp() });
        }

        await batch.commit();
        console.log('Migration complete!');
        window.localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
  } catch (error) {
    console.error("Failed to migrate local data:", error);
  }
};

/**
 * Custom hook to use the authentication context.
 */
export const useAuth = () => {
  return useContext(AuthContext);
};

/**
 * Provider component that wraps the application and makes auth state available to any child components.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const previousUserRef = useRef<User | null>(null);

  useEffect(() => {
    // onAuthStateChanged is a listener that triggers whenever the user's sign-in state changes.
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Check for a login event (transition from anonymous to a logged-in user)
      if (user && !previousUserRef.current) {
        await initializeUserAndMigrateData(user);
      }
      setCurrentUser(user);
      setLoading(false);
      previousUserRef.current = user;
    });

    return unsubscribe; // Cleanup the listener when the component unmounts
  }, []);

  const value = { currentUser, loading };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};