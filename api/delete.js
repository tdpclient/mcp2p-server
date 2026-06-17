import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'DELETE') return res.status(405).send('Method Not Allowed');

  try {
    const { code } = req.body;
    const roomKey = `room:${code}`;
    await kv.del(roomKey);
    await kv.srem("online:hosts", code);
    await kv.del(`active:${code}`);
    return res.status(200).send('ok');
  } catch (err) {
    console.error('删除房间失败', err);
    return res.status(500).send('error');
  }
}
