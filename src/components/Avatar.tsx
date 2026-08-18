import React, { useState } from 'react';
import { User, Users, Store, Shield } from 'lucide-react';
import { UserRole } from '../types';

interface AvatarProps {
  src?: string | null;
  name?: string;
  role?: UserRole | string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  alt?: string;
}

const SIZE_MAP = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg font-bold',
  '2xl': 'w-20 h-20 text-xl font-bold',
};

const ICON_SIZE_MAP = {
  xs: 12,
  sm: 15,
  md: 18,
  lg: 22,
  xl: 28,
  '2xl': 34,
};

// Generates consistent pastel background from name
function getBgColor(name: string = '', role?: string) {
  if (role === 'MERCHANT') return 'bg-amber-600 text-white';
  if (role === 'PARENT') return 'bg-emerald-600 text-white';
  if (role === 'STUDENT') return 'bg-indigo-600 text-white';
  
  const colors = [
    'bg-indigo-600 text-white',
    'bg-emerald-600 text-white',
    'bg-sky-600 text-white',
    'bg-violet-600 text-white',
    'bg-rose-600 text-white',
    'bg-amber-600 text-white',
    'bg-teal-600 text-white',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name: string = ''): string {
  if (!name.trim()) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({
  src,
  name = 'User',
  role,
  size = 'md',
  className = '',
  alt
}: AvatarProps) {
  const [hasError, setHasError] = useState(false);

  const sizeClass = SIZE_MAP[size] || SIZE_MAP.md;
  const iconSize = ICON_SIZE_MAP[size] || 18;
  const colorClass = getBgColor(name, role);
  const initials = getInitials(name);

  // If no source or error occurred, render styled fallback avatar
  if (!src || hasError) {
    return (
      <div 
        className={`${sizeClass} ${colorClass} rounded-full flex items-center justify-center font-bold select-none shrink-0 shadow-xs border border-white/20 uppercase ${className}`}
        title={name}
      >
        {initials || (
          role === 'MERCHANT' ? <Store size={iconSize} /> :
          role === 'PARENT' ? <Users size={iconSize} /> :
          <User size={iconSize} />
        )}
      </div>
    );
  }

  return (
    <div className={`${sizeClass} rounded-full overflow-hidden shrink-0 relative bg-slate-200 dark:bg-slate-800 ${className}`}>
      <img
        src={src}
        alt={alt || name}
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
        loading="lazy"
        onError={() => setHasError(true)}
      />
    </div>
  );
}

// Reliable, non-broken avatar generator URLs
export function getReliableAvatar(seed: string, type: 'student' | 'parent' | 'merchant' = 'student'): string {
  const cleanSeed = encodeURIComponent(seed || 'UniPay');
  if (type === 'merchant') {
    return `https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=150&auto=format&fit=crop&q=80`;
  }
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
}
