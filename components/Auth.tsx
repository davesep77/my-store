
import React, { useState } from 'react';
import { Package, Mail, Lock, User, Eye, EyeOff, Globe, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { User as UserType } from '../types';

interface AuthProps {
  onLogin: (user: UserType) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState('en');

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const endpoint = isLogin ? 'http://localhost/my-store-inventory-manager%20(1)/api/login.php' : 'http://localhost/my-store-inventory-manager%20(1)/api/register.php';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      onLogin(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const translations: any = {
    en: {
      title: 'Inventory Manager',
      login: 'Login',
      signup: 'Sign Up',
      welcome: 'Welcome Back!',
      subtitle: 'Manage your store across borders with precision.',
      userLabel: 'Username',
      passLabel: 'Password',
      emailLabel: 'Email Address',
      nameLabel: 'Full Name',
      forgot: 'Forgot Password?',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      btn: 'Authenticate'
    },
    es: {
      title: 'Gestor de Inventario',
      login: 'Iniciar Sesión',
      signup: 'Registrarse',
      welcome: '¡Bienvenido de nuevo!',
      subtitle: 'Gestione su tienda a través de las fronteras.',
      userLabel: 'Usuario',
      passLabel: 'Contraseña',
      emailLabel: 'Correo Electrónico',
      nameLabel: 'Nombre Completo',
      forgot: '¿Olvidó su contraseña?',
      noAccount: '¿No tiene una cuenta?',
      hasAccount: '¿Ya tiene una cuenta?',
      btn: 'Autenticar'
    }
  };

  const t = translations[lang] || translations.en;

  return (
    <div className="min-h-screen bg-[#FDFDFF] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-100/50 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-50/50 rounded-full blur-[120px]" />

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[3rem] shadow-2xl shadow-purple-100/50 border border-gray-100 overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-700">

        {/* Left Side: Illustration / Brand */}
        <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-[#8E54E9] to-[#4776E6] p-16 text-white relative">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-md p-2 rounded-2xl">
              <Package size={28} />
            </div>
            <h1 className="text-2xl font-black tracking-tight">{t.title}</h1>
          </div>

          <div className="space-y-8">
            <h2 className="text-5xl font-black leading-tight tracking-tighter">
              The World's Most <br /> Powerful Stock <br /> Ecosystem.
            </h2>
            <p className="text-lg opacity-80 font-medium leading-relaxed max-w-md">
              Synchronize your multi-currency inventory with real-time MySQL analytics and international locale support.
            </p>

            <div className="flex gap-4">
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10">
                <CheckCircle2 size={16} />
                <span className="text-xs font-bold">SQL Persisted</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10">
                <Globe size={16} />
                <span className="text-xs font-bold">Multi-Locale</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between opacity-50 text-[10px] font-bold uppercase tracking-widest">
            <span>© 2025 My Store Global</span>
            <span>Version 4.2.0</span>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 md:p-16 lg:p-20 flex flex-col justify-center">
          <div className="flex justify-between items-center mb-10">
            <div className="relative group">
              <button className="flex items-center gap-2 text-xs font-black text-gray-400 hover:text-[#8E54E9] transition-colors uppercase tracking-widest">
                <Globe size={14} />
                {lang === 'en' ? 'English' : 'Español'}
              </button>
              <div className="absolute top-full left-0 mt-2 bg-white shadow-xl rounded-xl border border-gray-50 opacity-0 group-hover:opacity-100 transition-all invisible group-hover:visible z-20 overflow-hidden">
                <button onClick={() => setLang('en')} className="block w-full px-6 py-3 text-left text-xs font-bold hover:bg-gray-50">English (US)</button>
                <button onClick={() => setLang('es')} className="block w-full px-6 py-3 text-left text-xs font-bold hover:bg-gray-50">Español (ES)</button>
              </div>
            </div>
            <div className="flex bg-gray-50 p-1 rounded-2xl shadow-inner">
              <button
                onClick={() => { setIsLogin(true); setError(null); }}
                className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${isLogin ? 'bg-white text-gray-800 shadow-md' : 'text-gray-400'}`}
              >
                {t.login}
              </button>
              <button
                onClick={() => { setIsLogin(false); setError(null); }}
                className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${!isLogin ? 'bg-white text-gray-800 shadow-md' : 'text-gray-400'}`}
              >
                {t.signup}
              </button>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-4xl font-black text-gray-800 tracking-tight mb-2">
              {isLogin ? t.welcome : t.signup}
            </h3>
            <p className="text-gray-400 font-medium">{t.subtitle}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
              <AlertCircle size={18} className="text-red-500 shrink-0" />
              <p className="text-xs font-bold text-red-600 leading-tight">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="animate-in slide-in-from-top-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">{t.nameLabel}</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#8E54E9] transition-colors" size={18} />
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-purple-200 focus:bg-white transition-all outline-none font-bold text-gray-700"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">{t.userLabel}</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#8E54E9] transition-colors" size={18} />
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-purple-200 focus:bg-white transition-all outline-none font-bold text-gray-700"
                  placeholder="username"
                />
              </div>
            </div>

            {!isLogin && (
              <div className="animate-in slide-in-from-top-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">{t.emailLabel}</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#8E54E9] transition-colors" size={18} />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-purple-200 focus:bg-white transition-all outline-none font-bold text-gray-700"
                    placeholder="admin@mystore.com"
                  />
                </div>
              </div>
            )}

            <div>
              <div className="flex justify-between px-1">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t.passLabel}</label>
                {isLogin && <button type="button" className="text-[10px] font-black text-[#8E54E9] uppercase tracking-widest hover:underline">{t.forgot}</button>}
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#8E54E9] transition-colors" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-purple-200 focus:bg-white transition-all outline-none font-bold text-gray-700"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              disabled={isLoading}
              className="w-full bg-[#8E54E9] text-white py-5 rounded-[1.5rem] font-black text-lg shadow-2xl shadow-purple-200 hover:bg-[#7c47d3] transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3 mt-4"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? t.login : t.signup}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-medium text-gray-400">
            {isLogin ? t.noAccount : t.hasAccount}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="ml-1 text-[#8E54E9] font-black hover:underline"
            >
              {isLogin ? t.signup : t.login}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
