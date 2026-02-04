
import React from 'react';
import { ChannelData, Agent, Equipment } from '../types';
import { SHIFTS, AVAILABLE_AGENTS } from '../constants';
import { Plus, Trash2, CheckCircle2, Package, UserPlus, Info, ClipboardCheck } from 'lucide-react';

interface Props {
  canal: string;
  data: ChannelData;
  onUpdate: (data: ChannelData) => void;
}

const ChannelEntry: React.FC<Props> = ({ canal, data, onUpdate }) => {
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

  const addEquipment = () => {
    const newEq: Equipment = { id: crypto.randomUUID(), tipo: '', status: 'OK', descricao: '', localizacao: '', manutencao: 'N/A' };
    onUpdate({ ...data, equipamentos: [...data.equipamentos, newEq] });
  };

  return (
    <div className="h-full overflow-y-auto p-8 space-y-8 bg-[#0f1117] pb-24">
      <div className="flex items-center justify-between border-b border-slate-700 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-tighter">ENTRADA DE DADOS: CANAL {canal.toUpperCase()}</h2>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2">Sistema de Registro em Tempo Real</p>
        </div>
        <button 
          onClick={() => onUpdate({ ...data, status: 'Finalizado' })}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-2.5 font-bold text-[12px] uppercase tracking-widest border border-emerald-500 transition-all shadow-lg"
        >
          Finalizar e Transmitir
        </button>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-7 space-y-8">
          <section className="bg-[#1a1c26] border border-slate-700 shadow-sm">
            <div className="bg-slate-700/20 p-4 flex justify-between items-center border-b border-slate-700">
               <div className="flex items-center gap-3 text-slate-300">
                  <UserPlus className="w-5 h-5" />
                  <h3 className="text-[11px] font-bold uppercase tracking-widest">Alocação de Agentes AVSEC</h3>
               </div>
               <button onClick={addAgent} className="text-[10px] font-bold uppercase bg-slate-600 hover:bg-slate-500 text-white px-4 py-1.5 border border-slate-500 rounded-sm transition-colors">Novo Agente</button>
            </div>
            <div className="p-5 space-y-3">
              {data.agentes.map((agent) => (
                <div key={agent.id} className="grid grid-cols-12 gap-4 items-end bg-black/20 p-3 border border-slate-700/50 rounded-sm">
                  <div className="col-span-6">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-wider">Nome do Agente</label>
                    <select 
                      value={agent.nome} 
                      onChange={(e) => {
                        const sel = AVAILABLE_AGENTS.find(aa => aa.nome === e.target.value);
                        updateAgent(agent.id, { 
                          nome: e.target.value, 
                          mat: sel?.mat || '' 
                        });
                      }}
                      className="w-full p-2 bg-[#1a1c26] border border-slate-600 text-sm font-bold text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
                    >
                      <option value="">Selecione...</option>
                      {AVAILABLE_AGENTS.map(aa => <option key={aa.mat} value={aa.nome}>{aa.nome}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-wider">MAT.</label>
                    <input type="text" readOnly value={agent.mat} className="w-full p-2 bg-slate-800/50 border border-slate-700 text-sm font-mono text-slate-400 font-bold outline-none" />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-wider">Horário</label>
                    <select value={agent.horario} onChange={(e) => updateAgent(agent.id, { horario: e.target.value })} className="w-full p-2 bg-[#1a1c26] border border-slate-600 text-xs font-bold text-slate-300 outline-none">
                      {SHIFTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div className="col-span-1 flex justify-center pb-1">
                    <button onClick={() => onUpdate({...data, agentes: data.agentes.filter(a => a.id !== agent.id)})} className="text-slate-500 hover:text-red-500 transition-colors p-1.5"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </div>
              ))}
              {data.agentes.length === 0 && (
                <div className="text-center py-6 border-2 border-dashed border-slate-700 rounded-sm opacity-40">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Nenhum agente alocado para este canal</p>
                </div>
              )}
            </div>
          </section>

          <section className="bg-[#1a1c26] border border-slate-700 shadow-sm">
            <div className="bg-slate-700/20 p-4 flex justify-between items-center border-b border-slate-700">
               <div className="flex items-center gap-3 text-slate-300">
                  <Package className="w-5 h-5" />
                  <h3 className="text-[11px] font-bold uppercase tracking-widest">Sistemas e Equipamentos</h3>
               </div>
               <button onClick={addEquipment} className="text-[10px] font-bold uppercase bg-slate-600 hover:bg-slate-500 text-white px-4 py-1.5 border border-slate-500 rounded-sm transition-colors">Registrar Item</button>
            </div>
            <div className="p-5 space-y-3">
              {data.equipamentos.map((eq) => (
                <div key={eq.id} className="grid grid-cols-12 gap-3 bg-black/20 p-3 border border-slate-700/50 items-center rounded-sm">
                  <div className="col-span-3">
                    <input placeholder="Unidade" value={eq.tipo} onChange={(e) => onUpdate({...data, equipamentos: data.equipamentos.map(i => i.id === eq.id ? {...i, tipo: e.target.value} : i)})} className="w-full p-2 bg-[#1a1c26] border border-slate-600 text-xs font-bold text-slate-200" />
                  </div>
                  <div className="col-span-3">
                    <select value={eq.status} onChange={(e) => onUpdate({...data, equipamentos: data.equipamentos.map(i => i.id === eq.id ? {...i, status: e.target.value as any} : i)})} className="w-full p-2 bg-[#1a1c26] border border-slate-600 text-xs font-bold text-slate-200">
                      <option value="OK">OPERACIONAL</option>
                      <option value="Manutenção">MANUTENÇÃO</option>
                    </select>
                  </div>
                  <div className="col-span-5">
                    <input placeholder="Notas técnicas / Defeito observado" className="w-full p-2 bg-[#1a1c26] border border-slate-600 text-xs font-medium text-slate-300" />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button onClick={() => onUpdate({...data, equipamentos: data.equipamentos.filter(i => i.id !== eq.id)})} className="text-slate-500 hover:text-red-500 transition-colors p-1"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="col-span-12 lg:col-span-5 space-y-8">
          <section className="bg-[#1a1c26] border border-slate-700 p-6 space-y-8 shadow-sm">
            <div className="flex items-center gap-3 text-slate-300 border-b border-slate-700 pb-4">
              <ClipboardCheck className="w-5 h-5 text-blue-400" />
              <h3 className="text-[11px] font-bold uppercase tracking-widest">Diagnóstico Operacional</h3>
            </div>
            
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Nível de Operação do Posto</label>
              <div className="flex gap-2">
                {['Operacional', 'Atenção', 'Crítico'].map(cond => (
                  <button 
                    key={cond}
                    onClick={() => onUpdate({...data, condicaoPosto: cond})}
                    className={`flex-grow py-3 border text-[11px] font-bold uppercase transition-all rounded-sm ${data.condicaoPosto === cond ? 'bg-emerald-900/40 border-emerald-500 text-emerald-300 shadow-sm' : 'bg-black/20 border-slate-700 text-slate-500 hover:border-slate-500'}`}
                  >
                    {cond}
                  </button>
                ))}
              </div>
            </div>

            {canal === 'fox' && (
              <div className="bg-black/30 p-5 border border-slate-700 space-y-4 rounded-sm">
                 <h4 className="text-[10px] font-bold text-purple-300 uppercase tracking-[0.2em] mb-2">Registro de Escaneamento</h4>
                 <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                       <label className="text-[8px] font-bold text-slate-500 uppercase">Início</label>
                       <input type="time" className="w-full bg-[#1a1c26] border border-slate-600 p-2.5 text-white text-sm font-mono rounded-sm" />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[8px] font-bold text-slate-500 uppercase">Fim</label>
                       <input type="time" className="w-full bg-[#1a1c26] border border-slate-600 p-2.5 text-white text-sm font-mono rounded-sm" />
                    </div>
                 </div>
                 <input placeholder="Volumes (QTD / PALETES)" className="w-full bg-[#1a1c26] border border-slate-600 p-3 text-sm font-bold text-slate-200 rounded-sm" />
                 <input placeholder="Entidade Solicitante (Ex: PF, RECEITA)" className="w-full bg-[#1a1c26] border border-slate-600 p-3 text-sm font-bold text-slate-200 rounded-sm" />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Diário de Ocorrências e Atividades</label>
              <textarea 
                value={data.ocorrencias} 
                onChange={e => onUpdate({...data, ocorrencias: e.target.value})}
                placeholder="Relate detalhadamente eventos técnicos, de segurança ou troca de efetivo..." 
                className="w-full h-40 bg-black/30 border border-slate-600 p-4 text-sm font-medium text-slate-300 outline-none focus:border-blue-500/50 transition-all resize-none leading-relaxed rounded-sm"
              />
            </div>
          </section>

          <div className="bg-blue-900/20 border border-blue-700/30 p-5 flex items-start gap-4 rounded-sm shadow-sm">
             <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
             <div className="text-[11px] leading-relaxed text-blue-300 font-medium">
               <p className="font-bold text-blue-200 uppercase mb-1.5 tracking-wider text-xs">Instrução Técnica</p>
               Mantenha o rigor técnico na descrição das ocorrências. Dados incoerentes podem afetar a segurança operacional da malha aérea.
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChannelEntry;
