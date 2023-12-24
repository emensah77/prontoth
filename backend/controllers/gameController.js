const gameLogic = require('../game/gameLogic');

exports.getGameState = (req, res) => {
    const status = gameLogic.getGameState();
    res.json(status);
};
