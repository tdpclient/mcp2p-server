const rooms = global.rooms || (global.rooms = new Map());

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { code } = req.query;
  const room = rooms.get(code);
  if (room) {
    res.status(200).json(room);
  } else {
    res.status(404).send('Not Found');
  }
}
