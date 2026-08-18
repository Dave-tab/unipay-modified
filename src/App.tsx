import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScreenId, UserRole, UserContextType, Transaction, UserProfile, AllowanceSetting, SpendingLimits, AlertSetting, Ward } from './types';
import { MOCK_TRANSACTIONS, DEFAULT_PROFILES, formatCurrency } from './data';
import { BottomNav } from './components/BottomNav';
import { ToastContainer, ToastMessage } from './components/Toast';
import { NotificationCenter } from './components/NotificationCenter';
import { PaymentConfirmationModal } from './components/PaymentConfirmationModal';
import { SecuritySetupModal } from './components/SecuritySetupModal';
import { auth, db, getUserDoc, logoutUser } from './lib/firebase';
import { doc, setDoc, onSnapshot, collection, query, orderBy, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { AppNotification } from './types';


// Screens
import { LandingScreen } from './screens/LandingScreen';
import { LoginScreen } from './screens/LoginScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { HomeScreen } from './screens/HomeScreen';
import { QrPayScreen } from './screens/QrPayScreen';
import { TopUpScreen } from './screens/TopUpScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { ServicesScreen, SubServiceScreen } from './screens/ServicesScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { MerchantPosScreen } from './screens/MerchantPosScreen';
import { ParentPortalScreen } from './screens/ParentPortalScreen';

export default function App() {
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [user, setUser] = useState<UserProfile>(DEFAULT_PROFILES.STUDENT);
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('LANDING');
  
  // Shared State
  const [balance, setBalance] = useState<number>(12500);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Listen to Firebase Auth state on mount
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        try {
          const userDoc = await getUserDoc(authUser.uid);
          if (userDoc) {
            const profileData = userDoc as UserProfile;
            setUser(profileData);
            setRole(profileData.role || 'STUDENT');
            if (profileData.balance !== undefined) {
              setBalance(profileData.balance);
            } else {
              setBalance(12500);
            }
          }
        } catch (err) {
          console.error("Error loading user profile from Firebase:", err);
        }
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Real-time Firestore Listeners
  useEffect(() => {
    if (!user || user.id === DEFAULT_PROFILES[role].id || !user.uid) return; // Don't run for mock users

    const unsubscribeUser = onSnapshot(
      doc(db, "users", user.uid), 
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUser(prev => ({ ...prev, ...data }));
          if (data.balance !== undefined) {
            setBalance(data.balance);
          }
        }
      },
      (error) => {
        console.warn("User snapshot notice (offline resilient mode):", error.message);
      }
    );

    let txQuery;
    if (role === 'MERCHANT') {
      txQuery = query(collection(db, "transactions"), where("merchantId", "==", user.uid));
    } else if (role === 'PARENT' && user.linkedWards && user.linkedWards.length > 0) {
      txQuery = query(collection(db, "transactions"), where("userId", "in", user.linkedWards));
    } else {
      txQuery = query(collection(db, "transactions"), where("userId", "==", user.uid));
    }
    
    const unsubscribeTx = onSnapshot(
      txQuery, 
      (snapshot) => {
        const txs: Transaction[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          txs.push({
            id: data.id,
            category: data.category,
            merchant: data.merchant,
            time: data.time,
            date: data.date,
            amount: data.amount,
            type: data.userId === user.uid ? data.type : (data.merchantId === user.uid ? 'credit' : data.type),
            timestamp: data.timestamp
          });
        });
        
        txs.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        setTransactions(txs);
      },
      (error) => {
        console.warn("Transaction snapshot notice (offline resilient mode):", error.message);
      }
    );

    return () => {
      unsubscribeUser();
      unsubscribeTx();
    };
  }, [user?.uid, role]);

  // Notifications State - Starts empty for clean account session
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const handleShowToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = 'toast-' + Math.random().toString().slice(2, 9);
    setToasts(prev => [{ ...toast, id }, ...prev.slice(0, 2)]);
  };

  const handleDismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Notification Helpers
  const handleAddNotification = (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: AppNotification = {
      ...n,
      id: 'notif-' + Math.random().toString().slice(2, 9),
      timestamp: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleAddTestAlert = () => {
    const alerts: Array<Omit<AppNotification, 'id' | 'timestamp' | 'read'>> = [
      {
        title: 'Low Balance Warning',
        message: 'Your wallet balance is below threshold (₦3,000). Top up soon.',
        type: 'alert',
        amount: 3000,
        linkScreen: 'TOP_UP'
      },
      {
        title: 'Allowance Received',
        message: 'Weekly allowance of ₦5,000 credited by parent.',
        type: 'allowance',
        amount: 5000,
        linkScreen: 'HISTORY'
      }
    ];
    const picked = alerts[Math.floor(Math.random() * alerts.length)];
    handleAddNotification(picked);
  };


  // Financial Controls State
  const [allowance, setAllowance] = useState<AllowanceSetting>({
    enabled: true,
    amount: 5000,
    frequency: 'Weekly',
    nextScheduleDate: 'Next Monday, 8:00 AM'
  });

  const [spendingLimits, setSpendingLimits] = useState<SpendingLimits>({
    dailyLimit: 8000,
    categoryCaps: {
      Cafeteria: 3000,
      Printing: 1500,
      Transport: 1000,
      Bookstore: 10000,
      Events: 5000,
    }
  });

  const [alertSettings, setAlertSettings] = useState<AlertSetting>({
    lowBalanceThreshold: 3000,
    enabled: true
  });

  // Settings State
  const [isDarkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('unipay_dark_mode') === 'true';
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      try { localStorage.setItem('unipay_dark_mode', 'true'); } catch {}
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      try { localStorage.setItem('unipay_dark_mode', 'false'); } catch {}
    }
  }, [isDarkMode]);
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState<boolean>(true);
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'CAMPUS' as 'PUBLIC' | 'CAMPUS' | 'PRIVATE',
    hideBalanceByDefault: false,
    analyticsOptIn: true,
    dataSharing: true,
    shareDataWithParent: false
  });
  const [linkedAccounts, setLinkedAccounts] = useState([
    { id: 'acc-1', bank: 'Zenith Bank', accNo: '228****492', isDefault: true, type: 'Bank Account' },
    { id: 'acc-2', bank: 'GTBank', accNo: '014****082', isDefault: false, type: 'Parent Account' }
  ]);
  const [transactionPin, setTransactionPin] = useState<string>(() => {
    return localStorage.getItem('unipay_trans_pin') || '1234';
  });
  const [loginPassword, setLoginPassword] = useState<string>(() => {
    return localStorage.getItem('unipay_login_pass') || '123456';
  });
  const [hasLoginPassword, setHasLoginPassword] = useState<boolean>(() => {
    return localStorage.getItem('unipay_has_login_pass') === 'true';
  });
  const [hasTransactionPin, setHasTransactionPin] = useState<boolean>(() => {
    return localStorage.getItem('unipay_has_trans_pin') === 'true';
  });

  const [isSecuritySetupOpen, setIsSecuritySetupOpen] = useState(false);
  const [pendingSecurityCallback, setPendingSecurityCallback] = useState<(() => void) | null>(null);
  
  const [paymentRequest, setPaymentRequest] = useState<{
    amount: number;
    title: string;
    subtitle?: string;
    resolve: () => void;
    reject: (err: Error) => void;
  } | null>(null);

  const requestPayment = (details: { amount: number; title: string; subtitle?: string }) => {
    return new Promise<void>((resolve, reject) => {
      if (!hasLoginPassword || !hasTransactionPin) {
        // Intercept: User must create 6-digit login password & 4-digit transaction password first
        setPendingSecurityCallback(() => () => {
          setPaymentRequest({ ...details, resolve, reject });
        });
        setIsSecuritySetupOpen(true);
      } else {
        setPaymentRequest({ ...details, resolve, reject });
      }
    });
  };

  const handleSecuritySetupComplete = (newLoginPass: string, newTransPin: string) => {
    setLoginPassword(newLoginPass);
    setTransactionPin(newTransPin);
    setHasLoginPassword(true);
    setHasTransactionPin(true);
    try {
      localStorage.setItem('unipay_login_pass', newLoginPass);
      localStorage.setItem('unipay_trans_pin', newTransPin);
      localStorage.setItem('unipay_has_login_pass', 'true');
      localStorage.setItem('unipay_has_trans_pin', 'true');
    } catch {}

    setIsSecuritySetupOpen(false);

    handleShowToast({
      type: 'success',
      title: 'Security Passwords Saved',
      message: '6-digit login password & 4-digit transaction PIN configured successfully.'
    });

    if (pendingSecurityCallback) {
      const cb = pendingSecurityCallback;
      setPendingSecurityCallback(null);
      cb();
    }
  };

  const [merchantTab, setMerchantTab] = useState<'TERMINAL' | 'TRANSACTIONS' | 'ANALYTICS' | 'SETTINGS'>('TERMINAL');
  const [parentTab, setParentTab] = useState<'OVERVIEW' | 'SERVICES' | 'ALLOWANCE' | 'LIMITS' | 'ALERTS' | 'SECURITY'>('OVERVIEW');

  // Multi-Student Wards State for Parent Portal & Profile
  const [wards, setWards] = useState<Ward[]>([
    {
      id: 'ward-1',
      name: 'Sarah Davies',
      studentId: '24-00192',
      department: 'Computer Science • 300L',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      balance: 12500,
      cardFrozen: false,
      school: 'University of Lagos (Main Campus)',
      dataSharingEnabled: false,
      relationship: 'Daughter',
      phone: '+234 812 345 6789',
      dailyLimit: 8000,
      allowanceAmount: 5000,
      allowanceFrequency: 'Weekly'
    },
    {
      id: 'ward-2',
      name: 'Michael Davies',
      studentId: '22-04810',
      department: 'Mechanical Engineering • 400L',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      balance: 18400,
      cardFrozen: false,
      school: 'University of Lagos (College of Tech)',
      dataSharingEnabled: false,
      relationship: 'Son',
      phone: '+234 809 876 5432',
      dailyLimit: 10000,
      allowanceAmount: 7500,
      allowanceFrequency: 'Weekly'
    }
  ]);
  const [activeWardId, setActiveWardId] = useState<string>('ward-1');

  const handleAddWard = (newWardData: Omit<Ward, 'id'>) => {
    const id = 'ward-' + Math.random().toString().slice(2, 8);
    const newWard: Ward = {
      ...newWardData,
      id
    };
    setWards(prev => [newWard, ...prev]);
    setActiveWardId(id);
    handleShowToast({
      type: 'success',
      title: 'Child Linked Successfully',
      message: `${newWard.name} (${newWard.studentId}) is now linked to your Parent Guardian portal.`
    });
    handleAddNotification({
      title: 'New Student Account Linked',
      message: `${newWard.name} (${newWard.studentId}) was added to your monitored family accounts.`,
      type: 'system',
      linkScreen: 'PARENT_PORTAL'
    });
  };

  const handleUpdateWard = (id: string, updates: Partial<Ward>) => {
    setWards(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  };

  const handleRemoveWard = (id: string) => {
    const wardToRemove = wards.find(w => w.id === id);
    setWards(prev => prev.filter(w => w.id !== id));
    if (activeWardId === id) {
      const remaining = wards.filter(w => w.id !== id);
      if (remaining.length > 0) {
        setActiveWardId(remaining[0].id);
      }
    }
    handleShowToast({
      type: 'info',
      title: 'Account Unlinked',
      message: wardToRemove ? `${wardToRemove.name} was removed from your guardian monitoring list.` : 'Child account unlinked.'
    });
  };

  const handleTopUpWard = async (wardId: string, amount: number, note?: string) => {
    const targetWard = wards.find(w => w.id === wardId);
    if (!targetWard) return;

    try {
      await requestPayment({
        amount: amount,
        title: targetWard.name,
        subtitle: `Transfer to Child Wallet${note ? ` (${note})` : ''}`
      });

      setWards(prev => prev.map(w => w.id === wardId ? { ...w, balance: w.balance + amount } : w));

      // Also update general student balance if current ward matches active user
      if (activeWardId === wardId) {
        setBalance(prev => prev + amount);
      }

      handleAddTransaction({
        id: Math.random().toString().slice(2, 8),
        category: 'Top-up',
        merchant: `Parent Allowance to ${targetWard.name}${note ? ` (${note})` : ''}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        amount: amount,
        type: 'credit',
        date: 'Today',
        timestamp: Date.now()
      });

      handleShowToast({
        type: 'success',
        title: 'Ward Wallet Credited',
        message: `Successfully transferred ${formatCurrency(amount)} to ${targetWard.name}'s campus wallet.`,
        amount: amount,
        txType: 'credit',
        merchant: `${targetWard.name}'s Wallet`,
        category: 'Top-up'
      });

      handleAddNotification({
        title: 'Allowance & Top-Up Sent',
        message: `Transferred ₦${amount.toLocaleString()} to ${targetWard.name} (${targetWard.studentId}).`,
        type: 'allowance',
        amount: amount,
        linkScreen: 'PARENT_PORTAL'
      });
    } catch (err) {
      console.log('Parent TopUp Cancelled');
    }
  };

  // Automatically scroll to the top of the page on any screen or tab navigation
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [currentScreen, merchantTab, parentTab]);

  const handleLogout = async () => {
    try {
      const { logoutUser } = await import('./lib/firebase');
      await logoutUser();
    } catch (e) {
      console.error('Logout error', e);
    }
    setUser(DEFAULT_PROFILES[role]);
    setTransactions(MOCK_TRANSACTIONS);
    setCurrentScreen('LANDING');
  };

  const handleSwitchRole = (newRole: UserRole) => {
    setRole(newRole);
    setUser(DEFAULT_PROFILES[newRole]);
    if (newRole === 'STUDENT') setCurrentScreen('HOME');
    else if (newRole === 'PARENT') setCurrentScreen('PARENT_PORTAL');
    else if (newRole === 'MERCHANT') setCurrentScreen('MERCHANT_POS');
  };

  const handleResetDemoData = () => {
    setBalance(12500);
    setTransactions(MOCK_TRANSACTIONS);
    setAllowance({
      enabled: true,
      amount: 5000,
      frequency: 'Weekly',
      nextScheduleDate: 'Next Monday, 8:00 AM'
    });
    setSpendingLimits({
      dailyLimit: 8000,
      categoryCaps: {
        Cafeteria: 3000,
        Printing: 1500,
        Transport: 1000,
        Bookstore: 10000,
        Events: 5000,
      }
    });

    // Reset Firebase documents
    try {
      setDoc(doc(db, 'wallets', 'student-default'), { balance: 12500, updatedAt: new Date().toISOString() }).catch(() => {});
      setDoc(doc(db, 'spending_controls', 'student-default'), {
        allowance: { enabled: true, amount: 5000, frequency: 'Weekly', nextScheduleDate: 'Next Monday, 8:00 AM' },
        spendingLimits: { dailyLimit: 8000, categoryCaps: { Cafeteria: 3000, Printing: 1500, Transport: 1000, Bookstore: 10000, Events: 5000 } }
      }).catch(() => {});
    } catch {
      // Network catch
    }
  };

  const handleAddTransaction = async (tx: Transaction) => {
    // If we're using mock user, just update local state
    if (!user || user.id === DEFAULT_PROFILES[role].id || !user.uid) {
      setTransactions(prev => [tx, ...prev]);
      const isCredit = tx.type === 'credit';
      const newBalance = isCredit ? balance + tx.amount : balance - tx.amount;
      setBalance(newBalance);
      // Trigger notifications and toasts
      triggerNotifications(tx, isCredit, newBalance);
      return;
    }

    // Sync transaction document to Firestore
    try {
      const isCredit = tx.type === 'credit';
      const newBalance = isCredit ? balance + tx.amount : balance - tx.amount;
      
      const txDocRef = doc(collection(db, 'transactions'));
      
      const txData: any = {
        ...tx,
        id: txDocRef.id,
        timestamp: Date.now()
      };
      
      if (role === 'MERCHANT') {
        txData.merchantId = user.uid;
        txData.userId = (tx as any).userId || 'scanned-student-placeholder';
      } else {
        txData.userId = user.uid;
      }
      
      await setDoc(txDocRef, txData);

      // Update balance
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { balance: newBalance }, { merge: true });

      triggerNotifications(tx, isCredit, newBalance);
    } catch (e) {
      console.error("Failed to add transaction", e);
    }
  };

  const triggerNotifications = (tx: Transaction, isCredit: boolean, newBalance: number) => {
    if (isCredit) {
      const isAllowance = tx.category === 'Top-up' || tx.merchant.toLowerCase().includes('allowance');
      handleAddNotification({
        title: isAllowance ? 'Allowance Received' : 'Funds Deposited',
        message: `${tx.merchant} credited ₦${tx.amount.toLocaleString()} to your wallet balance.`,
        type: 'allowance',
        amount: tx.amount,
        linkScreen: 'HISTORY'
      });
    } else {
      handleAddNotification({
        title: 'Payment Completed',
        message: `Paid ₦${tx.amount.toLocaleString()} to ${tx.merchant} (${tx.category}).`,
        type: 'transaction',
        amount: tx.amount,
        linkScreen: 'HISTORY'
      });
    }

    if (alertSettings.enabled && newBalance < alertSettings.lowBalanceThreshold) {
      handleAddNotification({
        title: 'Low Balance Warning',
        message: `Your balance (₦${newBalance.toLocaleString()}) is below the threshold (₦${alertSettings.lowBalanceThreshold.toLocaleString()}). Tap to top up now.`,
        type: 'alert',
        amount: newBalance,
        linkScreen: 'TOP_UP'
      });
    }

    handleShowToast({
      type: 'success',
      title: isCredit ? 'Payment Received' : 'Payment Completed',
      message: isCredit 
        ? `${tx.merchant} credited your account` 
        : `Paid ${tx.merchant} (${tx.category})`,
      amount: tx.amount,
      txType: tx.type,
      merchant: tx.merchant,
      category: tx.category
    });
  };

  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  const ctx: UserContextType = {
    role,
    setRole,
    user,
    setUser,
    balance,
    updateBalance: (amt) => setBalance(prev => prev + amt),
    transactions,
    addTransaction: handleAddTransaction,
    allowance,
    setAllowance,
    spendingLimits,
    setSpendingLimits,
    alertSettings,
    setAlertSettings,
    wards,
    setWards,
    activeWardId,
    setActiveWardId,
    addWard: handleAddWard,
    updateWard: handleUpdateWard,
    removeWard: handleRemoveWard,
    topUpWard: handleTopUpWard,
    notifications,
    unreadNotificationCount,
    addNotification: handleAddNotification,
    markNotificationAsRead: handleMarkNotificationAsRead,
    markAllNotificationsAsRead: handleMarkAllNotificationsAsRead,
    clearNotifications: handleClearNotifications,
    deleteNotification: handleDeleteNotification,
    isDarkMode,
    setDarkMode,
    pushNotificationsEnabled,
    setPushNotificationsEnabled,
    privacySettings,
    setPrivacySettings,
    linkedAccounts,
    setLinkedAccounts,
    transactionPin,
    setTransactionPin,
    loginPassword,
    setLoginPassword,
    hasLoginPassword,
    hasTransactionPin,
    openSecuritySetupModal: (onComplete?: () => void) => {
      if (onComplete) {
        setPendingSecurityCallback(() => onComplete);
      }
      setIsSecuritySetupOpen(true);
    },
    logout: handleLogout,
    showToast: handleShowToast,
    requestPayment,
  };

  const handleLogin = (selectedRole: UserRole, customUser?: UserProfile) => {
    setRole(selectedRole);
    const profile = customUser || DEFAULT_PROFILES[selectedRole];
    setUser(profile);
    
    // Assign Mock data for 1-Click demo, clear for real users
    if (!customUser) {
      setTransactions(MOCK_TRANSACTIONS);
      setHasLoginPassword(true);
      setHasTransactionPin(true);
      try {
        localStorage.setItem('unipay_has_login_pass', 'true');
        localStorage.setItem('unipay_has_trans_pin', 'true');
      } catch {}
    } else {
      setTransactions([]);
      // Check if customUser explicitly has passwords set
      const userHasLogin = Boolean(customUser.hasLoginPassword || (customUser.loginPassword && customUser.loginPassword.length === 6));
      const userHasPin = Boolean(customUser.hasTransactionPin || (customUser.transactionPin && customUser.transactionPin.length === 4));
      
      setHasLoginPassword(userHasLogin);
      setHasTransactionPin(userHasPin);
      try {
        localStorage.setItem('unipay_has_login_pass', userHasLogin ? 'true' : 'false');
        localStorage.setItem('unipay_has_trans_pin', userHasPin ? 'true' : 'false');
      } catch {}
    }

    if (profile.balance !== undefined) {
      setBalance(profile.balance);
    } else {
      setBalance(12500);
    }
    if (selectedRole === 'STUDENT') setCurrentScreen('HOME');
    else if (selectedRole === 'PARENT') setCurrentScreen('PARENT_PORTAL');
    else if (selectedRole === 'MERCHANT') setCurrentScreen('MERCHANT_POS');
  };

  const showBottomNav = 
    user && 
    !['LANDING', 'LOGIN', 'REGISTER'].includes(currentScreen);

  // Swipe Gesture Listener for Main Navigation Tabs (Home, History, Services, Profile)
  const SWIPE_TABS: ScreenId[] = ['HOME', 'HISTORY', 'SERVICES', 'PROFILE'];
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (role !== 'STUDENT' || !SWIPE_TABS.includes(currentScreen)) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    touchStartPos.current = { x: clientX, y: clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (!touchStartPos.current || role !== 'STUDENT' || !SWIPE_TABS.includes(currentScreen)) return;
    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
    const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : e.clientY;

    const deltaX = clientX - touchStartPos.current.x;
    const deltaY = clientY - touchStartPos.current.y;
    touchStartPos.current = null;

    // Minimum 45px swipe horizontal distance, ensuring horizontal gesture dominates vertical scroll
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4) {
      const currentIndex = SWIPE_TABS.indexOf(currentScreen);
      if (currentIndex !== -1) {
        if (deltaX < 0 && currentIndex < SWIPE_TABS.length - 1) {
          // Swipe Left -> Switch to Next Tab (e.g. Home -> History -> Services)
          setCurrentScreen(SWIPE_TABS[currentIndex + 1]);
        } else if (deltaX > 0 && currentIndex > 0) {
          // Swipe Right -> Switch to Previous Tab (e.g. Services -> History -> Home)
          setCurrentScreen(SWIPE_TABS[currentIndex - 1]);
        }
      }
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-bg text-text-primary flex flex-col items-center justify-start antialiased selection:bg-primary/20 selection:text-primary transition-colors pb-24">
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
      
      {/* Global Payment Confirmation Modal */}
      {paymentRequest && (
        <PaymentConfirmationModal
          isOpen={true}
          amount={paymentRequest.amount}
          title={paymentRequest.title}
          subtitle={paymentRequest.subtitle}
          expectedPin={transactionPin}
          onConfirm={() => {
            paymentRequest.resolve();
            setPaymentRequest(null);
          }}
          onCancel={() => {
            paymentRequest.reject(new Error('Payment cancelled by user.'));
            setPaymentRequest(null);
          }}
        />
      )}

      {/* Global Security Setup Modal (6-Digit Login Pass & 4-Digit Trans PIN) */}
      <SecuritySetupModal
        isOpen={isSecuritySetupOpen}
        onClose={() => {
          setIsSecuritySetupOpen(false);
          if (pendingSecurityCallback) {
            setPendingSecurityCallback(null);
          }
        }}
        onComplete={handleSecuritySetupComplete}
      />

      {/* Main App Container */}
      <div 
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        className="w-full flex-1 md:flex-initial md:max-w-2xl lg:max-w-5xl xl:max-w-6xl md:w-full md:my-6 md:rounded-3xl bg-surface flex flex-col relative shadow-2xl md:border md:border-border/60 min-h-screen md:min-h-[780px] overflow-hidden transition-all duration-300"
      >
        {/* In-App Notification Center Drawer Scoped inside Platform UI */}
        <NotificationCenter
          isOpen={isNotificationOpen}
          onClose={() => setIsNotificationOpen(false)}
          notifications={notifications}
          onMarkAsRead={handleMarkNotificationAsRead}
          onMarkAllAsRead={handleMarkAllNotificationsAsRead}
          onClearAll={handleClearNotifications}
          onDelete={handleDeleteNotification}
          onAddTestAlert={handleAddTestAlert}
          setCurrentScreen={setCurrentScreen}
        />

        {/* Normal Page Content Viewport */}
        <div className="w-full flex-1 flex flex-col">
          <AnimatePresence mode="wait" initial={false}>
            {currentScreen === 'LANDING' && (
              <motion.div key="landing" className="w-full flex-1 flex flex-col">
                <LandingScreen setCurrentScreen={setCurrentScreen} />
              </motion.div>
            )}
            {currentScreen === 'LOGIN' && (
              <motion.div key="login" className="w-full flex-1 flex flex-col">
                <LoginScreen onLogin={handleLogin} setCurrentScreen={setCurrentScreen} />
              </motion.div>
            )}
            {currentScreen === 'REGISTER' && (
              <motion.div key="register" className="w-full flex-1 flex flex-col">
                <RegisterScreen onRegister={handleLogin} setCurrentScreen={setCurrentScreen} />
              </motion.div>
            )}
            {currentScreen === 'HOME' && (
              <motion.div key="home" className="w-full flex-1 flex flex-col">
                <HomeScreen ctx={ctx} setCurrentScreen={setCurrentScreen} onOpenNotifications={() => setIsNotificationOpen(true)} />
              </motion.div>
            )}
            {currentScreen === 'QR_PAY' && (
              <motion.div key="qrpay" className="w-full flex-1 flex flex-col">
                <QrPayScreen ctx={ctx} setCurrentScreen={setCurrentScreen} />
              </motion.div>
            )}
            {currentScreen === 'TOP_UP' && (
              <motion.div key="topup" className="w-full flex-1 flex flex-col">
                <TopUpScreen ctx={ctx} setCurrentScreen={setCurrentScreen} />
              </motion.div>
            )}
            {currentScreen === 'HISTORY' && (
              <motion.div key="history" className="w-full flex-1 flex flex-col">
                <HistoryScreen ctx={ctx} setCurrentScreen={setCurrentScreen} />
              </motion.div>
            )}
            {currentScreen === 'SERVICES' && (
              <motion.div key="services" className="w-full flex-1 flex flex-col">
                <ServicesScreen ctx={ctx} setCurrentScreen={setCurrentScreen} />
              </motion.div>
            )}
            {currentScreen === 'PROFILE' && (
              <motion.div key="profile" className="w-full flex-1 flex flex-col">
                <ProfileScreen ctx={ctx} onLogout={handleLogout} setCurrentScreen={setCurrentScreen} />
              </motion.div>
            )}
            {currentScreen === 'MERCHANT_POS' && (
              <motion.div key="merchant" className="w-full flex-1 flex flex-col">
                <MerchantPosScreen ctx={ctx} onLogout={handleLogout} activeTab={merchantTab} setActiveTab={setMerchantTab} />
              </motion.div>
            )}
            {currentScreen === 'PARENT_PORTAL' && (
              <motion.div key="parent" className="w-full flex-1 flex flex-col">
                <ParentPortalScreen ctx={ctx} onLogout={handleLogout} setCurrentScreen={setCurrentScreen} activeTab={parentTab} setActiveTab={setParentTab} />
              </motion.div>
            )}
            {currentScreen.startsWith('SERVICE_') && (
              <motion.div key={currentScreen} className="w-full flex-1 flex flex-col">
                <SubServiceScreen id={currentScreen} ctx={ctx} setCurrentScreen={setCurrentScreen} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Static, Always-Visible Fixed Bottom Navigation Bar */}
        {showBottomNav && (
          <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
            <div className="w-full md:max-w-2xl lg:max-w-5xl xl:max-w-6xl pointer-events-auto bg-surface/95 backdrop-blur-md border-t border-border shadow-lg">
              <BottomNav 
                role={role}
                currentScreen={currentScreen} 
                setCurrentScreen={setCurrentScreen} 
                merchantTab={merchantTab}
                setMerchantTab={setMerchantTab}
                parentTab={parentTab}
                setParentTab={setParentTab}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
