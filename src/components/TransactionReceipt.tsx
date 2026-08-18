import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Share2 } from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency } from '../data';

interface TransactionReceiptProps {
  tx: Transaction | null;
  onClose: () => void;
}

export function TransactionReceipt({ tx, onClose }: TransactionReceiptProps) {
  return (
    <AnimatePresence>
      {tx && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-surface w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-bg px-6 py-4 flex justify-between items-center border-b border-border">
              <h3 className="text-sm font-bold text-text-primary">E-Receipt</h3>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-surface hover:bg-border rounded-full text-text-secondary transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-8 flex flex-col items-center border-b border-border border-dashed relative">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${tx.type === 'credit' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                <span className="text-2xl font-bold">{tx.type === 'credit' ? '+' : '-'}</span>
              </div>
              <h2 className="text-3xl font-bold text-text-primary mb-1">
                {formatCurrency(tx.amount)}
              </h2>
              <p className="text-sm text-text-secondary font-medium">
                {tx.type === 'credit' ? 'Payment Received' : 'Payment Sent'}
              </p>
              
              <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-black/60 rounded-full" />
              <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-black/60 rounded-full" />
            </div>

            {/* Details */}
            <div className="px-6 py-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-text-secondary font-medium">Merchant / Sender</span>
                <span className="text-sm font-bold text-text-primary text-right max-w-[150px] truncate">{tx.merchant}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-text-secondary font-medium">Category</span>
                <span className="text-sm font-bold text-text-primary">{tx.category}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-text-secondary font-medium">Date & Time</span>
                <span className="text-sm font-bold text-text-primary">{tx.date}, {tx.time}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-text-secondary font-medium">Transaction ID</span>
                <span className="text-xs font-mono font-bold text-text-primary truncate max-w-[150px]">{tx.id || `TXN-${Math.floor(Math.random() * 1000000)}`}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-text-secondary font-medium">Status</span>
                <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">Successful</span>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-6 bg-bg flex gap-3">
              <button className="flex-1 bg-surface border border-border text-text-primary text-xs font-bold py-3 rounded-xl hover:bg-border transition-colors flex justify-center items-center gap-2 cursor-pointer">
                <Share2 size={16} /> Share
              </button>
              <button className="flex-1 bg-primary text-white text-xs font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors flex justify-center items-center gap-2 cursor-pointer">
                <Download size={16} /> Save
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
