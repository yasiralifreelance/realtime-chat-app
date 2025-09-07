# 🚀 Realtime Chat App

A modern, feature-rich realtime chat application built with **Next.js 14**, **WebSockets**, and **Voice Activity Detection**. Connect with others in real-time and see when they're speaking!

## ✨ Features

- 🗣️ **Voice Activity Detection** - See when users are speaking with microphone access
- 💬 **Real-time Messaging** - Instant message delivery with WebSocket connection
- 👥 **User Presence** - View who's online in each chat room
- 🎨 **Modern UI** - Clean, responsive design with Tailwind CSS
- 🔄 **Auto Reconnection** - Automatic reconnection on connection loss
- 📱 **Mobile Responsive** - Works seamlessly on all devices
- ⚡ **Fast Performance** - Built with Next.js 14 for optimal speed

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Node.js WebSocket Server
- **Real-time Communication**: WebSockets (ws library)
- **Icons**: Lucide React
- **Audio Processing**: Web Audio API

## 📦 Prerequisites

- Node.js 18+ 
- npm or yarn

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/realtime-chat-app.git
cd realtime-chat-app
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
WEBSOCKET_PORT=3001
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:3001
```

### 4. Start the development servers

```bash
npm run dev
```

This will start both the Next.js frontend (http://localhost:3000) and the WebSocket server (ws://localhost:3001) concurrently.

## 📱 Usage

1. **Join a Room**: Enter your username and room name on the home page
2. **Start Chatting**: Send messages in real-time with other users
3. **Enable Voice Detection**: Click the microphone button to enable voice activity detection
4. **See Who's Speaking**: Voice indicators show when users are actively speaking

## 🏗️ Project Structure

```
realtime-chat-app/
├── src/
│   ├── app/                 # Next.js 14 app directory
│   │   ├── page.tsx         # Home page with room join form
│   │   ├── layout.tsx       # Root layout
│   │   └── globals.css      # Global styles
│   ├── components/          # React components
│   │   ├── ChatRoom.tsx     # Main chat interface
│   │   ├── MessageList.tsx  # Message display component
│   │   ├── MessageInput.tsx # Message input form
│   │   ├── UserList.tsx     # Online users sidebar
│   │   └── VoiceIndicator.tsx # Voice activity indicator
│   ├── hooks/               # Custom React hooks
│   │   ├── useChat.ts       # Main chat functionality
│   │   ├── useWebSocket.ts  # WebSocket connection management
│   │   └── useVoiceActivity.ts # Voice activity detection
│   ├── types/               # TypeScript type definitions
│   │   └── chat.ts          # Chat-related types
│   └── utils/               # Utility functions
│       └── isDev.ts         # Development environment check
├── server/                  # WebSocket server
│   └── websocket-server.js  # Main server file
├── public/                  # Static assets
└── package.json            # Dependencies and scripts
```

## 🔧 Available Scripts

- `npm run dev` - Start both frontend and WebSocket server in development mode
- `npm run dev:next` - Start only the Next.js frontend
- `npm run dev:server` - Start only the WebSocket server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code quality

## 🌐 WebSocket Events

### Client → Server
- `join` - Join a chat room
- `message` - Send a chat message
- `voice_activity` - Update voice activity status
- `leave` - Leave the current room

### Server → Client
- `user_list` - List of users in the room
- `user_joined` - New user joined notification
- `user_left` - User left notification
- `message` - New message received
- `voice_activity` - User voice activity update

## 🎤 Voice Activity Detection

The app uses the **Web Audio API** to detect when users are speaking:

- **Microphone Access**: Requests permission to access user's microphone
- **Audio Processing**: Analyzes audio frequency data in real-time
- **Threshold Detection**: Configurable sensitivity for voice detection
- **Visual Indicators**: Shows speaking status with animated indicators

### Voice Detection Features
- Configurable sensitivity threshold
- Real-time audio level monitoring
- Automatic noise filtering
- Cross-browser compatibility

## 🚀 Deployment

### Frontend (Vercel)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

### WebSocket Server (Railway/Heroku)

1. Create a new project on [Railway](https://railway.app) or [Heroku](https://heroku.com)
2. Set the `PORT` environment variable
3. Deploy the server code
4. Update `NEXT_PUBLIC_WEBSOCKET_URL` to point to your deployed server
