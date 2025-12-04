'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Toast from '../../components/Toast';

export default function VerifyOTPPage() {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef([]);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ show: false, message: '', type: 'success' });
  };

  useEffect(() => {
    // Get email from localStorage
    const pendingEmail = localStorage.getItem('pendingEmail');
    if (!pendingEmail) {
      router.push('/signup');
      return;
    }
    setEmail(pendingEmail);

    // Start countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          otp: otpString
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.removeItem('pendingEmail');
        showToast('Email verified successfully! 🎉', 'success');
        setTimeout(() => router.push('/dashboard'), 1500);
      } else {
        const data = await response.json();
        setError(data.message || 'Invalid OTP');
        showToast(data.message || 'Invalid OTP', 'error');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      setError('Network error. Please try again.');
      showToast('Network error. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    try {
      const response = await fetch('http://localhost:3001/api/auth/resend-verification-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (response.ok) {
        showToast('New OTP sent to your email!', 'info');
        setCanResend(false);
        setCountdown(60);
        
        // Restart countdown
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              setCanResend(true);
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        showToast(data.message || 'Failed to resend OTP', 'error');
      }
    } catch (error) {
      showToast('Network error. Please try again.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Back Button */}
      <button
        onClick={() => router.push('/signup')}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 bg-gray-800/80 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-200 text-gray-100 font-medium border border-gray-700/50"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back
      </button>

      {/* Neural Network Background */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 1000 1000">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" className="text-gray-400" />
          <circle cx="400" cy="300" r="2" fill="#3b82f6" opacity="0.6">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite"/>
          </circle>
        </svg>
      </div>

      {/* OTP Verification Card */}
      <div className="relative z-10 bg-gray-800/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12 max-w-md w-full border border-gray-700/50">
        {/* Logo/Brand */}
        <div className="flex justify-center mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white w-auto h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-xl p-4">
            <span className="text-white">
              CraftMyFolio
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-100 mb-3">
            Verify Your Email
          </h1>
          <p className="text-gray-300 text-lg mb-2">
            We've sent a 6-digit code to
          </p>
          <p className="text-blue-400 font-semibold">
            {email}
          </p>
        </div>

        {/* OTP Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* OTP Input Boxes */}
          <div className="flex justify-center gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-xl font-bold bg-gray-700/50 border-2 border-gray-600 rounded-xl focus:border-blue-400 focus:bg-gray-700 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all duration-200 text-gray-100"
                placeholder="0"
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-400 text-sm text-center bg-red-500/10 p-3 rounded-lg border border-red-500/20">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </div>
            ) : (
              'Verify Email'
            )}
          </button>
        </form>

        {/* Resend OTP */}
        <div className="text-center mt-6">
          <p className="text-gray-300 text-sm mb-2">
            Didn't receive the code?
          </p>
          {canResend ? (
            <button
              onClick={handleResendOTP}
              className="text-blue-400 font-semibold hover:text-blue-300 transition-colors"
            >
              Resend OTP
            </button>
          ) : (
            <p className="text-gray-400 text-sm">
              Resend in {countdown}s
            </p>
          )}
        </div>
      </div>
      
      <Toast 
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={hideToast}
      />
    </div>
  );
}