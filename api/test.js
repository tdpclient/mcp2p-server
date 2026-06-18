import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    try {
        await kv.set("test_conn", "success", { ex: 10 });
        const val = await kv.get("test_conn");
        if (val === "success") {
            return res.status(200).send("ok");
        }
        return res.status(500).send("error");
    } catch (e) {
        console.error("[test 连接失败]", e);
        return res.status(500).send("error");
    }
}
