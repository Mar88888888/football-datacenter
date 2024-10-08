import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './utils/PrivateRoute';
import Navbar from './components/Navbar'; 
import Login from './components/Login';
import SignUp from './components/Signup';
import Dashboard from './components/Dashboard';
import HomePage from './pages/HomePage';
import CompetitionsPage from './pages/CompetitionsPage';
import TeamsPage from './pages/TeamsPage';
import TeamPage from './pages/TeamPage';
import PlayersPage from './pages/PlayersPage';
import CompetitionPage from './pages/CompetitionPage';
import EmailVerificationRequired from './components/EmailVerificationRequired';
import SearchResultsPage from './pages/SearchResultsPage';

import './styles/global.css';

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Navbar />
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/search-results" element={<SearchResultsPage />} />
                    <Route path="/email-verification-required" element={<EmailVerificationRequired />} />
                    <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                    <Route path="/" element={<HomePage />} />
                    <Route path="/competitions" element={<CompetitionsPage />} />
                    <Route path="/competitions/:id" element={<CompetitionPage />} />
                    <Route path="/teams" element={<TeamsPage />} />
                    <Route path="/teams/:id" element={<TeamPage />} />
                    <Route path="/players" element={<PlayersPage />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
