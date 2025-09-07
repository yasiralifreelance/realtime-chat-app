'use client';

import { useState, useEffect } from 'react';
import { ChatRoom } from '@/components/ChatRoom';
import { MessageSquare, Users, Mic } from 'lucide-react';

export default function Home() {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [websocketUrl, setWebsocketUrl] = useState('');

  useEffect(() => {
    // Set WebSocket URL based on environment
    const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3001';
    setWebsocketUrl(wsUrl);
  }, []);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && room.trim()) {
      setIsJoined(true);
    }
  };

  if (isJoined && websocketUrl) {
    return (
      <ChatRoom
        username={username}
        room={room}
        websocketUrl={websocketUrl}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Realtime Chat
          </h1>
          <p className="text-gray-600">
            Join a room and start chatting with voice activity detection
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 text-center shadow-sm border">
            <Users className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">Real-time Chat</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm border">
            <Mic className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">Voice Detection</p>
          </div>
        </div>

        {/* Join Form */}
        <div className="bg-white rounded-xl shadow-lg border p-6">
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                required
                maxLength={20}
              />
            </div>

            <div>
              <label htmlFor="room" className="block text-sm font-medium text-gray-700 mb-2">
                Room Name
              </label>
              <input
                type="text"
                id="room"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="Enter room name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                required
                maxLength={30}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Join Chat Room</span>
            </button>
          </form>

          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-700">
              <strong>Note:</strong> Voice activity detection requires microphone access. 
              You'll be prompted to allow microphone permissions when you enable voice detection.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          Built with Next.js 14, WebSockets & Tailwind CSS
        </div>
      </div>
    </div>
  );
}