import React, { useState, useEffect, useMemo } from 'react';
// @ts-ignore
import { HashRouter, Routes, Route, Link, useNavigate, useParams, Navigate, useLocation } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { 
  Search, MessageCircle, Phone, HeartPulse, User, LogOut, X, 
  ArrowLeft, ArrowRight, Loader2, Zap, Edit2, Trash2,
  Database, Plus, Save, Settings, CheckCircle2, ShieldCheck, 
  PlusCircle,
  Globe, PhoneCall, Home, AlertCircle, Info, Code2,
  Instagram, Facebook, Mail, Lock, Eye, EyeOff, Sun, Moon, MapPin, 
  Bell, Megaphone, Upload, Image as ImageIcon, MapPinned, ChevronLeft, AlertTriangle,
  RefreshCw, Menu as MenuIcon, Smartphone, Star,
  Award, TrendingUp, Gem, Check, Rocket, ChevronRight, Share, Heart, ChevronDown,
  Copy, CheckCircle, LayoutDashboard, BarChart3, Users, MousePointer2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';

import { Company, Alert, OnCallDuty, AdminContact, Notification as AppNotification, Banner } from './types';
import { INITIAL_COMPANIES, INITIAL_OFFERS, INITIAL_ON_CALL, INITIAL_ADMIN_CONTACT, INITIAL_BANNERS } from './constants';

const MotionDiv = motion.div as any;

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase credentials missing. Please check your environment variables.');
}

const supabase = createClient(
  SUPABASE_URL || 'https://xtpvdeqfqokkrdlhvrrx.supabase.co', 
  SUPABASE_ANON_KEY || 'sb_publishable_ZL1HhCHSh-0iVNA1dP37-w_KX27D-W-'
);

// --- Motion Configs ---
const springTransition = { type: "spring", stiffness: 300, damping: 30 };
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const SUPPORTED_CITIES = [
  { id: 'bernardino', name: 'Bernardino de Campos', state: 'SP' },
  { id: 'santacruz', name: 'Santa Cruz do Rio Pardo', state: 'SP' },
  { id: 'ipaussu', name: 'Ipaussu', state: 'SP' },
  { id: 'chavantes', name: 'Chavantes', state: 'SP' },
  { id: 'ourinhos', name: 'Ourinhos', state: 'SP' }
];

// --- Utilities ---
const getWhatsAppLink = (phone: string, text?: string) => {
  if (!phone) return '#';
  if (phone.includes('wa.me') || phone.includes('whatsapp.com') || phone.startsWith('http')) return phone;
  const clean = phone.replace(/\D/g, '');
  const finalPhone = clean.startsWith('55') ? clean : `55${clean}`;
  const message = text || 'Olá! Vi seu número no Guia de Telefones.';
  return `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
};

const getSocialUrl = (platform: 'instagram' | 'facebook', value: string) => {
  if (!value) return null;
  if (value.startsWith('http')) return value;
  if (platform === 'instagram') return `https://instagram.com/${value.replace('@', '')}`;
  if (platform === 'facebook') return `https://facebook.com/${value}`;
  return null;
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const subscribeUserToPush = async () => {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return false;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY
    });

    const response = await fetch('/api/subscribe', {
      method: 'POST',
      body: JSON.stringify(subscription),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return response.ok;
  } catch (error) {
    console.error('Erro ao subscrever para push:', error);
    return false;
  }
};

