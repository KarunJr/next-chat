import { createServer } from "node:http";
import { Server } from "socket.io";
import next from "next";

const dev = process.env.NODE_ENV !== "production";
const port = process.env.PORT || 3000;

const app = next({ dev });
const handler = app.getRequestHandler();

const userSockets = {};
app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    const userId = socket.handshake.auth.userId;
    userSockets[userId] = socket.id;
    console.log("A user connected", userId, socket.id);
    console.log("UserIds", userSockets);

    //Event to join the room:
    socket.on("conversation:join", (conversationId) => {
      console.log("User join the chat", conversationId, userId);
      socket.join(conversationId);
    });

    socket.on("conversation:leave", (conversationId) => {
      console.log("User leave the chat", conversationId, userId);
      socket.leave(conversationId);
    });

    //Event to send the message and broadcast message to the user who is connected to the socket:
    socket.on("message:send", (message) => {
      console.log("Message from the socket: ", message);
      io.to(message.conversationId).emit("message:receive", message);
    });

    //Event to Show the StartConversation in ChatList
    socket.on("conversation:start", ({ conversation, startedBy }) => {
      console.log("Conversation:", conversation);
      console.log("Conversation started by:", startedBy);

      const userASocketId = userSockets[startedBy];
      if (userASocketId) {
        console.log("User found, message emitted");

        io.to(userASocketId).emit("conversation:started", conversation);
      }
    });

    //Friend-Request Accepted
    socket.on("request:accept", ({ acceptedBy, requestedBy }) => {
      console.log("Friend who accept your friend: ", acceptedBy);
      console.log("Friend who sent you friend request: ", requestedBy);

      const userASocketId = userSockets[requestedBy];
      if (userASocketId) {
        io.to(userASocketId).emit("friend-request-accepted", {
          acceptedBy,
        });
      }
    });

    //Friend-Request Rejected
    socket.on("request:reject", ({ rejectedBy, rejectedTo }) => {
      console.log("Friend request rejected by:", rejectedBy);
      console.log("Friend request rejected of:", rejectedTo);

      const userASocketId = userSockets[rejectedTo];
      if (userASocketId) {
        io.to(userASocketId).emit("friend-request-rejected", {
          rejectedTo,
        });
      }
    });

    //Event to disconnect the user from socket:
    socket.on("disconnect", () => {
      console.log("User disconnected", userId);
      delete userSockets[userId];
    });
  });

  httpServer
    .once("error", (error) => {
      console.error(error);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready to go!!`);
    });
});

// "dev": "next dev",
// "build": "next build",
// "start": "next start",
// "lint": "eslint"
