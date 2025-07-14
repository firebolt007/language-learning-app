import React from 'react';

interface ContentViewerProps {
  content: string;
  onWordSelect: (word: string) => void;
}

export const ContentViewer: React.FC<ContentViewerProps> = ({ content, onWordSelect }) => {
  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      const selectedText = selection.toString().trim();
      // Only select if it's a single word (no spaces)
      if (!selectedText.includes(' ')) {
        onWordSelect(selectedText);
      }
    }
  };

  return (
    <div>
      <h3>Content</h3>
      <div onMouseUp={handleMouseUp} className="content-viewer-text">
        {content}
      </div>
    </div>
  );
};