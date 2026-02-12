
import React, { useState, useEffect } from 'react';
import { ReportData, ChannelData } from './types';
import { getInitialReportData, AVAILABLE_AGENTS } from './constants';
import { supabase } from './supabase';
import LeaderDashboard from './components/LeaderDashboard';
import ChannelEntry from './components/ChannelEntry';
import TerminalHub from './components/TerminalHub';
import { Shield, Monitor, LogOut, Signal, Zap, Globe, KeyRound, Database, WifiOff, LayoutGrid, Loader2 } from 'lucide-react';

type UserRole = 'leader' | 'hub' | 'bravo' | 'alfa' | 'charlie' | 'fox';

const App: React.FC = () => {
  const [data, setData] = useState<ReportData>(getInitialReportData());
  const [dbAgents, setDbAgents] = useState<{mat: string, nome: string}[]>(AVAILABLE_AGENTS);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [isLeaderAuthenticated, setIsLeaderAuthenticated] = useState(false);
  const [activeChannel, setActiveChannel] = useState<string | null>(null);
  const [activeShiftId, setActiveShiftId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [dbStatus, setDbStatus] = useState<'online' | 'offline'>('offline');

  // 1. Carregar Agentes Reais do Supabase e Validar Sessão
  useEffect(() => {
    const init = async () => {
      if (!supabase) return;
      try {
        // Busca agentes da SUA base de dados
        const { data: agents, error: agentsError } = await supabase.from('agentes').select('mat, nome').order('nome');
        if (agents && agents.length > 0) setDbAgents(agents);
        
        // Verifica se há turno aberto
        const { data: shift, error } = await supabase.from('relatorios').select('id, supervisor, turno, created_at').is('entregue_por', null).order('created_at', { ascending: false }).limit(1).single();
        if (shift && !error) {
          setActiveShiftId(shift.id);
          setData(prev => ({
            ...prev,
            shiftStarted: true,
            liderNome: shift.supervisor,
            turno: shift.turno,
            startTime: new Date(shift.created_at).toLocaleTimeString('pt-BR')
          }));
        }
        setDbStatus('online');
      } catch (e) { setDbStatus('offline'); }
    };
    init();
  }, []);

  // 2. Motor de Atualização do Líder (HQ)
  useEffect(() => {
    if (currentRole !== 'leader' || !activeShiftId || dbStatus !== 'online') return;

    const fetchLeaderData = async () => {
      try {
        const [agentsRes, inspectionsRes] = await Promise.all([
          supabase.from('relatorio_agentes').select('*').eq('relatorio_id', activeShiftId),
          supabase.from('relatorio_inspecoes').select('*').eq('relatorio_id', activeShiftId)
        ]);

        const newData = getInitialReportData();
        newData.shiftStarted = true;
        newData.liderNome = data.liderNome;
        newData.turno = data.turno;
        newData.startTime = data.startTime;

        if (agentsRes.data) {
          agentsRes.data.forEach((a: any) => {
            const canal = a.canal as keyof ReportData['canais'];
            if (newData.canais[canal]) {
              newData.canais[canal].agentes.push({ id: a.id, mat: a.mat, nome: a.nome, horario: a.horario });
              newData.canais[canal].status = 'Finalizado';
            }
          });
        }

        if (inspectionsRes.data) {
          inspectionsRes.data.forEach((i: any) => {
            const canal = i.canal as keyof ReportData['canais'];
            if (newData.canais[canal]) {
              newData.canais[canal].inspecoes.push({ id: i.id, descricao: i.descricao, horario: i.horario, status: i.status });
            }
          });
        }

        setData(newData);
      } catch (err) { console.error("Erro sync HQ"); }
    };

    const interval = setInterval(fetchLeaderData, 4000);
    return () => clearInterval(interval);
  }, [currentRole, activeShiftId, dbStatus, data.liderNome, data.turno, data.startTime]);

  // 3. Reset Absoluto e Início de Turno
  const handleStartShift = async (lider: {mat: string, nome: string}, turno: string) => {
    setIsSyncing(true);
    
    // Limpeza Profunda: Cache e Estado
    localStorage.removeItem('avsec_global_data');
    const emptyData = getInitialReportData();
    emptyData.shiftStarted = true;
    emptyData.liderNome = lider.nome;
    emptyData.liderMat = lider.mat;
    emptyData.turno = turno;
    emptyData.startTime = new Date().toLocaleTimeString('pt-BR');
    
    setData(emptyData);

    if (dbStatus === 'online') {
      try {
        // Força fechamento de qualquer lixo anterior no banco
        await supabase.from('relatorios').update({ entregue_por: 'ENCERRADO PELO HQ' }).is('entregue_por', null);
        
        const { data: newShift, error } = await supabase.from('relatorios').insert([{
          turno, supervisor: lider.nome, data_relatorio: new Date().toISOString().split('T')[0], recebimento_de: 'NOVO TURNO'
        }]).select().single();
        
        if (newShift) setActiveShiftId(newShift.id);
      } catch (e) { console.error("Erro reset banco"); }
    }
    setTimeout(() => setIsSyncing(false), 800);
  };

  /**
   * Fix: Added missing handleChannelUpdate function
   * Updates the specific channel data within the report data state.
   */
  const handleChannelUpdate = (canal: string, newData: ChannelData) => {
    setData(prev => ({
      ...prev,
      canais: {
        ...prev.canais,
        [canal as keyof ReportData['canais']]: newData
      }
    }));
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
            <p className="text-blue-500 font-black uppercase tracking-[0.2em] text-xs leading-none">WFS Integrated Operations</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <RoleCard icon={<Monitor className="w-10 h-10" />} title="Portal Líder" subtitle="Comando e Gestão HQ" onClick={() => setCurrentRole('leader')} />
            <RoleCard icon={<Globe className="w-10 h-10" />} title="Terminal Hub" subtitle="Acesso Postos de Inspeção" onClick={() => setCurrentRole('hub')} />
          </div>
          <div className="flex items-center justify-center gap-6 pt-10 border-t border-slate-900">
             <div className="flex items-center gap-2">
                <Database className={`w-3.5 h-3.5 ${dbStatus === 'online' ? 'text-emerald-500' : 'text-amber-500'}`} />
                <span className={`text-[9px] font-black uppercase tracking-widest ${dbStatus === 'online' ? 'text-emerald-500' : 'text-amber-500'}`}>
                   {dbStatus === 'online' ? 'BASE DE DADOS CONECTADA' : 'MODO DE SEGURANÇA OFFLINE'}
                </span>
             </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentRole === 'leader' && !isLeaderAuthenticated) {
    return <LeaderLogin onSuccess={() => setIsLeaderAuthenticated(true)} onBack={() => setCurrentRole(null)} />;
  }

  if (currentRole === 'leader' && !data.shiftStarted) {
    return <StartShiftScreen agents={dbAgents} onStart={handleStartShift} onBack={() => { setIsLeaderAuthenticated(false); setCurrentRole(null); }} isSyncing={isSyncing} />;
  }

  if (activeChannel) {
    return (
      <div className="h-screen flex flex-col bg-[#0f1117]">
        <header className="h-14 bg-[#1a1c26] border-b border-slate-700 flex items-center justify-between px-6 shrink-0 z-50">
          <button onClick={() => setActiveChannel(null)} className="p-2 hover:bg-white/5 rounded-full text-slate-400 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors">
            <LayoutGrid className="w-4 h-4" /> Hub de Canais
          </button>
          <div className="flex items-center gap-4 text-emerald-500 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">
             <Zap className="w-3.5 h-3.5" />
             <span className="text-[10px] font-black uppercase">Posto Ativo: {activeChannel.toUpperCase()}</span>
          </div>
        </header>
        <main className="flex-grow overflow-hidden">
           <ChannelEntry agents={dbAgents} canal={activeChannel} data={data.canais[activeChannel as keyof ReportData['canais']]} activeShiftId={activeShiftId} onUpdate={(newData) => handleChannelUpdate(activeChannel, newData)} />
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#0f1117] text-slate-200 overflow-hidden font-sans">
      <header className="h-16 bg-[#1a1c26] border-b border-slate-700 flex items-center justify-between px-8 shrink-0 z-50 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="bg-blue-600 p-2 rounded shadow-lg shadow-blue-900/40"><Shield className="w-5 h-5 text-white" /></div>
          <div>
            <h1 className="text-xs font-black uppercase tracking-[0.2em] text-white leading-none">{currentRole === 'leader' ? 'CENTRO DE COMANDO HQ' : 'HUB DE OPERAÇÕES'}</h1>
            <p className="text-[9px] text-blue-500 uppercase font-black tracking-[0.3em] mt-2">Eduardo Gomes - SBEG</p>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="text-right border-l border-slate-700 pl-8">
            <p className="text-xs font-black text-white uppercase leading-none tracking-tight">{data.shiftStarted ? data.liderNome : '---'}</p>
            <div className="flex items-center justify-end gap-2 mt-2">
               <Signal className={`w-3.5 h-3.5 text-emerald-500 animate-pulse`} />
               <p className="text-[9px] font-mono font-bold uppercase text-emerald-500">Rede Ativa</p>
            </div>
          </div>
          <button onClick={() => { window.location.search = ''; }} className="group flex items-center gap-3 bg-red-900/10 hover:bg-red-600 border border-red-500/30 text-red-500 hover:text-white px-5 py-2 transition-all rounded">
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
  <button onClick={onClick} className="bg-[#11131a] border border-blue-500/20 p-10 flex flex-col items-center gap-6 transition-all hover:translate-y-[-5px] hover:border-blue-500/50 active:scale-95 group rounded-lg shadow-2xl">
    <div className="p-6 bg-black/40 rounded-full text-blue-500 group-hover:scale-110 transition-transform">{icon}</div>
    <div className="text-center space-y-2">
      <h3 className="text-xl font-black uppercase tracking-[0.2em] text-white">{title}</h3>
      <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.1em] group-hover:text-slate-300 transition-colors">{subtitle}</p>
    </div>
  </button>
);

const LeaderLogin = ({ onSuccess, onBack }: { onSuccess: () => void, onBack: () => void }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (password === 'admin') onSuccess(); else { setError(true); setTimeout(() => setError(false), 2000); } };
  return (
    <div className="h-screen bg-[#05060a] flex items-center justify-center p-6">
      <div className="bg-[#11131a] border border-blue-500/20 max-w-sm w-full p-10 shadow-2xl space-y-8 rounded-xl">
        <div className="p-4 bg-blue-600/10 w-fit mx-auto rounded-full"><KeyRound className="w-8 h-8 text-blue-500" /></div>
        <h2 className="text-xl font-black text-white uppercase tracking-widest text-center">HQ Central</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input autoFocus type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="SENHA DE ACESSO..." className={`w-full bg-black border ${error ? 'border-red-500' : 'border-slate-800'} p-4 text-center text-xs font-black text-white tracking-[0.5em] outline-none rounded-lg focus:border-blue-500 transition-colors`} />
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white p-4 font-black text-[11px] uppercase tracking-[0.3em] rounded-lg shadow-lg shadow-blue-900/30 transition-all active:scale-95">Autenticar</button>
          <button type="button" onClick={onBack} className="w-full text-[9px] font-bold text-slate-600 uppercase hover:text-slate-400 transition-colors">Voltar ao Início</button>
        </form>
      </div>
    </div>
  );
};

const StartShiftScreen = ({ agents, onStart, onBack, isSyncing }: any) => {
  const [selectedAgent, setSelectedAgent] = useState('');
  const [selectedShift, setSelectedShift] = useState('A');
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); const agent = agents.find((a:any) => a.mat === selectedAgent); if (agent) onStart(agent, selectedShift); };
  return (
    <div className="h-screen bg-[#05060a] flex items-center justify-center p-6">
      <div className="bg-[#11131a] border border-blue-500/20 max-w-xl w-full p-12 shadow-2xl space-y-10 rounded-2xl text-center">
        <div className="space-y-2">
           <h2 className="text-2xl font-black text-white uppercase tracking-widest">Novo Turno Operacional</h2>
           <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-[0.2em]">O sistema será limpo para o novo supervisor</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8 text-left">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Supervisor de Plantão</label>
            <select required value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)} className="w-full bg-black border border-slate-800 p-5 text-sm font-bold text-slate-200 outline-none rounded-xl focus:border-blue-500 transition-colors">
              <option value="">Selecione na Base de Dados...</option>
              {agents.map((a:any) => <option key={a.mat} value={a.mat}>{a.nome} ({a.mat})</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Letra do Grupo</label>
            <div className="grid grid-cols-4 gap-4">
              {['A', 'B', 'C', 'D'].map(l => (
                <button key={l} type="button" onClick={() => setSelectedShift(l)} className={`py-5 border text-sm font-black rounded-xl transition-all active:scale-95 ${selectedShift === l ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-900/40' : 'bg-black border-slate-800 text-slate-600 hover:border-slate-600'}`}>{l}</button>
              ))}
            </div>
          </div>
          <button disabled={isSyncing} type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white p-5 font-black text-xs uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-emerald-900/30 transition-all active:scale-95 flex items-center justify-center gap-3">
            {isSyncing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
            {isSyncing ? 'RESETANDO REDE...' : 'LIBERAR REDE VAZIA'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default App;
