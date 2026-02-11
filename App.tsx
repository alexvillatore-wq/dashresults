
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  Cell, CartesianGrid, Legend, LabelList, PieChart, Pie
} from 'recharts';
import { 
  Briefcase, MapPin, LayoutDashboard, HeartPulse, ShieldCheck, 
  Layers, TrendingUp, ListTree, ChevronRight, ChevronLeft, Database, Eye, EyeOff, CheckSquare, Square, PlusCircle, DownloadCloud, FileText, UploadCloud, Save, RefreshCw, AlertTriangle, Download, Trash2, Maximize2, Minimize2, UserPlus, Users, LogOut, Lock, User, CloudCheck, Cloud
} from 'lucide-react';

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0 
  }).format(val);
};

const formatChartLabel = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { 
    maximumFractionDigits: 0 
  }).format(val);
};

const PILLAR_COLORS = ['#C2410C', '#1C1917', '#2563eb'];
const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const SECOVI_UNITS = ['Sede', 'Curitiba', 'Londrina', 'Maringá', 'Cascavel', 'Ponta Grossa', 'Foz do Iguaçu', 'Litoral'];
const AGENTES_UNITS = ['UNIHAB', 'INPESPAR', 'C.M.A. PR'];
const MED_UNITS = ['Curitiba', 'Londrina', 'Maringá'];

