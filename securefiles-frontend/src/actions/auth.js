import axios from 'axios';

export const login = (username, password) => async dispatch => {
  try {
    console.log('Sending login request', { username, password });
    const response = await axios.post('/api/login/', { username, password }, { headers: { 'Content-Type': 'application/json' } });
    console.log('Login response received', response);

    dispatch({ type: 'LOGIN_SUCCESS', payload: response.data });
    
    // Store the token in localStorage
    localStorage.setItem('authToken', response.data.access);

    return response; // Ensure return
  } catch (error) {
    dispatch({ type: 'LOGIN_FAIL', payload: error.response.data });
    return error.response;
  }
};

// Action to register a new user
export const register = (username, password) => async dispatch => {
  try {
    const response = await axios.post('/api/register/', { username, password });
    dispatch({ type: 'REGISTER_SUCCESS', payload: response.data });
    return response; // Ensure return
  } catch (error) {
    dispatch({ type: 'REGISTER_FAIL', payload: error.response.data });
    return error.response;
  }
};

// Action to verify MFA token
export const verifyMfaToken = (mfaToken) => async dispatch => {
  try {
    const response = await axios.post('/api/verify-mfa/', { mfaToken });
    dispatch({ type: 'MFA_VERIFICATION_SUCCESS', payload: response.data });
  } catch (error) {
    dispatch({ type: 'MFA_VERIFICATION_FAIL', payload: error.response.data });
  }
};

// Logout action
export const logout = () => dispatch => {
  // Clear localStorage on logout
  localStorage.removeItem('authToken');
  dispatch({ type: 'LOGOUT_SUCCESS' });
};
