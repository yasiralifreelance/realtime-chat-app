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
}

export interface WebSocketMessage {
  type: 'join' | 'message' | 'voice_activity' | 'leave' | 'user_joined' | 'user_left' | 'user_list';
  [key: string]: any;
}