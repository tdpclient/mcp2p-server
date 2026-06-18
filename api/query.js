import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).send('error');
    }

    try {
        const { code } = req.query;
        // 拦截空code（你浏览器访问?code=空白报错的根源）
        if (!code || code.trim() === "") {
            return res.status(400).send("error");
        }

        const raw = await kv.get(code);
        // 无此房间
        if (!raw) {
            return res.status(404).send("error");
        }

        // 容错解析，解析失败自动删除脏数据
        let room;
        try {
            room = JSON.parse(raw);
        } catch (parseErr) {
            console.error("[query 解析失败] code=" + code, parseErr);
            await kv.del(code);
            return res.status(404).send("error");
        }

        // 校验数据完整性，残缺数据直接作废
        if (!room.ip || !room.port) {
            await kv.del(code);
            return res.status(404).send("error");
        }

        // 正常返回json，Java Gson可直接解析
        return res.status(200).json(room);
    } catch (err) {
        console.error("[query 全局异常]", err);
        return res.status(500).send("error");
    }
}
