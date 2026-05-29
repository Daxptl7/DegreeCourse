import { randomUUID } from 'crypto';
import User from '../models/User.js';
import Course from '../models/Course.js';
import { verifyToken } from '../utils/jwt.js';
import { ADMIN_ROLES, APPROVAL_STATUS, ROLES, USER_STATUS } from '../config/roles.js';

/** roomId -> socketId[] */
const roomMembers = {};
/** roomId -> { hostUserId, courseId, startedAt } */
const liveSessions = {};
/** socketId -> roomId */
const socketRoom = new Map();
/** socketId -> { userId, name, role } (server-side from DB) */
const socketMeta = new Map();
/** roomId -> chat row[] */
const roomMessages = new Map();
/** roomId -> Map<socketId, { name, userId }> — waiting for host admit */
const waitingByRoom = new Map();
/** socketId -> roomId while in waiting queue */
const waitingRoomBySocket = new Map();

const MAX_CHAT = 200;

const sameId = (a, b) => String(a) === String(b);

const getRoomList = (roomId) => {
  const ids = roomMembers[roomId] || [];
  return ids.map((socketId) => {
    const m = socketMeta.get(socketId);
    return {
      socketId,
      name: m?.name || 'User',
      role: m?.role || ROLES.STUDENT,
      userId: m?.userId || null
    };
  });
};

const getPendingList = (roomId) => {
  const m = waitingByRoom.get(roomId);
  if (!m) return [];
  return Array.from(m.entries()).map(([socketId, row]) => ({
    socketId,
    name: row.name,
    userId: row.userId
  }));
};

const notifyHostsPending = (io, roomId, session) => {
  if (!session) return;
  const hostId = session.hostUserId;
  const payload = { pending: getPendingList(roomId) };
  (roomMembers[roomId] || []).forEach((sid) => {
    const meta = socketMeta.get(sid);
    if (meta && sameId(meta.userId, hostId)) {
      io.to(sid).emit('pending-join-updated', payload);
    }
  });
};

const removeFromWaiting = (io, socketId) => {
  const roomId = waitingRoomBySocket.get(socketId);
  if (!roomId) return;
  waitingRoomBySocket.delete(socketId);
  waitingByRoom.get(roomId)?.delete(socketId);
  const sess = liveSessions[roomId];
  if (sess) notifyHostsPending(io, roomId, sess);
};

const tearDownRoom = (io, roomId, reason) => {
  const members = [...(roomMembers[roomId] || [])];
  const waitingSocketIds = [...(waitingByRoom.get(roomId)?.keys() || [])];

  delete liveSessions[roomId];
  roomMessages.delete(roomId);
  delete roomMembers[roomId];
  waitingByRoom.delete(roomId);

  waitingSocketIds.forEach((sid) => {
    waitingRoomBySocket.delete(sid);
    io.to(sid).emit('live-session-ended', { reason: reason || 'ended' });
  });

  members.forEach((sid) => {
    socketRoom.delete(sid);
    socketMeta.delete(sid);
    io.to(sid).emit('live-session-ended', { reason: reason || 'ended' });
  });
};

const removeOneSocket = (io, socketId) => {
  const roomId = socketRoom.get(socketId);
  const meta = socketMeta.get(socketId);

  if (!roomId) {
    socketMeta.delete(socketId);
    socketRoom.delete(socketId);
    return;
  }

  const sess = liveSessions[roomId];
  const hostId = sess?.hostUserId;
  const userIdLeaving = meta?.userId;

  const list = roomMembers[roomId];
  if (list) {
    const idx = list.indexOf(socketId);
    if (idx !== -1) list.splice(idx, 1);
  }
  socketRoom.delete(socketId);
  socketMeta.delete(socketId);

  (roomMembers[roomId] || []).forEach((sid) => {
    io.to(sid).emit('user-left', socketId);
  });

  if (sess && userIdLeaving && hostId && sameId(userIdLeaving, hostId)) {
    const stillHostPresent = (roomMembers[roomId] || []).some((sid) => {
      const m = socketMeta.get(sid);
      return m && sameId(m.userId, hostId);
    });
    if (!stillHostPresent) {
      tearDownRoom(io, roomId, 'host_left');
      return;
    }
  }

  if (!roomMembers[roomId] || roomMembers[roomId].length === 0) {
    delete roomMembers[roomId];
    delete liveSessions[roomId];
    roomMessages.delete(roomId);
    const waitMap = waitingByRoom.get(roomId);
    if (waitMap) {
      for (const sid of waitMap.keys()) {
        waitingRoomBySocket.delete(sid);
        io.to(sid).emit('live-session-ended', { reason: 'room_closed' });
      }
      waitingByRoom.delete(roomId);
    }
  }
};

