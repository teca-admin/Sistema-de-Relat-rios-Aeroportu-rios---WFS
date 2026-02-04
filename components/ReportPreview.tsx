
import React from 'react';
import { ReportData } from '../types';

interface Props {
  data: ReportData;
}

const ReportPreview: React.FC<Props> = ({ data }) => {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  return (
    <div className="bg-white p-8 max-w-[210mm] mx-auto shadow-xl border border-gray-200 print:shadow-none print:border-none print:p-0 animate-in zoom-in-95 duration-500 pb-20">
      
      {/* Official Header */}
      <div className="flex justify-between items-start mb-6 border-b-2 border-gray-800 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 flex items-center justify-center bg-red-600 rounded-full">
            <span className="text-white font-black text-2xl">wfs</span>
          </div>
          <div>
            <h1 className="text-sm font-bold uppercase tracking-tighter">Passagem de Serviço dos Postos Proteção</h1>
            <p className="text-xs font-medium">AEROPORTO INTERNACIONAL DE MANAUS "EDUARDO GOMES"</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold">DATA {formatDate(data.dataRelatorio)}</div>
          <div className="text-xs font-bold">{data.turno}</div>
          <div className="text-xs">Supervisor AVSEC: <span className="font-bold">{data.supervisor || '---'}</span></div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="text-blue-800 font-black text-xl italic flex items-center gap-1">
            MANAUS <span className="text-orange-500">AIRPORT</span>
          </div>
        </div>
      </div>

      {/* 1. Recebimento */}
      <div className="mb-6">
        <div className="bg-gray-400 text-white px-3 py-1 text-xs font-bold uppercase mb-2">1. RECEBIMENTO DE SERVIÇO:</div>
        <div className="text-sm leading-relaxed p-2 border-l-4 border-gray-200 italic">
          Eu <span className="font-bold underline">{data.recebimentoDe || '____________________'}</span>, recebi o serviço do(a) <span className="font-bold underline">{data.entreguePor || '____________________'}</span> do turno correspondente, {data.horarioRecebimento}, com todas as normas e procedimentos em vigor.
        </div>
      </div>

      {/* 2. Efetivo */}
      <div className="mb-6">
        <div className="bg-gray-400 text-white px-3 py-1 text-xs font-bold uppercase mb-4">2. EFETIVO E INSPEÇÕES:</div>
        
        <div className="space-y-8">
          {(Object.keys(data.efetivo) as Array<keyof ReportData['efetivo']>).map((key) => {
            const section = data.efetivo[key];
            if (section.agents.length === 0 && section.inspecoes.length === 0) return null;
            return (
              <div key={key} className="border border-gray-300">
                <div className="bg-sky-400 text-black text-center py-1 font-bold text-xs uppercase border-b border-gray-300">
                  {section.title}
                </div>
                <div className="bg-yellow-400 text-black text-center py-1 font-bold text-[10px] uppercase border-b border-gray-300">
                  {section.subtitle} <br/> {section.alternativa}
                </div>
                
                {/* Agentes */}
                {section.agents.length > 0 && (
                  <table className="w-full text-[10px]">
                    <thead>
                      <tr className="bg-gray-50 font-bold border-b border-gray-300">
                        <th className="px-2 py-1 border-r border-gray-300 w-20">Mat.</th>
                        <th className="px-2 py-1 border-r border-gray-300">Agente de Proteção</th>
                        <th className="px-2 py-1 w-48">Horário</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.agents.map((agent) => (
                        <tr key={agent.id} className="border-b border-gray-200 last:border-0">
                          <td className="px-2 py-1 border-r border-gray-300 text-center">{agent.mat}</td>
                          <td className="px-2 py-1 border-r border-gray-300 uppercase">{agent.nome}</td>
                          <td className="px-2 py-1 text-center font-bold">{agent.horario}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* Inspeções */}
                {section.inspecoes && section.inspecoes.length > 0 && (
                  <div className="bg-gray-50 border-t border-gray-300">
                    <div className="px-2 py-1 bg-gray-200 font-bold text-[9px] uppercase border-b border-gray-300">
                      Inspeções e Varreduras Realizadas
                    </div>
                    <table className="w-full text-[9px]">
                      <tbody>
                        {section.inspecoes.map((insp) => (
                          <tr key={insp.id} className="border-b border-gray-200 last:border-0">
                            <td className="px-2 py-1 w-12 font-bold text-center border-r border-gray-300">{insp.horario || '--:--'}</td>
                            <td className="px-2 py-1 border-r border-gray-300 italic">{insp.descricao}</td>
                            <td className={`px-2 py-1 w-16 text-center font-black ${
                              insp.status === 'OK' ? 'text-green-600' : 'text-amber-600'
                            }`}>{insp.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Equipamentos */}
      <div className="mb-6">
        <div className="bg-gray-400 text-white px-3 py-1 text-xs font-bold uppercase mb-2">3. EQUIPAMENTOS:</div>
        <table className="w-full text-[10px] border border-gray-300 table-fixed">
          <thead className="bg-gray-200">
            <tr className="font-bold border-b border-gray-300">
              <th className="p-2 border-r border-gray-300 w-1/6">TIPO (RX, ETD, PDM)</th>
              <th className="p-2 border-r border-gray-300 w-1/6">DATA</th>
              <th className="p-2 border-r border-gray-300 w-1/4">DESCRIÇÃO (DEFEITO)</th>
              <th className="p-2 border-r border-gray-300 w-1/6">LOCALIZAÇÃO</th>
              <th className="p-2 border-r border-gray-300 w-1/6">ORDEM DE SERVIÇO</th>
              <th className="p-2 w-1/6">PRAZO</th>
            </tr>
          </thead>
          <tbody>
            {data.equipamentos.length > 0 ? (
              data.equipamentos.map((eq) => (
                <tr key={eq.id} className="border-b border-gray-300">
                  <td className="p-2 border-r border-gray-300">{eq.tipo}</td>
                  <td className="p-2 border-r border-gray-300">{eq.data}</td>
                  <td className="p-2 border-r border-gray-300">{eq.descricao}</td>
                  <td className="p-2 border-r border-gray-300">{eq.localizacao}</td>
                  <td className="p-2 border-r border-gray-300">{eq.ordemServico}</td>
                  <td className="p-2">{eq.prazo}</td>
                </tr>
              ))
            ) : (
              <tr className="border-b border-gray-300">
                <td className="p-2 border-r border-gray-300">&nbsp;</td>
                <td className="p-2 border-r border-gray-300">&nbsp;</td>
                <td className="p-2 border-r border-gray-300">&nbsp;</td>
                <td className="p-2 border-r border-gray-300">&nbsp;</td>
                <td className="p-2 border-r border-gray-300">&nbsp;</td>
                <td className="p-2">&nbsp;</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 4. Ocorrências */}
      <div className="mb-6 break-after-page">
        <div className="bg-gray-400 text-white px-3 py-1 text-xs font-bold uppercase mb-2">4. REGISTRO DE OCORRÊNCIAS:</div>
        <div className="border border-gray-300">
          <div className="bg-gray-100 p-2 text-center font-bold text-[10px] border-b border-gray-300">DESCRIÇÕES E IMAGENS</div>
          <div className="divide-y divide-gray-300">
            {data.ocorrencias.map((occ) => (
              <div key={occ.id} className="flex">
                <div className="w-12 bg-gray-50 flex items-center justify-center font-bold text-xs border-r border-gray-300 p-2">
                  {occ.numero}
                </div>
                <div className="flex-grow p-3 space-y-3">
                  <div className="font-bold text-[10px] uppercase">{occ.descricao}</div>
                  <div className="text-[10px] whitespace-pre-wrap leading-relaxed">{occ.detalhes}</div>
                  
                  {occ.images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                      {occ.images.map((img, idx) => (
                        <img key={idx} src={img} alt="Evidence" className="w-full aspect-video object-cover border border-gray-200 rounded" />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Voos Internacionais */}
      {data.voosInternacionais.length > 0 && (
        <div className="mb-10">
          <div className="bg-gray-400 text-white px-3 py-1 text-xs font-bold uppercase mb-2">5. ATENDIMENTO DE VOOS INTERNACIONAIS:</div>
          <table className="w-full text-[10px] border border-gray-300">
            <thead className="bg-gray-200">
              <tr className="font-bold border-b border-gray-300 text-center uppercase">
                <th className="p-2 border-r border-gray-300">Nº VOO</th>
                <th className="p-2 border-r border-gray-300">INÍCIO/TÉRMINO</th>
                <th className="p-2 border-r border-gray-300">MÓDULO (QUANT. RX)</th>
                <th className="p-2 border-r border-gray-300">APF EMIGRAÇÃO</th>
                <th className="p-2">QUANT. PAX</th>
              </tr>
            </thead>
            <tbody className="text-center">
              {data.voosInternacionais.map((flight) => (
                <tr key={flight.id} className="border-b border-gray-300">
                  <td className="p-2 border-r border-gray-300">{flight.numeroVoo}</td>
                  <td className="p-2 border-r border-gray-300">{flight.horario}</td>
                  <td className="p-2 border-r border-gray-300">{flight.modulo}</td>
                  <td className="p-2 border-r border-gray-300">{flight.apfEmigracao}</td>
                  <td className="p-2">{flight.quantPax}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Final Signatures */}
      <div className="mt-12 flex flex-col items-end gap-6">
        <div className="text-xs text-right">
          Manaus, {formatDate(data.dataRelatorio)}.
        </div>
        <div className="w-64 border-t border-gray-400 mt-4 text-center">
          <div className="text-[10px] font-bold uppercase">{data.supervisor || data.recebimentoDe || '---'}</div>
          <div className="text-[8px] text-gray-500 uppercase">Responsável pelo Relatório</div>
        </div>
      </div>

    </div>
  );
};

export default ReportPreview;
