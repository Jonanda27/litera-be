// Simpan data user secara global di level modul
const videoUsers = new Map(); 

export const initWebRTCSocket = (io, socket) => {

    // ==============================
    // VIDEO ROOM (TERPISAH)
    // ==============================
    // Sekarang menerima payload berupa object { roomId, name }
    socket.on("join_video_room", (data) => {
        const roomId = typeof data === 'string' ? data : data.roomId;
        const name = data.name || `User_${socket.id.slice(0, 4)}`;

        if (!roomId) {
            console.log("❌ join_video_room tanpa roomId");
            return;
        }

        // Simpan nama user ke dalam Map berdasarkan socket.id
        videoUsers.set(socket.id, { id: socket.id, name, roomId: `video_${roomId}` });

        socket.join(`video_${roomId}`);
        console.log(`🎥 ${name} (${socket.id}) join VIDEO room: video_${roomId}`);

        // Ambil semua socket ID yang ada di room tersebut
        const socketIdsInRoom = Array.from(
            io.sockets.adapter.rooms.get(`video_${roomId}`) || []
        );

        // Ubah socket ID menjadi object lengkap {id, name} dari Map kita
        const usersWithNames = socketIdsInRoom.map(id => {
            const userData = videoUsers.get(id);
            return userData ? { id: userData.id, name: userData.name } : { id, name: "Unknown" };
        });

        // Kirim daftar user lengkap dengan nama ke SEMUA orang di room (termasuk yang baru join)
        io.to(`video_${roomId}`).emit("video_room_users", usersWithNames);

        // Beritahu orang lain bahwa user baru telah join (kirim object, bukan cuma string ID)
        socket.to(`video_${roomId}`).emit("video_user_joined", { id: socket.id, name });
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
            console.log(`❌ ${userData.name} disconnected`);
            // Beritahu orang lain di room yang sama
            socket.to(userData.roomId).emit("video_user_left", socket.id);
            // Hapus dari data memory
            videoUsers.delete(socket.id);
        } else {
            // Backup jika data di Map tidak ada
            socket.broadcast.emit("video_user_left", socket.id);
        }
    });
};