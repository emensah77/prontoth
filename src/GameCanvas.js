import React, { useRef, useEffect } from 'react';

const GameCanvas = React.forwardRef(({ gameState }, ref) => {
    const canvasWidth = 800;
    const canvasHeight = 600;
    const { turrets, loons, hitLoons } = gameState;

    

    useEffect(() => {
        if (!ref.current) return;
        const ctx = ref.current.getContext('2d');

        // Function to draw loons with customizable color and size
        const drawLoon = (loon, color = 'red', size = 5, alpha = 1) => {
            ctx.beginPath();
            ctx.arc(loon.position_x, loon.position_y, size, 0, 2 * Math.PI);
            ctx.fillStyle = color;
            ctx.globalAlpha = alpha;
            ctx.fill();
            ctx.stroke();
            ctx.globalAlpha = 1;
          };

        // Function to draw turrets
        const drawTurret = (turret) => {
            ctx.fillStyle = 'blue';
            ctx.fillRect(turret.position_x - 10, turret.position_y - 10, 30, 30);
        };

        // Clear the canvas before redrawing
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // Draw each loon and turret
        loons.forEach(loon => drawLoon(loon));
        turrets.forEach(drawTurret);

        // Draw hit loons with a distinct appearance
        hitLoons.forEach(loon => drawLoon(loon, 'yellow', 10, .6)); // Example: Yellow color, larger size

    }, [loons, turrets, hitLoons, ref]);

    return <canvas ref={ref} width={canvasWidth} height={canvasHeight} />;
});

export default GameCanvas;
