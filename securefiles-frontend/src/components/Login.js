import React from 'react';
import { Grid, Paper, Avatar, TextField, Button, Typography } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate } from 'react-router-dom';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../actions/auth';

const Login = () => {
  const navigate = useNavigate();
  const paperStyle = { padding: 20, height: '45vh', width: 280, margin: "20px auto" };
  const avatarStyle = { backgroundColor: '#1bbd7e' };
  const btnstyle = { margin: '8px 0' };

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch(); 

  const handleSubmit = async (e) => {
      e.preventDefault();
      const result = await dispatch(login(username, password));
      if (result && result.data) {
        if (result.data.mfa_required) {
          navigate('/mfa'); // Redirect to MFA page if MFA is required
        } else if (result.data.access && result.data.refresh) {
          navigate('/fileupload'); // Redirect upon successful login
        } else if (result.data.error === 'Invalid credentials') {
          alert('Invalid credentials. Please check your username and password.');
        } else {
          console.error('Login failed or token check failed', result);
        }
      } else {
        console.error('Login request did not return expected result', result);
      }
    }; 

    return (
      <Grid>
          <Paper elevation={10} style={paperStyle}>
              <Grid align="center">
                  <Avatar style={avatarStyle}><LockOutlinedIcon /></Avatar>
                  <h2> </h2>
              </Grid>
              <form onSubmit={handleSubmit}>
                  <TextField 
                      label="Username" 
                      placeholder="Enter username" 
                      variant="outlined" 
                      fullWidth 
                      required 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                  />
                  <TextField 
                      label="Password" 
                      placeholder="Enter password" 
                      type="password" 
                      variant="outlined" 
                      fullWidth 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                  />
                  <Button 
                      type="submit" 
                      color="primary" 
                      variant="contained" 
                      style={btnstyle} 
                      fullWidth
                  >
                      Sign in
                  </Button>
              </form>
              <Typography>
                  Do you have an account? 
                  <Button 
                      color="inherit" 
                      onClick={() => navigate('/register')}
                      sx={{ textTransform: 'none', color: 'blue' }}
                  >
                      Register
                  </Button>
              </Typography>
          </Paper>
      </Grid>
  );
};

export default Login;
