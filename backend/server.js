const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const gameLogic = require('./game/gameLogic'); // Import game logic module

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');

  // Initialize game session for the connected client
  gameLogic.initializeSession(ws);

  ws.on('message', (message) => {
    

    // Parse message and handle different types of requests
    const parsedMessage = JSON.parse(message);
    console.log('Received message on server:', parsedMessage);
    gameLogic.handleMessage(ws, parsedMessage);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    // Handle client disconnection (cleanup, update game state, etc.)
    gameLogic.handleDisconnect(ws);
  });
});

app.get('/', (req, res) => {
  res.send('WebSocket server is running');
});

const port = process.env.PORT || 3001;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
