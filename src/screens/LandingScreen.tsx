import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Sparkles } from 'lucide-react';
import { ScreenId } from '../types';
import unipayLogo from '../assets/images/unipay_logo_1786802004417.jpg';

interface LandingScreenProps {
  setCurrentScreen: (screen: ScreenId) => void;
}

export function LandingScreen({ setCurrentScreen }: LandingScreenProps) {
  const [timeLeft, setTimeLeft] = useState(3);

  useEffect(() => {
    if (timeLeft <= 0) {
      setCurrentScreen('LOGIN');
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, setCurrentScreen]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setCurrentScreen('LOGIN')}
      className="w-full flex-1 min-h-[85vh] bg-gradient-to-b from-[#0F0830] via-[#170E4A] to-[#27187D] flex flex-col justify-center items-center relative overflow-hidden px-4 py-8 select-none cursor-pointer"
    >
      {/* Full-Screen Water Caustics & Glow Orbs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.4, 1],
          opacity: [0.4, 0.8, 0.4],
          y: [0, -35, 0]
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-x-0 -top-20 mx-auto w-[700px] h-[450px] bg-sky-400/35 rounded-full blur-3xl pointer-events-none z-0"
      />
      
      <motion.div 
        animate={{ 
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.7, 0.3],
          rotate: [0, 180, 360]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-10 -right-10 w-[500px] h-[500px] bg-teal-400/35 rounded-full blur-3xl pointer-events-none z-0"
      />

      <motion.div 
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
          x: [0, -40, 0]
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-10 -left-10 w-[450px] h-[450px] bg-indigo-500/35 rounded-full blur-3xl pointer-events-none z-0"
      />

      {/* Underwater Caustic Light Rays Overlay */}
      <motion.div 
        animate={{ opacity: [0.3, 0.6, 0.3], rotate: [-3, 3, -3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-300/35 via-transparent to-transparent pointer-events-none z-0"
      />

      {/* Vibrant Full-Screen Floating Animated Bubbles */}
      {[...Array(18)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: 500, opacity: 0, x: (i % 8) * 60 - 210 }}
          animate={{ 
            y: [-30, -750],
            opacity: [0, 0.95, 0],
            x: [(i % 8) * 60 - 210, (i % 8) * 60 - 180, (i % 8) * 60 - 240]
          }}
          transition={{ 
            duration: 3.5 + (i % 5) * 1.2, 
            repeat: Infinity, 
            delay: i * 0.2,
            ease: "easeOut" 
          }}
          className="absolute bottom-0 w-3 h-3 md:w-5 md:h-5 rounded-full border border-sky-200/80 bg-sky-300/40 backdrop-blur-xs pointer-events-none z-0 shadow-xs shadow-sky-300/60"
        />
      ))}

      {/* Animated Full-Width Water Waves Layer */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-0 overflow-hidden h-40 opacity-40">
        <motion.svg 
          animate={{ x: [0, -120, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="w-[125%] h-full text-sky-400 fill-current -ml-[12%]" 
          viewBox="0 0 1440 320" 
          preserveAspectRatio="none"
        >
          <path d="M0,192L48,197.3C96,203,192,213,288,192C384,171,480,117,576,112C672,107,768,149,864,176C960,203,1056,213,1152,197.3C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </motion.svg>
      </div>

      {/* Single Unified Dead-Centered Content Stack */}
      <div className="flex flex-col justify-center items-center text-center max-w-md w-full z-10 px-4 my-auto">
        {/* Top Header Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/25 shadow-md backdrop-blur-md mb-6 whitespace-nowrap"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#00C48C] animate-pulse shadow-xs shadow-[#00C48C]" />
          <span className="text-xs font-semibold text-white tracking-wide flex items-center gap-1.5">
            Digital Payment System <Sparkles size={13} className="text-sky-300" />
          </span>
        </motion.div>

        {/* Animated Submersion Logo Box */}
        <div className="relative mb-6">
          {/* Water Submersion Liquid Ripple Rings */}
          <motion.div 
            animate={{ 
              scale: [0.85, 1.45, 0.85], 
              opacity: [0.7, 0.1, 0.7] 
            }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -inset-5 rounded-3xl border-2 border-sky-300/50 pointer-events-none"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1], 
              opacity: [0.5, 0.9, 0.5] 
            }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -inset-3 rounded-3xl bg-sky-400/35 blur-xl pointer-events-none"
          />

          {/* Clean Submerged Logo Container */}
          <motion.div 
            initial={{ scale: 0.5, opacity: 0, y: 40 }}
            animate={{ 
              scale: 1, 
              opacity: 1, 
              y: [0, -10, 0],
              rotate: [0, 1.5, -1.5, 0]
            }}
            transition={{ 
              scale: { duration: 0.8, type: "spring", stiffness: 90 },
              opacity: { duration: 0.8 },
              y: { duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.6 },
              rotate: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.6 }
            }}
            className="w-28 h-28 md:w-32 md:h-32 bg-[#27187D] rounded-3xl flex justify-center items-center shadow-2xl shadow-sky-950/80 relative border-2 border-white/40 backdrop-blur-md overflow-hidden p-1.5 group cursor-pointer"
          >
            {/* Water Flow Shimmer Overlay */}
            <motion.div 
              animate={{ y: ['100%', '-100%'] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-t from-sky-400/40 via-transparent to-white/30 pointer-events-none z-20"
            />
            
            <img 
              src={unipayLogo} 
              alt="UniPay Logo" 
              className="w-full h-full object-cover rounded-2xl relative z-10"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </div>

        {/* Platform Name */}
        <motion.h1 
          initial={{ opacity: 0, y: 25, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-3 drop-shadow-md"
        >
          Uni<span className="text-[#00C48C]">Pay</span>
        </motion.h1>

        {/* Tagline Description */}
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-base text-sky-100/90 leading-relaxed px-2 font-medium mb-6"
        >
          UniPay seamless digital payment for campus lifestyle
        </motion.p>

        {/* Bottom Security Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs text-sky-200/90 font-medium whitespace-nowrap shadow-xs backdrop-blur-xs"
        >
          <ShieldCheck size={14} className="text-[#00C48C]" />
          <span>256-bit Bank Grade Security • UniPay Platform</span>
        </motion.div>
      </div>
    </motion.div>
  );
}

