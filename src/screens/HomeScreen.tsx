import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, Plus, ArrowRightLeft, QrCode, MoreHorizontal, Coffee, Printer, Bus, 
  GraduationCap, BookOpen, Calendar, ArrowDownCircle, ArrowUpCircle, ShieldAlert, 
  Eye, EyeOff, Sparkles, Wallet, TrendingUp, ChevronRight, ChevronLeft, Lock, Unlock,
  Home as HomeIcon, HeartPulse, Trophy, Wifi, Compass, FileCheck, PlusCircle, ArrowRight,
  KeyRound, ShieldCheck, Maximize2
} from 'lucide-react';
import { ScreenId, UserContextType, Transaction } from '../types';
import { formatCurrency } from '../data';
import { TransactionReceipt } from '../components/TransactionReceipt';
import { Avatar } from '../components/Avatar';
import { DigitalIdModal } from '../components/DigitalIdModal';

interface HomeScreenProps {
  ctx: UserContextType;
  setCurrentScreen: (screen: ScreenId) => void;
  onOpenNotifications?: () => void;
}

const CAT_ICONS: Record<string, React.ReactNode> = {
  Cafeteria: <Coffee size={20} className="text-amber-500" />,
  Printing: <Printer size={20} className="text-indigo-500" />,
  Transport: <Bus size={20} className="text-emerald-500" />,
  Fees: <GraduationCap size={20} className="text-rose-500" />,
  Bookstore: <BookOpen size={20} className="text-blue-500" />,
  Events: <Calendar size={20} className="text-purple-500" />,
  'Top-up': <ArrowDownCircle size={20} className="text-emerald-500" />,
  Transfer: <ArrowUpCircle size={20} className="text-primary" />
};

