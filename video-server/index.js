// ─── video-server/index.js  (UPDATED) ──────────────────────────────────────────
// Changes: Added "peer-joined" event so doctor gets notified when patient joins
//          Added "leave" event handler
//          Broadened CORS to accept multiple origins

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Signaling Server ✅"));
app.get("/api/test", (req, res) => res.json({ ok: true }));

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",   // Lock down to your domains in production
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("✅ connected:", socket.id);

  // Patient or Doctor joins a room
  socket.on("join", ({ roomId }) => {
    socket.join(roomId);
    const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
    const other = clients.find((id) => id !== socket.id);
    console.log("ROOM", roomId, "clients:", clients, "other:", other);

    if (other) {
      // Both peers are in the room — tell each other
      socket.emit("peer", { peerId: other });
      io.to(other).emit("peer", { peerId: socket.id });

      // Notify the host (first peer = doctor) that a new participant joined
      io.to(other).emit("peer-joined", { peerId: socket.id });
    }
  });

  // Explicit leave event
  socket.on("leave", ({ roomId }) => {
    socket.leave(roomId);
    socket.to(roomId).emit("peer-left");
    console.log(`🚪 ${socket.id} left room ${roomId}`);
  });

  // WebRTC signaling relay
  socket.on("offer", ({ to, offer }) => {
    console.log("offer", socket.id, "->", to);
    io.to(to).emit("offer", { from: socket.id, offer });
  });

  socket.on("answer", ({ to, answer }) => {
    console.log("answer", socket.id, "->", to);
    io.to(to).emit("answer", { from: socket.id, answer });
  });

  socket.on("ice", ({ to, candidate, roomId }) => {
    // Support both direct-to-peer and room-broadcast ICE
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
      }
    }
  });

  socket.on("disconnect", () => console.log("❌ disconnected:", socket.id));
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Signaling server running on port ${PORT}`);
});
