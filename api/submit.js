import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { code, ip, port, host } = req.body;
    const roomKey = `room:${code}`;
    const roomData = JSON.stringify({
      ip,
      port,
      hostName: host,
      lastActive: Date.now()
    });
    // 房间兜底2小时过期
    await kv.set(roomKey, roomData, { ex: 7200 });
    
    return res.status(200).send('ok');
  } catch (err) {
    console.error('写入房间失败', err);
    return res.status(500).send('error');
  }
}
