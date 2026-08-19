// video-server/index.js
// ✅ FIX: Runs on port 5001 (backend is on 5000 — they CANNOT share a port)

import express from "express";
import http    from "http";
import { Server } from "socket.io";
import cors   from "cors";

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

app.get("/",         (req, res) => res.send("Signaling Server ✅"));
app.get("/api/test", (req, res) => res.json({ ok: true }));

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
  allowEIO3: true,
  transports: ["polling", "websocket"],
});

// Track rooms for ICE buffering awareness
const rooms = new Map(); // roomId → Set of socket ids

io.on("connection", (socket) => {
  console.log("✅ connected:", socket.id);

  socket.on("join", ({ roomId }) => {
    socket.join(roomId);
    if (!rooms.has(roomId)) rooms.set(roomId, new Set());
    rooms.get(roomId).add(socket.id);

    const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
    const other   = clients.find((id) => id !== socket.id);
    console.log(`[${roomId}] peers: ${clients.length}`);

    if (other) {
      // Both peers present — tell each other their peer ID
      socket.emit("peer", { peerId: other });
      io.to(other).emit("peer", { peerId: socket.id });
      io.to(other).emit("peer-joined", { peerId: socket.id });
    }
  });

  // Explicit leave
  socket.on("leave", ({ roomId }) => {
    socket.leave(roomId);
    rooms.get(roomId)?.delete(socket.id);
    socket.to(roomId).emit("peer-left");
    console.log(`🚪 ${socket.id} left ${roomId}`);
  });

  // WebRTC relay — support both direct (to) and room-broadcast (roomId)
  socket.on("offer", ({ to, offer }) => {
    io.to(to).emit("offer", { from: socket.id, offer });
  });

  socket.on("answer", ({ to, answer }) => {
    io.to(to).emit("answer", { from: socket.id, answer });
  });

  socket.on("ice", ({ to, candidate, roomId }) => {
    if (to) {
      io.to(to).emit("ice", { from: socket.id, candidate });
    } else if (roomId) {
      socket.to(roomId).emit("ice", { from: socket.id, candidate });
    }
  });

  socket.on("disconnecting", () => {
    for (const roomId of socket.rooms) {
      if (roomId !== socket.id) {
        socket.to(roomId).emit("peer-left");
        rooms.get(roomId)?.delete(socket.id);
      }
    }
  });

  socket.on("disconnect", () => console.log("❌ disconnected:", socket.id));
});

// ✅ FIX: port 5001, not 5000 (which is taken by the backend)
const PORT = process.env.PORT || 5001;
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Signaling server → http://localhost:${PORT}`);
});