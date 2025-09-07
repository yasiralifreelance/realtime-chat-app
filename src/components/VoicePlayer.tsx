'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';

interface VoicePlayerProps {
  audioData: string; // Base64 encoded audio
  duration: number;
}

export const VoicePlayer: React.FC<VoicePlayerProps> = ({ audioData, duration }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Create audio element with base64 data
    const audio = new Audio(`data:audio/webm;codecs=opus;base64,${audioData}`);
    audioRef.current = audio;

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    });

    audio.addEventListener('loadedmetadata', () => {
      // Audio is ready
    });

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      audio.pause();
      audio.removeEventListener('ended', () => {});
      audio.removeEventListener('loadedmetadata', () => {});
    };
  }, [audioData]);

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      
      // Update progress
      progressInterval.current = setInterval(() => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
      }, 100);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 max-w-xs">
      <button
        onClick={togglePlayback}
        className="flex-shrink-0 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1 transition-colors"
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" />
        )}
      </button>
      
      <div className="flex-1 min-w-0">
        <div className="bg-blue-200 rounded-full h-1 mb-1">
          <div 
            className="bg-blue-500 h-1 rounded-full transition-all duration-100"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="text-xs text-blue-600 font-medium">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>
    </div>
  );
};