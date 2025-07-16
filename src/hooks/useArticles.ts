import { useState, useEffect, useCallback, useRef } from 'react';
import { collection, doc, onSnapshot, setDoc, deleteDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { type Article } from '../types';

const LOCAL_STORAGE_KEY = 'language_app_articles_anonymous';

export const useArticles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const isInitialMount = useRef(true);

  // Load articles from Firestore or localStorage
  useEffect(() => {
    setLoading(true);
    if (currentUser) {
      const articlesCollectionRef = collection(db, 'users', currentUser.uid, 'articles');
      const q = query(articlesCollectionRef, orderBy('updatedAt', 'desc'));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const data: Article[] = [];
        querySnapshot.forEach((doc) => {
          const d = doc.data();
          data.push({
            id: doc.id,
            title: d.title,
            content: d.content,
            createdAt:
              d.createdAt
                ? typeof d.createdAt.toMillis === 'function'
                  ? d.createdAt.toMillis()
                  : typeof d.createdAt === 'number'
                    ? d.createdAt
                    : Date.now()
                : Date.now(),
            updatedAt:
              d.updatedAt
                ? typeof d.updatedAt.toMillis === 'function'
                  ? d.updatedAt.toMillis()
                  : typeof d.updatedAt === 'number'
                    ? d.updatedAt
                    : Date.now()
                : Date.now(),
          });
        });
        setArticles(data);
        setLoading(false);
      }, (error) => {
        console.error('Error fetching articles from Firestore:', error);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      try {
        const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          setArticles(JSON.parse(stored));
        } else {
          setArticles([]);
        }
      } catch (error) {
        console.error('Failed to load articles from localStorage:', error);
        setArticles([]);
      }
      setLoading(false);
    }
  }, [currentUser]);

  // Save to localStorage for anonymous users
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (!currentUser) {
      try {
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(articles));
      } catch (error) {
        console.error('Failed to save articles to localStorage:', error);
      }
    }
  }, [articles, currentUser]);

  // Add or update article
  const saveArticle = useCallback(async (article: Omit<Article, 'id' | 'createdAt' | 'updatedAt'> & { id?: string, createdAt?: number }) => {
    const normalizedId = article.id || article.title.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '');
    const now = Date.now();
    if (currentUser) {
      const docRef = doc(db, 'users', currentUser.uid, 'articles', normalizedId);
      await setDoc(docRef, {
        ...article,
        id: normalizedId,
        createdAt: article.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      setArticles(prev => {
        const exists = prev.find(a => a.id === normalizedId);
        if (exists) {
          // Update
          return prev.map(a => a.id === normalizedId ? { ...a, ...article, id: normalizedId, updatedAt: now } : a);
        } else {
          // Add
          return [
            {
              ...article,
              id: normalizedId,
              createdAt: now,
              updatedAt: now,
            },
            ...prev,
          ];
        }
      });
    }
  }, [currentUser]);

  // Delete article
  const deleteArticle = useCallback(async (id: string) => {
    if (currentUser) {
      const docRef = doc(db, 'users', currentUser.uid, 'articles', id);
      await deleteDoc(docRef);
    } else {
      setArticles(prev => prev.filter(a => a.id !== id));
    }
  }, [currentUser]);

  return { articles, saveArticle, deleteArticle, loading };
}; 