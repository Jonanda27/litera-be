const videoUsers = new Map(); 

export const initWebRTCSocket = (io, socket) => {
    socket.on("join_video_room", (data) => {
        const roomId = typeof data === 'string' ? data : data.roomId;
        const name = data.name || `User_${socket.id.slice(0, 4)}`;
        if (!roomId) return;

        const fullRoomId = `video_${roomId}`;
        
        // Simpan data user ke Map
        videoUsers.set(socket.id, { id: socket.id, name, roomId: fullRoomId });
        socket.join(fullRoomId);

        console.log(`🎥 User ${name} (${socket.id}) joined ${fullRoomId}`);

        // 1. Ambil daftar user yang benar-benar ada di room saat ini
        const room = io.sockets.adapter.rooms.get(fullRoomId);
        const socketIdsInRoom = room ? Array.from(room) : [];

        const existingUsers = socketIdsInRoom
            .filter(id => id !== socket.id)
            .map(id => {
                const userData = videoUsers.get(id);
                return { id, name: userData ? userData.name : "User" };
            });

        // 2. Kirim ke user yang baru join daftar user lama
        socket.emit("video_room_users", existingUsers);

        // 3. Beritahu user lain bahwa ada member baru (agar mereka siap menerima signal)
        socket.to(fullRoomId).emit("video_user_joined", { id: socket.id, name });
    });

    // --- SIGNALING CORE ---
    // Tambahkan senderName agar FE bisa menampilkan nama saat proses handshaking
    socket.on("webrtc_offer", ({ target, offer }) => {
        const senderData = videoUsers.get(socket.id);
        socket.to(target).emit("webrtc_offer", { 
            offer, 
            senderId: socket.id,
            senderName: senderData?.name || "User"
        });
    });

    socket.on("webrtc_answer", ({ target, answer }) => {
        socket.to(target).emit("webrtc_answer", { answer, senderId: socket.id });
    });

    socket.on("webrtc_ice_candidate", ({ target, candidate }) => {
        socket.to(target).emit("webrtc_ice_candidate", { candidate, senderId: socket.id });
    });

    // --- FITUR TAMBAHAN (CHAT & HAND RAISE) ---
    socket.on("send_chat_message", ({ roomId, message }) => {
        // Gunakan to().emit() agar pengirim tidak menerima pesan miliknya sendiri via socket
        socket.to(`video_${roomId}`).emit("new_chat_message", message);
    });

    socket.on("toggle_raise_hand", ({ roomId, isRaised, name }) => {
        socket.to(`video_${roomId}`).emit("user_toggled_hand", { 
            userId: socket.id, 
            isRaised, 
            name 
        });
    });

    socket.on("disconnect", () => {
        const userData = videoUsers.get(socket.id);
        if (userData) {
            console.log(`❌ User left: ${userData.name}`);
            socket.to(userData.roomId).emit("video_user_left", socket.id);
            videoUsers.delete(socket.id);
        }
    });
};