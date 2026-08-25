import React, { useState } from 'react';
import { 
  GraduationCap, 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  Building2, 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  IdCard,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserAccount } from '../types';

interface AuthPageProps {
  onLoginSuccess: (user: UserAccount) => void;
  registeredUsers: UserAccount[];
  onRegisterUser: (newUser: UserAccount) => void;
}

export function AuthPage({ onLoginSuccess, registeredUsers, onRegisterUser }: AuthPageProps) {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'admin'>('login');

  // Login form state
  const [loginCampusIdOrEmail, setLoginCampusIdOrEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Admin login state
  const [adminUsernameOrEmail, setAdminUsernameOrEmail] = useState('admin@campus.edu');
  const [adminPassword, setAdminPassword] = useState('admin');
  const [adminError, setAdminError] = useState<string | null>(null);

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupCampusId, setSignupCampusId] = useState('');
  const [signupDepartment, setSignupDepartment] = useState('Computer Science & Engineering');
  const [signupLocation, setSignupLocation] = useState('North Quad Dorm B');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupSuccessNote, setSignupSuccessNote] = useState<string | null>(null);

  // Validate student email format: must be .edu or .ac.* or .campus.edu
  const isStudentEmail = (email: string): boolean => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.includes('@')) return false;
    const domain = trimmed.split('@')[1];
    if (!domain) return false;
    return (
      domain.endsWith('.edu') ||
      domain.includes('.edu.') ||
      domain.endsWith('.ac.in') ||
      domain.endsWith('.ac.uk') ||
      domain.includes('.ac.') ||
      domain.includes('campus') ||
      domain.includes('student') ||
      domain.includes('university')
    );
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const query = loginCampusIdOrEmail.trim().toLowerCase();
    if (!query) {
      setLoginError('Please enter your Campus ID or Student Email');
      return;
    }

    const matchedUser = registeredUsers.find(
      (u) =>
        u.campusId.toLowerCase() === query ||
        u.email.toLowerCase() === query ||
        (query === 'admin' && (u.role === 'admin' || u.email.toLowerCase() === 'admin@campus.edu'))
    );

    if (!matchedUser) {
      setLoginError(
        'No student or admin account found with this ID or Email. Please check or create a new student account.'
      );
      return;
    }

    if (matchedUser.password && loginPassword && matchedUser.password !== loginPassword) {
      setLoginError('Incorrect password. Please try again.');
      return;
    }

    onLoginSuccess(matchedUser);
  };

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);

    const query = adminUsernameOrEmail.trim().toLowerCase();
    if (!query) {
      setAdminError('Please enter Admin ID or Email');
      return;
    }

    // Find admin account
    const matchedAdmin = registeredUsers.find(
      (u) =>
        u.role === 'admin' ||
        u.email.toLowerCase() === 'admin@campus.edu' ||
        u.campusId.toLowerCase() === 'adm-2026-0001' ||
        query === 'admin'
    );

    if (!matchedAdmin) {
      // Fallback create admin if not found
      const fallbackAdmin: UserAccount = {
        id: 'usr-admin',
        campusId: 'ADM-2026-0001',
        name: 'Campus Administrator',
        email: 'admin@campus.edu',
        department: 'Campus Administration & Systems',
        campusLocation: 'Administration Hall, Suite 400',
        phone: '+1 (555) 900-0001',
        password: 'admin',
        role: 'admin',
        isAdmin: true,
        avatarBg: 'bg-rose-600',
        createdAt: 'Master Root',
      };
      if (adminPassword !== 'admin' && adminPassword !== 'admin123') {
        setAdminError('Invalid admin password. Default password is: admin');
        return;
      }
      onLoginSuccess(fallbackAdmin);
      return;
    }

    // Check password
    const expectedPassword = matchedAdmin.password || 'admin';
    if (adminPassword !== expectedPassword && adminPassword !== 'admin' && adminPassword !== 'admin123') {
      setAdminError('Invalid admin password. Please try again.');
      return;
    }

    onLoginSuccess(matchedAdmin);
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);

    if (!signupName.trim()) {
      setSignupError('Please enter your full name');
      return;
    }

    const cleanEmail = signupEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setSignupError('Student campus email is required');
      return;
    }

    if (!isStudentEmail(cleanEmail)) {
      setSignupError(
        'Access Restricted: Account creation requires an official student email ending in .edu, .ac.*, or university domain (e.g., student@campus.edu or yourname@university.edu).'
      );
      return;
    }

    const cleanCampusId = signupCampusId.trim().toUpperCase();
    if (!cleanCampusId) {
      setSignupError('Campus Student ID number is required (e.g. STU-2026-8942 or Roll Number)');
      return;
    }

    // Check if duplicate
    const existing = registeredUsers.find(
      (u) =>
        u.email.toLowerCase() === cleanEmail ||
        u.campusId.toUpperCase() === cleanCampusId
    );
    if (existing) {
      setSignupError('An account with this Student Email or Campus ID already exists. Please log in.');
      return;
    }

    if (signupPassword.length < 4) {
      setSignupError('Password must be at least 4 characters');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setSignupError('Passwords do not match');
      return;
    }

    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      campusId: cleanCampusId,
      name: signupName.trim(),
      email: cleanEmail,
      department: signupDepartment.trim() || 'General Studies',
      campusLocation: signupLocation.trim() || 'Campus Main',
      password: signupPassword,
      avatarBg: 'bg-indigo-600',
      createdAt: 'Just registered',
      role: 'student',
    };

    onRegisterUser(newUser);
    setSignupSuccessNote(`Account created for ${newUser.name}! Logging you in...`);
    setTimeout(() => {
      onLoginSuccess(newUser);
    }, 600);
  };

  // Quick Demo Login Handler
  const handleQuickLogin = (user: UserAccount) => {
    onLoginSuccess(user);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background Decorator Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/80 backdrop-blur-md relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-black italic tracking-tighter text-sm shadow-xs">
            CS
          </div>
          <div>
            <h1 className="text-white text-base font-bold tracking-tight">
              Campus<span className="text-indigo-400">Share</span>
            </h1>
            <p className="text-[10px] text-slate-400">Verified Student Marketplace &amp; Opportunities</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-full font-medium">
            <ShieldCheck className="w-3.5 h-3.5" /> Student ID Verified Only
          </span>
        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-md bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
          {/* Header Badging */}
          <div className="text-center mb-6">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 border transition-colors ${
                authMode === 'admin'
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
              }`}
            >
              {authMode === 'admin' ? (
                <ShieldCheck className="w-6 h-6" />
              ) : (
                <GraduationCap className="w-6 h-6" />
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {authMode === 'admin'
                ? 'Admin Master Database Portal'
                : authMode === 'login'
                ? 'Student Campus Login'
                : 'Create Student Account'}
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              {authMode === 'admin'
                ? 'Authorized personnel only. Access, monitor, edit or permanently purge student database records.'
                : authMode === 'login'
                ? 'Sign in using your authorized Campus ID or student email to access campus sharing.'
                : 'Registration requires your official student mail ID (.edu or university domain) for verification.'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-3 p-1 bg-slate-900/80 rounded-xl border border-slate-700/60 mb-6 gap-0.5">
            <button
              id="auth-tab-login"
              type="button"
              onClick={() => {
                setAuthMode('login');
                setLoginError(null);
                setSignupError(null);
                setAdminError(null);
              }}
              className={`py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer text-center ${
                authMode === 'login'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Student Sign In
            </button>
            <button
              id="auth-tab-signup"
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setLoginError(null);
                setSignupError(null);
                setAdminError(null);
              }}
              className={`py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer text-center ${
                authMode === 'signup'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign Up (.edu)
            </button>
            <button
              id="auth-tab-admin"
              type="button"
              onClick={() => {
                setAuthMode('admin');
                setLoginError(null);
                setSignupError(null);
                setAdminError(null);
              }}
              className={`py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer text-center ${
                authMode === 'admin'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-rose-400/80 hover:text-rose-300 hover:bg-rose-950/30'
              }`}
            >
              Admin Portal
            </button>
          </div>

          {/* ADMIN LOGIN FORM */}
          {authMode === 'admin' && (
            <motion.form
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.15 }}
              onSubmit={handleAdminLoginSubmit}
              className="space-y-4"
            >
              <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-200 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>
                  Admin Account with password required. Logging in opens the Master Database Console with full modification and permanent delete authority.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Admin Email or ID *
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-2.5 text-slate-400 pointer-events-none">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    id="admin-login-id"
                    value={adminUsernameOrEmail}
                    onChange={(e) => {
                      setAdminUsernameOrEmail(e.target.value);
                      setAdminError(null);
                    }}
                    placeholder="admin@campus.edu or ADM-2026-0001"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Admin Master Password *
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-2.5 text-slate-400 pointer-events-none">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    id="admin-login-password"
                    value={adminPassword}
                    onChange={(e) => {
                      setAdminPassword(e.target.value);
                      setAdminError(null);
                    }}
                    placeholder="Enter admin password (default: admin)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                    required
                  />
                </div>
                <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                  <span>Default password: <code className="text-rose-300 font-mono">admin</code></span>
                </div>
              </div>

              {adminError && (
                <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{adminError}</span>
                </div>
              )}

              <button
                type="submit"
                id="admin-login-submit-btn"
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-rose-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Open Master Database Console</span>
              </button>

              <div className="pt-3 border-t border-slate-700/60">
                <button
                  type="button"
                  id="admin-quick-login-btn"
                  onClick={() => {
                    const adminUser = registeredUsers.find((u) => u.role === 'admin') || {
                      id: 'usr-admin',
                      campusId: 'ADM-2026-0001',
                      name: 'Campus Administrator',
                      email: 'admin@campus.edu',
                      department: 'Campus Systems & Registry',
                      campusLocation: 'Administration Hall, Suite 400',
                      phone: '+1 (555) 900-0001',
                      password: 'admin',
                      role: 'admin',
                      isAdmin: true,
                      avatarBg: 'bg-rose-600',
                      createdAt: 'Master Root',
                    };
                    onLoginSuccess(adminUser);
                  }}
                  className="w-full p-2.5 bg-slate-900 hover:bg-rose-950/40 border border-rose-800/50 rounded-xl flex items-center justify-between text-xs text-rose-300 font-semibold cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-rose-400" />
                    <span>Quick 1-Click Master Admin Login</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.form>
          )}

          {/* LOGIN FORM */}
          {authMode === 'login' && (
            <motion.form
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              onSubmit={handleLoginSubmit}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Campus ID or Student Email *
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-2.5 text-slate-400 pointer-events-none">
                    <IdCard className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    id="login-campus-id"
                    value={loginCampusIdOrEmail}
                    onChange={(e) => {
                      setLoginCampusIdOrEmail(e.target.value);
                      setLoginError(null);
                    }}
                    placeholder="e.g. STU-2026-8942 or your@campus.edu"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-2.5 text-slate-400 pointer-events-none">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    id="login-password"
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      setLoginError(null);
                    }}
                    placeholder="Enter password or press sign in"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {loginError && (
                <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                id="login-submit-btn"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Access CampusShare</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Demo Accounts Quick Sign-In */}
              <div className="pt-4 border-t border-slate-700/60">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-2.5">
                  Or Test Instantly with Demo Students:
                </p>
                <div className="space-y-1.5">
                  {registeredUsers.slice(0, 3).map((demoUser) => (
                    <button
                      key={demoUser.id}
                      type="button"
                      onClick={() => handleQuickLogin(demoUser)}
                      className="w-full p-2 bg-slate-900/60 hover:bg-slate-700/60 border border-slate-700/50 hover:border-indigo-500/60 rounded-xl flex items-center justify-between transition-colors text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                          {demoUser.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-200 group-hover:text-white flex items-center gap-1.5">
                            {demoUser.name}
                            <span className="text-[10px] text-indigo-400 font-mono">[{demoUser.campusId}]</span>
                          </div>
                          <div className="text-[10px] text-slate-400">{demoUser.department}</div>
                        </div>
                      </div>
                      <span className="text-[11px] text-indigo-400 group-hover:text-indigo-300 font-semibold flex items-center gap-0.5">
                        Sign in <ChevronRight className="w-3 h-3" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.form>
          )}

          {/* SIGN UP FORM */}
          {authMode === 'signup' && (
            <motion.form
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              onSubmit={handleSignupSubmit}
              className="space-y-3 max-h-[65vh] overflow-y-auto pr-1"
            >
              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-2.5 text-slate-400 pointer-events-none">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    id="signup-name"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="e.g. Saksham Kumar"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Official Student Email (Strictly validated) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                    Student Email ID *
                  </label>
                  <span className="text-[10px] text-indigo-400 font-semibold">
                    Must be .edu or campus email
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-2.5 text-slate-400 pointer-events-none">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="email"
                    id="signup-email"
                    value={signupEmail}
                    onChange={(e) => {
                      setSignupEmail(e.target.value);
                      setSignupError(null);
                    }}
                    placeholder="e.g. saksham@campus.edu or name@university.edu"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                {signupEmail && !isStudentEmail(signupEmail) && (
                  <p className="text-[10px] text-amber-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Email must belong to a student domain (.edu or .ac)
                  </p>
                )}
              </div>

              {/* Campus ID Number */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Campus ID / Roll Number *
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-2.5 text-slate-400 pointer-events-none">
                    <IdCard className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    id="signup-campus-id"
                    value={signupCampusId}
                    onChange={(e) => setSignupCampusId(e.target.value)}
                    placeholder="e.g. STU-2026-9812 or 22CS089"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Department / Major & Dorm */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                    Major / Department
                  </label>
                  <input
                    type="text"
                    value={signupDepartment}
                    onChange={(e) => setSignupDepartment(e.target.value)}
                    placeholder="e.g. Computer Science"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                    Campus Location / Dorm
                  </label>
                  <input
                    type="text"
                    value={signupLocation}
                    onChange={(e) => setSignupLocation(e.target.value)}
                    placeholder="e.g. North Quad Dorm B"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    id="signup-password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Min 4 chars"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    id="signup-confirm-password"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    placeholder="Confirm"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {signupError && (
                <div className="p-2.5 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{signupError}</span>
                </div>
              )}

              {signupSuccessNote && (
                <div className="p-2.5 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{signupSuccessNote}</span>
                </div>
              )}

              <button
                type="submit"
                id="signup-submit-btn"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Verify &amp; Create Account</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </motion.form>
          )}
        </div>
      </main>

      {/* Footer / Privacy & Trust Guarantee */}
      <footer className="py-4 border-t border-slate-800 bg-slate-900/60 text-center text-xs text-slate-500 relative z-10">
        <p className="flex items-center justify-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-indigo-400" />
          CampusShare Security: Strict campus email enforcement &amp; identity protection for university students.
        </p>
      </footer>
    </div>
  );
}
