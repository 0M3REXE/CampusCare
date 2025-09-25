"use client";
import React from 'react';
import { AudioControlButton } from './AudioControlButton';

interface AudioControlsProps {
  isSessionActive: boolean;
  toggleCall: () => void;
  isMuted: boolean;
  toggleMute: () => void;
}

export const AudioControls: React.FC<AudioControlsProps> = ({ isSessionActive, toggleCall, isMuted, toggleMute }) => {
  return (
    <div className="flex gap-6 items-center rounded-full px-3 py-3" aria-label="Voice controls">
      <AudioControlButton
        label={isSessionActive ? 'Stop voice session' : 'Start voice session'}
        active={isSessionActive}
        onClick={toggleCall}
        icon={
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
            {isSessionActive ? (
              <path d="M6 6h12v12H6z" fill="currentColor" />
            ) : (
              <path
                d="M12 18a6 6 0 0 0 6-6V7a6 6 0 1 0-12 0v5a6 6 0 0 0 6 6Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </svg>
        }
      />
      <AudioControlButton
        label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
        active={isMuted}
        onClick={toggleMute}
        icon={
          isMuted ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
              <path
                d="M9 9v3m0 0v3m0-3h3m-3 0H6m6-8a4 4 0 0 1 4 4v2m0 4v2.5M8 21h8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
              <path
                d="M12 15a4 4 0 0 0 4-4V7a4 4 0 1 0-8 0v4a4 4 0 0 0 4 4Zm0 0v2.5m0 0a6.5 6.5 0 0 1-6.5-6.5M12 17.5A6.5 6.5 0 0 0 18.5 11"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )
        }
      />
    </div>
  );
};
