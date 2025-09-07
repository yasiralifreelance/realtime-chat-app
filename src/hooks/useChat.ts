'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useWebSocket } from './useWebSocket';
import { useVoiceActivity } from './useVoiceActivity';
import { User, Message } from '@/types/chat';

interface UseChatOptions {
  websocketUrl: string;
  username: string;
  room: string;
}

export const useChat = ({ websocketUrl, username, room }: UseChatOptions) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const hasJoined = useRef(false);

  const { isConnected, sendMessage, addMessageHandler, removeMessageHandler } = useWebSocket(websocketUrl);

  const handleVoiceActivity = useCallback((isActive: boolean) => {
    if (isConnected) {
      sendMessage({
        type: 'voice_activity',
        isActive
      });
    }
  }, [isConnected, sendMessage]);

  const sendVoiceMessage = useCallback(async (audioBlob: Blob, duration: number) => {
    if (!isConnected) return;

    // Convert blob to base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result?.toString().split(',')[1];
      if (base64Data) {
        sendMessage({
          type: 'message',
          isVoice: true,
          voiceData: base64Data,
          voiceDuration: duration,
          message: `🎤 Voice message (${Math.round(duration)}s)`
        });
      }
    };
    reader.readAsDataURL(audioBlob);
  }, [isConnected, sendMessage]);

  const { isActive: isVoiceActive, isSupported: isVoiceSupported, startListening, stopListening } = useVoiceActivity({
    threshold: 0.1,
    onActivityChange: handleVoiceActivity
  });

  // WebSocket message handlers
  useEffect(() => {
    addMessageHandler('message', (data: Message) => {
      setMessages(prev => [...prev, data]);
    });

    addMessageHandler('user_list', (data: { users: User[] }) => {
      setUsers(data.users);
    });

    addMessageHandler('user_joined', (data: { user: User }) => {
      setUsers(prev => [...prev, data.user]);
    });

    addMessageHandler('user_left', (data: { userId: string }) => {
      setUsers(prev => prev.filter(user => user.id !== data.userId));
    });

    addMessageHandler('voice_activity', (data: { userId: string; isActive: boolean }) => {
      setUsers(prev => prev.map(user => 
        user.id === data.userId 
          ? { ...user, isActive: data.isActive }
          : user
      ));
    });

    return () => {
      removeMessageHandler('message');
      removeMessageHandler('user_list');
      removeMessageHandler('user_joined');
      removeMessageHandler('user_left');
      removeMessageHandler('voice_activity');
    };
  }, [addMessageHandler, removeMessageHandler]);

  // Join room when connected
  useEffect(() => {
    if (isConnected && username && room && !hasJoined.current) {
      hasJoined.current = true;
      sendMessage({
        type: 'join',
        username,
        room
      });
    }
    
    // Reset when disconnected
    if (!isConnected) {
      hasJoined.current = false;
    }
  }, [isConnected, username, room, sendMessage]);

  const sendChatMessage = useCallback((message: string) => {
    if (isConnected && message.trim()) {
      sendMessage({
        type: 'message',
        message: message.trim()
      });
    }
  }, [isConnected, sendMessage]);

  const toggleVoiceActivity = useCallback(async () => {
    if (!isVoiceSupported) return;

    if (isVoiceEnabled) {
      stopListening();
      setIsVoiceEnabled(false);
    } else {
      await startListening();
      setIsVoiceEnabled(true);
    }
  }, [isVoiceEnabled, isVoiceSupported, startListening, stopListening]);

  return {
    messages,
    users,
    isConnected,
    isVoiceActive,
    isVoiceEnabled,
    isVoiceSupported,
    sendMessage: sendChatMessage,
    sendVoiceMessage,
    toggleVoiceActivity
  };
};