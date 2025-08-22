# Chat-Z 🚀

A modern, real-time chat application built with Next.js 15, featuring seamless messaging, user authentication, and real-time communication powered by Socket.IO.

## ✨ Features

### 🎯 Core Features
- **Real-time Messaging** - Instant message delivery with Socket.IO
- **User Authentication** - Secure registration and login with NextAuth.js
- **Contact Management** - Add and manage contacts with ease
- **Conversation History** - Persistent chat history with MongoDB
- **Emoji Support** - Rich emoji picker for expressive messaging
- **Responsive Design** - Works seamlessly on desktop and mobile

### 🔧 Technical Features
- **Next.js 15** with App Router and Turbopack
- **Real-time Updates** - Live message synchronization across clients
- **File Upload Support** - Share images and files in conversations
- **User Profiles** - Customizable user profiles with avatars
- **Search Functionality** - Find users and messages quickly
- **Redux State Management** - Efficient state management with Redux Toolkit

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **Redux Toolkit** - State management
- **Tailwind CSS 4** - Utility-first CSS framework
- **Socket.IO Client** - Real-time communication

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **MongoDB** - NoSQL database with Mongoose ODM
- **Socket.IO Server** - Real-time bidirectional communication
- **NextAuth.js** - Authentication solution
- **JWT** - JSON Web Tokens for secure authentication

### Development Tools
- **ESLint** - Code linting
- **Concurrently** - Run multiple scripts simultaneously
- **Turbopack** - Fast development server

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB instance (local or cloud)
- npm/yarn/pnpm/bun package manager

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd chat-z
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Set up environment variables**
Create a `.env.local` file:
```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
JWT_SECRET=your_jwt_secret
```

4. **Start development servers**
```bash
# Start both Next.js and Socket.IO servers
npm run dev:all

# Or start them separately
npm run dev        # Next.js server
npm run dev:socket # Socket.IO server
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
chat-z/
├── app/
│   ├── api/           # API routes
│   ├── components/    # React components
│   ├── login/         # Login page
│   ├── register/      # Registration page
│   ├── create/        # Create Profile
│   └── redux/         # Redux store and slices
├── models/            # MongoDB models
├── utils/             # Utility functions
├── public/            # Static assets
└── socket-server.js   # Socket.IO server
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/get-token` - User login
- `GET /api/auth/[...nextauth]` - NextAuth.js routes

### User Management
- `GET /api/user/info` - Get user information
- `PUT /api/user/update` - Update user profile
- `GET /api/user/search` - Search users
- `POST /api/user/contact` - Manage contacts

### Messaging
- `POST /api/conversation/create` - Create new conversation
- `GET /api/conversation/[id]` - Get conversation details
- `GET /api/conversation/messages` - Get conversation messages
- `POST /api/messages/send` - Send message
- `POST /api/messages/upload` - Upload files

## 🎨 UI Components

### Core Components
- **RealTimeChat** - Main chat interface
- **RealTimeMessageInput** - Message input with emoji support
- **RealTimeMessageList** - Scrollable message display
- **UserProfile** - User profile management
- **ShowContacts** - Contact list display
- **AddContacts** - Add new contacts interface
- **EmojiPicker** - Emoji selection component

## 🌐 Socket.IO Events

### Client → Server
- `join_conversation` - Join a chat room
- `send_message` - Send a new message
- `typing` - Typing indicators
- `disconnect` - Handle disconnections

### Server → Client
- `new_message` - New message received
- `user_typing` - User is typing
- `user_online` - User status updates
- `message_delivered` - Message delivery confirmation

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

### Docker
```bash
# Build image
docker build -t chat-z .

# Run container
docker run -p 3000:3000 --env-file .env chat-z
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Socket.IO for real-time communication
- Tailwind CSS for styling
- Emoji-picker-react for emoji support

---

Made with ❤️ by the Chat-Z team
