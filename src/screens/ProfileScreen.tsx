import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Sliders, 
  BellRing, 
  Link as LinkIcon, 
  Download, 
  HelpCircle, 
  LogOut, 
  ChevronRight, 
  ArrowLeft,
  X,
  Check,
  Plus,
  Trash2,
  Lock,
  Smartphone,
  FileText,
  Search,
  ChevronDown,
  Sparkles,
  Building2,
  Shield,
  Moon,
  Sun,
  User,
  Edit3,
  Globe,
  Eye,
  EyeOff,
  Bell,
  CheckCircle2,
  CreditCard,
  Users,
  UserPlus,
  ArrowUpCircle,
  KeyRound
} from 'lucide-react';
import { UserContextType, ScreenId, UserProfile, LinkedAccount, PrivacySettings } from '../types';
import { formatCurrency } from '../data';
import { Avatar } from '../components/Avatar';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

interface ProfileScreenProps {
  ctx: UserContextType;
  onLogout: () => void;
  setCurrentScreen?: (screen: ScreenId) => void;
}

type SettingModalType = 
  | 'NONE' 
  | 'EDIT_PROFILE'
  | 'SECURITY' 
  | 'LIMITS' 
  | 'NOTIFICATIONS' 
  | 'ACCOUNTS' 
  | 'PRIVACY'
  | 'STATEMENT' 
  | 'SUPPORT'
  | 'MANAGE_CHILDREN';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
];

