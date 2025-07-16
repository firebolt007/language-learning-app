import { useState, useEffect, useCallback, useRef } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { type VocabularyEntry } from '../types';

const LOCAL_STORAGE_KEY = 'vocabulary_app_data_anonymous';

/**
 * Custom hook for managing the user's vocabulary book.
 * It intelligently handles data storage based on user authentication status:
 * - For logged-in users, it syncs data with Firestore in real-time.
 * - For anonymous users, it persists data to the browser's localStorage.
 * @returns An object containing the vocabulary list, loading state, and data management functions.
 */
export const useVocabulary = () => {
  const [vocabulary, setVocabulary] = useState<VocabularyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const isInitialMount = useRef(true);

  // Effect for loading data from either Firestore or localStorage
  useEffect(() => {
    setLoading(true);

    if (currentUser) {
      // --- Firestore Logic for Logged-in Users ---
      const vocabCollectionRef = collection(db, 'users', currentUser.uid, 'vocabulary');
      const q = query(vocabCollectionRef, orderBy('addedAt', 'desc'));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const vocabData: VocabularyEntry[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          vocabData.push({
            id: doc.id,
            word: data.word,
            context: data.context,
            explanation: data.explanation,
            translation: data.translation,
            addedAt: 
            //  data.addedAt?.toMillis() || Date.now(),
            data.addedAt
            ? typeof data.addedAt.toMillis === 'function'
              ? data.addedAt.toMillis()
              : typeof data.addedAt === 'number'
                ? data.addedAt
                : Date.now()
            : Date.now(),
            tags: data.tags || [],
          });
        });
        setVocabulary(vocabData);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching vocabulary from Firestore:", error);
        setLoading(false);
      });

      // Cleanup listener on unmount or user change
      return () => unsubscribe();
    } else {
      // --- LocalStorage Logic for Anonymous Users ---
      try {
        const storedData = window.localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedData) {
          setVocabulary(JSON.parse(storedData));
        } else {
          setVocabulary([]);
        }
      } catch (error) {
        console.error('Failed to load vocabulary from localStorage:', error);
        setVocabulary([]);
      }
      setLoading(false);
    }
  }, [currentUser]);

  // Effect for saving data to localStorage for anonymous users
  useEffect(() => {
    // Skip saving on initial mount to avoid overwriting loaded data with an empty array
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!currentUser) {
      try {
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(vocabulary));
      } catch (error) {
        console.error('Failed to save vocabulary to localStorage:', error);
      }
    }
  }, [vocabulary, currentUser]);

  /**
    * Adds a new word to the vocabulary book.
    * @param newEntry - The vocabulary entry to add.
    */
  const addWord = useCallback(async (newEntry: Omit<VocabularyEntry, 'id' | 'addedAt'>) => {
    const normalizedWord = newEntry.word.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '');
    if (!normalizedWord || vocabulary.some(entry => entry.id === normalizedWord)) return;

    if (currentUser) {
      const docRef = doc(db, 'users', currentUser.uid, 'vocabulary', normalizedWord);
      await setDoc(docRef, { ...newEntry, word: newEntry.word.trim(), addedAt: serverTimestamp() });
    } else {
      const entryToAdd: VocabularyEntry = { ...newEntry, word: newEntry.word.trim(), id: normalizedWord, addedAt: Date.now() };
      setVocabulary(prev => [entryToAdd, ...prev]);
    }
  }, [currentUser, vocabulary]);

  const deleteWord = useCallback(async (vocabId: string) => {
    if (currentUser) {
      const docRef = doc(db, 'users', currentUser.uid, 'vocabulary', vocabId);
      await deleteDoc(docRef);
    } else {
      setVocabulary(prev => prev.filter(entry => entry.id !== vocabId));
    }
  }, [currentUser]);

  const updateWord = useCallback(
    async (updatedEntry: VocabularyEntry) => {
      const normalizedWord = updatedEntry.word.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '');
      if (currentUser) {
        if (normalizedWord !== updatedEntry.id) {
          // Renaming: create new doc, delete old doc
          const newDocRef = doc(db, 'users', currentUser.uid, 'vocabulary', normalizedWord);
          await setDoc(newDocRef, { ...updatedEntry, id: normalizedWord, word: updatedEntry.word.trim(), addedAt: updatedEntry.addedAt || serverTimestamp() });
          const oldDocRef = doc(db, 'users', currentUser.uid, 'vocabulary', updatedEntry.id);
          await deleteDoc(oldDocRef);
        } else {
          // Update in place
          const docRef = doc(db, 'users', currentUser.uid, 'vocabulary', updatedEntry.id);
          await setDoc(docRef, { ...updatedEntry, word: updatedEntry.word.trim(), addedAt: updatedEntry.addedAt || serverTimestamp() });
        }
      } else {
        if (normalizedWord !== updatedEntry.id) {
          // Renaming: add new entry, remove old
          const newEntry = { ...updatedEntry, id: normalizedWord, word: updatedEntry.word.trim(), addedAt: Date.now() };
          setVocabulary(prev => [newEntry, ...prev.filter(entry => entry.id !== updatedEntry.id)]);
        } else {
          // Update in place
          setVocabulary(prev => prev.map(entry => (entry.id === updatedEntry.id ? { ...entry, ...updatedEntry, word: updatedEntry.word.trim() } : entry)));
        }
      }
    },
    [currentUser]
  );

  return { vocabulary, addWord, deleteWord,updateWord, loading };
};
