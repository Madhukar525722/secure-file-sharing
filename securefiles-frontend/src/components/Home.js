import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home">
      <h1>Secure File Sharing application</h1>
      <button onClick={() => navigate('/login')}>Login</button>
      <button onClick={() => navigate('/register')}>Register</button>
    </div>
  );
};

export default Home;
