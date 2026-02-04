
export type MaintenanceType = 'Preventiva' | 'Corretiva' | 'N/A';
export type EquipmentStatus = 'OK' | 'Manutenção';

export interface Agent {
  id: string;
  mat: string;
  nome: string;
  horario: string;
}

export interface ChannelInspection {
  id: string;
  descricao: string;
  horario: string;
  status: 'OK' | 'Pendente' | 'N/A';
  solicitante?: string;
  quantidade?: string;
}

// Added data, ordemServico, and prazo to Equipment to support all components
export interface Equipment {
  id: string;
  tipo: string;
  status: EquipmentStatus;
  manutencao?: MaintenanceType;
  descricao: string;
  localizacao: string;
  data?: string;
  ordemServico?: string;
  prazo?: string;
}

// Added FlightAttendance interface used in ReportForm and ReportPreview
export interface FlightAttendance {
  id: string;
  numeroVoo: string;
  horario: string;
  modulo: string;
  apfEmigracao: string;
  quantPax: string;
}

// Added Occurrence interface used in ReportForm, ReportPreview and Dashboard
export interface Occurrence {
  id: string;
  numero: string;
  descricao: string;
  detalhes: string;
  images: string[];
}

// Added StaffSection interface used in Dashboard and ReportForm
export interface StaffSection {
  title: string;
  subtitle: string;
  alternativa?: string;
  agents: Agent[];
  inspecoes: ChannelInspection[];
}

export interface ChannelData {
  status: 'Pendente' | 'Preenchendo' | 'Finalizado';
  condicaoPosto: string;
  agentes: Agent[];
  equipamentos: Equipment[];
  inspecoes: ChannelInspection[];
  ocorrencias: string;
  // Campos específicos
  rfbAtendimento?: boolean;
  apacAlocado?: boolean;
  remoto01Ok?: boolean;
  pontesGH?: boolean;
  escaneamentoInfo?: {
    tipo: 'Exportação' | 'Internação';
    inicio: string;
    fim: string;
    quantidade: string;
    solicitante: string;
  };
}

// Reconciled ReportData to include fields required by ReportForm, ReportPreview and Dashboard
export interface ReportData {
  id?: string;
  dataRelatorio: string;
  turno: string;
  liderNome: string;
  liderMat: string;
  canais: {
    bravo: ChannelData;
    alfa: ChannelData;
    charlie: ChannelData;
    fox: ChannelData;
  };
  voos: any[];
  supervisor: string;
  recebimentoDe: string;
  entreguePor: string;
  horarioRecebimento: string;
  efetivo: {
    domesticoBravo: StaffSection;
    funcionariosCharlie: StaffSection;
    internacionalAlfa: StaffSection;
    tecaFox: StaffSection;
  };
  equipamentos: Equipment[];
  ocorrencias: Occurrence[];
  voosInternacionais: FlightAttendance[];
}
