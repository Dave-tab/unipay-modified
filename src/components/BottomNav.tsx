import React from 'react';
import { 
  Home, ScanLine, Clock, LayoutGrid, User, 
  Scan, Receipt, PieChart, Settings, 
  Zap, Sliders, Shield 
} from 'lucide-react';
import { ScreenId, UserRole } from '../types';

interface BottomNavProps {
  role: UserRole;
  currentScreen: ScreenId;
  setCurrentScreen: (screen: ScreenId) => void;
  merchantTab?: 'TERMINAL' | 'TRANSACTIONS' | 'ANALYTICS' | 'SETTINGS';
  setMerchantTab?: (tab: 'TERMINAL' | 'TRANSACTIONS' | 'ANALYTICS' | 'SETTINGS') => void;
  parentTab?: 'OVERVIEW' | 'SERVICES' | 'ALLOWANCE' | 'LIMITS' | 'ALERTS' | 'SECURITY';
  setParentTab?: (tab: 'OVERVIEW' | 'SERVICES' | 'ALLOWANCE' | 'LIMITS' | 'ALERTS' | 'SECURITY') => void;
}

export function BottomNav({ 
  role, 
  currentScreen, 
  setCurrentScreen, 
  merchantTab, 
  setMerchantTab, 
  parentTab, 
  setParentTab 
}: BottomNavProps) {
  if (role === 'MERCHANT') {
    return (
      <div className="w-full h-16 bg-surface/95 backdrop-blur-md border-t border-border px-4 flex justify-around items-center shrink-0 z-40 select-none">
        <NavItem 
          icon={<Scan size={20} />} 
          label="Terminal" 
          active={currentScreen === 'MERCHANT_POS' && merchantTab === 'TERMINAL'} 
          onClick={() => {
            setCurrentScreen('MERCHANT_POS');
            if (setMerchantTab) setMerchantTab('TERMINAL');
          }} 
        />
        <NavItem 
          icon={<Receipt size={20} />} 
          label="Ledger" 
          active={currentScreen === 'MERCHANT_POS' && merchantTab === 'TRANSACTIONS'} 
          onClick={() => {
            setCurrentScreen('MERCHANT_POS');
            if (setMerchantTab) setMerchantTab('TRANSACTIONS');
          }} 
        />
        <NavItem 
          icon={<PieChart size={20} />} 
          label="Insights" 
          active={currentScreen === 'MERCHANT_POS' && merchantTab === 'ANALYTICS'} 
          onClick={() => {
            setCurrentScreen('MERCHANT_POS');
            if (setMerchantTab) setMerchantTab('ANALYTICS');
          }} 
        />
        <NavItem 
          icon={<Settings size={20} />} 
          label="Store" 
          active={currentScreen === 'MERCHANT_POS' && merchantTab === 'SETTINGS'} 
          onClick={() => {
            setCurrentScreen('MERCHANT_POS');
            if (setMerchantTab) setMerchantTab('SETTINGS');
          }} 
        />
        <NavItem 
          icon={<User size={20} />} 
          label="Profile" 
          active={currentScreen === 'PROFILE'} 
          onClick={() => setCurrentScreen('PROFILE')} 
        />
      </div>
    );
  }

  if (role === 'PARENT') {
    return (
      <div className="w-full h-16 bg-surface/95 backdrop-blur-md border-t border-border px-4 flex justify-around items-center shrink-0 z-40 select-none">
        <NavItem 
          icon={<Home size={20} />} 
          label="Overview" 
          active={currentScreen === 'PARENT_PORTAL' && parentTab === 'OVERVIEW'} 
          onClick={() => {
            setCurrentScreen('PARENT_PORTAL');
            if (setParentTab) setParentTab('OVERVIEW');
          }} 
        />
        <NavItem 
          icon={<LayoutGrid size={20} />} 
          label="Services" 
          active={currentScreen === 'PARENT_PORTAL' && parentTab === 'SERVICES'} 
          onClick={() => {
            setCurrentScreen('PARENT_PORTAL');
            if (setParentTab) setParentTab('SERVICES');
          }} 
        />
        <NavItem 
          icon={<Zap size={20} />} 
          label="Allowance" 
          active={currentScreen === 'PARENT_PORTAL' && parentTab === 'ALLOWANCE'} 
          onClick={() => {
            setCurrentScreen('PARENT_PORTAL');
            if (setParentTab) setParentTab('ALLOWANCE');
          }} 
        />
        <NavItem 
          icon={<Sliders size={20} />} 
          label="Caps" 
          active={currentScreen === 'PARENT_PORTAL' && parentTab === 'LIMITS'} 
          onClick={() => {
            setCurrentScreen('PARENT_PORTAL');
            if (setParentTab) setParentTab('LIMITS');
          }} 
        />
        <NavItem 
          icon={<User size={20} />} 
          label="Profile" 
          active={currentScreen === 'PROFILE'} 
          onClick={() => setCurrentScreen('PROFILE')} 
        />
      </div>
    );
  }

  // Default Student Nav
  return (
    <div className="w-full h-16 bg-surface/95 backdrop-blur-md border-t border-border px-4 flex justify-around items-center shrink-0 z-40 select-none">
      <NavItem icon={<Home size={22} />} label="Home" active={currentScreen === 'HOME'} onClick={() => setCurrentScreen('HOME')} />
      <NavItem icon={<ScanLine size={22} />} label="Pay" active={currentScreen === 'QR_PAY'} onClick={() => setCurrentScreen('QR_PAY')} />
      <NavItem icon={<Clock size={22} />} label="History" active={currentScreen === 'HISTORY'} onClick={() => setCurrentScreen('HISTORY')} />
      <NavItem icon={<LayoutGrid size={22} />} label="Services" active={currentScreen === 'SERVICES'} onClick={() => setCurrentScreen('SERVICES')} />
      <NavItem icon={<User size={22} />} label="Profile" active={currentScreen === 'PROFILE'} onClick={() => setCurrentScreen('PROFILE')} />
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1 w-16 cursor-pointer ${active ? 'text-primary' : 'text-text-secondary hover:text-text-primary'}`}>
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}
