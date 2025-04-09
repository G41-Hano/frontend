import { useState } from 'react';
import bgImage from '../assets/bg_loginregister.png';
import lockIcon from '../assets/pass_reset.png';
import logo from '../assets/logo.png';
import MouseTrail from '../components/MouseTrail';

const PasswordReset = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Implement password reset logic here
    console.log('Password reset requested for:', email);
    setTimeout(() => {
      setLoading(false);
      setIsSubmitted(true);
    }, 2000); // Temporary loading simulation
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4 sm:px-6"
         style={{
           backgroundImage: `url(${bgImage})`,
           backgroundSize: 'cover',
           backgroundPosition: 'center',
         }}>

      <MouseTrail excludeSelector=".form-container" />
      
      {/* Logo */}
      <div className="absolute top-4 sm:top-8 left-4 sm:left-10">
        <img src={logo} alt="Hano Logo" className="w-24 sm:w-32 h-auto drop-shadow-lg" />
      </div>

      {/* Main form container */}
      <div className="form-container bg-white/80 backdrop-blur-md p-6 sm:p-12 rounded-3xl shadow-lg w-full max-w-[600px] text-center shadow-[0_0_50px_0_rgba(76,83,180,0.2)] hover:shadow-[0_0_70px_0_rgba(76,83,180,0.3)] transition-shadow duration-300 mt-16 sm:mt-0">
        {/* Lock icon header */}
        <div className="flex justify-center mb-6">
          <img src={lockIcon} alt="Lock Icon" className="w-20 sm:w-30 h-20 sm:h-30" />
        </div>
        <h2 className="text-[#4C53B4] text-2xl sm:text-3xl font-semibold mb-3">Reset your Password</h2>
        <p className="text-gray-600 mb-8">
          {isSubmitted 
            ? "Check your email for instructions to reset your password."
            : "Please provide your registered email address to reset your password."}
        </p>
        
        {/* Reset password form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-control w-full">
            <div className="relative group">
              <input
                type="email"
                placeholder="Enter your email account"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input w-full px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl bg-white/50 border-2 border-gray-200 focus:border-[#4C53B4] focus:outline-none focus:ring-2 focus:ring-[#4C53B4]/20 transition-all duration-200"
                required
              />
            </div>
          </div>
          
          {/* Submit button with loading state */}
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
                Submit
              </div>
            )}
          </button>

          {/* Login link */}
          <div className="text-center mt-1">
            <p className="text-gray-600 text-sm sm:text-base">
              Remember your password? {" "}
              <a href="/login" className="text-[#4C53B4] hover:text-[#3a4095] font-semibold hover:underline transition-colors hover:scale-105 inline-block">
                Login Now!
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordReset;