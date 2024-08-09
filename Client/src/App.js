import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './utils/PrivateRoute';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import HomePage from './pages/HomePage';
import CompetitionsPage from './pages/CompetitionsPage';
import TeamsPage from './pages/TeamsPage';
import PlayersPage from './pages/PlayersPage';

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/dashboard" element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    } />
                    <Route path="/" element={<HomePage />} />
                    <Route path="/competitions" element={<CompetitionsPage />} />
                    <Route path="/teams" element={<TeamsPage />} />
                    <Route path="/players" element={<PlayersPage />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
