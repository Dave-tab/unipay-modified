import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Fingerprint, User, Users, Store, ArrowRight, ShieldCheck, ChevronLeft, Lock, 
  Eye, EyeOff, AlertCircle 
} from 'lucide-react';
import { ScreenId, UserRole, UserProfile } from '../types';
import { Logo } from '../components/Logo';
import { signInWithGoogle, getUserDoc, createUserDoc, loginWithEmail, findUserByIdentifier } from '../lib/firebase';

interface LoginScreenProps {
  onLogin: (role: UserRole, user?: UserProfile) => void;
  setCurrentScreen: (screen: ScreenId) => void;
}

export function LoginScreen({ onLogin, setCurrentScreen }: LoginScreenProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>('STUDENT');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    setAuthError(null);
  }, [selectedRole]);

  const handleQuickDemoLogin = (role: UserRole) => {
    setAuthError(null);
    onLogin(role, undefined);
  };

  const handleEmailPasswordLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!identifier.trim() || !password) {
      setAuthError('Please enter your email/ID and password.');
      return;
    }

    try {
      setLoading(true);
      setAuthError(null);

      let targetEmail = identifier.trim();

      // If user provided a Student ID or username without '@', look up their registered email
      if (!targetEmail.includes('@')) {
        const foundUser = await findUserByIdentifier(targetEmail);
        if (foundUser && foundUser.email) {
          targetEmail = foundUser.email;
        } else {
          setAuthError('No account found with this Student ID. Please use your email address or create an account.');
          setLoading(false);
          return;
        }
      }

      const cred = await loginWithEmail(targetEmail, password);
      const authUser = cred.user;

      if (!authUser) {
        throw new Error('Authentication failed. No user returned.');
      }

      const userDoc = await getUserDoc(authUser.uid);
      if (userDoc) {
        onLogin((userDoc as UserProfile).role || selectedRole, userDoc as UserProfile);
      } else {
        const profile: UserProfile = {
          id: authUser.uid.slice(0, 8),
          uid: authUser.uid,
          name: authUser.displayName || identifier.split('@')[0],
          email: authUser.email || targetEmail,
          role: selectedRole,
          balance: 12500,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(authUser.email || 'UniPay')}`,
          hasLoginPassword: true,
          hasTransactionPin: false
        };
        await createUserDoc(authUser.uid, profile, password);
        onLogin(selectedRole, profile);
      }
    } catch (err: any) {
      console.error("Login error:", err);
      if (err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
        setAuthError('Incorrect password or credentials. Please check your password and try again.');
      } else if (err?.code === 'auth/user-not-found') {
        setAuthError('No account found with this email. Please check your email or click "Create Account".');
      } else if (err?.code === 'auth/invalid-email') {
        setAuthError('Please enter a valid email address.');
      } else if (err?.code === 'auth/too-many-requests') {
        setAuthError('Too many unsuccessful login attempts. Please wait a moment and try again.');
      } else if (err?.code === 'auth/network-request-failed' || err?.message?.includes('network')) {
        setAuthError('Network error connecting to authentication server. Please check your internet connection.');
      } else {
        setAuthError(err?.message || 'Login failed. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setAuthError(null);
      const user = await signInWithGoogle();
      
      // If user dismissed the popup or aborted
      if (!user) {
        setLoading(false);
        return;
      }

      let userDoc = await getUserDoc(user.uid);
      
      if (!userDoc) {
        // Create new user profile for Google user on first login
        const newUser: UserProfile = {
          id: selectedRole === 'STUDENT' ? `STU-${user.uid.slice(0, 6)}` : (selectedRole === 'PARENT' ? `PAR-${user.uid.slice(0, 6)}` : `MER-${user.uid.slice(0, 6)}`),
          uid: user.uid,
          name: user.displayName || 'UniPay User',
          email: user.email || '',
          avatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.displayName || 'UniPay')}`,
          balance: 12500,
          studentId: selectedRole === 'STUDENT' ? '24-00192' : undefined,
          department: selectedRole === 'STUDENT' ? 'Computer Science • 300L' : undefined,
          businessName: selectedRole === 'MERCHANT' ? (user.displayName + ' Store') : undefined,
          category: selectedRole === 'MERCHANT' ? 'Campus Merchant' : undefined,
          cardFrozen: false,
          role: selectedRole,
          hasLoginPassword: false,
          hasTransactionPin: false
        };
        await createUserDoc(user.uid, newUser);
        userDoc = newUser;
      }

      onLogin((userDoc as UserProfile).role || selectedRole, userDoc as UserProfile);
    } catch (error: any) {
      if (
        error?.code === 'auth/popup-closed-by-user' ||
        error?.message?.includes('popup-closed-by-user') ||
        error?.code === 'auth/cancelled-popup-request'
      ) {
        // User closed or dismissed popup intentionally
        return;
      }
      console.error("Google sign in error:", error);
      if (error?.code === 'auth/popup-blocked') {
        setAuthError('Sign-in popup was blocked by your browser. Please allow popups or use Email & Password.');
      } else if (error?.code === 'auth/network-request-failed') {
        setAuthError('Network error connecting to Google Auth. Please check your connection.');
      } else if (error?.code === 'auth/unauthorized-domain') {
        setAuthError('This domain is not authorized for Google OAuth. Please sign in with Email & Password.');
      } else {
        setAuthError(error?.message || 'Failed to sign in with Google. Please use Email/Password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="w-full flex-1 bg-bg flex flex-col justify-center items-center px-4 py-8 sm:py-12"
    >
      <div className="w-full max-w-md bg-surface rounded-3xl shadow-xl border border-border p-8 md:p-10 relative">
        {/* Back to Landing Button */}
        <button 
          onClick={() => setCurrentScreen('LANDING')}
          className="flex items-center gap-1 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors mb-4 cursor-pointer"
        >
          <ChevronLeft size={16} />
          <span>Back to Landing</span>
        </button>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Logo size="lg" />
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
            Sign In
          </span>
        </div>

        {authError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-semibold flex items-start gap-2.5">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span className="flex-1 leading-relaxed">{authError}</span>
          </div>
        )}

        {/* Role Selector Tabs */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">Select Account Role</label>
          </div>

          <div className="grid grid-cols-3 gap-2 bg-bg p-1.5 rounded-xl border border-border mb-3">
            <button
              onClick={() => setSelectedRole('STUDENT')}
              className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedRole === 'STUDENT' 
                  ? 'bg-surface text-primary border border-border shadow-xs' 
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <User size={16} className="mb-1 text-sky-500" />
              Student
            </button>
            <button
              onClick={() => setSelectedRole('PARENT')}
              className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedRole === 'PARENT' 
                  ? 'bg-surface text-primary border border-border shadow-xs' 
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Users size={16} className="mb-1 text-emerald-500" />
              Parent
            </button>
            <button
              onClick={() => setSelectedRole('MERCHANT')}
              className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedRole === 'MERCHANT' 
                  ? 'bg-surface text-primary border border-border shadow-xs' 
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Store size={16} className="mb-1 text-amber-500" />
              Merchant
            </button>
          </div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleEmailPasswordLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              {selectedRole === 'STUDENT' && 'Student Email or Student ID'}
              {selectedRole === 'PARENT' && 'Parent Email'}
              {selectedRole === 'MERCHANT' && 'Merchant Email'}
            </label>
            <input 
              type="text" 
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={selectedRole === 'STUDENT' ? 'name@uni.edu or STU-24-00192' : 'name@email.com'}
              className="w-full bg-surface border border-border rounded-xl px-4 py-3.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-text-secondary">Password (6 Digits / Password)</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-text-secondary hover:text-text-primary flex items-center gap-1 cursor-pointer"
              >
                {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                <span>{showPassword ? 'Hide' : 'Show'}</span>
              </button>
            </div>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your login password"
                className="w-full bg-surface border border-border rounded-xl px-4 py-3.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors pr-10"
              />
              <Lock size={16} className="absolute right-3.5 top-3.5 text-text-secondary pointer-events-none" />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white rounded-xl py-4 font-bold shadow-lg shadow-primary/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-70"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Sign In to Account</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Google Login Button */}
        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-surface text-text-primary border border-border rounded-xl py-3.5 font-bold mt-3 shadow-xs hover:bg-bg hover:border-primary/40 transition-all flex items-center justify-center gap-2 group cursor-pointer text-xs"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span className="font-extrabold capitalize text-primary">{selectedRole.toLowerCase()}:</span>
          <span className="font-bold">Sign In with Google</span>
        </button>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-[11px]">
            <span className="bg-surface px-2 text-text-secondary uppercase tracking-wider">Fast Demo / Testing</span>
          </div>
        </div>

        {/* Demo Fast Launcher & Create Account */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => handleQuickDemoLogin(selectedRole)}
            className="flex items-center justify-center gap-2 text-xs font-semibold text-text-primary border border-border rounded-xl py-3 hover:bg-bg transition-colors cursor-pointer"
            title="Launch demo mock profile without password"
          >
            <Fingerprint size={16} className="text-primary" />
            1-Click Demo
          </button>
          <button 
            onClick={() => setCurrentScreen('REGISTER')}
            className="flex items-center justify-center text-xs font-semibold text-primary border border-primary/30 rounded-xl py-3 hover:bg-primary/5 transition-colors cursor-pointer"
          >
            Create Account
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-text-secondary">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-500" /> 256-bit Secure SSL
          </span>
          <span>UniPay Campus</span>
        </div>
      </div>
    </motion.div>
  );
}
