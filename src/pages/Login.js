import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess } from '../redux/slices/authSlice';
import { useAdminTheme } from '../theme/ThemeContext';
import axios from 'axios';
import { Lock, Phone, Coffee, AlertCircle } from 'lucide-react';

const Login = () => {
  const { theme } = useAdminTheme();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('https://optimist-backend-api.onrender.com/api/auth/login', {
        phone,
        password,
      });

      if (response.data.success) {
        if (response.data.user.role !== 'admin') {
          setError('Access denied. Admin only.');
          setLoading(false);
          return;
        }
        dispatch(loginSuccess({
          user: response.data.user,
          token: response.data.token,
        }));
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="flex items-center justify-center min-h-screen transition-colors duration-300"
      style={{ backgroundColor: theme.background }}
    >
      <div 
        className="w-full max-w-md p-10 rounded-3xl shadow-2xl transition-all duration-300"
        style={{ backgroundColor: theme.card }}
      >
        <div className="flex flex-col items-center mb-10">
          <div 
            className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
            style={{ backgroundColor: theme.primary }}
          >
            <Coffee size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-widest uppercase" style={{ color: theme.primary }}>
            OPTIMIST
          </h1>
          <p className="text-sm font-semibold opacity-60 uppercase tracking-widest mt-1">Admin Access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium">
              <AlertCircle size={18} className="mr-2 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-wider ml-1" style={{ color: theme.text }}>
              Phone Number
            </label>
            <div 
              className="flex items-center px-4 py-3 rounded-2xl border transition-all duration-200"
              style={{ 
                backgroundColor: theme.surface,
                borderColor: theme.border
              }}
            >
              <Phone size={18} className="opacity-40 mr-3" style={{ color: theme.text }} />
              <input
                type="text"
                placeholder="Enter your phone number"
                className="bg-transparent border-none outline-none w-full font-semibold"
                style={{ color: theme.text }}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-wider ml-1" style={{ color: theme.text }}>
              Password
            </label>
            <div 
              className="flex items-center px-4 py-3 rounded-2xl border transition-all duration-200"
              style={{ 
                backgroundColor: theme.surface,
                borderColor: theme.border
              }}
            >
              <Lock size={18} className="opacity-40 mr-3" style={{ color: theme.text }} />
              <input
                type="password"
                placeholder="••••••••"
                className="bg-transparent border-none outline-none w-full font-semibold"
                style={{ color: theme.text }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl font-black text-lg uppercase tracking-widest shadow-lg transition-transform active:scale-[0.98] disabled:opacity-50"
            style={{ 
              backgroundColor: theme.primary,
              color: theme.background
            }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;