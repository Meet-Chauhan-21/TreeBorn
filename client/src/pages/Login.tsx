import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Mail, Lock, ArrowRight, Sparkles, Eye, EyeOff, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import SocialLoginButtons from '../components/auth/SocialLoginButtons';
import { toast } from 'sonner';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Container from '../components/layout/Container';
import Button from '../components/layout/Button';

// Validation Schema using Yup
const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email address is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, googleLogin, facebookLogin, facebookRegister, user, resendVerification } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // States for verification notifications and resend cooldown
  const [infoMessage, setInfoMessage] = useState<string>(location.state?.message || '');
  const [unverifiedEmail, setUnverifiedEmail] = useState<string>(location.state?.email || '');
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);
  const [isResending, setIsResending] = useState<boolean>(false);

  // States for Facebook email linking
  const [showFbEmailForm, setShowFbEmailForm] = useState(false);
  const [fbUserData, setFbUserData] = useState<{ facebookId: string; name: string } | null>(null);
  const [fbEmail, setFbEmail] = useState('');
  const [fbSubmitting, setFbSubmitting] = useState(false);
  const [fbEmailSent, setFbEmailSent] = useState(false);

  // Check for Facebook OAuth Redirect Code
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      window.history.replaceState({}, document.title, window.location.pathname);
      const doFbLogin = async () => {
        const res = await facebookLogin({ code });
        if (res && typeof res === 'object' && res.needsEmail) {
          setFbUserData({ facebookId: res.facebookId, name: res.name });
          setShowFbEmailForm(true);
        }
      };
      doFbLogin();
    }
  }, [facebookLogin]);

  const handleFbEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbEmail || !fbUserData) return;
    setFbSubmitting(true);
    const success = await facebookRegister(fbUserData.name, fbEmail, fbUserData.facebookId);
    setFbSubmitting(false);
    if (success) {
      setFbEmailSent(true);
    }
  };

  // Countdown timer for resend verification link
  React.useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      const defaultPath = user.role === 'admin' ? '/admin' : '/profile';
      const from = (location.state as any)?.from?.pathname || defaultPath;
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleResend = async () => {
    if (cooldownSeconds > 0 || isResending || !unverifiedEmail) return;
    setIsResending(true);
    const res = await resendVerification(unverifiedEmail);
    setIsResending(false);
    if (res.success) {
      setInfoMessage('Verification email resent successfully! Please check your inbox.');
      setCooldownSeconds(60);
    } else if (res.cooldownRemaining) {
      setCooldownSeconds(res.cooldownRemaining);
      setInfoMessage(res.message || 'Please wait before requesting another email.');
    }
  };

  // Formik configuration
  const formik = useFormik({
    initialValues: {
      email: location.state?.email || '',
      password: '',
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      setInfoMessage('');
      const result = await login(values.email, values.password);
      setIsSubmitting(false);

      if (result && typeof result === 'object' && result.notVerified) {
        setUnverifiedEmail(result.email);
        setInfoMessage(
          'Your email address is not verified yet. Please check your inbox or click the button below to resend the verification email.'
        );
      }
    },
  });

  return (
    <>
      <Helmet>
        <title>Login — TREEBORN Premium Skincare</title>
        <meta name="description" content="Access your TREEBORN Skincare member dashboard for orders, rewards, and custom formulations." />
      </Helmet>

      <Navbar />

      <main className="pt-24 pb-20 min-h-screen bg-light-gray/30 flex items-center">
        <Container className="py-8">
          <div className="max-w-5xl mx-auto bg-white rounded-3xl overflow-hidden shadow-xl border border-border-gray/30 grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
            
            {/* Left Column - Organic Brand Banner */}
            <div className="hidden md:block md:col-span-5 bg-primary relative p-8 text-white overflow-hidden">
              <div className="absolute inset-0 opacity-40 mix-blend-overlay">
                <img
                  src="https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=800&auto=format&fit=crop"
                  alt="Organic plant ingredients"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-primary-dark via-primary/80 to-transparent" />
              
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-secondary bg-white/10 px-2.5 py-1 rounded-full inline-block backdrop-blur-xs">
                    Natural Actives
                  </span>
                </div>
                
                <div className="space-y-4">
                  <h2 className="font-display font-bold text-2xl lg:text-3xl leading-tight">
                    Biological Cellular Restoration
                  </h2>
                  <p className="text-xs text-white/80 leading-relaxed font-sans">
                    Unlock your skin's biological potential with our premium, organic, cruelty-free apothecary formulas.
                  </p>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-secondary font-semibold font-display">
                  <Sparkles size={14} />
                  <span>TREEBORN Gold Circle Benefits</span>
                </div>
              </div>
            </div>

            {/* Right Column - Form Sheet */}
            <div className="col-span-1 md:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-white">
              <div className="max-w-md w-full mx-auto space-y-6">
                <div>
                  <h1 className="text-2xl font-display font-bold text-dark tracking-tight">
                    Welcome to TREEBORN
                  </h1>
                  <p className="text-xs text-gray-500 font-sans mt-1">
                    Please enter your credentials or sign in with Google to manage your botanicals order.
                  </p>
                </div>

                {infoMessage && (
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl space-y-3">
                    <p className="text-xs font-sans text-primary font-medium leading-relaxed">
                      {infoMessage}
                    </p>
                    {unverifiedEmail && (
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={cooldownSeconds > 0 || isResending}
                        className={`text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-lg border transition-all cursor-pointer focus:outline-none flex items-center justify-center gap-1.5 ${
                          cooldownSeconds > 0 || isResending
                            ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-white border-primary/20 text-primary hover:bg-primary/[0.03] active:scale-95'
                        }`}
                      >
                        {isResending ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                            <span>Resending...</span>
                          </>
                        ) : cooldownSeconds > 0 ? (
                          <span>Resend in {cooldownSeconds}s</span>
                        ) : (
                          <span>Resend Verification Link</span>
                        )}
                      </button>
                    )}
                  </div>
                )}

                {fbEmailSent ? (
                  <div className="py-6 space-y-6 text-center animate-fade-in">
                    <div className="w-16 h-16 bg-[#EBF5F1] text-primary border border-primary/30 rounded-full flex items-center justify-center mx-auto shadow-xs">
                      <CheckCircle2 size={28} className="stroke-[1.5]" />
                    </div>
                    
                    <div className="space-y-2">
                      <h2 className="text-xl font-display font-extrabold text-slate-800 tracking-tight">Verify Your Email</h2>
                      <p className="text-xs text-slate-500 font-sans leading-relaxed max-w-sm mx-auto px-2">
                        We sent a verification link to <span className="font-semibold text-primary">{fbEmail}</span>. 
                        Please verify to activate your profile. Once verified, you will be automatically granted access.
                      </p>
                    </div>
                  </div>
                ) : showFbEmailForm ? (
                  <div className="space-y-4">
                    <div className="text-center pb-2">
                      <div className="w-14 h-14 bg-emerald-50 text-emerald-600 border border-emerald-250 rounded-full flex items-center justify-center mx-auto mb-3 shadow-3xs">
                        <ShieldCheck size={26} className="stroke-[1.5]" />
                      </div>
                      <h2 className="text-lg font-display font-extrabold text-slate-800 tracking-tight">Verify &amp; Secure Profile</h2>
                      <p className="text-[11.5px] text-gray-500 font-sans mt-1 max-w-xs mx-auto leading-relaxed">
                        Please enter your original email address. We will verify your account to ensure your security.
                      </p>
                    </div>

                    <form onSubmit={handleFbEmailSubmit} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-dark/70 font-display flex items-center gap-1.5">
                          <Mail size={13} className="text-gray-400" />
                          <span>Original Email Address</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={fbEmail}
                          onChange={(e) => setFbEmail(e.target.value)}
                          placeholder="your.email@example.com"
                          className="w-full border px-4 py-3 text-sm rounded-xl text-dark focus:outline-none focus:border-primary font-sans bg-light-gray/20 transition-colors border-border-gray/80"
                        />
                      </div>

                      <Button
                        type="submit"
                        variant="primary"
                        className="w-full py-3.5 rounded-xl font-display font-semibold text-xs uppercase tracking-wider mt-4"
                        disabled={fbSubmitting}
                      >
                        {fbSubmitting ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Sending Verification...</span>
                          </span>
                        ) : (
                          'Send Verification Link'
                        )}
                      </Button>

                      <button
                        type="button"
                        onClick={() => setShowFbEmailForm(false)}
                        className="w-full text-center text-xs text-gray-500 font-sans hover:underline pt-2 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </form>
                  </div>
                ) : (
                  <>
                    <form onSubmit={formik.handleSubmit} className="space-y-4">
                      {/* Email input */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-dark/70 font-display flex items-center gap-1.5">
                          <Mail size={13} className="text-gray-400" />
                          <span>Email Address</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          placeholder="meet.chauhan@example.com"
                          value={formik.values.email}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className={`w-full border px-4 py-3 text-sm rounded-xl text-dark focus:outline-none focus:border-primary font-sans bg-light-gray/20 transition-colors ${
                            formik.touched.email && formik.errors.email
                              ? 'border-red-500 focus:border-red-500'
                              : 'border-border-gray/80'
                          }`}
                        />
                        {formik.touched.email && formik.errors.email && (
                          <div className="text-[10px] text-red-500 font-sans font-medium mt-1">
                            {String(formik.errors.email)}
                          </div>
                        )}
                      </div>

                      {/* Password input */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-semibold text-dark/70 font-display flex items-center gap-1.5">
                            <Lock size={13} className="text-gray-400" />
                            <span>Password</span>
                          </label>
                        </div>
                        
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            placeholder="••••••••••••"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={`w-full border pl-4 pr-10 py-3 text-sm rounded-xl text-dark focus:outline-none focus:border-primary font-sans bg-light-gray/20 transition-colors ${
                              formik.touched.password && formik.errors.password
                                ? 'border-red-500 focus:border-red-500'
                                : 'border-border-gray/80'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-dark focus:outline-none cursor-pointer p-0.5"
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        {formik.touched.password && formik.errors.password && (
                          <div className="text-[10px] text-red-500 font-sans font-medium mt-1">
                            {String(formik.errors.password)}
                          </div>
                        )}
                      </div>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        variant="primary"
                        className="w-full py-3.5 rounded-xl font-display font-semibold text-xs uppercase tracking-wider mt-4"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Authenticating...</span>
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-1.5">
                            <span>Sign In</span>
                            <ArrowRight size={14} />
                          </span>
                        )}
                      </Button>
                    </form>

                    {/* Divider */}
                    <div className="relative flex items-center justify-center py-2 text-xs">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border-gray/50"></div>
                      </div>
                      <span className="relative px-3 bg-white text-gray-400 font-sans text-[10px] uppercase font-semibold">
                        Or continue with
                      </span>
                    </div>

                    {/* Social Sign-in Buttons */}
                    <SocialLoginButtons redirectPage="login" />

                    <p className="text-center text-xs text-gray-500 font-sans pt-2">
                      Don't have an TREEBORN Account?{' '}
                      <Link to="/register" className="font-semibold text-primary hover:underline">
                        Create Account
                      </Link>
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </>
  );
};

export default Login;
