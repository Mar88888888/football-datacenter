import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user } = useContext(AuthContext);

  return (
    <nav className="bg-slate-950 px-4 py-4 flex justify-center items-center relative">
      <div className="flex justify-center flex-grow -translate-x-[15%]">
        <Link
          to="/"
          className="relative text-white uppercase px-4 py-2 rounded transition-all duration-300 hover:text-blue-400 group"
        >
          Home
          <span className="absolute bottom-1 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-200 group-hover:w-full"></span>
        </Link>
      </div>

      <div className="absolute right-4 flex items-center">
        {user ? (
          <Link
            to="/dashboard"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-semibold transition-all duration-300"
          >
            {user.name}
          </Link>
        ) : (
          <Link
            to="/login"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-semibold transition-all duration-300"
          >
            Log In
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
