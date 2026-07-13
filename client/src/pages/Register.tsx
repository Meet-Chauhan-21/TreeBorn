import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { User, Mail, Lock, ArrowRight, ShieldCheck, Phone, Eye, EyeOff } from 'lucide-react';
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
const registerSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Full Name is required'),
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email address is required'),
  phone: Yup.string()
    .min(10, 'Contact Phone must be at least 10 digits')
    .required('Contact Phone is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm Password is required'),
});

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, googleLogin, user } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      const defaultPath = user.role === 'admin' ? '/admin' : '/profile';
      navigate(defaultPath, { replace: true });
    }
  }, [user, navigate]);

  // Formik configuration
  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: registerSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      await register(values.name, values.email, values.password, values.phone);
      setIsSubmitting(false);
    },
  });

  return (
    <>
      <Helmet>
        <title>Register — TREEBORN Premium Skincare</title>
        <meta name="description" content="Join TREEBORN Skincare and unlock gold circle rewards, botanicals order logging, and advanced restoration formulations." />
      </Helmet>

      <Navbar />

      <main className="pt-24 pb-20 min-h-screen bg-light-gray/30 flex items-center">
        <Container className="py-8">
          <div className="max-w-5xl mx-auto bg-white rounded-3xl overflow-hidden shadow-xl border border-border-gray/30 grid grid-cols-1 md:grid-cols-12 min-h-[640px]">
            
            {/* Left Column - Organic Brand Banner */}
            <div className="hidden md:block md:col-span-5 bg-primary relative p-8 text-white overflow-hidden">
              <div className="absolute inset-0 opacity-40 mix-blend-overlay">
                <img
                  src="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=800&auto=format&fit=crop"
                  alt="Premium dropper bottle"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-primary-dark via-primary/80 to-transparent" />
              
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-secondary bg-white/10 px-2.5 py-1 rounded-full inline-block backdrop-blur-xs">
                    Pure & Clinical
                  </span>
                </div>
                
                <div className="space-y-4">
                  <h2 className="font-display font-bold text-2xl lg:text-3xl leading-tight">
                    Sartorial Botanical Apothecary
                  </h2>
                  <p className="text-xs text-white/80 leading-relaxed font-sans">
                    Begin your restoration journey. Become a Gold Circle member to earn points, secure free shipping, and custom formulate.
                  </p>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-secondary font-semibold font-display">
                  <ShieldCheck size={14} />
                  <span>Cruelty-Free & Dermatologist Approved</span>
                </div>
              </div>
            </div>

            {/* Right Column - Form Sheet */}
            <div className="col-span-1 md:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-white">
              <div className="max-w-md w-full mx-auto space-y-6">
                <div>
                  <h1 className="text-2xl font-display font-bold text-dark tracking-tight">
                    Create your Account
                  </h1>
                  <p className="text-xs text-gray-500 font-sans mt-1">
                    Fill in your details below to activate your premium botanical membership profile.
                  </p>
                </div>

                <form onSubmit={formik.handleSubmit} className="space-y-4">
                  {/* Name input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-dark/70 font-display flex items-center gap-1.5">
                      <User size={13} className="text-gray-400" />
                      <span>Full Name</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Priyesh Patel"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`w-full border px-4 py-3 text-sm rounded-xl text-dark focus:outline-none focus:border-primary font-sans bg-light-gray/20 transition-colors ${
                        formik.touched.name && formik.errors.name
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-border-gray/80'
                      }`}
                    />
                    {formik.touched.name && formik.errors.name && (
                      <div className="text-[10px] text-red-500 font-sans font-medium mt-1">
                        {formik.errors.name}
                      </div>
                    )}
                  </div>

                  {/* Email input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-dark/70 font-display flex items-center gap-1.5">
                      <Mail size={13} className="text-gray-400" />
                      <span>Email Address</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="priyesh.patel@gmail.com"
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

                  {/* Phone input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-dark/70 font-display flex items-center gap-1.5">
                      <Phone size={13} className="text-gray-400" />
                      <span>Contact Phone</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="+91 98765 43210"
                      value={formik.values.phone}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`w-full border px-4 py-3 text-sm rounded-xl text-dark focus:outline-none focus:border-primary font-sans bg-light-gray/20 transition-colors ${
                        formik.touched.phone && formik.errors.phone
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-border-gray/80'
                      }`}
                    />
                    {formik.touched.phone && formik.errors.phone && (
                      <div className="text-[10px] text-red-500 font-sans font-medium mt-1">
                        {formik.errors.phone}
                      </div>
                    )}
                  </div>

                  {/* Passwords grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-dark/70 font-display flex items-center gap-1.5">
                        <Lock size={13} className="text-gray-400" />
                        <span>Password</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          placeholder="••••••••"
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
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-dark/70 font-display flex items-center gap-1.5">
                        <Lock size={13} className="text-gray-400" />
                        <span>Confirm Password</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          placeholder="••••••••"
                          value={formik.values.confirmPassword}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className={`w-full border pl-4 pr-10 py-3 text-sm rounded-xl text-dark focus:outline-none focus:border-primary font-sans bg-light-gray/20 transition-colors ${
                            formik.touched.confirmPassword && formik.errors.confirmPassword
                              ? 'border-red-500 focus:border-red-500'
                              : 'border-border-gray/80'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-dark focus:outline-none cursor-pointer p-0.5"
                        >
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                        <div className="text-[10px] text-red-500 font-sans font-medium mt-1">
                          {formik.errors.confirmPassword}
                        </div>
                      )}
                    </div>
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
                        <span>Creating Account...</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1.5">
                        <span>Register Now</span>
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
                  Already have an account?{' '}
                  <Link to="/login" className="font-semibold text-primary hover:underline">
                    Sign In
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

export default Register;
