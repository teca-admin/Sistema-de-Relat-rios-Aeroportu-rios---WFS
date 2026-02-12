
import React, { useState, useEffect } from 'react';
import { ReportData, ChannelData } from './types';
import { INITIAL_REPORT_DATA, AVAILABLE_AGENTS } from './constants';
import { supabase } from './supabase';
import LeaderDashboard from './components/LeaderDashboard';
import ChannelEntry from './components/ChannelEntry';
import TerminalHub from './components/TerminalHub';
import { Shield, Monitor, LogOut, Lock, ChevronRight, Play, LayoutGrid, Radio, Loader2, Signal, Zap, Globe, KeyRound, AlertCircle } from 'lucide-react';

type UserRole = 'leader' | 'hub' | 'bravo' | 'alfa' | 'charlie' | 'fox';

const App: React.FC = () => {
  const [data, setData] = useState<ReportData>(INITIAL_REPORT_DATA);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [isLeaderAuthenticated, setIsLeaderAuthenticated] = useState(false);
  const [activeChannel, setActiveChannel] = useState<string | null>(null);
  const [activeShiftId, setActiveShiftId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<'standalone' | 'connected'>('standalone');

  // MONITORAMENTO DE REDE E SINCRONISMO (HUB E LÍDER)
  useEffect(() => {
    const monitorNetwork = async () => {
      if (!supabase) return;
      
      try {
        const { data: activeShifts, error: syncError } = await supabase
          .from('relatorios')
          .select('*')
          .is('entregue_por', null)
          .order('created_at', { ascending: false })
          .limit(1);

        if (syncError) throw syncError;

        if (activeShifts && activeShifts.length > 0) {
          const shift = activeShifts[0];
          setActiveShiftId(shift.id);
          setNetworkStatus('connected');
          
          if (shift.supervisor) {
            setData(prev => ({
              ...prev,
              shiftStarted: true,
              liderNome: shift.supervisor,
              turno: shift.turno,
              startTime: new Date(shift.created_at).toLocaleTimeString('pt-BR')
            }));
          }
        } else {
          setNetworkStatus('standalone');
        }
      } catch (err) {
        console.error("Erro de Rede AVSEC:", err);
      }
    };

    const params = new URLSearchParams(window.location.search);
    if (params.get('role') === 'hub') setCurrentRole('hub');

    monitorNetwork();
    const interval = setInterval(monitorNetwork, 4000); 
    return () => clearInterval(interval);
  }, [currentRole]);

  const handleStartShift = async (lider: typeof AVAILABLE_AGENTS[0], turno: string) => {
    setIsSyncing(true);
    if (supabase) {
      try {
        const { data: newShiftArray, error: insertError } = await supabase.from('relatorios').insert([{
          turno,
          supervisor: lider.nome,
          data_relatorio: new Date().toISOString().split('T')[0],
          recebimento_de: 'TURNO ATRIBUÍDO PELO LÍDER'
        }]).select();

        if (insertError) throw insertError;
        if (newShiftArray && newShiftArray.length > 0) {
          setActiveShiftId(newShiftArray[0].id);
        }
      } catch (e) {
        console.error("Erro ao atribuir turno:", e);
      }
    }

    setData(prev => ({
      ...prev,
      shiftStarted: true,
      liderNome: lider.nome,
      liderMat: lider.mat,
      turno,
      startTime: new Date().toLocaleTimeString('pt-BR')
    }));
    
    setTimeout(() => setIsSyncing(false), 1000);
  };

  const handleChannelUpdate = (view: string, newData: ChannelData) => {
    setData(prev => {
      const updatedCanais = { ...prev.canais, [view]: newData };
      const mapping: Record<string, keyof ReportData['efetivo']> = {
        bravo: 'domesticoBravo', charlie: 'funcionariosCharlie', alfa: 'internacionalAlfa', fox: 'tecaFox'
      };
      const efetivoKey = mapping[view];
      const updatedEfetivo = { ...prev.efetivo };
      if (efetivoKey) {
        updatedEfetivo[efetivoKey] = { ...prev.efetivo[efetivoKey], agents: newData.agentes, inspecoes: newData.inspecoes };
      }
      return { ...prev, canais: updatedCanais, efetivo: updatedEfetivo };
    });
  };

  // ROLE SELECTION
  if (!currentRole) {
    return (
      <div className="h-screen bg-[#05060a] flex flex-col items-center justify-center p-6">
        <div className="max-w-4xl w-full text-center space-y-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-blue-600 p-5 rounded-2xl shadow-[0_0_50px_rgba(37,99,235,0.4)]">
              <Shield className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-4xl font-black text-white uppercase tracking-[0.4em]">SISTEMA AVSEC</h1>
            <p className="text-blue-500 font-black uppercase tracking-[0.2em] text-xs">Airport Operational Command Centre</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <RoleCard 
              icon={<Monitor className="w-10 h-10" />}
              title="Portal Líder"
              subtitle="Atribuição de Turno e Gestão de Redes"
              onClick={() => setCurrentRole('leader')}
            />
            <RoleCard 
              icon={<Globe className="w-10 h-10" />}
              title="Terminal Hub"
              subtitle="Acesso Livre aos Canais de Inspeção"
              onClick={() => setCurrentRole('hub')}
            />
          </div>
        </div>
      </div>
    );
  }

  // LEADER AUTHENTICATION
  if (currentRole === 'leader' && !isLeaderAuthenticated) {
    return (
      <LeaderLogin 
        onSuccess={() => setIsLeaderAuthenticated(true)} 
        onBack={() => setCurrentRole(null)} 
      />
    );
  }

  // LEADER SHIFT ASSIGNMENT (Only if not assigned yet)
  if (currentRole === 'leader' && !data.shiftStarted) {
    return <StartShiftScreen onStart={handleStartShift} onBack={() => {
      setIsLeaderAuthenticated(false);
      setCurrentRole(null);
    }} isSyncing={isSyncing} />;
  }

  // CHANNEL ENTRY VIEW
  if (activeChannel) {
    return (
      <div className="h-screen flex flex-col bg-[#0f1117]">
        <header className="h-14 bg-[#1a1c26] border-b border-slate-700 flex items-center justify-between px-6 shrink-0 z-50">
          <div className="flex items-center gap-4">
             <button onClick={() => setActiveChannel(null)} className="p-2 hover:bg-white/5 rounded-full text-slate-400 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors">
               <LayoutGrid className="w-4 h-4" /> Voltar Hub
             </button>
             <div className="h-6 w-px bg-slate-700 mx-2"></div>
             <h1 className="text-[11px] font-black uppercase tracking-widest text-white">Estação de Trabalho: Canal {activeChannel.toUpperCase()}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1 border rounded-full ${networkStatus === 'connected' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
               <Zap className={`w-3 h-3 ${networkStatus === 'connected' ? 'text-emerald-500 fill-emerald-500' : 'text-amber-500'}`} />
               <span className={`text-[9px] font-black uppercase ${networkStatus === 'connected' ? 'text-emerald-500' : 'text-amber-500'}`}>
                 {networkStatus === 'connected' ? 'Transmitindo para HQ' : 'Modo Standalone'}
               </span>
            </div>
            {data.shiftStarted && (
              <div className="text-right border-l border-slate-700 pl-4">
                <div className="text-[10px] font-mono text-slate-300 font-bold uppercase">Supervisor: {data.liderNome}</div>
              </div>
            )}
          </div>
        </header>
        <main className="flex-grow overflow-hidden">
           <ChannelEntry canal={activeChannel} data={data.canais[activeChannel as keyof ReportData['canais']]} onUpdate={(newData) => handleChannelUpdate(activeChannel, newData)} />
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#0f1117] text-slate-200 overflow-hidden font-sans">
      <header className="h-16 bg-[#1a1c26] border-b border-slate-700 flex items-center justify-between px-8 shrink-0 z-50 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="bg-blue-600 p-2 rounded shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xs font-black uppercase tracking-[0.2em] text-white leading-none">
              {currentRole === 'leader' ? 'Centro de Comando (HQ)' : 'Hub de Terminais AVSEC'}
            </h1>
            <p className="text-[9px] text-blue-500 uppercase font-black tracking-[0.3em] mt-2">Manaus Airport Operational Network</p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-right border-l border-slate-700 pl-8">
            <p className="text-xs font-black text-white uppercase leading-none tracking-tight">{data.shiftStarted ? data.liderNome : 'AGUARDANDO ATRIBUIÇÃO'}</p>
            <div className="flex items-center justify-end gap-2 mt-2">
               <Signal className={`w-3.5 h-3.5 ${networkStatus === 'connected' ? 'text-emerald-500 animate-pulse' : 'text-slate-600'}`} />
               <p className={`text-[9px] font-mono font-bold uppercase tracking-widest ${networkStatus === 'connected' ? 'text-emerald-500' : 'text-slate-500'}`}>
                 {networkStatus === 'connected' ? 'Rede Sincronizada' : 'Rede Local Apenas'}
               </p>
            </div>
          </div>
          <button 
            onClick={() => {
              if (currentRole === 'hub') window.location.search = '';
              setIsLeaderAuthenticated(false);
              setCurrentRole(null);
            }}
            className="group flex items-center gap-3 bg-red-900/10 hover:bg-red-600 border border-red-500/30 hover:border-red-400 text-red-500 hover:text-white px-5 py-2 transition-all active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Sair</span>
          </button>
        </div>
      </header>
      <main className="flex-grow overflow-hidden relative">
        {currentRole === 'leader' ? (
          <LeaderDashboard data={data} activeShiftId={activeShiftId} />
        ) : (
          <TerminalHub data={data} onSelectChannel={(id) => setActiveChannel(id)} />
        )}
      </main>
    </div>
  );
};

const RoleCard = ({ icon, title, subtitle, onClick }: any) => (
  <button onClick={onClick} className="bg-[#11131a] border border-blue-500/30 p-10 flex flex-col items-center gap-6 transition-all hover:translate-y-[-8px] active:scale-95 group rounded shadow-[0_0_50px_rgba(0,0,0,0.5)] hover:bg-blue-600/5">
    <div className="p-6 bg-black/40 rounded-full group-hover:scale-110 group-hover:bg-black/60 transition-all border border-blue-500/10 group-hover:border-blue-500/40 text-blue-500">{icon}</div>
    <div className="text-center space-y-2">
      <h3 className="text-xl font-black uppercase tracking-[0.2em] text-white">{title}</h3>
      <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.1em] max-w-[200px] leading-relaxed group-hover:text-slate-400 transition-colors">{subtitle}</p>
    </div>
  </button>
);

const LeaderLogin = ({ onSuccess, onBack }: { onSuccess: () => void, onBack: () => void }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin') {
      onSuccess();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="h-screen bg-[#05060a] flex items-center justify-center p-6">
      <div className="bg-[#11131a] border border-blue-500/30 max-w-sm w-full p-10 shadow-2xl space-y-8 rounded">
        <div className="text-center space-y-2">
          <div className="bg-blue-600/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto border border-blue-500/20">
            <KeyRound className="w-8 h-8 text-blue-500" />
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-widest mt-4">Acesso Restrito</h2>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Área Reservada ao Comando Líder</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Credencial de Segurança</label>
            <div className="relative">
              <input 
                autoFocus
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="DIGITE A SENHA..."
                className={`w-full bg-black border ${error ? 'border-red-500 animate-shake' : 'border-slate-800 focus:border-blue-500'} p-4 text-center text-sm font-black text-white tracking-[0.5em] outline-none transition-all rounded`}
              />
            </div>
            {error && (
              <div className="flex items-center justify-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="w-3.5 h-3.5" /> Acesso Negado
              </div>
            )}
          </div>
          
          <div className="pt-2 space-y-4">
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white p-4 font-black text-[10px] uppercase tracking-[0.3em] shadow-[0_0_30px_rgba(37,99,235,0.2)] transition-all active:scale-95">
              Autenticar Terminal
            </button>
            <button type="button" onClick={onBack} className="w-full text-[9px] font-bold text-slate-600 hover:text-slate-400 uppercase tracking-[0.3em] transition-colors">
              Voltar ao Início
            </button>
          </div>
        </form>
      </div>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

const StartShiftScreen = ({ onStart, onBack, isSyncing }: any) => {
  const [selectedAgent, setSelectedAgent] = useState('');
  const [selectedShift, setSelectedShift] = useState('D');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const agent = AVAILABLE_AGENTS.find(a => a.mat === selectedAgent);
    if (agent) onStart(agent, selectedShift);
  };

  return (
    <div className="h-screen bg-[#05060a] flex items-center justify-center p-6">
      <div className="bg-[#11131a] border border-blue-500/30 max-w-xl w-full p-12 shadow-2xl space-y-10 rounded">
        <div className="flex items-center gap-5 border-b border-slate-800 pb-8">
           <div className="bg-blue-600 p-3 rounded shadow-[0_0_20px_rgba(37,99,235,0.4)]"><Play className="w-6 h-6 text-white" /></div>
           <div>
             <h2 className="text-2xl font-black text-white uppercase tracking-widest">Atribuição de Turno</h2>
             <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1">Vinculação Autorizada de Terminais</p>
           </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Líder Supervisor</label>
            <select required value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)} className="w-full bg-black border border-slate-800 p-5 text-sm font-bold text-slate-200 outline-none focus:border-blue-500 transition-colors rounded">
              <option value="">Identifique-se...</option>
              {AVAILABLE_AGENTS.map(a => <option key={a.mat} value={a.mat}>{a.nome} (MAT: {a.mat})</option>)}
            </select>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Turno Operacional</label>
            <div className="grid grid-cols-4 gap-4">
              {['A', 'B', 'C', 'D'].map(l => (
                <button key={l} type="button" onClick={() => setSelectedShift(l)} className={`py-5 border text-sm font-black transition-all rounded ${selectedShift === l ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]' : 'bg-black border-slate-800 text-slate-600 hover:border-slate-600'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="pt-6 space-y-4">
            <button disabled={isSyncing} type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white p-5 font-black text-xs uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(37,99,235,0.3)] flex items-center justify-center gap-4 transition-all active:scale-95 disabled:opacity-50 rounded">
              {isSyncing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 fill-white" />}
              ATRIBUIR TURNO E SINCRONIZAR TERMINAIS
            </button>
            <button type="button" onClick={onBack} className="w-full text-[10px] font-bold text-slate-600 hover:text-slate-400 uppercase tracking-[0.3em] transition-colors">Voltar ao Início</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default App;