// --- Base Components ---

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-emerald-100/50 rounded-2xl ${className}`} />
);

const QuickFilters = ({ activeCategory, onSelectCategory, categories }: any) => {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 mb-8">
      <button
        onClick={() => onSelectCategory(null)}
        className={`px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all whitespace-nowrap active:scale-95 ${!activeCategory ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-white border border-emerald-50 text-emerald-950/40 hover:border-emerald-200'}`}
      >
        Todos
      </button>
      {categories.map((cat: string) => (
        <button
          key={cat}
          onClick={() => onSelectCategory(cat)}
          className={`px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all whitespace-nowrap active:scale-95 ${activeCategory === cat ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-white border border-emerald-50 text-emerald-950/40 hover:border-emerald-200'}`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

const Toast = ({ message, type = 'success', onClose }: { message: string, type?: 'success' | 'error', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[3000] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
        type === 'success' 
          ? 'bg-emerald-600/90 text-white border-emerald-400/20' 
          : 'bg-red-600/90 text-white border-red-400/20'
      }`}
    >
      {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
      <span className="text-xs font-black uppercase tracking-widest whitespace-nowrap">{message}</span>
    </MotionDiv>
  );
};



const BackToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <MotionDiv
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-24 left-6 md:bottom-12 md:left-12 z-[150] p-4 bg-emerald-600 text-white rounded-2xl shadow-2xl shadow-emerald-600/40 cursor-pointer active:scale-90 transition-all group"
        >
          <ChevronRight size={24} className="-rotate-90 group-hover:-translate-y-1 transition-transform" />
        </MotionDiv>
      )}
    </AnimatePresence>
  );
};

const AppLogo = ({ size = "md", animate = false }: { size?: "sm" | "md" | "lg", animate?: boolean }) => {
  const isLarge = size === "lg";
  const isSmall = size === "sm";
  
  const iconBoxSize = isLarge ? 'w-24 h-24 md:w-32 md:h-32' : isSmall ? 'w-10 h-10' : 'w-16 h-16 md:w-20 md:h-20';
  const iconSize = isLarge ? 56 : isSmall ? 20 : 36;
  const titleSize = isLarge ? 'text-5xl md:text-7xl' : isSmall ? 'text-xl' : 'text-3xl md:text-4xl';
  const subSize = isLarge ? 'text-sm' : 'text-[10px] md:text-[11px]';

  return (
    <div className={`flex ${isLarge ? 'flex-col items-center text-center' : 'items-center text-left'} gap-6 md:gap-8 group select-none`}>
      <div className={`relative ${iconBoxSize}`}>
        {/* Multi-layered Glow System */}
        <div className="absolute inset-0 rounded-[35%] rotate-12 opacity-40 blur-2xl bg-emerald-400 animate-pulse" />
        <div className="absolute inset-0 rounded-[35%] -rotate-6 opacity-30 blur-3xl bg-teal-300" />
        
        <MotionDiv 
          animate={animate ? { 
            rotateY: [0, 360],
            y: [0, -15, 0],
            scale: [1, 1.05, 1]
          } : {}}
          transition={animate ? { 
            rotateY: { duration: 8, repeat: Infinity, ease: "linear" },
            y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          } : {}}
          className="relative h-full w-full rounded-[35%] flex items-center justify-center shadow-[0_20px_50px_rgba(6,78,59,0.3)] transition-all duration-700 overflow-hidden border-b-[10px] bg-gradient-to-br from-emerald-400 via-emerald-600 to-teal-800 border-emerald-900/50"
        >
          {/* Advanced Glass Reflections */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-50" />
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-white/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 flex flex-col items-center">
            <MapPinned size={iconSize} strokeWidth={2.5} className="text-white drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)]" />
            <MotionDiv 
              animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.3, 1] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="absolute -top-3 -right-3 w-4 h-4 md:w-6 md:h-6 bg-emerald-300 rounded-full border-2 border-emerald-600 shadow-[0_0_20px_rgba(110,231,183,1)]"
            />
          </div>

          {/* Dynamic Light Sweep */}
          <MotionDiv 
            animate={{ x: ['-200%', '200%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.5 }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[35deg]"
          />
        </MotionDiv>
      </div>

      <div className="flex flex-col">
        <h1 className={`${titleSize} font-black uppercase tracking-tighter leading-[0.8] flex items-center gap-3`}>
          <span className="text-emerald-950 dark:text-white drop-shadow-xl">Guia</span>
          <span className="relative text-emerald-500 drop-shadow-2xl italic">
            Digital
            <MotionDiv 
              initial={{ x: '-100%' }}
              animate={{ x: '250%' }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-12 pointer-events-none"
            />
          </span>
        </h1>
        <div className={`flex items-center ${isLarge ? 'justify-center' : 'justify-start'} gap-3 mt-3`}>
          <div className="h-[2px] w-6 bg-emerald-500/40" />
          <p className={`${subSize} font-black uppercase tracking-[0.4em] text-emerald-600/80 dark:text-emerald-400/60`}>O Melhor da Cidade</p>
          <div className="h-[2px] w-6 bg-emerald-500/40" />
        </div>
      </div>
    </div>
  );
};

// --- Navigation Components ---

const SideDrawer = ({ 
  isOpen, 
  onClose, 
  notifications, 
  theme, 
  setTheme, 
  user,
  adminPhone,
  favoritesCount,
  pushEnabled,
  onEnablePush,
  currentCity,
  onCityChange,
  onOpenFreeRegistration
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  notifications: AppNotification[],
  theme: 'light' | 'dark',
  setTheme: (t: 'light' | 'dark') => void,
  user: any,
  adminPhone: string,
  favoritesCount: number,
  pushEnabled: boolean,
  onEnablePush: () => void,
  currentCity: string,
  onCityChange: (city: string) => void,
  onOpenFreeRegistration: () => void
}) => {
  const navigate = useNavigate();
  const cityName = SUPPORTED_CITIES.find(c => c.id === currentCity)?.name || 'Selecione a Cidade';

  const menuLinks = [
    { icon: Home, label: 'Início', path: '/' },
    { icon: Heart, label: `Favoritos (${favoritesCount})`, path: '/favoritos' },
    { icon: Award, label: 'Seja um Parceiro', path: '/planos' },
    { icon: HeartPulse, label: 'Farmácia de Plantão', path: '/plantao' },
    { icon: Info, label: 'Quem Somos', path: '/sobre' },
    { icon: Settings, label: 'Painel Admin', path: user ? '/admin' : '/login' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2000] overflow-hidden">
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-emerald-950/40 dark:bg-black/80 backdrop-blur-md"
          />
          <MotionDiv
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative h-full w-full max-w-[min(380px,85%)] bg-white shadow-3xl border-r border-emerald-50 flex flex-col"
          >
            <div className="p-8 flex justify-between items-center border-b border-emerald-50">
              <AppLogo size="sm" />
              <button onClick={onClose} className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600 active:scale-90 transition-transform">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-10">
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-950/30 ml-4">Localização</span>
                <button
                  onClick={() => {
                    onCityChange(currentCity);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-emerald-50/50 border border-emerald-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                      <MapPin size={20} />
                    </div>
                    <div className="text-left">
                      <span className="block font-black uppercase text-[10px] tracking-widest text-emerald-950">{cityName}</span>
                      <span className="block text-[8px] font-bold text-emerald-500 uppercase tracking-widest">Alterar Cidade</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-emerald-300" />
                </button>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-950/30 ml-4">Navegação Principal</span>
                {menuLinks.map((link) => (
                  <button
                    key={link.path}
                    onClick={() => { navigate(link.path); onClose(); }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-emerald-50 text-emerald-950 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                      <link.icon size={20} />
                    </div>
                    <span className="font-black uppercase text-xs tracking-widest">{link.label}</span>
                  </button>
                ))}
                
                <button
                  onClick={() => { onOpenFreeRegistration(); onClose(); }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                    <Plus size={20} />
                  </div>
                  <span className="font-black uppercase text-xs tracking-widest">Cadastro Grátis</span>
                </button>
              </div>

              <div className="px-2">
                <button 
                  onClick={() => { navigate('/planos'); onClose(); }}
                  className="w-full flex items-center gap-4 p-5 rounded-[2rem] bg-emerald-600 text-white shadow-xl shadow-emerald-600/20 hover:scale-[1.02] active:scale-95 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
                    <Star size={20} className="fill-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80 leading-none mb-1">Quer mais clientes?</p>
                    <p className="text-xs font-black uppercase tracking-widest">Anuncie Aqui</p>
                  </div>
                </button>
              </div>

            <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-950/30 dark:text-emerald-100/20 ml-4">Preferências</span>
                {!pushEnabled && (
                  <button
                    onClick={onEnablePush}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-emerald-600 text-white shadow-lg active:scale-95 transition-all mt-2"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <Bell size={20} />
                    </div>
                    <span className="font-black uppercase text-xs tracking-widest">Ativar Notificações</span>
                  </button>
                )}
              </div>
            </div>

            <div className="p-8 border-t border-emerald-50 dark:border-emerald-800">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-white font-black text-xl">G</div>
                  <div className="text-left">
                    <p className="text-xs font-black uppercase tracking-tight text-emerald-950 dark:text-emerald-50">Guia Digital</p>
                    <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">v1.0.0 Stable</p>
                  </div>
               </div>
            </div>
          </MotionDiv>
        </div>
      )}
    </AnimatePresence>
  );
};

// --- Welcome Screen (Splash) ---

const FreeRegistrationModal = ({ isOpen, onClose, currentCity }: { isOpen: boolean, onClose: () => void, currentCity: string }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    phone: '',
    category: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('free_registrations')
        .insert([{
          city: currentCity,
          company_name: formData.companyName,
          phone: formData.phone,
          category: formData.category,
          address: formData.address
        }]);

      if (error) throw error;
      setSuccess(true);
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      alert('Erro ao realizar cadastro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4">
      <MotionDiv
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-emerald-950/60 backdrop-blur-md"
      />
      <MotionDiv
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-md bg-white dark:bg-emerald-950 rounded-[2.5rem] shadow-4xl overflow-hidden p-8"
      >
        <div className="flex justify-between items-center mb-8">
          <div className="text-left">
            <h3 className="text-2xl font-black text-emerald-950 dark:text-emerald-50 uppercase tracking-tight">Cadastro Grátis</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mt-1">Sua empresa no guia local</p>
          </div>
          <button onClick={onClose} className="p-3 bg-emerald-50 dark:bg-emerald-900 rounded-2xl text-emerald-600 dark:text-emerald-400 active:scale-90 transition-transform">
            <X size={20} />
          </button>
        </div>

        {success ? (
          <div className="text-center py-10 space-y-6">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center text-emerald-600 mx-auto">
              <CheckCircle2 size={40} />
            </div>
            <div>
              <h4 className="text-xl font-black text-emerald-950 dark:text-emerald-50 uppercase">Solicitação Enviada!</h4>
              <p className="text-xs font-medium text-emerald-900/50 dark:text-emerald-100/40 mt-2">Nossa equipe analisará os dados e publicará em breve.</p>
            </div>
            <div className="pt-6 space-y-3">
              <button 
                onClick={() => { onClose(); navigate('/planos'); }}
                className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Star size={14} className="fill-white/20" />
                Migrar para Plano Premium
              </button>
              <button onClick={onClose} className="w-full py-4 text-emerald-600 font-black uppercase text-[10px] tracking-widest">Fechar</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/30 dark:text-emerald-100/20 ml-2">Nome da Empresa</label>
              <input 
                required
                type="text"
                value={formData.companyName}
                onChange={e => setFormData({...formData, companyName: e.target.value})}
                className="w-full p-4 bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-50 dark:border-emerald-800 rounded-2xl outline-none focus:border-emerald-500 transition-all text-emerald-950 dark:text-emerald-50 font-bold"
                placeholder="Ex: Padaria do João"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/30 dark:text-emerald-100/20 ml-2">Telefone de Contato</label>
              <input 
                required
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full p-4 bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-50 dark:border-emerald-800 rounded-2xl outline-none focus:border-emerald-500 transition-all text-emerald-950 dark:text-emerald-50 font-bold"
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/30 dark:text-emerald-100/20 ml-2">Categoria no Guia</label>
              <input 
                required
                type="text"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full p-4 bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-50 dark:border-emerald-800 rounded-2xl outline-none focus:border-emerald-500 transition-all text-emerald-950 dark:text-emerald-50 font-bold"
                placeholder="Ex: Alimentação, Saúde..."
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/30 dark:text-emerald-100/20 ml-2">Endereço Básico</label>
              <input 
                required
                type="text"
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
                className="w-full p-4 bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-50 dark:border-emerald-800 rounded-2xl outline-none focus:border-emerald-500 transition-all text-emerald-950 dark:text-emerald-50 font-bold"
                placeholder="Rua, Número, Bairro"
              />
            </div>

            <div className="pt-4 space-y-3">
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Cadastrar Gratuitamente'}
              </button>
              
              <button 
                type="button"
                onClick={() => { onClose(); navigate('/planos'); }}
                className="w-full py-4 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl font-black uppercase text-[10px] tracking-widest border border-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Star size={14} className="fill-amber-500/20" />
                Migrar para Plano Premium
              </button>
            </div>
          </form>
        )}
      </MotionDiv>
    </div>
  );
};

const CitySelectorModal = ({ isOpen, onClose, onSelect, currentCity }: { isOpen: boolean, onClose: () => void, onSelect: (city: string) => void, currentCity: string }) => {
  const navigate = useNavigate();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4">
      <MotionDiv
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-emerald-950/60 backdrop-blur-md"
      />
      <MotionDiv
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-md bg-white dark:bg-emerald-950 rounded-[2.5rem] shadow-4xl overflow-hidden p-8"
      >
        <div className="flex justify-between items-center mb-8">
          <div className="text-left">
            <h3 className="text-2xl font-black text-emerald-950 dark:text-emerald-50 uppercase tracking-tight">Alterar Cidade</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mt-1">Selecione o guia local</p>
          </div>
          <button onClick={onClose} className="p-3 bg-emerald-50 dark:bg-emerald-900 rounded-2xl text-emerald-600 dark:text-emerald-400 active:scale-90 transition-transform">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
          {SUPPORTED_CITIES.map((city) => (
            <button
              key={city.id}
              onClick={() => { onSelect(city.id); onClose(); }}
              className={`group relative w-full p-5 rounded-2xl transition-all active:scale-[0.98] text-left flex items-center justify-between border-2 ${currentCity === city.id ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-emerald-50/50 dark:bg-emerald-900/20 border-transparent hover:border-emerald-500/30'}`}
            >
              <div>
                <h3 className={`font-black uppercase tracking-widest text-sm ${currentCity === city.id ? 'text-white' : 'text-emerald-950 dark:text-emerald-50'}`}>{city.name}</h3>
                <p className={`text-[9px] font-black uppercase tracking-widest ${currentCity === city.id ? 'text-white/60' : 'text-emerald-500/40'}`}>{city.state}</p>
              </div>
              {currentCity === city.id ? (
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
                  <Check size={16} strokeWidth={3} />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <ChevronRight size={16} />
                </div>
              )}
            </button>
          ))}
        </div>

        <button 
          onClick={() => {
            onClose();
            navigate('/planos');
          }}
          className="mt-6 w-full py-4 bg-amber-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Star size={14} className="fill-white/20" />
          Seja um Parceiro
        </button>
      </MotionDiv>
    </div>
  );
};

const WelcomeScreen = ({ onComplete, selectedCity, onCitySelect }: { onComplete: () => void, selectedCity: string, onCitySelect: (city: string) => void }) => {
  const [step, setStep] = useState(selectedCity ? 'splash' : 'select');
  const navigate = useNavigate();

  useEffect(() => {
    if (step === 'splash') {
      const timer = setTimeout(() => {
        onComplete();
      }, 3800);
      return () => clearTimeout(timer);
    }
  }, [onComplete, step]);

  const handleCitySelect = (cityId: string) => {
    onCitySelect(cityId);
    setStep('splash');
  };

  return (
    <MotionDiv
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(40px)' }}
      transition={{ duration: 1.2, ease: [0.43, 0.13, 0.23, 0.96] }}
      className="fixed inset-0 z-[3000] bg-[#ccff00] flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Immersive Atmospheric Background (Recipe 7 Inspired) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,_rgba(16,185,129,0.3)_0%,_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_80%,_rgba(16,185,129,0.2)_0%,_transparent_50%)]" />
        
        <MotionDiv
          animate={{ 
            x: [0, 100, -100, 0], 
            y: [0, -120, 80, 0], 
            scale: [1, 1.4, 0.9, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-20%] left-[-20%] w-[800px] md:w-[1200px] h-[800px] md:h-[1200px] bg-white/40 rounded-full blur-[150px] md:blur-[200px]"
        />
        
        <MotionDiv
          animate={{ 
            x: [0, -80, 80, 0], 
            y: [0, 100, -120, 0],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-25%] right-[-25%] w-[900px] md:w-[1300px] h-[900px] md:h-[1300px] bg-emerald-400/30 rounded-full blur-[180px] md:blur-[250px]"
        />
        
        {/* Noise Texture Overlay for Modern Feel */}
        <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none" />
        
        {/* Scanline Effect */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20" />
      </div>

      <div className="relative z-10 w-full max-w-2xl px-6 flex flex-col items-center text-center py-10 my-auto">
        {step === 'select' ? (
          <MotionDiv
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="w-full flex flex-col"
          >
            <div className="mb-12 shrink-0">
              <MotionDiv
                initial={{ scale: 0.7, opacity: 0, rotate: -10 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ duration: 1.2, type: "spring", bounce: 0.4 }}
              >
                <AppLogo size="md" animate={false} />
              </MotionDiv>
              
              <MotionDiv
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-12"
              >
                <h2 className="text-emerald-950 text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9]">
                  Sua Cidade, <br/>
                  <span className="text-emerald-700 italic drop-shadow-[0_0_20px_rgba(5,150,105,0.2)]">Seu Guia.</span>
                </h2>
                <p className="text-emerald-900/40 text-[11px] font-black uppercase tracking-[0.5em] mt-6">Selecione para começar</p>
              </MotionDiv>
            </div>
            
            <div className="grid grid-cols-1 gap-5 w-full max-h-[50vh] overflow-y-auto pr-3 custom-scrollbar pb-8 px-2">
              {SUPPORTED_CITIES.map((city, idx) => (
                <MotionDiv
                  key={city.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + idx * 0.12, ease: "easeOut" }}
                >
                  <button
                    onClick={() => handleCitySelect(city.id)}
                    className="group relative w-full p-7 bg-white/40 hover:bg-white/60 backdrop-blur-xl border border-white/20 hover:border-emerald-500/50 rounded-[2rem] transition-all active:scale-[0.96] text-left flex items-center justify-between overflow-hidden shadow-xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1500" />
                    
                    <div className="relative z-10">
                      <h3 className="text-emerald-950 font-black uppercase tracking-[0.15em] text-lg">{city.name}</h3>
                      <p className="text-emerald-700/60 text-[10px] font-black uppercase tracking-widest mt-2">{city.state}</p>
                    </div>
                    
                    <div className="relative z-10 w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white group-hover:rotate-[15deg] transition-all duration-700 shadow-xl shadow-emerald-500/0 group-hover:shadow-emerald-500/30">
                      <ChevronRight size={24} strokeWidth={3} />
                    </div>
                  </button>
                </MotionDiv>
              ))}
            </div>
            
            <MotionDiv
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="mt-8 flex flex-col items-center gap-8"
            >
              <div className="flex items-center gap-4">
                <div className="h-[1px] w-12 bg-emerald-950/10" />
                <p className="text-emerald-950/40 text-[11px] font-bold uppercase tracking-[0.3em]">Explore o Comércio Local</p>
                <div className="h-[1px] w-12 bg-emerald-950/10" />
              </div>

              <button 
                onClick={() => {
                  onComplete();
                  navigate('/planos');
                }}
                className="group relative w-full py-6 bg-gradient-to-br from-amber-400 via-orange-500 to-red-600 text-white rounded-[2.5rem] font-black uppercase text-xs tracking-[0.25em] shadow-[0_20px_40px_rgba(245,158,11,0.2)] active:scale-95 transition-all flex items-center justify-center gap-4 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-700" />
                <Star size={20} className="relative z-10 fill-white/30" />
                <span className="relative z-10">Seja um Parceiro</span>
              </button>
            </MotionDiv>
          </MotionDiv>
        ) : (
          <div className="flex flex-col items-center">
            <MotionDiv
              initial={{ opacity: 0, scale: 0.2, rotate: -30, y: 50 }}
              animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
              transition={{ 
                duration: 1.5, 
                type: "spring", 
                bounce: 0.4,
                ease: "easeOut"
              }}
              className="perspective-[1500px]"
            >
              <AppLogo size="lg" animate={true} />
            </MotionDiv>
            
            <MotionDiv 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="mt-20 space-y-10 flex flex-col items-center"
            >
              <div className="relative group">
                <MotionDiv
                  initial={{ scale: 3, opacity: 0, filter: 'blur(30px)', skewX: -30 }}
                  animate={{ scale: 1, opacity: 1, filter: 'blur(0px)', skewX: -12 }}
                  transition={{ 
                    duration: 1, 
                    delay: 0.9,
                    type: "spring",
                    damping: 10,
                    stiffness: 80
                  }}
                  className="relative"
                >
                  <h2 className="text-emerald-950 text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none text-center drop-shadow-[0_15px_30px_rgba(0,0,0,0.1)]">
                    {SUPPORTED_CITIES.find(c => c.id === selectedCity)?.name || 'Guia Digital'}
                  </h2>
                </MotionDiv>
                
                <MotionDiv
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.5, duration: 1.5, ease: "circOut" }}
                  className="absolute -bottom-6 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-emerald-600 to-transparent origin-center shadow-[0_0_30px_rgba(5,150,105,0.3)]"
                />
              </div>

              <div className="flex flex-col items-center gap-6">
                <div className="flex items-center justify-center gap-5">
                  <MotionDiv 
                    animate={{ scale: [1, 1.8, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                    className="w-2 h-2 bg-emerald-600 rounded-full shadow-[0_0_10px_rgba(5,150,105,1)]" 
                  />
                  <p className="text-emerald-900 text-xs md:text-base font-black uppercase tracking-[0.7em] ml-3">Sincronizando Dados</p>
                  <MotionDiv 
                    animate={{ scale: [1, 1.8, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.8, repeat: Infinity, delay: 0.6 }}
                    className="w-2 h-2 bg-emerald-600 rounded-full shadow-[0_0_10px_rgba(5,150,105,1)]" 
                  />
                </div>
                
                {/* Modern Progress Bar */}
                <div className="w-64 h-1.5 bg-emerald-950/10 rounded-full overflow-hidden relative border border-emerald-950/5">
                  <MotionDiv
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-600 to-transparent"
                  />
                </div>
              </div>
            </MotionDiv>

            <MotionDiv 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5 }}
              className="absolute bottom-12 flex flex-col items-center gap-3"
            >
              <div className="flex items-center gap-3 opacity-20">
                <div className="w-1 h-1 bg-emerald-950 rounded-full" />
                <div className="w-1 h-1 bg-emerald-950 rounded-full" />
                <div className="w-1 h-1 bg-emerald-950 rounded-full" />
              </div>
              <p className="text-emerald-950/20 text-[10px] font-black uppercase tracking-[0.4em]">Bernardino na Net • v1.2.1</p>
            </MotionDiv>
          </div>
        )}
      </div>
    </MotionDiv>
  );
};

// --- Page Components ---

const BannerCarousel = ({ banners, currentCity }: { banners: Banner[], currentCity: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const activeBanners = banners.filter(b => 
    b.active && (b.city === currentCity || b.city === 'all')
  ).sort((a, b) => a.order - b.order);

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeBanners.length]);

  if (activeBanners.length === 0) return null;

  const next = () => setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);

  return (
    <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] md:aspect-[3/1] lg:aspect-[4/1] rounded-[1.5rem] md:rounded-[3rem] overflow-hidden mb-12 group shadow-2xl">
      <AnimatePresence mode="wait">
        <MotionDiv
          key={currentIndex}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(_e: any, info: any) => {
            if (info.offset.x > 50) prev();
            else if (info.offset.x < -50) next();
          }}
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
        >
          {activeBanners[currentIndex].link ? (
            <a href={activeBanners[currentIndex].link} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
              <img src={activeBanners[currentIndex].imageUrl} alt="Banner" className="w-full h-full object-cover pointer-events-none" />
            </a>
          ) : (
            <img src={activeBanners[currentIndex].imageUrl} alt="Banner" className="w-full h-full object-cover pointer-events-none" />
          )}
        </MotionDiv>
      </AnimatePresence>

      {activeBanners.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/20 hover:bg-black/40 backdrop-blur-md text-white rounded-full opacity-0 md:group-hover:opacity-100 transition-opacity hidden md:flex">
            <ChevronLeft size={24} />
          </button>
          <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/20 hover:bg-black/40 backdrop-blur-md text-white rounded-full opacity-0 md:group-hover:opacity-100 transition-opacity hidden md:flex">
            <ChevronRight size={24} />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
            {activeBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all ${currentIndex === idx ? 'bg-white w-8' : 'bg-white/40 w-2'}`}
                aria-label={`Ir para slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const HomePage = ({ companies, alerts, banners, favorites, toggleFavorite, currentCity, onChangeCity, isAdmin, onEditAlert, onDeleteAlert, onOpenFreeRegistration, onShare, isRefreshing }: any) => {
  const [search, setSearch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const navigate = useNavigate();
  const cityName = SUPPORTED_CITIES.find(c => c.id === currentCity)?.name || 'Guia Digital';

  const categories = useMemo(() => {
    return Array.from(new Set(companies.map((c: any) => c.category))).sort();
  }, [companies]);

  const filtered = useMemo(() => {
    return companies.filter((c:any) => {
      const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = !activeCategory || c.category === activeCategory;
      return matchSearch && matchCategory;
    });
  }, [companies, searchTerm, activeCategory]);

  const handleSearch = () => {
    setSearchTerm(search);
  };

  const handleClear = () => {
    setSearch('');
    setSearchTerm('');
  };

  const isSearching = searchTerm.length > 0;

  return (
    <MotionDiv {...fadeUp} className="max-w-7xl mx-auto px-5 md:px-6 py-8 md:py-20">
      <AnimatePresence>
        {!isSearching && <BannerCarousel banners={banners} currentCity={currentCity} />}
        {!isSearching && alerts.filter((a:any) => a.active || isAdmin).map((alert:any) => (
          <MotionDiv key={alert.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 md:mb-8 overflow-hidden">
            <div className={`p-5 md:p-6 rounded-2xl md:rounded-[2rem] flex items-center justify-between gap-4 shadow-xl border ${alert.active ? 'bg-emerald-950 text-white border-emerald-800' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
              <div className="flex items-center gap-4 min-w-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${alert.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-500'}`}>
                  <Zap size={20} />
                </div>
                <div className="text-left min-w-0">
                  <h4 className="text-[10px] md:text-xs font-black uppercase tracking-widest truncate">{alert.title}</h4>
                  <p className={`text-[9px] md:text-[10px] line-clamp-1 ${alert.active ? 'text-emerald-100/40' : 'text-red-500/60'}`}>{alert.description}</p>
                </div>
              </div>
              
              {isAdmin && (
                <div className="flex items-center gap-2 shrink-0">
                  <button 
                    onClick={() => onEditAlert(alert)}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-emerald-400"
                    title="Editar Alerta"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={() => onDeleteAlert(alert.id)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-all text-red-500"
                    title="Excluir Alerta"
                  >
                    <Trash2 size={14} />
                  </button>
                  <button 
                    onClick={() => navigate('/admin')}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                    title="Gerenciar no Painel"
                  >
                    <Settings size={14} />
                  </button>
                </div>
              )}
            </div>
          </MotionDiv>
        ))}
      </AnimatePresence>

      <div className="text-center mb-10 md:mb-16">
        <AnimatePresence>
          {!isSearching && (
            <MotionDiv initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <h1 className="text-2xl md:text-5xl font-black text-emerald-950 uppercase tracking-tighter leading-tight mb-4">
                Descubra o melhor de <br className="hidden md:block" />
                <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent animate-pulse">
                  {cityName}
                </span>
              </h1>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                <MotionDiv whileHover={{ y: -5 }} whileTap={{ scale: 0.95 }}>
                  <button 
                    onClick={() => navigate('/plantao')}
                    className="group relative flex items-center gap-4 px-6 py-5 bg-red-500/10 hover:bg-red-500/20 border-2 border-red-500/20 rounded-3xl transition-all shadow-lg shadow-red-500/5 w-full overflow-hidden"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                      <HeartPulse size={24} />
                    </div>
                    <div className="text-left">
                      <span className="block text-[9px] font-black uppercase tracking-[0.2em] text-red-500/60 leading-none mb-1">Emergência</span>
                      <span className="block text-xs font-black uppercase tracking-widest text-red-600 dark:text-red-400">Farmácia de Plantão</span>
                    </div>
                  </button>
                </MotionDiv>

                <MotionDiv whileHover={{ y: -5 }} whileTap={{ scale: 0.95 }}>
                  <button 
                    onClick={() => navigate('/planos')}
                    className="group relative flex items-center gap-4 px-6 py-5 bg-amber-500/10 hover:bg-amber-500/20 border-2 border-amber-500/20 rounded-3xl transition-all shadow-lg shadow-amber-500/5 w-full overflow-hidden"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                      <Star size={24} className="fill-amber-500/20" />
                    </div>
                    <div className="text-left">
                      <span className="block text-[9px] font-black uppercase tracking-[0.2em] text-amber-500/60 leading-none mb-1">Empresas</span>
                      <span className="block text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">Seja um Parceiro</span>
                    </div>
                  </button>
                </MotionDiv>

                <MotionDiv whileHover={{ y: -5 }} whileTap={{ scale: 0.95 }}>
                  <button 
                    onClick={onChangeCity}
                    className="group relative flex items-center gap-4 px-6 py-5 bg-emerald-500/10 hover:bg-emerald-500/20 border-2 border-emerald-500/20 rounded-3xl transition-all shadow-lg shadow-emerald-500/5 w-full overflow-hidden"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                      <MapPinned size={24} />
                    </div>
                    <div className="text-left">
                      <span className="block text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500/60 leading-none mb-1">Localização</span>
                      <span className="block text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Alterar Cidade</span>
                    </div>
                  </button>
                </MotionDiv>

                <MotionDiv whileHover={{ y: -5 }} whileTap={{ scale: 0.95 }}>
                  <button 
                    onClick={onOpenFreeRegistration}
                    className="group relative flex items-center gap-4 px-6 py-5 bg-emerald-600 text-white rounded-3xl shadow-xl shadow-emerald-600/20 transition-all w-full overflow-hidden"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white shrink-0">
                      <Plus size={24} />
                    </div>
                    <div className="text-left">
                      <span className="block text-[9px] font-black uppercase tracking-[0.2em] text-white/60 leading-none mb-1">Gratuito</span>
                      <span className="block text-xs font-black uppercase tracking-widest">Cadastro Grátis</span>
                    </div>
                  </button>
                </MotionDiv>
              </div>
            </MotionDiv>
          )}
        </AnimatePresence>

        <div className="max-w-2xl mx-auto relative group">
          <div className="bg-white dark:bg-emerald-900 border border-emerald-50 dark:border-emerald-800 rounded-2xl md:rounded-[2.5rem] p-2 md:p-3 flex items-center shadow-xl md:shadow-2xl transition-all group-focus-within:ring-4 ring-emerald-500/10">
            <Search className="ml-4 md:ml-6 text-emerald-300 dark:text-emerald-600" size={24} />
            <input 
              type="text" 
              placeholder="O que você está procurando?" 
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="w-full bg-transparent py-4 md:py-5 px-3 md:px-4 outline-none text-emerald-950 dark:text-emerald-50 font-bold placeholder:text-emerald-900/20 dark:placeholder:text-emerald-50/10 text-base md:text-lg" 
            />
            <div className="flex items-center gap-2 mr-2">
              {search.length > 0 && (
                <button 
                  onClick={handleClear}
                  className="p-3 bg-emerald-50 dark:bg-emerald-800 rounded-2xl text-emerald-400 hover:text-emerald-600 transition-colors"
                  title="Limpar"
                >
                  <X size={20} />
                </button>
              )}
              <button 
                onClick={handleSearch}
                className="px-6 md:px-8 py-4 md:py-5 bg-emerald-600 text-white rounded-xl md:rounded-[1.8rem] font-black uppercase text-[10px] md:text-xs tracking-widest shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 active:scale-95 transition-all"
              >
                Pesquisar
              </button>
            </div>
          </div>
          
          {isSearching && (
            <MotionDiv 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 flex items-center justify-center gap-4"
            >
              <p className="text-xs font-black uppercase tracking-widest text-emerald-950/40 dark:text-emerald-100/20">
                Mostrando resultados para: <span className="text-emerald-600">"{searchTerm}"</span>
              </p>
              <button 
                onClick={handleClear}
                className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all"
              >
                Limpar Pesquisa
              </button>
            </MotionDiv>
          )}
        </div>
      </div>

      <QuickFilters 
        activeCategory={activeCategory} 
        onSelectCategory={setActiveCategory} 
        categories={categories} 
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-24 md:mb-32">
        {isRefreshing && filtered.length === 0 ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-emerald-50 space-y-6">
              <Skeleton className="w-full aspect-square rounded-[2rem]" />
              <div className="space-y-3">
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-6 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-20 rounded-xl" />
                </div>
              </div>
            </div>
          ))
        ) : filtered.length === 0 && isSearching ? (
          <div className="col-span-full py-20 text-center">
            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-300 dark:text-emerald-700 mx-auto mb-6">
              <Search size={40} />
            </div>
            <h3 className="text-xl font-black text-emerald-950 dark:text-emerald-50 uppercase tracking-tight">Nenhum resultado encontrado</h3>
            <p className="text-xs font-bold text-emerald-900/40 dark:text-emerald-100/20 uppercase tracking-widest mt-2">Tente buscar por outro termo ou categoria</p>
            <button 
              onClick={handleClear}
              className="mt-8 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-600/20 active:scale-95 transition-all"
            >
              Limpar Pesquisa e Voltar
            </button>
          </div>
        ) : (
          filtered.map((company: any) => (
            <MotionDiv 
              key={company.id} 
              whileHover={{ y: -8 }}
              onClick={() => navigate(`/empresa/${company.id}`)}
              className="group bg-gradient-to-br from-white to-emerald-50/30 dark:from-emerald-900/20 dark:to-emerald-950/40 border border-emerald-100/50 dark:border-emerald-800/50 p-5 md:p-6 rounded-[2rem] md:rounded-[2.5rem] cursor-pointer shadow-sm hover:shadow-2xl hover:from-emerald-50/50 hover:to-white dark:hover:from-emerald-800/20 dark:hover:to-emerald-900/40 active:scale-[0.98] transition-all relative"
            >
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(company.id);
                }}
                className={`p-3 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110 active:scale-95 ${favorites.includes(company.id) ? 'bg-red-500 text-white' : 'bg-white/80 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400'}`}
              >
                <Heart size={18} className={favorites.includes(company.id) ? 'fill-white' : ''} />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onShare(company);
                }}
                className="p-3 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110 active:scale-95 bg-white/80 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400"
              >
                <Share size={18} />
              </button>
            </div>
              <div className="w-full aspect-square bg-white rounded-[1.5rem] md:rounded-[2rem] mb-5 md:mb-6 flex items-center justify-center border border-emerald-50 group-hover:border-emerald-200 shadow-inner transition-all overflow-hidden relative">
                <img src={company.logo} alt={company.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 relative z-10" loading="lazy" />
              </div>
              <div className="space-y-1.5 md:space-y-2 text-left">
                <span className="text-[7px] md:text-[8px] font-black uppercase text-emerald-500 tracking-[0.2em]">{company.category}</span>
                <h3 className="text-lg md:text-xl font-black text-emerald-950 dark:text-emerald-50 uppercase truncate leading-tight">{company.name}</h3>
                <div className="flex items-center gap-2 pt-1 md:pt-2">
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-emerald-50 dark:bg-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Phone size={12} className="md:w-3.5 md:h-3.5" />
                  </div>
                  <span className="text-[10px] md:text-xs font-bold text-emerald-900/60 dark:text-emerald-100/30">{company.phone}</span>
                </div>
              </div>
            </MotionDiv>
          ))
        )}
      </div>
    </MotionDiv>
  );
};

const DetailsPage = ({ companies, favorites, toggleFavorite, onShare }: any) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const company = companies.find((c: any) => c.id === id);

  if (!company) return (
    <div className="flex flex-col items-center justify-center py-20">
      <AlertTriangle size={48} className="text-amber-500 mb-4" />
      <h2 className="text-2xl font-black uppercase text-emerald-950 dark:text-emerald-50">Empresa não encontrada</h2>
      <button onClick={() => navigate('/')} className="mt-6 text-emerald-600 font-bold uppercase tracking-widest">Voltar ao Início</button>
    </div>
  );

  return (
    <MotionDiv {...fadeUp} className="max-w-4xl mx-auto px-6 py-12 md:py-20">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-emerald-600 font-black uppercase text-[10px] tracking-widest mb-8 hover:gap-3 transition-all">
        <ArrowLeft size={16} /> Voltar
      </button>

      <div className="bg-white border border-emerald-50 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="aspect-video bg-gray-100 flex items-center justify-center relative overflow-hidden">
          <img src={company.logo} alt={company.name} className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-30 scale-110" />
          <img src={company.logo} alt={company.name} className="max-w-full max-h-full object-contain relative z-10 p-8 md:p-12" />
        </div>

        <div className="p-8 md:p-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.3em] mb-2 block">{company.category}</span>
              <h1 className="text-3xl md:text-5xl font-black text-emerald-950 uppercase tracking-tighter leading-none">{company.name}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button 
                onClick={() => toggleFavorite(company.id)}
                className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 ${favorites.includes(company.id) ? 'bg-red-500 text-white shadow-xl shadow-red-500/20' : 'bg-emerald-50 text-emerald-600'}`}
              >
                <Heart size={20} className={favorites.includes(company.id) ? 'fill-white' : ''} />
                {favorites.includes(company.id) ? 'Favoritado' : 'Favoritar'}
              </button>
              <button 
                onClick={() => onShare(company)}
                className="flex items-center gap-3 px-6 py-4 bg-emerald-50 text-emerald-600 rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95"
              >
                <Share size={20} />
                Compartilhar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-950/30 mb-4">Sobre</h3>
                <p className="text-emerald-900/70 leading-relaxed font-medium">
                  {company.description || 'Nenhuma descrição disponível para esta empresa.'}
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-950/30 mb-4">Localização</h3>
                <div className="flex items-start gap-4 p-5 bg-emerald-50/50 rounded-2xl border border-emerald-50 mb-4">
                  <MapPin className="text-emerald-500 shrink-0" size={20} />
                  <p className="text-xs font-bold text-emerald-900 uppercase tracking-wide leading-relaxed">
                    {company.address || 'Endereço não informado'}
                  </p>
                </div>

                {company.address && (
                  <div className="space-y-4">
                    <div className="w-full aspect-video md:aspect-[16/9] rounded-3xl overflow-hidden border-4 border-white dark:border-emerald-800 shadow-2xl relative group">
                      <iframe
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(company.address + ', ' + (SUPPORTED_CITIES.find(c => c.id === company.city)?.name || ''))}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                        className="grayscale-[0.2] contrast-[1.1] brightness-[1.05]"
                      ></iframe>
                    </div>
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(company.address + ', ' + (SUPPORTED_CITIES.find(c => c.id === company.city)?.name || ''))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-4 bg-emerald-50 dark:bg-emerald-800/50 text-emerald-600 dark:text-emerald-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-100 transition-all"
                    >
                      <MapPinned size={16} /> Abrir no Google Maps
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-950/30 dark:text-emerald-100/20 mb-4">Canais de Contato</h3>
              
              <a 
                href={getWhatsAppLink(company.phone)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between p-6 bg-emerald-600 text-white rounded-3xl shadow-xl shadow-emerald-600/20 hover:scale-[1.02] active:scale-95 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                    <MessageCircle size={24} />
                  </div>
                  <div className="text-left">
                    <span className="block text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">WhatsApp</span>
                    <span className="block text-sm font-black uppercase tracking-widest">Conversar Agora</span>
                  </div>
                </div>
                <ChevronRight size={20} className="opacity-40 group-hover:translate-x-1 transition-transform" />
              </a>

              <a 
                href={`tel:${company.phone}`} 
                className="flex items-center justify-between p-6 bg-white dark:bg-emerald-800 border-2 border-emerald-50 dark:border-emerald-700 rounded-3xl hover:border-emerald-200 transition-all active:scale-[0.98] group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <PhoneCall size={24} />
                  </div>
                  <div className="text-left">
                    <span className="block text-[10px] font-black uppercase tracking-widest text-emerald-950/30 dark:text-emerald-100/20 mb-1">Telefone</span>
                    <span className="block text-sm font-black uppercase tracking-widest text-emerald-950 dark:text-emerald-50">{company.phone}</span>
                  </div>
                </div>
                <ChevronRight size={20} className="text-emerald-200 group-hover:translate-x-1 transition-transform" />
              </a>

              <div className="flex gap-4 pt-4">
                {company.social?.instagram && (
                  <a href={getSocialUrl('instagram', company.social.instagram)!} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-3 p-4 bg-gradient-to-br from-purple-600 to-pink-500 text-white rounded-2xl shadow-lg active:scale-95 transition-all">
                    <Instagram size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Instagram</span>
                  </a>
                )}
                {company.social?.facebook && (
                  <a href={getSocialUrl('facebook', company.social.facebook)!} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-3 p-4 bg-blue-600 text-white rounded-2xl shadow-lg active:scale-95 transition-all">
                    <Facebook size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Facebook</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MotionDiv>
  );
};

const FavoritesPage = ({ companies, favorites, toggleFavorite }: any) => {
  const navigate = useNavigate();
  const favoriteCompanies = companies.filter((c: any) => favorites.includes(c.id));

  return (
    <MotionDiv {...fadeUp} className="max-w-7xl mx-auto px-6 py-12 md:py-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-20">
        <div className="text-left">
          <h1 className="text-4xl md:text-7xl font-black text-emerald-950 dark:text-emerald-50 uppercase tracking-tighter leading-none mb-4">Seus <br /><span className="text-emerald-600">Favoritos</span></h1>
          <p className="text-xs font-black uppercase tracking-[0.4em] text-emerald-950/30 dark:text-emerald-100/20">Empresas que você salvou</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/40 px-6 py-4 rounded-2xl border border-emerald-100 dark:border-emerald-800">
          <span className="text-2xl font-black text-emerald-600">{favoriteCompanies.length}</span>
          <span className="ml-2 text-[10px] font-black uppercase tracking-widest text-emerald-950/40 dark:text-emerald-100/40">Salvos</span>
        </div>
      </div>

      {favoriteCompanies.length === 0 ? (
        <div className="bg-white dark:bg-emerald-900/20 border-2 border-dashed border-emerald-100 dark:border-emerald-800 rounded-[3rem] py-32 flex flex-col items-center text-center px-6">
          <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950 rounded-full flex items-center justify-center text-emerald-200 mb-6">
            <Heart size={40} />
          </div>
          <h3 className="text-xl font-black uppercase text-emerald-950 dark:text-emerald-50 tracking-tight mb-2">Sua lista está vazia</h3>
          <p className="text-xs font-bold text-emerald-950/40 dark:text-emerald-100/20 uppercase tracking-widest mb-8">Favorite empresas para encontrá-las rapidamente aqui</p>
          <button 
            onClick={() => navigate('/')}
            className="px-10 py-5 bg-emerald-600 text-white rounded-full font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-600/20 active:scale-95 transition-all"
          >
            Explorar Guia
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {favoriteCompanies.map((company: any) => (
            <MotionDiv 
              key={company.id} 
              whileHover={{ y: -8 }}
              onClick={() => navigate(`/empresa/${company.id}`)}
              className="group bg-white dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 p-6 rounded-[2.5rem] cursor-pointer shadow-sm hover:shadow-2xl transition-all relative"
            >
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(company.id);
                }}
                className="absolute top-4 left-4 z-10 p-3 bg-red-500 text-white rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all"
              >
                <Heart size={18} className="fill-white" />
              </button>
              <div className="w-full aspect-square bg-emerald-50 dark:bg-emerald-950/50 rounded-[2rem] mb-6 flex items-center justify-center p-6 border border-emerald-50 dark:border-emerald-800/50 group-hover:border-emerald-200 transition-all overflow-hidden">
                <img src={company.logo} alt={company.name} className="max-w-[85%] max-h-[85%] object-contain mix-blend-multiply dark:mix-blend-normal transform group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="space-y-2 text-left">
                <span className="text-[8px] font-black uppercase text-emerald-500 tracking-[0.2em]">{company.category}</span>
                <h3 className="text-xl font-black text-emerald-950 dark:text-emerald-50 uppercase truncate">{company.name}</h3>
                <div className="flex items-center gap-2 pt-2">
                  <Phone size={14} className="text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-900/40 dark:text-emerald-100/30">{company.phone}</span>
                </div>
              </div>
            </MotionDiv>
          ))}
        </div>
      )}
    </MotionDiv>
  );
};

const PlantaoPage = ({ onCall }: { onCall: OnCallDuty | null }) => {
  const navigate = useNavigate();

  return (
    <MotionDiv {...fadeUp} className="max-w-4xl mx-auto px-6 py-12 md:py-20">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 mb-8">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Plantão 24 Horas</span>
        </div>
        <h1 className="text-4xl md:text-7xl font-black text-emerald-950 dark:text-emerald-50 uppercase tracking-tighter leading-none mb-6">Farmácia de <br /><span className="text-red-600">Plantão</span></h1>
        <p className="text-xs font-black uppercase tracking-[0.4em] text-emerald-950/30 dark:text-emerald-100/20">Informações atualizadas diariamente</p>
      </div>

      {onCall ? (
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-br from-red-500/20 to-emerald-500/20 blur-3xl opacity-30 rounded-[4rem]" />
          <div className="relative bg-white dark:bg-emerald-900/20 border border-emerald-50 dark:border-emerald-800 rounded-[3rem] p-8 md:p-16 shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
              <HeartPulse size={240} />
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-red-500 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-red-500/40 mb-10 rotate-3">
                <HeartPulse size={48} />
              </div>

              <h2 className="text-3xl md:text-5xl font-black text-emerald-950 dark:text-emerald-50 uppercase tracking-tight mb-4">{onCall.pharmacyName}</h2>
              
              <div className="flex items-center gap-4 mb-12">
                <div className="h-[1px] w-8 bg-emerald-100 dark:bg-emerald-800" />
                <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                  <MapPin size={14} /> {onCall.address}
                </p>
                <div className="h-[1px] w-8 bg-emerald-100 dark:bg-emerald-800" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                <a 
                  href={`tel:${onCall.phone}`}
                  className="flex items-center justify-center gap-4 p-6 bg-white dark:bg-emerald-800 border-2 border-emerald-50 dark:border-emerald-700 rounded-3xl hover:border-emerald-200 transition-all active:scale-95 group"
                >
                  <PhoneCall className="text-emerald-500 group-hover:scale-110 transition-transform" size={24} />
                  <div className="text-left">
                    <span className="block text-[10px] font-black uppercase tracking-widest text-emerald-950/30 dark:text-emerald-100/20 leading-none mb-1">Ligar Agora</span>
                    <span className="block text-sm font-black uppercase tracking-widest text-emerald-950 dark:text-emerald-50">{onCall.phone}</span>
                  </div>
                </a>

                <a 
                  href={getWhatsAppLink(onCall.phone, `Olá! Vi no Guia que vocês estão de plantão hoje.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-4 p-6 bg-emerald-600 text-white rounded-3xl shadow-xl shadow-emerald-600/20 hover:scale-[1.02] active:scale-95 transition-all group"
                >
                  <MessageCircle className="group-hover:scale-110 transition-transform" size={24} />
                  <div className="text-left">
                    <span className="block text-[10px] font-black uppercase tracking-widest opacity-70 leading-none mb-1">WhatsApp</span>
                    <span className="block text-sm font-black uppercase tracking-widest">Conversar</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-emerald-900/20 border-2 border-dashed border-emerald-100 dark:border-emerald-800 rounded-[3rem] py-32 flex flex-col items-center text-center px-6">
          <Loader2 className="animate-spin text-emerald-200 mb-6" size={48} />
          <h3 className="text-xl font-black uppercase text-emerald-950 dark:text-emerald-50 tracking-tight">Buscando informações...</h3>
        </div>
      )}

      <div className="mt-20 p-8 bg-emerald-50/50 dark:bg-emerald-900/20 rounded-[2rem] border border-emerald-100 dark:border-emerald-800 flex flex-col md:flex-row items-center gap-8">
        <div className="w-16 h-16 bg-white dark:bg-emerald-800 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0 shadow-sm">
          <Info size={32} />
        </div>
        <div className="text-left">
          <h4 className="text-sm font-black uppercase text-emerald-950 dark:text-emerald-50 tracking-widest mb-2">Sobre o Plantão</h4>
          <p className="text-[11px] font-medium text-emerald-900/60 dark:text-emerald-100/40 leading-relaxed">
            O plantão farmacêutico é rotativo e obrigatório. As informações exibidas aqui são fornecidas pelos órgãos competentes da cidade. Em caso de dúvidas, entre em contato diretamente com a farmácia.
          </p>
        </div>
      </div>
    </MotionDiv>
  );
};

