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

      // JOIN ROOM
      if (data.type === "JOIN_ROOM") {

        const room = data.room;

        if (!rooms[room]) {
          rooms[room] = new Set();
        }

        rooms[room].add(socket);
        socket.room = room;
        socket.userName = data.userName;

        console.log(`User ${data.userName} joined room ${room}`);

        if (roomState[room]) {
          socket.send(JSON.stringify({
            type: "ROOM_STATE",
            content: roomState[room].content
          }));
        }
      }

      // INITIAL FILE
      if (data.type === "INIT_FILE") {

        const { room, content } = data;

        if (!roomState[room]) {

          roomState[room] = {
            content: content
          };

          console.log(`Room ${room} initialized`);
        }
      }

      // CODE CHANGE
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

      // CURSOR CHANGE (THIS WAS MISSING)
      if (data.type === "CURSOR_CHANGE") {

        const { room, userName, position } = data;

        if (!rooms[room]) return;

        rooms[room].forEach(client => {

          if (client !== socket && client.readyState === WebSocket.OPEN) {

            client.send(JSON.stringify({
              type: "CURSOR_CHANGE",
              userName: userName,
              position: position
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