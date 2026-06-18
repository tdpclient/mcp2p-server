import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.send('error');

  try {
    const { code, ip, port, host } = req.body;
    if (!code || !ip || typeof port !== "number" || port <= 0) {
      console.log("[submit] 参数非法", req.body);
      return res.send('error');
    }

    // 强制序列化JSON字符串再存入Redis，杜绝 [object Object]
    const storeData = JSON.stringify({
      code,
      ip,
      port,
      host,
      ts: Date.now()
    });
    await kv.setex(code, 600, storeData);
    console.log("[submit] 存储成功 code=" + code);
    return res.send("ok");
  } catch (err) {
    console.error("[submit 异常]", err);
    return res.send('error');
  }
}
