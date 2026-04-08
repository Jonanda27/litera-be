import express from "express";
import { AccessToken } from "livekit-server-sdk";

const router = express.Router();

router.post("/token", async (req, res) => {
    const { roomName, userName } = req.body;

    const at = new AccessToken("devkey", "secret", {
        identity: userName,
    });

    at.addGrant({
        roomJoin: true,
        room: roomName,
        canPublish: true,
        canSubscribe: true,
    });

    const token = await at.toJwt();

    res.json({ token });
});

export default router;