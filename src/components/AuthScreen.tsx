import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  UserPlus, 
  LogIn, 
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Download
} from 'lucide-react';
import { UserAccount } from '../types';
import { 
  loadUsers, 
  saveUsers, 
  hashPassword, 
  generateSalt, 
  setActiveSession 
} from '../services/storage';

interface AuthScreenProps {
  onSignedIn: (username: string) => void;
  logo: string;
  isInstallable?: boolean;
  onOpenInstallModal?: () => void;
  onOneTapInstall?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ 
  onSignedIn, 
  logo,
  isInstallable,
  onOpenInstallModal,
  onOneTapInstall,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [users, setUsers] = useState<UserAccount[]>([]);

  useEffect(() => {
    const list = loadUsers();
    setUsers(list);
    // If no users exist, switch to sign-up to guide user
    if (list.length === 0) {
      setMode('signup');
    }
  }, []);

  // Password strength calculation
  const getPasswordStrength = (pw: string) => {
    const c = {
      len: pw.length >= 8,
      lower: /[a-z]/.test(pw),
      upper: /[A-Z]/.test(pw),
      num: /\d/.test(pw),
      sym: /[^A-Za-z0-9]/.test(pw),
    };
    const score = Object.values(c).filter(Boolean).length;
    let level = 0;
    if (pw.length > 0) {
      if (!c.len || score <= 2) level = 1;
      else if (score === 3) level = 2;
      else if (score === 4) level = 3;
      else level = 4;
    }
    const missing: string[] = [];
    if (!c.len) missing.push('8+ characters');
    if (!c.upper) missing.push('uppercase letter');
    if (!c.lower) missing.push('lowercase letter');
    if (!c.num) missing.push('number');
    if (!c.sym) missing.push('symbol');

    return {
      level,
      isAcceptable: c.len && score >= 3,
      missing,
    };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const trimmedUser = username.trim();
    if (!trimmedUser) {
      setError('Please enter a username.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    const currentUsers = loadUsers();

    if (mode === 'signup') {
      if (!/^[A-Za-z0-9._-]{3,40}$/.test(trimmedUser)) {
        setError('Username must be 3-40 characters (letters, numbers, dots, dashes, underscores).');
        return;
      }

      const exists = currentUsers.some(
        u => u.name.toLowerCase() === trimmedUser.toLowerCase()
      );
      if (exists) {
        setError('That username is already taken. Please choose another.');
        return;
      }

      if (!strength.isAcceptable) {
        setError(`Password too weak. Please add: ${strength.missing.join(', ')}.`);
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match. Please re-enter.');
        return;
      }

      const salt = generateSalt();
      const hash = await hashPassword(password, salt);

      const newUser: UserAccount = {
        name: trimmedUser,
        salt,
        hash,
        role: currentUsers.length === 0 ? 'Admin' : 'Staff',
        createdAt: new Date().toISOString(),
      };

      const updated = [...currentUsers, newUser];
      saveUsers(updated);
      setUsers(updated);

      setSuccess('Account created successfully! You can now sign in.');
      setMode('signin');
      setPassword('');
      setConfirmPassword('');
      return;
    }

    // Sign in mode
    const user = currentUsers.find(
      u => u.name.toLowerCase() === trimmedUser.toLowerCase()
    );

    if (!user) {
      setError(
        currentUsers.length === 0
          ? 'No registered accounts yet. Click "Create Administrator Account" to set up your access.'
          : 'Username not found. Check the spelling or create an account.'
      );
      return;
    }

    const computedHash = await hashPassword(password, user.salt);
    if (computedHash !== user.hash) {
      setError('Incorrect password. Please try again.');
      return;
    }

    // Success
    setActiveSession(user.name);
    onSignedIn(user.name);
  };

  const handleResetAccounts = () => {
    const ok = window.confirm(
      'Reset all saved user accounts? Your permit records will NOT be deleted. You can then create a new administrator account.'
    );
    if (ok) {
      saveUsers([]);
      setUsers([]);
      setMode('signup');
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      setError('');
      setSuccess('All accounts cleared. Create a new administrator account below.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#d9eefa] via-[#eaf5fb] to-[#f2f8fb] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden border-t-6 border-t-[#fcee21]">
        
        {/* Card Header */}
        <div className="p-6 text-center border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-16 h-16 rounded-full bg-white p-1 border-2 border-amber-300 shadow-md overflow-hidden flex items-center justify-center">
              <img src="/assets/aistudio/Talisayan_logo_de080e16.jpg" alt="Municipality of Talisayan Seal" className="w-full h-full object-contain" />
            </div>
            <div className="w-18 h-18 rounded-full bg-white p-1 border-3 border-emerald-700 shadow-md overflow-hidden flex items-center justify-center">
              <img src={logo} alt="Office of the Building Official Seal" className="w-full h-full object-contain" />
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="inline-block px-2.5 py-0.5 text-[10px] font-extrabold tracking-widest uppercase bg-[#0f3d64] text-white rounded-xs mb-1">
              OFFICE OF THE BUILDING OFFICIAL • TALISAYAN
            </span>
            <p className="text-[11px] font-bold text-slate-600">
              Municipality of Talisayan • Misamis Oriental
            </p>
          </div>

          <h1 className="text-base sm:text-lg font-serif font-bold text-slate-900 leading-tight mt-1">
            OBO BUILDING PERMIT &amp; CERTIFICATE OF OCCUPANCY
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            RECORDS MANAGEMENT SYSTEM
          </p>
        </div>

        {/* Auth Form */}
        <div className="p-6">
          <div className="mb-4 text-center">
            <h2 className="text-sm font-bold text-slate-800">
              {mode === 'signin' ? 'Sign in to Continue' : 'Create Administrator Account'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {mode === 'signin'
                ? 'Authorized access for OBO staff & building officials.'
                : 'Set up your credentials to manage registry records.'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {/* Username */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Username
              </label>
              <input
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin or engineer"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1d6fa8]"
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-[#1d6fa8] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showPassword ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1d6fa8]"
              />
            </div>

            {/* Password Strength Meter when creating account */}
            {mode === 'signup' && (
              <div className="space-y-1.5 pt-1">
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden flex">
                  <div
                    className={`h-full transition-all duration-300 ${
                      strength.level === 1
                        ? 'w-1/4 bg-red-500'
                        : strength.level === 2
                        ? 'w-2/4 bg-amber-500'
                        : strength.level === 3
                        ? 'w-3/4 bg-blue-500'
                        : strength.level === 4
                        ? 'w-full bg-emerald-500'
                        : 'w-0'
                    }`}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>
                    Strength:{' '}
                    <strong className={strength.level >= 3 ? 'text-emerald-600' : 'text-slate-700'}>
                      {['Too short', 'Weak', 'Fair', 'Good', 'Strong'][strength.level]}
                    </strong>
                  </span>
                  {strength.missing.length > 0 && (
                    <span className="text-amber-600">Needs {strength.missing[0]}</span>
                  )}
                </div>
              </div>
            )}

            {/* Confirm Password */}
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1d6fa8]"
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-[#0f3d64] hover:bg-[#14527f] text-white font-bold shadow-md hover:shadow-lg transition cursor-pointer flex items-center justify-center gap-2 pt-2"
            >
              {mode === 'signin' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              <span>{mode === 'signin' ? 'Sign in to Registry' : 'Create Account'}</span>
            </button>
          </form>

          {/* Mode Switcher */}
          <div className="mt-5 pt-4 border-t border-slate-100 text-center text-xs text-slate-500 space-y-2">
            <div>
              {mode === 'signin' ? "Don't have an account yet?" : 'Already have an account?'}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'signin' ? 'signup' : 'signin');
                  setError('');
                  setSuccess('');
                }}
                className="ml-1 text-[#1d6fa8] hover:underline font-bold cursor-pointer"
              >
                {mode === 'signin' ? 'Create Account' : 'Sign in'}
              </button>
            </div>

            {users.length > 0 && mode === 'signin' && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleResetAccounts}
                  className="text-slate-400 hover:text-red-600 text-[11px] hover:underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Can't sign in? Reset accounts</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 text-center text-[11px] text-slate-400">
          <span>OBO Records Management System • Municipality of Talisayan</span>
        </div>
      </div>
    </div>
  );
};
