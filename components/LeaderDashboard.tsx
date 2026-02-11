
import React, { useState } from 'react';
import { ReportData, ChannelData, Occurrence } from '../types';
import { Activity, Clock, ShieldAlert, Plane, ClipboardCheck, Info, Map, CheckCircle2, AlertCircle, Scan, AlertTriangle, X } from 'lucide-react';

interface Props {
  data: ReportData;
}

const LeaderDashboard: React.FC<Props> = ({ data }) => {
  const [selectedChannel, setSelectedChannel] = useState<{ name: string; occurrences: Occurrence[] } | null>(null);

  return (
    <div className="h-full w-full p-6 grid grid-cols-12 grid-rows-6 gap-6 overflow-hidden bg-[#0f1117] relative">
      
      {/* Modal de Detalhes da Ocorrência */}
      {selectedChannel && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
            onClick={() => setSelectedChannel(null)}
          />
          <div className="relative bg-[#1a1c26] border border-red-500/50 w-full max-w-2xl max-h-[80vh] flex flex-col shadow-[0_0_50px_rgba(239,68,68,0.2)] animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-red-900/10">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h3 className="text-sm font-black uppercase tracking-widest text-white">
                  Registros de Incidentes: {selectedChannel.name}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedChannel(null)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              {selectedChannel.occurrences.map((occ) => (
                <div key={occ.id} className="border-l-2 border-red-500 bg-black/20 p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black bg-red-600 text-white px-2 py-0.5 rounded uppercase tracking-tighter">
                      OCORRÊNCIA #{occ.numero}
                    </span>
                    <div className="flex items-center gap-2 text-slate-500 font-mono text-xs">
                      <Clock className="w-3.5 h-3.5" /> {occ.horario}
                    </div>
                  </div>
                  <h4 className="text-lg font-bold text-white uppercase tracking-tight">{occ.descricao}</h4>
                  <p className="text-sm text-slate-300 leading-relaxed font-medium whitespace-pre-wrap">
                    {occ.detalhes}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-slate-700 bg-black/20 text-center">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Fim dos registros para este canal no turno atual
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header Barra Técnica */}
      <div className="col-span-12 row-span-1 bg-[#1a1c26] border border-slate-700 p-4 flex items-center justify-between shadow-sm">
         <div className="flex gap-12">
            <div className="border-r border-slate-700 pr-12">
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Líder Responsável</label>
              <div className="text-xs font-bold text-blue-300 uppercase tracking-wider">{data.liderNome}</div>
            </div>
            <div className="border-r border-slate-700 pr-12">
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Matrícula</label>
              <div className="text-xs font-mono text-slate-200 font-bold">{data.liderMat}</div>
            </div>
            <div className="border-r border-slate-700 pr-12">
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Ref. de Turno</label>
              <div className="text-xs font-bold text-slate-200 uppercase">{data.turno}</div>
            </div>
            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Turno Iniciado às</label>
              <div className="text-xs font-mono text-emerald-400 font-bold uppercase">{data.startTime || '--:--'}</div>
            </div>
         </div>
         <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="block text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Status: Operação Ativa</span>
              <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">Uptime SBEG: 100%</span>
            </div>
            <Activity className="w-5 h-5 text-emerald-400" />
         </div>
      </div>

      {/* Grid de Canais */}
      <div className="col-span-9 row-span-5 grid grid-cols-4 gap-6">
        <ChannelCard 
          title="Cnl Bravo" 
          data={data.canais.bravo} 
          color="blue" 
          onOpenOccurrences={() => setSelectedChannel({ name: 'Canal Bravo', occurrences: data.canais.bravo.ocorrenciasList })}
        />
        <ChannelCard 
          title="Cnl Alfa" 
          data={data.canais.alfa} 
          color="amber" 
          onOpenOccurrences={() => setSelectedChannel({ name: 'Canal Alfa', occurrences: data.canais.alfa.ocorrenciasList })}
        />
        <ChannelCard 
          title="Cnl Fox" 
          data={data.canais.fox} 
          color="purple" 
          isFox 
          onOpenOccurrences={() => setSelectedChannel({ name: 'Canal Fox (TECA)', occurrences: data.canais.fox.ocorrenciasList })}
        />
        <ChannelCard 
          title="Cnl Charlie" 
          data={data.canais.charlie} 
          color="emerald" 
          onOpenOccurrences={() => setSelectedChannel({ name: 'Canal Charlie', occurrences: data.canais.charlie.ocorrenciasList })}
        />
      </div>

      {/* Sidebar de Monitoramento */}
      <div className="col-span-3 row-span-5 flex flex-col gap-6">
        <section className="bg-[#1a1c26] border border-slate-700">
          <div className="bg-slate-700/20 p-3 border-b border-slate-700 flex justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">Status de Varreduras</h3>
            <ClipboardCheck className="w-4 h-4 text-slate-400" />
          </div>
          <div className="p-4 space-y-2.5">
            <SweepItem 
              label="Bravo" 
              status={data.canais.bravo.inspecoes.length > 0 ? 'OK' : 'PENDENTE'} 
            />
            <SweepItem 
              label="Charlie" 
              status={data.canais.charlie.inspecoes.length > 0 ? 'OK' : 'PENDENTE'} 
            />
            <SweepItem 
              label="Alfa" 
              status={data.canais.alfa.inspecoes.length > 0 ? 'OK' : 'PENDENTE'} 
            />
            <SweepItem 
              label="Fox" 
              status={data.canais.fox.inspecoes.length > 0 ? 'OK' : 'PENDENTE'} 
            />
          </div>
        </section>

        <section className="flex-grow bg-[#1a1c26] border border-slate-700 flex flex-col overflow-hidden">
          <div className="bg-slate-700/20 p-3 border-b border-slate-700 flex justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">Cronograma de Voos</h3>
            <Plane className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex-grow flex items-center justify-center p-6 bg-black/20 text-center">
             <div>
                <Map className="w-10 h-10 mx-auto mb-3 text-slate-500" />
                <p className="text-[9px] font-bold uppercase text-slate-400 tracking-widest">Fluxo em Tempo Real</p>
             </div>
          </div>
          <div className="p-3 space-y-2 border-t border-slate-700 bg-black/10">
             <FlightRow flight="G3 1240" time="19:45" status="EMBARCADO" />
             <FlightRow flight="AD 4501" time="20:10" status="ESTIMADO" />
          </div>
        </section>
      </div>
    </div>
  );
};

const ChannelCard = ({ 
  title, 
  data, 
  color, 
  isFox, 
  onOpenOccurrences 
}: { 
  title: string, 
  data: ChannelData, 
  color: string, 
  isFox?: boolean,
  onOpenOccurrences: () => void 
}) => {
  const statusColors = {
    Pendente: 'border-slate-600 text-slate-400',
    Preenchendo: 'border-blue-700 text-blue-300 bg-blue-500/10',
    Finalizado: 'border-blue-400 text-blue-200 bg-blue-600/20 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
  };

  const statusTraduzido = {
    Pendente: 'AGUARDANDO',
    Preenchendo: 'EM EDIÇÃO',
    Finalizado: 'FINALIZADO'
  };

  const lastScan = isFox && data.escaneamentos?.length > 0 ? data.escaneamentos[data.escaneamentos.length - 1] : null;
  const lastOcc = data.ocorrenciasList.length > 0 ? data.ocorrenciasList[data.ocorrenciasList.length - 1] : null;

  return (
    <div className={`bg-[#1a1c26] border flex flex-col hover:border-slate-500 transition-all shadow-md ${data.status === 'Finalizado' ? 'border-emerald-500/50' : 'border-slate-700'} ${data.ocorrenciasList.length > 0 ? 'border-red-500/30' : ''}`}>
      <div className="p-3 bg-slate-700/10 border-b border-slate-700 flex items-center justify-between">
        <h4 className="text-[11px] font-bold uppercase tracking-widest text-white">{title}</h4>
        <div className={`text-[9px] font-bold uppercase px-2 py-0.5 border ${statusColors[data.status]}`}>
          {statusTraduzido[data.status]}
        </div>
      </div>
      
      <div className="p-4 flex-grow space-y-5">
        {/* Atividade Fox */}
        {isFox && (
          <div className="bg-purple-900/10 border border-purple-500/20 p-3 rounded-sm">
             <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest">Atividade Logística</span>
                <Scan className="w-3.5 h-3.5 text-purple-400" />
             </div>
             {lastScan ? (
               <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-300">{lastScan.tipo}</span>
                    <span className="text-white">{lastScan.quantidade} {lastScan.tipo === 'Exportação' ? 'Paletes' : 'Vol.'}</span>
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono">Último APAC: {lastScan.apac.split(' ')[0]} às {lastScan.inicio}</div>
               </div>
             ) : (
               <p className="text-[10px] text-slate-600 italic font-semibold">Sem registros de escaneamento</p>
             )}
          </div>
        )}

        {/* Ocorrências Críticas */}
        {data.ocorrenciasList.length > 0 && (
          <div 
            onClick={onOpenOccurrences}
            className="bg-red-900/20 border border-red-500/30 p-3 rounded-sm cursor-pointer hover:bg-red-900/40 transition-colors group"
          >
             <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">Incidentes ({data.ocorrenciasList.length})</span>
                <AlertTriangle className="w-3.5 h-3.5 text-red-500 group-hover:scale-110 transition-transform" />
             </div>
             <div className="text-[10px] font-bold text-white uppercase truncate">{lastOcc?.descricao}</div>
             <div className="flex justify-between items-center mt-1">
               <div className="text-[9px] text-red-300/60 font-mono uppercase">Ver Detalhes...</div>
               <div className="text-[9px] text-red-300/60 font-mono">{lastOcc?.horario}</div>
             </div>
          </div>
        )}

        <div>
          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Efetivo Alocado</label>
          <div className="bg-black/30 border border-slate-700 p-2.5 min-h-[70px] rounded-sm">
            {data.agentes.map(a => (
              <div key={a.id} className="flex justify-between text-[11px] mb-1.5 border-b border-slate-800/50 last:border-0 pb-1">
                <span className="font-semibold text-slate-300 uppercase truncate">{a.nome.split(' ')[0]} {a.nome.split(' ').pop()}</span>
                <span className="font-mono text-slate-400 text-[10px] font-bold">{a.mat}</span>
              </div>
            ))}
            {data.agentes.length === 0 && <p className="text-[10px] text-slate-600 italic font-semibold">Sem alocação registrada</p>}
          </div>
        </div>

        <div>
          <label className="text-[9px] font-bold text-slate-500 uppercase mb-2 block">Status Operacional</label>
          <div className={`bg-black/30 border border-slate-700 px-3 py-2 text-[10px] font-bold flex items-center gap-3 rounded-sm ${data.condicaoPosto === 'Crítico' ? 'text-red-400' : 'text-emerald-400'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${data.condicaoPosto === 'Crítico' ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></div>
            {data.condicaoPosto.toUpperCase()}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
            <div className="bg-black/30 border border-slate-700 p-1.5 text-[9px] font-bold text-slate-400 text-center uppercase rounded-sm">RX-01: <span className="text-emerald-500 font-black">OK</span></div>
            <div className="bg-black/30 border border-slate-700 p-1.5 text-[9px] font-bold text-slate-400 text-center uppercase rounded-sm">PDM: <span className="text-emerald-500 font-black">OK</span></div>
        </div>
      </div>
    </div>
  );
};

const SweepItem = ({ label, status }: { label: string, status: 'OK' | 'PENDENTE' }) => (
  <div className="flex items-center justify-between bg-black/20 p-2.5 border border-slate-700 rounded-sm">
    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
    <div className={`px-2 py-0.5 text-[9px] font-black tracking-widest ${status === 'OK' ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-500 bg-amber-500/10'}`}>
      [{status}]
    </div>
  </div>
);

const FlightRow = ({ flight, time, status }: { flight: string, time: string, status: string }) => (
  <div className="flex justify-between items-center text-[10px] border-b border-slate-800/50 pb-1.5 last:border-0 last:pb-0">
    <span className="font-bold text-slate-200">{flight}</span>
    <span className="font-mono text-slate-400 font-bold">{time}</span>
    <span className={`font-black text-[9px] ${status === 'EMBARCADO' ? 'text-emerald-600' : 'text-amber-600'}`}>{status}</span>
  </div>
);

export default LeaderDashboard;
