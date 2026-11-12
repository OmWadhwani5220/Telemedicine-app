
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();

const PORT = process.env.PORT || 5001;

/* ===============================
   CORS CONFIGURATION
================================ */

const allowedOrigins = [
  "https://telemedicine-app-six-beryl.vercel.app",
  "https://telemed-user-panel.vercel.app",
  "https://telemed-doctor-panel.vercel.app",
  "https://telemed-admin-panel.vercel.app",

  ...(process.env.FRONTEND_URLS || "")
    .split(",")
    .map(url => url.trim())
    .filter(Boolean)
].map(url => url.replace(/\/+$/, ""));

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/+$/, "");

    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    console.error("CORS blocked:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

/* ===============================
   HEALTH CHECK
================================ */

app.get("/", (req, res) => {
  res.send("TeleMed Signaling Server is running");
});

app.get("/api/test", (req, res) => {
  res.json({
    ok: true,
    service: "video-server",
    status: "running"
  });
});

/* ===============================
   SOCKET.IO SERVER
================================ */

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: corsOptions,
  allowEIO3: true,
  transports: ["polling", "websocket"],
  pingTimeout: 60000,
  pingInterval: 25000
});

/* ===============================
   ROOM MANAGEMENT
================================ */

const rooms = new Map();

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  /* JOIN ROOM */

  socket.on("join", ({ roomId } = {}) => {
    if (!roomId) {
      console.log("Join rejected: missing roomId");
      return;
    }

    const normalizedRoomId = roomId.trim().toUpperCase();

    socket.join(normalizedRoomId);

    if (!rooms.has(normalizedRoomId)) {
      rooms.set(normalizedRoomId, new Set());
    }

    rooms.get(normalizedRoomId).add(socket.id);

    const clients = Array.from(
      io.sockets.adapter.rooms.get(normalizedRoomId) || []
    );

    const other = clients.find(id => id !== socket.id);

    console.log(
      `[${normalizedRoomId}] Connected peers: ${clients.length}`
    );

    if (other) {
      socket.emit("peer", { peerId: other });

      io.to(other).emit("peer", {
        peerId: socket.id
      });

      io.to(other).emit("peer-joined", {
        peerId: socket.id
      });
    }
  });

  /* LEAVE ROOM */

  socket.on("leave", ({ roomId } = {}) => {
    if (!roomId) return;

    const normalizedRoomId = roomId.trim().toUpperCase();

    socket.leave(normalizedRoomId);

    rooms.get(normalizedRoomId)?.delete(socket.id);

    if (rooms.get(normalizedRoomId)?.size === 0) {
      rooms.delete(normalizedRoomId);
    }

    socket.to(normalizedRoomId).emit("peer-left");

    console.log(
      `Client ${socket.id} left room ${normalizedRoomId}`
    );
  });

  /* WEBRTC OFFER */

  socket.on("offer", ({ to, offer } = {}) => {
    if (!to || !offer) return;

    console.log("Relaying offer:", socket.id, "->", to);

    io.to(to).emit("offer", {
      from: socket.id,
      offer
    });
  });

  /* WEBRTC ANSWER */

  socket.on("answer", ({ to, answer } = {}) => {
    if (!to || !answer) return;

    console.log("Relaying answer:", socket.id, "->", to);

    io.to(to).emit("answer", {
      from: socket.id,
      answer
    });
  });

  /* ICE CANDIDATES */

  socket.on("ice", ({ to, candidate, roomId } = {}) => {
    if (!candidate) return;

    if (to) {
      io.to(to).emit("ice", {
        from: socket.id,
        candidate
      });
    } else if (roomId) {
      const normalizedRoomId = roomId.trim().toUpperCase();

      socket.to(normalizedRoomId).emit("ice", {
        from: socket.id,
        candidate
      });
    }
  });

  /* DISCONNECTING */

  socket.on("disconnecting", () => {
    for (const roomId of socket.rooms) {
      if (roomId !== socket.id) {
        socket.to(roomId).emit("peer-left");

        rooms.get(roomId)?.delete(socket.id);

        if (rooms.get(roomId)?.size === 0) {
          rooms.delete(roomId);
        }
      }
    }
  });

  socket.on("disconnect", (reason) => {
    console.log(
      "Client disconnected:",
      socket.id,
      reason
    );
  });

  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });
});

/* ===============================
   START SERVER
================================ */

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log("--------------------------------");
  console.log("TeleMed Video Signaling Server");
  console.log("PORT:", PORT);
  console.log("HOST: 0.0.0.0");
  console.log("ALLOWED ORIGINS:", allowedOrigins);
  console.log("STATUS: RUNNING");
  console.log("--------------------------------");
});
