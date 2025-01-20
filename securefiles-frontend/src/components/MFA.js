import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { verifyMfaToken } from '../actions/auth';

const MFA = () => {
  const [mfaToken, setMfaToken] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(verifyMfaToken(mfaToken));
    if (result.payload && result.payload.success) {
      navigate('/fileupload'); // Redirect upon successful MFA verification
    } else {
      console.error('MFA verification failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={mfaToken}
        onChange={e => setMfaToken(e.target.value)}
        placeholder="Enter MFA Token"
      />
      <button type="submit">Verify</button>
    </form>
  );
};

export default MFA;
