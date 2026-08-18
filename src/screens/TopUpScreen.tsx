import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, CreditCard, Landmark, Store, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { ScreenId, UserContextType } from '../types';
import { formatCurrency } from '../data';

interface TopUpScreenProps {
  ctx: UserContextType;
  setCurrentScreen: (screen: ScreenId) => void;
}

const AMOUNTS = [500, 1000, 2500, 5000];

export function TopUpScreen({ ctx, setCurrentScreen }: TopUpScreenProps) {
  const [amount, setAmount] = useState<number>(1000);
  const [method, setMethod] = useState<'CARD' | 'BANK' | 'KIOSK'>('CARD');
  const [status, setStatus] = useState<'INPUT' | 'POLLING' | 'SUCCESS'>('INPUT');

  const handleTopUp = () => {
    setStatus('POLLING');
    setTimeout(() => {
      const newTx = {
        id: Math.random().toString().slice(2, 8),
        category: 'Top-up' as const,
        merchant: method === 'CARD' ? 'Card Deposit' : method === 'BANK' ? 'Bank Transfer' : 'Campus Kiosk',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        amount: amount,
        type: 'credit' as const,
        date: 'Today',
      };
      ctx.addTransaction(newTx);
      setStatus('SUCCESS');
    }, 2500);
  };

  if (status === 'POLLING' || status === 'SUCCESS') {
    return (
      <div className="flex flex-col h-full bg-surface items-center justify-center p-6">
         <AnimatePresence mode="wait">
           {status === 'POLLING' ? (
             <motion.div 
               key="polling"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="flex flex-col items-center"
             >
               <div className="w-16 h-16 border-4 border-bg border-t-primary rounded-full animate-spin mb-6"></div>
               <h2 className="text-xl font-bold text-text-primary mb-2">Confirming payment...</h2>
               <p className="text-text-secondary text-sm text-center">Please wait while we securely process your transaction.</p>
             </motion.div>
           ) : (
             <motion.div 
               key="success"
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="flex flex-col items-center w-full"
             >
               <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mb-6">
                 <CheckCircle2 size={40} className="text-accent" />
               </div>
               <h2 className="text-2xl font-bold text-text-primary mb-2">Top-up Successful!</h2>
               <p className="text-text-secondary mb-8">Your wallet has been credited securely.</p>
               
               <div className="bg-bg w-full rounded-2xl p-6 mb-8 border border-border text-center">
                 <p className="text-sm text-text-secondary mb-1">New Balance</p>
                 <h3 className="text-3xl font-bold text-text-primary">{formatCurrency(ctx.balance)}</h3>
               </div>

               <button 
                 onClick={() => setCurrentScreen('HOME')}
                 className="w-full bg-primary text-white py-4 rounded-xl font-semibold hover:opacity-90 transition"
               >
                 Done
               </button>
             </motion.div>
           )}
         </AnimatePresence>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="flex flex-col w-full bg-bg z-40 relative pb-24"
    >
      <div className="bg-surface px-6 pt-8 pb-4 flex items-center shadow-xs">
        <button onClick={() => setCurrentScreen('HOME')} className="w-10 h-10 flex items-center justify-center rounded-full bg-bg -ml-2 mr-2 cursor-pointer hover:bg-border/50 transition">
           <ChevronLeft size={24} className="text-text-primary" />
        </button>
        <h2 className="text-lg font-bold text-text-primary flex-1">Top-up Wallet</h2>
      </div>

      <div className="flex-1 px-6 py-6 pb-12">
        <div className="bg-surface p-6 rounded-3xl border border-border shadow-sm mb-6 pb-8">
           <label className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-4 block">Amount to Add</label>
           
           <div className="flex items-center gap-1 border-b-2 border-primary pb-2 mb-6">
             <span className="text-2xl font-medium text-text-secondary">₦</span>
             <input 
               type="number" 
               value={amount || ''}
               onChange={(e) => setAmount(Number(e.target.value))}
               className="text-4xl font-bold text-text-primary bg-transparent outline-none w-full"
               placeholder="0"
             />
           </div>

           <div className="grid grid-cols-2 gap-2 w-full">
             {AMOUNTS.map(amt => (
               <button 
                 key={amt}
                 onClick={() => setAmount(amt)}
                 className={`py-3 rounded-xl border text-xs font-bold transition-colors w-full ${amount === amt ? 'bg-primary/5 text-primary border-primary border-2' : 'bg-surface text-text-primary border-border hover:border-gray-300'}`}
               >
                 ₦{amt.toLocaleString()}
               </button>
             ))}
             <button 
               onClick={() => setAmount(0)}
               className={`py-3 rounded-xl border text-xs font-bold transition-colors w-full ${!AMOUNTS.includes(amount) && amount > 0 ? 'bg-primary/5 text-primary border-primary border-2' : 'bg-surface text-text-primary border-border hover:border-gray-300'}`}
             >
               Custom
             </button>
           </div>
        </div>

        <h3 className="text-sm font-bold text-text-primary mb-3 pl-2">Payment Method</h3>
        <div className="space-y-3 mb-8">
           <MethodCard 
             icon={<CreditCard />} title="Bank Card" subtitle="Visa, Mastercard, Verve" 
             selected={method === 'CARD'} onClick={() => setMethod('CARD')} 
           />
           <MethodCard 
             icon={<Landmark />} title="Bank Transfer" subtitle="Virtual Account" 
             selected={method === 'BANK'} onClick={() => setMethod('BANK')} 
           />
           <MethodCard 
             icon={<Store />} title="Campus Kiosk" subtitle="Pay with Cash" 
             selected={method === 'KIOSK'} onClick={() => setMethod('KIOSK')} 
           />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-surface border-t border-border p-6 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
        <button 
          onClick={handleTopUp}
          disabled={amount <= 0}
          className="w-full bg-primary text-white py-4 rounded-xl font-bold shadow-md hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed mb-3"
        >
          Add {formatCurrency(amount || 0)}
        </button>
        <div className="flex items-center justify-center gap-2 text-xs text-text-secondary">
          <ShieldCheck size={14} className="text-accent" />
          <span>256-bit encrypted · PCI-DSS compliant</span>
        </div>
      </div>
    </motion.div>
  );
}

function MethodCard({ icon, title, subtitle, selected, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full p-3 rounded-xl flex items-center gap-3 border transition-colors ${selected ? 'border-primary border-2 bg-primary/5' : 'border-border bg-surface'}`}
    >
      <div className={`w-10 h-8 rounded-md flex items-center justify-center ${selected ? 'bg-primary text-white' : 'bg-bg text-text-secondary'}`}>
        {icon}
      </div>
      <div className="text-left flex-1">
        <p className={`text-sm font-bold ${selected ? 'text-primary' : 'text-text-primary'}`}>{title}</p>
        <p className="text-xs text-text-secondary">{subtitle}</p>
      </div>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected ? 'border-primary' : 'border-gray-300'}`}>
        {selected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
      </div>
    </button>
  );
}
