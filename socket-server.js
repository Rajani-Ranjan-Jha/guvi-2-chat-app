const { createServer } = require('http');
const { Server } = require('socket.io');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Prepare the Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {

  // creating a basic HTTP server
  const server = createServer(async (req, res) => {
    try {
      await handle(req, res);
    } catch (err) {
      console.error('Error occurred handling request:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  // Create Socket.IO server
  const io = new Server(server, {
    cors: {
      origin: dev ? ["http://localhost:3000"] : ["https://yourdomain.com"],
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // storing online users with their socket IDs
  const onlineUsers = new Map(); // userId -> socketId
  const socketToUser = new Map(); // socketId -> userId

  // event handlers
  io.on('connection', (socket) => {
    console.log('User connected with ID:', socket.id);
    console.log('Socket connection established(socket-server)');

    // Join a conversation room
    socket.on('join-conversation', (conversationId) => {
      socket.join(conversationId);
      console.log(`User ${socket.id} joined conversation ${conversationId}`);
    });

    // Leave a conversation room
    socket.on('leave-conversation', (conversationId) => {
      socket.leave(conversationId);
      console.log(`User ${socket.id} left conversation ${conversationId}`);
    });

    // Handle online status
    socket.on('set-online', (userId) => {
      console.log(`User ${userId} is online(socket-server ${socket.id})\n`);
      

      socketToUser.set(socket.id, userId);
      onlineUsers.set(userId, socket.id)

      const allOnlineUsersId = Array.from(onlineUsers.keys())
      console.log(`Online users: [${allOnlineUsersId}]`);

      // send the data
      socket.emit('online-users-list', allOnlineUsersId);
      
      // Broadcast to all other clients that this user is online
      socket.broadcast.emit('user-online', userId);
      
    });

    // Handle offline status
    socket.on('set-offline', (userId) => {
      console.log(`User ${userId} is offline(socket-server)`);
      
      // Remove user from online users
      onlineUsers.delete(userId);
      socketToUser.delete(socket.id);
      
      // Broadcast to all clients that this user is offline
      io.emit('user-offline', userId);
    });

    // Handle typing-start
    socket.on('typing-start', (data) => {
      const { conversationId, userId, username } = data;
      socket.to(conversationId).emit('user-typing', {
        conversationId,
        userId,
        username,
        isTyping: true
      });
    });
    
    // Handle typing-stop
    socket.on('typing-stop', (data) => {
      const { conversationId, userId } = data;
      socket.to(conversationId).emit('user-typing', {
        conversationId,
        userId,
        isTyping: false
      });
    });

    // Handle new message
    socket.on('send-message', (data) => {
      const { conversationId, message } = data;
      console.log(`Received message for conversation ${conversationId}:`, message);
      io.to(conversationId).emit('new-message', {
        conversationId,
        message
      });
      console.log(`Message "${message}" send to conversation ${conversationId}`);
    });
    
    // Handle read receipts
    socket.on('mark-read', (data) => {
      const { conversationId, messageId, userId } = data;
      socket.to(conversationId).emit('message-read', {
        conversationId,
        messageId,
        userId
      });
    });

    // Handle message delivery confirmation
    socket.on('mark-delivered', (data) => {
      const { conversationId, messageId } = data;
      socket.to(conversationId).emit('message-delivered', {
        conversationId,
        messageId
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected with ID:', socket.id);
      
      // Remove user from online users and broadcast offline status
      const userId = socketToUser.get(socket.id);
      if (userId) {
        onlineUsers.delete(userId);
        socketToUser.delete(socket.id);
        io.emit('user-offline', userId);
        console.log(`User ${userId} went offline due to disconnection`);
      }
    });
  });

  // Run the server on PORT
  server.listen(port, (err) => {
    if (err) {
      console.error(err)
      return
    };
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log('> Socket.IO server is running');
  });
});
