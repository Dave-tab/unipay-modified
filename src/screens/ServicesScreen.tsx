import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Coffee, Printer, Bus, BookOpen, Calendar, GraduationCap, 
  ArrowLeft, ChevronRight, CheckCircle2, ShieldCheck, Sparkles, 
  CreditCard, ShoppingBag, Home, HeartPulse, Trophy, Wifi, 
  Compass, FileCheck, PlusCircle, Search, FileText, Send, Building2,
  AlertCircle, DollarSign
} from 'lucide-react';
import { ScreenId, UserContextType, Transaction, TransactionCategory } from '../types';
import { formatCurrency } from '../data';
import { TransactionReceipt } from '../components/TransactionReceipt';

interface ServicesScreenProps {
  setCurrentScreen: (screen: ScreenId) => void;
  ctx?: UserContextType;
}

export interface ServiceDefinition {
  id: ScreenId;
  title: string;
  desc: string;
  icon: React.ReactNode;
  color: string;
  border: string;
  category: TransactionCategory;
  items: {
    name: string;
    price: number;
    desc: string;
  }[];
}

export const SERVICES: ServiceDefinition[] = [
  { 
    id: 'SERVICE_CAFETARIA', 
    title: 'Cafeteria & Dining', 
    desc: 'Pre-order hot meals, meal passes & drinks', 
    icon: <Coffee size={24} />, 
    color: 'bg-orange-500/10 text-orange-600', 
    border: 'border-orange-500/20', 
    category: 'Cafeteria', 
    items: [
      { name: 'Chef Special Jollof Combo', price: 1500, desc: 'Smokey Jollof, Grilled Chicken & Chilled Drink' }, 
      { name: 'Campus Breakfast Meal', price: 850, desc: 'Toasted Sandwich, Fried Egg & Coffee/Tea' }, 
      { name: 'Student Salad Bowl', price: 1200, desc: 'Fresh Greens, Grilled Chicken Strips & Dressing' },
      { name: '5-Day Student Lunch Pass', price: 6500, desc: 'Discounted daily prepaid meal ticket for cafeteria' },
      { name: 'Fresh Smoothie & Pastry', price: 950, desc: 'Fruit smoothie with beef pastry or muffin' }
    ] 
  },
  { 
    id: 'SERVICE_PRINTING', 
    title: 'Printing & Binding', 
    desc: 'Instant laser printing, project spiral binding', 
    icon: <Printer size={24} />, 
    color: 'bg-purple-500/10 text-purple-600', 
    border: 'border-purple-500/20', 
    category: 'Printing', 
    items: [
      { name: '100 Pages Laser Print Pass', price: 600, desc: 'Valid at all library & computer centre stations' }, 
      { name: 'Final Year Thesis Binding', price: 1800, desc: 'Hardcover gilt lettering + 3 spiral drafts' }, 
      { name: 'Color Poster Print (A3 Glossy)', price: 350, desc: 'High-definition full color presentation sheet' },
      { name: 'Document Scanning & Lamination', price: 400, desc: 'Hi-res OCR PDF scan with protective laminate' }
    ] 
  },
  { 
    id: 'SERVICE_TRANSPORT', 
    title: 'Campus Shuttle', 
    desc: 'Faculty routes & inter-campus buses', 
    icon: <Bus size={24} />, 
    color: 'bg-blue-500/10 text-blue-600', 
    border: 'border-blue-500/20', 
    category: 'Transport', 
    items: [
      { name: 'Single Campus Shuttle Ride', price: 150, desc: 'Express hop across faculties and main gate' }, 
      { name: 'Weekly Unlimited Shuttle Pass', price: 1200, desc: '7 days unlimited campus shuttle rides' }, 
      { name: 'Inter-Campus Express Bus Pass', price: 500, desc: 'Direct transit to North & Teaching Hospital campuses' },
      { name: 'Monthly Commuter Shuttle Pass', price: 4200, desc: '30-day all-route student commuter pass' }
    ] 
  },
  { 
    id: 'SERVICE_BOOKSTORE', 
    title: 'Bookstore & Texts', 
    desc: 'Course manuals, lab stationery & calculators', 
    icon: <BookOpen size={24} />, 
    color: 'bg-teal-500/10 text-teal-600', 
    border: 'border-teal-500/20', 
    category: 'Bookstore', 
    items: [
      { name: 'General Studies Handbook 2026', price: 2500, desc: 'Official compulsory university curriculum text' }, 
      { name: 'University Hardcover Logbook', price: 850, desc: 'Gold embossed official UniPay student journal' }, 
      { name: 'Approved Scientific Calculator', price: 4500, desc: 'Casio fx-991EX approved for semester exams' },
      { name: 'Engineering Drawing Set', price: 3200, desc: 'Full drafting kit with T-square & compass' }
    ] 
  },
  { 
    id: 'SERVICE_FEES', 
    title: 'Tuition & Dues', 
    desc: 'Faculty association, library & clearance', 
    icon: <GraduationCap size={24} />, 
    color: 'bg-red-500/10 text-red-600', 
    border: 'border-red-500/20', 
    category: 'Fees', 
    items: [
      { name: 'Faculty & Departmental Annual Dues', price: 3500, desc: 'Official student association membership dues' }, 
      { name: 'Sports & Library Facility Levy', price: 2000, desc: 'Semester digital library & gym access pass' }, 
      { name: 'Late Course Registration Clearance', price: 5000, desc: 'Instant administrative bursary clearance' },
      { name: 'Student Union Government (SUG) Dues', price: 1500, desc: 'Annual student union levy with voting receipt' }
    ] 
  },
  { 
    id: 'SERVICE_HOSTEL', 
    title: 'Hostel & Housing', 
    desc: 'Hall dues, laundry token & key deposit', 
    icon: <Home size={24} />, 
    color: 'bg-indigo-500/10 text-indigo-600', 
    border: 'border-indigo-500/20', 
    category: 'Hostel', 
    items: [
      { name: 'Hall of Residence Maintenance Levy', price: 4000, desc: 'Semester utility and facility upkeep fee' }, 
      { name: 'Hostel Laundry 10-Token Bundle', price: 1500, desc: 'Smart washing machine & dryer activation pass' }, 
      { name: 'Room Key & Tag Replacement', price: 2000, desc: 'Official hall warden biometric tag replacement' },
      { name: 'Vacation Hostel Stay (Per Week)', price: 6000, desc: 'Holiday campus hostel accommodation' }
    ] 
  },
  { 
    id: 'SERVICE_HEALTH', 
    title: 'Clinic & Health', 
    desc: 'Medical checkup, prescription & fitness pass', 
    icon: <HeartPulse size={24} />, 
    color: 'bg-rose-500/10 text-rose-600', 
    border: 'border-rose-500/20', 
    category: 'Health', 
    items: [
      { name: 'Semester Health Clinic Access Token', price: 1200, desc: 'Access to 24/7 campus triage and doctor consultation' }, 
      { name: 'Pre-Admission Medical Clearance Certificate', price: 3000, desc: 'Full diagnostic lab panel & medical report' }, 
      { name: 'Campus Pharmacy Prescription Co-Pay', price: 1800, desc: 'Standard generic medication coverage voucher' },
      { name: 'Sports Medical Fitness Endorsement', price: 1000, desc: 'Required fitness screening for university athletes' }
    ] 
  },
  { 
    id: 'SERVICE_SPORTS', 
    title: 'Sports & Gym', 
    desc: 'Campus gym pass, tennis & pool booking', 
    icon: <Trophy size={24} />, 
    color: 'bg-amber-500/10 text-amber-600', 
    border: 'border-amber-500/20', 
    category: 'Sports', 
    items: [
      { name: 'Semester Campus Gym Pass', price: 3500, desc: 'Unlimited access to campus fitness centre equipment' }, 
      { name: 'Olympic Pool Weekend Swim Pass', price: 800, desc: 'Valid for 2-hour recreational swim session' }, 
      { name: 'Badminton & Tennis Court Booking (1 Hr)', price: 1200, desc: 'Floodlit court reservation with racket rental' },
      { name: 'Intramural Tournament Entry Fee', price: 2000, desc: 'Team registration for inter-faculty championship' }
    ] 
  },
  { 
    id: 'SERVICE_IT_WIFI', 
    title: 'IT & Wi-Fi Boost', 
    desc: 'High-speed data bundle, cloud lab credits', 
    icon: <Wifi size={24} />, 
    color: 'bg-cyan-500/10 text-cyan-600', 
    border: 'border-cyan-500/20', 
    category: 'IT & Media', 
    items: [
      { name: 'Campus High-Speed 50GB Wi-Fi Pass', price: 2000, desc: 'Uncapped eduroam priority speed across campus' }, 
      { name: 'Cloud Computing Lab Credits ($10 eqv)', price: 4500, desc: 'GPU / virtual machine server hours for coursework' }, 
      { name: 'Campus Tech Workshop Certification', price: 3000, desc: 'Access to AI / Web development weekend bootcamp' }
    ] 
  },
  { 
    id: 'SERVICE_EXCURSION', 
    title: 'Field Trips & Tours', 
    desc: 'Departmental industrial visits & camps', 
    icon: <Compass size={24} />, 
    color: 'bg-emerald-500/10 text-emerald-600', 
    border: 'border-emerald-500/20', 
    category: 'Excursion', 
    items: [
      { name: 'Annual Faculty Industrial Excursion', price: 7500, desc: 'Bus transit, lodging & company tour pass' }, 
      { name: 'Geology & Surveying Field Kit Fee', price: 5000, desc: 'Equipment usage, map pack & protective safety gear' }, 
      { name: 'Student Leadership Retreat Camping Pass', price: 6000, desc: 'Weekend leadership summit accommodation & meals' }
    ] 
  },
  { 
    id: 'SERVICE_CERTIFICATES', 
    title: 'Certificates & Docs', 
    desc: 'Official transcripts & statement of results', 
    icon: <FileCheck size={24} />, 
    color: 'bg-violet-500/10 text-violet-600', 
    border: 'border-violet-500/20', 
    category: 'Certificates', 
    items: [
      { name: 'Official Electronic Transcript (Domestic)', price: 3000, desc: 'Digitally signed official academic transcript' }, 
      { name: 'Official Transcript (International WES/US)', price: 8000, desc: 'Direct electronic transmission to foreign institutions' }, 
      { name: 'Statement of Semester Results (Stamped)', price: 1000, desc: 'Official academic transcript for internship applications' },
      { name: 'English Language Proficiency Letter', price: 2500, desc: 'Dean attested English medium instruction document' }
    ] 
  },
  { 
    id: 'SERVICE_EVENTS', 
    title: 'Events & Socials', 
    desc: 'Campus galas, hall week & concerts', 
    icon: <Calendar size={24} />, 
    color: 'bg-pink-500/10 text-pink-600', 
    border: 'border-pink-500/20', 
    category: 'Events', 
    items: [
      { name: 'Campus Tech & Innovation Gala Ticket', price: 2500, desc: 'VIP Entry, Exhibition Pass & Networking Refreshments' }, 
      { name: 'Annual Hall Week Dinner & Award Pass', price: 3000, desc: '3-course banquet and commemorative hall memento' }, 
      { name: 'Varsity Derby Finals Match Ticket', price: 500, desc: 'Main arena grandstand ticket + branded cheering stick' },
      { name: 'Campus Film Festival Pass', price: 1200, desc: 'Evening student cinema screening with popcorn combo' }
    ] 
  }
];

