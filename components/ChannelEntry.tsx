
import React, { useState } from 'react';
import { ChannelData, Agent, ChannelInspection } from '../types';
import { SHIFTS } from '../constants';
import { supabase } from '../supabase';
import { Plus, Trash2, Send, ShieldAlert, Clock, Loader2, Info, ClipboardCheck, UserPlus, Database } from 'lucide-react';

interface Props {
  canal: string;
  data: ChannelData;
  agents: {mat: string, nome: string}[]; // Lista real vinda do App
  activeShiftId: string | null;
  onUpdate: (data: ChannelData) => void;
}

const ChannelEntry: React.FC<Props> = ({ canal, data, agents, activeShiftId, onUpdate }) => {
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [isTransmitting, setIsTransmitting] = useState(false);

  const addAgent = () => {
    const newAgent: Agent = { id: crypto.randomUUID(), mat: '', nome: '', horario: SHIFTS[0].value };
    onUpdate({ ...data, agentes: [...data.agentes, newAgent], status: 'Preenchendo' });
  };

  const updateAgent = (id: string, updates: Partial<Agent>) => {
    onUpdate({
      ...data,
      agentes: data.agentes.map(a => a.id === id ? { ...a, ...updates } : a),
      status: 'Preenchendo'
    });
  };

  const addInspection = () => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const newInsp: ChannelInspection = { 
      id: crypto.randomUUID(), 
      descricao: 'Varredura realizada conforme diretrizes AVSEC', 
      horario: currentTime, 
      status: 'OK' 
    };
    onUpdate({ ...data, inspecoes: [...data.inspecoes, newInsp], status: 'Preenchendo' });
  };

  const handleTransmit = async () => {
    if (!activeShiftId) {
      alert("ERRO: Painel HQ não liberou a rede. Solicite 'Liberar Rede' ao Líder.");
      return;
    }
    
    setIsTransmitting(true);
    const syncTime = new Date().toLocaleTimeString('pt-BR');
    
    try {
      // Limpeza de pré-envio para este canal específico
      await Promise.all([
        supabase.from('relatorio_agentes').delete().eq('relatorio_id', activeShiftId).eq('canal', canal),
        supabase.from('relatorio_inspecoes').delete().eq('relatorio_id', activeShiftId).eq('canal', canal)
      ]);

      if (data.agentes.length > 0) {
        await supabase.from('relatorio_agentes').insert(data.agentes.map(a => ({
          relatorio_id: activeShiftId, 
          canal: canal, 
          mat: a.mat, 
          nome: a.nome, 
          horario: a.horario
        })));
      }

      if (data.inspecoes.length > 0) {
        await supabase.from('relatorio_inspecoes').insert(data.inspecoes.map(i => ({
          relatorio_id: activeShiftId, 
          canal: canal, 
          descricao: i.descricao, 
          horario: i.horario, 
          status: i.status
        })));
      }

      onUpdate({ ...data, status: 'Finalizado' });
      setLastSync(syncTime);
    } catch (err) {
      alert("Falha técnica no envio.");
    } finally {
      setTimeout(() => setIsTransmitting(false), 600);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-8 space-y-8 bg-[#0f1117] pb-24 text-slate-200">
      <div className="flex items-center justify-between border-b border-slate-700 pb-6">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">PREENCHIMENTO DE POSTO: {canal.toUpperCase()}</h2>
          <div className="flex items-center gap-3 mt-2">
             <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded">
                <Database className="w-3 h-3" /> Base de Dados Conectada
             </div>
             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
               {lastSync ? `ÚLTIMO ENVIO AO HQ: ${lastSync}` : 'SESSÃO LIMPA - AGUARDANDO DADOS'}
             </p>
          </div>
        </div>
        <button 
          onClick={handleTransmit}
          disabled={isTransmitting}
          className={`px-10 py-4 font-black text-[12px] uppercase tracking-[0.2em] transition-all flex items-center gap-3 active:scale-95 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-xl shadow-blue-900/20`}
        >
          {isTransmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {isTransmitting ? 'TRANSMITINDO...' : 'ENVIAR DADOS AO HQ'}
        </button>
      </div>

      <div className="grid grid-cols-12 gap-10">
        <div className="col-span-12 lg:col-span-7 space-y-8">
          <section className="bg-[#1a1c26] border border-slate-700 shadow-2xl rounded-xl overflow-hidden">
            <div className="bg-slate-700/20 p-5 flex justify-between items-center border-b border-slate-700">
               <div className="flex items-center gap-3 text-slate-300">
                  <ShieldAlert className="w-5 h-5 text-amber-500" />
                  <h3 className="text-[11px] font-black uppercase tracking-widest">Procedimentos e Varreduras</h3>
               </div>
               <button onClick={addInspection} className="text-[10px] font-black uppercase bg-amber-600 hover:bg-amber-500 text-white px-5 py-2 rounded-lg transition-colors">Log de Varredura</button>
            </div>
            <div className="p-6 space-y-4">
              {data.inspecoes.map((insp) => (
                <div key={insp.id} className="flex items-center gap-4 bg-black/40 p-4 border border-slate-700/50 rounded-lg group">
                  <Clock className="w-4 h-4 text-slate-600" />
                  <input type="time" value={insp.horario} onChange={(e) => onUpdate({...data, inspecoes: data.inspecoes.map(i => i.id === insp.id ? {...i, horario: e.target.value} : i)})} className="bg-transparent border-b border-slate-700 text-emerald-400 font-mono text-sm outline-none focus:border-emerald-500 transition-colors" />
                  <input value={insp.descricao} onChange={(e) => onUpdate({...data, inspecoes: data.inspecoes.map(i => i.id === insp.id ? {...i, descricao: e.target.value} : i)})} className="flex-grow bg-transparent border-b border-slate-700 text-sm py-1 outline-none font-medium text-slate-300 focus:border-blue-500 transition-colors" />
                  <button onClick={() => onUpdate({...data, inspecoes: data.inspecoes.filter(i => i.id !== insp.id)})} className="text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
              {data.inspecoes.length === 0 && (
                <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-xl opacity-30">
                  <ClipboardCheck className="w-8 h-8 mb-2" />
                  <p className="text-[10px] uppercase font-black tracking-[0.2em]">Nenhuma varredura registrada nesta sessão</p>
                </div>
              )}
            </div>
          </section>

          <section className="bg-[#1a1c26] border border-slate-700 shadow-2xl rounded-xl overflow-hidden">
            <div className="bg-slate-700/20 p-5 flex justify-between items-center border-b border-slate-700">
               <div className="flex items-center gap-3 text-slate-300">
                  <UserPlus className="w-5 h-5 text-blue-500" />
                  <h3 className="text-[11px] font-black uppercase tracking-widest">Efetivo Alocado no Posto</h3>
               </div>
               <button onClick={addAgent} className="text-[10px] font-black uppercase bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg transition-colors">Adicionar Agente</button>
            </div>
            <div className="p-6 space-y-4">
              {data.agentes.map((agent) => (
                <div key={agent.id} className="grid grid-cols-12 gap-5 items-end bg-black/40 p-5 border border-slate-700/50 rounded-xl">
                  <div className="col-span-6">
                    <label className="block text-[9px] font-black text-slate-500 uppercase mb-2 tracking-widest">Agente (Base de Dados)</label>
                    <select value={agent.nome} onChange={(e) => { const sel = agents.find(aa => aa.nome === e.target.value); updateAgent(agent.id, { nome: e.target.value, mat: sel?.mat || '' }); }} className="w-full p-3 bg-black border border-slate-700 text-sm font-bold text-slate-200 outline-none rounded-lg focus:border-blue-500 transition-colors">
                      <option value="">Selecione o Agente...</option>
                      {agents.map(aa => <option key={aa.mat} value={aa.nome}>{aa.nome} ({aa.mat})</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[9px] font-black text-slate-500 uppercase mb-2 tracking-widest">Mat.</label>
                    <input type="text" readOnly value={agent.mat} className="w-full p-3 bg-slate-900 border border-slate-800 text-sm font-mono text-slate-500 font-bold rounded-lg" />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-[9px] font-black text-slate-500 uppercase mb-2 tracking-widest">Horário</label>
                    <select value={agent.horario} onChange={(e) => updateAgent(agent.id, { horario: e.target.value })} className="w-full p-3 bg-black border border-slate-700 text-[10px] font-black uppercase text-slate-300 rounded-lg outline-none">
                      {SHIFTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div className="col-span-1 flex justify-center pb-3">
                    <button onClick={() => onUpdate({...data, agentes: data.agentes.filter(a => a.id !== agent.id)})} className="text-slate-600 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="col-span-12 lg:col-span-5 space-y-8">
          <section className="bg-[#1a1c26] border border-slate-700 p-8 space-y-8 shadow-2xl rounded-xl">
             <div className="flex items-center gap-3 text-slate-300 border-b border-slate-700 pb-5">
               <ShieldAlert className="w-5 h-5 text-blue-500" />
               <h3 className="text-[11px] font-black uppercase tracking-widest">Informações Complementares</h3>
             </div>
             <div>
               <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Condição do Posto de Proteção</label>
               <div className="grid grid-cols-3 gap-3">
                 {['Operacional', 'Atenção', 'Crítico'].map(cond => (
                   <button key={cond} onClick={() => onUpdate({...data, condicaoPosto: cond})} className={`py-4 border text-[11px] font-black uppercase transition-all rounded-lg ${data.condicaoPosto === cond ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' : 'bg-black border-slate-800 text-slate-600 hover:border-slate-600'}`}>{cond}</button>
                 ))}
               </div>
             </div>
             <div>
               <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Relato Detalhado da Passagem</label>
               <textarea value={data.ocorrencias} onChange={e => onUpdate({...data, ocorrencias: e.target.value})} placeholder="Descreva aqui se houve intercorrências técnicas ou operacionais..." className="w-full h-48 bg-black/40 border border-slate-800 p-5 text-sm text-slate-300 outline-none resize-none rounded-xl focus:border-blue-500 transition-colors" />
             </div>
             <div className="bg-blue-500/5 border border-blue-500/10 p-5 rounded-xl flex gap-4 items-start">
                <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase tracking-widest">Os dados preenchidos serão consolidados pelo Supervisor HQ em tempo real após a transmissão.</p>
             </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ChannelEntry;
