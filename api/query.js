import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.send('error');

  const { code } = req.query;
  if (!code?.trim()) return res.send('error');

  try {
    const raw = await kv.get(code);
    console.log('[QUERY DEBUG] 原始存储内容 raw=', raw);
    if (!raw) {
      console.log('[QUERY DEBUG] key不存在');
      return res.send('error');
    }

    let data;
    // 修复：如果已经是对象，直接赋值；只有字符串才parse
    if (typeof raw === "string") {
      try {
        data = JSON.parse(raw);
        console.log('[QUERY DEBUG] 字符串解析完成 data=', data);
      } catch (parseErr) {
        console.error('[QUERY 解析失败] code=' + code, parseErr);
        await kv.del(code);
        return res.send('error');
      }
    } else {
      data = raw;
      console.log('[QUERY DEBUG] 已为对象，无需解析 data=', data);
    }

    if (!data.ip || typeof data.port !== "number") {
      console.log('[QUERY DEBUG] 数据残缺，自动删除', data);
      await kv.del(code);
      return res.send('error');
    }
    return res.json(data);
  } catch (e) {
    console.error('[QUERY 全局异常]', e);
    return res.send('error');
  }
}
