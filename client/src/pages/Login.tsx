import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Mail, Lock, ArrowRight, Sparkles, Eye, EyeOff } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
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
  const { login, googleLogin, user } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      const defaultPath = user.role === 'admin' ? '/admin' : '/profile';
      const from = (location.state as any)?.from?.pathname || defaultPath;
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  // Formik configuration
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      await login(values.email, values.password);
      setIsSubmitting(false);
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
                        {formik.errors.email}
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
                        {formik.errors.password}
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

                {/* Google Sign-in Button */}
                <div className="w-full flex justify-center">
                  <GoogleLogin
                    onSuccess={async (credentialResponse) => {
                      if (credentialResponse.credential) {
                        await googleLogin(credentialResponse.credential);
                      }
                    }}
                    onError={() => {
                      toast.error('Google Sign-In failed.');
                    }}
                  />
                </div>

                <p className="text-center text-xs text-gray-500 font-sans pt-2">
                  Don't have an TREEBORN Account?{' '}
                  <Link to="/register" className="font-semibold text-primary hover:underline">
                    Create Account
                  </Link>
                </p>
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
