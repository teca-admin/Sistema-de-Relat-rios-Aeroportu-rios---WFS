
import React, { useState, useEffect } from 'react';
import { ReportData, ChannelData, Occurrence } from '../types';
import { supabase } from '../supabase';
import { Activity, Clock, ShieldAlert, Plane, ClipboardCheck, Info, Map, CheckCircle2, AlertCircle, Scan, AlertTriangle, X, ExternalLink, LayoutGrid, Copy, Radio, RefreshCw, Zap, Network, Signal } from 'lucide-react';

interface Props {
  data: ReportData;
  activeShiftId: string | null;
}

const LeaderDashboard: React.FC<Props> = ({ data, activeShiftId }) => {
  const [selectedChannel, setSelectedChannel] = useState<{ name: string; occurrences: Occurrence[] } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [networkLogs, setNetworkLogs] = useState<{ id: string, msg: string, time: string }[]>([]);
  const hubUrl = `${window.location.origin}${window.location.pathname}?role=hub`;

  // Simula logs de rede para efeito visual de monitoramento em tempo real
  useEffect(() => {
    const logs = [
      { id: '1', msg: 'CONEXÃO ESTABELECIDA: TERMINAL BRAVO', time: '18:05' },
      { id: '2', msg: 'FEEDBACK RECEBIDO: CANAL ALFA OK', time: '18:12' },
      { id: '3', msg: 'VARREDURA CONCLUÍDA: POSTO CHARLIE', time: '18:24' }
    ];
    setNetworkLogs(logs);
  }, []);

  const copyHubLink = () => {
    navigator.clipboard.writeText(hubUrl);
    alert('Link do Hub copiado! Use este endereço nos terminais dos canais.');
  };

  const reSyncNetwork = async () => {
    if (!activeShiftId || !supabase) {
      alert("Nenhuma sessão ativa detectada para sincronizar.");
      return;
    }
    
    setIsSyncing(true);
    try {
      const { error } = await supabase
        .from('relatorios')
        .update({ recebimento_de: `SINC. FORÇADA: ${new Date().toLocaleTimeString()}` })
        .eq('id', activeShiftId);
        
      if (error) throw error;
      
      const newLog = { id: Date.now().toString(), msg: 'PULSO DE REDE ENVIADO PARA TERMINAIS', time: new Date().toLocaleTimeString().slice(0, 5) };
      setNetworkLogs(prev => [newLog, ...prev].slice(0, 5));
      
    } catch (err) {
      console.error("Erro na reativação de rede:", err);
    } finally {
      setTimeout(() => setIsSyncing(false), 2000);
    }
  };

  return (
    <div className="h-full w-full p-6 grid grid-cols-12 grid-rows-6 gap-6 overflow-hidden bg-[#0f1117] relative">
      
      {/* Modal de Detalhes da Ocorrência */}
      {selectedChannel && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedChannel(null)} />
          <div className="relative bg-[#1a1c26] border border-red-500/50 w-full max-w-2xl max-h-[80vh] flex flex-col shadow-[0_0_50px_rgba(239,68,68,0.2)] animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-red-900/10">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h3 className="text-sm font-black uppercase tracking-widest text-white">Incidentes: {selectedChannel.name}</h3>
              </div>
              <button onClick={() => setSelectedChannel(null)} className="p-1 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              {selectedChannel.occurrences.map((occ) => (
                <div key={occ.id} className="border-l-2 border-red-500 bg-black/20 p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black bg-red-600 text-white px-2 py-0.5 rounded uppercase tracking-tighter">OCORRÊNCIA #{occ.numero}</span>
                    <div className="flex items-center gap-2 text-slate-500 font-mono text-xs"><Clock className="w-3.5 h-3.5" /> {occ.horario}</div>
                  </div>
                  <h4 className="text-lg font-bold text-white uppercase tracking-tight">{occ.descricao}</h4>
                  <p className="text-sm text-slate-300 leading-relaxed font-medium whitespace-pre-wrap">{occ.detalhes}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Header Central de Sincronismo */}
      <div className="col-span-12 row-span-1 bg-[#1a1c26] border border-slate-700 p-5 flex items-center justify-between shadow-2xl">
         <div className="flex gap-12 items-center">
            <div className="border-r border-slate-700 pr-12">
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Líder Supervisor (HQ)</label>
              <div className="text-lg font-black text-blue-400 uppercase tracking-tight leading-none">{data.liderNome || '---'}</div>
            </div>

            {/* PAINEL DE CONTROLE DE REDE */}
            <div className="flex items-center gap-5 bg-black/40 border border-slate-800 p-2 rounded px-4">
               <div className="flex items-center gap-4 border-r border-slate-700 pr-6">
                  <div className={`relative flex items-center justify-center`}>
                     <div className={`absolute w-4 h-4 rounded-full ${isSyncing ? 'bg-blue-500 animate-ping' : 'bg-emerald-500/20'}`}></div>
                     <Network className={`w-5 h-5 ${isSyncing ? 'text-blue-500' : 'text-emerald-500'}`} />
                  </div>
                  <div>
                    <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">Rede de Sincronia</span>
                    <span className="text-[10px] font-black text-white uppercase tracking-tighter tabular-nums">Terminais Ativos</span>
                  </div>
               </div>
               
               <button 
                 onClick={reSyncNetwork}
                 disabled={isSyncing}
                 className={`flex items-center gap-3 px-5 py-2 rounded font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95 ${isSyncing ? 'bg-slate-700 text-slate-400' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20'}`}
               >
                 {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-white" />}
                 {isSyncing ? 'ATUALIZANDO FEED...' : 'FORÇAR SINCRONISMO'}
               </button>

               <div className="h-8 w-px bg-slate-700 mx-2"></div>

               <div className="flex items-center gap-3">
                  <a href={hubUrl} target="_blank" rel="noopener noreferrer" className="bg-blue-600 hover:bg-blue-500 p-2 rounded text-white transition-all shadow-lg active:scale-95" title="Abrir Hub Externo">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button onClick={copyHubLink} className="bg-slate-800 hover:bg-slate-700 p-2 rounded text-slate-400 hover:text-white transition-all border border-slate-700" title="Copiar Link da Rede">
                    <Copy className="w-4 h-4" />
                  </button>
               </div>
            </div>
         </div>
         
         <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="block text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none mb-2">Turno Operacional Conectado</span>
              <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-widest">SBEG - Turno {data.turno} | {new Date().toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="bg-emerald-500/10 p-3 rounded border border-emerald-500/20">
              <Activity className="w-6 h-6 text-emerald-500" />
            </div>
         </div>
      </div>

      {/* Grid de Canais */}
      <div className="col-span-9 row-span-5 grid grid-cols-4 gap-6">
        <ChannelCard title="Bravo" data={data.canais.bravo} onOpenOccurrences={() => setSelectedChannel({ name: 'Canal Bravo', occurrences: data.canais.bravo.ocorrenciasList })} />
        <ChannelCard title="Alfa" data={data.canais.alfa} onOpenOccurrences={() => setSelectedChannel({ name: 'Canal Alfa', occurrences: data.canais.alfa.ocorrenciasList })} />
        <ChannelCard title="Fox" data={data.canais.fox} isFox onOpenOccurrences={() => setSelectedChannel({ name: 'Canal Fox (TECA)', occurrences: data.canais.fox.ocorrenciasList })} />
        <ChannelCard title="Charlie" data={data.canais.charlie} onOpenOccurrences={() => setSelectedChannel({ name: 'Canal Charlie', occurrences: data.canais.charlie.ocorrenciasList })} />
      </div>

      {/* Sidebar Monitoramento */}
      <div className="col-span-3 row-span-5 flex flex-col gap-6">
        {/* NETWORK LIVE FEED (NEW) */}
        <section className="flex-grow bg-[#1a1c26] border border-slate-700 shadow-xl overflow-hidden flex flex-col">
          <div className="bg-slate-700/20 p-4 border-b border-slate-700 flex justify-between items-center">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Feed de Rede AVSEC</h3>
            <Signal className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="flex-grow p-4 space-y-3 overflow-y-auto font-mono text-[9px]">
            {networkLogs.map(log => (
               <div key={log.id} className="flex gap-3 border-l border-slate-800 pl-3 pb-2 group">
                 <span className="text-slate-600 font-bold">{log.time}</span>
                 <span className="text-slate-400 group-hover:text-blue-400 transition-colors">{log.msg}</span>
               </div>
            ))}
            <div className="flex gap-3 border-l border-slate-800 pl-3 pb-2">
              <span className="text-slate-600 font-bold">LIVE</span>
              <span className="text-blue-500 animate-pulse font-black">ESCUTANDO TERMINAIS...</span>
            </div>
          </div>
        </section>

        <section className="bg-[#1a1c26] border border-slate-700 shadow-xl">
          <div className="bg-slate-700/20 p-4 border-b border-slate-700 flex justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Varreduras AVSEC</h3>
            <ClipboardCheck className="w-4 h-4 text-slate-500" />
          </div>
          <div className="p-5 space-y-3">
            <SweepItem label="Bravo" status={data.canais.bravo.inspecoes.length > 0 ? 'OK' : 'PENDENTE'} />
            <SweepItem label="Charlie" status={data.canais.charlie.inspecoes.length > 0 ? 'OK' : 'PENDENTE'} />
            <SweepItem label="Alfa" status={data.canais.alfa.inspecoes.length > 0 ? 'OK' : 'PENDENTE'} />
            <SweepItem label="Fox" status={data.canais.fox.inspecoes.length > 0 ? 'OK' : 'PENDENTE'} />
          </div>
        </section>

        <section className="h-40 bg-[#1a1c26] border border-slate-700 flex flex-col overflow-hidden shadow-xl">
          <div className="bg-slate-700/20 p-4 border-b border-slate-700 flex justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Fluxo de Tráfego</h3>
            <Plane className="w-4 h-4 text-slate-500" />
          </div>
          <div className="p-4 space-y-2 bg-black/30 flex-grow">
             <FlightRow flight="G3 1240" time="19:45" status="EMBARCADO" />
             <FlightRow flight="AD 4501" time="20:10" status="ESTIMADO" />
          </div>
        </section>
      </div>
    </div>
  );
};

