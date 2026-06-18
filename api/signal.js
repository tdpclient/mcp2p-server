import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // 跨域允许
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 预检请求直接放行
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 只接受POST提交信令数据
  if (req.method !== 'POST') {
    return res.send('error');
  }

  const { code, target, data } = req.body;
  if (!code || !target || !data) {
    return res.send('error');
  }

  // 按房间+身份存储信令，10分钟过期
  const storeKey = `signal:${code}:${target}`;
  await kv.setex(storeKey, 600, JSON.stringify(data));
  return res.send('ok');
}
