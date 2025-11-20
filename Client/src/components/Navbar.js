import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Navbar.css';

const Navbar = () => {
  const { user } = useContext(AuthContext);

  return (
    <nav className="navbar">
      <div className="navbar-links">
        <Link to="/">Home</Link>
      </div>

      <div className="navbar-user">
        {user ? (
          <Link to="/dashboard">
            <span>{user.name}</span>
          </Link>
        ) : (
          <Link to="/login" className="button-primary">
            Log In
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
