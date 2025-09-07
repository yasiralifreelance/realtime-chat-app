'use client';

import { Mic, MicOff } from 'lucide-react';

interface VoiceIndicatorProps {
  isActive: boolean;
  isEnabled: boolean;
  isSupported: boolean;
  onToggle: () => void;
}

export const VoiceIndicator: React.FC<VoiceIndicatorProps> = ({
  isActive,
  isEnabled,
  isSupported,
  onToggle
}) => {
  if (!isSupported) {
    return (
      <div className="flex items-center text-gray-400 text-sm">
        <MicOff className="w-4 h-4 mr-1" />
        <span>Voice detection unavailable</span>
      </div>
    );
  }

  return (
    <button
      onClick={onToggle}
      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
        isEnabled
          ? isActive
            ? 'bg-green-500 text-white animate-glow'
            : 'bg-green-100 text-green-700 hover:bg-green-200'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
      title={isEnabled ? 'Disable voice activity' : 'Enable voice activity'}
    >
      {isEnabled ? (
        <Mic className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
      ) : (
        <MicOff className="w-4 h-4" />
      )}
      <span className="text-sm font-medium">
        {isEnabled ? (isActive ? 'Speaking' : 'Listening') : 'Voice Off'}
      </span>
    </button>
  );
};