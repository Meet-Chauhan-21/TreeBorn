import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from './Container';
import logoImg from '../../images/logo.png';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const shopLinks = [
    { name: 'Cleansers', path: '#shop?category=cleansers' },
    { name: 'Targeted Serums', path: '#shop?category=serums' },
    { name: 'Moisturizers', path: '#shop?category=moisturizers' },
    { name: 'Face Oils', path: '#shop?category=oils' },
    { name: 'Treatment Masks', path: '#shop?category=masks' },
  ];

  const companyLinks = [
    { name: 'Our Story', path: '#story' },
    { name: 'Ingredient Science', path: '#science' },
    { name: 'Sustainability', path: '#sustainability' },
    { name: 'Journal', path: '#journal' },
    { name: 'Careers', path: '#careers' },
  ];

  const supportLinks = [
    { name: 'Contact Us', path: '#contact' },
    { name: 'Shipping & Returns', path: '#shipping' },
    { name: 'FAQs', path: '#faqs' },
    { name: 'Store Locator', path: '#stores' },
    { name: 'Privacy Policy', path: '#privacy' },
  ];

  return (
    <footer className="bg-[#130F1A] text-white/90 pt-16 pb-8 border-t border-primary/20">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Column 1 - Brand Info */}
          <div className="lg:col-span-2">
            <Link
              to="/"
              className="font-display text-2xl font-bold tracking-widest text-white flex items-center gap-1.5 mb-5 focus:outline-none"
            >
              <span>TREE BORN</span>
              <span className="h-1.5 w-1.5 rounded-full bg-secondary"></span>
            </Link>
            <p className="text-white/60 text-sm font-sans max-w-sm mb-6 leading-relaxed">
              Formulating botanical solutions with advanced cellular science. We offer biological, cruelty-free premium skincare designed to restore your natural glow.
            </p>
            <div className="flex items-center space-x-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="text-white/60 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="text-white/60 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noreferrer"
                className="text-white/60 hover:text-white transition-colors"
                aria-label="Pinterest"
              >
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 22a10 10 0 0 1-5.1-13.8A10 10 0 0 1 16.7 3 10 10 0 0 1 22 13c0 4.9-3.5 9-8 9-1.5 0-3-.5-4.2-1.3L7 22l1-4.8c-.8-1.4-1.2-3-1.2-4.7C6.8 7.3 11 3.5 16 3.5c4.7 0 8.5 3.5 8.5 8 0 4.1-2.5 7.5-6.2 7.5-1.3 0-2.4-.6-2.9-1.5-.1.5-.5 2.1-.6 2.5-.2.8-.7 1.8-1.1 2.3A10 10 0 0 1 8 22z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="text-white/60 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2 - Shop */}
          <div>
            <h4 className="font-display text-sm font-semibold tracking-wider uppercase mb-5 text-white">
              Shop
            </h4>
            <ul className="space-y-3 text-sm">
              {shopLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.path}
                    className="text-white/60 hover:text-white transition-colors font-sans"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Company */}
          <div>
            <h4 className="font-display text-sm font-semibold tracking-wider uppercase mb-5 text-white">
              Company
            </h4>
            <ul className="space-y-3 text-sm">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.path}
                    className="text-white/60 hover:text-white transition-colors font-sans"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 - Support */}
          <div>
            <h4 className="font-display text-sm font-semibold tracking-wider uppercase mb-5 text-white">
              Support
            </h4>
            <ul className="space-y-3 text-sm">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.path}
                    className="text-white/60 hover:text-white transition-colors font-sans"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
              <li className="text-white/60 font-sans pt-2.5 border-t border-white/10 mt-1">
                <span className="block text-white/40 text-[9px] uppercase font-bold tracking-wider mb-0.5">Email Support</span>
                <a href="mailto:dabhisanjay901@gmail.com" className="hover:text-white transition-colors break-all">
                  dabhisanjay901@gmail.com
                </a>
              </li>
              <li className="text-white/60 font-sans pt-1">
                <span className="block text-white/40 text-[9px] uppercase font-bold tracking-wider mb-0.5">WhatsApp Support</span>
                <a href="https://wa.me/918905330954" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                  +91 8905330954
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-8 flex flex-col items-center justify-between gap-6 text-xs text-white/40 md:flex-row">
          <div className="space-y-1 text-center md:text-left">
            <p className="font-sans text-[11px]">
              &copy; {currentYear} TREEBORN Skincare. All rights reserved. Designed for pure restoration.
            </p>
            <p className="text-[10px] text-white/30 font-sans mt-0.5">
              Developed by <a href="https://revolix.studio" target="_blank" rel="noopener noreferrer" className="hover:text-primary-light transition-colors font-semibold">Revolix Studio</a>
            </p>
          </div>
          <div className="flex space-x-6">
            <a href="#terms" className="hover:text-white/60 transition-colors">
              Terms & Conditions
            </a>
            <a href="#privacy" className="hover:text-white/60 transition-colors">
              Privacy Policy
            </a>
            <a href="#cookies" className="hover:text-white/60 transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>

        {/* Tree Born Logo and label at the very end */}
        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col items-center justify-center select-none">
          <img src={logoImg} alt="Tree Born Logo" className="h-9 w-auto opacity-30 hover:opacity-75 transition-opacity duration-300 object-contain" />
          <span className="text-[9px] font-display font-medium tracking-widest text-white/25 mt-2 uppercase">Tree Born</span>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
