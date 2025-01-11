const WebSocket = require("ws");
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Store clients and their identifiers
const clients = new Map();

console.log("WebSocket server is running on ws://localhost:8080");

wss.on("connection", (ws) => {
  // Assign a unique ID to the client
  const clientId = `user_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 5)}`;
  clients.set(clientId, ws);

  console.log(`Client connected: ${clientId}`);

  // Send a welcome message and the assigned clientId to the client
  ws.send(
    JSON.stringify({
      type: "welcome",
      clientId,
      message: `Welcome! ${clientId}`,
    })
  );

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === "broadcast") {
        // Broadcast message to all connected clients
        broadcastMessage(clientId, data.message);
      } else if (data.type === "private") {
        // Send a private message to a specific client
        sendPrivateMessage(clientId, data.targetId, data.message);
      } else {
        console.error("Unknown message type:", data.type);
      }
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  });

  ws.on("close", () => {
    console.log(`Client disconnected: ${clientId}`);
    clients.delete(clientId);
  });

  ws.on("error", (error) => {
    console.error(`Error with client ${clientId}:`, error);
  });
});

/**
 * Broadcast a message to all connected clients except the sender.
 * @param {string} senderId - The ID of the sender.
 * @param {string} message - The message to broadcast.
 */
function broadcastMessage(senderId, message) {
  for (const [id, client] of clients) {
    if (id !== senderId && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: "broadcast", senderId, message }));
    } else {
      client.send(
        JSON.stringify({ type: "broadcast", senderId: "me", message })
      );
    }
  }
}

/**
 * Send a private message to a specific client.
 * @param {string} senderId - The ID of the sender.
 * @param {string} targetId - The ID of the target client.
 * @param {string} message - The message to send.
 */
function sendPrivateMessage(senderId, targetId, message) {
  const targetClient = clients.get(targetId);

  if (targetClient && targetClient.readyState === WebSocket.OPEN) {
    targetClient.send(JSON.stringify({ type: "private", senderId, message }));
  } else {
    console.error(
      `Failed to send message. Target client ${targetId} not found or not connected.`
    );
  }
}

server.listen(8080, () => {
  console.log(
    "Server is running on http://localhost:8080 and ws://localhost:8080"
  );
});

app.get("/", (req, res) => {
  res.send("Chat server is up and running!");
});
console.log("WebSocket server is running on ws://localhost:8080");
