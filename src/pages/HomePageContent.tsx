import React, { useState, useCallback } from 'react';
import { useVocabulary } from '../hooks/useVocabulary';
import { useArticles } from '../hooks/useArticles';
import { useSettings } from '../hooks/useSettings';
import { analyzeTextWithLLM, type LlmAnalysis } from '../services/llmService';
import { useAuth } from '../contexts/AuthContext';
import { type Article } from '../types';
import { HomePageView } from './HomePageView';

export interface HomePageProps {
  // Define any props that are passed from the parent component if needed.
}

export interface HomePageUIState {
  articles: Article[];
  loading: boolean;
  selectedId: string | null;
  title: string;
  content: string;
  processedText: string;
  isSidebarOpen: boolean;
  isLoading: boolean;
  selectedText: string;
  currentAnalysis: LlmAnalysis | null;
  error: string | null;
}

export const HomePageContent: React.FC<HomePageProps> = () => {
  // Local UI State
  const [processedText, setProcessedText] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [selectedContext, setSelectedContext] = useState('');
  const [currentAnalysis, setCurrentAnalysis] = useState<LlmAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // Data and Logic Hooks
  const { articles, saveArticle, deleteArticle, loading } = useArticles();
  const { addWord } = useVocabulary();
  const { settings } = useSettings();

  // Handlers
  const handleSelectArticle = useCallback((id: string) => {
    setSelectedId(id);
    const article = articles.find(a => a.id === id);
    setTitle(article?.title || '');
    setContent(article?.content || '');
  }, [articles]);

  const handleNewArticle = useCallback(() => {
    setSelectedId(null);
    setTitle('');
    setContent('');
  }, []);

  const handleSaveArticle = useCallback(async () => {
    if (!title.trim() || !content.trim()) return;
    await saveArticle({
      id: selectedId ?? undefined,
      title: title.trim(),
      content,
    });
    const newId = title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    setSelectedId(newId);
  }, [title, content, selectedId, saveArticle]);

  const handleDeleteArticle = useCallback(async (id: string) => {
    await deleteArticle(id);
    if (selectedId === id) {
      setSelectedId(null);
      setTitle('');
      setContent('');
    }
  }, [deleteArticle, selectedId]);

  const handleProcessContent = useCallback((text: string) => {
    setProcessedText(text);
    setContent(''); // Clear the editor content after processing
    setIsSidebarOpen(false);
  }, []); // setContent is stable and can be omitted from deps

  const handleWordSelect = useCallback(async (word: string) => {
    if (!settings.apiKey) {
      alert('Please set your API key in the Settings page first.');
      return;
    }

    setIsSidebarOpen(true);
    setIsLoading(true);
    setError(null);
    setSelectedText(word);
    setSelectedContext(processedText);
    setCurrentAnalysis(null);

    try {
      const analysis = await analyzeTextWithLLM(word, settings.apiKey);
      setCurrentAnalysis(analysis);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [settings.apiKey, processedText]);

  const handleAddToVocabulary = useCallback((tags: string[]) => {
    if (selectedText && currentAnalysis) {
      addWord({
        word: selectedText,
        context: selectedContext,
        explanation: currentAnalysis.explanation,
        translation: currentAnalysis.translation,
        tags: tags,
      });
      alert(`'${selectedText}' added to vocabulary!`);
      setIsSidebarOpen(false);
    }
  }, [addWord, selectedText, selectedContext, currentAnalysis]);

  const handleCloseSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  // UI State for the View Component
  const uiState: HomePageUIState = {
    articles,
    loading,
    selectedId,
    title,
    content,
    processedText,
    isSidebarOpen,
    isLoading,
    selectedText,
    currentAnalysis,
    error,
  };

  return (
    <HomePageView
      {...uiState}
      onSelectArticle={handleSelectArticle}
      onDeleteArticle={handleDeleteArticle}
      onTitleChange={setTitle}
      onContentChange={setContent}
      onSaveArticle={handleSaveArticle}
      onNewArticle={handleNewArticle}
      onProcessContent={handleProcessContent}
      onWordSelect={handleWordSelect}
      onCloseSidebar={handleCloseSidebar}
      onAddToVocabulary={handleAddToVocabulary}
    />
  );
};