const express = require('express');
const app = express();

app.use(express.json());

// CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.sendStatus(200);
    next();
});

const rooms = new Map();

// 健康检查
app.get("/", (req, res) => {
    res.json({ status: "ok" });
});

// 创建房间
app.post("/", (req, res) => {
    try {
        const { action, code, ip, port, name } = req.body;
        
        switch (action) {
            case "host": {
                const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
                let roomCode = "";
                for (let i = 0; i < 6; i++) {
                    roomCode += chars[Math.floor(Math.random() * chars.length)];
                }
                
                rooms.set(roomCode, {
                    hostIp: ip,
                    hostPort: port,
                    hostName: name,
                    expire: Date.now() + 172800000
                });
                
                return res.json({ code: roomCode });
            }
            
            case "join": {
                const room = rooms.get(code);
                if (!room || Date.now() > room.expire) {
                    rooms.delete(code);
                    return res.status(404).json({ err: "房间不存在" });
                }
                return res.json(room);
            }
            
            default:
                return res.status(400).json({ err: "未知操作" });
        }
    } catch (e) {
        res.status(500).json({ err: e.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
