import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import bgImage from '../assets/bg_loginregister.png';
import lockIcon from '../assets/pass_reset.png';
import logo from '../assets/logo.png';
import MouseTrail from '../components/MouseTrail';
import api from '../api';
import { authService } from '../api';

const NewPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [token, setToken] = useState('');
  const { token: tokenParam } = useParams();

  useEffect(() => {
    // Check if token is valid
    if (!tokenParam) {
      setErrors({ token: 'Invalid or missing reset token' });
    } else {
      setToken(tokenParam);
    }
  }, [location]);

  const validateForm = () => {
    const newErrors = {};
    
    // Password validation - min 8 chars, at least one capital letter and symbol
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_])[A-Za-z\d@$!%*?&_]{8,}$/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one capital letter, one number, and one special character';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await authService.resetPassword(token, formData.password, formData.confirmPassword);

      // Show success message and redirect to login
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Password reset successful. Please login with your new password.' 
          } 
        });
      }, 2000);
    } catch (error) {
      console.error('Error during password reset:', error);
      setErrors({
        submit: error.response?.data?.error || 'Failed to reset password. Please try again.' 
      });
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4 sm:px-6"
         style={{
           backgroundImage: `url(${bgImage})`,
           backgroundSize: 'cover',
           backgroundPosition: 'center',
         }}>
      <MouseTrail excludeSelector=".form-container" />
      
      {/* Logo placement */}
      <div className="absolute top-4 sm:top-8 left-4 sm:left-10">
        <img src={logo} alt="Hano Logo" className="w-24 sm:w-32 h-auto drop-shadow-lg" />
      </div>

      {/* Main form container */}
      <div className="form-container bg-white/80 backdrop-blur-md p-6 sm:p-12 rounded-3xl shadow-lg w-full max-w-[600px] text-center shadow-[0_0_50px_0_rgba(76,83,180,0.2)] hover:shadow-[0_0_70px_0_rgba(76,83,180,0.3)] transition-shadow duration-300 mt-16 sm:mt-0">
        {/* Lock icon header */}
        <div className="flex justify-center mb-6">
          <img src={lockIcon} alt="Lock Icon" className="w-20 sm:w-30 h-20 sm:h-30" />
        </div>
        <h2 className="text-[#4C53B4] text-2xl sm:text-3xl font-semibold mb-3">Create New Password</h2>
        <p className="text-gray-600 mb-8">Please enter your new password below.</p>

        {/* Error Messages */}
        {errors.token && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <span className="block sm:inline">{errors.token}</span>
          </div>
        )}
        {errors.submit && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <span className="block sm:inline">{errors.submit}</span>
          </div>
        )}
        
        {/* Reset password form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* New Password Field */}
          <div className="form-control w-full">
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#4C53B4] transition-colors duration-200">
                <i className="fa-solid fa-lock text-xl"></i>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="New Password"
                className={`input w-full pl-12 pr-12 py-3 rounded-2xl bg-white/50 border-2 ${errors.password ? 'border-red-500' : 'border-gray-200'} focus:border-[#4C53B4] focus:outline-none focus:ring-2 focus:ring-[#4C53B4]/20 transition-all duration-200`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#4C53B4] transition-colors duration-200"
              >
                <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-xl`}></i>
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password Field */}
          <div className="form-control w-full">
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#4C53B4] transition-colors duration-200">
                <i className="fa-solid fa-shield-halved text-xl"></i>
              </span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm New Password"
                className={`input w-full pl-12 pr-12 py-3 rounded-2xl bg-white/50 border-2 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200'} focus:border-[#4C53B4] focus:outline-none focus:ring-2 focus:ring-[#4C53B4]/20 transition-all duration-200`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#4C53B4] transition-colors duration-200"
              >
                <i className={`fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'} text-xl`}></i>
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>
          
          {/* Submit button */}
          <button
            type="submit"
            className="btn w-full rounded-3xl bg-gradient-to-r from-[#4C53B4] to-[#6f75d6] hover:from-[#3a4095] hover:to-[#5c63c4] text-white border-none py-2.5 sm:py-3 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 sm:w-6 sm:h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                Reset Password
              </div>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewPassword; 