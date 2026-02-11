
import React, { useState } from 'react';
import { ChannelData, Agent, Equipment, ChannelInspection, ScanningRecord, Occurrence } from '../types';
import { SHIFTS, AVAILABLE_AGENTS } from '../constants';
import { Plus, Trash2, CheckCircle2, Package, UserPlus, Info, ClipboardCheck, Send, ShieldAlert, Clock, Scan, AlertTriangle } from 'lucide-react';

interface Props {
  canal: string;
  data: ChannelData;
  onUpdate: (data: ChannelData) => void;
}

const ChannelEntry: React.FC<Props> = ({ canal, data, onUpdate }) => {
  const [lastSync, setLastSync] = useState<string | null>(null);

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

  const addOccurrence = () => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const newOcc: Occurrence = {
      id: crypto.randomUUID(),
      numero: (data.ocorrenciasList.length + 1).toString().padStart(2, '0'),
      descricao: '',
      detalhes: '',
      images: [],
      horario: currentTime
    };
    onUpdate({ ...data, ocorrenciasList: [...data.ocorrenciasList, newOcc], status: 'Preenchendo' });
  };

  const addScanning = () => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const newScan: ScanningRecord = {
      id: crypto.randomUUID(),
      tipo: 'Exportação',
      apac: data.agentes[0]?.nome || '',
      inicio: currentTime,
      fim: '',
      quantidade: ''
    };
    onUpdate({ ...data, escaneamentos: [...(data.escaneamentos || []), newScan], status: 'Preenchendo' });
  };

  const updateScanning = (id: string, updates: Partial<ScanningRecord>) => {
    onUpdate({
      ...data,
      escaneamentos: data.escaneamentos.map(s => s.id === id ? { ...s, ...updates } : s),
      status: 'Preenchendo'
    });
  };

  const handleTransmit = () => {
    onUpdate({ ...data, status: 'Finalizado' });
    setLastSync(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
  };

  return (
    <div className="h-full overflow-y-auto p-8 space-y-8 bg-[#0f1117] pb-24 text-slate-200">
      <div className="flex items-center justify-between border-b border-slate-700 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-tighter">ENTRADA DE DADOS: CANAL {canal.toUpperCase()}</h2>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2">
            {lastSync ? `Última transmissão realizada às ${lastSync}` : 'Aguardando primeira transmissão do turno'}
          </p>
        </div>
        <button 
          onClick={handleTransmit}
          className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 font-bold text-[12px] uppercase tracking-widest border border-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] flex items-center gap-3 active:scale-95"
        >
          <Send className="w-4 h-4" />
          Transmitir Atualizações
        </button>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-7 space-y-8">
          
          {/* Seção de Ocorrências Estruturadas - NOVA */}
          <section className="bg-[#1a1c26] border border-slate-700 shadow-sm">
            <div className="bg-red-900/10 p-4 flex justify-between items-center border-b border-slate-700">
               <div className="flex items-center gap-3 text-red-400">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="text-[11px] font-bold uppercase tracking-widest">Ocorrências e Incidentes do Canal</h3>
               </div>
               <button onClick={addOccurrence} className="text-[10px] font-bold uppercase bg-red-700 hover:bg-red-600 text-white px-4 py-1.5 border border-red-500 rounded-sm transition-colors flex items-center gap-2">
                 <Plus className="w-3.5 h-3.5" /> Adicionar Registro
               </button>
            </div>
            <div className="p-5 space-y-4">
              {data.ocorrenciasList.map((occ) => (
                <div key={occ.id} className="bg-black/40 p-4 border border-red-900/30 rounded-sm space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded tracking-widest">#{occ.numero}</span>
                      <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
                        <Clock className="w-3.5 h-3.5" /> {occ.horario}
                      </div>
                    </div>
                    <button onClick={() => onUpdate({...data, ocorrenciasList: data.ocorrenciasList.filter(o => o.id !== occ.id)})} className="text-slate-600 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <input 
                    placeholder="Título da Ocorrência (Ex: Recusa de Inspeção)"
                    value={occ.descricao}
                    onChange={(e) => onUpdate({...data, ocorrenciasList: data.ocorrenciasList.map(o => o.id === occ.id ? {...o, descricao: e.target.value} : o)})}
                    className="w-full bg-[#0f1117] border border-slate-700 p-2 text-sm font-bold text-white outline-none focus:border-red-500/50"
                  />
                  <textarea 
                    placeholder="Detalhamento do ocorrido, agentes envolvidos e providências tomadas..."
                    value={occ.detalhes}
                    onChange={(e) => onUpdate({...data, ocorrenciasList: data.ocorrenciasList.map(o => o.id === occ.id ? {...o, detalhes: e.target.value} : o)})}
                    className="w-full bg-[#0f1117] border border-slate-700 p-2 text-xs text-slate-300 h-20 outline-none resize-none focus:border-red-500/50"
                  />
                </div>
              ))}
              {data.ocorrenciasList.length === 0 && (
                <div className="text-center py-6 border-2 border-dashed border-slate-800 rounded-sm opacity-40">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Nenhum incidente crítico registrado no período</p>
                </div>
              )}
            </div>
          </section>

          {/* Seção Exclusiva Canal Fox - Escaneamento */}
          {canal === 'fox' && (
            <section className="bg-[#1a1c26] border border-slate-700 shadow-sm">
              <div className="bg-purple-900/20 p-4 flex justify-between items-center border-b border-slate-700">
                 <div className="flex items-center gap-3 text-purple-300">
                    <Scan className="w-5 h-5" />
                    <h3 className="text-[11px] font-bold uppercase tracking-widest">Controle de Escaneamento de Carga</h3>
                 </div>
                 <button onClick={addScanning} className="text-[10px] font-bold uppercase bg-purple-700 hover:bg-purple-600 text-white px-4 py-1.5 border border-purple-500 rounded-sm transition-colors">Novo Registro</button>
              </div>
              <div className="p-5 space-y-4">
                {data.escaneamentos?.map((scan) => (
                  <div key={scan.id} className="bg-black/40 p-4 border border-slate-700/50 rounded-sm space-y-4">
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-4">
                        <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1.5">Fluxo</label>
                        <select 
                          value={scan.tipo}
                          onChange={(e) => updateScanning(scan.id, { tipo: e.target.value as any })}
                          className="w-full p-2 bg-[#0f1117] border border-slate-600 text-xs font-bold text-slate-200 rounded-sm outline-none"
                        >
                          <option value="Exportação">EXPORTAÇÃO</option>
                          <option value="Internação">INTERNAÇÃO</option>
                        </select>
                      </div>
                      <div className="col-span-8">
                        <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1.5">APAC Responsável</label>
                        <select 
                          value={scan.apac}
                          onChange={(e) => updateScanning(scan.id, { apac: e.target.value })}
                          className="w-full p-2 bg-[#0f1117] border border-slate-600 text-xs font-bold text-slate-200 rounded-sm outline-none"
                        >
                          <option value="">Selecione o Agente...</option>
                          {data.agentes.map(a => <option key={a.id} value={a.nome}>{a.nome}</option>)}
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-12 gap-4 items-end">
                      <div className="col-span-3">
                        <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1.5">Hora Início</label>
                        <input type="time" value={scan.inicio} onChange={(e) => updateScanning(scan.id, { inicio: e.target.value })} className="w-full p-2 bg-[#0f1117] border border-slate-600 text-xs font-bold text-white rounded-sm" />
                      </div>
                      <div className="col-span-3">
                        <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1.5">Hora Fim</label>
                        <input type="time" value={scan.fim} onChange={(e) => updateScanning(scan.id, { fim: e.target.value })} className="w-full p-2 bg-[#0f1117] border border-slate-600 text-xs font-bold text-white rounded-sm" />
                      </div>
                      <div className="col-span-5">
                        <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1.5">{scan.tipo === 'Exportação' ? 'Qtd. Paletes' : 'Qtd. Volumes'}</label>
                        <input type="text" value={scan.quantidade} onChange={(e) => updateScanning(scan.id, { quantidade: e.target.value })} placeholder="Ex: 12" className="w-full p-2 bg-[#0f1117] border border-slate-600 text-xs font-bold text-slate-200 rounded-sm" />
                      </div>
                      <div className="col-span-1 flex justify-center pb-1">
                        <button onClick={() => onUpdate({...data, escaneamentos: data.escaneamentos.filter(s => s.id !== scan.id)})} className="text-slate-500 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="bg-[#1a1c26] border border-slate-700 shadow-sm">
            <div className="bg-slate-700/20 p-4 flex justify-between items-center border-b border-slate-700">
               <div className="flex items-center gap-3 text-slate-300">
                  <ShieldAlert className="w-5 h-5 text-amber-500" />
                  <h3 className="text-[11px] font-bold uppercase tracking-widest">Registro de Varreduras (Status Dashboard)</h3>
               </div>
               <button onClick={addInspection} className="text-[10px] font-bold uppercase bg-amber-600 hover:bg-amber-500 text-white px-4 py-1.5 border border-amber-500 rounded-sm transition-colors flex items-center gap-2">
                 <Plus className="w-3.5 h-3.5" /> Registrar Varredura
               </button>
            </div>
            <div className="p-5 space-y-3">
              {data.inspecoes.map((insp) => (
                <div key={insp.id} className="flex items-center gap-4 bg-black/20 p-3 border border-slate-700/50 rounded-sm">
                  <div className="flex items-center gap-2 text-emerald-400 font-mono text-sm font-bold bg-emerald-500/10 px-2 py-1 rounded">
                    <Clock className="w-3.5 h-3.5" /> {insp.horario}
                  </div>
                  <input 
                    value={insp.descricao}
                    onChange={(e) => onUpdate({...data, inspecoes: data.inspecoes.map(i => i.id === insp.id ? {...i, descricao: e.target.value} : i)})}
                    className="flex-grow bg-transparent border-b border-slate-700 text-sm py-1 outline-none focus:border-blue-500 transition-colors"
                  />
                  <button onClick={() => onUpdate({...data, inspecoes: data.inspecoes.filter(i => i.id !== insp.id)})} className="text-slate-500 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>

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
               Mantenha o rigor técnico na descrição das ocorrências. Cada registro alimenta o Painel do Líder em tempo real.
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChannelEntry;
