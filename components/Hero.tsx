// components/Hero.tsx
import React from "react";
import { BUSINESS_INFO } from "../constants";
import { motion } from "framer-motion"; // Import motion

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-white overflow-hidden pt-20">
      
      {/* Animated Gradient Background Blob */}
      <motion.div 
        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
        transition={{ duration: 20, repeat: Infinity }}
        className="absolute top-0 right-0 w-2/3 h-full bg-[#f4f7f2] -skew-x-6 transform translate-x-20 hidden lg:block origin-top-right"
      />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            
            {/* "Wipe" Text Reveal Animation */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-[#114f20] leading-[1.1] mb-8 relative">
              <span className="block overflow-hidden">
                <motion.span 
                  initial={{ y: "100%" }} 
                  animate={{ y: 0 }} 
                  transition={{ duration: 0.8, ease: "circOut" }}
                  className="block"
                >
                  Sparkling Clean
                </motion.span>
              </span>
              <span className="block overflow-hidden">
                <motion.span 
                  initial={{ y: "100%" }} 
                  animate={{ y: 0 }} 
                  transition={{ duration: 0.8, delay: 0.1, ease: "circOut" }}
                  className="block"
                >
                  Office Spaces.
                </motion.span>
              </span>
            </h1>

            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="relative text-lg md:text-xl text-slate-600 mb-10 leading-relaxed max-w-lg"
            >
              <span className="absolute -left-6 top-2 h-16 w-[2px] bg-gradient-to-b from-emerald-500/60 to-transparent hidden md:block" />
              <span className="font-semibold text-emerald-600">Since {BUSINESS_INFO.since}</span>, we've been the{" "}
              <span className="font-semibold text-slate-800">trusted partner</span> for{" "}
              <span className="font-semibold text-slate-800">Wilmington businesses</span>.
              <br /><br />
              <span className="inline-flex items-start gap-2 text-slate-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Specializing in <span className="font-medium text-slate-800">commercial office cleaning</span> and <span className="font-medium text-slate-800">facility support</span>.</span>
              </span>
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-wrap gap-4"
            >
              <a href="#contact" className="bg-[#114f20] text-white px-10 py-5 rounded-xl font-bold hover:bg-green-900 transition-all shadow-lg text-center uppercase tracking-wider text-sm">
                Get a Comparison Quote
              </a>
              <a href={`tel:${BUSINESS_INFO.phone.replace(/\D/g, "")}`} className="bg-white text-[#114f20] border-2 border-[#114f20] px-10 py-5 rounded-xl font-bold hover:bg-[#f4f7f2] transition-all text-center uppercase tracking-wider text-sm">
                {BUSINESS_INFO.phone}
              </a>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="hidden lg:block relative"
          >
            <div className="rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
              {/* Parallax-like subtle movement on hover could go here */}
              <motion.img
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.7 }}
                src="https://www.southernliving.com/thmb/Twr3p5wRqgEN5tZO3MhJC3EfEZw=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/27529_WilmiWilmington_NC-Riverwalk-6017-cfc0ba2f5f80487fa0f30caca55b9b06.jpg"
                className="w-full h-auto object-cover aspect-[4/3]"
                alt="Clean Commercial Office"
              />
            </div>
            {/* Floating Badge */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -bottom-10 -left-10 bg-[#8a9a5b] p-8 rounded-2xl shadow-xl text-white"
            >
              <p className="text-4xl font-serif font-bold">50+</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80 mt-1">Years Serving Wilmington</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
export default Hero;