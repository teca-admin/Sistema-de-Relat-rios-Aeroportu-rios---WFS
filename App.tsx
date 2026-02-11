
import React, { useState } from 'react';
import { ReportData, ChannelData } from './types';
import { INITIAL_REPORT_DATA } from './constants';
import LeaderDashboard from './components/LeaderDashboard';
import ChannelEntry from './components/ChannelEntry';
import { Layout, Shield, User } from 'lucide-react';

type AppView = 'leader' | 'bravo' | 'alfa' | 'charlie' | 'fox';

const App: React.FC = () => {
  const [data, setData] = useState<ReportData>(INITIAL_REPORT_DATA);
  const [currentView, setCurrentView] = useState<AppView>('leader');

  const handleChannelUpdate = (view: AppView, newData: ChannelData) => {
    setData(prev => {
      const updatedCanais = { ...prev.canais, [view]: newData };
      
      const mapping: Record<string, keyof ReportData['efetivo']> = {
        bravo: 'domesticoBravo',
        charlie: 'funcionariosCharlie',
        alfa: 'internacionalAlfa',
        fox: 'tecaFox'
      };

      const efetivoKey = mapping[view];
      const updatedEfetivo = { ...prev.efetivo };
      
      if (efetivoKey) {
        updatedEfetivo[efetivoKey] = {
          ...prev.efetivo[efetivoKey],
          agents: newData.agentes,
          inspecoes: newData.inspecoes
        };
      }

      return {
        ...prev,
        canais: updatedCanais,
        efetivo: updatedEfetivo
      };
    });
  };

  return (
    <div className="h-screen flex flex-col bg-[#0f1117] text-slate-200 overflow-hidden font-sans">
      <header className="h-14 bg-[#1a1c26] border-b border-slate-700 flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-4">
          <div className="bg-slate-600 p-1.5 rounded-sm">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-[12px] font-bold uppercase tracking-[0.2em] text-white leading-none">Comando Operacional WFS</h1>
            <p className="text-[9px] text-slate-400 uppercase font-semibold tracking-widest mt-1.5">Aeroporto Internacional de Manaus (SBEG)</p>
          </div>
        </div>

        <nav className="flex items-center gap-2">
          <button 
            onClick={() => setCurrentView('leader')}
            className={`px-4 py-1.5 text-[11px] font-bold uppercase transition-all border ${currentView === 'leader' ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-700 text-slate-400 hover:bg-slate-700'}`}
          >
            Painel do Líder
          </button>
          <div className="w-px h-4 bg-slate-700 mx-2"></div>
          {(['bravo', 'alfa', 'charlie', 'fox'] as const).map(canal => (
            <button 
              key={canal}
              onClick={() => setCurrentView(canal)}
              className={`px-4 py-1.5 text-[11px] font-bold uppercase transition-all border ${currentView === canal ? 'bg-slate-700 border-slate-600 text-blue-300' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
              Cnl {canal.toUpperCase()}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4 border-l border-slate-700 pl-6">
          <div className="text-right">
            <p className="text-[11px] font-bold text-slate-100 leading-none uppercase">{data.liderNome}</p>
            <p className="text-[9px] text-slate-400 font-mono mt-1.5 font-bold">MAT:{data.liderMat}</p>
          </div>
          <div className="w-8 h-8 bg-slate-700 border border-slate-600 flex items-center justify-center">
            <User className="w-4 h-4 text-slate-300" />
          </div>
        </div>
      </header>

      <main className="flex-grow overflow-hidden relative">
        {currentView === 'leader' ? (
          <LeaderDashboard data={data} />
        ) : (
          <ChannelEntry 
            canal={currentView} 
            data={data.canais[currentView as keyof ReportData['canais']]} 
            onUpdate={(newData) => handleChannelUpdate(currentView, newData)}
          />
        )}
      </main>

      {currentView === 'leader' && (
        <footer className="h-14 bg-[#1a1c26] border-t border-slate-700 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-8">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Status do Sistema</span>
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                <span className="text-[11px] font-bold text-slate-200 uppercase">Operacional / Turno {data.turno}</span>
              </div>
            </div>
            <div className="h-7 w-px bg-slate-700"></div>
            <div className="text-[11px] font-bold text-slate-400 uppercase">
              Canais em Operação: <span className="text-white">{(Object.values(data.canais) as ChannelData[]).filter(c => c.status === 'Finalizado').length}/4</span>
            </div>
          </div>
          
          <button className="bg-blue-700 hover:bg-blue-600 border border-blue-500 text-white px-8 py-2 font-bold text-[11px] uppercase tracking-widest transition-all shadow-lg">
            Gerar Relatório de Passagem
          </button>
        </footer>
      )}
    </div>
  );
};

export default App;
