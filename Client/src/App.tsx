import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FavouritesProvider } from './context/FavouritesContext';
import PrivateRoute from './utils/PrivateRoute';
import UnAuthRoute from './utils/UnAuthRoute';
import Navbar from './components/Navbar';
import Login from './components/Login';
import SignUp from './components/Signup';
import Dashboard from './components/Dashboard';
import HomePage from './pages/HomePage';
import TeamPage from './pages/TeamPage';
import CompetitionPage from './pages/CompetitionPage';
import GroupPage from './pages/GroupPage';
import PlayerPage from './pages/PlayerPage';

const App: React.FC = () => {
    return (
        <AuthProvider>
            <Router>
                <FavouritesProvider>
                    <div className="min-h-screen bg-slate-900">
                        <Navbar />
                        <Routes>
                            <Route path="/login" element={<UnAuthRoute><Login /></UnAuthRoute>} />
                            <Route path="/signup" element={<UnAuthRoute><SignUp /></UnAuthRoute>} />
                            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                            <Route path="/" element={<HomePage />} />
                            <Route path="/competitions/:id" element={<CompetitionPage />} />
                            <Route path="/competitions/:competitionId/groups/:groupName" element={<GroupPage />} />
                            <Route path="/teams/:id" element={<TeamPage />} />
                            <Route path="/players/:id" element={<PlayerPage />} />
                        </Routes>
                    </div>
                </FavouritesProvider>
            </Router>
        </AuthProvider>
    );
};

export default App;
