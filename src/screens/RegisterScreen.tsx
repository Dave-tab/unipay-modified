import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  User, 
  Users, 
  Store, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  GraduationCap, 
  Building2,
  AlertCircle
} from 'lucide-react';
import { ScreenId, UserRole, UserProfile } from '../types';
import { registerWithEmail, createUserDoc, signInWithGoogle, getUserDoc } from '../lib/firebase';

interface RegisterScreenProps {
  onRegister: (role: UserRole, user?: UserProfile) => void;
  setCurrentScreen: (screen: ScreenId) => void;
}

const COMMON_DEPARTMENTS = [
  'Computer Science',
  'Software Engineering',
  'Economics',
  'Business Administration',
  'Accounting',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Mass Communication',
  'Law',
  'Medicine & Surgery',
  'Biochemistry',
  'Architecture'
];

const STUDENT_LEVELS = [
  '100 Level',
  '200 Level',
  '300 Level',
  '400 Level',
  '500 Level',
  'Postgraduate'
];

const COMMON_UNIVERSITIES = [
  'University of Lagos (UNILAG)',
  'Covenant University',
  'Obafemi Awolowo University (OAU)',
  'University of Ibadan (UI)',
  'Ahmadu Bello University (ABU)',
  'Federal University of Technology Akure (FUTA)',
  'University of Nigeria Nsukka (UNN)',
  'Babcock University',
  'Landmark University',
  'University of Ilorin (UNILORIN)',
  'Pan-Atlantic University',
  'Lagos State University (LASU)',
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SYMBOL_REGEX = /[!@#$%^&*(),.?":{}|<>_~+=\-\[\]\\/`~]/;

export function RegisterScreen({ onRegister, setCurrentScreen }: RegisterScreenProps) {
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    studentId: '',
    department: '',
    level: '100 Level',
    institution: 'University of Lagos (UNILAG)',
    wardId: '',
    businessName: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  // Real-time email validation
  const isEmailValid = useMemo(() => {
    if (!formData.email) return false;
    return EMAIL_REGEX.test(formData.email.trim());
  }, [formData.email]);

  // Real-time password criteria
  const isPassLengthValid = formData.password.length >= 8;
  const hasPassSymbol = SYMBOL_REGEX.test(formData.password);
  const hasPassNumber = /\d/.test(formData.password);
  const hasPassLetter = /[a-zA-Z]/.test(formData.password);
  const isPasswordValid = isPassLengthValid && hasPassSymbol;

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!formData.password) return { label: 'Empty', score: 0, color: 'bg-border', text: 'text-text-secondary' };
    let score = 0;
    if (formData.password.length >= 8) score += 1;
    if (formData.password.length >= 12) score += 1;
    if (hasPassSymbol) score += 1;
    if (hasPassNumber) score += 1;
    if (hasPassLetter) score += 1;

    if (score <= 2) return { label: 'Weak', score: 1, color: 'bg-red-500', text: 'text-red-500' };
    if (score <= 4) return { label: 'Moderate', score: 2, color: 'bg-amber-500', text: 'text-amber-500' };
    return { label: 'Strong', score: 3, color: 'bg-emerald-500', text: 'text-emerald-500' };
  }, [formData.password, hasPassSymbol, hasPassNumber, hasPassLetter]);

  // Form validity check
  const isFormValid = useMemo(() => {
    if (!formData.name.trim()) return false;
    if (!isEmailValid) return false;
    if (!isPasswordValid) return false;

    if (role === 'STUDENT') {
      if (!formData.studentId.trim()) return false;
      if (!formData.department.trim()) return false;
      if (!formData.level.trim()) return false;
    } else if (role === 'PARENT') {
      if (!formData.wardId.trim()) return false;
    } else if (role === 'MERCHANT') {
      if (!formData.businessName.trim()) return false;
    }

    return true;
  }, [formData, role, isEmailValid, isPasswordValid]);

  const handleRegister = async () => {
    setTouched({
      name: true,
      email: true,
      password: true,
      studentId: true,
      department: true,
      level: true,
      wardId: true,
      businessName: true
    });

    try {
      setError('');
      
      if (!formData.name.trim()) {
        throw new Error('Please enter your full name.');
      }
      if (!isEmailValid) {
        throw new Error('Please enter a valid university or personal email address.');
      }
      if (!isPassLengthValid) {
        throw new Error('Password must be at least 8 characters long.');
      }
      if (!hasPassSymbol) {
        throw new Error('Password must contain at least one special symbol (e.g. !@#$%^&*).');
      }

      if (role === 'STUDENT') {
        if (!formData.studentId.trim()) {
          throw new Error('Student ID Number is mandatory.');
        }
        if (!formData.department.trim()) {
          throw new Error('Academic Department is mandatory.');
        }
        if (!formData.level.trim()) {
          throw new Error('Academic Level is mandatory.');
        }
      }

      if (role === 'PARENT' && !formData.wardId.trim()) {
        throw new Error('Please provide your Ward\'s Student ID to link the account.');
      }

      if (role === 'MERCHANT' && !formData.businessName.trim()) {
        throw new Error('Business / Store Name is required for campus merchants.');
      }

      setLoading(true);

      // Create Firebase Auth user
      const userCredential = await registerWithEmail(formData.email.trim(), formData.password);
      const uid = userCredential.user.uid;

      // Full Department & Level display string
      const formattedDepartment = role === 'STUDENT' 
        ? `${formData.department.trim()} • ${formData.level.trim()}`
        : undefined;

      // Construct and save real user profile to Firestore and local registry
      const newProfile: UserProfile = {
        id: role === 'STUDENT' ? (formData.studentId.trim() || `STU-${uid.slice(0, 6)}`) : (role === 'PARENT' ? `PAR-${uid.slice(0, 6)}` : `MER-${uid.slice(0, 6)}`),
        uid: uid,
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: role,
        studentId: role === 'STUDENT' ? formData.studentId.trim() : undefined,
        department: formattedDepartment,
        level: role === 'STUDENT' ? formData.level : undefined,
        institution: formData.institution.trim() || 'University of Lagos (UNILAG)',
        school: formData.institution.trim() || 'University of Lagos (UNILAG)',
        wardId: role === 'PARENT' ? formData.wardId.trim() : undefined,
        wardName: role === 'PARENT' ? `Student (${formData.wardId.trim()})` : undefined,
        businessName: role === 'MERCHANT' ? formData.businessName.trim() : undefined,
        category: role === 'MERCHANT' ? 'Campus Merchant' : undefined,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(formData.name.trim())}`,
        balance: 12500,
        cardFrozen: false,
        hasLoginPassword: true,
        hasTransactionPin: false
      };

      await createUserDoc(uid, newProfile, formData.password);

      // Successfully registered with real saved details
      onRegister(role, newProfile);

    } catch (err: any) {
      console.error("Registration error:", err);
      if (err?.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please sign in instead.');
      } else if (err?.code === 'auth/invalid-email') {
        setError('Invalid email address format.');
      } else if (err?.code === 'auth/weak-password') {
        setError('Password is too weak. Please meet the minimum 8-character and symbol criteria.');
      } else if (err?.code === 'auth/network-request-failed' || err?.message?.includes('network')) {
        setError('Network error connecting to authentication server. Please check your internet connection.');
      } else {
        setError(err.message || 'An error occurred during registration.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);
      setError('');
      const user = await signInWithGoogle();
      if (!user) {
        setLoading(false);
        return;
      }
      
      let userDoc = await getUserDoc(user.uid);
      
      if (!userDoc) {
        const formattedDepartment = role === 'STUDENT'
          ? (formData.department.trim() ? `${formData.department.trim()} • ${formData.level}` : 'Computer Science • 100 Level')
          : undefined;

        const newProfile: UserProfile = {
          id: role === 'STUDENT' ? (formData.studentId.trim() || `STU-${user.uid.slice(0, 6)}`) : (role === 'PARENT' ? `PAR-${user.uid.slice(0, 6)}` : `MER-${user.uid.slice(0, 6)}`),
          uid: user.uid,
          role: role,
          name: user.displayName || 'UniPay User',
          email: user.email || '',
          avatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.displayName || 'UniPay')}`,
          balance: 12500,
          studentId: role === 'STUDENT' ? (formData.studentId.trim() || 'STU-' + Math.floor(10000 + Math.random() * 90000)) : undefined,
          department: formattedDepartment,
          level: role === 'STUDENT' ? formData.level : undefined,
          institution: formData.institution.trim() || 'University of Lagos (UNILAG)',
          school: formData.institution.trim() || 'University of Lagos (UNILAG)',
          wardId: role === 'PARENT' ? formData.wardId.trim() : undefined,
          wardName: role === 'PARENT' ? `Student (${formData.wardId.trim() || 'Ward'})` : undefined,
          businessName: role === 'MERCHANT' ? (formData.businessName.trim() || (user.displayName + ' Store')) : undefined,
          category: role === 'MERCHANT' ? 'Campus Merchant' : undefined,
          cardFrozen: false,
          hasLoginPassword: false,
          hasTransactionPin: false
        };
        await createUserDoc(user.uid, newProfile);
        userDoc = newProfile;
      }
      
      onRegister(userDoc.role as UserRole, userDoc as UserProfile);
    } catch (err: any) {
      if (
        err?.code === 'auth/popup-closed-by-user' || 
        err?.message?.includes('popup-closed-by-user') ||
        err?.code === 'auth/cancelled-popup-request'
      ) {
        return;
      }
      console.error("Google registration error:", err);
      if (err?.code === 'auth/popup-blocked') {
        setError('Sign-up popup was blocked by your browser. Please allow popups or register with Email.');
      } else if (err?.code === 'auth/unauthorized-domain') {
        setError('Domain not authorized in Firebase. Please create your account with Email & Password.');
      } else if (err?.code === 'auth/network-request-failed') {
        setError('Network error connecting to Google Auth. Please check your internet connection.');
      } else {
        setError(err?.message || 'Failed to sign up with Google. Please use Email & Password.');
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
      className="min-h-screen bg-bg flex flex-col justify-center items-center px-4 py-8 md:py-12"
    >
      <div className="w-full max-w-lg bg-surface rounded-2xl shadow-xl border border-border p-6 md:p-9">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button 
            onClick={() => setCurrentScreen('LANDING')} 
            className="w-10 h-10 rounded-xl bg-bg flex items-center justify-center text-text-primary hover:bg-border transition-colors cursor-pointer"
            title="Back to Landing Page"
            id="register-back-btn"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-text-primary">Create Account</h2>
            <p className="text-xs text-text-secondary">Join the UniPay Campus Financial Ecosystem</p>
          </div>
        </div>

        {/* Role Switcher */}
        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
            Select Account Role
          </label>
          <div className="grid grid-cols-3 gap-2 bg-bg p-1.5 rounded-xl border border-border">
            <button 
              id="role-student-btn"
              type="button"
              onClick={() => setRole('STUDENT')}
              className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                role === 'STUDENT' 
                  ? 'bg-surface text-primary border border-border shadow-sm' 
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <User size={16} className="mb-1 text-sky-500" /> Student
            </button>
            <button 
              id="role-parent-btn"
              type="button"
              onClick={() => setRole('PARENT')}
              className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                role === 'PARENT' 
                  ? 'bg-surface text-primary border border-border shadow-sm' 
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Users size={16} className="mb-1 text-emerald-500" /> Parent
            </button>
            <button 
              id="role-merchant-btn"
              type="button"
              onClick={() => setRole('MERCHANT')}
              className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                role === 'MERCHANT' 
                  ? 'bg-surface text-primary border border-border shadow-sm' 
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Store size={16} className="mb-1 text-amber-500" /> Merchant
            </button>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Full Name */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-text-secondary">
                Full Name <span className="text-red-500">*</span>
              </label>
            </div>
            <div className="relative">
              <input 
                id="register-name-input"
                type="text" 
                placeholder="e.g. David Ayantade" 
                value={formData.name}
                onBlur={() => handleBlur('name')}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full bg-surface border rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none transition-colors ${
                  touched.name && !formData.name.trim() 
                    ? 'border-red-400 focus:border-red-500' 
                    : 'border-border focus:border-primary'
                }`}
              />
            </div>
            {touched.name && !formData.name.trim() && (
              <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> Full name is required.
              </p>
            )}
          </div>

          {/* Email Address with Real-Time Validation */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-text-secondary">
                Email Address <span className="text-red-500">*</span>
              </label>
              {formData.email && (
                <span className={`text-[11px] font-medium flex items-center gap-1 ${
                  isEmailValid ? 'text-emerald-600' : 'text-amber-500'
                }`}>
                  {isEmailValid ? (
                    <>
                      <CheckCircle2 size={12} className="text-emerald-500" /> Valid format
                    </>
                  ) : (
                    <>
                      <AlertCircle size={12} className="text-amber-500" /> Incomplete email
                    </>
                  )}
                </span>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary">
                <Mail size={16} />
              </div>
              <input 
                id="register-email-input"
                type="email" 
                placeholder="name@university.edu" 
                value={formData.email}
                onBlur={() => handleBlur('email')}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`w-full bg-surface border rounded-xl pl-10 pr-10 py-3 text-sm text-text-primary focus:outline-none transition-colors ${
                  touched.email && !isEmailValid 
                    ? 'border-red-400 focus:border-red-500' 
                    : isEmailValid 
                      ? 'border-emerald-400/80 focus:border-emerald-500' 
                      : 'border-border focus:border-primary'
                }`}
              />
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                {formData.email && (
                  isEmailValid ? (
                    <CheckCircle2 size={16} className="text-emerald-500" />
                  ) : (
                    <XCircle size={16} className="text-amber-500" />
                  )
                )}
              </div>
            </div>
            {touched.email && !isEmailValid && (
              <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> Please enter a valid email address (e.g. student@school.edu).
              </p>
            )}
          </div>

          {/* Student Specific Fields: Student ID, Department, Level (Mandatory) */}
          <AnimatePresence mode="popLayout">
            {role === 'STUDENT' && (
              <motion.div 
                key="student-fields"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 pt-1"
              >
                {/* Student ID */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-text-secondary">
                      Student ID Number <span className="text-red-500">*</span>
                    </label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary">
                      <GraduationCap size={16} />
                    </div>
                    <input 
                      id="register-studentid-input"
                      type="text" 
                      placeholder="e.g. STU-24-00192" 
                      value={formData.studentId}
                      onBlur={() => handleBlur('studentId')}
                      onChange={(e) => handleChange('studentId', e.target.value)}
                      className={`w-full bg-surface border rounded-xl pl-10 pr-4 py-3 text-sm text-text-primary focus:outline-none transition-colors ${
                        touched.studentId && !formData.studentId.trim()
                          ? 'border-red-400 focus:border-red-500'
                          : 'border-border focus:border-primary'
                      }`}
                    />
                  </div>
                  {touched.studentId && !formData.studentId.trim() && (
                    <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> Student ID is mandatory.
                    </p>
                  )}
                </div>

                {/* Department & Level Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Department Field */}
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary">
                        <Building2 size={15} />
                      </div>
                      <input 
                        id="register-department-input"
                        type="text" 
                        list="department-suggestions"
                        placeholder="e.g. Computer Science" 
                        value={formData.department}
                        onBlur={() => handleBlur('department')}
                        onChange={(e) => handleChange('department', e.target.value)}
                        className={`w-full bg-surface border rounded-xl pl-10 pr-3 py-3 text-sm text-text-primary focus:outline-none transition-colors ${
                          touched.department && !formData.department.trim()
                            ? 'border-red-400 focus:border-red-500'
                            : 'border-border focus:border-primary'
                        }`}
                      />
                      <datalist id="department-suggestions">
                        {COMMON_DEPARTMENTS.map((dept) => (
                          <option key={dept} value={dept} />
                        ))}
                      </datalist>
                    </div>
                    {touched.department && !formData.department.trim() && (
                      <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1">
                        <AlertCircle size={12} /> Department is mandatory.
                      </p>
                    )}
                  </div>

                  {/* Academic Level Field */}
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1">
                      Academic Level <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select 
                        id="register-level-select"
                        value={formData.level}
                        onBlur={() => handleBlur('level')}
                        onChange={(e) => handleChange('level', e.target.value)}
                        className="w-full bg-surface border border-border rounded-xl px-3.5 py-3 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors cursor-pointer appearance-none"
                      >
                        {STUDENT_LEVELS.map((lvl) => (
                          <option key={lvl} value={lvl}>
                            {lvl}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-text-secondary text-xs">
                        ▼
                      </div>
                    </div>
                  </div>
                </div>

                {/* University / Higher Institution Field */}
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    University / Higher Institution
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary">
                      <GraduationCap size={15} />
                    </div>
                    <input 
                      id="register-institution-input"
                      type="text" 
                      list="institution-suggestions"
                      placeholder="e.g. University of Lagos (UNILAG)" 
                      value={formData.institution}
                      onChange={(e) => handleChange('institution', e.target.value)}
                      className="w-full bg-surface border border-border rounded-xl pl-10 pr-3 py-3 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
                    />
                    <datalist id="institution-suggestions">
                      {COMMON_UNIVERSITIES.map((uni) => (
                        <option key={uni} value={uni} />
                      ))}
                    </datalist>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Parent Specific Fields */}
            {role === 'PARENT' && (
              <motion.div 
                key="parent-fields"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-1"
              >
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Ward's Student ID Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary">
                    <GraduationCap size={16} />
                  </div>
                  <input 
                    id="register-wardid-input"
                    type="text" 
                    placeholder="e.g. STU-24-00192" 
                    value={formData.wardId}
                    onBlur={() => handleBlur('wardId')}
                    onChange={(e) => handleChange('wardId', e.target.value)}
                    className={`w-full bg-surface border rounded-xl pl-10 pr-4 py-3 text-sm text-text-primary focus:outline-none transition-colors ${
                      touched.wardId && !formData.wardId.trim()
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-border focus:border-primary'
                    }`}
                  />
                </div>
                {touched.wardId && !formData.wardId.trim() && (
                  <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> Ward Student ID is required to link guardian oversight.
                  </p>
                )}
              </motion.div>
            )}

            {/* Merchant Specific Fields */}
            {role === 'MERCHANT' && (
              <motion.div 
                key="merchant-fields"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-1"
              >
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Business / Store Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary">
                    <Building2 size={16} />
                  </div>
                  <input 
                    id="register-bizname-input"
                    type="text" 
                    placeholder="e.g. Campus Central Cafeteria" 
                    value={formData.businessName}
                    onBlur={() => handleBlur('businessName')}
                    onChange={(e) => handleChange('businessName', e.target.value)}
                    className={`w-full bg-surface border rounded-xl pl-10 pr-4 py-3 text-sm text-text-primary focus:outline-none transition-colors ${
                      touched.businessName && !formData.businessName.trim()
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-border focus:border-primary'
                    }`}
                  />
                </div>
                {touched.businessName && !formData.businessName.trim() && (
                  <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> Business name is required for campus merchants.
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Password with Real-Time Validation & Strength Meters */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-text-secondary">
                Account Password <span className="text-red-500">*</span>
              </label>
              {formData.password && (
                <span className={`text-[11px] font-bold ${passwordStrength.text}`}>
                  {passwordStrength.label} Strength
                </span>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary">
                <Lock size={16} />
              </div>
              <input 
                id="register-password-input"
                type={showPassword ? "text" : "password"} 
                placeholder="Min. 8 characters with symbols" 
                value={formData.password}
                onBlur={() => handleBlur('password')}
                onChange={(e) => handleChange('password', e.target.value)}
                className={`w-full bg-surface border rounded-xl pl-10 pr-11 py-3 text-sm text-text-primary focus:outline-none transition-colors ${
                  touched.password && !isPasswordValid 
                    ? 'border-red-400 focus:border-red-500' 
                    : isPasswordValid 
                      ? 'border-emerald-400/80 focus:border-emerald-500' 
                      : 'border-border focus:border-primary'
                }`}
              />
              <button
                type="button"
                id="toggle-password-visibility-btn"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-secondary hover:text-text-primary cursor-pointer transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Password Strength Progress Bar */}
            {formData.password && (
              <div className="grid grid-cols-3 gap-1.5 mt-2">
                <div className={`h-1.5 rounded-full transition-all duration-300 ${passwordStrength.score >= 1 ? passwordStrength.color : 'bg-border'}`}></div>
                <div className={`h-1.5 rounded-full transition-all duration-300 ${passwordStrength.score >= 2 ? passwordStrength.color : 'bg-border'}`}></div>
                <div className={`h-1.5 rounded-full transition-all duration-300 ${passwordStrength.score >= 3 ? passwordStrength.color : 'bg-border'}`}></div>
              </div>
            )}

            {/* Real-time Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-2.5 bg-bg/70 p-2.5 rounded-xl border border-border/70 text-[11px]">
              <div className={`flex items-center gap-1.5 ${isPassLengthValid ? 'text-emerald-600 font-semibold' : 'text-text-secondary'}`}>
                {isPassLengthValid ? (
                  <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                ) : (
                  <div className="w-3 h-3 rounded-full border border-border shrink-0"></div>
                )}
                <span>At least 8 characters</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasPassSymbol ? 'text-emerald-600 font-semibold' : 'text-text-secondary'}`}>
                {hasPassSymbol ? (
                  <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                ) : (
                  <div className="w-3 h-3 rounded-full border border-border shrink-0"></div>
                )}
                <span>Contains a symbol (!@#$%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Submission Error Message */}
        <div className="min-h-[22px] mt-3">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -4 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-semibold flex items-center gap-2"
            >
              <AlertCircle size={15} className="shrink-0 text-red-500" />
              <span>{error}</span>
            </motion.div>
          )}
        </div>

        {/* Submit Button with Live Form Validity Feedback */}
        <button 
          id="register-submit-btn"
          type="button"
          onClick={handleRegister}
          disabled={loading || !isFormValid}
          className={`w-full rounded-xl py-3.5 font-bold mt-2 shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
            isFormValid 
              ? 'bg-primary text-white shadow-primary/25 hover:opacity-95' 
              : 'bg-border text-text-secondary cursor-not-allowed opacity-70 shadow-none'
          }`}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <span>Complete Registration</span>
              {isFormValid && <CheckCircle2 size={16} className="text-white/90" />}
            </>
          )}
        </button>

        {/* Google Sign Up Alternative */}
        <button 
          id="register-google-btn"
          type="button"
          onClick={handleGoogleSignUp}
          disabled={loading}
          className="w-full bg-surface text-text-primary border border-border rounded-xl py-3.5 font-bold mt-2.5 shadow-xs hover:bg-bg hover:border-primary/40 transition-all flex items-center justify-center gap-2 group cursor-pointer text-xs"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span className="font-extrabold capitalize text-primary">{role.toLowerCase()}:</span>
          <span className="font-bold">Sign Up with Google</span>
        </button>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-text-secondary">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-500" /> Verified Secure
          </span>
          <button 
            id="switch-to-login-btn"
            type="button"
            onClick={() => setCurrentScreen('LOGIN')} 
            className="text-primary font-semibold hover:underline cursor-pointer"
          >
            Already have an account? Sign in
          </button>
        </div>
      </div>
    </motion.div>
  );
}
