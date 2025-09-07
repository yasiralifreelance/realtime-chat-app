'use client';

import { useEffect, useRef } from 'react';
import { Message } from '@/types/chat';

interface MessageListProps {
  messages: Message[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex flex-col ${
            message.isSystem ? 'items-center' : 'items-start'
          }`}
        >
          {message.isSystem ? (
            <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
              {message.message}
            </div>
          ) : (
            <div className="max-w-xs lg:max-w-md xl:max-w-lg">
              <div className="flex items-baseline space-x-2 mb-1">
                <span className="font-semibold text-gray-800 text-sm">
                  {message.username}
                </span>
                <span className="text-xs text-gray-500">
                  {formatTime(message.timestamp)}
                </span>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
                <p className="text-gray-800 break-words">{message.message}</p>
              </div>
            </div>
          )}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};