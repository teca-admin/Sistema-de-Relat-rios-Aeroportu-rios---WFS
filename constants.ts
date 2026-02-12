
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

// Função para gerar um canal limpo (evita bugs de memória)
const createEmptyChannel = (): ChannelData => ({
  status: 'Pendente',
  condicaoPosto: 'Operacional',
  agentes: [],
  equipamentos: [],
  inspecoes: [],
  escaneamentos: [],
  ocorrencias: '',
  ocorrenciasList: []
});

const createEmptyStaffSection = (title: string, subtitle: string): StaffSection => ({
  title,
  subtitle,
  agents: [],
  inspecoes: []
});

// Exportamos uma função em vez de um objeto estático
export const getInitialReportData = (): ReportData => ({
  shiftStarted: false,
  dataRelatorio: new Date().toISOString().split('T')[0],
  turno: 'D',
  liderNome: '',
  liderMat: '',
  canais: {
    bravo: { ...createEmptyChannel(), rfbAtendimento: false, apacAlocado: false },
    alfa: { ...createEmptyChannel(), remoto01Ok: true, pontesGH: true },
    charlie: { ...createEmptyChannel() },
    fox: { ...createEmptyChannel() }
  },
  voos: [],
  supervisor: '',
  recebimentoDe: '',
  entreguePor: '',
  horarioRecebimento: '',
  efetivo: {
    domesticoBravo: createEmptyStaffSection('Canal Bravo', 'Doméstico'),
    funcionariosCharlie: createEmptyStaffSection('Canal Charlie', 'Funcionários'),
    internacionalAlfa: createEmptyStaffSection('Canal Alfa', 'Internacional'),
    tecaFox: createEmptyStaffSection('Canal Fox', 'TECA')
  },
  equipamentos: [],
  ocorrencias: [],
  voosInternacionais: []
});

// Mantemos o objeto para compatibilidade, mas o App usará a função
export const INITIAL_REPORT_DATA = getInitialReportData();
