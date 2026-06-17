import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');

  try {
    const { code } = req.query;
    const roomKey = `room:${code}`;
    const rawData = await kv.get(roomKey);
    if (!rawData) {
      return res.status(404).send('Not Found');
    }
    // 玩家查询计数自增
    await kv.incr("total:playerVisit");
    const room = JSON.parse(rawData);
    return res.status(200).json(room);
  } catch (err) {
    console.error('查询房间失败', err);
    return res.status(500).send('error');
  }
}
