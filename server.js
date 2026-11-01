// Meme Dangal game server: serves index.html and relays online matches between two players.
const http = require("http");
const fs = require("fs");
const path = require("path");
const { WebSocketServer } = require("ws");

const PORT = process.env.PORT || 8080;
const PAGE = path.join(__dirname, "index.html");
const LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const rooms = new Map(); // code -> { host, guest }

const server = http.createServer((req, res) => {
  const url = req.url.split("?")[0];
  if (url === "/health") { res.end("ok"); return; }
  if (url === "/" || url === "/index.html") {
    fs.readFile(PAGE, (err, data) => {
      if (err) { res.writeHead(500); res.end("index.html missing"); return; }
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" });
      res.end(data);
    });
    return;
  }
  res.writeHead(404); res.end("Not found");
});

const wss = new WebSocketServer({ server, maxPayload: 32 * 1024 });

function newCode() {
  for (let i = 0; i < 100; i++) {
    let c = "";
    for (let j = 0; j < 4; j++) c += LETTERS[Math.floor(Math.random() * LETTERS.length)];
    if (!rooms.has(c)) return c;
  }
  return null;
}

function send(ws, obj) {
  if (ws && ws.readyState === 1) ws.send(JSON.stringify(obj));
}

function leave(ws) {
  const room = ws.room && rooms.get(ws.room);
  ws.room = null;
  if (!room) return;
  const other = room.host === ws ? room.guest : room.host;
  rooms.delete(room.code);
  if (other) { other.room = null; send(other, { t: "left" }); }
}

wss.on("connection", (ws) => {
  ws.alive = true;
  ws.on("pong", () => { ws.alive = true; });

  ws.on("message", (raw) => {
    let m;
    try { m = JSON.parse(raw); } catch { return; }

    if (m.t === "host") {
      leave(ws);
      const code = newCode();
      if (!code) return send(ws, { t: "error", msg: "Server is busy, try again." });
      rooms.set(code, { code, host: ws, guest: null });
      ws.room = code;
      send(ws, { t: "hosted", code });
    } else if (m.t === "join") {
      const code = String(m.code || "").toUpperCase().slice(0, 4);
      const room = rooms.get(code);
      if (!room) return send(ws, { t: "error", msg: "No room with that code. Check it and try again." });
      if (room.guest || room.host === ws) return send(ws, { t: "error", msg: "That room is already full." });
      leave(ws);
      room.guest = ws;
      ws.room = code;
      send(ws, { t: "joined", code });
      send(room.host, { t: "peer" });
    } else if (m.t === "msg") {
      const room = ws.room && rooms.get(ws.room);
      if (!room) return;
      send(room.host === ws ? room.guest : room.host, { t: "msg", d: m.d });
    }
  });

  ws.on("close", () => leave(ws));
});

// Drop dead connections so rooms don't hang around.
setInterval(() => {
  for (const ws of wss.clients) {
    if (!ws.alive) { ws.terminate(); continue; }
    ws.alive = false;
    ws.ping();
  }
}, 25000);

server.listen(PORT, () => console.log(`Meme Dangal server running on port ${PORT}`));
