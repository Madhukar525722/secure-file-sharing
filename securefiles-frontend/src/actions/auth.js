import axios from 'axios';

export const login = (username, password) => async dispatch => {
  try {
    const response = await axios.post('/api/login/', { username, password });
    dispatch({ type: 'LOGIN_SUCCESS', payload: response.data });
  } catch (error) {
    dispatch({ type: 'LOGIN_FAIL', payload: error.response.data });
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
