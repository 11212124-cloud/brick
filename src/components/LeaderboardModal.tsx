import React from 'react';
import { X, Trophy, Flame, Target, Award, RotateCcw } from 'lucide-react';
import { GameStats } from '../types/game';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GameStats;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  stats,
}) => {
  if (!isOpen) return null;

  const highScore = parseInt(localStorage.getItem('neon_breakout_highscore') || '0', 10);
  const totalBricks = parseInt(localStorage.getItem('neon_breakout_total_bricks') || '0', 10);
  const maxComboEver = parseInt(localStorage.getItem('neon_breakout_max_combo') || '0', 10);

  const handleClearRecords = () => {
    if (confirm('確定要重置所有戰績紀錄嗎？')) {
      localStorage.removeItem('neon_breakout_highscore');
      localStorage.removeItem('neon_breakout_total_bricks');
      localStorage.removeItem('neon_breakout_max_combo');
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-slate-900 border border-yellow-500/40 rounded-2xl p-6 shadow-[0_0_40px_rgba(234,179,8,0.2)] text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h3 className="text-xl font-bold font-['Chakra_Petch'] tracking-wide text-white">
              名人堂與戰績紀錄
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Big Highlight Stat */}
        <div className="mt-5 p-4 rounded-xl bg-gradient-to-br from-yellow-950/40 via-amber-950/20 to-slate-950 border border-yellow-500/30 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-amber-300/80 font-mono">
              個人最高得分 HIGH SCORE
            </div>
            <div className="text-3xl font-black font-['Chakra_Petch'] text-yellow-400 mt-1">
              {Math.max(stats.score, highScore).toLocaleString()}
            </div>
          </div>
          <Award className="w-10 h-10 text-yellow-400/80 shrink-0" />
        </div>

        {/* Stats Grid */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col">
            <div className="flex items-center gap-1.5 text-xs text-rose-400 mb-1">
              <Flame className="w-4 h-4" />
              <span>最高連擊紀錄</span>
            </div>
            <span className="text-2xl font-black font-['Chakra_Petch'] text-slate-100">
              {Math.max(stats.maxCombo, maxComboEver)} <span className="text-xs text-slate-400 font-normal">Hits</span>
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col">
            <div className="flex items-center gap-1.5 text-xs text-cyan-400 mb-1">
              <Target className="w-4 h-4" />
              <span>擊碎磚塊總計</span>
            </div>
            <span className="text-2xl font-black font-['Chakra_Petch'] text-slate-100">
              {(totalBricks + stats.bricksBroken).toLocaleString()} <span className="text-xs text-slate-400 font-normal">Blocks</span>
            </span>
          </div>
        </div>

        {/* Current Run Summary */}
        <div className="mt-4 p-3 bg-slate-950/50 rounded-xl border border-slate-800/80 text-xs text-slate-400 flex justify-between">
          <span>本次冒險即時得分:</span>
          <span className="font-bold text-cyan-400 font-['Chakra_Petch'] text-sm">
            {stats.score.toLocaleString()} 分
          </span>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleClearRecords}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-rose-400 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            重置紀錄
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg text-xs transition-colors"
          >
            返回遊戲
          </button>
        </div>
      </div>
    </div>
  );
};
