import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LogOut, 
  ScanLine, 
  CheckCircle2, 
  QrCode as QrCodeIcon, 
  X, 
  Building2,
  ArrowUpRight,
  ShieldCheck,
  Receipt,
  TrendingUp,
  Wallet,
  Sparkles,
  Store,
  PieChart,
  Settings,
  ChevronRight,
  Printer,
  Bus,
  BookOpen,
  Coffee,
  Calendar,
  CreditCard
} from 'lucide-react';
import { UserContextType, Transaction } from '../types';
import { formatCurrency } from '../data';
import { Avatar } from '../components/Avatar';

interface MerchantPosScreenProps {
  ctx: UserContextType;
  onLogout: () => void;
  activeTab?: 'TERMINAL' | 'TRANSACTIONS' | 'ANALYTICS' | 'SETTINGS';
  setActiveTab?: (tab: 'TERMINAL' | 'TRANSACTIONS' | 'ANALYTICS' | 'SETTINGS') => void;
}

export function MerchantPosScreen({ ctx, onLogout, activeTab: propActiveTab, setActiveTab: propSetActiveTab }: MerchantPosScreenProps) {
  const [localActiveTab, setLocalActiveTab] = useState<'TERMINAL' | 'TRANSACTIONS' | 'ANALYTICS' | 'SETTINGS'>('TERMINAL');
  const activeTab = propActiveTab !== undefined ? propActiveTab : localActiveTab;
  const setActiveTab = propSetActiveTab !== undefined ? propSetActiveTab : setLocalActiveTab;
  const [amount, setAmount] = useState('0');
  const [selectedCategory, setSelectedCategory] = useState<'Cafeteria' | 'Bookstore' | 'Printing' | 'Transport' | 'Events' | 'Fees'>('Cafeteria');
  const [state, setState] = useState<'IDLE' | 'SCANNING' | 'MERCHANT_QR' | 'CONFIRM' | 'SUCCESS'>('IDLE');
  const [errorMsg, setErrorMsg] = useState('');
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    ctx.transactions.filter(t => t.type === 'debit').slice(0, 8)
  );

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawBank, setWithdrawBank] = useState('Guaranty Trust Bank (GTB)');
  const [withdrawAccountNum, setWithdrawAccountNum] = useState('0123456789');
  const [withdrawPin, setWithdrawPin] = useState('');
  const [isProcessingWithdraw, setIsProcessingWithdraw] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const handleMerchantWithdraw = () => {
    const amt = parseFloat(withdrawAmount);
    if (!amt || amt <= 0) {
      ctx.showToast({ type: 'error', title: 'Invalid Amount', message: 'Please enter a valid withdrawal amount.' });
      return;
    }
    if (withdrawPin.length < 4) {
      ctx.showToast({ type: 'error', title: 'PIN Required', message: 'Please enter your 4-digit transaction PIN.' });
      return;
    }
    setIsProcessingWithdraw(true);
    setTimeout(() => {
      setIsProcessingWithdraw(false);
      setWithdrawSuccess(true);
      ctx.showToast({
        type: 'success',
        title: 'Payout Successful ⚡',
        message: `Successfully transferred ${formatCurrency(amt)} to ${withdrawBank} (${withdrawAccountNum}).`
      });
    }, 1500);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 22) return 'Good evening';
    return 'Good night';
  };

  const handleNumpad = (val: string) => {
    setErrorMsg('');
    if (amount === '0') {
      setAmount(val);
    } else {
      if (amount.length < 7) {
        setAmount(prev => prev + val);
      }
    }
  };

  const handlePreset = (preset: number) => {
    setErrorMsg('');
    setAmount(preset.toString());
  };

  const handleBackspace = () => {
    setErrorMsg('');
    setAmount(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
  };

  const handleScan = () => {
    const numAmt = parseInt(amount) || 0;
    if (numAmt <= 0) {
      setErrorMsg('Please enter a valid amount greater than ₦0 before scanning.');
      return;
    }
    setErrorMsg('');
    setState('SCANNING');
    setTimeout(() => {
      setState('CONFIRM');
    }, 1200);
  };

  const handleGenerateQr = () => {
    const numAmt = parseInt(amount) || 0;
    if (numAmt <= 0) {
      setErrorMsg('Please enter a valid amount to generate a QR code.');
      return;
    }
    setErrorMsg('');
    setState('MERCHANT_QR');
  };

  const handleCharge = () => {
    const numAmt = parseInt(amount) || 0;

    if (numAmt <= 0) {
      setErrorMsg('Please enter a valid amount greater than ₦0.');
      setState('IDLE');
      return;
    }

    if (ctx.balance < numAmt) {
      ctx.updateBalance((numAmt - ctx.balance) + 5000);
    }

    const newTx: Transaction = {
      id: 'tx-' + Math.random().toString().slice(2, 8),
      category: selectedCategory,
      merchant: ctx.user.businessName || ctx.user.name || 'Campus Merchant',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      amount: numAmt,
      type: 'credit', // Credit because the merchant is receiving the money
      date: 'Today',
    };
    
    ctx.addTransaction(newTx);
    setRecentTransactions(prev => [newTx, ...prev]);
    
    ctx.showToast({
      type: 'success',
      title: 'Payment Confirmed & Settled',
      message: `Collected ${formatCurrency(numAmt)} successfully.`,
      amount: numAmt,
      merchant: ctx.user.businessName || ctx.user.name
    });

    setState('SUCCESS');
  };

  const resetTerminal = () => {
    setAmount('0');
    setState('IDLE');
    setErrorMsg('');
  };

  const todayRevenue = recentTransactions.filter(t => t.date === 'Today').reduce((acc, t) => acc + t.amount, 128400);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Cafeteria': return <Coffee size={16} className="text-amber-500" />;
      case 'Bookstore': return <BookOpen size={16} className="text-blue-500" />;
      case 'Printing': return <Printer size={16} className="text-indigo-500" />;
      case 'Transport': return <Bus size={16} className="text-emerald-500" />;
      case 'Events': return <Calendar size={16} className="text-purple-500" />;
      default: return <CreditCard size={16} className="text-primary" />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col w-full bg-bg pb-24"
    >
      {/* OPay-Style Vibrant Merchant Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-primary px-6 pt-8 sm:pt-10 pb-8 shadow-md rounded-b-[36px] relative overflow-hidden mb-6 text-white">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-20 top-4 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />

        <div className="flex justify-between items-center mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-sm">
              <Store size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold text-white uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={10} /> Verified Merchant POS
                </span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-200"></span>
                </span>
              </div>
              <h2 className="text-lg font-extrabold text-white">{ctx.user.businessName || ctx.user.name || 'Campus Hub Merchant'}</h2>
            </div>
          </div>
          <button onClick={onLogout} className="text-white/90 hover:text-white transition-colors cursor-pointer p-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20" title="Sign Out">
            <LogOut size={20} />
          </button>
        </div>

        {/* Live Balance & Settlement Card */}
        <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/25 shadow-lg relative z-10">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-[11px] text-white/80 uppercase font-semibold tracking-wider flex items-center gap-1.5">
                <Wallet size={14} /> Total Settled Balance
              </p>
              <h3 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight mt-1">
                {formatCurrency(todayRevenue + 342000)}
              </h3>
            </div>
            <span className="bg-emerald-400/30 border border-emerald-300/40 text-emerald-100 text-[11px] font-bold px-2.5 py-1 rounded-xl">
              Auto-Settled ⚡
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/20 text-xs items-center">
            <div>
              <span className="text-white/70 block text-[10px] uppercase font-semibold">Today's Collections</span>
              <strong className="text-white font-mono text-sm">{formatCurrency(todayRevenue)}</strong>
            </div>
            <div className="flex justify-end">
              <button 
                onClick={() => {
                  setWithdrawAmount((todayRevenue + 342000).toString());
                  setShowWithdrawModal(true);
                }}
                className="bg-white text-emerald-700 hover:bg-emerald-50 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <ArrowUpRight size={14} /> Withdraw Payout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (OPay App Style) */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-4 gap-1.5 bg-surface p-1.5 rounded-2xl border border-border text-center shadow-xs">
          <button 
            onClick={() => setActiveTab('TERMINAL')}
            className={`py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === 'TERMINAL' ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
          >
            <ScanLine size={14} /> POS Terminal
          </button>
          <button 
            onClick={() => setActiveTab('TRANSACTIONS')}
            className={`py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === 'TRANSACTIONS' ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
          >
            <Receipt size={14} /> Ledger
          </button>
          <button 
            onClick={() => setActiveTab('ANALYTICS')}
            className={`py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === 'ANALYTICS' ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
          >
            <PieChart size={14} /> Insights
          </button>
          <button 
            onClick={() => setActiveTab('SETTINGS')}
            className={`py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === 'SETTINGS' ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
          >
            <Settings size={14} /> Store
          </button>
        </div>
      </div>

      <div className="px-6 max-w-4xl mx-auto w-full">
        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }} 
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3.5 bg-danger/10 border border-danger/30 text-danger rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-xs"
          >
            <ShieldCheck size={18} className="shrink-0" />
            <span>{errorMsg}</span>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === 'TERMINAL' && (
            <motion.div key="terminal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Keypad & Terminal (Col 7) */}
              <div className="lg:col-span-7 bg-surface rounded-3xl p-6 border border-border shadow-sm flex flex-col justify-between">
                <div>
                  {/* Department Selector */}
                  <div className="mb-5">
                    <label className="block text-xs font-bold text-text-secondary mb-2 flex items-center justify-between">
                      <span>Select Service Department</span>
                      <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full font-semibold">Active: {selectedCategory}</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Cafeteria', 'Bookstore', 'Printing', 'Transport', 'Events', 'Fees'] as const).map(cat => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`p-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${selectedCategory === cat ? 'bg-primary text-white border-primary shadow-xs' : 'bg-bg text-text-secondary border-border hover:text-text-primary hover:border-primary/40'}`}
                        >
                          {getCategoryIcon(cat)}
                          <span className="truncate">{cat}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Amount Display */}
                  <div className="bg-bg rounded-2xl p-5 border border-border mb-5 text-center relative overflow-hidden">
                    <div className="absolute top-2 right-3 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      Ready to Scan
                    </div>
                    <span className="text-xs text-text-secondary font-semibold uppercase tracking-wider block mb-1">Charge Amount</span>
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-2xl font-bold text-primary">₦</span>
                      <span className="text-4xl font-black text-text-primary font-mono tracking-tight">{parseInt(amount).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Quick Presets */}
                  <div className="grid grid-cols-4 gap-2 mb-5">
                    {[500, 1000, 2500, 5000].map(preset => (
                      <button
                        key={preset}
                        onClick={() => handlePreset(preset)}
                        className="py-2.5 bg-bg hover:bg-primary/5 border border-border rounded-xl text-xs font-bold text-text-primary transition-all cursor-pointer shadow-2xs"
                      >
                        ₦{preset.toLocaleString()}
                      </button>
                    ))}
                  </div>

                  {/* Numpad */}
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', '⌫'].map((btn) => (
                      <button
                        key={btn}
                        onClick={() => {
                          if (btn === '⌫') handleBackspace();
                          else handleNumpad(btn);
                        }}
                        className="py-3.5 bg-bg hover:bg-border/50 border border-border rounded-2xl text-base font-bold text-text-primary transition-all cursor-pointer shadow-2xs flex items-center justify-center active:scale-95"
                      >
                        {btn}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
                  <button
                    onClick={handleScan}
                    className="bg-primary text-white py-4 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 hover:opacity-95 shadow-lg shadow-primary/25 transition-all cursor-pointer"
                  >
                    <ScanLine size={18} />
                    <span>Scan Student ID</span>
                  </button>
                  <button
                    onClick={handleGenerateQr}
                    className="bg-emerald-600 text-white py-4 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 hover:opacity-95 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
                  >
                    <QrCodeIcon size={18} />
                    <span>Counter QR</span>
                  </button>
                </div>
              </div>

              {/* Recent Terminal Activity (Col 5) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-surface rounded-3xl p-6 border border-border shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Receipt size={18} className="text-primary" />
                      <h3 className="text-sm font-bold text-text-primary">Live Terminal Activity</h3>
                    </div>
                    <button onClick={() => setActiveTab('TRANSACTIONS')} className="text-xs text-primary font-bold hover:underline flex items-center gap-0.5 cursor-pointer">
                      View All <ChevronRight size={14} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {recentTransactions.slice(0, 5).map(tx => (
                      <div key={tx.id} className="p-3 bg-bg rounded-2xl border border-border flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs">
                            {getCategoryIcon(tx.category)}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-text-primary">{tx.category} • {tx.merchant}</h4>
                            <p className="text-[10px] text-text-secondary">{tx.time} • {tx.date}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold font-mono text-emerald-600">+{formatCurrency(tx.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Merchant Tip */}
                <div className="bg-gradient-to-br from-primary/10 via-emerald-500/10 to-transparent p-5 rounded-3xl border border-primary/20 space-y-2">
                  <div className="flex items-center gap-2 text-primary">
                    <Sparkles size={16} />
                    <h4 className="text-xs font-bold uppercase tracking-wider">Fast Settlement Guarantee</h4>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    All QR code scans and student ID taps settle instantly into your campus merchant wallet with zero gateway downtime.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'TRANSACTIONS' && (
            <motion.div key="transactions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-surface rounded-3xl p-6 border border-border shadow-sm space-y-4">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="text-base font-bold text-text-primary">Complete Ledger & Settlement History</h3>
                  <p className="text-xs text-text-secondary">All historical collections across student terminals</p>
                </div>
                <span className="text-xs font-mono font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">
                  {recentTransactions.length + 14} Total Transactions
                </span>
              </div>

              <div className="space-y-3 pt-2">
                {recentTransactions.concat([
                  { id: 'old-1', category: 'Cafeteria', merchant: 'Main Hall Canteen', time: 'Yesterday', amount: 3400, type: 'debit', date: 'Yesterday' },
                  { id: 'old-2', category: 'Bookstore', merchant: 'Campus Bookshop', time: '2 days ago', amount: 8900, type: 'debit', date: 'Aug 13' },
                  { id: 'old-3', category: 'Printing', merchant: 'Cyber Cafe Hub', time: '3 days ago', amount: 1500, type: 'debit', date: 'Aug 12' },
                ]).map(tx => (
                  <div key={tx.id} className="p-4 bg-bg rounded-2xl border border-border flex items-center justify-between hover:border-primary/40 transition-all">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                        {getCategoryIcon(tx.category)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-text-primary">{tx.merchant}</h4>
                        <div className="flex items-center gap-2 text-xs text-text-secondary mt-0.5">
                          <span className="bg-surface px-2 py-0.5 rounded-md font-semibold text-[10px] border border-border">{tx.category}</span>
                          <span>{tx.time} • {tx.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold font-mono text-emerald-600 block">+{formatCurrency(tx.amount)}</span>
                      <span className="text-[10px] text-emerald-500 font-semibold">Settled</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'ANALYTICS' && (
            <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-surface p-5 rounded-3xl border border-border shadow-sm">
                  <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider mb-1">Peak Rush Hour</p>
                  <h4 className="text-xl font-black text-text-primary">12:00 PM – 2:00 PM</h4>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1">🔥 64% of daily cafeteria traffic</p>
                </div>
                <div className="bg-surface p-5 rounded-3xl border border-border shadow-sm">
                  <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider mb-1">Average Order Value</p>
                  <h4 className="text-xl font-black text-text-primary font-mono">₦2,150</h4>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1">↑ +12% from last week</p>
                </div>
                <div className="bg-surface p-5 rounded-3xl border border-border shadow-sm">
                  <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider mb-1">Successful Settlement Rate</p>
                  <h4 className="text-xl font-black text-text-primary">99.98%</h4>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1">Zero failed callbacks</p>
                </div>
              </div>

              <div className="bg-surface rounded-3xl p-6 border border-border shadow-sm space-y-4">
                <h3 className="text-base font-bold text-text-primary">Department Revenue Breakdown</h3>
                <div className="space-y-3">
                  {[
                    { cat: 'Cafeteria & Canteen', amount: 245000, pct: 55, color: 'bg-amber-500' },
                    { cat: 'Bookstore & Materials', amount: 112000, pct: 25, color: 'bg-blue-500' },
                    { cat: 'Printing & Cyber Hub', amount: 56000, pct: 12, color: 'bg-indigo-500' },
                    { cat: 'Transport & Shuttle', amount: 34000, pct: 8, color: 'bg-emerald-500' },
                  ].map(item => (
                    <div key={item.cat} className="space-y-1.5 bg-bg p-3.5 rounded-2xl border border-border">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-text-primary">{item.cat}</span>
                        <span className="font-mono text-primary">{formatCurrency(item.amount)} ({item.pct}%)</span>
                      </div>
                      <div className="w-full bg-surface h-2.5 rounded-full overflow-hidden border border-border">
                        <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'SETTINGS' && (
            <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-surface rounded-3xl p-6 border border-border shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-bold text-text-primary">Merchant Store Settings</h3>
                <p className="text-xs text-text-secondary">Configure your business profile, bank payout details, and terminals</p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="p-4 bg-bg rounded-2xl border border-border flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-text-primary">Business Name</h4>
                    <p className="text-xs text-text-secondary">{ctx.user.businessName || ctx.user.name || 'Campus Merchant'}</p>
                  </div>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-xl">Verified</span>
                </div>

                <div className="p-4 bg-bg rounded-2xl border border-border flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-text-primary">Default Settlement Bank</h4>
                    <p className="text-xs text-text-secondary">Wema Bank • 0124891029 (UniPay Merchant Hub)</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-xl">Active</span>
                </div>

                <div className="p-4 bg-bg rounded-2xl border border-border flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-text-primary">Terminal ID</h4>
                    <p className="text-xs font-mono text-text-secondary">POS-UNI-9482-LAGOS</p>
                  </div>
                  <span className="text-xs font-bold text-text-secondary bg-surface px-3 py-1 rounded-xl border border-border">Online ⚡</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Student Scan / Confirm Modal */}
      <AnimatePresence>
        {state === 'SCANNING' && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface rounded-3xl p-8 max-w-sm w-full text-center border border-border shadow-2xl space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto animate-pulse">
                <ScanLine size={32} />
              </div>
              <h3 className="text-lg font-bold text-text-primary">Scanning Student Digital ID...</h3>
              <p className="text-xs text-text-secondary">Please hold student device near the terminal reader or camera.</p>
              <div className="pt-2">
                <div className="w-full bg-bg h-2 rounded-full overflow-hidden border border-border">
                  <div className="bg-primary h-full animate-[indeterminate_1.5s_infinite_linear]" style={{ width: '60%' }} />
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {state === 'CONFIRM' && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface rounded-3xl p-6 max-w-md w-full border border-border shadow-2xl space-y-5"
            >
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">✓</div>
                  <h3 className="text-base font-bold text-text-primary">Verify & Confirm Payment</h3>
                </div>
                <button onClick={resetTerminal} className="p-1 rounded-full text-text-secondary hover:text-text-primary cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              {/* Student Verified Info */}
              <div className="p-4 rounded-2xl bg-bg border border-border flex items-center gap-3">
                <Avatar 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" 
                  name="Sarah Davies" 
                  role="STUDENT"
                  size="lg" 
                  className="border border-border shadow-xs" 
                />
                <div>
                  <h4 className="text-sm font-bold text-text-primary">Sarah Davies</h4>
                  <p className="text-xs text-text-secondary">Computer Science • 300L</p>
                  <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Wallet Balance: ₦48,500</p>
                </div>
              </div>

              <div className="bg-primary/5 p-4 rounded-2xl border border-primary/20 text-center space-y-1">
                <span className="text-xs text-text-secondary font-semibold">Amount to Charge</span>
                <div className="text-3xl font-black text-primary font-mono">{formatCurrency(parseInt(amount))}</div>
                <p className="text-[11px] text-text-secondary">Department: {selectedCategory}</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={resetTerminal}
                  className="flex-1 bg-bg hover:bg-border/50 text-text-primary rounded-xl py-3 text-xs font-bold transition-all cursor-pointer border border-border"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCharge}
                  className="flex-1 bg-primary text-white rounded-xl py-3 text-xs font-bold transition-all hover:opacity-95 shadow-md shadow-primary/20 cursor-pointer"
                >
                  Confirm & Charge
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {state === 'MERCHANT_QR' && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface rounded-3xl p-6 max-w-sm w-full text-center border border-border shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-text-primary">Counter QR Code</h3>
                <button onClick={resetTerminal} className="p-1 rounded-full text-text-secondary hover:text-text-primary cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-border inline-block shadow-xs mx-auto">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                    `unipay://pay/merchant/${ctx.user.studentId || 'merchant-pos'}?amount=${parseInt(amount) || 0}&name=${encodeURIComponent(ctx.user.businessName || ctx.user.name || 'Campus Merchant')}`
                  )}`}
                  alt="Merchant Payment QR Code"
                  className="w-44 h-44 object-contain"
                  referrerPolicy="no-referrer"
                />
                <div className="mt-2 text-xs font-mono font-bold text-slate-800">
                  {formatCurrency(parseInt(amount))}
                </div>
              </div>

              <p className="text-xs text-text-secondary">Students can open their UniPay app and scan this QR code to instantly pay.</p>

              <button 
                onClick={handleCharge}
                className="w-full bg-emerald-600 text-white rounded-xl py-3 text-xs font-bold transition-all hover:opacity-95 shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                Simulate Student Scan & Pay
              </button>
            </motion.div>
          </div>
        )}

        {state === 'SUCCESS' && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface rounded-3xl p-8 max-w-sm w-full text-center border border-border shadow-2xl space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="text-lg font-bold text-text-primary">Payment Successful!</h3>
              <p className="text-xs text-text-secondary">Transaction has been successfully settled and recorded in the shift ledger.</p>

              <div className="p-4 bg-bg rounded-2xl border border-border text-left space-y-1.5 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Amount:</span>
                  <span className="font-bold text-text-primary">{formatCurrency(parseInt(amount))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Category:</span>
                  <span className="font-bold text-text-primary">{selectedCategory}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Time:</span>
                  <span className="font-bold text-text-primary">{new Date().toLocaleTimeString()}</span>
                </div>
              </div>

              <button 
                onClick={resetTerminal}
                className="w-full bg-primary text-white rounded-xl py-3 text-xs font-bold transition-all hover:opacity-95 shadow-md shadow-primary/20 cursor-pointer"
              >
                New Transaction
              </button>
            </motion.div>
          </div>
        )}

        {showWithdrawModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface rounded-3xl p-6 max-w-md w-full border border-border shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-primary">Merchant Bank Payout</h3>
                    <p className="text-[10px] text-text-secondary">Transfer settled funds to your commercial bank</p>
                  </div>
                </div>
                <button 
                  onClick={() => { setShowWithdrawModal(false); setWithdrawSuccess(false); }}
                  className="p-1 rounded-full text-text-secondary hover:text-text-primary cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {!withdrawSuccess ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-text-secondary block mb-1">Select Bank</label>
                    <select 
                      value={withdrawBank} 
                      onChange={(e) => setWithdrawBank(e.target.value)}
                      className="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-xs text-text-primary font-medium focus:outline-none focus:border-primary"
                    >
                      <option value="Guaranty Trust Bank (GTB)">Guaranty Trust Bank (GTB)</option>
                      <option value="Access Bank">Access Bank</option>
                      <option value="Zenith Bank">Zenith Bank</option>
                      <option value="Kuda Bank">Kuda Bank</option>
                      <option value="United Bank for Africa (UBA)">United Bank for Africa (UBA)</option>
                      <option value="OPay Digital Services">OPay Digital Services</option>
                      <option value="First Bank of Nigeria">First Bank of Nigeria</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-text-secondary block mb-1">Account Number (10 digits)</label>
                    <input 
                      type="text" 
                      maxLength={10} 
                      value={withdrawAccountNum} 
                      onChange={(e) => setWithdrawAccountNum(e.target.value)}
                      className="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-xs text-text-primary font-mono font-bold focus:outline-none focus:border-primary"
                      placeholder="0123456789"
                    />
                    <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">✓ Verified Account Name: {ctx.user.businessName || ctx.user.name || 'Campus Hub Merchant'}</span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-text-secondary block mb-1">Withdrawal Amount (₦)</label>
                    <input 
                      type="number" 
                      value={withdrawAmount} 
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-xs text-primary font-mono font-black text-base focus:outline-none focus:border-primary"
                    />
                    <span className="text-[10px] text-text-secondary block mt-1">Available Settled Balance: {formatCurrency(todayRevenue + 342000)}</span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-text-secondary block mb-1">4-Digit Transaction PIN</label>
                    <input 
                      type="password" 
                      maxLength={4} 
                      value={withdrawPin} 
                      onChange={(e) => setWithdrawPin(e.target.value)}
                      className="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-xs text-text-primary font-mono tracking-widest focus:outline-none focus:border-primary"
                      placeholder="••••"
                    />
                  </div>

                  <button 
                    onClick={handleMerchantWithdraw}
                    disabled={isProcessingWithdraw}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-3 text-xs font-bold transition shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isProcessingWithdraw ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Processing Bank Transfer...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        <span>Authorize & Transfer Payout</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 size={36} />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-text-primary">Payout Sent Successfully!</h4>
                    <p className="text-xs text-text-secondary mt-1">Funds have been dispatched to your {withdrawBank} account.</p>
                  </div>
                  <div className="p-3 bg-bg rounded-xl border border-border text-left font-mono text-xs space-y-1">
                    <div className="flex justify-between"><span className="text-text-secondary">Amount:</span> <strong className="text-text-primary">{formatCurrency(parseFloat(withdrawAmount) || 0)}</strong></div>
                    <div className="flex justify-between"><span className="text-text-secondary">Bank:</span> <strong className="text-text-primary">{withdrawBank}</strong></div>
                    <div className="flex justify-between"><span className="text-text-secondary">Account:</span> <strong className="text-text-primary">{withdrawAccountNum}</strong></div>
                    <div className="flex justify-between"><span className="text-text-secondary">Ref:</span> <strong className="text-emerald-600">PAY-{Math.random().toString().slice(2, 9)}</strong></div>
                  </div>
                  <button 
                    onClick={() => { setShowWithdrawModal(false); setWithdrawSuccess(false); setWithdrawPin(''); }}
                    className="w-full bg-primary text-white rounded-xl py-3 text-xs font-bold transition cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
