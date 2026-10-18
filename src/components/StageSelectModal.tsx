import React from 'react';
import { X, MapPin, Play, Star, Sparkles } from 'lucide-react';
import { LevelConfig } from '../types/game';

interface StageSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  levels: LevelConfig[];
  currentLevelIndex: number;
  onSelectLevel: (index: number) => void;
}

export const StageSelectModal: React.FC<StageSelectModalProps> = ({
  isOpen,
  onClose,
  levels,
  currentLevelIndex,
  onSelectLevel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-cyan-500/40 rounded-2xl p-6 shadow-[0_0_50px_rgba(6,182,212,0.25)] text-slate-100 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <MapPin className="w-6 h-6 text-cyan-400" />
            <div>
              <h3 className="text-xl font-bold font-['Chakra_Petch'] tracking-wide text-white">
                十代關卡星圖戰區
              </h3>
              <p className="text-xs text-slate-400">點選任意戰區立即前往挑戰，體驗多種動態機關與魔王戰</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Level Cards Grid */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {levels.map((lvl, idx) => {
            const isCurrent = idx === currentLevelIndex;
            const isBoss = lvl.bossName || lvl.theme === 'boss';

            return (
              <div
                key={lvl.id}
                onClick={() => {
                  onSelectLevel(idx);
                  onClose();
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group ${
                  isCurrent
                    ? 'bg-cyan-950/50 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400'
                    : isBoss
                    ? 'bg-rose-950/30 hover:bg-rose-950/60 border-rose-800/60 hover:border-rose-500'
                    : 'bg-slate-950/60 hover:bg-slate-800/80 border-slate-800 hover:border-cyan-500/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-xs font-bold font-['Chakra_Petch'] px-2 py-0.5 rounded ${
                        isBoss
                          ? 'bg-rose-950 text-rose-300 border border-rose-700/60'
                          : 'bg-slate-800 text-cyan-300'
                      }`}
                    >
                      STAGE {idx + 1}
                    </span>

                    {isCurrent ? (
                      <span className="text-[11px] font-bold text-cyan-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 animate-spin" />
                        當前進行中
                      </span>
                    ) : isBoss ? (
                      <span className="text-[11px] font-bold text-rose-400">☠️ 魔王關卡</span>
                    ) : (
                      <div className="flex items-center text-yellow-500">
                        <Star className="w-3 h-3 fill-yellow-500" />
                        <Star className="w-3 h-3 fill-yellow-500" />
                        <Star className="w-3 h-3 fill-yellow-500" />
                      </div>
                    )}
                  </div>

                  <h4 className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                    {lvl.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {lvl.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>磚塊規格: {lvl.cols}x{lvl.rows} 陣列</span>
                  <span className="flex items-center gap-1 font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
                    <Play className="w-3 h-3 fill-cyan-400" />
                    進入戰區
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg text-xs transition-colors"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
