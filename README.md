# Real-Time Chat Application

A modern, full-stack real-time chat application built with React, Node.js, and Socket.IO. Features include instant messaging, user authentication, profile management, and real-time online status tracking.

## 🚀 Features

### Core Features
- **Real-time Messaging**: Instant message delivery using Socket.IO
- **User Authentication**: Secure login/signup with JWT tokens
- **User Profiles**: Customizable user profiles with avatar uploads
- **Online Status**: Real-time online/offline user tracking
- **Message Management**: Send, receive, and delete messages
- **Read Receipts**: Message seen status tracking
- **Image Sharing**: Support for image uploads in messages
- **Responsive Design**: Modern UI that works on all devices

### Technical Features
- **Real-time Updates**: Live message delivery without page refresh
- **Socket Connection Management**: Robust connection handling with reconnection logic
- **State Management**: Zustand for efficient client-side state management
- **Theme Support**: Dark/light theme switching
- **File Upload**: Cloudinary integration for image storage
- **Database**: MongoDB with Mongoose ODM
- **Security**: JWT authentication, password hashing, CORS protection

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **DaisyUI** - Component library for Tailwind
- **Socket.IO Client** - Real-time communication
- **Zustand** - Lightweight state management
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Lucide React** - Beautiful icons
- **React Hot Toast** - Toast notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Socket.IO** - Real-time bidirectional communication
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **Cloudinary** - Cloud image storage
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
real-time-chat-app/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── store/           # Zustand state stores
│   │   ├── lib/             # Utility libraries
│   │   └── App.jsx          # Main application component
│   ├── public/              # Static assets
│   └── package.json
├── backend/                  # Node.js backend server
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Custom middleware
│   │   ├── lib/             # Utility libraries
│   │   └── index.js         # Server entry point
│   └── package.json
└── package.json             # Root package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Cloudinary account (for image uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd real-time-chat-app
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment Setup**

   Create a `.env` file in the backend directory:
   ```env
   PORT=3008
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   NODE_ENV=development
   ```

4. **Start the application**

   **Option 1: Start both frontend and backend separately**
   ```bash
   # Start backend (from backend directory)
   cd backend
   npm run dev
   
   # Start frontend (from frontend directory, in a new terminal)
   cd frontend
   npm run dev
   ```

   **Option 2: Use the root scripts**
   ```bash
   # Build and start (production mode)
   npm run build
   npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3008

## 📱 Usage

### Authentication
1. **Sign Up**: Create a new account with email and password
2. **Log In**: Use your credentials to access the chat
3. **Profile**: Customize your profile with avatar and personal information

### Chat Features
1. **Start Chat**: Select a user from the sidebar to start chatting
2. **Send Messages**: Type text messages or upload images
3. **Real-time Updates**: Messages appear instantly without refresh
4. **Online Status**: See who's currently online
5. **Read Receipts**: Know when your messages are read
6. **Delete Messages**: Remove messages you've sent

### Settings
- **Theme**: Switch between light and dark themes
- **Profile**: Update your profile information and avatar
- **Logout**: Securely log out from the application

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Messages
- `GET /api/message/:id` - Get messages with a user
- `POST /api/message/send/:id` - Send a message
- `DELETE /api/message/:id` - Delete a message

### Profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/upload` - Upload profile picture

## 🔌 Socket Events

### Client to Server
- `join` - Join user's room
- `send_message` - Send a new message
- `delete_message` - Delete a message
- `mark_seen` - Mark messages as seen
- `logout` - User logout

### Server to Client
- `receive_message` - Receive a new message
- `delete_message` - Message deleted notification
- `messages_seen` - Messages marked as seen
- `online_users` - Updated online users list

## 🐛 Troubleshooting

### Common Issues

**Socket Connection Issues**
- Check if backend is running on port 3008
- Verify CORS configuration
- Ensure cookies are enabled in browser
- Check browser console for connection errors

**Real-time Messages Not Working**
- Verify socket connection status
- Check message subscriptions are set up
- Ensure both users are online
- Review console logs for errors

**Online Users Count Issues**
- Clear browser cache and cookies
- Restart both frontend and backend
- Check debug endpoint: `http://localhost:3008/debug/online-users`

### Debug Tools
- **Online Users Debug**: Visit `http://localhost:3008/debug/online-users`
- **Browser Console**: Check for socket connection logs
- **Network Tab**: Monitor WebSocket connections

## 🚀 Deployment

### Frontend Deployment
1. Build the frontend: `npm run build --prefix frontend`
2. Deploy the `frontend/dist` folder to your hosting service

### Backend Deployment
1. Set environment variables for production
2. Deploy to your preferred hosting service (Heroku, Railway, etc.)
3. Update CORS origins for production domain

### Environment Variables for Production
```env
NODE_ENV=production
PORT=3008
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- Socket.IO for real-time communication
- Tailwind CSS for styling
- DaisyUI for beautiful components
- Cloudinary for image storage
- MongoDB for database

---

**Note**: This application is designed for educational and personal use. For production deployment, ensure proper security measures and environment configuration. 