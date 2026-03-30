const videoUsers = new Map(); 

export const initWebRTCSocket = (io, socket) => {

    socket.on("join_video_room", (data) => {
        const roomId = typeof data === 'string' ? data : data.roomId;
        const name = data.name || `User_${socket.id.slice(0, 4)}`;

        if (!roomId) return;

        // Simpan info user
        videoUsers.set(socket.id, { id: socket.id, name, roomId: `video_${roomId}` });

        socket.join(`video_${roomId}`);
        console.log(`🎥 ${name} join room: video_${roomId}`);

        const socketIdsInRoom = Array.from(io.sockets.adapter.rooms.get(`video_${roomId}`) || []);
        
        // Hanya ambil daftar user lama, kecualikan yang baru join
        const existingUsers = socketIdsInRoom
            .filter(id => id !== socket.id) 
            .map(id => {
                const userData = videoUsers.get(id);
                return userData ? { id: userData.id, name: userData.name } : { id, name: "Unknown" };
            });

        // HANYA kirim daftar ke user yang baru join (dia akan jadi inisiator)
        socket.emit("video_room_users", existingUsers);

        // Beri tahu partisipan lama bahwa ada member baru (agar mereka stand-by)
        socket.to(`video_${roomId}`).emit("video_user_joined", { id: socket.id, name });
    });

    socket.on("send_chat_message", ({ roomId, message }) => {
        socket.to(`video_${roomId}`).emit("new_chat_message", message);
    });

    socket.on("webrtc_offer", ({ target, offer, senderId }) => {
        socket.to(target).emit("webrtc_offer", { offer, senderId });
    });

    socket.on("webrtc_answer", ({ target, answer, senderId }) => {
        socket.to(target).emit("webrtc_answer", { answer, senderId });
    });

    socket.on("webrtc_ice_candidate", ({ target, candidate, senderId }) => {
        socket.to(target).emit("webrtc_ice_candidate", { candidate, senderId });
    });

    socket.on("disconnect", () => {
        const userData = videoUsers.get(socket.id);
        if (userData) {
            socket.to(userData.roomId).emit("video_user_left", socket.id);
            videoUsers.delete(socket.id);
        } else {
            socket.broadcast.emit("video_user_left", socket.id);
        }
    });
};