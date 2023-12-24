import React, { useState, useEffect, useRef, useCallback } from 'react';
import GameCanvas from './GameCanvas';
import TurretDragAndDrop from './TurretDragAndDrop';
import useWebSocket from './useWebsocket';

const loonRadius = 14; // Assuming a radius for the loons
const turretRadius = 35; // Assuming a radius for the turrets


const App = () => {
  const canvasRef = useRef(null);
  const canvasWidth = 800; // Define canvas width
  const turretRange = 100; // Define the range within which turrets can pop 'Loons'

  const [gameState, setGameState] = useState({
    loons: [],
    turrets: [],
    hitLoons: [], // New state to track 'Loons' that are hit
  });

  const { socket, messages } = useWebSocket('ws://localhost:3001', setGameState);





  // Function to handle placement of turrets on the canvas
  const handleTurretPlaced = useCallback((position) => {
    const turretData = { x: position.x, y: position.y };
   // console.log('Sending turret placement to backend:', turretData); // Log for debugging
    socket.send(JSON.stringify({ publish: { addTurret: turretData } }));
}, [socket]);


  // Function to update 'Loons' position
  const updateLoonsPosition = useCallback(() => {
    setGameState(prevState => ({
      ...prevState,
      loons: prevState.loons.map(loon => ({
        ...loon,
        position_x: loon.position_x + 1
      })).filter(loon => loon.position_x < canvasWidth)
    }));
  }, [setGameState, canvasWidth]);

  // Function to pop the nearest 'Loon'
 
  const fireTurretAtNearestLoon = useCallback((turret, loons) => {
    let nearestLoon = null;
    let nearestDistance = turretRange + turretRadius + loonRadius; // Adjusted range
  
    loons.forEach(loon => {
      const distance = Math.hypot(loon.position_x - turret.position_x, loon.position_y - turret.position_y);
     // console.log(`Checking hit: Turret at (${turret.position_x}, ${turret.position_y}) - Loon at (${loon.position_x}, ${loon.position_y}), Distance: ${distance}`);
      if (distance < nearestDistance) {
        nearestLoon = loon;
        nearestDistance = distance;
      }
    });
  
    return nearestLoon;
  }, [turretRange]);
  

  // Function to handle firing of turrets
 // Function to handle firing of turrets
 const fireTurrets = useCallback(() => {
  setGameState(prevState => {
    const newHitLoons = prevState.hitLoons.map(loon => loon.id);
    let hitsDetected = false;

    prevState.turrets.forEach(turret => {
      const nearestLoon = fireTurretAtNearestLoon(turret, prevState.loons);
      if (nearestLoon) {
        const distance = Math.hypot(nearestLoon.position_x - turret.position_x, nearestLoon.position_y - turret.position_y);
        //console.log(`Checking hit: Turret at (${turret.position_x}, ${turret.position_y}) - Loon at (${nearestLoon.position_x}, ${nearestLoon.position_y}), Distance: ${distance}`);
        if (!newHitLoons.includes(nearestLoon.id) && distance < turretRange) {
          //console.log('Loon hit:', nearestLoon);
          newHitLoons.push(nearestLoon.id);
        }
      }
    });

    if (hitsDetected) {
      console.log(`Hits detected. New hit loons: ${JSON.stringify(newHitLoons)}`);
    }

    const remainingLoons = prevState.loons.filter(loon => !newHitLoons.includes(loon.id));
    const hitLoonObjects = prevState.loons.filter(loon => newHitLoons.includes(loon.id));

    return { ...prevState, loons: remainingLoons, hitLoons: hitLoonObjects };
  });
}, [setGameState, fireTurretAtNearestLoon, turretRange]);



 // Add fireTurretAtNearestLoon to dependency array


  // Game loop for updating 'Loons' position
  useEffect(() => {
    const gameLoop = () => {
      updateLoonsPosition();
      requestAnimationFrame(gameLoop);
    };
    gameLoop();
  }, [updateLoonsPosition]);

  // Interval for firing turrets
  useEffect(() => {
    const firingInterval = setInterval(() => {
      fireTurrets();
    }, 1000); // Fire every second (1 Hz)
  
    return () => clearInterval(firingInterval);
  }, [fireTurrets]); // Dependency on the fireTurrets function
  

  // Handle incoming WebSocket messages
  // Handle incoming WebSocket messages
  useEffect(() => {
    //console.log('Received messages:', messages); // Check the structure of messages

    if (Array.isArray(messages)) {

    messages.forEach((message) => {
        //console.log('Received message from backend:', message); // Log for debugging
        if (message.loonState || message.turretState) {
          //console.log('Updating state with turrets:', message.turretState); // Debugging

            setGameState(prevState => ({
                ...prevState,
                loons: message.loonState || [], // Default to an empty array if undefined
                turrets: message.turretState || [], // Default to an empty array if undefined
            }));
        }
    });
  }
}, [messages, setGameState]);




  return (
    <div>
      <h1>Loons Tower Defense</h1>
      <TurretDragAndDrop onTurretPlaced={handleTurretPlaced} canvasRef={canvasRef} />
      <GameCanvas ref={canvasRef} gameState={gameState} />
      {/* Additional game components */}
    </div>
  );
};

export default App;
