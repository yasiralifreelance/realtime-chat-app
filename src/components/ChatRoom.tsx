'use client';

import { useChat } from '@/hooks/useChat';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { UserList } from './UserList';
import { VoiceIndicator } from './VoiceIndicator';
import { Wifi, WifiOff } from 'lucide-react';

interface ChatRoomProps {
  username: string;
  room: string;
  websocketUrl: string;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({
  username,
  room,
  websocketUrl
}) => {
  const {
    messages,
    users,
    isConnected,
    isVoiceActive,
    isVoiceEnabled,
    isVoiceSupported,
    sendMessage,
    toggleVoiceActivity
  } = useChat({ websocketUrl, username, room });

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-800">
                Room: {room}
              </h1>
              <p className="text-sm text-gray-600">
                Welcome, {username}!
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                isConnected 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {isConnected ? (
                  <Wifi className="w-4 h-4" />
                ) : (
                  <WifiOff className="w-4 h-4" />
                )}
                <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
              
              {/* Voice Activity */}
              <VoiceIndicator
                isActive={isVoiceActive}
                isEnabled={isVoiceEnabled}
                isSupported={isVoiceSupported}
                onToggle={toggleVoiceActivity}
              />
            </div>
          </div>
        </div>

        {/* Messages */}
        <MessageList messages={messages} />

        {/* Message Input */}
        <MessageInput
          onSendMessage={sendMessage}
          disabled={!isConnected}
        />
      </div>

      {/* User List */}
      <UserList users={users} />
    </div>
  );
};