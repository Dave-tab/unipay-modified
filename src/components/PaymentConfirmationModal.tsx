import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, ArrowRight, X, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import { formatCurrency } from '../data';

interface PaymentConfirmationModalProps {
  isOpen: boolean;
  amount: number;
  title: string;
  subtitle?: string;
  expectedPin: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function PaymentConfirmationModal({
  isOpen,
  amount,
  title,
  subtitle,
  expectedPin,
  onConfirm,
  onCancel
}: PaymentConfirmationModalProps) {
  const [step, setStep] = useState<'CONFIRM' | 'PIN' | 'SUCCESS'>('CONFIRM');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handlePinInput = (digit: string) => {
    if (pin.length < 4 && !isVerifying) {
      const newPin = pin + digit;
      setPin(newPin);
      setError('');
      
      if (newPin.length === 4) {
        // Trigger verification
        verifyPin(newPin);
      }
    }
  };

  const handleDelete = () => {
    if (!isVerifying) {
      setPin(prev => prev.slice(0, -1));
      setError('');
    }
  };

  const verifyPin = (enteredPin: string) => {
    setIsVerifying(true);
    setTimeout(() => {
      if (enteredPin === expectedPin) {
        setStep('SUCCESS');
        setTimeout(() => {
          onConfirm();
          // Reset state after closing
          setTimeout(() => {
            setStep('CONFIRM');
            setPin('');
            setError('');
            setIsVerifying(false);
          }, 300);
        }, 600);
      } else {
        setIsVerifying(false);
        setError('Incorrect PIN. Default PIN is 1234.');
        setPin('');
      }
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6 bg-black/70 backdrop-blur-sm overflow-y-auto"
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: -10 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-surface w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-border flex flex-col my-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-bg/60 shrink-0">
            <div className="flex items-center gap-2 text-text-primary">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight text-text-primary">Authorize Payment</h3>
                <span className="text-[10px] text-text-secondary">UniPay Secure Gateway</span>
              </div>
            </div>
            <button 
              onClick={onCancel}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-surface hover:bg-border transition-colors text-text-secondary cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-5 sm:p-6">
            <AnimatePresence mode="wait">
              {step === 'CONFIRM' ? (
                <motion.div 
                  key="confirm"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  className="flex flex-col items-center text-center"
                >
                  <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                    Amount to Pay
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black text-text-primary tracking-tight font-mono mb-4 text-primary">
                    {formatCurrency(amount)}
                  </h2>
                  
                  <div className="w-full bg-bg rounded-2xl p-4 border border-border mb-5 text-left">
                    <p className="text-[11px] text-text-secondary mb-0.5 font-medium">Service / Beneficiary</p>
                    <p className="font-bold text-text-primary text-sm line-clamp-2">{title}</p>
                    {subtitle && <p className="text-[11px] text-text-secondary mt-1">{subtitle}</p>}
                  </div>

                  {/* Prominent Action Button - Shifted up for full visibility */}
                  <div className="w-full space-y-2">
                    <button 
                      onClick={() => setStep('PIN')}
                      className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-3.5 px-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-sm cursor-pointer active:scale-[0.98]"
                    >
                      <span>Proceed to Enter PIN</span>
                      <ArrowRight size={16} />
                    </button>
                    
                    <button 
                      onClick={onCancel}
                      className="w-full py-2 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                    >
                      Cancel Transaction
                    </button>
                  </div>
                </motion.div>
              ) : step === 'PIN' ? (
                <motion.div 
                  key="pin"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  className="flex flex-col items-center"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-text-primary mb-1">
                    <Lock size={14} className="text-primary" />
                    <span>Enter 4-Digit Security PIN</span>
                  </div>
                  <p className="text-[11px] text-text-secondary mb-4 text-center">
                    Authorizing payment of <strong className="text-text-primary font-mono">{formatCurrency(amount)}</strong>
                  </p>

                  {/* PIN Dots Display */}
                  <div className="flex gap-3 mb-3 justify-center">
                    {[0, 1, 2, 3].map((i) => (
                      <div 
                        key={i}
                        className={`w-11 h-12 rounded-xl border-2 flex items-center justify-center text-2xl font-black transition-all ${
                          pin.length > i 
                            ? 'border-primary bg-primary/10 text-primary shadow-xs' 
                            : pin.length === i 
                              ? 'border-primary ring-2 ring-primary/20 bg-bg animate-pulse' 
                              : 'border-border bg-bg text-transparent'
                        }`}
                      >
                        {pin.length > i ? '•' : ''}
                      </div>
                    ))}
                  </div>

                  {error ? (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-1.5 text-danger text-xs font-bold mb-3 bg-danger/10 px-3 py-1.5 rounded-xl text-center"
                    >
                      <AlertCircle size={14} className="shrink-0" /> 
                      <span>{error}</span>
                    </motion.div>
                  ) : (
                    <p className="text-[10px] text-text-secondary mb-3">Default student demo PIN: <span className="font-mono font-bold text-primary">1234</span></p>
                  )}

                  {/* Numeric Keypad */}
                  <div className="grid grid-cols-3 gap-1.5 w-full max-w-[230px] mx-auto mb-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                      <button
                        key={num}
                        disabled={isVerifying}
                        onClick={() => handlePinInput(num.toString())}
                        className="h-11 rounded-xl bg-bg hover:bg-border text-text-primary font-bold text-lg flex items-center justify-center transition-colors active:scale-95 cursor-pointer disabled:opacity-50"
                      >
                        {num}
                      </button>
                    ))}
                    <button
                      onClick={() => setStep('CONFIRM')}
                      className="h-11 rounded-xl bg-bg hover:bg-border text-text-secondary font-bold text-xs flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      disabled={isVerifying}
                      onClick={() => handlePinInput('0')}
                      className="h-11 rounded-xl bg-bg hover:bg-border text-text-primary font-bold text-lg flex items-center justify-center transition-colors active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      0
                    </button>
                    <button
                      disabled={isVerifying}
                      onClick={handleDelete}
                      className="h-11 rounded-xl bg-bg hover:bg-border text-text-secondary font-bold text-xs flex items-center justify-center transition-colors active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      Del
                    </button>
                  </div>

                  {/* Manual Confirmation Button if user filled 4 digits */}
                  {pin.length === 4 && (
                    <button
                      disabled={isVerifying}
                      onClick={() => verifyPin(pin)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-1"
                    >
                      {isVerifying ? (
                        <span>Verifying Security PIN...</span>
                      ) : (
                        <>
                          <ShieldCheck size={16} />
                          <span>Confirm Payment ({formatCurrency(amount)})</span>
                        </>
                      )}
                    </button>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-4 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-3">
                    <CheckCircle2 size={36} className="animate-bounce" />
                  </div>
                  <h3 className="text-lg font-black text-text-primary mb-1">Payment Confirmed!</h3>
                  <p className="text-xs text-text-secondary">Generating transaction receipt & settlement...</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
