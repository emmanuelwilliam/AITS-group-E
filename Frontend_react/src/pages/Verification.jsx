import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import  authService  from '../services/authService';

const VerifyEmail = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    
    try {
      const response = await authService.verifyEmail(state.email, code);
      
      if (response.success) {
        // Store final tokens
        localStorage.setItem('token', response.tokens.access);
        localStorage.setItem('refreshToken', response.tokens.refresh);
        
        navigate('/dashboard');  // Redirect after successful verification
      }
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div>
      <h2>Verify Your Email</h2>
      <p>We sent a code to {state?.email}</p>
      
      <form onSubmit={handleVerify}>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter verification code"
          required
        />
        <button type="submit" disabled={isVerifying}>
          {isVerifying ? 'Verifying...' : 'Verify'}
        </button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
};

export default VerifyEmail;