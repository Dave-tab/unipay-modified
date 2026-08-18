import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LogOut, ArrowUpCircle, History, Sliders, Bell, Zap, Calendar, 
  ShieldAlert, CheckCircle2, Eye, EyeOff, Lock, Unlock, 
  AlertTriangle, TrendingUp, ChevronDown, Check, ShieldCheck,
  UserPlus, Users, Trash2, X, Plus, CreditCard, Building, School,
  Phone, Sparkles, ExternalLink, Wallet, Video, LayoutGrid, PlusCircle,
  Receipt, HeartPulse, GraduationCap, Award, Ticket, Send, AlertCircle,
  Tv, Building2
} from 'lucide-react';
import { ScreenId, UserContextType, Ward, Transaction } from '../types';
import { formatCurrency } from '../data';
import { Avatar } from '../components/Avatar';
import { TransactionReceipt } from '../components/TransactionReceipt';

interface ParentPortalScreenProps {
  ctx: UserContextType;
  onLogout: () => void;
  setCurrentScreen: (s: ScreenId) => void;
  activeTab?: 'OVERVIEW' | 'SERVICES' | 'ALLOWANCE' | 'LIMITS' | 'ALERTS' | 'SECURITY';
  setActiveTab?: (tab: 'OVERVIEW' | 'SERVICES' | 'ALLOWANCE' | 'LIMITS' | 'ALERTS' | 'SECURITY') => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150'
];

const CAMPUSES = [
  'University of Lagos (UNILAG)',
  'Covenant University (CU)',
  'University of Ibadan (UI)',
  'Obafemi Awolowo University (OAU)',
  'Babcock University',
  'Federal University of Technology, Akure (FUTA)',
  'Lagos State University (LASU)',
  'Pan-Atlantic University (PAU)'
];

interface ParentServiceItem {
  id: string;
  title: string;
  desc: string;
  category: 'Fees' | 'Events' | 'IT & Media' | 'Health' | 'Hostel';
  price: number;
  icon: React.ReactNode;
  color: string;
  badge?: string;
  tag: string;
}

const PARENT_CURATED_SERVICES: ParentServiceItem[] = [
  {
    id: 'parent-srv-1',
    title: 'PTA & Guardian Annual Development Dues',
    desc: 'Mandatory parent-teacher association campus development levy with official voting receipt.',
    category: 'Fees',
    price: 10000,
    icon: <GraduationCap size={22} />,
    color: 'bg-primary/10 text-primary border-primary/20',
    badge: 'Annual Mandatory',
    tag: 'PTA Secretariat'
  },
  {
    id: 'parent-srv-2',
    title: 'Campus YouTube HD Live Stream & Media Pass',
    desc: 'HD live broadcast access on YouTube / school portal for Matriculation, Sports Derby, and Convocation ceremonies.',
    category: 'IT & Media',
    price: 3500,
    icon: <Tv size={22} />,
    color: 'bg-red-500/10 text-red-600 border-red-500/20',
    badge: 'YouTube Live',
    tag: 'Media Centre'
  },
  {
    id: 'parent-srv-3',
    title: 'Parents & Visiting Day Banquet Family Pass',
    desc: 'Access pass for parents visiting weekend, includes faculty tour, banquet dinner, and dean reception.',
    category: 'Events',
    price: 5000,
    icon: <Ticket size={22} />,
    color: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    badge: 'Family Pass',
    tag: 'Student Affairs'
  },
  {
    id: 'parent-srv-4',
    title: 'Comprehensive Ward Health & Clinic Insurance',
    desc: '24/7 campus triage coverage, emergency pharmacy co-pay subsidy, and clinic insurance for the semester.',
    category: 'Health',
    price: 6000,
    icon: <HeartPulse size={22} />,
    color: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    badge: 'Semester Pass',
    tag: 'Medical Centre'
  },
  {
    id: 'parent-srv-5',
    title: 'Convocation & Graduation Ceremony VIP Pass',
    desc: 'Reserved front-row seating, faculty gala banquet access, and VIP campus parking decal for guardians.',
    category: 'Events',
    price: 7500,
    icon: <Award size={22} />,
    color: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    badge: 'VIP Decal',
    tag: 'Bursary Office'
  },
  {
    id: 'parent-srv-6',
    title: 'Campus Endowment & Science Lab Building Fund',
    desc: 'Voluntary parent endowment contribution toward faculty research computing labs and high-speed Wi-Fi.',
    category: 'Fees',
    price: 15000,
    icon: <Building2 size={22} />,
    color: 'bg-teal-500/10 text-teal-600 border-teal-500/20',
    badge: 'Endowment',
    tag: 'University Council'
  }
];

