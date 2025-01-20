import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../actions/auth';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login(username, password));
    if (result.payload && result.payload.mfa_required) {
      navigate('/mfa'); // Redirect to MFA page if MFA is required
    } else if (result.payload) {
      navigate('/fileupload'); // Redirect upon successful login
    }
  }; 

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
