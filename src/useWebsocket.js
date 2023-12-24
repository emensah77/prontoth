import { useEffect, useState, useCallback } from 'react';

const useWebSocket = (url, setGameState) => {
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const ws = new WebSocket(url);

        ws.onopen = () => {
            console.log('WebSocket connected');
            ws.send(JSON.stringify({ subscribe: 'loonState' }));
            ws.send(JSON.stringify({ subscribe: 'msg' }));
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            //console.log('WebSocket message received:', data);
            setMessages(prevMessages => [...prevMessages, data]);
            if (data.loonState || data.turretState) {
                setGameState(prevState => ({
                    ...prevState,
                    loons: data.loonState || prevState.loons,
                    turrets: data.turretState || prevState.turrets
                }));
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
            console.log('WebSocket disconnected');
        };

        setSocket(ws);

        return () => ws.close();
    }, [url, setGameState]);

    const sendMessage = useCallback(
        (message) => {
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify(message));
            }
        },
        [socket]
    );

    return { socket, messages, sendMessage };
};

export default useWebSocket;
