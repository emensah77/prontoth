const express = require('express');
const gameController = require('../controllers/gameController');

const router = express.Router();

router.get('/status', gameController.getGameState);

module.exports = router;
