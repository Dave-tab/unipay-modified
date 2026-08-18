import { ToastMessage } from './components/Toast';

export type ScreenId = 
  | 'LANDING'
  | 'LOGIN'
  | 'REGISTER'
  | 'HOME'
  | 'QR_PAY'
  | 'TOP_UP'
  | 'HISTORY'
  | 'SERVICES'
  | 'PROFILE'
  | 'MERCHANT_POS'
  | 'PARENT_PORTAL'
  | 'SERVICE_CAFETARIA'
  | 'SERVICE_PRINTING'
  | 'SERVICE_TRANSPORT'
  | 'SERVICE_BOOKSTORE'
  | 'SERVICE_EVENTS'
  | 'SERVICE_FEES'
  | 'SERVICE_HOSTEL'
  | 'SERVICE_HEALTH'
  | 'SERVICE_SPORTS'
  | 'SERVICE_IT_WIFI'
  | 'SERVICE_EXCURSION'
  | 'SERVICE_CERTIFICATES'
  | 'SERVICE_CUSTOM'
  | 'PAYMENT_SUCCESS';

export type UserRole = 'STUDENT' | 'PARENT' | 'MERCHANT';

export interface UserProfile {
  id: string;
  uid?: string;
  name: string;
  email: string;
  role: UserRole;
  balance?: number;
  cardFrozen?: boolean;
  studentId?: string;
  department?: string;
  level?: string;
  institution?: string;
  school?: string;
  phone?: string;
  wardName?: string;
  wardId?: string;
  businessName?: string;
  category?: string;
  avatar: string;
  linkedWards?: string[];
  loginPassword?: string;
  transactionPin?: string;
  hasLoginPassword?: boolean;
  hasTransactionPin?: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'PUBLIC' | 'CAMPUS' | 'PRIVATE';
  hideBalanceByDefault: boolean;
  analyticsOptIn: boolean;
  dataSharing: boolean;
  shareDataWithParent: boolean;
}

export interface LinkedAccount {
  id: string;
  bank: string;
  accNo: string;
  isDefault: boolean;
  type: string;
}

export type TransactionCategory = 
  | 'Cafeteria' 
  | 'Printing' 
  | 'Transport' 
  | 'Fees' 
  | 'Bookstore' 
  | 'Events' 
  | 'Hostel'
  | 'Health'
  | 'Sports'
  | 'IT & Media'
  | 'Excursion'
  | 'Certificates'
  | 'Custom Service'
  | 'Top-up' 
  | 'Transfer';

export interface Transaction {
  id: string;
  category: TransactionCategory;
  merchant: string;
  time: string;
  amount: number;
  type: 'credit' | 'debit';
  date: string;
  timestamp?: number;
}

export interface AllowanceSetting {
  enabled: boolean;
  amount: number;
  frequency: 'Weekly' | 'Monthly' | 'Daily';
  nextScheduleDate: string;
}

export interface SpendingLimits {
  dailyLimit: number;
  categoryCaps: {
    Cafeteria?: number;
    Printing?: number;
    Transport?: number;
    Bookstore?: number;
    Events?: number;
  };
}

export interface AlertSetting {
  lowBalanceThreshold: number;
  enabled: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'allowance' | 'transaction' | 'system';
  timestamp: string;
  read: boolean;
  amount?: number;
  linkScreen?: ScreenId;
}

export interface Ward {
  id: string;
  name: string;
  studentId: string;
  department: string;
  avatar: string;
  balance: number;
  cardFrozen: boolean;
  school: string;
  dataSharingEnabled?: boolean;
  relationship?: string;
  phone?: string;
  dailyLimit?: number;
  allowanceAmount?: number;
  allowanceFrequency?: 'Daily' | 'Weekly' | 'Monthly';
}

export interface UserContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  user: UserProfile;
  setUser: (user: UserProfile) => void;
  balance: number;
  updateBalance: (amount: number) => void;
  transactions: Transaction[];
  addTransaction: (tx: Transaction) => void;
  allowance: AllowanceSetting;
  setAllowance: React.Dispatch<React.SetStateAction<AllowanceSetting>>;
  spendingLimits: SpendingLimits;
  setSpendingLimits: React.Dispatch<React.SetStateAction<SpendingLimits>>;
  alertSettings: AlertSetting;
  setAlertSettings: React.Dispatch<React.SetStateAction<AlertSetting>>;
  wards: Ward[];
  setWards: React.Dispatch<React.SetStateAction<Ward[]>>;
  activeWardId: string;
  setActiveWardId: (id: string) => void;
  addWard: (ward: Omit<Ward, 'id'>) => void;
  updateWard: (id: string, updates: Partial<Ward>) => void;
  removeWard: (id: string) => void;
  topUpWard: (wardId: string, amount: number, note?: string) => void;
  notifications: AppNotification[];
  unreadNotificationCount: number;
  addNotification: (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;
  deleteNotification: (id: string) => void;
  isDarkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  pushNotificationsEnabled: boolean;
  setPushNotificationsEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  privacySettings: PrivacySettings;
  setPrivacySettings: React.Dispatch<React.SetStateAction<PrivacySettings>>;
  linkedAccounts: LinkedAccount[];
  setLinkedAccounts: React.Dispatch<React.SetStateAction<LinkedAccount[]>>;
  transactionPin: string;
  setTransactionPin: (pin: string) => void;
  loginPassword: string;
  setLoginPassword: (password: string) => void;
  hasLoginPassword: boolean;
  hasTransactionPin: boolean;
  openSecuritySetupModal: (onComplete?: () => void) => void;
  logout: () => void;
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  requestPayment: (details: { amount: number; title: string; subtitle?: string; }) => Promise<void>;
}