const canAccessCourse = async (user, courseId) => {
  if (!user || !courseId) return false;
  if (ADMIN_ROLES.includes(user.role)) return true;

  const enrolled = (user.enrolledCourses || []).some((id) => sameId(id, courseId));
  if (enrolled) return true;

  const course = await Course.findById(courseId).select('instructor').lean();
  if (!course) return false;
  return sameId(course.instructor, user._id);
};

/**
 * Add an authenticated socket to the live room (WebRTC roster + chat).
 */
const completeJoin = (io, socket, roomId, u, session) => {
  const userIdStr = String(u._id);

  const dupSockets = (roomMembers[roomId] || []).filter((sid) => {
    const m = socketMeta.get(sid);
    return m && sameId(m.userId, userIdStr) && sid !== socket.id;
  });
  dupSockets.forEach((sid) => {
    io.to(sid).emit('live-session-ended', { reason: 'signed_in_elsewhere' });
    io.sockets.sockets.get(sid)?.disconnect(true);
    removeOneSocket(io, sid);
  });

  if (!roomMembers[roomId]) roomMembers[roomId] = [];
  roomMembers[roomId] = roomMembers[roomId].filter((id) => id !== socket.id);
  roomMembers[roomId].push(socket.id);

  socketMeta.set(socket.id, {
    userId: userIdStr,
    name: u.name || 'User',
    role: u.role || ROLES.STUDENT
  });
  socketRoom.set(socket.id, roomId);

  const clientList = getRoomList(roomId);
  const isHost = sameId(session.hostUserId, userIdStr);

  roomMembers[roomId].forEach((sid) => {
    io.to(sid).emit('user-joined', socket.id, clientList);
  });

  const history = roomMessages.get(roomId) || [];
  socket.emit('chat-history', history);

  socket.emit('room-joined', {
    isHost,
    hostUserId: session.hostUserId,
    courseId: session.courseId,
    roomId
  });

  notifyHostsPending(io, roomId, session);
};

export function attachSocketAuth(io) {
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      socket.data.user = null;
      return next();
    }
    const decoded = verifyToken(token);
    if (!decoded?.id) {
      socket.data.user = null;
      return next();
    }
    try {
      const user = await User.findById(decoded.id)
        .select('name email role status approvalStatus enrolledCourses')
        .lean();
      if (!user || user.status === USER_STATUS.SUSPENDED) {
        socket.data.user = null;
        return next();
      }
      if (user.role === ROLES.TEACHER && user.approvalStatus !== APPROVAL_STATUS.APPROVED) {
        socket.data.user = null;
        return next();
      }
      socket.data.user = user;
      return next();
    } catch {
      socket.data.user = null;
      return next();
    }
  });
}

