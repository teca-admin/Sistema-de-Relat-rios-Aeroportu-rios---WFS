
import React, { useState, useEffect } from 'react';
import { ReportData, ChannelData } from './types';
import { INITIAL_REPORT_DATA, AVAILABLE_AGENTS } from './constants';
import { supabase } from './supabase';
import LeaderDashboard from './components/LeaderDashboard';
import ChannelEntry from './components/ChannelEntry';
import TerminalHub from './components/TerminalHub';
import { Shield, Monitor, LogOut, Lock, ChevronRight, Play, LayoutGrid, Radio, Loader2, Signal } from 'lucide-react';

type UserRole = 'leader' | 'hub' | 'bravo' | 'alfa' | 'charlie' | 'fox';

const App: React.FC = () => {
  const [data, setData] = useState<ReportData>(INITIAL_REPORT_DATA);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [activeChannel, setActiveChannel] = useState<string | null>(null);
  const [activeShiftId, setActiveShiftId] = useState<string | null>(null);

  // Monitoramento Global de Turno (Polling para detecção automática entre máquinas)
  useEffect(() => {
    const checkActiveShift = async () => {
      if (!supabase) return;
      
      try {
        const { data: activeShifts } = await supabase
          .from('relatorios')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1);

        if (activeShifts && activeShifts.length > 0) {
          const shift = activeShifts[0];
          const isToday = new Date(shift.created_at).toDateString() === new Date().toDateString();
          
          // Se o turno está ativo e não foi finalizado (entregue_por nulo)
          if (isToday && !shift.entregue_por) {
            setActiveShiftId(shift.id);
            setData(prev => ({
              ...prev,
              shiftStarted: true,
              liderNome: shift.supervisor || 'Líder Conectado',
              liderMat: 'Sessão Ativa',
              turno: shift.turno,
              startTime: new Date(shift.created_at).toLocaleTimeString('pt-BR')
            }));
          } else {
            setData(prev => ({ ...prev, shiftStarted: false }));
            setActiveShiftId(null);
          }
        }
      } catch (err) {
        console.error("Erro na detecção de turno:", err);
      }
    };

    const params = new URLSearchParams(window.location.search);
    if (params.get('role') === 'hub') setCurrentRole('hub');

    checkActiveShift();
    const interval = setInterval(checkActiveShift, 3000); // Polling a cada 3s para resposta instantânea
    return () => clearInterval(interval);
  }, []);

  const handleStartShift = async (lider: typeof AVAILABLE_AGENTS[0], turno: string) => {
    if (supabase) {
      const { data: newShift } = await supabase.from('relatorios').insert([{
        turno,
        supervisor: lider.nome,
        data_relatorio: new Date().toISOString().split('T')[0],
        recebimento_de: 'Início de Turno via QG'
      }]).select().single();

      if (newShift) setActiveShiftId(newShift.id);
    }

    setData(prev => ({
      ...prev,
      shiftStarted: true,
      liderNome: lider.nome,
      liderMat: lider.mat,
      turno,
      startTime: new Date().toLocaleTimeString('pt-BR')
    }));
  };

  const handleChannelUpdate = (view: string, newData: ChannelData) => {
    setData(prev => {
      const updatedCanais = { ...prev.canais, [view]: newData };
      const mapping: Record<string, keyof ReportData['efetivo']> = {
        bravo: 'domesticoBravo',
        charlie: 'funcionariosCharlie',
        alfa: 'internacionalAlfa',
        fox: 'tecaFox'
      };
      const efetivoKey = mapping[view];
      const updatedEfetivo = { ...prev.efetivo };
      if (efetivoKey) {
        updatedEfetivo[efetivoKey] = {
          ...prev.efetivo[efetivoKey],
          agents: newData.agentes,
          inspecoes: newData.inspecoes
        };
      }
      return { ...prev, canais: updatedCanais, efetivo: updatedEfetivo };
    });
  };

  if (!currentRole) {
    return (
      <div className="h-screen bg-[#05060a] flex flex-col items-center justify-center p-6 text-slate-300 font-sans">
        <div className="max-w-4xl w-full">
          <div className="flex flex-col items-center mb-16 space-y-4">
            <div className="bg-blue-600 p-4 rounded-xl shadow-[0_0_30px_rgba(37,99,235,0.3)]">
              <Shield className="w-12 h-12 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-black text-white uppercase tracking-[0.3em]">Sistema AVSEC Manaus</h1>
              <p className="text-blue-500 font-bold uppercase tracking-widest text-[10px] mt-2">WFS Operational Command Centre</p>
            </div>
          </div>
          <div className="flex justify-center max-w-xl mx-auto">
            <RoleCard 
              icon={<Monitor className="w-12 h-12" />}
              title="Comando Líder"
              subtitle="HQ Analítico, Gestão e Ativação de Terminais"
              color="blue"
              onClick={() => setCurrentRole('leader')}
            />
          </div>
        </div>
      </div>
    );
  }

  if (currentRole === 'leader' && !data.shiftStarted) {
    return <StartShiftScreen onStart={handleStartShift} onBack={() => setCurrentRole(null)} />;
  }

  if (currentRole === 'hub' && !data.shiftStarted) {
    return (
      <div className="h-screen bg-[#0a0b10] flex items-center justify-center p-8 text-center">
        <div className="max-w-md space-y-8">
           <div className="relative flex justify-center">
             <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-ping"></div>
             <div className="relative w-24 h-24 bg-[#11131a] border border-blue-500/30 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.1)]">
               <Radio className="w-10 h-10 text-blue-500 animate-pulse" />
             </div>
           </div>
           <div className="space-y-4">
             <h2 className="text-xl font-black text-white uppercase tracking-[0.2em]">Sincronizando Estação</h2>
             <p className="text-slate-500 text-xs font-bold uppercase leading-relaxed tracking-widest">
               Aguardando abertura de turno no Comando Líder...
             </p>
           </div>
           <div className="flex flex-col gap-2 p-4 bg-blue-500/5 rounded border border-blue-500/10">
              <div className="flex items-center justify-center gap-3 text-[9px] font-black text-blue-400 uppercase tracking-widest">
                 <Loader2 className="w-3 h-3 animate-spin" /> Buscando Sinal Operacional
              </div>
              <p className="text-[8px] font-mono text-slate-600">ID TERMINAL: SBEG-HUB-01</p>
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
               <LayoutGrid className="w-4 h-4" /> Voltar Hub
             </button>
             <div className="h-6 w-px bg-slate-700 mx-2"></div>
             <h1 className="text-[11px] font-black uppercase tracking-widest text-white">
               Estação Terminal: Canal {activeChannel.toUpperCase()}
             </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
               <span className="text-[9px] font-black text-emerald-500 uppercase">Sincronizado</span>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-mono text-slate-300 font-bold">Líder: {data.liderNome.split(' ')[0]} | Turno {data.turno}</div>
            </div>
          </div>
        </header>
        <main className="flex-grow overflow-hidden">
           <ChannelEntry 
              canal={activeChannel} 
              data={data.canais[activeChannel as keyof ReportData['canais']]} 
              onUpdate={(newData) => handleChannelUpdate(activeChannel, newData)}
            />
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#0f1117] text-slate-200 overflow-hidden font-sans">
      <header className="h-14 bg-[#1a1c26] border-b border-slate-700 flex items-center justify-between px-6 shrink-0 z-50 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-1.5 rounded-sm shadow-[0_0_15px_rgba(37,99,235,0.4)]">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-[11px] font-black uppercase tracking-[0.15em] text-white leading-none">
              {currentRole === 'leader' ? 'Centro de Comando Operacional (HQ)' : 'Hub de Terminais Segregados'}
            </h1>
            <p className="text-[9px] text-blue-500 uppercase font-black tracking-widest mt-1.5">SBEG Airport Services - Operação Integrada</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right border-l border-slate-700 pl-6">
            <p className="text-[10px] font-black text-slate-100 uppercase leading-none">{data.liderNome}</p>
            <div className="flex items-center justify-end gap-2 mt-1">
               <Signal className="w-3 h-3 text-emerald-500" />
               <p className="text-[9px] text-blue-400 font-mono font-bold uppercase tracking-tighter">Conexão Ativa #{activeShiftId?.slice(0, 5) || '...'}</p>
            </div>
          </div>
          <button 
            onClick={() => {
              if (currentRole === 'hub') window.location.search = '';
              setCurrentRole(null);
            }}
            className="group flex items-center gap-3 bg-red-900/10 hover:bg-red-600 border border-red-500/30 hover:border-red-400 text-red-500 hover:text-white px-4 py-1.5 transition-all active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Logout</span>
          </button>
        </div>
      </header>

      <main className="flex-grow overflow-hidden relative">
        {currentRole === 'leader' ? (
          <LeaderDashboard data={data} />
        ) : (
          <TerminalHub data={data} onSelectChannel={(id) => setActiveChannel(id)} />
        )}
      </main>
    </div>
  );
};

