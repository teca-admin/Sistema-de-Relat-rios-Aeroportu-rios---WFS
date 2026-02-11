
import React, { useState, useEffect } from 'react';
import { ReportData, ChannelData } from './types';
import { INITIAL_REPORT_DATA, AVAILABLE_AGENTS } from './constants';
import LeaderDashboard from './components/LeaderDashboard';
import ChannelEntry from './components/ChannelEntry';
import TerminalHub from './components/TerminalHub';
import { Shield, Monitor, LogOut, Lock, ChevronRight, Play, LayoutGrid } from 'lucide-react';

type UserRole = 'leader' | 'hub' | 'bravo' | 'alfa' | 'charlie' | 'fox';

const App: React.FC = () => {
  const [data, setData] = useState<ReportData>(INITIAL_REPORT_DATA);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [activeChannel, setActiveChannel] = useState<string | null>(null);

  // Detectar acesso via link externo (URL Parameter)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role');
    if (roleParam === 'hub') {
      setCurrentRole('hub');
    }
  }, []);

  const handleStartShift = (lider: typeof AVAILABLE_AGENTS[0], turno: string) => {
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

      return {
        ...prev,
        canais: updatedCanais,
        efetivo: updatedEfetivo
      };
    });
  };

  // 1. TELA DE SELEÇÃO DE ESTAÇÃO (HOME - APENAS LÍDER)
  if (!currentRole) {
    return (
      <div className="h-screen bg-[#05060a] flex flex-col items-center justify-center p-6 text-slate-300 font-sans">
        <div className="max-w-4xl w-full">
          <div className="flex flex-col items-center mb-16 space-y-4">
            <div className="bg-blue-600 p-4 rounded-xl shadow-[0_0_30px_rgba(37,99,235,0.3)] animate-pulse">
              <Shield className="w-12 h-12 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-black text-white uppercase tracking-[0.3em]">Sistema AVSEC Manaus</h1>
              <p className="text-blue-500 font-bold uppercase tracking-widest text-[10px] mt-2">WFS Operational Command Centre & Terminal Station</p>
            </div>
          </div>

          <div className="flex justify-center max-w-xl mx-auto">
            <RoleCard 
              icon={<Monitor className="w-12 h-12" />}
              title="Comando Líder"
              subtitle="HQ Analítico, Gestão e Abertura de Turno"
              color="blue"
              onClick={() => setCurrentRole('leader')}
            />
          </div>
          
          <div className="mt-16 text-center">
            <p className="text-[9px] text-slate-700 font-bold uppercase tracking-[0.4em] mb-4">Acesso Restrito ao Pessoal Autorizado</p>
            <div className="h-px w-24 bg-slate-800 mx-auto mb-4"></div>
            <div className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">
              © 2024 WFS Group - Airport Safety and Security
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. TELA DE ABERTURA DE TURNO (APENAS LÍDER)
  if (currentRole === 'leader' && !data.shiftStarted) {
    return <StartShiftScreen onStart={handleStartShift} onBack={() => setCurrentRole(null)} />;
  }

  // 3. TELA DE BLOQUEIO (HUB SEM TURNO INICIADO)
  if (currentRole === 'hub' && !data.shiftStarted) {
    return (
      <div className="h-screen bg-[#0f1117] flex items-center justify-center p-8 text-center">
        <div className="max-w-md space-y-6">
           <div className="flex justify-center">
             <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center">
               <Lock className="w-8 h-8 text-amber-500" />
             </div>
           </div>
           <h2 className="text-xl font-black text-white uppercase tracking-widest">Acesso Negado</h2>
           <p className="text-slate-400 text-sm font-medium leading-relaxed">
             O turno ainda não foi liberado pela supervisão no Comando Líder. 
             Por favor, aguarde a ativação operacional no QG.
           </p>
           <button 
             onClick={() => {
               window.location.search = ''; // Limpa o parâmetro da URL ao voltar
               setCurrentRole(null);
             }}
             className="text-[10px] font-bold uppercase text-slate-500 hover:text-white transition-colors"
           >
             Voltar para Início
           </button>
        </div>
      </div>
    );
  }

  // 4. VISUALIZAÇÃO DE FORMULÁRIO (DENTRO DO HUB)
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
               Terminal Operacional: Canal {activeChannel.toUpperCase()}
             </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[9px] font-black text-blue-500 uppercase tracking-widest">SBEG Airport - Manaus</div>
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

  // 5. APLICAÇÕES ATIVAS (LEADER DASH OU HUB SELETOR)
  return (
    <div className="h-screen flex flex-col bg-[#0f1117] text-slate-200 overflow-hidden font-sans">
      <header className="h-14 bg-[#1a1c26] border-b border-slate-700 flex items-center justify-between px-6 shrink-0 z-50 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-1.5 rounded-sm">
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
            <p className="text-[10px] font-black text-slate-100 uppercase leading-none">{data.liderNome || 'Aguardando Líder'}</p>
            <p className="text-[9px] text-blue-400 font-mono mt-1.5 font-bold uppercase">Mat: {data.liderMat} | Turno {data.turno}</p>
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

const RoleCard = ({ icon, title, subtitle, color, onClick }: any) => {
  const themes: any = {
    blue: 'border-blue-500/30 hover:bg-blue-600/10 text-blue-500 shadow-[0_0_40px_rgba(37,99,235,0.05)]',
    slate: 'border-slate-700 hover:bg-slate-700/30 text-slate-400'
  };

  return (
    <button 
      onClick={onClick}
      className={`bg-[#11131a] border ${themes[color]} p-16 flex flex-col items-center gap-6 transition-all hover:translate-y-[-6px] active:scale-95 group rounded-sm w-full`}
    >
      <div className="p-8 bg-black/20 rounded-full group-hover:scale-110 group-hover:bg-black/40 transition-all border border-transparent group-hover:border-current/10">{icon}</div>
      <div className="text-center">
        <h3 className="text-2xl font-black uppercase tracking-[0.2em] text-slate-200 group-hover:text-white transition-colors">{title}</h3>
        <p className="text-xs font-bold text-slate-600 uppercase mt-4 tracking-widest max-w-[250px] leading-relaxed group-hover:text-slate-400 transition-colors">{subtitle}</p>
      </div>
    </button>
  );
};

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
           <div className="bg-blue-600 p-2 rounded-sm"><Play className="w-5 h-5 text-white" /></div>
           <h2 className="text-xl font-black text-white uppercase tracking-widest">Abertura de Turno Operacional</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Líder Responsável</label>
            <select 
              required
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full bg-black border border-slate-800 p-4 text-sm font-bold text-slate-200 outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">Selecione o Líder...</option>
              {AVAILABLE_AGENTS.map(a => <option key={a.mat} value={a.mat}>{a.nome} (MAT: {a.mat})</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Letra do Turno</label>
            <div className="grid grid-cols-4 gap-3">
              {['A', 'B', 'C', 'D'].map(l => (
                <button 
                  key={l}
                  type="button"
                  onClick={() => setSelectedShift(l)}
                  className={`py-4 border text-sm font-black transition-all ${selectedShift === l ? 'bg-blue-600 border-blue-400 text-white' : 'bg-black border-slate-800 text-slate-600 hover:border-slate-600'}`}
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
              Iniciar Operação <ChevronRight className="w-4 h-4" />
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
