import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, ShieldCheck, Lock, Unlock, QrCode, RotateCw, 
  Building2, GraduationCap, Store, UserCheck, Calendar,
  Sparkles, CheckCircle2, Copy, Check
} from 'lucide-react';
import { UserProfile } from '../types';
import { Avatar } from './Avatar';

interface DigitalIdModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  isLocked?: boolean;
  onToggleLock?: () => void;
}

export function DigitalIdModal({ isOpen, onClose, user, isLocked = false, onToggleLock }: DigitalIdModalProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const role = user.role || 'STUDENT';
  const institutionName = user.institution || user.school || 'University of Lagos (UNILAG)';
  const userLevel = user.level || (user.department && user.department.includes('•') ? user.department.split('•')[1].trim() : '300 Level');
  const userDepartment = user.department && user.department.includes('•') ? user.department.split('•')[0].trim() : (user.department || (role === 'MERCHANT' ? (user.category || 'Campus Vendor') : 'General Studies'));
  const userDisplayId = user.studentId || user.wardId || user.id || '24-00192';

  const handleCopyId = () => {
    navigator.clipboard.writeText(userDisplayId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getGradientByRole = () => {
    if (role === 'STUDENT') return 'from-[#27187D] via-[#3b28b4] to-[#160c4d]';
    if (role === 'PARENT') return 'from-[#065f46] via-[#047857] to-[#022c22]';
    return 'from-[#0f766e] via-[#0d9488] to-[#134e4a]';
  };

  const qrData = `unipay://verify/${role.toLowerCase()}/${encodeURIComponent(userDisplayId)}?name=${encodeURIComponent(user.name)}&inst=${encodeURIComponent(institutionName)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
      />

      {/* Modal Card */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative z-10 w-full max-w-md bg-surface rounded-3xl shadow-2xl border border-border overflow-hidden flex flex-col"
      >
        {/* Header Controls */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-bg">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-primary" />
            <h3 className="text-sm font-bold text-text-primary">Official Campus Digital Identity</h3>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-text-secondary hover:text-text-primary transition cursor-pointer"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Card Canvas Area */}
        <div className="p-5 sm:p-6 bg-bg flex flex-col items-center">
          <div className="w-full relative [perspective:1000px]">
            {/* The Flippable ID Card Container */}
            <motion.div 
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
              className="w-full relative [transform-style:preserve-3d]"
            >
              {/* FRONT OF CARD */}
              <div 
                className={`w-full rounded-3xl p-5 sm:p-6 text-white shadow-xl bg-gradient-to-br ${getGradientByRole()} relative overflow-hidden [backface-visibility:hidden] min-h-[250px] flex flex-col justify-between border border-white/20`}
              >
                {/* Holographic glowing orb background */}
                <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute left-1/4 -top-8 w-32 h-32 bg-accent/20 rounded-full blur-xl pointer-events-none" />

                {/* Top Row: Institution + Level/Category */}
                <div className="flex items-start justify-between gap-2 relative z-10">
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-white/75 block truncate font-bold">
                      {institutionName}
                    </span>
                    <span className="text-xs font-semibold text-white/90 truncate block mt-0.5">
                      {role === 'STUDENT' ? userDepartment : role === 'PARENT' ? 'Guardian Identity' : (user.businessName || 'Merchant Terminal')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-extrabold bg-white/20 border border-white/30 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                      {role === 'STUDENT' ? userLevel : role === 'PARENT' ? 'GUARDIAN' : 'MERCHANT'}
                    </span>
                  </div>
                </div>

                {/* Middle Row: Photo + Name + ID */}
                <div className="flex items-center gap-4 my-4 relative z-10">
                  <Avatar 
                    src={user.avatar} 
                    name={user.name} 
                    role={role} 
                    size="lg" 
                    className="border-2 border-white/70 shadow-md shrink-0 ring-2 ring-white/20" 
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-base sm:text-lg font-black tracking-tight text-white truncate leading-snug">
                      {user.name}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-mono font-bold text-emerald-300 bg-black/30 px-2 py-0.5 rounded-md border border-white/10">
                        {role === 'STUDENT' ? 'ID: ' : role === 'PARENT' ? 'ACC: ' : 'MID: '}{userDisplayId}
                      </span>
                    </div>
                    {user.phone && (
                      <p className="text-[10px] text-white/70 font-mono mt-1 truncate">
                        📞 {user.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom Row: Security Watermark + Chip */}
                <div className="pt-3 border-t border-white/20 flex items-center justify-between text-[10px] font-mono text-white/80 relative z-10">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>NFC SMART PASS • VERIFIED</span>
                  </div>
                  <span className="font-bold text-white/90">VALID 2026/2027</span>
                </div>
              </div>

              {/* BACK OF CARD (QR & Verification Barcode) */}
              <div 
                className={`w-full rounded-3xl p-5 sm:p-6 text-white shadow-xl bg-gradient-to-br ${getGradientByRole()} absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden] flex flex-col justify-between border border-white/20 overflow-hidden`}
              >
                <div className="flex items-center justify-between border-b border-white/20 pb-2">
                  <span className="text-[10px] font-mono tracking-wider uppercase text-white/80">
                    Security Gate & Terminal Verification
                  </span>
                  <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-md">
                    256-BIT ENCRYPTED
                  </span>
                </div>

                <div className="flex items-center justify-center gap-4 my-2">
                  {/* QR Code */}
                  <div className="bg-white p-2 rounded-2xl shadow-md shrink-0">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(qrData)}`}
                      alt="Verification QR"
                      className="w-24 h-24 object-contain"
                    />
                  </div>

                  {/* Identification Meta */}
                  <div className="min-w-0 text-left space-y-1.5">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-white/60 block">Identifier</span>
                      <span className="text-xs font-mono font-bold text-emerald-300">{userDisplayId}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-white/60 block">Issued To</span>
                      <span className="text-xs font-bold text-white truncate block">{user.name}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-white/60 block">Status</span>
                      <span className="text-[10px] font-extrabold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 size={11} /> {isLocked ? 'LOCKED TEMPORARILY' : 'ACTIVE & AUTHENTICATED'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Simulated Barcode at bottom */}
                <div className="bg-white/10 rounded-xl p-2 text-center border border-white/20">
                  <div className="h-6 flex items-center justify-center gap-1 overflow-hidden opacity-80">
                    {Array.from({ length: 36 }).map((_, idx) => (
                      <div 
                        key={idx} 
                        className="h-full bg-white" 
                        style={{ width: (idx % 3 === 0 ? 3 : idx % 2 === 0 ? 2 : 1) + 'px' }} 
                      />
                    ))}
                  </div>
                  <span className="text-[9px] font-mono tracking-widest text-white/80 block mt-1">
                    {userDisplayId.replace(/[^a-zA-Z0-9]/g, '')} • UNIPAY CAMPUS AUTH
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Action Toolbar below card */}
          <div className="w-full grid grid-cols-3 gap-2 mt-5">
            <button 
              onClick={() => setIsFlipped(!isFlipped)}
              className="py-2.5 px-3 bg-surface hover:bg-border/40 border border-border rounded-2xl text-xs font-bold text-text-primary transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <RotateCw size={14} className="text-primary" />
              <span>{isFlipped ? 'Show Front' : 'Flip to QR'}</span>
            </button>

            <button 
              onClick={handleCopyId}
              className="py-2.5 px-3 bg-surface hover:bg-border/40 border border-border rounded-2xl text-xs font-bold text-text-primary transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="text-text-secondary" />}
              <span>{copied ? 'Copied!' : 'Copy ID'}</span>
            </button>

            {onToggleLock && (
              <button 
                onClick={onToggleLock}
                className={`py-2.5 px-3 border rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                  isLocked 
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20' 
                    : 'bg-danger/10 text-danger border-danger/30 hover:bg-danger/20'
                }`}
              >
                {isLocked ? <Unlock size={14} /> : <Lock size={14} />}
                <span>{isLocked ? 'Unlock' : 'Lock'}</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