const RoleCard = ({ icon, title, subtitle, color, onClick }: any) => (
  <button 
    onClick={onClick}
    className="bg-[#11131a] border border-blue-500/30 p-16 flex flex-col items-center gap-6 transition-all hover:translate-y-[-6px] active:scale-95 group rounded-sm w-full shadow-[0_0_40px_rgba(37,99,235,0.05)] hover:bg-blue-600/5"
  >
    <div className="p-8 bg-black/20 rounded-full group-hover:scale-110 group-hover:bg-black/40 transition-all border border-transparent group-hover:border-blue-500/20 text-blue-500">{icon}</div>
    <div className="text-center">
      <h3 className="text-2xl font-black uppercase tracking-[0.2em] text-slate-200 group-hover:text-white transition-colors">{title}</h3>
      <p className="text-xs font-bold text-slate-600 uppercase mt-4 tracking-widest max-w-[250px] leading-relaxed group-hover:text-slate-400 transition-colors">{subtitle}</p>
    </div>
  </button>
);

const StartShiftScreen = ({ onStart, onBack }: any) => {
  const [selectedAgent, setSelectedAgent] = useState('');
  const [selectedShift, setSelectedShift] = useState('D');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const agent = AVAILABLE_AGENTS.find(a => a.mat === selectedAgent);
    if (agent) onStart(agent, selectedShift);
  };

  return (
    <div className="h-screen bg-[#05060a] flex items-center justify-center p-6">
      <div className="bg-[#11131a] border border-blue-500/30 max-w-lg w-full p-10 shadow-2xl">
        <div className="flex items-center gap-4 mb-8">
           <div className="bg-blue-600 p-2 rounded-sm shadow-[0_0_15px_rgba(37,99,235,0.3)]"><Play className="w-5 h-5 text-white" /></div>
           <h2 className="text-xl font-black text-white uppercase tracking-widest">Ativação Operacional de Turno</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Selecione o Líder Responsável</label>
            <select 
              required
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full bg-black border border-slate-800 p-4 text-sm font-bold text-slate-200 outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">Líder do Período...</option>
              {AVAILABLE_AGENTS.map(a => <option key={a.mat} value={a.mat}>{a.nome} (MAT: {a.mat})</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Letra do Turno SBEG</label>
            <div className="grid grid-cols-4 gap-3">
              {['A', 'B', 'C', 'D'].map(l => (
                <button 
                  key={l}
                  type="button"
                  onClick={() => setSelectedShift(l)}
                  className={`py-4 border text-sm font-black transition-all ${selectedShift === l ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.2)]' : 'bg-black border-slate-800 text-slate-600 hover:border-slate-600'}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="pt-4 flex flex-col gap-4">
            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white p-4 font-black text-xs uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(37,99,235,0.2)] flex items-center justify-center gap-3 transition-all"
            >
              Abrir Operação & Liberar Terminais <ChevronRight className="w-4 h-4" />
            </button>
            <button 
              type="button"
              onClick={onBack}
              className="text-[10px] font-bold text-slate-600 hover:text-slate-400 uppercase tracking-widest transition-colors"
            >
              Cancelar e Voltar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default App;
