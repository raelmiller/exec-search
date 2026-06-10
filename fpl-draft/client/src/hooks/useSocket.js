import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const SERVER_URL = window.location.origin;

export function useSocket() {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [gameState, setGameState] = useState({
    teams: [],
    currentAuction: null,
    soldPlayers: [],
  });
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const socket = io(SERVER_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('stateUpdate', (state) => {
      setGameState(state);
    });

    socket.on('playersLoaded', (playerList) => {
      setPlayers(playerList);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const emit = (event, data) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    }
  };

  return { connected, gameState, players, emit };
}
