import React from 'react';
import { Trophy, RotateCcw, ArrowRight, Sparkles, Flame, Target, Star } from 'lucide-react';
import { GameStats, LevelConfig } from '../types/game';

interface GameResultModalProps {
  type: 'gameover' | 'levelwin' | 'victory' | null;
  stats: GameStats;
  currentLevel: LevelConfig;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onRestartCurrent: () => void;
  onRestartAll: () => void;
  onClose: () => void;
}

export const GameResultModal: React.FC<GameResultModalProps> = ({
  type,
  stats,
  currentLevel,
  hasNextLevel,
  onNextLevel,
  onRestartCurrent,
  onRestartAll,
  onClose,
}) => {
  if (!type) return null;

  const isGameOver = type === 'gameover';
  const isVictory = type === 'victory';
  const isLevelWin = type === 'levelwin';

  const isNewHighScore = stats.score > stats.highScore && stats.score > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-slate-900 border border-cyan-500/40 rounded-2xl p-6 sm:p-7 shadow-[0_0_50px_rgba(6,182,212,0.3)] text-slate-100 text-center animate-in fade-in zoom-in-95 duration-200">
        
        {/* Graphic Icon */}
        <div className="mx-auto mb-4 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg">
          {isGameOver && (
            <div className="w-16 h-16 rounded-2xl bg-rose-950/80 border border-rose-500/50 flex items-center justify-center text-3xl shadow-[0_0_25px_rgba(244,63,94,0.4)]">
              💀
            </div>
          )}
          {isLevelWin && (
            <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.4)]">
              <Sparkles className="w-8 h-8 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
          )}
          {isVictory && (
            <div className="w-16 h-16 rounded-2xl bg-yellow-950/80 border border-yellow-500/50 flex items-center justify-center text-yellow-300 shadow-[0_0_30px_rgba(234,179,8,0.5)]">
              <Trophy className="w-8 h-8 text-yellow-400 animate-bounce" />
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-2xl sm:text-3xl font-black font-['Chakra_Petch'] tracking-wide">
          {isGameOver && <span className="text-rose-500">GAME OVER</span>}
          {isLevelWin && <span className="text-cyan-400">關卡突破！STAGE CLEAR</span>}
          {isVictory && <span className="text-yellow-400">🎉 全關卡通關大獲全勝！</span>}
        </h3>

        <p className="text-xs text-slate-400 mt-1 mb-5">
          {isGameOver && '所有生命已耗盡，請再接再厲突破紀錄！'}
          {isLevelWin && `順利清除 ${currentLevel.name} 的所有阻礙`}
          {isVictory && '太不可思議了！你摧毀了所有防禦矩陣，成為霓虹球神！'}
        </p>

        {/* High Score Badge */}
        {isNewHighScore && (
          <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 text-xs font-bold animate-pulse">
            <Star className="w-3.5 h-3.5 fill-yellow-400" />
            創下個人最高歷史新紀錄！
          </div>
        )}

        {/* Score Box */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 mb-5">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-mono">
            最終結算得分 FINAL SCORE
          </div>
          <div className="text-3xl font-black font-['Chakra_Petch'] text-cyan-400 mt-0.5">
            {stats.score.toLocaleString()}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-xs">
            <div className="flex items-center justify-center gap-1.5 text-slate-300">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>最高連擊:</span>
              <span className="font-bold font-['Chakra_Petch'] text-amber-400">{stats.maxCombo} Hits</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-slate-300">
              <Target className="w-3.5 h-3.5 text-cyan-400" />
              <span>擊破磚塊:</span>
              <span className="font-bold font-['Chakra_Petch'] text-cyan-400">{stats.bricksBroken} 個</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          {isLevelWin && hasNextLevel && (
            <button
              onClick={onNextLevel}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow-lg shadow-cyan-500/30 text-sm"
            >
              <span>挑戰下一關卡</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {isGameOver && (
            <button
              onClick={onRestartCurrent}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold transition-all shadow-lg shadow-rose-500/30 text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>重新挑戰本關</span>
            </button>
          )}

          {isVictory && (
            <button
              onClick={onRestartAll}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold transition-all shadow-lg shadow-yellow-500/30 text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>重新再來一輪</span>
            </button>
          )}

          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={onRestartAll}
              className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors border border-slate-700"
            >
              從第 1 關開始
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors border border-slate-700"
            >
              檢視棋盤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
