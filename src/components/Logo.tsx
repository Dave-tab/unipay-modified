import React, { useState } from 'react';
import unipayLogo from '../assets/images/unipay_logo_1786802004417.jpg';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  lightText?: boolean;
}

export function Logo({ className = '', size = 'md', showText = true, lightText = false }: LogoProps) {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12'
  };

  const textClasses = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className={`${sizeClasses[size]} rounded-xl overflow-hidden shadow-xs border border-primary/20 shrink-0 bg-[#27187D] flex items-center justify-center p-0.5 relative`}>
        {!imgError ? (
          <img 
            src={unipayLogo} 
            alt="UniPay Logo" 
            className="w-full h-full object-cover rounded-lg"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-[#27187D] text-[#00C48C] font-black flex items-center justify-center text-xs">
            U<span className="text-white">P</span>
          </div>
        )}
      </div>
      {showText && (
        <span className={`font-bold tracking-tight ${textClasses[size]} ${lightText ? 'text-white' : 'text-[#27187D]'}`}>
          Uni<span className="text-[#00C48C]">Pay</span>
        </span>
      )}
    </div>
  );
}