export function ParentPortalScreen({ ctx, onLogout, setCurrentScreen, activeTab: propActiveTab, setActiveTab: propSetActiveTab }: ParentPortalScreenProps) {
  const [localActiveTab, setLocalActiveTab] = useState<'OVERVIEW' | 'SERVICES' | 'ALLOWANCE' | 'LIMITS' | 'ALERTS' | 'SECURITY'>('OVERVIEW');
  const activeTab = propActiveTab !== undefined ? propActiveTab : localActiveTab;
  const setActiveTab = propSetActiveTab !== undefined ? propSetActiveTab : setLocalActiveTab;
  
  const [allowanceSuccessMsg, setAllowanceSuccessMsg] = useState('');
  const [showBalance, setShowBalance] = useState(true);
  const [showWardDropdown, setShowWardDropdown] = useState(false);

  // Modals State
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [showTopUpChildModal, setShowTopUpChildModal] = useState(false);
  const [showUnlinkConfirmModal, setShowUnlinkConfirmModal] = useState<string | null>(null);

  // Add Child Form State
  const [childName, setChildName] = useState('');
  const [childStudentId, setChildStudentId] = useState('');
  const [childDepartment, setChildDepartment] = useState('');
  const [childSchool, setChildSchool] = useState(CAMPUSES[0]);
  const [childRelationship, setChildRelationship] = useState<'Daughter' | 'Son' | 'Ward' | 'Sibling'>('Daughter');
  const [childPhone, setChildPhone] = useState('');
  const [childInitialFund, setChildInitialFund] = useState<number>(5000);
  const [childAvatar, setChildAvatar] = useState(PRESET_AVATARS[0]);
  const [childDailyLimit, setChildDailyLimit] = useState<number>(8000);
  const [childAllowanceAmt, setChildAllowanceAmt] = useState<number>(5000);
  const [childAllowanceFreq, setChildAllowanceFreq] = useState<'Daily' | 'Weekly' | 'Monthly'>('Weekly');

  // Top Up Modal State
  const [topUpAmount, setTopUpAmount] = useState<number>(5000);
  const [customTopUpAmount, setCustomTopUpAmount] = useState<string>('');
  const [topUpSource, setTopUpSource] = useState<'BANK' | 'CARD' | 'WALLET'>('BANK');
  const [topUpNote, setTopUpNote] = useState<string>('Allowance & Meals');
  const [isProcessingTopUp, setIsProcessingTopUp] = useState(false);

  // Parent Custom Unlisted Service Payment State
  const [parentCustomServiceName, setParentCustomServiceName] = useState('');
  const [parentCustomDepartment, setParentCustomDepartment] = useState('Bursary Office');
  const [parentCustomWardId, setParentCustomWardId] = useState('');
  const [parentCustomRef, setParentCustomRef] = useState('');
  const [parentCustomAmount, setParentCustomAmount] = useState<string>('');
  const [parentCustomNote, setParentCustomNote] = useState('');
  const [isProcessingParentCustom, setIsProcessingParentCustom] = useState(false);
  const [parentCustomError, setParentCustomError] = useState('');
  const [parentSuccessTx, setParentSuccessTx] = useState<Transaction | null>(null);

  const [showFundParentWalletModal, setShowFundParentWalletModal] = useState(false);
  const [parentFundAmount, setParentFundAmount] = useState('20000');
  const [parentFundMethod, setParentFundMethod] = useState<'CARD' | 'TRANSFER' | 'USSD'>('TRANSFER');
  const [isProcessingParentFund, setIsProcessingParentFund] = useState(false);

  const handleFundParentWallet = async () => {
    const amt = parseFloat(parentFundAmount);
    if (!amt || amt <= 0) {
      ctx.showToast({ type: 'error', title: 'Invalid Amount', message: 'Please enter a valid funding amount.' });
      return;
    }
    setIsProcessingParentFund(true);
    try {
      await ctx.requestPayment({
        amount: amt,
        title: 'Fund Guardian Wallet',
        subtitle: `UniPay Virtual Account • Ref: VIRT-${Math.floor(100000 + Math.random() * 900000)}`
      });
      setTimeout(() => {
        setIsProcessingParentFund(false);
        setShowFundParentWalletModal(false);
        ctx.updateBalance(amt);
        ctx.showToast({
          type: 'success',
          title: 'Wallet Funded Successfully! 🎉',
          message: `${formatCurrency(amt)} added to your parent wallet.`
        });
      }, 1000);
    } catch (err) {
      setIsProcessingParentFund(false);
      console.log('Cancelled funding');
    }
  };

  // Current active ward
  const wards = ctx.wards || [];
  const selectedWardId = ctx.activeWardId || (wards[0]?.id ?? 'ward-1');
  const currentWard = wards.find(w => w.id === selectedWardId) || wards[0] || {
    id: 'ward-default',
    name: 'Sarah Davies',
    studentId: '24-00192',
    department: 'Computer Science • 300L',
    avatar: PRESET_AVATARS[0],
    balance: 12500,
    cardFrozen: false,
    school: 'University of Lagos (UNILAG)',
    relationship: 'Daughter',
    phone: '+234 812 345 6789',
    dailyLimit: 8000,
    allowanceAmount: 5000,
    allowanceFrequency: 'Weekly'
  };

  useEffect(() => {
    if (!parentCustomWardId && currentWard?.id) {
      setParentCustomWardId(currentWard.id);
    }
  }, [currentWard?.id, parentCustomWardId]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 22) return 'Good evening';
    return 'Good night';
  };

  const credits = ctx.transactions.filter(t => t.type === 'credit').reduce((a,c) => a+c.amount, 0);
  const debits = ctx.transactions.filter(t => t.type === 'debit').reduce((a,c) => a+c.amount, 0);

  const todayDebits = ctx.transactions.filter(t => t.type === 'debit' && t.date === 'Today');
  const catSpent: Record<string, number> = {
    Cafeteria: todayDebits.filter(t => t.category === 'Cafeteria').reduce((a,c) => a+c.amount, 0),
    Printing: todayDebits.filter(t => t.category === 'Printing').reduce((a,c) => a+c.amount, 0),
    Transport: todayDebits.filter(t => t.category === 'Transport').reduce((a,c) => a+c.amount, 0),
    Bookstore: todayDebits.filter(t => t.category === 'Bookstore').reduce((a,c) => a+c.amount, 0),
    Events: todayDebits.filter(t => t.category === 'Events').reduce((a,c) => a+c.amount, 0),
  };

  const handleInstantAllowance = () => {
    const amt = currentWard.allowanceAmount || ctx.allowance.amount || 5000;
    ctx.topUpWard(currentWard.id, amt, `Instant Allowance (${currentWard.allowanceFrequency || 'Weekly'})`);
    setAllowanceSuccessMsg(`Successfully sent ${formatCurrency(amt)} allowance to ${currentWard.name}!`);
    setTimeout(() => setAllowanceSuccessMsg(''), 4000);
  };

  const toggleFreezeCard = () => {
    const updatedFrozen = !currentWard.cardFrozen;
    ctx.updateWard(currentWard.id, { cardFrozen: updatedFrozen });
    ctx.showToast({
      title: updatedFrozen ? 'Digital Card Frozen' : 'Card Unfrozen',
      message: updatedFrozen 
        ? `${currentWard.name}'s digital campus ID has been instantly locked for security.`
        : `${currentWard.name}'s UniPay ID and QR pay have been safely restored.`,
      type: updatedFrozen ? 'warning' : 'success'
    });
  };

  const handleCreateChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!childName.trim()) {
      ctx.showToast({ title: 'Name Required', message: "Please enter your child's full legal name.", type: 'error' });
      return;
    }
    if (!childStudentId.trim()) {
      ctx.showToast({ title: 'Student ID Required', message: 'Please enter matriculation or student ID number.', type: 'error' });
      return;
    }

    const newWard: Ward = {
      id: 'ward-' + Math.random().toString().slice(2, 7),
      name: childName.trim(),
      studentId: childStudentId.trim().toUpperCase(),
      department: childDepartment.trim() || 'General Studies • 100L',
      avatar: childAvatar,
      balance: childInitialFund || 0,
      cardFrozen: false,
      school: childSchool,
      relationship: childRelationship,
      phone: childPhone.trim() || '+234 800 000 0000',
      dailyLimit: childDailyLimit,
      allowanceAmount: childAllowanceAmt,
      allowanceFrequency: childAllowanceFreq,
      dataSharingEnabled: true
    };

    ctx.addWard(newWard);
    ctx.setActiveWardId(newWard.id);
    setShowAddChildModal(false);

    // Reset Form
    setChildName('');
    setChildStudentId('');
    setChildDepartment('');
    setChildPhone('');
    setChildInitialFund(5000);

    ctx.showToast({
      title: 'Student Account Linked',
      message: `Successfully linked ${newWard.name} to your parent portal.`,
      type: 'success'
    });
  };

  const handleExecuteTopUp = async () => {
    const finalAmount = customTopUpAmount ? Number(customTopUpAmount) : topUpAmount;
    if (!finalAmount || finalAmount <= 0) {
      ctx.showToast({ title: 'Invalid Amount', message: 'Please specify a valid top-up amount.', type: 'error' });
      return;
    }

    try {
      await ctx.requestPayment({
        amount: finalAmount,
        title: `Ward Top-Up: ${currentWard.name}`,
        subtitle: `Source: ${topUpSource === 'BANK' ? 'Zenith Bank' : topUpSource === 'CARD' ? 'Mastercard' : 'Parent Balance'}`
      });

      setIsProcessingTopUp(true);
      setTimeout(() => {
        ctx.topUpWard(currentWard.id, finalAmount, topUpNote || 'Parent Top-Up');
        setIsProcessingTopUp(false);
        setShowTopUpChildModal(false);
        setCustomTopUpAmount('');
        ctx.showToast({
          title: 'Wallet Funded Successfully',
          message: `Credited ${formatCurrency(finalAmount)} to ${currentWard.name}'s wallet balance.`,
          type: 'success'
        });
      }, 700);
    } catch (err) {
      console.log('Top-up cancelled');
    }
  };

  const handleUnlinkChild = (wardId: string) => {
    const wardToUnlink = wards.find(w => w.id === wardId);
    ctx.removeWard(wardId);
    setShowUnlinkConfirmModal(null);
    ctx.showToast({
      title: 'Student Unlinked',
      message: `${wardToUnlink?.name || 'Student'} was removed from your parent portal.`,
      type: 'info'
    });
  };

  // Pay Curated Parent Service (e.g. YouTube Pass, PTA Dues)
  const handlePayCuratedService = async (service: ParentServiceItem) => {
    try {
      await ctx.requestPayment({
        amount: service.price,
        title: service.title,
        subtitle: `Target: ${currentWard.name} (${currentWard.studentId}) • ${service.tag}`
      });

      const newTx: Transaction = {
        id: 'tx-' + Math.random().toString().slice(2, 8),
        category: service.category,
        merchant: `${service.title} - ${service.tag}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        amount: service.price,
        type: 'debit',
        date: 'Today',
        timestamp: Date.now()
      };

      ctx.addTransaction(newTx);
      ctx.addNotification({
        title: `${service.title} Paid`,
        message: `Guardian paid ${formatCurrency(service.price)} for ${service.title} (${currentWard.name}).`,
        type: 'transaction',
        amount: service.price,
        linkScreen: 'HISTORY'
      });

      setParentSuccessTx(newTx);
      ctx.showToast({
        title: 'Service Activated',
        message: `Payment of ${formatCurrency(service.price)} completed for ${service.title}.`,
        type: 'success'
      });
    } catch (err) {
      console.log('Payment cancelled');
    }
  };

  // Pay Custom Manual School Service for Parent
  const handlePayParentCustomService = async (e: React.FormEvent) => {
    e.preventDefault();
    setParentCustomError('');

    const parsedAmount = Number(parentCustomAmount);
    if (!parentCustomServiceName.trim()) {
      setParentCustomError('Please enter the name of the school service or fee.');
      return;
    }
    if (!parsedAmount || parsedAmount <= 0) {
      setParentCustomError('Please enter a valid payment amount.');
      return;
    }

    const targetWard = wards.find(w => w.id === parentCustomWardId) || currentWard;
    const ref = parentCustomRef.trim() || 'PAR-' + Math.floor(100000 + Math.random() * 900000);

    try {
      await ctx.requestPayment({
        amount: parsedAmount,
        title: parentCustomServiceName.trim(),
        subtitle: `Ward: ${targetWard.name} • ${parentCustomDepartment} • Ref: ${ref}`
      });

      setIsProcessingParentCustom(true);
      setTimeout(() => {
        const newTx: Transaction = {
          id: 'tx-' + Math.random().toString().slice(2, 8),
          category: 'Custom Service',
          merchant: `${parentCustomServiceName.trim()} (${parentCustomDepartment} - ${targetWard.name})`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          amount: parsedAmount,
          type: 'debit',
          date: 'Today',
          timestamp: Date.now()
        };

        ctx.addTransaction(newTx);
        ctx.addNotification({
          title: 'School Fee Paid',
          message: `Guardian paid ${formatCurrency(parsedAmount)} for ${parentCustomServiceName.trim()} to ${parentCustomDepartment} on behalf of ${targetWard.name}.`,
          type: 'transaction',
          amount: parsedAmount,
          linkScreen: 'HISTORY'
        });

        setIsProcessingParentCustom(false);
        setParentSuccessTx(newTx);

        // Reset form
        setParentCustomServiceName('');
        setParentCustomAmount('');
        setParentCustomRef('');
        setParentCustomNote('');

        ctx.showToast({
          title: 'Payment Successful',
          message: `Receipt generated for ${parentCustomServiceName.trim()}.`,
          type: 'success'
        });
      }, 800);
    } catch (err) {
      console.log('Payment cancelled');
    }
  };

  return (
    <div className="flex flex-col w-full bg-bg pb-24 text-text-primary">
      {/* Top Guardian Header */}
      <div className="bg-gradient-to-r from-teal-900 via-primary to-emerald-900 px-6 pt-8 sm:pt-10 pb-8 text-white relative shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar 
              src={ctx.user?.avatar || PRESET_AVATARS[0]} 
              name={ctx.user?.name || 'Guardian'} 
              size="md" 
              className="border-2 border-white/40 shadow-xs"
            />
            <div>
              <span className="text-[10px] bg-white/20 text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Guardian Console
              </span>
              <h2 className="text-xl font-bold text-white leading-tight">
                {getGreeting()}, {ctx.user?.name ? ctx.user.name.split(' ')[0] : 'Guardian'}
              </h2>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 transition flex items-center justify-center text-white cursor-pointer"
            title="Log Out"
          >
            <LogOut size={16} />
          </button>
        </div>

        {/* Multi-Student Switcher & Selector */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20 flex items-center justify-between relative z-30">
          <div className="flex items-center gap-3 flex-1 overflow-hidden">
            <Avatar 
              src={currentWard.avatar} 
              name={currentWard.name} 
              size="sm" 
              className="border border-white/30 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold text-white truncate">{currentWard.name}</p>
                <span className="text-[9px] bg-emerald-500 text-white font-bold px-1.5 py-0.2 rounded-full shrink-0">
                  {currentWard.relationship || 'Ward'}
                </span>
              </div>
              <p className="text-[10px] text-white/80 truncate">
                {currentWard.studentId} • {currentWard.department}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {wards.length > 1 && (
              <div className="relative">
                <button 
                  onClick={() => setShowWardDropdown(!showWardDropdown)}
                  className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-2.5 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer"
                >
                  <Users size={12} />
                  <span>Switch ({wards.length})</span>
                  <ChevronDown size={12} />
                </button>

                {showWardDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-surface rounded-2xl shadow-xl border border-border py-1.5 text-text-primary z-50">
                    <p className="px-3 py-1 text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                      Select Monitored Student
                    </p>
                    {wards.map((ward) => (
                      <button
                        key={ward.id}
                        onClick={() => {
                          ctx.setActiveWardId(ward.id);
                          setShowWardDropdown(false);
                        }}
                        className={`w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-bg transition-colors cursor-pointer ${
                          ward.id === currentWard.id ? 'bg-primary/10 text-primary font-bold' : ''
                        }`}
                      >
                        <Avatar src={ward.avatar} name={ward.name} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate">{ward.name}</p>
                          <p className="text-[10px] text-text-secondary truncate">{ward.studentId} • {ward.department}</p>
                        </div>
                        {ward.id === currentWard.id && <Check size={14} className="text-primary shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button 
              onClick={() => setShowAddChildModal(true)}
              className="bg-white text-primary text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs hover:bg-white/95 transition flex items-center gap-1 cursor-pointer"
            >
              <UserPlus size={13} />
              <span>Link Child</span>
            </button>
          </div>
        </div>
      </div>

      {/* Parent Wallet Funding Banner */}
      <div className="px-6 -mt-3 relative z-20 mb-6">
        <div className="bg-gradient-to-r from-teal-800 to-primary rounded-3xl p-4 text-white shadow-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white font-bold">
              <Wallet size={20} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-white/80 tracking-wider block">Your Parent Account Wallet</span>
              <span className="text-lg font-black font-mono">{formatCurrency(ctx.balance || 0)}</span>
            </div>
          </div>
          <button 
            onClick={() => setShowFundParentWalletModal(true)}
            className="bg-white text-primary hover:bg-white/95 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            <ArrowUpCircle size={14} /> Fund Wallet
          </button>
        </div>
      </div>

      {/* Ward Main Balance & Quick Action Card */}
      <div className="px-6 -mt-5 relative z-20 mb-6">
        <div className="bg-surface rounded-3xl p-5 border border-border shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-text-secondary">
                {currentWard.name}'s UniPay Balance
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-text-primary font-mono">
                  {showBalance ? formatCurrency(currentWard.balance ?? 12500) : '₦ ••••••••'}
                </h3>
                <button 
                  onClick={() => setShowBalance(!showBalance)}
                  className="text-text-secondary hover:text-text-primary p-1 cursor-pointer"
                >
                  {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                currentWard.cardFrozen 
                  ? 'bg-danger/10 text-danger border border-danger/30' 
                  : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
              }`}>
                {currentWard.cardFrozen ? <Lock size={10} /> : <ShieldCheck size={10} />}
                <span>{currentWard.cardFrozen ? 'ID Card Locked' : 'ID Card Active'}</span>
              </span>
              <span className="text-[10px] text-text-secondary">
                {currentWard.school || 'University of Lagos'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-border">
            <button 
              onClick={() => setShowTopUpChildModal(true)}
              className="bg-primary hover:bg-primary/90 text-white rounded-2xl py-2.5 px-2 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <ArrowUpCircle size={15} />
              <span>Instant Top-Up</span>
            </button>
            <button 
              onClick={() => setActiveTab('SERVICES')}
              className="bg-bg hover:bg-border/40 text-text-primary border border-border rounded-2xl py-2.5 px-2 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LayoutGrid size={15} className="text-primary" />
              <span>School Services</span>
            </button>
            <button 
              onClick={() => setActiveTab('ALLOWANCE')}
              className="bg-bg hover:bg-border/40 text-text-primary border border-border rounded-2xl py-2.5 px-2 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Zap size={15} className="text-emerald-600" />
              <span>Allowance</span>
            </button>
          </div>
        </div>
      </div>

      {/* Control Tabs with Horizontal Scrolling Support */}
      <div className="px-6 mb-6">
        <div className="flex sm:grid sm:grid-cols-6 gap-1 bg-surface p-1.5 rounded-2xl border border-border text-center shadow-xs overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('OVERVIEW')}
            className={`py-2 px-3 text-[11px] sm:text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 sm:shrink ${
              activeTab === 'OVERVIEW' ? 'bg-primary text-white shadow-xs' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('SERVICES')}
            className={`py-2 px-3 text-[11px] sm:text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 sm:shrink flex items-center justify-center gap-1 ${
              activeTab === 'SERVICES' ? 'bg-primary text-white shadow-xs' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Sparkles size={12} className={activeTab === 'SERVICES' ? 'text-white' : 'text-primary'} />
            <span>Services & Events</span>
          </button>
          <button 
            onClick={() => setActiveTab('ALLOWANCE')}
            className={`py-2 px-3 text-[11px] sm:text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 sm:shrink ${
              activeTab === 'ALLOWANCE' ? 'bg-primary text-white shadow-xs' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Allowance
          </button>
          <button 
            onClick={() => setActiveTab('LIMITS')}
            className={`py-2 px-3 text-[11px] sm:text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 sm:shrink ${
              activeTab === 'LIMITS' ? 'bg-primary text-white shadow-xs' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Caps
          </button>
          <button 
            onClick={() => setActiveTab('SECURITY')}
            className={`py-2 px-3 text-[11px] sm:text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 sm:shrink ${
              activeTab === 'SECURITY' ? 'bg-primary text-white shadow-xs' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Security
          </button>
          <button 
            onClick={() => setActiveTab('ALERTS')}
            className={`py-2 px-3 text-[11px] sm:text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 sm:shrink ${
              activeTab === 'ALERTS' ? 'bg-primary text-white shadow-xs' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Alerts
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="px-6 max-w-4xl mx-auto w-full">
        {allowanceSuccessMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-700 text-xs font-bold flex items-center gap-2"
          >
            <CheckCircle2 size={16} />
            <span>{allowanceSuccessMsg}</span>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'OVERVIEW' && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              
              {/* Action Quick Links */}
              <div className="bg-surface rounded-3xl border border-border overflow-hidden divide-y divide-border shadow-xs">
                <button onClick={() => setShowTopUpChildModal(true)} className="w-full flex items-center justify-between p-4 hover:bg-bg transition-colors text-left cursor-pointer">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                      <ArrowUpCircle size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-text-primary">Instant Child Top-Up</h4>
                      <p className="text-xs text-text-secondary">Send money directly to {currentWard.name}'s wallet</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-primary">Top Up</span>
                </button>

                <button onClick={() => setActiveTab('SERVICES')} className="w-full flex items-center justify-between p-4 hover:bg-bg transition-colors text-left cursor-pointer">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <LayoutGrid size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-text-primary">School Services, Events & YouTube Pass</h4>
                      <p className="text-xs text-text-secondary">Pay PTA dues, convocation tickets, live stream & custom unlisted fees</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-primary">Explore Services</span>
                </button>

                <button onClick={() => setActiveTab('ALLOWANCE')} className="w-full flex items-center justify-between p-4 hover:bg-bg transition-colors text-left cursor-pointer">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-600">
                      <Zap size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-text-primary">Automated Allowance Schedule</h4>
                      <p className="text-xs text-text-secondary">{currentWard.allowanceFrequency || 'Weekly'} • {formatCurrency(currentWard.allowanceAmount || 5000)}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-primary">Configure</span>
                </button>

                <button onClick={() => setActiveTab('LIMITS')} className="w-full flex items-center justify-between p-4 hover:bg-bg transition-colors text-left cursor-pointer">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                      <Sliders size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-text-primary">Category Spending Caps</h4>
                      <p className="text-xs text-text-secondary">Daily Limit: {formatCurrency(currentWard.dailyLimit || 8000)}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-primary">Adjust Caps</span>
                </button>

                <button onClick={() => setActiveTab('SECURITY')} className="w-full flex items-center justify-between p-4 hover:bg-bg transition-colors text-left cursor-pointer">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${currentWard.cardFrozen ? 'bg-danger/10 text-danger' : 'bg-emerald-500/10 text-emerald-600'}`}>
                      {currentWard.cardFrozen ? <Lock size={20} /> : <Unlock size={20} />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-text-primary">Digital ID Card Security</h4>
                      <p className="text-xs text-text-secondary">
                        {currentWard.cardFrozen ? '🔒 Card is currently locked' : '🟢 Card is active & protected'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-primary">Security</span>
                </button>

                {/* Ward Privacy & Data Security Notice */}
                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-text-primary">Student Privacy & Transaction Protection</h4>
                      <p className="text-[11px] text-text-secondary leading-tight">
                        Ward balance is displayed for funding assistance. Individual transaction ledger and itemized receipts are kept confidential to the student.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: SERVICES & EVENTS (Parent Services + Custom Manual Fee Input) */}
          {activeTab === 'SERVICES' && (
            <motion.div key="services" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              
              {/* SECTION A: MANUAL CUSTOM SERVICE INPUT PORTAL FOR PARENTS */}
              <div className="bg-surface rounded-3xl p-6 border border-primary/25 shadow-xs relative overflow-hidden">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-xs">
                    <PlusCircle size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] bg-primary/15 text-primary font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Parent Manual Fee Gateway
                    </span>
                    <h3 className="text-base font-bold text-text-primary">Pay for Unlisted School Fee or Service</h3>
                  </div>
                </div>
                <p className="text-xs text-text-secondary mb-5 leading-relaxed">
                  Parents can manually input any specific fee or school service (e.g. specialized excursion, hall refurbishment, departmental levies, course kits) to pay directly with instant receipt generation.
                </p>

                <form onSubmit={handlePayParentCustomService} className="space-y-4">
                  {/* Service Name */}
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1">
                      Service / Fee Name <span className="text-danger">*</span>
                    </label>
                    <input 
                      type="text"
                      placeholder="e.g. Annual PTA ICT Contribution, Final Year Excursion, Hall Repair Levy"
                      value={parentCustomServiceName}
                      onChange={(e) => setParentCustomServiceName(e.target.value)}
                      required
                      className="w-full bg-bg border border-border rounded-xl px-3.5 py-2.5 text-sm font-semibold text-text-primary focus:outline-none focus:border-primary"
                    />
                  </div>

                  {/* Ward Beneficiary & School Department */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-text-secondary mb-1">
                        Select Target Student / Child <span className="text-danger">*</span>
                      </label>
                      <select
                        value={parentCustomWardId}
                        onChange={(e) => setParentCustomWardId(e.target.value)}
                        className="w-full bg-bg border border-border rounded-xl px-3.5 py-2.5 text-xs font-bold text-text-primary focus:outline-none focus:border-primary"
                      >
                        {wards.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.name} ({w.studentId})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-text-secondary mb-1">
                        Beneficiary University Unit <span className="text-danger">*</span>
                      </label>
                      <select
                        value={parentCustomDepartment}
                        onChange={(e) => setParentCustomDepartment(e.target.value)}
                        className="w-full bg-bg border border-border rounded-xl px-3.5 py-2.5 text-xs font-bold text-text-primary focus:outline-none focus:border-primary"
                      >
                        <option value="Bursary Office">Bursary Office (Central)</option>
                        <option value="PTA & Guardian Secretariat">PTA & Guardian Secretariat</option>
                        <option value="Faculty Dean Secretariat">Faculty Dean Secretariat</option>
                        <option value="Student Affairs Division">Student Affairs Division</option>
                        <option value="Hall Warden Office">Hall Warden Office</option>
                        <option value="Sports Council">University Sports Council</option>
                        <option value="Media & ICT Centre">Media & ICT Centre</option>
                        <option value="Other School Unit">Other School Unit</option>
                      </select>
                    </div>
                  </div>

                  {/* Amount and Ref */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-text-secondary mb-1">
                        Payment Amount (₦) <span className="text-danger">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-text-secondary">₦</span>
                        <input 
                          type="number"
                          placeholder="e.g. 5000"
                          value={parentCustomAmount}
                          onChange={(e) => setParentCustomAmount(e.target.value)}
                          min="1"
                          required
                          className="w-full bg-bg border border-border rounded-xl pl-8 pr-4 py-2.5 text-sm font-black font-mono text-text-primary focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-text-secondary">
                          Invoice / Ref Number
                        </label>
                        <button
                          type="button"
                          onClick={() => setParentCustomRef('PAR-' + Math.floor(100000 + Math.random() * 900000))}
                          className="text-[10px] text-primary font-bold hover:underline"
                        >
                          Auto-Generate
                        </button>
                      </div>
                      <input 
                        type="text"
                        placeholder="e.g. PAR-89421"
                        value={parentCustomRef}
                        onChange={(e) => setParentCustomRef(e.target.value)}
                        className="w-full bg-bg border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono font-semibold text-text-primary focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Optional Note */}
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1">
                      Guardian Note / Reference Note (Optional)
                    </label>
                    <input 
                      type="text"
                      placeholder="e.g. Paid for Sarah Davies - Second Semester Special Clearance"
                      value={parentCustomNote}
                      onChange={(e) => setParentCustomNote(e.target.value)}
                      className="w-full bg-bg border border-border rounded-xl px-3.5 py-2 text-xs text-text-primary focus:outline-none focus:border-primary"
                    />
                  </div>

                  {parentCustomError && (
                    <div className="p-3 bg-danger/10 border border-danger/30 rounded-xl text-danger text-xs font-bold flex items-center gap-1.5">
                      <AlertCircle size={15} />
                      <span>{parentCustomError}</span>
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={isProcessingParentCustom}
                    className="w-full py-3.5 rounded-2xl bg-primary text-white font-bold text-xs hover:bg-primary/90 cursor-pointer disabled:opacity-50 transition shadow-md flex items-center justify-center gap-2"
                  >
                    {isProcessingParentCustom ? (
                      'Processing Payment...'
                    ) : (
                      <>
                        <Send size={15} />
                        <span>Pay {formatCurrency(Number(parentCustomAmount) || 0)} for Custom Service</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* SECTION B: CURATED SCHOOL SERVICES & EVENTS FOR GUARDIANS */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-text-primary">
                      School Services & Event Tickets ({PARENT_CURATED_SERVICES.length})
                    </h3>
                    <p className="text-[11px] text-text-secondary">
                      Official university packages and digital event passes available for guardians
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {PARENT_CURATED_SERVICES.map((srv) => (
                    <div 
                      key={srv.id}
                      className="bg-surface rounded-3xl p-5 border border-border flex flex-col justify-between shadow-2xs hover:border-primary transition-all group space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${srv.color} shrink-0`}>
                            {srv.icon}
                          </div>
                          {srv.badge && (
                            <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                              {srv.badge}
                            </span>
                          )}
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">
                            {srv.title}
                          </h4>
                          <p className="text-xs text-text-secondary mt-1 leading-relaxed line-clamp-2">
                            {srv.desc}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-border flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-text-secondary block">{srv.tag}</span>
                          <span className="text-sm font-bold text-text-primary font-mono">
                            {formatCurrency(srv.price)}
                          </span>
                        </div>
                        <button
                          onClick={() => handlePayCuratedService(srv)}
                          className="bg-primary hover:bg-primary/90 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-xs flex items-center gap-1 cursor-pointer"
                        >
                          <CreditCard size={13} />
                          <span>Pay Now</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: ALLOWANCE */}
          {activeTab === 'ALLOWANCE' && (
            <motion.div key="allowance" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="bg-surface rounded-3xl p-6 border border-border shadow-xs space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-text-primary">Automated Allowance Schedule</h3>
                    <p className="text-xs text-text-secondary">Automate recurring funding to {currentWard.name}'s wallet</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={ctx.allowance.enabled} 
                    onChange={(e) => ctx.setAllowance(prev => ({ ...prev, enabled: e.target.checked }))}
                    className="w-5 h-5 accent-primary cursor-pointer"
                  />
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1">Allowance Amount (₦)</label>
                    <input 
                      type="number" 
                      value={currentWard.allowanceAmount ?? ctx.allowance.amount} 
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : Number(e.target.value);
                        ctx.updateWard(currentWard.id, { allowanceAmount: val });
                        ctx.setAllowance(prev => ({ ...prev, amount: val }));
                      }}
                      className="w-full bg-bg border border-border rounded-2xl px-4 py-3 text-sm font-bold text-text-primary focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1">Frequency</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Daily', 'Weekly', 'Monthly'] as const).map(freq => (
                        <button
                          key={freq}
                          onClick={() => {
                            ctx.updateWard(currentWard.id, { allowanceFrequency: freq });
                            ctx.setAllowance(prev => ({ ...prev, frequency: freq }));
                          }}
                          className={`py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                            (currentWard.allowanceFrequency || ctx.allowance.frequency) === freq 
                              ? 'bg-primary text-white border-primary' 
                              : 'bg-bg text-text-secondary border-border hover:text-text-primary'
                          }`}
                        >
                          {freq}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-bg p-4 rounded-2xl border border-border flex items-center justify-between text-xs">
                    <span className="text-text-secondary flex items-center gap-1.5">
                      <Calendar size={14} className="text-primary" /> Next Auto-Payout:
                    </span>
                    <span className="font-bold text-text-primary">{ctx.allowance.nextScheduleDate}</span>
                  </div>

                  <button 
                    onClick={handleInstantAllowance}
                    className="w-full bg-emerald-600 text-white rounded-2xl py-3.5 font-bold shadow-md shadow-emerald-600/25 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <Zap size={16} />
                    <span>Send Instant Allowance Now ({formatCurrency(currentWard.allowanceAmount || ctx.allowance.amount)})</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: SPENDING CAPS */}
          {activeTab === 'LIMITS' && (
            <motion.div key="limits" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="bg-surface rounded-3xl p-6 border border-border shadow-xs space-y-5">
                <div>
                  <h3 className="text-base font-bold text-text-primary mb-1">Daily Max Spending Limit</h3>
                  <p className="text-xs text-text-secondary">Maximum total spending allowed per day for {currentWard.name}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <input 
                      type="number" 
                      value={currentWard.dailyLimit ?? ctx.spendingLimits.dailyLimit} 
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : Number(e.target.value);
                        ctx.updateWard(currentWard.id, { dailyLimit: val });
                        ctx.setSpendingLimits(prev => ({ ...prev, dailyLimit: val }));
                      }}
                      className="w-full bg-bg border border-border rounded-2xl px-4 py-3 text-sm font-bold text-text-primary focus:outline-none focus:border-primary"
                    />
                  </div>
                  <span className="text-xs font-bold text-text-secondary">/ day</span>
                </div>

                <div className="pt-4 border-t border-border space-y-3">
                  <h3 className="text-sm font-bold text-text-primary">Category Spending Caps (Per Day)</h3>

                  <div className="space-y-3">
                    {Object.entries(ctx.spendingLimits.categoryCaps).map(([category, capAmount]) => {
                      const spent = catSpent[category] || 0;
                      const percent = Math.min(100, Math.round((spent / (capAmount || 1)) * 100));

                      return (
                        <div key={category} className="bg-bg p-4 rounded-2xl border border-border space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-text-primary">{category}</span>
                            <span className="text-xs text-text-secondary font-mono">
                              Spent: <strong className="text-text-primary">{formatCurrency(spent)}</strong>
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <input 
                              type="number" 
                              value={capAmount === 0 ? '' : capAmount}
                              onChange={(e) => {
                                const val = e.target.value === '' ? 0 : Number(e.target.value);
                                ctx.setSpendingLimits(prev => ({
                                  ...prev,
                                  categoryCaps: { ...prev.categoryCaps, [category]: val }
                                }));
                              }}
                              className="w-28 bg-surface border border-border rounded-xl px-3 py-1.5 text-xs font-bold text-text-primary focus:outline-none focus:border-primary"
                            />
                            <div className="flex-1 bg-surface h-2.5 rounded-full overflow-hidden border border-border">
                              <div 
                                className={`h-full rounded-full transition-all ${percent > 85 ? 'bg-danger' : percent > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-text-secondary">{percent}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 5: SECURITY */}
          {activeTab === 'SECURITY' && (
            <motion.div key="security" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="bg-surface rounded-3xl p-6 border border-border shadow-xs space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-text-primary">Instant Card Freeze & Security</h3>
                    <p className="text-xs text-text-secondary">Protect {currentWard.name}'s account if ID is lost or compromised</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${currentWard.cardFrozen ? 'bg-danger/10 text-danger border border-danger/30' : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'}`}>
                    {currentWard.cardFrozen ? 'LOCKED' : 'SECURE'}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-bg border border-border flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${currentWard.cardFrozen ? 'bg-danger/15 text-danger' : 'bg-emerald-500/15 text-emerald-600'}`}>
                      {currentWard.cardFrozen ? <Lock size={22} /> : <Unlock size={22} />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-text-primary">
                        {currentWard.cardFrozen ? 'Digital Student Card Frozen' : 'Digital Student Card Active'}
                      </h4>
                      <p className="text-xs text-text-secondary">
                        {currentWard.cardFrozen ? 'QR code and POS payments are currently blocked.' : 'Student can seamlessly pay at campus terminals.'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={toggleFreezeCard}
                    className={`px-4 py-3 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0 ${currentWard.cardFrozen ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-danger text-white hover:bg-danger/90'}`}
                  >
                    {currentWard.cardFrozen ? 'Unfreeze Card' : 'Freeze Card'}
                  </button>
                </div>

                {/* Unlink Account Danger Action */}
                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-text-primary">Unlink {currentWard.name}'s Account</h4>
                    <p className="text-[11px] text-text-secondary">Remove this student from your guardian monitoring dashboard</p>
                  </div>
                  <button
                    onClick={() => setShowUnlinkConfirmModal(currentWard.id)}
                    className="text-xs font-bold text-danger hover:bg-danger/10 px-3 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 size={14} /> Unlink
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 6: ALERTS */}
          {activeTab === 'ALERTS' && (
            <motion.div key="alerts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="bg-surface rounded-3xl p-6 border border-border shadow-xs space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-text-primary">Low-Balance Warning System</h3>
                    <p className="text-xs text-text-secondary">Get notified when ward balance drops low</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={ctx.alertSettings.enabled} 
                    onChange={(e) => ctx.setAlertSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                    className="w-5 h-5 accent-primary cursor-pointer"
                  />
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1">Low Balance Alert Threshold (₦)</label>
                    <input 
                      type="number" 
                      value={ctx.alertSettings.lowBalanceThreshold === 0 ? '' : ctx.alertSettings.lowBalanceThreshold} 
                      onChange={(e) => ctx.setAlertSettings(prev => ({ ...prev, lowBalanceThreshold: e.target.value === '' ? 0 : Number(e.target.value) }))}
                      className="w-full bg-bg border border-border rounded-2xl px-4 py-3 text-sm font-bold text-text-primary focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 text-xs text-text-secondary leading-relaxed">
                    <p className="font-bold text-primary mb-1 flex items-center gap-1">
                      <Bell size={14} /> Alert Notification Behavior
                    </p>
                    When {currentWard.name}'s wallet drops below <strong className="text-text-primary">{formatCurrency(ctx.alertSettings.lowBalanceThreshold || 3000)}</strong>, an instant alert banner will appear on both your parent dashboard and the student's home view with a 1-tap quick top-up action.
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* MODAL: ADD CHILD / LINK STUDENT ACCOUNT */}
      <AnimatePresence>
        {showAddChildModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddChildModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative z-10 w-full max-w-md bg-surface rounded-3xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="bg-primary p-6 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white">
                    <UserPlus size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Link Student Account</h3>
                    <p className="text-xs text-white/80">Connect child's university ID to your portal</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAddChildModal(false)}
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateChild} className="p-6 space-y-4 overflow-y-auto flex-1 text-text-primary">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Student Full Legal Name *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. David Davies"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    required
                    className="w-full bg-bg border border-border rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1">Student Matric / ID *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 24-00891"
                      value={childStudentId}
                      onChange={(e) => setChildStudentId(e.target.value)}
                      required
                      className="w-full bg-bg border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono font-semibold uppercase focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1">Relationship *</label>
                    <select
                      value={childRelationship}
                      onChange={(e) => setChildRelationship(e.target.value as any)}
                      className="w-full bg-bg border border-border rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-primary"
                    >
                      <option value="Daughter">Daughter</option>
                      <option value="Son">Son</option>
                      <option value="Ward">Ward</option>
                      <option value="Sibling">Sibling</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">University / Institution *</label>
                  <select
                    value={childSchool}
                    onChange={(e) => setChildSchool(e.target.value)}
                    className="w-full bg-bg border border-border rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-primary"
                  >
                    {CAMPUSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1">Department & Level</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Mechanical Eng • 200L"
                      value={childDepartment}
                      onChange={(e) => setChildDepartment(e.target.value)}
                      className="w-full bg-bg border border-border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1">Initial Wallet Fund (₦)</label>
                    <input 
                      type="number" 
                      placeholder="5000"
                      value={childInitialFund || ''}
                      onChange={(e) => setChildInitialFund(Number(e.target.value))}
                      className="w-full bg-bg border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Avatar Selection */}
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-2">Select Avatar</label>
                  <div className="flex gap-2">
                    {PRESET_AVATARS.map((av, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setChildAvatar(av)}
                        className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition cursor-pointer ${childAvatar === av ? 'border-primary scale-110' : 'border-border opacity-70'}`}
                      >
                        <img src={av} alt="Avatar" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowAddChildModal(false)}
                    className="flex-1 py-3 rounded-xl border border-border font-bold text-xs hover:bg-bg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 cursor-pointer shadow-xs"
                  >
                    Link Student Account
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: TOP UP CHILD WALLET */}
      <AnimatePresence>
        {showTopUpChildModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTopUpChildModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative z-10 w-full max-w-md bg-surface rounded-3xl shadow-2xl border border-border overflow-hidden text-text-primary"
            >
              <div className="bg-primary p-6 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Avatar src={currentWard.avatar} name={currentWard.name} size="sm" className="border border-white/40" />
                  <div>
                    <h3 className="text-base font-bold text-white">Top Up {currentWard.name}'s Wallet</h3>
                    <p className="text-xs text-white/80">Funds are immediately available for QR & POS spend</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowTopUpChildModal(false)}
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Preset Chips */}
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-2">Select Amount</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[2000, 5000, 10000, 15000, 20000, 50000].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => { setTopUpAmount(amt); setCustomTopUpAmount(''); }}
                        className={`py-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                          topUpAmount === amt && !customTopUpAmount 
                            ? 'bg-primary text-white border-primary shadow-xs' 
                            : 'bg-bg border-border text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        {formatCurrency(amt)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Amount */}
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Or Enter Custom Amount (₦)</label>
                  <input 
                    type="number"
                    placeholder="e.g. 7500"
                    value={customTopUpAmount}
                    onChange={(e) => setCustomTopUpAmount(e.target.value)}
                    className="w-full bg-bg border border-border rounded-xl px-3.5 py-2.5 text-sm font-bold font-mono focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Funding Source */}
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Funding Source</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setTopUpSource('BANK')}
                      className={`p-2 rounded-xl border text-left text-xs transition cursor-pointer ${
                        topUpSource === 'BANK' ? 'border-primary bg-primary/10 font-bold' : 'border-border bg-bg'
                      }`}
                    >
                      <Building size={14} className="mb-1 text-primary" />
                      <p className="text-[11px] font-bold">Zenith Bank</p>
                      <p className="text-[9px] text-text-secondary">•••• 4092</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTopUpSource('CARD')}
                      className={`p-2 rounded-xl border text-left text-xs transition cursor-pointer ${
                        topUpSource === 'CARD' ? 'border-primary bg-primary/10 font-bold' : 'border-border bg-bg'
                      }`}
                    >
                      <CreditCard size={14} className="mb-1 text-emerald-600" />
                      <p className="text-[11px] font-bold">Mastercard</p>
                      <p className="text-[9px] text-text-secondary">•••• 8821</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTopUpSource('WALLET')}
                      className={`p-2 rounded-xl border text-left text-xs transition cursor-pointer ${
                        topUpSource === 'WALLET' ? 'border-primary bg-primary/10 font-bold' : 'border-border bg-bg'
                      }`}
                    >
                      <Wallet size={14} className="mb-1 text-purple-600" />
                      <p className="text-[11px] font-bold">Parent Bal.</p>
                      <p className="text-[9px] text-text-secondary">{formatCurrency(ctx.balance || 0)}</p>
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setShowTopUpChildModal(false)}
                    className="flex-1 py-3 rounded-xl border border-border font-bold text-xs hover:bg-bg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    disabled={isProcessingTopUp}
                    onClick={handleExecuteTopUp}
                    className="flex-1 py-3 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 cursor-pointer disabled:opacity-50 shadow-xs flex items-center justify-center gap-1.5"
                  >
                    {isProcessingTopUp ? 'Processing...' : `Fund ${formatCurrency(customTopUpAmount ? Number(customTopUpAmount) : topUpAmount)}`}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: UNLINK CHILD CONFIRMATION */}
      <AnimatePresence>
        {showUnlinkConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUnlinkConfirmModal(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative z-10 w-full max-w-sm bg-surface rounded-3xl shadow-2xl border border-border p-6 text-center text-text-primary space-y-4"
            >
              <div className="w-14 h-14 rounded-full bg-danger/10 text-danger flex items-center justify-center mx-auto">
                <AlertTriangle size={28} />
              </div>
              <div>
                <h3 className="text-base font-bold">Unlink Student Account?</h3>
                <p className="text-xs text-text-secondary mt-1">
                  You will no longer be able to monitor transactions, manage allowances, or set spending caps for this student.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setShowUnlinkConfirmModal(null)}
                  className="flex-1 py-3 rounded-xl border border-border font-bold text-xs hover:bg-bg cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleUnlinkChild(showUnlinkConfirmModal)}
                  className="flex-1 py-3 rounded-xl bg-danger text-white font-bold text-xs hover:bg-danger/90 cursor-pointer shadow-xs"
                >
                  Confirm Unlink
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: FUND PARENT WALLET */}
      <AnimatePresence>
        {showFundParentWalletModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFundParentWalletModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative z-10 w-full max-w-md bg-surface rounded-3xl shadow-2xl border border-border p-6 text-text-primary space-y-4"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Wallet size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">Fund Parent Account Wallet</h3>
                    <p className="text-[10px] text-text-secondary">Add funds to finance ward allowances & fees</p>
                  </div>
                </div>
                <button onClick={() => setShowFundParentWalletModal(false)} className="p-1 rounded-full text-text-secondary hover:text-text-primary cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-text-secondary block mb-1.5">Funding Amount (₦)</label>
                  <input 
                    type="number"
                    value={parentFundAmount}
                    onChange={(e) => setParentFundAmount(e.target.value)}
                    className="w-full bg-bg border border-border rounded-xl px-3.5 py-2.5 text-base font-black text-primary font-mono focus:outline-none focus:border-primary"
                    placeholder="20000"
                  />
                  <div className="flex gap-2 mt-2">
                    {[5000, 10000, 25000, 50000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setParentFundAmount(preset.toString())}
                        className={`flex-1 py-1.5 rounded-lg border text-xs font-mono font-bold transition cursor-pointer ${
                          parentFundAmount === preset.toString() ? 'bg-primary text-white border-primary' : 'bg-bg border-border text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        ₦{(preset/1000).toFixed(0)}k
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-text-secondary block mb-1.5">Funding Source / Channel</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setParentFundMethod('TRANSFER')}
                      className={`p-2.5 rounded-xl border text-center text-xs transition cursor-pointer ${
                        parentFundMethod === 'TRANSFER' ? 'border-primary bg-primary/10 font-bold text-primary' : 'border-border bg-bg text-text-secondary'
                      }`}
                    >
                      <Building size={16} className="mx-auto mb-1" />
                      <span>Virtual Acct</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setParentFundMethod('CARD')}
                      className={`p-2.5 rounded-xl border text-center text-xs transition cursor-pointer ${
                        parentFundMethod === 'CARD' ? 'border-primary bg-primary/10 font-bold text-primary' : 'border-border bg-bg text-text-secondary'
                      }`}
                    >
                      <CreditCard size={16} className="mx-auto mb-1" />
                      <span>Debit Card</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setParentFundMethod('USSD')}
                      className={`p-2.5 rounded-xl border text-center text-xs transition cursor-pointer ${
                        parentFundMethod === 'USSD' ? 'border-primary bg-primary/10 font-bold text-primary' : 'border-border bg-bg text-text-secondary'
                      }`}
                    >
                      <Zap size={16} className="mx-auto mb-1" />
                      <span>USSD Code</span>
                    </button>
                  </div>
                </div>

                {parentFundMethod === 'TRANSFER' && (
                  <div className="p-3 bg-bg rounded-xl border border-border text-xs font-mono space-y-1 text-text-secondary">
                    <p className="font-bold text-text-primary">Dedicated Guardian Virtual Account:</p>
                    <p>Bank: <strong className="text-primary">Providus Bank</strong></p>
                    <p>Acct No: <strong className="text-primary">9928173921</strong></p>
                    <p>Name: <strong className="text-text-primary">UniPay • {ctx.user?.name || 'Guardian'}</strong></p>
                    <p className="text-[10px] text-emerald-600 mt-1">⚡ Instant automated credit upon bank transfer.</p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setShowFundParentWalletModal(false)}
                    className="flex-1 py-3 rounded-xl border border-border font-bold text-xs hover:bg-bg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    disabled={isProcessingParentFund}
                    onClick={handleFundParentWallet}
                    className="flex-1 py-3 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 cursor-pointer disabled:opacity-50 shadow-xs flex items-center justify-center gap-1.5"
                  >
                    {isProcessingParentFund ? 'Processing...' : `Fund ${formatCurrency(parseFloat(parentFundAmount) || 0)}`}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Transaction Receipt Modal */}
      {parentSuccessTx && (
        <TransactionReceipt 
          tx={parentSuccessTx} 
          onClose={() => setParentSuccessTx(null)} 
        />
      )}
    </div>
  );
}
