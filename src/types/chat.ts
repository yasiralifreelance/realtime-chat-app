export interface User {
  id: string;
  username: string;
  isActive: boolean;
}

export interface Message {
  id: string;
  username: string;
  message: string;
  timestamp: string;
  userId?: string;
  isSystem?: boolean;
  isVoice?: boolean;
  voiceData?: string; // Base64 encoded audio data
  voiceDuration?: number; // Duration in seconds
}

export interface WebSocketMessage {
  type: 'join' | 'message' | 'voice_activity' | 'leave' | 'user_joined' | 'user_left' | 'user_list';
  [key: string]: any;
}