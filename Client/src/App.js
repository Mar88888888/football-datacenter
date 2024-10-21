import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './utils/PrivateRoute';
import UnAuthRoute from './utils/UnAuthRoute';
import Navbar from './components/Navbar'; 
import Login from './components/Login';
import SignUp from './components/Signup';
import Dashboard from './components/Dashboard';
import HomePage from './pages/HomePage';
import TeamPage from './pages/TeamPage';
import PlayersPage from './pages/PlayersPage';
import CompetitionPage from './pages/CompetitionPage';
import EmailVerificationRequired from './pages/EmailVerificationRequired';
import SearchResultsPage from './pages/SearchResultsPage';
import PlayerPage from './pages/PlayerPage';

import './styles/global.css';

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Navbar />
                <Routes>
                    <Route path="/login" element={<UnAuthRoute><Login /></UnAuthRoute>} />
                    <Route path="/signup" element={<UnAuthRoute><SignUp /></UnAuthRoute>} />
                    <Route path="/search-results" element={<SearchResultsPage />} />
                    <Route path="/email-verification-required" element={<EmailVerificationRequired />} />
                    <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                    <Route path="/" element={<HomePage />} />
                    <Route path="/competitions/:id" element={<CompetitionPage />} />
                    <Route path="/teams/:id" element={<TeamPage />} />
                    <Route path="/players/:id" element={<PlayerPage />} />
                    <Route path="/players" element={<PlayersPage />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