const PlansPage = ({ adminPhone }: { adminPhone: string }) => {
  const plans = [
    {
      name: 'Plano Único Premium',
      price: '29,90',
      features: [
        'Logomarca em Destaque',
        'Link Direto WhatsApp',
        'Redes Sociais Completas',
        'Descrição Detalhada',
        'Prioridade Máxima na Busca',
        'Banner Rotativo no Topo',
        'Notificações de Alerta',
        'Suporte Prioritário 24h',
        'Estatísticas de Acessos'
      ],
      highlight: true,
      icon: Rocket
    }
  ];

  return (
    <MotionDiv {...fadeUp} className="max-w-7xl mx-auto px-6 py-12 md:py-20">
      <div className="text-center mb-20">
        <h1 className="text-4xl md:text-7xl font-black text-emerald-950 dark:text-emerald-50 uppercase tracking-tighter leading-none mb-6">Plano <br /><span className="text-emerald-600">Parceiro</span></h1>
        <p className="text-xs font-black uppercase tracking-[0.4em] text-emerald-950/30 dark:text-emerald-100/20">Todas as funcionalidades por um preço único</p>
      </div>

      <div className="flex justify-center">
        {plans.map((plan) => (
          <div 
            key={plan.name}
            className="relative w-full max-w-xl p-8 md:p-16 rounded-[3rem] border-2 transition-all hover:scale-[1.01] flex flex-col bg-emerald-950 border-emerald-500 shadow-3xl shadow-emerald-500/20 text-white"
          >
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
              Melhor Custo-Benefício
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-3xl bg-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-500/20">
                  <plan.icon size={40} />
                </div>
                <div className="text-left">
                  <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-none">{plan.name}</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mt-2">Acesso Total ao App</p>
                </div>
              </div>
              <div className="text-left md:text-right">
                <span className="text-emerald-500 text-sm font-black uppercase">R$</span>
                <span className="text-5xl font-black ml-1">{plan.price}</span>
                <span className="text-emerald-500/60 text-[10px] font-black uppercase block">Mensal</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 mb-16">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check size={14} strokeWidth={4} />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider opacity-90">{feature}</span>
                </div>
              ))}
            </div>

            <a 
              href={getWhatsAppLink(adminPhone, `Olá! Gostaria de contratar o Plano Único de R$ 29,90 do Guia.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-6 bg-emerald-500 text-white rounded-[2rem] font-black uppercase text-sm tracking-widest text-center transition-all active:scale-95 shadow-2xl shadow-emerald-500/40 hover:bg-emerald-400 flex items-center justify-center gap-3"
            >
              <Rocket size={20} /> Contratar Agora
            </a>
          </div>
        ))}
      </div>

      <div className="mt-24 p-12 bg-white dark:bg-emerald-900/20 rounded-[3rem] border border-emerald-50 dark:border-emerald-800 text-center max-w-4xl mx-auto">
        <h3 className="text-2xl font-black uppercase text-emerald-950 dark:text-emerald-50 mb-6">Dúvidas sobre os planos?</h3>
        <p className="text-sm font-medium text-emerald-900/40 dark:text-emerald-100/40 mb-10 leading-relaxed">
          Nossa equipe está pronta para ajudar você a escolher a melhor opção para o seu negócio. Entre em contato agora mesmo pelo WhatsApp e tire todas as suas dúvidas.
        </p>
        <a 
          href={getWhatsAppLink(adminPhone)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-4 px-12 py-6 bg-emerald-600 text-white rounded-full font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all"
        >
          <MessageCircle size={20} /> Falar com Consultor
        </a>
      </div>
    </MotionDiv>
  );
};

const AboutPage = () => {
  return (
    <MotionDiv {...fadeUp} className="max-w-4xl mx-auto px-6 py-12 md:py-20">
      <div className="text-center mb-20">
        <AppLogo size="lg" animate />
        <h1 className="text-4xl md:text-7xl font-black text-emerald-950 dark:text-emerald-50 uppercase tracking-tighter leading-none mt-10 mb-6">Quem <br /><span className="text-emerald-600">Somos</span></h1>
        <p className="text-xs font-black uppercase tracking-[0.4em] text-emerald-950/30 dark:text-emerald-100/20">Conectando pessoas e negócios locais</p>
      </div>

      <div className="space-y-12">
        <div className="bg-white dark:bg-emerald-900/20 border border-emerald-50 dark:border-emerald-800 rounded-[3rem] p-8 md:p-16 shadow-2xl">
          <h2 className="text-2xl font-black uppercase text-emerald-950 dark:text-emerald-50 mb-8 flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white"><Globe size={20} /></div>
            Nossa Missão
          </h2>
          <p className="text-lg font-medium text-emerald-900/60 dark:text-emerald-100/60 leading-relaxed">
            O Guia Digital Regional nasceu com o propósito de modernizar a forma como os moradores encontram serviços e comércios em suas cidades. Em um mundo cada vez mais digital, acreditamos que o acesso à informação local deve ser rápido, intuitivo e gratuito para todos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-50 dark:border-emerald-800 rounded-[2.5rem] p-10">
            <div className="w-12 h-12 bg-white dark:bg-emerald-800 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm mb-6">
              <Zap size={24} />
            </div>
            <h3 className="text-xl font-black uppercase text-emerald-950 dark:text-emerald-50 mb-4">Tecnologia</h3>
            <p className="text-xs font-medium text-emerald-900/50 dark:text-emerald-100/40 leading-relaxed">
              Utilizamos as tecnologias mais modernas de desenvolvimento web para garantir uma experiência fluida, segura e rápida em qualquer dispositivo.
            </p>
          </div>

          <div className="bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-50 dark:border-emerald-800 rounded-[2.5rem] p-10">
            <div className="w-12 h-12 bg-white dark:bg-emerald-800 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm mb-6">
              <HeartPulse size={24} />
            </div>
            <h3 className="text-xl font-black uppercase text-emerald-950 dark:text-emerald-50 mb-4">Comunidade</h3>
            <p className="text-xs font-medium text-emerald-900/50 dark:text-emerald-100/40 leading-relaxed">
              Mais do que um guia, somos uma ferramenta de apoio à economia local, ajudando pequenos e grandes empresários a serem vistos.
            </p>
          </div>
        </div>

        <div className="text-center pt-12">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-950/20 dark:text-emerald-100/10 mb-8">Desenvolvido com paixão por</p>
          <div className="flex items-center justify-center gap-6">
            <div className="w-12 h-12 bg-emerald-950 rounded-2xl flex items-center justify-center text-emerald-400">
              <Code2 size={24} />
            </div>
            <div className="text-left">
              <p className="text-sm font-black uppercase tracking-tight text-emerald-950 dark:text-emerald-50">Equipe Guia Digital</p>
              <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Soluções Tecnológicas Regionais</p>
            </div>
          </div>
        </div>
      </div>
    </MotionDiv>
  );
};

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate('/admin');
    } catch (err: any) {
      setError(err.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MotionDiv {...fadeUp} className="max-w-md mx-auto px-6 py-20 md:py-32 relative">
      <div className="absolute top-8 left-6">
        <Link 
          to="/"
          className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-100 transition-all active:scale-95"
        >
          <Home size={14} />
          Início
        </Link>
      </div>
      <div className="text-center mb-12">
        <AppLogo size="md" animate />
        <h1 className="text-3xl font-black text-emerald-950 dark:text-emerald-50 uppercase tracking-tighter mt-8 mb-2">Acesso Restrito</h1>
        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60">Painel de Administração</p>
      </div>

      <div className="bg-white dark:bg-emerald-900/20 border border-emerald-50 dark:border-emerald-800 rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40 dark:text-emerald-100/20 ml-4">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-300" size={18} />
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-emerald-50/50 dark:bg-emerald-950/50 border border-emerald-50 dark:border-emerald-800 rounded-2xl py-4 pl-14 pr-6 outline-none focus:ring-4 ring-emerald-500/10 text-emerald-950 dark:text-emerald-50 font-bold transition-all"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40 dark:text-emerald-100/20 ml-4">Senha</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-300" size={18} />
              <input 
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-emerald-50/50 dark:bg-emerald-950/50 border border-emerald-50 dark:border-emerald-800 rounded-2xl py-4 pl-14 pr-14 outline-none focus:ring-4 ring-emerald-500/10 text-emerald-950 dark:text-emerald-50 font-bold transition-all"
                placeholder="••••••••"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-emerald-300 hover:text-emerald-500 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <MotionDiv initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-500 text-[10px] font-black uppercase tracking-widest text-center">
              {error}
            </MotionDiv>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-600/20 hover:bg-emerald-500 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
            {loading ? 'Autenticando...' : 'Entrar no Painel'}
          </button>
        </form>
      </div>

      <button onClick={() => navigate('/')} className="w-full mt-10 text-[10px] font-black uppercase tracking-widest text-emerald-950/20 dark:text-emerald-100/10 hover:text-emerald-500 transition-colors flex items-center justify-center gap-2">
        <ArrowLeft size={14} /> Voltar para o Site
      </button>
    </MotionDiv>
  );
};

const AdminModal = ({ type, item, onClose, onSave, currentCity }: { type: 'company' | 'banner' | 'alert', item: any, onClose: () => void, onSave: () => void, currentCity: string }) => {
  const [loading, setLoading] = useState(false);
  const [logo, setLogo] = useState<string>(item?.logo || item?.imageUrl || '');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setLogo(base64);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    
    try {
      let data: any = {};
      let table = '';

      if (type === 'company') {
        table = 'companies';
        data = {
          name: formData.get('name'),
          phone: formData.get('phone'),
          category: formData.get('category'),
          description: formData.get('description'),
          address: formData.get('address'),
          logo: logo,
          is_featured: formData.get('isFeatured') === 'on',
          city: formData.get('city') || currentCity,
          social: {
            whatsapp: formData.get('phone'), // Usually same as phone
            instagram: formData.get('instagram'),
            facebook: formData.get('facebook')
          }
        };
      } else if (type === 'banner') {
        table = 'banners';
        data = {
          image_url: logo,
          link: formData.get('link'),
          active: formData.get('active') === 'on',
          order_index: parseInt(formData.get('order') as string) || 0,
          city: formData.get('isGlobal') === 'on' ? 'all' : currentCity
        };
      } else if (type === 'alert') {
        table = 'alerts';
        data = {
          title: formData.get('title'),
          description: formData.get('description'),
          link: formData.get('link'),
          active: formData.get('active') === 'on',
          city: formData.get('city') || currentCity
        };
      }

      console.log(`Salvando em ${table}:`, data);

      let error;
      if (item?.id) {
        ({ error } = await supabase.from(table).update(data).eq('id', item.id));
      } else {
        ({ error } = await supabase.from(table).insert([data]));
      }

      if (error) {
        console.error(`Erro ao salvar em ${table}:`, error);
        throw error;
      }
      onSave();
    } catch (err: any) {
      console.error('Erro completo:', err);
      alert('Erro ao salvar: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <MotionDiv
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-emerald-950/40 backdrop-blur-md cursor-pointer"
    >
      <MotionDiv
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        className="bg-white dark:bg-emerald-900 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[3rem] shadow-2xl border border-white/10 p-8 md:p-12 relative cursor-default"
      >
        <button onClick={onClose} className="absolute top-8 right-8 p-3 bg-emerald-50 dark:bg-emerald-800 rounded-2xl text-emerald-600 dark:text-emerald-400 hover:scale-110 active:scale-90 transition-all">
          <X size={24} />
        </button>

        <h2 className="text-3xl font-black uppercase text-emerald-950 dark:text-emerald-50 mb-8">
          {item ? 'Editar' : 'Novo'} {type === 'company' ? 'Empresa' : type === 'banner' ? 'Banner' : 'Alerta'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {type === 'company' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40 dark:text-emerald-100/20 ml-4">Nome da Empresa</label>
                  <input type="text" name="name" defaultValue={item?.name} required className="w-full bg-emerald-50/50 dark:bg-emerald-950/50 border border-emerald-50 dark:border-emerald-800 rounded-2xl py-4 px-6 outline-none focus:ring-4 ring-emerald-500/10 text-emerald-950 dark:text-emerald-50 font-bold transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40 dark:text-emerald-100/20 ml-4">Telefone/WhatsApp</label>
                  <input type="text" name="phone" defaultValue={item?.phone} required className="w-full bg-emerald-50/50 dark:bg-emerald-950/50 border border-emerald-50 dark:border-emerald-800 rounded-2xl py-4 px-6 outline-none focus:ring-4 ring-emerald-500/10 text-emerald-950 dark:text-emerald-50 font-bold transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40 dark:text-emerald-100/20 ml-4">Instagram (Opcional)</label>
                  <input type="text" name="instagram" defaultValue={item?.social?.instagram} placeholder="@usuario" className="w-full bg-emerald-50/50 dark:bg-emerald-950/50 border border-emerald-50 dark:border-emerald-800 rounded-2xl py-4 px-6 outline-none focus:ring-4 ring-emerald-500/10 text-emerald-950 dark:text-emerald-50 font-bold transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40 dark:text-emerald-100/20 ml-4">Facebook (Opcional)</label>
                  <input type="text" name="facebook" defaultValue={item?.social?.facebook} placeholder="usuario.face" className="w-full bg-emerald-50/50 dark:bg-emerald-950/50 border border-emerald-50 dark:border-emerald-800 rounded-2xl py-4 px-6 outline-none focus:ring-4 ring-emerald-500/10 text-emerald-950 dark:text-emerald-50 font-bold transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40 dark:text-emerald-100/20 ml-4">Categoria</label>
                  <input type="text" name="category" defaultValue={item?.category} required className="w-full bg-emerald-50/50 dark:bg-emerald-950/50 border border-emerald-50 dark:border-emerald-800 rounded-2xl py-4 px-6 outline-none focus:ring-4 ring-emerald-500/10 text-emerald-950 dark:text-emerald-50 font-bold transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40 dark:text-emerald-100/20 ml-4">Cidade</label>
                  <select name="city" defaultValue={item?.city || currentCity} className="w-full bg-emerald-50/50 dark:bg-emerald-950/50 border border-emerald-50 dark:border-emerald-800 rounded-2xl py-4 px-6 outline-none focus:ring-4 ring-emerald-500/10 text-emerald-950 dark:text-emerald-50 font-bold transition-all appearance-none">
                    {SUPPORTED_CITIES.map(city => (
                      <option key={city.id} value={city.id}>{city.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40 dark:text-emerald-100/20 ml-4">Descrição</label>
                <textarea name="description" defaultValue={item?.description} className="w-full bg-emerald-50/50 dark:bg-emerald-950/50 border border-emerald-50 dark:border-emerald-800 rounded-2xl py-4 px-6 outline-none focus:ring-4 ring-emerald-500/10 text-emerald-950 dark:text-emerald-50 font-bold transition-all h-32" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40 dark:text-emerald-100/20 ml-4">Endereço</label>
                <input type="text" name="address" defaultValue={item?.address} className="w-full bg-emerald-50/50 dark:bg-emerald-950/50 border border-emerald-50 dark:border-emerald-800 rounded-2xl py-4 px-6 outline-none focus:ring-4 ring-emerald-500/10 text-emerald-950 dark:text-emerald-50 font-bold transition-all" />
              </div>
              <div className="flex items-center gap-4 p-4 bg-emerald-50/50 dark:bg-emerald-950/50 rounded-2xl border border-emerald-50 dark:border-emerald-800">
                <input type="checkbox" name="isFeatured" defaultChecked={item?.isFeatured} className="w-6 h-6 rounded-lg accent-emerald-600" />
                <span className="text-xs font-black uppercase tracking-widest text-emerald-950 dark:text-emerald-50">Destaque na Página Inicial</span>
              </div>
            </>
          )}

          {type === 'banner' && (
            <>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40 dark:text-emerald-100/20 ml-4">Link do Banner (Opcional)</label>
                <input type="text" name="link" defaultValue={item?.link} className="w-full bg-emerald-50/50 dark:bg-emerald-950/50 border border-emerald-50 dark:border-emerald-800 rounded-2xl py-4 px-6 outline-none focus:ring-4 ring-emerald-500/10 text-emerald-950 dark:text-emerald-50 font-bold transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40 dark:text-emerald-100/20 ml-4">Ordem de Exibição</label>
                  <input type="number" name="order" defaultValue={item?.order || 0} className="w-full bg-emerald-50/50 dark:bg-emerald-950/50 border border-emerald-50 dark:border-emerald-800 rounded-2xl py-4 px-6 outline-none focus:ring-4 ring-emerald-500/10 text-emerald-950 dark:text-emerald-50 font-bold transition-all" />
                </div>
                <div className="flex flex-col justify-center gap-4">
                  <div className="flex items-center gap-4">
                    <input type="checkbox" name="active" defaultChecked={item?.active ?? true} className="w-6 h-6 rounded-lg accent-emerald-600" />
                    <span className="text-xs font-black uppercase tracking-widest text-emerald-950 dark:text-emerald-50">Ativo</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <input type="checkbox" name="isGlobal" defaultChecked={item?.city === 'all'} className="w-6 h-6 rounded-lg accent-emerald-600" />
                    <span className="text-xs font-black uppercase tracking-widest text-emerald-950 dark:text-emerald-50">Banner Global (Todas as Cidades)</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {type === 'alert' && (
            <>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40 dark:text-emerald-100/20 ml-4">Título do Alerta</label>
                <input type="text" name="title" defaultValue={item?.title} required className="w-full bg-emerald-50/50 dark:bg-emerald-950/50 border border-emerald-50 dark:border-emerald-800 rounded-2xl py-4 px-6 outline-none focus:ring-4 ring-emerald-500/10 text-emerald-950 dark:text-emerald-50 font-bold transition-all" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40 dark:text-emerald-100/20 ml-4">Descrição Curta</label>
                  <input type="text" name="description" defaultValue={item?.description} className="w-full bg-emerald-50/50 dark:bg-emerald-950/50 border border-emerald-50 dark:border-emerald-800 rounded-2xl py-4 px-6 outline-none focus:ring-4 ring-emerald-500/10 text-emerald-950 dark:text-emerald-50 font-bold transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40 dark:text-emerald-100/20 ml-4">Cidade</label>
                  <select name="city" defaultValue={item?.city || currentCity} className="w-full bg-emerald-50/50 dark:bg-emerald-950/50 border border-emerald-50 dark:border-emerald-800 rounded-2xl py-4 px-6 outline-none focus:ring-4 ring-emerald-500/10 text-emerald-950 dark:text-emerald-50 font-bold transition-all appearance-none">
                    {SUPPORTED_CITIES.map(city => (
                      <option key={city.id} value={city.id}>{city.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40 dark:text-emerald-100/20 ml-4">Link (Opcional)</label>
                <input type="text" name="link" defaultValue={item?.link} className="w-full bg-emerald-50/50 dark:bg-emerald-950/50 border border-emerald-50 dark:border-emerald-800 rounded-2xl py-4 px-6 outline-none focus:ring-4 ring-emerald-500/10 text-emerald-950 dark:text-emerald-50 font-bold transition-all" />
              </div>
              <div className="flex items-center gap-4 p-4 bg-emerald-50/50 dark:bg-emerald-950/50 rounded-2xl border border-emerald-50 dark:border-emerald-800">
                <input type="checkbox" name="active" defaultChecked={item?.active ?? true} className="w-6 h-6 rounded-lg accent-emerald-600" />
                <span className="text-xs font-black uppercase tracking-widest text-emerald-950 dark:text-emerald-50">Alerta Ativo</span>
              </div>
            </>
          )}

          {type !== 'alert' && (
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40 dark:text-emerald-100/20 ml-4">Imagem / Logo</label>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-full sm:w-32 h-48 sm:h-32 bg-white rounded-2xl border-2 border-dashed border-emerald-200 flex items-center justify-center overflow-hidden shrink-0">
                  {logo ? <img src={logo} alt="Preview" className="w-full h-full object-cover" /> : <ImageIcon className="text-emerald-200" size={32} />}
                </div>
                <div className="flex-grow w-full">
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="admin-file-upload" />
                  <label htmlFor="admin-file-upload" className="flex items-center justify-center sm:inline-flex gap-3 px-6 py-4 bg-emerald-50 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-400 rounded-2xl font-black uppercase text-[10px] tracking-widest cursor-pointer hover:bg-emerald-100 transition-all w-full sm:w-auto">
                    <Upload size={18} /> Selecionar Imagem
                  </label>
                  <p className="text-[9px] text-emerald-900/40 dark:text-emerald-100/20 mt-2 font-bold uppercase tracking-widest text-center sm:text-left">Formatos aceitos: JPG, PNG, WEBP</p>
                </div>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-6 bg-emerald-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-emerald-600/20 hover:bg-emerald-500 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {loading ? 'Salvando...' : 'Salvar Informações'}
          </button>
        </form>
      </MotionDiv>
    </MotionDiv>
  );
};

const AdminDashboard = ({ companies, alerts, settings, notifications, onCall, banners, onRefresh, isRefreshing, openModal, handleDelete, isModalOpen, setIsModalOpen, modalType, editingItem, showToast }: any) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [freeRegistrations, setFreeRegistrations] = useState<any[]>([]);
  const navigate = useNavigate();

  const statsData = useMemo(() => {
    const categories = Array.from(new Set(companies.map((c: any) => c.category)));
    const categoryCounts = categories.map(cat => ({
      name: cat,
      value: companies.filter((c: any) => c.category === cat).length
    })).sort((a, b) => b.value - a.value).slice(0, 5);

    const monthlyData = [
      { name: 'Jan', acessos: 400, cliques: 240 },
      { name: 'Fev', acessos: 300, cliques: 139 },
      { name: 'Mar', acessos: 200, cliques: 980 },
      { name: 'Abr', acessos: 278, cliques: 390 },
      { name: 'Mai', acessos: 189, cliques: 480 },
      { name: 'Jun', acessos: 239, cliques: 380 },
    ];

    return { categoryCounts, monthlyData };
  }, [companies]);

  useEffect(() => {
    fetchFreeRegistrations();
  }, []);

  const fetchFreeRegistrations = async () => {
    const { data, error } = await supabase
      .from('free_registrations')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setFreeRegistrations(data);
    }
  };

  const handleApprove = async (reg: any) => {
    if (!confirm(`Deseja aprovar "${reg.company_name}" e publicar no guia?`)) return;
    setLoading(true);
    try {
      // 1. Inserir na tabela companies
      const { error: insertError } = await supabase
        .from('companies')
        .insert([{
          city: reg.city,
          name: reg.company_name,
          phone: reg.phone,
          category: reg.category,
          address: reg.address,
          logo: 'https://picsum.photos/seed/business/400/400', // Logo padrão
          is_featured: false
        }]);
      
      if (insertError) throw insertError;

      // 2. Atualizar status para approved
      const { error: updateError } = await supabase
        .from('free_registrations')
        .update({ status: 'approved' })
        .eq('id', reg.id);
      
      if (updateError) throw updateError;

      showToast('Empresa aprovada e publicada com sucesso!');
      fetchFreeRegistrations();
      onRefresh();
    } catch (err: any) {
      showToast('Erro ao aprovar: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Deseja recusar esta solicitação?')) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('free_registrations')
        .update({ status: 'rejected' })
        .eq('id', id);
      
      if (error) throw error;
      showToast('Solicitação recusada.');
      fetchFreeRegistrations();
    } catch (err: any) {
      showToast('Erro ao recusar: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleSaveOnCall = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const data = {
      pharmacy_name: formData.get('pharmacyName'),
      phone: formData.get('phone'),
      address: formData.get('address'),
      city: settings.city,
      updated_at: new Date().toISOString()
    };

    setLoading(true);
    try {
      let error;
      if (onCall?.id) {
        ({ error } = await supabase.from('on_call').update(data).eq('id', onCall.id));
      } else {
        ({ error } = await supabase.from('on_call').insert([data]));
      }
      if (error) throw error;
      showToast('Plantão atualizado com sucesso!');
      onRefresh();
    } catch (err: any) {
      showToast('Erro ao salvar: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const data = {
      phone: formData.get('phone'),
      email: formData.get('email'),
      address: formData.get('address'),
      social: {
        whatsapp: formData.get('whatsapp'),
        instagram: formData.get('instagram'),
        facebook: formData.get('facebook')
      },
      city: settings.city
    };

    setLoading(true);
    try {
      let error;
      if (settings?.id) {
        ({ error } = await supabase.from('admin_settings').update(data).eq('id', settings.id));
      } else {
        ({ error } = await supabase.from('admin_settings').insert([data]));
      }
      if (error) throw error;
      showToast('Configurações atualizadas com sucesso!');
      onRefresh();
    } catch (err: any) {
      showToast('Erro ao salvar: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'companies', label: 'Empresas', icon: Database },
    { id: 'requests', label: 'Solicitações', icon: PlusCircle },
    { id: 'banners', label: 'Banners', icon: ImageIcon },
    { id: 'alerts', label: 'Alertas', icon: Megaphone },
    { id: 'oncall', label: 'Plantão', icon: HeartPulse },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 md:mb-20">
        <div className="text-left">
          <div className="flex items-center gap-4 mb-6">
            <Link 
              to="/"
              className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-100 transition-all active:scale-95"
            >
              <Home size={14} />
              Início
            </Link>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-emerald-950 uppercase tracking-tighter leading-none mb-4">Painel <br /><span className="text-emerald-600">Administrativo</span></h1>
          <p className="text-xs font-black uppercase tracking-[0.4em] text-emerald-950/30">Gerencie o conteúdo do guia</p>
        </div>
        
        <div className="flex items-center gap-3">
          <a 
            href={getWhatsAppLink(settings.phone, 'Olá! Preciso de suporte no Painel Administrativo.')}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-6 py-4 bg-emerald-50 text-emerald-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-emerald-100 transition-all active:scale-95"
          >
            <MessageCircle size={20} /> Suporte
          </a>
          <button 
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-4 bg-white dark:bg-emerald-900 border border-emerald-50 dark:border-emerald-800 rounded-2xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 transition-all active:scale-90 disabled:opacity-50"
          >
            <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-6 py-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95"
          >
            <LogOut size={20} /> Sair
          </button>
        </div>
      </div>

      <div className="flex gap-3 mb-12 overflow-x-auto no-scrollbar pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-8 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all whitespace-nowrap active:scale-95 ${activeTab === tab.id ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20' : 'bg-white dark:bg-emerald-900/20 text-emerald-950/40 dark:text-emerald-100/20 border border-emerald-50 dark:border-emerald-800 hover:border-emerald-200'}`}
          >
            <tab.icon size={18} />
            {tab.label}
            {tab.id === 'requests' && freeRegistrations.length > 0 && (
              <span className="bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full animate-pulse">
                {freeRegistrations.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-emerald-900/20 border border-emerald-50 dark:border-emerald-800 rounded-[3rem] p-8 md:p-12 shadow-2xl min-h-[600px]">
        {activeTab === 'overview' && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-8 bg-emerald-600 rounded-[2.5rem] text-white shadow-xl shadow-emerald-600/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Users size={24} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">+12% este mês</span>
                </div>
                <h3 className="text-4xl font-black mb-1">{companies.length}</h3>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Empresas Cadastradas</p>
              </div>

              <div className="p-8 bg-white border border-emerald-50 rounded-[2.5rem] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                    <MousePointer2 size={24} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">+5% hoje</span>
                </div>
                <h3 className="text-4xl font-black text-emerald-950 mb-1">1.284</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-950/30">Cliques no WhatsApp</p>
              </div>

              <div className="p-8 bg-white border border-emerald-50 rounded-[2.5rem] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                    <BarChart3 size={24} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Meta: 80%</span>
                </div>
                <h3 className="text-4xl font-black text-emerald-950 mb-1">8.420</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-950/30">Acessos Totais</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="p-8 bg-white border border-emerald-50 rounded-[3rem] shadow-sm">
                <h3 className="text-sm font-black uppercase tracking-widest text-emerald-950 mb-8">Desempenho Mensal</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={statsData.monthlyData}>
                      <defs>
                        <linearGradient id="colorAcessos" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#059669" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0fdf4" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#064e3b'}} dy={10} />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                      />
                      <Area type="monotone" dataKey="acessos" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorAcessos)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="p-8 bg-white border border-emerald-50 rounded-[3rem] shadow-sm">
                <h3 className="text-sm font-black uppercase tracking-widest text-emerald-950 mb-8">Top Categorias</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statsData.categoryCounts} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0fdf4" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 8, fontWeight: 900, fill: '#064e3b'}} width={80} />
                      <Tooltip 
                        cursor={{fill: '#f0fdf4'}}
                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                      />
                      <Bar dataKey="value" fill="#059669" radius={[0, 10, 10, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
              <div className="p-8 bg-white border border-emerald-50 rounded-[3rem] shadow-sm">
                <h3 className="text-sm font-black uppercase tracking-widest text-emerald-950 mb-8">Atividade Recente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { title: 'Nova empresa cadastrada', time: 'Há 2 horas', city: 'Bernardino de Campos', icon: Plus },
                    { title: 'Banner atualizado', time: 'Há 5 horas', city: 'Santa Cruz do Rio Pardo', icon: ImageIcon },
                    { title: 'Alerta de plantão enviado', time: 'Há 8 horas', city: 'Ourinhos', icon: Megaphone },
                    { title: 'Configurações alteradas', time: 'Há 1 dia', city: 'Geral', icon: Settings },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-emerald-50/30 rounded-2xl border border-emerald-50/50">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                        <item.icon size={18} />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-black uppercase text-emerald-950">{item.title}</p>
                        <p className="text-[10px] font-bold text-emerald-950/30 uppercase tracking-widest">{item.time} • {item.city}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'companies' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black uppercase text-emerald-950 dark:text-emerald-50">Empresas Cadastradas</h2>
              <button 
                onClick={() => openModal('company')}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
              >
                <Plus size={16} /> Nova Empresa
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {companies.map((company: any) => (
                <div key={company.id} className="flex items-center justify-between p-6 bg-emerald-50/50 dark:bg-emerald-950/50 rounded-2xl border border-emerald-50 dark:border-emerald-800 group hover:border-emerald-200 transition-all">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white dark:bg-emerald-900 rounded-xl flex items-center justify-center p-3 border border-emerald-50 dark:border-emerald-800">
                      <img src={company.logo} alt="" className="max-w-full max-h-full object-contain" />
                    </div>
                    <div className="text-left">
                      <span className="text-[8px] font-black uppercase text-emerald-500 tracking-widest">{company.category}</span>
                      <h4 className="text-lg font-black uppercase text-emerald-950 dark:text-emerald-50">{company.name}</h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => openModal('company', company)}
                      className="p-3 bg-white dark:bg-emerald-800 border border-emerald-50 dark:border-emerald-700 rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all active:scale-90 shadow-sm"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete('companies', company.id)}
                      className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-90 shadow-sm"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-8">
            <div className="text-left">
              <h2 className="text-2xl font-black uppercase text-emerald-950 dark:text-emerald-50">Solicitações Pendentes</h2>
              <p className="text-xs font-bold text-emerald-500/60 uppercase tracking-widest mt-1">Cadastros gratuitos aguardando revisão</p>
            </div>
            
            {freeRegistrations.length === 0 ? (
              <div className="py-20 text-center bg-emerald-50/30 dark:bg-emerald-950/20 rounded-[2rem] border border-dashed border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="mx-auto text-emerald-200 mb-4" size={48} />
                <p className="text-emerald-950/40 dark:text-emerald-100/20 font-black uppercase text-xs tracking-widest">Nenhuma solicitação pendente</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {freeRegistrations.map((reg) => (
                  <div key={reg.id} className="p-6 bg-emerald-50/50 dark:bg-emerald-950/50 rounded-2xl border border-emerald-50 dark:border-emerald-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="text-left space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[8px] font-black uppercase tracking-widest rounded-md">{reg.category}</span>
                        <span className="text-[8px] font-black uppercase text-emerald-950/30 dark:text-emerald-100/20 tracking-widest">{new Date(reg.created_at).toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-lg font-black uppercase text-emerald-950 dark:text-emerald-50">{reg.company_name}</h4>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-bold text-emerald-900/60 dark:text-emerald-100/40 uppercase tracking-widest">
                        <span className="flex items-center gap-1"><Phone size={12} /> {reg.phone}</span>
                        <span className="flex items-center gap-1"><MapPin size={12} /> {reg.address}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button 
                        onClick={() => handleApprove(reg)}
                        disabled={loading}
                        className="flex-grow md:flex-grow-0 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50"
                      >
                        <Check size={16} /> Aprovar
                      </button>
                      <button 
                        onClick={() => handleReject(reg.id)}
                        disabled={loading}
                        className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-90 shadow-sm disabled:opacity-50"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'banners' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black uppercase text-emerald-950 dark:text-emerald-50">Banners Rotativos</h2>
              <button 
                onClick={() => openModal('banner')}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
              >
                <Plus size={16} /> Novo Banner
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {banners.map((banner: any) => (
                <div key={banner.id} className="bg-emerald-50/50 dark:bg-emerald-950/50 rounded-[2rem] border border-emerald-50 dark:border-emerald-800 overflow-hidden group">
                  <div className="aspect-video relative">
                    <img src={banner.imageUrl} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <button 
                        onClick={() => openModal('banner', banner)}
                        className="p-4 bg-white rounded-2xl text-emerald-600 hover:scale-110 transition-transform"
                      >
                        <Edit2 size={24} />
                      </button>
                      <button 
                        onClick={() => handleDelete('banners', banner.id)}
                        className="p-4 bg-red-500 rounded-2xl text-white hover:scale-110 transition-transform"
                      >
                        <Trash2 size={24} />
                      </button>
                    </div>
                  </div>
                  <div className="p-6 flex justify-between items-center">
                    <div className="text-left">
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40 dark:text-emerald-100/20">Ordem: {banner.order}</p>
                      <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{banner.active ? 'Ativo' : 'Inativo'}</p>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${banner.active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-8">
             <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black uppercase text-emerald-950 dark:text-emerald-50">Alertas do Topo</h2>
              <button 
                onClick={() => openModal('alert')}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
              >
                <Plus size={16} /> Novo Alerta
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {alerts.map((alert: any) => (
                <div key={alert.id} className="flex items-center justify-between p-6 bg-emerald-50/50 dark:bg-emerald-950/50 rounded-2xl border border-emerald-50 dark:border-emerald-800">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-emerald-950 rounded-xl flex items-center justify-center text-emerald-400">
                      <Megaphone size={20} />
                    </div>
                    <div className="text-left">
                      <h4 className="text-lg font-black uppercase text-emerald-950 dark:text-emerald-50">{alert.title}</h4>
                      <p className="text-xs font-bold text-emerald-900/40 dark:text-emerald-100/20 uppercase tracking-widest">{alert.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => openModal('alert', alert)}
                      className="p-3 bg-white dark:bg-emerald-800 border border-emerald-50 dark:border-emerald-700 rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all active:scale-90 shadow-sm"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete('alerts', alert.id)}
                      className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-90 shadow-sm"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'oncall' && (
          <div className="space-y-12 max-w-2xl mx-auto py-10">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-500 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-red-500/40 mx-auto mb-8">
                <HeartPulse size={40} />
              </div>
              <h2 className="text-3xl font-black uppercase text-emerald-950 dark:text-emerald-50 tracking-tight mb-2">Farmácia de Plantão</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60">Atualize o plantão da cidade</p>
            </div>

            <form onSubmit={handleSaveOnCall} className="space-y-6">
               <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40 dark:text-emerald-100/20 ml-4">Nome da Farmácia</label>
                <input 
                  type="text" 
                  name="pharmacyName"
                  defaultValue={onCall?.pharmacyName}
                  className="w-full bg-emerald-50/50 dark:bg-emerald-950/50 border border-emerald-50 dark:border-emerald-800 rounded-2xl py-4 px-6 outline-none focus:ring-4 ring-emerald-500/10 text-emerald-950 dark:text-emerald-50 font-bold transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40 dark:text-emerald-100/20 ml-4">Telefone</label>
                <input 
                  type="text" 
                  name="phone"
                  defaultValue={onCall?.phone}
                  className="w-full bg-emerald-50/50 dark:bg-emerald-950/50 border border-emerald-50 dark:border-emerald-800 rounded-2xl py-4 px-6 outline-none focus:ring-4 ring-emerald-500/10 text-emerald-950 dark:text-emerald-50 font-bold transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40 dark:text-emerald-100/20 ml-4">Endereço</label>
                <input 
                  type="text" 
                  name="address"
                  defaultValue={onCall?.address}
                  className="w-full bg-emerald-50/50 dark:bg-emerald-950/50 border border-emerald-50 dark:border-emerald-800 rounded-2xl py-4 px-6 outline-none focus:ring-4 ring-emerald-500/10 text-emerald-950 dark:text-emerald-50 font-bold transition-all"
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-600/20 hover:bg-emerald-500 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-12 max-w-2xl mx-auto py-10">
            <div className="text-center">
              <div className="w-20 h-20 bg-emerald-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-emerald-600/20 mx-auto mb-8">
                <Settings size={40} />
              </div>
              <h2 className="text-3xl font-black uppercase text-emerald-950 dark:text-emerald-50 tracking-tight mb-2">Configurações Gerais</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60">Contatos e informações do rodapé</p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6">
               <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40 dark:text-emerald-100/20 ml-4">Telefone de Suporte</label>
                <input 
                  type="text" 
                  name="phone"
                  defaultValue={settings.phone}
                  className="w-full bg-emerald-50/50 dark:bg-emerald-950/50 border border-emerald-50 dark:border-emerald-800 rounded-2xl py-4 px-6 outline-none focus:ring-4 ring-emerald-500/10 text-emerald-950 dark:text-emerald-50 font-bold transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40 dark:text-emerald-100/20 ml-4">E-mail de Contato</label>
                <input 
                  type="email" 
                  name="email"
                  defaultValue={settings.email}
                  className="w-full bg-emerald-50/50 dark:bg-emerald-950/50 border border-emerald-50 dark:border-emerald-800 rounded-2xl py-4 px-6 outline-none focus:ring-4 ring-emerald-500/10 text-emerald-950 dark:text-emerald-50 font-bold transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40 dark:text-emerald-100/20 ml-4">Endereço do Rodapé</label>
                <input 
                  type="text" 
                  name="address"
                  defaultValue={settings.address}
                  className="w-full bg-emerald-50/50 dark:bg-emerald-950/50 border border-emerald-50 dark:border-emerald-800 rounded-2xl py-4 px-6 outline-none focus:ring-4 ring-emerald-500/10 text-emerald-950 dark:text-emerald-50 font-bold transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40 dark:text-emerald-100/20 ml-4">WhatsApp</label>
                  <input 
                    type="text" 
                    name="whatsapp"
                    defaultValue={settings.social.whatsapp}
                    className="w-full bg-emerald-50/50 dark:bg-emerald-950/50 border border-emerald-50 dark:border-emerald-800 rounded-2xl py-4 px-6 outline-none focus:ring-4 ring-emerald-500/10 text-emerald-950 dark:text-emerald-50 font-bold transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40 dark:text-emerald-100/20 ml-4">Instagram</label>
                  <input 
                    type="text" 
                    name="instagram"
                    defaultValue={settings.social.instagram}
                    className="w-full bg-emerald-50/50 dark:bg-emerald-950/50 border border-emerald-50 dark:border-emerald-800 rounded-2xl py-4 px-6 outline-none focus:ring-4 ring-emerald-500/10 text-emerald-950 dark:text-emerald-50 font-bold transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40 dark:text-emerald-100/20 ml-4">Facebook</label>
                  <input 
                    type="text" 
                    name="facebook"
                    defaultValue={settings.social.facebook}
                    className="w-full bg-emerald-50/50 dark:bg-emerald-950/50 border border-emerald-50 dark:border-emerald-800 rounded-2xl py-4 px-6 outline-none focus:ring-4 ring-emerald-500/10 text-emerald-950 dark:text-emerald-50 font-bold transition-all"
                  />
                </div>
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-600/20 hover:bg-emerald-500 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                {loading ? 'Salvando...' : 'Salvar Configurações'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main App Component ---

const App = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [banners, setBanners] = useState<Banner[]>(INITIAL_BANNERS);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [onCall, setOnCall] = useState<OnCallDuty | null>(null);
  const [settings, setSettings] = useState<AdminContact>({
    phone: '(14) 99755-0000',
    email: 'suporte@guiabc.com',
    address: 'Bernardino de Campos, SP • Brasil',
    social: { whatsapp: '5514997550000', instagram: '', facebook: '' },
    city: 'bernardino'
  });
  const [showWelcome, setShowWelcome] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toast, setToast] = useState<{ message: string, type?: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const handleShare = async (company: any) => {
    const shareData = {
      title: company.name,
      text: company.id ? `Confira ${company.name} no Guia Digital!` : `Confira o Guia Digital Regional! Tudo o que você precisa em um só lugar.`,
      url: company.id ? `${window.location.origin}/#/empresa/${company.id}` : window.location.origin
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        showToast('Link copiado!');
      }
    } catch (err) {
      console.error('Erro ao compartilhar:', err);
    }
  };
  const [user, setUser] = useState<any>(null);
  const theme = 'light';
  const setTheme = () => {};
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [pushEnabled, setPushEnabled] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>(() => {
    return localStorage.getItem('selectedCity') || '';
  });
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [isFreeRegistrationModalOpen, setIsFreeRegistrationModalOpen] = useState(false);

  const [showCityModal, setShowCityModal] = useState(false);

  useEffect(() => {
    if (selectedCity) {
      localStorage.setItem('selectedCity', selectedCity);
      fetchData();
    }
  }, [selectedCity]);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.getRegistration().then(reg => {
        if (reg) {
          reg.pushManager.getSubscription().then(sub => {
            setPushEnabled(!!sub);
          });
        }
      });
    }
  }, []);

  const handleEnablePush = async () => {
    const success = await subscribeUserToPush();
    if (success) {
      setPushEnabled(true);
      alert("Notificações ativadas com sucesso!");
    } else {
      alert("Não foi possível ativar as notificações. Verifique as permissões do seu navegador.");
    }
  };

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'company' | 'banner' | 'alert' | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);

  const openModal = (type: 'company' | 'banner' | 'alert', item: any = null) => {
    setModalType(type);
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (table: string, id: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;
    setIsRefreshing(true);
    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (err: any) {
      alert('Erro ao excluir: ' + err.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  const fetchData = async () => {
    if (!selectedCity) return;
    setIsRefreshing(true);
    try {
      const results = await Promise.allSettled([
        supabase.from('companies').select('*').eq('city', selectedCity).order('name'),
        supabase.from('alerts').select('*').eq('city', selectedCity).order('created_at', { ascending: false }),
        supabase.from('on_call').select('*').eq('city', selectedCity).maybeSingle(),
        supabase.from('admin_settings').select('*').eq('city', selectedCity).maybeSingle(),
        supabase.from('notifications').select('*').eq('city', selectedCity).order('created_at', { ascending: false }),
        supabase.from('banners').select('*').or(`city.eq.${selectedCity},city.eq.all`).order('order_index')
      ]);

      if (results[0].status === 'fulfilled' && results[0].value.data) {
        setCompanies(results[0].value.data.map((c:any) => ({...c, isFeatured: c.is_featured, createdAt: new Date(c.created_at).getTime()})));
      }
      if (results[1].status === 'fulfilled' && results[1].value.data) {
        setAlerts(results[1].value.data.map((a:any) => ({
          ...a, 
          imageUrl: a.image_url || a.imageUrl,
          createdAt: new Date(a.created_at || a.createdAt).getTime()
        })));
      }
      if (results[2].status === 'fulfilled' && results[2].value.data) {
        const d = results[2].value.data;
        setOnCall({...d, pharmacyName: d.pharmacy_name, updatedAt: new Date(d.updated_at).getTime()});
      }
      if (results[3].status === 'fulfilled' && results[3].value.data) {
        console.log("Configurações Admin carregadas:", results[3].value.data);
        setSettings({
          ...results[3].value.data,
          social: results[3].value.data.social || { whatsapp: '', instagram: '', facebook: '' }
        });
      }
      if (results[4].status === 'fulfilled' && results[4].value.data) setNotifications(results[4].value.data);
      if (results[5].status === 'fulfilled' && results[5].value.data) {
        setBanners(results[5].value.data.map((b:any) => ({
          ...b,
          imageUrl: b.image_url || b.imageUrl,
          order: b.order_index ?? b.order ?? 0,
          createdAt: new Date(b.created_at || b.createdAt).getTime()
        })));
      }
      
    } catch (err) {
      console.error("Erro crítico na sincronização:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (selectedCity) {
      fetchData();
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e: any, session: any) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, [selectedCity]);

  const isAdminPath = location.pathname.startsWith('/admin');
  const isLoginPage = location.pathname === '/login';

  const cityName = useMemo(() => {
    return SUPPORTED_CITIES.find(c => c.id === selectedCity)?.name || 'Cidade';
  }, [selectedCity]);

  return (
    <div className={`min-h-screen flex flex-col bg-[#fafafa] font-sans pb-safe transition-colors duration-300`}>
      <AnimatePresence mode="wait">
        {(!selectedCity || showWelcome) && (
          <WelcomeScreen 
            onComplete={() => setShowWelcome(false)} 
            selectedCity={selectedCity}
            onCitySelect={setSelectedCity}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isModalOpen && (
          <AdminModal 
            type={modalType!} 
            item={editingItem} 
            onClose={() => setIsModalOpen(false)} 
            onSave={() => { setIsModalOpen(false); fetchData(); }}
            currentCity={selectedCity}
          />
        )}
      </AnimatePresence>
      
      <SideDrawer 
        isOpen={showMenu} 
        onClose={() => setShowMenu(false)} 
        notifications={notifications}
        theme={theme}
        setTheme={setTheme}
        user={user}
        adminPhone={settings.phone}
        favoritesCount={favorites.length}
        pushEnabled={pushEnabled}
        onEnablePush={handleEnablePush}
        currentCity={selectedCity}
        onCityChange={() => setIsCityModalOpen(true)}
        onOpenFreeRegistration={() => setIsFreeRegistrationModalOpen(true)}
      />

      <AnimatePresence>
        {isCityModalOpen && (
          <CitySelectorModal 
            isOpen={isCityModalOpen} 
            onClose={() => setIsCityModalOpen(false)} 
            onSelect={setSelectedCity} 
            currentCity={selectedCity} 
          />
        )}
        {isFreeRegistrationModalOpen && (
          <FreeRegistrationModal 
            isOpen={isFreeRegistrationModalOpen} 
            onClose={() => setIsFreeRegistrationModalOpen(false)} 
            currentCity={selectedCity}
          />
        )}
      </AnimatePresence>
      
      {!showWelcome && !isAdminPath && !isLoginPage && <BackToTop />}
      
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {!showWelcome && !isAdminPath && !isLoginPage && (
        <header className="sticky top-0 z-[1000] w-full px-4 md:px-6 py-4 transition-all">
          <div className="max-w-7xl mx-auto grid grid-cols-3 items-center bg-white/70 backdrop-blur-xl border border-white/20 px-4 md:px-6 py-3 rounded-[2rem] shadow-xl">
            <div className="flex items-center">
              <button 
                onClick={() => setShowMenu(true)}
                className="w-10 h-10 md:w-12 md:h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center hover:bg-emerald-500 transition-all active:scale-90 shadow-lg shadow-emerald-600/20"
              >
                <MenuIcon className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>

            <div className="flex justify-center">
              <Link to="/" className="active:scale-95 transition-transform">
                <AppLogo size="sm" />
              </Link>
            </div>

            <div className="flex justify-end gap-2">
              <button 
                onClick={() => handleShare({ name: 'Guia Digital Regional', id: '', url: window.location.href })}
                className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center hover:bg-emerald-100 transition-all active:scale-90 shadow-sm"
                title="Compartilhar App"
              >
                <Share size={18} />
              </button>
              {location.pathname !== '/' && (
                <Link 
                  to="/"
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-100 transition-all active:scale-95"
                >
                  <Home size={14} />
                  <span className="hidden sm:inline">Início</span>
                </Link>
              )}
            </div>
          </div>
        </header>
      )}
      {/* Botão Flutuante Seja Parceiro (Mobile/Desktop) */}
      {!showWelcome && !isAdminPath && !isLoginPage && (
        <MotionDiv
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="fixed bottom-24 right-6 md:bottom-12 md:right-12 z-[150]"
        >
          <button 
            onClick={() => navigate('/planos')}
            className="flex items-center gap-3 bg-amber-500 hover:bg-amber-600 text-white px-6 py-4 rounded-full shadow-2xl shadow-amber-500/40 font-black uppercase text-xs tracking-widest active:scale-95 transition-all group"
          >
            <Star size={20} className="group-hover:rotate-12 transition-transform fill-white/20" />
            <span className="hidden sm:inline">Anuncie Aqui</span>
            <span className="sm:hidden">Anunciar</span>
          </button>
        </MotionDiv>
      )}

      <main className="flex-grow">
        {!showWelcome && (
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<HomePage companies={companies} alerts={alerts} banners={banners} favorites={favorites} toggleFavorite={toggleFavorite} currentCity={selectedCity} onChangeCity={() => setIsCityModalOpen(true)} isAdmin={!!user} onEditAlert={(item: any) => openModal('alert', item)} onDeleteAlert={(id: string) => handleDelete('alerts', id)} onOpenFreeRegistration={() => setIsFreeRegistrationModalOpen(true)} onShare={handleShare} isRefreshing={isRefreshing} />} />
              <Route path="/empresa/:id" element={<DetailsPage companies={companies} favorites={favorites} toggleFavorite={toggleFavorite} onShare={handleShare} />} />
              <Route path="/favoritos" element={<FavoritesPage companies={companies} favorites={favorites} toggleFavorite={toggleFavorite} />} />
              <Route path="/plantao" element={<PlantaoPage onCall={onCall} />} />
              <Route path="/planos" element={<PlansPage adminPhone={settings.phone} />} />
              <Route path="/sobre" element={<AboutPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/admin" element={user ? <AdminDashboard companies={companies} alerts={alerts} settings={settings} notifications={notifications} onCall={onCall} banners={banners} onRefresh={fetchData} isRefreshing={isRefreshing} openModal={openModal} handleDelete={handleDelete} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} modalType={modalType} editingItem={editingItem} showToast={showToast} /> : <Navigate to="/login" />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        )}
      </main>

      {!showWelcome && !isAdminPath && !isLoginPage && (
        <footer className="bg-white border-t border-emerald-100 py-6 px-6 text-center">
          <div className="max-w-5xl mx-auto flex flex-col items-center gap-4">
            <AppLogo size="sm" />
            
            <div className="bg-emerald-50 px-5 py-3 rounded-2xl border border-emerald-100 inline-flex flex-col items-center">
              <p className="text-emerald-600 text-[9px] font-black uppercase tracking-widest mb-1">Quer ver sua empresa aqui?</p>
              <Link 
                to="/planos"
                className="flex items-center gap-2 text-emerald-950 font-black uppercase text-[10px] hover:text-emerald-600 transition-colors"
              >
                <Award size={14} className="text-emerald-500" /> Ver Vantagens e Planos
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 pt-4 w-full border-t border-emerald-50">
              <Link to="/sobre" className="text-emerald-950/40 text-[9px] font-black uppercase tracking-widest hover:text-emerald-600 transition-colors">Quem Somos</Link>
              <Link to="/planos" className="text-emerald-950/40 text-[9px] font-black uppercase tracking-widest hover:text-emerald-600 transition-colors">Anuncie</Link>
              <Link to="/plantao" className="text-emerald-950/40 text-[9px] font-black uppercase tracking-widest hover:text-emerald-600 transition-colors">Plantão</Link>
            </div>

            <div className="space-y-1 pt-2 w-full">
              <p className="text-emerald-950/30 text-[8px] font-bold uppercase tracking-[0.3em] px-4 leading-relaxed">{settings.address}</p>
              <p className="text-emerald-950/20 text-[7px] font-bold uppercase tracking-[0.2em]">© {new Date().getFullYear()} Guia Digital • {cityName}</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

const Root = () => (
  <HashRouter>
    <App />
  </HashRouter>
);

export default Root;
