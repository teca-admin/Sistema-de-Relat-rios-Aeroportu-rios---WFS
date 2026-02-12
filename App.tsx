
import React, { useState, useEffect } from 'react';
import { ReportData, ChannelData } from './types';
import { INITIAL_REPORT_DATA, AVAILABLE_AGENTS } from './constants';
import { supabase } from './supabase';
import LeaderDashboard from './components/LeaderDashboard';
import ChannelEntry from './components/ChannelEntry';
import TerminalHub from './components/TerminalHub';
import { Shield, Monitor, LogOut, Lock, ChevronRight, Play, LayoutGrid, Radio, Loader2, Signal, Zap } from 'lucide-react';

type UserRole = 'leader' | 'hub' | 'bravo' | 'alfa' | 'charlie' | 'fox';

const App: React.FC = () => {
  const [data, setData] = useState<ReportData>(INITIAL_REPORT_DATA);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [activeChannel, setActiveChannel] = useState<string | null>(null);
  const [activeShiftId, setActiveShiftId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // DETECTOR DE SINCRONISMO GLOBAL (Ouve o Líder)
  useEffect(() => {
    const syncTerminals = async () => {
      if (!supabase) return;
      
      try {
        // Busca o turno mais recente que ainda está em andamento (entregue_por é null)
        const { data: activeShifts, error } = await supabase
          .from('relatorios')
          .select('*')
          .is('entregue_por', null)
          .order('created_at', { ascending: false })
          .limit(1);

        if (activeShifts && activeShifts.length > 0) {
          const shift = activeShifts[0];
          // Sincroniza o estado global com o que está no banco
          setActiveShiftId(shift.id);
          setData(prev => ({
            ...prev,
            shiftStarted: true,
            liderNome: shift.supervisor,
            liderMat: 'CONECTADO VIA REDE',
            turno: shift.turno,
            startTime: new Date(shift.created_at).toLocaleTimeString('pt-BR')
          }));
        } else {
          // Se não houver turno ativo no banco, bloqueia os terminais
          if (data.shiftStarted) {
            setData(prev => ({ ...prev, shiftStarted: false }));
            setActiveShiftId(null);
          }
        }
      } catch (err) {
        console.error("Erro Crítico de Sincronismo:", err);
      }
    };

    const params = new URLSearchParams(window.location.search);
    if (params.get('role') === 'hub') setCurrentRole('hub');

    syncTerminals();
    const interval = setInterval(syncTerminals, 2500); // Polling agressivo para sincronização rápida
    return () => clearInterval(interval);
  }, [data.shiftStarted]);

  const handleStartShift = async (lider: typeof AVAILABLE_AGENTS[0], turno: string) => {
    setIsSyncing(true);
    if (supabase) {
      try {
        // 1. Força a criação do "Farol de Sincronismo" no banco
        const { data: newShift, error } = await supabase.from('relatorios').insert([{
          turno,
          supervisor: lider.nome,
          data_relatorio: new Date().toISOString().split('T')[0],
          recebimento_de: 'ATIVADO VIA COMANDO LÍDER'
        }]).select().single();

        if (error) throw error;
        if (newShift) setActiveShiftId(newShift.id);
      } catch (e) {
        alert("Erro ao propagar sinal de sincronismo. Verifique a conexão.");
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
    
    setTimeout(() => setIsSyncing(false), 1500);
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

  if (!currentRole) {
    return (
      <div className="h-screen bg-[#05060a] flex flex-col items-center justify-center p-6">
        <div className="max-w-4xl w-full text-center space-y-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-blue-600 p-5 rounded-2xl shadow-[0_0_50px_rgba(37,99,235,0.4)] animate-pulse">
              <Shield className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-4xl font-black text-white uppercase tracking-[0.4em]">SISTEMA AVSEC</h1>
            <p className="text-blue-500 font-black uppercase tracking-[0.2em] text-xs">Airport Operational Command Centre</p>
          </div>
          <div className="flex justify-center">
            <RoleCard 
              icon={<Monitor className="w-12 h-12" />}
              title="Comando Líder"
              subtitle="HQ Analítico e Ativação de Sincronismo"
              onClick={() => setCurrentRole('leader')}
            />
          </div>
        </div>
      </div>
    );
  }

  if (currentRole === 'leader' && !data.shiftStarted) {
    return <StartShiftScreen onStart={handleStartShift} onBack={() => setCurrentRole(null)} isSyncing={isSyncing} />;
  }

  if (currentRole === 'hub' && !data.shiftStarted) {
    return (
      <div className="h-screen bg-[#0a0b10] flex items-center justify-center p-8 text-center">
        <div className="max-w-md space-y-10">
           <div className="relative flex justify-center">
             <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-ping scale-150"></div>
             <div className="relative w-32 h-32 bg-[#11131a] border border-blue-500/30 rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(37,99,235,0.2)]">
               <Radio className="w-12 h-12 text-blue-500 animate-pulse" />
             </div>
           </div>
           <div className="space-y-4">
             <h2 className="text-2xl font-black text-white uppercase tracking-[0.3em]">Aguardando Sincronia</h2>
             <p className="text-slate-500 text-[10px] font-black uppercase leading-relaxed tracking-[0.2em] max-w-xs mx-auto">
               O Terminal está em escuta ativa. Aguardando o Líder clicar em "Iniciar Turno" no Comando Central.
             </p>
           </div>
           <div className="bg-blue-500/5 p-4 rounded border border-blue-500/20 space-y-2">
              <div className="flex items-center justify-center gap-3 text-[10px] font-black text-blue-400 uppercase tracking-widest">
                 <Loader2 className="w-4 h-4 animate-spin" /> Buscando Sinal do Líder...
              </div>
              <div className="h-px bg-blue-500/20 w-12 mx-auto my-2"></div>
              <p className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">Terminal ID: MAO-HUB-001</p>
           </div>
        </div>
      </div>
    );
  }

  if (activeChannel) {
    return (
      <div className="h-screen flex flex-col bg-[#0f1117]">
        <header className="h-14 bg-[#1a1c26] border-b border-slate-700 flex items-center justify-between px-6 shrink-0 z-50">
          <div className="flex items-center gap-4">
             <button onClick={() => setActiveChannel(null)} className="p-2 hover:bg-white/5 rounded-full text-slate-400 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors">
               <LayoutGrid className="w-4 h-4" /> Hub Central
             </button>
             <div className="h-6 w-px bg-slate-700 mx-2"></div>
             <h1 className="text-[11px] font-black uppercase tracking-widest text-white">Canal {activeChannel.toUpperCase()}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
               <Zap className="w-3 h-3 text-emerald-500 fill-emerald-500" />
               <span className="text-[9px] font-black text-emerald-500 uppercase">Sincronizado com QG</span>
            </div>
            <div className="text-right border-l border-slate-700 pl-4">
              <div className="text-[10px] font-mono text-slate-300 font-bold uppercase">Líder: {data.liderNome}</div>
            </div>
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
              {currentRole === 'leader' ? 'Comando Central de Operações (HQ)' : 'Hub de Terminais AVSEC'}
            </h1>
            <p className="text-[9px] text-blue-500 uppercase font-black tracking-[0.3em] mt-2">Manaus Airport Integrated System</p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-right border-l border-slate-700 pl-8">
            <p className="text-xs font-black text-white uppercase leading-none tracking-tight">{data.liderNome}</p>
            <div className="flex items-center justify-end gap-2 mt-2">
               <Signal className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
               <p className="text-[9px] text-emerald-500 font-mono font-bold uppercase tracking-widest">Sincronia Global Ativa</p>
            </div>
          </div>
          <button 
            onClick={() => {
              if (currentRole === 'hub') window.location.search = '';
              setCurrentRole(null);
            }}
            className="group flex items-center gap-3 bg-red-900/10 hover:bg-red-600 border border-red-500/30 hover:border-red-400 text-red-500 hover:text-white px-5 py-2 transition-all active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Encerrar Sessão</span>
          </button>
        </div>
      </header>
      <main className="flex-grow overflow-hidden relative">
        {currentRole === 'leader' ? <LeaderDashboard data={data} /> : <TerminalHub data={data} onSelectChannel={(id) => setActiveChannel(id)} />}
      </main>
    </div>
  );
};

const RoleCard = ({ icon, title, subtitle, onClick }: any) => (
  <button onClick={onClick} className="bg-[#11131a] border border-blue-500/30 p-16 flex flex-col items-center gap-8 transition-all hover:translate-y-[-8px] active:scale-95 group rounded shadow-[0_0_50px_rgba(0,0,0,0.5)] hover:bg-blue-600/5">
    <div className="p-10 bg-black/40 rounded-full group-hover:scale-110 group-hover:bg-black/60 transition-all border border-blue-500/10 group-hover:border-blue-500/40 text-blue-500">{icon}</div>
    <div className="text-center space-y-4">
      <h3 className="text-3xl font-black uppercase tracking-[0.3em] text-white">{title}</h3>
      <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] max-w-[300px] leading-relaxed group-hover:text-slate-400 transition-colors">{subtitle}</p>
    </div>
  </button>
);

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
      <div className="bg-[#11131a] border border-blue-500/30 max-w-xl w-full p-12 shadow-2xl space-y-10">
        <div className="flex items-center gap-5 border-b border-slate-800 pb-8">
           <div className="bg-blue-600 p-3 rounded shadow-[0_0_20px_rgba(37,99,235,0.4)]"><Play className="w-6 h-6 text-white" /></div>
           <div>
             <h2 className="text-2xl font-black text-white uppercase tracking-widest">Ativação do Turno</h2>
             <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1">Sincronismo Global de Terminais</p>
           </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Supervisor Responsável</label>
            <select required value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)} className="w-full bg-black border border-slate-800 p-5 text-sm font-bold text-slate-200 outline-none focus:border-blue-500 transition-colors rounded">
              <option value="">Selecione seu nome...</option>
              {AVAILABLE_AGENTS.map(a => <option key={a.mat} value={a.mat}>{a.nome} (MAT: {a.mat})</option>)}
            </select>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Letra Operacional</label>
            <div className="grid grid-cols-4 gap-4">
              {['A', 'B', 'C', 'D'].map(l => (
                <button key={l} type="button" onClick={() => setSelectedShift(l)} className={`py-5 border text-sm font-black transition-all rounded ${selectedShift === l ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]' : 'bg-black border-slate-800 text-slate-600 hover:border-slate-600'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="pt-6 space-y-4">
            <button disabled={isSyncing} type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white p-5 font-black text-xs uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(37,99,235,0.3)] flex items-center justify-center gap-4 transition-all active:scale-95 disabled:opacity-50">
              {isSyncing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 fill-white" />}
              INICIAR MEU TURNO E SINCRONIZAR TERMINAIS
            </button>
            <button type="button" onClick={onBack} className="w-full text-[10px] font-bold text-slate-600 hover:text-slate-400 uppercase tracking-[0.3em] transition-colors">Cancelar e Voltar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default App;
