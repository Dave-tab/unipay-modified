import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Bell, 
  BellOff, 
  ShieldAlert, 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  CheckCheck, 
  Trash2, 
  ChevronRight, 
  Sparkles, 
  Info,
  CheckCircle2
} from 'lucide-react';
import { AppNotification, ScreenId } from '../types';
import { formatCurrency } from '../data';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onDelete: (id: string) => void;
  onAddTestAlert?: () => void;
  setCurrentScreen: (screen: ScreenId) => void;
}

export function NotificationCenter({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onDelete,
  onAddTestAlert,
  setCurrentScreen
}: NotificationCenterProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'alert' | 'allowance' | 'transaction'>('all');

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'all') return true;
    return n.type === activeFilter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (item: AppNotification) => {
    if (!item.read) {
      onMarkAsRead(item.id);
    }
    if (item.linkScreen) {
      setCurrentScreen(item.linkScreen);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="absolute inset-0 z-50 flex justify-end overflow-hidden rounded-3xl">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Slide-over Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative z-10 w-full bg-surface h-full flex flex-col shadow-2xl border-l border-border overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="bg-primary px-6 pt-12 pb-6 text-white relative">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                    <Bell size={20} className="text-[#00C48C]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      Notification Center
                      {unreadCount > 0 && (
                        <span className="text-[10px] bg-[#00C48C] text-[#0F0830] font-extrabold px-2 py-0.5 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-white/70">Updates, allowance alerts & payment logs</p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
                  title="Close Notification Center"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Action Buttons Bar */}
              {notifications.length > 0 && (
                <div className="flex justify-between items-center pt-2 border-t border-white/10 text-xs">
                  <button
                    onClick={onMarkAllAsRead}
                    disabled={unreadCount === 0}
                    className="flex items-center gap-1.5 text-white/80 hover:text-white disabled:opacity-40 transition cursor-pointer font-medium"
                  >
                    <CheckCheck size={15} className="text-[#00C48C]" /> Mark all read
                  </button>

                  <button
                    onClick={onClearAll}
                    className="flex items-center gap-1.5 text-rose-300 hover:text-rose-200 transition cursor-pointer font-medium"
                  >
                    <Trash2 size={14} /> Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Filter Tabs */}
            {notifications.length > 0 && (
              <div className="flex gap-1.5 p-3 bg-bg border-b border-border overflow-x-auto custom-scrollbar">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'alert', label: 'Alerts' },
                  { id: 'allowance', label: 'Allowance' },
                  { id: 'transaction', label: 'Transactions' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilter(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      activeFilter === tab.id
                        ? 'bg-primary text-white shadow-xs'
                        : 'bg-surface text-text-secondary border border-border hover:bg-bg'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {/* Notification List or Empty State */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-bg">
              {filteredNotifications.length === 0 ? (
                /* EMPTY STATE UI */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center p-6 my-auto"
                >
                  <div className="w-24 h-24 rounded-full bg-primary/5 border-2 border-dashed border-primary/20 flex items-center justify-center relative mb-5 shadow-inner">
                    <BellOff size={42} className="text-primary/40" />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute -top-1 -right-1 w-7 h-7 bg-[#00C48C]/20 border border-[#00C48C]/40 rounded-full flex items-center justify-center text-[#00C48C]"
                    >
                      <Sparkles size={14} />
                    </motion.div>
                  </div>

                  <h4 className="text-lg font-extrabold text-text-primary mb-1">You're All Caught Up!</h4>
                  <p className="text-xs text-text-secondary max-w-xs leading-relaxed mb-6">
                    {activeFilter === 'all' 
                      ? "No active notifications or alerts. We'll automatically log updates like Low Balance Warnings or Allowance Received here."
                      : `No ${activeFilter} notifications found in your log.`}
                  </p>

                  {onAddTestAlert && (
                    <button
                      onClick={onAddTestAlert}
                      className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition cursor-pointer"
                    >
                      <Sparkles size={14} /> Simulate Sample Alert
                    </button>
                  )}
                </motion.div>
              ) : (
                <div className="space-y-3">
                  {filteredNotifications.map((item) => {
                    const isAlert = item.type === 'alert';
                    const isAllowance = item.type === 'allowance';
                    const isTx = item.type === 'transaction';

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        onClick={() => handleNotificationClick(item)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${
                          !item.read
                            ? 'bg-surface border-primary/30 shadow-xs'
                            : 'bg-surface/60 border-border opacity-85 hover:opacity-100'
                        }`}
                      >
                        {/* Unread Pill Dot */}
                        {!item.read && (
                          <span className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                        )}

                        <div className="flex items-start gap-3.5 pr-4">
                          {/* Icon Badge */}
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                            isAlert ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                            isAllowance ? 'bg-[#00C48C]/15 text-[#00C48C] border-[#00C48C]/30' :
                            isTx ? 'bg-primary/10 text-primary border-primary/20' :
                            'bg-blue-500/10 text-blue-500 border-blue-500/20'
                          }`}>
                            {isAlert ? <ShieldAlert size={20} /> :
                             isAllowance ? <Wallet size={20} /> :
                             isTx ? <ArrowDownLeft size={20} /> : <Info size={20} />}
                          </div>

                          {/* Text Body */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="text-xs font-bold text-text-primary tracking-tight truncate">
                                {item.title}
                              </h5>
                              {item.amount !== undefined && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                  isAllowance ? 'bg-[#00C48C]/15 text-[#00C48C]' : 'bg-primary/10 text-primary'
                                }`}>
                                  {formatCurrency(item.amount)}
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-text-secondary leading-snug mb-2">
                              {item.message}
                            </p>

                            <div className="flex items-center justify-between text-[10px] text-text-secondary">
                              <span className="font-mono text-gray-400">{item.timestamp}</span>

                              {item.linkScreen && (
                                <span className="font-bold text-primary flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                                  {item.linkScreen === 'TOP_UP' ? 'Top Up Now' : 'View Details'} <ChevronRight size={12} />
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Individual Delete Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(item.id);
                          }}
                          className="absolute bottom-3.5 right-3 opacity-0 group-hover:opacity-100 p-1 text-text-secondary hover:text-rose-500 transition-all"
                          title="Delete notification"
                        >
                          <X size={14} />
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
