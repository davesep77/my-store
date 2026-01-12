
import React, { useState } from 'react';
import { Package, Mail, Lock, User, Eye, EyeOff, Globe, ArrowRight, CheckCircle2, AlertCircle, Star } from 'lucide-react';
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
    fullName: '',
    country: '',
    subscription_plan: 'starter'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const endpoint = isLogin ? '/api/login' : '/api/register';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Authentication failed');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/20 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-purple-200/40 to-pink-200/20 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-tl from-blue-200/30 to-cyan-200/20 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-gradient-radial from-white/60 to-transparent rounded-full blur-[100px]" />

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white/95 backdrop-blur-xl rounded-[3rem] shadow-2xl shadow-purple-200/50 border border-white/60 overflow-hidden relative z-10 animate-scale-in">

        {/* Left Side: Illustration / Brand */}
        <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-[#8E54E9] via-[#7B47D4] to-[#4776E6] p-16 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIuNSIgb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-20" />
          <div className="absolute top-10 right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute bottom-20 left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />

          <div className="flex items-center gap-3 relative z-10">
            <div className="bg-white/20 backdrop-blur-md p-2.5 rounded-2xl shadow-lg shadow-black/20 border border-white/20">
              <Package size={28} />
            </div>
            <h1 className="text-2xl font-black tracking-tight font-display">{t.title}</h1>
          </div>

          <div className="space-y-8 relative z-10">
            <h2 className="text-5xl font-black leading-[1.1] tracking-tight font-display">
              The World's Most <br /> Powerful Stock <br /> Ecosystem.
            </h2>
            <p className="text-lg opacity-90 font-medium leading-relaxed max-w-md">
              Synchronize your multi-currency inventory with real-time MySQL analytics and international locale support.
            </p>

            <div className="flex gap-3">
              <div className="flex items-center gap-2 bg-white/15 px-4 py-2.5 rounded-xl backdrop-blur-md border border-white/20 shadow-lg hover:bg-white/20 transition-all">
                <CheckCircle2 size={16} />
                <span className="text-xs font-bold">SQL Persisted</span>
              </div>
              <div className="flex items-center gap-2 bg-white/15 px-4 py-2.5 rounded-xl backdrop-blur-md border border-white/20 shadow-lg hover:bg-white/20 transition-all">
                <Globe size={16} />
                <span className="text-xs font-bold">Multi-Locale</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between opacity-60 text-[10px] font-bold uppercase tracking-widest relative z-10">
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
              <div className="space-y-6 animate-in slide-in-from-top-2">
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

                <div className="animate-in slide-in-from-top-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Country</label>
                  <div className="relative group">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#8E54E9] transition-colors" size={18} />
                    <select
                      required={!isLogin}
                      value={formData.country}
                      onChange={e => setFormData({ ...formData, country: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-purple-200 focus:bg-white transition-all outline-none font-bold text-gray-700 appearance-none"
                    >
                      <option value="" disabled>Select Country</option>
                      <option value="US">United States</option>
                      <option value="GB">United Kingdom</option>
                      <option value="CA">Canada</option>
                      <option value="AU">Australia</option>
                      <option value="DE">Germany</option>
                      <option value="FR">France</option>
                      <option value="ES">Spain</option>
                      <option value="IT">Italy</option>
                      <option value="JP">Japan</option>
                      <option value="BR">Brazil</option>
                      <option value="IN">India</option>
                      <option value="MX">Mexico</option>
                      <option value="ZA">South Africa</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>

                <div className="animate-in slide-in-from-top-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Subscription Plan</label>
                  <div className="relative group">
                    <Star className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#8E54E9] transition-colors" size={18} />
                    <select
                      required={!isLogin}
                      value={formData.subscription_plan}
                      onChange={e => setFormData({ ...formData, subscription_plan: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-purple-200 focus:bg-white transition-all outline-none font-bold text-gray-700 appearance-none"
                    >
                      <option value="starter">Starter Plan ($10/mo)</option>
                      <option value="pro">Pro Plan ($25/mo)</option>
                      <option value="enterprise">Enterprise Plan ($50/mo)</option>
                    </select>
                  </div>
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
              className="w-full bg-gradient-to-r from-[#8E54E9] to-[#7B47D4] text-white py-5 rounded-[1.5rem] font-black text-lg shadow-2xl shadow-purple-300/60 hover:shadow-purple-400/70 hover:from-[#7c47d3] hover:to-[#6a3bc2] transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3 mt-4 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              {isLoading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="relative z-10">{isLogin ? t.login : t.signup}</span>
                  <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
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
