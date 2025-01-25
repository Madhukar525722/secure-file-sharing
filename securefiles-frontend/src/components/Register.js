import React from 'react';
import { Grid, Paper, Avatar, TextField, Button, Box, AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate } from 'react-router-dom';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { register } from '../actions/auth';

const Register = () => {
  const navigate = useNavigate();
  const paperStyle = { padding: 20, height: '45vh', width: 280, margin: "20px auto" };
  const avatarStyle = { backgroundColor: '#1bbd7e' };
  const btnstyle = { margin: '8px 0' };

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch(); 

  const handleSubmit = async (e) => {
      e.preventDefault();
      const result = await dispatch(register(username, password));
      console.log('Register result:', result);
      console.log('Register result payload:', result.data);
      if (result && result.data && (result.data.success || result.status === 201)) {
        alert('User registered successfully.');
        navigate('/login'); // Redirect to login after successful registration
      } else if (result && result.data && result.data.error === 'Username already exists') {
        alert('This username is already registered.');
      } else {
        console.error('Registration failed', result?.payload ? result.payload : result);
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
                      Register
                  </Button>
              </form>
          </Paper>
      </Grid>
  );
};

const ButtonAppBar = () => {
  const navigate = useNavigate();

  return (
      <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static">
              <Toolbar>
                  <IconButton
                      size="large"
                      edge="start"
                      color="inherit"
                      aria-label="menu"
                      sx={{ mr: 2 }}
                  >
                      <MenuIcon />
                  </IconButton>
                  <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                      Secure File Sharing Application
                  </Typography>
                  <Button color="inherit" onClick={() => navigate('/')}>Home</Button>
              </Toolbar>
          </AppBar>
      </Box>
  );
};

const Register_final_view = () => {
  return (
      <div>
          <ButtonAppBar />
          <Register />
      </div>
  );
};

export default Register_final_view;
