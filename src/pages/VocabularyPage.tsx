import React, { useState, useMemo } from 'react';
import { useVocabulary } from '../hooks/useVocabulary';
import { type VocabularyEntry } from '../types';

/**
 * A page to display and review the user's saved vocabulary.
 * Implements the context review feature.
 */
export const VocabularyPage: React.FC = () => {
  const { vocabulary } = useVocabulary();
  // State to keep track of the currently selected entry for context review
  const [selectedEntry, setSelectedEntry] = useState<VocabularyEntry | null>(null);
  const [filterTag, setFilterTag] = useState<string | null>(null);

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
  };

  const handleTagClick = (tag: string) => {
    setFilterTag(prev => (prev === tag ? null : tag)); // Toggle filter
    setSelectedEntry(null); // Clear selection when filter changes
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
            </div>
          ) : (
            <p>Select a word from your list to see its details.</p>
          )}
        </div>
      </div>
    </div>
  );
};