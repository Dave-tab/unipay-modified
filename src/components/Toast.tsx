import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X, ShieldCheck, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { formatCurrency } from '../data';

export interface ToastMessage {
  id: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  amount?: number;
  txType?: 'debit' | 'credit';
  merchant?: string;
  category?: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4 pointer-events-none flex flex-col gap-2.5">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const isSuccess = toast.type === 'success' || !toast.type;
  const isError = toast.type === 'error';
  const isWarning = toast.type === 'warning';

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className="pointer-events-auto w-full bg-[#1A1054]/95 text-white backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-white/20 relative overflow-hidden flex items-start gap-3"
    >
      {/* Dynamic Glow Line */}
      <div 
        className={`absolute top-0 left-0 right-0 h-1 ${
          isError ? 'bg-rose-500' : isWarning ? 'bg-amber-400' : 'bg-[#00C48C]'
        }`} 
      />

      {/* Icon */}
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
        isError ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
        isWarning ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' :
        'bg-[#00C48C]/20 text-[#00C48C] border border-[#00C48C]/30'
      }`}>
        {isError ? <AlertCircle size={20} /> :
         isWarning ? <AlertCircle size={20} /> :
         isSuccess ? <CheckCircle2 size={20} /> : <Info size={20} />}
      </div>

      {/* Content */}
      <div className="flex-1 pr-6">
        <div className="flex items-center gap-2 mb-0.5">
          <h4 className="text-sm font-bold text-white tracking-tight">{toast.title}</h4>
          {toast.amount !== undefined && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
              toast.txType === 'credit' 
                ? 'bg-[#00C48C]/20 text-[#00C48C] border border-[#00C48C]/40' 
                : 'bg-white/10 text-white/90 border border-white/20'
            }`}>
              {toast.txType === 'credit' ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
              {formatCurrency(toast.amount)}
            </span>
          )}
        </div>
        <p className="text-xs text-sky-100/80 leading-snug">{toast.message}</p>
        
        {toast.merchant && (
          <div className="mt-1.5 flex items-center gap-2 text-[10px] text-sky-200/60 font-mono">
            <span>{toast.merchant}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-[#00C48C]"><ShieldCheck size={11} /> Verified</span>
          </div>
        )}
      </div>

      {/* Close Button */}
      <button 
        onClick={() => onDismiss(toast.id)}
        className="absolute top-3.5 right-3 text-white/50 hover:text-white transition-colors p-1 rounded-lg"
      >
        <X size={16} />
      </button>

      {/* Animated Bottom Timer Bar */}
      <motion.div
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: 4, ease: 'linear' }}
        className={`absolute bottom-0 left-0 h-0.5 ${
          isError ? 'bg-rose-500/60' : isWarning ? 'bg-amber-400/60' : 'bg-[#00C48C]/60'
        }`}
      />
    </motion.div>
  );
}
