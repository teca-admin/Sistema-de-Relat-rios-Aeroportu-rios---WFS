
import React from 'react';
import { ReportData, ChannelData } from '../types';
import { Terminal, AlertTriangle, LayoutGrid, Clock, User, ArrowRight } from 'lucide-react';

interface Props {
  data: ReportData;
  onSelectChannel: (id: string) => void;
}

const TerminalHub: React.FC<Props> = ({ data, onSelectChannel }) => {
  return (
    <div className="h-full bg-[#0d0e12] p-8 overflow-y-auto flex flex-col items-center justify-center">
      <div className="max-w-6xl w-full space-y-12">
        
        <div className="text-center space-y-3">
           <h2 className="text-3xl font-black text-white uppercase tracking-[0.2em]">Selecione sua Estação de Trabalho</h2>
           <p className="text-slate-500 font-bold uppercase tracking-widest text-xs italic">Acesso liberado pela supervisão: Turno {data.turno}</p>
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

        <div className="pt-8 border-t border-slate-800 text-center">
           <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Ambiente de Operação Restrito - WFS Manaus SBEG</p>
        </div>
      </div>
    </div>
  );
};

const HubStationCard = ({ title, data, color, isFox, onClick }: { title: string, data: ChannelData, color: string, isFox?: boolean, onClick: () => void }) => {
  const themes: any = {
    blue: 'border-blue-500/20 hover:border-blue-500/50 text-blue-400 bg-blue-500/5 hover:bg-blue-500/10',
    amber: 'border-amber-500/20 hover:border-amber-500/50 text-amber-400 bg-amber-500/5 hover:bg-amber-500/10',
    emerald: 'border-emerald-500/20 hover:border-emerald-500/50 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10',
    purple: 'border-purple-500/20 hover:border-purple-500/50 text-purple-400 bg-purple-500/5 hover:bg-purple-500/10'
  };

  return (
    <button 
      onClick={onClick}
      className={`border p-8 rounded-sm space-y-6 transition-all active:scale-[0.98] text-left group flex flex-col ${themes[color]}`}
    >
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-4">
          <div className="bg-black/40 p-3 rounded">
            <Terminal className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-black uppercase tracking-widest text-white">Canal {title}</h3>
        </div>
        <div className="flex items-center gap-3">
           <span className="text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Acessar Terminal</span>
           <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full">
        <div className="bg-black/20 p-3 border border-white/5 rounded-sm">
           <span className="block text-[9px] font-bold uppercase text-slate-500 tracking-wider mb-1">Status Turno</span>
           <span className={`text-[11px] font-black uppercase tracking-widest ${data.status === 'Finalizado' ? 'text-emerald-500' : 'text-blue-500'}`}>
             {data.status === 'Finalizado' ? 'Concluído' : 'Em Aberto'}
           </span>
        </div>

        <div className="bg-black/20 p-3 border border-white/5 rounded-sm">
           <span className="block text-[9px] font-bold uppercase text-slate-500 tracking-wider mb-1">Efetivo</span>
           <span className="text-[11px] font-black text-white">{data.agentes.length} Agentes</span>
        </div>
      </div>

      {data.ocorrenciasList.length > 0 && (
        <div className="w-full bg-red-500/10 border border-red-500/20 p-3 rounded-sm flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">
            {data.ocorrenciasList.length} Incidentes Críticos Registrados
          </span>
        </div>
      )}
    </button>
  );
};

export default TerminalHub;