export function registerLiveClassHandlers(io) {
  io.on('connection', (socket) => {
    socket.on('start-live-session', async ({ roomId, courseId }, callback) => {
      const u = socket.data.user;
      if (!u) {
        return callback?.({ success: false, error: 'Authentication required' });
      }
      if (!roomId || !courseId) {
        return callback?.({ success: false, error: 'Invalid payload' });
      }

      const course = await Course.findById(courseId).select('instructor').lean();
      if (!course) {
        return callback?.({ success: false, error: 'Course not found' });
      }

      const isInstructor = sameId(course.instructor, u._id);
      const isPlatformAdmin = [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(u.role);
      if (!isInstructor && !isPlatformAdmin) {
        return callback?.({ success: false, error: 'Only the course instructor can start a live session' });
      }

      const existing = liveSessions[roomId];
      if (existing && !sameId(existing.hostUserId, u._id) && !isPlatformAdmin) {
        return callback?.({ success: false, error: 'This meeting code is already in use' });
      }

      liveSessions[roomId] = {
        hostUserId: String(u._id),
        courseId: String(courseId),
        startedAt: Date.now()
      };

      io.emit('live-session-started', { roomId, teacherId: String(u._id) });
      callback?.({ success: true });
    });

    socket.on('check-live-status', (roomId, callback) => {
      const isLive = Boolean(liveSessions[roomId]);
      callback?.({ isLive });
    });

    socket.on('join-call', async (roomId, _legacyMeta, cb) => {
      const u = socket.data.user;
      if (!u) {
        socket.emit('error', 'Authentication required to join the live class.');
        return cb?.({ success: false, error: 'auth' });
      }

      const session = liveSessions[roomId];
      if (!session) {
        socket.emit('error', 'This live session has not started or has already ended.');
        return cb?.({ success: false, error: 'no_session' });
      }

      const ok = await canAccessCourse(u, session.courseId);
      if (!ok) {
        socket.emit('error', 'You are not allowed to join this live class.');
        return cb?.({ success: false, error: 'forbidden' });
      }

      const userIdStr = String(u._id);
      const isMeetingHost = sameId(session.hostUserId, userIdStr);
      const skipWait = isMeetingHost || ADMIN_ROLES.includes(u.role);

      if (skipWait) {
        completeJoin(io, socket, roomId, u, session);
        return cb?.({ success: true, mode: 'joined' });
      }

      const waitMap = waitingByRoom.get(roomId);
      if (waitMap) {
        for (const [sid, row] of [...waitMap.entries()]) {
          if (sameId(row.userId, userIdStr) && sid !== socket.id) {
            waitMap.delete(sid);
            waitingRoomBySocket.delete(sid);
            io.to(sid).emit('live-session-ended', { reason: 'signed_in_elsewhere' });
            io.sockets.sockets.get(sid)?.disconnect(true);
          }
        }
      }

      if (!waitingByRoom.has(roomId)) waitingByRoom.set(roomId, new Map());
      waitingByRoom.get(roomId).set(socket.id, { name: u.name || 'User', userId: userIdStr });
      waitingRoomBySocket.set(socket.id, roomId);

      socket.emit('join-queued', { roomId, message: 'Waiting for the host to let you in.' });
      notifyHostsPending(io, roomId, session);
      return cb?.({ success: true, mode: 'waiting' });
    });

    socket.on('live-admit', ({ roomId, targetSocketId }) => {
      const u = socket.data.user;
      if (!u || !roomId || !targetSocketId) return;

      const session = liveSessions[roomId];
      if (!session) return;

      const canAdmit =
        sameId(session.hostUserId, u._id) || [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(u.role);
      if (!canAdmit) return;

      const waitMap = waitingByRoom.get(roomId);
      if (!waitMap?.has(targetSocketId)) return;

      const targetSocket = io.sockets.sockets.get(targetSocketId);
      const targetUser = targetSocket?.data?.user;
      if (!targetSocket || !targetUser) {
        waitMap.delete(targetSocketId);
        waitingRoomBySocket.delete(targetSocketId);
        notifyHostsPending(io, roomId, session);
        return;
      }

      waitMap.delete(targetSocketId);
      waitingRoomBySocket.delete(targetSocketId);

      targetSocket.emit('join-admitted', { roomId });
      completeJoin(io, targetSocket, roomId, targetUser, session);
    });

    socket.on('chat-message', (payload) => {
      const roomId = socketRoom.get(socket.id);
      if (!roomId || !liveSessions[roomId]) return;

      const u = socket.data.user;
      if (!u) return;

      const text = typeof payload === 'string' ? payload : payload?.text;
      if (!text || typeof text !== 'string') return;
      const trimmed = text.trim().slice(0, 2000);
      if (!trimmed) return;

      const row = {
        id: randomUUID(),
        text: trimmed,
        senderName: u.name || 'User',
        senderUserId: String(u._id),
        senderSocketId: socket.id,
        ts: Date.now()
      };

      if (!roomMessages.has(roomId)) roomMessages.set(roomId, []);
      const arr = roomMessages.get(roomId);
      arr.push(row);
      if (arr.length > MAX_CHAT) arr.splice(0, arr.length - MAX_CHAT);

      (roomMembers[roomId] || []).forEach((sid) => {
        io.to(sid).emit('chat-message', row);
      });
    });

    socket.on('signal', (toId, message) => {
      if (!toId || message === undefined) return;
      const roomA = socketRoom.get(socket.id);
      const roomB = socketRoom.get(toId);
      if (!roomA || roomA !== roomB) return;
      io.to(toId).emit('signal', socket.id, message);
    });

    socket.on('end-live-session', ({ roomId }) => {
      const u = socket.data.user;
      if (!u || !roomId) return;
      const sess = liveSessions[roomId];
      if (!sess) return;
      if (!sameId(sess.hostUserId, u._id) && ![ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(u.role)) {
        return;
      }
      tearDownRoom(io, roomId, 'ended_by_host');
    });

    socket.on('disconnect', () => {
      removeFromWaiting(io, socket.id);
      removeOneSocket(io, socket.id);
    });
  });
}