const PAYMENT_SERVICE_CATEGORIES = [
  {
    id: 'SERVICE_CAFETARIA',
    label: 'Cafeteria & Dining',
    icon: <Coffee size={24} />,
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    cardBg: 'from-amber-500/10 via-amber-500/5 to-transparent',
    badge: 'Hot Meals',
    desc: 'Order breakfast, jollof combos & lunch meal passes',
    startingPrice: 850,
    itemsCount: 5,
    tag: 'Food Court'
  },
  {
    id: 'SERVICE_PRINTING',
    label: 'Printing & Binding',
    icon: <Printer size={24} />,
    color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    cardBg: 'from-indigo-500/10 via-indigo-500/5 to-transparent',
    badge: 'Instant Print',
    desc: 'Thesis hardcovers, color scanning & laser printing',
    startingPrice: 350,
    itemsCount: 4,
    tag: 'Library'
  },
  {
    id: 'SERVICE_TRANSPORT',
    label: 'Campus Shuttle',
    icon: <Bus size={24} />,
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    cardBg: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
    badge: 'Shuttle Pass',
    desc: 'Faculty routes, express bus & 30-day student passes',
    startingPrice: 150,
    itemsCount: 4,
    tag: 'Transit Gate'
  },
  {
    id: 'SERVICE_BOOKSTORE',
    label: 'Bookstore & Texts',
    icon: <BookOpen size={24} />,
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    cardBg: 'from-blue-500/10 via-blue-500/5 to-transparent',
    badge: 'Curriculum',
    desc: 'General studies manuals, logbooks & calculators',
    startingPrice: 850,
    itemsCount: 4,
    tag: 'Bookshop'
  },
  {
    id: 'SERVICE_FEES',
    label: 'Tuition & Dues',
    icon: <GraduationCap size={24} />,
    color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    cardBg: 'from-rose-500/10 via-rose-500/5 to-transparent',
    badge: 'Official',
    desc: 'Faculty dues, SUG levies & clearance receipts',
    startingPrice: 1500,
    itemsCount: 4,
    tag: 'Bursary'
  },
  {
    id: 'SERVICE_HOSTEL',
    label: 'Hostel & Housing',
    icon: <HomeIcon size={24} />,
    color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    cardBg: 'from-purple-500/10 via-purple-500/5 to-transparent',
    badge: 'Residence',
    desc: 'Hall maintenance, smart laundry tokens & tags',
    startingPrice: 1500,
    itemsCount: 4,
    tag: 'Hall Warden'
  },
  {
    id: 'SERVICE_HEALTH',
    label: 'Clinic & Health',
    icon: <HeartPulse size={24} />,
    color: 'text-pink-500 bg-pink-500/10 border-pink-500/20',
    cardBg: 'from-pink-500/10 via-pink-500/5 to-transparent',
    badge: '24/7 Care',
    desc: 'Medical triage tokens, lab panels & prescriptions',
    startingPrice: 1000,
    itemsCount: 4,
    tag: 'Clinic'
  },
  {
    id: 'SERVICE_SPORTS',
    label: 'Sports & Gym',
    icon: <Trophy size={24} />,
    color: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
    cardBg: 'from-amber-500/10 via-amber-500/5 to-transparent',
    badge: 'Gym Pass',
    desc: 'Semester gym membership, pool & tennis court slots',
    startingPrice: 800,
    itemsCount: 4,
    tag: 'Sports Complex'
  },
  {
    id: 'SERVICE_IT_WIFI',
    label: 'IT & Wi-Fi Boost',
    icon: <Wifi size={24} />,
    color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
    cardBg: 'from-cyan-500/10 via-cyan-500/5 to-transparent',
    badge: 'High Speed',
    desc: '50GB campus Wi-Fi vouchers & cloud lab credits',
    startingPrice: 2000,
    itemsCount: 3,
    tag: 'IT Centre'
  },
  {
    id: 'SERVICE_EXCURSION',
    label: 'Field Trips & Tours',
    icon: <Compass size={24} />,
    color: 'text-teal-500 bg-teal-500/10 border-teal-500/20',
    cardBg: 'from-teal-500/10 via-teal-500/5 to-transparent',
    badge: 'Excursions',
    desc: 'Industrial visits, safety kits & camping passes',
    startingPrice: 5000,
    itemsCount: 2,
    tag: 'Faculty'
  },
  {
    id: 'SERVICE_CERTIFICATES',
    label: 'Transcripts & Docs',
    icon: <FileCheck size={24} />,
    color: 'text-violet-500 bg-violet-500/10 border-violet-500/20',
    cardBg: 'from-violet-500/10 via-violet-500/5 to-transparent',
    badge: 'Certified',
    desc: 'Electronic transcripts & statement of results',
    startingPrice: 1000,
    itemsCount: 4,
    tag: 'Registry'
  },
  {
    id: 'SERVICE_EVENTS',
    label: 'Events & Socials',
    icon: <Calendar size={24} />,
    color: 'text-fuchsia-500 bg-fuchsia-500/10 border-fuchsia-500/20',
    cardBg: 'from-fuchsia-500/10 via-fuchsia-500/5 to-transparent',
    badge: 'Tickets',
    desc: 'Innovation gala tickets, hall dinners & derby games',
    startingPrice: 500,
    itemsCount: 4,
    tag: 'Socials'
  }
];

