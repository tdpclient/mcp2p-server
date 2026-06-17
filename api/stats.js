import { kv } from "@vercel/kv";

async function initServerUptime() {
  const start = await kv.get("server:startTime");
  if (!start) {
    await kv.set("server:startTime", Date.now());
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');

  try {
    await initServerUptime();
    const startTs = Number(await kv.get("server:startTime"));
    const now = Date.now();
    const runMs = now - startTs;
    const runSec = Math.floor(runMs / 1000);
    const runMin = Math.floor(runSec / 60);
    const runHour = Math.floor(runMin / 60);
    const runDay = Math.floor(runHour / 24);

    const hostCodes = await kv.smembers("online:hosts");
    const onlineHostList = [];
    for (const code of hostCodes) {
      const room = await kv.get(`room:${code}`);
      if (!room) continue;
      const info = JSON.parse(room);
      onlineHostList.push({
        code,
        hostName: info.hostName,
        ip: info.ip,
        port: info.port,
        lastActive: info.lastActive
      });
    }

    const playerCount = Number(await kv.get("total:playerVisit") || 0);

    const stats = {
      serverUptime: {
        day: runDay,
        hour: runHour % 24,
        minute: runMin % 60,
        second: runSec % 60,
        totalSeconds: runSec
      },
      onlineHostCount: onlineHostList.length,
      onlineHosts: onlineHostList,
      totalPlayerVisits: playerCount
    };
    return res.status(200).json(stats);
  } catch (err) {
    console.error("获取统计数据失败", err);
    return res.status(500).json({ error: err.message });
  }
}
