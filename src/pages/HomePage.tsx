import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ContentInput } from '../components/ContentInput';
import { ContentViewer } from '../components/ContentViewer';
import { Sidebar } from '../components/Sidebar';
import { useVocabulary } from '../hooks/useVocabulary';
import { useSettings } from '../hooks/useSettings';
import { analyzeTextWithLLM, type LlmAnalysis } from '../services/llmService';
import { useAuth } from '../contexts/AuthContext';

export const HomePage: React.FC = () => {
  // State for content processing
  const [processedText, setProcessedText] = useState<string>('');

  // State for the sidebar and LLM interaction
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [selectedContext, setSelectedContext] = useState('');
  const [currentAnalysis, setCurrentAnalysis] = useState<LlmAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Hooks for data management
  const { addWord, vocabulary } = useVocabulary();
  const { settings } = useSettings();
  const { currentUser } = useAuth();

  const handleContentSubmit = (text: string) => {
    setProcessedText(text);
    // Close sidebar if it was open for a previous text
    setIsSidebarOpen(false);
  };

  const handleWordSelect = async (word: string) => {
    if (!settings.apiKey) {
      alert('Please set your API key in the Settings page first.');
      return;
    }

    // Open sidebar and set initial state
    setIsSidebarOpen(true);
    setIsLoading(true);
    setError(null);
    setSelectedText(word);
    setSelectedContext(processedText); // Use the full content as context
    setCurrentAnalysis(null);

    try {
      const analysis = await analyzeTextWithLLM(word, settings.apiKey);
      setCurrentAnalysis(analysis);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToVocabulary = (tags: string[]) => {
    if (selectedText && currentAnalysis) {
      addWord({
        word: selectedText,
        context: selectedContext,
        explanation: currentAnalysis.explanation,
        translation: currentAnalysis.translation,
        tags: tags,
      });
      alert(`'${selectedText}' added to vocabulary!`);
      handleCloseSidebar();
    }
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="home-container">
      <h1>Language Learning Assistant</h1>
      <div className="home-info-box">
        <p>You have {vocabulary.length} words in your vocabulary book. <Link to="/vocabulary">Review them here</Link>.</p>
        {!currentUser && (
          <p className="home-info-text">
            Your data is currently stored locally. <Link to="/signup">Sign up</Link> to sync your progress across devices!
          </p>
        )}
      </div>
      <ContentInput onProcessContent={handleContentSubmit} />
      <hr className="home-divider" />
      {processedText && <ContentViewer content={processedText} onWordSelect={handleWordSelect} />}

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        isLoading={isLoading}
        selectedText={selectedText}
        analysis={currentAnalysis}
        onAddToVocabulary={handleAddToVocabulary}
        error={error}
      />
    </div>
  );
};