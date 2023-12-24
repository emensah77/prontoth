import React, { useState, useCallback, useRef } from 'react';

const TurretDragAndDrop = ({ onTurretPlaced, canvasRef }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [turretPosition, setTurretPosition] = useState({ x: 0, y: 0 });

    const getRelativePosition = useCallback((event) => {
        const boundingRect = canvasRef.current.getBoundingClientRect();
        return {
            x: event.clientX - boundingRect.left,
            y: event.clientY - boundingRect.top
        };
    }, [canvasRef]);
    

    const handleMouseDown = useCallback((event) => {
        setIsDragging(true);
        setTurretPosition(getRelativePosition(event));
    }, [getRelativePosition]);

    const handleMouseMove = useCallback((event) => {
        if (isDragging) {
            setTurretPosition(getRelativePosition(event));
        }
    }, [isDragging, getRelativePosition]);

    const handleMouseUp = useCallback(() => {
        if (isDragging) {
            setIsDragging(false);
            onTurretPlaced(turretPosition);
        }
    }, [isDragging, turretPosition, onTurretPlaced]);

    return (
        <div
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{ width: '100%', height: '100%', position: 'absolute', left: 0, top: 0 }}
        >
            {isDragging && (
                <div
                    style={{
                        position: 'absolute',
                        left: turretPosition.x - 10, // Centering the ghost turret
                        top: turretPosition.y - 10,  // Centering the ghost turret
                        width: 20,
                        height: 20,
                        backgroundColor: 'rgba(0, 0, 255, 0.5)', // Semi-transparent blue
                        border: '2px dashed white', // Added border for visibility
                    }}
                />
            )}
        </div>
    );
};

export default TurretDragAndDrop;
