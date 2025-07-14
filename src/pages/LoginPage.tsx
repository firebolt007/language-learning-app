import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/'); // Redirect to home on successful login
    } catch (err) {
      setError('Failed to log in. Please check your email and password.');
      console.error(err);
    }
  };

  return (
    <div className="auth-container">
      <h2>Log In</h2>
      {error && <p className="auth-error">{error}</p>}
      <form onSubmit={handleSubmit} className="auth-form">
        <input 
          type="email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          placeholder="Email" 
          required 
          className="auth-input" 
        />
        <input 
          type="password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          placeholder="Password" 
          required 
          className="auth-input" 
        />
        <button type="submit" className="auth-submit-btn">Log In</button>
      </form>
      <div className="auth-link-container">
        Need an account? <Link to="/signup">Sign Up</Link>
      </div>
    </div>
  );
};