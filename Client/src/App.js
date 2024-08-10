import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import PrivateRoute from './utils/PrivateRoute';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import HomePage from './pages/HomePage';
import CompetitionsPage from './pages/CompetitionsPage';
import TeamsPage from './pages/TeamsPage';
import PlayersPage from './pages/PlayersPage';

const Navbar = () => {
    const { user } = useContext(AuthContext);

    return (
        <nav className="navbar">
            <div className="navbar-links">
                <Link to="/">Home</Link>
                <Link to="/competitions">Competitions</Link>
                <Link to="/teams">Teams</Link>
                <Link to="/players">Players</Link>
            </div>
            <div className="navbar-user">
                {user ? (
                     <Link to="/dashboard"><span>{user.name}</span></Link>
                ) : (
                    <Link to="/login" className="button-primary">Log In</Link>
                )}
            </div>
        </nav>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Navbar />

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
