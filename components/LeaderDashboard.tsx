
import React, { useState, useEffect } from 'react';
import { ReportData, ChannelData, Occurrence } from '../types';
import { supabase } from '../supabase';
import { Activity, Clock, ShieldAlert, Plane, ClipboardCheck, Info, Map, CheckCircle2, AlertCircle, Scan, AlertTriangle, X, ExternalLink, LayoutGrid, Copy, Radio, RefreshCw, Zap, Network, Signal, UserCheck, Shield, UserPlus } from 'lucide-react';

interface Props {
  data: ReportData;
  activeShiftId: string | null;
}

const LeaderDashboard: React.FC<Props> = ({ data, activeShiftId }) => {
  const [selectedChannel, setSelectedChannel] = useState<{ name: string; occurrences: Occurrence[] } | null>(null);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [networkLogs, setNetworkLogs] = useState<{ id: string, msg: string, time: string }[]>([]);
  const hubUrl = `${window.location.origin}${window.location.pathname}?role=hub`;

  useEffect(() => {
    const logs = [
      { id: '1', msg: 'REDE ESTABILIZADA: TERMINAL BRAVO ONLINE', time: '18:05' },
      { id: '2', msg: 'DADOS RECEBIDOS: POSTO ALFA INTEGRADO', time: '18:12' },
      { id: '3', msg: 'VARREDURA VALIDADA: CANAL FOX OK', time: '18:24' }
    ];
    setNetworkLogs(logs);
  }, []);

  const copyHubLink = () => {
    navigator.clipboard.writeText(hubUrl);
    alert('Link do Hub copiado com sucesso!');
  };

  return (
    <div className="h-full w-full p-6 grid grid-cols-12 grid-rows-6 gap-6 overflow-hidden bg-[#0f1117] relative">
      
      {/* Modal de Atribuição de Turno */}
      {showShiftModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowShiftModal(false)} />
          <div className="relative bg-[#1a1c26] border border-blue-500/50 w-full max-w-md p-10 shadow-[0_0_100px_rgba(37,99,235,0.2)] animate-in zoom-in-95 duration-200 rounded-lg">
            <div className="flex flex-col items-center text-center space-y-8">
              <div className="bg-blue-600 p-5 rounded-full shadow-[0_0_30px_rgba(37,99,235,0.4)]">
                <UserCheck className="w-12 h-12 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white uppercase tracking-widest">Atribuição de Turno</h3>
                <p className="text-[10px] text-blue-500 font-bold uppercase tracking-[0.3em]">Comando de Operações SBEG</p>
              </div>
              
              <div className="w-full space-y-5">
                <div className="bg-black/40 border border-slate-800 p-6 rounded-lg text-left">
                  <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Líder Supervisor Responsável</span>
                  <div className="flex items-center gap-4">
                     <div className="bg-blue-500/10 p-2 rounded border border-blue-500/20">
                        <Shield className="w-5 h-5 text-blue-500" />
                     </div>
                     <span className="text-xl font-black text-white uppercase tracking-tight">{data.liderNome || '---'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/40 border border-slate-800 p-5 rounded-lg text-left">
                    <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Turno Ativo</span>
                    <span className="text-sm font-black text-emerald-400 uppercase">Grupo {data.turno || '---'}</span>
                  </div>
                  <div className="bg-black/40 border border-slate-800 p-5 rounded-lg text-left">
                    <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Status Rede</span>
                    <span className="text-sm font-black text-blue-400 uppercase flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                       Sincronizado
                    </span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setShowShiftModal(false)} 
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 text-[12px] uppercase tracking-widest rounded-lg transition-all active:scale-95 shadow-xl shadow-blue-900/20"
              >
                Confirmar e Voltar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes de Alerta */}
      {selectedChannel && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedChannel(null)} />
          <div className="relative bg-[#1a1c26] border border-red-500/50 w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl rounded-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-red-900/20">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h3 className="text-sm font-black uppercase tracking-widest text-white">Relatório de Ocorrências: {selectedChannel.name}</h3>
              </div>
              <button onClick={() => setSelectedChannel(null)} className="p-1 hover:bg-white/10 rounded-full transition-colors text-slate-400">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-grow overflow-y-auto p-6 space-y-4">
              {selectedChannel.occurrences.length > 0 ? selectedChannel.occurrences.map((occ) => (
                <div key={occ.id} className="border-l-4 border-red-500 bg-black/30 p-5 space-y-2 rounded-r-lg">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-black bg-red-600 text-white px-2 py-0.5 rounded uppercase">INCIDENTE #{occ.numero}</span>
                    <span className="text-slate-500 font-mono text-[10px]">{occ.horario || '18:45'}</span>
                  </div>
                  <h4 className="text-lg font-bold text-white uppercase">{occ.descricao}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">{occ.detalhes}</p>
                </div>
              )) : (
                <div className="text-center py-20 text-slate-600 font-black uppercase tracking-widest">Nenhuma ocorrência crítica registrada</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Top Navigation Bar */}
      <div className="col-span-12 row-span-1 bg-[#1a1c26] border border-slate-700 p-5 flex items-center justify-between shadow-xl rounded-lg">
         <div className="flex gap-12 items-center">
            <div className="border-r border-slate-700 pr-12">
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Supervisor Responsável</label>
              <div className="text-xl font-black text-white uppercase tracking-tight leading-none">{data.liderNome || '---'}</div>
            </div>

            <div className="flex items-center gap-6 bg-black/40 border border-slate-800 p-2 rounded-lg px-4">
               <div className="flex items-center gap-4 border-r border-slate-700 pr-6">
                  <div className="relative">
                     <div className="absolute inset-0 bg-emerald-500 blur-md opacity-20"></div>
                     <Network className="w-6 h-6 text-emerald-500 relative" />
                  </div>
                  <div>
                    <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">Status da Rede</span>
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter tabular-nums">Terminais Online</span>
                  </div>
               </div>
               
               <button 
                 onClick={() => setShowShiftModal(true)}
                 className="flex items-center gap-3 px-8 py-2.5 rounded-lg font-black text-[11px] uppercase tracking-widest transition-all shadow-lg active:scale-95 bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30"
               >
                 <UserPlus className="w-4 h-4" />
                 Atribuir Turno
               </button>

               <div className="h-8 w-px bg-slate-700 mx-2"></div>

               <div className="flex items-center gap-3">
                  <a href={hubUrl} target="_blank" rel="noopener noreferrer" className="bg-blue-600 hover:bg-blue-500 p-2.5 rounded-lg text-white transition-all shadow-lg shadow-blue-900/20 active:scale-95" title="Abrir Hub de Terminais">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button onClick={copyHubLink} className="bg-slate-800 hover:bg-slate-700 p-2.5 rounded-lg text-slate-400 hover:text-white transition-all border border-slate-700" title="Copiar URL da Rede">
                    <Copy className="w-4 h-4" />
                  </button>
               </div>
            </div>
         </div>
         
         <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="block text-[10px] font-black text-blue-500 uppercase tracking-widest leading-none mb-1.5">Conectividade SBEG</span>
              <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-widest">Turno {data.turno} | {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20 shadow-inner">
              <Activity className="w-6 h-6 text-emerald-500" />
            </div>
         </div>
      </div>

      <div className="col-span-9 row-span-5 grid grid-cols-4 gap-6">
        <ChannelCard title="Bravo" data={data.canais.bravo} onOpenOccurrences={() => setSelectedChannel({ name: 'Canal Bravo', occurrences: data.canais.bravo.ocorrenciasList })} />
        <ChannelCard title="Alfa" data={data.canais.alfa} onOpenOccurrences={() => setSelectedChannel({ name: 'Canal Alfa', occurrences: data.canais.alfa.ocorrenciasList })} />
        <ChannelCard title="Fox" data={data.canais.fox} onOpenOccurrences={() => setSelectedChannel({ name: 'Canal Fox', occurrences: data.canais.fox.ocorrenciasList })} />
        <ChannelCard title="Charlie" data={data.canais.charlie} onOpenOccurrences={() => setSelectedChannel({ name: 'Canal Charlie', occurrences: data.canais.charlie.ocorrenciasList })} />
      </div>

      <div className="col-span-3 row-span-5 flex flex-col gap-6">
        <section className="flex-grow bg-[#1a1c26] border border-slate-700 shadow-xl overflow-hidden flex flex-col rounded-lg">
          <div className="bg-slate-700/20 p-4 border-b border-slate-700 flex justify-between items-center">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Log de Sincronia</h3>
            <Signal className="w-4 h-4 text-blue-500 animate-pulse" />
          </div>
          <div className="flex-grow p-4 space-y-4 overflow-y-auto font-mono text-[9px]">
            {networkLogs.map(log => (
               <div key={log.id} className="flex gap-4 border-l-2 border-slate-800 pl-4 pb-1 group transition-all">
                 <span className="text-slate-600 font-bold">{log.time}</span>
                 <span className="text-slate-400 group-hover:text-blue-400 transition-colors uppercase">{log.msg}</span>
               </div>
            ))}
            <div className="flex gap-4 border-l-2 border-blue-500/30 pl-4 pb-1 animate-pulse">
              <span className="text-slate-600 font-bold">LIVE</span>
              <span className="text-blue-500 font-black uppercase">Aguardando Pacotes de Dados...</span>
            </div>
          </div>
        </section>

        <section className="bg-[#1a1c26] border border-slate-700 shadow-xl rounded-lg">
          <div className="bg-slate-700/20 p-4 border-b border-slate-700 flex justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Estado de Varredura</h3>
            <ClipboardCheck className="w-4 h-4 text-slate-500" />
          </div>
          <div className="p-5 space-y-3">
            <SweepItem label="Bravo" status={data.canais.bravo.inspecoes.length > 0 ? 'OK' : 'PENDENTE'} />
            <SweepItem label="Charlie" status={data.canais.charlie.inspecoes.length > 0 ? 'OK' : 'PENDENTE'} />
            <SweepItem label="Alfa" status={data.canais.alfa.inspecoes.length > 0 ? 'OK' : 'PENDENTE'} />
            <SweepItem label="Fox" status={data.canais.fox.inspecoes.length > 0 ? 'OK' : 'PENDENTE'} />
          </div>
        </section>

        <section className="h-40 bg-[#1a1c26] border border-slate-700 flex flex-col overflow-hidden shadow-xl rounded-lg">
          <div className="bg-slate-700/20 p-4 border-b border-slate-700 flex justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Tráfego SBEG</h3>
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

const ChannelCard = ({ title, data, onOpenOccurrences }: any) => {
  const statusThemes: any = { 
    Pendente: 'border-slate-700 text-slate-600', 
    Preenchendo: 'border-blue-700 text-blue-300 bg-blue-500/10', 
    Finalizado: 'border-emerald-500/50 text-emerald-400 bg-emerald-600/20' 
  };
  
  return (
    <div className={`bg-[#1a1c26] border rounded-lg flex flex-col transition-all shadow-2xl overflow-hidden ${data.status === 'Finalizado' ? 'border-emerald-500/50' : 'border-slate-700'} ${data.ocorrenciasList.length > 0 ? 'border-red-500/50 ring-1 ring-red-500/20' : ''}`}>
      <div className="p-4 bg-slate-700/10 border-b border-slate-700 flex items-center justify-between">
        <h4 className="text-[12px] font-black uppercase tracking-widest text-white">Posto {title}</h4>
        <div className={`text-[8px] font-black uppercase px-2 py-1 rounded border ${statusThemes[data.status]}`}>
          {data.status === 'Pendente' ? 'OFFLINE' : data.status === 'Preenchendo' ? 'REPORTANDO' : 'VALIDADO'}
        </div>
      </div>
      <div className="p-5 flex-grow space-y-6">
        {data.ocorrenciasList.length > 0 && (
          <div onClick={onOpenOccurrences} className="bg-red-900/20 border border-red-500/30 p-3 rounded cursor-pointer hover:bg-red-900/40 transition-all group">
             <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">Alerta Crítico ({data.ocorrenciasList.length})</span>
                <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
             </div>
             <div className="text-[10px] font-bold text-white uppercase truncate">{data.ocorrenciasList[data.ocorrenciasList.length-1].descricao}</div>
          </div>
        )}
        
        <div>
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Agentes em Posto</label>
          <div className="bg-black/40 border border-slate-800 p-3 min-h-[70px] space-y-2 rounded">
            {data.agentes.map((a: any) => (
              <div key={a.id} className="flex justify-between text-[10px] border-b border-slate-800/50 pb-1.5 last:border-0 last:pb-0">
                <span className="font-bold text-slate-300 uppercase truncate pr-4">{a.nome.split(' ')[0]} {a.nome.split(' ').pop()}</span>
                <span className="font-mono text-slate-500 text-[9px]">{a.mat}</span>
              </div>
            ))}
            {data.agentes.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center py-2 opacity-30">
                 <Radio className="w-4 h-4 text-slate-600 mb-1" />
                 <span className="text-[8px] italic text-slate-600 uppercase font-black">Aguardando Login...</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="text-[9px] font-black text-slate-500 uppercase mb-2 block tracking-widest">Condição Local</label>
          <div className={`bg-black/40 border border-slate-800 px-4 py-3 text-[10px] font-black flex items-center gap-3 rounded ${data.condicaoPosto === 'Crítico' ? 'text-red-400' : 'text-emerald-400'}`}>
            <div className={`w-2.5 h-2.5 rounded-full ${data.condicaoPosto === 'Crítico' ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></div>
            {data.condicaoPosto.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
};

const SweepItem = ({ label, status }: any) => (
  <div className="flex items-center justify-between bg-black/30 p-3 border border-slate-800 rounded-lg">
    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
    <div className={`px-3 py-1 text-[9px] font-black tracking-widest rounded ${status === 'OK' ? 'text-emerald-500 bg-emerald-500/10' : 'text-amber-500 bg-amber-500/10'}`}>
      {status}
    </div>
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
