import React, { useState } from 'react';
import { 
  X, 
  Play, 
  Trash2, 
  Sparkles, 
  Download, 
  Upload, 
  Wand2,
  Check
} from 'lucide-react';
import { BrickType, LevelConfig } from '../types/game';
import { BRICK_COLORS } from '../game/levels';

interface LevelEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayCustomLevel: (level: LevelConfig) => void;
}

const COLS = 10;
const ROWS = 9;

export const LevelEditor: React.FC<LevelEditorProps> = ({
  isOpen,
  onClose,
  onPlayCustomLevel,
}) => {
  const [levelName, setLevelName] = useState('我的自訂關卡 01');
  const [selectedBrush, setSelectedBrush] = useState<BrickType | 'empty'>('normal');
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [grid, setGrid] = useState<(BrickType | null)[][]>(() => {
    const initial: (BrickType | null)[][] = Array.from({ length: ROWS }, () =>
      Array.from({ length: COLS }, () => null)
    );
    for (let c = 1; c < 9; c++) {
      initial[1][c] = 'normal';
      initial[2][c] = 'tough';
    }
    initial[3][3] = 'tnt';
    initial[3][6] = 'tnt';
    initial[3][4] = 'bumper';
    initial[3][5] = 'bumper';
    initial[4][1] = 'moving';
    initial[4][8] = 'moving';
    return initial;
  });

  const [copiedNotification, setCopiedNotification] = useState(false);

  if (!isOpen) return null;

  const handleCellClick = (r: number, c: number) => {
    setGrid((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = selectedBrush === 'empty' ? null : selectedBrush;
      return next;
    });
  };

  const handleCellMouseEnter = (r: number, c: number) => {
    if (!isMouseDown) return;
    handleCellClick(r, c);
  };

  const handleClear = () => {
    setGrid(Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => null)));
  };

  const handleRandomize = () => {
    const types: (BrickType | null)[] = [
      'normal', 'tough', 'hardened', 'tnt', 'powerup', 'bumper', 'glitch', 'regen', 'moving', null, null
    ];
    setGrid(
      Array.from({ length: ROWS }, (_, r) =>
        Array.from({ length: COLS }, () => {
          if (r > 6) return null;
          return types[Math.floor(Math.random() * types.length)];
        })
      )
    );
  };

  const loadHeartTemplate = () => {
    const g: (BrickType | null)[][] = Array.from({ length: ROWS }, () =>
      Array.from({ length: COLS }, () => null)
    );
    const coords = [
      [1, 2], [1, 3], [1, 6], [1, 7],
      [2, 1], [2, 4], [2, 5], [2, 8],
      [3, 1], [3, 2], [3, 7], [3, 8],
      [4, 2], [4, 7],
      [5, 3], [5, 6],
      [6, 4], [6, 5]
    ];
    coords.forEach(([r, c]) => {
      g[r][c] = 'hardened';
    });
    g[2][2] = 'tnt';
    g[2][7] = 'tnt';
    g[3][3] = 'bumper';
    g[3][4] = 'powerup';
    g[3][5] = 'powerup';
    g[3][6] = 'bumper';
    g[4][3] = 'tough';
    g[4][4] = 'regen';
    g[4][5] = 'regen';
    g[4][6] = 'tough';
    setGrid(g);
  };

  const loadPinballTemplate = () => {
    const g: (BrickType | null)[][] = Array.from({ length: ROWS }, () =>
      Array.from({ length: COLS }, () => null)
    );
    for (let c = 0; c < 10; c++) {
      g[0][c] = 'unbreakable';
    }
    g[2][2] = 'bumper';
    g[2][7] = 'bumper';
    g[3][4] = 'powerup';
    g[3][5] = 'powerup';
    g[4][2] = 'tnt';
    g[4][7] = 'tnt';
    g[5][4] = 'bumper';
    g[5][5] = 'bumper';
    g[1][1] = 'glitch';
    g[1][8] = 'glitch';
    g[3][0] = 'moving';
    g[3][9] = 'moving';
    setGrid(g);
  };

  const handleTestPlay = () => {
    const hasBricks = grid.some((row) =>
      row.some((cell) => cell !== null && cell !== 'unbreakable')
    );
    if (!hasBricks) {
      alert('請先在畫布上放置至少 1 個可破壞磚塊！');
      return;
    }

    const customLevel: LevelConfig = {
      id: `custom-${Date.now()}`,
      name: `⭐ ${levelName || '自訂關卡'}`,
      description: '由玩家於關卡編輯器中親自設計打造',
      cols: COLS,
      rows: ROWS,
      grid,
    };

    onPlayCustomLevel(customLevel);
    onClose();
  };

  const handleExportJSON = () => {
    const payload = JSON.stringify({ name: levelName, grid }, null, 2);
    navigator.clipboard.writeText(payload);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  const handleImportJSON = () => {
    const input = prompt('請貼上關卡 JSON 代碼：');
    if (!input) return;
    try {
      const parsed = JSON.parse(input);
      if (parsed.grid && Array.isArray(parsed.grid)) {
        setGrid(parsed.grid);
        if (parsed.name) setLevelName(parsed.name);
      }
    } catch {
      alert('JSON 代碼格式錯誤，請重試！');
    }
  };

  const BRUSH_OPTIONS: { type: BrickType | 'empty'; label: string; color: string; border: string }[] = [
    { type: 'normal', label: '普通磚 (1HP)', color: BRICK_COLORS.normal.fill, border: BRICK_COLORS.normal.stroke },
    { type: 'tough', label: '強韌磚 (2HP)', color: BRICK_COLORS.tough.fill, border: BRICK_COLORS.tough.stroke },
    { type: 'hardened', label: '重裝磚 (3HP)', color: BRICK_COLORS.hardened.fill, border: BRICK_COLORS.hardened.stroke },
    { type: 'tnt', label: '爆破 TNT', color: BRICK_COLORS.tnt.fill, border: BRICK_COLORS.tnt.stroke },
    { type: 'powerup', label: '寶箱道具磚', color: BRICK_COLORS.powerup.fill, border: BRICK_COLORS.powerup.stroke },
    { type: 'bumper', label: '彈珠彈簧 🌀', color: BRICK_COLORS.bumper.fill, border: BRICK_COLORS.bumper.stroke },
    { type: 'glitch', label: '量子虛位 ⚡', color: BRICK_COLORS.glitch.fill, border: BRICK_COLORS.glitch.stroke },
    { type: 'regen', label: '奈米修復 🧪', color: BRICK_COLORS.regen.fill, border: BRICK_COLORS.regen.stroke },
    { type: 'moving', label: '巡邏磚 ⬌', color: BRICK_COLORS.moving.fill, border: BRICK_COLORS.moving.stroke },
    { type: 'unbreakable', label: '鋼鐵護甲', color: BRICK_COLORS.unbreakable.fill, border: BRICK_COLORS.unbreakable.stroke },
    { type: 'empty', label: '橡皮擦 (清空)', color: '#1e293b', border: '#475569' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
      onMouseUp={() => setIsMouseDown(false)}
    >
      <div className="relative w-full max-w-3xl bg-slate-900 border border-indigo-500/40 rounded-2xl p-5 sm:p-6 shadow-[0_0_50px_rgba(99,102,241,0.2)] text-slate-100 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-indigo-400" />
            <div>
              <h3 className="text-xl font-bold font-['Chakra_Petch'] tracking-wide text-white">
                關卡工坊 · 自由設計磚塊陣列
              </h3>
              <p className="text-xs text-slate-400">點擊或拖曳繪製磚塊、彈簧、量子虛位與巡邏動態磚</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Level Name & Template presets */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">關卡名稱:</span>
            <input
              type="text"
              value={levelName}
              onChange={(e) => setLevelName(e.target.value)}
              className="bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-lg px-3 py-1 text-xs text-cyan-300 font-medium focus:outline-none w-48"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 hidden sm:inline">預設藍圖:</span>
            <button
              onClick={loadHeartTemplate}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 transition-colors"
            >
              ❤️ 愛心核心
            </button>
            <button
              onClick={loadPinballTemplate}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-pink-300 border border-slate-700 transition-colors"
            >
              🌀 彈跳彈珠台
            </button>
            <button
              onClick={handleRandomize}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors"
            >
              <Wand2 className="w-3 h-3" />
              隨機陣列
            </button>
            <button
              onClick={handleClear}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-700 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              清空
            </button>
          </div>
        </div>

        {/* Brush Palette */}
        <div className="mt-4 p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">
            選擇放置磚塊畫筆：
          </div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {BRUSH_OPTIONS.map((brush) => {
              const isSelected = selectedBrush === brush.type;
              return (
                <button
                  key={brush.type}
                  onClick={() => setSelectedBrush(brush.type)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'ring-2 ring-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.4)] scale-105'
                      : 'opacity-75 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: `${brush.color}25`,
                    color: brush.type === 'empty' ? '#94a3b8' : brush.color,
                    border: `1.5px solid ${brush.border}`,
                  }}
                >
                  <span
                    className="w-3 h-3 rounded-sm inline-block"
                    style={{ backgroundColor: brush.color }}
                  />
                  <span>{brush.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Brick Grid */}
        <div
          className="mt-4 p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center justify-center select-none shadow-inner"
          onMouseDown={() => setIsMouseDown(true)}
        >
          <div
            className="grid gap-1.5 w-full max-w-xl"
            style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
          >
            {grid.map((row, r) =>
              row.map((cell, c) => {
                const style = cell ? BRICK_COLORS[cell] : null;
                return (
                  <div
                    key={`${r}-${c}`}
                    onMouseDown={() => handleCellClick(r, c)}
                    onMouseEnter={() => handleCellMouseEnter(r, c)}
                    className="aspect-[3/1.3] rounded border transition-colors flex items-center justify-center cursor-pointer text-[10px] font-bold"
                    style={{
                      backgroundColor: cell ? style?.fill : 'rgba(30, 41, 59, 0.3)',
                      borderColor: cell ? style?.stroke : 'rgba(51, 65, 85, 0.4)',
                      boxShadow: cell ? `0 0 6px ${style?.glow}` : 'none',
                      color: '#ffffff',
                    }}
                  >
                    {cell === 'tnt' && 'TNT'}
                    {cell === 'powerup' && '★'}
                    {cell === 'bumper' && '🌀'}
                    {cell === 'glitch' && '⚡'}
                    {cell === 'regen' && '🧪'}
                    {cell === 'moving' && '⬌'}
                    {cell === 'unbreakable' && '🛡️'}
                    {cell === 'tough' && '2'}
                    {cell === 'hardened' && '3'}
                  </div>
                );
              })
            )}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            提示：上方為球體撞擊區域，下方保留空間讓擋板活動
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors border border-slate-700"
            >
              {copiedNotification ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5" />}
              {copiedNotification ? '已複製代碼！' : '匯出代碼'}
            </button>
            <button
              onClick={handleImportJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors border border-slate-700"
            >
              <Upload className="w-3.5 h-3.5" />
              匯入代碼
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              關閉
            </button>
            <button
              onClick={handleTestPlay}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              立即啟動試玩！
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
