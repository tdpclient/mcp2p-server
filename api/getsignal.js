import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.json(null);
  }

  const { code, target } = req.query;
  if (!code || !target) {
    return res.json(null);
  }

  const storeKey = `signal:${code}:${target}`;
  const rawData = await kv.get(storeKey);
  if (!rawData) {
    return res.json(null);
  }

  // 读取后删除，避免重复消费
  await kv.del(storeKey);

  try {
    const parseData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
    return res.json(parseData);
  } catch (err) {
    return res.json(null);
  }
}
