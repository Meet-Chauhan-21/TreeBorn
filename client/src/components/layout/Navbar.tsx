import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Heart, ShoppingBag, User, Menu, X } from 'lucide-react';
import { Container } from './Container';
import { useStore } from '../../context/StoreContext';
import logoImg from '../../images/logo.png';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { cart, wishlist, setIsCartOpen, setIsWishlistOpen } = useStore();

  const wishlistCount = wishlist.length;
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/#shop' },
    { name: 'Categories', path: '/#categories' },
    { name: 'About', path: '/#about' },
    { name: 'Contact', path: '/#contact' },
  ];

  return (
    <>
      {/* Header: lower z-index (z-40) so the drawer overlay (z-50) sits on top */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          isScrolled
            ? 'bg-white/95 border-b border-border-gray/60 py-3 shadow-sm backdrop-blur-md'
            : 'bg-transparent py-5'
        }`}
      >
        <Container className="flex items-center justify-between">
          {/* Logo Frame */}
          <Link
            to="/"
            className="font-display text-xl sm:text-2xl font-bold tracking-widest text-primary flex items-center gap-2 focus:outline-none"
          >
            <img src={logoImg} alt="AURA logo" className="h-8 w-auto object-contain" />
            <span className="hidden xs:inline">AURA</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.path}
                className="font-display text-sm font-medium tracking-wide text-dark/80 hover:text-primary transition-colors relative py-1 group"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Desktop Icons */}
          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="text-dark hover:text-primary transition-colors cursor-pointer focus:outline-none"
              aria-label="Search Products"
            >
              <Search size={20} strokeWidth={2} />
            </button>
            <button
              onClick={() => setIsWishlistOpen(true)}
              className="text-dark hover:text-primary transition-colors relative cursor-pointer focus:outline-none"
              aria-label="Wishlist"
            >
              <Heart size={20} strokeWidth={2} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-secondary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-sans font-medium">
                  {wishlistCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsCartOpen(true)}
              className="text-dark hover:text-primary transition-colors relative cursor-pointer focus:outline-none"
              aria-label="Cart"
            >
              <ShoppingBag size={20} strokeWidth={2} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-sans font-medium">
                  {cartCount}
                </span>
              )}
            </button>
            <Link
              to="/profile"
              className="text-dark hover:text-primary transition-colors"
              aria-label="Profile"
            >
              <User size={20} strokeWidth={2} />
            </Link>
          </div>

          {/* Mobile Menu & Cart Buttons */}
          <div className="flex md:hidden items-center space-x-3.5">
            <button
              onClick={() => setIsWishlistOpen(true)}
              className="text-dark hover:text-primary transition-colors relative cursor-pointer focus:outline-none"
              aria-label="Wishlist"
            >
              <Heart size={20} strokeWidth={2} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-secondary text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-sans font-medium">
                  {wishlistCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsCartOpen(true)}
              className="text-dark hover:text-primary transition-colors relative cursor-pointer focus:outline-none"
              aria-label="Cart"
            >
              <ShoppingBag size={20} strokeWidth={2} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-sans font-medium">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-dark hover:text-primary transition-colors cursor-pointer focus:outline-none"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </Container>
      </header>

      {/* Mobile Sidebar Navigation: higher z-index (z-50) and blur overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="absolute right-0 top-0 bottom-0 w-[80%] max-w-[320px] bg-white p-6 shadow-2xl flex flex-col z-55"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-border-gray pb-4 mb-6">
                <span className="font-display text-xl font-bold tracking-widest text-primary flex items-center gap-1.5">
                  <img src={logoImg} alt="AURA logo" className="h-6 w-auto object-contain" />
                  <span>AURA</span>
                </span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-dark hover:text-primary focus:outline-none cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="flex flex-col space-y-4 flex-grow">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="font-display text-base font-medium text-dark hover:text-primary transition-colors py-1 border-b border-gray-50"
                  >
                    {link.name}
                  </a>
                ))}
              </nav>

              <div className="border-t border-border-gray pt-6 mt-auto">
                <div className="flex items-center justify-around text-dark">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsSearchOpen(true);
                    }}
                    className="flex flex-col items-center gap-1 hover:text-primary cursor-pointer"
                  >
                    <Search size={20} />
                    <span className="text-[10px] font-medium tracking-wide">Search</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsWishlistOpen(true);
                    }}
                    className="flex flex-col items-center gap-1 hover:text-primary cursor-pointer"
                  >
                    <Heart size={20} />
                    <span className="text-[10px] font-medium tracking-wide">Wishlist</span>
                  </button>
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex flex-col items-center gap-1 hover:text-primary"
                  >
                    <User size={20} />
                    <span className="text-[10px] font-medium tracking-wide">Profile</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Slide-down Search Bar Panel */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-x-0 top-0 z-50 bg-white/95 border-b border-border-gray shadow-lg p-6 backdrop-blur-md flex items-center justify-center"
          >
            <div className="w-full max-w-2xl flex items-center gap-3">
              <Search className="text-gray-400" size={22} />
              <input
                type="text"
                placeholder="Search premium skincare products..."
                autoFocus
                className="w-full bg-transparent border-none text-dark font-sans text-lg focus:outline-none placeholder-gray-400"
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-dark transition-colors focus:outline-none cursor-pointer"
              >
                <X size={22} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
