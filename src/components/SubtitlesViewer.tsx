import React, { useRef, useEffect } from 'react';

export interface Subtitle {
  start: number;
  end: number;
  text: string;
}

interface SubtitlesViewerProps {
  subtitles: Subtitle[];
  currentTime: number;
  onWordSelect: (word: string) => void;
  onSeek: (time: number) => void;
}

export const SubtitlesViewer: React.FC<SubtitlesViewerProps> = ({ subtitles, currentTime, onWordSelect, onSeek }) => {
    const activeSubtitleRef = useRef<HTMLLIElement>(null);

    // Effect to scroll the active subtitle into view
    useEffect(() => {
        if (activeSubtitleRef.current) {
            activeSubtitleRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [currentTime]); // A simple dependency to trigger check

    const renderTextWithSpans = (text: string) => {
        // Simple regex to split by space and some punctuation, keeping the punctuation
        return text.split(/(\s+|[.,?!;:"'()])/).filter(Boolean).map((segment, index) => {
            if (segment.match(/^\s+$/) || segment.match(/^[.,?!;:"'()]$/)) {
                // It's whitespace or punctuation
                return <React.Fragment key={index}>{segment}</React.Fragment>;
            }
            // It's a word
            return (
                <span key={index} className="subtitle-word" onClick={() => onWordSelect(segment)}>
                    {segment}
                </span>
            );
        });
    };

    return (
        <div className="subtitles-viewer">
            <h3>Subtitles</h3>
            <ul className="subtitles-list">
                {subtitles.map((subtitle, index) => {
                    const isActive = currentTime >= subtitle.start && currentTime < subtitle.end;
                    return (
                        <li
                            key={index}
                            className={`subtitle-item ${isActive ? 'active' : ''}`}
                            onClick={() => onSeek(subtitle.start)}
                            ref={isActive ? activeSubtitleRef : null}
                        >
                            {renderTextWithSpans(subtitle.text)}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

