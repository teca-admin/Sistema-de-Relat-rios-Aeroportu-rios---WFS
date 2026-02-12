
import React, { useState } from 'react';
import { ChannelData, Agent, Equipment, ChannelInspection, Occurrence } from '../types';
import { SHIFTS, AVAILABLE_AGENTS } from '../constants';
import { supabase } from '../supabase';
import { Plus, Trash2, CheckCircle2, Package, UserPlus, Info, ClipboardCheck, Send, ShieldAlert, Clock, Scan, AlertTriangle, Loader2 } from 'lucide-react';

interface Props {
  canal: string;
  data: ChannelData;
  activeShiftId: string | null;
  onUpdate: (data: ChannelData) => void;
}

const ChannelEntry: React.FC<Props> = ({ canal, data, activeShiftId, onUpdate }) => {
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
      descricao: 'Varredura de rotina realizada em conformidade', 
      horario: currentTime, 
      status: 'OK' 
    };
    onUpdate({ ...data, inspecoes: [...data.inspecoes, newInsp], status: 'Preenchendo' });
  };

  const handleTransmit = async () => {
    if (!supabase || !activeShiftId) {
      alert("Sincronização impossível: Nenhum turno ativo no HQ.");
      return;
    }

    setIsTransmitting(true);
    try {
      // 1. Limpa dados antigos deste canal para este turno (evita duplicidade)
      await Promise.all([
        supabase.from('relatorio_agentes').delete().eq('relatorio_id', activeShiftId).eq('canal', canal),
        supabase.from('relatorio_inspecoes').delete().eq('relatorio_id', activeShiftId).eq('canal', canal)
      ]);

      // 2. Transmite Agentes
      if (data.agentes.length > 0) {
        const agentsToInsert = data.agentes.map(a => ({
          relatorio_id: activeShiftId,
          canal: canal,
          mat: a.mat,
          nome: a.nome,
          horario: a.horario
        }));
        await supabase.from('relatorio_agentes').insert(agentsToInsert);
      }

      // 3. Transmite Inspeções
      if (data.inspecoes.length > 0) {
        const inspToInsert = data.inspecoes.map(i => ({
          relatorio_id: activeShiftId,
          canal: canal,
          descricao: i.descricao,
          horario: i.horario,
          status: i.status
        }));
        await supabase.from('relatorio_inspecoes').insert(inspToInsert);
      }

      // 4. Marca como Finalizado
      onUpdate({ ...data, status: 'Finalizado' });
      setLastSync(new Date().toLocaleTimeString('pt-BR'));
    } catch (err) {
      console.error("Falha na transmissão:", err);
      alert("Erro ao enviar dados para o servidor central.");
    } finally {
      setIsTransmitting(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-8 space-y-8 bg-[#0f1117] pb-24 text-slate-200">
      <div className="flex items-center justify-between border-b border-slate-700 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-tighter">ENTRADA DE DADOS: CANAL {canal.toUpperCase()}</h2>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2">
            {lastSync ? `Sincronizado às ${lastSync}` : 'Aguardando transmissão para o HQ'}
          </p>
        </div>
        <button 
          onClick={handleTransmit}
          disabled={isTransmitting || !activeShiftId}
          className={`px-8 py-3 font-black text-[12px] uppercase tracking-widest border transition-all flex items-center gap-3 active:scale-95 ${activeShiftId ? 'bg-blue-600 hover:bg-blue-500 text-white border-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.2)]' : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'}`}
        >
          {isTransmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {isTransmitting ? 'Transmitindo...' : 'Transmitir para o Líder'}
        </button>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-7 space-y-8">
          <section className="bg-[#1a1c26] border border-slate-700 shadow-sm">
            <div className="bg-slate-700/20 p-4 flex justify-between items-center border-b border-slate-700">
               <div className="flex items-center gap-3 text-slate-300">
                  <ShieldAlert className="w-5 h-5 text-amber-500" />
                  <h3 className="text-[11px] font-bold uppercase tracking-widest">Varreduras e Inspeções</h3>
               </div>
               <button onClick={addInspection} className="text-[10px] font-bold uppercase bg-amber-600 hover:bg-amber-500 text-white px-4 py-1.5 border border-amber-500 rounded-sm">Registrar</button>
            </div>
            <div className="p-5 space-y-3">
              {data.inspecoes.map((insp) => (
                <div key={insp.id} className="flex items-center gap-4 bg-black/20 p-3 border border-slate-700/50 rounded-sm">
                  <span className="text-emerald-400 font-mono text-sm font-bold">{insp.horario}</span>
                  <input value={insp.descricao} onChange={(e) => onUpdate({...data, inspecoes: data.inspecoes.map(i => i.id === insp.id ? {...i, descricao: e.target.value} : i)})} className="flex-grow bg-transparent border-b border-slate-700 text-sm py-1 outline-none" />
                  <button onClick={() => onUpdate({...data, inspecoes: data.inspecoes.filter(i => i.id !== insp.id)})} className="text-slate-500 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-[#1a1c26] border border-slate-700 shadow-sm">
            <div className="bg-slate-700/20 p-4 flex justify-between items-center border-b border-slate-700">
               <div className="flex items-center gap-3 text-slate-300"><UserPlus className="w-5 h-5" /><h3 className="text-[11px] font-bold uppercase tracking-widest">Alocação de Agentes</h3></div>
               <button onClick={addAgent} className="text-[10px] font-bold uppercase bg-slate-600 hover:bg-slate-500 text-white px-4 py-1.5 border border-slate-500 rounded-sm">Novo Agente</button>
            </div>
            <div className="p-5 space-y-3">
              {data.agentes.map((agent) => (
                <div key={agent.id} className="grid grid-cols-12 gap-4 items-end bg-black/20 p-3 border border-slate-700/50 rounded-sm">
                  <div className="col-span-6">
                    <select value={agent.nome} onChange={(e) => { const sel = AVAILABLE_AGENTS.find(aa => aa.nome === e.target.value); updateAgent(agent.id, { nome: e.target.value, mat: sel?.mat || '' }); }} className="w-full p-2 bg-[#1a1c26] border border-slate-600 text-sm font-bold text-slate-200 outline-none">
                      <option value="">Selecione Agente...</option>
                      {AVAILABLE_AGENTS.map(aa => <option key={aa.mat} value={aa.nome}>{aa.nome}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <input type="text" readOnly value={agent.mat} className="w-full p-2 bg-slate-800/50 border border-slate-700 text-sm font-mono text-slate-400 font-bold" />
                  </div>
                  <div className="col-span-3">
                    <select value={agent.horario} onChange={(e) => updateAgent(agent.id, { horario: e.target.value })} className="w-full p-2 bg-[#1a1c26] border border-slate-600 text-xs font-bold text-slate-300">
                      {SHIFTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <button onClick={() => onUpdate({...data, agentes: data.agentes.filter(a => a.id !== agent.id)})} className="col-span-1 text-slate-500 hover:text-red-500 pb-2"><Trash2 className="w-5 h-5" /></button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="col-span-12 lg:col-span-5 space-y-8">
          <section className="bg-[#1a1c26] border border-slate-700 p-6 space-y-8 shadow-sm">
             <div className="flex items-center gap-3 text-slate-300 border-b border-slate-700 pb-4"><ClipboardCheck className="w-5 h-5 text-blue-400" /><h3 className="text-[11px] font-bold uppercase tracking-widest">Diagnóstico Operacional</h3></div>
             <div>
               <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Nível de Operação do Posto</label>
               <div className="flex gap-2">
                 {['Operacional', 'Atenção', 'Crítico'].map(cond => (
                   <button key={cond} onClick={() => onUpdate({...data, condicaoPosto: cond})} className={`flex-grow py-3 border text-[11px] font-bold uppercase transition-all rounded-sm ${data.condicaoPosto === cond ? 'bg-emerald-900/40 border-emerald-500 text-emerald-300 shadow-sm' : 'bg-black/20 border-slate-700 text-slate-500 hover:border-slate-500'}`}>{cond}</button>
                 ))}
               </div>
             </div>
             <div>
               <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Diário de Atividades</label>
               <textarea value={data.ocorrencias} onChange={e => onUpdate({...data, ocorrencias: e.target.value})} placeholder="Relate as atividades do canal..." className="w-full h-40 bg-black/30 border border-slate-600 p-4 text-sm text-slate-300 outline-none resize-none" />
             </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ChannelEntry;
