import React, { useState } from 'react';

interface VideoUrlInputProps {
  onProcessUrl: (url: string) => void;
}

export const VideoUrlInput: React.FC<VideoUrlInputProps> = ({ onProcessUrl }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onProcessUrl(url);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="video-url-input-form">
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Paste a YouTube video URL here..."
        required
        className="video-url-input"
      />
      <button type="submit" className="video-url-submit-btn">Load Video</button>
    </form>
  );
};

