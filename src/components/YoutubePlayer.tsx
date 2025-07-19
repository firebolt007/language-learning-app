import React from 'react';
import YouTube, { type YouTubePlayer as YouTubePlayerInternal } from 'react-youtube';

/**
 * Props for the YouTubePlayer component.
 */
interface YouTubePlayerProps {
  /** The ID of the YouTube video to embed. */
  videoId: string;
  /** Callback function that executes when the player is ready. */
  onReady: (event: { target: YouTubePlayerInternal }) => void;
  /** Optional callback function that executes when the player's state changes. */
  onStateChange?: (event: { data: number }) => void;
}

/**
 * A wrapper component for the `react-youtube` player.
 * It simplifies embedding a YouTube video and is pre-configured for the app's needs.
 */
export const YouTubePlayerLoc: React.FC<YouTubePlayerProps> = ({ videoId, onReady, onStateChange }) => {
  // Configuration options for the YouTube player.
  // See: https://developers.google.com/youtube/player_parameters
  const opts = {
    height: '390',
    width: '100%', // Make it responsive.
    playerVars: {
      autoplay: 1,         // Auto-play the video on load.
      modestbranding: 1,   // Reduce YouTube branding.
      cc_load_policy: 0,   // Disable YouTube's own captions, as we use our custom ones.
    },
  };

  return <YouTube videoId={videoId} opts={opts} onReady={onReady} onStateChange={onStateChange} className="youtube-player-iframe" />;
};