export function ProfileScreen({ ctx, onLogout, setCurrentScreen }: ProfileScreenProps) {
  const [activeModal, setActiveModal] = useState<SettingModalType>('NONE');

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [activeModal]);

  // Edit Profile Form State
  const [profileName, setProfileName] = useState(ctx.user.name);
  const [profileEmail, setProfileEmail] = useState(ctx.user.email);
  const [profileStudentId, setProfileStudentId] = useState(ctx.user.studentId || ctx.user.id || '');
  const [profileDept, setProfileDept] = useState(ctx.user.department || '');
  const [profileLevel, setProfileLevel] = useState(ctx.user.level || '300 Level');
  const [profileInstitution, setProfileInstitution] = useState(ctx.user.institution || ctx.user.school || 'University of Lagos (UNILAG)');
  const [profilePhone, setProfilePhone] = useState(ctx.user.phone || '+234 803 123 4567');
  const [profileAvatar, setProfileAvatar] = useState(ctx.user.avatar);

  // Security Form State
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [newLoginPassword, setNewLoginPassword] = useState('');
  const [confirmLoginPassword, setConfirmLoginPassword] = useState('');
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [requirePinOver1k, setRequirePinOver1k] = useState(true);

  // Spending Limits Form State
  const [dailyLimit, setDailyLimit] = useState(ctx.spendingLimits?.dailyLimit || 8000);
  const [categoryCaps, setCategoryCaps] = useState(ctx.spendingLimits?.categoryCaps || {
    Cafeteria: 3000,
    Printing: 1500,
    Transport: 1200,
    Bookstore: 5000,
    Events: 3000
  });

  // Notification Settings Form State
  const [lowBalanceAlert, setLowBalanceAlert] = useState(ctx.alertSettings?.enabled ?? true);
  const [threshold, setThreshold] = useState(ctx.alertSettings?.lowBalanceThreshold || 3000);
  const [txPush, setTxPush] = useState(true);
  const [allowanceAlert, setAllowanceAlert] = useState(true);

  // Add Account State
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [newBankName, setNewBankName] = useState('First Bank');
  const [newAccNo, setNewAccNo] = useState('');

  // Download Statement State
  const [statementMonth, setStatementMonth] = useState('August 2026');
  const [statementFormat, setStatementFormat] = useState<'CSV' | 'PDF'>('CSV');
  const [isDownloading, setIsDownloading] = useState(false);

  // Support FAQs State
  const [faqSearch, setFaqSearch] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [feedbackText, setFeedbackText] = useState('');

  // Add Child State in Profile Modal
  const [showAddChildForm, setShowAddChildForm] = useState(false);
  const [childFormName, setChildFormName] = useState('');
  const [childFormStudentId, setChildFormStudentId] = useState('');
  const [childFormDept, setChildFormDept] = useState('');
  const [childFormSchool, setChildFormSchool] = useState('University of Lagos (UNILAG)');
  const [childFormRel, setChildFormRel] = useState<'Daughter' | 'Son' | 'Ward' | 'Sibling'>('Daughter');
  const [childFormFund, setChildFormFund] = useState<number>(5000);
  const [childFormAvatar, setChildFormAvatar] = useState(PRESET_AVATARS[0]);

  // Profile Child Top-Up State
  const [profileTopUpWardId, setProfileTopUpWardId] = useState<string | null>(null);
  const [profileTopUpAmt, setProfileTopUpAmt] = useState<number>(5000);

  const handleAddChildFromProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!childFormName.trim() || !childFormStudentId.trim()) {
      ctx.showToast({ title: 'Missing Info', message: "Please provide the student's name and ID number.", type: 'error' });
      return;
    }

    ctx.addWard({
      name: childFormName.trim(),
      studentId: childFormStudentId.trim(),
      department: childFormDept.trim() || 'General Studies • 100L',
      school: childFormSchool,
      avatar: childFormAvatar,
      balance: childFormFund || 0,
      cardFrozen: false,
      relationship: childFormRel,
      phone: '+234 800 000 0000',
      dailyLimit: 8000,
      allowanceAmount: 5000,
      allowanceFrequency: 'Weekly'
    });

    if (childFormFund > 0) {
      ctx.addTransaction({
        id: Math.random().toString().slice(2, 8),
        category: 'Top-up',
        merchant: `Initial Funding for ${childFormName.trim()}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        amount: childFormFund,
        type: 'credit',
        date: 'Today',
        timestamp: Date.now()
      });
    }

    setChildFormName('');
    setChildFormStudentId('');
    setChildFormDept('');
    setShowAddChildForm(false);
  };

  const totalSpent = ctx.transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  const topUpsCount = ctx.transactions
    .filter(t => t.category === 'Top-up').length;

  const txCount = ctx.transactions.length;

  // Real-time Greeting Calculator
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 22) return 'Good evening';
    return 'Good night';
  };

  // Profile Save
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 200;
        const MAX_HEIGHT = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctxNode = canvas.getContext('2d');
        ctxNode?.drawImage(img, 0, 0, width, height);
        
        // Compress heavily so it fits in Firestore easily
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        setProfileAvatar(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim() || !profileEmail.trim()) {
      ctx.showToast({ type: 'error', title: 'Invalid Profile', message: 'Name and Email are required.' });
      return;
    }

    // Phone validation for valid Nigerian / International mobile formats (e.g. +234..., 080..., 090..., 070...)
    if (profilePhone.trim()) {
      const cleanPhone = profilePhone.replace(/[\s-]/g, '');
      const phoneRegex = /^(\+?234|0)[789][01]\d{8}$/;
      if (!phoneRegex.test(cleanPhone) && cleanPhone.length < 10) {
        ctx.showToast({ 
          type: 'error', 
          title: 'Invalid Phone Number', 
          message: 'Please enter a valid phone number (e.g. +234 803 123 4567 or 08031234567).' 
        });
        return;
      }
    }

    const updatedUser: UserProfile = {
      ...ctx.user,
      name: profileName,
      email: profileEmail,
      studentId: profileStudentId,
      department: profileDept,
      level: profileLevel,
      institution: profileInstitution,
      school: profileInstitution,
      phone: profilePhone,
      avatar: profileAvatar
    };
    
    try {
      if (ctx.user.uid && ctx.user.uid !== 'student-default' && ctx.user.uid !== 'merchant-default' && ctx.user.uid !== 'parent-default') {
        const userRef = doc(db, 'users', ctx.user.uid);
        await setDoc(userRef, {
          name: profileName,
          email: profileEmail,
          studentId: profileStudentId || null,
          department: profileDept || null,
          level: profileLevel || null,
          institution: profileInstitution || null,
          school: profileInstitution || null,
          phone: profilePhone || null,
          avatar: profileAvatar
        }, { merge: true });
        ctx.setUser(updatedUser);
      } else {
        // Fallback for mock users
        ctx.setUser(updatedUser);
      }
      
      ctx.showToast({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your personal information has been saved.'
      });
      setActiveModal('NONE');
    } catch (error) {
      console.error("Failed to save profile:", error);
      ctx.showToast({
        type: 'error',
        title: 'Save Failed',
        message: 'Could not update your profile in the database.'
      });
    }
  };

  // Save Security Settings
  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLoginPassword) {
      if (newLoginPassword.length !== 6 || !/^\d{6}$/.test(newLoginPassword)) {
        ctx.showToast({ type: 'error', title: 'Invalid Login Password', message: 'Login password must be exactly 6 numeric digits.' });
        return;
      }
      if (newLoginPassword !== confirmLoginPassword) {
        ctx.showToast({ type: 'error', title: 'Password Mismatch', message: 'New Login Password and Confirm Password do not match.' });
        return;
      }
      ctx.setLoginPassword?.(newLoginPassword);
    }

    if (newPin) {
      if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
        ctx.showToast({ type: 'error', title: 'Invalid PIN', message: 'Transaction PIN must be exactly 4 numeric digits.' });
        return;
      }
      if (newPin !== confirmPin) {
        ctx.showToast({ type: 'error', title: 'PIN Mismatch', message: 'New PIN and Confirm PIN do not match.' });
        return;
      }
      ctx.setTransactionPin(newPin);
    }

    ctx.showToast({
      type: 'success',
      title: 'Security Settings Updated',
      message: (newLoginPassword || newPin) 
        ? 'Login password and transaction PIN updated successfully.' 
        : 'Security preferences updated.'
    });
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    setNewLoginPassword('');
    setConfirmLoginPassword('');
    setActiveModal('NONE');
  };

  // Save Limits
  const handleSaveLimits = (e: React.FormEvent) => {
    e.preventDefault();
    ctx.setSpendingLimits({
      dailyLimit,
      categoryCaps
    });
    ctx.showToast({
      type: 'success',
      title: 'Limits Updated',
      message: `Daily limit set to ${formatCurrency(dailyLimit)}`
    });
    setActiveModal('NONE');
  };

  // Save Notifications
  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    ctx.setAlertSettings({
      enabled: lowBalanceAlert,
      lowBalanceThreshold: threshold
    });
    ctx.showToast({
      type: 'success',
      title: 'Notification Preferences Saved',
      message: 'Alert thresholds & push preferences updated.'
    });
    setActiveModal('NONE');
  };

  // Add Linked Account
  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAccNo.length < 10) {
      ctx.showToast({ type: 'error', title: 'Invalid Account Number', message: 'Enter a valid 10-digit NUBAN account number.' });
      return;
    }
    const newAcc: LinkedAccount = {
      id: 'acc-' + Math.random().toString().slice(2, 6),
      bank: newBankName,
      accNo: `${newAccNo.slice(0, 3)}****${newAccNo.slice(-3)}`,
      isDefault: false,
      type: 'Bank Account'
    };
    ctx.setLinkedAccounts(prev => [...prev, newAcc]);
    setShowAddAccountModal(false);
    setNewAccNo('');
    ctx.showToast({
      type: 'success',
      title: 'Account Linked',
      message: `${newBankName} account successfully verified and saved.`
    });
  };

  // Set Default Primary Account
  const handleSetDefaultAccount = (id: string) => {
    ctx.setLinkedAccounts(prev => prev.map(a => ({
      ...a,
      isDefault: a.id === id
    })));
    ctx.showToast({
      type: 'success',
      title: 'Primary Account Updated',
      message: 'Default payout account updated.'
    });
  };

  // Delete Linked Account
  const handleDeleteAccount = (id: string) => {
    ctx.setLinkedAccounts(prev => prev.filter(a => a.id !== id));
    ctx.showToast({
      type: 'success',
      title: 'Account Unlinked',
      message: 'Account removed from linked funding sources.'
    });
  };

  // Save Privacy Settings
  const handleSavePrivacy = (e: React.FormEvent) => {
    e.preventDefault();
    ctx.showToast({
      type: 'success',
      title: 'Privacy Settings Saved',
      message: 'Visibility and data options updated.'
    });
    setActiveModal('NONE');
  };

  // Download Statement
  const handleDownloadStatement = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      const headers = "ID,Date,Time,Category,Merchant,Type,Amount\n";
      const rows = ctx.transactions.map(t => 
        `"${t.id}","${t.date}","${t.time}","${t.category}","${t.merchant}","${t.type}",${t.amount}`
      ).join("\n");
      const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `UniPay_Statement_${statementMonth.replace(/\s+/g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      ctx.showToast({
        type: 'success',
        title: 'Statement Downloaded',
        message: `Exported ${txCount} transactions for ${statementMonth}.`
      });
      setActiveModal('NONE');
    }, 1000);
  };

  // Send Feedback
  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    ctx.showToast({
      type: 'success',
      title: 'Feedback Received',
      message: 'Thank you! Campus Support has received your message.'
    });
    setFeedbackText('');
  };

  const FAQS = [
    {
      q: 'How do I top up my UniPay campus wallet?',
      a: 'You can top up instantly via bank transfer, USSD code, or linked debit card using the "Top Up" tab on your home dashboard.'
    },
    {
      q: 'How do parent spending limits and category caps work?',
      a: 'Your parent or account manager can set daily maximum spending limits and cap individual categories like Cafeteria or Printing. Once a cap is reached, further purchases in that category require approval.'
    },
    {
      q: 'What should I do if my QR payment is scanned twice?',
      a: 'All QR transactions are idempotently tokenized. Duplicate charges are automatically prevented. If an extra charge appears, contact Campus Support for an instant refund.'
    },
    {
      q: 'How do automated allowances work?',
      a: 'Parents can schedule weekly or monthly automated transfers. Funds are credited directly into your wallet balance on the scheduled payout date.'
    }
  ];

  const filteredFaqs = FAQS.filter(f => 
    f.q.toLowerCase().includes(faqSearch.toLowerCase()) || 
    f.a.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`flex flex-col w-full bg-bg pb-24 relative transition-colors ${ctx.isDarkMode ? 'dark' : ''}`}
    >
      {/* Profile Header */}
      <div className="bg-surface px-6 pt-6 sm:pt-8 pb-6 shadow-xs z-10 relative mb-4 border-b border-border">
        {setCurrentScreen && (
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => setCurrentScreen('HOME')} 
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-bg text-text-primary hover:bg-border transition-colors cursor-pointer"
              aria-label="Back to Home"
            >
              <ArrowLeft size={20} />
            </button>
            <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">Student Settings</span>
            <button 
              onClick={() => setActiveModal('EDIT_PROFILE')}
              className="flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-xl transition cursor-pointer"
            >
              <Edit3 size={14} /> Edit
            </button>
          </div>
        )}

        <div className="flex items-center gap-4 mb-5">
          <div className="relative group cursor-pointer" onClick={() => setActiveModal('EDIT_PROFILE')}>
            <Avatar
              src={ctx.user.avatar}
              name={ctx.user.name}
              role={ctx.user.role}
              size="xl"
              className="border-2 border-primary/30 shadow-sm"
            />
            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white">
              <Edit3 size={16} />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-text-primary leading-tight">{ctx.user.name}</h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary shrink-0">
                {ctx.user.role}
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-0.5 font-medium">
              {getGreeting()} • {ctx.user.department || ctx.user.email}
            </p>
            <p className="text-xs text-text-secondary font-mono mt-0.5">
              ID: {ctx.user.studentId || ctx.user.id}
            </p>
          </div>
        </div>

        {/* Quick Stats Summary */}
        <div className="flex gap-4 bg-bg p-3.5 rounded-2xl border border-border">
          <div className="flex-[1] flex flex-col items-center">
            <p className="text-sm font-bold text-text-primary">{formatCurrency(totalSpent)}</p>
            <p className="text-[10px] text-text-secondary uppercase tracking-wider font-bold mt-0.5">Total Spent</p>
          </div>
          <div className="w-px bg-border my-1"></div>
          <div className="flex-[1] flex flex-col items-center">
             <p className="text-sm font-bold text-text-primary">{topUpsCount}</p>
             <p className="text-[10px] text-text-secondary uppercase tracking-wider font-bold mt-0.5">Top-ups</p>
          </div>
          <div className="w-px bg-border my-1"></div>
          <div className="flex-[1] flex flex-col items-center">
            <p className="text-sm font-bold text-text-primary">{txCount}</p>
            <p className="text-[10px] text-text-secondary uppercase tracking-wider font-bold mt-0.5">Transacts</p>
          </div>
        </div>
      </div>

      {/* Settings Navigation List */}
      <div className="flex-1 px-6 pb-12 space-y-5">
        
        {/* Quick Toggles Section */}
        <div>
          <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2.5 pl-2">Quick Preferences</h3>
          <div className="bg-surface rounded-2xl border border-border overflow-hidden divide-y divide-border shadow-xs">
            {/* Dark Mode Toggle */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  {ctx.isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text-primary">Dark Mode</h4>
                  <p className="text-[11px] text-text-secondary">Switch between Light and Dark interface</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  ctx.setDarkMode(!ctx.isDarkMode);
                  ctx.showToast({
                    type: 'info',
                    title: !ctx.isDarkMode ? 'Dark Mode Enabled' : 'Light Mode Enabled',
                    message: !ctx.isDarkMode ? 'Switched to dark high-contrast mode.' : 'Switched to clean light mode.'
                  });
                }}
                className={`w-12 h-6 rounded-full transition-colors p-0.5 cursor-pointer flex items-center ${
                  ctx.isDarkMode ? 'bg-primary justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                }`}
              >
                <motion.div 
                  layout 
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center"
                >
                  {ctx.isDarkMode ? <Moon size={12} className="text-primary" /> : <Sun size={12} className="text-amber-500" />}
                </motion.div>
              </button>
            </div>

            {/* Push Notifications Toggle */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Bell size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text-primary">Push Notifications</h4>
                  <p className="text-[11px] text-text-secondary">Instant alerts for payments & allowances</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  ctx.setPushNotificationsEnabled(!ctx.pushNotificationsEnabled);
                  ctx.showToast({
                    type: 'info',
                    title: !ctx.pushNotificationsEnabled ? 'Push Alerts Active' : 'Push Alerts Disabled',
                    message: !ctx.pushNotificationsEnabled ? 'Push notifications enabled.' : 'Push notifications muted.'
                  });
                }}
                className={`w-12 h-6 rounded-full transition-colors p-0.5 cursor-pointer flex items-center ${
                  ctx.pushNotificationsEnabled ? 'bg-primary justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                }`}
              >
                <motion.div 
                  layout 
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="w-5 h-5 rounded-full bg-white shadow-md"
                />
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Account Settings Section */}
        <div>
          <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2.5 pl-2">Account Management</h3>
          <div className="bg-surface rounded-2xl border border-border overflow-hidden divide-y divide-border shadow-xs">
            {(ctx.role === 'PARENT' || ctx.user.role === 'PARENT') && (
              <SettingRow 
                icon={<Users size={18} className="text-emerald-600" />} 
                title="Manage Children & Wards" 
                subtitle={`${(ctx.wards || []).length} student accounts linked for monitoring & top-up`}
                onClick={() => setActiveModal('MANAGE_CHILDREN')}
              />
            )}
            <SettingRow 
              icon={<User size={18} className="text-primary" />} 
              title="Edit Profile" 
              subtitle="Update name, department, phone & avatar"
              onClick={() => setActiveModal('EDIT_PROFILE')}
            />
            <SettingRow 
              icon={<LinkIcon size={18} className="text-blue-500" />} 
              title="Manage Linked Accounts" 
              subtitle={`${ctx.linkedAccounts.length} accounts connected`}
              onClick={() => setActiveModal('ACCOUNTS')}
            />
            <SettingRow 
              icon={<Globe size={18} className="text-emerald-500" />} 
              title="Privacy Settings" 
              subtitle="Profile visibility & data analytics"
              onClick={() => setActiveModal('PRIVACY')}
            />
            <SettingRow 
              icon={<ShieldCheck size={18} className="text-indigo-500" />} 
              title="Security & PIN" 
              subtitle="Transaction PIN, biometrics & sessions"
              onClick={() => setActiveModal('SECURITY')}
            />
            <SettingRow 
              icon={<Sliders size={18} className="text-amber-500" />} 
              title="Spending Limits & Caps" 
              subtitle="Daily budget and category caps"
              onClick={() => setActiveModal('LIMITS')}
            />
            <SettingRow 
              icon={<BellRing size={18} className="text-teal-500" />} 
              title="Notification Alert Rules" 
              subtitle="Low balance threshold & alert channels"
              onClick={() => setActiveModal('NOTIFICATIONS')}
            />
            <SettingRow 
              icon={<Download size={18} className="text-purple-500" />} 
              title="Download Statement" 
              subtitle="Export CSV or PDF transaction history"
              onClick={() => setActiveModal('STATEMENT')}
            />
            <SettingRow 
              icon={<HelpCircle size={18} className="text-orange-500" />} 
              title="Help & Support" 
              subtitle="FAQs, support hotline & feedback"
              onClick={() => setActiveModal('SUPPORT')}
            />
          </div>
        </div>

        <button 
          onClick={onLogout}
          className="w-full bg-surface text-danger p-4 rounded-2xl border border-border shadow-xs flex items-center justify-center gap-2 font-bold hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
        >
          <LogOut size={18} />
          Log Out
        </button>
      </div>

      {/* SETTINGS INTERACTIVE MODAL SHEETS */}
      <AnimatePresence>
        {activeModal !== 'NONE' && (
          <div className="absolute inset-0 z-50 flex justify-end overflow-hidden rounded-3xl">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal('NONE')}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Modal Sheet */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative z-10 w-full bg-surface h-full flex flex-col shadow-2xl border-l border-border overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-primary px-6 pt-10 pb-5 text-white flex justify-between items-center shrink-0">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {activeModal === 'EDIT_PROFILE' && `Edit ${ctx.user.role === 'STUDENT' ? 'Student' : ctx.user.role === 'PARENT' ? 'Parent' : 'Merchant'} Profile`}
                    {activeModal === 'SECURITY' && 'Security & PIN'}
                    {activeModal === 'LIMITS' && 'Spending Limits'}
                    {activeModal === 'NOTIFICATIONS' && 'Notification Settings'}
                    {activeModal === 'ACCOUNTS' && 'Manage Linked Accounts'}
                    {activeModal === 'PRIVACY' && 'Privacy Settings'}
                    {activeModal === 'STATEMENT' && 'Download Statement'}
                    {activeModal === 'SUPPORT' && 'Help & Support'}
                    {activeModal === 'MANAGE_CHILDREN' && 'Manage Children & Wards'}
                  </h3>
                  <p className="text-xs text-white/70">
                    {activeModal === 'EDIT_PROFILE' && `Update your ${ctx.user.role.toLowerCase()} details and profile picture`}
                    {activeModal === 'SECURITY' && 'Manage your security PIN and authentication'}
                    {activeModal === 'LIMITS' && 'Set maximum daily budgets and category caps'}
                    {activeModal === 'NOTIFICATIONS' && 'Configure alert thresholds and preferences'}
                    {activeModal === 'ACCOUNTS' && 'Manage connected funding bank accounts'}
                    {activeModal === 'PRIVACY' && 'Control profile visibility and analytics sharing'}
                    {activeModal === 'STATEMENT' && 'Export detailed account statements'}
                    {activeModal === 'SUPPORT' && 'Search FAQs or contact campus help desk'}
                    {activeModal === 'MANAGE_CHILDREN' && 'Add, monitor, fund and secure your children student accounts'}
                  </p>
                </div>
                <button 
                  onClick={() => setActiveModal('NONE')}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body Content */}
              <div className="flex-1 overflow-y-auto p-6 bg-bg custom-scrollbar text-text-primary space-y-6">
                
                {/* 0. EDIT PROFILE MODAL */}
                {activeModal === 'EDIT_PROFILE' && (
                  <form onSubmit={handleSaveProfile} className="space-y-5">
                    {/* Avatar Selection */}
                    <div className="bg-surface p-5 rounded-2xl border border-border shadow-xs text-center space-y-3">
                      <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider">Choose Profile Avatar</label>
                      <div className="flex justify-center">
                        <Avatar 
                          src={profileAvatar} 
                          name={profileName || ctx.user.name} 
                          role={ctx.user.role} 
                          size="2xl" 
                          className="border-2 border-primary shadow-sm"
                        />
                      </div>

                      <div className="flex justify-center gap-2 pt-2">
                        {PRESET_AVATARS.map((url, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setProfileAvatar(url)}
                            className={`w-9 h-9 rounded-full overflow-hidden border-2 transition cursor-pointer ${
                              profileAvatar === url ? 'border-primary scale-110 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                            }`}
                          >
                            <Avatar src={url} name={`User ${i}`} size="sm" className="w-full h-full" />
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-left">
                        <div>
                          <label className="block text-[11px] text-text-secondary mb-1">Upload Local Image</label>
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="w-full bg-bg border border-border rounded-xl px-2 py-2 text-[10px] font-mono text-text-primary focus:outline-none focus:border-primary file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-text-secondary mb-1">Or enter Custom URL</label>
                          <input 
                            type="text" 
                            value={profileAvatar}
                            onChange={(e) => setProfileAvatar(e.target.value)}
                            placeholder="https://example.com/avatar.jpg"
                            className="w-full bg-bg border border-border rounded-xl px-3 py-2 text-xs font-mono text-text-primary focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Personal Details */}
                    <div className="bg-surface p-5 rounded-2xl border border-border shadow-xs space-y-4">
                      <h4 className="text-xs font-bold uppercase text-text-secondary">{ctx.user.role === 'STUDENT' ? 'Student' : ctx.user.role === 'PARENT' ? 'Parent' : 'Merchant'} Personal Details</h4>

                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">Full Name</label>
                        <input 
                          type="text" 
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          placeholder="David Ayantade"
                          className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-xs font-bold text-text-primary focus:outline-none focus:border-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">Campus Email Address</label>
                        <input 
                          type="email" 
                          value={profileEmail}
                          onChange={(e) => setProfileEmail(e.target.value)}
                          placeholder="david@student.unipay.edu.ng"
                          className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-xs font-bold text-text-primary focus:outline-none focus:border-primary"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-text-secondary mb-1">Student / ID No</label>
                          <input 
                            type="text" 
                            value={profileStudentId}
                            onChange={(e) => setProfileStudentId(e.target.value)}
                            placeholder="STU-2026-089"
                            className="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-text-primary focus:outline-none focus:border-primary"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-text-secondary mb-1">Department</label>
                          <input 
                            type="text" 
                            value={profileDept}
                            onChange={(e) => setProfileDept(e.target.value)}
                            placeholder="Computer Science"
                            className="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-xs font-bold text-text-primary focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-text-secondary mb-1">Academic Level</label>
                          <select 
                            value={profileLevel}
                            onChange={(e) => setProfileLevel(e.target.value)}
                            className="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-xs font-bold text-text-primary focus:outline-none focus:border-primary cursor-pointer"
                          >
                            <option value="100 Level">100 Level</option>
                            <option value="200 Level">200 Level</option>
                            <option value="300 Level">300 Level</option>
                            <option value="400 Level">400 Level</option>
                            <option value="500 Level">500 Level</option>
                            <option value="Postgraduate">Postgraduate</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-text-secondary mb-1">Phone Number</label>
                          <input 
                            type="text" 
                            value={profilePhone}
                            onChange={(e) => setProfilePhone(e.target.value)}
                            placeholder="+234 803 123 4567"
                            className="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-xs font-bold text-text-primary focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">University / Higher Institution</label>
                        <input 
                          type="text" 
                          value={profileInstitution}
                          onChange={(e) => setProfileInstitution(e.target.value)}
                          placeholder="University of Lagos (UNILAG)"
                          className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-xs font-bold text-text-primary focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl shadow-md transition cursor-pointer text-xs"
                    >
                      Save Profile Changes
                    </button>
                  </form>
                )}

                {/* 1. SECURITY MODAL */}
                {activeModal === 'SECURITY' && (
                  <form onSubmit={handleSaveSecurity} className="space-y-6">
                    <div className="p-3.5 bg-primary/5 border border-primary/20 rounded-2xl flex items-start gap-2.5">
                      <ShieldCheck size={16} className="text-primary shrink-0 mt-0.5" />
                      <div className="text-xs space-y-1">
                        <p className="font-bold text-text-primary">Two Distinct Security Credentials</p>
                        <p className="text-[11px] text-text-secondary leading-relaxed">
                          • <strong>6-Digit Login Password</strong>: Used to sign in securely to your UniPay account.<br />
                          • <strong>4-Digit Transaction PIN</strong>: Required to authorize campus transactions and payments (e.g. cafeteria, transport, fees).
                        </p>
                      </div>
                    </div>

                    {/* 6-Digit Login Password Section */}
                    <div className="bg-surface p-5 rounded-2xl border border-border shadow-xs space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold flex items-center gap-2">
                          <KeyRound size={16} className="text-primary" /> 6-Digit Login Password
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          6 Digits
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-text-secondary mb-1">New 6-Digit Password</label>
                          <input 
                            type="password" 
                            maxLength={6}
                            value={newLoginPassword}
                            onChange={(e) => setNewLoginPassword(e.target.value.replace(/\D/g, ''))}
                            placeholder="• • • • • •"
                            className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm font-mono tracking-widest text-text-primary focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-text-secondary mb-1">Confirm Password</label>
                          <input 
                            type="password" 
                            maxLength={6}
                            value={confirmLoginPassword}
                            onChange={(e) => setConfirmLoginPassword(e.target.value.replace(/\D/g, ''))}
                            placeholder="• • • • • •"
                            className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm font-mono tracking-widest text-text-primary focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 4-Digit Transaction PIN Section */}
                    <div className="bg-surface p-5 rounded-2xl border border-border shadow-xs space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold flex items-center gap-2">
                          <Lock size={16} className="text-primary" /> 4-Digit Transaction PIN
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                          4 Digits
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">Current PIN</label>
                        <input 
                          type="password" 
                          maxLength={4}
                          value={currentPin}
                          onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ''))}
                          placeholder="• • • • (Default: 1234)"
                          className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm font-mono tracking-widest text-text-primary focus:outline-none focus:border-primary"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-text-secondary mb-1">New 4-Digit PIN</label>
                          <input 
                            type="password" 
                            maxLength={4}
                            value={newPin}
                            onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                            placeholder="• • • •"
                            className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm font-mono tracking-widest text-text-primary focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-text-secondary mb-1">Confirm PIN</label>
                          <input 
                            type="password" 
                            maxLength={4}
                            value={confirmPin}
                            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                            placeholder="• • • •"
                            className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm font-mono tracking-widest text-text-primary focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-surface p-5 rounded-2xl border border-border shadow-xs space-y-4">
                      <h4 className="text-sm font-bold flex items-center gap-2">
                        <Smartphone size={16} className="text-amber-500" /> Biometrics & Verification
                      </h4>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold">Biometric Login (Face ID / Touch ID)</p>
                          <p className="text-[11px] text-text-secondary">Use device biometric sensors to sign in quickly</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={biometricEnabled}
                          onChange={(e) => setBiometricEnabled(e.target.checked)}
                          className="w-5 h-5 accent-primary cursor-pointer"
                        />
                      </div>

                      <div className="pt-3 border-t border-border flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold">PIN Prompt for Purchases &gt; ₦1,000</p>
                          <p className="text-[11px] text-text-secondary">Require PIN entry for high-value transactions</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={requirePinOver1k}
                          onChange={(e) => setRequirePinOver1k(e.target.checked)}
                          className="w-5 h-5 accent-primary cursor-pointer"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl shadow-md transition cursor-pointer text-xs"
                    >
                      Save Security Preferences
                    </button>
                  </form>
                )}

                {/* 2. SPENDING LIMITS MODAL */}
                {activeModal === 'LIMITS' && (
                  <form onSubmit={handleSaveLimits} className="space-y-6">
                    <div className="bg-surface p-5 rounded-2xl border border-border shadow-xs">
                      <h4 className="text-sm font-bold text-text-primary mb-1">Max Daily Budget Limit</h4>
                      <p className="text-xs text-text-secondary mb-4">Total maximum amount you can spend across all campus services per day.</p>

                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <label className="block text-[11px] font-semibold text-text-secondary mb-1">Daily Limit (₦)</label>
                          <input 
                            type="number" 
                            value={dailyLimit === 0 ? '' : dailyLimit}
                            onChange={(e) => setDailyLimit(e.target.value === '' ? 0 : Number(e.target.value))}
                            className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-surface p-5 rounded-2xl border border-border shadow-xs space-y-4">
                      <h4 className="text-sm font-bold text-text-primary">Category Spending Caps (Per Day)</h4>
                      <p className="text-xs text-text-secondary mb-2">Set strict daily spending ceilings for individual service categories.</p>

                      {Object.entries(categoryCaps).map(([category, capVal]) => (
                        <div key={category} className="flex items-center justify-between bg-bg p-3 rounded-xl border border-border">
                          <div>
                            <p className="text-xs font-bold text-text-primary">{category}</p>
                            <p className="text-[10px] text-text-secondary">Daily ceiling</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-text-secondary">₦</span>
                            <input 
                              type="number"
                              value={capVal === 0 ? '' : capVal}
                              onChange={(e) => {
                                const val = e.target.value === '' ? 0 : Number(e.target.value);
                                setCategoryCaps(prev => ({ ...prev, [category]: val }));
                              }}
                              className="w-24 bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs font-bold text-text-primary focus:outline-none focus:border-primary"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl shadow-md transition cursor-pointer text-xs"
                    >
                      Update Spending Limits & Caps
                    </button>
                  </form>
                )}

                {/* 3. NOTIFICATIONS MODAL */}
                {activeModal === 'NOTIFICATIONS' && (
                  <form onSubmit={handleSaveNotifications} className="space-y-6">
                    <div className="bg-surface p-5 rounded-2xl border border-border shadow-xs space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-text-primary">Low Balance Warning System</h4>
                          <p className="text-xs text-text-secondary">Get real-time alerts when wallet balance is low</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={lowBalanceAlert}
                          onChange={(e) => setLowBalanceAlert(e.target.checked)}
                          className="w-5 h-5 accent-primary cursor-pointer"
                        />
                      </div>

                      {lowBalanceAlert && (
                        <div className="pt-3 border-t border-border">
                          <label className="block text-xs font-semibold text-text-secondary mb-1">Alert Threshold (₦)</label>
                          <input 
                            type="number" 
                            value={threshold === 0 ? '' : threshold}
                            onChange={(e) => setThreshold(e.target.value === '' ? 0 : Number(e.target.value))}
                            className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:outline-none focus:border-primary"
                          />
                        </div>
                      )}
                    </div>

                    <div className="bg-surface p-5 rounded-2xl border border-border shadow-xs space-y-4">
                      <h4 className="text-sm font-bold text-text-primary">Push & In-App Preferences</h4>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold">Transaction Push Receipts</p>
                          <p className="text-[11px] text-text-secondary">Instant notifications after every purchase</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={txPush}
                          onChange={(e) => setTxPush(e.target.checked)}
                          className="w-5 h-5 accent-primary cursor-pointer"
                        />
                      </div>

                      <div className="pt-3 border-t border-border flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold">Allowance Credit Alerts</p>
                          <p className="text-[11px] text-text-secondary">Notify when parent transfers allowance</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={allowanceAlert}
                          onChange={(e) => setAllowanceAlert(e.target.checked)}
                          className="w-5 h-5 accent-primary cursor-pointer"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl shadow-md transition cursor-pointer text-xs"
                    >
                      Save Notification Preferences
                    </button>
                  </form>
                )}

                {/* 4. LINKED ACCOUNTS MODAL */}
                {activeModal === 'ACCOUNTS' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-bold">Connected Funding Sources</h4>
                      <button 
                        onClick={() => setShowAddAccountModal(true)}
                        className="bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 hover:bg-primary/90 transition cursor-pointer"
                      >
                        <Plus size={14} /> Link Account
                      </button>
                    </div>

                    <div className="space-y-3">
                      {ctx.linkedAccounts.map(acc => (
                        <div key={acc.id} className="bg-surface p-4 rounded-2xl border border-border flex items-center justify-between shadow-xs">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                              <Building2 size={20} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="text-xs font-bold text-text-primary">{acc.bank}</h5>
                                {acc.isDefault ? (
                                  <span className="text-[9px] bg-emerald-500/15 text-emerald-600 font-extrabold px-2 py-0.5 rounded-full">
                                    PRIMARY DEFAULT
                                  </span>
                                ) : (
                                  <button 
                                    onClick={() => handleSetDefaultAccount(acc.id)}
                                    className="text-[9px] bg-bg hover:bg-border text-text-secondary font-bold px-2 py-0.5 rounded-full border border-border transition cursor-pointer"
                                  >
                                    Set Default
                                  </button>
                                )}
                              </div>
                              <p className="text-xs font-mono text-text-secondary">{acc.accNo} • {acc.type}</p>
                            </div>
                          </div>

                          {!acc.isDefault && (
                            <button 
                              onClick={() => handleDeleteAccount(acc.id)}
                              className="text-text-secondary hover:text-rose-500 p-1.5 transition cursor-pointer"
                              title="Unlink account"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Add Account Popup Sub-modal */}
                    <AnimatePresence>
                      {showAddAccountModal && (
                        <motion.form 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          onSubmit={handleAddAccount} 
                          className="bg-surface p-5 rounded-2xl border border-primary/30 shadow-md space-y-4"
                        >
                          <h5 className="text-xs font-bold uppercase text-primary">Link New NUBAN Bank Account</h5>
                          
                          <div>
                            <label className="block text-xs font-semibold text-text-secondary mb-1">Select Bank</label>
                            <select 
                              value={newBankName}
                              onChange={(e) => setNewBankName(e.target.value)}
                              className="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-xs font-bold text-text-primary focus:outline-none"
                            >
                              <option>First Bank</option>
                              <option>GTBank</option>
                              <option>Zenith Bank</option>
                              <option>Access Bank</option>
                              <option>UBA</option>
                              <option>Kuda Microfinance</option>
                              <option>Moniepoint Microfinance</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-text-secondary mb-1">Account Number (NUBAN)</label>
                            <input 
                              type="text"
                              maxLength={10}
                              value={newAccNo}
                              onChange={(e) => setNewAccNo(e.target.value)}
                              placeholder="0123456789"
                              className="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-text-primary focus:outline-none focus:border-primary"
                            />
                          </div>

                          <div className="flex gap-2">
                            <button 
                              type="button" 
                              onClick={() => setShowAddAccountModal(false)}
                              className="flex-1 py-2 rounded-xl border border-border text-xs font-bold hover:bg-bg cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button 
                              type="submit" 
                              className="flex-1 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 cursor-pointer"
                            >
                              Verify & Link
                            </button>
                          </div>
                        </motion.form>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* 5. PRIVACY SETTINGS MODAL */}
                {activeModal === 'PRIVACY' && (
                  <form onSubmit={handleSavePrivacy} className="space-y-6">
                    <div className="bg-surface p-5 rounded-2xl border border-border shadow-xs space-y-4">
                      <h4 className="text-sm font-bold text-text-primary">Campus Profile Visibility</h4>
                      <p className="text-xs text-text-secondary">Choose who can find your profile for P2P transfers</p>

                      <div className="space-y-2">
                        {[
                          { id: 'PUBLIC', label: 'Public (Searchable by all campus users)', desc: 'Anyone can send P2P transfers using your ID' },
                          { id: 'CAMPUS', label: 'Campus Directory Only (Verified Students)', desc: 'Only verified departmental students can search' },
                          { id: 'PRIVATE', label: 'Private (Hidden)', desc: 'Hide profile from public student search' }
                        ].map((item) => (
                          <label key={item.id} className="flex items-start gap-3 p-3 bg-bg rounded-xl border border-border cursor-pointer">
                            <input 
                              type="radio" 
                              name="profileVisibility"
                              value={item.id}
                              checked={ctx.privacySettings.profileVisibility === item.id}
                              onChange={() => ctx.setPrivacySettings(prev => ({ ...prev, profileVisibility: item.id as any }))}
                              className="mt-0.5 accent-primary cursor-pointer"
                            />
                            <div>
                              <p className="text-xs font-bold text-text-primary">{item.label}</p>
                              <p className="text-[11px] text-text-secondary">{item.desc}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="bg-surface p-5 rounded-2xl border border-border shadow-xs space-y-4">
                      <h4 className="text-sm font-bold text-text-primary">Data & Analytics Control</h4>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold">Hide Balance on Home Screen by Default</p>
                          <p className="text-[11px] text-text-secondary">Mask wallet figures when opening app</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={ctx.privacySettings.hideBalanceByDefault}
                          onChange={(e) => ctx.setPrivacySettings(prev => ({ ...prev, hideBalanceByDefault: e.target.checked }))}
                          className="w-5 h-5 accent-primary cursor-pointer"
                        />
                      </div>

                      <div className="pt-3 border-t border-border flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold">Spending Analytics & Smart Suggestions</p>
                          <p className="text-[11px] text-text-secondary">Allow automated budget category suggestions</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={ctx.privacySettings.analyticsOptIn}
                          onChange={(e) => ctx.setPrivacySettings(prev => ({ ...prev, analyticsOptIn: e.target.checked }))}
                          className="w-5 h-5 accent-primary cursor-pointer"
                        />
                      </div>

                      <div className="pt-3 border-t border-border flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold">Third-Party Bursary Sync</p>
                          <p className="text-[11px] text-text-secondary">Sync tuition payments automatically with university records</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={ctx.privacySettings.dataSharing}
                          onChange={(e) => ctx.setPrivacySettings(prev => ({ ...prev, dataSharing: e.target.checked }))}
                          className="w-5 h-5 accent-primary cursor-pointer"
                        />
                      </div>
                      
                      {ctx.user.role === 'STUDENT' && (
                        <div className="pt-3 border-t border-border flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold">Share Ledger with Parents</p>
                            <p className="text-[11px] text-text-secondary">Allow linked parent accounts to view your wallet balance and full transaction history</p>
                          </div>
                          <input 
                            type="checkbox" 
                            checked={ctx.privacySettings.shareDataWithParent}
                            onChange={(e) => ctx.setPrivacySettings(prev => ({ ...prev, shareDataWithParent: e.target.checked }))}
                            className="w-5 h-5 accent-primary cursor-pointer"
                          />
                        </div>
                      )}
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl shadow-md transition cursor-pointer text-xs"
                    >
                      Save Privacy Preferences
                    </button>
                  </form>
                )}

                {/* 6. DOWNLOAD STATEMENT MODAL */}
                {activeModal === 'STATEMENT' && (
                  <div className="space-y-6">
                    <div className="bg-surface p-5 rounded-2xl border border-border shadow-xs space-y-4">
                      <h4 className="text-sm font-bold">Statement Export Parameters</h4>

                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">Statement Period</label>
                        <select 
                          value={statementMonth}
                          onChange={(e) => setStatementMonth(e.target.value)}
                          className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-xs font-bold text-text-primary focus:outline-none"
                        >
                          <option>August 2026 (Current Semester)</option>
                          <option>July 2026</option>
                          <option>June 2026</option>
                          <option>Full Academic Year 2025/2026</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">Format</label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setStatementFormat('CSV')}
                            className={`py-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition ${
                              statementFormat === 'CSV' ? 'bg-primary text-white border-primary shadow-xs' : 'bg-bg text-text-secondary border-border'
                            }`}
                          >
                            <FileText size={16} /> CSV Spreadsheet
                          </button>
                          <button
                            type="button"
                            onClick={() => setStatementFormat('PDF')}
                            className={`py-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition ${
                              statementFormat === 'PDF' ? 'bg-primary text-white border-primary shadow-xs' : 'bg-bg text-text-secondary border-border'
                            }`}
                          >
                            <FileText size={16} /> PDF Document
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-surface p-4 rounded-2xl border border-border flex items-center gap-3 text-xs text-text-secondary">
                      <Sparkles size={20} className="text-primary shrink-0" />
                      <span>Includes verified cryptographic signatures for university bursary submission.</span>
                    </div>

                    <button 
                      onClick={handleDownloadStatement}
                      disabled={isDownloading}
                      className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl shadow-md transition cursor-pointer text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Download size={16} />
                      {isDownloading ? 'Compiling Statement...' : `Download ${statementFormat} Statement`}
                    </button>
                  </div>
                )}

                {/* 7. HELP & SUPPORT MODAL */}
                {activeModal === 'SUPPORT' && (
                  <div className="space-y-6">
                    {/* Search Bar */}
                    <div className="relative">
                      <Search size={18} className="absolute left-3.5 top-3.5 text-text-secondary" />
                      <input 
                        type="text"
                        value={faqSearch}
                        onChange={(e) => setFaqSearch(e.target.value)}
                        placeholder="Search FAQs, payments or USSD..."
                        className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-3 text-xs font-bold text-text-primary focus:outline-none focus:border-primary"
                      />
                    </div>

                    {/* FAQ Accordions */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase text-text-secondary">Frequently Asked Questions</h4>
                      {filteredFaqs.map((faq, idx) => (
                        <div key={idx} className="bg-surface rounded-2xl border border-border overflow-hidden shadow-xs">
                          <button 
                            onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                            className="w-full p-4 flex items-center justify-between text-left font-bold text-xs text-text-primary hover:bg-bg transition cursor-pointer"
                          >
                            <span>{faq.q}</span>
                            <ChevronDown size={16} className={`text-text-secondary transition-transform ${openFaqIndex === idx ? 'rotate-180' : ''}`} />
                          </button>
                          {openFaqIndex === idx && (
                            <div className="px-4 pb-4 pt-1 text-xs text-text-secondary border-t border-border/50 leading-relaxed bg-bg/50">
                              {faq.a}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Support Contact Cards */}
                    <div className="bg-surface p-5 rounded-2xl border border-border shadow-xs space-y-3">
                      <h4 className="text-xs font-bold uppercase text-text-secondary">Campus Support Hotline</h4>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-bg rounded-xl border border-border">
                          <p className="text-[10px] text-text-secondary uppercase font-bold">24/7 Helpline</p>
                          <p className="font-bold text-primary">0800-UNIPAY-HELP</p>
                        </div>
                        <div className="p-3 bg-bg rounded-xl border border-border">
                          <p className="text-[10px] text-text-secondary uppercase font-bold">Email Desk</p>
                          <p className="font-bold text-primary">support@unipay.edu.ng</p>
                        </div>
                      </div>
                    </div>

                    {/* Feedback Form */}
                    <form onSubmit={handleSendFeedback} className="bg-surface p-5 rounded-2xl border border-border shadow-xs space-y-3">
                      <h4 className="text-xs font-bold uppercase text-text-secondary">Report an Issue or Send Feedback</h4>
                      <textarea 
                        rows={3}
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="Describe your issue or suggestions for UniPay..."
                        className="w-full bg-bg border border-border rounded-xl p-3 text-xs text-text-primary focus:outline-none focus:border-primary"
                      />
                      <button 
                        type="submit"
                        disabled={!feedbackText.trim()}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer disabled:opacity-50"
                      >
                        Submit Feedback
                      </button>
                    </form>
                  </div>
                )}

                {/* 8. MANAGE CHILDREN & WARDS MODAL */}
                {activeModal === 'MANAGE_CHILDREN' && (
                  <div className="space-y-6">
                    {/* Header Action Card */}
                    <div className="bg-surface p-5 rounded-2xl border border-border shadow-xs flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                          <Users size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-text-primary">Family Student Accounts</h4>
                          <p className="text-xs text-text-secondary">{(ctx.wards || []).length} children linked</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowAddChildForm(!showAddChildForm)}
                        className="px-3 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <UserPlus size={14} />
                        <span>{showAddChildForm ? 'View List' : 'Add Child'}</span>
                      </button>
                    </div>

                    {/* Add Child Inline Form */}
                    {showAddChildForm ? (
                      <form onSubmit={handleAddChildFromProfile} className="bg-surface p-5 rounded-2xl border border-border shadow-xs space-y-4">
                        <h4 className="text-xs font-bold uppercase text-text-secondary flex items-center gap-1.5">
                          <UserPlus size={14} className="text-primary" /> Link New Student Account
                        </h4>

                        <div className="space-y-3 text-xs">
                          <div>
                            <label className="block font-bold text-text-secondary mb-1">Full Legal Name *</label>
                            <input 
                              type="text" 
                              required
                              placeholder="e.g. Daniel Davies"
                              value={childFormName}
                              onChange={(e) => setChildFormName(e.target.value)}
                              className="w-full bg-bg border border-border rounded-xl px-3.5 py-2.5 font-semibold text-text-primary focus:outline-none focus:border-primary"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block font-bold text-text-secondary mb-1">Student Matric / ID *</label>
                              <input 
                                type="text" 
                                required
                                placeholder="e.g. 24-00492"
                                value={childFormStudentId}
                                onChange={(e) => setChildFormStudentId(e.target.value)}
                                className="w-full bg-bg border border-border rounded-xl px-3.5 py-2.5 font-mono font-semibold text-text-primary focus:outline-none focus:border-primary"
                              />
                            </div>
                            <div>
                              <label className="block font-bold text-text-secondary mb-1">Relationship</label>
                              <select
                                value={childFormRel}
                                onChange={(e: any) => setChildFormRel(e.target.value)}
                                className="w-full bg-bg border border-border rounded-xl px-3 py-2.5 font-bold text-text-primary focus:outline-none focus:border-primary"
                              >
                                <option value="Daughter">Daughter</option>
                                <option value="Son">Son</option>
                                <option value="Ward">Ward</option>
                                <option value="Sibling">Sibling</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block font-bold text-text-secondary mb-1">Department & Level</label>
                            <input 
                              type="text" 
                              placeholder="e.g. Computer Science • 200L"
                              value={childFormDept}
                              onChange={(e) => setChildFormDept(e.target.value)}
                              className="w-full bg-bg border border-border rounded-xl px-3.5 py-2.5 font-semibold text-text-primary focus:outline-none focus:border-primary"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-text-secondary mb-1">Initial Allowance Credit (₦)</label>
                            <input 
                              type="number" 
                              value={childFormFund === 0 ? '' : childFormFund}
                              onChange={(e) => setChildFormFund(e.target.value === '' ? 0 : Number(e.target.value))}
                              placeholder="Initial funding amount (₦)"
                              className="w-full bg-bg border border-border rounded-xl px-3.5 py-2.5 font-bold text-text-primary focus:outline-none focus:border-primary"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-text-secondary mb-1.5">Avatar Selection</label>
                            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                              {PRESET_AVATARS.map((av, idx) => (
                                <button
                                  type="button"
                                  key={idx}
                                  onClick={() => setChildFormAvatar(av)}
                                  className={`w-10 h-10 rounded-full overflow-hidden border-2 transition shrink-0 cursor-pointer ${
                                    childFormAvatar === av ? 'border-primary ring-2 ring-primary/30 scale-105' : 'border-border opacity-70 hover:opacity-100'
                                  }`}
                                >
                                  <Avatar src={av} name={`Child ${idx}`} size="sm" className="w-full h-full" />
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="pt-2">
                            <button
                              type="submit"
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition cursor-pointer shadow-md flex items-center justify-center gap-2"
                            >
                              <CheckCircle2 size={16} />
                              <span>Link & Activate Child Account</span>
                            </button>
                          </div>
                        </div>
                      </form>
                    ) : (
                      /* List of Wards */
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase text-text-secondary">Connected Wards</h4>
                        {(ctx.wards || []).map(ward => (
                          <div key={ward.id} className="bg-surface rounded-2xl p-4 border border-border shadow-xs space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar 
                                  src={ward.avatar} 
                                  name={ward.name} 
                                  role="STUDENT" 
                                  size="md" 
                                  className="border border-border" 
                                />
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <h4 className="text-sm font-bold text-text-primary">{ward.name}</h4>
                                    {ward.relationship && (
                                      <span className="text-[10px] bg-bg px-2 py-0.5 rounded font-semibold text-text-secondary">{ward.relationship}</span>
                                    )}
                                  </div>
                                  <p className="text-xs text-text-secondary font-mono">{ward.studentId}</p>
                                  <p className="text-[11px] text-text-secondary">{ward.department}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] text-text-secondary uppercase font-bold">Balance</p>
                                <p className="text-sm font-bold text-emerald-600 font-mono">{formatCurrency(ward.balance)}</p>
                              </div>
                            </div>

                            {/* Quick Action Buttons */}
                            <div className="flex items-center justify-between pt-2 border-t border-border">
                              <div className="flex items-center gap-1">
                                <span className={`w-2 h-2 rounded-full ${ward.cardFrozen ? 'bg-danger' : 'bg-emerald-500'}`} />
                                <span className="text-[11px] text-text-secondary font-semibold">
                                  {ward.cardFrozen ? 'Card Frozen' : 'Card Active'}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setProfileTopUpWardId(ward.id);
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition cursor-pointer flex items-center gap-1"
                                >
                                  <ArrowUpCircle size={13} />
                                  <span>Top Up</span>
                                </button>
                                <button
                                  onClick={() => ctx.removeWard(ward.id)}
                                  className="p-1.5 rounded-xl text-danger hover:bg-danger/10 transition cursor-pointer"
                                  title="Unlink"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </div>

                            {/* Inline Top-up Trigger for this ward */}
                            {profileTopUpWardId === ward.id && (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }} 
                                animate={{ opacity: 1, height: 'auto' }} 
                                className="mt-2 p-3 bg-bg rounded-xl border border-border space-y-2 text-xs"
                              >
                                <div className="flex justify-between items-center font-bold text-text-primary">
                                  <span>Send Funds to {ward.name}</span>
                                  <button onClick={() => setProfileTopUpWardId(null)} className="text-text-secondary hover:text-text-primary">
                                    <X size={14} />
                                  </button>
                                </div>
                                <div className="flex gap-1.5">
                                  {[2000, 5000, 10000, 20000].map(amt => (
                                    <button
                                      key={amt}
                                      onClick={() => setProfileTopUpAmt(amt)}
                                      className={`flex-1 py-1 text-xs font-bold rounded-lg border transition ${
                                        profileTopUpAmt === amt ? 'bg-primary text-white border-primary' : 'bg-surface border-border text-text-secondary'
                                      }`}
                                    >
                                      ₦{amt.toLocaleString()}
                                    </button>
                                  ))}
                                </div>
                                <button
                                  onClick={() => {
                                    ctx.topUpWard(ward.id, profileTopUpAmt, 'Guardian Allowance');
                                    setProfileTopUpWardId(null);
                                  }}
                                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-xs"
                                >
                                  Confirm & Send ₦{profileTopUpAmt.toLocaleString()}
                                </button>
                              </motion.div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SettingRow({ 
  icon, 
  title, 
  subtitle,
  onClick 
}: { 
  icon: React.ReactNode; 
  title: string; 
  subtitle?: string;
  onClick?: () => void;
}) {
  return (
    <button 
      onClick={onClick}
      className="w-full p-4 flex items-center justify-between hover:bg-bg transition-colors text-left cursor-pointer group"
    >
      <div className="flex items-center gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-bg flex items-center justify-center shrink-0 border border-border/50 group-hover:border-primary/30 transition-colors">
          {icon}
        </div>
        <div>
          <h4 className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">{title}</h4>
          {subtitle && <p className="text-[11px] text-text-secondary font-medium">{subtitle}</p>}
        </div>
      </div>
      <ChevronRight size={18} className="text-text-secondary group-hover:translate-x-0.5 transition-transform" />
    </button>
  );
}
