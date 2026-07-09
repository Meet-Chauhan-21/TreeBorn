import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { User, Mail, Lock, ArrowRight, ShieldCheck, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Container from '../components/layout/Container';
import Button from '../components/layout/Button';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, googleLogin, user } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      const defaultPath = user.role === 'admin' ? '/admin' : '/profile';
      navigate(defaultPath, { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !phone || !password || !confirmPassword) {
      toast.error('Please fill out all fields.');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match. Please verify.');
      return;
    }

    setIsSubmitting(true);
    const success = await register(name, email, password, phone);
    setIsSubmitting(false);

    if (success) {
      // Redirection is handled by the useEffect hook once the user state changes
    }
  };

  return (
    <>
      <Helmet>
        <title>Create Account — TREEBORN Premium Skincare</title>
        <meta name="description" content="Register an TREEBORN Skincare account to unlock Gold Circle loyalty rewards, customized regimens, and swift ordering." />
      </Helmet>

      <Navbar />

      <main className="pt-24 pb-20 min-h-screen bg-light-gray/30 flex items-center">
        <Container className="py-8">
          <div className="max-w-5xl mx-auto bg-white rounded-3xl overflow-hidden shadow-xl border border-border-gray/30 grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
            
            {/* Left Column - Organic Brand Banner (Visible on md+) */}
            <div className="hidden md:block md:col-span-5 bg-primary relative p-8 text-white overflow-hidden">
              <div className="absolute inset-0 opacity-40 mix-blend-overlay">
                <img
                  src="https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800&auto=format&fit=crop"
                  alt="Apothecary skincare oils"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-primary-dark via-primary/80 to-transparent" />
              
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-secondary bg-white/10 px-2.5 py-1 rounded-full inline-block backdrop-blur-xs">
                    Pure Botanical
                  </span>
                </div>
                
                <div className="space-y-4">
                  <h2 className="font-display font-bold text-2xl lg:text-3xl leading-tight">
                    Join the TreeBorn Circle
                  </h2>
                  <p className="text-xs text-white/80 leading-relaxed font-sans">
                    Create an account today to access secure checkouts, tracking, and personalized skincare logs.
                  </p>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-secondary font-semibold font-display">
                  <ShieldCheck size={14} />
                  <span>Secure Cryptographic Checkouts</span>
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

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-dark/70 font-display flex items-center gap-1.5">
                      <User size={13} className="text-gray-400" />
                      <span>Full Name</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Priyesh Patel"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border border-border-gray/80 px-4 py-3 text-sm rounded-xl text-dark focus:outline-none focus:border-primary font-sans bg-light-gray/20 transition-colors"
                    />
                  </div>

                  {/* Email input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-dark/70 font-display flex items-center gap-1.5">
                      <Mail size={13} className="text-gray-400" />
                      <span>Email Address</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="priyesh.patel@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-border-gray/80 px-4 py-3 text-sm rounded-xl text-dark focus:outline-none focus:border-primary font-sans bg-light-gray/20 transition-colors"
                    />
                  </div>

                  {/* Phone input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-dark/70 font-display flex items-center gap-1.5">
                      <Phone size={13} className="text-gray-400" />
                      <span>Contact Phone</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full border border-border-gray/80 px-4 py-3 text-sm rounded-xl text-dark focus:outline-none focus:border-primary font-sans bg-light-gray/20 transition-colors"
                    />
                  </div>

                  {/* Passwords grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-dark/70 font-display flex items-center gap-1.5">
                        <Lock size={13} className="text-gray-400" />
                        <span>Password</span>
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border border-border-gray/80 px-4 py-3 text-sm rounded-xl text-dark focus:outline-none focus:border-primary font-sans bg-light-gray/20 transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-dark/70 font-display flex items-center gap-1.5">
                        <Lock size={13} className="text-gray-400" />
                        <span>Confirm Password</span>
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full border border-border-gray/80 px-4 py-3 text-sm rounded-xl text-dark focus:outline-none focus:border-primary font-sans bg-light-gray/20 transition-colors"
                      />
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
                <button
                  type="button"
                  onClick={googleLogin}
                  className="w-full flex items-center justify-center gap-3 border border-border-gray/80 hover:bg-light-gray/25 hover:border-gray-300 py-3 px-4 rounded-xl text-sm font-sans font-semibold text-dark transition-all cursor-pointer focus:outline-none"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.488 0-6.315-2.827-6.315-6.315s2.827-6.315 6.315-6.315c1.558 0 2.978.567 4.077 1.498l3.15-3.15C19.123 2.059 15.938 1 12.24 1 6.03 1 1 6.03 1 12.24s5.03 11.24 11.24 11.24c5.894 0 10.932-4.227 10.932-11.24 0-.742-.086-1.44-.22-2.115H12.24z"
                    />
                  </svg>
                  <span>Sign Up with Google</span>
                </button>

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
