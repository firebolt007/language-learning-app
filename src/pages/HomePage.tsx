import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ContentInput } from '../components/ContentInput';
import { ContentViewer } from '../components/ContentViewer';
import { Sidebar } from '../components/Sidebar';
import { useVocabulary } from '../hooks/useVocabulary';
import { useArticles } from '../hooks/useArticles';
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

  const { articles, saveArticle, deleteArticle, loading } = useArticles();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // Hooks for data management
  const { addWord, vocabulary } = useVocabulary();
  const { settings } = useSettings();
  const { currentUser } = useAuth();

  // 选择/切换 Article
  const handleSelect = (id: string) => {
    setSelectedId(id);
    const article = articles.find(a => a.id === id);
    setTitle(article?.title || '');
    setContent(article?.content || '');
  };

  // 新建 Article
  const handleNew = () => {
    setSelectedId(null);
    setTitle('');
    setContent('');
  };

  // 保存 Article
  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    await saveArticle({
      id: selectedId || undefined,
      title: title.trim(),
      content,
    });
    const newId = title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    setSelectedId(newId);
  };

  // 删除 Article
  const handleDelete = async (id: string) => {
    await deleteArticle(id);
    if (selectedId === id) {
      setSelectedId(null);
      setTitle('');
      setContent('');
    }
  };

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
    <div className="home-container" style={{ display: 'flex', gap: 24 }}>
      {/* 文章列表区 */}
      <div style={{ minWidth: 220,maxWidth: 220 }}>
        <button className="auth-submit-btn" onClick={handleNew} style={{ marginBottom: 12 }}>
          新建 Article
        </button>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {loading ? <li>Loading...</li> : articles.map(article => (
            <li key={article.id} style={{ marginBottom: 8,
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              whiteSpace: 'nowrap', // prevent text from wrapping
              overflow: 'hidden', // clip the overflowing content
              textOverflow: 'ellipsis' // add ellipsis to the overflowed text
            }}>
              <button
                className={`auth-submit-btn ${selectedId === article.id ? 'selected' : ''}`}
                onClick={() => handleSelect(article.id)}
                style={{
                  flex: 1,
                  marginRight: 8,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  minWidth: 0 // 关键，允许flex子项收缩
                }}
              >
                {article.title}
              </button>
              <button
                className="auth-submit-btn"
                style={{ background: '#d32f2f', color: 'white' }}
                onClick={() => handleDelete(article.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
        <div style={{ marginTop: 32, width: '150px' }}>
          <Link to="/vocabulary" className="auth-submit-btn">管理 Vocabulary</Link>
        </div>
      </div>
      {/* 编辑与展示区 */}
      <div style={{ flex: 1 }}>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Article Title"          
          className="auth-input"
          style={{ marginBottom: 8, width: '100%' }}
        />
        <ContentInput onProcessContent={handleContentSubmit} 
          value={content}
          onChange={setContent}
          mode="text"/>
        <button className="auth-submit-btn" onClick={handleSave} style={{ marginTop: 8 }}>
          保存
        </button>
        <hr className="home-divider" />
      {processedText && <ContentViewer content={processedText} onWordSelect={handleWordSelect} />}
      </div>
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