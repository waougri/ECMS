
import React, { useState, useEffect } from 'react';
import { BUSINESS_INFO } from '../constants';
import logoUrl from "../assets/logo.png"

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-md py-3' : 'bg-white/80 backdrop-blur-sm py-5'
    }`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
     <img
  src={logoUrl}
  alt="ECMS Logo"
  className="h-14 md:h-24 w-auto"
/>

        <div className="hidden md:flex items-center gap-10">
          <a href="#services" className="nav-link text-sm font-bold uppercase tracking-widest text-green-900">Services</a>
          <a href="#about" className="nav-link text-sm font-bold uppercase tracking-widest text-green-900">About</a>
          <a href="#contact" className="nav-link text-sm font-bold uppercase tracking-widest text-green-900">Contact</a>
          <a 
            href={`tel:${BUSINESS_INFO.phone}`} 
            className="bg-[#114f20] text-white px-6 py-3 rounded-lg font-bold text-sm tracking-widest hover:bg-green-800 transition shadow-md"
          >
            {BUSINESS_INFO.phone}
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
