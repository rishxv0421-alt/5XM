import React, { useState } from 'react';
import {
  History,
  Download,
  Trash2,
  Search,
  Filter,
  Crown,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { PredictionHistoryItem } from '../types';
import { sounds } from '../utils/audio';

interface HistoryViewProps {
  history: PredictionHistoryItem[];
  onClearHistory: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ history, onClearHistory }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'WIN' | 'JACKPOT' | 'LOSS'>('ALL');

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.period.includes(searchTerm);
    if (filterType === 'ALL') return matchesSearch;
    return matchesSearch && item.status === filterType;
  });

  const handleExport = () => {
    sounds.playClick();
    const lines = [
      'RHXVM V10 ON TOP 🔝 - PREDICTION AUDIT LOG',
      '==========================================',
      `Export Time: ${new Date().toLocaleString()}`,
      `Total Records: ${history.length}`,
      '------------------------------------------',
      'PERIOD | TARGETS | ACTUAL | PREDICTION | STATUS',
      ...history.map(
        h =>
          `${h.period} | [${h.predictionNumbers.join(',')}] | ${h.number} (${h.result}) | ${h.prediction} | ${h.status}`
      ),
    ].join('\n');

    const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RHXVM_V10_History_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-4 animate-fadeIn">
      {/* Title & Actions */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-orbitron font-extrabold tracking-widest text-cyan-400 uppercase">
            AUDIT TRAIL & LOGS
          </span>
          <h2 className="font-orbitron font-black text-xl text-white">
            LIVE SIGNAL HISTORY
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500 text-cyan-400 text-xs font-orbitron font-bold transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">EXPORT TXT</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onClearHistory();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-rose-500 text-rose-400 text-xs font-orbitron font-bold transition-all active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CLEAR</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search period number..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-cyan-400 text-xs font-code text-white outline-none"
          />
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/90 border border-slate-800">
          {(['ALL', 'WIN', 'JACKPOT', 'LOSS'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => {
                sounds.playClick();
                setFilterType(tab);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-orbitron font-bold transition-all ${
                filterType === tab
                  ? 'bg-cyan-500 text-gray-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* History List */}
      <div className="space-y-2">
        {filteredHistory.length === 0 ? (
          <div className="p-8 text-center rounded-2xl glass-panel border border-slate-800 text-slate-400 font-rajdhani">
            <History className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <h4 className="font-orbitron text-sm font-bold text-slate-300">NO ROUNDS RECORDED YET</h4>
            <p className="text-xs text-slate-500 mt-1">
              Live results will automatically synchronize here once each 1-minute round concludes.
            </p>
          </div>
        ) : (
          filteredHistory.map(item => {
            const isJackpot = item.status === 'JACKPOT';
            const isWin = item.status === 'WIN';

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isJackpot
                    ? 'bg-amber-950/30 border-amber-500/50 shadow-md shadow-amber-500/10'
                    : isWin
                    ? 'bg-slate-900/80 border-slate-800 hover:border-emerald-500/40'
                    : 'bg-slate-900/80 border-slate-800 hover:border-rose-500/40'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="font-orbitron font-extrabold text-sm text-white">
                      {item.period}
                    </strong>
                    <span className="text-[10px] font-code text-slate-400">{item.time}</span>
                  </div>

                  <div className="text-xs font-code text-slate-300 mt-1 flex items-center gap-2">
                    <span>
                      Target: <strong className="text-cyan-400">{item.prediction}</strong> [
                      {item.predictionNumbers.join(',')}]
                    </span>
                    <span>•</span>
                    <span>
                      Actual: <strong className="text-white">{item.number}</strong> ({item.result})
                    </span>
                  </div>
                </div>

                <div
                  className={`px-3 py-1.5 rounded-xl font-orbitron font-extrabold text-xs flex items-center gap-1.5 ${
                    isJackpot
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-md shadow-amber-500/20'
                      : isWin
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                  }`}
                >
                  {isJackpot ? (
                    <>
                      <Crown className="w-3.5 h-3.5 text-amber-400" />
                      <span>JACKPOT</span>
                    </>
                  ) : isWin ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>WIN</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5 text-rose-400" />
                      <span>LOSS</span>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