const ChannelCard = ({ title, data, isFox, onOpenOccurrences }: any) => {
  const statusColors: any = { Pendente: 'border-slate-700 text-slate-600', Preenchendo: 'border-blue-700 text-blue-300 bg-blue-500/10', Finalizado: 'border-emerald-500/50 text-emerald-400 bg-emerald-600/20' };
  return (
    <div className={`bg-[#1a1c26] border flex flex-col hover:border-slate-500 transition-all shadow-2xl ${data.status === 'Finalizado' ? 'border-emerald-500/50' : 'border-slate-700'} ${data.ocorrenciasList.length > 0 ? 'border-red-500/40' : ''}`}>
      <div className="p-4 bg-slate-700/10 border-b border-slate-700 flex items-center justify-between">
        <h4 className="text-[12px] font-black uppercase tracking-widest text-white">Posto {title}</h4>
        <div className={`text-[8px] font-black uppercase px-2 py-0.5 border ${statusColors[data.status]}`}>{data.status === 'Pendente' ? 'OFFLINE' : data.status === 'Preenchendo' ? 'OPERANDO' : 'CONCLUÍDO'}</div>
      </div>
      <div className="p-5 flex-grow space-y-6">
        {data.ocorrenciasList.length > 0 && (
          <div onClick={onOpenOccurrences} className="bg-red-900/20 border border-red-500/30 p-3 rounded-sm cursor-pointer hover:bg-red-900/40 transition-colors group">
             <div className="flex items-center justify-between mb-2"><span className="text-[9px] font-black text-red-400 uppercase tracking-widest">Alertas ({data.ocorrenciasList.length})</span><AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" /></div>
             <div className="text-[10px] font-bold text-white uppercase truncate">{data.ocorrenciasList[data.ocorrenciasList.length-1].descricao}</div>
          </div>
        )}
        <div>
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Agentes Reportados</label>
          <div className="bg-black/40 border border-slate-800 p-3 min-h-[60px] space-y-1.5">
            {data.agentes.slice(0, 3).map((a: any) => (
              <div key={a.id} className="flex justify-between text-[10px] border-b border-slate-800/50 pb-1.5 last:border-0 last:pb-0">
                <span className="font-bold text-slate-300 uppercase truncate">{a.nome.split(' ')[0]} {a.nome.split(' ').pop()}</span>
                <span className="font-mono text-slate-500 text-[9px]">{a.mat}</span>
              </div>
            ))}
            {data.agentes.length === 0 && <span className="text-[9px] italic text-slate-700 uppercase font-black">Nenhum login detectado</span>}
          </div>
        </div>
        <div>
          <label className="text-[9px] font-black text-slate-500 uppercase mb-2 block tracking-widest">Condição Local</label>
          <div className={`bg-black/40 border border-slate-800 px-4 py-2.5 text-[10px] font-black flex items-center gap-3 rounded-sm ${data.condicaoPosto === 'Crítico' ? 'text-red-400' : 'text-emerald-400'}`}>
            <div className={`w-2 h-2 rounded-full ${data.condicaoPosto === 'Crítico' ? 'bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-emerald-500'}`}></div>
            {data.condicaoPosto.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
};

const SweepItem = ({ label, status }: any) => (
  <div className="flex items-center justify-between bg-black/30 p-3 border border-slate-800 rounded-sm">
    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
    <div className={`px-2 py-0.5 text-[9px] font-black tracking-[0.2em] ${status === 'OK' ? 'text-emerald-500 bg-emerald-500/10' : 'text-amber-500 bg-amber-500/10'}`}>[{status}]</div>
  </div>
);

const FlightRow = ({ flight, time, status }: any) => (
  <div className="flex justify-between items-center text-[10px] border-b border-slate-800/50 pb-2 last:border-0 last:pb-0">
    <span className="font-bold text-slate-200 tracking-widest">{flight}</span>
    <span className="font-mono text-slate-500">{time}</span>
    <span className={`font-black text-[8px] tracking-widest ${status === 'EMBARCADO' ? 'text-emerald-600' : 'text-amber-600'}`}>{status}</span>
  </div>
);

export default LeaderDashboard;
