import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, KeyRound, Lock, ArrowRight, CheckCircle2, X, AlertCircle, Sparkles } from 'lucide-react';

interface SecuritySetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (loginPassword: string, transactionPin: string) => void;
  initialStep?: 'LOGIN_PASSWORD' | 'TRANSACTION_PIN';
  title?: string;
  subtitle?: string;
}

export function SecuritySetupModal({
  isOpen,
  onClose,
  onComplete,
  initialStep = 'LOGIN_PASSWORD',
  title,
  subtitle
}: SecuritySetupModalProps) {
  const [step, setStep] = useState<'LOGIN_PASSWORD' | 'TRANSACTION_PIN' | 'DONE'>(initialStep);
  
  // Step 1: 6-digit Login Password
  const [loginPass, setLoginPass] = useState('');
  const [confirmLoginPass, setConfirmLoginPass] = useState('');
  
  // Step 2: 4-digit Transaction PIN
  const [transPin, setTransPin] = useState('');
  const [confirmTransPin, setConfirmTransPin] = useState('');
  
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleNextToTransactionPin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    // Validate 6 digits
    if (!/^\d{6}$/.test(loginPass)) {
      setError('Login password must be exactly 6 numerical digits (e.g. 123456).');
      return;
    }

    if (loginPass !== confirmLoginPass) {
      setError('6-digit login passwords do not match. Please re-type.');
      return;
    }

    // Advance to step 2: 4-digit transaction password
    setStep('TRANSACTION_PIN');
  };

  const handleFinishSetup = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    // Validate 4 digits
    if (!/^\d{4}$/.test(transPin)) {
      setError('Transaction password must be exactly 4 numerical digits (e.g. 1234).');
      return;
    }

    if (transPin !== confirmTransPin) {
      setError('4-digit transaction PINs do not match. Please re-type.');
      return;
    }

    setStep('DONE');
    setTimeout(() => {
      onComplete(loginPass, transPin);
    }, 1000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-surface w-full max-w-md rounded-3xl p-6 border border-border shadow-2xl relative text-text-primary my-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                {step === 'LOGIN_PASSWORD' ? <KeyRound size={20} /> : <Lock size={20} />}
              </div>
              <div>
                <h3 className="text-base font-extrabold text-text-primary">
                  {title || 'Security Credential Setup'}
                </h3>
                <p className="text-[11px] text-text-secondary">
                  {subtitle || 'Required before authorizing campus wallet transactions'}
                </p>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-bg hover:bg-border border border-border flex items-center justify-center text-text-secondary transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Stepper Indicator */}
          <div className="flex items-center justify-between mb-5 bg-bg p-2 rounded-2xl border border-border">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                step === 'LOGIN_PASSWORD' ? 'bg-primary text-white' : 'bg-emerald-500 text-white'
              }`}>
                {step === 'LOGIN_PASSWORD' ? '1' : '✓'}
              </div>
              <span className={`text-xs font-bold ${step === 'LOGIN_PASSWORD' ? 'text-primary' : 'text-text-primary'}`}>
                1. Login Password (6 Digits)
              </span>
            </div>

            <div className="w-6 h-0.5 bg-border mx-1" />

            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                step === 'TRANSACTION_PIN' 
                  ? 'bg-primary text-white' 
                  : step === 'DONE' 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-border text-text-secondary'
              }`}>
                {step === 'DONE' ? '✓' : '2'}
              </div>
              <span className={`text-xs font-bold ${
                step === 'TRANSACTION_PIN' ? 'text-primary' : step === 'DONE' ? 'text-text-primary' : 'text-text-secondary'
              }`}>
                2. Transaction PIN (4 Digits)
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-semibold flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: CREATE 6-DIGIT LOGIN PASSWORD */}
          {step === 'LOGIN_PASSWORD' && (
            <form onSubmit={handleNextToTransactionPin} className="space-y-4">
              <div className="p-3.5 bg-primary/5 border border-primary/20 rounded-2xl">
                <p className="text-xs font-bold text-text-primary mb-1 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-primary" /> Step 1: Create 6-Digit Login Password
                </p>
                <p className="text-[11px] text-text-secondary leading-relaxed">
                  Even when signed in via Google, a <strong>6-digit login password</strong> allows you to log into your account directly anytime without forgetting it.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">
                  Enter 6-Digit Login Password
                </label>
                <input 
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • • (6 Digits)"
                  className="w-full bg-bg border border-border rounded-xl px-4 py-3.5 text-center text-lg font-mono tracking-widest text-text-primary focus:outline-none focus:border-primary"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">
                  Confirm 6-Digit Login Password
                </label>
                <input 
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={confirmLoginPass}
                  onChange={(e) => setConfirmLoginPass(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • • (Confirm 6 Digits)"
                  className="w-full bg-bg border border-border rounded-xl px-4 py-3.5 text-center text-lg font-mono tracking-widest text-text-primary focus:outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                disabled={loginPass.length !== 6 || confirmLoginPass.length !== 6}
                className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-3.5 px-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50 mt-2"
              >
                <span>Continue to Step 2: Transaction PIN</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* STEP 2: CREATE 4-DIGIT TRANSACTION PIN */}
          {step === 'TRANSACTION_PIN' && (
            <form onSubmit={handleFinishSetup} className="space-y-4">
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1 flex items-center gap-1.5">
                  <ShieldCheck size={14} /> Step 2: Create 4-Digit Transaction Password
                </p>
                <p className="text-[11px] text-text-secondary leading-relaxed">
                  Your <strong>4-digit Transaction PIN</strong> is separate from your login password and is strictly required to authorize wallet debits, meals, transport, and tuition payments.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">
                  Enter 4-Digit Transaction PIN
                </label>
                <input 
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={transPin}
                  onChange={(e) => setTransPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • (4 Digits)"
                  className="w-full bg-bg border border-border rounded-xl px-4 py-3.5 text-center text-xl font-mono tracking-widest text-text-primary focus:outline-none focus:border-primary"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">
                  Confirm 4-Digit Transaction PIN
                </label>
                <input 
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={confirmTransPin}
                  onChange={(e) => setConfirmTransPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • (Confirm 4 Digits)"
                  className="w-full bg-bg border border-border rounded-xl px-4 py-3.5 text-center text-xl font-mono tracking-widest text-text-primary focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setError(null); setStep('LOGIN_PASSWORD'); }}
                  className="flex-1 py-3.5 rounded-2xl border border-border font-bold text-xs hover:bg-bg cursor-pointer transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={transPin.length !== 4 || confirmTransPin.length !== 4}
                  className="flex-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50"
                >
                  <span>Complete Setup & Proceed</span>
                  <CheckCircle2 size={16} />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: SUCCESS CELEBRATION */}
          {step === 'DONE' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 flex flex-col items-center justify-center text-center space-y-3"
            >
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 size={36} />
              </div>
              <h4 className="text-base font-extrabold text-text-primary">
                Security Passwords Activated!
              </h4>
              <p className="text-xs text-text-secondary max-w-xs">
                Your 6-digit login password and 4-digit transaction PIN have been configured. You can now execute campus payments securely.
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
