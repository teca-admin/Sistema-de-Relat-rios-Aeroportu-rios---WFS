
import React from 'react';
import { ReportData, ChannelData } from '../types';
import { Activity, Clock, ShieldAlert, Plane, ClipboardCheck, Info, Map, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  data: ReportData;
}

const LeaderDashboard: React.FC<Props> = ({ data }) => {
  return (
    <div className="h-full w-full p-6 grid grid-cols-12 grid-rows-6 gap-6 overflow-hidden bg-[#0f1117]">
      
      {/* Header Barra Técnica */}
      <div className="col-span-12 row-span-1 bg-[#1a1c26] border border-slate-700 p-4 flex items-center justify-between shadow-sm">
         <div className="flex gap-12">
            <div className="border-r border-slate-700 pr-12">
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Responsável pelo Turno</label>
              <div className="text-xs font-bold text-blue-300 uppercase tracking-wider">{data.liderNome}</div>
            </div>
            <div className="border-r border-slate-700 pr-12">
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Matrícula</label>
              <div className="text-xs font-mono text-slate-200 font-bold">{data.liderMat}</div>
            </div>
            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Ref. de Horário</label>
              <div className="text-xs font-bold text-slate-200 uppercase">{data.turno}</div>
            </div>
         </div>
         <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="block text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Sincronização Central</span>
              <span className="text-[10px] font-mono text-slate-500 font-bold">ATIVO: 99.9%</span>
            </div>
            <Activity className="w-5 h-5 text-emerald-400" />
         </div>
      </div>

      {/* Grid de Canais */}
      <div className="col-span-9 row-span-5 grid grid-cols-4 gap-6">
        <ChannelCard title="Cnl Bravo" data={data.canais.bravo} color="blue" />
        <ChannelCard title="Cnl Alfa" data={data.canais.alfa} color="amber" />
        <ChannelCard title="Cnl Fox" data={data.canais.fox} color="purple" />
        <ChannelCard title="Cnl Charlie" data={data.canais.charlie} color="emerald" />
      </div>

      {/* Sidebar de Monitoramento */}
      <div className="col-span-3 row-span-5 flex flex-col gap-6">
        <section className="bg-[#1a1c26] border border-slate-700">
          <div className="bg-slate-700/20 p-3 border-b border-slate-700 flex justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">Status de Varreduras</h3>
            <ClipboardCheck className="w-4 h-4 text-slate-400" />
          </div>
          <div className="p-4 space-y-2.5">
            <SweepItem label="Bravo" status="OK" />
            <SweepItem label="Charlie" status="OK" />
            <SweepItem label="Alfa" status="PENDENTE" />
            <SweepItem label="Fox" status="OK" />
          </div>
        </section>

        <section className="flex-grow bg-[#1a1c26] border border-slate-700 flex flex-col overflow-hidden">
          <div className="bg-slate-700/20 p-3 border-b border-slate-700 flex justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">Cronograma de Voos</h3>
            <Plane className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex-grow flex items-center justify-center p-6 bg-black/20">
             <div className="text-center opacity-30">
                <Map className="w-10 h-10 mx-auto mb-3 text-slate-400" />
                <p className="text-[9px] font-bold uppercase text-slate-300 tracking-widest">Painel de Tráfego</p>
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

const ChannelCard = ({ title, data, color }: { title: string, data: ChannelData, color: string }) => {
  const statusColors = {
    Pendente: 'border-slate-600 text-slate-400',
    Preenchendo: 'border-blue-700 text-blue-300 bg-blue-500/10',
    Finalizado: 'border-emerald-700 text-emerald-300 bg-emerald-500/10'
  };

  const statusTraduzido = {
    Pendente: 'PENDENTE',
    Preenchendo: 'EM EDIÇÃO',
    Finalizado: 'CONCLUÍDO'
  };

  return (
    <div className="bg-[#1a1c26] border border-slate-700 flex flex-col hover:border-slate-500 transition-all shadow-md">
      <div className="p-3 bg-slate-700/10 border-b border-slate-700 flex items-center justify-between">
        <h4 className="text-[11px] font-bold uppercase tracking-widest text-white">{title}</h4>
        <div className={`text-[9px] font-bold uppercase px-2 py-0.5 border ${statusColors[data.status]}`}>
          {statusTraduzido[data.status]}
        </div>
      </div>
      
      <div className="p-4 flex-grow space-y-5">
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
          <div className="bg-black/30 border border-slate-700 px-3 py-2 text-[10px] font-bold text-emerald-400 flex items-center gap-3 rounded-sm">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div>
            {data.condicaoPosto.toUpperCase()}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
            <div className="bg-black/30 border border-slate-700 p-1.5 text-[9px] font-bold text-slate-400 text-center uppercase rounded-sm">RX-01: <span className="text-emerald-500">OK</span></div>
            <div className="bg-black/30 border border-slate-700 p-1.5 text-[9px] font-bold text-slate-400 text-center uppercase rounded-sm">PDM: <span className="text-emerald-500">OK</span></div>
        </div>

        <div>
          <label className="text-[9px] font-bold text-slate-500 uppercase mb-2 block">Notas do Turno</label>
          <div className="bg-black/30 border border-slate-700 p-2.5 text-[10px] text-slate-400 italic leading-snug h-16 overflow-hidden rounded-sm font-medium">
            {data.ocorrencias || 'Operação transcorrendo em conformidade com as normas AVSEC.'}
          </div>
        </div>
      </div>
    </div>
  );
};

const SweepItem = ({ label, status }: { label: string, status: 'OK' | 'PENDENTE' }) => (
  <div className="flex items-center justify-between bg-black/20 p-2.5 border border-slate-700 rounded-sm">
    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
    <div className={`px-2 py-0.5 text-[9px] font-black tracking-widest ${status === 'OK' ? 'text-emerald-400' : 'text-amber-500'}`}>
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
