import React, { useState, useMemo } from 'react';
import { useVocabulary } from '../hooks/useVocabulary';
import { type VocabularyEntry } from '../types';

// Add this type for editing
type EditFields = {
  word: string;
  translation: string;
  explanation: string;
  context: string;
  tags: string; // comma-separated
};

/**
 * A page to display and review the user's saved vocabulary.
 * Implements the context review feature.
 */
export const VocabularyPage: React.FC = () => {
  const { vocabulary, updateWord } = useVocabulary();
  // State to keep track of the currently selected entry for context review
  const [selectedEntry, setSelectedEntry] = useState<VocabularyEntry | null>(null);
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFields, setEditFields] = useState<EditFields | null>(null);

  // Memoize tag calculation to avoid re-computing on every render
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    vocabulary.forEach(entry => {
      entry.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort(); // Sort for consistent order
  }, [vocabulary]);

  // Filter vocabulary based on the selected tag
  const filteredVocabulary = useMemo(() => {
    if (!filterTag) return vocabulary;
    return vocabulary.filter(entry => entry.tags?.includes(filterTag));
  }, [vocabulary, filterTag]);

  const handleWordClick = (entry: VocabularyEntry) => {
    setSelectedEntry(entry);
    setIsEditing(false);
    setEditFields(null);
  };

  const handleTagClick = (tag: string) => {
    setFilterTag(prev => (prev === tag ? null : tag)); // Toggle filter
    setSelectedEntry(null); // Clear selection when filter changes
    setIsEditing(false);
    setEditFields(null);
  };

  const handleEdit = () => {
    if (selectedEntry) {
      setIsEditing(true);
      setEditFields({
        word: selectedEntry.word,
        translation: selectedEntry.translation,
        explanation: selectedEntry.explanation,
        context: selectedEntry.context,
        tags: (selectedEntry.tags || []).join(', '),
      });
    }
  };

  const handleEditFieldChange = (field: keyof EditFields, value: string) => {
    setEditFields(prev => prev ? { ...prev, [field]: value } : prev);
  };

  const handleEditSave = async () => {
    if (!selectedEntry || !editFields) return;
    const updated: VocabularyEntry = {
      ...selectedEntry,
      ...editFields,
      tags: editFields.tags.split(',').map(t => t.trim()).filter(Boolean),
    };
    await updateWord(updated);
    setSelectedEntry(updated);
    setIsEditing(false);
    setEditFields(null);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditFields(null);
  };

  if (vocabulary.length === 0) {
    return (
      <div className="page-container">
        <h1>My Vocabulary</h1>
        <p>Your vocabulary book is empty. Go to the Home page to add some words!</p>
      </div>
    );
  }

  return (
    <div className="vocabulary-container">
      <div className="vocabulary-left-panel">

        {/* Tag Index Section */}
        {allTags.length > 0 && (
          <div className="vocabulary-filter-container">
            <div className="vocabulary-filter-header">
              <strong className="vocabulary-filter-label">Filter by Tag:</strong>
              {allTags.map(tag => (
                <span
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className={`vocabulary-filter-tag ${filterTag === tag ? 'active' : ''}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <ul className="vocabulary-word-list">
          {/* Avoid mutating state directly in render. Create a shallow copy `[...]` before sorting. */}
          {[...filteredVocabulary]
            .sort((a, b) => a.word.localeCompare(b.word))
            .map(entry => (
            <li
              key={entry.id}
              onClick={() => handleWordClick(entry)}
              className={`vocabulary-word-item ${selectedEntry?.id === entry.id ? 'selected' : ''}`}
            >
              {entry.word}
            </li>
          ))}
        </ul>
      </div>
      <div className="vocabulary-right-panel">
        {/* Details Section */}
        <div className="vocabulary-detail-container">
          {selectedEntry ? (
            <div className="vocabulary-detail-content">
              {isEditing && editFields ? (
                <>
                  <input
                    type="text"
                    value={editFields.word}
                    onChange={e => handleEditFieldChange('word', e.target.value)}
                    placeholder="Word"
                    className="auth-input"
                  />
                  <input
                    type="text"
                    value={editFields.translation}
                    onChange={e => handleEditFieldChange('translation', e.target.value)}
                    placeholder="Translation"
                    className="auth-input"
                  />
                  <textarea
                    value={editFields.explanation}
                    onChange={e => handleEditFieldChange('explanation', e.target.value)}
                    placeholder="Explanation"
                    className="auth-input"
                  />
                  <textarea
                    value={editFields.context}
                    onChange={e => handleEditFieldChange('context', e.target.value)}
                    placeholder="Context"
                    className="auth-input"
                  />
                  <input
                    type="text"
                    value={editFields.tags}
                    onChange={e => handleEditFieldChange('tags', e.target.value)}
                    placeholder="Tags (comma separated)"
                    className="auth-input"
                  />
                  <div style={{ marginTop: '1rem' }}>
                    <button className="auth-submit-btn" onClick={handleEditSave} style={{ marginRight: 8 }}>Save</button>
                    <button className="auth-submit-btn" onClick={handleEditCancel} type="button">Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <h3>{selectedEntry.word}</h3>
                  <p><strong>Translation:</strong> {selectedEntry.translation}</p>
                  <p><strong>Explanation:</strong> {selectedEntry.explanation}</p>

                  <div className="vocabulary-detail-content">
                    <strong>Context:</strong>
                    <p className="vocabulary-detail-text">
                      "{selectedEntry.context}"
                    </p>
                  </div>

                  {selectedEntry.tags && selectedEntry.tags.length > 0 && (
                    <div className="vocabulary-tags-container">
                      <strong>Tags:</strong>
                      <div className="vocabulary-tags-list">
                        {selectedEntry.tags.map(tag => (
                          <span key={tag} className="vocabulary-tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div style={{ marginTop: '1rem' }}>
                    <button className="auth-submit-btn" onClick={handleEdit}>Edit</button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <p>Select a word from your list to see its details.</p>
          )}
        </div>
      </div>
    </div>
  );
};