import { PrivateChatMessage, User } from "../models/index.js";

export const initMentoringSocket = (io) => {
    const mentoringNamespace = io.of("/mentoring-privat");

    mentoringNamespace.on("connection", (socket) => {
        socket.on("join_mentoring", (data) => {
            if (data.roomId) {
                socket.join(data.roomId);
            }
        });

        socket.on("send_private_message", (data) => {
            if (!data.room || !data.text) return;

            const payload = {
                id: data.id || Date.now(),
                text: data.text,
                senderId: data.senderId,
                senderName: data.senderName, 
                room: data.room,
                timestamp: data.timestamp || new Date().toLocaleTimeString([], { 
                    hour: '2-digit', minute: '2-digit' 
                }),
            };

            // PENTING: Menggunakan socket.to() bukan mentoringNamespace.to()
            // socket.to(room) akan mem-broadcast ke lawan bicara SAJA dan tidak dipantulkan kembali ke pengirim.
            socket.to(data.room).emit("receive_private_message", payload);
        });
    });
};