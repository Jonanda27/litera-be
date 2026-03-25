import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { ChatMessage, User } from "./models/index.js";

const PORT = process.env.PORT || 4000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"], credentials: true }
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log(`🔌 User terhubung: ${socket.id}`);

  // 1. EVENT JOIN ROOM & TRACK ONLINE
  socket.on("join_room", (data) => {
    // Menangani data baik berupa string ID atau Object {discussionId, user}
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

  // 2. EVENT SEND MESSAGE
  socket.on("send_message", async (data) => {
  try {
    // 1. Simpan ke Database
    const savedMsg = await ChatMessage.create({
      discussionId: data.room,
      senderId: data.senderId,
      message: data.text || "", // Jika hanya kirim gambar, teks bisa kosong
      imageUrl: data.image     // Pastikan ini mengambil data.image dari frontend
    });

    // 2. Ambil Nama Pengirim
    const sender = await User.findByPk(data.senderId, {
      attributes: ['nama']
    });

    // 3. Susun Payload untuk dikirim balik (Broadcast)
    const payload = {
      id: savedMsg.id,
      text: data.text,
      image: data.image, // SANGAT PENTING: Sertakan ini agar user lain bisa melihat gambar
      sender: sender ? sender.nama : "User",
      senderId: data.senderId,
      room: data.room,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      }),
    };

    // 4. Kirim ke semua orang di ruangan tersebut
    io.to(data.room).emit("receive_message", payload);
    
  } catch (error) {
    console.error("❌ Error Socket:", error);
  }
});

  // 3. EVENT DISCONNECT
  socket.on("disconnect", () => {
    const user = onlineUsers.get(socket.id);
    if (user) {
      const room = user.discussionId;
      onlineUsers.delete(socket.id);
      updateOnlineStatus(room);
      console.log(`❌ ${user.nama} terputus`);
    } else {
      console.log("❌ User terputus");
    }
  });

  // Helper online status
  const updateOnlineStatus = (discussionId) => {
    const usersInRoom = Array.from(onlineUsers.values())
      .filter(u => u.discussionId === discussionId)
      // Deduplikasi user ID yang sama (jika satu user buka banyak tab)
      .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);

    io.to(discussionId).emit("online_users_list", usersInRoom);
  };
});

server.listen(PORT, () => console.log(`🚀 Server aktif di port ${PORT}`));