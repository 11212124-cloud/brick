import React, { useState } from 'react';
import { 
  Heart, 
  Volume2, 
  VolumeX, 
  Pause, 
  Play, 
  RotateCcw, 
  HelpCircle, 
  Layers, 
  Sparkles,
  Trophy,
  MapPin,
  Music
} from 'lucide-react';
import { GameStats, LevelConfig } from '../types/game';
import { sound } from '../utils/audio';

interface GameHUDProps {
  stats: GameStats;
  currentLevel: LevelConfig;
  levels: LevelConfig[];
  currentLevelIndex: number;
  onSelectLevel: (index: number) => void;
  isPaused: boolean;
  onTogglePause: () => void;
  onRestartLevel: () => void;
  onOpenHowToPlay: () => void;
  onOpenEditor: () => void;
  onOpenLeaderboard: () => void;
  onOpenStageSelect: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  stats,
  levels,
  currentLevelIndex,
  onSelectLevel,
  isPaused,
  onTogglePause,
  onRestartLevel,
  onOpenHowToPlay,
  onOpenEditor,
  onOpenLeaderboard,
  onOpenStageSelect,
  isMuted,
  onToggleMute,
}) => {
  const [isBgmOn, setIsBgmOn] = useState(sound.getBGMState());

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-3">
      {/* Top Banner Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-900/90 border border-cyan-500/30 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.1)] backdrop-blur-md">
        
        {/* Brand & Stage Select */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </span>
            <div>
              <div className="text-[10px] text-cyan-400 tracking-wider uppercase font-semibold font-['Chakra_Petch']">
                NEON BREAKOUT 2.0
              </div>
              <div className="text-base font-bold text-white leading-none">
                霓虹打磚塊
              </div>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-slate-800 mx-1 hidden sm:block" />

          {/* Visual Level Map Trigger */}
          <button
            onClick={onOpenStageSelect}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 text-xs font-semibold hover:shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all"
            title="開啟關卡星圖戰區"
          >
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>第 {currentLevelIndex + 1} 關</span>
            <span className="text-[10px] text-slate-400 hidden md:inline">/ 10</span>
          </button>

          {/* Quick Select Dropdown */}
          <select
            value={currentLevelIndex}
            onChange={(e) => onSelectLevel(Number(e.target.value))}
            className="bg-slate-950 text-slate-300 text-xs font-medium px-2 py-1.5 rounded-lg border border-slate-700 hover:border-cyan-500/50 focus:outline-none cursor-pointer max-w-[130px] truncate hidden sm:block"
          >
            {levels.map((lvl, idx) => (
              <option key={lvl.id} value={idx} className="bg-slate-900 text-white">
                {lvl.name}
              </option>
            ))}
          </select>
        </div>

        {/* Stats: Score, High Score, Lives, Combo */}
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Current Score */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">得分 SCORE</span>
            <span className="text-xl sm:text-2xl font-black font-['Chakra_Petch'] text-cyan-400 tracking-tight">
              {stats.score.toLocaleString()}
            </span>
          </div>

          {/* High Score */}
          <div className="flex flex-col items-center hidden md:flex">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">最高紀錄 HIGH</span>
            <span className="text-base sm:text-lg font-bold font-['Chakra_Petch'] text-yellow-400 tracking-tight">
              {Math.max(stats.score, stats.highScore).toLocaleString()}
            </span>
          </div>

          {/* Combo / Fever Indicator */}
          {stats.combo >= 2 && (
            <div className={`flex flex-col items-center ${stats.isFeverActive ? 'animate-pulse' : 'animate-bounce'}`}>
              <span className={`text-[9px] uppercase tracking-widest font-black ${stats.isFeverActive ? 'text-yellow-400' : 'text-amber-400'}`}>
                {stats.isFeverActive ? 'FEVER x2' : 'COMBO'}
              </span>
              <span className={`text-lg font-black font-['Chakra_Petch'] ${stats.isFeverActive ? 'text-yellow-400' : 'text-amber-400'}`}>
                x{stats.combo}
              </span>
            </div>
          )}

          {/* Lives Indicator */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">生命 LIVES</span>
            <div className="flex items-center gap-1 mt-0.5">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Heart
                  key={idx}
                  className={`w-4 h-4 transition-all duration-300 ${
                    idx < stats.lives
                      ? 'fill-rose-500 text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)] scale-100'
                      : 'fill-slate-800 text-slate-700 opacity-40 scale-90'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Control Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Pause / Resume */}
          <button
            onClick={onTogglePause}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
            title={isPaused ? '繼續 (P)' : '暫停 (P)'}
            aria-label={isPaused ? '繼續' : '暫停'}
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
          </button>

          {/* Restart */}
          <button
            onClick={onRestartLevel}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
            title="重玩本關"
            aria-label="重玩本關"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* BGM Toggle */}
          <button
            onClick={() => {
              const nextState = sound.toggleBGM();
              setIsBgmOn(nextState);
            }}
            className={`p-2 rounded-lg transition-colors border ${
              isBgmOn
                ? 'bg-indigo-950/60 border-indigo-500 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.3)]'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border-slate-700'
            }`}
            title={isBgmOn ? '關閉街機電子背景音' : '開啟街機電子背景音'}
            aria-label="街機背景音"
          >
            <Music className="w-4 h-4" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              const newMute = !isMuted;
              sound.setMuted(newMute);
              onToggleMute();
            }}
            className={`p-2 rounded-lg transition-colors border ${
              isMuted
                ? 'bg-rose-950/40 border-rose-800/60 text-rose-400'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
            }`}
            title={isMuted ? '開啟音效' : '靜音'}
            aria-label={isMuted ? '開啟音效' : '靜音'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Level Editor */}
          <button
            onClick={onOpenEditor}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-700/50 text-xs font-medium transition-colors"
            title="自訂關卡編輯器"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden md:inline">關卡工坊</span>
          </button>

          {/* Leaderboard */}
          <button
            onClick={onOpenLeaderboard}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-yellow-400 transition-colors border border-slate-700"
            title="查看歷史戰績與成就"
            aria-label="歷史戰績"
          >
            <Trophy className="w-4 h-4" />
          </button>

          {/* How to Play Help */}
          <button
            onClick={onOpenHowToPlay}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 transition-colors border border-slate-700"
            title="遊戲說明與機關道具一覽"
            aria-label="遊戲說明"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
