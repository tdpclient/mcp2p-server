import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    // 跨域全部放行，适配Java HttpClient
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 浏览器预检请求直接放行
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 提交仅允许POST
    if (req.method !== 'POST') {
        return res.status(405).send('error');
    }

    try {
        const body = req.body;
        const { code, ip, port, host } = body;

        // 校验必填字段
        if (!code || !ip || typeof port !== "number" || port <= 0) {
            console.log("[submit] 参数非法", body);
            return res.status(400).send('error');
        }

        // 强制序列化为字符串存入KV，杜绝 [object Object] 解析报错
        const storeData = JSON.stringify({
            code,
            ip,
            port,
            host,
            timestamp: Date.now()
        });
        // 10分钟自动过期
        await kv.set(code, storeData, { ex: 600 });

        console.log("[submit] 存储成功 code=" + code);
        return res.status(200).send("ok");
    } catch (err) {
        console.error("[submit 异常]", err);
        return res.status(500).send("error");
    }
}
