const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

const PORT = process.env.WEBSOCKET_PORT || 3001;

const wss = new WebSocket.Server({ port: PORT });

const clients = new Map();
const rooms = new Map();

console.log(`WebSocket server running on port ${PORT}`);

wss.on('connection', (ws) => {
  const clientId = uuidv4();
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'join':
          handleJoin(ws, clientId, data);
          break;
        case 'message':
          handleMessage(clientId, data);
          break;
        case 'voice_activity':
          handleVoiceActivity(clientId, data);
          break;
        case 'leave':
          handleLeave(clientId);
          break;
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  ws.on('close', () => {
    handleLeave(clientId);
  });
});

function handleJoin(ws, clientId, data) {
  const { username, room } = data;
  
  const existingUser = Array.from(clients.values())
    .find(client => client.username === username && client.room === room);
  
  if (existingUser) {
    // Remove the existing user first
    handleLeave(existingUser.id);
  }
  
  clients.set(clientId, {
    id: clientId,
    username,
    room,
    ws,
    isActive: false
  });

  if (!rooms.has(room)) {
    rooms.set(room, new Set());
  }
  rooms.get(room).add(clientId);

  // Send user list to new user
  const roomUsers = Array.from(rooms.get(room))
    .map(id => clients.get(id))
    .filter(client => client)
    .map(client => ({
      id: client.id,
      username: client.username,
      isActive: client.isActive
    }));

  ws.send(JSON.stringify({
    type: 'user_list',
    users: roomUsers
  }));

  // Broadcast new user to room
  broadcastToRoom(room, {
    type: 'user_joined',
    user: { id: clientId, username, isActive: false }
  }, clientId);

  // Send system message
  broadcastToRoom(room, {
    type: 'message',
    id: uuidv4(),
    username: 'System',
    message: `${username} joined the chat`,
    timestamp: new Date().toISOString(),
    isSystem: true
  });
}

function handleMessage(clientId, data) {
  const client = clients.get(clientId);
  if (!client) return;

  const messageData = {
    type: 'message',
    id: uuidv4(),
    username: client.username,
    message: data.message,
    timestamp: new Date().toISOString(),
    userId: clientId
  };

  broadcastToRoom(client.room, messageData);
}

function handleVoiceActivity(clientId, data) {
  const client = clients.get(clientId);
  if (!client) return;

  client.isActive = data.isActive;

  broadcastToRoom(client.room, {
    type: 'voice_activity',
    userId: clientId,
    isActive: data.isActive
  }, clientId);
}

function handleLeave(clientId) {
  const client = clients.get(clientId);
  if (!client) return;

  const { room, username } = client;

  // Remove from room
  if (rooms.has(room)) {
    rooms.get(room).delete(clientId);
    if (rooms.get(room).size === 0) {
      rooms.delete(room);
    }
  }

  // Remove client
  clients.delete(clientId);

  // Broadcast user left
  broadcastToRoom(room, {
    type: 'user_left',
    userId: clientId
  });

  // Send system message
  broadcastToRoom(room, {
    type: 'message',
    id: uuidv4(),
    username: 'System',
    message: `${username} left the chat`,
    timestamp: new Date().toISOString(),
    isSystem: true
  });
}

function broadcastToRoom(room, data, excludeClientId = null) {
  if (!rooms.has(room)) return;

  const message = JSON.stringify(data);
  rooms.get(room).forEach(clientId => {
    if (clientId === excludeClientId) return;
    
    const client = clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(message);
    }
  });
}