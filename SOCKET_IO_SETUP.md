# Socket.IO Real-Time Chat Implementation

This document explains how to set up and use the real-time chat functionality implemented with Socket.IO in your Chat-Z application.

## 🚀 Features Implemented

- **Real-time messaging**: Instant message delivery between users
- **Typing indicators**: Shows when someone is typing
- **Online/offline status**: Real-time user presence
- **Read receipts**: Track message read status
- **File attachments**: Support for various file types
- **Optimistic updates**: Immediate UI feedback
- **Automatic reconnection**: Handles connection drops gracefully

## 📦 Installation

1. **Install dependencies** (already added to package.json):
```bash
npm install
```

2. **Verify packages are installed**:
```bash
npm list socket.io socket.io-client
```

## 🏃‍♂️ Running the Application

### Development Mode (with Socket.IO)
```bash
npm run dev:socket
```

### Development Mode (Next.js only)
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm run start:socket
```

## 🏗️ Architecture Overview

### Server-Side (Socket.IO)
- **File**: `socket-server.js`
- **Port**: 3000 (configurable via PORT environment variable)
- **Features**: 
  - WebSocket connections
  - Room-based messaging
  - Event handling for all chat features

### Client-Side (React)
- **SocketProvider**: Manages socket connections
- **useRealTimeMessaging**: Hook for real-time messaging
- **RealTimeChat**: Main chat component
- **RealTimeMessageInput**: Message input with typing indicators
- **RealTimeMessageList**: Message display with real-time updates

## 🔧 Configuration

### Environment Variables
```bash
# Development
NODE_ENV=development
PORT=3000

# Production
NODE_ENV=production
PORT=3000
```

### CORS Settings
The Socket.IO server is configured with CORS for:
- Development: `http://localhost:3000`
- Production: `https://yourdomain.com` (update this)

## 📱 Usage

### 1. Basic Chat Implementation
```jsx
import RealTimeChat from '@/app/components/RealTimeChat';

function ChatPage() {
  return (
    <RealTimeChat
      conversationId="conversation_123"
      conversationData={{ name: "Chat Room", participants: [] }}
    />
  );
}
```

### 2. Using the Socket Hook
```jsx
import { useRealTimeMessaging } from '@/app/hooks/useRealTimeMessaging';

function MyComponent() {
  const { messages, typingUsers, isConnected } = useRealTimeMessaging('conversation_123');
  
  return (
    <div>
      <p>Connection: {isConnected ? 'Online' : 'Offline'}</p>
      <p>Typing: {typingUsers.join(', ')}</p>
      {messages.map(msg => <div key={msg._id}>{msg.content}</div>)}
    </div>
  );
}
```

### 3. Direct Socket Access
```jsx
import { useSocket } from '@/app/components/SocketProvider';

function MyComponent() {
  const { socket, sendMessage, joinConversation } = useSocket();
  
  useEffect(() => {
    joinConversation('conversation_123');
  }, []);
  
  const sendMsg = () => {
    sendMessage('conversation_123', { content: 'Hello!' });
  };
}
```

## 🔌 Socket Events

### Client → Server
- `join-conversation`: Join a chat room
- `leave-conversation`: Leave a chat room
- `send-message`: Send a new message
- `typing-start`: Start typing indicator
- `typing-stop`: Stop typing indicator
- `mark-read`: Mark message as read
- `set-online`: Set user online status

### Server → Client
- `new-message`: Receive new message
- `user-typing`: User typing status
- `message-read`: Message read confirmation
- `user-online`: User came online
- `user-offline`: User went offline
- `message-delivered`: Message delivery confirmation

## 🎯 Key Components

### SocketProvider
- Manages socket connection lifecycle
- Handles authentication and user status
- Provides socket methods to child components

### useRealTimeMessaging Hook
- Manages conversation-specific state
- Handles real-time events
- Provides message CRUD operations

### RealTimeChat
- Complete chat interface
- Integrates message list and input
- Handles optimistic updates

## 🚨 Error Handling

The implementation includes:
- Connection error handling
- Automatic reconnection
- Fallback to API calls if socket fails
- User-friendly error messages

## 🔒 Security Considerations

- Socket connections require user authentication
- Users can only join conversations they're part of
- Input validation on both client and server
- Rate limiting for socket events (can be added)

## 📊 Performance Features

- **Optimistic updates**: Immediate UI feedback
- **Efficient re-renders**: Minimal component updates
- **Connection pooling**: Reuses socket connections
- **Automatic cleanup**: Proper event listener management

## 🧪 Testing

### Manual Testing
1. Open multiple browser tabs
2. Join the same conversation
3. Send messages and verify real-time delivery
4. Test typing indicators
5. Test online/offline status

### Automated Testing
```bash
# Run existing tests
npm run test

# Add Socket.IO specific tests
npm test -- --grep "Socket.IO"
```

## 🐛 Troubleshooting

### Common Issues

1. **Socket not connecting**
   - Check if `npm run dev:socket` is running
   - Verify CORS settings
   - Check browser console for errors

2. **Messages not updating in real-time**
   - Verify socket connection status
   - Check if user is authenticated
   - Verify conversation ID matches

3. **Typing indicators not working**
   - Check socket event listeners
   - Verify user permissions
   - Check for JavaScript errors

### Debug Mode
Enable debug logging:
```javascript
// In browser console
localStorage.setItem('socket-debug', 'true');
```

## 🔄 Migration from REST API

The Socket.IO implementation works alongside your existing REST API:
- **Real-time features**: Use Socket.IO
- **Data persistence**: Continue using REST API
- **Fallback**: Socket.IO failures fall back to REST API

## 📈 Scaling Considerations

- **Horizontal scaling**: Use Redis adapter for multiple server instances
- **Load balancing**: Socket.IO supports sticky sessions
- **Database**: Consider read replicas for message queries
- **Caching**: Implement Redis for frequently accessed data

## 🎉 Next Steps

1. **Enhanced Features**:
   - Voice/video calls
   - Push notifications
   - Message encryption
   - File sharing improvements

2. **Performance Optimizations**:
   - Message pagination
   - Lazy loading
   - Virtual scrolling for large conversations

3. **Monitoring**:
   - Socket connection metrics
   - Message delivery rates
   - User engagement analytics

---

For questions or issues, check the console logs and verify all dependencies are properly installed.
