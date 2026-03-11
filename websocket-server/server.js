const WebSocket = require("ws");
const http = require("http");

const PORT = process.env.PORT || 8080;

const server = http.createServer();
const wss = new WebSocket.Server({ server });

const rooms = {};
const roomState = {};

server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});

wss.on("connection", (socket) => {

  console.log("Client connected");

  socket.on("message", (msg) => {

    try {

      const data = JSON.parse(msg);

      if (data.type === "JOIN_ROOM") {

        const room = data.room;

        if (!rooms[room]) {
          rooms[room] = new Set();
        }

        rooms[room].add(socket);
        socket.room = room;

        console.log(`User joined room ${room}`);

        if (roomState[room]) {
          socket.send(JSON.stringify({
            type: "ROOM_STATE",
            content: roomState[room].content
          }));
        }

      }

      if (data.type === "INIT_FILE") {

        const { room, content } = data;

        if (!roomState[room]) {

          roomState[room] = {
            content: content
          };

          console.log(`Room ${room} initialized`);

        }

      }

      if (data.type === "CODE_CHANGE") {

        const { room, content } = data;

        if (!rooms[room]) return;

        roomState[room].content = content;

        rooms[room].forEach(client => {

          if (client !== socket && client.readyState === WebSocket.OPEN) {

            client.send(JSON.stringify({
              type: "CODE_CHANGE",
              content: content
            }));

          }

        });

      }

    } catch (err) {
      console.error("Message parse error:", err);
    }

  });

  socket.on("close", () => {

    const room = socket.room;

    if (room && rooms[room]) {
      rooms[room].delete(socket);
    }

    console.log("Client disconnected");

  });

});