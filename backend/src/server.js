
import app from './app.js';
import { connectDB } from './config/db.js';
import { config } from './config/env.js';
import User from './models/User.js'; // Import User model

// Connect to database
connectDB();

const PORT = config.server.port || 5001;

import { Server } from 'socket.io';
import { createServer } from 'http';

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*', // Allow all origins for dev; restrict in prod
    methods: ['GET', 'POST']
  }
});

// Socket.IO Connection Handler
// Track active live classes: { roomId: { teacherId, startTime, courseId } }
// Socket State
import { activeClasses, connections, messages, timeOnline, users } from './socketStore.js';


io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-call', async (path, meta) => {
    
    // Authorization Check
    const session = activeClasses[path];
    if (session && session.courseId && meta && meta.userId) {
        try {
            const user = await User.findById(meta.userId);
            if (user) {
                const isInstructor = user.role === 'teacher' || user.role === 'admin';
                const isEnrolled = user.enrolledCourses.includes(session.courseId);
                
                if (!isInstructor && !isEnrolled) {
                    console.log(`Unauthorized access attempt by ${user.name} to room ${path}`);
                    socket.emit('error', 'You are not enrolled in this course.');
                    return; // Stop execution, don't add to connections
                }
            } else {
                 // User not found in DB
                 // socket.emit('error', 'User not found');
                 // return;
            }
        } catch (err) {
            console.error("Auth check error:", err);
        }
    } else if (session && session.courseId && (!meta || !meta.userId)) {
        // Enforce auth if we know it's a course session
        // If meta.userId is missing but it's a secured session, maybe deny?
        // strict mode: socket.emit('error', 'Authentication required'); return;
    }


    if (connections[path] === undefined) {
      connections[path] = [];
    }
    connections[path].push(socket.id);
    timeOnline[socket.id] = new Date();

    // Store user metadata
    if (meta) {
      users[socket.id] = meta;
    }

    // Notify everyone in the room
    // Send rich client list with metadata
    const clientList = connections[path].map(id => ({
      socketId: id,
      name: users[id]?.name,
      role: users[id]?.role
    }));
    
    connections[path].forEach(socketId => {
        io.to(socketId).emit("user-joined", socket.id, clientList);
    });

    if (messages[path] !== undefined) {
      for (let a = 0; a < messages[path].length; ++a) {
        io.to(socket.id).emit("chat-message", messages[path][a]['data'],
          messages[path][a]['sender'], messages[path][a]['socket-id-sender']);
      }
    }
  });

  socket.on('signal', (toId, message) => {
    io.to(toId).emit('signal', socket.id, message);
  });

  socket.on('chat-message', (data, sender) => {
    const [matchingRoom, found] = Object.entries(connections)
      .reduce(([room, isFound], [roomKey, roomValue]) => {
        if (!isFound && roomValue.includes(socket.id)) {
          return [roomKey, true];
        }
        return [room, isFound];
      }, ['', false]);

    if (found === true) {
      if (messages[matchingRoom] === undefined) {
        messages[matchingRoom] = [];
      }
      messages[matchingRoom].push({ 'sender': sender, "data": data, "socket-id-sender": socket.id });
      // console.log("message", matchingRoom, ":", sender, data);

      connections[matchingRoom].forEach((elem) => {
        io.to(elem).emit("chat-message", data, sender, socket.id);
      });
    }
  });

  socket.on('disconnect', () => {
    console.log("User disconnected:", socket.id);
    var key;
    for (const [k, v] of Object.entries(connections)) {
      for (let a = 0; a < v.length; ++a) {
        if (v[a] === socket.id) {
          key = k;
          for (let a = 0; a < connections[key].length; ++a) {
            io.to(connections[key][a]).emit('user-left', socket.id);
          }
          var index = connections[key].indexOf(socket.id);
          connections[key].splice(index, 1);

          if (connections[key].length === 0) {
            delete connections[key];
          }
        }
      }
    }
    delete users[socket.id]; // Cleanup metadata
  });

  // Keeping start-live-session for teacher dashboard status (Course listing)
  socket.on('start-live-session', ({ roomId, teacherId, courseId }, callback) => {
    activeClasses[roomId] = { teacherId, startTime: new Date(), courseId };
    io.emit('live-session-started', { roomId, teacherId });
    if (callback) callback({ success: true });
  });

  // Keeping check-live-status for student enrollment check
  socket.on('check-live-status', (roomId, callback) => {
    const isLive = !!activeClasses[roomId];
    callback({ isLive });
  });

});

httpServer.listen(PORT, () => {
  console.log(`Server running in ${config.server.env} mode on port ${PORT}`);
});
