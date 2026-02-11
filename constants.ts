
import { ReportData, ChannelData, StaffSection } from './types';

export const SHIFTS = [
  { label: 'A: 00:00 - 06:00', value: '00:00 - 06:00' },
  { label: 'B: 06:00 - 12:00', value: '06:00 - 12:00' },
  { label: 'C: 12:00 - 18:00', value: '12:00 - 18:00' },
  { label: 'D: 18:00 - 00:00', value: '18:00 - 00:00' },
];

export const AVAILABLE_AGENTS = [
  { mat: '123456', nome: 'JOÃOZINHO DA SILVA' },
  { mat: '654321', nome: 'MARIA OLIVEIRA' },
  { mat: '987654', nome: 'CARLOS SANTOS' },
  { mat: '112233', nome: 'ANA SOUZA' },
  { mat: '445566', nome: 'PEDRO ALVES' }
];

const INITIAL_CHANNEL: ChannelData = {
  status: 'Pendente',
  condicaoPosto: 'Operacional',
  agentes: [],
  equipamentos: [],
  inspecoes: [],
  escaneamentos: [],
  ocorrencias: '',
  ocorrenciasList: []
};

const INITIAL_STAFF_SECTION = (title: string, subtitle: string): StaffSection => ({
  title,
  subtitle,
  agents: [],
  inspecoes: []
});

export const INITIAL_REPORT_DATA: ReportData = {
  shiftStarted: false,
  dataRelatorio: new Date().toISOString().split('T')[0],
  turno: 'D',
  liderNome: '',
  liderMat: '',
  canais: {
    bravo: { ...INITIAL_CHANNEL, rfbAtendimento: false, apacAlocado: false },
    alfa: { ...INITIAL_CHANNEL, remoto01Ok: true, pontesGH: true },
    charlie: { ...INITIAL_CHANNEL },
    fox: { ...INITIAL_CHANNEL }
  },
  voos: [],
  supervisor: '',
  recebimentoDe: '',
  entreguePor: '',
  horarioRecebimento: '',
  efetivo: {
    domesticoBravo: INITIAL_STAFF_SECTION('Canal Bravo', 'Doméstico'),
    funcionariosCharlie: INITIAL_STAFF_SECTION('Canal Charlie', 'Funcionários'),
    internacionalAlfa: INITIAL_STAFF_SECTION('Canal Alfa', 'Internacional'),
    tecaFox: INITIAL_STAFF_SECTION('Canal Fox', 'TECA')
  },
  equipamentos: [],
  ocorrencias: [],
  voosInternacionais: []
};
