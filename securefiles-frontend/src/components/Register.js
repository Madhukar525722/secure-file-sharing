import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { register } from '../actions/auth';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(register(username, password));
    console.log('Register result:', result);
    console.log('Register result payload:', result.data);
    if (result && result.data && (result.data.success || result.status === 201)) {
      navigate('/login'); // Redirect to login after successful registration
    } else if (result && result.data && result.data.error === 'Username already exists') {
      alert('This username is already registered.');
    } else {
      console.error('Registration failed', result?.payload ? result.payload : result);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>
      <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
      <button type="submit">Register</button>
    </form>
  );
};

export default Register;