export function HomeScreen({ ctx, setCurrentScreen, onOpenNotifications }: HomeScreenProps) {
  const [showBalance, setShowBalance] = useState(true);
  const [cardLocked, setCardLocked] = useState(false);
  const [showIdModal, setShowIdModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.pageX - (scrollContainerRef.current?.offsetLeft || 0);
    scrollLeftRef.current = scrollContainerRef.current?.scrollLeft || 0;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const x = e.pageX - (scrollContainerRef.current?.offsetLeft || 0);
    const walk = (x - startXRef.current);
    if (Math.abs(walk) > 4) {
      hasDraggedRef.current = true;
    }
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollLeftRef.current - walk;
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const recentTx = ctx.transactions.slice(0, 4);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -260, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 260, behavior: 'smooth' });
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 22) return 'Good evening';
    return 'Good night';
  };

  const todaySpent = ctx.transactions
    .filter(t => t.type === 'debit' && t.date === 'Today')
    .reduce((sum, t) => sum + t.amount, 0);

  const dailyLimit = ctx.spendingLimits?.dailyLimit || 8000;
  const budgetUsedPct = Math.min(100, Math.round((todaySpent / dailyLimit) * 100));

  // Dynamic user data extraction for Digital ID card and Student Profile
  const institutionName = ctx.user.institution || ctx.user.school || 'University of Lagos (UNILAG)';
  const userLevel = ctx.user.level || (ctx.user.department && ctx.user.department.includes('•') ? ctx.user.department.split('•')[1].trim() : '300 Level');
  const userDepartment = ctx.user.department && ctx.user.department.includes('•') ? ctx.user.department.split('•')[0].trim() : (ctx.user.department || 'Computer Science');
  const userDisplayId = ctx.user.studentId || ctx.user.id || '24-00192';

  const filteredCategories = PAYMENT_SERVICE_CATEGORIES.filter(cat => {
    if (selectedCategoryFilter === 'ALL') return true;
    if (selectedCategoryFilter === 'ESSENTIALS') return ['SERVICE_CAFETARIA', 'SERVICE_PRINTING', 'SERVICE_TRANSPORT', 'SERVICE_BOOKSTORE'].includes(cat.id);
    if (selectedCategoryFilter === 'ACADEMICS') return ['SERVICE_FEES', 'SERVICE_BOOKSTORE', 'SERVICE_CERTIFICATES', 'SERVICE_EXCURSION'].includes(cat.id);
    if (selectedCategoryFilter === 'LIVING') return ['SERVICE_HOSTEL', 'SERVICE_HEALTH', 'SERVICE_SPORTS', 'SERVICE_IT_WIFI', 'SERVICE_EVENTS'].includes(cat.id);
    return true;
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col w-full bg-bg pb-24"
    >
      {/* OPay-Style Vibrant Student Header Banner */}
      <div className="bg-gradient-to-r from-primary via-[#4338ca] to-[#1e1b4b] px-6 pt-8 sm:pt-10 pb-8 shadow-md rounded-b-[36px] relative overflow-hidden mb-6 text-white">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-20 top-4 w-24 h-24 bg-accent/20 rounded-full blur-xl pointer-events-none" />

        <div className="flex justify-between items-center mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <Avatar 
              src={ctx.user.avatar} 
              name={ctx.user.name} 
              role={ctx.user.role} 
              size="lg" 
              className="border-2 border-white/40 shadow-sm" 
            />
            <div>
              <p className="text-xs text-white/80 font-medium">{getGreeting()},</p>
              <h2 className="text-base font-extrabold text-white leading-tight">{ctx.user.name}</h2>
            </div>
          </div>
          <button 
            onClick={onOpenNotifications}
            className="w-11 h-11 rounded-2xl border border-white/25 flex items-center justify-center relative bg-white/10 backdrop-blur-md cursor-pointer hover:bg-white/20 transition-colors"
            title="Notification Center"
            aria-label="Open Notification Center"
          >
            <Bell size={20} className="text-white" />
            {ctx.unreadNotificationCount > 0 ? (
              <span className="absolute top-2 right-2 px-1.5 py-0.2 bg-danger text-white text-[9px] font-extrabold rounded-full animate-pulse border border-white">
                {ctx.unreadNotificationCount}
              </span>
            ) : ctx.balance < ctx.alertSettings?.lowBalanceThreshold ? (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-danger rounded-full border border-white animate-pulse"></span>
            ) : null}
          </button>
        </div>

        {/* Low Balance Alert Notification */}
        {ctx.alertSettings?.enabled && ctx.balance < ctx.alertSettings.lowBalanceThreshold && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3.5 bg-danger/20 backdrop-blur-md border border-danger/40 rounded-2xl flex items-center justify-between gap-2 text-white relative z-10"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <ShieldAlert size={18} className="text-danger shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">Low Wallet Balance Alert</p>
                <p className="text-[10px] text-white/80 truncate">Below threshold ({formatCurrency(ctx.alertSettings.lowBalanceThreshold)})</p>
              </div>
            </div>
            <button 
              onClick={() => setCurrentScreen('TOP_UP')}
              className="bg-danger text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-xs hover:bg-danger/95 transition-colors cursor-pointer shrink-0"
            >
              Top Up
            </button>
          </motion.div>
        )}

        {/* Wallet Balance Card (OPay Style) */}
        <div className="bg-white/15 backdrop-blur-md rounded-2xl p-5 border border-white/25 shadow-xl relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-white/80 text-xs font-medium flex items-center gap-1.5">
                  <Wallet size={14} /> Available Balance
                </p>
                <button 
                  onClick={() => setShowBalance(!showBalance)}
                  className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
                  title={showBalance ? 'Hide balance' : 'Show balance'}
                  aria-label={showBalance ? 'Hide balance' : 'Show balance'}
                >
                  {showBalance ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight font-mono text-white">
                {showBalance ? formatCurrency(ctx.balance) : '₦ • • • • • •'}
              </h3>
            </div>
            <div className="bg-white/20 px-3 py-1 rounded-xl backdrop-blur-md border border-white/30 shrink-0 text-right">
              <span className="text-[10px] font-mono tracking-wider block text-white/70">
                {ctx.user.role === 'STUDENT' ? 'STUDENT ID' : ctx.user.role === 'MERCHANT' ? 'MERCHANT ID' : 'ACCOUNT ID'}
              </span>
              <span className="text-xs font-mono font-bold text-white">{userDisplayId}</span>
            </div>
          </div>

          {/* Quick Action Bar inside Wallet */}
          <div className="grid grid-cols-4 gap-2 pt-3 border-t border-white/20">
            <button onClick={() => setCurrentScreen('TOP_UP')} className="flex flex-col items-center gap-1.5 group cursor-pointer">
              <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-white/30 transition-colors shadow-xs">
                <Plus size={18} className="text-white" />
              </div>
              <span className="text-[10px] font-bold text-white">Top Up</span>
            </button>
            <button onClick={() => setCurrentScreen('QR_PAY')} className="flex flex-col items-center gap-1.5 group cursor-pointer">
              <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-white/30 transition-colors shadow-xs">
                <QrCode size={18} className="text-white" />
              </div>
              <span className="text-[10px] font-bold text-white">Scan QR</span>
            </button>
            <button onClick={() => setCurrentScreen('SERVICES')} className="flex flex-col items-center gap-1.5 group cursor-pointer">
              <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-white/30 transition-colors shadow-xs">
                <ArrowRightLeft size={18} className="text-white" />
              </div>
              <span className="text-[10px] font-bold text-white">Transfer</span>
            </button>
            <button onClick={() => setCurrentScreen('SERVICES')} className="flex flex-col items-center gap-1.5 group cursor-pointer">
              <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-white/30 transition-colors shadow-xs">
                <MoreHorizontal size={18} className="text-white" />
              </div>
              <span className="text-[10px] font-bold text-white">Services</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 max-w-6xl mx-auto w-full space-y-6">
        
        {/* Security Password Setup Banner (if user hasn't configured 6-digit login pass & 4-digit PIN) */}
        {(!ctx.hasLoginPassword || !ctx.hasTransactionPin) && (
          <motion.div 
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-primary/10 to-primary/5 border border-primary/20 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-bold shrink-0 shadow-md">
                <KeyRound size={22} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-extrabold text-text-primary">
                    Security Passwords Setup Required
                  </h4>
                  <span className="text-[10px] bg-primary text-white font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
                    Required for Transactions
                  </span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Please create your <strong>6-digit login password</strong> and <strong>4-digit transaction PIN</strong> to authorize campus wallet debits and food/bus payments.
                </p>
              </div>
            </div>
            <button
              onClick={() => ctx.openSecuritySetupModal()}
              className="bg-primary hover:bg-primary/95 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-md transition-all shrink-0 cursor-pointer flex items-center gap-2 active:scale-95"
            >
              <span>Set Up Passwords</span>
              <ArrowRight size={15} />
            </button>
          </motion.div>
        )}
        
        {/* PAYMENT SERVICE CARD WITH LEFT-TO-RIGHT HORIZONTAL SCROLLING */}
        <div className="bg-surface rounded-3xl p-6 border border-border shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-text-primary">Payment Service Hub</h3>
                  <p className="text-xs text-text-secondary">Scroll left to right to explore campus fee & facility payment portals</p>
                </div>
              </div>
            </div>

            {/* Controls: Left & Right Scroll Buttons + View All */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button 
                onClick={scrollLeft}
                className="w-8 h-8 rounded-xl bg-bg hover:bg-border border border-border flex items-center justify-center text-text-primary transition-all cursor-pointer shadow-2xs"
                title="Scroll Left"
                aria-label="Scroll Left"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                onClick={scrollRight}
                className="w-8 h-8 rounded-xl bg-bg hover:bg-border border border-border flex items-center justify-center text-text-primary transition-all cursor-pointer shadow-2xs"
                title="Scroll Right"
                aria-label="Scroll Right"
              >
                <ChevronRight size={18} />
              </button>
              <button 
                onClick={() => setCurrentScreen('SERVICES')} 
                className="text-xs font-bold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20 transition-all flex items-center gap-1 cursor-pointer ml-1"
              >
                All 12 Hubs <ArrowRight size={13} />
              </button>
            </div>
          </div>

          {/* Category Filter Chips Bar */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 pt-1">
            {[
              { id: 'ALL', label: 'All Services (12)' },
              { id: 'ESSENTIALS', label: 'Daily Essentials' },
              { id: 'ACADEMICS', label: 'Academic & Dues' },
              { id: 'LIVING', label: 'Campus Life & Health' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategoryFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  selectedCategoryFilter === tab.id
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-bg text-text-secondary hover:text-text-primary border border-border'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* HORIZONTALLY SCROLLABLE CARDS CONTAINER (Scroll from Left to Right) */}
          <div 
            ref={scrollContainerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="flex gap-4 overflow-x-auto scrollbar-none py-1 scroll-smooth snap-x snap-mandatory touch-pan-x cursor-grab active:cursor-grabbing select-none"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {/* Custom Unlisted Payment Quick Card in Carousel */}
            <div 
              onClick={() => {
                if (hasDraggedRef.current) return;
                setCurrentScreen('SERVICES');
              }}
              className="w-[240px] sm:w-[260px] shrink-0 snap-start bg-gradient-to-br from-teal-700 via-primary to-indigo-800 rounded-2xl p-4.5 text-white flex flex-col justify-between shadow-md cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all border border-white/10 group"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                    <PlusCircle size={22} />
                  </div>
                  <span className="text-[10px] font-extrabold bg-white/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-xs text-white">
                    Custom Fee
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-white mb-1 group-hover:text-teal-200 transition-colors">
                  Pay Unlisted Fee
                </h4>
                <p className="text-xs text-white/80 line-clamp-2 mb-3">
                  Manually pay any faculty, department, or hostel fee with a custom invoice reference.
                </p>
              </div>

              <div className="pt-3 border-t border-white/20 flex items-center justify-between">
                <span className="text-[11px] font-bold text-teal-200">Custom Amount</span>
                <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white group-hover:translate-x-1 transition-transform">
                  <ArrowRight size={14} />
                </span>
              </div>
            </div>

            {/* List of Rendered Service Categories */}
            {filteredCategories.map((cat) => (
              <div 
                key={cat.id}
                onClick={() => {
                  if (hasDraggedRef.current) return;
                  setCurrentScreen(cat.id as ScreenId);
                }}
                className={`w-[240px] sm:w-[260px] shrink-0 snap-start bg-bg hover:bg-surface rounded-2xl p-4.5 border border-border hover:border-primary/50 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${cat.color} group-hover:scale-105 transition-transform`}>
                      {cat.icon}
                    </div>
                    <span className="text-[10px] font-bold bg-surface border border-border text-text-secondary px-2.5 py-0.5 rounded-full">
                      {cat.badge}
                    </span>
                  </div>

                  <h4 className="text-sm font-extrabold text-text-primary mb-1 group-hover:text-primary transition-colors">
                    {cat.label}
                  </h4>
                  <p className="text-xs text-text-secondary line-clamp-2 mb-3">
                    {cat.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-border/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-text-secondary block font-medium">Starting from</span>
                    <span className="text-xs font-black font-mono text-text-primary">{formatCurrency(cat.startingPrice)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform">
                    <span>Pay</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[11px] text-text-secondary pt-1 px-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Swipe / drag horizontally to view all campus service categories
            </span>
            <button 
              onClick={() => setCurrentScreen('SERVICES')} 
              className="font-bold text-primary hover:underline cursor-pointer"
            >
              Browse Full Catalog →
            </button>
          </div>
        </div>

        {/* Daily Spending & Spending Velocity Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-surface rounded-3xl p-6 border border-border shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-accent/10 text-accent flex items-center justify-center font-bold">
                  <TrendingUp size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary">Daily Spending & Budget Cap</h3>
                  <p className="text-xs text-text-secondary">Track your daily campus expenses</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                {budgetUsedPct}% used
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-text-secondary">Spent Today: <strong className="text-text-primary font-mono">{formatCurrency(todaySpent)}</strong></span>
                <span className="text-text-secondary">Daily Limit: <strong className="text-text-primary font-mono">{formatCurrency(dailyLimit)}</strong></span>
              </div>
              <div className="w-full bg-bg h-3 rounded-full overflow-hidden border border-border">
                <div 
                  className={`h-full transition-all rounded-full ${budgetUsedPct > 85 ? 'bg-danger' : budgetUsedPct > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                  style={{ width: `${budgetUsedPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Student Digital ID Card Quick Widget */}
          <div className="lg:col-span-6 bg-surface rounded-3xl p-6 border border-border shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-text-primary">Digital ID Card</h3>
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                    {ctx.user.role === 'STUDENT' ? 'Student Identity' : ctx.user.role === 'PARENT' ? 'Guardian ID' : 'Merchant ID'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowIdModal(true)}
                    className="text-[10px] font-bold text-primary hover:text-primary/80 flex items-center gap-1 cursor-pointer bg-primary/10 px-2 py-0.5 rounded-md transition"
                    title="Expand Full ID Card"
                  >
                    <Maximize2 size={11} /> Expand
                  </button>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${cardLocked ? 'bg-danger/10 text-danger' : 'bg-emerald-500/10 text-emerald-600'}`}>
                    {cardLocked ? 'LOCKED' : 'ACTIVE'}
                  </span>
                </div>
              </div>
              <div 
                onClick={() => setShowIdModal(true)}
                className="bg-gradient-to-r from-primary via-[#3724a8] to-[#1e1464] p-4 rounded-2xl text-white shadow-md space-y-3 relative overflow-hidden cursor-pointer hover:shadow-lg transition-all group"
              >
                {/* Holographic Watermark Glow */}
                <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform" />
                <div className="flex justify-between items-start">
                  <div className="min-w-0 pr-2">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-white/80 block truncate">{institutionName}</span>
                    <span className="text-xs font-bold text-white/95 truncate block">{userDepartment}</span>
                  </div>
                  <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-md backdrop-blur-xs shrink-0">
                    {userLevel}
                  </span>
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <Avatar 
                    src={ctx.user.avatar} 
                    name={ctx.user.name} 
                    role={ctx.user.role} 
                    size="md" 
                    className="border-2 border-white/50 shadow-sm shrink-0" 
                  />
                  <div className="min-w-0">
                    <div className="font-extrabold text-sm leading-tight text-white truncate">{ctx.user.name}</div>
                    <div className="text-[11px] font-mono text-emerald-300 font-semibold mt-0.5">ID: {userDisplayId}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <button 
                onClick={() => setCurrentScreen('QR_PAY')}
                className="flex-1 bg-primary text-white text-xs font-bold py-2.5 rounded-xl shadow-sm hover:opacity-95 transition-all cursor-pointer mr-2 flex items-center justify-center gap-1.5"
              >
                <QrCode size={14} /> Show ID QR
              </button>
              <button 
                onClick={() => setCardLocked(!cardLocked)}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${cardLocked ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' : 'bg-danger/10 text-danger border-danger/30'}`}
                title={cardLocked ? 'Unlock Card' : 'Lock Card'}
              >
                {cardLocked ? <Unlock size={16} /> : <Lock size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-surface rounded-3xl p-6 border border-border shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-text-primary">Recent Transactions</h3>
            <button onClick={() => setCurrentScreen('HISTORY')} className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5 cursor-pointer">
              View All <ChevronRight size={14} />
            </button>
          </div>

          <div className="space-y-3">
            {recentTx.map(tx => (
              <div 
                key={tx.id} 
                onClick={() => setSelectedTx(tx)}
                className="p-3 bg-bg rounded-2xl border border-border flex items-center justify-between cursor-pointer hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center shrink-0">
                    {CAT_ICONS[tx.category] || <Sparkles size={18} className="text-primary" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-text-primary">{tx.merchant}</h4>
                    <p className="text-[10px] text-text-secondary">{tx.category} • {tx.time}</p>
                  </div>
                </div>
                <span className={`text-xs font-bold font-mono ${tx.type === 'credit' ? 'text-emerald-600' : 'text-danger'}`}>
                  {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedTx && (
        <TransactionReceipt 
          tx={selectedTx} 
          onClose={() => setSelectedTx(null)} 
        />
      )}

      {/* Expandable Digital ID Card Modal */}
      <AnimatePresence>
        {showIdModal && (
          <DigitalIdModal 
            isOpen={showIdModal} 
            onClose={() => setShowIdModal(false)} 
            user={ctx.user} 
            isLocked={cardLocked} 
            onToggleLock={() => setCardLocked(!cardLocked)} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
