import React, { useState } from 'react';

interface ContentInputProps {
  onProcessContent: (content: string) => void;
}

export const ContentInput: React.FC<ContentInputProps> = ({ onProcessContent }) => {
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onProcessContent(content);
      setContent('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="content-input-form">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Paste your content here..."
        required
        className="content-input-textarea"
      />
      <button type="submit" className="content-input-submit-btn">Process Content</button>
    </form>
  );
};