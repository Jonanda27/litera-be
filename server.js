import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { ChatMessage, User } from "./models/index.js";
import { initMentoringSocket } from "./sockets/mentoring.socket.js";
import { initWhatsApp } from "./services/whatsappService.js";
import { initWebRTCSocket } from "./sockets/webrtc.socket.js";

const PORT = process.env.PORT || 5000; // Pastikan ada fallback port
const server = http.createServer(app);

// Inisialisasi Socket.io
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://litera.geocitra.com"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }  // <-- Correctly closing the cors object
});

/**
 * PENTING: Inisialisasi Namespace Privat di LUAR io.on("connection")
 * Ini mendaftarkan jalur /mentoring-privat agar tidak "Invalid Namespace"
 */
initMentoringSocket(io);

const onlineUsers = new Map();

// Namespace Default (/) untuk Chat Umum/Diskusi
io.on("connection", (socket) => {
  console.log(`🔌 User terhubung ke Global: ${socket.id}`);

  // 1. EVENT JOIN ROOM & TRACK ONLINE
  socket.on("join_room", (data) => {
    const discussionId = typeof data === 'object' ? data.discussionId : data;
    const user = typeof data === 'object' ? data.user : null;

    socket.join(discussionId);

    if (user) {
      onlineUsers.set(socket.id, { ...user, discussionId });
      console.log(`👤 ${user.nama} bergabung ke Diskusi ID: ${discussionId}`);
      updateOnlineStatus(discussionId);
    } else {
      console.log(`👤 User bergabung ke Diskusi ID: ${discussionId}`);
    }
  });

  // 2. EVENT SEND MESSAGE (Diskusi Umum)
  socket.on("send_message", async (data) => {
    try {
      const savedMsg = await ChatMessage.create({
        discussionId: data.room,
        senderId: data.senderId,
        message: data.text || "",
        imageUrl: data.image
      });

      const sender = await User.findByPk(data.senderId, { attributes: ['nama'] });

      const payload = {
        id: savedMsg.id,
        text: savedMsg.message,
        image: data.image,
        sender: sender ? sender.nama : "User",
        senderId: data.senderId,
        room: data.room,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      io.to(data.room).emit("receive_message", payload);
    } catch (error) {
      console.error("❌ Error socket:", error.message);
    }
  });

  // 3. EVENT DISCONNECT
  socket.on("disconnect", () => {
    const user = onlineUsers.get(socket.id);
    if (user) {
      const room = user.discussionId;
      onlineUsers.delete(socket.id);
      updateOnlineStatus(room);
      console.log(`❌ ${user.nama} terputus dari Global`);
    } else {
      console.log("❌ User terputus dari Global");
    }
  });

  // Helper online status
  function updateOnlineStatus(discussionId) {
    const usersInRoom = Array.from(onlineUsers.values())
      .filter(u => u.discussionId === discussionId)
      .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);

    io.to(discussionId).emit("online_users_list", usersInRoom);
  };
  initWebRTCSocket(io, socket);
});

server.listen(PORT, () => console.log(`🚀 Server aktif di port ${PORT}`));

initWhatsApp();
