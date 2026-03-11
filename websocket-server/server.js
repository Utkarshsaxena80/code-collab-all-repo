const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 });

const rooms = {};
const roomState = {};

console.log("WebSocket server running on port 8080");

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

        console.log(`User joined room ${room}`);

        // send existing code if room already exists
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
          roomState[room] = { content: content };
          console.log(`Room ${room} initialized`);
        }
      }

      // CODE CHANGE (unchanged - full content sync)
      if (data.type === "CODE_CHANGE") {
        const { room, content } = data;

        if (!rooms[room]) return;

        // update latest room code
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

      // ✅ NEW: CURSOR CHANGE - broadcast to everyone else in the room
      // This is what makes the colorful cursor + name tooltip appear for other users
      if (data.type === "CURSOR_CHANGE") {
        const { room, userName, position } = data;

        if (!room || !userName || !position || !rooms[room]) return;

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
// const WebSocket = require("ws");

// const wss = new WebSocket.Server({ port: 8080 });

// const rooms = {};
// const roomState = {};

// console.log("WebSocket server running on port 8080");

// wss.on("connection", (socket) => {

//   console.log("Client connected");

//   socket.on("message", (msg) => {

//     try {
//       const data = JSON.parse(msg);
//       // JOIN ROOM
//       if (data.type === "JOIN_ROOM") {
//         const room = data.room;

//         if (!rooms[room]) {
//           rooms[room] = new Set();
//         }

//         rooms[room].add(socket);
//         socket.room = room;

//         console.log(`User joined room ${room}`);

//         // send existing code if room already exists
//         if (roomState[room]) {
//           socket.send(JSON.stringify({
//             type: "ROOM_STATE",
//             content: roomState[room].content
//           }));
//         }

//       }

//       // INITIAL FILE
//       if (data.type === "INIT_FILE") {

//         const { room, content } = data;

//         if (!roomState[room]) {

//           roomState[room] = {
//             content: content
//           };

//           console.log(`Room ${room} initialized`);

//         }

//       }

//       // CODE CHANGE
//       if (data.type === "CODE_CHANGE") {

//         const { room, content } = data;

//         if (!rooms[room]) return;

//         // update latest room code
//         roomState[room].content = content;

//         rooms[room].forEach(client => {

//           if (client !== socket && client.readyState === WebSocket.OPEN) {
//             client.send(JSON.stringify({
//               type: "CODE_CHANGE",
//               content: content
//             }));
//           }

//         });

//       }

//     } catch (err) {
//       console.error("Message parse error:", err);
//     }

//   });

//   socket.on("close", () => {

//     const room = socket.room;

//     if (room && rooms[room]) {
//       rooms[room].delete(socket);
//     }

//     console.log("Client disconnected");

//   });

// });
// // const WebSocket = require("ws");

// // const wss = new WebSocket.Server({ port: 8080 });

// // const rooms = {};
// // const roomState = {};

// // console.log("WebSocket server running on port 8080");

// // wss.on("connection", (socket) => {

// //   console.log("Client connected");

// //   socket.on("message", (msg) => {

// //     try {

// //       const data = JSON.parse(msg);

// //       // JOIN ROOM
// //       if (data.type === "JOIN_ROOM") {

// //         const room = data.room;

// //         if (!rooms[room]) {
// //           rooms[room] = new Set();
// //         }

// //         rooms[room].add(socket);
// //         socket.room = room;

// //         console.log(`User joined room ${room}`);

// //         // Send existing room state to new user
// //         if (roomState[room]) {

// //           socket.send(JSON.stringify({
// //             type: "ROOM_STATE",
// //             language: roomState[room].language,
// //             content: roomState[room].content
// //           }));

// //         }

// //       }

// //       // INITIAL FILE CREATION
// //     //   if (data.type === "INIT_FILE") {

// //     //     const { room, language, content } = data;

// //     //     roomState[room] = {
// //     //       language,
// //     //       content
// //     //     };

// //     //     console.log(`Room ${room} initialized with ${language}`);

// //     //   }
// //     if (data.type === "INIT_FILE") {

// //   const { room, language, content } = data;

// //   // Only initialize if room doesn't exist
// //   if (!roomState[room]) {

// //     roomState[room] = {
// //       language,
// //       content
// //     };

// //     console.log(`Room ${room} initialized with ${language}`);

// //   }

// // }

// //       // CODE CHANGE
// //       if (data.type === "CODE_CHANGE") {

// //         const { room, fileId, content } = data;

// //         if (!roomState[room]) {
// //           roomState[room] = {};
// //         }

// //         roomState[room].content = content;

// //         if (!rooms[room]) return;

// //         rooms[room].forEach(client => {

// //           if (client !== socket && client.readyState === WebSocket.OPEN) {
// //             client.send(JSON.stringify(data));
// //           }

// //         });

// //       }

// //     } catch (err) {
// //       console.error("Message parse error:", err);
// //     }

// //   });

// //   socket.on("close", () => {

// //     const room = socket.room;

// //     if (room && rooms[room]) {
// //       rooms[room].delete(socket);
// //     }

// //     console.log("Client disconnected");
// //   });
// // });
// // // const WebSocket = require("ws");

// // // const wss = new WebSocket.Server({ port: 8080 });

// // // const rooms = {};

// // // wss.on("connection", (socket) => {

// // //     console.log("New client connected");

// // //     socket.on("message", (msg) => {

// // //         const data = JSON.parse(msg);

// // //         // user joins room
// // //         if (data.type === "JOIN_ROOM") {

// // //             const room = data.room;

// // //             if (!rooms[room]) {
// // //                 rooms[room] = new Set();
// // //             }

// // //             rooms[room].add(socket);
// // //             socket.room = room;

// // //             console.log(`User joined room ${room}`);
// // //         }

// // //         // broadcast code changes
// // //         if (data.type === "CODE_CHANGE") {

// // //             const room = socket.room;

// // //             if (!room || !rooms[room]) return;

// // //             rooms[room].forEach(client => {

// // //                 if (client !== socket && client.readyState === WebSocket.OPEN) {
// // //                     client.send(JSON.stringify(data));
// // //                 }

// // //             });
// // //         }

// // //     });

// // //     socket.on("close", () => {

// // //         const room = socket.room;

// // //         if (room && rooms[room]) {
// // //             rooms[room].delete(socket);
// // //         }

// // //         console.log("Client disconnected");

// // //     });

// // // });

// // // console.log("WebSocket server running on port 8080");