export function ServicesScreen({ setCurrentScreen, ctx }: ServicesScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCustomPayModal, setShowCustomPayModal] = useState(false);

  // Custom Unlisted Service Form State
  const [customServiceName, setCustomServiceName] = useState('');
  const [customDepartment, setCustomDepartment] = useState('Bursary Office');
  const [customRefCode, setCustomRefCode] = useState('');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [customNote, setCustomNote] = useState('');
  const [isProcessingCustom, setIsProcessingCustom] = useState(false);
  const [customError, setCustomError] = useState('');
  const [customSuccessTx, setCustomSuccessTx] = useState<Transaction | null>(null);

  const filteredServices = SERVICES.filter(service => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      service.title.toLowerCase().includes(query) ||
      service.desc.toLowerCase().includes(query) ||
      service.items.some(i => i.name.toLowerCase().includes(query) || i.desc.toLowerCase().includes(query))
    );
  });

  const handlePayCustomService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ctx) return;
    setCustomError('');

    const parsedAmount = Number(customAmount);
    if (!customServiceName.trim()) {
      setCustomError('Please enter the name of the service or fee.');
      return;
    }
    if (!parsedAmount || parsedAmount <= 0) {
      setCustomError('Please enter a valid payment amount.');
      return;
    }
    if (ctx.balance < parsedAmount) {
      setCustomError(`Insufficient balance! Your wallet has ${formatCurrency(ctx.balance)}.`);
      return;
    }

    const ref = customRefCode.trim() || 'REF-' + Math.floor(100000 + Math.random() * 900000);

    try {
      await ctx.requestPayment({
        amount: parsedAmount,
        title: customServiceName.trim(),
        subtitle: `${customDepartment} • Ref: ${ref}`
      });

      setIsProcessingCustom(true);
      setTimeout(() => {
        const newTx: Transaction = {
          id: 'tx-' + Math.random().toString().slice(2, 8),
          category: 'Custom Service',
          merchant: `${customServiceName.trim()} (${customDepartment})`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          amount: parsedAmount,
          type: 'debit',
          date: 'Today',
          timestamp: Date.now()
        };

        ctx.addTransaction(newTx);
        ctx.addNotification({
          title: 'Custom Fee Paid',
          message: `Paid ${formatCurrency(parsedAmount)} for ${customServiceName.trim()} to ${customDepartment}.`,
          type: 'transaction',
          amount: parsedAmount,
          linkScreen: 'HISTORY'
        });

        setIsProcessingCustom(false);
        setShowCustomPayModal(false);
        setCustomSuccessTx(newTx);
        
        // Reset form
        setCustomServiceName('');
        setCustomAmount('');
        setCustomRefCode('');
        setCustomNote('');
      }, 800);
    } catch (err) {
      console.log('Custom payment cancelled');
    }
  };

  const handleGenerateRef = () => {
    setCustomRefCode('UNI-' + Math.floor(100000 + Math.random() * 900000));
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col w-full bg-bg pb-24"
    >
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-primary to-emerald-800 px-6 pt-8 sm:pt-10 pb-8 shadow-xs z-10 relative text-white">
        <div className="flex items-center gap-3 mb-3">
          <button 
            onClick={() => setCurrentScreen('HOME')} 
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/20 text-white hover:bg-white/30 transition-colors cursor-pointer"
            aria-label="Back to Home"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">Campus Services Hub</h2>
          </div>
          <button
            onClick={() => setShowCustomPayModal(true)}
            className="bg-white text-primary text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs hover:bg-white/95 transition flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <PlusCircle size={15} />
            <span>Custom Fee</span>
          </button>
        </div>
        <p className="text-white/80 text-xs sm:text-sm tracking-wide">
          Access university services, campus facilities, and pay for unlisted official fees directly from your wallet.
        </p>

        {/* Search Bar */}
        <div className="mt-4 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/60" />
          <input 
            type="text"
            placeholder="Search all services, lab manuals, shuttle pass..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/15 border border-white/25 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-white/60 focus:outline-none focus:bg-white/20 transition-all backdrop-blur-md"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white text-xs"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 px-6 py-6 pb-12 -mt-4 bg-surface rounded-t-3xl relative z-20 space-y-6">
        
        {/* Unlisted Custom Service Payment Highlight Banner */}
        <div className="bg-gradient-to-r from-primary/10 via-teal-500/10 to-emerald-500/10 p-5 rounded-3xl border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shrink-0 shadow-md">
              <PlusCircle size={24} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] bg-primary/20 text-primary font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Unlisted Fee Portal</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-text-primary mt-0.5">Can't find your fee or campus service?</h3>
              <p className="text-xs text-text-secondary">Enter any custom university service, department, and amount to pay instantly with your wallet.</p>
            </div>
          </div>
          <button 
            onClick={() => setShowCustomPayModal(true)}
            className="bg-primary hover:bg-primary/90 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-xs cursor-pointer shrink-0 w-full sm:w-auto text-center"
          >
            Enter Custom Fee
          </button>
        </div>

        {/* Horizontal Category Cards Track (Left-to-Right Scroll) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-text-primary">Featured Service Categories</h3>
              <p className="text-[11px] text-text-secondary">Scroll left to right to discover all 12 payment hubs</p>
            </div>
            <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
              {filteredServices.length} Categories
            </span>
          </div>

          <div 
            className="flex gap-3 overflow-x-auto scrollbar-none pb-2 pt-1 scroll-smooth snap-x snap-mandatory touch-pan-x"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {SERVICES.map((service) => (
              <button
                key={service.id}
                onClick={() => setCurrentScreen(service.id)}
                className="w-[180px] shrink-0 snap-start bg-bg hover:bg-surface p-3.5 rounded-2xl border border-border hover:border-primary/50 text-left transition-all group cursor-pointer shadow-2xs"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${service.color} border ${service.border} mb-2.5 group-hover:scale-105 transition-transform`}>
                  {service.icon}
                </div>
                <h4 className="text-xs font-bold text-text-primary truncate group-hover:text-primary transition-colors">
                  {service.title}
                </h4>
                <p className="text-[10px] text-text-secondary truncate mb-2">
                  {service.category}
                </p>
                <div className="flex items-center justify-between text-[10px] font-bold text-primary pt-1.5 border-t border-border/60">
                  <span>{service.items.length} Options</span>
                  <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-text-primary">
              All Campus Services Grid ({filteredServices.length})
            </h3>
            {searchQuery && (
              <span className="text-xs text-text-secondary">Matching "{searchQuery}"</span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {filteredServices.map((service, idx) => (
              <motion.button 
                key={service.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => setCurrentScreen(service.id)}
                className="bg-bg p-4 sm:p-5 rounded-3xl border border-border flex flex-col items-start gap-3 hover:border-primary transition-all text-left group cursor-pointer shadow-2xs hover:shadow-xs"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${service.color} border ${service.border} transition-transform group-hover:scale-105`}>
                  {service.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary mb-1 group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-[11px] text-text-secondary line-clamp-2 leading-relaxed">
                    {service.desc}
                  </p>
                </div>
                <div className="mt-auto pt-2 flex items-center text-[10px] font-bold text-primary gap-1">
                  <span>{service.items.length} options</span>
                  <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </motion.button>
            ))}
          </div>

          {filteredServices.length === 0 && (
            <div className="bg-bg p-8 rounded-3xl border border-border text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <Search size={22} />
              </div>
              <h4 className="text-sm font-bold text-text-primary">No matching pre-listed service</h4>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                The service you searched for is not in the default catalogue. You can easily enter the details manually and pay now.
              </p>
              <button
                onClick={() => {
                  setCustomServiceName(searchQuery);
                  setShowCustomPayModal(true);
                }}
                className="bg-primary text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition cursor-pointer"
              >
                Pay for "{searchQuery}" as Custom Service
              </button>
            </div>
          )}
        </div>
        
        {/* Featured Campus Promotion */}
        <div className="bg-surface p-5 rounded-3xl border border-border shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-text-primary">Featured Campus Deals</h3>
            <span className="text-[10px] bg-red-500/10 text-red-600 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">Limited Offer</span>
          </div>
          <div className="bg-gradient-to-r from-teal-700 via-primary to-emerald-700 p-6 rounded-2xl text-white relative overflow-hidden shadow-sm">
            <BookOpen size={70} className="absolute -right-4 -bottom-4 text-white/15" />
            <h4 className="font-extrabold text-lg mb-1 relative z-10">20% Off Course Handbooks & Lab Packs</h4>
            <p className="text-xs text-teal-100 mb-4 relative z-10 max-w-md">
              Save on essential curriculum guides and laboratory stationery when you pay using UniPay at the University Bookstore.
            </p>
            <button 
              onClick={() => setCurrentScreen('SERVICE_BOOKSTORE')} 
              className="bg-white text-primary text-xs font-bold px-4 py-2.5 rounded-xl relative z-10 hover:bg-teal-50 transition shadow-xs cursor-pointer"
            >
              Browse Bookstore
            </button>
          </div>
        </div>
      </div>

      {/* CUSTOM SERVICE PAYMENT MODAL */}
      <AnimatePresence>
        {showCustomPayModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCustomPayModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative z-10 w-full max-w-lg bg-surface rounded-3xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-primary via-teal-700 to-emerald-700 p-6 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white">
                    <PlusCircle size={22} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Pay for Unlisted / Custom Service</h3>
                    <p className="text-xs text-white/80">Enter specific university fee or department payment</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowCustomPayModal(false)}
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handlePayCustomService} className="p-6 space-y-4 overflow-y-auto flex-1 text-text-primary">
                
                {/* Service Name */}
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">
                    Service / Fee Name <span className="text-danger">*</span>
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g. Faculty T-Shirt, Chemistry Lab Breakage Fee, SRC Dues"
                    value={customServiceName}
                    onChange={(e) => setCustomServiceName(e.target.value)}
                    required
                    className="w-full bg-bg border border-border rounded-xl px-3.5 py-2.5 text-sm font-semibold text-text-primary focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Department / Unit */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1">
                      Department / Beneficiary Unit <span className="text-danger">*</span>
                    </label>
                    <select
                      value={customDepartment}
                      onChange={(e) => setCustomDepartment(e.target.value)}
                      className="w-full bg-bg border border-border rounded-xl px-3.5 py-2.5 text-xs font-bold text-text-primary focus:outline-none focus:border-primary"
                    >
                      <option value="Bursary Office">Bursary Office (Central)</option>
                      <option value="Faculty Secretariat">Faculty Secretariat</option>
                      <option value="Departmental Office">Departmental Office</option>
                      <option value="Student Affairs Division">Student Affairs Division</option>
                      <option value="Hall of Residence Management">Hall of Residence Management</option>
                      <option value="University Library">University Library</option>
                      <option value="Sports Council">Sports Council</option>
                      <option value="Medical Centre">University Medical Centre</option>
                      <option value="IT & Computing Centre">IT & Computing Centre</option>
                      <option value="Other Campus Unit">Other Campus Unit</option>
                    </select>
                  </div>

                  {/* Invoice / Reference Number */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold text-text-secondary">
                        Invoice / Ref Code
                      </label>
                      <button
                        type="button"
                        onClick={handleGenerateRef}
                        className="text-[10px] text-primary font-bold hover:underline"
                      >
                        Auto-Generate
                      </button>
                    </div>
                    <input 
                      type="text"
                      placeholder="e.g. INV-84920"
                      value={customRefCode}
                      onChange={(e) => setCustomRefCode(e.target.value)}
                      className="w-full bg-bg border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono font-semibold text-text-primary focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Payment Amount */}
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">
                    Amount to Pay (₦) <span className="text-danger">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-text-secondary">₦</span>
                    <input 
                      type="number"
                      placeholder="e.g. 3500"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      min="1"
                      required
                      className="w-full bg-bg border border-border rounded-xl pl-8 pr-4 py-2.5 text-base font-black font-mono text-text-primary focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Student Note / Payer Matric */}
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">
                    Student Matric / Purpose Note (Optional)
                  </label>
                  <input 
                    type="text"
                    placeholder={`e.g. ${ctx?.user?.studentId || '24-00192'} - Second Semester Payment`}
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    className="w-full bg-bg border border-border rounded-xl px-3.5 py-2 text-xs text-text-primary focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Wallet Balance Summary */}
                <div className="bg-bg p-4 rounded-2xl border border-border space-y-1.5 text-xs">
                  <div className="flex justify-between text-text-secondary">
                    <span>Your Current Wallet Balance:</span>
                    <span className="font-bold text-text-primary">{formatCurrency(ctx?.balance || 0)}</span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>Payment Processing Fee:</span>
                    <span className="font-bold text-emerald-600">FREE (₦0.00)</span>
                  </div>
                  <div className="flex justify-between text-text-primary font-bold pt-2 border-t border-border">
                    <span>Total Debit:</span>
                    <span className="text-primary font-mono text-sm">
                      {formatCurrency(Number(customAmount) || 0)}
                    </span>
                  </div>
                </div>

                {customError && (
                  <div className="p-3 bg-danger/10 border border-danger/30 rounded-xl text-danger text-xs font-bold text-center flex items-center justify-center gap-1.5">
                    <AlertCircle size={15} />
                    <span>{customError}</span>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowCustomPayModal(false)}
                    className="flex-1 py-3 rounded-xl border border-border font-bold text-xs hover:bg-bg cursor-pointer transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isProcessingCustom}
                    className="flex-1 py-3 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 cursor-pointer disabled:opacity-50 transition shadow-sm flex items-center justify-center gap-1.5"
                  >
                    {isProcessingCustom ? (
                      'Processing...'
                    ) : (
                      <>
                        <Send size={14} />
                        <span>Pay {formatCurrency(Number(customAmount) || 0)}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Transaction Receipt */}
      {customSuccessTx && (
        <TransactionReceipt 
          tx={customSuccessTx} 
          onClose={() => setCustomSuccessTx(null)} 
        />
      )}
    </motion.div>
  );
}

// Subservice screen with interactive purchasing
export function SubServiceScreen({ id, ctx, setCurrentScreen }: { id: string; ctx?: UserContextType; setCurrentScreen: (s: ScreenId) => void }) {
  const service = SERVICES.find(s => s.id === id);
  const [selectedItem, setSelectedItem] = useState<{ name: string; price: number; desc: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [purchasedTx, setPurchasedTx] = useState<Transaction | null>(null);

  if (!service) {
    return (
      <div className="p-8 text-center bg-bg">
        <p className="text-text-secondary text-sm">Service not found.</p>
        <button onClick={() => setCurrentScreen('SERVICES')} className="mt-4 text-xs font-bold text-primary underline">
          Back to Services
        </button>
      </div>
    );
  }

  const handleBuy = async (item: { name: string; price: number; desc: string }) => {
    if (!ctx) return;
    setErrorMsg('');

    if (ctx.balance < item.price) {
      setErrorMsg(`Insufficient funds! Your wallet balance is ${formatCurrency(ctx.balance)}.`);
      return;
    }

    try {
      await ctx.requestPayment({
        amount: item.price,
        title: `${service.title} - ${item.name}`,
        subtitle: `Campus Service Payment`
      });

      setIsProcessing(true);
      setTimeout(() => {
        const newTx: Transaction = {
          id: 'tx-' + Math.random().toString().slice(2, 8),
          category: service.category,
          merchant: `${service.title} - ${item.name}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          amount: item.price,
          type: 'debit',
          date: 'Today',
          timestamp: Date.now()
        };

        ctx.addTransaction(newTx);
        ctx.addNotification({
          title: 'Campus Service Purchase',
          message: `Paid ${formatCurrency(item.price)} for ${item.name} via ${service.title}.`,
          type: 'transaction',
          amount: item.price,
          linkScreen: 'HISTORY'
        });

        setIsProcessing(false);
        setSelectedItem(null);
        setPurchasedTx(newTx);
      }, 800);
    } catch (err) {
      console.log('Payment cancelled');
    }
  };

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="flex flex-col w-full bg-bg z-50 relative pb-24"
    >
      <div className="px-6 pt-6 sm:pt-8 pb-4 flex items-center bg-surface border-b border-border shadow-xs sticky top-0 z-20">
        <button 
          onClick={() => setCurrentScreen('SERVICES')} 
          className="w-10 h-10 flex items-center justify-center rounded-full bg-bg -ml-2 mr-2 hover:bg-border/50 transition cursor-pointer"
        >
          <ChevronRight size={24} className="text-text-primary rotate-180" />
        </button>
        <h2 className="text-lg font-bold text-text-primary flex-1">{service.title} Hub</h2>
      </div>

      <div className="p-6">
        <div className="bg-surface p-6 rounded-3xl border border-border shadow-xs flex items-center gap-4 mb-6">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${service.color} border ${service.border}`}>
            {service.icon}
          </div>
          <div>
            <h3 className="text-xl font-bold text-text-primary mb-0.5">{service.title}</h3>
            <p className="text-xs text-text-secondary">{service.desc}</p>
          </div>
        </div>

        <h3 className="text-sm font-bold text-text-primary mb-3">Available Purchases & Services</h3>
        <div className="space-y-3 mb-8">
          {service.items.map((item, index) => (
            <div 
              key={index} 
              className="bg-surface p-4 rounded-2xl border border-border flex items-center justify-between shadow-2xs hover:border-primary transition-colors"
            >
              <div className="pr-3">
                <h4 className="text-sm font-bold text-text-primary mb-0.5">{item.name}</h4>
                <p className="text-xs text-text-secondary">{item.desc}</p>
              </div>
              <button 
                onClick={() => { setSelectedItem(item); setErrorMsg(''); }}
                className="bg-primary hover:bg-primary/90 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shrink-0 transition cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                Pay {formatCurrency(item.price)}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[95] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 pb-24 sm:pb-6 overflow-y-auto">
            <motion.div 
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              className="bg-surface w-full max-w-md rounded-3xl p-6 border border-border shadow-2xl relative text-text-primary my-auto"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${service.color} border ${service.border}`}>
                    {service.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-text-primary">Confirm Purchase</h3>
                    <p className="text-[11px] text-text-secondary">{service.title}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="w-7 h-7 rounded-full bg-bg hover:bg-border border border-border flex items-center justify-center text-text-secondary cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="bg-bg p-4 rounded-2xl border border-border mb-4 space-y-2.5">
                <div className="flex justify-between items-start text-xs">
                  <span className="text-text-secondary">Item / Service</span>
                  <span className="font-bold text-text-primary text-right max-w-[200px]">{selectedItem.name}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-text-secondary">Category</span>
                  <span className="font-semibold text-text-primary">{service.category}</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-2 border-t border-border">
                  <span className="text-text-secondary">Payable Amount</span>
                  <span className="text-base font-black font-mono text-primary">{formatCurrency(selectedItem.price)}</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-1">
                  <span className="text-text-secondary">Wallet Balance</span>
                  <span className="font-bold font-mono">{formatCurrency(ctx?.balance || 0)}</span>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 mb-4 bg-danger/10 border border-danger/30 rounded-xl text-danger text-xs font-bold text-center">
                  {errorMsg}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="flex-1 py-3 rounded-xl border border-border font-bold text-xs hover:bg-bg cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button 
                  disabled={isProcessing}
                  onClick={() => handleBuy(selectedItem)}
                  className="flex-1 py-3 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 cursor-pointer disabled:opacity-50 shadow-md flex items-center justify-center gap-1.5 transition-all"
                >
                  {isProcessing ? 'Processing...' : `Confirm & Pay ${formatCurrency(selectedItem.price)}`}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {purchasedTx && (
        <TransactionReceipt 
          tx={purchasedTx} 
          onClose={() => setPurchasedTx(null)} 
        />
      )}
    </motion.div>
  );
}
