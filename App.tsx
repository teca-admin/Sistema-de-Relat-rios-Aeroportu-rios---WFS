
import React, { useState, useEffect } from 'react';
import { ReportData, ChannelData, Agent, ChannelInspection } from './types';
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

  // MOTOR DE SINCRONIZAÇÃO GLOBAL (Download de dados para o Líder)
  useEffect(() => {
    const fetchGlobalData = async () => {
      if (!supabase) return;
      
      try {
        // 1. Busca Turno Ativo
        const { data: activeShifts, error: shiftError } = await supabase
          .from('relatorios')
          .select('*')
          .is('entregue_por', null)
          .order('created_at', { ascending: false })
          .limit(1);

        if (shiftError) throw shiftError;

        if (activeShifts && activeShifts.length > 0) {
          const shift = activeShifts[0];
          const shiftId = shift.id;
          setActiveShiftId(shiftId);
          setNetworkStatus('connected');
          
          // 2. Busca Dados de Todos os Canais (Agentes e Inspeções)
          const [agentsRes, inspectionsRes] = await Promise.all([
            supabase.from('relatorio_agentes').select('*').eq('relatorio_id', shiftId),
            supabase.from('relatorio_inspecoes').select('*').eq('relatorio_id', shiftId)
          ]);

          // 3. Reconstroi o estado global baseado no DB
          const newData = { ...INITIAL_REPORT_DATA };
          newData.shiftStarted = true;
          newData.liderNome = shift.supervisor;
          newData.turno = shift.turno;
          newData.startTime = new Date(shift.created_at).toLocaleTimeString('pt-BR');

          // Mapeia Agentes vindos do banco para os canais corretos
          if (agentsRes.data) {
            agentsRes.data.forEach((dbAgent: any) => {
              const canal = dbAgent.canal as keyof ReportData['canais'];
              if (newData.canais[canal]) {
                newData.canais[canal].agentes.push({
                  id: dbAgent.id,
                  mat: dbAgent.mat,
                  nome: dbAgent.nome,
                  horario: dbAgent.horario
                });
                newData.canais[canal].status = 'Preenchendo';
              }
            });
          }

          // Mapeia Inspeções vindas do banco
          if (inspectionsRes.data) {
            inspectionsRes.data.forEach((dbInsp: any) => {
              const canal = dbInsp.canal as keyof ReportData['canais'];
              if (newData.canais[canal]) {
                newData.canais[canal].inspecoes.push({
                  id: dbInsp.id,
                  descricao: dbInsp.descricao,
                  horario: dbInsp.horario,
                  status: dbInsp.status
                });
              }
            });
          }

          // Só atualiza se houver mudança ou se for o líder (Hubs gerenciam localmente seu canal ativo)
          setData(prev => {
             // Mantém os dados locais do canal ativo se for um terminal hub
             if (activeChannel) {
                const updated = { ...newData };
                updated.canais[activeChannel as keyof ReportData['canais']] = prev.canais[activeChannel as keyof ReportData['canais']];
                return updated;
             }
             return newData;
          });
        } else {
          setNetworkStatus('standalone');
        }
      } catch (err) {
        console.error("Erro Crítico de Rede:", err);
      }
    };

    const interval = setInterval(fetchGlobalData, 5000); 
    return () => clearInterval(interval);
  }, [activeChannel]);

  const handleStartShift = async (lider: typeof AVAILABLE_AGENTS[0], turno: string) => {
    setIsSyncing(true);
    if (supabase) {
      try {
        const { data: newShiftArray, error: insertError } = await supabase.from('relatorios').insert([{
          turno,
          supervisor: lider.nome,
          data_relatorio: new Date().toISOString().split('T')[0],
          recebimento_de: 'NOVO TURNO'
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
      return { ...prev, canais: updatedCanais };
    });
  };

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

  if (currentRole === 'leader' && !isLeaderAuthenticated) {
    return <LeaderLogin onSuccess={() => setIsLeaderAuthenticated(true)} onBack={() => setCurrentRole(null)} />;
  }

  if (currentRole === 'leader' && !data.shiftStarted) {
    return <StartShiftScreen onStart={handleStartShift} onBack={() => { setIsLeaderAuthenticated(false); setCurrentRole(null); }} isSyncing={isSyncing} />;
  }

  if (activeChannel) {
    return (
      <div className="h-screen flex flex-col bg-[#0f1117]">
        <header className="h-14 bg-[#1a1c26] border-b border-slate-700 flex items-center justify-between px-6 shrink-0 z-50">
          <div className="flex items-center gap-4">
             <button onClick={() => setActiveChannel(null)} className="p-2 hover:bg-white/5 rounded-full text-slate-400 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors">
               <LayoutGrid className="w-4 h-4" /> Voltar Hub
             </button>
             <div className="h-6 w-px bg-slate-700 mx-2"></div>
             <h1 className="text-[11px] font-black uppercase tracking-widest text-white">Posto de Trabalho: Canal {activeChannel.toUpperCase()}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1 border rounded-full ${activeShiftId ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
               <Zap className={`w-3 h-3 ${activeShiftId ? 'text-emerald-500 fill-emerald-500' : 'text-amber-500'}`} />
               <span className={`text-[9px] font-black uppercase ${activeShiftId ? 'text-emerald-500' : 'text-amber-500'}`}>
                 {activeShiftId ? 'Sinal Ativo: Transmitindo' : 'Aguardando Turno HQ'}
               </span>
            </div>
          </div>
        </header>
        <main className="flex-grow overflow-hidden">
           <ChannelEntry 
             canal={activeChannel} 
             data={data.canais[activeChannel as keyof ReportData['canais']]} 
             activeShiftId={activeShiftId}
             onUpdate={(newData) => handleChannelUpdate(activeChannel, newData)} 
           />
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
            <p className="text-xs font-black text-white uppercase leading-none tracking-tight">{data.shiftStarted ? data.liderNome : '---'}</p>
            <div className="flex items-center justify-end gap-2 mt-2">
               <Signal className={`w-3.5 h-3.5 ${networkStatus === 'connected' ? 'text-emerald-500 animate-pulse' : 'text-slate-600'}`} />
               <p className={`text-[9px] font-mono font-bold uppercase tracking-widest ${networkStatus === 'connected' ? 'text-emerald-500' : 'text-slate-500'}`}>
                 {networkStatus === 'connected' ? 'Rede OK' : 'Local'}
               </p>
            </div>
          </div>
          <button onClick={() => { window.location.search = ''; }} className="group flex items-center gap-3 bg-red-900/10 hover:bg-red-600 border border-red-500/30 text-red-500 hover:text-white px-5 py-2 transition-all">
            <LogOut className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Sair</span>
          </button>
        </div>
      </header>
      <main className="flex-grow overflow-hidden relative">
        {currentRole === 'leader' ? <LeaderDashboard data={data} activeShiftId={activeShiftId} /> : <TerminalHub data={data} onSelectChannel={(id) => setActiveChannel(id)} />}
      </main>
    </div>
  );
};

const RoleCard = ({ icon, title, subtitle, onClick }: any) => (
  <button onClick={onClick} className="bg-[#11131a] border border-blue-500/30 p-10 flex flex-col items-center gap-6 transition-all hover:translate-y-[-8px] active:scale-95 group rounded shadow-[0_0_50px_rgba(0,0,0,0.5)] hover:bg-blue-600/5">
    <div className="p-6 bg-black/40 rounded-full text-blue-500">{icon}</div>
    <div className="text-center space-y-2">
      <h3 className="text-xl font-black uppercase tracking-[0.2em] text-white">{title}</h3>
      <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.1em] max-w-[200px] leading-relaxed group-hover:text-slate-400 transition-colors">{subtitle}</p>
    </div>
  </button>
);

const LeaderLogin = ({ onSuccess, onBack }: { onSuccess: () => void, onBack: () => void }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (password === 'admin') onSuccess(); else { setError(true); setTimeout(() => setError(false), 2000); } };
  return (
    <div className="h-screen bg-[#05060a] flex items-center justify-center p-6">
      <div className="bg-[#11131a] border border-blue-500/30 max-w-sm w-full p-10 shadow-2xl space-y-8 rounded">
        <div className="text-center space-y-2">
          <KeyRound className="w-8 h-8 text-blue-500 mx-auto" />
          <h2 className="text-xl font-black text-white uppercase tracking-widest mt-4">Comando Central</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input autoFocus type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="SENHA DE ACESSO..." className={`w-full bg-black border ${error ? 'border-red-500' : 'border-slate-800'} p-4 text-center text-sm font-black text-white tracking-[0.5em] outline-none rounded`} />
          <button type="submit" className="w-full bg-blue-600 text-white p-4 font-black text-[10px] uppercase tracking-[0.3em]">Autenticar</button>
          <button type="button" onClick={onBack} className="w-full text-[9px] font-bold text-slate-600 uppercase">Voltar</button>
        </form>
      </div>
    </div>
  );
};

const StartShiftScreen = ({ onStart, onBack, isSyncing }: any) => {
  const [selectedAgent, setSelectedAgent] = useState('');
  const [selectedShift, setSelectedShift] = useState('D');
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); const agent = AVAILABLE_AGENTS.find(a => a.mat === selectedAgent); if (agent) onStart(agent, selectedShift); };
  return (
    <div className="h-screen bg-[#05060a] flex items-center justify-center p-6">
      <div className="bg-[#11131a] border border-blue-500/30 max-w-xl w-full p-12 shadow-2xl space-y-10 rounded text-center">
        <h2 className="text-2xl font-black text-white uppercase tracking-widest">Atribuição de Turno</h2>
        <form onSubmit={handleSubmit} className="space-y-8 text-left">
          <select required value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)} className="w-full bg-black border border-slate-800 p-5 text-sm font-bold text-slate-200 outline-none rounded">
            <option value="">Identifique o Supervisor...</option>
            {AVAILABLE_AGENTS.map(a => <option key={a.mat} value={a.mat}>{a.nome}</option>)}
          </select>
          <div className="grid grid-cols-4 gap-4">
            {['A', 'B', 'C', 'D'].map(l => (
              <button key={l} type="button" onClick={() => setSelectedShift(l)} className={`py-5 border text-sm font-black rounded ${selectedShift === l ? 'bg-blue-600 border-blue-400 text-white' : 'bg-black border-slate-800 text-slate-600'}`}>{l}</button>
            ))}
          </div>
          <button disabled={isSyncing} type="submit" className="w-full bg-blue-600 text-white p-5 font-black text-xs uppercase tracking-[0.2em] rounded">
            {isSyncing ? 'Sincronizando...' : 'LIBERAR REDE E INICIAR'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default App;
