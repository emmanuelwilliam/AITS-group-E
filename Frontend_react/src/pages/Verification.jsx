import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const VerifyEmail = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Extract info safely
  const email = state?.email;
  const role = state?.role || 'student'; // Default to 'student'

  // ✅ Redirect if no email provided (prevents broken page on refresh/direct visit)
  useEffect(() => {
    if (!email) {
      navigate('/'); // You can change this to '/login' or another safe page
    }
  }, [email, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsVerifying(true);

    try {
      const response = await authService.verifyEmail(email, code);

      if (response.success) {
        // Store tokens
        localStorage.setItem('token', response.tokens.access);
        localStorage.setItem('refreshToken', response.tokens.refresh);

        // Redirect based on role
        switch (role) {
          case 'administrator':
            navigate('/admin-dashboard');
            break;
          case 'lecturer':
            navigate('/lecturer-dashboard');
            break;
          case 'student':
          default:
            navigate('/dashboard');
            break;
        }
      } else {
        setError(response.message || 'Verification failed');
      }
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="verify-container">
      <h2>Verify Your Email</h2>
      <p>We sent a code to <strong>{email}</strong></p>
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
