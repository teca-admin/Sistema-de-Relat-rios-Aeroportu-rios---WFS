
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

export interface ScanningRecord {
  id: string;
  tipo: 'Exportação' | 'Internação';
  apac: string;
  inicio: string;
  fim: string;
  quantidade: string;
}

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

export interface FlightAttendance {
  id: string;
  numeroVoo: string;
  horario: string;
  modulo: string;
  apfEmigracao: string;
  quantPax: string;
}

export interface Occurrence {
  id: string;
  numero: string;
  descricao: string;
  detalhes: string;
  images: string[];
  horario?: string;
}

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
  escaneamentos: ScanningRecord[];
  ocorrencias: string;
  ocorrenciasList: Occurrence[];
  rfbAtendimento?: boolean;
  apacAlocado?: boolean;
  remoto01Ok?: boolean;
  pontesGH?: boolean;
}

export interface ReportData {
  id?: string;
  shiftStarted: boolean;
  startTime?: string;
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
