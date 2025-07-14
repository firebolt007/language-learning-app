import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

/**
 * A simple navigation bar component.
 */
export const Navbar: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Instead of just navigating, a full page reload ensures all
      // state (like the vocabulary hook) is reset cleanly for the next user.
      // This is a more robust way to handle logout.
      window.location.assign('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-links">
        <Link to="/" className="navbar-link">Home</Link>
        <Link to="/vocabulary" className="navbar-link">Vocabulary</Link>
        <Link to="/settings" className="navbar-link">Settings</Link>
      </div>
      <div>
        {currentUser ? (
          <div className="navbar-user-section">
            <span className="navbar-user-email">{currentUser.email}</span>
            <button onClick={handleLogout} className="navbar-logout-btn">Logout</button>
          </div>
        ) : (
          <div className="navbar-auth-links">
            <Link to="/login" className="navbar-link">Login</Link>
            <Link to="/signup" className="navbar-signup-link">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
};