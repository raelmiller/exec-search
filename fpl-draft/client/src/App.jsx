import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useSocket } from './hooks/useSocket.js';
import ViewerPage from './pages/ViewerPage.jsx';
import AdminPage from './pages/AdminPage.jsx';

export default function App() {
  const { connected, gameState, players, emit } = useSocket();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<ViewerPage gameState={gameState} connected={connected} />}
        />
        <Route
          path="/admin"
          element={
            <AdminPage
              gameState={gameState}
              players={players}
              connected={connected}
              emit={emit}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
