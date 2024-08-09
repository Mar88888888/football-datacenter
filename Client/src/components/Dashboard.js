import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { setAuthToken } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        setAuthToken(null);
        navigate('/login');
    };

    return (
        <div>
            <h2>Dashboard</h2>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default Dashboard;
