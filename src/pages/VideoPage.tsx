import React, { useState, useRef, useEffect } from 'react';
import type { YouTubePlayer  } from 'react-youtube';

import Layout from '../components/Layout';
import { VideoUrlInput } from '../components/VideoUrlInput';
import { YouTubePlayerLoc } from '../components/YoutubePlayer';
import { SubtitlesViewer, type Subtitle } from '../components/SubtitlesViewer';
import { Sidebar } from '../components/Sidebar';
import { useSettings } from '../hooks/useSettings';
import { type LlmAnalysis, analyzeTextWithLLM } from '../services/llmService';
// import { useVocabulary } from '../hooks/useVocabulary'; // Assuming this hook exists

// Mock vocabulary hook for demonstration
const useVocabulary = () => ({
    addVocabularyItem: (item: any) => console.log('Adding to vocabulary:', item),
});


export const VideoPage: React.FC = () => {
  const [videoId, setVideoId] = useState<string>('');
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [sidebarLoading, setSidebarLoading] = useState(false);
  const [analysis, setAnalysis] = useState<LlmAnalysis | null>(null);
  const [sidebarError, setSidebarError] = useState<string | null>(null);

  const playerRef = useRef<YouTubePlayer | null>(null);
  const timeUpdateInterval = useRef<NodeJS.Timeout | null>(null);

  const { addVocabularyItem } = useVocabulary();
  const { settings } = useSettings();

  const getYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const cleanupTimeUpdater = () => {
    if (timeUpdateInterval.current) {
      clearInterval(timeUpdateInterval.current);
      timeUpdateInterval.current = null;
    }
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => cleanupTimeUpdater();
  }, []);

  const handleProcessUrl = async (url: string) => {
    const id = getYouTubeVideoId(url);
    if (!id) {
      setError('Invalid YouTube URL');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSubtitles([]);
    
    // Set videoId immediately so video plays regardless of subtitles
    setVideoId(id);

    try {
      // This fetch call goes to our new backend endpoint
      const response = await fetch(`/api/subtitles/${id}`);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to fetch subtitles.');
      }
      const data: Subtitle[] = await response.json();
      setSubtitles(data);
    } catch (e: any) {
      setError(`Video loaded but subtitles failed: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeek = (time: number) => {
    playerRef.current?.seekTo(time, true);
  };
  
  const handlePlayerReady = (event: { target: YouTubePlayer }) => {
      playerRef.current = event.target;
  };

  const handlePlayerStateChange = (event: { data: number }) => {
    cleanupTimeUpdater();
    // State 1 is "playing"
    if (event.data === 1 && playerRef.current) {
      timeUpdateInterval.current = setInterval(() => {
        setCurrentTime(playerRef.current?.getCurrentTime() || 0);
      }, 250);
    }
  };

  const handleWordSelect = async (word: string) => {
    setSelectedText(word);
    setIsSidebarOpen(true);
    setSidebarLoading(true);
    setSidebarError(null);
    setAnalysis(null);
    
    try {
      const analysisResult = await analyzeTextWithLLM(word,settings.apiKey); // Assumed to exist
      setAnalysis(analysisResult);
    } catch (e: any) {
      setSidebarError(e.message);
    } finally {
      setSidebarLoading(false);
    }
  };
  
  const handleAddToVocabulary = (tags: string[]) => {
    if (analysis) {
      addVocabularyItem({ word: selectedText, ...analysis, tags });
      setIsSidebarOpen(false);
    }
  };

  return (
    <div>
      <div className="video-page-container">
        <h1>Video Learning</h1>
        <p>Load a YouTube video to watch it with interactive subtitles.</p>
        <VideoUrlInput onProcessUrl={handleProcessUrl} />
        {isLoading && <p>Loading video and subtitles...</p>}
        {error && <p className="error-message">{error}</p>}
        {videoId && (
          <div className="video-content-layout">
            <div className="video-player-container">
              <YouTubePlayerLoc videoId={videoId} onReady={handlePlayerReady} onStateChange={handlePlayerStateChange} />
            </div>
            <SubtitlesViewer subtitles={subtitles} currentTime={currentTime} onSeek={handleSeek} onWordSelect={handleWordSelect} />
          </div>
        )}
      </div>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} isLoading={sidebarLoading} selectedText={selectedText} analysis={analysis} onAddToVocabulary={handleAddToVocabulary} error={sidebarError} />
    </div>
  );
};

export default VideoPage;
