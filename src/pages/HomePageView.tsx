import React from 'react';
import { Link } from 'react-router-dom';
import { ContentInput } from '../components/ContentInput';
import { ContentViewer } from '../components/ContentViewer';
import { Sidebar } from '../components/Sidebar';
import { type Article } from '../types';
import { type HomePageProps, type HomePageUIState } from './HomePageContent';

interface ArticleListProps {
  articles: Article[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
}

const ArticleList: React.FC<ArticleListProps> = ({ articles, selectedId, onSelect, onDelete }) => (
  <ul style={{ listStyle: 'none', padding: 0 }}>
    {articles.map(article => (
      <li key={article.id} style={{ marginBottom: 8, display: 'flex', alignItems: 'center', width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        <button
          className={`auth-submit-btn ${selectedId === article.id ? 'selected' : ''}`}
          onClick={() => onSelect(article.id)}
          style={{ flex: 1, marginRight: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}
        >
          {article.title}
        </button>
        <button
          className="auth-submit-btn"
          style={{ background: '#d32f2f', color: 'white' }}
          onClick={() => onDelete(article.id)}
        >
          Delete
        </button>
      </li>
    ))}
  </ul>
);

interface ContentEditorProps {
  title: string;
  content: string;
  onTitleChange: (newTitle: string) => void;
  onContentChange: (newContent: string) => void;
  onSave: () => Promise<void>;
  onProcessContent: (content: string) => void;
}

const ContentEditor: React.FC<ContentEditorProps> = ({ title, content, onTitleChange, onContentChange, onSave, onProcessContent }) => (
  <>
    <input
      type="text"
      value={title}
      onChange={e => onTitleChange(e.target.value)}
      placeholder="Article Title"
      className="auth-input"
      style={{ marginBottom: 8, width: '100%' }}
    />
    <ContentInput
      onProcessContent={onProcessContent}
      value={content}
      onChange={onContentChange}
      mode="text"
    />
    <button className="auth-submit-btn" onClick={onSave} style={{ marginTop: 8 }}>
      Save
    </button>
  </>
);

interface HomeViewProps extends HomePageProps, HomePageUIState {
  onSelectArticle: (id: string) => void;
  onDeleteArticle: (id: string) => Promise<void>;
  onTitleChange: (newTitle: string) => void;
  onContentChange: (newContent: string) => void;
  onSaveArticle: () => Promise<void>;
  onNewArticle: () => void;
  onProcessContent: (text: string) => void;
  onWordSelect: (word: string) => void;
  onCloseSidebar: () => void;
  onAddToVocabulary: (tags: string[]) => void;
}

export const HomePageView: React.FC<HomeViewProps> = ({
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
  onSelectArticle,
  onDeleteArticle,
  onTitleChange,
  onContentChange,
  onSaveArticle,
  onNewArticle,
  onProcessContent,
  onWordSelect,
  onCloseSidebar,
  onAddToVocabulary,
}) => {
  return (
    <div className="home-container" style={{ display: 'flex', gap: 24 }}>
      <div style={{ minWidth: 220, maxWidth: 220 }}>
        <button className="auth-submit-btn" onClick={onNewArticle} style={{ marginBottom: 12 }}>
          新建 Article
        </button>
        {loading ? (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li>Loading...</li>
          </ul>
        ) : (
          <ArticleList
            articles={articles}
            selectedId={selectedId}
            onSelect={onSelectArticle}
            onDelete={onDeleteArticle}
          />
        )}
        <div style={{ marginTop: 32, width: '150px' }}>
          <Link to="/vocabulary" className="auth-submit-btn">管理 Vocabulary</Link>
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <ContentEditor
          title={title}
          content={content}
          onTitleChange={onTitleChange}
          onContentChange={onContentChange}
          onSave={onSaveArticle}
          onProcessContent={onProcessContent}
        />
        <hr className="home-divider" />
        {processedText && <ContentViewer content={processedText} onWordSelect={onWordSelect} />}
      </div>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={onCloseSidebar}
        isLoading={isLoading}
        selectedText={selectedText}
        analysis={currentAnalysis}
        onAddToVocabulary={onAddToVocabulary}
        error={error}
      />
    </div>
  );
};