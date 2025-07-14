import React, { useState, useEffect } from 'react';
import { type LlmAnalysis } from '../services/llmService';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  selectedText: string;
  analysis: LlmAnalysis | null;
  onAddToVocabulary: (tags: string[]) => void;
  error: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  isLoading,
  selectedText,
  analysis,
  onAddToVocabulary,
  error,
}) => {
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    // When a new analysis comes in, update the tags state with suggestions from the LLM.
    // If no suggestions, reset to an empty array.
    setTags(analysis?.suggestedTags || []);
  }, [analysis]);

  const handleAddTag = () => {
    // Sanitize tag: remove leading/trailing spaces and replace inner spaces with hyphens.
    const newTag = tagInput.trim().replace(/\s+/g, '-');
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
    }
    setTagInput(''); // Clear input field
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Pass the final list of tags when the add button is clicked.
  const handleAddClick = () => onAddToVocabulary(tags);

  return (
    <>
      {/* Overlay: closes the sidebar when clicked */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}

      {/* Sidebar Container */}
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>{selectedText}</h2>
          <button onClick={onClose} className="sidebar-close-btn">&times;</button>
        </div>
        <div className="sidebar-content">
          {isLoading && <p>Analyzing with AI...</p>}
          {error && <p className="sidebar-error">Error: {error}</p>}
          {analysis && !isLoading && (
            <>
              <div>
                <h3>Translation</h3>
                <p>{analysis.translation}</p>
              </div>
              <div>
                <h3>Explanation</h3>
                <p>{analysis.explanation}</p>
              </div>
              <div>
                <h3>Tags</h3>
                <div className="sidebar-tags-container">
                  {tags.map(tag => (
                    <span key={tag} className="sidebar-tag">
                      {tag}
                      <button onClick={() => handleRemoveTag(tag)} className="sidebar-tag-remove-btn">
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
                <div className="sidebar-add-tag-container">
                   <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagInputKeyDown}
                    placeholder="Add a tag..."
                    className="sidebar-add-tag-input"
                  />
                  <button onClick={handleAddTag} className="sidebar-add-tag-btn">
                    Add
                  </button>
                </div>
                 <p className="sidebar-help-text">
                    You can use # for hierarchical tags, e.g., `topic#travel`.
                 </p>
              </div>
            </>
          )}
        </div>
        <div className="sidebar-footer">
          <button
            onClick={handleAddClick}
            disabled={isLoading || !analysis}
            className="sidebar-add-btn"
          >
            Add to Vocabulary
          </button>
        </div>
      </div>
    </>
  );
};