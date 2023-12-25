const WebSocket = require('ws');
const Loon = require('../models/Loon');
const Turret = require('../models/Turret');

let clients = {};

// Utility function to generate unique IDs
const generateUniqueId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Initialize a game session for a new client
exports.initializeSession = (ws) => {
    const clientId = generateUniqueId();
    console.log('New game session initialized for client:', clientId);
    clients[clientId] = {
        ws: ws,
        gameState: {
            loons: [],
            turrets: []
        }
    };
    sendGameState(clientId);
};

function sendGameState(clientId) {
    const client = clients[clientId];
    if (client && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify({
            loonState: client.gameState.loons,
            turretState: client.gameState.turrets
        }));
    }
}

// Handle incoming WebSocket messages
exports.handleMessage = (ws, message) => {
    console.log('Received WebSocket message:', message);

    const clientId = Object.keys(clients).find(id => clients[id].ws === ws);
    if (!clientId) return;

    const client = clients[clientId];

    if (message.publish) {
        if (message.publish.addTurret) {
            addTurret(client.gameState, message.publish.addTurret);
        }
        if (message.publish.upgradeTurret) {
            upgradeTurret(client.gameState, message.publish.upgradeTurret.turretId);
        }
        if (message.publish.popLoon) {
            popLoon(client.gameState, message.publish.popLoon.turretId);
        }
    }

    sendGameState(clientId);
};

// Handle client disconnection
exports.handleDisconnect = (ws) => {
    const clientId = Object.keys(clients).find(id => clients[id].ws === ws);
    if (clientId) {
        console.log('Client disconnected:', clientId);
        delete clients[clientId];
    }
};

function addTurret(gameState, turretData) {
    const id = generateUniqueId();
    const newTurret = new Turret(id, turretData.x, turretData.y);
    gameState.turrets.push(newTurret);
}

function upgradeTurret(gameState, turretId) {
    const turret = gameState.turrets.find(t => t.id === turretId);
    if (turret) {
        turret.upgrade();
    }
}

function popLoon(gameState, turretId) {
    const turret = gameState.turrets.find(t => t.id === turretId);
    if (turret) {
        turret.popLoon();
    }
}

// Spawn a new Loon
function spawnLoon(gameState) {
    const id = generateUniqueId();
    const position_x = 0;
    const position_y = Math.random() * 600;
    const level = Math.random() < 0.1 ? 2 : 1;
    const loon = new Loon(id, position_x, position_y, level);
    gameState.loons.push(loon);
}

// Regularly update the game state and spawn new Loons
setInterval(() => {
    Object.keys(clients).forEach(clientId => {
        const client = clients[clientId];
        if (client) {
            const gameState = client.gameState;
            gameState.loons.forEach(loon => loon.position_x += 2);
            gameState.loons = gameState.loons.filter(loon => loon.position_x < 800);
            spawnLoon(gameState);
            sendGameState(clientId);
        }
    });
}, 1000);

// Export the getGameState function
exports.getGameState = (clientId) => {
    return clients[clientId] ? clients[clientId].gameState : null;
};
