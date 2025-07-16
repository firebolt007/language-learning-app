import React, { useState } from 'react';

export interface ContentInputProps {
  onProcessContent: (content: string) => void;
  value: string;
  onChange: (val: string) => void;
  mode?: 'text' | 'audio' | 'video';
}

export const ContentInput: React.FC<ContentInputProps> = ({ onProcessContent, value, onChange }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onProcessContent(value);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="content-input-form">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste your content here..."
        required
        className="content-input-textarea"
      />
      <button type="submit" className="content-input-submit-btn">Process Content</button>
    </form>
  );

};
