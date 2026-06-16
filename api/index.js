const rooms = new Map();

export default function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }
    
    if (req.method === "GET") {
        return res.status(200).json({ status: "ok" });
    }
    
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
                
                return res.status(200).json({ code: roomCode });
            }
            
            case "join": {
                const room = rooms.get(code);
                if (!room || Date.now() > room.expire) {
                    rooms.delete(code);
                    return res.status(404).json({ err: "房间不存在" });
                }
                return res.status(200).json(room);
            }
            
            default:
                return res.status(400).json({ err: "未知操作" });
        }
    } catch (e) {
        return res.status(500).json({ err: e.message });
    }
}
