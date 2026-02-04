
import React from 'react';
import { ReportData, StaffSection } from '../types';
import { 
  Users, 
  ShieldAlert, 
  PlaneTakeoff, 
  Construction, 
  Activity,
  Target,
  Package,
  CheckCircle,
  Clock
} from 'lucide-react';

interface Props {
  data: ReportData;
}

const Dashboard: React.FC<Props> = ({ data }) => {
  // Lógica de Processamento de Dados
  const totalEfetivo = (Object.values(data.efetivo) as StaffSection[]).reduce((acc, section) => acc + section.agents.length, 0);
  const totalOcorrencias = data.ocorrencias.length;
  const totalPax = data.voosInternacionais.reduce((acc, flight) => acc + (parseInt(flight.quantPax) || 0), 0);
  
  const totalEquips = 12;
  const equipsDefeito = data.equipamentos.length;
  const uptime = Math.round(((totalEquips - equipsDefeito) / totalEquips) * 100);

  const volumes = 127 + (totalEfetivo > 5 ? 15 : 0);

  interface CanalConfig {
    label: string;
    value: number;
    target: number;
    color: string;
  }

  const canais: CanalConfig[] = [
    { label: 'DOMÉSTICO (B)', value: data.efetivo.domesticoBravo.agents.length, target: 10, color: '#3b82f6' },
    { label: 'FUNCIONÁRIOS (C)', value: data.efetivo.funcionariosCharlie.agents.length, target: 4, color: '#10b981' },
    { label: 'INTERNACIONAL (A)', value: data.efetivo.internacionalAlfa.agents.length, target: 8, color: '#f59e0b' },
    { label: 'TECA (F)', value: data.efetivo.tecaFox.agents.length, target: 6, color: '#8b5cf6' },
  ];

  return (
    <div className="h-full w-full bg-[#0d0e12] text-white p-6 flex flex-col gap-6 overflow-hidden select-none font-sans">
      
      {/* Cabeçalho Superior */}
      <div className="flex justify-between items-center h-12 shrink-0">
        <div className="flex items-center gap-4">
          <div className="h-10 w-1.5 bg-red-600 rounded-full"></div>
          <div>
            <h2 className="text-2xl font-black tracking-tight leading-none uppercase">Centro de Comando Operacional</h2>
            <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-gray-500 tracking-widest">
              <span>MANAUS Eduardo Gomes (MAO/SBEG)</span>
              <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
              <span className="text-red-500 uppercase font-black">Turno em Tempo Real: {data.turno}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Data do Relatório</span>
            <span className="text-sm font-mono font-bold tracking-tight">{new Date(data.dataRelatorio).toLocaleDateString('pt-BR')}</span>
          </div>
          <div className="h-10 w-px bg-gray-800"></div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded text-green-400 text-[10px] font-black uppercase tracking-widest">
            <Activity className="w-3.5 h-3.5" />
            Ativo
          </div>
        </div>
      </div>

      {/* Grade de Informação Principal */}
      <div className="flex-grow grid grid-cols-12 grid-rows-6 gap-5 overflow-hidden">
        
        {/* Linha de KPIs de Topo */}
        <div className="col-span-12 row-span-1 grid grid-cols-4 gap-5">
          <KPICard 
            icon={<Users className="w-5 h-5 text-blue-400" />}
            label="Efetivo Total"
            value={totalEfetivo}
            status="Em Posto"
            trend="+2"
            color="blue"
          />
          <KPICard 
            icon={<PlaneTakeoff className="w-5 h-5 text-amber-400" />}
            label="Fluxo de Pax"
            value={totalPax}
            status="Acumulado"
            trend="-14"
            color="amber"
          />
          <KPICard 
            icon={<Package className="w-5 h-5 text-purple-400" />}
            label="Volumes de Carga"
            value={volumes}
            status="Processados"
            trend="+15"
            color="purple"
          />
          <KPICard 
            icon={<Target className="w-5 h-5 text-cyan-400" />}
            label="Desempenho"
            value={`${Math.min(100, 75 + (totalEfetivo * 2))}%`}
            status="Índice de Eficiência"
            trend="+4%"
            color="cyan"
          />
        </div>

        {/* Bloco de Ocupação de Canais */}
        <div className="col-span-8 row-span-3 bg-[#16171d] border border-gray-800 rounded-md p-6 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-blue-500" />
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Ocupação de Canais e Alocação de Recursos</h3>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-wider">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Ativo</span>
              <span className="flex items-center gap-1.5 text-gray-600"><span className="w-2 h-2 rounded-full bg-gray-700"></span> Meta</span>
            </div>
          </div>
          
          <div className="flex-grow flex flex-col justify-around gap-2">
            {canais.map((c) => (
              <div key={c.label} className="grid grid-cols-12 items-center gap-6">
                <div className="col-span-3">
                  <span className="text-[11px] font-black text-gray-400 uppercase tracking-tight truncate block">{c.label}</span>
                </div>
                <div className="col-span-7 h-2 bg-[#0d0e12] rounded-full overflow-hidden border border-gray-800 shadow-inner">
                  <div 
                    className="h-full transition-all duration-1000 ease-out"
                    style={{ 
                      width: `${Math.min(100, (c.value / c.target) * 100)}%`,
                      backgroundColor: c.color,
                      boxShadow: `0 0 12px ${c.color}66`
                    }}
                  />
                </div>
                <div className="col-span-2 text-right">
                  <span className="text-[10px] font-mono font-black text-gray-300">
                    {c.value.toString().padStart(2, '0')} / {c.target.toString().padStart(2, '0')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bloco de Disponibilidade (Gráfico Ajustado para Preencher Totalmente) */}
        <div className="col-span-4 row-span-3 bg-[#16171d] border border-gray-800 rounded-md p-6 flex flex-col overflow-hidden">
          <div className="flex justify-between items-center mb-4 shrink-0">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Disponibilidade do Sistema</h3>
            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Tempo de Atividade</span>
          </div>
          
          <div className="flex-grow flex flex-col items-center justify-center p-2">
            <div className="relative w-full max-w-[220px] aspect-square flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {/* Círculo de Fundo */}
                <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-[#0d0e12]" />
                {/* Círculo de Progresso */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="44" 
                  stroke="currentColor" 
                  strokeWidth="8" 
                  fill="transparent" 
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 44}
                  strokeDashoffset={2 * Math.PI * 44 * (1 - uptime/100)}
                  className="text-cyan-500 transition-all duration-1000 ease-in-out" 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-5xl font-black tracking-tighter leading-none">{uptime}%</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase mt-1 tracking-widest">Operacional</span>
              </div>
            </div>
          </div>

          <div className="w-full grid grid-cols-2 gap-3 mt-4 shrink-0">
            <div className="bg-[#0d0e12] p-2 border border-gray-800 rounded flex items-center justify-between">
              <span className="text-[9px] text-gray-500 font-black uppercase tracking-tight">Raio-X (RX)</span>
              <span className="text-[10px] font-mono font-bold text-green-400">4/4 OK</span>
            </div>
            <div className="bg-[#0d0e12] p-2 border border-gray-800 rounded flex items-center justify-between">
              <span className="text-[9px] text-gray-500 font-black uppercase tracking-tight">Unidades ETD</span>
              <span className="text-[10px] font-mono font-bold text-amber-400">2/3 OK</span>
            </div>
          </div>
        </div>

        {/* Rodapé Inferior - Análise de Processamento */}
        <div className="col-span-4 row-span-2 bg-[#16171d] border border-gray-800 rounded-md p-5 overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-6 shrink-0">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Análise de Processamento</h3>
            <div className="flex gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
               <div className="w-1.5 h-1.5 rounded-full bg-gray-700"></div>
            </div>
          </div>
          <div className="flex-grow flex items-end h-24 gap-2 pb-2">
            {[20, 45, 30, 60, 40, 75, 55, 35, 85, 60, 40, 90, 70].map((h, i) => (
              <div key={i} className="flex-grow bg-[#0d0e12] rounded-t-sm relative">
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyan-600/80 to-cyan-400 rounded-t-sm transition-all duration-1000" 
                  style={{ height: `${h}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[9px] font-black text-gray-600 uppercase pt-3 border-t border-gray-800 shrink-0">
            <span>Manhã</span><span>Tarde</span><span>Noite</span>
          </div>
        </div>

        {/* Rodapé Inferior - Incidentes de Segurança */}
        <div className="col-span-5 row-span-2 bg-[#16171d] border border-gray-800 rounded-md p-5 flex flex-col">
          <div className="flex justify-between items-center mb-4 shrink-0">
             <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
               <ShieldAlert className="w-3.5 h-3.5 text-red-500" /> Incidentes de Segurança
             </h3>
             <span className="bg-red-500/20 text-red-500 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest">
               {totalOcorrencias} Ativos
             </span>
          </div>
          <div className="flex-grow space-y-3 overflow-hidden">
            {data.ocorrencias.length > 0 ? (
              data.ocorrencias.slice(0, 2).map((occ) => (
                <div key={occ.id} className="bg-[#0d0e12] p-2.5 border border-gray-800 rounded flex gap-3 items-center group hover:border-gray-600 transition-colors">
                  <div className="w-9 h-9 rounded bg-red-500/10 flex items-center justify-center border border-red-500/20">
                    <span className="text-[10px] font-mono font-bold text-red-500">{occ.numero}</span>
                  </div>
                  <div className="flex-grow overflow-hidden">
                    <p className="text-[11px] font-black text-gray-200 uppercase truncate leading-tight mb-0.5">{occ.descricao}</p>
                    <p className="text-[9px] text-gray-500 truncate leading-none">{occ.detalhes}</p>
                  </div>
                  <Clock className="w-3.5 h-3.5 text-gray-700 shrink-0" />
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-gray-700 gap-3 border border-dashed border-gray-800 rounded">
                <CheckCircle className="w-5 h-5" />
                <span className="text-[11px] font-black uppercase tracking-widest">Perímetro Seguro</span>
              </div>
            )}
          </div>
        </div>

        {/* Rodapé Inferior - Metas */}
        <div className="col-span-3 row-span-2 bg-gradient-to-br from-[#1c1d26] to-[#0d0e12] border border-gray-700 rounded-md p-6 flex flex-col justify-between">
           <div className="space-y-1">
             <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Atingimento de Metas</h4>
             <div className="text-3xl font-black text-white tracking-tighter">{Math.round((volumes/150)*100)}%</div>
           </div>
           
           <div className="space-y-3">
             <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest">
               <span>Capacidade</span>
               <span className="text-white">78%</span>
             </div>
             <div className="h-1.5 w-full bg-[#0d0e12] rounded-full overflow-hidden">
                <div className="h-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.5)]" style={{ width: '78%' }} />
             </div>
           </div>
           
           <button className="w-full py-2.5 bg-white text-black text-[10px] font-black uppercase rounded shadow-lg hover:bg-gray-200 transition-all active:scale-95 tracking-widest">
             Análise Detalhada
           </button>
        </div>

      </div>
    </div>
  );
};

interface KPICardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  status: string;
  trend: string;
  color: 'blue' | 'amber' | 'purple' | 'cyan';
}

const KPICard: React.FC<KPICardProps> = ({ icon, label, value, status, trend, color }) => {
  const borderColors = {
    blue: 'border-blue-500/20',
    amber: 'border-amber-500/20',
    purple: 'border-purple-500/20',
    cyan: 'border-cyan-500/20',
  };

  return (
    <div className={`bg-[#16171d] border ${borderColors[color]} rounded-md p-5 flex flex-col justify-between hover:bg-[#1c1d26] transition-all group cursor-default shadow-lg shadow-black/30`}>
      <div className="flex justify-between items-start">
        <div className="p-2.5 bg-[#0d0e12] border border-gray-800 rounded group-hover:border-gray-700 transition-colors">
          {icon}
        </div>
        <div className="flex flex-col items-end">
          <span className="text-2xl font-black font-mono leading-none tracking-tighter text-white">{value}</span>
          <span className={`text-[9px] font-black uppercase mt-1.5 ${trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
             {trend}
          </span>
        </div>
      </div>
      <div className="mt-4">
        <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 leading-none mb-1.5">{label}</div>
        <div className="text-[9px] font-bold text-gray-600 uppercase tracking-tight">{status}</div>
      </div>
    </div>
  );
};

export default Dashboard;
