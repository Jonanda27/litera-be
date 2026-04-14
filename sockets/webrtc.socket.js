export const initWebRTCSocket = (io, socket) => {

    // ==============================
    // VIDEO ROOM (TERPISAH)
    // ==============================
    socket.on("join_video_room", (roomId) => {
        if (!roomId) {
            console.log("❌ join_video_room tanpa roomId");
            return;
        }

        socket.join(`video_${roomId}`);

        console.log(`🎥 ${socket.id} join VIDEO room: video_${roomId}`);

        const users = Array.from(
            io.sockets.adapter.rooms.get(`video_${roomId}`) || []
        );

        io.to(`video_${roomId}`).emit("video_room_users", users);

        socket.to(`video_${roomId}`).emit("video_user_joined", socket.id);
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
        socket.broadcast.emit("video_user_left", socket.id);
    });
};