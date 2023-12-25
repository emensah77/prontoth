import React, { useRef, useEffect, useCallback } from 'react';

const GameCanvas = React.forwardRef(({ gameState, onTurretSelection }, ref) => {
    const canvasWidth = 800;
    const canvasHeight = 600;
    const { turrets, loons, hitLoons } = gameState;

    // Function to draw loons with customizable color and size
    const drawLoon = (ctx, loon, color = loon.level  >= 2 ? 'black' : 'red', size = 5, alpha = 1) => {
        ctx.beginPath();
        ctx.arc(loon.position_x, loon.position_y, size, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.stroke();
        ctx.globalAlpha = 1;
    };

    // Function to draw turrets
    const drawTurret = (ctx, turret) => {
        ctx.fillStyle = turret.level >= 2 ? 'purple' : 'blue';
        ctx.fillRect(turret.position_x - 10, turret.position_y - 10, 30, 30);
    };

    // Event listener for canvas click
    const handleCanvasClick = (event) => {
        console.log('Canvas clicked');
        const rect = ref.current.getBoundingClientRect();
        const scaleX = ref.current.width / rect.width;
        const scaleY = ref.current.height / rect.height;

        const canvasX = (event.clientX - rect.left) * scaleX;
        const canvasY = (event.clientY - rect.top) * scaleY;

        turrets.forEach(turret => {
            if (
                canvasX >= turret.position_x - 10 && canvasX <= turret.position_x + 50 &&
                canvasY >= turret.position_y - 30 && canvasY <= turret.position_y - 10
            ) {
                onTurretSelection(turret.id);
            }
        });
    };

    // Attach event listener once
    useEffect(() => {
        if (!ref.current) return;
        ref.current.addEventListener('click', handleCanvasClick);
        return () => {
            ref.current.removeEventListener('click', handleCanvasClick);
        };
    }, []); // Empty dependency array to ensure it runs only once

    // Drawing function
    const draw = useCallback(() => {
        if (!ref.current) return;
        const ctx = ref.current.getContext('2d');
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        loons.forEach(loon => drawLoon(ctx, loon));
        turrets.forEach(turret => drawTurret(ctx, turret));
        hitLoons.forEach(loon => drawLoon(ctx, loon, 'yellow', 10, 1));
    }, [hitLoons, loons, ref, turrets]);

    // Redraw canvas whenever gameState changes
    useEffect(() => {
        draw();
    }, [loons, turrets, hitLoons, draw]);

    return <canvas ref={ref} width={canvasWidth} height={canvasHeight} />;
});

export default GameCanvas;
