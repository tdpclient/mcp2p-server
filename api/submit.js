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
    // 房间2小时兜底过期
    await kv.set(roomKey, roomData, { ex: 7200 });

    // 把在线房主code存入在线集合，用于统计
    await kv.sadd("online:hosts", code);
    // 记录该房主最后活跃时间
    await kv.set(`active:${code}`, Date.now(), { ex: 7200 });

    return res.status(200).send('ok');
  } catch (err) {
    console.error('写入房间失败', err);
    return res.status(500).send('error');
  }
}
