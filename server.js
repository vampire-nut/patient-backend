const http = require("http");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 5000;

const httpServer = http.createServer((req, res) => {
  if (req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Socket.IO Backend Server is running");
  } else {
    res.writeHead(404);
    res.end();
  }
});

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

let patients = [];

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  socket.emit("initialPatients", patients);

  socket.on("submitPatientData", (data) => {
    console.log("Received patient data:", data);
    const newPatient = {
      ...data,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    patients.push(newPatient);
    io.emit("patientUpdate", newPatient);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

httpServer
  .once("error", (err) => {
    console.error("HTTP Server Error:", err);
    process.exit(1);
  })
  .listen(PORT, () => {
    console.log(`> Socket.IO Backend Server Ready on port ${PORT}`);
  });
