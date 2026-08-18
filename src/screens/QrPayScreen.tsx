import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, QrCode as QrCodeIcon, RefreshCw, Copy, Check, ShieldCheck, Sparkles, Coffee, BookOpen, Printer, Bus, ArrowRight, CheckCircle2, AlertTriangle, X, Lock, User, Camera, CameraOff, Upload, Image as ImageIcon } from 'lucide-react';
import { ScreenId, UserContextType, Transaction } from '../types';
import { formatCurrency } from '../data';
import { TransactionReceipt } from '../components/TransactionReceipt';
import { Avatar } from '../components/Avatar';
import { Html5Qrcode } from 'html5-qrcode';

interface QrPayScreenProps {
  ctx?: UserContextType;
  setCurrentScreen: (screen: ScreenId) => void;
}

const PRESET_MERCHANTS = [
  { id: 'm1', name: 'Campus Cafeteria - Main Hall', category: 'Cafeteria' as const, amount: 1200, icon: Coffee, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { id: 'm2', name: 'Uni Bookstore - Textbooks', category: 'Bookstore' as const, amount: 3500, icon: BookOpen, color: 'bg-teal-500/20 text-teal-400 border-teal-500/30' },
  { id: 'm3', name: 'Library Printing Hub', category: 'Printing' as const, amount: 450, icon: Printer, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { id: 'm4', name: 'Campus Shuttle Express', category: 'Transport' as const, amount: 250, icon: Bus, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
];

export function QrPayScreen({ ctx, setCurrentScreen }: QrPayScreenProps) {
  const [mode, setMode] = useState<'SHOW' | 'SCAN'>('SHOW');

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [mode]);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes (120 seconds)
  const [qrToken, setQrToken] = useState<string>(() => Math.random().toString(36).substring(2, 8).toUpperCase());
  const [customAmount, setCustomAmount] = useState<string>('');
  const [showAmountInput, setShowAmountInput] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [selectedMerchant, setSelectedMerchant] = useState<typeof PRESET_MERCHANTS[0] | null>(null);
  const [customMerchantName, setCustomMerchantName] = useState('');
  const [customMerchantAmt, setCustomMerchantAmt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedTx, setCompletedTx] = useState<Transaction | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Payment PIN verification modal state
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [paymentPinInput, setPaymentPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [pendingPayment, setPendingPayment] = useState<{ merchantName: string; category: any; amount: number } | null>(null);

  // Camera QR Code Scanner states and refs
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const stopRealScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
      } catch (err) {
        console.warn("Camera stream cleanup:", err);
      } finally {
        scannerRef.current = null;
        setCameraActive(false);
      }
    }
  };

  const handleScanResult = (decodedText: string) => {
    if (!ctx) return;
    
    ctx.showToast({
      type: 'success',
      title: 'QR Code Scanned',
      message: 'Processing payment request details...'
    });

    try {
      if (decodedText.startsWith('unipay://pay/merchant/')) {
        // Format: unipay://pay/merchant/m1?amount=1200&name=Campus%20Cafeteria
        const parts = decodedText.replace('unipay://pay/merchant/', '').split('?');
        const merchantId = parts[0];
        const params = new URLSearchParams(parts[1] || '');
        const amount = Number(params.get('amount') || 0);
        const name = params.get('name') ? decodeURIComponent(params.get('name')!) : 'Campus Merchant';
        
        const matchedPreset = PRESET_MERCHANTS.find(m => m.id === merchantId);
        
        setSelectedMerchant({
          id: merchantId,
          name: name,
          category: (matchedPreset?.category || 'Services') as any,
          amount: amount || 1000,
          icon: matchedPreset?.icon || QrCodeIcon,
          color: matchedPreset?.color || 'bg-teal-500/20 text-teal-400 border-teal-500/30'
        });
      } else if (decodedText.startsWith('unipay://pay/student/')) {
        // Format: unipay://pay/student/STU-24-00192?amount=1500
        const parts = decodedText.replace('unipay://pay/student/', '').split('?');
        const studentId = parts[0];
        const params = new URLSearchParams(parts[1] || '');
        const amount = Number(params.get('amount') || 0);
        
        setSelectedMerchant({
          id: `student-${studentId}`,
          name: `Peer Transfer to STU-${studentId}`,
          category: 'Transfer' as any,
          amount: amount || 500,
          icon: User,
          color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
        });
      } else {
        // Parse any general text
        setSelectedMerchant({
          id: 'scanned-text',
          name: decodedText.length > 40 ? decodedText.slice(0, 37) + '...' : decodedText,
          category: 'Services' as any,
          amount: 500,
          icon: QrCodeIcon,
          color: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
        });
      }
    } catch (err) {
      console.error("Error parsing scanned payload:", err);
      ctx.showToast({
        type: 'error',
        title: 'Parse Failed',
        message: 'Unsupported QR payload scanned.'
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      let html5QrCode = scannerRef.current;
      if (!html5QrCode) {
        html5QrCode = new Html5Qrcode("unipay-qr-reader");
        scannerRef.current = html5QrCode;
      }
      
      if (html5QrCode.isScanning) {
        await html5QrCode.stop();
        setCameraActive(false);
      }

      const decodedText = await html5QrCode.scanFile(file, true);
      handleScanResult(decodedText);
    } catch (err: any) {
      ctx?.showToast({
        type: 'error',
        title: 'No QR Code Detected',
        message: 'Could not read a QR code from this image. Please ensure the code is clear and in focus.'
      });
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const startRealScanner = async () => {
    setScannerError(null);
    setCameraActive(false);

    // Stop existing scanning instances first
    await stopRealScanner();

    // Give DOM element a moment to mount
    setTimeout(async () => {
      const container = document.getElementById("unipay-qr-reader");
      if (!container) {
        return;
      }

      try {
        const html5QrCode = new Html5Qrcode("unipay-qr-reader");
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: (width, height) => {
              const size = Math.min(width, height) * 0.75;
              return { width: size, height: size };
            }
          },
          (decodedText) => {
            handleScanResult(decodedText);
            stopRealScanner();
          },
          () => {
            // Ignored frame failures
          }
        );
        setCameraActive(true);
      } catch (err: any) {
        const errMsg = (err?.message || String(err)).toLowerCase();
        if (errMsg.includes('notallowederror') || errMsg.includes('permission') || errMsg.includes('dismissed') || errMsg.includes('denied')) {
          setScannerError('Camera permission was dismissed or blocked. You can grant access in browser settings, upload a QR photo, or select a campus preset.');
        } else if (errMsg.includes('notfounderror') || errMsg.includes('devices not found')) {
          setScannerError('No camera found on this device. You can upload a QR image or select a campus preset below.');
        } else {
          setScannerError('Camera stream is unavailable in this view. You can upload a QR image or select a campus preset below.');
        }
        setCameraActive(false);
      }
    }, 150);
  };

  useEffect(() => {
    if (mode === 'SHOW') {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Auto-regenerate QR token after 2 minutes
            setQrToken(Math.random().toString(36).substring(2, 8).toUpperCase());
            return 120;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [mode]);

  useEffect(() => {
    if (mode === 'SCAN') {
      startRealScanner();
    } else {
      stopRealScanner();
    }
    
    return () => {
      stopRealScanner();
    };
  }, [mode]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handleCopyCode = () => {
    const studentId = ctx?.user?.studentId || ctx?.user?.id || '24-00192';
    const amountStr = customAmount ? `?amount=${customAmount}` : '';
    const payload = `unipay://pay/student/${studentId}${amountStr}&t=${qrToken}`;
    
    navigator.clipboard?.writeText(payload);
    setCopied(true);
    ctx?.showToast({
      type: 'info',
      title: 'QR Code Copied',
      message: 'Payment payload copied to clipboard.'
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefreshQr = () => {
    setQrToken(Math.random().toString(36).substring(2, 8).toUpperCase());
    setTimeLeft(120);
    ctx?.showToast({
      type: 'info',
      title: 'QR Code Regenerated',
      message: 'A fresh, dynamic payment QR code has been generated.'
    });
  };

  const handleInitiatePayment = async (merchantName: string, category: any, amount: number) => {
    if (!ctx) return;
    setErrorMsg('');

    if (amount <= 0) {
      setErrorMsg('Please enter a valid amount greater than ₦0.');
      return;
    }

    if (ctx.balance < amount) {
      setErrorMsg(`Insufficient funds! Your balance is ${formatCurrency(ctx.balance)}.`);
      return;
    }

    // Spending limits check
    const cap = ctx.spendingLimits?.categoryCaps?.[category as keyof typeof ctx.spendingLimits.categoryCaps];
    if (cap) {
      const todaySpentCategory = ctx.transactions
        .filter(t => t.type === 'debit' && t.date === 'Today' && t.category === category)
        .reduce((a, b) => a + b.amount, 0);

      if (todaySpentCategory + amount > cap) {
        setErrorMsg(`Transaction declined: Exceeds daily cap of ${formatCurrency(cap)} for ${category}.`);
        return;
      }
    }

    try {
      await ctx.requestPayment({
        amount: amount,
        title: merchantName,
        subtitle: category === 'Transfer' ? 'Peer-to-Peer Transfer' : 'Campus Merchant Payment'
      });

      setIsProcessing(true);
      setTimeout(() => {
        const newTx: Transaction = {
          id: 'tx-' + Math.random().toString().slice(2, 8),
          category: category,
          merchant: merchantName,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          amount: amount,
          type: 'debit',
          date: 'Today'
        };

        ctx.addTransaction(newTx);
        setIsProcessing(false);
        setCompletedTx(newTx);
        setSelectedMerchant(null);
        setPendingPayment(null);
      }, 1200);
    } catch (err) {
      console.log('Payment cancelled');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col w-full bg-[#0F0830] text-white relative z-50 pb-24"
    >
      {/* Top Navigation Header */}
      <div className="flex justify-between items-center p-6 border-b border-white/10 sticky top-0 bg-[#0F0830]/90 backdrop-blur-md z-30">
        <button 
          onClick={() => setCurrentScreen('HOME')} 
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition cursor-pointer"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-lg font-bold flex items-center gap-2">
          <QrCodeIcon size={20} className="text-[#00C48C]" /> UniPay QR Code
        </h2>
        <div className="w-10" />
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex bg-white/10 mx-6 mt-6 p-1 rounded-2xl border border-white/15">
        <button 
          onClick={() => { setMode('SHOW'); setCompletedTx(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            mode === 'SHOW' ? 'bg-[#00C48C] text-[#0F0830] shadow-md' : 'text-white/70 hover:text-white'
          }`}
        >
          My QR Code
        </button>
        <button 
          onClick={() => { setMode('SCAN'); setCompletedTx(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            mode === 'SCAN' ? 'bg-[#00C48C] text-[#0F0830] shadow-md' : 'text-white/70 hover:text-white'
          }`}
        >
          Scan Merchant QR
        </button>
      </div>

      {/* Main View Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {mode === 'SHOW' ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center w-full max-w-sm"
          >
            {/* Dynamic QR Card Frame */}
            <div className="bg-white text-gray-900 p-7 rounded-3xl relative mb-4 shadow-xl border border-gray-100 flex flex-col items-center w-full">
              {/* User Avatar Badge Header */}
              <div className="flex items-center gap-3 w-full mb-4 pb-3 border-b border-gray-100">
                <Avatar 
                  src={ctx?.user?.avatar} 
                  name={ctx?.user?.name || 'UniPay User'} 
                  role={ctx?.user?.role || 'STUDENT'} 
                  size="md" 
                  className="border-2 border-[#27187D] shrink-0" 
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-extrabold text-[#27187D] leading-tight truncate">{ctx?.user?.name || 'UniPay User'}</h3>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-xs text-gray-500 font-mono font-bold">ID: {ctx?.user?.studentId || ctx?.user?.id || '24-00192'}</p>
                    {ctx?.user?.department && (
                      <span className="text-[10px] text-gray-500 truncate">• {ctx.user.department}</span>
                    )}
                  </div>
                  {(ctx?.user?.institution || ctx?.user?.school) && (
                    <p className="text-[10px] text-gray-400 truncate">{ctx?.user?.institution || ctx?.user?.school}</p>
                  )}
                </div>
                <div className="ml-auto bg-[#27187D]/10 text-[#27187D] px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0">
                  {ctx?.user?.role || 'STUDENT'}
                </div>
              </div>

              {/* Styled QR Code Box */}
              <div className="w-[210px] h-[210px] bg-white border border-gray-200 p-2.5 rounded-2xl flex items-center justify-center relative overflow-hidden shadow-xs">
                 <img 
                   src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                     `unipay://pay/student/${ctx?.user?.studentId || ctx?.user?.id || '24-00192'}${customAmount ? `?amount=${customAmount}` : ''}&t=${qrToken}`
                   )}`}
                   alt="Dynamic Payment QR Code" 
                   className="w-[170px] h-[170px] object-contain relative z-10"
                   referrerPolicy="no-referrer"
                 />
                 
                 {/* Center Brand Badge Overlay */}
                 <div className="absolute inset-0 m-auto w-10 h-10 rounded-xl bg-[#27187D] border-2 border-white flex items-center justify-center text-white font-black text-[10px] shadow-md z-20">
                   Uni
                 </div>
              </div>

              {/* Amount Label if set */}
              {customAmount ? (
                <div className="mt-4 bg-[#27187D]/10 text-[#27187D] px-4 py-2 rounded-xl font-bold text-sm">
                  Requested Amount: <span className="font-extrabold">{formatCurrency(Number(customAmount))}</span>
                </div>
              ) : (
                <p className="text-xs text-gray-500 mt-3 font-medium text-center">Scan with merchant scanner or peer app to pay</p>
              )}
            </div>

            {/* Actions & Controls Bar */}
            <div className="w-full space-y-3">
              {/* Prominent Regenerate QR Code Button */}
              <button 
                onClick={handleRefreshQr}
                className="w-full bg-[#00C48C] hover:bg-[#00C48C]/90 text-[#0F0830] py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition shadow-md cursor-pointer active:scale-[0.99]"
              >
                <RefreshCw size={18} />
                <span>Regenerate QR Code</span>
                <span className="ml-1.5 text-xs font-mono font-bold bg-[#0F0830]/15 px-2 py-0.5 rounded-md">
                  {minutes}:{seconds.toString().padStart(2, '0')}
                </span>
              </button>

              {/* Secondary Controls (Copy Payload & Custom Amount) */}
              <div className="grid grid-cols-2 gap-2.5">
                <button 
                  onClick={handleCopyCode}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white py-3 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  {copied ? <Check size={16} className="text-[#00C48C]" /> : <Copy size={16} />}
                  {copied ? 'Copied!' : 'Copy Code Link'}
                </button>

                <button 
                  onClick={() => setShowAmountInput(!showAmountInput)} 
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white py-3 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  {showAmountInput ? 'Hide Amount' : 'Set Amount'}
                </button>
              </div>

              {/* Set Custom Amount Form */}
              <AnimatePresence>
                {showAmountInput && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white/10 p-3.5 rounded-2xl border border-white/15 overflow-hidden"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-sky-200">₦</span>
                      <input 
                        type="number"
                        placeholder="e.g. 1500"
                        value={customAmount === '0' ? '' : customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-[#00C48C]"
                      />
                      {customAmount && (
                        <button 
                          onClick={() => setCustomAmount('')} 
                          className="text-xs text-rose-300 px-2.5 py-1.5 bg-white/10 rounded-lg hover:bg-white/20"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center w-full max-w-sm"
          >
            {/* Viewfinder Camera Box */}
            <div className="w-full aspect-square border-2 border-dashed border-sky-400/30 rounded-3xl relative mb-4 overflow-hidden bg-black/60 shadow-2xl flex items-center justify-center">
               {/* Real DOM target for camera mounting */}
               <div id="unipay-qr-reader" className="absolute inset-0 w-full h-full overflow-hidden [&_video]:w-full [&_video]:h-full [&_video]:object-cover" />

               {/* Stylized Scanner Frame Borders */}
               <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-4">
                 <div className="flex justify-between items-start">
                   <div className="w-8 h-8 border-t-4 border-l-4 border-[#00C48C] rounded-tl-xl" />
                   {cameraActive && (
                     <div className="bg-black/60 backdrop-blur-xs text-[#00C48C] border border-[#00C48C]/30 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 pointer-events-auto">
                       <span className="w-2 h-2 rounded-full bg-[#00C48C] animate-ping" />
                       Live Feed
                     </div>
                   )}
                   <div className="w-8 h-8 border-t-4 border-r-4 border-[#00C48C] rounded-tr-xl" />
                 </div>
                 
                 {scannerError && (
                   <div className="mx-auto max-w-[90%] bg-amber-500/90 text-slate-900 text-[11px] font-bold px-3 py-2 rounded-xl pointer-events-auto shadow-lg leading-snug text-center">
                     {scannerError}
                   </div>
                 )}
                 
                 <div className="flex justify-between">
                   <div className="w-8 h-8 border-b-4 border-l-4 border-[#00C48C] rounded-bl-xl" />
                   <div className="w-8 h-8 border-b-4 border-r-4 border-[#00C48C] rounded-br-xl" />
                 </div>
               </div>
               
               {/* Laser Sweep Shimmer line */}
               {cameraActive && (
                 <motion.div 
                     animate={{ y: [-120, 120, -120] }}
                     transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                     className="absolute left-0 right-0 h-1 bg-[#00C48C] shadow-[0_0_20px_#00C48C] pointer-events-none z-10"
                 />
               )}

               {!cameraActive && (
                 <div className="text-center p-5 bg-black/70 backdrop-blur-md rounded-2xl border border-white/10 z-10 max-w-[88%] relative">
                    <QrCodeIcon size={36} className="text-[#00C48C] mx-auto mb-2 opacity-90" />
                    <p className="text-xs text-sky-200 font-semibold mb-3">Scan via Camera or Upload an Image</p>
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={startRealScanner}
                        className="bg-[#00C48C] hover:bg-[#00C48C]/90 text-[#0F0830] font-black text-xs px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Camera size={14} />
                        Use Camera
                      </button>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white/15 hover:bg-white/25 text-white font-bold text-xs px-3 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Upload size={14} />
                        Upload QR
                      </button>
                    </div>
                 </div>
               )}
            </div>

            {/* Hidden file input for QR image upload */}
            <input 
              ref={fileInputRef} 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileUpload} 
            />

            {/* Scanner Controls Bar */}
            <div className="w-full flex items-center justify-center gap-3 mb-6">
              {cameraActive ? (
                <button
                  onClick={stopRealScanner}
                  className="bg-white/10 hover:bg-white/20 text-white/90 text-xs font-bold px-4 py-2 rounded-xl border border-white/15 flex items-center gap-2 transition cursor-pointer"
                >
                  <CameraOff size={14} className="text-rose-400" />
                  Turn Off Camera
                </button>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white/10 hover:bg-white/20 text-white/90 text-xs font-bold px-4 py-2 rounded-xl border border-white/15 flex items-center gap-2 transition cursor-pointer"
                >
                  <ImageIcon size={14} className="text-sky-300" />
                  Select QR from Gallery
                </button>
              )}
            </div>

            {/* Preset Campus Merchants Quick Scanner Simulation */}
            <div className="w-full space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-200 tracking-wider uppercase">Simulate Campus QR Scan</span>
                <span className="text-[10px] text-sky-300 bg-white/10 px-2 py-0.5 rounded-full">Tap to Pay</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRESET_MERCHANTS.map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMerchant(m)}
                      className="w-full bg-white/10 hover:bg-white/20 border border-white/15 p-3.5 rounded-2xl flex items-center justify-between text-left transition cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${m.color}`}>
                          <Icon size={18} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white group-hover:text-[#00C48C] transition-colors">{m.name}</h4>
                          <span className="text-[10px] text-sky-200/70 font-medium">{m.category}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-[#00C48C]">{formatCurrency(m.amount)}</span>
                        <ArrowRight size={14} className="text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Merchant Payment Checkout Modal Drawer */}
      <AnimatePresence>
        {selectedMerchant && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center p-0 md:p-4">
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="bg-[#1A1054] text-white w-full max-w-md rounded-t-3xl md:rounded-3xl p-6 border border-white/20 shadow-2xl relative"
            >
              <button 
                onClick={() => setSelectedMerchant(null)} 
                className="absolute top-4 right-4 text-white/60 hover:text-white p-2 rounded-full"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-2 mb-4 text-xs font-bold text-[#00C48C]">
                <Sparkles size={16} /> QR Scan Detected
              </div>

              <div className="bg-white/10 rounded-2xl p-4 border border-white/15 mb-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#00C48C]/20 border border-[#00C48C]/30 flex items-center justify-center text-[#00C48C]">
                  {selectedMerchant.icon ? <selectedMerchant.icon size={22} /> : <QrCodeIcon size={22} />}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-white">{selectedMerchant.name}</h3>
                  <p className="text-xs text-sky-200/70">{selectedMerchant.category} • UniPay POS Merchant</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-[#00C48C]">{formatCurrency(selectedMerchant.amount)}</div>
                </div>
              </div>

              {/* Wallet Balance Check Preview */}
              <div className="bg-white/5 rounded-xl p-3.5 border border-white/10 mb-6 space-y-2">
                <div className="flex justify-between text-xs text-sky-200/80">
                  <span>Current Balance:</span>
                  <span className="font-bold text-white">{formatCurrency(ctx?.balance || 0)}</span>
                </div>
                <div className="flex justify-between text-xs text-sky-200/80">
                  <span>Balance After Payment:</span>
                  <span className={`font-bold ${(ctx?.balance || 0) < selectedMerchant.amount ? 'text-rose-400' : 'text-[#00C48C]'}`}>
                    {formatCurrency((ctx?.balance || 0) - selectedMerchant.amount)}
                  </span>
                </div>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle size={16} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex gap-3">
                <button 
                  onClick={() => setSelectedMerchant(null)}
                  className="flex-1 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 font-bold text-xs border border-white/20 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  disabled={isProcessing}
                  onClick={() => handleInitiatePayment(selectedMerchant.name, selectedMerchant.category, selectedMerchant.amount)}
                  className="flex-1 py-3.5 rounded-xl bg-[#00C48C] hover:bg-[#00C48C]/90 text-[#0F0830] font-extrabold text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <div className="w-4 h-4 border-2 border-[#0F0830] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>Confirm & Pay {formatCurrency(selectedMerchant.amount)}</>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Completed Transaction Receipt Modal */}
      <TransactionReceipt 
        tx={completedTx} 
        onClose={() => { setCompletedTx(null); setCurrentScreen('HOME'); }} 
      />
    </motion.div>
  );
}
