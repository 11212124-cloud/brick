/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { GameCanvas } from './game/GameCanvas';
import { GameHUD } from './components/GameHUD';
import { HowToPlayModal } from './components/HowToPlayModal';
import { LevelEditor } from './components/LevelEditor';
import { LeaderboardModal } from './components/LeaderboardModal';
import { GameResultModal } from './components/GameResultModal';
import { StageSelectModal } from './components/StageSelectModal';
import { BUILTIN_LEVELS } from './game/levels';
import { GameStats, LevelConfig } from './types/game';
import { sound } from './utils/audio';

export default function App() {
  const [levels, setLevels] = useState<LevelConfig[]>(BUILTIN_LEVELS);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(sound.getMuted());
  
  // Modals
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isStageSelectOpen, setIsStageSelectOpen] = useState(false);
  const [resultModalType, setResultModalType] = useState<'gameover' | 'levelwin' | 'victory' | null>(null);

  // Key stats
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    highScore: parseInt(localStorage.getItem('neon_breakout_highscore') || '0', 10),
    lives: 3,
    levelIndex: 0,
    combo: 0,
    maxCombo: 0,
    bricksBroken: 0,
    ballsLaunched: 0,
  });

  // Re-render key for canvas reload
  const [canvasKey, setCanvasKey] = useState(0);

  // Sync highscore to localstorage
  const saveRecords = useCallback((finalScore: number, finalMaxCombo: number, newBricks: number) => {
    try {
      const storedHigh = parseInt(localStorage.getItem('neon_breakout_highscore') || '0', 10);
      if (finalScore > storedHigh) {
        localStorage.setItem('neon_breakout_highscore', String(finalScore));
      }

      const storedCombo = parseInt(localStorage.getItem('neon_breakout_max_combo') || '0', 10);
      if (finalMaxCombo > storedCombo) {
        localStorage.setItem('neon_breakout_max_combo', String(finalMaxCombo));
      }

      const storedBricks = parseInt(localStorage.getItem('neon_breakout_total_bricks') || '0', 10);
      localStorage.setItem('neon_breakout_total_bricks', String(storedBricks + newBricks));
    } catch {
      // ignore
    }
  }, []);

  const handleStatsUpdate = useCallback((newStats: GameStats) => {
    setStats((prev) => ({
      ...newStats,
      levelIndex: currentLevelIndex,
      highScore: Math.max(prev.highScore, newStats.score),
    }));
  }, [currentLevelIndex]);

  // Restart current level
  const handleRestartLevel = () => {
    setIsPaused(false);
    setResultModalType(null);
    setCanvasKey((k) => k + 1);
  };

  // Restart all from level 1
  const handleRestartAll = () => {
    setIsPaused(false);
    setResultModalType(null);
    setCurrentLevelIndex(0);
    setStats((prev) => ({
      ...prev,
      score: 0,
      lives: 3,
      combo: 0,
      maxCombo: 0,
      bricksBroken: 0,
    }));
    setCanvasKey((k) => k + 1);
  };

  // Next level
  const handleNextLevel = () => {
    setResultModalType(null);
    setIsPaused(false);
    if (currentLevelIndex < levels.length - 1) {
      setCurrentLevelIndex((i) => i + 1);
      setCanvasKey((k) => k + 1);
    } else {
      setResultModalType('victory');
      saveRecords(stats.score, stats.maxCombo, stats.bricksBroken);
    }
  };

  // Level Clear callback
  const handleLevelComplete = () => {
    if (currentLevelIndex < levels.length - 1) {
      setResultModalType('levelwin');
    } else {
      setResultModalType('victory');
    }
    saveRecords(stats.score, stats.maxCombo, stats.bricksBroken);
  };

  // Game Over callback
  const handleGameOver = (finalScore: number) => {
    setResultModalType('gameover');
    saveRecords(finalScore, stats.maxCombo, stats.bricksBroken);
  };

  // Select level from dropdown or stage select map
  const handleSelectLevel = (idx: number) => {
    setCurrentLevelIndex(idx);
    setIsPaused(false);
    setResultModalType(null);
    setCanvasKey((k) => k + 1);
  };

  // Play custom level created in LevelEditor
  const handlePlayCustomLevel = (customLevel: LevelConfig) => {
    setLevels((prev) => [customLevel, ...prev]);
    setCurrentLevelIndex(0);
    setIsPaused(false);
    setResultModalType(null);
    setCanvasKey((k) => k + 1);
  };

  const currentLevel = levels[currentLevelIndex] || levels[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-black">
      {/* Main Container */}
      <main className="w-full max-w-5xl mx-auto px-3 sm:px-4 py-4 flex flex-col gap-3">
        {/* Top Game HUD Header */}
        <GameHUD
          stats={stats}
          currentLevel={currentLevel}
          levels={levels}
          currentLevelIndex={currentLevelIndex}
          onSelectLevel={handleSelectLevel}
          isPaused={isPaused}
          onTogglePause={() => setIsPaused((p) => !p)}
          onRestartLevel={handleRestartLevel}
          onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
          onOpenEditor={() => setIsEditorOpen(true)}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          onOpenStageSelect={() => setIsStageSelectOpen(true)}
          isMuted={isMuted}
          onToggleMute={() => setIsMuted(sound.getMuted())}
        />

        {/* Game Canvas Area */}
        <GameCanvas
          key={canvasKey}
          currentLevel={currentLevel}
          onStatsUpdate={handleStatsUpdate}
          onLevelComplete={handleLevelComplete}
          onGameOver={handleGameOver}
          onGameWin={() => setResultModalType('victory')}
          isPaused={isPaused}
          onTogglePause={() => setIsPaused((p) => !p)}
          onRestartLevel={handleRestartLevel}
        />

        {/* Level Info & Feature Highlights Footer */}
        <div className="w-full max-w-4xl mx-auto flex flex-wrap items-center justify-between text-xs text-slate-400 px-2 py-1 gap-2">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-bold">{currentLevel.name}</span>
            <span>·</span>
            <span>{currentLevel.description}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsStageSelectOpen(true)}
              className="hover:text-cyan-300 transition-colors underline decoration-slate-700 underline-offset-2"
            >
              關卡星圖
            </button>
            <span>·</span>
            <button
              onClick={() => setIsHowToPlayOpen(true)}
              className="hover:text-cyan-300 transition-colors underline decoration-slate-700 underline-offset-2"
            >
              機關圖鑑
            </button>
            <span>·</span>
            <button
              onClick={() => setIsEditorOpen(true)}
              className="hover:text-indigo-300 transition-colors underline decoration-slate-700 underline-offset-2"
            >
              關卡工坊
            </button>
            <span>·</span>
            <button
              onClick={() => setIsLeaderboardOpen(true)}
              className="hover:text-yellow-300 transition-colors underline decoration-slate-700 underline-offset-2"
            >
              名人堂
            </button>
          </div>
        </div>
      </main>

      {/* Modals */}
      <StageSelectModal
        isOpen={isStageSelectOpen}
        onClose={() => setIsStageSelectOpen(false)}
        levels={levels}
        currentLevelIndex={currentLevelIndex}
        onSelectLevel={handleSelectLevel}
      />

      <HowToPlayModal
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
      />

      <LevelEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onPlayCustomLevel={handlePlayCustomLevel}
      />

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        stats={stats}
      />

      <GameResultModal
        type={resultModalType}
        stats={stats}
        currentLevel={currentLevel}
        hasNextLevel={currentLevelIndex < levels.length - 1}
        onNextLevel={handleNextLevel}
        onRestartCurrent={handleRestartLevel}
        onRestartAll={handleRestartAll}
        onClose={() => setResultModalType(null)}
      />

      {/* Footer credits */}
      <footer className="w-full text-center py-2 text-[11px] text-slate-600 border-t border-slate-900">
        霓虹打磚塊 2.0 (Neon Breakout) · 具備 10 大主題戰區、機甲魔王戰、動態機關、彈珠彈簧與 Web Audio 合成器
      </footer>
    </div>
  );
}
