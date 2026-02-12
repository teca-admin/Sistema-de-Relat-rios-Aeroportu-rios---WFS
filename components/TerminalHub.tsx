
import React from 'react';
import { ReportData, ChannelData } from '../types';
import { Terminal, AlertTriangle, LayoutGrid, Clock, User, ArrowRight, Signal, Radio } from 'lucide-react';

interface Props {
  data: ReportData;
  onSelectChannel: (id: string) => void;
}

const TerminalHub: React.FC<Props> = ({ data, onSelectChannel }) => {
  return (
    <div className="h-full bg-[#0d0e12] p-8 overflow-y-auto flex flex-col items-center">
      <div className="max-w-6xl w-full space-y-10">
        
        {/* Hub Header Info */}
        <div className="flex justify-between items-end border-b border-slate-800 pb-8">
           <div className="space-y-2">
              <h2 className="text-3xl font-black text-white uppercase tracking-[0.15em]">Hub de Estações AVSEC</h2>
              <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Acesso liberado a todos os canais de inspeção SBEG</p>
           </div>
           <div className="flex gap-4">
              <div className="bg-slate-800/40 border border-slate-700 p-3 px-5 rounded-sm flex items-center gap-4">
                 <Radio className={`w-4 h-4 ${data.shiftStarted ? 'text-emerald-500' : 'text-amber-500'} animate-pulse`} />
                 <div>
                    <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest">Sinal da Rede</span>
                    <span className="text-[10px] font-black text-white uppercase">{data.shiftStarted ? 'HQ CONECTADO' : 'MODO LOCAL'}</span>
                 </div>
              </div>
              {data.shiftStarted && (
                <div className="bg-blue-600/10 border border-blue-500/20 p-3 px-5 rounded-sm flex items-center gap-4">
                   <User className="w-4 h-4 text-blue-400" />
                   <div>
                      <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest">Supervisor</span>
                      <span className="text-[10px] font-black text-blue-400 uppercase">{data.liderNome.split(' ')[0]} | Turno {data.turno}</span>
                   </div>
                </div>
              )}
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <HubStationCard 
            title="Bravo" 
            data={data.canais.bravo} 
            color="blue" 
            onClick={() => onSelectChannel('bravo')} 
          />
          <HubStationCard 
            title="Alfa" 
            data={data.canais.alfa} 
            color="amber" 
            onClick={() => onSelectChannel('alfa')} 
          />
          <HubStationCard 
            title="Charlie" 
            data={data.canais.charlie} 
            color="emerald" 
            onClick={() => onSelectChannel('charlie')} 
          />
          <HubStationCard 
            title="Fox" 
            data={data.canais.fox} 
            color="purple" 
            isFox 
            onClick={() => onSelectChannel('fox')} 
          />
        </div>

        <div className="pt-8 text-center">
           <div className="flex items-center justify-center gap-4 text-slate-700">
              <div className="h-px w-20 bg-slate-800"></div>
              <p className="text-[9px] font-black uppercase tracking-[0.4em]">Integrated Airport Operations Center - SBEG</p>
              <div className="h-px w-20 bg-slate-800"></div>
           </div>
        </div>
      </div>
    </div>
  );
};

const HubStationCard = ({ title, data, color, onClick }: { title: string, data: ChannelData, color: string, isFox?: boolean, onClick: () => void }) => {
  const themes: any = {
    blue: 'border-blue-500/20 hover:border-blue-500/50 text-blue-400 bg-blue-500/5 hover:bg-blue-500/10 shadow-[0_10px_30px_rgba(59,130,246,0.05)]',
    amber: 'border-amber-500/20 hover:border-amber-500/50 text-amber-400 bg-amber-500/5 hover:bg-amber-500/10 shadow-[0_10px_30px_rgba(245,158,11,0.05)]',
    emerald: 'border-emerald-500/20 hover:border-emerald-500/50 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 shadow-[0_10px_30px_rgba(16,185,129,0.05)]',
    purple: 'border-purple-500/20 hover:border-purple-500/50 text-purple-400 bg-purple-500/5 hover:bg-purple-500/10 shadow-[0_10px_30px_rgba(139,92,246,0.05)]'
  };

  return (
    <button 
      onClick={onClick}
      className={`border p-8 rounded flex flex-col gap-6 transition-all active:scale-[0.98] text-left group ${themes[color]}`}
    >
      <div className="flex justify-between items-start w-full">
        <div className="flex items-center gap-5">
          <div className="bg-black/40 p-4 rounded border border-white/5">
            <Terminal className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-black uppercase tracking-widest text-white leading-none">Estação {title}</h3>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 block">Canais de Inspeção</span>
          </div>
        </div>
        <div className="bg-black/20 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all group-hover:bg-white/10">
           <ArrowRight className="w-6 h-6 text-white" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full">
        <div className="bg-black/30 p-4 border border-white/5 rounded-sm">
           <div className="flex items-center gap-2 mb-2">
             <Signal className="w-3 h-3 text-slate-600" />
             <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Registros</span>
           </div>
           <span className="text-lg font-black text-white tabular-nums">
             {data.agentes.length + data.inspecoes.length + data.ocorrenciasList.length}
           </span>
        </div>

        <div className="bg-black/30 p-4 border border-white/5 rounded-sm">
           <div className="flex items-center gap-2 mb-2">
             <Clock className="w-3 h-3 text-slate-600" />
             <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Status Posto</span>
           </div>
           <span className={`text-[11px] font-black uppercase tracking-widest ${data.condicaoPosto === 'Crítico' ? 'text-red-500' : 'text-emerald-500'}`}>
             {data.condicaoPosto}
           </span>
        </div>
      </div>

      {data.ocorrenciasList.length > 0 && (
        <div className="w-full bg-red-500/10 border border-red-500/20 p-3 rounded-sm flex items-center gap-4">
          <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
          <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">
            {data.ocorrenciasList.length} Ocorrências Críticas Reportadas
          </span>
        </div>
      )}
    </button>
  );
};

export default TerminalHub;
