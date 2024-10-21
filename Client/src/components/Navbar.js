import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import '../styles/Navbar.css'

const Navbar = () => {
    const { user } = useContext(AuthContext);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm) return;

        try {

            const [teamsResponse, competitionsResponse] = await Promise.all([
                axios.get(`${process.env.REACT_APP_API_URL}/teams/search/${encodeURIComponent(searchTerm)}`),
                axios.get(`${process.env.REACT_APP_API_URL}/competition/search/${encodeURIComponent(searchTerm)}`)
            ]);

            const teams = teamsResponse.data;
            const competitions = competitionsResponse.data;

            console.log(teams, competitions);
            navigate('/search-results', { state: { results: [...teams, ...competitions] } });
        } catch (error) {
            console.error('Error during search:', error);
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-search">
                <form onSubmit={handleSearch}>
                    <input 
                        type="text" 
                        className="search-input" 
                        placeholder="Search..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                    />
                    <button type="submit" className="search-button">
                        Search
                    </button>
                </form>
            </div>

            <div className="navbar-links">
                <Link to="/">Home</Link>
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

export default Navbar;
