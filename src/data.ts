import { Transaction, UserProfile, UserRole } from './types';

export const DEFAULT_PROFILES: Record<UserRole, UserProfile> = {
  STUDENT: {
    id: 'STU-24-00192',
    name: 'Sarah Davies',
    email: 'sarah.davies@uni.edu',
    role: 'STUDENT',
    studentId: '24-00192',
    department: 'Computer Science',
    level: '300 Level',
    institution: 'University of Lagos (UNILAG)',
    school: 'University of Lagos (UNILAG)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    balance: 12500,
  },
  PARENT: {
    id: 'PAR-8821',
    name: 'Dr. Robert Davies',
    email: 'robert.davies@gmail.com',
    role: 'PARENT',
    wardName: 'Sarah Davies',
    wardId: '24-00192',
    institution: 'University of Lagos (UNILAG)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    balance: 12500,
  },
  MERCHANT: {
    id: 'MER-0042',
    name: 'Main Campus Cafe',
    email: 'cafe@campus.edu',
    role: 'MERCHANT',
    businessName: 'Main Campus Cafe',
    category: 'Cafeteria',
    institution: 'University of Lagos (UNILAG)',
    avatar: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=150&auto=format&fit=crop&q=80',
    balance: 12500,
  },
};

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', category: 'Cafeteria', merchant: 'Main Cafe', time: '12:30 PM', amount: 1500, type: 'debit', date: 'Today' },
  { id: '2', category: 'Printing', merchant: 'Library Print Hub', time: '09:15 AM', amount: 200, type: 'debit', date: 'Today' },
  { id: '3', category: 'Top-up', merchant: 'Bank Transfer', time: 'Yesterday', amount: 5000, type: 'credit', date: 'Yesterday' },
  { id: '4', category: 'Transport', merchant: 'Campus Shuttle', time: '08:00 AM', amount: 150, type: 'debit', date: 'Yesterday' },
  { id: '5', category: 'Bookstore', merchant: 'Uni Store', time: '14:20 PM', amount: 3500, type: 'debit', date: '21 Oct' },
  { id: '6', category: 'Transfer', merchant: 'John Doe', time: '10:00 AM', amount: 1000, type: 'credit', date: '20 Oct' },
];

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount).replace('NGN', '₦'); // Force correct symbol for display
};
