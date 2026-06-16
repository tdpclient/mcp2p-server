const rooms = global.rooms || (global.rooms = new Map());

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { code, ip, port, host } = req.body;
  rooms.set(code, { ip, port, host });
  res.status(200).send('OK');
}
