// gameLogic.js
const WebSocket = require('ws'); // Import the WebSocket module


// Import the Loon and Turret classes
const Loon = require('../models/Loon');
const Turret = require('../models/Turret');

let clients = [];


let gameState = {
    loons: [],
    turrets: []
};

// Utility function to generate unique IDs
const generateUniqueId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Initialize a game session for a new client
exports.initializeSession = (ws) => {
    console.log('New game session initialized');
    clients.push(ws);
    sendGameState(ws); // Send the current state to the new client
};

function sendGameState(ws) {
    if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({ loonState: gameState.loons }));
    }
}

function broadcastGameState() {
    console.log('Broadcasting game state to all clients');
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                loonState: gameState.loons,
                turretState: gameState.turrets // Make sure to include turrets in the broadcast
            }));
        }
    });
}

// Handle incoming WebSocket messages
exports.handleMessage = (ws, message) => {
    console.log('Received WebSocket message:', message);

    if (message.subscribe === 'loonState') {
        sendGameState(ws);
    } else if (message.publish) {
        if (message.publish.addTurret) {
            addTurret(message.publish.addTurret);
            broadcastGameState();
        }
    }
};



// Handle client disconnection
exports.handleDisconnect = (ws) => {
    console.log('Client disconnected');
    clients = clients.filter(client => client !== ws);
};


// Spawn a new Loon
function spawnLoon() {
    const id = generateUniqueId();
    const position_x = 0; // Define the starting x position
    const position_y = Math.random() * 600; // Random y position within canvas height
    const level = Math.random() < 0.1 ? 2 : 1; // 10% chance for level 2
    const loon = new Loon(id, position_x, position_y, level);
    gameState.loons.push(loon);
}

// Update the game state
function updateGameState() {
    // Move each Loon
    gameState.loons.forEach(loon => {
        loon.position_x += 2; // Move to the right by 2 units
    });

    // Filter out Loons that have moved off the canvas
    gameState.loons = gameState.loons.filter(loon => loon.position_x < 800); // Assuming canvas width is 800
}

// Regularly update the game state and spawn new Loons
setInterval(() => {
    updateGameState();
    spawnLoon();
    broadcastGameState(); // Broadcast the updated game state
}, 1000);

function addTurret(turretData) {
    console.log('Adding turret with data:', turretData); // Log for debugging
    const id = generateUniqueId();
    const newTurret = new Turret(id, turretData.x, turretData.y);
    gameState.turrets.push(newTurret);
}




// Export the getGameState function
exports.getGameState = () => {
    return gameState;
};