const STORAGE_KEY = 'secovi_database_v4';
const USERS_KEY = 'secovi_users_v1';
const SESSION_KEY = 'secovi_session_v1';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  
  const [users, setUsers] = useState<any[]>(() => {
    const saved = localStorage.getItem(USERS_KEY);
    if (saved) return JSON.parse(saved);
    return [{ id: 1, name: 'Administrador', login: 'admin', password: 'admin' }];
  });

  const [loginForm, setLoginForm] = useState({ login: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [newUser, setNewUser] = useState({ name: '', login: '', password: '' });

  const [activeTab, setActiveTab] = useState<'sistema' | 'secovipr' | 'agentes' | 'secovimed' | 'admin' | 'usuarios'>('sistema');
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [showSystemBreakdown, setShowSystemBreakdown] = useState(false);
  const [viewWithFinancial, setViewWithFinancial] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);

  const [selectedSecoviUnits, setSelectedSecoviUnits] = useState<string[]>(SECOVI_UNITS);
  const [selectedAgentesUnits, setSelectedAgentesUnits] = useState<string[]>(AGENTES_UNITS);
  const [selectedMedUnits, setSelectedMedUnits] = useState<string[]>(MED_UNITS);

  // MOTOR DO BANCO DE DADOS LOCAL
  const [dataStore, setDataStore] = useState<any>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) { 
        console.error("Erro ao carregar banco de dados:", e); 
      }
    }
    
    // Se não houver nada no banco, cria a estrutura vazia (ZERADA)
    const initial: any = {};
    const years = [2028, 2027, 2026, 2025, 2024, 2023, 2022, 2021, 2020];
    years.forEach(y => {
      initial[y] = {};
      MONTH_LABELS.forEach((m) => {
        initial[y][m] = {
          secovi: SECOVI_UNITS.reduce((acc, u) => ({ ...acc, [u]: { revenue: 0, expense: 0, financialRevenue: 0 } }), {}),
          agentes: AGENTES_UNITS.reduce((acc, u) => ({ ...acc, [u]: { revenue: 0, expense: 0, financialRevenue: 0 } }), {}),
          med: MED_UNITS.reduce((acc, u) => ({ ...acc, [u]: { revenue: 0, expense: 0, financialRevenue: 0 } }), {}),
        };
      });
    });
    return initial;
  });

  // Persistência Automática (Efeito de Banco de Dados)
  useEffect(() => {
    setIsSaving(true);
    const timeout = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataStore));
      setIsSaving(false);
    }, 800); // Delay curto para não travar a UI durante lançamentos rápidos
    return () => clearTimeout(timeout);
  }, [dataStore]);

  useEffect(() => { localStorage.setItem(USERS_KEY, JSON.stringify(users)); }, [users]);
  useEffect(() => {
    if (currentUser) localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
    else localStorage.removeItem(SESSION_KEY);
  }, [currentUser]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.login === loginForm.login && u.password === loginForm.password);
    if (user) { setCurrentUser(user); setLoginError(''); }
    else { setLoginError('Login ou senha inválidos.'); }
  };

  const handleLogout = () => { setCurrentUser(null); setActiveTab('sistema'); };

  const addUser = () => {
    if (!newUser.name || !newUser.login || !newUser.password) return alert('Preencha todos os campos');
    const id = Date.now();
    setUsers([...users, { ...newUser, id }]);
    setNewUser({ name: '', login: '', password: '' });
  };

  const removeUser = (id: number) => {
    if (users.length === 1) return alert('O sistema deve ter pelo menos um usuário.');
    if (id === currentUser.id) return alert('Você não pode excluir a si mesmo.');
    if (window.confirm('Excluir este usuário?')) setUsers(users.filter(u => u.id !== id));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) { document.documentElement.requestFullscreen(); setIsFullscreen(true); }
    else { if (document.exitFullscreen) { document.exitFullscreen(); setIsFullscreen(false); } }
  };

  const createYearStructure = (year: number) => {
    const newYearStructure: any = {};
    MONTH_LABELS.forEach(m => {
      newYearStructure[m] = {
        secovi: SECOVI_UNITS.reduce((acc, u) => ({ ...acc, [u]: { revenue: 0, expense: 0, financialRevenue: 0 } }), {}),
        agentes: AGENTES_UNITS.reduce((acc, u) => ({ ...acc, [u]: { revenue: 0, expense: 0, financialRevenue: 0 } }), {}),
        med: MED_UNITS.reduce((acc, u) => ({ ...acc, [u]: { revenue: 0, expense: 0, financialRevenue: 0 } }), {}),
      };
    });
    return newYearStructure;
  };

  const navigateYear = (direction: number) => {
    const targetYear = selectedYear + direction;
    setDataStore((prev: any) => {
      if (!prev[targetYear]) return { ...prev, [targetYear]: createYearStructure(targetYear) };
      return prev;
    });
    setSelectedYear(targetYear);
  };

  const currentYearData = useMemo(() => dataStore[selectedYear] || {}, [dataStore, selectedYear]);

  const dashboardMetrics = useMemo(() => {
    if (!currentYearData || Object.keys(currentYearData).length === 0) {
      return { pillars: [], totals: { revenue: 0, expense: 0, balance: 0, financialRevenue: 0 } };
    }
    const months = selectedMonth ? [selectedMonth] : MONTH_LABELS;
    const calculateTotals = (pilar: string) => {
      const result = { revenue: 0, expense: 0, financialRevenue: 0, balance: 0, units: {} as any };
      months.forEach(m => {
        const mData = currentYearData[m]?.[pilar] || {};
        Object.entries(mData).forEach(([unit, vals]: [string, any]) => {
          if (!result.units[unit]) result.units[unit] = { revenue: 0, expense: 0, financialRevenue: 0, balance: 0 };
          const r = vals.revenue || 0;
          const f = vals.financialRevenue || 0;
          const e = vals.expense || 0;
          result.units[unit].revenue += r;
          result.units[unit].expense += e;
          result.units[unit].financialRevenue += f;
          result.revenue += r;
          result.expense += e;
          result.financialRevenue += f;
        });
      });
      return result;
    };
    const secovi = calculateTotals('secovi');
    const agentes = calculateTotals('agentes');
    const med = calculateTotals('med');
    return {
      pillars: [
        { name: 'Secovi-PR', ...secovi, color: PILLAR_COLORS[0] },
        { name: 'Agentes de Serviço', ...agentes, color: PILLAR_COLORS[1] },
        { name: 'Secovimed', ...med, color: PILLAR_COLORS[2] }
      ],
      totals: {
        revenue: secovi.revenue + agentes.revenue + med.revenue,
        expense: secovi.expense + agentes.expense + med.expense,
        financialRevenue: secovi.financialRevenue + agentes.financialRevenue + med.financialRevenue,
        balance: (secovi.revenue + agentes.revenue + med.revenue) - (secovi.expense + agentes.expense + med.expense)
      }
    };
  }, [currentYearData, selectedMonth, selectedYear]);

  const updateValue = (year: number, month: string, pilar: string, unit: string, field: string, value: string) => {
    const num = parseFloat(value) || 0;
    setDataStore((prev: any) => {
      const newState = { ...prev };
      if (!newState[year]) newState[year] = createYearStructure(year);
      if (!newState[year][month]) newState[year][month] = createYearStructure(year)[month];
      newState[year][month][pilar][unit] = { ...newState[year][month][pilar][unit], [field]: num };
      return newState;
    });
  };

  const exportFullBackup = () => {
    const dataStr = JSON.stringify(dataStore, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri); linkElement.setAttribute('download', `database_secovi_backup_${new Date().toISOString().split('T')[0]}.json`);
    linkElement.click();
  };

  const importFullBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try { 
        const json = JSON.parse(e.target?.result as string); 
        if (window.confirm("Sobrescrever todo o banco de dados com este backup?")) {
           setDataStore(json); 
           alert("Banco de Dados Restaurado.");
        }
      } catch (err) { alert("Erro ao processar arquivo de backup."); }
    };
    reader.readAsText(file);
  };

  const clearAllData = () => { if (window.confirm("Apagar todos os dados do banco local?")) { localStorage.removeItem(STORAGE_KEY); window.location.reload(); } };

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string; if (!text) return;
      const lines = text.split('\n'); 
      const newDataStore = { ...dataStore };
      let count = 0;
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim(); if (!line) continue;
        const [ano, mes, pilarRaw, unidade, recBruta, recFin, despesa] = line.split(';');
        const year = parseInt(ano); if (isNaN(year)) continue;
        if (!newDataStore[year]) newDataStore[year] = createYearStructure(year);
        const pilar = pilarRaw === 'Secovi-PR' ? 'secovi' : (pilarRaw === 'Agentes' || pilarRaw === 'Agentes de Serviço') ? 'agentes' : 'med';
        const cleanNum = (val: string) => parseFloat(val?.replace(',', '.') || '0') || 0;
        if (newDataStore[year][mes]?.[pilar]?.[unidade]) {
          newDataStore[year][mes][pilar][unidade] = { revenue: cleanNum(recBruta), financialRevenue: cleanNum(recFin), expense: cleanNum(despesa) };
          count++;
        }
      }
      setDataStore(newDataStore); 
      alert(`${count} registros atualizados no banco de dados.`);
    };
    reader.readAsText(file);
  };

  const downloadCSVTemplate = () => {
    const headers = "Ano;Mes;Pilar;Unidade;Receita Bruta;Receita Financeira;Despesa";
    let csvRows = [headers];
    MONTH_LABELS.forEach(mes => {
      SECOVI_UNITS.forEach(unidade => csvRows.push(`${selectedYear};${mes};Secovi-PR;${unidade};0;0;0`));
      AGENTES_UNITS.forEach(unidade => csvRows.push(`${selectedYear};${mes};Agentes;${unidade};0;0;0`));
      MED_UNITS.forEach(unidade => csvRows.push(`${selectedYear};${mes};Secovimed;${unidade};0;0;0`));
    });
    const csvContent = "\uFEFF" + csvRows.join("\n"); // UTF-8 BOM for Excel
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.setAttribute("href", url); link.setAttribute("download", `modelo_importacao_secovi.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const toggleUnitSelection = (unit: string, selectedList: string[], setSelectedList: React.Dispatch<React.SetStateAction<string[]>>) => {
    setSelectedList(prev => prev.includes(unit) ? prev.filter(u => u !== unit) : [...prev, unit]);
  };

  const renderLegendText = (value: string) => {
    if (value.toLowerCase() === 'resultado') return <span className="text-[#2563eb]">{value}</span>;
    return value;
  };

  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload; 
      const resColor = data.resultado >= 0 ? 'text-stone-900' : 'text-red-600';
      return (
        <div className="bg-white p-4 rounded-xl shadow-2xl border border-stone-100 animate-fadeIn min-w-[200px]">
          <p className="text-sm font-bold text-stone-600 mb-3 border-b border-stone-50 pb-2">{label}</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center gap-4"><span className="text-xs font-bold text-green-600">Receita :</span><span className="text-xs font-black text-green-600">{formatCurrency(data.receita)}</span></div>
            <div className="flex justify-between items-center gap-4"><span className="text-xs font-bold text-red-500">Despesa :</span><span className="text-xs font-black text-red-500">{formatCurrency(data.despesa)}</span></div>
            <div className="mt-2 pt-2 border-t border-stone-50 flex justify-between items-center gap-4"><span className="text-xs font-bold text-stone-900 uppercase tracking-tighter">Resultado :</span><span className={`text-xs font-black ${resColor}`}>{formatCurrency(data.resultado)}</span></div>
          </div>
        </div>
      );
    }
    return null;
  };

  const PillarDetailPieCharts = ({ pillar, unitsSelection }: any) => {
    const data = Object.entries(pillar.units)
      .filter(([name]) => unitsSelection.includes(name))
      .map(([name, vals]: [string, any]) => ({
        name,
        revenue: vals.revenue + vals.financialRevenue,
        expense: vals.expense
      }))
      .filter(d => d.revenue > 0 || d.expense > 0);

    const totalRev = data.reduce((acc, curr) => acc + curr.revenue, 0);
    const totalExp = data.reduce((acc, curr) => acc + curr.expense, 0);

    const GREEN_PALETTE = ['#065f46', '#047857', '#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'];
    const RED_PALETTE = ['#991b1b', '#b91c1c', '#dc2626', '#ef4444', '#f87171', '#fb923c', '#fca5a5', '#fecaca'];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
        <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm flex flex-col items-center">
          <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-6">Proporção de Receita por Unidade</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="revenue" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                  {data.map((_, index) => <Cell key={`cell-rev-${index}`} fill={GREEN_PALETTE[index % GREEN_PALETTE.length]} />)}
                </Pie>
                <Tooltip 
                  formatter={(val: number) => {
                    const pct = totalRev > 0 ? ((val / totalRev) * 100).toFixed(1) : 0;
                    return [`${pct}%`, 'Participação'];
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 w-full border-t border-stone-50 pt-4">
            {data.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2 overflow-hidden">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: GREEN_PALETTE[index % GREEN_PALETTE.length] }}></div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] font-black uppercase text-stone-500 truncate leading-none mb-1">{entry.name}</span>
                  <span className="text-[10px] font-bold text-green-700">{formatCurrency(entry.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm flex flex-col items-center">
          <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-6">Proporção de Despesa por Unidade</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="expense" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                  {data.map((_, index) => <Cell key={`cell-exp-${index}`} fill={RED_PALETTE[index % RED_PALETTE.length]} />)}
                </Pie>
                <Tooltip 
                   formatter={(val: number) => {
                    const pct = totalExp > 0 ? ((val / totalExp) * 100).toFixed(1) : 0;
                    return [`${pct}%`, 'Participação'];
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 w-full border-t border-stone-50 pt-4">
            {data.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2 overflow-hidden">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: RED_PALETTE[index % RED_PALETTE.length] }}></div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] font-black uppercase text-stone-500 truncate leading-none mb-1">{entry.name}</span>
                  <span className="text-[10px] font-bold text-red-700">{formatCurrency(entry.expense)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F8F7F5] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-stone-200 overflow-hidden animate-fadeIn">
          <div className="bg-[#1C1917] p-10 text-center text-white">
            <div className="w-16 h-16 bg-[#C2410C] rounded-2xl flex items-center justify-center font-bold text-3xl mx-auto mb-6 shadow-xl">S</div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">Secovi PR</h1>
            <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mt-2">Acesso Restrito ao Sistema</p>
          </div>
          <form onSubmit={handleLogin} className="p-10 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Usuário</label>
              <div className="relative"><User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" /><input type="text" className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-[#C2410C] focus:border-transparent outline-none transition-all" value={loginForm.login} onChange={e => setLoginForm({...loginForm, login: e.target.value})} required /></div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Senha</label>
              <div className="relative"><Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" /><input type="password" className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-[#C2410C] focus:border-transparent outline-none transition-all" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} required /></div>
            </div>
            {loginError && <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">{loginError}</p>}
            <button type="submit" className="w-full bg-[#1C1917] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-stone-800 transition-all shadow-lg active:scale-95">Entrar no Sistema</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F5] flex flex-col lg:flex-row">
      <nav className="w-full lg:w-72 bg-[#1C1917] text-white lg:fixed lg:inset-y-0 lg:left-0 p-6 z-50 flex flex-col shadow-2xl">
        <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-6 shrink-0">
          <div className="w-10 h-10 bg-[#C2410C] rounded-md flex items-center justify-center font-bold text-xl">S</div>
          <div><h1 className="text-lg font-bold leading-tight uppercase tracking-tighter">Secovi PR</h1><p className="text-[10px] text-stone-400 uppercase tracking-widest">Dashboard de Resultados</p></div>
        </div>
        <div className="space-y-1 flex-grow overflow-y-auto pr-2 custom-scrollbar">
          <button onClick={() => setActiveTab('sistema')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'sistema' ? 'bg-[#C2410C] text-white shadow-lg' : 'text-stone-400 hover:bg-stone-800'}`}><Layers size={18} /> <span className="text-sm font-semibold">0. Sistema Consolidado</span></button>
          <div className="h-px bg-white/5 my-2"></div>
          <button onClick={() => setActiveTab('secovipr')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'secovipr' ? 'bg-[#C2410C] text-white shadow-lg' : 'text-stone-400 hover:bg-stone-800'}`}><MapPin size={18} /> <span className="text-sm font-semibold">1. Resultado Secovi-PR</span></button>
          <button onClick={() => setActiveTab('agentes')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'agentes' ? 'bg-[#C2410C] text-white shadow-lg' : 'text-stone-400 hover:bg-stone-800'}`}><Briefcase size={18} /> <span className="text-sm font-semibold">2. Agentes de Serviço</span></button>
          <button onClick={() => setActiveTab('secovimed')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'secovimed' ? 'bg-[#C2410C] text-white shadow-lg' : 'text-stone-400 hover:bg-stone-800'}`}><HeartPulse size={18} /> <span className="text-sm font-semibold">3. SecoviMed</span></button>
          <div className="h-px bg-white/5 my-4"></div>
          <button onClick={() => setActiveTab('admin')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all border border-stone-700 bg-stone-800/50 ${activeTab === 'admin' ? 'bg-blue-600 border-blue-500 shadow-lg' : 'text-stone-300 hover:bg-stone-700'}`}><Database size={18} /> <span className="text-sm font-semibold tracking-tight uppercase text-[10px]">Banco de Dados</span></button>
          <button onClick={() => setActiveTab('usuarios')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all border border-stone-700 bg-stone-800/50 ${activeTab === 'usuarios' ? 'bg-purple-600 border-purple-500 shadow-lg' : 'text-stone-300 hover:bg-stone-700'}`}><Users size={18} /> <span className="text-sm font-semibold tracking-tight uppercase text-[10px]">Gestão de Usuários</span></button>
        </div>
        <div className="mt-auto pt-4 border-t border-white/10">
          <div className="px-4 py-3 mb-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
             <div className="flex items-center gap-2">
                {isSaving ? <Cloud size={14} className="text-blue-400 animate-pulse" /> : <CloudCheck size={14} className="text-green-400" />}
                <span className="text-[10px] font-black uppercase text-stone-400">{isSaving ? 'Salvando...' : 'Sincronizado'}</span>
             </div>
             <div className={`w-1.5 h-1.5 rounded-full ${isSaving ? 'bg-blue-400' : 'bg-green-400'}`}></div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-400/10 transition-all font-bold text-sm"><LogOut size={18} /> Sair do Sistema</button>
        </div>
      </nav>

      <main className="flex-1 lg:pl-72 p-6 lg:p-10 overflow-x-hidden min-h-screen">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div><h2 className="text-2xl font-black text-stone-900 uppercase tracking-tighter">Painel de Gestão {selectedYear}</h2><p className="text-sm text-stone-500 uppercase tracking-widest font-bold">Conselho Superior Secovi-PR</p></div>
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white border border-stone-200 rounded-xl">
                <div className={`w-2 h-2 rounded-full ${isSaving ? 'bg-blue-500 animate-ping' : 'bg-green-500'}`}></div>
                <span className="text-[9px] font-black text-stone-600 uppercase">Banco de Dados Local: {isSaving ? 'Salvando' : 'Ativo'}</span>
             </div>
             <button onClick={toggleFullscreen} className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-xl text-[10px] font-black uppercase text-stone-600 hover:bg-stone-50 transition-all shadow-sm">{isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />} {isFullscreen ? 'Sair da Tela Cheia' : 'Apresentação Tela Cheia'}</button>
          </div>
        </div>

        {activeTab === 'sistema' && (
          <div className="animate-fadeIn space-y-8">
            <div className="mb-10 bg-white p-6 rounded-3xl shadow-sm border border-stone-200">
               <div className="flex items-center gap-4 mb-8"><div className="bg-stone-100 p-2.5 rounded-full text-stone-600"><LayoutDashboard size={22} /></div><div><h2 className="text-lg font-bold text-stone-800 uppercase tracking-tighter">Painel Executivo {selectedYear}</h2><p className="text-xs text-stone-500">Resumo Gerencial Consolidado</p></div></div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                  <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100 shadow-sm">
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3">TOTAL GERAL DO SISTEMA</p>
                    <div className="space-y-3">
                      <div className="flex flex-col"><span className="text-[10px] font-bold text-green-700 uppercase">Receita {viewWithFinancial ? '(+ Fin.)' : ''}:</span><span className="text-2xl font-black text-stone-900 leading-tight">{formatCurrency(dashboardMetrics.totals.revenue + (viewWithFinancial ? dashboardMetrics.totals.financialRevenue : 0))}</span></div>
                      <div className="flex flex-col"><span className="text-[10px] font-bold text-red-700 uppercase">Despesa Total:</span><span className="text-2xl font-black text-stone-900 leading-tight">{formatCurrency(dashboardMetrics.totals.expense)}</span></div>
                      <div className="flex flex-col pt-2 border-t border-stone-200"><span className="text-[10px] font-bold text-blue-700 uppercase">Resultado:</span><span className="text-2xl font-black text-blue-700 leading-tight">{formatCurrency((dashboardMetrics.totals.revenue + (viewWithFinancial ? dashboardMetrics.totals.financialRevenue : 0)) - dashboardMetrics.totals.expense)}</span></div>
                    </div>
                  </div>
                  <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100 shadow-sm">
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3">DETALHAMENTO FINANCEIRO</p>
                    <div className="space-y-4">
                       <div className="flex flex-col border-b border-stone-200 pb-3 mb-3"><span className="text-[10px] font-bold text-blue-600 uppercase">Total Receitas Financeiras:</span><span className="text-2xl font-black text-stone-900 leading-none">{formatCurrency(dashboardMetrics.totals.financialRevenue)}</span></div>
                       <div className="space-y-2">{dashboardMetrics.pillars.map((p, idx) => (<div key={p.name} className="flex justify-between items-center text-[10px] font-bold py-0.5"><span className="text-stone-500 uppercase flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: PILLAR_COLORS[idx] }}></div>{p.name}:</span><span className="text-stone-900">{formatCurrency(p.financialRevenue)}</span></div>))}</div>
                    </div>
                  </div>
                  <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100 ring-1 ring-stone-200 shadow-sm">
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3">PERFORMANCE OPERACIONAL</p>
                    <div className="space-y-3">
                      <div className="flex flex-col pt-2 border-t border-stone-200"><span className="text-[10px] font-bold text-blue-700 uppercase">Resultado Operacional:</span><span className="text-2xl font-black text-blue-800 leading-tight">{formatCurrency(dashboardMetrics.totals.revenue - dashboardMetrics.totals.expense)}</span></div>
                    </div>
                  </div>
               </div>
            </div>

            <div className="bg-stone-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10"><TrendingUp size={120} /></div>
              <div className="flex items-center gap-4 mb-10"><div className="p-4 bg-[#C2410C] rounded-2xl shadow-xl"><Layers size={28} /></div><div><h3 className="text-2xl font-black uppercase tracking-tighter">Visão Consolidada {selectedYear}</h3><p className="text-stone-400 text-sm font-medium">Análise Comparativa</p></div></div>
              <div className="mb-10 flex items-center gap-2 p-1.5 bg-white/5 rounded-2xl w-full overflow-x-auto no-scrollbar border border-white/10">
                <button onClick={() => setSelectedMonth(null)} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${!selectedMonth ? 'bg-[#C2410C] text-white' : 'text-stone-400 hover:text-white'}`}>Acumulado Anual</button>
                <div className="w-[1px] h-4 bg-white/10 mx-1"></div>
                {MONTH_LABELS.map(m => (<button key={m} onClick={() => setSelectedMonth(m)} className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${selectedMonth === m ? 'bg-white text-stone-900 shadow-md' : 'text-stone-400 hover:text-white'}`}>{m}</button>))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                <div className="bg-white/5 p-8 rounded-3xl border border-white/10"><p className="text-[10px] font-black text-green-400 uppercase mb-4 tracking-widest">Receita {viewWithFinancial ? '(+ Fin.)' : '(Bruta)'}</p><p className="text-3xl font-black text-white">{formatCurrency(dashboardMetrics.totals.revenue + (viewWithFinancial ? dashboardMetrics.totals.financialRevenue : 0))}</p></div>
                <div className="bg-white/5 p-8 rounded-3xl border border-white/10"><p className="text-[10px] font-black text-red-400 uppercase mb-4 tracking-widest">Despesa Total</p><p className="text-3xl font-black text-white">{formatCurrency(dashboardMetrics.totals.expense)}</p></div>
                <div className="bg-white/5 p-8 rounded-3xl border border-white/10 ring-1 ring-[#C2410C]/30 shadow-lg"><p className="text-[10px] font-black text-blue-400 uppercase mb-4 tracking-widest">Resultado</p><p className={`text-3xl font-black ${((dashboardMetrics.totals.revenue + (viewWithFinancial ? dashboardMetrics.totals.financialRevenue : 0)) - dashboardMetrics.totals.expense) >= 0 ? 'text-blue-400' : 'text-red-500'}`}>{formatCurrency((dashboardMetrics.totals.revenue + (viewWithFinancial ? dashboardMetrics.totals.financialRevenue : 0)) - dashboardMetrics.totals.expense)}</p></div>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-stone-200 overflow-hidden shadow-sm">
              <div className="p-6 bg-stone-50 border-b border-stone-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4"><h5 className="text-[11px] font-black text-stone-900 uppercase tracking-widest">Acompanhamento Analítico</h5><div className="h-4 w-px bg-stone-200 hidden md:block"></div><div className="flex bg-white border border-stone-200 p-1 rounded-xl shadow-sm"><button onClick={() => setViewWithFinancial(true)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${viewWithFinancial ? 'bg-[#C2410C] text-white' : 'text-stone-500 hover:bg-stone-50'}`}><Eye size={12}/> Com Financeira</button><button onClick={() => setViewWithFinancial(false)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${!viewWithFinancial ? 'bg-stone-900 text-white' : 'text-stone-500 hover:bg-stone-50'}`}><EyeOff size={12}/> Sem Financeira</button></div></div>
                <button onClick={() => setShowSystemBreakdown(!showSystemBreakdown)} className="px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all bg-white text-stone-600 border border-stone-200 hover:bg-stone-50 shadow-sm flex items-center gap-2"><ListTree size={14} /> {showSystemBreakdown ? 'Fechar Unidades' : 'Abrir Unidades'}</button>
              </div>
              <div className={`overflow-x-auto ${showSystemBreakdown ? 'max-h-[700px]' : ''} overflow-y-auto custom-scrollbar`}><table className="w-full min-w-[900px] border-collapse"><thead className="sticky top-0 z-20 shadow-sm"><tr className="text-left bg-stone-100/95 backdrop-blur-sm"><th className="p-6 text-sm font-black text-stone-500 uppercase tracking-widest border-b border-stone-200">Estrutura Operacional</th><th className="p-6 text-right text-sm font-black text-green-800 uppercase tracking-widest border-b border-stone-200">Receita</th><th className="p-6 text-right text-sm font-black text-red-800 uppercase tracking-widest border-b border-stone-200">Despesa</th><th className="p-6 text-right text-sm font-black text-blue-800 uppercase tracking-widest border-b border-stone-200">Resultado</th></tr></thead><tbody>{dashboardMetrics.pillars.length > 0 && [dashboardMetrics.pillars[0], dashboardMetrics.pillars[1], { isSubtotal: true }, dashboardMetrics.pillars[2]].map((p: any, i) => { if ('isSubtotal' in p) { const sFin = viewWithFinancial ? (dashboardMetrics.pillars[0].financialRevenue + dashboardMetrics.pillars[1].financialRevenue) : 0; const sR = (dashboardMetrics.pillars[0].revenue + dashboardMetrics.pillars[1].revenue) + sFin; const sE = dashboardMetrics.pillars[0].expense + dashboardMetrics.pillars[1].expense; return (<tr key="s" className="bg-stone-100/50 border-y border-stone-200"><td className="p-6 font-black text-lg italic tracking-tight">Subtotal (Secovi + Agentes)</td><td className="p-6 text-right font-black text-lg">{formatCurrency(sR)}</td><td className="p-6 text-right font-black text-stone-600 text-lg">{formatCurrency(sE)}</td><td className={`p-6 text-right font-black text-lg ${sR - sE >= 0 ? 'text-blue-700' : 'text-red-700'}`}>{formatCurrency(sR - sE)}</td></tr>); } const dR = p.revenue + (viewWithFinancial ? p.financialRevenue : 0); return (<React.Fragment key={p.name}><tr className="border-t border-stone-100 bg-white"><td className="p-6 font-black text-xl flex items-center gap-4 tracking-tight"><div className="w-2 h-8 rounded-full" style={{ backgroundColor: p.color }}></div>{p.name}</td><td className="p-6 text-right font-extrabold text-xl">{formatCurrency(dR)}</td><td className="p-6 text-right font-extrabold text-xl">{formatCurrency(p.expense)}</td><td className={`p-6 text-right font-black text-xl ${dR - p.expense >= 0 ? 'text-blue-600' : 'text-red-600'}`}>{formatCurrency(dR - p.expense)}</td></tr>{showSystemBreakdown && Object.entries(p.units).map(([uN, v]: [string, any]) => { const uR = v.revenue + (viewWithFinancial ? v.financialRevenue : 0); const uB = uR - v.expense; return (<tr key={uN} className="border-t border-stone-50 bg-stone-50/20"><td className="p-4 pl-16 text-base font-bold text-stone-500 uppercase flex items-center gap-3 tracking-wide"><ChevronRight size={14} className="text-stone-300" /> {uN}</td><td className="p-4 text-right text-base font-semibold text-stone-700">{formatCurrency(uR)}</td><td className="p-4 text-right text-base font-semibold text-stone-700">{formatCurrency(v.expense)}</td><td className={`p-4 text-right text-base font-black ${uB >= 0 ? 'text-blue-500' : 'text-red-500'}`}>{formatCurrency(uB)}</td></tr>); })}</React.Fragment>); })}</tbody><tfoot className="sticky bottom-0 z-10 shadow-lg"><tr className="bg-stone-900 text-white border-t-4 border-[#C2410C]"><td className="p-8 font-black text-2xl uppercase tracking-tighter">RESULTADO GERAL SISTEMA SECOVI/PR</td><td className="p-8 text-right font-black text-2xl">{formatCurrency(dashboardMetrics.totals.revenue + (viewWithFinancial ? dashboardMetrics.totals.financialRevenue : 0))}</td><td className="p-8 text-right font-black text-2xl">{formatCurrency(dashboardMetrics.totals.expense)}</td><td className={`p-8 text-right font-black text-2xl ${(dashboardMetrics.totals.revenue + (viewWithFinancial ? dashboardMetrics.totals.financialRevenue : 0) - dashboardMetrics.totals.expense) >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(dashboardMetrics.totals.revenue + (viewWithFinancial ? dashboardMetrics.totals.financialRevenue : 0) - dashboardMetrics.totals.expense)}</td></tr></tfoot></table></div>
            </div>
          </div>
        )}

        {(activeTab === 'secovipr' || activeTab === 'agentes' || activeTab === 'secovimed') && (
           <div className="animate-fadeIn space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div><h3 className="text-2xl font-black text-stone-900 uppercase flex items-center gap-3">{activeTab === 'secovipr' ? <MapPin className="text-[#C2410C]" /> : activeTab === 'agentes' ? <ShieldCheck /> : <HeartPulse className="text-blue-600" />} {activeTab === 'secovipr' ? '1. Resultado Secovi-PR' : activeTab === 'agentes' ? '2. Agentes de Serviço' : '3. Secovimed'} {selectedYear}</h3><p className="text-stone-500 text-sm mt-1 uppercase font-bold tracking-widest text-[10px]">Análise Regionalizada</p></div>
              <div className="flex flex-col gap-4">
                <div className="flex bg-white border border-stone-200 p-1 rounded-xl shadow-sm self-end"><button onClick={() => setViewWithFinancial(true)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${viewWithFinancial ? 'bg-[#C2410C] text-white' : 'text-stone-500 hover:bg-stone-50'}`}><Eye size={12}/> Com Financeira</button><button onClick={() => setViewWithFinancial(false)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${!viewWithFinancial ? 'bg-stone-900 text-white' : 'text-stone-500 hover:bg-stone-50'}`}><EyeOff size={12}/> Sem Financeira</button></div>
                <div className="bg-white p-4 rounded-3xl shadow-sm border border-stone-100 flex flex-wrap gap-2 max-w-2xl">{(activeTab === 'secovipr' ? SECOVI_UNITS : activeTab === 'agentes' ? AGENTES_UNITS : MED_UNITS).map(u => (<button key={u} onClick={() => toggleUnitSelection(u, activeTab === 'secovipr' ? selectedSecoviUnits : activeTab === 'agentes' ? selectedAgentesUnits : selectedMedUnits, activeTab === 'secovipr' ? setSelectedSecoviUnits : activeTab === 'agentes' ? setSelectedAgentesUnits : setSelectedMedUnits)} className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all flex items-center gap-2 border ${(activeTab === 'secovipr' ? selectedSecoviUnits : activeTab === 'agentes' ? selectedAgentesUnits : selectedMedUnits).includes(u) ? 'bg-stone-900 text-white border-stone-900' : 'bg-stone-50 text-stone-400 border-stone-100 hover:border-stone-200'}`}>{(activeTab === 'secovipr' ? selectedSecoviUnits : activeTab === 'agentes' ? selectedAgentesUnits : selectedMedUnits).includes(u) ? <CheckSquare size={12}/> : <Square size={12}/>} {u}</button>))}</div>
              </div>
            </div>
            <div className="mb-10 flex items-center gap-2 p-1.5 bg-white rounded-2xl w-full overflow-x-auto no-scrollbar border border-stone-100 shadow-sm">
              <button onClick={() => setSelectedMonth(null)} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${!selectedMonth ? 'bg-[#C2410C] text-white' : 'text-stone-400 hover:text-stone-600'}`}>Acumulado Anual</button>
              <div className="w-[1px] h-4 bg-stone-100 mx-1"></div>
              {MONTH_LABELS.map(m => (<button key={m} onClick={() => setSelectedMonth(m)} className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${selectedMonth === m ? 'bg-stone-900 text-white shadow-md' : 'text-stone-400 hover:text-stone-600'}`}>{m}</button>))}
            </div>
            
            <div className="bg-white p-8 rounded-[2rem] border border-stone-100 shadow-sm">
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-6 text-center">EVOLUÇÃO MENSAL CONSOLIDADA</p>
              <div className="h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MONTH_LABELS.map(m => { let r = 0, e = 0; const units = activeTab === 'secovipr' ? selectedSecoviUnits : activeTab === 'agentes' ? selectedAgentesUnits : selectedMedUnits; units.forEach(u => { const d = currentYearData[m]?.[activeTab === 'secovipr' ? 'secovi' : activeTab === 'agentes' ? 'agentes' : 'med']?.[u] || { revenue: 0, expense: 0, financialRevenue: 0 }; r += d.revenue + (viewWithFinancial ? (d.financialRevenue || 0) : 0); e += d.expense; }); return { name: m, receita: r, despesa: e, resultado: r - e }; })} margin={{ top: 60, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} /><YAxis hide /><Tooltip cursor={{ fill: '#f8f8f8' }} content={<CustomBarTooltip />} /><Legend wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold', paddingTop: '20px' }} formatter={renderLegendText} />
                    <Bar dataKey="receita" name="Receita" fill="#16a34a" radius={[4, 4, 0, 0]} isAnimationActive={false}><LabelList dataKey="receita" position="top" angle={-90} offset={25} formatter={formatChartLabel} style={{ fontSize: '10px', fontWeight: '900', fill: '#16a34a' }} /></Bar>
                    <Bar dataKey="despesa" name="Despesa" fill="#dc2626" radius={[4, 4, 0, 0]} isAnimationActive={false}><LabelList dataKey="despesa" position="top" angle={-90} offset={25} formatter={formatChartLabel} style={{ fontSize: '10px', fontWeight: '900', fill: '#dc2626' }} /></Bar>
                    <Bar dataKey="resultado" name="Resultado" fill="#2563eb" radius={[4, 4, 0, 0]} isAnimationActive={false}>{MONTH_LABELS.map((m, i) => { let r = 0, e = 0; const units = activeTab === 'secovipr' ? selectedSecoviUnits : activeTab === 'agentes' ? selectedAgentesUnits : selectedMedUnits; units.forEach(u => { const d = currentYearData[m]?.[activeTab === 'secovipr' ? 'secovi' : activeTab === 'agentes' ? 'agentes' : 'med']?.[u] || { revenue: 0, expense: 0, financialRevenue: 0 }; r += d.revenue + (viewWithFinancial ? (d.financialRevenue || 0) : 0); e += d.expense; }); return <Cell key={i} fill={(r - e) >= 0 ? "#2563eb" : "#dc2626"} />; })}<LabelList dataKey="resultado" position="top" angle={-90} offset={25} formatter={formatChartLabel} style={{ fontSize: '10px', fontWeight: '900', fill: '#2563eb' }} /></Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-6">
              {dashboardMetrics.pillars.length > 0 && Object.entries(dashboardMetrics.pillars[activeTab === 'secovipr' ? 0 : activeTab === 'agentes' ? 1 : 2].units).filter(([n]) => (activeTab === 'secovipr' ? selectedSecoviUnits : activeTab === 'agentes' ? selectedAgentesUnits : selectedMedUnits).includes(n)).map(([n, v]: [string, any]) => {
                  const dR = v.revenue + (viewWithFinancial ? v.financialRevenue : 0); const dB = dR - v.expense;
                  return (
                    <div key={n} className="bg-white p-4.5 rounded-[2rem] border border-stone-200 shadow-sm flex flex-col justify-between w-full sm:w-[256px] transition-transform hover:scale-[1.02]">
                      <div>
                        <p className="text-[13px] font-black text-black uppercase tracking-widest text-center mb-4">{n}</p>
                        <div className="space-y-2 mb-4 text-center">
                          <div className="flex flex-col border-b border-stone-50 pb-1.5"><span className="text-[9px] font-bold text-stone-500 uppercase mb-0.5">Receita</span><span className="text-base font-black text-green-600">{formatCurrency(dR)}</span></div>
                          <div className="flex flex-col border-b border-stone-50 pb-1.5"><span className="text-[9px] font-bold text-stone-500 uppercase mb-0.5">Despesa</span><span className="text-base font-black text-red-600">{formatCurrency(v.expense)}</span></div>
                        </div>
                        <div className="text-center pt-3 border-t border-stone-100"><p className="text-[9px] font-black text-stone-400 uppercase mb-1 tracking-widest">Resultado</p><p className={`text-2xl font-black ${dB >= 0 ? 'text-blue-700' : 'text-red-600'} leading-none tracking-tighter`}>{formatCurrency(dB)}</p></div>
                      </div>
                    </div>
                  );
              })}
            </div>
            <PillarDetailPieCharts pillar={dashboardMetrics.pillars[activeTab === 'secovipr' ? 0 : activeTab === 'agentes' ? 1 : 2]} unitsSelection={activeTab === 'secovipr' ? selectedSecoviUnits : activeTab === 'agentes' ? selectedAgentesUnits : selectedMedUnits} />
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="animate-fadeIn max-w-6xl mx-auto space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200"><div className="flex items-center gap-3 mb-6"><Database size={20} className="text-blue-600" /><h3 className="text-lg font-black uppercase">Gestão do Banco de Dados Local</h3></div><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><button onClick={exportFullBackup} className="flex items-center justify-center gap-2 p-4 bg-blue-50 text-blue-700 rounded-2xl border border-blue-100 font-black uppercase text-[10px] hover:bg-blue-100 transition-all"><Download size={16} /> Exportar Banco (JSON)</button><button onClick={() => backupInputRef.current?.click()} className="flex items-center justify-center gap-2 p-4 bg-orange-50 text-orange-700 rounded-2xl border border-orange-100 font-black uppercase text-[10px] hover:bg-orange-100 transition-all"><UploadCloud size={16} /> Restaurar Banco<input type="file" accept=".json" ref={backupInputRef} onChange={importFullBackup} className="hidden" /></button><button onClick={clearAllData} className="flex items-center justify-center gap-2 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 font-black uppercase text-[10px] hover:bg-red-100 transition-all"><Trash2 size={16} /> Limpar Banco Inteiro</button></div></div>
            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-stone-200 flex flex-col">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-6 border-b border-stone-100 gap-6">
                <div className="flex items-center gap-4"><h2 className="text-2xl font-black text-stone-900 uppercase">Lançamento & Sincronização</h2><div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl"><button onClick={() => navigateYear(-1)} className="p-1.5 hover:bg-white rounded-lg transition-all text-stone-600 flex items-center gap-1"><ChevronLeft size={16} /></button><span className="px-3 text-sm font-black">{selectedYear}</span><button onClick={() => navigateYear(1)} className="p-1.5 hover:bg-white rounded-lg transition-all text-stone-600 flex items-center gap-1"><ChevronRight size={16} /></button></div></div>
                <div className="flex bg-stone-100 p-1.5 rounded-2xl gap-1 overflow-x-auto max-w-full">{MONTH_LABELS.map(m => (<button key={m} onClick={() => setSelectedMonth(m)} className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase whitespace-nowrap ${selectedMonth === m ? 'bg-stone-900 text-white' : 'text-stone-500 hover:bg-stone-200'}`}>{m}</button>))}</div>
              </div>
              <div className="flex-grow">{!selectedMonth ? (<div className="bg-stone-50 p-12 rounded-[2rem] text-center border-2 border-dashed border-stone-200"><Database className="mx-auto text-stone-300 mb-4" size={48} /><p className="text-stone-500 font-bold uppercase text-[10px]">Escolha um mês para gravar novos dados no banco</p></div>) : (<div className="space-y-12 mb-10">{[{ title: 'Secovi-PR', pilar: 'secovi', units: SECOVI_UNITS, color: '#C2410C' },{ title: 'Agentes de Serviço', pilar: 'agentes', units: AGENTES_UNITS, color: '#1C1917' },{ title: 'Secovimed', pilar: 'med', units: MED_UNITS, color: '#2563eb' }].map(p => (<div key={p.pilar} className="space-y-4"><h4 className="text-sm font-black uppercase" style={{ color: p.color }}>{p.title}</h4><div className="grid grid-cols-1 gap-2"><div className="flex items-center gap-4 px-3 mb-1"><span className="w-32"></span><span className="flex-1 text-[9px] font-black text-stone-400 uppercase text-center">Rec. Bruta</span><span className="flex-1 text-[9px] font-black text-blue-400 uppercase text-center">Rec. Finan</span><span className="flex-1 text-[9px] font-black text-red-400 uppercase text-center">Despesa</span></div>{p.units.map(unit => (<div key={unit} className="flex items-center gap-4 bg-stone-50 p-3 rounded-xl border border-stone-100 hover:border-stone-300 transition-colors shadow-sm"><span className="w-32 text-[10px] font-black text-stone-600 uppercase">{unit}</span><input type="number" className="flex-1 bg-white border border-stone-200 rounded-lg p-2 text-xs font-bold" value={currentYearData[selectedMonth]?.[p.pilar]?.[unit]?.revenue || 0} onChange={(e) => updateValue(selectedYear, selectedMonth, p.pilar, unit, 'revenue', e.target.value)} /><input type="number" className="flex-1 bg-white border border-blue-100 rounded-lg p-2 text-xs font-bold text-blue-700" value={currentYearData[selectedMonth]?.[p.pilar]?.[unit]?.financialRevenue || 0} onChange={(e) => updateValue(selectedYear, selectedMonth, p.pilar, unit, 'financialRevenue', e.target.value)} /><input type="number" className="flex-1 bg-white border border-stone-200 rounded-lg p-2 text-xs font-bold" value={currentYearData[selectedMonth]?.[p.pilar]?.[unit]?.expense || 0} onChange={(e) => updateValue(selectedYear, selectedMonth, p.pilar, unit, 'expense', e.target.value)} /></div>))}</div></div>))}</div>)}</div>
              <div className="mt-8 pt-8 border-t border-stone-100 flex flex-wrap items-center justify-end gap-4"><button onClick={downloadCSVTemplate} className="flex items-center gap-2 px-6 py-3 bg-green-50 text-green-700 border border-green-100 rounded-xl hover:bg-green-100 transition-all font-black uppercase text-[10px]"><FileText size={16} /> Baixar Modelo CSV</button><input type="file" accept=".csv" ref={fileInputRef} onChange={handleImportCSV} className="hidden" /><button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-all font-black uppercase text-[10px]"><UploadCloud size={16} /> Importar & Sincronizar CSV</button></div>
            </div>
          </div>
        )}

        {activeTab === 'usuarios' && (
          <div className="animate-fadeIn max-w-4xl mx-auto space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200"><div className="flex items-center gap-3 mb-8"><div className="p-3 bg-purple-100 text-purple-600 rounded-xl"><Users size={24} /></div><div><h3 className="text-xl font-black uppercase tracking-tighter">Gestão de Usuários</h3><p className="text-xs text-stone-500 font-bold uppercase tracking-widest">Controle de Acessos ao Sistema</p></div></div><div className="bg-stone-50 p-6 rounded-2xl border border-stone-100 mb-8"><h4 className="text-[10px] font-black uppercase text-stone-400 mb-4 tracking-widest">Cadastrar Novo Usuário</h4><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-1"><label className="text-[9px] font-black text-stone-500 uppercase ml-1">Nome Completo</label><input type="text" className="w-full bg-white border border-stone-200 rounded-xl p-3 text-xs font-bold" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} /></div><div className="space-y-1"><label className="text-[9px] font-black text-stone-500 uppercase ml-1">Login de Acesso</label><input type="text" className="w-full bg-white border border-stone-200 rounded-xl p-3 text-xs font-bold" value={newUser.login} onChange={e => setNewUser({...newUser, login: e.target.value})} /></div><div className="space-y-1"><label className="text-[9px] font-black text-stone-500 uppercase ml-1">Senha</label><div className="flex gap-2"><input type="password" className="flex-1 bg-white border border-stone-200 rounded-xl p-3 text-xs font-bold" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} /><button onClick={addUser} className="bg-purple-600 text-white p-3 rounded-xl hover:bg-purple-700 transition-all shadow-md"><UserPlus size={18} /></button></div></div></div></div><div className="overflow-hidden border border-stone-100 rounded-2xl"><table className="w-full text-left"><thead className="bg-stone-50 border-b border-stone-100"><tr><th className="p-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">Nome</th><th className="p-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">Login</th><th className="p-4 text-right text-[10px] font-black text-stone-400 uppercase tracking-widest">Ações</th></tr></thead><tbody className="divide-y divide-stone-50">{users.map(u => (<tr key={u.id} className="hover:bg-stone-50/50 transition-colors"><td className="p-4 text-xs font-bold text-stone-700">{u.name} {u.id === currentUser.id && <span className="bg-stone-900 text-white text-[8px] px-1.5 py-0.5 rounded ml-2 uppercase">Você</span>}</td><td className="p-4 text-xs font-medium text-stone-500">{u.login}</td><td className="p-4 text-right"><button onClick={() => removeUser(u.id)} className={`p-2 rounded-lg transition-all ${u.id === currentUser.id ? 'text-stone-200 cursor-not-allowed' : 'text-red-400 hover:bg-red-50 hover:text-red-600'}`} disabled={u.id === currentUser.id}><Trash2 size={16} /></button></td></tr>))}</tbody></table></div></div>
          </div>
        )}
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d1d1; border-radius: 10px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default App;
