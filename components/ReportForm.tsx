
import React, { useState, useEffect } from 'react';
import { ReportData, Equipment, FlightAttendance, Agent, Occurrence, ChannelInspection, StaffSection } from '../types';
import { SHIFTS, AVAILABLE_AGENTS } from '../constants';
import { supabase } from '../supabase';
import { Plus, Trash2, UserPlus, Package, Plane, PenTool, FileText, Send, CheckCircle2, Loader2, User, RefreshCw, AlertCircle, ShieldAlert, Clock, Info, UserCheck, Hash } from 'lucide-react';

interface Props {
  data: ReportData;
  setData: React.Dispatch<React.SetStateAction<ReportData>>;
  onFinish: () => void;
}

const ReportForm: React.FC<Props> = ({ data, setData, onFinish }) => {
  const [isSending, setIsSending] = useState(false);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);
  const [agentsList, setAgentsList] = useState(AVAILABLE_AGENTS);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function loadAgents() {
      if (!supabase) return;
      setIsLoadingAgents(true);
      try {
        const { data: dbAgents, error } = await supabase
          .from('agentes')
          .select('mat, nome')
          .order('nome', { ascending: true });

        if (error) throw error;
        if (dbAgents && dbAgents.length > 0) {
          setAgentsList(dbAgents);
        }
      } catch (err) {
        console.warn('Usando dados locais:', err);
      } finally {
        setIsLoadingAgents(false);
      }
    }
    loadAgents();
  }, []);

  const updateField = (field: keyof ReportData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleSend = async () => {
    if (!supabase) return;
    setIsSending(true);
    setError(null);

    try {
      const { data: relatorio, error: relError } = await supabase
        .from('relatorios')
        .insert([{
          data_relatorio: data.dataRelatorio,
          turno: data.turno,
          supervisor: data.supervisor,
          recebimento_de: data.recebimentoDe,
          entregue_por: data.entreguePor,
          horario_recebimento: data.horarioRecebimento
        }])
        .select()
        .single();

      if (relError) throw relError;
      const relId = relatorio.id;

      const agentsToInsert: any[] = [];
      const inspectionsToInsert: any[] = [];

      (Object.keys(data.efetivo) as Array<keyof ReportData['efetivo']>).forEach(canal => {
        data.efetivo[canal].agents.forEach(agent => {
          agentsToInsert.push({
            relatorio_id: relId,
            canal: canal,
            mat: agent.mat,
            nome: agent.nome,
            horario: agent.horario
          });
        });

        data.efetivo[canal].inspecoes.forEach(insp => {
          inspectionsToInsert.push({
            relatorio_id: relId,
            canal: canal,
            descricao: insp.descricao,
            horario: insp.horario,
            status: insp.status,
            solicitante: insp.solicitante,
            quantidade: insp.quantidade
          });
        });
      });

      if (agentsToInsert.length > 0) await supabase.from('relatorio_agentes').insert(agentsToInsert);
      if (inspectionsToInsert.length > 0) await supabase.from('relatorio_inspecoes').insert(inspectionsToInsert);
      
      if (data.equipamentos.length > 0) {
        await supabase.from('relatorio_equipamentos').insert(
          data.equipamentos.map(eq => ({
            relatorio_id: relId,
            tipo: eq.tipo,
            descricao: eq.descricao,
            localizacao: eq.localizacao,
            ordem_servico: eq.ordemServico
          }))
        );
      }

      if (data.ocorrencias.length > 0) {
        await supabase.from('relatorio_ocorrencias').insert(
          data.ocorrencias.map(occ => ({
            relatorio_id: relId,
            numero: occ.numero,
            descricao: occ.descricao,
            detalhes: occ.detalhes
          }))
        );
      }

      if (data.voosInternacionais.length > 0) {
        await supabase.from('relatorio_voos').insert(
          data.voosInternacionais.map(v => ({
            relatorio_id: relId,
            numero_voo: v.numeroVoo,
            horario: v.horario,
            modulo: v.modulo,
            apf_emigracao: v.apfEmigracao,
            quant_pax: parseInt(v.quantPax) || 0
          }))
        );
      }

      onFinish();
    } catch (err: any) {
      setError(err.message || 'Falha na comunicação com o servidor.');
    } finally {
      setIsSending(false);
    }
  };

  const addAgent = (sectionKey: keyof ReportData['efetivo']) => {
    // Fixed SHIFTS index from 5 to 0 because SHIFTS array has length 4
    const newAgent: Agent = { id: crypto.randomUUID(), mat: '', nome: '', horario: SHIFTS[0].value };
    setData(prev => ({
      ...prev,
      efetivo: {
        ...prev.efetivo,
        [sectionKey]: { ...prev.efetivo[sectionKey], agents: [...prev.efetivo[sectionKey].agents, newAgent] }
      }
    }));
  };

  const updateAgent = (sectionKey: keyof ReportData['efetivo'], agentId: string, field: keyof Agent, value: any) => {
    if (field === 'nome' || field === 'mat') {
      const selected = field === 'nome' ? agentsList.find(a => a.nome === value) : agentsList.find(a => a.mat === value);
      setData(prev => ({
        ...prev,
        efetivo: {
          ...prev.efetivo,
          [sectionKey]: {
            ...prev.efetivo[sectionKey],
            agents: prev.efetivo[sectionKey].agents.map(a => a.id === agentId ? { ...a, mat: selected?.mat || a.mat, nome: selected?.nome || a.nome } : a)
          }
        }
      }));
      return;
    }
    setData(prev => ({
      ...prev,
      efetivo: {
        ...prev.efetivo,
        [sectionKey]: {
          ...prev.efetivo[sectionKey],
          agents: prev.efetivo[sectionKey].agents.map(a => a.id === agentId ? { ...a, [field]: value } : a)
        }
      }
    }));
  };

  const addInspection = (sectionKey: keyof ReportData['efetivo']) => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const newInsp: ChannelInspection = { 
      id: crypto.randomUUID(), 
      descricao: '', 
      horario: currentTime, 
      status: 'OK',
      solicitante: '',
      quantidade: '' 
    };
    setData(prev => ({
      ...prev,
      efetivo: {
        ...prev.efetivo,
        [sectionKey]: { ...prev.efetivo[sectionKey], inspecoes: [...prev.efetivo[sectionKey].inspecoes, newInsp] }
      }
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-28">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-center gap-3 text-red-800 text-sm font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* 1. Header & Recebimento */}
      <section className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-500" />
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-700">Cabeçalho Operacional</h2>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-5">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Data do Serviço</label>
            <input type="date" value={data.dataRelatorio} onChange={(e) => updateField('dataRelatorio', e.target.value)} className="w-full p-2 bg-white border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Identificação Turno</label>
            <input type="text" value={data.turno} onChange={(e) => updateField('turno', e.target.value)} className="w-full p-2 bg-white border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Supervisor AVSEC</label>
            <input type="text" value={data.supervisor} onChange={(e) => updateField('supervisor', e.target.value)} className="w-full p-2 bg-white border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Horário Passagem</label>
            <input type="text" value={data.horarioRecebimento} onChange={(e) => updateField('horarioRecebimento', e.target.value)} className="w-full p-2 bg-white border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none" />
          </div>
        </div>
        <div className="mx-5 mb-5 p-4 bg-slate-50 rounded border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Recebi o posto de:</label>
            <input type="text" value={data.recebimentoDe} onChange={(e) => updateField('recebimentoDe', e.target.value)} className="w-full p-2 bg-white border border-slate-200 rounded text-xs font-semibold outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Entregue por:</label>
            <input type="text" value={data.entreguePor} onChange={(e) => updateField('entreguePor', e.target.value)} className="w-full p-2 bg-white border border-slate-200 rounded text-xs font-semibold outline-none" />
          </div>
        </div>
      </section>

      {/* 2. Canais e Agentes */}
      <section className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-slate-500" />
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-700">Gestão de Efetivo e Canais</h2>
          </div>
          {isLoadingAgents && (
            <div className="flex items-center gap-2 text-[9px] font-bold uppercase text-blue-600 animate-pulse">
              <RefreshCw className="w-3 h-3 animate-spin" /> DB Syncing...
            </div>
          )}
        </div>
        <div className="p-5 space-y-6">
          {(Object.keys(data.efetivo) as Array<keyof ReportData['efetivo']>).map((key) => {
            const section = data.efetivo[key];
            return (
              <div key={key} className="border border-slate-200 rounded overflow-hidden">
                <div className="bg-slate-50/50 p-3 flex justify-between items-center border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <div>
                      <h3 className="text-[10px] font-extrabold text-slate-800 uppercase tracking-tight">{section.title}</h3>
                      <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{section.subtitle}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => addAgent(key)} className="text-[9px] font-bold uppercase bg-white border border-slate-300 text-slate-600 px-2 py-1 rounded hover:bg-slate-50 transition-all flex items-center gap-1">
                      <Plus className="w-2.5 h-2.5" /> Adicionar Agente
                    </button>
                    <button onClick={() => addInspection(key)} className="text-[9px] font-bold uppercase bg-white border border-slate-300 text-slate-600 px-2 py-1 rounded hover:bg-slate-50 transition-all flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Log Inspeção
                    </button>
                  </div>
                </div>
                <div className="p-3 space-y-4">
                  {/* Lista de Agentes */}
                  <div className="space-y-2">
                    {section.agents.map((agent) => (
                      <div key={agent.id} className="grid grid-cols-12 gap-2 items-end bg-white p-2 border border-slate-100 rounded shadow-sm">
                        <div className="col-span-5">
                          <label className="block text-[8px] font-bold text-slate-400 uppercase mb-0.5">Nome Completo</label>
                          <select value={agent.nome} onChange={(e) => updateAgent(key, agent.id, 'nome', e.target.value)} className="w-full p-1.5 bg-white border border-slate-200 rounded text-[11px] font-medium outline-none">
                            <option value="">Selecione...</option>
                            {agentsList.map(aa => <option key={aa.mat} value={aa.nome}>{aa.nome}</option>)}
                          </select>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[8px] font-bold text-slate-400 uppercase mb-0.5">Matrícula</label>
                          <select value={agent.mat} onChange={(e) => updateAgent(key, agent.id, 'mat', e.target.value)} className="w-full p-1.5 bg-white border border-slate-200 rounded text-[11px] font-medium outline-none">
                            <option value="">Mat...</option>
                            {agentsList.map(aa => <option key={aa.mat} value={aa.mat}>{aa.mat}</option>)}
                          </select>
                        </div>
                        <div className="col-span-4">
                          <label className="block text-[8px] font-bold text-slate-400 uppercase mb-0.5">Escala de Serviço</label>
                          <select value={agent.horario} onChange={(e) => updateAgent(key, agent.id, 'horario', e.target.value)} className="w-full p-1.5 bg-white border border-slate-200 rounded text-[10px] font-bold uppercase outline-none">
                            {SHIFTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                          </select>
                        </div>
                        <div className="col-span-1 flex justify-center pb-1">
                          <button onClick={() => setData(prev => ({...prev, efetivo: {...prev.efetivo, [key]: {...prev.efetivo[key], agents: prev.efetivo[key].agents.filter(a => a.id !== agent.id)}} }))} className="text-slate-300 hover:text-red-600">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Lista de Inspeções Reestilizada */}
                  {section.inspecoes.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2 mb-2">
                        <ShieldAlert className="w-3 h-3 text-slate-400" />
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Logs de Varredura e Inspeção Técnica</span>
                      </div>
                      {section.inspecoes.map((insp) => (
                        <div key={insp.id} className="bg-slate-50/50 border border-slate-200 rounded p-3 grid grid-cols-12 gap-3 items-end">
                          <div className="col-span-2">
                            <label className="flex items-center gap-1 text-[8px] font-bold text-slate-500 uppercase mb-1">
                              <Clock className="w-2.5 h-2.5" /> Horário
                            </label>
                            <input 
                              type="time" 
                              value={insp.horario} 
                              onChange={(e) => setData(prev => ({...prev, efetivo: {...prev.efetivo, [key]: {...prev.efetivo[key], inspecoes: prev.efetivo[key].inspecoes.map(i => i.id === insp.id ? {...i, horario: e.target.value} : i)}} }))} 
                              className="w-full p-1.5 bg-white border border-slate-200 rounded text-[11px] font-bold text-slate-700 outline-none focus:border-blue-500" 
                            />
                          </div>
                          <div className="col-span-4">
                            <label className="flex items-center gap-1 text-[8px] font-bold text-slate-500 uppercase mb-1">
                              <FileText className="w-2.5 h-2.5" /> Descrição Técnica
                            </label>
                            <input 
                              type="text" 
                              value={insp.descricao} 
                              onChange={(e) => setData(prev => ({...prev, efetivo: {...prev.efetivo, [key]: {...prev.efetivo[key], inspecoes: prev.efetivo[key].inspecoes.map(i => i.id === insp.id ? {...i, descricao: e.target.value} : i)}} }))} 
                              placeholder="Relate a varredura..." 
                              className="w-full p-1.5 bg-white border border-slate-200 rounded text-[11px] font-medium outline-none focus:border-blue-500" 
                            />
                          </div>
                          <div className="col-span-3">
                            <label className="flex items-center gap-1 text-[8px] font-bold text-slate-500 uppercase mb-1">
                              <UserCheck className="w-2.5 h-2.5" /> Solicitante
                            </label>
                            <input 
                              type="text" 
                              value={insp.solicitante || ''} 
                              onChange={(e) => setData(prev => ({...prev, efetivo: {...prev.efetivo, [key]: {...prev.efetivo[key], inspecoes: prev.efetivo[key].inspecoes.map(i => i.id === insp.id ? {...i, solicitante: e.target.value} : i)}} }))} 
                              placeholder="Ex: COA / PF" 
                              className="w-full p-1.5 bg-white border border-slate-200 rounded text-[11px] font-medium outline-none focus:border-blue-500" 
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="flex items-center gap-1 text-[8px] font-bold text-slate-500 uppercase mb-1">
                              <Hash className="w-2.5 h-2.5" /> Qtd Inspecionada
                            </label>
                            <input 
                              type="text" 
                              value={insp.quantidade || ''} 
                              onChange={(e) => setData(prev => ({...prev, efetivo: {...prev.efetivo, [key]: {...prev.efetivo[key], inspecoes: prev.efetivo[key].inspecoes.map(i => i.id === insp.id ? {...i, quantidade: e.target.value} : i)}} }))} 
                              placeholder="Volumes/Salas" 
                              className="w-full p-1.5 bg-white border border-slate-200 rounded text-[11px] font-bold outline-none focus:border-blue-500" 
                            />
                          </div>
                          <div className="col-span-1 flex justify-center pb-2">
                            <button onClick={() => setData(prev => ({...prev, efetivo: {...prev.efetivo, [key]: {...prev.efetivo[key], inspecoes: prev.efetivo[key].inspecoes.filter(i => i.id !== insp.id)}} }))} className="text-slate-300 hover:text-red-500 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Status de Equipamentos */}
      <section className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-slate-500" />
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-700">Integridade de Equipamentos</h2>
          </div>
          <button onClick={() => {
            // Added status: 'OK' to initial object to match Equipment interface
            const newItem: Equipment = { id: crypto.randomUUID(), tipo: '', status: 'OK', data: '', descricao: '', localizacao: '', ordemServico: '', prazo: '' };
            setData(prev => ({ ...prev, equipamentos: [...prev.equipamentos, newItem] }));
          }} className="text-[9px] font-bold uppercase bg-slate-800 text-white px-3 py-1.5 rounded hover:bg-slate-900 shadow-sm transition-all">
            Registrar Ocorrência Técnica
          </button>
        </div>
        <div className="p-5">
           <div className="space-y-2">
             {data.equipamentos.map(eq => (
               <div key={eq.id} className="grid grid-cols-6 gap-2 p-2 bg-slate-50 rounded items-center border border-slate-200">
                  <input type="text" placeholder="Equipamento" value={eq.tipo} onChange={(e) => setData(prev => ({...prev, equipamentos: prev.equipamentos.map(i => i.id === eq.id ? {...i, tipo: e.target.value} : i)}))} className="p-1.5 border border-slate-200 rounded text-[10px] font-bold outline-none" />
                  <input type="text" placeholder="Local" value={eq.localizacao} onChange={(e) => setData(prev => ({...prev, equipamentos: prev.equipamentos.map(i => i.id === eq.id ? {...i, localizacao: e.target.value} : i)}))} className="p-1.5 border border-slate-200 rounded text-[10px] font-bold outline-none" />
                  <input type="text" placeholder="Descrição do Defeito" value={eq.descricao} onChange={(e) => setData(prev => ({...prev, equipamentos: prev.equipamentos.map(i => i.id === eq.id ? {...i, descricao: e.target.value} : i)}))} className="col-span-2 p-1.5 border border-slate-200 rounded text-[10px] font-medium outline-none" />
                  <input type="text" placeholder="O.S. / Chamado" value={eq.ordemServico} onChange={(e) => setData(prev => ({...prev, equipamentos: prev.equipamentos.map(i => i.id === eq.id ? {...i, ordemServico: e.target.value} : i)}))} className="p-1.5 border border-slate-200 rounded text-[10px] font-bold outline-none" />
                  <div className="flex justify-center">
                    <button onClick={() => setData(prev => ({...prev, equipamentos: prev.equipamentos.filter(i => i.id !== eq.id)}))} className="text-slate-300 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
               </div>
             ))}
             {data.equipamentos.length === 0 && (
               <div className="text-center py-6 bg-slate-50 rounded border border-dashed border-slate-200">
                 <div className="flex flex-col items-center gap-1 opacity-40">
                    <Info className="w-5 h-5 text-slate-400" />
                    <p className="text-[9px] font-bold uppercase tracking-widest">Todos os sistemas operando em conformidade</p>
                 </div>
               </div>
             )}
           </div>
        </div>
      </section>

      {/* 4. Ocorrências e Voos (Lado a Lado) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ocorrências */}
        <section className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-slate-500" />
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-700">Relatório de Eventos</h2>
            </div>
            <button onClick={() => {
               const newOcc: Occurrence = { id: crypto.randomUUID(), numero: (data.ocorrencias.length + 1).toString().padStart(2, '0'), descricao: '', detalhes: '', images: [] };
               setData(prev => ({ ...prev, ocorrencias: [...prev.ocorrencias, newOcc] }));
            }} className="text-[9px] font-bold uppercase bg-slate-800 text-white px-3 py-1.5 rounded hover:bg-slate-900 transition-all">
              Nova Ocorrência
            </button>
          </div>
          <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
            {data.ocorrencias.map((occ) => (
              <div key={occ.id} className="border border-slate-100 p-3 bg-slate-50/30 rounded relative">
                <button onClick={() => setData(prev => ({...prev, ocorrencias: prev.ocorrencias.filter(o => o.id !== occ.id)}))} className="absolute top-2 right-2 text-slate-300 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded text-[9px] font-bold">EVENTO #{occ.numero}</span>
                  <input type="text" value={occ.descricao} onChange={(e) => setData(prev => ({...prev, ocorrencias: prev.ocorrencias.map(o => o.id === occ.id ? {...o, descricao: e.target.value} : o)}))} placeholder="Título do evento..." className="bg-transparent text-[10px] font-bold border-b border-slate-200 outline-none flex-grow pb-1" />
                </div>
                <textarea value={occ.detalhes} onChange={(e) => setData(prev => ({...prev, ocorrencias: prev.ocorrencias.map(o => o.id === occ.id ? {...o, detalhes: e.target.value} : o)}))} placeholder="Descreva os fatos detalhadamente..." className="w-full h-20 p-2 text-[10px] bg-white border border-slate-200 rounded outline-none resize-none font-medium" />
              </div>
            ))}
          </div>
        </section>

        {/* Voos Internacionais */}
        <section className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Plane className="w-4 h-4 text-slate-500" />
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-700">Tráfego Internacional</h2>
            </div>
            <button onClick={() => {
              const newFlight: FlightAttendance = { id: crypto.randomUUID(), numeroVoo: '', horario: '', modulo: '', apfEmigracao: '', quantPax: '' };
              setData(prev => ({ ...prev, voosInternacionais: [...prev.voosInternacionais, newFlight] }));
            }} className="text-[9px] font-bold uppercase bg-slate-800 text-white px-3 py-1.5 rounded hover:bg-slate-900 transition-all">
              Log de Voo
            </button>
          </div>
          <div className="p-4 space-y-2">
             {data.voosInternacionais.map(v => (
               <div key={v.id} className="grid grid-cols-5 gap-2 p-2 bg-slate-50 border border-slate-100 rounded items-center">
                  <input type="text" placeholder="Nº Voo" value={v.numeroVoo} onChange={(e) => setData(prev => ({...prev, voosInternacionais: prev.voosInternacionais.map(f => f.id === v.id ? {...f, numeroVoo: e.target.value} : f)}))} className="p-1.5 border border-slate-200 rounded text-[10px] font-bold outline-none" />
                  <input type="text" placeholder="HH:MM" value={v.horario} onChange={(e) => setData(prev => ({...prev, voosInternacionais: prev.voosInternacionais.map(f => f.id === v.id ? {...f, horario: e.target.value} : f)}))} className="p-1.5 border border-slate-200 rounded text-[10px] font-bold outline-none" />
                  <input type="text" placeholder="APF" value={v.apfEmigracao} onChange={(e) => setData(prev => ({...prev, voosInternacionais: prev.voosInternacionais.map(f => f.id === v.id ? {...f, apfEmigracao: e.target.value} : f)}))} className="p-1.5 border border-slate-200 rounded text-[10px] font-bold outline-none" />
                  <input type="number" placeholder="PAX" value={v.quantPax} onChange={(e) => setData(prev => ({...prev, voosInternacionais: prev.voosInternacionais.map(f => f.id === v.id ? {...f, quantPax: e.target.value} : f)}))} className="p-1.5 border border-slate-200 rounded text-[10px] font-bold outline-none" />
                  <div className="flex justify-center">
                    <button onClick={() => setData(prev => ({...prev, voosInternacionais: prev.voosInternacionais.filter(f => f.id !== v.id)}))} className="text-slate-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
               </div>
             ))}
          </div>
        </section>
      </div>

      {/* Action Status Bar (Fixa) */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-3 flex justify-between items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
        <div className="flex items-center gap-6 px-4">
           <div className="flex flex-col">
             <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Status do Relatório</span>
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-extrabold text-white uppercase tracking-wider">Aguardando Transmissão</span>
             </div>
           </div>
           <div className="h-6 w-px bg-slate-700"></div>
           <div className="flex flex-col">
             <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Efetivo Alocado</span>
             <span className="text-[10px] font-extrabold text-white">
               {(Object.values(data.efetivo) as StaffSection[]).reduce((acc, curr) => acc + curr.agents.length, 0)} Agentes em Posto
             </span>
           </div>
        </div>

        <button 
          onClick={handleSend}
          disabled={isSending}
          className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-2.5 rounded font-extrabold text-[11px] uppercase tracking-[0.2em] flex items-center gap-3 transition-all active:scale-95 disabled:opacity-50 shadow-lg"
        >
          {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Transmitir Dados ao COA
        </button>
      </div>
    </div>
  );
};

export default ReportForm;
