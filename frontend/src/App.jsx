import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { PlayerProvider } from './context/PlayerContext'
import Header from './components/Header'
import Home from './pages/Home'
import Callback from './pages/Callback'

function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-spotify-dark to-spotify-black">
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/callback" element={<Callback />} />
            </Routes>
          </div>
        </Router>
      </PlayerProvider>
    </AuthProvider>
  )
}

export default App
