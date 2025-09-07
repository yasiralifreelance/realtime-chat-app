'use client';

import { useState, KeyboardEvent, useEffect } from 'react';
import { Send, Mic, MicOff, Square, X } from 'lucide-react';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';
import { useVoiceActivity } from '@/hooks/useVoiceActivity';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onSendVoiceMessage: (audioBlob: Blob, duration: number) => void;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onSendVoiceMessage,
  disabled = false
}) => {
  const [message, setMessage] = useState('');
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  const { 
    isRecording, 
    isSupported: isRecordingSupported, 
    startRecording, 
    stopRecording, 
    cancelRecording 
  } = useVoiceRecording();

  const {
    isActive: isVoiceActive,
    isEnabled: isVADEnabled,
    isSupported: isVADSupported,
    toggleVoiceActivity
  } = useVoiceActivity({
    threshold: 0.1,
    onActivityChange: () => {} // We'll show this in the UI
  });

  // Update recording duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRecording) {
      const startTime = Date.now();
      interval = setInterval(() => {
        setRecordingDuration((Date.now() - startTime) / 1000);
      }, 100);
    } else {
      setRecordingDuration(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled && !isRecording) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleVoiceRecording = async () => {
    if (isRecording) {
      // Stop recording and send
      const result = await stopRecording();
      if (result) {
        onSendVoiceMessage(result.audioBlob, result.duration);
      }
    } else {
      // Start recording
      const started = await startRecording();
      if (!started) {
        alert('Could not access microphone for recording');
      }
    }
  };

  const handleCancelRecording = () => {
    cancelRecording();
    setRecordingDuration(0);
  };

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="border-t border-gray-200 bg-white">
      {/* Voice Activity Detection Header */}
      {isVADSupported && (
        <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
          <button
            onClick={toggleVoiceActivity}
            className={`flex items-center space-x-2 text-sm px-2 py-1 rounded transition-all duration-200 ${
              isVADEnabled
                ? isVoiceActive
                  ? 'bg-green-500 text-white animate-pulse'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {isVADEnabled ? (
              <Mic className={`w-3 h-3 ${isVoiceActive ? 'animate-pulse' : ''}`} />
            ) : (
              <MicOff className="w-3 h-3" />
            )}
            <span className="font-medium">
              {isVADEnabled ? (isVoiceActive ? 'Speaking' : 'Voice Detection On') : 'Voice Detection Off'}
            </span>
          </button>
        </div>
      )}

      {/* Recording Interface */}
      {isRecording && (
        <div className="px-4 py-3 bg-red-50 border-b border-red-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-red-700 font-medium">Recording...</span>
              </div>
              <span className="text-red-600 font-mono">
                {formatDuration(recordingDuration)}
              </span>
            </div>
            
            <button
              onClick={handleCancelRecording}
              className="text-red-500 hover:text-red-700 p-1"
              title="Cancel recording"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              disabled 
                ? "Connecting..." 
                : isRecording 
                  ? "Recording voice message..."
                  : "Type a message..."
            }
            disabled={disabled || isRecording}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            maxLength={500}
          />
          
          {/* Voice Recording Button */}
          {isRecordingSupported && (
            <button
              type="button"
              onClick={handleVoiceRecording}
              disabled={disabled}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed flex items-center space-x-1 ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-gray-500 hover:bg-gray-600 text-white disabled:bg-gray-300'
              }`}
              title={isRecording ? 'Stop and send voice message' : 'Record voice message'}
            >
              {isRecording ? (
                <>
                  <Square className="w-4 h-4" />
                  <span className="text-sm">Send</span>
                </>
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
          )}
          
          {/* Send Text Button */}
          <button
            type="submit"
            disabled={!message.trim() || disabled || isRecording}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};