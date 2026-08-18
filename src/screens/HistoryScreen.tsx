import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Download, Filter, Coffee, Printer, Bus, GraduationCap, BookOpen, Calendar, ArrowDownCircle, ArrowUpCircle, ArrowLeft } from 'lucide-react';
import { ScreenId, UserContextType, Transaction } from '../types';
import { formatCurrency } from '../data';
import { TransactionReceipt } from '../components/TransactionReceipt';

interface HistoryScreenProps {
  ctx: UserContextType;
  setCurrentScreen?: (screen: ScreenId) => void;
}

const CAT_COLORS: Record<string, string> = {
  Cafeteria: 'text-orange-500 bg-orange-100',
  Printing: 'text-purple-500 bg-purple-100',
  Transport: 'text-blue-500 bg-blue-100',
  Fees: 'text-red-500 bg-red-100',
  Bookstore: 'text-teal-500 bg-teal-100',
  Events: 'text-amber-500 bg-amber-100',
  'Top-up': 'text-accent bg-[#00C48C20]',
  Transfer: 'text-primary bg-primary/10'
};

const CAT_ICONS: Record<string, React.ReactNode> = {
  Cafeteria: <Coffee size={18} />,
  Printing: <Printer size={18} />,
  Transport: <Bus size={18} />,
  Fees: <GraduationCap size={18} />,
  Bookstore: <BookOpen size={18} />,
  Events: <Calendar size={18} />,
  'Top-up': <ArrowDownCircle size={18} />,
  Transfer: <ArrowUpCircle size={18} />
};

export function HistoryScreen({ ctx, setCurrentScreen }: HistoryScreenProps) {
  const [filter, setFilter] = useState<'ALL' | 'CREDITS' | 'DEBITS'>('ALL');
  const [search, setSearch] = useState('');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const handleDownload = () => {
    const csvRows = [
      ['Date', 'Time', 'Merchant', 'Category', 'Amount', 'Type', 'Status', 'Transaction ID'],
      ...filteredTx.map(tx => [
        `"${tx.date}"`,
        `"${tx.time}"`,
        `"${tx.merchant.replace(/"/g, '""')}"`,
        `"${tx.category}"`,
        tx.amount.toString(),
        tx.type,
        'Successful',
        tx.id || ''
      ])
    ];
    const csvString = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `unipay_statement_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    ctx.showToast({
      type: 'success',
      title: 'Download Started',
      message: 'Your transaction history statement is downloading.'
    });
  };

  const filteredTx = ctx.transactions.filter(tx => {
    // Parent Data Flow Enforcement: Block transactions if ward disables sharing
    if (ctx.role === 'PARENT') {
      const activeWard = ctx.wards.find(w => w.id === ctx.activeWardId);
      if (!activeWard || !activeWard.dataSharingEnabled) {
        return false;
      }
    }
    
    if (filter === 'CREDITS' && tx.type !== 'credit') return false;
    if (filter === 'DEBITS' && tx.type !== 'debit') return false;
    if (search && !tx.merchant.toLowerCase().includes(search.toLowerCase()) && !tx.category.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Group by date
  const groupedTx = filteredTx.reduce((acc, tx) => {
    if (!acc[tx.date]) acc[tx.date] = [];
    acc[tx.date].push(tx);
    return acc;
  }, {} as Record<string, Transaction[]>);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col w-full bg-bg pb-24"
    >
      <div className="bg-surface px-6 pt-8 sm:pt-10 pb-4 shadow-xs z-10 relative">
        <div className="flex justify-between items-center mb-6">
          {setCurrentScreen && (
            <button 
              onClick={() => setCurrentScreen('HOME')} 
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-bg text-text-primary hover:bg-border transition-colors cursor-pointer mr-2"
              aria-label="Back to Home"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <h2 className="text-xl font-bold text-text-primary flex-1">Transactions</h2>
          <button 
            onClick={handleDownload}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-bg text-text-primary hover:bg-border transition-colors cursor-pointer"
          >
            <Download size={20} />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <div className="flex-1 bg-bg rounded-xl flex items-center px-4 py-3 border border-border focus-within:border-primary transition-colors">
            <Search size={18} className="text-text-secondary mr-2" />
            <input 
              type="text" 
              placeholder="Search merchants, categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm w-full outline-none text-text-primary"
            />
          </div>
          <button className="w-12 h-12 rounded-xl border border-border bg-surface flex items-center justify-center text-text-primary hover:bg-bg">
             <Filter size={18} />
          </button>
        </div>

        <div className="flex gap-2">
          {['ALL', 'CREDITS', 'DEBITS'].map(pill => (
            <button 
              key={pill}
              onClick={() => setFilter(pill as any)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${filter === pill ? 'bg-primary text-white shadow-xs' : 'bg-surface border border-border text-text-secondary hover:bg-bg'}`}
            >
              {pill.charAt(0) + pill.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {Object.entries(groupedTx).map(([date, txs]) => (
            <motion.div 
              key={date}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="mb-6"
            >
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">{date}</h3>
              <div className="space-y-4">
                {txs.map((tx, idx) => (
                  <div 
                    key={tx.id} 
                    onClick={() => setSelectedTx(tx)}
                    className="flex items-center justify-between cursor-pointer hover:bg-surface/50 p-2 -mx-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${CAT_COLORS[tx.category] || 'bg-gray-100 text-gray-500'}`}>
                        {CAT_ICONS[tx.category]}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-text-primary">{tx.merchant}</h4>
                        <p className="text-xs text-text-secondary mt-0.5">{tx.time} • {tx.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${tx.type === 'credit' ? 'text-accent' : 'text-danger'}`}>
                        {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </div>
                      {tx.type === 'credit' && <p className="text-[10px] text-accent mt-0.5 font-bold tracking-wider uppercase opacity-80">Received</p>}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
          {filteredTx.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-text-secondary"
            >
              <Coffee size={40} className="mb-4 opacity-20" />
              {ctx.role === 'PARENT' && (!ctx.wards.find(w => w.id === ctx.activeWardId)?.dataSharingEnabled) ? (
                <div className="text-center">
                  <p className="font-bold text-text-primary mb-1">Privacy Restricted</p>
                  <p className="text-xs">Your ward has not enabled data sharing.</p>
                </div>
              ) : (
                <p>No transactions found</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {selectedTx && (
        <TransactionReceipt 
          tx={selectedTx} 
          onClose={() => setSelectedTx(null)} 
        />
      )}
    </motion.div>
  );
}
