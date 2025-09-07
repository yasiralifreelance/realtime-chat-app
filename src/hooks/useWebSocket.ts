'use client';

import { useEffect, useRef, useState } from 'react';
import { WebSocketMessage } from '@/types/chat';
import { isDev } from '@/utils/isDev';

export const useWebSocket = (url: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  const messageHandlers = useRef<Map<string, (data: any) => void>>(new Map());

  useEffect(() => {
    const connect = () => {
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const handler = messageHandlers.current.get(data.type);
          if (handler) {
            handler(data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onclose = (event) => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        
        // Only reconnect if it wasn't a manual close
        // In development, be more aggressive about preventing reconnections
        if (!event.wasClean && event.code !== 1000 && !isDev) {
          setTimeout(connect, 3000);
        } else if (!isDev) {
          // In production, still reconnect but with longer delay
          setTimeout(connect, 5000);
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    };

    connect();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [url]);

  const sendMessage = (message: WebSocketMessage) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  };

  const addMessageHandler = (type: string, handler: (data: any) => void) => {
    messageHandlers.current.set(type, handler);
  };

  const removeMessageHandler = (type: string) => {
    messageHandlers.current.delete(type);
  };

  return {
    isConnected,
    sendMessage,
    addMessageHandler,
    removeMessageHandler
  };
};