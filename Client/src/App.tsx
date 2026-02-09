import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PreferencesProvider } from './context/PreferencesContext';
import PrivateRoute from './utils/PrivateRoute';
import UnAuthRoute from './utils/UnAuthRoute';
import Sidebar from './components/layout/Sidebar';
import Login from './components/Login';
import SignUp from './components/Signup';
import Dashboard from './components/Dashboard';
import HomePage from './pages/HomePage';
import MatchPage from './pages/MatchPage';
import TeamPage from './pages/TeamPage';
import TeamsListPage from './pages/TeamsListPage';
import CompetitionPage from './pages/CompetitionPage';
import CompetitionsListPage from './pages/CompetitionsListPage';
import GroupPage from './pages/GroupPage';
import PlayerPage from './pages/PlayerPage';
import SettingsPage from './pages/SettingsPage';
import ErrorPage from './pages/ErrorPage';

const App: React.FC = () => {
    return (
        <AuthProvider>
            <Router>
                <PreferencesProvider>
                    <div className="app-container">
                        <Sidebar />
                        <main className="main-content">
                            <div className="bg-layer" />
                            <Routes>
                                <Route path="/login" element={<UnAuthRoute><Login /></UnAuthRoute>} />
                                <Route path="/signup" element={<UnAuthRoute><SignUp /></UnAuthRoute>} />
                                <Route path="/favorites" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                                <Route path="/" element={<HomePage />} />
                                <Route path="/competitions" element={<CompetitionsListPage />} />
                                <Route path="/teams" element={<TeamsListPage />} />
                                <Route path="/matches/:id" element={<MatchPage />} />
                                <Route path="/competitions/:id" element={<CompetitionPage />} />
                                <Route path="/competitions/:competitionId/groups/:groupName" element={<GroupPage />} />
                                <Route path="/teams/:id" element={<TeamPage />} />
                                <Route path="/players/:id" element={<PlayerPage />} />
                                <Route path="/settings" element={<SettingsPage />} />
                                <Route path="*" element={<ErrorPage notFound />} />
                            </Routes>
                        </main>
                    </div>

                    <style>{`
                        .app-container {
                            display: flex;
                            min-height: 100vh;
                        }

                        .main-content {
                            flex: 1;
                            margin-left: var(--sidebar-width);
                            min-height: 100vh;
                        }

                        .bg-layer {
                            position: fixed;
                            top: 0;
                            left: var(--sidebar-width);
                            right: 0;
                            bottom: 0;
                            z-index: -1;
                            background:
                                radial-gradient(ellipse at 20% 10%, rgba(6, 182, 212, 0.06) 0%, transparent 50%),
                                radial-gradient(ellipse at 80% 90%, rgba(8, 145, 178, 0.04) 0%, transparent 50%),
                                var(--bg-primary);
                        }

                        @media (max-width: 768px) {
                            .main-content {
                                margin-left: 0;
                            }

                            .bg-layer {
                                left: 0;
                            }
                        }
                    `}</style>
                </PreferencesProvider>
            </Router>
        </AuthProvider>
    );
};

export default App;
